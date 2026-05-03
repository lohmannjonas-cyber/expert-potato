import { notFound } from "next/navigation";
import { AlertTriangle, ExternalLink, Waves, Wind } from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { RatingCard } from "@/components/RatingCard";
import { getSpotWithForecast } from "@/lib/rankings";
import { regionLabel } from "@/lib/i18n";

export default async function SpotDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getSpotWithForecast(slug);
  if (!data) notFound();

  const { spot, ratings } = data;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="text-sm font-black uppercase tracking-normal text-lagoon">{regionLabel(spot.region, "de")}</p>
          <h1 className="mt-1 text-4xl font-black text-slate-950">{spot.name}</h1>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <span className="rounded-lg border border-slate-200 bg-white p-4 font-bold shadow-soft">Good wind: {spot.suitableWindDirections.join(", ")}</span>
            <span className="rounded-lg border border-slate-200 bg-white p-4 font-bold shadow-soft">Unsafe: {spot.offshoreWindDirections.join(", ")}</span>
            <span className="rounded-lg border border-slate-200 bg-white p-4 font-bold shadow-soft">Ideal: {spot.idealMinWindKnots}-{spot.idealMaxWindKnots} kt</span>
          </div>
          <div className="mt-5">
            <FavoriteButton spotId={spot.id} />
          </div>
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="font-black text-slate-950">Spot profile</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="font-bold text-slate-500">Beginner</dt>
              <dd className="font-black">{spot.beginnerFriendly ? "Friendly" : "Advanced caution"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-bold text-slate-500">Water</dt>
              <dd className="font-black">{spot.spotTypes.join(", ")}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-bold text-slate-500">Tide</dt>
              <dd className="font-black">{spot.tideRelevant ? "Relevant" : "Not relevant"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-bold text-slate-500">Thermal</dt>
              <dd className="font-black">{spot.thermalPotential}/3</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="flex items-center gap-2 font-black text-slate-950">
              <Waves size={18} />
              Local notes
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{spot.parkingInfo}</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">{spot.waterDepth}</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">{spot.seasonRestrictions}</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">{spot.dangerNotes.join(" ")}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="flex items-center gap-2 font-black text-slate-950">
              <AlertTriangle size={18} />
              Safety logic
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>Offshore and near-offshore directions are heavily penalized.</li>
              <li>Large gust factors trigger caution or storm warnings.</li>
              <li>Cold air, rain, tide relevance, and restrictions reduce the score.</li>
              <li>Beginner filters penalize spots without forgiving launch and rescue conditions.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="flex items-center gap-2 font-black text-slate-950">
              <ExternalLink size={18} />
              Links
            </h2>
            <div className="mt-3 space-y-2 text-sm font-bold text-lagoon">
              {spot.webcamUrl ? <a href={spot.webcamUrl}>Webcam</a> : <p className="text-slate-500">No webcam stored yet.</p>}
              {spot.localInfoUrl ? <a className="block" href={spot.localInfoUrl}>Local info</a> : null}
            </div>
          </div>
        </aside>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-black text-slate-950">
            <Wind size={22} />
            Forecast ratings
          </h2>
          <div className="grid gap-4">
            {ratings.map((rating, index) => (
              <RatingCard key={`${rating.spot.id}-${rating.windowStart.toISOString()}`} rating={rating} rank={index + 1} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
