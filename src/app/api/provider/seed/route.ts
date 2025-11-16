/**
 * Provider Seed API Route
 * Author: Monik
 * 
 * Description:
 * - Creates 10 fixed providers for Saskatoon event planning
 * - Only runs if providers don't already exist
 * - Creates both User and Provider records
 * - Uses simple password for testing: "provider123"
 * - Can be called via GET request to seed the database
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/modules/db';
import bcrypt from 'bcryptjs';

// 10 Fixed Saskatoon Providers
const saskatoonProviders = [
  {
    name: 'Saskatoon Catering Co.',
    email: 'catering@saskatoon.com',
    businessName: 'Saskatoon Catering Co.',
    address: '123 2nd Avenue N, Saskatoon, SK',
    phone: '(306) 555-0101',
    businessEmail: 'info@saskatooncatering.com',
  },
  {
    name: 'Prairie Venue Rentals',
    email: 'venue@prairie.com',
    businessName: 'Prairie Venue Rentals',
    address: '456 3rd Street E, Saskatoon, SK',
    phone: '(306) 555-0102',
    businessEmail: 'bookings@prairievenue.com',
  },
  {
    name: 'Saskatoon DJ Services',
    email: 'dj@saskatoon.com',
    businessName: 'Saskatoon DJ Services',
    address: '789 Broadway Avenue, Saskatoon, SK',
    phone: '(306) 555-0103',
    businessEmail: 'music@saskatoondj.com',
  },
  {
    name: 'River City Photography',
    email: 'photo@rivercity.com',
    businessName: 'River City Photography',
    address: '321 1st Avenue S, Saskatoon, SK',
    phone: '(306) 555-0104',
    businessEmail: 'info@rivercityphoto.com',
  },
  {
    name: 'Saskatoon Floral Design',
    email: 'flowers@saskatoon.com',
    businessName: 'Saskatoon Floral Design',
    address: '654 8th Street E, Saskatoon, SK',
    phone: '(306) 555-0105',
    businessEmail: 'orders@saskatoonfloral.com',
  },
  {
    name: 'Prairie Party Rentals',
    email: 'rentals@prairie.com',
    businessName: 'Prairie Party Rentals',
    address: '987 22nd Street W, Saskatoon, SK',
    phone: '(306) 555-0106',
    businessEmail: 'rentals@prairieparty.com',
  },
  {
    name: 'Saskatoon Event Planning',
    email: 'planning@saskatoon.com',
    businessName: 'Saskatoon Event Planning',
    address: '147 20th Street W, Saskatoon, SK',
    phone: '(306) 555-0107',
    businessEmail: 'events@saskatoonevents.com',
  },
  {
    name: 'Bridge City Bakery',
    email: 'bakery@bridgecity.com',
    businessName: 'Bridge City Bakery',
    address: '258 3rd Avenue S, Saskatoon, SK',
    phone: '(306) 555-0108',
    businessEmail: 'orders@bridgecitybakery.com',
  },
  {
    name: 'Saskatoon Security Services',
    email: 'security@saskatoon.com',
    businessName: 'Saskatoon Security Services',
    address: '369 Circle Drive, Saskatoon, SK',
    phone: '(306) 555-0109',
    businessEmail: 'info@saskatoonsecurity.com',
  },
  {
    name: 'Prairie Sound & Lighting',
    email: 'sound@prairie.com',
    businessName: 'Prairie Sound & Lighting',
    address: '741 Idylwyld Drive N, Saskatoon, SK',
    phone: '(306) 555-0110',
    businessEmail: 'tech@prairiesound.com',
  },
];

export async function GET(req: NextRequest) {
  try {
    // Check if providers already exist
    const existingProviders = await db.provider.count();
    
    if (existingProviders > 0) {
      return NextResponse.json({
        message: `Providers already exist (${existingProviders} found). Skipping seed.`,
        existingCount: existingProviders,
      });
    }

    // Hash password for all providers (simple password for testing)
    const hashedPassword = await bcrypt.hash('provider123', 10);

    // Create providers
    const createdProviders = [];
    
    for (const providerData of saskatoonProviders) {
      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email: providerData.email },
      });

      if (existingUser) {
        console.log(`User ${providerData.email} already exists, skipping...`);
        continue;
      }

      // Create user with provider
      const user = await db.user.create({
        data: {
          email: providerData.email,
          password: hashedPassword,
          name: providerData.name,
          role: 'PROVIDER',
          provider: {
            create: {
              businessName: providerData.businessName,
              address: providerData.address,
              phone: providerData.phone,
              email: providerData.businessEmail,
            },
          },
        },
        include: {
          provider: true,
        },
      });

      createdProviders.push({
        id: user.id,
        email: user.email,
        businessName: user.provider?.businessName,
      });
    }

    return NextResponse.json({
      message: `Successfully created ${createdProviders.length} providers`,
      providers: createdProviders,
      note: 'All providers use password: provider123',
    });
  } catch (error) {
    console.error('Seed providers error:', error);
    return NextResponse.json(
      { error: 'An error occurred while seeding providers', details: error },
      { status: 500 }
    );
  }
}

