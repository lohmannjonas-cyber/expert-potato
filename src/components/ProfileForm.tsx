"use client";

import { useState } from "react";

type ProfileFormProps = {
  profile: {
    name: string | null;
    homeLat: number | null;
    homeLon: number | null;
    skillLevel: string;
    preferredMinWind: number;
    preferredMaxWind: number;
    preferredSpotTypes: string[];
  } | null;
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setMessage("");
    const preferredSpotTypes = ["flat", "chop", "wave"].filter((type) => formData.get(type) === "on");
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name") || null,
        homeLat: Number(formData.get("homeLat")) || null,
        homeLon: Number(formData.get("homeLon")) || null,
        skillLevel: formData.get("skillLevel"),
        preferredMinWind: Number(formData.get("preferredMinWind")) || 15,
        preferredMaxWind: Number(formData.get("preferredMaxWind")) || 25,
        preferredSpotTypes
      })
    });

    setMessage(response.ok ? "Profil gespeichert." : "Bitte zuerst anmelden, dann Vorlieben speichern.");
  }

  return (
    <form action={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm font-bold text-slate-700">
          Name
          <input name="name" defaultValue={profile?.name ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-bold text-slate-700">
          Fahrlevel
          <select name="skillLevel" defaultValue={profile?.skillLevel ?? "INTERMEDIATE"} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
            <option value="BEGINNER">Einsteiger</option>
            <option value="INTERMEDIATE">Fortgeschritten</option>
            <option value="ADVANCED">Sehr erfahren</option>
          </select>
        </label>
        <label className="text-sm font-bold text-slate-700">
          Heimatort Breitengrad
          <input name="homeLat" type="number" step="0.0001" defaultValue={profile?.homeLat ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-bold text-slate-700">
          Heimatort Laengengrad
          <input name="homeLon" type="number" step="0.0001" defaultValue={profile?.homeLon ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-bold text-slate-700">
          Bevorzugter Min. Wind
          <input name="preferredMinWind" type="number" defaultValue={profile?.preferredMinWind ?? 15} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-bold text-slate-700">
          Bevorzugter Max. Wind
          <input name="preferredMaxWind" type="number" defaultValue={profile?.preferredMaxWind ?? 25} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-slate-700">
        {[
          ["flat", "Flachwasser"],
          ["chop", "Kabbelwasser"],
          ["wave", "Welle"]
        ].map(([type, label]) => (
          <label key={type} className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 capitalize">
            <input name={type} type="checkbox" defaultChecked={profile?.preferredSpotTypes.includes(type)} /> {label}
          </label>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-600">{message}</p>
        <button className="focus-ring rounded-md bg-lagoon px-5 py-2 font-black text-white hover:bg-current">Profil speichern</button>
      </div>
    </form>
  );
}
