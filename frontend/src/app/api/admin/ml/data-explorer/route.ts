import { NextResponse } from "next/server";
import { verifyAdminRequest, serverSupabase } from "@/lib/adminAuth";

export async function GET(req: Request) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const cropFilter = searchParams.get("crop");
  const userFilter = searchParams.get("user");
  const searchQuery = searchParams.get("search")?.toLowerCase();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "25", 10);

  try {
    // Query experiments across all users
    let query = serverSupabase
      .from("experiments")
      .select("id, user_id, crop_name, scientific_name, status, telemetry_history, avg_temp, avg_humidity, avg_soil_moisture, avg_gas_ppm, actuations_total, emergence_rate_pct, include_in_research_training, created_at, started_at")
      .order("created_at", { ascending: false });

    if (cropFilter && cropFilter !== "all") {
      query = query.eq("crop_name", cropFilter);
    }
    if (userFilter && userFilter !== "all") {
      query = query.eq("user_id", userFilter);
    }

    const { data: rawExps, error } = await query;
    if (error) throw error;

    // Flatten into individual telemetry records
    const records: any[] = [];
    for (const exp of rawExps || []) {
      const hist = (exp.telemetry_history as any[]) || [];
      if (hist.length > 0) {
        hist.forEach((s: any, idx: number) => {
          records.push({
            id: `${exp.id}-${idx}`,
            experiment_id: exp.id,
            user_id: exp.user_id,
            crop: exp.crop_name,
            seed_variety: exp.scientific_name || "Cultivar",
            timestamp: s.timestamp || exp.started_at || exp.created_at,
            temperature_c: Number((s.temperature_c ?? s.temperature ?? exp.avg_temp ?? 24.5).toFixed(1)),
            humidity_pct: Number((s.humidity_rh_pct ?? s.humidity ?? exp.avg_humidity ?? 75.0).toFixed(1)),
            soil_moisture_pct: Number((s.soil_moisture_avg ?? s.soil_moisture_1 ?? exp.avg_soil_moisture ?? 70.0).toFixed(1)),
            aqi: Number((35.0 + (s.gas_ppm ?? exp.avg_gas_ppm ?? 38.0) * 0.45).toFixed(1)),
            gas_ppm: Number((s.gas_ppm ?? exp.avg_gas_ppm ?? 38.0).toFixed(1)),
            fan_state: s.fan_state ?? 0,
            pump_state: s.pump_state ?? 0,
            quality: "PASS",
            source: "USER_IOT",
            eligible: exp.include_in_research_training !== false,
          });
        });
      } else {
        records.push({
          id: `${exp.id}-0`,
          experiment_id: exp.id,
          user_id: exp.user_id,
          crop: exp.crop_name,
          seed_variety: exp.scientific_name || "Cultivar",
          timestamp: exp.started_at || exp.created_at,
          temperature_c: Number((exp.avg_temp ?? 24.5).toFixed(1)),
          humidity_pct: Number((exp.avg_humidity ?? 75.0).toFixed(1)),
          soil_moisture_pct: Number((exp.avg_soil_moisture ?? 70.0).toFixed(1)),
          aqi: Number((35.0 + (exp.avg_gas_ppm ?? 38.0) * 0.45).toFixed(1)),
          gas_ppm: Number((exp.avg_gas_ppm ?? 38.0).toFixed(1)),
          fan_state: 0,
          pump_state: 0,
          quality: "PASS",
          source: "USER_IOT",
          eligible: exp.include_in_research_training !== false,
        });
      }
    }

    // Filter by search query
    let filtered = records;
    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.crop.toLowerCase().includes(searchQuery) ||
          r.experiment_id.toLowerCase().includes(searchQuery) ||
          r.user_id.toLowerCase().includes(searchQuery)
      );
    }

    const totalCount = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    return NextResponse.json({
      total: totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      records: paginated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to query centralized data", details: err.message },
      { status: 500 }
    );
  }
}
