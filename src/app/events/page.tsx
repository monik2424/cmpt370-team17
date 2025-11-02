/**
 * EventsPage
 * ----------------------------------------------------------------------------
 * Renders the Events screen inside the app. Host users can create and manage
 * their own events. Guests/Providers can view the page but cannot manage events.
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import db from '@/modules/db';
import DeleteEventButton from "@/components/EventComponents/DeleteEventButton";


export default async function EventsPage() {
  // Retrieve the currently signed-in user session
  const session = await auth();
  // If the user is not authenticated, redirect them to login
  if (!session?.user) redirect('/login');

  const user = session.user as any;
  const isHost = user.role === 'HOST';

  // If the user is a HOST, query Prisma for only events they created.
  const myEvents = isHost
    ? await db.event.findMany({
        where: { createdById: user.id },    // ownership scoping
        orderBy: { startAt: 'asc' },        // sort upcoming first
        include: { categoryTags: true },    // display tags in UI
      })
    : []; // Non-hosts get an empty list for now

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Saskatoon Events
              </h1>
              <div className="hidden md:flex space-x-4">
                <a href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </a>
                <a href="/events" className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Events
                </a>
                <a href="/map" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Map
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300 mr-4">
                {user.name}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isHost ? 'Your Events' : 'All Events'}
            </h2>
            {isHost && (
              <a
                href="/events/create"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Create Event
              </a>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              {isHost && myEvents.length > 0 ? (
                <ul className="divide-y">
                  {myEvents.map((e) => (
                    <li key={e.id} className="py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{e.name}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(e.startAt).toLocaleString()} • {e.private ? "PRIVATE" : "PUBLIC"}
                          </div>
                          {/* show description if present */}
                          {e.description && (
                            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {e.description}
                            </p>
                          )}
                          {e.categoryTags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {e.categoryTags.map((t) => (
                                <span
                                  key={t.id}
                                  className="text-xs rounded bg-gray-100 px-2 py-1 dark:bg-gray-700"
                                >
                                  {t.nameTag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <DeleteEventButton id={e.id} />
                      </div>
                    </li>))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  {isHost
                    ? 'No events yet. Create your first event!'
                    : 'Check back later for upcoming events.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}