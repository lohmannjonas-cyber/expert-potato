"use client";

import { useState } from "react";
import { regionLabel } from "@/lib/i18n";
import type { KiteSpotInput } from "@/lib/scoring";

export function AdminSpotList({ spots }: { spots: KiteSpotInput[] }) {
  const [items, setItems] = useState(spots);
  const [message, setMessage] = useState("");

  async function updateSpot(id: string, formData: FormData) {
    setMessage("");
    const response = await fetch(`/api/spots/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        suitableWindDirections: String(formData.get("suitableWindDirections") ?? "")
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        offshoreWindDirections: String(formData.get("offshoreWindDirections") ?? "")
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        idealMinWindKnots: Number(formData.get("idealMinWindKnots")),
        idealMaxWindKnots: Number(formData.get("idealMaxWindKnots")),
        beginnerFriendly: formData.get("beginnerFriendly") === "on",
        restricted: formData.get("restricted") === "on",
        adminNotes: formData.get("adminNotes") || null
      })
    });
    setMessage(response.ok ? "Spot updated." : "Admin sign-in is required.");
  }

  async function deleteSpot(id: string) {
    setMessage("");
    const response = await fetch(`/api/spots/${id}`, { method: "DELETE" });
    if (response.ok) {
      setItems((current) => current.filter((spot) => spot.id !== id));
      setMessage("Spot deleted.");
    } else {
      setMessage("Admin sign-in is required.");
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-soft">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4">
        <h2 className="font-black text-slate-950">Kite spots</h2>
        <span className="text-sm font-semibold text-slate-600">{message}</span>
      </div>
      <div className="divide-y divide-slate-200">
        {items.map((spot) => (
          <form key={spot.id} action={(formData) => updateSpot(spot.id, formData)} className="grid gap-3 p-4 xl:grid-cols-[1fr_170px_170px_150px]">
            <div className="space-y-2">
              <input name="name" defaultValue={spot.name} className="w-full rounded-md border border-slate-300 px-3 py-2 font-bold" />
              <input
                name="adminNotes"
                defaultValue={spot.adminNotes ?? ""}
                placeholder="Admin notes"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <p className="text-xs font-bold text-slate-500">{regionLabel(spot.region, "de")}</p>
            </div>
            <label className="text-xs font-bold text-slate-600">
              Good directions
              <input name="suitableWindDirections" defaultValue={spot.suitableWindDirections.join(", ")} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="text-xs font-bold text-slate-600">
              Offshore
              <input name="offshoreWindDirections" defaultValue={spot.offshoreWindDirections.join(", ")} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs font-bold text-slate-600">
                  Min kt
                  <input name="idealMinWindKnots" type="number" defaultValue={spot.idealMinWindKnots} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                </label>
                <label className="text-xs font-bold text-slate-600">
                  Max kt
                  <input name="idealMaxWindKnots" type="number" defaultValue={spot.idealMaxWindKnots} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                </label>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-700">
                <label className="flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1">
                  <input name="beginnerFriendly" type="checkbox" defaultChecked={spot.beginnerFriendly} /> Beginner
                </label>
                <label className="flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1">
                  <input name="restricted" type="checkbox" defaultChecked={spot.restricted} /> Restricted
                </label>
              </div>
              <div className="flex gap-2">
                <button className="focus-ring rounded-md bg-lagoon px-3 py-2 text-sm font-black text-white">Save</button>
                <button
                  type="button"
                  onClick={() => deleteSpot(spot.id)}
                  className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-sm font-black text-slate-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
