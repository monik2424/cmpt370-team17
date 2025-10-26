import { NextRequest, NextResponse } from 'next/server';
import db from '@/modules/db';
import { randomBytes } from 'crypto';

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

    // Generate a secure random token
    // randomBytes(32) creates 32 bytes of random data
    // .toString('hex') converts it to a hexadecimal string (64 characters)
    const token = randomBytes(32).toString('hex');

    // Set expiration time to 1 hour from now
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    // Delete any existing password reset tokens for this email
    await db.passwordResetToken.deleteMany({
      where: { email },
    });

    // Create new password reset token in database
    await db.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    // Generate the reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password/${token}`;

    // 🖥️ CONSOLE LOGGING (for local development)
    // In production, this would be replaced with email sending
    console.log('\n' + '='.repeat(80));
    console.log('🔐 PASSWORD RESET REQUEST');
    console.log('='.repeat(80));
    console.log(`📧 Email: ${email}`);
    console.log(`👤 User: ${user.name}`);
    console.log(`🔗 Reset Link: ${resetUrl}`);
    console.log(`⏰ Expires: ${expires.toLocaleString()}`);
    console.log('='.repeat(80) + '\n');

    // Return success message (same message whether user exists or not)
    return NextResponse.json(
      {
        message: 'If an account with that email exists, a password reset link has been sent. Check your terminal/console for the link.',
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

