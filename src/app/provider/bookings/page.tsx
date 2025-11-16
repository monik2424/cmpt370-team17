/**
 * Provider Bookings Management Page
 * Author: Monik
 * 
 * Description:
 * - Displays all bookings for the current provider
 * - Shows booking status (PENDING, CONFIRMED, CANCELLED, COMPLETED)
 * - Allows providers to accept/reject pending bookings
 * - Allows providers to mark confirmed bookings as completed
 * - Filter bookings by status
 * - Shows event details and customer information for each booking
 * - Only accessible by authenticated users with PROVIDER role
 */

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Booking {
  id: string;
  bookingStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  event: {
    id: string;
    name: string;
    description: string | null;
    location: string | null;
    startAt: string;
    private: boolean;
    createdBy: {
      id: string;
      name: string;
      email: string;
    };
  };
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default function ProviderBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [updating, setUpdating] = useState<string | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'ALL' 
        ? '/api/provider/bookings'
        : `/api/provider/bookings?status=${statusFilter}`;
      
      const response = await fetch(url);
      
      if (response.status === 401 || response.status === 403) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.bookings);
    } catch (err) {
      setError('Failed to load bookings. Please try again.');
      console.error('Fetch bookings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') => {
    try {
      setUpdating(bookingId);
      const response = await fetch(`/api/provider/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingStatus: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update booking');
      }

      // Refresh bookings list
      await fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to update booking. Please try again.');
      console.error('Update booking error:', err);
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading bookings...</p>
        </div>
      </div>
    );
  }

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
              <a
                href="/dashboard"
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600"
              >
                Dashboard
              </a>
              <a
                href="/provider/profile"
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600"
              >
                Profile
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Your Bookings
                </h2>
                
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="ALL">All Bookings</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              {error && (
                <div className="mb-4 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                  {error}
                </div>
              )}

              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    {statusFilter === 'ALL' 
                      ? "You don't have any bookings yet."
                      : `You don't have any ${statusFilter.toLowerCase()} bookings.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {booking.event.name}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                booking.bookingStatus
                              )}`}
                            >
                              {booking.bookingStatus}
                            </span>
                          </div>
                          {booking.event.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {booking.event.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Event Date</p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {new Date(booking.event.startAt).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {booking.event.location || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Event Host</p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {booking.event.createdBy.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {booking.event.createdBy.email}
                          </p>
                        </div>
                        {booking.user && (
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Booked By</p>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {booking.user.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {booking.user.email}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Booking Date</p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {new Date(booking.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2 mt-4">
                        {booking.bookingStatus === 'PENDING' && (
                          <>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                              disabled={updating === booking.id}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updating === booking.id ? 'Processing...' : 'Accept'}
                            </button>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                              disabled={updating === booking.id}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updating === booking.id ? 'Processing...' : 'Reject'}
                            </button>
                          </>
                        )}
                        {booking.bookingStatus === 'CONFIRMED' && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'COMPLETED')}
                            disabled={updating === booking.id}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updating === booking.id ? 'Processing...' : 'Mark as Completed'}
                          </button>
                        )}
                        {(booking.bookingStatus === 'CANCELLED' || booking.bookingStatus === 'COMPLETED') && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                            No actions available for {booking.bookingStatus.toLowerCase()} bookings
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

