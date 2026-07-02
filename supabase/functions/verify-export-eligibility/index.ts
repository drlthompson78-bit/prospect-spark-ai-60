// Admin-only: read-only verification that exports only include clean prospects.
// Logs a summary row in assistant_action_logs (action_type = verify_export_eligibility).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

async function logRun(summary: Record<string, unknown>, status: "success" | "warning" | "failed", errorMsg?: string) {
  try {
    await admin.from("assistant_action_logs").insert({
      token_id: null,
      action_type: "verify_export_eligibility",
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
    const { data: rows, error: selErr } = await admin
      .from("prospects")
      .select("id, company_name, is_test_record, clean_list_eligible, website_review_status, fit_category, lead_score, redesign_score, qualification_status");
    if (selErr) throw new Error(selErr.message);

    const all = rows ?? [];
    let export_eligible_count = 0;
    let blocked_test_records = 0;
    let blocked_pending_review = 0;
    let blocked_rejected = 0;
    let blocked_low_score = 0;
    let blocked_missing_review = 0;
    let blocked_clean_list_false = 0;
    const inconsistencies: { id: string; company_name: string | null; reason: string }[] = [];

    const isEligible = (p: any) => {
      const qs = String(p.qualification_status ?? "");
      return p.clean_list_eligible === true
        && p.is_test_record === false
        && p.website_review_status === "reviewed"
        && ["A", "B", "C"].includes(String(p.fit_category ?? ""))
        && (p.lead_score ?? 0) >= 70
        && (p.redesign_score ?? 0) >= 70
        && !qs.startsWith("rejected");
    };

    for (const p of all) {
      const qs = String(p.qualification_status ?? "");
      const fitOk = ["A", "B", "C"].includes(String(p.fit_category ?? ""));
      const leadOk = (p.lead_score ?? 0) >= 70;
      const redesignOk = (p.redesign_score ?? 0) >= 70;

      // Bucket blocked reasons (mutually cumulative for reporting)
      if (p.is_test_record) blocked_test_records++;
      if (p.website_review_status === "pending_manual_review") blocked_pending_review++;
      if (qs.startsWith("rejected") || p.fit_category === "rejected") blocked_rejected++;
      if (!leadOk || !redesignOk) blocked_low_score++;
      if (p.website_review_status !== "reviewed") blocked_missing_review++;
      if (p.clean_list_eligible !== true) blocked_clean_list_false++;

      if (isEligible(p)) export_eligible_count++;

      // Inconsistency checks (only for prospects flagged clean_list_eligible=true)
      if (p.clean_list_eligible === true) {
        if (p.is_test_record === true) {
          inconsistencies.push({ id: p.id, company_name: p.company_name, reason: "clean_list_eligible=true but is_test_record=true" });
        }
        if (p.website_review_status !== "reviewed") {
          inconsistencies.push({ id: p.id, company_name: p.company_name, reason: `clean_list_eligible=true but website_review_status=${p.website_review_status ?? "null"}` });
        }
        if (p.lead_score == null || p.lead_score < 70) {
          inconsistencies.push({ id: p.id, company_name: p.company_name, reason: `clean_list_eligible=true but lead_score=${p.lead_score ?? "null"}` });
        }
        if (!fitOk) {
          inconsistencies.push({ id: p.id, company_name: p.company_name, reason: `clean_list_eligible=true but fit_category=${p.fit_category ?? "null"}` });
        }
        if (qs.startsWith("rejected")) {
          inconsistencies.push({ id: p.id, company_name: p.company_name, reason: `clean_list_eligible=true but qualification_status=${qs}` });
        }
      }
      // Extra: test record that would pass export criteria if is_test_record were ignored
      if (p.is_test_record === true) {
        const wouldPass = p.clean_list_eligible === true
          && p.website_review_status === "reviewed"
          && fitOk && leadOk && redesignOk && !qs.startsWith("rejected");
        if (wouldPass) {
          inconsistencies.push({ id: p.id, company_name: p.company_name, reason: "test record would be export_eligible if is_test_record were ignored" });
        }
      }
    }

    const inconsistencies_found = inconsistencies.length;
    const status: "success" | "warning" = inconsistencies_found > 0 ? "warning" : "success";

    const summary = {
      status,
      message: status === "success"
        ? "Export eligibility verified. No unsafe export records found."
        : `Found ${inconsistencies_found} inconsistency/inconsistencies.`,
      total_prospects_checked: all.length,
      export_eligible_count,
      blocked_test_records,
      blocked_pending_review,
      blocked_rejected,
      blocked_low_score,
      blocked_missing_review,
      blocked_clean_list_false,
      inconsistencies_found,
      inconsistencies: inconsistencies.slice(0, 20),
      last_run_at: new Date().toISOString(),
    };

    await logRun(summary, status);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = (e as Error).message ?? "Unknown error";
    await logRun({ error: msg, last_run_at: new Date().toISOString() }, "failed", msg);
    return fail(msg, 500);
  }
});
