/**
 * GET /api/events/public
 * ----------------------------------------------------------------------------
 * Fetches public events, optionally filtered by category tag
 * Query params: ?category=sports (optional)
 * 
 * This endpoint is accessible without authentication and only returns:
 * - Public events (private: false)
 * - Future events (startAt >= now)
 * - Filtered by category if provided
 */

import { NextRequest, NextResponse } from "next/server";
import db from "@/modules/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const whereClause: any = {
      private: false,
      startAt: {
        gte: new Date(), // Only future events
      },
    };

    // Filter by category if provided
    if (category) {
      // TODO: I made this short-term fix but I think our Database has different tags for the
      // multi-line names so it resulted in events not showing up with food/art tags
      const categoryMap: { [key: string]: string[] } = {
        arts: ["arts", "Arts & Culture"],
        food: ["food", "Food & Dining"],
      };

      const possibleTags = categoryMap[category] || [category];

      whereClause.categoryTags = {
        some: {
          nameTag: {
            in: possibleTags,
              mode: 'insensitive',
          },
        },
      };
    }

    const events = await db.event.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        description: true,
        location: true,
        startAt: true,
        attendeeCount: true,
        private: true,
        image: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        categoryTags: {
          select: {
            id: true,
            nameTag: true,
            description: true,
          },
        },
        provider: {
          select: {
            id: true,
            businessName: true,
            address: true,
          },
        },
      },
      orderBy: {
        startAt: "asc", // Soonest events first
      },
    });

    return NextResponse.json({ 
      events,
      count: events.length,
      category: category || "all"
    });
  } catch (error) {
    console.error("Fetch public events error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}