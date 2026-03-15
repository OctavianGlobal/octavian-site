import { NextRequest, NextResponse } from "next/server";
import { getPublishedSignals } from "@/lib/queries";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);

  const { signals, count } = await getPublishedSignals({ limit, offset });
  return NextResponse.json({ signals, count });
}