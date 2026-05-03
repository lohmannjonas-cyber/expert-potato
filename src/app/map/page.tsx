import { getAllSpots } from "@/lib/rankings";
import { SpotMap } from "@/components/SpotMap";

export default async function MapPage() {
  const spots = await getAllSpots();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-normal text-lagoon">Map view</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">German kite spots</h1>
      </div>
      <section className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="min-h-[540px] rounded-lg border border-slate-200 bg-white p-2 shadow-soft">
          <SpotMap spots={spots} />
        </div>
        <aside className="space-y-3">
          {spots.map((spot) => (
            <a key={spot.id} href={`/spots/${spot.slug}`} className="block rounded-lg border border-slate-200 bg-white p-4 shadow-soft hover:border-lagoon">
              <h2 className="font-black text-slate-950">{spot.name}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-600">{spot.region}</p>
              <p className="mt-2 text-sm text-slate-700">Good: {spot.suitableWindDirections.join(", ")}</p>
            </a>
          ))}
        </aside>
      </section>
    </main>
  );
}
