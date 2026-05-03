import { addDays, startOfDay } from "date-fns";
import { demoSpots, generateDemoForecast } from "@/lib/demo-data";
import { dateKey, nextSaturday, nextWeekday, parseDateInput } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { type ForecastHour, type KiteSpotInput, type RatingPreferences, rateSpotForDate } from "@/lib/scoring";
import { loadActiveScoringWeights } from "@/lib/scoring-rules";
import { activeWeatherSource, fetchForecastForSpot } from "@/lib/weather";

export type RankingFilters = RatingPreferences & {
  date?: string;
  region?: string;
  minWindSpeed?: number;
  maxWindSpeed?: number;
  temperatureMinimum?: number;
};

function toSpotInput(spot: KiteSpotInput): KiteSpotInput {
  return {
    id: spot.id,
    slug: spot.slug,
    name: spot.name,
    region: spot.region,
    latitude: spot.latitude,
    longitude: spot.longitude,
    suitableWindDirections: spot.suitableWindDirections,
    offshoreWindDirections: spot.offshoreWindDirections,
    idealMinWindKnots: spot.idealMinWindKnots,
    idealMaxWindKnots: spot.idealMaxWindKnots,
    beginnerFriendly: spot.beginnerFriendly,
    spotTypes: spot.spotTypes,
    tideRelevant: spot.tideRelevant,
    thermalPotential: spot.thermalPotential,
    parkingInfo: spot.parkingInfo,
    waterDepth: spot.waterDepth,
    seasonRestrictions: spot.seasonRestrictions,
    dangerNotes: spot.dangerNotes,
    webcamUrl: spot.webcamUrl,
    localInfoUrl: spot.localInfoUrl,
    adminNotes: spot.adminNotes,
    restricted: spot.restricted
  };
}

async function loadSpots(region?: string): Promise<KiteSpotInput[]> {
  try {
    const spots = await prisma.kiteSpot.findMany({
      where: region ? { region } : undefined,
      orderBy: [{ region: "asc" }, { name: "asc" }]
    });
    return spots.map(toSpotInput);
  } catch {
    return demoSpots.filter((spot) => !region || spot.region === region);
  }
}

async function loadForecasts(spots: KiteSpotInput[], date: Date): Promise<Map<string, ForecastHour[]>> {
  const from = startOfDay(date);
  const to = addDays(from, 1);

  try {
    const rows = await prisma.forecastData.findMany({
      where: {
        spotId: { in: spots.map((spot) => spot.id) },
        source: activeWeatherSource(),
        forecastTime: {
          gte: from,
          lt: to
        }
      },
      orderBy: { forecastTime: "asc" }
    });

    if (rows.length) {
      const grouped = new Map<string, ForecastHour[]>();
      for (const row of rows) {
        const list = grouped.get(row.spotId) ?? [];
        list.push({
          forecastTime: row.forecastTime,
          windSpeedKnots: row.windSpeedKnots,
          gustKnots: row.gustKnots,
          windDirectionDegrees: row.windDirectionDegrees,
          windDirectionCompass: row.windDirectionCompass,
          temperatureC: row.temperatureC,
          precipitationMm: row.precipitationMm,
          cloudCoverPercent: row.cloudCoverPercent,
          weatherWarnings: row.weatherWarnings
        });
        grouped.set(row.spotId, list);
      }
      for (const spot of spots) {
        if (!grouped.has(spot.id)) {
          grouped.set(spot.id, await loadLiveForecastFallback(spot, date));
        }
      }
      return grouped;
    }
  } catch {
    // If Postgres is not configured, the UI can still rank live Open-Meteo data.
  }

  const liveForecasts = await Promise.all(spots.map(async (spot) => [spot.id, await loadLiveForecastFallback(spot, date)] as const));
  return new Map(liveForecasts);
}

async function loadLiveForecastFallback(spot: KiteSpotInput, date: Date): Promise<ForecastHour[]> {
  try {
    const today = startOfDay(new Date());
    const requested = startOfDay(date);
    const dayOffset = Math.max(0, Math.ceil((requested.getTime() - today.getTime()) / 86_400_000));
    const forecast = await fetchForecastForSpot(spot, Math.min(16, Math.max(1, dayOffset + 1)));
    return forecast.length ? forecast : generateDemoForecast(spot, date, 1);
  } catch {
    return generateDemoForecast(spot, date, 1);
  }
}

function passesFilters(result: NonNullable<ReturnType<typeof rateSpotForDate>>, filters: RankingFilters) {
  if (filters.beginnerOnly && !result.spot.beginnerFriendly) return false;
  if (filters.flatWaterOnly && !result.spot.spotTypes.includes("flat")) return false;
  if (filters.waveOnly && !result.spot.spotTypes.includes("wave")) return false;
  if (filters.minWindSpeed && result.meta.averageWindKnots < filters.minWindSpeed) return false;
  if (filters.maxWindSpeed && result.meta.averageWindKnots > filters.maxWindSpeed) return false;
  if (filters.temperatureMinimum && result.meta.averageTemperatureC < filters.temperatureMinimum) return false;
  if (filters.avoidRain && result.meta.totalRainMm > 0.5) return false;
  if (filters.avoidOffshoreWind && result.riskWarnings.some((warning) => warning.toLowerCase().includes("offshore"))) return false;
  if (filters.maxTravelKm && result.meta.distanceKm !== undefined && result.meta.distanceKm > filters.maxTravelKm) return false;
  return true;
}

export async function getRankingsForDate(date: Date, filters: RankingFilters = {}) {
  const spots = await loadSpots(filters.region);
  const forecastMap = await loadForecasts(spots, date);
  const scoringWeights = await loadActiveScoringWeights();
  const preferences = { ...filters, scoringWeights };

  return spots
    .map((spot) => rateSpotForDate(spot, forecastMap.get(spot.id) ?? [], date, preferences))
    .filter((result): result is NonNullable<typeof result> => Boolean(result))
    .filter((result) => passesFilters(result, filters))
    .sort((a, b) => b.score - a.score);
}

export async function getDashboardData(preferences: RankingFilters = {}) {
  const tomorrowDate = parseDateInput(dateKey(addDays(new Date(), 1)));
  const weekendDate = nextSaturday();
  const weekdayDate = nextWeekday();

  const [tomorrow, weekend, weekday] = await Promise.all([
    getRankingsForDate(tomorrowDate, preferences),
    getRankingsForDate(weekendDate, { ...preferences, dateType: "WEEKEND" }),
    getRankingsForDate(weekdayDate, { ...preferences, dateType: "WEEKDAY" })
  ]);

  return {
    tomorrow: tomorrow.slice(0, 10),
    weekend: weekend.slice(0, 10),
    weekday: weekday.slice(0, 10)
  };
}

export async function getSpotWithForecast(slug: string) {
  const spots = await loadSpots();
  const spot = spots.find((candidate) => candidate.slug === slug);
  if (!spot) return null;

  const days = Array.from({ length: 7 }, (_, index) => addDays(new Date(), index));
  const rankings = await Promise.all(days.map((day) => getRankingsForDate(day, {})));
  const spotRatings = rankings
    .flat()
    .filter((rating) => rating.spot.slug === slug)
    .sort((a, b) => a.windowStart.getTime() - b.windowStart.getTime());

  return { spot, ratings: spotRatings };
}

export async function getAllSpots() {
  return loadSpots();
}
