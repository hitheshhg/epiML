import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "..", "supabase", "migrations", "20261007_chiguru_schema.sql");
    let sqlContent = "";
    if (fs.existsSync(filePath)) {
      sqlContent = fs.readFileSync(filePath, "utf-8");
    } else {
      // Fallback relative to frontend
      const localPath = path.join(process.cwd(), "src", "lib", "supabaseSchema.sql");
      if (fs.existsSync(localPath)) {
        sqlContent = fs.readFileSync(localPath, "utf-8");
      }
    }

    return new NextResponse(sqlContent, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": 'attachment; filename="chiguru_schema.sql"',
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
