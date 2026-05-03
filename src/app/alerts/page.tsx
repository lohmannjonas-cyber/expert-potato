import { getServerSession } from "next-auth";
import { AlertBuilder } from "@/components/AlertBuilder";
import { authOptions } from "@/lib/auth";
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
        <p className="text-sm font-black uppercase tracking-normal text-lagoon">Email notifications</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">Saved kite alerts</h1>
      </div>
      <AlertBuilder spots={spots} />

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        {alerts.map((alert) => (
          <article key={alert.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-black text-slate-950">{alert.name}</h2>
              <span className={`rounded-md px-2 py-1 text-xs font-black ${alert.enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                {alert.enabled ? "Enabled" : "Paused"}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-700">
              {alert.dateType.toLowerCase()} wind {alert.minWindKnots ?? 0}-{alert.maxWindKnots ?? "any"} kt, gust max {alert.maxGustKnots ?? "any"} kt.
            </p>
          </article>
        ))}
      </section>

      {!session ? (
        <p className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700 shadow-soft">
          Sign in to persist alerts and receive email notifications.
        </p>
      ) : null}
    </main>
  );
}
