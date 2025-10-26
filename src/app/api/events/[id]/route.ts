import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/modules/db";

// DELETE /api/events/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const user = session?.user as any;

  if (!user?.id || user.role !== "HOST") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const event = await db.event.findUnique({
    where: { id: params.id },
    select: { createdById: true },
  });

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (event.createdById !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await db.event.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
