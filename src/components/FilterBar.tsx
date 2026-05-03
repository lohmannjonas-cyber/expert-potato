"use client";

import { useRef } from "react";
import { COMPASS_DIRECTIONS } from "@/lib/wind";
import type { RankingFilters } from "@/lib/rankings";

const regions = ["Baltic Sea", "North Sea", "Lakes", "South Germany"];

type FilterBarProps = {
  action?: string;
  defaultDate?: string;
  showDate?: boolean;
  submitLabel?: string;
  autoSubmit?: boolean;
  hideSubmit?: boolean;
  values?: RankingFilters & { date?: string };
};

export function FilterBar({
  action = "/rankings",
  defaultDate,
  showDate = true,
  submitLabel = "Update rankings",
  autoSubmit = false,
  hideSubmit = false,
  values
}: FilterBarProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dateValue = values?.date ?? defaultDate;
  const avoidOffshore = values?.avoidOffshoreWind ?? true;

  function scheduleSubmit(target: EventTarget) {
    if (!autoSubmit) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const input = target as HTMLInputElement | HTMLSelectElement;
    const isTypingField = "type" in input && ["number", "text", "date"].includes(input.type);
    const delay = isTypingField ? 550 : 50;

    timeoutRef.current = setTimeout(() => {
      formRef.current?.requestSubmit();
    }, delay);
  }

  return (
    <form
      ref={formRef}
      action={action}
      onChange={(event) => scheduleSubmit(event.target)}
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft"
    >
      <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-6">
        {showDate ? (
          <label className="text-sm font-bold text-slate-700">
            Date
            <input name="date" type="date" defaultValue={dateValue} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
        ) : null}
        <label className="text-sm font-bold text-slate-700">
          Region
          <select name="region" defaultValue={values?.region ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
            <option value="">All Germany</option>
            {regions.map((region) => (
              <option key={region}>{region}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-bold text-slate-700">
          Min wind
          <input
            name="minWindSpeed"
            type="number"
            min="0"
            placeholder="15"
            defaultValue={values?.minWindSpeed ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm font-bold text-slate-700">
          Max wind
          <input
            name="maxWindSpeed"
            type="number"
            min="0"
            placeholder="28"
            defaultValue={values?.maxWindSpeed ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm font-bold text-slate-700">
          Direction
          <select
            name="preferredDirection"
            defaultValue={values?.preferredDirection ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="">Any</option>
            {COMPASS_DIRECTIONS.map((direction) => (
              <option key={direction}>{direction}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-bold text-slate-700">
          Min temp
          <input
            name="temperatureMinimum"
            type="number"
            placeholder="8"
            defaultValue={values?.temperatureMinimum ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-slate-700">
        <label className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2">
          <input type="hidden" name="weekendOnly" value="false" />
          <input type="checkbox" name="weekendOnly" defaultChecked={values?.dateType === "WEEKEND"} /> Weekend
        </label>
        <label className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2">
          <input type="hidden" name="weekdayOnly" value="false" />
          <input type="checkbox" name="weekdayOnly" defaultChecked={values?.dateType === "WEEKDAY"} /> Weekday
        </label>
        <label className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2">
          <input type="hidden" name="beginnerOnly" value="false" />
          <input type="checkbox" name="beginnerOnly" defaultChecked={values?.beginnerOnly} /> Beginner friendly
        </label>
        <label className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2">
          <input type="hidden" name="flatWaterOnly" value="false" />
          <input type="checkbox" name="flatWaterOnly" defaultChecked={values?.flatWaterOnly} /> Flat water
        </label>
        <label className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2">
          <input type="hidden" name="waveOnly" value="false" />
          <input type="checkbox" name="waveOnly" defaultChecked={values?.waveOnly} /> Wave
        </label>
        <label className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2">
          <input type="hidden" name="avoidRain" value="false" />
          <input type="checkbox" name="avoidRain" defaultChecked={values?.avoidRain} /> Avoid rain
        </label>
        <label className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2">
          <input type="hidden" name="avoidOffshoreWind" value="false" />
          <input type="checkbox" name="avoidOffshoreWind" defaultChecked={avoidOffshore} /> Avoid offshore
        </label>
      </div>

      {hideSubmit ? null : (
        <div className="mt-4 flex items-center justify-end gap-3">
          {autoSubmit ? <span className="text-sm font-bold text-slate-500">Applies automatically</span> : null}
          <button className="focus-ring rounded-md bg-lagoon px-5 py-2 font-black text-white hover:bg-current">
            {submitLabel}
          </button>
        </div>
      )}
    </form>
  );
}
