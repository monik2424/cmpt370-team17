import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import db from "@/modules/db";

// Incoming payload
const CreateEventSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(1000).optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // yyyy-mm-dd
  time: z.string().regex(/^\d{2}:\d{2}$/),       // HH:MM
  isPrivate: z.boolean().default(true),
  tags: z.array(z.string().min(1).max(32)).max(12).optional().default([]),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    const user = session?.user as any;

    if (!user?.id || user.role !== "HOST") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const data = CreateEventSchema.parse(body);

    // Combine date + time -> Date
    const startsAt = new Date(`${data.date}T${data.time}:00`);
    if (isNaN(startsAt.getTime())) {
      return NextResponse.json({ error: "Invalid date/time" }, { status: 400 });
    }

    // Upsert category tags
    const tagRecords = await Promise.all(
      (data.tags ?? []).map((label) =>
        db.categoryTag.upsert({
          where: { nameTag: label },
          update: {},
          create: { nameTag: label },
        })
      )
    );

    const event = await db.event.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        startAt: startsAt,
        private: data.isPrivate,
        createdById: user.id, // tie to current user
        // Link tags through the implicit M:N
        categoryTags: {
          connect: tagRecords.map((t) => ({ id: t.id })),
        },
      },
      include: {
        categoryTags: true,
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (e: any) {
    if (e?.issues) {
      return NextResponse.json({ error: "Invalid input", details: e.issues }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
