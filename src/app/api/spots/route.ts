import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getAllSpots } from "@/lib/rankings";
import { prisma } from "@/lib/prisma";

const spotSchema = z.object({
  slug: z.string().min(2),
  name: z.string().min(2),
  region: z.string().min(2),
  latitude: z.number(),
  longitude: z.number(),
  suitableWindDirections: z.array(z.string()).default([]),
  offshoreWindDirections: z.array(z.string()).default([]),
  idealMinWindKnots: z.number().default(15),
  idealMaxWindKnots: z.number().default(25),
  beginnerFriendly: z.boolean().default(false),
  spotTypes: z.array(z.string()).default([]),
  tideRelevant: z.boolean().default(false),
  thermalPotential: z.number().int().min(0).max(3).default(0),
  parkingInfo: z.string().optional(),
  waterDepth: z.string().optional(),
  seasonRestrictions: z.string().optional(),
  dangerNotes: z.array(z.string()).default([]),
  webcamUrl: z.string().url().optional(),
  localInfoUrl: z.string().url().optional(),
  restricted: z.boolean().default(false),
  adminNotes: z.string().optional()
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN";
}

export async function GET() {
  const spots = await getAllSpots();
  return NextResponse.json({ spots });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const parsed = spotSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const spot = await prisma.kiteSpot.create({ data: parsed.data });
  return NextResponse.json({ spot }, { status: 201 });
}
