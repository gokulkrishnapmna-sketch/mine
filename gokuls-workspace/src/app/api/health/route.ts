import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "gokuls-workspace",
    mode: isSupabaseConfigured ? "supabase" : "demo",
    time: new Date().toISOString(),
  });
}
