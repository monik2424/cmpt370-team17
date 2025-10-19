import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import db from '@/modules/db';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.enum(['GUEST', 'HOST', 'PROVIDER'])
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role } = registerSchema.parse(body);

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role
      }
    });

    // Create role-specific record
    if (role === 'HOST') {
      await db.host.create({
        data: { userId: user.id }
      });
    } else if (role === 'PROVIDER') {
      await db.provider.create({
        data: { 
          userId: user.id, 
          businessName: `${name}'s Business` 
        }
      });
    } else {
      await db.guest.create({
        data: { userId: user.id }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'User registered successfully. Please sign in.'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
