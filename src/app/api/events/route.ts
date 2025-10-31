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
  name: z.string().min(1).max(120),
  description: z.string().max(1000).optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // yyyy-mm-dd
  time: z.string().regex(/^\d{2}:\d{2}$/),       // hh:mm
  isPrivate: z.boolean().default(true),
  tags: z.array(z.string().min(1).max(32)).max(12).optional().default([]),
});

export async function POST(req: Request) {
  try {
    // Authenticate session and user
    const session = await auth();
    const user = session?.user as any;
    // If not signed in OR not a Host
    if (!user?.id || user.role !== "HOST") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse and validate input
    const body = await req.json();
    const data = CreateEventSchema.parse(body);

    // Process date and time
    const startsAt = new Date(`${data.date}T${data.time}:00`);
    if (isNaN(startsAt.getTime())) {
      return NextResponse.json({ error: "Invalid date/time" }, { status: 400 });
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
        startAt: startsAt,
        private: data.isPrivate,
        createdById: user.id, // Tie to current user
        // Link tags through the implicit M:N
        categoryTags: {
          connect: tagRecords.map((t) => ({ id: t.id })),
        },
      },
      include: {
        categoryTags: true,   // Return tags so UI can display them
      },
    });

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
