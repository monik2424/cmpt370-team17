/**
 * delete /api/events/:id
 * ----------------------------------------------------------------------------
 *   Deletes a single Event from the database.
 *   Only the Host who originally created the event may delete it.
 *
 *   - User must be authenticated
 *   - User.role must be "HOST"
 *   - Event.createdById must match session.user.id
 *
 *   :id -> The unique cuid() identifier for the event row
 *
 *   <DeleteEventButton /> sends DELETE requests here from /events
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/modules/db";

// DELETE /api/events/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  // Retrieve authenticated user
  const session = await auth();
  const user = session?.user as any;

  // Must be signed in AND must be a Host
  if (!user?.id || user.role !== "HOST") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch the event owner field
  const event = await db.event.findUnique({
    where: { id: params.id },
    select: { createdById: true },
  });

  // No event found -> cannot delete
  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Hosts may only delete their own events
  if (event.createdById !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  // Delete the event row and return standard success response
  await db.event.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
