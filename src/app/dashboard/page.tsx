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

  const sessionUser = session.user as any;

  // Fetch fresh user data from database (includes updated image)
  const dbUser = await db.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, name: true, email: true, image: true, role: true },
  });

  const user = { ...sessionUser, ...dbUser };

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
    orderBy: { startAt: 'asc' },
    include: { provider: true }
  });

  // ✅ Fetch events the user is ATTENDING
  const attendingEvents = await db.event.findMany({
    where: {
      attendees: {
        some: { id: user.id }
      }
    },
    orderBy: { startAt: 'asc' },
    include: { provider: true }
  });

  // Helper function to get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Stats calculations
  const stats = {
    eventsCreated: createdEvents.length,
    eventsAttending: attendingEvents.length,
    totalBookings: user.role === 'PROVIDER' ? providerBookings.length : userBookings.length,
    confirmedBookings: user.role === 'PROVIDER' 
      ? providerBookings.filter((b: any) => b.bookingStatus === 'CONFIRMED').length
      : userBookings.filter((b: any) => b.bookingStatus === 'CONFIRMED').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Saskatoon Event Planning
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-300">
                Welcome back, <span className="font-medium text-white">{user.name}</span>
              </span>
              <form action={async () => {
                'use server';
                await signOut({ redirectTo: '/' });
              }}>
                <button
                  type="submit"
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Profile Card */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-4 ring-slate-700 shadow-xl">
                {user.image ? (
                  <img 
                    src={user.image} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {getInitials(user.name)}
                  </span>
                )}
              </div>
              {/* Online indicator */}
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800"></div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  user.role === 'PROVIDER' 
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                    : user.role === 'ADMIN'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {user.role === 'GUEST' ? 'User' : user.role}
                </span>
              </div>
              <p className="text-slate-400 mt-1">{user.email}</p>
              
              {/* Stats Row */}
              <div className="flex flex-wrap gap-6 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{stats.eventsCreated}</p>
                  <p className="text-xs text-slate-400">Events Created</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{stats.eventsAttending}</p>
                  <p className="text-xs text-slate-400">Attending</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{stats.totalBookings}</p>
                  <p className="text-xs text-slate-400">Bookings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">{stats.confirmedBookings}</p>
                  <p className="text-xs text-slate-400">Confirmed</p>
                </div>
              </div>
            </div>

            {/* Edit Profile Button */}
            <a
              href="/profile/edit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors border border-slate-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </a>
          </div>
        </div>

        {/* Quick Actions - Will be updated in next commit */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            {user.role !== 'PROVIDER' && (
              <a href="/events/create" className="flex-1 min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl text-sm font-medium text-center transition-colors">
                ➕ Create Event
              </a>
            )}
            {user.role === 'PROVIDER' && (
              <>
                <a href="/provider/profile" className="flex-1 min-w-[140px] bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl text-sm font-medium text-center transition-colors">
                  ⚙️ Manage Profile
                </a>
                <a href="/provider/bookings" className="flex-1 min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl text-sm font-medium text-center transition-colors">
                  📋 View Bookings
                </a>
              </>
            )}
            {user.role !== 'PROVIDER' && (
              <>
                <a href="/events" className="flex-1 min-w-[140px] bg-slate-600 hover:bg-slate-500 text-white px-4 py-3 rounded-xl text-sm font-medium text-center transition-colors">
                  📋 Your Events
                </a>
                <a href="/providers" className="flex-1 min-w-[140px] bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl text-sm font-medium text-center transition-colors">
                  🏪 Browse Providers
                </a>
                <a href="/search" className="flex-1 min-w-[140px] bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-xl text-sm font-medium text-center transition-colors">
                  🔍 Find Events
                </a>
              </>
            )}
          </div>
        </div>

        {/* Content Cards Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Events You Created */}
          {user.role !== 'PROVIDER' && (
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="text-xl">📅</span> Events You Created
                </h3>
                <a href="/events" className="text-sm text-blue-400 hover:text-blue-300">
                  View all →
                </a>
              </div>
              {createdEvents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400 mb-4">You haven't created any events yet.</p>
                  <a href="/events/create" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Create your first event
                  </a>
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {createdEvents.slice(0, 6).map(ev => (
                    <a
                      key={ev.id}
                      href={`/events`}
                      className="flex-shrink-0 w-64 p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors border border-slate-600/50"
                    >
                      {/* Placeholder for future event image */}
                      <div className="w-full h-24 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-lg mb-3 flex items-center justify-center">
                        <span className="text-3xl">📅</span>
                      </div>
                      <h4 className="font-medium text-white truncate">{ev.name}</h4>
                      <p className="text-sm text-slate-400 mt-1">
                        {new Date(ev.startAt).toLocaleDateString()} at {new Date(ev.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {ev.provider && (
                        <span className="inline-block mt-2 text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30">
                          {ev.provider.businessName}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Events You're Attending */}
          {user.role !== 'PROVIDER' && (
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="text-xl">🎉</span> Events You're Attending
                </h3>
              </div>
              {attendingEvents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400 mb-4">You're not attending any events yet.</p>
                  <a href="/search" className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Find events to attend
                  </a>
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {attendingEvents.slice(0, 6).map(ev => (
                    <a
                      key={ev.id}
                      href={`/events`}
                      className="flex-shrink-0 w-64 p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors border border-slate-600/50"
                    >
                      {/* Placeholder for future event image */}
                      <div className="w-full h-24 bg-gradient-to-br from-orange-600/30 to-pink-600/30 rounded-lg mb-3 flex items-center justify-center">
                        <span className="text-3xl">🎉</span>
                      </div>
                      <h4 className="font-medium text-white truncate">{ev.name}</h4>
                      <p className="text-sm text-slate-400 mt-1">
                        {new Date(ev.startAt).toLocaleDateString()} at {new Date(ev.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Provider Dashboard */}
          {user.role === 'PROVIDER' && (
            <>
              {/* Business Info Card */}
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span className="text-xl">🏪</span> Business Information
                  </h3>
                  <a href="/provider/profile" className="text-sm text-blue-400 hover:text-blue-300">
                    Edit →
                  </a>
                </div>
                
                {!provider ? (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <p className="text-sm text-yellow-300 font-medium mb-2">
                      ⚠️ Provider Profile Not Found
                    </p>
                    <p className="text-sm text-yellow-200/70 mb-3">
                      Your account has the PROVIDER role, but no provider profile exists.
                    </p>
                    <a 
                      href="/api/provider/seed" 
                      className="text-sm text-blue-400 hover:text-blue-300 underline"
                      target="_blank"
                    >
                      Create provider profile →
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600/50">
                      <p className="text-xs text-slate-400 mb-1">Business Name</p>
                      <p className="text-white font-medium">{provider.businessName}</p>
                    </div>
                    {provider.address && (
                      <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600/50">
                        <p className="text-xs text-slate-400 mb-1">Address</p>
                        <p className="text-white">{provider.address}</p>
                      </div>
                    )}
                    {provider.phone && (
                      <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600/50">
                        <p className="text-xs text-slate-400 mb-1">Phone</p>
                        <p className="text-white">{provider.phone}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Provider Bookings Card */}
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span className="text-xl">📋</span> Recent Bookings
                  </h3>
                  <a href="/provider/bookings" className="text-sm text-blue-400 hover:text-blue-300">
                    View all →
                  </a>
                </div>
                
                {providerBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400">No bookings yet. When hosts book your services, they'll appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {providerBookings.map((booking: any) => (
                      <div
                        key={booking.id}
                        className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors border border-slate-600/50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-white">{booking.event.name}</h4>
                            <p className="text-sm text-slate-400 mt-1">
                              📅 {new Date(booking.event.startAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              booking.bookingStatus === 'PENDING'
                                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                : booking.bookingStatus === 'CONFIRMED'
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                : booking.bookingStatus === 'CANCELLED'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                            }`}
                          >
                            {booking.bookingStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* User Bookings */}
          {user.role !== 'PROVIDER' && (
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="text-xl">🎫</span> Your Bookings
                </h3>
                <a href="/providers" className="text-sm text-blue-400 hover:text-blue-300">
                  Browse providers →
                </a>
              </div>
              
              {userBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400 mb-4">You haven't booked any providers yet.</p>
                  <a href="/providers" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Browse providers
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userBookings.map((booking: any) => (
                    <div
                      key={booking.id}
                      className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors border border-slate-600/50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{booking.provider.businessName}</h4>
                          <p className="text-sm text-slate-400 mt-1">
                            For: {booking.event.name}
                          </p>
                          <p className="text-sm text-slate-400">
                            📅 {new Date(booking.event.startAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            booking.bookingStatus === 'PENDING'
                              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                              : booking.bookingStatus === 'CONFIRMED'
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                              : booking.bookingStatus === 'CANCELLED'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                          }`}
                        >
                          {booking.bookingStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}