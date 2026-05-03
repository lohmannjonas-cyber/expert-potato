import { prisma } from "@/lib/prisma";
import type { RatingPreferences } from "@/lib/scoring";

export async function loadActiveScoringWeights(): Promise<RatingPreferences["scoringWeights"]> {
  try {
    const rules = await prisma.scoringRule.findMany({ where: { active: true } });
    if (!rules.length) return undefined;
    return Object.fromEntries(rules.map((rule) => [rule.key, rule.weight])) as RatingPreferences["scoringWeights"];
  } catch {
    return undefined;
  }
}
