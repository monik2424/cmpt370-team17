import { NextRequest, NextResponse } from 'next/server';
import db from '@/modules/db';
import { Resend } from 'resend';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email },
    });

    // SECURITY: Always return success message even if email doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      return NextResponse.json(
        { message: 'If an account with that email exists, a password reset link has been sent.' },
        { status: 200 }
      );
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration time to 10 minutes from now (OTPs should expire quickly)
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 10);

    // Delete any existing password reset tokens for this email
    await db.passwordResetToken.deleteMany({
      where: { email },
    });

    // Create new password reset token in database (storing OTP as token)
    await db.passwordResetToken.create({
      data: {
        email,
        token: otp,
        expires,
      },
    });

    // Initialize Resend with API key
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send OTP via email
    try {
      await resend.emails.send({
        from: 'Saskatoon Events <onboarding@resend.dev>',
        to: email,
        subject: 'Password Reset OTP',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .otp-box { background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; }
                .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
                .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔐 Password Reset Request</h1>
                </div>
                <div class="content">
                  <p>Hello <strong>${user.name}</strong>,</p>
                  <p>We received a request to reset your password. Use the OTP code below to proceed:</p>
                  
                  <div class="otp-box">
                    <p style="margin: 0; font-size: 14px; color: #666;">Your OTP Code</p>
                    <div class="otp-code">${otp}</div>
                  </div>
                  
                  <div class="warning">
                    <strong>⚠️ Security Notice:</strong>
                    <ul style="margin: 10px 0;">
                      <li>This code expires in <strong>10 minutes</strong></li>
                      <li>Do not share this code with anyone</li>
                      <li>If you didn't request this, please ignore this email</li>
                    </ul>
                  </div>
                  
                  <p style="margin-top: 20px;">To reset your password, enter this code on the password reset page.</p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Saskatoon Event Planning</p>
                  <p>This is an automated email. Please do not reply.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      console.log(`✅ OTP sent successfully to ${email}`);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send OTP email. Please try again.' },
        { status: 500 }
      );
    }

    // Return success message (same message whether user exists or not)
    return NextResponse.json(
      {
        message: 'If an account with that email exists, a password reset OTP has been sent to your email.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

