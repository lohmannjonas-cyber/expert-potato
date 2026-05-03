import Link from "next/link";
import { ArrowRight, Bell } from "lucide-react";
import { format } from "date-fns";
import { FilterBar } from "@/components/FilterBar";
import { RatingCard } from "@/components/RatingCard";
import { getDashboardData } from "@/lib/rankings";
import { activeFilterLabels, parseRankingFilters, queryStringFromParams } from "@/lib/filter-params";
import { dictionary, getLocale } from "@/lib/i18n";

function RankingColumn({
  title,
  subtitle,
  ratings
}: {
  title: string;
  subtitle: string;
  ratings: NonNullable<Awaited<ReturnType<typeof getDashboardData>>["tomorrow"][number]>[];
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white/70 p-4 shadow-soft">
      <div className="mb-4">
        <h2 className="text-xl font-black text-slate-950">{title}</h2>
        <p className="text-sm text-slate-600">{subtitle}</p>
      </div>
      <div className="space-y-4">
        {ratings.slice(0, 3).map((rating, index) => (
          <RatingCard key={`${rating.spot.id}-${rating.windowStart.toISOString()}`} rating={rating} rank={index + 1} />
        ))}
      </div>
    </section>
  );
}

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const locale = getLocale(params.lang);
  const t = dictionary[locale].home;
  const filters = parseRankingFilters(params, { avoidOffshoreWind: true });
  const queryString = queryStringFromParams(params);
  const rankingsHref = queryString ? `/rankings?${queryString}` : "/rankings";
  const activeFilters = activeFilterLabels(filters);
  const data = await getDashboardData(filters);
  const top = data.weekend[0] ?? data.tomorrow[0] ?? data.weekday[0];

  return (
    <main>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-normal text-lagoon">{t.eyebrow}</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-normal text-slate-950 sm:text-5xl">
              KiteSpot Radar Germany
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-700">
              {t.intro}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={rankingsHref} className="focus-ring inline-flex items-center gap-2 rounded-md bg-lagoon px-5 py-3 font-black text-white hover:bg-current">
                {t.openRankings}
                <ArrowRight size={18} />
              </Link>
              <Link href="/alerts" className="focus-ring inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 font-black text-slate-800 hover:bg-slate-50">
                {t.createAlert}
                <Bell size={18} />
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            {top ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black uppercase tracking-normal text-slate-500">{t.currentLead}</p>
                    <h2 className="mt-1 text-2xl font-black text-slate-950">{top.spot.name}</h2>
                  </div>
                  <span className="rounded-lg bg-lagoon px-4 py-3 text-2xl font-black text-white">{top.score}</span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-700">{top.explanation}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <span className="rounded-md bg-white px-3 py-2 text-sm font-bold text-slate-700">{top.meta.averageWindKnots} kt avg</span>
                  <span className="rounded-md bg-white px-3 py-2 text-sm font-bold text-slate-700">{top.meta.dominantDirection}</span>
                  <span className="rounded-md bg-white px-3 py-2 text-sm font-bold text-slate-700">{top.bestTimeWindow}</span>
                </div>
              </>
            ) : (
              <p className="text-slate-700">{t.noData}</p>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-normal text-lagoon">{t.filtersEyebrow}</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">{t.filtersTitle}</h2>
          </div>
          {activeFilters.length ? (
            <Link href="/" className="text-sm font-black text-lagoon hover:text-current">
              {t.clearFilters}
            </Link>
          ) : null}
        </div>
        {activeFilters.length ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {activeFilters.map((label) => (
              <span key={label} className="rounded-md bg-sandbar px-3 py-1 text-sm font-black text-slate-800">
                {label}
              </span>
            ))}
          </div>
        ) : null}
        <FilterBar
          action="/"
          showDate={false}
          submitLabel="Update dashboard"
          autoSubmit
          hideSubmit
          showDayType={false}
          locale={locale}
          values={{ ...filters, date: format(new Date(), "yyyy-MM-dd") }}
        />
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-10 sm:px-6 xl:grid-cols-3 lg:px-8">
        <RankingColumn title={t.weekendTitle} subtitle={t.weekendSubtitle} ratings={data.weekend} />
        <RankingColumn title={t.tomorrowTitle} subtitle={t.tomorrowSubtitle} ratings={data.tomorrow} />
        <RankingColumn title={t.weekdayTitle} subtitle={t.weekdaySubtitle} ratings={data.weekday} />
      </section>
    </main>
  );
}
