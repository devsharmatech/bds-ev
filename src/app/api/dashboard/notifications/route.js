import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

/**
 * GET /api/dashboard/notifications
 * Get all notifications for the logged-in user
 */
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('bds_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user_id;

    const url = new URL(request.url);
    const unreadOnly = url.searchParams.get('unread_only') === 'true';

    // Build query
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      unreadCount: unreadCount || 0
    });

  } catch (error) {
    console.error('Notifications API error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/dashboard/notifications
 * Mark notification(s) as read
 */
export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('bds_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user_id;

    const { notification_id, mark_all_read } = await request.json();

    if (mark_all_read) {
      // Mark all as read
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all as read:', error);
        return NextResponse.json(
          { success: false, message: 'Failed to mark all as read' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } else if (notification_id) {
      // Mark single notification as read
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notification_id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return NextResponse.json(
          { success: false, message: 'Failed to mark notification as read' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Notification marked as read'
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'notification_id or mark_all_read required' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Mark read API error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/dashboard/notifications
 * Delete notification(s)
 */
export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('bds_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user_id;

    const url = new URL(request.url);
    const notificationId = url.searchParams.get('id');
    const deleteAll = url.searchParams.get('delete_all') === 'true';

    if (deleteAll) {
      // Delete all notifications
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting all notifications:', error);
        return NextResponse.json(
          { success: false, message: 'Failed to delete all notifications' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'All notifications deleted'
      });
    } else if (notificationId) {
      // Delete single notification
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting notification:', error);
        return NextResponse.json(
          { success: false, message: 'Failed to delete notification' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Notification deleted'
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'notification id or delete_all parameter required' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Delete notification API error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
