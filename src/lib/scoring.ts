import { displayHour, isWeekendDate, sameLocalDate } from "@/lib/dates";
import { distanceKm } from "@/lib/geo";
import { directionLabel, nearestDirectionDelta } from "@/lib/wind";

export type KiteSpotInput = {
  id: string;
  slug: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  suitableWindDirections: string[];
  offshoreWindDirections: string[];
  idealMinWindKnots: number;
  idealMaxWindKnots: number;
  beginnerFriendly: boolean;
  spotTypes: string[];
  tideRelevant: boolean;
  thermalPotential: number;
  parkingInfo?: string | null;
  waterDepth?: string | null;
  seasonRestrictions?: string | null;
  dangerNotes: string[];
  webcamUrl?: string | null;
  localInfoUrl?: string | null;
  adminNotes?: string | null;
  restricted?: boolean;
};

export type ForecastHour = {
  forecastTime: Date;
  windSpeedKnots: number;
  gustKnots: number;
  windDirectionDegrees: number;
  windDirectionCompass: string;
  temperatureC: number;
  precipitationMm: number;
  cloudCoverPercent: number;
  weatherWarnings: string[];
};

export type RatingPreferences = {
  skillLevel?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  homeLat?: number;
  homeLon?: number;
  maxTravelKm?: number;
  preferredMinWind?: number;
  preferredMaxWind?: number;
  preferredDirection?: string;
  avoidRain?: boolean;
  avoidOffshoreWind?: boolean;
  beginnerOnly?: boolean;
  flatWaterOnly?: boolean;
  waveOnly?: boolean;
  dateType?: "ANY" | "WEEKDAY" | "WEEKEND";
  scoringWeights?: Partial<Record<"direction" | "strength" | "gusts" | "consistency" | "comfort" | "profile", number>>;
  language?: "de" | "en";
};

export type SpotRatingResult = {
  spot: KiteSpotInput;
  score: number;
  explanation: string;
  windDirectionQuality: string;
  windStrengthQuality: string;
  riskWarnings: string[];
  bestTimeWindow: string;
  beginnerWarning?: string;
  windowStart: Date;
  windowEnd: Date;
  meta: {
    averageWindKnots: number;
    minWindKnots: number;
    maxWindKnots: number;
    maxGustKnots: number;
    dominantDirection: string;
    averageTemperatureC: number;
    totalRainMm: number;
    usableHours: number;
    distanceKm?: number;
    weekend: boolean;
    hourlyScores: Array<{ time: string; score: number; wind: number; gust: number; direction: string }>;
  };
};

type HourScore = {
  hour: ForecastHour;
  score: number;
  directionScore: number;
  strengthScore: number;
  comfortScore: number;
  warnings: string[];
  directionQuality: string;
  strengthQuality: string;
  unsafe: boolean;
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values: number[]) {
  if (values.length < 2) return 0;
  const mean = average(values);
  return Math.sqrt(average(values.map((value) => (value - mean) ** 2)));
}

function describeWindStrength(wind: number, min: number, max: number) {
  if (wind < min - 4) return "too light";
  if (wind < min) return "marginal";
  if (wind <= max) return "ideal";
  if (wind <= max + 5) return "strong";
  return "too strong";
}

function translateDirectionQuality(quality: string, language: "de" | "en") {
  if (language === "en") return quality;
  const translations: Record<string, string> = {
    "awkward angle": "ungunstiger Winkel",
    offshore: "Offshore-Wind",
    "near-offshore": "fast offshore",
    "excellent side-shore or side-onshore angle": "sehr guter Side- bis Side-Onshore-Winkel",
    "good angle": "guter Winkel",
    "usable but not clean": "fahrbar, aber nicht ideal"
  };
  return translations[quality] ?? quality;
}

function translateStrengthQuality(quality: string, language: "de" | "en") {
  if (language === "en") return quality;
  const translations: Record<string, string> = {
    "marginal wind": "grenzwertiger Wind",
    "strong wind": "starker Wind",
    "ideal wind": "idealer Wind"
  };
  return translations[quality] ?? quality;
}

function translateWarning(warning: string, language: "de" | "en") {
  if (language === "en") return warning;
  const translations: Record<string, string> = {
    "Offshore wind warning": "Offshore-Warnung",
    "Near-offshore wind angle": "Fast offshore",
    "Below most usable kite wind ranges": "Unterhalb vieler nutzbarer Kite-Windbereiche",
    "Storm-strength wind warning": "Starkwind- oder Sturmwarnung",
    "Very gusty wind warning": "Sehr boeiger Wind",
    "Gusty wind warning": "Boeiger Wind",
    "Rain risk": "Regenrisiko",
    "Cold water and air warning": "Kalte Luft und kaltes Wasser",
    "Cold session warning": "Kalte Session",
    "Outside practical daylight window": "Ausserhalb eines sinnvollen Tageslichtfensters",
    "Spot marked restricted by admin": "Spot ist vom Admin als eingeschraenkt markiert"
  };
  if (warning.startsWith("Season note:")) return warning.replace("Season note:", "Saisonhinweis:");
  return translations[warning] ?? warning;
}

