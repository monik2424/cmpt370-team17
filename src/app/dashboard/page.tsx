/**
 * Dashboard Page
 * 
 * Description:
 * - Main dashboard for all user types (GUEST, PROVIDER)
 * - Shows user profile information and role-specific content
 * - For PROVIDER role: displays business info and recent bookings
 * - For other roles: displays created events and attending events
 * - Updated by Monik: Added provider-specific dashboard content
 */

import { redirect } from 'next/navigation';
import { auth, signOut } from '@/lib/auth';
import db from "@/modules/db";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user as any;

  // Fetch provider data if user is a provider
  let provider = null;
  let providerBookings: any[] = [];
  
  if (user.role === 'PROVIDER') {
    provider = await db.provider.findUnique({
      where: { userId: user.id },
      include: {
        bookings: {
          include: {
            event: {
              select: {
                id: true,
                name: true,
                startAt: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5, // Show only recent 5 bookings
        },
      },
    });

    if (provider) {
      providerBookings = provider.bookings;
    }
  }

  // Fetch user's bookings (if not a provider)
  let userBookings: any[] = [];
  if (user.role !== 'PROVIDER') {
    userBookings = await db.booking.findMany({
      where: { userId: user.id },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            phone: true,
            email: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
            startAt: true,
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5, // Show only recent 5 bookings
    });
  }

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
                      <>
                        <a href="/provider/profile" className="block w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium text-center">
                          Manage Profile
                        </a>
                        <a href="/provider/bookings" className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium text-center">
                          View Bookings
                        </a>
                      </>
                    )}
                    <a href="/events" className="block w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium text-center">
                      View Events
                    </a>
                    {user.role !== 'PROVIDER' && (
                      <a href="/providers" className="block w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium text-center">
                        Browse Providers
                      </a>
                    )}
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
                    Provider Dashboard
                  </h3>
                  
                  {provider && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Business Information
                      </h4>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-sm text-gray-900 dark:text-white">
                          <span className="font-medium">Business Name:</span> {provider.businessName}
                        </p>
                        {provider.address && (
                          <p className="text-sm text-gray-900 dark:text-white mt-1">
                            <span className="font-medium">Address:</span> {provider.address}
                          </p>
                        )}
                        {provider.phone && (
                          <p className="text-sm text-gray-900 dark:text-white mt-1">
                            <span className="font-medium">Phone:</span> {provider.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {providerBookings.length > 0 ? (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Recent Bookings
                      </h4>
                      <ul className="space-y-2">
                        {providerBookings.map((booking: any) => (
                          <li key={booking.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {booking.event.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(booking.event.startAt).toLocaleDateString()}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  booking.bookingStatus === 'PENDING'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                    : booking.bookingStatus === 'CONFIRMED'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : booking.bookingStatus === 'CANCELLED'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                                }`}
                              >
                                {booking.bookingStatus}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <a
                        href="/provider/bookings"
                        className="mt-3 inline-block text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                      >
                        View all bookings →
                      </a>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        You don't have any bookings yet. When event hosts book your services, they'll appear here.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {user.role !== 'PROVIDER' && userBookings.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Your Bookings
                  </h3>
                  <ul className="space-y-2">
                    {userBookings.map((booking: any) => (
                      <li key={booking.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {booking.provider.businessName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              For: {booking.event.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(booking.event.startAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              booking.bookingStatus === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                : booking.bookingStatus === 'CONFIRMED'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : booking.bookingStatus === 'CANCELLED'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                            }`}
                          >
                            {booking.bookingStatus}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {user.role === 'GUEST' && userBookings.length === 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Your Bookings
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    You haven't booked any providers yet.
                  </p>
                  <a
                    href="/providers"
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    Browse providers →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}