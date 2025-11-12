"use client";

import { useState } from "react";

export default function JoinButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  async function join() {
    setLoading(true);
    await fetch(`/api/events/${id}/join`, { method: "POST" });
    window.location.reload();
  }

  return (
    <button
      onClick={join}
      disabled={loading}
      className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
    >
      {loading ? "Joining…" : "Join"}
    </button>
  );
}
