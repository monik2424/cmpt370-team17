import { NextRequest, NextResponse } from 'next/server';
import db from '@/modules/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, token, password } = await req.json();

    // Validation
    if (!email || !token || !password) {
      return NextResponse.json(
        { error: 'Email, OTP, and password are required' },
        { status: 400 }
      );
    }

    // Validate OTP format (6 digits)
    if (token.length !== 6 || !/^\d+$/.test(token)) {
      return NextResponse.json(
        { error: 'Invalid OTP format. OTP must be 6 digits.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Find the reset token matching both OTP and email
    const resetToken = await db.passwordResetToken.findFirst({
      where: { 
        token,
        email 
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid OTP or email. Please check and try again.' },
        { status: 404 }
      );
    }

    // Check if token has expired
    if (resetToken.expires < new Date()) {
      // Delete expired token
      await db.passwordResetToken.delete({
        where: { id: resetToken.id },
      });

      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 410 }
      );
    }

    // Find the user by email
    const user = await db.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash the new password
    // bcrypt.hash() takes the plain password and a "salt rounds" value (10)
    // Higher salt rounds = more secure but slower (10 is a good balance)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password in the database
    await db.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    // Delete the used token (one-time use only!)
    // This prevents someone from reusing the same OTP
    await db.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    console.log(`✅ Password successfully reset for user: ${user.email} using OTP`);

    return NextResponse.json(
      { message: 'Password has been successfully reset' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'An error occurred while resetting the password' },
      { status: 500 }
    );
  }
}



