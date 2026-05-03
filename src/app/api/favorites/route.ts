import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const favoriteSchema = z.object({
  spotId: z.string()
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ favorites: [] });

  const favorites = await prisma.favoriteSpot.findMany({
    where: { userId: session.user.id },
    include: { spot: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ favorites });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const parsed = favoriteSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const favorite = await prisma.favoriteSpot.upsert({
    where: { userId_spotId: { userId: session.user.id, spotId: parsed.data.spotId } },
    update: {},
    create: { userId: session.user.id, spotId: parsed.data.spotId }
  });

  return NextResponse.json({ favorite }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const parsed = favoriteSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await prisma.favoriteSpot.delete({
    where: { userId_spotId: { userId: session.user.id, spotId: parsed.data.spotId } }
  });

  return NextResponse.json({ ok: true });
}
