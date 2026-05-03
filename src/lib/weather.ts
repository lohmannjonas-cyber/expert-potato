import { addDays, startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import { type ForecastHour, type KiteSpotInput, rateSpotForDate } from "@/lib/scoring";
import { loadActiveScoringWeights } from "@/lib/scoring-rules";
import { degreesToCompass } from "@/lib/wind";

type OpenMeteoResponse = {
  hourly?: {
    time: string[];
    wind_speed_10m?: number[];
    wind_gusts_10m?: number[];
    wind_direction_10m?: number[];
    temperature_2m?: number[];
    precipitation?: number[];
    cloud_cover?: number[];
  };
};

type WindyResponse = {
  ts?: number[];
  units?: Record<string, string | null>;
  "wind_u-surface"?: Array<number | null>;
  "wind_v-surface"?: Array<number | null>;
  "gust-surface"?: Array<number | null>;
  "temp-surface"?: Array<number | null>;
  "past3hprecip-surface"?: Array<number | null>;
  "lclouds-surface"?: Array<number | null>;
  "mclouds-surface"?: Array<number | null>;
  "hclouds-surface"?: Array<number | null>;
};

const WINDY_ENDPOINT = "https://api.windy.com/api/point-forecast/v2";

export function activeWeatherSource() {
  const provider = process.env.WEATHER_PROVIDER?.toLowerCase();
  const windyKey = process.env.WINDY_API_KEY;
  if (provider === "windy" && windyKey) {
    return `windy-${process.env.WINDY_MODEL ?? "iconEu"}`;
  }
  return "open-meteo";
}

function spotSelectToInput(spot: KiteSpotInput): KiteSpotInput {
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

function toKnots(value: number, unit?: string | null) {
  if (!unit || unit === "m*s-1") return value * 1.94384449;
  if (unit === "km*h-1") return value / 1.852;
  if (unit.toLowerCase().includes("kt")) return value;
  return value;
}

function toCelsius(value: number, unit?: string | null) {
  if (!unit || unit === "K") return value - 273.15;
  if (unit === "F") return (value - 32) * (5 / 9);
  return value;
}

function roundMetric(value: number) {
  return Math.round(value * 10) / 10;
}

function windVectorToDirectionDegrees(u: number, v: number) {
  return ((Math.atan2(-u, -v) * 180) / Math.PI + 360) % 360;
}

async function fetchWindyForecastForSpot(spot: KiteSpotInput, forecastDays: number): Promise<ForecastHour[]> {
  const key = process.env.WINDY_API_KEY;
  if (!key) {
    throw new Error("WINDY_API_KEY is required when WEATHER_PROVIDER=windy");
  }

  const model = process.env.WINDY_MODEL ?? "iconEu";
  const response = await fetch(WINDY_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      lat: spot.latitude,
      lon: spot.longitude,
      model,
      parameters: ["wind", "windGust", "temp", "precip", "lclouds", "mclouds", "hclouds"],
      levels: ["surface"],
      key
    }),
    next: { revalidate: 60 * 60 }
  });

  if (!response.ok) {
    throw new Error(`Windy API failed for ${spot.name}: ${response.status}`);
  }

  const data = (await response.json()) as WindyResponse;
  if (!data.ts?.length) return [];

  const units = data.units ?? {};
  const windUnit = units["wind_u-surface"];
  const gustUnit = units["gust-surface"];
  const tempUnit = units["temp-surface"];
  const maxTime = addDays(new Date(), forecastDays).getTime();

  return data.ts
    .map((timestamp, index) => {
      const u = data["wind_u-surface"]?.[index] ?? 0;
      const v = data["wind_v-surface"]?.[index] ?? 0;
      const speed = Math.sqrt(u * u + v * v);
      const directionDegrees = windVectorToDirectionDegrees(u, v);
      const lowClouds = data["lclouds-surface"]?.[index] ?? 0;
      const midClouds = data["mclouds-surface"]?.[index] ?? 0;
      const highClouds = data["hclouds-surface"]?.[index] ?? 0;

      return {
        forecastTime: new Date(timestamp),
        windSpeedKnots: roundMetric(toKnots(speed, windUnit)),
        gustKnots: roundMetric(toKnots(data["gust-surface"]?.[index] ?? speed, gustUnit)),
        windDirectionDegrees: roundMetric(directionDegrees),
        windDirectionCompass: degreesToCompass(directionDegrees),
        temperatureC: roundMetric(toCelsius(data["temp-surface"]?.[index] ?? 273.15, tempUnit)),
        precipitationMm: roundMetric(data["past3hprecip-surface"]?.[index] ?? 0),
        cloudCoverPercent: roundMetric(Math.max(lowClouds, midClouds, highClouds)),
        weatherWarnings: []
      };
    })
    .filter((hour) => hour.forecastTime.getTime() <= maxTime);
}

