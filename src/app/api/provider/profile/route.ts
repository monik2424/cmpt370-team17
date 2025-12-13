/**
 * Provider Profile Management API Route
 * Author: Monik
 * 
 * Description:
 * - GET: Retrieves the current provider's profile information
 * - PUT: Updates the provider's business profile (businessName, address, phone, email)
 * - Only accessible by authenticated users with PROVIDER role
 * - Validates that the provider record exists before updating
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/modules/db';
import { z } from 'zod';

interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
}

const updateProviderSchema = z.object({
  businessName: z.string().min(1).max(200).optional(),
  address: z.string().max(500).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().optional().nullable(),
});

export async function GET() {
  try {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;

    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role !== 'PROVIDER') {
      return NextResponse.json(
        { error: 'Forbidden. Only providers can access this endpoint.' },
        { status: 403 }
      );
    }

    // Fetch provider profile
    const provider = await db.provider.findUnique({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        bookings: {
          select: {
            id: true,
            bookingStatus: true,
            createdAt: true,
          },
        },
      },
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    // Calculate booking statistics
    const bookingStats = {
      total: provider.bookings.length,
      pending: provider.bookings.filter(b => b.bookingStatus === 'PENDING').length,
      confirmed: provider.bookings.filter(b => b.bookingStatus === 'CONFIRMED').length,
      cancelled: provider.bookings.filter(b => b.bookingStatus === 'CANCELLED').length,
      completed: provider.bookings.filter(b => b.bookingStatus === 'COMPLETED').length,
    };

    return NextResponse.json({
      provider: {
        id: provider.id,
        businessName: provider.businessName,
        address: provider.address,
        phone: provider.phone,
        email: provider.email,
        availabilitySchedule: provider.availabilitySchedule,
        createdAt: provider.createdAt,
        updatedAt: provider.updatedAt,
        user: provider.user,
        bookingStats,
      },
    });
  } catch (error) {
    console.error('Get provider profile error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching provider profile' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;

    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role !== 'PROVIDER') {
      return NextResponse.json(
        { error: 'Forbidden. Only providers can update their profile.' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const data = updateProviderSchema.parse(body);

    // Check if provider exists
    const existingProvider = await db.provider.findUnique({
      where: { userId: user.id },
    });

    if (!existingProvider) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    // Update provider profile
    const updatedProvider = await db.provider.update({
      where: { userId: user.id },
      data: {
        businessName: data.businessName ?? existingProvider.businessName,
        address: data.address !== undefined ? data.address : existingProvider.address,
        phone: data.phone !== undefined ? data.phone : existingProvider.phone,
        email: data.email !== undefined ? data.email : existingProvider.email,
      },
    });

    return NextResponse.json({
      message: 'Provider profile updated successfully',
      provider: updatedProvider,
    });
  } catch (error: unknown) {
    console.error('Update provider profile error:', error);
    
    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation error', issues: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred while updating provider profile' },
      { status: 500 }
    );
  }
}

