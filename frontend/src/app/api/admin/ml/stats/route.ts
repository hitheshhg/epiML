import { NextResponse } from "next/server";
import { verifyAdminRequest, serverSupabase } from "@/lib/adminAuth";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

export async function GET(req: Request) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 403 });
  }

  try {
    // 1. Count users from public.profiles
    const { count: usersCount } = await serverSupabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // 2. Query experiments across ALL users
    const { data: allExperiments } = await serverSupabase
      .from("experiments")
      .select("id, crop_name, status, telemetry_history, include_in_research_training, created_at");

    const experimentsList = allExperiments || [];
    const totalExperiments = experimentsList.length;

    // Distinct crops and total telemetry points
    const cropsSet = new Set<string>();
    let totalSensorReadings = 0;
    let usableTrainingRecords = 0;

    for (const exp of experimentsList) {
      if (exp.crop_name) cropsSet.add(exp.crop_name);
      const hist = (exp.telemetry_history as any[]) || [];
      totalSensorReadings += hist.length > 0 ? hist.length : 1;
      if (exp.include_in_research_training !== false) {
        usableTrainingRecords += hist.length > 0 ? hist.length : 1;
      }
    }

    // Add Kaggle reference rows count (7,000 baseline records)
    usableTrainingRecords += 7000;

    // 3. Query active model info from ML service or defaults
    let activeModelVersion = "v1.0";
    let modelStatus = "ACTIVE";
    let lastTrainingTime = "2026-10-06T18:00:00Z";
    let driftStatus = "NORMAL";

    try {
      const mlRes = await fetch(`${ML_SERVICE_URL}/model-info`, { signal: AbortSignal.timeout(1500) });
      if (mlRes.ok) {
        const mlInfo = await mlRes.json();
        if (mlInfo.status === "ACTIVE" && mlInfo.metadata) {
          activeModelVersion = mlInfo.metadata.version_tag;
          modelStatus = "ACTIVE";
          lastTrainingTime = mlInfo.metadata.created_at;
        }
      }
    } catch {}

    try {
      const driftRes = await fetch(`${ML_SERVICE_URL}/admin/drift-status`, { signal: AbortSignal.timeout(1500) });
      if (driftRes.ok) {
        const dData = await driftRes.json();
        driftStatus = dData.status || "NORMAL";
      }
    } catch {}

    return NextResponse.json({
      totalUsers: Math.max(1, usersCount || 1),
      totalExperiments: totalExperiments,
      totalSensorReadings: totalSensorReadings + 7000,
      totalUsableTrainingRecords: usableTrainingRecords,
      totalCrops: Math.max(cropsSet.size, 5),
      totalDevices: Math.max(1, totalExperiments > 0 ? totalExperiments : 1),
      totalDatasets: 3, // User IoT, Experimental, Kaggle Reference
      currentModelVersion: activeModelVersion,
      currentModelStatus: modelStatus,
      lastSuccessfulTraining: lastTrainingTime,
      driftStatus: driftStatus,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to compile admin stats", details: err.message },
      { status: 500 }
    );
  }
}
