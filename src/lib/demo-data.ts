import { seedKiteSpots } from "@/data/kite-spots";
import type { ForecastHour, KiteSpotInput } from "@/lib/scoring";
import { degreesToCompass } from "@/lib/wind";

export const demoSpots: KiteSpotInput[] = seedKiteSpots.map((spot) => ({
  id: spot.slug,
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
  restricted: false
}));

export function generateDemoForecast(spot: KiteSpotInput, startDate = new Date(), days = 7): ForecastHour[] {
  const spotSeed = spot.slug.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const hours: ForecastHour[] = [];

  for (let day = 0; day < days; day += 1) {
    for (let hour = 0; hour < 24; hour += 1) {
      const forecastTime = new Date(startDate);
      forecastTime.setHours(0, 0, 0, 0);
      forecastTime.setDate(forecastTime.getDate() + day);
      forecastTime.setHours(hour);

      const base = 12 + ((spotSeed + day * 5) % 9);
      const afternoonBoost = hour >= 11 && hour <= 18 ? 4 : 0;
      const variation = Math.sin((hour + spotSeed) / 3) * 2.5;
      const windSpeedKnots = Math.max(4, base + afternoonBoost + variation);
      const gustKnots = windSpeedKnots + 4 + ((spotSeed + hour + day) % 5);
      const directionDegrees = (spotSeed * 7 + day * 28 + hour * 3) % 360;

      hours.push({
        forecastTime,
        windSpeedKnots: Number(windSpeedKnots.toFixed(1)),
        gustKnots: Number(gustKnots.toFixed(1)),
        windDirectionDegrees: directionDegrees,
        windDirectionCompass: degreesToCompass(directionDegrees),
        temperatureC: 9 + ((spotSeed + day) % 9) + (hour >= 10 && hour <= 17 ? 4 : 0),
        precipitationMm: (spotSeed + day + hour) % 11 === 0 ? 1.8 : (spotSeed + hour) % 17 === 0 ? 0.4 : 0,
        cloudCoverPercent: 25 + ((spotSeed + day * 8 + hour) % 65),
        weatherWarnings: []
      });
    }
  }

  return hours;
}
