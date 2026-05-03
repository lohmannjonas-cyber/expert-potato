import { NextResponse } from "next/server";
import { getRankingsForDate, type RankingFilters } from "@/lib/rankings";
import { parseDateInput } from "@/lib/dates";

function bool(value: string | null) {
  return value === "true" || value === "1" || value === "on";
}

function num(value: string | null) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = parseDateInput(searchParams.get("date"));
  const filters: RankingFilters = {
    region: searchParams.get("region") || undefined,
    dateType: bool(searchParams.get("weekendOnly")) ? "WEEKEND" : bool(searchParams.get("weekdayOnly")) ? "WEEKDAY" : "ANY",
    beginnerOnly: bool(searchParams.get("beginnerOnly")),
    flatWaterOnly: bool(searchParams.get("flatWaterOnly")),
    waveOnly: bool(searchParams.get("waveOnly")),
    avoidRain: bool(searchParams.get("avoidRain")),
    avoidOffshoreWind: bool(searchParams.get("avoidOffshoreWind")),
    preferredDirection: searchParams.get("preferredDirection") || undefined,
    minWindSpeed: num(searchParams.get("minWindSpeed")),
    maxWindSpeed: num(searchParams.get("maxWindSpeed")),
    maxTravelKm: num(searchParams.get("maxTravelKm")),
    homeLat: num(searchParams.get("homeLat")),
    homeLon: num(searchParams.get("homeLon")),
    temperatureMinimum: num(searchParams.get("temperatureMinimum"))
  };

  const rankings = await getRankingsForDate(date, filters);
  return NextResponse.json({ date: date.toISOString(), count: rankings.length, rankings });
}
