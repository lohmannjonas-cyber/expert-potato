import type { RankingFilters } from "@/lib/rankings";
import { regionLabel } from "@/lib/i18n";

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

export function boolParam(value: string | string[] | undefined, fallback = false) {
  if (value === undefined) return fallback;
  const values = Array.isArray(value) ? value : [value];
  return values.some((item) => item === "on" || item === "true" || item === "1");
}

export function textParam(value: string | string[] | undefined) {
  return typeof value === "string" && value.length ? value : undefined;
}

export function numberParam(value: string | string[] | undefined) {
  if (typeof value !== "string" || !value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseRankingFilters(params: SearchParamsRecord, defaults: Partial<RankingFilters> = {}): RankingFilters {
  return {
    region: textParam(params.region),
    dateType: boolParam(params.weekendOnly)
      ? "WEEKEND"
      : boolParam(params.weekdayOnly)
        ? "WEEKDAY"
        : defaults.dateType ?? "ANY",
    beginnerOnly: boolParam(params.beginnerOnly, defaults.beginnerOnly),
    flatWaterOnly: boolParam(params.flatWaterOnly, defaults.flatWaterOnly),
    waveOnly: boolParam(params.waveOnly, defaults.waveOnly),
    avoidRain: boolParam(params.avoidRain, defaults.avoidRain),
    avoidOffshoreWind: boolParam(params.avoidOffshoreWind, defaults.avoidOffshoreWind),
    preferredDirection: textParam(params.preferredDirection),
    minWindSpeed: numberParam(params.minWindSpeed),
    maxWindSpeed: numberParam(params.maxWindSpeed),
    maxTravelKm: numberParam(params.maxTravelKm),
    temperatureMinimum: numberParam(params.temperatureMinimum)
  };
}

export function activeFilterLabels(filters: RankingFilters) {
  const labels: string[] = [];
  const german = filters.language !== "en";
  if (filters.region) labels.push(german ? regionLabel(filters.region, "de") : filters.region);
  if (filters.dateType === "WEEKEND") labels.push(german ? "nur Wochenende" : "weekend only");
  if (filters.dateType === "WEEKDAY") labels.push(german ? "nur Wochentag" : "weekday only");
  if (filters.minWindSpeed) labels.push(german ? `min. ${filters.minWindSpeed} kt` : `min ${filters.minWindSpeed} kt`);
  if (filters.maxWindSpeed) labels.push(german ? `max. ${filters.maxWindSpeed} kt` : `max ${filters.maxWindSpeed} kt`);
  if (filters.preferredDirection) labels.push(german ? `Wind aus ${filters.preferredDirection}` : `${filters.preferredDirection} wind`);
  if (filters.temperatureMinimum) labels.push(german ? `min. ${filters.temperatureMinimum} C` : `min ${filters.temperatureMinimum} C`);
  if (filters.beginnerOnly) labels.push(german ? "einsteigerfreundlich" : "beginner friendly");
  if (filters.flatWaterOnly) labels.push(german ? "Flachwasser" : "flat water");
  if (filters.waveOnly) labels.push(german ? "Wellen-Spots" : "wave spots");
  if (filters.avoidRain) labels.push(german ? "Regen vermeiden" : "avoid rain");
  if (filters.avoidOffshoreWind) labels.push(german ? "Offshore vermeiden" : "avoid offshore");
  return labels;
}

export function queryStringFromParams(params: SearchParamsRecord) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item) query.append(key, item);
      }
    } else if (value) {
      query.set(key, value);
    }
  }
  return query.toString();
}
