import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  name: z.string().min(2).max(80).nullable().optional(),
  homeLat: z.number().nullable().optional(),
  homeLon: z.number().nullable().optional(),
  skillLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  preferredMinWind: z.number().min(0).max(60).optional(),
  preferredMaxWind: z.number().min(0).max(60).optional(),
  preferredSpotTypes: z.array(z.string()).default([])
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      homeLat: true,
      homeLon: true,
      skillLevel: true,
      preferredMinWind: true,
      preferredMaxWind: true,
      preferredSpotTypes: true,
      favorites: { include: { spot: true } }
    }
  });

  return NextResponse.json({ user });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const parsed = profileSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
    select: {
      id: true,
      name: true,
      email: true,
      homeLat: true,
      homeLon: true,
      skillLevel: true,
      preferredMinWind: true,
      preferredMaxWind: true,
      preferredSpotTypes: true
    }
  });

  return NextResponse.json({ user });
}
