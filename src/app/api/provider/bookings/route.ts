/**
 * Provider Bookings Management API Route
 * Author: Monik
 * 
 * Description:
 * - GET: Retrieves all bookings for the current provider
 * - Supports filtering by booking status (PENDING, CONFIRMED, CANCELLED, COMPLETED)
 * - Returns booking details including event information and customer details
 * - Only accessible by authenticated users with PROVIDER role
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/modules/db';

interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
}

export async function GET(req: NextRequest) {
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
        { error: 'Forbidden. Only providers can access bookings.' },
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

    // Get optional status filter from query params
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    // Build where clause - construct directly in findMany to avoid type issues
    const bookings = await db.booking.findMany({
      where: {
        providerId: provider.id,
        ...(statusFilter && ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(statusFilter) 
          ? { bookingStatus: statusFilter as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' }
          : {}),
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            description: true,
            location: true,
            startAt: true,
            private: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Get provider bookings error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching bookings' },
      { status: 500 }
    );
  }
}

