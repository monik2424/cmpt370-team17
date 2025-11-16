/**
 * Guest Management Page
 * 
 * Description:
 * - Allows event creators to manage guests for private events
 * - Shows guest list and form to add new guests
 * - Only accessible by event creators for private events
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import db from '@/modules/db';
import GuestManagementClient from './GuestManagementClient';

interface PageProps {
  params: { id: string };
}

export default async function GuestManagementPage({ params }: PageProps) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user as any;

  // Fetch event and verify permissions
  const event = await db.event.findUnique({
    where: { id: params.id },
    include: {
      guests: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!event) {
    redirect('/events');
  }

  // Only event creator can manage guests
  if (event.createdById !== user.id) {
    redirect('/events');
  }

  // Only private events can have guest management
  if (!event.private) {
    redirect('/events');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Guest Management
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/events"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Back to Events
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Event Info */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {event.name}
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>📅 {new Date(event.startAt).toLocaleString()}</p>
            {event.location && <p>📍 {event.location}</p>}
            <p>🔒 Private Event</p>
          </div>
        </div>

        {/* Guest Management Component */}
        <GuestManagementClient 
          eventId={event.id}
          initialGuests={event.guests}
        />
      </div>
    </div>
  );
}
