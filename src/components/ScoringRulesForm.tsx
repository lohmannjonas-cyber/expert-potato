"use client";

import { useState } from "react";

type Rule = {
  id: string;
  key: string;
  label: string;
  weight: number;
  settings: unknown;
  active: boolean;
};

export function ScoringRulesForm({ rules }: { rules: Rule[] }) {
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setMessage("");
    const payload = rules.map((rule) => ({
      key: rule.key,
      label: rule.label,
      weight: Number(formData.get(rule.key)) || rule.weight,
      settings: typeof rule.settings === "object" && rule.settings !== null ? rule.settings : {},
      active: formData.get(`${rule.key}:active`) === "on"
    }));

    const response = await fetch("/api/admin/scoring-rules", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rules: payload })
    });

    setMessage(response.ok ? "Weights saved." : "Admin sign-in is required.");
  }

  return (
    <form action={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-black text-slate-950">Scoring weights</h2>
        <span className="text-sm font-semibold text-slate-600">{message}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Higher numbers make that factor matter more in the 0-100 score. Saving these weights needs the database to be running.
      </p>
      <div className="mt-4 space-y-3">
        {rules.map((rule) => (
          <label key={rule.id} className="grid grid-cols-[1fr_86px] items-center gap-3 rounded-md bg-slate-50 p-3 text-sm font-bold text-slate-700">
            <span>{rule.label}</span>
            <input name={rule.key} type="number" step="0.5" defaultValue={rule.weight} className="rounded-md border border-slate-300 px-2 py-1" />
            <span className="col-span-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <input name={`${rule.key}:active`} type="checkbox" defaultChecked={rule.active} /> Active
            </span>
          </label>
        ))}
      </div>
      <button className="focus-ring mt-4 w-full rounded-md bg-lagoon px-4 py-2 font-black text-white hover:bg-current">Save weights</button>
    </form>
  );
}
