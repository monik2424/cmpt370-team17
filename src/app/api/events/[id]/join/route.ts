import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/modules/db";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const event = await db.event.findUnique({
    where: { id },
    include: { attendees: true }
  });

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (event.private) return NextResponse.json({ error: "Private event" }, { status: 403 });

  await db.event.update({
    where: { id },
    data: {
      attendees: {
        connect: { id: userId }
      },
      attendeeCount: { increment: 1 }
    }
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  await db.event.update({
    where: { id },
    data: {
      attendees: {
        disconnect: { id: userId }
      },
      attendeeCount: { decrement: 1 }
    }
  });

  return NextResponse.json({ ok: true });
}
