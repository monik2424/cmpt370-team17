"use client";

import { useState } from "react";

interface Guest {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface GuestFormProps {
  eventId: string;
  guests: Guest[];
  onGuestAdded: (guest: Guest) => void;
  onGuestRemoved: (guestId: string) => void;
}

export default function GuestForm({ 
  eventId, 
  guests, 
  onGuestAdded, 
  onGuestRemoved 
}: GuestFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Please fill in both name and email");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/events/${eventId}/guests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Guest added successfully!");
        setName("");
        setEmail("");
        onGuestAdded(data.guest);
      } else {
        setError(data.error || "Failed to add guest");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveGuest = async (guestId: string) => {
    if (!confirm("Are you sure you want to remove this guest?")) return;

    try {
      const response = await fetch(`/api/guests/${guestId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onGuestRemoved(guestId);
        setSuccess("Guest removed successfully!");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to remove guest");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Guest Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Add Guest
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Guest Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded border px-3 py-2 dark:bg-gray-900 dark:border-gray-600"
                placeholder="Enter guest name"
                disabled={loading}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border px-3 py-2 dark:bg-gray-900 dark:border-gray-600"
                placeholder="Enter email address"
                disabled={loading}
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Adding..." : "Add Guest"}
          </button>
        </form>

        {/* Status Messages */}
        {error && (
          <div className="mt-4 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mt-4 text-green-600 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
            {success}
          </div>
        )}
      </div>

      {/* Guest List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Guest List ({guests.length})
        </h3>
        
        {guests.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No guests added yet. Add some guests above to get started!
          </p>
        ) : (
          <div className="space-y-3">
            {guests.map((guest) => (
              <div
                key={guest.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {guest.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {guest.email}
                  </div>
                </div>
                
                <button
                  onClick={() => handleRemoveGuest(guest.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
