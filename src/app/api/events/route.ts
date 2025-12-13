/**
 * post /api/events
 * ----------------------------------------------------------------------------
 *   Creates a new Event record in the database on behalf of the current Host.
 *   - Only users with role === "HOST" may create events.
 *
 * input (JSON):
 *   {
 *     name        : string, required (1–120 chars)
 *     description : string | null (optional, max 1000 chars)
 *     date        : "YYYY-MM-DD"   
 *     time        : "HH:MM"        
 *     isPrivate   : boolean, default true
 *     tags        : string[], optional; each tag max length 32; max 12 tags
 *   }
 *
 *   EventCreateForm.tsx sends requests here using fetch()
 *   /events page renders newly created events in the Host's list
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import db from "@/modules/db";

// Describing the expected shape
const CreateEventSchema = z.object({
  image: z.string().optional().nullable(),
  name: z.string().min(1).max(120),
  description: z.string().max(1000).optional().nullable(),
  location: z.string().min(5).max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // yyyy-mm-dd
  time: z.string().regex(/^\d{2}:\d{2}$/),       // hh:mm
  isPrivate: z.boolean().default(true),
  tags: z.array(z.string().min(1).max(32)).max(12).optional().default([]),
  providerId: z.string().optional().nullable(), // Optional provider selection
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    const user = session?.user as any;

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get events created by the user
    const events = await db.event.findMany({
      where: { createdById: user.id },
      select: {
        id: true,
        name: true,
        description: true,
        location: true,
        startAt: true,
        private: true,
        createdAt: true,
      },
      orderBy: {
        startAt: 'desc',
      },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Authenticate session and user
    const session = await auth();
    const user = session?.user as any;

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Providers cannot create events, leave commented out for now until I find a better way to deal with it
    //if (user.role === "PROVIDER") {
    //  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    //}

    // Parse and validate input
    const body = await req.json();
    const data = CreateEventSchema.parse(body);

    // Process date and time
    const startsAt = new Date(`${data.date}T${data.time}:00`);
    if (isNaN(startsAt.getTime())) {
      return NextResponse.json({ error: "Invalid date/time" }, { status: 400 });
    }

    // Validate provider if provided
    if (data.providerId) {
      const provider = await db.provider.findUnique({
        where: { id: data.providerId },
      });
      if (!provider) {
        return NextResponse.json({ error: "Provider not found" }, { status: 400 });
      }
    }

    // For each tag, either update the existing CategoryTag row,
    // or create a new one if it doesn't yet exist
    const tagRecords = await Promise.all(
      (data.tags ?? []).map((label) =>
        db.categoryTag.upsert({
          where: { nameTag: label },
          update: {},                     // Do nothing if it already exists
          create: { nameTag: label },     // Otherwise create a new row
        })
      )
    );

    // Create Event row in the database
    const event = await db.event.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        location: data.location,
        startAt: startsAt,
        private: data.isPrivate,
        createdById: user.id, // Tie to current user
        providerId: data.providerId || null, // Link to provider if selected
        // Link tags through the implicit M:N
        categoryTags: {
          connect: tagRecords.map((t) => ({ id: t.id })),
        },
      },
      include: {
        categoryTags: true,   // Return tags so UI can display them
        provider: true,       // Return provider info if linked
      },
    });

    // If a provider was selected, create a booking record
    if (data.providerId) {
      await db.booking.create({
        data: {
          eventId: event.id,
          providerId: data.providerId,
          userId: user.id, // User who created the event (the customer)
          bookingStatus: 'PENDING', // Default status, provider can confirm later
        },
      });
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (e: any) {
    // If validation failed
    if (e?.issues) {
      return NextResponse.json({ error: "Invalid input", details: e.issues }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Simple Saskatoon validation
  if (!body.location?.includes("Saskatoon")) {
    return NextResponse.json({ error: "Location must be in Saskatoon" }, { status: 400 });
  }

  const startsAt = new Date(`${body.date}T${body.time}:00`);

  const updateData: any = {
    name: body.name,
    description: body.desc ?? null,
    startAt: startsAt,
    private: body.isPrivate,
    location: body.location,
  };

    // Only update image if provided
  if (typeof body.image === "string") {
    updateData.image = body.image;   // replace with new image
  } else if (body.image === null) {
    // 
    updateData.image = null;
  }
  // If body.image is undefined leave image unchanged

  if (Array.isArray(body.tags) && body.tags.length > 0) {
    const tagRecords = await Promise.all(
      body.tags.map((label: string) =>
        db.categoryTag.upsert({
          where: { nameTag: label },
          update: {},
          create: { nameTag: label },
        })
      )
    );

    // Replace existing categories with the new ones
    updateData.categoryTags = {
      set: tagRecords.map((t) => ({ id: t.id })),
    };
  }

  const event = await db.event.update({
    where: { id: params.id },
    data: updateData,
  });

  return NextResponse.json({ event }, { status: 200 });
}
