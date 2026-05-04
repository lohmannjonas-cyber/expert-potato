import { getServerSession } from "next-auth";
import { AlertBuilder } from "@/components/AlertBuilder";
import { authOptions } from "@/lib/auth";
import { regionLabel } from "@/lib/i18n";
import { getAllSpots } from "@/lib/rankings";
import { prisma } from "@/lib/prisma";

export default async function AlertsPage() {
  const [session, spots] = await Promise.all([getServerSession(authOptions), getAllSpots()]);
  let alerts: Awaited<ReturnType<typeof prisma.userAlert.findMany>> = [];

  if (session?.user?.id) {
    try {
      alerts = await prisma.userAlert.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" }
      });
    } catch {
      alerts = [];
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-normal text-lagoon">E-Mail-Benachrichtigungen</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">Gespeicherte Kite-Alarme</h1>
      </div>
      <AlertBuilder spots={spots} />

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        {alerts.map((alert) => (
          <article key={alert.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-black text-slate-950">{alert.name}</h2>
              <span className={`rounded-md px-2 py-1 text-xs font-black ${alert.enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                {alert.enabled ? "Aktiv" : "Pausiert"}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-700">
              {alert.region ? `${regionLabel(alert.region, "de")}, ` : ""}
              {alert.dateType === "WEEKEND" ? "Wochenende" : alert.dateType === "WEEKDAY" ? "Wochentag" : "jeder Tag"}: Wind{" "}
              {alert.minWindKnots ?? 0}-{alert.maxWindKnots ?? "egal"} kt, Boeen max. {alert.maxGustKnots ?? "egal"} kt.
            </p>
          </article>
        ))}
      </section>

      {!session ? (
        <p className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700 shadow-soft">
          Melde dich an, um Alarme dauerhaft zu speichern und E-Mail-Benachrichtigungen zu erhalten.
        </p>
      ) : null}
    </main>
  );
}
