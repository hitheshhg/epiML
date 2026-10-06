import { NextResponse } from "next/server";
import { fetchNasaPowerContext } from "@/lib/externalDataConnectors";

export async function GET() {
  try {
    const data = await fetchNasaPowerContext();
    return NextResponse.json({ status: "success", data });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
