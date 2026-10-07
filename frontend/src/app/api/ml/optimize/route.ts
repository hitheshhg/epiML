import { NextResponse } from "next/server";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const mlRes = await fetch(`${ML_SERVICE_URL}/optimize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(6000),
    });

    if (mlRes.ok) {
      const data = await mlRes.json();
      return NextResponse.json(data);
    } else {
      const errData = await mlRes.json().catch(() => ({}));
      return NextResponse.json(errData, { status: mlRes.status });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Optimization failed or ML service unreachable", details: msg },
      { status: 503 }
    );
  }
}
