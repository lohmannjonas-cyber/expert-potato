import Link from "next/link";
import { AlertTriangle, ArrowRight, CloudRain, Compass, ThermometerSun, Wind } from "lucide-react";
import { ScoreBadge } from "@/components/ScoreBadge";
import type { SpotRatingResult } from "@/lib/scoring";

export function RatingCard({ rating, rank }: { rating: SpotRatingResult; rank?: number }) {
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
            <span className="rounded-md bg-sandbar px-2 py-1 text-xs font-bold text-slate-800">{rating.spot.region}</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-700">{rating.explanation}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-4">
        <span className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 font-semibold text-slate-700">
          <Wind size={16} />
          {rating.meta.averageWindKnots} kt avg
        </span>
        <span className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 font-semibold text-slate-700">
          <Compass size={16} />
          {rating.meta.dominantDirection}
        </span>
        <span className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 font-semibold text-slate-700">
          <ThermometerSun size={16} />
          {rating.meta.averageTemperatureC} C
        </span>
        <span className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 font-semibold text-slate-700">
          <CloudRain size={16} />
          {rating.meta.totalRainMm} mm
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