async function fetchOpenMeteoForecastForSpot(spot: KiteSpotInput, forecastDays = 7): Promise<ForecastHour[]> {
  const apiUrl = process.env.WEATHER_API_URL ?? "https://api.open-meteo.com/v1/forecast";
  const params = new URLSearchParams({
    latitude: String(spot.latitude),
    longitude: String(spot.longitude),
    hourly: [
      "wind_speed_10m",
      "wind_gusts_10m",
      "wind_direction_10m",
      "temperature_2m",
      "precipitation",
      "cloud_cover"
    ].join(","),
    wind_speed_unit: "kn",
    timezone: process.env.WEATHER_TIMEZONE ?? "Europe/Berlin",
    forecast_days: String(forecastDays)
  });

  const response = await fetch(`${apiUrl}?${params.toString()}`, {
    next: { revalidate: 60 * 60 }
  });

  if (!response.ok) {
    throw new Error(`Weather API failed for ${spot.name}: ${response.status}`);
  }

  const data = (await response.json()) as OpenMeteoResponse;
  const hourly = data.hourly;
  if (!hourly?.time?.length) return [];

  return hourly.time.map((time, index) => {
    const directionDegrees = hourly.wind_direction_10m?.[index] ?? 0;
    return {
      forecastTime: new Date(time),
      windSpeedKnots: hourly.wind_speed_10m?.[index] ?? 0,
      gustKnots: hourly.wind_gusts_10m?.[index] ?? hourly.wind_speed_10m?.[index] ?? 0,
      windDirectionDegrees: directionDegrees,
      windDirectionCompass: degreesToCompass(directionDegrees),
      temperatureC: hourly.temperature_2m?.[index] ?? 0,
      precipitationMm: hourly.precipitation?.[index] ?? 0,
      cloudCoverPercent: hourly.cloud_cover?.[index] ?? 0,
      weatherWarnings: []
    };
  });
}

export async function fetchForecastForSpot(spot: KiteSpotInput, forecastDays = 7): Promise<ForecastHour[]> {
  if (process.env.WEATHER_PROVIDER?.toLowerCase() === "windy" && process.env.WINDY_API_KEY) {
    try {
      return await fetchWindyForecastForSpot(spot, forecastDays);
    } catch (error) {
      console.warn(error);
    }
  }

  return fetchOpenMeteoForecastForSpot(spot, forecastDays);
}

