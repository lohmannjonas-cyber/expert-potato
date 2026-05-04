import { addDays, format } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";
import { getRankingsForDate } from "@/lib/rankings";

export default async function CalendarPage() {
  const days = await Promise.all(
    Array.from({ length: 7 }, async (_, index) => {
      const date = addDays(new Date(), index);
      const rankings = await getRankingsForDate(date, { avoidOffshoreWind: true, language: "de" });
      return { date, rankings: rankings.slice(0, 4) };
    })
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-normal text-lagoon">Vorhersagekalender</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">Sieben-Tage-Scan fuer Kite-Fenster</h1>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {days.map((day) => (
          <article key={day.date.toISOString()} className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
            <h2 className="text-lg font-black text-slate-950">{format(day.date, "EEE dd MMM", { locale: de })}</h2>
            <div className="mt-4 space-y-3">
              {day.rankings.map((rating, index) => (
                <Link key={rating.spot.id} href={`/spots/${rating.spot.slug}`} className="block rounded-md bg-slate-50 p-3 hover:bg-sandbar">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-black">
                      {index + 1}. {rating.spot.name}
                    </span>
                    <span className="rounded-md bg-lagoon px-2 py-1 text-sm font-black text-white">{rating.score}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {rating.bestTimeWindow}, {rating.meta.dominantDirection} {rating.meta.averageWindKnots} kt
                  </p>
                </Link>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
