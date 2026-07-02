// Admin-only: recompute clean_list_eligible for all prospects using current criteria.
// Also logs a summary row in assistant_action_logs (action_type = recompute_clean_eligibility).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

async function logRun(summary: Record<string, unknown>, status: "success" | "failed", errorMsg?: string) {
  try {
    await admin.from("assistant_action_logs").insert({
      token_id: null,
      action_type: "recompute_clean_eligibility",
      target_table: "prospects",
      target_id: null,
      request_json: null,
      result_json: summary as any,
      status,
      error_message: errorMsg ?? null,
    });
  } catch { /* noop */ }
}

function fail(msg: string, status = 500) {
  return new Response(JSON.stringify({ status: "failed", error_message: msg, timestamp: new Date().toISOString() }), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return fail("Unauthorized", 401);

  const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } });
  const { data: claims, error: claimsErr } = await userClient.auth.getClaims(authHeader.replace("Bearer ", ""));
  if (claimsErr || !claims?.claims?.sub) return fail("Unauthorized", 401);

  const uid = claims.claims.sub as string;
  const { data: isAdmin } = await admin.rpc("has_role", { _user_id: uid, _role: "admin" });
  if (!isAdmin) return fail("Forbidden: admin only", 403);

  try {
    // Pull the fields needed to bucket every row.
    const { data: rows, error: selErr } = await admin
      .from("prospects")
      .select("id, is_test_record, website_review_status, fit_category, lead_score, redesign_score, qualification_status");
    if (selErr) throw new Error(selErr.message);

    const all = rows ?? [];
    const eligibleIds: string[] = [];
    let test_records_excluded = 0;
    let rejected_excluded = 0;
    let pending_review_excluded = 0;
    let reviewed_but_not_eligible = 0;

    for (const p of all) {
      if (p.is_test_record) { test_records_excluded++; continue; }
      const qs = String(p.qualification_status ?? "");
      if (qs.startsWith("rejected")) { rejected_excluded++; continue; }
      if (p.website_review_status !== "reviewed") { pending_review_excluded++; continue; }
      const fitOk = ["A", "B", "C"].includes(String(p.fit_category ?? ""));
      const leadOk = (p.lead_score ?? 0) >= 70;
      const redesignOk = (p.redesign_score ?? 0) >= 70;
      if (fitOk && leadOk && redesignOk) eligibleIds.push(p.id);
      else reviewed_but_not_eligible++;
    }

    // Reset all → false
    const { error: falseErr } = await admin
      .from("prospects")
      .update({ clean_list_eligible: false })
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (falseErr) throw new Error(falseErr.message);

    // Set eligible → true
    if (eligibleIds.length) {
      const { error: trueErr } = await admin
        .from("prospects")
        .update({ clean_list_eligible: true })
        .in("id", eligibleIds);
      if (trueErr) throw new Error(trueErr.message);
    }

    const summary = {
      status: "success" as const,
      total_checked: all.length,
      clean_list_eligible_true: eligibleIds.length,
      clean_list_eligible_false: all.length - eligibleIds.length,
      test_records_excluded,
      rejected_excluded,
      pending_review_excluded,
      reviewed_but_not_eligible,
      last_run_at: new Date().toISOString(),
    };

    await logRun(summary, "success");

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = (e as Error).message ?? "Unknown error";
    await logRun({ error: msg, last_run_at: new Date().toISOString() }, "failed", msg);
    return fail(msg, 500);
  }
});