function weights(preferences: RatingPreferences) {
  return {
    direction: preferences.scoringWeights?.direction ?? 32,
    strength: preferences.scoringWeights?.strength ?? 30,
    gusts: preferences.scoringWeights?.gusts ?? 12,
    consistency: preferences.scoringWeights?.consistency ?? 10,
    comfort: preferences.scoringWeights?.comfort ?? 10,
    profile: preferences.scoringWeights?.profile ?? 6
  };
}

function scoreHour(spot: KiteSpotInput, hour: ForecastHour, preferences: RatingPreferences): HourScore {
  const warnings = [...hour.weatherWarnings];
  const scoringWeights = weights(preferences);
  const direction = directionLabel(hour.windDirectionCompass);
  const offshoreDelta = nearestDirectionDelta(direction, spot.offshoreWindDirections);
  const suitableDelta = nearestDirectionDelta(direction, spot.suitableWindDirections);

  let directionScore = scoringWeights.direction * 0.15;
  let directionQuality = "awkward angle";
  let unsafe = false;

  if (offshoreDelta <= 22.5) {
    directionScore = 0;
    directionQuality = "offshore";
    unsafe = true;
    warnings.push("Offshore wind warning");
  } else if (offshoreDelta <= 45) {
    directionScore = 6;
    directionQuality = "near-offshore";
    warnings.push("Near-offshore wind angle");
  } else if (suitableDelta <= 22.5) {
    directionScore = scoringWeights.direction;
    directionQuality = "excellent side-shore or side-onshore angle";
  } else if (suitableDelta <= 45) {
    directionScore = scoringWeights.direction * 0.78;
    directionQuality = "good angle";
  } else if (suitableDelta <= 67.5) {
    directionScore = scoringWeights.direction * 0.47;
    directionQuality = "usable but not clean";
  }

  const targetMin = preferences.preferredMinWind ?? spot.idealMinWindKnots;
  const targetMax = preferences.preferredMaxWind ?? spot.idealMaxWindKnots;
  const wind = hour.windSpeedKnots;
  const gust = hour.gustKnots;
  const strengthQuality = describeWindStrength(wind, targetMin, targetMax);

  let strengthScore = 0;
  if (wind >= targetMin && wind <= targetMax) {
    strengthScore = scoringWeights.strength;
  } else if (wind < targetMin) {
    strengthScore = clamp(scoringWeights.strength - (targetMin - wind) * 5, 0, scoringWeights.strength);
  } else {
    strengthScore = clamp(scoringWeights.strength - (wind - targetMax) * 4, 0, scoringWeights.strength);
  }

  if (wind < 10) warnings.push("Below most usable kite wind ranges");
  if (wind > 32 || gust > 38) warnings.push("Storm-strength wind warning");

  const gustRatio = gust / Math.max(wind, 1);
  let gustScore = scoringWeights.gusts;
  if (gustRatio > 1.55) {
    gustScore = scoringWeights.gusts * 0.08;
    warnings.push("Very gusty wind warning");
  } else if (gustRatio > 1.35) {
    gustScore = scoringWeights.gusts * 0.5;
    warnings.push("Gusty wind warning");
  }

  let comfortScore = scoringWeights.comfort;
  if (hour.precipitationMm > 2) {
    comfortScore -= scoringWeights.comfort * 0.5;
    warnings.push("Rain risk");
  } else if (hour.precipitationMm > 0.5) {
    comfortScore -= scoringWeights.comfort * 0.2;
  }
  if (hour.temperatureC < 5) {
    comfortScore -= scoringWeights.comfort * 0.4;
    warnings.push("Cold water and air warning");
  } else if (hour.temperatureC < 9) {
    comfortScore -= scoringWeights.comfort * 0.2;
    warnings.push("Cold session warning");
  }

  const hourOfDay = hour.forecastTime.getHours();
  if (hourOfDay < 8 || hourOfDay > 20) {
    comfortScore = Math.min(comfortScore, scoringWeights.comfort * 0.2);
    warnings.push("Outside practical daylight window");
  }

  const score = directionScore + strengthScore + gustScore + clamp(comfortScore, 0, scoringWeights.comfort);

  return {
    hour,
    score: unsafe ? Math.min(score, 20) : clamp(score, 0, 92),
    directionScore,
    strengthScore,
    comfortScore,
    warnings,
    directionQuality,
    strengthQuality,
    unsafe
  };
}

