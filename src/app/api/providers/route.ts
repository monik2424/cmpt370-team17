/**
 * Providers List API Route
 * Author: Monik
 * 
 * Description:
 * - GET: Returns list of all available providers
 * - Used for browsing providers on the providers page
 * - Returns provider business information
 * - Simple endpoint for testing
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/modules/db';

export async function GET(req: NextRequest) {
  try {
    const providers = await db.provider.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        bookings: {
          select: {
            id: true,
            bookingStatus: true,
          },
        },
      },
      orderBy: {
        businessName: 'asc',
      },
    });

    // Add booking stats to each provider
    const providersWithStats = providers.map(provider => ({
      id: provider.id,
      businessName: provider.businessName,
      address: provider.address,
      phone: provider.phone,
      email: provider.email,
      user: provider.user,
      bookingCount: provider.bookings.length,
      activeBookings: provider.bookings.filter(b => 
        b.bookingStatus === 'PENDING' || b.bookingStatus === 'CONFIRMED'
      ).length,
    }));

    return NextResponse.json({ providers: providersWithStats });
  } catch (error) {
    console.error('Get providers error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching providers' },
      { status: 500 }
    );
  }
}

