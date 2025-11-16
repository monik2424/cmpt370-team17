/**
 * Providers Browse Page
 * Author: Monik
 * 
 * Description:
 * - Displays all available providers in Saskatoon
 * - Users can browse providers and book them for events
 * - Simple card-based layout showing provider information
 * - Booking button opens modal to select event and book provider
 * - Only accessible by authenticated users
 */

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Provider {
  id: string;
  businessName: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
  bookingCount: number;
  activeBookings: number;
}

interface Event {
  id: string;
  name: string;
  startAt: string;
  location: string | null;
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [success, setSuccess] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    fetchProviders();
    fetchUserEvents();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/providers');
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch providers');
      }

      const data = await response.json();
      setProviders(data.providers);
    } catch (err) {
      setError('Failed to load providers. Please try again.');
      console.error('Fetch providers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error('Fetch events error:', err);
    }
  };

  const handleBookProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowBookingModal(true);
    setSelectedEventId('');
    setError('');
    setSuccess('');
  };

  const handleSubmitBooking = async () => {
    if (!selectedProvider || !selectedEventId) {
      setError('Please select an event');
      return;
    }

    setBookingLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: selectedEventId,
          providerId: selectedProvider.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      setSuccess('Booking created successfully! The provider will review your request.');
      setTimeout(() => {
        setShowBookingModal(false);
        setSuccess('');
        fetchProviders(); // Refresh to update booking counts
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading providers...</p>
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
                href="/events"
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600"
              >
                Events
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Available Providers
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Browse and book providers for your events in Saskatoon
            </p>
          </div>

          {error && !showBookingModal && (
            <div className="mb-4 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
              {error}
            </div>
          )}

          {providers.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No providers available yet.
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Run the seed script to create providers: GET /api/provider/seed
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {provider.businessName}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    {provider.address && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        📍 {provider.address}
                      </p>
                    )}
                    {provider.phone && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        📞 {provider.phone}
                      </p>
                    )}
                    {provider.email && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ✉️ {provider.email}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {provider.bookingCount} total bookings
                    </div>
                    {provider.activeBookings > 0 && (
                      <div className="text-xs text-green-600 dark:text-green-400">
                        {provider.activeBookings} active
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleBookProvider(provider)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Book Provider
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Book {selectedProvider.businessName}
            </h3>

            {error && (
              <div className="mb-4 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 text-green-600 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                {success}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Event
              </label>
              {events.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  You need to create an event first.
                </p>
              ) : (
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Choose an event...</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name} - {new Date(event.startAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleSubmitBooking}
                disabled={bookingLoading || !selectedEventId || events.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingLoading ? 'Booking...' : 'Confirm Booking'}
              </button>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedProvider(null);
                  setError('');
                  setSuccess('');
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

