import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Bell, CalendarDays, Gauge, Map, ShieldCheck, SlidersHorizontal, User, Waves } from "lucide-react";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { defaultLocale } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "KiteSpot Radar Germany",
  description: "Rank German kitesurfing spots by interpreted wind, weather, safety, and rider preferences."
};

const navigation = [
  { href: "/", label: "Dashboard", icon: Gauge },
  { href: "/rankings", label: "Rankings", icon: SlidersHorizontal },
  { href: "/map", label: "Karte", icon: Map },
  { href: "/calendar", label: "Kalender", icon: CalendarDays },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/profile", label: "Profil", icon: User },
  { href: "/admin/spots", label: "Admin", icon: ShieldCheck }
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-lagoon text-white">
                <Waves size={22} />
              </span>
              <span>
                <span className="block text-lg font-black tracking-normal">KiteSpot Radar Germany</span>
                <span className="block text-sm text-slate-600">Vorhersagen werden zu Kite-Entscheidungen</span>
              </span>
            </Link>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <nav className="flex gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="focus-ring flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <Icon size={16} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <Suspense fallback={null}>
                <LanguageSwitch locale={defaultLocale} />
              </Suspense>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
