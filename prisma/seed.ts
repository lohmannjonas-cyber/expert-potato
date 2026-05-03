import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { defaultScoringRules, seedKiteSpots } from "../src/data/kite-spots";

const prisma = new PrismaClient();

async function main() {
  for (const spot of seedKiteSpots) {
    await prisma.kiteSpot.upsert({
      where: { slug: spot.slug },
      update: spot,
      create: spot
    });
  }

  for (const rule of defaultScoringRules) {
    await prisma.scoringRule.upsert({
      where: { key: rule.key },
      update: rule,
      create: rule
    });
  }

  await prisma.user.upsert({
    where: { email: "admin@kitespot-radar.local" },
    update: {},
    create: {
      email: "admin@kitespot-radar.local",
      name: "KiteSpot Admin",
      role: "ADMIN",
      skillLevel: "ADVANCED",
      homeLat: 52.52,
      homeLon: 13.405,
      passwordHash: await hash("change-me-admin", 12)
    }
  });

  await prisma.user.upsert({
    where: { email: "rider@example.com" },
    update: {},
    create: {
      email: "rider@example.com",
      name: "Demo Rider",
      skillLevel: "INTERMEDIATE",
      homeLat: 52.52,
      homeLon: 13.405,
      preferredMinWind: 15,
      preferredMaxWind: 25,
      preferredSpotTypes: ["flat", "chop"],
      passwordHash: await hash("change-me-rider", 12)
    }
  });

  const fehmarn = await prisma.kiteSpot.findUnique({ where: { slug: "fehmarn-gold" } });
  const loissin = await prisma.kiteSpot.findUnique({ where: { slug: "loissin" } });
  const rider = await prisma.user.findUnique({ where: { email: "rider@example.com" } });

  if (fehmarn && loissin && rider) {
    await prisma.favoriteSpot.upsert({
      where: { userId_spotId: { userId: rider.id, spotId: fehmarn.id } },
      update: {},
      create: { userId: rider.id, spotId: fehmarn.id }
    });

    await prisma.userAlert.upsert({
      where: { id: "demo-weekend-fehmarn" },
      update: {},
      create: {
        id: "demo-weekend-fehmarn",
        userId: rider.id,
        name: "Fehmarn weekend side-shore 17+ kt",
        selectedSpotIds: [fehmarn.id],
        windDirections: ["SW", "WSW", "W", "WNW"],
        minWindKnots: 17,
        maxWindKnots: 28,
        maxGustKnots: 35,
        dateType: "WEEKEND",
        maxRainMm: 1.5
      }
    });

    await prisma.userAlert.upsert({
      where: { id: "demo-loissin-east" },
      update: {},
      create: {
        id: "demo-loissin-east",
        userId: rider.id,
        name: "Loissin east wind above 14 kt",
        selectedSpotIds: [loissin.id],
        windDirections: ["ENE", "E", "ESE"],
        minWindKnots: 14,
        maxWindKnots: 25,
        dateType: "ANY"
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
