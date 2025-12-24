import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// BULK add members to event
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

    if (!data.members || !Array.isArray(data.members)) {
      return NextResponse.json(
        { success: false, message: "Members array is required" },
        { status: 400 }
      );
    }

    // Check event capacity
    const { data: event } = await supabase
      .from("events")
      .select("capacity")
      .eq("id", eventId)
      .single();

    if (event?.capacity) {
      const { count: currentMembers } = await supabase
        .from("event_members")
        .select("*", { count: 'exact', head: true })
        .eq("event_id", eventId);

      if (currentMembers + data.members.length > event.capacity) {
        return NextResponse.json(
          { success: false, message: "Adding these members would exceed event capacity" },
          { status: 400 }
        );
      }
    }

    // Generate tokens and prepare data
    const generateToken = () => {
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    const membersToInsert = data.members.map(member => ({
      event_id: eventId,
      user_id: member.user_id,
      token: member.token || generateToken(),
      price_paid: member.price_paid || null,
      is_member: member.is_member || false,
      joined_at: new Date().toISOString(),
    }));

    // Insert members
    const { data: insertedMembers, error } = await supabase
      .from("event_members")
      .insert(membersToInsert)
      .select(`
        *,
        users (
          id,
          full_name,
          email,
          phone,
          mobile,
          profile_image,
          membership_code,
          membership_status
        )
      `);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      members: insertedMembers,
      message: `Successfully added ${insertedMembers.length} members to the event`
    });

  } catch (error) {
    console.error("BULK MEMBERS ADD ERROR:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to add bulk members" },
      { status: 500 }
    );
  }
}