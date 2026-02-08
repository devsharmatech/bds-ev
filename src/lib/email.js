/**
 * Email utility for sending emails
 * Supports SMTP via nodemailer (optional)
 */

let nodemailer = null;
let transporter = null;

// Try to load nodemailer if available
try {
  nodemailer = require('nodemailer');
} catch (error) {
  console.warn('nodemailer not installed. Email functionality will be limited.');
}

// Initialize transporter if nodemailer is available and SMTP is configured
if (nodemailer && process.env.SMTP_HOST) {
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: process.env.SMTP_SECURE === 'true' || smtpPort === 465, // auto-detect secure for port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

/**
 * Send OTP email
 */
export async function sendOTPEmail(email, otp) {
  const subject = 'BDS Password Reset - OTP Code';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #03215F 0%, #AE9B66 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; border: 2px solid #03215F; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #03215F; letter-spacing: 8px; font-family: monospace; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Bahrain Dental Society</h1>
          <p>Password Reset Request</p>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>You have requested to reset your password for your BDS account. Please use the following OTP code to verify your identity:</p>
          
          <div class="otp-box">
            <p style="margin: 0 0 10px 0; color: #666;">Your OTP Code:</p>
            <div class="otp-code">${otp}</div>
          </div>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>This OTP is valid for <strong>10 minutes</strong> only</li>
              <li>Do not share this code with anyone</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
          </div>
          
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          
          <p>Best regards,<br>Bahrain Dental Society Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Bahrain Dental Society. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Bahrain Dental Society - Password Reset

You have requested to reset your password. Please use the following OTP code:

${otp}

This OTP is valid for 10 minutes only.

If you didn't request this, please ignore this email.

Best regards,
Bahrain Dental Society Team
  `;

  return await sendEmail(email, subject, text, html);
}

/**
 * Send payment confirmation email for subscription
 */
export async function sendPaymentConfirmationEmail(email, userData) {
  const { name, plan_name, amount, payment_date, expiry_date, invoice_id } = userData;
  
  const subject = 'BDS - Payment Confirmation';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #03215F 0%, #AE9B66 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-box { background: #d4edda; border: 2px solid #28a745; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .details-table td { padding: 12px; border-bottom: 1px solid #ddd; }
        .details-table td:first-child { font-weight: bold; color: #03215F; width: 40%; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Bahrain Dental Society</h1>
          <p>Payment Confirmation</p>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          
          <div class="success-box">
            <h2 style="color: #28a745; margin: 0;">✓ Payment Successful!</h2>
            <p style="margin: 10px 0 0 0;">Your membership payment has been confirmed</p>
          </div>
          
          <h3 style="color: #03215F;">Payment Details:</h3>
          <table class="details-table">
            <tr><td>Plan</td><td>${plan_name}</td></tr>
            <tr><td>Amount Paid</td><td>${amount} BHD</td></tr>
            <tr><td>Payment Date</td><td>${payment_date}</td></tr>
            <tr><td>Valid Until</td><td>${expiry_date}</td></tr>
            ${invoice_id ? `<tr><td>Invoice ID</td><td>${invoice_id}</td></tr>` : ''}
          </table>
          
          <p>Thank you for your membership! You now have full access to all member benefits.</p>
          
          <p>Best regards,<br>Bahrain Dental Society Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Bahrain Dental Society. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Dear ${name},

Payment Successful!

Your membership payment has been confirmed.

Payment Details:
- Plan: ${plan_name}
- Amount Paid: ${amount} BHD
- Payment Date: ${payment_date}
- Valid Until: ${expiry_date}
${invoice_id ? `- Invoice ID: ${invoice_id}` : ''}

Thank you for your membership!

Best regards,
Bahrain Dental Society Team
  `;

  return await sendEmail(email, subject, text, html);
}

/**
 * Send welcome email after membership registration
 */
export async function sendWelcomeEmail(email, userData) {
  const { name, membership_type, member_id } = userData;
  
  const subject = 'Welcome to Bahrain Dental Society!';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #03215F 0%, #AE9B66 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .welcome-box { background: #03215F; color: white; border-radius: 8px; padding: 25px; text-align: center; margin: 20px 0; }
        .benefits { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .benefits ul { margin: 10px 0; padding-left: 20px; }
        .benefits li { margin: 8px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .btn { display: inline-block; background: #AE9B66; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Bahrain Dental Society</h1>
          <p>Welcome New Member!</p>
        </div>
        <div class="content">
          <div class="welcome-box">
            <h2 style="margin: 0;">🎉 Welcome, ${name}!</h2>
            <p style="margin: 10px 0 0 0;">You are now a member of the Bahrain Dental Society</p>
          </div>
          
          <p>We are thrilled to have you join our community of dental professionals!</p>
          
          <div class="benefits">
            <h3 style="color: #03215F; margin-top: 0;">Your Membership Benefits:</h3>
            <ul>
              <li>Access to exclusive events and workshops</li>
              <li>Member-only pricing on conferences</li>
              <li>Professional networking opportunities</li>
              <li>Access to dental research resources</li>
              <li>Digital membership badge and certificate</li>
            </ul>
          </div>
          
          ${member_id ? `<p><strong>Your Member ID:</strong> ${member_id}</p>` : ''}
          
          <p>Log in to your dashboard to explore your member benefits and upcoming events.</p>
          
          <p>Best regards,<br>Bahrain Dental Society Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Bahrain Dental Society. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Welcome to Bahrain Dental Society!

Dear ${name},

We are thrilled to have you join our community of dental professionals!

Your Membership Benefits:
- Access to exclusive events and workshops
- Member-only pricing on conferences
- Professional networking opportunities
- Access to dental research resources
- Digital membership badge and certificate

${member_id ? `Your Member ID: ${member_id}` : ''}

Log in to your dashboard to explore your member benefits and upcoming events.

Best regards,
Bahrain Dental Society Team
  `;

  return await sendEmail(email, subject, text, html);
}

/**
 * Send event join confirmation email
 */
export async function sendEventJoinEmail(email, eventData) {
  const { name, event_name, event_date, event_location, event_code, price_paid } = eventData;
  
  const subject = `BDS - Event Registration Confirmed: ${event_name}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #03215F 0%, #AE9B66 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .event-box { background: white; border: 2px solid #03215F; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .event-title { color: #03215F; font-size: 20px; font-weight: bold; margin: 0 0 15px 0; }
        .event-details { margin: 15px 0; }
        .event-details p { margin: 8px 0; }
        .qr-section { background: #03215F; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-top: 20px; }
        .event-code { font-size: 24px; font-weight: bold; letter-spacing: 3px; font-family: monospace; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Bahrain Dental Society</h1>
          <p>Event Registration Confirmed</p>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p>Your registration for the following event has been confirmed:</p>
          
          <div class="event-box">
            <h3 class="event-title">${event_name}</h3>
            <div class="event-details">
              ${event_date ? `<p>📅 <strong>Date:</strong> ${event_date}</p>` : ''}
              ${event_location ? `<p>📍 <strong>Location:</strong> ${event_location}</p>` : ''}
              ${price_paid ? `<p>💰 <strong>Amount Paid:</strong> ${price_paid} BHD</p>` : '<p>💰 <strong>Entry:</strong> Free</p>'}
            </div>
            
            <div class="qr-section">
              <p style="margin: 0 0 10px 0;">Your Event Code:</p>
              <div class="event-code">${event_code}</div>
              <p style="margin: 10px 0 0 0; font-size: 12px;">Present this code at check-in</p>
            </div>
          </div>
          
          <p>Please arrive at least 15 minutes before the event starts. Show your event code or QR code at the entrance for check-in.</p>
          
          <p>Best regards,<br>Bahrain Dental Society Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Bahrain Dental Society. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Dear ${name},

Event Registration Confirmed!

Your registration for the following event has been confirmed:

Event: ${event_name}
${event_date ? `Date: ${event_date}` : ''}
${event_location ? `Location: ${event_location}` : ''}
${price_paid ? `Amount Paid: ${price_paid} BHD` : 'Entry: Free'}

Your Event Code: ${event_code}
Present this code at check-in.

Please arrive at least 15 minutes before the event starts.

Best regards,
Bahrain Dental Society Team
  `;

  return await sendEmail(email, subject, text, html);
}

/**
 * Send check-in confirmation email
 */
export async function sendCheckInEmail(email, checkInData) {
  const { name, event_name, check_in_time } = checkInData;
  
  const subject = `BDS - Check-in Confirmed: ${event_name}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #03215F 0%, #AE9B66 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .checkin-box { background: #d4edda; border: 2px solid #28a745; border-radius: 8px; padding: 25px; text-align: center; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Bahrain Dental Society</h1>
          <p>Check-in Confirmation</p>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          
          <div class="checkin-box">
            <h2 style="color: #28a745; margin: 0;">✓ Check-in Successful!</h2>
            <p style="margin: 15px 0 5px 0; font-size: 18px; font-weight: bold;">${event_name}</p>
            <p style="margin: 5px 0 0 0; color: #666;">Checked in at: ${check_in_time}</p>
          </div>
          
          <p>Thank you for attending this event. We hope you enjoy the session!</p>
          
          <p>Best regards,<br>Bahrain Dental Society Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Bahrain Dental Society. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Dear ${name},

Check-in Successful!

Event: ${event_name}
Checked in at: ${check_in_time}

Thank you for attending this event. We hope you enjoy the session!

Best regards,
Bahrain Dental Society Team
  `;

  return await sendEmail(email, subject, text, html);
}

/**
 * Send membership expiry reminder email
 */
export async function sendExpiryReminderEmail(email, userData) {
  const { name, plan_name, expiry_date, days_remaining } = userData;
  
  const urgency = days_remaining <= 7 ? 'urgent' : 'reminder';
  const subject = days_remaining <= 7 
    ? `⚠️ BDS - Your Membership Expires in ${days_remaining} Days!`
    : `BDS - Membership Renewal Reminder`;
    
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #03215F 0%, #AE9B66 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .warning-box { background: ${days_remaining <= 7 ? '#f8d7da' : '#fff3cd'}; border: 2px solid ${days_remaining <= 7 ? '#dc3545' : '#ffc107'}; border-radius: 8px; padding: 25px; text-align: center; margin: 20px 0; }
        .days-left { font-size: 48px; font-weight: bold; color: ${days_remaining <= 7 ? '#dc3545' : '#ffc107'}; }
        .benefits { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .benefits ul { margin: 10px 0; padding-left: 20px; }
        .btn { display: inline-block; background: #03215F; color: white; padding: 15px 35px; text-decoration: none; border-radius: 5px; margin-top: 15px; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Bahrain Dental Society</h1>
          <p>Membership Renewal Reminder</p>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          
          <div class="warning-box">
            <p style="margin: 0 0 10px 0; font-size: 16px;">Your membership expires in:</p>
            <div class="days-left">${days_remaining}</div>
            <p style="margin: 5px 0 0 0; font-size: 16px;">days</p>
            <p style="margin: 15px 0 0 0; color: #666;">Expiry Date: ${expiry_date}</p>
          </div>
          
          <p>Don't lose access to your member benefits!</p>
          
          <div class="benefits">
            <h3 style="color: #03215F; margin-top: 0;">Benefits you'll keep with renewal:</h3>
            <ul>
              <li>Access to exclusive events and workshops</li>
              <li>Member-only pricing on conferences</li>
              <li>Professional networking opportunities</li>
              <li>Digital membership badge and certificate</li>
            </ul>
          </div>
          
          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://bds.com'}/member/dashboard/subscriptions" class="btn">Renew Now</a>
          </p>
          
          <p>If you have any questions about renewal, please contact us.</p>
          
          <p>Best regards,<br>Bahrain Dental Society Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Bahrain Dental Society. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Dear ${name},

Your BDS Membership Expires in ${days_remaining} Days!

Plan: ${plan_name}
Expiry Date: ${expiry_date}

Don't lose access to your member benefits! Renew now to keep:
- Access to exclusive events and workshops
- Member-only pricing on conferences
- Professional networking opportunities
- Digital membership badge and certificate

Visit your dashboard to renew: ${process.env.NEXT_PUBLIC_BASE_URL || 'https://bds.com'}/member/dashboard/subscriptions

Best regards,
Bahrain Dental Society Team
  `;

  return await sendEmail(email, subject, text, html);
}

/**
 * Generic email sending function
 * Supports two call signatures:
 * 1. sendEmail(to, subject, text, html) - positional arguments
 * 2. sendEmail({ to, subject, text, html }) - object argument
 */
export async function sendEmail(toOrOptions, subject, text, html) {
  // Support object-based call: sendEmail({ to, subject, text, html })
  let to = toOrOptions;
  if (typeof toOrOptions === 'object' && toOrOptions !== null) {
    to = toOrOptions.to;
    subject = toOrOptions.subject;
    text = toOrOptions.text || '';
    html = toOrOptions.html;
  }

  // If transporter is configured, use it
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        text,
        html,
      });
      console.log('Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  // Fallback: Log email (for development)
  console.log('='.repeat(50));
  console.log('EMAIL (SMTP not configured - logging instead):');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('Text:', text);
  console.log('HTML:', html);
  console.log('='.repeat(50));
  
  // In development, you might want to return success anyway
  // In production, this should fail if email is not configured
  if (process.env.NODE_ENV === 'development') {
    return { success: true, messageId: 'dev-logged', warning: 'Email logged to console (SMTP not configured)' };
  }
  
  return { success: false, error: 'Email service not configured' };
}

/**
 * Send research submission confirmation email
 */
export async function sendResearchSubmissionEmail(email, data) {
  const { full_name, research_title, research_category } = data;
  const subject = 'Research Submission Received – BDS';
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #03215F 0%, #AE9B66 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Research Submission Received</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Bahrain Dental Society</p>
      </div>
      <div style="padding: 30px;">
        <p style="color: #333; font-size: 16px; line-height: 1.6;">Dear <strong>${full_name}</strong>,</p>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          Thank you for submitting your research to the Bahrain Dental Society. We have received your submission and it is now under review.
        </p>
        <div style="background: #f8f9fa; border-left: 4px solid #03215F; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0 0 8px; color: #333; font-size: 14px;"><strong>Research Title:</strong> ${research_title}</p>
          <p style="margin: 0 0 8px; color: #333; font-size: 14px;"><strong>Category:</strong> ${research_category}</p>
          <p style="margin: 0; color: #333; font-size: 14px;"><strong>Status:</strong> <span style="color: #f59e0b; font-weight: 600;">Pending Review</span></p>
        </div>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          Our team will review your submission carefully. You will receive an email notification once the review is complete with the decision.
        </p>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          If you have any questions, please don't hesitate to contact us.
        </p>
        <p style="color: #333; font-size: 14px; margin-top: 24px;">
          Best regards,<br/>
          <strong>Bahrain Dental Society</strong>
        </p>
      </div>
      <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Bahrain Dental Society. All rights reserved.</p>
      </div>
    </div>
  `;
  const text = `Dear ${full_name},\n\nThank you for submitting your research "${research_title}" (${research_category}) to the Bahrain Dental Society.\n\nYour submission is now under review. You will be notified via email once the review is complete.\n\nBest regards,\nBahrain Dental Society`;
  return sendEmail(email, subject, text, html);
}

/**
 * Send research approval email
 */
export async function sendResearchApprovalEmail(email, data) {
  const { full_name, research_title, research_category } = data;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://bds.com';
  const subject = 'Research Submission Approved – BDS';
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #03215F 0%, #AE9B66 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Research Approved!</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Bahrain Dental Society</p>
      </div>
      <div style="padding: 30px;">
        <p style="color: #333; font-size: 16px; line-height: 1.6;">Dear <strong>${full_name}</strong>,</p>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          We are pleased to inform you that your research submission has been <strong style="color: #16a34a;">approved</strong> by the Bahrain Dental Society review team.
        </p>
        <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0 0 8px; color: #333; font-size: 14px;"><strong>Research Title:</strong> ${research_title}</p>
          <p style="margin: 0 0 8px; color: #333; font-size: 14px;"><strong>Category:</strong> ${research_category || 'N/A'}</p>
          <p style="margin: 0; color: #333; font-size: 14px;"><strong>Status:</strong> <span style="color: #16a34a; font-weight: 600;">Approved ✓</span></p>
        </div>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          Your research may now be featured on our website. Thank you for your valuable contribution to the dental community.
        </p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${baseUrl}/research" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #03215F, #AE9B66); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">View Research Page</a>
        </div>
        <p style="color: #333; font-size: 14px; margin-top: 24px;">
          Best regards,<br/>
          <strong>Bahrain Dental Society</strong>
        </p>
      </div>
      <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Bahrain Dental Society. All rights reserved.</p>
      </div>
    </div>
  `;
  const text = `Dear ${full_name},\n\nWe are pleased to inform you that your research "${research_title}" has been approved by the Bahrain Dental Society.\n\nYour research may now be featured on our website.\n\nVisit: ${baseUrl}/research\n\nBest regards,\nBahrain Dental Society`;
  return sendEmail(email, subject, text, html);
}

/**
 * Send research rejection email
 */
export async function sendResearchRejectionEmail(email, data) {
  const { full_name, research_title, research_category, rejection_reason } = data;
  const subject = 'Research Submission Update – BDS';
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #03215F 0%, #AE9B66 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Research Submission Update</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Bahrain Dental Society</p>
      </div>
      <div style="padding: 30px;">
        <p style="color: #333; font-size: 16px; line-height: 1.6;">Dear <strong>${full_name}</strong>,</p>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          Thank you for your interest in contributing to the Bahrain Dental Society. After careful review, we regret to inform you that your research submission could not be approved at this time.
        </p>
        <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0 0 8px; color: #333; font-size: 14px;"><strong>Research Title:</strong> ${research_title}</p>
          <p style="margin: 0 0 8px; color: #333; font-size: 14px;"><strong>Category:</strong> ${research_category || 'N/A'}</p>
          <p style="margin: 0; color: #333; font-size: 14px;"><strong>Status:</strong> <span style="color: #ef4444; font-weight: 600;">Not Approved</span></p>
        </div>
        ${rejection_reason ? `
        <div style="background: #fffbeb; border: 1px solid #fcd34d; padding: 15px 20px; margin: 20px 0; border-radius: 8px;">
          <p style="margin: 0 0 5px; color: #92400e; font-size: 13px; font-weight: 600;">Reason / Feedback:</p>
          <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.5;">${rejection_reason}</p>
        </div>
        ` : ''}
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          We encourage you to review the feedback and consider resubmitting after making the necessary revisions. If you have any questions, please feel free to contact us.
        </p>
        <p style="color: #333; font-size: 14px; margin-top: 24px;">
          Best regards,<br/>
          <strong>Bahrain Dental Society</strong>
        </p>
      </div>
      <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Bahrain Dental Society. All rights reserved.</p>
      </div>
    </div>
  `;
  const text = `Dear ${full_name},\n\nThank you for your submission "${research_title}" to the Bahrain Dental Society.\n\nAfter review, we regret to inform you that your research could not be approved at this time.${rejection_reason ? `\n\nReason: ${rejection_reason}` : ''}\n\nWe encourage you to review the feedback and consider resubmitting.\n\nBest regards,\nBahrain Dental Society`;
  return sendEmail(email, subject, text, html);
}


