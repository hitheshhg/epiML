import { NextResponse } from "next/server";
import { identifyAndProfilePlant } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = (body?.query || body?.plant || "").trim();

    if (!query) {
      return NextResponse.json(
        { error: "Plant or seed query is required" },
        { status: 400 }
      );
    }

    const profile = await identifyAndProfilePlant(query);

    return NextResponse.json({
      status: "success",
      query,
      profile,
      retrievedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Plant identification endpoint error:", errorMsg);

    return NextResponse.json(
      { error: "Failed to identify plant profile", details: errorMsg },
      { status: 500 }
    );
  }
}
