import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Initialize Firebase Admin
let firebaseAdmin;
let messaging;

try {
  const admin = require('firebase-admin');
  
  if (!admin.apps.length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : null;

    if (serviceAccount) {
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      messaging = admin.messaging();
    } else {
      console.warn('Firebase Admin not configured. Service account missing.');
    }
  } else {
    firebaseAdmin = admin.app();
    messaging = admin.messaging();
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

/**
 * POST /api/admin/notifications/send
 * Send push notifications to members
 */
export async function POST(request) {
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
    
    // Verify admin role
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', decoded.user_id)
      .single();

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (!firebaseAdmin || !messaging) {
      return NextResponse.json(
        { success: false, message: 'Firebase Admin not configured. Please set FIREBASE_SERVICE_ACCOUNT environment variable.' },
        { status: 500 }
      );
    }

    let { title, body, target, membership_type, plan, event_id, data } = await request.json();
    
    // Ensure data object exists
    if (!data) {
      data = {};
    }

    if (!title || !body) {
      return NextResponse.json(
        { success: false, message: 'Title and body are required' },
        { status: 400 }
      );
    }

    // Build query based on target
    let query = supabase
      .from('users')
      .select('id, device_token, full_name, email, membership_type')
      .eq('role', 'member')
      .not('device_token', 'is', null);

    // Filter by target
    if (target === 'free') {
      query = query.eq('membership_type', 'free');
    } else if (target === 'paid') {
      query = query.eq('membership_type', 'paid');
    } else if (target === 'membership_type' && membership_type) {
      query = query.eq('membership_type', membership_type);
    } else if (target === 'plan' && plan) {
      const normalizedPlan = String(plan).trim().toLowerCase();
      const planPatterns = {
        active: ['%active%'],
        associate: ['%associate%'],
        student: ['%student%'],
        honorary: ['%honorary%'],
        free: ['%free%'],
      };

      const patterns = planPatterns[normalizedPlan] || [`%${normalizedPlan}%`];

      if (normalizedPlan === 'free') {
        query = query.or(
          `membership_type.eq.free,current_subscription_plan_name.ilike.${patterns[0]}`
        );
      } else {
        const orFilters = patterns
          .map((p) => `current_subscription_plan_name.ilike.${p}`)
          .join(',');
        query = query.eq('membership_type', 'paid').or(orFilters);
      }
    } else if (target === 'event' && event_id) {
      // Get event details first to ensure it exists and get slug
      const { data: eventData } = await supabase
        .from('events')
        .select('id, slug, title')
        .eq('id', event_id)
        .single();

      if (!eventData) {
        return NextResponse.json({
          success: false,
          message: 'Event not found',
          sent: 0,
          failed: 0
        }, { status: 404 });
      }

      // Get users registered for the event
      const { data: eventMembers } = await supabase
        .from('event_members')
        .select('user_id')
        .eq('event_id', event_id);

      if (eventMembers && eventMembers.length > 0) {
        const userIds = eventMembers.map(em => em.user_id);
        query = query.in('id', userIds);
      } else {
        return NextResponse.json({
          success: true,
          message: 'No members registered for this event',
          sent: 0,
          failed: 0
        });
      }

      // Update click_action to use slug if available, otherwise use ID
      if (data && !data.click_action) {
        data.click_action = `/events/${eventData.slug || eventData.id}`;
      }
    }
    // 'all' - no additional filter

    const { data: users, error } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users found with device tokens',
        sent: 0,
        failed: 0
      });
    }

    // Send notifications
    const tokens = users.map(u => u.device_token).filter(Boolean);
    
    let sent = 0;
    let failed = 0;
    const errors = [];

    // Send in batches (FCM allows up to 500 tokens per batch)
    const batchSize = 500;
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize);
      
      try {
        const message = {
          notification: {
            title: title,
            body: body,
          },
          data: {
            ...data,
            click_action: data?.click_action || 'FLUTTER_NOTIFICATION_CLICK',
          },
          tokens: batch,
        };

        const response = await messaging.sendEachForMulticast(message);
        
        sent += response.successCount;
        failed += response.failureCount;

        // Log failures
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            errors.push({
              token: batch[idx],
              error: resp.error?.message || 'Unknown error'
            });
          }
        });
      } catch (error) {
        console.error('Error sending batch:', error);
        failed += batch.length;
        errors.push({
          batch: i,
          error: error.message
        });
      }
    }

    // Save notifications to notifications table for each user
    try {
      const notificationsToInsert = users.map(user => ({
        user_id: user.id,
        title: title,
        message: body,
        type: target === 'event' ? 'event' : 'general',
        is_read: false,
        action_url: data?.click_action || null,
        created_at: new Date().toISOString()
      }));

      if (notificationsToInsert.length > 0) {
        await supabase.from('notifications').insert(notificationsToInsert);
      }
    } catch (notifError) {
      console.error('Error saving notifications to database:', notifError);
      // Don't fail the request if saving fails
    }

    // Log notification in database (optional)
    try {
      await supabase.from('notification_logs').insert({
        title,
        body,
        target,
        membership_type: membership_type || null,
        plan: plan || null,
        event_id: event_id || null,
        sent_count: sent,
        failed_count: failed,
        total_count: users.length,
        sent_by: decoded.user_id,
        created_at: new Date().toISOString()
      });
    } catch (logError) {
      console.error('Error logging notification:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      message: `Notifications sent: ${sent} successful, ${failed} failed`,
      sent,
      failed,
      total: users.length,
      errors: errors.slice(0, 10) // Return first 10 errors
    });

  } catch (error) {
    console.error('Send notification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}

