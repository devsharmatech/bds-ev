import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// GET users for search (admin only)
export async function GET(req) {
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
    
    // Check if user is admin
    const { data: currentUser, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", decoded.user_id)
      .single();

    if (userError || currentUser?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("users")
      .select(`
        id,
        email,
        full_name,
        phone,
        mobile,
        profile_image,
        membership_code,
        membership_status,
        membership_type,
        membership_expiry_date,
        created_at
      `, { count: 'exact' });

    // Apply search filter
    if (search && search.trim() !== "") {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,mobile.ilike.%${search}%,membership_code.ilike.%${search}%`);
    }

    // Apply pagination
    const { data: users, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      success: true,
      users: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });

  } catch (error) {
    console.error("USERS GET ERROR:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST - Create new user (for bulk import)
export async function POST(req) {
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
    
    // Check if user is admin
    const { data: currentUser } = await supabase
      .from("users")
      .select("role")
      .eq("id", decoded.user_id)
      .single();

    if (currentUser?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 403 }
      );
    }

    const data = await req.json();

    // Validate required fields
    if (!data.email || !data.full_name) {
      return NextResponse.json(
        { success: false, message: "Email and full name are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", data.email)
      .single();

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "User with this email already exists",
        user_id: existingUser.id
      }, { status: 409 });
    }

    // Generate temporary password (user should reset)
    const tempPassword = Math.random().toString(36).slice(-8);
    // In production, you would hash this password
    const password_hash = `temp_${tempPassword}`;

    // Create user
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        email: data.email,
        full_name: data.full_name,
        phone: data.phone,
        mobile: data.mobile,
        membership_code: data.membership_code,
        membership_type: data.membership_type || 'free',
        membership_status: data.membership_status || 'active',
        membership_expiry_date: data.membership_expiry_date,
        password_hash: password_hash,
        role: 'member',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(`
        id,
        email,
        full_name,
        phone,
        mobile,
        profile_image,
        membership_code,
        membership_status,
        membership_type,
        membership_expiry_date
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      user: newUser,
      message: "User created successfully. User should reset their password."
    });

  } catch (error) {
    console.error("USER CREATE ERROR:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create user" },
      { status: 500 }
    );
  }
}