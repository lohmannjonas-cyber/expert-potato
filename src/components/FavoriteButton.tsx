"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export function FavoriteButton({ spotId }: { spotId: string }) {
  const [message, setMessage] = useState("");

  async function saveFavorite() {
    setMessage("");
    const response = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spotId })
    });
    setMessage(response.ok ? "Als Favorit gespeichert." : "Melde dich an, um diesen Spot zu speichern.");
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={saveFavorite}
        className="focus-ring inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 font-black text-slate-800 hover:bg-slate-50"
      >
        <Star size={17} />
        Favorit
      </button>
      <span className="text-sm font-semibold text-slate-600">{message}</span>
    </div>
  );
}
