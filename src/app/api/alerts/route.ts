import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const alertSchema = z.object({
  name: z.string().min(2).max(120),
  selectedSpotIds: z.array(z.string()).default([]),
  windDirections: z.array(z.string()).default([]),
  minWindKnots: z.number().nullable().optional(),
  maxWindKnots: z.number().nullable().optional(),
  maxGustKnots: z.number().nullable().optional(),
  dateType: z.enum(["ANY", "WEEKDAY", "WEEKEND"]).default("ANY"),
  minTemperatureC: z.number().nullable().optional(),
  maxRainMm: z.number().nullable().optional(),
  region: z.string().nullable().optional(),
  maxTravelKm: z.number().nullable().optional(),
  beginnerOnly: z.boolean().default(false),
  flatWaterOnly: z.boolean().default(false)
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ alerts: [] });

  const alerts = await prisma.userAlert.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ alerts });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const parsed = alertSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const alert = await prisma.userAlert.create({
    data: {
      userId: session.user.id,
      ...parsed.data
    }
  });

  return NextResponse.json({ alert }, { status: 201 });
}
