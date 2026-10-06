import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve(process.cwd(), "..", "software", "data");
const CMD_FILE = path.join(DATA_DIR, "cmd.txt");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const command = body?.command?.trim();

    if (!command) {
      return NextResponse.json({ error: "Missing command parameter" }, { status: 400 });
    }

    // Ensure software/data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Write command to file for bridge.py to dispatch to Arduino
    fs.writeFileSync(CMD_FILE, command + "\n", "utf-8");

    return NextResponse.json({
      success: true,
      dispatched_command: command,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to dispatch command", details: errorMsg },
      { status: 500 }
    );
  }
}
