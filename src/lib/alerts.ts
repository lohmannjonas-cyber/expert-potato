import { addDays, startOfDay } from "date-fns";
import { isWeekendDate } from "@/lib/dates";
import { distanceKm } from "@/lib/geo";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { type ForecastHour, type KiteSpotInput, rateSpotForDate } from "@/lib/scoring";
import { loadActiveScoringWeights } from "@/lib/scoring-rules";

function spotToInput(spot: KiteSpotInput): KiteSpotInput {
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

function matchesDateType(dateType: string, date: Date) {
  if (dateType === "WEEKEND") return isWeekendDate(date);
  if (dateType === "WEEKDAY") return !isWeekendDate(date);
  return true;
}

export async function evaluateUserAlerts(forecastDays = 7) {
  const alerts = await prisma.userAlert.findMany({
    where: { enabled: true },
    include: { user: true }
  });
  const spots = (await prisma.kiteSpot.findMany()).map(spotToInput);
  const scoringWeights = await loadActiveScoringWeights();
  const from = startOfDay(new Date());
  const to = addDays(from, forecastDays);
  const sent: Array<{ alert: string; spot: string; date: string }> = [];

  for (const alert of alerts) {
    const candidateSpots = spots.filter((spot) => {
      if (alert.selectedSpotIds.length && !alert.selectedSpotIds.includes(spot.id)) return false;
      if (alert.region && spot.region !== alert.region) return false;
      if (alert.beginnerOnly && !spot.beginnerFriendly) return false;
      if (alert.flatWaterOnly && !spot.spotTypes.includes("flat")) return false;
      if (
        alert.maxTravelKm &&
        alert.user.homeLat !== null &&
        alert.user.homeLon !== null &&
        distanceKm(alert.user.homeLat, alert.user.homeLon, spot.latitude, spot.longitude) > alert.maxTravelKm
      ) {
        return false;
      }
      return true;
    });

    for (const spot of candidateSpots) {
      const forecastRows = await prisma.forecastData.findMany({
        where: {
          spotId: spot.id,
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
        if (!matchesDateType(alert.dateType, date)) continue;

        const rating = rateSpotForDate(spot, hours, date, {
          skillLevel: alert.user.skillLevel,
          homeLat: alert.user.homeLat ?? undefined,
          homeLon: alert.user.homeLon ?? undefined,
          maxTravelKm: alert.maxTravelKm ?? undefined,
          beginnerOnly: alert.beginnerOnly,
          flatWaterOnly: alert.flatWaterOnly,
          preferredMinWind: alert.minWindKnots ?? undefined,
          preferredMaxWind: alert.maxWindKnots ?? undefined,
          scoringWeights
        });
        if (!rating) continue;

        if (alert.minWindKnots !== null && rating.meta.averageWindKnots < alert.minWindKnots) continue;
        if (alert.maxWindKnots !== null && rating.meta.averageWindKnots > alert.maxWindKnots) continue;
        if (alert.maxGustKnots !== null && rating.meta.maxGustKnots > alert.maxGustKnots) continue;
        if (alert.minTemperatureC !== null && rating.meta.averageTemperatureC < alert.minTemperatureC) continue;
        if (alert.maxRainMm !== null && rating.meta.totalRainMm > alert.maxRainMm) continue;
        if (alert.windDirections.length && !alert.windDirections.includes(rating.meta.dominantDirection)) continue;
        if (rating.score < 65) continue;

        const fingerprint = `${alert.id}:${spot.id}:${rating.windowStart.toISOString()}`;
        const existing = await prisma.notificationLog.findUnique({ where: { fingerprint } });
        if (existing) continue;

        await sendEmail({
          to: alert.user.email,
          subject: `${rating.spot.name}: ${rating.score}/100 kite window`,
          text: rating.explanation,
          html: `<p>${rating.explanation}</p><p><strong>Warnings:</strong> ${
            rating.riskWarnings.length ? rating.riskWarnings.join(", ") : "None"
          }</p>`
        });

        await prisma.notificationLog.create({
          data: {
            alertId: alert.id,
            userId: alert.userId,
            spotId: spot.id,
            forecastWindowStart: rating.windowStart,
            fingerprint
          }
        });

        sent.push({ alert: alert.name, spot: spot.name, date: date.toISOString().slice(0, 10) });
      }
    }
  }

  return sent;
}
