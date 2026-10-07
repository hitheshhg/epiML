import { NextResponse } from "next/server";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Map incoming request to FastAPI SimulationRequest schema
    let payload: any = body;
    if (!body.base_request) {
      payload = {
        base_request: {
          crop: body.seed?.crop || body.crop || "Tomato",
          seed_variety: body.seed?.variety || body.seed_variety || "Pusa Ruby",
          growth_stage: body.growth_stage || "germination",
          location: {
            name: body.location?.name || "Mangalore, Karnataka, India",
            latitude: Number(body.location?.latitude ?? 12.87),
            longitude: Number(body.location?.longitude ?? 74.88),
            elevation: Number(body.location?.elevation ?? 16.0),
          },
          current_environment: {
            temperature: Number(body.baseline_environment?.temperature_c ?? body.baseline_environment?.temperature ?? 24.8),
            humidity: Number(body.baseline_environment?.humidity_pct ?? body.baseline_environment?.humidity ?? 76.5),
            soil_moisture: Number(body.baseline_environment?.soil_moisture_pct ?? body.baseline_environment?.soil_moisture ?? 71.0),
            aqi: Number(body.baseline_environment?.aqi ?? 38.0),
          },
          prediction_horizon_minutes: Number(body.horizon_minutes ?? 30),
          include_weather_context: true,
        },
        perturbations: {
          soil_moisture_pct_current: Number(body.counterfactual_adjustments?.soil_moisture_pct ?? 5.0),
          temperature_c_current: Number(body.counterfactual_adjustments?.temperature_c ?? 0.0),
        },
      };
    }

    const mlRes = await fetch(`${ML_SERVICE_URL}/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000),
    });

    if (mlRes.ok) {
      const data = await mlRes.json();
      
      // Normalize schema so UI receives clean typed keys
      const deltaSoil = payload.perturbations.soil_moisture_pct_current ?? 5.0;
      const deltaTemp = payload.perturbations.temperature_c_current ?? 0.0;
      const baselineSoil = payload.base_request.current_environment.soil_moisture;
      const baselineTemp = payload.base_request.current_environment.temperature;

      const response = {
        applied_perturbations: payload.perturbations,
        baseline: data.baseline || {
          soil_moisture_pct: baselineSoil,
          temperature_c: baselineTemp,
        },
        counterfactual_prediction: {
          soil_moisture_pct: {
            value: data.counterfactual?.soil_moisture_pct ?? (baselineSoil + deltaSoil),
          },
          temperature_c: {
            value: data.counterfactual?.temperature_c ?? (baselineTemp + deltaTemp),
          },
        },
        difference: {
          soil_moisture_pct: deltaSoil,
          temperature_c: deltaTemp,
        },
        resource_implications: {
          water_volume_ml: deltaSoil > 0 ? Math.round(deltaSoil * 45) : 0,
          fan_runtime_minutes: deltaTemp < 0 ? Math.round(Math.abs(deltaTemp) * 4) : 0,
        },
        safe_non_actuating: true,
        simulation_engine: "LightGBM Counterfactual Evaluator",
      };

      return NextResponse.json(response);
    } else {
      const errData = await mlRes.json().catch(() => ({}));
      return NextResponse.json(errData, { status: mlRes.status });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Simulation failed or ML service unreachable", details: msg },
      { status: 503 }
    );
  }
}
