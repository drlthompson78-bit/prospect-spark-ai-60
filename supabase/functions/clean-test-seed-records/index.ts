// Edge function: clean-test-seed-records
// Admin-only maintenance. Marks legacy fictitious test records correctly as test data.
// Does NOT delete anything and does NOT touch real Google Places prospects
// (unless company_name starts with '[TEST]' or notes contains '[TESTDATA]').
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const started = new Date().toISOString();
  try {
    // Fetch candidates: any of source_type='test_seed', notes contains '[TESTDATA]',
    // company_name starts with '[TEST]'. We do this in a single OR select for efficiency.
    const { data: rows, error } = await admin
      .from("prospects")
      .select("id, source_type, company_name, notes, is_test_record, clean_list_eligible, website_review_status, lead_score, fit_category, qualification_status")
      .or("source_type.eq.test_seed,notes.ilike.%[TESTDATA]%,company_name.ilike.[TEST]%");
    if (error) throw new Error(error.message);

    const candidates = rows ?? [];

    // Safety guard: never touch real google_places records unless they match the
    // explicit [TEST]/[TESTDATA] markers.
    const targets = candidates.filter((p: any) => {
      const name = String(p.company_name ?? "");
      const notes = String(p.notes ?? "");
      const isMarked = name.startsWith("[TEST]") || notes.includes("[TESTDATA]");
      if (p.source_type === "google_places" && !isMarked) return false;
      return true;
    });

    let updated = 0;
    const updated_ids: string[] = [];
    const now = new Date().toISOString();

    for (const p of targets) {
      const patch = {
        is_test_record: true,
        clean_list_eligible: false,
        website_review_status: "pending",
        lead_score: null as number | null,
        fit_category: "rejected",
        qualification_status: "test_seed",
        updated_at: now,
      };
      const { error: upErr } = await admin.from("prospects").update(patch).eq("id", p.id);
      if (!upErr) {
        updated++;
        updated_ids.push(p.id);
      }
    }

    const result = {
      status: "success",
      records_checked: candidates.length,
      records_updated: updated,
      updated_ids,
      last_run_at: now,
      started_at: started,
    };

    await admin.from("assistant_action_logs").insert({
      action_type: "clean_old_test_seed_records",
      status: "success",
      request_json: { source: "assistant_action_page" },
      result_json: result,
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = (e as Error).message ?? "Unknown error";
    await admin.from("assistant_action_logs").insert({
      action_type: "clean_old_test_seed_records",
      status: "failed",
      error_message: msg,
      result_json: { status: "failed", error_message: msg, last_run_at: new Date().toISOString() },
    });
    return new Response(JSON.stringify({ status: "failed", error_message: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
