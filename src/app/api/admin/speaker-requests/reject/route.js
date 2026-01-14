import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

/**
 * POST /api/admin/speaker-requests/reject
 * Reject speaker requests and send rejection email
 */
export async function POST(request) {
  try {
    const { ids, reason } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No requests specified' },
        { status: 400 }
      );
    }

    // Get requests with event details
    const { data: requests, error: fetchError } = await supabase
      .from('speaker_requests')
      .select(`
        *,
        events (id, title, start_date)
      `)
      .in('id', ids);

    if (fetchError) throw fetchError;

    // Update status to rejected
    const { error: updateError } = await supabase
      .from('speaker_requests')
      .update({
        status: 'rejected',
        rejection_reason: reason || null,
      })
      .in('id', ids);

    if (updateError) throw updateError;

    // Send rejection emails
    for (const req of requests) {
      try {
        const eventTitle = req.events?.title || 'the event';

        await sendEmail({
          to: req.email,
          subject: `Speaker Application Status - ${eventTitle}`,
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
                    <h2 style="color: #03215F; margin: 0 0 20px;">Dear ${req.full_name},</h2>
                    <p style="color: #333; font-size: 16px; line-height: 1.6;">
                      Thank you for your interest in presenting at <strong>${eventTitle}</strong>.
                    </p>
                    <p style="color: #333; font-size: 16px; line-height: 1.6;">
                      After careful review, we regret to inform you that your speaker application has not been approved at this time.
                    </p>
                    ${reason ? `
                    <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                      <p style="margin: 0; color: #991b1b;"><strong>Reason:</strong> ${reason}</p>
                    </div>
                    ` : ''}
                    <p style="color: #333; font-size: 16px; line-height: 1.6;">
                      We encourage you to apply for future events. Thank you for your understanding.
                    </p>
                    <p style="color: #666; font-size: 14px; margin-top: 30px;">
                      If you have any questions, please don't hesitate to contact us.
                    </p>
                    <p style="color: #333; font-size: 16px; margin-top: 20px;">
                      Best regards,<br>
                      <strong>Bahrain Dental Society</strong>
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
        console.log(`[REJECT] Email sent to ${req.email}`);
      } catch (emailError) {
        console.error(`[REJECT] Failed to send email to ${req.email}:`, emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${ids.length} request(s) rejected`,
    });
  } catch (error) {
    console.error('[ADMIN-SPEAKER-REJECT] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reject requests' },
      { status: 500 }
    );
  }
}
