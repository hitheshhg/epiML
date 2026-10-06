import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Path to software/data directory
const DATA_DIR = path.resolve(process.cwd(), "..", "software", "data");
const LOG_FILE = path.join(DATA_DIR, "log.csv");
const LATEST_FILE = path.join(DATA_DIR, "latest.json");

export async function GET() {
  try {
    // 1. Try reading latest.json first (fastest zero-latency cache)
    if (fs.existsSync(LATEST_FILE)) {
      try {
        const rawJson = fs.readFileSync(LATEST_FILE, "utf-8");
        const data = JSON.parse(rawJson);
        if (data && typeof data === "object") {
          return NextResponse.json({ ...data, is_hardware_live: true });
        }
      } catch {
        // Fall back to log.csv
      }
    }

    // 2. Try reading log.csv
    if (fs.existsSync(LOG_FILE)) {
      const content = fs.readFileSync(LOG_FILE, "utf-8").trim();
      const lines = content.split("\n").filter((l) => l.trim().length > 0);
      if (lines.length > 1) {
        const lastLine = lines[lines.length - 1];
        const parts = lastLine.split(",");
        if (parts.length >= 11) {
          const telemetry = {
            timestamp: parts[0] || new Date().toISOString(),
            mode: parseInt(parts[1], 10) || 0,
            temp1: parseFloat(parts[2]) || 0.0,
            hum1: parseFloat(parts[3]) || 0.0,
            temp2: parseFloat(parts[4]) || 0.0,
            hum2: parseFloat(parts[5]) || 0.0,
            soil1: parseInt(parts[6], 10) || 0,
            soil2: parseInt(parts[7], 10) || 0,
            gas: parseInt(parts[8], 10) || 38,
            pump: parseInt(parts[9], 10) || 0,
            fan: parseInt(parts[10], 10) || 0,
            alert: parseInt(parts[11], 10) || 0,
            reason: parts[12]?.trim() || "SYS: OK",
            is_hardware_live: true,
          };
          return NextResponse.json(telemetry);
        }
      }
    }

    // 3. Realistic fallback data with subtle dynamic oscillation
    const now = Date.now();
    const cycle = (now / 3000) % (2 * Math.PI);
    const mockTelemetry = {
      timestamp: new Date().toISOString(),
      mode: 1, // Default to Germination for rich seedling demo
      temp1: +(27.4 + Math.sin(cycle) * 0.4).toFixed(1),
      hum1: +(64.2 + Math.cos(cycle) * 1.2).toFixed(1),
      temp2: +(28.1 + Math.sin(cycle + 1) * 0.5).toFixed(1),
      hum2: +(68.5 + Math.cos(cycle + 1) * 1.5).toFixed(1),
      soil1: Math.round(52 + Math.sin(cycle) * 4),
      soil2: Math.round(48 + Math.cos(cycle) * 3),
      gas: Math.round(38 + Math.sin(cycle * 0.5) * 3),
      pump: 0,
      fan: 0,
      alert: 0,
      vent_angle: 0,
      cover_angle: 0,
      reason: "SOIL OPTIMAL / TRAY VIGOR: 92%",
      is_hardware_live: false,
    };

    return NextResponse.json(mockTelemetry);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to read telemetry", details: errorMsg },
      { status: 500 }
    );
  }
}
