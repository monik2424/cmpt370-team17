/**
 * EventsPage
 * ----------------------------------------------------------------------------
 * - Shows "Your Events" (the ones you created)
 * - Also shows "Public Events" by other users (with Join/Leave)
 * - Displays location, tags, description, attendees
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import db from '@/modules/db';
import DeleteEventButton from "@/components/EventComponents/DeleteEventButton";

// NEW: add Join/Leave UI
import JoinButton from "@/components/EventComponents/JoinButton";
import LeaveButton from "@/components/EventComponents/LeaveButton";

export default async function EventsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const user = session.user as any;

  // Anyone except PROVIDER can create/manage their own events
  const canManage = user.role !== 'PROVIDER';

  const myEvents = canManage
    ? await db.event.findMany({
        where: { createdById: user.id },
        orderBy: { startAt: 'asc' },
        include: { categoryTags: true, attendees: true, provider: true, guests: true }, // include guest info
      })
    : [];


  // 2) Public events created by OTHER users (so you can join/leave)
  //    If your class now has only Hosts, this will show everyone else's public events.
  const publicEventsByOthers = await db.event.findMany({
    where: {
      private: false,
      createdById: { not: user.id },
    },
    orderBy: { startAt: 'asc' },
    include: { categoryTags: true, attendees: true, createdBy: true, provider: true },
  });

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
        <div className="px-4 py-6 sm:px-0 space-y-10">
          {/* ------------------------- Your Events ------------------------- */}
          <section>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {canManage ? 'Your Events' : 'All Events'}
              </h2>
              {canManage && (
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
                {canManage && myEvents.length > 0 ? (
                  <ul className="divide-y">
                    {myEvents.map((e) => (
                      <li key={e.id} className="py-4">
                        <div className="flex items-start justify-between gap-4">
                          {/* Left: event details */}
                          <div className="min-w-0">
                            <div className="font-medium">{e.name}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(e.startAt).toLocaleString()} • {e.private ? "PRIVATE" : "PUBLIC"}
                            </div>

                            {/* Location (Saskatoon) */}
                            {e.location && (
                              <div className="text-sm text-gray-600 dark:text-gray-300">
                                📍 {e.location}
                              </div>
                            )}

                            {/* Provider */}
                            {e.provider && (
                              <div className="text-sm text-blue-600 dark:text-blue-400">
                                🏢 Service Provider: {e.provider.businessName}
                              </div>
                            )}

                            {/* Description */}
                            {e.description && (
                              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {e.description}
                              </p>
                            )}

                            {/* Tags */}
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

                            {/* Attendees/Guests list/summary */}
                            <div className="mt-3 text-xs text-gray-600 dark:text-gray-300">
                              {e.private ? (
                                <>
                                  Invited Guests: {e.guests?.length || 0}
                                  {e.guests && e.guests.length > 0 && (
                                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                      {e.guests.map(g => (
                                        <span key={g.id}>{g.name} ({g.email})</span>
                                      ))}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <>
                                  Attendees: {e.attendees.length}
                                  {e.attendees.length > 0 && (
                                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                      {e.attendees.map(a => (
                                        <span key={a.id}>{a.email}</span>
                                      ))}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* Right: actions (owner) */}
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            {/* Manage Guests (private events only) */}
                            {e.private && (
                              <a
                                href={`/events/${e.id}/guests`}
                                className="text-green-600 hover:underline text-sm"
                              >
                                Manage Guests
                              </a>
                            )}

                            {/* Edit (owner only) */}
                            <a
                              href={`/events/${e.id}/edit`}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Edit
                            </a>

                            {/* Delete (owner only) */}
                            <DeleteEventButton id={e.id} />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    {canManage
                      ? 'No events yet. Create your first event!'
                      : 'Check back later for upcoming events.'}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* -------------------- Public Events by Others ------------------- */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Public Events (Others)
            </h2>

            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6">
                {publicEventsByOthers.length > 0 ? (
                  <ul className="divide-y">
                    {publicEventsByOthers.map((e) => {
                      const IAmAttending = e.attendees.some(a => a.id === user.id);
                      return (
                        <li key={e.id} className="py-4">
                          <div className="flex items-start justify-between gap-4">
                            {/* Left: event details */}
                            <div className="min-w-0">
                              <div className="font-medium">
                                {e.name}
                                <span className="ml-2 text-xs text-gray-500">
                                  • by {e.createdBy?.name || e.createdBy?.email}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(e.startAt).toLocaleString()} • PUBLIC
                              </div>

                              {e.location && (
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                  📍 {e.location}
                                </div>
                              )}

                              {/* Provider */}
                              {e.provider && (
                                <div className="text-sm text-blue-600 dark:text-blue-400">
                                  🏢 Service Provider: {e.provider.businessName}
                                </div>
                              )}

                              {e.description && (
                                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
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

                              <div className="mt-3 text-xs text-gray-600 dark:text-gray-300">
                                Attendees: {e.attendees.length}
                                {e.attendees.length > 0 && (
                                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                    {e.attendees.map(a => (
                                      <span key={a.id}>{a.email}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right: Join/Leave */}
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              {!IAmAttending && (
                                <JoinButton id={e.id} />
                              )}
                              {IAmAttending && (
                                <LeaveButton id={e.id} />
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No public events yet.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
