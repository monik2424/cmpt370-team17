/**
 * EventCreateForm
 * ----------------------------------------------------------------------------
 *   Provides interactive UI for Hosts to create events.
 *
 *   1. User fills out inputs
 *   2. Client validates required fields
 *   3. Sends post request to /api/events
 *   4. On success route to /events to display the updated list
 *
 * Tags
 *   - User enters a comma-separated list
 *   - Trim whitespace, remove empties
 *   - Limit to max 12 tags (same as server)
 */

"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ShimmerButton } from "@/components/ui/shimmer-button";

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
}

export default function EventCreateForm() {
  const router = useRouter();
  // Individual form fields held in local component state
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(""); // yyyy-mm-dd
  const [time, setTime] = useState(""); // HH:MM
  const [isPrivate, setIsPrivate] = useState(true);
  const [tags, setTags] = useState(""); // comma separated
  const [providerId, setProviderId] = useState(""); // selected provider

  // Provider-related state
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(true);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // Fetch providers on component mount
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch('/api/providers');
        if (response.ok) {
          const data = await response.json();
          setProviders(data.providers || []);
        }
      } catch (error) {
        console.error('Failed to fetch providers:', error);
      } finally {
        setProvidersLoading(false);
      }
    };

    fetchProviders();
  }, []);

  // User clicking the Create button
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Reset old status messages
    setErr(null);
    setOk(null);

    // Basic client side validation for UX
    if (!name.trim()) return setErr("Please enter a name.");
    if (!date || !time) return setErr("Please pick a date and time.");

    // Transform comma separated tags into an array
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)      // Prevent empty strings
      .slice(0, 12);        // Max 12 tags

    setLoading(true);
    try {
      // Send the creation payload to API route
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: desc,
          location,
          date,
          time,
          isPrivate,
          tags: tagList,
          providerId: providerId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        // If the server rejected input show reason to user
        setErr(data?.error || "Failed to create event.");
      } else {
        // Show success message
        setOk("Event created!");
        
        // If it's a private event, redirect to guest management
        if (isPrivate) {
          router.push(`/events/${data.event.id}/guests`);
        } else {
          // Go back to Events list for public events
          router.push("/events");
        }
      }
    } catch {
      setErr("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1">Event name</label>
        <input
          className="w-full rounded border px-3 py-2 dark:bg-gray-900"
          placeholder="Edit Event name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          className="w-full rounded border px-3 py-2 dark:bg-gray-900"
          placeholder="Add Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={3}
          disabled={loading}
        />
      </div>

      <div>
  <label className="block text-sm font-medium mb-1">Location</label>
  <input
    className="w-full rounded border px-3 py-2 dark:bg-gray-900"
    placeholder="102 Spadina Crescent E, Saskatoon, SK S7K 0L3"
    value={location}
    onChange={(e) => setLocation(e.target.value)}
    disabled={loading}
  />
  <p className="text-xs text-gray-500 mt-1">Must be a Saskatoon address.</p>
</div>


      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            className="w-full rounded border px-3 py-2 dark:bg-gray-900"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Time</label>
          <input
            type="time"
            className="w-full rounded border px-3 py-2 dark:bg-gray-900"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="flex items-end">
          <label className="inline-flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              disabled={loading}
            />
            <span className="text-sm">Private event</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tags</label>
        <input
          className="w-full rounded border px-3 py-2 dark:bg-gray-900"
          placeholder='e.g. "birthday, kids, family"'
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-1">Comma-separated; max 12.</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Service Provider (Optional)</label>
        <select
          className="w-full rounded border px-3 py-2 dark:bg-gray-900"
          value={providerId}
          onChange={(e) => setProviderId(e.target.value)}
          disabled={loading || providersLoading}
        >
          <option value="">No provider selected</option>
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.businessName}
              {provider.address && ` - ${provider.address}`}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          {providersLoading 
            ? "Loading providers..." 
            : "Select a service provider for your event (catering, entertainment, etc.)"}
        </p>
      </div>

      <ShimmerButton
        type="submit"
        disabled={loading}
        background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        shimmerColor="#ffffff"
        shimmerDuration="2s"
        borderRadius="8px"
        className="disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {loading ? "Creating…" : "Create Event"}
      </ShimmerButton>

      {ok && <div className="text-green-600 text-sm">{ok}</div>}
      {err && <div className="text-red-600 text-sm">{err}</div>}
    </form>
  );
}
