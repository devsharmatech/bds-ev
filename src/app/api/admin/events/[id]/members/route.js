import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from 'uuid';

// GET all members for an event with filters and pagination
export async function GET(req, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("bds_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = await params;
    const eventId = id;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || ""; // all, checked-in, not-checked-in
    const sortBy = searchParams.get("sortBy") || "joined_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const offset = (page - 1) * limit;

    // Build base query for counting
    let countQuery = supabase
      .from("event_members")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId);

    // Build query for data
    let dataQuery = supabase
      .from("event_members")
      .select(
        `
        id,
        event_id,
        user_id,
        token,
        checked_in,
        checked_in_at,
        joined_at,
        is_member,
        price_paid,
        users (
          id,
          full_name,
          email,
          phone,
          mobile,
          profile_image,
          membership_code,
          membership_status,
          membership_type
        )
      `
      )
      .eq("event_id", eventId);

    // Apply filters to both queries
    if (search) {
      const searchFilter = `users.full_name.ilike.%${search}%,users.email.ilike.%${search}%,token.ilike.%${search}%`;
      countQuery = countQuery.or(searchFilter);
      dataQuery = dataQuery.or(searchFilter);
    }

    if (status === "checked-in") {
      countQuery = countQuery.eq("checked_in", true);
      dataQuery = dataQuery.eq("checked_in", true);
    } else if (status === "not-checked-in") {
      countQuery = countQuery.eq("checked_in", false);
      dataQuery = dataQuery.eq("checked_in", false);
    }

    // Get total count
    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error("Count error:", countError);
      throw countError;
    }

    // Apply sorting and pagination to data query
    if (sortBy.startsWith("users.")) {
      // For user fields, sort after fetching
      const { data: allMembers, error: dataError } = await dataQuery;

      if (dataError) throw dataError;

      // Sort in memory
      const sortedMembers = (allMembers || []).sort((a, b) => {
        const field = sortBy.replace("users.", "");
        const aValue = a.users?.[field] || "";
        const bValue = b.users?.[field] || "";

        if (sortOrder === "asc") {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });

      // Apply pagination
      const members = sortedMembers.slice(offset, offset + limit);
      const totalPages = Math.ceil((count || 0) / limit);

      return NextResponse.json({
        success: true,
        members,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    } else {
      // For event_members fields, sort in query
      dataQuery = dataQuery.order(sortBy, { ascending: sortOrder === "asc" });

      const { data: members, error: dataError } = await dataQuery.range(
        offset,
        offset + limit - 1
      );

      if (dataError) throw dataError;

      const totalPages = Math.ceil((count || 0) / limit);

      return NextResponse.json({
        success: true,
        members: members || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    }
  } catch (error) {
    console.error("EVENT MEMBERS GET ERROR:", error);

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to fetch event members" },
      { status: 500 }
    );
  }
}

// POST - Add member to event
export async function POST(req, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("bds_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = await params;
    const eventId = id;
    const data = await req.json();

    // Validate required fields
    if (!data.user_id) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if event exists
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, capacity, is_paid, regular_price, member_price, status")
      .eq("id", eventId)
      .single();

    if (eventError) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    // Check event status
    if (event.status === "completed" || event.status === "cancelled") {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot add members to completed or cancelled events",
        },
        { status: 400 }
      );
    }

    // Check capacity
    if (event.capacity) {
      const { count: currentMembers } = await supabase
        .from("event_members")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId);

      if (currentMembers >= event.capacity) {
        return NextResponse.json(
          { success: false, message: "Event has reached maximum capacity" },
          { status: 400 }
        );
      }
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, membership_type, membership_status")
      .eq("id", data.user_id)
      .single();

    if (userError) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is already a member of this event
    const { data: existingMember } = await supabase
      .from("event_members")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", data.user_id)
      .single();

    if (existingMember) {
      return NextResponse.json(
        {
          success: false,
          message: "User is already registered for this event",
        },
        { status: 409 }
      );
    }

    // Generate unique token
    const generateToken = () => {
      return `EVT-${uuidv4().split("-")[0].toUpperCase()}`;
    };

    let tokenValue = `EVT-${uuidv4().split("-")[0].toUpperCase()}`;

    if (!tokenValue) {
      // Ensure token is unique
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        tokenValue = generateToken();
        const { data: existingToken } = await supabase
          .from("event_members")
          .select("id")
          .eq("token", tokenValue)
          .single();

        if (!existingToken) isUnique = true;
        attempts++;
      }

      if (!isUnique) {
        return NextResponse.json(
          { success: false, message: "Failed to generate unique token" },
          { status: 500 }
        );
      }
    }

    // Calculate price if event is paid
    let price_paid = data.price_paid;
    if (event.is_paid && price_paid === undefined) {
      if (data.is_member && event.member_price) {
        price_paid = event.member_price;
      } else if (event.regular_price) {
        price_paid = event.regular_price;
      }
    }

    // Determine membership status
    const is_member =
      data.is_member !== undefined
        ? data.is_member
        : user.membership_type === "paid";

    // Add member to event
    const { data: newMember, error: insertError } = await supabase
      .from("event_members")
      .insert({
        event_id: eventId,
        user_id: data.user_id,
        token: tokenValue,
        price_paid: price_paid,
        is_member: is_member,
        joined_at: new Date().toISOString(),
      })
      .select(
        `
        id,
        event_id,
        user_id,
        token,
        checked_in,
        checked_in_at,
        joined_at,
        is_member,
        price_paid,
        users (
          id,
          full_name,
          email,
          phone,
          mobile,
          profile_image,
          membership_code,
          membership_status,
          membership_type
        )
      `
      )
      .single();

    if (insertError) {
      console.error("Error adding event member:", insertError);
      return NextResponse.json(
        { success: false, message: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      member: newMember,
      message: "Member added to event successfully",
    });
  } catch (error) {
    console.error("EVENT MEMBER POST ERROR:", error);

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to add member to event" },
      { status: 500 }
    );
  }
}
