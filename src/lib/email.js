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
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
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
 * Generic email sending function
 */
export async function sendEmail(to, subject, text, html) {
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


