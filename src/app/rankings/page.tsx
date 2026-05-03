import { addDays, format } from "date-fns";
import { FilterBar } from "@/components/FilterBar";
import { RatingCard } from "@/components/RatingCard";
import { getRankingsForDate } from "@/lib/rankings";
import { parseDateInput } from "@/lib/dates";
import { parseRankingFilters, textParam } from "@/lib/filter-params";
import { dictionary, getLocale } from "@/lib/i18n";

export default async function RankingsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const locale = getLocale(params.lang);
  const t = dictionary[locale].filters;
  const date = parseDateInput(textParam(params.date));
  const filters = parseRankingFilters(params, { avoidOffshoreWind: true });
  const rankings = await getRankingsForDate(date, filters);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-normal text-lagoon">Spot ranking</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950">Best kite windows for {format(date, "EEEE, dd MMM")}</h1>
        </div>
        <p className="text-sm font-bold text-slate-600">{rankings.length} spots matched</p>
      </div>

      <FilterBar
        defaultDate={format(addDays(new Date(), 1), "yyyy-MM-dd")}
        submitLabel={t.updateRankings}
        locale={locale}
        values={{ ...filters, date: format(date, "yyyy-MM-dd") }}
      />

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {rankings.map((rating, index) => (
          <RatingCard key={`${rating.spot.id}-${rating.windowStart.toISOString()}`} rating={rating} rank={index + 1} />
        ))}
      </section>
    </main>
  );
}
