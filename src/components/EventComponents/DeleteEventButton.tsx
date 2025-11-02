/**
 * DeleteEventButton
 * ----------------------------------------------------------------------------
 *   Small inline button that allows a Host to delete an event
 *   they own from the /events page.
 *
 *   - Uses browser-only APIs: window.confirm(), window.location.reload()
 *   - Uses React state (loading/status feedback)
 *   - Performs a fetch() call from the browser
 *
 *   - Prompts with a confirmation dialog before sending request
 *   - Shows a temporary "Deleting…" label while request is in-flight
 *   - Disables the button to prevent double submits
 *   - Displays a tiny inline error message if the request fails
 *   - Reloads page on success so the event disappears from the list
 */

"use client";

import { useState } from "react";

export default function DeleteEventButton({ id }: { id: string }) {
  // Checks if a deletion attempt is currently happening
  const [loading, setLoading] = useState(false);
   // Stores any error message returned
  const [error, setError] = useState<string | null>(null);

  // When the user clicks the Delete button
  // Prompt for confirmation, thhen send request
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setLoading(true);
    setError(null);
    try {
      // Send deletion request to the server API
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      // Check for errors
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Delete failed");
      }
      // Reload page so that the deleted event disappears from the UI
      window.location.reload();
    } catch (e: any) {
      setError(e.message);
    } finally {
      // Re-enable button and stop spinner
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
      >
        {loading ? "Deleting…" : "Delete"}
      </button>
      {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
    </div>
  );
}
