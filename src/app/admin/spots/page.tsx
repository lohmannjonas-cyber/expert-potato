import { AdminSpotList } from "@/components/AdminSpotList";
import { AdminSpotForm } from "@/components/AdminSpotForm";
import { ScoringRulesForm } from "@/components/ScoringRulesForm";
import { defaultScoringRules } from "@/data/kite-spots";
import { getAllSpots } from "@/lib/rankings";
import { prisma } from "@/lib/prisma";

export default async function AdminSpotsPage() {
  const spots = await getAllSpots();
  let rules: Array<{ id: string; key: string; label: string; weight: number; settings: unknown; active: boolean }> = defaultScoringRules.map((rule) => ({
    id: rule.key,
    key: rule.key,
    label: rule.label,
    weight: rule.weight,
    settings: rule.settings,
    active: true
  }));

  try {
    const storedRules = await prisma.scoringRule.findMany({ orderBy: { key: "asc" } });
    if (storedRules.length) {
      rules = storedRules;
    }
  } catch {
    rules = defaultScoringRules.map((rule) => ({
      id: rule.key,
      key: rule.key,
      label: rule.label,
      weight: rule.weight,
      settings: rule.settings,
      active: true
    }));
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-normal text-lagoon">Admin</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">Spot management</h1>
      </div>

      <AdminSpotForm />

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_380px]">
        <AdminSpotList spots={spots} />
        <ScoringRulesForm rules={rules} />
      </section>
    </main>
  );
}
