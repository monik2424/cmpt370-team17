/**
 * Provider Profile Page
 * Author: Monik
 * 
 * Description:
 * - Allows providers to view and edit their business profile
 * - Displays business information (name, address, phone, email)
 * - Shows booking statistics (total, pending, confirmed, etc.)
 * - Form to update provider profile information
 * - Only accessible by authenticated users with PROVIDER role
 */

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProviderProfile {
  id: string;
  businessName: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  availabilitySchedule: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
  };
  bookingStats: {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
  };
}

export default function ProviderProfilePage() {
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    businessName: '',
    address: '',
    phone: '',
    email: '',
  });

  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/provider/profile');
      
      if (response.status === 401 || response.status === 403) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data.provider);
      setFormData({
        businessName: data.provider.businessName || '',
        address: data.provider.address || '',
        phone: data.provider.phone || '',
        email: data.provider.email || '',
      });
    } catch (err) {
      setError('Failed to load profile. Please try again.');
      console.error('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/provider/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      setEditing(false);
      await fetchProfile(); // Refresh profile data
    } catch (err: any) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600">Failed to load profile. Please try again.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Back to Dashboard
          </button>
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
                href="/provider/bookings"
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600"
              >
                Bookings
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Provider Profile
                </h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Booking Statistics */}
              <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {profile.bookingStats.total}
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {profile.bookingStats.pending}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Confirmed</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {profile.bookingStats.confirmed}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {profile.bookingStats.cancelled}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {profile.bookingStats.completed}
                  </p>
                </div>
              </div>

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

              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Business Name *
                    </label>
                    <input
                      id="businessName"
                      name="businessName"
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Address
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your business address"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="(306) 555-0123"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Business Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="business@example.com"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setError('');
                        setSuccess('');
                        fetchProfile(); // Reset form
                      }}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Name</h3>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{profile.businessName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</h3>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {profile.address || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</h3>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {profile.phone || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Email</h3>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {profile.email || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Email</h3>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{profile.user.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

