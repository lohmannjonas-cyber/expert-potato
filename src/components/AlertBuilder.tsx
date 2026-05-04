"use client";

import { useState } from "react";
import { regionLabel } from "@/lib/i18n";
import { COMPASS_DIRECTIONS } from "@/lib/wind";
import type { KiteSpotInput } from "@/lib/scoring";

const regions = ["Baltic Sea", "North Sea", "Lakes", "South Germany"];

export function AlertBuilder({ spots }: { spots: KiteSpotInput[] }) {
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setMessage("");
    const selectedSpotIds = formData.get("spotId") ? [String(formData.get("spotId"))] : [];
    const windDirections = formData.get("windDirection") ? [String(formData.get("windDirection"))] : [];

    const response = await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        selectedSpotIds,
        windDirections,
        minWindKnots: Number(formData.get("minWindKnots")) || null,
        maxWindKnots: Number(formData.get("maxWindKnots")) || null,
        maxGustKnots: Number(formData.get("maxGustKnots")) || null,
        dateType: formData.get("dateType"),
        minTemperatureC: Number(formData.get("minTemperatureC")) || null,
        maxRainMm: Number(formData.get("maxRainMm")) || null,
        region: formData.get("region") || null,
        maxTravelKm: Number(formData.get("maxTravelKm")) || null,
        beginnerOnly: formData.get("beginnerOnly") === "on",
        flatWaterOnly: formData.get("flatWaterOnly") === "on"
      })
    });

    setMessage(response.ok ? "Alarm gespeichert." : "Bitte zuerst anmelden, dann den Alarm speichern.");
  }

  return (
    <form action={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="text-sm font-bold text-slate-700">
          Alarmname
          <input name="name" required placeholder="Berlin Wochenende 15-25 kt" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-bold text-slate-700">
          Spot
          <select name="spotId" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
            <option value="">Alle Spots</option>
            {spots.map((spot) => (
              <option key={spot.id} value={spot.id}>
                {spot.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-bold text-slate-700">
          Region
          <select name="region" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
            <option value="">Alle Regionen</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {regionLabel(region, "de")}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-bold text-slate-700">
          Wind aus
          <select name="windDirection" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
            <option value="">Egal</option>
            {COMPASS_DIRECTIONS.map((direction) => (
              <option key={direction}>{direction}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-bold text-slate-700">
          Min. Wind
          <input name="minWindKnots" type="number" placeholder="15" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-bold text-slate-700">
          Max. Wind
          <input name="maxWindKnots" type="number" placeholder="25" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-bold text-slate-700">
          Max. Boeen
          <input name="maxGustKnots" type="number" placeholder="35" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-bold text-slate-700">
          Tagestyp
          <select name="dateType" defaultValue="ANY" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
            <option value="ANY">Jeder Tag</option>
            <option value="WEEKDAY">Wochentag</option>
            <option value="WEEKEND">Wochenende</option>
          </select>
        </label>
        <label className="text-sm font-bold text-slate-700">
          Max. Regen
          <input name="maxRainMm" type="number" step="0.1" placeholder="1.5" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-bold text-slate-700">
          Min. Temperatur
          <input name="minTemperatureC" type="number" placeholder="8" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-bold text-slate-700">
          Max. Anfahrt km
          <input name="maxTravelKm" type="number" placeholder="250" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-slate-700">
        <label className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2">
          <input name="beginnerOnly" type="checkbox" /> Einsteigerfreundlich
        </label>
        <label className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2">
          <input name="flatWaterOnly" type="checkbox" /> Flachwasser
        </label>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-600">{message}</p>
        <button className="focus-ring rounded-md bg-lagoon px-5 py-2 font-black text-white hover:bg-current">Alarm speichern</button>
      </div>
    </form>
  );
}
