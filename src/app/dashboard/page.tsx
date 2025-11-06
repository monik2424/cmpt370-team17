import { redirect } from 'next/navigation';
import { auth, signOut } from '@/lib/auth';
import db from "@/modules/db";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user as any;

  const createdEvents = await db.event.findMany({
    where: { createdById: user.id },
    orderBy: { startAt: 'asc' }
  });

  // ✅ Fetch events the user is ATTENDING
  const attendingEvents = await db.event.findMany({
    where: {
      attendees: {
        some: { id: user.id }
      }
    },
    orderBy: { startAt: 'asc' }
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Saskatoon Event Planning
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Welcome, {user.name}
              </span>
              <form action={async () => {
                'use server';
                await signOut({ redirectTo: '/' });
              }}>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Your Profile
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Personal Information</h3>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">Name:</span> {user.name}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">Email:</span> {user.email}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">Role:</span> {user.role}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Quick Actions</h3>
                  <div className="mt-2 space-y-2">
                    {user.role !== 'PROVIDER' && (
                      <a href="/events/create" className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium text-center">
                        Create New Event
                      </a>
                    )}
                    {user.role === 'PROVIDER' && (
                      <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                        Manage Services
                      </button>
                    )}
                    <a href="/events" className="block w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium text-center">
                      View Events
                    </a>
                  </div>
                </div>
              </div>

              {/* Role-specific content */}
              {user.role !== 'PROVIDER' && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Your Events
                  </h3>
                  {createdEvents.length === 0 && attendingEvents.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      You aren't part of any events yet.
                    </p>
                  )}
                  {createdEvents.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">Events You Created</h4>
                      <ul className="mt-2 space-y-1">
                        {createdEvents.map(ev => (
                          <li key={ev.id}>
                            <a
                              href={`/events`}
                              className="text-blue-500 hover:underline"
                            >
                              {ev.name} — {new Date(ev.startAt).toLocaleString()}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {attendingEvents.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 dark:text-white">Events You're Attending</h4>
                      <ul className="mt-2 space-y-1">
                        {attendingEvents.map(ev => (
                          <li key={ev.id}>
                            <a
                              href={`/events`}
                              className="text-blue-500 hover:underline"
                            >
                              {ev.name} — {new Date(ev.startAt).toLocaleString()}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {user.role === 'PROVIDER' && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Your Services
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage your business services and availability.
                  </p>
                </div>
              )}

              {user.role === 'GUEST' && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Your Invitations
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    You haven't been invited to any events yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}