import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

/**
 * GET /api/admin/contact-messages
 * Get all contact messages for admin
 */
export async function GET(request) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('bds_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', decoded.user_id)
      .single();

    if (userError || !user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = (searchParams.get('search') || '').trim();
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('contact_messages')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,message.ilike.%${search}%,title.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching contact messages:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to fetch contact messages',
          error: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messages: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Contact messages fetch error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/contact-messages
 * Update contact message status
 */
export async function PATCH(request) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('bds_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', decoded.user_id)
      .single();

    if (userError || !user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, status, admin_notes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: 'Message ID and status are required' },
        { status: 400 }
      );
    }

    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };

    if (admin_notes) {
      updateData.admin_notes = admin_notes;
    }

    const { data, error } = await supabase
      .from('contact_messages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating contact message:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to update message',
          error: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Message updated successfully',
      data
    });

  } catch (error) {
    console.error('Update contact message error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/contact-messages
 * Delete one or more contact messages
 */
export async function DELETE(request) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('bds_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user is admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', decoded.user_id)
      .single();

    if (userError || !user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const ids = Array.isArray(body?.ids)
      ? body.ids.map((id) => String(id))
      : body?.id
      ? [String(body.id)]
      : [];
    const deleteAll = body?.all === true;
    const status = (body?.status || '').toString();
    const search = (body?.search || '').toString().trim();

    if (!deleteAll && !ids.length) {
      return NextResponse.json(
        { success: false, message: 'Message id(s) are required' },
        { status: 400 }
      );
    }

    let deleteQuery = supabase.from('contact_messages').delete();

    if (deleteAll) {
      if (status && status !== 'all') {
        deleteQuery = deleteQuery.eq('status', status);
      }
      if (search) {
        deleteQuery = deleteQuery.or(
          `name.ilike.%${search}%,email.ilike.%${search}%,message.ilike.%${search}%,title.ilike.%${search}%,phone.ilike.%${search}%`
        );
      }
    } else {
      deleteQuery = deleteQuery.in('id', ids);
    }

    const { error } = await deleteQuery;

    if (error) {
      console.error('Error deleting contact messages:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to delete messages', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Messages deleted successfully',
      deletedCount: deleteAll ? null : ids.length
    });
  } catch (error) {
    console.error('Delete contact messages error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'An error occurred', error: error.message },
      { status: 500 }
    );
  }
}

