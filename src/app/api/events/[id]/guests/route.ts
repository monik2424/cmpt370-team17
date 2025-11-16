/**
 * Guest Management API Route
 * 
 * Description:
 * - GET: Retrieves all guests for a specific event
 * - POST: Adds a new guest to an event
 * - Only event creators can manage guests
 * - Only works for private events
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/modules/db';
import { z } from 'zod';

const addGuestSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    const user = session?.user as any;

    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify event exists and user is the creator
    const event = await db.event.findUnique({
      where: { id },
      select: { 
        createdById: true, 
        private: true,
        name: true 
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.createdById !== user.id) {
      return NextResponse.json(
        { error: 'Only event creators can view guests' },
        { status: 403 }
      );
    }

    if (!event.private) {
      return NextResponse.json(
        { error: 'Guest management is only available for private events' },
        { status: 400 }
      );
    }

    // Get all guests for this event
    const guests = await db.guest.findMany({
      where: { eventId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ 
      guests,
      eventName: event.name 
    });
  } catch (error) {
    console.error('Get guests error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching guests' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    const user = session?.user as any;

    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify event exists and user is the creator
    const event = await db.event.findUnique({
      where: { id },
      select: { 
        createdById: true, 
        private: true 
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.createdById !== user.id) {
      return NextResponse.json(
        { error: 'Only event creators can add guests' },
        { status: 403 }
      );
    }

    if (!event.private) {
      return NextResponse.json(
        { error: 'Guest management is only available for private events' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const data = addGuestSchema.parse(body);

    // Create guest (unique constraint will prevent duplicates)
    const guest = await db.guest.create({
      data: {
        name: data.name,
        email: data.email,
        eventId: id,
      },
    });

    return NextResponse.json({
      message: 'Guest added successfully',
      guest,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Add guest error:', error);
    
    // Handle unique constraint violation (duplicate email for same event)
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'This email is already invited to this event' },
        { status: 400 }
      );
    }

    // Handle Zod validation errors
    if (error?.issues) {
      return NextResponse.json(
        { error: 'Validation error', issues: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred while adding guest' },
      { status: 500 }
    );
  }
}
