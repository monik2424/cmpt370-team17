"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EventCreateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(""); // yyyy-mm-dd
  const [time, setTime] = useState(""); // HH:MM
  const [isPrivate, setIsPrivate] = useState(true);
  const [tags, setTags] = useState(""); // comma separated
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(null);

    if (!name.trim()) return setErr("Please enter a name.");
    if (!date || !time) return setErr("Please pick a date and time.");

    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 12);

    setLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: desc,
          date,
          time,
          isPrivate,
          tags: tagList,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data?.error || "Failed to create event.");
      } else {
        setOk("Event created!");
        // go back to Events list
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
      <div>
        <label className="block text-sm font-medium mb-1">Event name</label>
        <input
          className="w-full rounded border px-3 py-2 dark:bg-gray-900"
          placeholder="MatikaneBirthday"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          className="w-full rounded border px-3 py-2 dark:bg-gray-900"
          placeholder="Short description…"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={3}
          disabled={loading}
        />
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

      <button
        type="submit"
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Creating…" : "Create Event"}
      </button>

      {ok && <div className="text-green-600 text-sm">{ok}</div>}
      {err && <div className="text-red-600 text-sm">{err}</div>}
    </form>
  );
}
