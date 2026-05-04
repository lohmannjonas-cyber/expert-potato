"use client";

import { useState } from "react";

export function AdminSpotForm() {
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setMessage("");
    const payload = {
      slug: String(formData.get("slug")),
      name: String(formData.get("name")),
      region: String(formData.get("region")),
      latitude: Number(formData.get("latitude")),
      longitude: Number(formData.get("longitude")),
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
      spotTypes: String(formData.get("spotTypes") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      tideRelevant: formData.get("tideRelevant") === "on",
      thermalPotential: Number(formData.get("thermalPotential")),
      parkingInfo: String(formData.get("parkingInfo") ?? ""),
      waterDepth: String(formData.get("waterDepth") ?? ""),
      seasonRestrictions: String(formData.get("seasonRestrictions") ?? ""),
      dangerNotes: String(formData.get("dangerNotes") ?? "")
        .split(";")
        .map((value) => value.trim())
        .filter(Boolean),
      restricted: formData.get("restricted") === "on",
      adminNotes: String(formData.get("adminNotes") ?? "")
    };

    const response = await fetch("/api/spots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setMessage(response.ok ? "Spot erstellt." : "Admin-Anmeldung ist zum Speichern erforderlich.");
  }

  return (
    <form action={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="text-sm font-bold text-slate-700">
          Spotname
          <input name="name" required placeholder="Fehmarn Gold" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-bold text-slate-700">
          URL slug
          <input name="slug" required placeholder="fehmarn-gold" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-bold text-slate-700">
          Region
          <select name="region" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
            <option>Baltic Sea</option>
            <option>North Sea</option>
            <option>Lakes</option>
            <option>South Germany</option>
          </select>
        </label>
        <label className="text-sm font-bold text-slate-700">
          Breitengrad
          <input name="latitude" required type="number" step="0.0001" placeholder="54.4112" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-bold text-slate-700">
          Laengengrad
          <input name="longitude" required type="number" step="0.0001" placeholder="11.0497" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-bold text-slate-700">
          Wassertyp
          <input name="spotTypes" placeholder="flat, chop" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-bold text-slate-700">
          Gute Windrichtungen
          <input name="suitableWindDirections" placeholder="SW, WSW, W" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-bold text-slate-700">
          Offshore-Richtungen
          <input name="offshoreWindDirections" placeholder="E, ENE, NE" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-bold text-slate-700">
          Thermikpotenzial, 0-3
          <input name="thermalPotential" type="number" min="0" max="3" defaultValue="1" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-bold text-slate-700">
          Idealer Min. Wind, Knoten
          <input name="idealMinWindKnots" type="number" defaultValue="15" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-bold text-slate-700">
          Idealer Max. Wind, Knoten
          <input name="idealMaxWindKnots" type="number" defaultValue="25" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-bold text-slate-700">
          Parkinfos
          <input name="parkingInfo" placeholder="Paid lot near launch" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-bold text-slate-700">
          Wassertiefe
          <input name="waterDepth" placeholder="Large standing area" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-bold text-slate-700">
          Saisonregeln
          <input name="seasonRestrictions" placeholder="Badezonen im Sommer beachten" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-bold text-slate-700">
          Gefahrenhinweise
          <input name="dangerNotes" placeholder="Hinweise mit ; trennen" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
      </div>
      <label className="mt-3 block text-sm font-bold text-slate-700">
        Admin-Notizen
        <textarea name="adminNotes" placeholder="Interne Notizen fuer diesen Spot" className="mt-1 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2" />
      </label>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-700">
          <label className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2">
            <input name="beginnerFriendly" type="checkbox" /> Einsteigerfreundlich
          </label>
          <label className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2">
            <input name="tideRelevant" type="checkbox" /> Tide relevant
          </label>
          <label className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2">
            <input name="restricted" type="checkbox" /> Eingeschraenkt
          </label>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-600">{message}</span>
          <button className="focus-ring rounded-md bg-lagoon px-5 py-2 font-black text-white hover:bg-current">Spot hinzufuegen</button>
        </div>
      </div>
    </form>
  );
}
