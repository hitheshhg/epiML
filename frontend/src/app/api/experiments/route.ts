import { NextResponse } from "next/server";
import { ALL_EXPERIMENTS } from "@/lib/experimentService";

export async function GET() {
  try {
    return NextResponse.json({
      status: "success",
      count: ALL_EXPERIMENTS.length,
      experiments: ALL_EXPERIMENTS,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to fetch experiments", details: errorMsg },
      { status: 500 }
    );
  }
}
