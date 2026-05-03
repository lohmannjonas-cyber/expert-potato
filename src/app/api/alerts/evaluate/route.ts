import { NextResponse } from "next/server";
import { evaluateUserAlerts } from "@/lib/alerts";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret && process.env.NODE_ENV !== "production") return true;
  const auth = request.headers.get("authorization");
  const querySecret = new URL(request.url).searchParams.get("secret");
  return auth === `Bearer ${secret}` || querySecret === secret;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sent = await evaluateUserAlerts(7);
  return NextResponse.json({ ok: true, sent });
}

export const POST = GET;
