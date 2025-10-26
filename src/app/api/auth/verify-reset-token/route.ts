import { NextRequest, NextResponse } from 'next/server';
import db from '@/modules/db';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Find the reset token in database
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    // Check if token exists
    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 404 }
      );
    }

    // Check if token has expired
    if (resetToken.expires < new Date()) {
      // Delete expired token
      await db.passwordResetToken.delete({
        where: { token },
      });

      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 410 } // 410 = Gone
      );
    }

    // Token is valid!
    return NextResponse.json(
      { message: 'Token is valid' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify reset token error:', error);
    return NextResponse.json(
      { error: 'An error occurred while verifying the token' },
      { status: 500 }
    );
  }
}

