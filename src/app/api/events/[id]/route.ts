/**
 * /api/events/[id]
 * ----------------------------------------------------------------------------
 * DELETE  -> delete an event you created
 * PUT     -> edit an event you created
 *
 * Auth rules (updated for new schema):
 * - Must be signed in
 * - Providers are NOT allowed to create/edit/delete events
 * - Only the creator (createdById) may modify/delete the event
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/modules/db";

/**
 * DELETE /api/events/[id]
 * Deletes a single Event the current user owns.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  // must be signed in
  const session = await auth();
  const user = session?.user as any;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // providers are not allowed to modify events
  if (user.role === "PROVIDER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // only the creator can delete
  const event = await db.event.findUnique({
    where: { id: params.id },
    select: { createdById: true },
  });
  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (event.createdById !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }


  await db.event.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

/**
 * PUT /api/events/[id]
 * Updates an existing Event the current user owns.
 * Expects JSON: { name, desc, date, time, location, isPrivate }
 * - date: "YYYY-MM-DD"
 * - time: "HH:MM"
 * - location must contain "Saskatoon"
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {

  const session = await auth();
  const user = session?.user as any;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }


  if (user.role === "PROVIDER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }


  const existing = await db.event.findUnique({
    where: { id: params.id },
    select: { createdById: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (existing.createdById !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }


  const body = await req.json();
  const name = (body?.name ?? "").trim();
  const desc = (body?.desc ?? "").trim();
  const date = (body?.date ?? "").trim();      // "YYYY-MM-DD"
  const time = (body?.time ?? "").trim();      // "HH:MM"
  const location = (body?.location ?? "").trim();
  const isPrivate = Boolean(body?.isPrivate);

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return NextResponse.json({ error: "Invalid date/time" }, { status: 400 });
  }

  if (!location || !location.includes("Saskatoon")) {
    return NextResponse.json({ error: "Location must be in Saskatoon" }, { status: 400 });
  }


  const startAt = new Date(`${date}T${time}:00`);
  if (isNaN(startAt.getTime())) {
    return NextResponse.json({ error: "Invalid startAt" }, { status: 400 });
  }

  const updated = await db.event.update({
    where: { id: params.id },
    data: {
      name,
      description: desc || null,
      startAt,
      private: isPrivate,
      location,
    },
  });

  return NextResponse.json({ event: updated }, { status: 200 });
}
