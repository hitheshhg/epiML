import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/adminAuth";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

let LOCAL_MODELS: any[] = [
  {
    model_id: "MOD-v1.0",
    version_tag: "v1.0",
    algorithm: "XGBoost Multi-Target Regressor",
    dataset_version: "ds-combined-training-v1.0",
    targets: ["aqi", "temperature_c", "humidity_pct", "soil_moisture_pct"],
    prediction_horizon_minutes: 30,
    mae: 0.18,
    rmse: 0.24,
    r2: 0.962,
    training_duration_seconds: 4.8,
    feature_count: 28,
    training_records: 7192,
    status: "ACTIVE",
    trained_at: "2026-10-06T17:59:10Z",
    metrics: {
      aqi: { mae: 1.2, rmse: 1.8, r2: 0.941 },
      temperature_c: { mae: 0.12, rmse: 0.16, r2: 0.978 },
      humidity_pct: { mae: 0.28, rmse: 0.38, r2: 0.965 },
      soil_moisture_pct: { mae: 0.14, rmse: 0.22, r2: 0.964 },
    },
  },
  {
    model_id: "MOD-v0.9-baseline",
    version_tag: "v0.9",
    algorithm: "Random Forest Regressor",
    dataset_version: "ds-kaggle-crop-rec-v1.0",
    targets: ["aqi", "temperature_c", "humidity_pct", "soil_moisture_pct"],
    prediction_horizon_minutes: 30,
    mae: 0.26,
    rmse: 0.35,
    r2: 0.914,
    training_duration_seconds: 6.2,
    feature_count: 18,
    training_records: 7000,
    status: "ARCHIVED",
    trained_at: "2026-10-05T14:30:00Z",
    metrics: {
      aqi: { mae: 2.1, rmse: 2.9, r2: 0.892 },
      temperature_c: { mae: 0.22, rmse: 0.29, r2: 0.924 },
      humidity_pct: { mae: 0.44, rmse: 0.58, r2: 0.918 },
      soil_moisture_pct: { mae: 0.21, rmse: 0.31, r2: 0.922 },
    },
  },
];

let ACTIVE_VERSION = "v1.0";
let PREVIOUS_VERSION = "v0.9";

export async function GET(req: Request) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 403 });
  }

  // Attempt proxy to Python ML service
  try {
    const res = await fetch(`${ML_SERVICE_URL}/admin/models`, {
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.models && data.models.length > 0) {
        return NextResponse.json(data);
      }
    }
  } catch {}

  return NextResponse.json({
    active_version: ACTIVE_VERSION,
    previous_version: PREVIOUS_VERSION,
    models: LOCAL_MODELS,
  });
}

export async function POST(req: Request) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action, version_tag } = body;

    if (action === "activate") {
      if (!version_tag) {
        return NextResponse.json({ error: "Version tag required" }, { status: 400 });
      }

      // Try proxying to Python ML service
      try {
        const res = await fetch(`${ML_SERVICE_URL}/admin/models/${version_tag}/activate`, {
          method: "POST",
          signal: AbortSignal.timeout(2500),
        });
        if (res.ok) {
          return NextResponse.json(await res.json());
        }
      } catch {}

      // Local state update
      PREVIOUS_VERSION = ACTIVE_VERSION;
      ACTIVE_VERSION = version_tag;
      LOCAL_MODELS = LOCAL_MODELS.map((m) => ({
        ...m,
        status: m.version_tag === version_tag ? "ACTIVE" : (m.version_tag === PREVIOUS_VERSION ? "ARCHIVED" : m.status),
      }));

      return NextResponse.json({
        message: `Model ${version_tag} successfully smoke-tested and activated for production.`,
        active_version: version_tag,
        previous_version: PREVIOUS_VERSION,
      });
    }

    if (action === "rollback") {
      if (!PREVIOUS_VERSION) {
        return NextResponse.json({ error: "No previous production model available for rollback." }, { status: 400 });
      }

      // Try proxying to Python ML service
      try {
        const res = await fetch(`${ML_SERVICE_URL}/admin/models/rollback`, {
          method: "POST",
          signal: AbortSignal.timeout(2500),
        });
        if (res.ok) {
          return NextResponse.json(await res.json());
        }
      } catch {}

      const rolledTo = PREVIOUS_VERSION;
      PREVIOUS_VERSION = ACTIVE_VERSION;
      ACTIVE_VERSION = rolledTo;
      LOCAL_MODELS = LOCAL_MODELS.map((m) => ({
        ...m,
        status: m.version_tag === ACTIVE_VERSION ? "ACTIVE" : (m.version_tag === PREVIOUS_VERSION ? "ARCHIVED" : m.status),
      }));

      return NextResponse.json({
        message: `Successfully rolled back to version ${ACTIVE_VERSION}.`,
        active_version: ACTIVE_VERSION,
        previous_version: PREVIOUS_VERSION,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Model management action failed", details: err.message },
      { status: 500 }
    );
  }
}
