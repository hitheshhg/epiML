import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/adminAuth";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

export async function GET(req: Request) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || "Admin access required" }, { status: 403 });
  }

  try {
    const [ablationRes, generalizationRes] = await Promise.all([
      fetch(`${ML_SERVICE_URL}/admin/research/ablation`, { signal: AbortSignal.timeout(5000) }),
      fetch(`${ML_SERVICE_URL}/admin/research/generalization`, { signal: AbortSignal.timeout(5000) }),
    ]);

    const ablation = ablationRes.ok ? await ablationRes.json() : null;
    const generalization = generalizationRes.ok ? await generalizationRes.json() : null;

    return NextResponse.json({
      ablation,
      generalization,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to load research benchmarks", details: msg },
      { status: 500 }
    );
  }
}
