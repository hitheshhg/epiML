import { NextResponse } from "next/server";
import { fetchGbifSpecies } from "@/lib/externalDataConnectors";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "tomato";
    const data = await fetchGbifSpecies(query);
    return NextResponse.json({ status: "success", data });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
