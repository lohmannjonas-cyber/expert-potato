import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  rules: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      weight: z.number(),
      settings: z.record(z.unknown()),
      active: z.boolean()
    })
  )
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN";
}

export async function GET() {
  const rules = await prisma.scoringRule.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json({ rules });
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const rules = await Promise.all(
    parsed.data.rules.map((rule) =>
      prisma.scoringRule.upsert({
        where: { key: rule.key },
        update: rule,
        create: rule
      })
    )
  );

  return NextResponse.json({ rules });
}
