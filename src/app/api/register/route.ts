import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import db from '@/modules/db';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  accountType: z.enum(['USER', 'PROVIDER']),
  businessName: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, accountType, businessName } = registerSchema.parse(body);

    // Validate provider requirements
    if (accountType === 'PROVIDER' && !businessName) {
      return NextResponse.json(
        { error: 'Business name is required for provider accounts' },
        { status: 400 }
      );
    }

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

    // Set role based on account type
    const role = accountType === 'PROVIDER' ? 'PROVIDER' : 'GUEST';

    // Create user with provider record if needed
    if (accountType === 'PROVIDER') {
      // Create user and provider in a transaction
      const user = await db.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role,
          provider: {
            create: {
              businessName: businessName!,
            }
          }
        }
      });
    } else {
      // Create regular user
      await db.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role
        }
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
