import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  region: z.string().min(2).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  suitableWindDirections: z.array(z.string()).optional(),
  offshoreWindDirections: z.array(z.string()).optional(),
  idealMinWindKnots: z.number().optional(),
  idealMaxWindKnots: z.number().optional(),
  beginnerFriendly: z.boolean().optional(),
  spotTypes: z.array(z.string()).optional(),
  tideRelevant: z.boolean().optional(),
  thermalPotential: z.number().int().min(0).max(3).optional(),
  parkingInfo: z.string().nullable().optional(),
  waterDepth: z.string().nullable().optional(),
  seasonRestrictions: z.string().nullable().optional(),
  dangerNotes: z.array(z.string()).optional(),
  webcamUrl: z.string().url().nullable().optional(),
  localInfoUrl: z.string().url().nullable().optional(),
  restricted: z.boolean().optional(),
  adminNotes: z.string().nullable().optional()
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN";
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const spot = await prisma.kiteSpot.findUnique({
    where: { id },
    include: {
      ratings: { orderBy: { forecastDate: "asc" }, take: 14 },
      forecasts: { orderBy: { forecastTime: "asc" }, take: 48 }
    }
  });

  if (!spot) return NextResponse.json({ error: "Spot not found" }, { status: 404 });
  return NextResponse.json({ spot });
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { id } = await context.params;
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const spot = await prisma.kiteSpot.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ spot });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { id } = await context.params;
  await prisma.kiteSpot.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
