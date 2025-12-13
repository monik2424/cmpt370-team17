/**
 * Bookings API Route
 * Author: Monik
 * 
 * Description:
 * - POST: Creates a new booking (user books a provider for an event)
 * - GET: Returns bookings for the current user
 * - Simple booking flow: user selects provider and event
 * - Booking starts as PENDING status
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

const createBookingSchema = z.object({
  eventId: z.string().min(1),
  providerId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;

    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const data = createBookingSchema.parse(body);

    // Verify event exists and belongs to user (or user can book for any event)
    const event = await db.event.findUnique({
      where: { id: data.eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Verify provider exists
    const provider = await db.provider.findUnique({
      where: { id: data.providerId },
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Check if booking already exists
    const existingBooking = await db.booking.findFirst({
      where: {
        eventId: data.eventId,
        providerId: data.providerId,
        bookingStatus: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: 'A booking already exists for this event and provider' },
        { status: 400 }
      );
    }

    // Create booking
    const booking = await db.booking.create({
      data: {
        eventId: data.eventId,
        providerId: data.providerId,
        userId: user.id,
        bookingStatus: 'PENDING',
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            startAt: true,
          },
        },
        provider: {
          select: {
            id: true,
            businessName: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Booking created successfully',
      booking,
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Create booking error:', error);
    
    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation error', issues: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred while creating booking' },
      { status: 500 }
    );
  }
}

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

    // Get user's bookings
    const bookings = await db.booking.findMany({
      where: { userId: user.id },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            description: true,
            location: true,
            startAt: true,
          },
        },
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching bookings' },
      { status: 500 }
    );
  }
}

