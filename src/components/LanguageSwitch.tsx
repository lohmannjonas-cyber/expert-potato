"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n";

function hrefFor(pathname: string, search: URLSearchParams, locale: Locale) {
  const params = new URLSearchParams(search.toString());
  if (locale === "de") {
    params.delete("lang");
  } else {
    params.set("lang", "en");
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function LanguageSwitch({ locale: fallbackLocale }: { locale: Locale }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = searchParams.get("lang") === "en" ? "en" : fallbackLocale;

  return (
    <div className="flex shrink-0 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
      <Link
        href={hrefFor(pathname, searchParams, "de")}
        className={`rounded-md px-3 py-2 text-sm font-black ${locale === "de" ? "bg-lagoon text-white" : "text-slate-700 hover:bg-slate-100"}`}
      >
        DE
      </Link>
      <Link
        href={hrefFor(pathname, searchParams, "en")}
        className={`rounded-md px-3 py-2 text-sm font-black ${locale === "en" ? "bg-lagoon text-white" : "text-slate-700 hover:bg-slate-100"}`}
      >
        EN
      </Link>
    </div>
  );
}