function buildWindows(scores: HourScore[], minLength = 3, maxLength = 6) {
  const windows: HourScore[][] = [];
  for (let start = 0; start < scores.length; start += 1) {
    for (let length = minLength; length <= maxLength; length += 1) {
      const candidate = scores.slice(start, start + length);
      if (candidate.length === length) windows.push(candidate);
    }
  }
  return windows;
}

function pickDominantDirection(hours: ForecastHour[]) {
  const counts = new Map<string, number>();
  for (const hour of hours) {
    counts.set(hour.windDirectionCompass, (counts.get(hour.windDirectionCompass) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N";
}

function summarizeWindow(spot: KiteSpotInput, window: HourScore[], preferences: RatingPreferences) {
  const scoringWeights = weights(preferences);
  const hourScores = window.map((item) => item.score);
  const windValues = window.map((item) => item.hour.windSpeedKnots);
  const gustValues = window.map((item) => item.hour.gustKnots);
  const rainValues = window.map((item) => item.hour.precipitationMm);
  const tempValues = window.map((item) => item.hour.temperatureC);
  const usableHours = window.filter((item) => item.score >= 58 && !item.unsafe).length;
  const consistencyPenalty = Math.min(scoringWeights.consistency, standardDeviation(windValues) * 1.4);
  const unsafePenalty = window.some((item) => item.unsafe) ? 35 : 0;
  const shortSessionPenalty = usableHours < 3 ? ((3 - usableHours) * scoringWeights.consistency) / 2 : 0;
  const rainPenalty = preferences.avoidRain ? Math.min(8, average(rainValues) * 3) : 0;
  const offshorePreferencePenalty =
    preferences.avoidOffshoreWind && window.some((item) => item.warnings.some((warning) => warning.toLowerCase().includes("offshore")))
      ? 18
      : 0;

  let profilePenalty = 0;
  let beginnerWarning: string | undefined;
  if ((preferences.skillLevel === "BEGINNER" || preferences.beginnerOnly) && !spot.beginnerFriendly) {
    profilePenalty += scoringWeights.profile * 2;
    beginnerWarning = "Beginner unsuitable warning: this spot needs confident upwind riding and self-rescue.";
  }
  if (preferences.flatWaterOnly && !spot.spotTypes.includes("flat")) profilePenalty += scoringWeights.profile * 1.6;
  if (preferences.waveOnly && !spot.spotTypes.includes("wave")) profilePenalty += scoringWeights.profile * 1.6;

  let travelDistance: number | undefined;
  if (preferences.homeLat !== undefined && preferences.homeLon !== undefined) {
    travelDistance = distanceKm(preferences.homeLat, preferences.homeLon, spot.latitude, spot.longitude);
    if (preferences.maxTravelKm && travelDistance > preferences.maxTravelKm) {
      profilePenalty += Math.min(24, (travelDistance - preferences.maxTravelKm) / 20);
    }
  }

  if (preferences.preferredDirection) {
    const delta = nearestDirectionDelta(pickDominantDirection(window.map((item) => item.hour)), [preferences.preferredDirection]);
    if (delta > 45) profilePenalty += 7;
  }

  const thermalBonus = spot.thermalPotential > 0 && average(tempValues) > 13 && average(rainValues) < 0.5 ? spot.thermalPotential * 1.5 : 0;
  const tidePenalty = spot.tideRelevant ? 3 : 0;
  const restrictedPenalty = spot.restricted ? 25 : 0;

  const raw =
    average(hourScores) -
    consistencyPenalty -
    unsafePenalty -
    shortSessionPenalty -
    rainPenalty -
    offshorePreferencePenalty -
    profilePenalty -
    tidePenalty -
    restrictedPenalty +
    thermalBonus;

  return {
    score: Math.round(clamp(raw)),
    usableHours,
    warnings: Array.from(new Set(window.flatMap((item) => item.warnings))),
    beginnerWarning,
    averageWind: average(windValues),
    minWind: Math.min(...windValues),
    maxWind: Math.max(...windValues),
    maxGust: Math.max(...gustValues),
    averageTemp: average(tempValues),
    totalRain: rainValues.reduce((sum, value) => sum + value, 0),
    dominantDirection: pickDominantDirection(window.map((item) => item.hour)),
    distanceKm: travelDistance,
    hourlyScores: window.map((item) => ({
      time: item.hour.forecastTime.toISOString(),
      score: Math.round(item.score),
      wind: item.hour.windSpeedKnots,
      gust: item.hour.gustKnots,
      direction: item.hour.windDirectionCompass
    }))
  };
}

export function rateSpotForDate(
  spot: KiteSpotInput,
  forecastHours: ForecastHour[],
  date: Date,
  preferences: RatingPreferences = {}
): SpotRatingResult | null {
  const language = preferences.language ?? "de";
  if (preferences.dateType === "WEEKEND" && !isWeekendDate(date)) return null;
  if (preferences.dateType === "WEEKDAY" && isWeekendDate(date)) return null;

  const dayHours = forecastHours
    .filter((hour) => sameLocalDate(hour.forecastTime, date))
    .sort((a, b) => a.forecastTime.getTime() - b.forecastTime.getTime());

  if (dayHours.length < 3) return null;

  const scoredHours = dayHours.map((hour) => scoreHour(spot, hour, preferences));
  const windows = buildWindows(scoredHours);
  if (!windows.length) return null;

  const rankedWindows = windows
    .map((window) => ({ window, summary: summarizeWindow(spot, window, preferences) }))
    .sort((a, b) => b.summary.score - a.summary.score);

  const best = rankedWindows[0];
  const first = best.window[0].hour.forecastTime;
  const last = best.window[best.window.length - 1].hour.forecastTime;
  const rawWindDirectionQuality = [...best.window].sort((a, b) => b.directionScore - a.directionScore)[0].directionQuality;
  const rawWindStrengthQuality = best.summary.averageWind < spot.idealMinWindKnots ? "marginal wind" : best.summary.averageWind > spot.idealMaxWindKnots ? "strong wind" : "ideal wind";
  const windDirectionQuality = translateDirectionQuality(rawWindDirectionQuality, language);
  const windStrengthQuality = translateStrengthQuality(rawWindStrengthQuality, language);
  const rainText =
    best.summary.totalRain < 0.5
      ? language === "de"
        ? "geringes Regenrisiko"
        : "low rain risk"
      : language === "de"
        ? `${best.summary.totalRain.toFixed(1)} mm Regenrisiko`
        : `${best.summary.totalRain.toFixed(1)} mm rain risk`;
  const gustText =
    best.summary.maxGust / Math.max(best.summary.averageWind, 1) > 1.45
      ? language === "de"
        ? "Boeen brauchen Vorsicht"
        : "gusts need caution"
      : language === "de"
        ? "moderate Boeen"
        : "moderate gusts";

  const riskWarnings = [...best.summary.warnings];
  if (spot.restricted) riskWarnings.push("Spot marked restricted by admin");
  if (spot.seasonRestrictions) riskWarnings.push(`Season note: ${spot.seasonRestrictions}`);

  const bestTimeWindow = `${displayHour(first)}-${displayHour(last)}`;
  const explanation =
    language === "de"
      ? `${spot.name} - ${best.summary.score}/100. Bestes Fenster ${bestTimeWindow}. Wind ${best.summary.dominantDirection} ${Math.round(
          best.summary.minWind
        )}-${Math.round(best.summary.maxWind)} Knoten, ${windDirectionQuality}, ${gustText}, ${rainText}.`
      : `${spot.name} - ${best.summary.score}/100. Best window ${bestTimeWindow}. Wind ${best.summary.dominantDirection} ${Math.round(
          best.summary.minWind
        )}-${Math.round(best.summary.maxWind)} knots, ${windDirectionQuality}, ${gustText}, ${rainText}.`;

  return {
    spot,
    score: best.summary.score,
    explanation,
    windDirectionQuality,
    windStrengthQuality,
    riskWarnings: Array.from(new Set(riskWarnings.map((warning) => translateWarning(warning, language)))),
    bestTimeWindow,
    beginnerWarning: best.summary.beginnerWarning,
    windowStart: first,
    windowEnd: last,
    meta: {
      averageWindKnots: Number(best.summary.averageWind.toFixed(1)),
      minWindKnots: Number(best.summary.minWind.toFixed(1)),
      maxWindKnots: Number(best.summary.maxWind.toFixed(1)),
      maxGustKnots: Number(best.summary.maxGust.toFixed(1)),
      dominantDirection: best.summary.dominantDirection,
      averageTemperatureC: Number(best.summary.averageTemp.toFixed(1)),
      totalRainMm: Number(best.summary.totalRain.toFixed(1)),
      usableHours: best.summary.usableHours,
      distanceKm: best.summary.distanceKm !== undefined ? Number(best.summary.distanceKm.toFixed(0)) : undefined,
      weekend: isWeekendDate(date),
      hourlyScores: best.summary.hourlyScores
    }
  };
}
