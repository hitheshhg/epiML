import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  if (!supabase) {
    return NextResponse.json({
      status: "unconfigured",
      configured: false,
      message: "Supabase client is not configured.",
    });
  }

  try {
    // Check if core tables exist by querying limit 1
    const { data: sessionData, error: sessionErr } = await supabase
      .from("monitoring_sessions")
      .select("id")
      .limit(1);

    const { data: profileData, error: profileErr } = await supabase
      .from("plant_profiles")
      .select("id")
      .limit(1);

    const { data: datasetData, error: datasetErr } = await supabase
      .from("verified_dataset")
      .select("id")
      .limit(1);

    const { data: userProfileData, error: userProfileErr } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    const tablesExist = !sessionErr && !profileErr && !datasetErr && !userProfileErr;

    return NextResponse.json({
      status: tablesExist ? "ready" : "pending_migration",
      configured: true,
      tablesExist,
      errors: {
        profiles: userProfileErr ? userProfileErr.message : null,
        monitoring_sessions: sessionErr ? sessionErr.message : null,
        plant_profiles: profileErr ? profileErr.message : null,
        verified_dataset: datasetErr ? datasetErr.message : null,
      },
      dashboardSqlUrl: "https://supabase.com/dashboard/project/qbeqacmwaoufiwhafvyj/sql",
      schemaFile: "supabase/migrations/20261007_chiguru_schema.sql",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      status: "error",
      error: msg,
    });
  }
}
