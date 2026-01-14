import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

/**
 * POST /api/admin/speaker-requests/approve
 * Approve speaker requests and send approval email
 */
export async function POST(request) {
  try {
    console.log('[APPROVE] Starting approve request...');
    
    const { ids } = await request.json();
    console.log('[APPROVE] IDs received:', ids);

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No requests specified' },
        { status: 400 }
      );
    }

    // Get requests with event details
    console.log('[APPROVE] Fetching speaker requests...');
    const { data: requests, error: fetchError } = await supabase
      .from('speaker_requests')
      .select(`
        *,
        events (id, title, start_datetime, venue_name)
      `)
      .in('id', ids);

    if (fetchError) {
      console.error('[APPROVE] Fetch error:', fetchError);
      throw fetchError;
    }
    console.log('[APPROVE] Fetched requests:', requests?.length);

    // Update status to approved
    console.log('[APPROVE] Updating status to approved...');
    const { error: updateError } = await supabase
      .from('speaker_requests')
      .update({
        status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .in('id', ids);

    if (updateError) {
      console.error('[APPROVE] Update error:', updateError);
      throw updateError;
    }
    console.log('[APPROVE] Status updated successfully');

    // Send approval emails
    for (const req of requests) {
      try {
        console.log('[APPROVE] Sending email to:', req.email);
        const eventTitle = req.events?.title || 'the event';
        const eventDate = req.events?.start_datetime 
          ? new Date(req.events.start_datetime).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })
          : 'TBD';

        await sendEmail({
          to: req.email,
          subject: `Speaker Application Approved - ${eventTitle}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                <tr>
                  <td style="background-color: #03215F; padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Bahrain Dental Society</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                      <div style="width: 80px; height: 80px; background-color: #10B981; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-size: 40px;">✓</span>
                      </div>
                    </div>
                    <h2 style="color: #03215F; margin: 0 0 20px; text-align: center;">Congratulations, ${req.full_name}!</h2>
                    <p style="color: #333; font-size: 16px; line-height: 1.6;">
                      We are pleased to inform you that your speaker application for <strong>${eventTitle}</strong> has been <span style="color: #10B981; font-weight: bold;">APPROVED</span>.
                    </p>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 5px 0; color: #555;"><strong>Event:</strong> ${eventTitle}</p>
                      <p style="margin: 5px 0; color: #555;"><strong>Date:</strong> ${eventDate}</p>
                      <p style="margin: 5px 0; color: #555;"><strong>Category:</strong> ${req.category || 'Speaker'}</p>
                    </div>
                    <p style="color: #333; font-size: 16px; line-height: 1.6;">
                      You can now print your speaker badge from our website. Click the button below:
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://bds.bahrain'}/speaker-badge" 
                         style="display: inline-block; background-color: #03215F; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        Print Your Badge
                      </a>
                    </div>
                    <p style="color: #666; font-size: 14px;">
                      If you have any questions, please don't hesitate to contact us.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
                    <p style="color: #888; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} Bahrain Dental Society. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `,
        });
        console.log(`[APPROVE] Email sent to ${req.email}`);
      } catch (emailError) {
        console.error(`[APPROVE] Failed to send email to ${req.email}:`, emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${ids.length} request(s) approved successfully`,
    });
  } catch (error) {
    console.error('[ADMIN-SPEAKER-APPROVE] Error:', error.message, error.code, error.details);
    return NextResponse.json(
      { success: false, message: 'Failed to approve requests', error: error.message },
      { status: 500 }
    );
  }
}