export async function refreshForecastsForAllSpots(forecastDays = 7) {
  const spots = (await prisma.kiteSpot.findMany()).map(spotSelectToInput);
  const summary = [];

  for (const spot of spots) {
    const forecast = await fetchForecastForSpot(spot, forecastDays);
    const source = activeWeatherSource();
    for (const hour of forecast) {
      await prisma.forecastData.upsert({
        where: {
          spotId_forecastTime_source: {
            spotId: spot.id,
            forecastTime: hour.forecastTime,
            source
          }
        },
        update: {
          windSpeedKnots: hour.windSpeedKnots,
          gustKnots: hour.gustKnots,
          windDirectionDegrees: hour.windDirectionDegrees,
          windDirectionCompass: hour.windDirectionCompass,
          temperatureC: hour.temperatureC,
          precipitationMm: hour.precipitationMm,
          cloudCoverPercent: hour.cloudCoverPercent,
          weatherWarnings: hour.weatherWarnings,
          raw: { ...hour, forecastTime: hour.forecastTime.toISOString(), source }
        },
        create: {
          spotId: spot.id,
          source,
          forecastTime: hour.forecastTime,
          windSpeedKnots: hour.windSpeedKnots,
          gustKnots: hour.gustKnots,
          windDirectionDegrees: hour.windDirectionDegrees,
          windDirectionCompass: hour.windDirectionCompass,
          temperatureC: hour.temperatureC,
          precipitationMm: hour.precipitationMm,
          cloudCoverPercent: hour.cloudCoverPercent,
          weatherWarnings: hour.weatherWarnings,
          raw: { ...hour, forecastTime: hour.forecastTime.toISOString(), source }
        }
      });
    }
    summary.push({ spot: spot.slug, hours: forecast.length });
  }

  return summary;
}

export async function refreshSpotRatings(forecastDays = 7) {
  const spots = (await prisma.kiteSpot.findMany()).map(spotSelectToInput);
  const scoringWeights = await loadActiveScoringWeights();
  const from = startOfDay(new Date());
  const to = addDays(from, forecastDays);
  const results = [];

  for (const spot of spots) {
    const forecastRows = await prisma.forecastData.findMany({
      where: {
        spotId: spot.id,
        source: activeWeatherSource(),
        forecastTime: { gte: from, lt: to }
      },
      orderBy: { forecastTime: "asc" }
    });

    const hours: ForecastHour[] = forecastRows.map((row) => ({
      forecastTime: row.forecastTime,
      windSpeedKnots: row.windSpeedKnots,
      gustKnots: row.gustKnots,
      windDirectionDegrees: row.windDirectionDegrees,
      windDirectionCompass: row.windDirectionCompass,
      temperatureC: row.temperatureC,
      precipitationMm: row.precipitationMm,
      cloudCoverPercent: row.cloudCoverPercent,
      weatherWarnings: row.weatherWarnings
    }));

    for (let day = 0; day < forecastDays; day += 1) {
      const date = addDays(from, day);
      const rating = rateSpotForDate(spot, hours, date, { scoringWeights });
      if (!rating) continue;

      await prisma.spotRating.upsert({
        where: { key: `${spot.id}:${date.toISOString().slice(0, 10)}:guest` },
        update: {
          forecastDate: date,
          windowStart: rating.windowStart,
          windowEnd: rating.windowEnd,
          score: rating.score,
          explanation: rating.explanation,
          windDirectionQuality: rating.windDirectionQuality,
          windStrengthQuality: rating.windStrengthQuality,
          riskWarnings: rating.riskWarnings,
          bestTimeWindow: rating.bestTimeWindow,
          beginnerWarning: rating.beginnerWarning,
          ratingMeta: JSON.parse(JSON.stringify(rating.meta))
        },
        create: {
          key: `${spot.id}:${date.toISOString().slice(0, 10)}:guest`,
          spotId: spot.id,
          forecastDate: date,
          windowStart: rating.windowStart,
          windowEnd: rating.windowEnd,
          score: rating.score,
          explanation: rating.explanation,
          windDirectionQuality: rating.windDirectionQuality,
          windStrengthQuality: rating.windStrengthQuality,
          riskWarnings: rating.riskWarnings,
          bestTimeWindow: rating.bestTimeWindow,
          beginnerWarning: rating.beginnerWarning,
          ratingMeta: JSON.parse(JSON.stringify(rating.meta))
        }
      });

      results.push({ spot: spot.slug, date: date.toISOString().slice(0, 10), score: rating.score });
    }
  }

  return results;
}

export async function runWeatherCrawler(forecastDays = 7) {
  const forecasts = await refreshForecastsForAllSpots(forecastDays);
  const ratings = await refreshSpotRatings(forecastDays);
  return { forecasts, ratings };
}
