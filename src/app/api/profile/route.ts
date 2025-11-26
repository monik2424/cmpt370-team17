/**
 * Profile API Route
 * 
 * GET: Fetch current user's profile
 * PUT: Update current user's profile (name, email, image)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/modules/db';

export async function GET() {
  try {
    const session = await auth();
    const user = session?.user as any;

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        provider: {
          select: {
            id: true,
            businessName: true,
            address: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: dbUser });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user as any;

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, image, business } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Check if email is already taken by another user
    if (email !== user.email) {
      const existingUser = await db.user.findUnique({
        where: { email },
      });
      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json({ error: 'Email is already in use' }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
    };

    // Handle image update (base64 string)
    if (image !== undefined) {
      // If image is a base64 string, store it directly
      // In production, you'd want to upload to a cloud storage service
      updateData.image = image;
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    });

    // Update provider/business info if provided
    if (business) {
      await db.provider.updateMany({
        where: { userId: user.id },
        data: {
          businessName: business.businessName?.trim() || undefined,
          address: business.address?.trim() || null,
          phone: business.phone?.trim() || null,
          email: business.email?.trim() || null,
        },
      });
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

