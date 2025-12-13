/**
 * Provider Booking Management API Route
 * Author: Monik
 * 
 * Description:
 * - PUT: Updates booking status (accept/reject/complete bookings)
 * - Validates that the booking belongs to the current provider
 * - Only allows status transitions: PENDING -> CONFIRMED/CANCELLED, CONFIRMED -> COMPLETED
 * - Only accessible by authenticated users with PROVIDER role
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

const updateBookingSchema = z.object({
  bookingStatus: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
        { error: 'Forbidden. Only providers can update bookings.' },
        { status: 403 }
      );
    }

    // Get provider
    const provider = await db.provider.findUnique({
      where: { userId: user.id },
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    // Find the booking
    const booking = await db.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify booking belongs to this provider
    if (booking.providerId !== provider.id) {
      return NextResponse.json(
        { error: 'Forbidden. This booking does not belong to you.' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const data = updateBookingSchema.parse(body);

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
      CANCELLED: [], // Cannot change cancelled bookings
      COMPLETED: [], // Cannot change completed bookings
    };

    const allowedStatuses = validTransitions[booking.bookingStatus] || [];
    if (!allowedStatuses.includes(data.bookingStatus)) {
      return NextResponse.json(
        { 
          error: `Invalid status transition. Cannot change from ${booking.bookingStatus} to ${data.bookingStatus}.`,
          currentStatus: booking.bookingStatus,
          allowedTransitions: allowedStatuses,
        },
        { status: 400 }
      );
    }

    // Update booking status
    const updatedBooking = await db.booking.update({
      where: { id },
      data: {
        bookingStatus: data.bookingStatus,
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            description: true,
            location: true,
            startAt: true,
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: `Booking ${data.bookingStatus.toLowerCase()} successfully`,
      booking: updatedBooking,
    });
  } catch (error: unknown) {
    console.error('Update booking error:', error);
    
    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation error', issues: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred while updating booking' },
      { status: 500 }
    );
  }
}

