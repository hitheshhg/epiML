import { NextResponse } from "next/server";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ query: q, locations: [] });
    }

    const mlRes = await fetch(`${ML_SERVICE_URL}/locations/search?q=${encodeURIComponent(q)}`, {
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(6000),
    });

    if (mlRes.ok) {
      const data = await mlRes.json();
      return NextResponse.json(data);
    } else {
      return NextResponse.json({ query: q, locations: [] }, { status: mlRes.status });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Geocoding query failed", details: msg, locations: [] },
      { status: 500 }
    );
  }
}
