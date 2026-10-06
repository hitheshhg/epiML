import { NextResponse } from "next/server";
import { PLANT_PROFILES, CROPS_CATALOG, CropType, GrowthStage } from "@/lib/plantProfiles";

/**
 * GET /api/crops
 * Chiguru Free Cloud Micro-Endpoint
 * 
 * Query params:
 * - crop: string (e.g. tomato, chilli)
 * - stage: string (germination, nursery)
 * - offline: boolean (simulate cloud outage for resilience testing)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cropParam = searchParams.get("crop") as CropType | null;
    const stageParam = searchParams.get("stage") as GrowthStage | null;
    const simulateOffline = searchParams.get("offline") === "true";

    // Simulate cloud connection outage if requested
    if (simulateOffline) {
      return NextResponse.json(
        { error: "Cloud connection offline (Simulated)", code: "CLOUD_UNAVAILABLE" },
        { status: 503 }
      );
    }

    if (cropParam && stageParam) {
      const match = PLANT_PROFILES.find(
        (p) => p.crop === cropParam && p.stage === stageParam
      );
      if (match) {
        return NextResponse.json({
          status: "success",
          source: "chiguru-cloud-free",
          cachedAt: new Date().toISOString(),
          profile: match,
        });
      }
      return NextResponse.json(
        { error: `Profile not found for crop: ${cropParam}, stage: ${stageParam}` },
        { status: 404 }
      );
    }

    // Return catalog and all profiles
    return NextResponse.json({
      status: "success",
      source: "chiguru-cloud-free",
      syncedAt: new Date().toISOString(),
      crops: CROPS_CATALOG,
      profiles: PLANT_PROFILES,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to fetch plant profiles from cloud", details: errorMsg },
      { status: 500 }
    );
  }
}
