import { NextResponse } from "next/server";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
      return NextResponse.json({ error: "Missing lat or lon query parameter" }, { status: 400 });
    }

    const mlRes = await fetch(`${ML_SERVICE_URL}/weather/context?lat=${lat}&lon=${lon}`, {
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (mlRes.ok) {
      const data = await mlRes.json();
      return NextResponse.json(data);
    } else {
      const err = await mlRes.json().catch(() => ({}));
      return NextResponse.json(err, { status: mlRes.status });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Weather context unavailable", details: msg, current: null, attribution: "Open-Meteo CC BY 4.0" },
      { status: 503 }
    );
  }
}
