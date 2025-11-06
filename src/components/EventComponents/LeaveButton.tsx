"use client";

import { useState } from "react";

export default function LeaveButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  async function leave() {
    setLoading(true);
    await fetch(`/api/events/${id}/join`, { method: "DELETE" });
    window.location.reload();
  }

  return (
    <button
      onClick={leave}
      disabled={loading}
      className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
    >
      {loading ? "Leaving…" : "Leave"}
    </button>
  );
}
