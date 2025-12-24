import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

/**
 * POST /api/notifications/device-token
 * Save or update device token for push notifications
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
    const userId = decoded.user_id;

    const { device_token, platform } = await request.json();

    if (!device_token) {
      return NextResponse.json(
        { success: false, message: 'Device token is required' },
        { status: 400 }
      );
    }

    // Update user with device token
    const { data, error } = await supabase
      .from('users')
      .update({
        device_token: device_token,
        device_platform: platform || 'web',
        device_token_updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating device token:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to save device token' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Device token saved successfully',
      data
    });

  } catch (error) {
    console.error('Device token API error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to save device token' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/device-token
 * Remove device token (logout or disable notifications)
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

    // Remove device token
    const { error } = await supabase
      .from('users')
      .update({
        device_token: null,
        device_platform: null,
        device_token_updated_at: null
      })
      .eq('id', userId);

    if (error) {
      console.error('Error removing device token:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to remove device token' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Device token removed successfully'
    });

  } catch (error) {
    console.error('Device token DELETE error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to remove device token' },
      { status: 500 }
    );
  }
}

