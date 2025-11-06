"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EditEventForm({ event }: { event: any }) {
  const router = useRouter();
  const [name, setName] = useState(event.name);
  const [desc, setDesc] = useState(event.description ?? "");
  const iso = event.startAt instanceof Date
  ? event.startAt.toISOString()
  : new Date(event.startAt).toISOString();

  const [date, setDate] = useState(iso.substring(0, 10)); // yyyy-mm-dd
  const [time, setTime] = useState(iso.substring(11, 16)); // HH:mm

  const [location, setLocation] = useState(event.location ?? "");
  const [isPrivate, setIsPrivate] = useState(event.private);

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, desc, date, time, location, isPrivate }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErr(data?.error || "Failed to update event.");
      } else {
        setOk("Event updated!");
        router.push("/events");
        router.refresh();
      }
    } catch {
      setErr("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <input
        disabled={loading}
        className="w-full rounded border p-2 dark:bg-gray-900"
        placeholder="Event name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <textarea
        disabled={loading}
        className="w-full rounded border p-2 dark:bg-gray-900"
        placeholder="Description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />

      <input
        type="date"
        disabled={loading}
        className="w-full rounded border p-2 dark:bg-gray-900"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <input
        type="time"
        disabled={loading}
        className="w-full rounded border p-2 dark:bg-gray-900"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />

      <input
        disabled={loading}
        className="w-full rounded border p-2 dark:bg-gray-900"
        placeholder="Location: 102 Spadina Crescent E, Saskatoon, SK"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
        />
        <span>Private event</span>
      </label>

      <button
        disabled={loading}
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>

      {ok && <div className="text-green-600">{ok}</div>}
      {err && <div className="text-red-600">{err}</div>}
    </form>
  );
}
