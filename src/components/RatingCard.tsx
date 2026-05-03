import Link from "next/link";
import { AlertTriangle, ArrowRight, CloudRain, Navigation, ThermometerSun, Wind } from "lucide-react";
import { ScoreBadge } from "@/components/ScoreBadge";
import { regionLabel, type Locale } from "@/lib/i18n";
import { compassToDegrees } from "@/lib/wind";
import type { SpotRatingResult } from "@/lib/scoring";

function windTone(knots: number) {
  if (knots < 10) return "bg-slate-100 text-slate-600 ring-slate-200";
  if (knots < 15) return "bg-amber-50 text-amber-800 ring-amber-200";
  if (knots <= 25) return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  if (knots <= 32) return "bg-orange-50 text-orange-800 ring-orange-200";
  return "bg-red-50 text-red-800 ring-red-200";
}

function temperatureTone(celsius: number) {
  if (celsius < 5) return "bg-sky-100 text-sky-900 ring-sky-200";
  if (celsius < 10) return "bg-cyan-50 text-cyan-800 ring-cyan-200";
  if (celsius < 18) return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  if (celsius < 26) return "bg-yellow-50 text-yellow-800 ring-yellow-200";
  return "bg-orange-50 text-orange-800 ring-orange-200";
}

function rainTone(mm: number) {
  if (mm <= 0.5) return "bg-slate-50 text-slate-700 ring-slate-200";
  if (mm <= 2) return "bg-sky-50 text-sky-800 ring-sky-200";
  return "bg-blue-100 text-blue-900 ring-blue-200";
}

function metricClass(tone: string) {
  return `flex items-center gap-2 rounded-md px-3 py-2 font-semibold ring-1 ${tone}`;
}

export function RatingCard({ rating, rank, locale = "de" }: { rating: SpotRatingResult; rank?: number; locale?: Locale }) {
  const wind = rating.meta.averageWindKnots;
  const temp = rating.meta.averageTemperatureC;
  const rain = rating.meta.totalRainMm;
  const directionDegrees = compassToDegrees(rating.meta.dominantDirection);
  const windLabel = locale === "de" ? "kt Ø" : "kt avg";

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex items-start gap-4">
        <ScoreBadge score={rating.score} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {rank ? <span className="text-sm font-black text-slate-500">#{rank}</span> : null}
            <Link href={`/spots/${rating.spot.slug}`} className="text-lg font-black text-slate-950 hover:text-lagoon">
              {rating.spot.name}
            </Link>
            <span className="rounded-md bg-sandbar px-2 py-1 text-xs font-bold text-slate-800">{regionLabel(rating.spot.region, locale)}</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-700">{rating.explanation}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-4">
        <span className={metricClass(windTone(wind))} title="Wind: gray too light, green ideal, orange strong, red stormy">
          <Wind size={16} />
          {wind} {windLabel}
        </span>
        <span className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 font-semibold text-slate-700 ring-1 ring-slate-200">
          <Navigation
            size={16}
            className="text-lagoon"
            style={{ transform: `rotate(${Number.isFinite(directionDegrees) ? directionDegrees : 0}deg)` }}
          />
          {rating.meta.dominantDirection}
        </span>
        <span className={metricClass(temperatureTone(temp))} title="Temperature: blue cold, green comfortable, yellow warm">
          <ThermometerSun size={16} />
          {temp} C
        </span>
        <span className={metricClass(rainTone(rain))}>
          <CloudRain size={16} />
          {rain} mm
        </span>
      </div>

      {rating.riskWarnings.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {rating.riskWarnings.slice(0, 3).map((warning) => (
            <span key={warning} className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-xs font-bold text-orange-800">
              <AlertTriangle size={13} />
              {warning}
            </span>
          ))}
        </div>
      ) : null}

      <Link href={`/spots/${rating.spot.slug}`} className="mt-4 inline-flex items-center gap-2 text-sm font-black text-lagoon hover:text-current">
        Spot details
        <ArrowRight size={16} />
      </Link>
    </article>
  );
}
