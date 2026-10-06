import { NextResponse } from "next/server";
import { getExperimentById } from "@/lib/experimentService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const exp = getExperimentById(id);
    if (!exp) {
      return NextResponse.json({ error: `Experiment not found: ${id}` }, { status: 404 });
    }
    return NextResponse.json({ status: "success", experiment: exp });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to retrieve experiment", details: errorMsg },
      { status: 500 }
    );
  }
}
