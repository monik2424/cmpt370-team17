/**
 * Individual Guest Management API Route
 * 
 * Description:
 * - DELETE: Removes a guest from an event
 * - Only event creators can delete guests
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/modules/db';

interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;

    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find guest and verify permissions
    const guest = await db.guest.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            createdById: true,
          },
        },
      },
    });

    if (!guest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      );
    }

    if (guest.event.createdById !== user.id) {
      return NextResponse.json(
        { error: 'Only event creators can remove guests' },
        { status: 403 }
      );
    }

    // Delete guest
    await db.guest.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Guest removed successfully',
    });
  } catch (error) {
    console.error('Delete guest error:', error);
    return NextResponse.json(
      { error: 'An error occurred while removing guest' },
      { status: 500 }
    );
  }
}
