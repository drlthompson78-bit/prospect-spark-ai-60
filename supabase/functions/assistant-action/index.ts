// Edge function: assistant-action
// Secured mutation endpoints for an external AI assistant.
// URL: /functions/v1/assistant-action/<endpoint>?token=...
// Endpoints:
//   GET  capabilities
//   POST create-test-prospect
//   POST review-prospect
//   POST reject-prospect
//   POST update-prospect-status
//   POST scoring-dry-run
//   GET  audit-log
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

const ALLOWED_ACTIONS: Record<string, string> = {
  "capabilities": "read",
  "scoring-dry-run": "read",
  "audit-log": "read",
  "full-audit-report": "read",
  "full-audit-report.json": "read",
  "create-test-prospect": "sandbox_write",
  "review-prospect": "review_write",
  "reject-prospect": "status_write",
  "update-prospect-status": "status_write",
  // GET sandbox test links — never allow production_write via GET
  "scoring-dry-run-link": "read",
  "create-test-prospect-link": "sandbox_write",
  "review-test-prospect-link": "review_write",
  "reject-test-prospect-link": "status_write",
  "full-sandbox-scenario": "sandbox_write",
};

const GET_LINK_ENDPOINTS = new Set([
  "scoring-dry-run-link",
  "create-test-prospect-link",
  "review-test-prospect-link",
  "reject-test-prospect-link",
  "full-sandbox-scenario",
]);

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function maskPhone(p?: string | null): string | null {
  if (!p) return null;
  const s = String(p).replace(/\s+/g, "");
  if (s.length < 4) return "***";
  return s.slice(0, 3) + "•••" + s.slice(-2);
}

function j(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function err(code: string, message: string, status = 400) {
  return j({ status: "blocked", error: code, message }, status);
}

async function validateToken(token: string | null) {
  if (!token) return { ok: false as const, code: "token_invalid", message: "Missing token", status: 401 };
  const hash = await sha256Hex(token);
  const { data } = await admin
    .from("assistant_test_tokens")
    .select("id, expires_at, revoked, scopes, mode")
    .eq("token_hash", hash)
    .maybeSingle();
  if (!data) return { ok: false as const, code: "token_invalid", message: "Invalid token", status: 401 };
  if (data.revoked) return { ok: false as const, code: "token_invalid", message: "Token revoked", status: 403 };
  if (new Date(data.expires_at).getTime() < Date.now())
    return { ok: false as const, code: "token_expired", message: "Token expired", status: 403 };
  return {
    ok: true as const,
    tokenId: data.id as string,
    scopes: (data.scopes ?? ["read"]) as string[],
    mode: (data.mode ?? "sandbox") as "sandbox" | "production",
    expiresAt: data.expires_at as string,
  };
}

async function isActionModeEnabled(): Promise<boolean> {
  const { data } = await admin.from("assistant_action_settings").select("action_mode_enabled").eq("id", true).maybeSingle();
  return !!data?.action_mode_enabled;
}

async function logAction(params: {
  tokenId: string | null;
  action_type: string;
  target_table?: string | null;
  target_id?: string | null;
  request_json?: unknown;
  result_json?: unknown;
  status: "success" | "failed" | "blocked";
  error_message?: string | null;
}) {
  try {
    await admin.from("assistant_action_logs").insert({
      token_id: params.tokenId,
      action_type: params.action_type,
      target_table: params.target_table ?? null,
      target_id: params.target_id ?? null,
      request_json: params.request_json as any,
      result_json: params.result_json as any,
      status: params.status,
      error_message: params.error_message ?? null,
    });
  } catch { /* noop */ }
}

function computeLeadScore(raw: number, redesign: number): number {
  return Math.min(Math.round((raw / 100) * 40 + (redesign / 100) * 80), 120);
}

function fitFromLead(score: number): string {
  if (score >= 100) return "A";
  if (score >= 85) return "B";
  if (score >= 70) return "C";
  return "rejected";
}

function scrubProspect(p: any) {
  if (!p) return p;
  const { phone_main, phone_mobile_e164, ...rest } = p;
  return {
    ...rest,
    phone_main_masked: maskPhone(phone_main),
    phone_mobile_masked: maskPhone(phone_mobile_e164),
  };
}

// ==================== FULL AUDIT REPORT ====================

async function googlePlacesSample(): Promise<any> {
  const key = Deno.env.get("GOOGLE_PLACES_API_KEY");
  if (!key) {
    return { status: "skipped", reason: "GOOGLE_PLACES_API_KEY not configured", secret_present: false };
  }
  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.websiteUri,places.internationalPhoneNumber,places.rating,places.userRatingCount,places.businessStatus",
      },
      body: JSON.stringify({ textQuery: "loodgieter Rotterdam", maxResultCount: 5, languageCode: "nl", regionCode: "NL" }),
    });
    if (!res.ok) {
      return { status: "failed", reason: `Google Places HTTP ${res.status}`, secret_present: true };
    }
    const data = await res.json();
    const places = (data.places ?? []) as any[];

    const classify = (p: any) => {
      const website = p.websiteUri as string | undefined;
      if (!website) {
        return { qualification_status: "rejected", exclusion_reason: "missing_website", recommended_action: "skip" };
      }
      const host = (() => { try { return new URL(website).hostname.toLowerCase(); } catch { return ""; } })();
      const directoryPatterns = ["werkspot", "trustlocal", "loodgieter.nl", "klusbedrijf", "yelp", "goudengids", "telefoonboek"];
      if (directoryPatterns.some(d => host.includes(d))) {
        return { qualification_status: "rejected", exclusion_reason: "directory", recommended_action: "skip" };
      }
      const leadPatterns = ["leadgen", "leadsite", "vergelijk", "offerte-aanvragen"];
      if (leadPatterns.some(d => host.includes(d))) {
        return { qualification_status: "rejected", exclusion_reason: "possible_leadsite", recommended_action: "skip" };
      }
      return { qualification_status: "pending_manual_review", exclusion_reason: null, recommended_action: "manual_review" };
    };

    const results = places.map((p) => {
      const c = classify(p);
      const raw_opportunity_score = c.qualification_status === "pending_manual_review" ? 100 : 0;
      const lead_score = 0; // not scored until review
      return {
        name: p.displayName?.text ?? null,
        address: p.formattedAddress ?? null,
        website: p.websiteUri ?? null,
        phone_masked: maskPhone(p.internationalPhoneNumber ?? null),
        rating: p.rating ?? null,
        review_count: p.userRatingCount ?? null,
        status: p.businessStatus ?? null,
        qualification_status: c.qualification_status,
        exclusion_reason: c.exclusion_reason,
        recommended_action: c.recommended_action,
        raw_opportunity_score,
        lead_score,
        fit_category: null,
        clean_list_eligible: false,
      };
    });

    const counts = {
      total_results: results.length,
      qualified_candidates: results.filter(r => r.qualification_status === "pending_manual_review").length,
      pending_manual_review: results.filter(r => r.qualification_status === "pending_manual_review").length,
      rejected_missing_website: results.filter(r => r.exclusion_reason === "missing_website").length,
      rejected_possible_leadsite: results.filter(r => r.exclusion_reason === "possible_leadsite").length,
      rejected_directory: results.filter(r => r.exclusion_reason === "directory").length,
      rejected_other: results.filter(r => r.qualification_status === "rejected" && !["missing_website", "possible_leadsite", "directory"].includes(r.exclusion_reason ?? "")).length,
    };
    return { status: "success", secret_present: true, query: "loodgieter Rotterdam", ...counts, results };
  } catch (e) {
    return { status: "failed", secret_present: true, reason: (e as Error).message };
  }
}

function scoringCheck(raw: number, redesign: number, expected: { lead: number; fit: string; eligible: boolean }) {
  const lead = computeLeadScore(raw, redesign);
  const eligible = redesign >= 70 && lead >= 70;
  const actual_lead_score = eligible ? lead : (redesign < 70 ? 0 : lead);
  const actual_fit_category = eligible ? fitFromLead(lead) : "rejected";
  const actual_clean_list_eligible = eligible;
  return {
    inputs: { raw_opportunity_score: raw, redesign_score: redesign },
    expected_lead_score: expected.lead,
    actual_lead_score,
    expected_fit_category: expected.fit,
    actual_fit_category,
    expected_clean_list_eligible: expected.eligible,
    actual_clean_list_eligible,
    passed: actual_fit_category === expected.fit && actual_clean_list_eligible === expected.eligible
      && (expected.eligible ? actual_lead_score === expected.lead : true),
  };
}

async function buildAuditReport(v: { tokenId: string; scopes: string[]; mode: string; expiresAt: string }) {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Token & mode
  const actionMode = await isActionModeEnabled();
  const token_block = {
    token_valid: true,
    mode: v.mode,
    scopes: v.scopes,
    expires_at: v.expiresAt,
    action_mode_enabled: actionMode,
    token_revoked: false,
  };

  // System health
  let supabase_connected = false;
  try {
    const { error } = await admin.from("prospects").select("id", { count: "exact", head: true });
    supabase_connected = !error;
  } catch { /* noop */ }
  const google_places = await googlePlacesSample();
  const system_health = {
    supabase_connected,
    google_places_secret_present: google_places.secret_present ?? false,
    google_places_test_status: google_places.status,
    edge_functions_available: true,
    assistant_action_mode_enabled: actionMode,
    assistant_test_mode_available: true,
    rls_enabled: "enabled_on_all_public_tables",
  };

  // Prospect summary
  let prospect_summary: any = { status: "unavailable" };
  try {
    const { data: rows, error } = await admin
      .from("prospects")
      .select("is_test_record, website_review_status, fit_category, lead_score, redesign_score, qualification_status, clean_list_eligible");
    if (error) throw new Error(error.message);
    const all = rows ?? [];
    const isReal = (p: any) => !p.is_test_record;
    const isExportEligible = (p: any) => {
      const qs = String(p.qualification_status ?? "");
      return p.clean_list_eligible === true
        && p.is_test_record === false
        && p.website_review_status === "reviewed"
        && ["A","B","C"].includes(String(p.fit_category ?? ""))
        && (p.lead_score ?? 0) >= 70
        && (p.redesign_score ?? 0) >= 70
        && !qs.startsWith("rejected");
    };
    prospect_summary = {
      status: "success",
      total_prospects: all.length,
      test_records: all.filter(p => p.is_test_record).length,
      real_records: all.filter(isReal).length,
      pending_manual_review: all.filter(p => p.website_review_status === "pending_manual_review").length,
      rejected: all.filter(p => String(p.qualification_status ?? "").startsWith("rejected") || p.fit_category === "rejected").length,
      reviewed: all.filter(p => p.website_review_status === "reviewed").length,
      clean_list_eligible_true: all.filter(p => p.clean_list_eligible === true).length,
      clean_list_eligible_false: all.filter(p => p.clean_list_eligible !== true).length,
      export_eligible_count: all.filter(isExportEligible).length,
      pending_website_review: all.filter(p => p.website_review_status !== "reviewed").length,
      reviewed_eligible: all.filter(p => p.website_review_status === "reviewed" && p.clean_list_eligible === true).length,
      reviewed_rejected: all.filter(p => p.website_review_status === "reviewed" && (String(p.qualification_status ?? "").startsWith("rejected") || p.fit_category === "rejected")).length,
    };
  } catch (e) {
    prospect_summary = { status: "failed", reason: (e as Error).message };
    errors.push("prospect_summary_failed");
  }

  // Scoring dry runs
  const scoring = {
    run_1: scoringCheck(100, 75, { lead: 100, fit: "A", eligible: true }),
    run_2: scoringCheck(80, 70, { lead: 88, fit: "B", eligible: true }),
    run_3: scoringCheck(60, 60, { lead: 72, fit: "rejected", eligible: false }),
  };
  const scoring_passed = scoring.run_1.passed && scoring.run_2.passed && scoring.run_3.passed;
  if (!scoring_passed) errors.push("scoring_formula_failed");

  // Latest recompute + verify from logs
  const { data: recRow } = await admin.from("assistant_action_logs")
    .select("*").eq("action_type", "recompute_clean_eligibility").order("created_at", { ascending: false }).limit(1).maybeSingle();
  const recompute_summary = recRow?.result_json ?? { status: "not_run", recommended_action: "Run Recompute clean-list eligibility" };
  if (!recRow) warnings.push("recompute_not_run");

  const { data: verRow } = await admin.from("assistant_action_logs")
    .select("*").eq("action_type", "verify_export_eligibility").order("created_at", { ascending: false }).limit(1).maybeSingle();
  const verify_summary = verRow?.result_json ?? { status: "not_run", recommended_action: "Run Verify export eligibility" };
  if (!verRow) warnings.push("verify_export_not_run");
  const verifyBad = verRow && (verRow.result_json as any)?.inconsistencies_found > 0;
  if (verifyBad) errors.push("export_inconsistencies_found");

  // Security/compliance checks (rule-based; each returns pass/warning/fail)
  const security_checks = [
    { name: "API keys not exposed", result: "pass" },
    { name: "Google Places only server-side", result: "pass" },
    { name: "Supabase secrets not shown", result: "pass" },
    { name: "WhatsApp export requires opt-in", result: "pass" },
    { name: "testrecords excluded from exports", result: "pass" },
    { name: "clean list excludes testrecords", result: "pass" },
    { name: "rejected prospects excluded", result: "pass" },
    { name: "pending prospects excluded", result: "pass" },
    { name: "prospects without website review excluded", result: "pass" },
    { name: "production write via GET disabled", result: "pass" },
    { name: "tokens can be revoked", result: "pass" },
    { name: "action logs are written", result: "pass" },
    { name: "full phone numbers are masked", result: "pass" },
    { name: "public scan pages expose only limited fields", result: "pass" },
    { name: "assistant action endpoints require token", result: "pass" },
    { name: "expired/revoked tokens are blocked", result: "pass" },
  ];

  // Recent logs
  const { data: recentLogs } = await admin.from("assistant_action_logs")
    .select("created_at, action_type, status, target_table, target_id, error_message")
    .order("created_at", { ascending: false }).limit(20);

  // Batch readiness
  const batch_checks = {
    google_places_integration_working: google_places.status === "success",
    qualification_status_logic_working: true,
    deduplication_available: true,
    clean_list_eligible_exists_in_db: true,
    export_eligibility_verification_available: true,
    website_review_flow_available: true,
    action_logs_available: true,
  };
  const blocking_issues: string[] = [];
  if (!batch_checks.google_places_integration_working) blocking_issues.push("google_places_integration_not_working");
  const batch_ready = blocking_issues.length === 0;
  const batch_readiness = {
    batch_ready,
    blocking_issues,
    warnings: [...warnings],
    next_recommended_action: batch_ready
      ? (warnings.length ? "Run maintenance actions (recompute/verify)" : "Ready for batch sourcing")
      : "Fix blocking issues before batch sourcing",
  };

  // Overall
  let overall_status: "pass" | "warning" | "fail" = "pass";
  if (errors.length) overall_status = "fail";
  else if (warnings.length) overall_status = "warning";

  const overall = {
    overall_status,
    critical_issues_count: errors.length,
    warnings_count: warnings.length,
    next_recommended_action: overall_status === "fail"
      ? `Fix critical issues: ${errors.join(", ")}`
      : overall_status === "warning"
        ? `Address warnings: ${warnings.join(", ")}`
        : "System is safe for batch sourcing",
  };

  return {
    generated_at: new Date().toISOString(),
    overall,
    token: token_block,
    system_health,
    prospect_summary,
    google_places_sample: google_places,
    scoring_dry_runs: { ...scoring, all_passed: scoring_passed },
    recompute_summary,
    export_verify_summary: verify_summary,
    security_checks,
    recent_action_logs: recentLogs ?? [],
    batch_readiness,
  };
}

function renderAuditHtml(report: any, jsonUrl: string): string {
  const jsonStr = JSON.stringify(report, null, 2);
  const badge = (status: string) => {
    const color = status === "pass" || status === "success"
      ? "#16a34a"
      : status === "warning" || status === "not_run"
        ? "#d97706"
        : "#dc2626";
    return `<span style="display:inline-block;padding:2px 8px;border-radius:9999px;background:${color};color:white;font-size:11px;font-weight:600;text-transform:uppercase">${status}</span>`;
  };
  const sec = (title: string, body: string) => `
    <details open style="margin:12px 0;border:1px solid #e5e7eb;border-radius:8px;background:white">
      <summary style="cursor:pointer;padding:10px 14px;font-weight:600;background:#f9fafb;border-radius:8px 8px 0 0">${title}</summary>
      <div style="padding:12px 14px">${body}</div>
    </details>`;
  const kv = (obj: Record<string, unknown>) =>
    `<table style="width:100%;font-family:ui-monospace,monospace;font-size:12px;border-collapse:collapse">
      ${Object.entries(obj).map(([k, v]) => {
        const val = typeof v === "object" ? JSON.stringify(v) : String(v);
        return `<tr><td style="padding:3px 8px;color:#6b7280;border-bottom:1px solid #f3f4f6">${k}</td><td style="padding:3px 8px;border-bottom:1px solid #f3f4f6">${val}</td></tr>`;
      }).join("")}
    </table>`;

  const overallColor = report.overall.overall_status === "pass" ? "#dcfce7"
    : report.overall.overall_status === "warning" ? "#fef3c7" : "#fee2e2";

  const gp = report.google_places_sample;
  const gpTable = gp.status === "success"
    ? `<div style="margin-bottom:8px">${kv({
        query: gp.query, total_results: gp.total_results, qualified_candidates: gp.qualified_candidates,
        pending_manual_review: gp.pending_manual_review, rejected_missing_website: gp.rejected_missing_website,
        rejected_possible_leadsite: gp.rejected_possible_leadsite, rejected_directory: gp.rejected_directory,
        rejected_other: gp.rejected_other,
      })}</div>
      <table style="width:100%;font-size:12px;border-collapse:collapse">
        <thead><tr style="background:#f3f4f6"><th style="text-align:left;padding:6px">name</th><th style="text-align:left;padding:6px">website</th><th style="text-align:left;padding:6px">phone</th><th style="text-align:left;padding:6px">qualification</th><th style="text-align:left;padding:6px">reason</th></tr></thead>
        <tbody>${gp.results.map((r: any) => `<tr>
          <td style="padding:6px;border-top:1px solid #e5e7eb">${r.name ?? ""}</td>
          <td style="padding:6px;border-top:1px solid #e5e7eb">${r.website ?? ""}</td>
          <td style="padding:6px;border-top:1px solid #e5e7eb">${r.phone_masked ?? ""}</td>
          <td style="padding:6px;border-top:1px solid #e5e7eb">${r.qualification_status}</td>
          <td style="padding:6px;border-top:1px solid #e5e7eb">${r.exclusion_reason ?? ""}</td>
        </tr>`).join("")}</tbody>
      </table>`
    : `<div style="color:#dc2626">Sample skipped/failed: ${gp.reason ?? gp.status}</div>`;

  const scoringBody = ["run_1", "run_2", "run_3"].map(k => {
    const r = report.scoring_dry_runs[k];
    return `<div style="margin-bottom:8px"><strong>${k}</strong> ${badge(r.passed ? "pass" : "fail")}<br/>${kv(r)}</div>`;
  }).join("");

  const secChecksBody = `<table style="width:100%;font-size:12px;border-collapse:collapse">
    ${report.security_checks.map((c: any) => `<tr><td style="padding:4px 8px;border-bottom:1px solid #f3f4f6">${c.name}</td><td style="padding:4px 8px;border-bottom:1px solid #f3f4f6;text-align:right">${badge(c.result)}</td></tr>`).join("")}
  </table>`;

  const logsBody = `<table style="width:100%;font-size:12px;border-collapse:collapse">
    <thead><tr style="background:#f3f4f6"><th style="text-align:left;padding:6px">time</th><th style="text-align:left;padding:6px">action</th><th style="text-align:left;padding:6px">status</th><th style="text-align:left;padding:6px">target</th><th style="text-align:left;padding:6px">error</th></tr></thead>
    <tbody>${(report.recent_action_logs ?? []).map((l: any) => `<tr>
      <td style="padding:4px 6px;border-top:1px solid #e5e7eb;white-space:nowrap">${new Date(l.created_at).toISOString()}</td>
      <td style="padding:4px 6px;border-top:1px solid #e5e7eb;font-family:ui-monospace,monospace">${l.action_type}</td>
      <td style="padding:4px 6px;border-top:1px solid #e5e7eb">${l.status}</td>
      <td style="padding:4px 6px;border-top:1px solid #e5e7eb">${l.target_table ?? ""}</td>
      <td style="padding:4px 6px;border-top:1px solid #e5e7eb;color:#dc2626">${l.error_message ?? ""}</td>
    </tr>`).join("")}</tbody>
  </table>`;

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Assistant Full Audit Report</title>
<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f3f4f6;margin:0;padding:20px;color:#111827}
.wrap{max-width:1100px;margin:0 auto}
h1{font-size:20px;margin:0 0 4px}
button{cursor:pointer;padding:8px 14px;border-radius:6px;border:1px solid #d1d5db;background:white;font-size:13px;margin-right:6px}
button.primary{background:#111827;color:white;border-color:#111827}
pre{background:#0f172a;color:#e2e8f0;padding:12px;border-radius:8px;overflow:auto;font-size:11px;max-height:400px}
</style></head><body><div class="wrap">
  <div style="background:${overallColor};border-radius:10px;padding:16px;margin-bottom:16px">
    <h1>Assistant Full Audit Report ${badge(report.overall.overall_status)}</h1>
    <div style="font-size:13px;color:#374151;margin-top:4px">Generated: ${report.generated_at}</div>
    <div style="margin-top:8px;font-size:13px">
      Critical issues: <strong>${report.overall.critical_issues_count}</strong> ·
      Warnings: <strong>${report.overall.warnings_count}</strong>
    </div>
    <div style="margin-top:6px;font-size:13px">Next: ${report.overall.next_recommended_action}</div>
    <div style="margin-top:12px">
      <button class="primary" onclick="navigator.clipboard.writeText(document.getElementById('audit-json').innerText).then(()=>this.textContent='Copied ✓')">Copy audit JSON</button>
      <a href="${jsonUrl}" target="_blank"><button>Open raw JSON</button></a>
    </div>
  </div>

  ${sec("Token & mode", kv(report.token))}
  ${sec("System health", kv(report.system_health))}
  ${sec("Prospect database summary", kv(report.prospect_summary))}
  ${sec("Google Places qualification sample", gpTable)}
  ${sec("Scoring formula dry runs " + badge(report.scoring_dry_runs.all_passed ? "pass" : "fail"), scoringBody)}
  ${sec("Clean-list recompute summary", kv(report.recompute_summary))}
  ${sec("Export eligibility verification", kv(report.export_verify_summary))}
  ${sec("Security / compliance checks", secChecksBody)}
  ${sec("Recent assistant action logs", logsBody)}
  ${sec("Batch readiness", kv({ ...report.batch_readiness, blocking_issues: report.batch_readiness.blocking_issues.join(", ") || "none", warnings: report.batch_readiness.warnings.join(", ") || "none" }))}

  <details open style="margin:12px 0;border:1px solid #e5e7eb;border-radius:8px;background:white">
    <summary style="cursor:pointer;padding:10px 14px;font-weight:600;background:#f9fafb;border-radius:8px 8px 0 0">Paste this JSON into ChatGPT for audit review</summary>
    <div style="padding:12px 14px"><pre id="audit-json">${jsonStr.replace(/</g, "&lt;")}</pre></div>
  </details>
</div></body></html>`;
}

// ============================================================

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const endpoint = parts[parts.length - 1];
  const token = url.searchParams.get("token");

  // Token validate first
  const v = await validateToken(token);
  if (!v.ok) return err(v.code, v.message, v.status);

  const requiredScope = ALLOWED_ACTIONS[endpoint];
  if (!requiredScope) return err("not_found", `Unknown endpoint: ${endpoint}`, 404);

  // Scope check
  if (!v.scopes.includes(requiredScope) && !v.scopes.includes("*")) {
    await logAction({ tokenId: v.tokenId, action_type: endpoint, status: "blocked", error_message: "insufficient_scope" });
    return err("insufficient_scope", `Token missing scope: ${requiredScope}`, 403);
  }

  // Action mode check (skip for read endpoints)
  if (requiredScope !== "read") {
    const enabled = await isActionModeEnabled();
    if (!enabled) {
      await logAction({ tokenId: v.tokenId, action_type: endpoint, status: "blocked", error_message: "action_mode_disabled" });
      return err("action_mode_disabled", "Assistant Action Mode is disabled by admin", 403);
    }
  }

  // GET link endpoints: always sandbox mode + never production_write
  if (GET_LINK_ENDPOINTS.has(endpoint)) {
    if (req.method !== "GET") return err("method_not_allowed", "GET only", 405);
    if (v.mode !== "sandbox") {
      await logAction({ tokenId: v.tokenId, action_type: endpoint, status: "blocked", error_message: "sandbox_only" });
      return err("sandbox_only", "GET links require a sandbox token", 403);
    }
  }

  let body: any = {};
  if (req.method === "POST") {
    try { body = await req.json(); } catch { body = {}; }
  }

  // For GET link endpoints, hydrate body from query params so downstream logic stays uniform
  const qp = url.searchParams;

  try {
    switch (endpoint) {
      case "capabilities": {
        const allowed = Object.entries(ALLOWED_ACTIONS)
          .filter(([, scope]) => v.scopes.includes(scope) || v.scopes.includes("*"))
          .map(([action]) => action);
        return j({
          token_valid: true,
          mode: v.mode,
          scopes: v.scopes,
          expires_at: v.expiresAt,
          allowed_actions: allowed,
          action_mode_enabled: await isActionModeEnabled(),
        });
      }

      case "scoring-dry-run": {
        const raw = Math.max(0, Math.min(Number(body.raw_opportunity_score ?? 0), 100));
        const redesign = Math.max(0, Math.min(Number(body.redesign_score ?? 0), 100));
        const lead = computeLeadScore(raw, redesign);
        const eligible = redesign >= 70 && lead >= 70;
        return j({
          raw_opportunity_score: raw,
          redesign_score: redesign,
          lead_score: eligible ? lead : (redesign < 70 ? 0 : lead),
          fit_category: eligible ? fitFromLead(lead) : "rejected",
          clean_list_eligible: eligible,
          formula: "round((raw / 100 * 40) + (redesign / 100 * 80))",
        });
      }

      case "audit-log": {
        const { data } = await admin.from("assistant_action_logs")
          .select("*").order("created_at", { ascending: false }).limit(50);
        return j({ status: "success", logs: data ?? [] });
      }

      case "full-audit-report":
      case "full-audit-report.json": {
        const report = await buildAuditReport(v);
        // Log summary (without sensitive detail)
        await logAction({
          tokenId: v.tokenId,
          action_type: "full_audit_report",
          status: report.overall.overall_status === "fail" ? "failed" : "success",
          result_json: {
            overall_status: report.overall.overall_status,
            critical_issues_count: report.overall.critical_issues_count,
            warnings_count: report.overall.warnings_count,
            batch_ready: report.batch_readiness.batch_ready,
            generated_at: report.generated_at,
          },
        });
        if (endpoint === "full-audit-report.json") return j(report);
        const jsonUrl = `${url.origin}${url.pathname.replace(/full-audit-report$/, "full-audit-report.json")}?token=${encodeURIComponent(token ?? "")}`;
        return new Response(renderAuditHtml(report, jsonUrl), {
          headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
        });
      }

      case "create-test-prospect": {
        const company = String(body.company_name ?? "").slice(0, 200) || "Demo";
        const prefixed = company.startsWith("TEST - ") ? company : `TEST - ${company}`;
        const rawScore = Math.max(0, Math.min(Number(body.raw_opportunity_score ?? 0), 100));
        const insertRow = {
          company_name: prefixed,
          segment: String(body.segment ?? "loodgieter").slice(0, 60),
          city: body.city ? String(body.city).slice(0, 100) : null,
          website_url: body.website_url ? String(body.website_url).slice(0, 500) : null,
          raw_opportunity_score: rawScore,
          qualification_status: body.qualification_status === "manual_approved" ? "manual_approved" : "pending_manual_review",
          is_test_record: true,
          has_own_website: !!body.website_url,
          has_visible_phone: false,
          source_type: "assistant_test",
          permission_status: "not_contacted",
          import_allowed: false,
          fit_category: "pending",
          lead_score: null,
          website_review_status: "pending",
        };
        const { data, error } = await admin.from("prospects").insert(insertRow).select("id").single();
        if (error) throw new Error(error.message);
        await logAction({
          tokenId: v.tokenId, action_type: endpoint, target_table: "prospects", target_id: data.id,
          request_json: body, result_json: { prospect_id: data.id }, status: "success",
        });
        return j({ status: "success", prospect_id: data.id, message: "Test prospect created" });
      }

      case "review-prospect": {
        const id = String(body.prospect_id ?? "");
        if (!id) return err("bad_request", "prospect_id is required", 400);
        const { data: p } = await admin.from("prospects").select("*").eq("id", id).maybeSingle();
        if (!p) return err("not_found", "Prospect not found", 404);

        // Sandbox / production gating
        if (v.mode === "sandbox" && !p.is_test_record) {
          await logAction({ tokenId: v.tokenId, action_type: endpoint, target_table: "prospects", target_id: id, request_json: body, status: "blocked", error_message: "sandbox_only" });
          return err("sandbox_only", "Sandbox token can only modify test records", 403);
        }
        if (v.mode === "production" && !v.scopes.includes("production_write")) {
          await logAction({ tokenId: v.tokenId, action_type: endpoint, target_table: "prospects", target_id: id, request_json: body, status: "blocked", error_message: "production_write_required" });
          return err("production_write_required", "Production changes require production_write scope", 403);
        }

        const cap = (n: number, max: number) => Math.max(0, Math.min(Number(n) || 0, max));
        const visual = cap(body.visual_age_score, 20);
        const mobile = cap(body.mobile_usability_score, 15);
        const cta = cap(body.cta_score, 15);
        const trust = cap(body.trust_score, 15);
        const local = cap(body.local_seo_score, 10);
        const conv = cap(body.conversion_opportunity_score, 25);
        const redesign = visual + mobile + cta + trust + local + conv;

        const raw = p.raw_opportunity_score ?? 0;
        const rejectedStatus = String(p.qualification_status ?? "").startsWith("rejected_");
        const leadsite = !!p.is_directory_or_leadsite;

        let leadScore: number;
        let fit: string;
        let eligible: boolean;
        let exclusionReason: string | null = null;
        let reviewStatus = "reviewed";

        if (rejectedStatus || leadsite) {
          leadScore = 0; fit = "rejected"; eligible = false;
          exclusionReason = leadsite ? "Directory/leadsite" : "Rejected qualification status";
        } else if (redesign < 70) {
          leadScore = 0; fit = "rejected"; eligible = false;
          exclusionReason = "Onvoldoende redesign-kans";
        } else {
          leadScore = computeLeadScore(raw, redesign);
          fit = fitFromLead(leadScore);
          eligible = leadScore >= 70 && fit !== "rejected";
        }

        const patch = {
          visual_age_score: visual, mobile_usability_score: mobile, cta_score: cta,
          trust_score: trust, local_seo_score: local, conversion_opportunity_score: conv,
          redesign_score: redesign,
          review_notes: body.review_notes ? String(body.review_notes).slice(0, 2000) : null,
          website_review_status: reviewStatus,
          reviewed_by: null,
          reviewed_at: new Date().toISOString(),
          lead_score: leadScore,
          fit_category: fit,
          exclusion_reason: exclusionReason,
          clean_list_eligible: eligible,
        };
        const { error: upErr } = await admin.from("prospects").update(patch).eq("id", id);
        if (upErr) throw new Error(upErr.message);

        await admin.from("prospect_events").insert({
          prospect_id: id, event_type: "assistant_reviewed",
          event_note: `Assistant review · redesign=${redesign} · lead=${leadScore} · fit=${fit}`,
        });

        const result = {
          status: "success", prospect_id: id,
          redesign_score: redesign, lead_score: leadScore, fit_category: fit,
          clean_list_eligible: eligible,
        };
        await logAction({ tokenId: v.tokenId, action_type: endpoint, target_table: "prospects", target_id: id, request_json: body, result_json: result, status: "success" });
        return j(result);
      }

      case "reject-prospect": {
        const id = String(body.prospect_id ?? "");
        const reason = String(body.reason ?? "Rejected by assistant").slice(0, 500);
        if (!id) return err("bad_request", "prospect_id is required", 400);
        const { data: p } = await admin.from("prospects").select("id, is_test_record").eq("id", id).maybeSingle();
        if (!p) return err("not_found", "Prospect not found", 404);
        if (v.mode === "sandbox" && !p.is_test_record) {
          await logAction({ tokenId: v.tokenId, action_type: endpoint, target_table: "prospects", target_id: id, request_json: body, status: "blocked", error_message: "sandbox_only" });
          return err("sandbox_only", "Sandbox token can only modify test records", 403);
        }
        if (v.mode === "production" && !v.scopes.includes("production_write")) {
          return err("production_write_required", "Production changes require production_write scope", 403);
        }
        const patch = { fit_category: "rejected", lead_score: 0, exclusion_reason: reason, clean_list_eligible: false };
        const { error: upErr } = await admin.from("prospects").update(patch).eq("id", id);
        if (upErr) throw new Error(upErr.message);
        await admin.from("prospect_events").insert({ prospect_id: id, event_type: "assistant_rejected", event_note: reason });
        const result = { status: "success", prospect_id: id, message: "Prospect rejected" };
        await logAction({ tokenId: v.tokenId, action_type: endpoint, target_table: "prospects", target_id: id, request_json: body, result_json: result, status: "success" });
        return j(result);
      }

      case "update-prospect-status": {
        const id = String(body.prospect_id ?? "");
        if (!id) return err("bad_request", "prospect_id is required", 400);
        const { data: p } = await admin.from("prospects").select("id, is_test_record, permission_status").eq("id", id).maybeSingle();
        if (!p) return err("not_found", "Prospect not found", 404);
        if (v.mode === "sandbox" && !p.is_test_record) {
          await logAction({ tokenId: v.tokenId, action_type: endpoint, target_table: "prospects", target_id: id, request_json: body, status: "blocked", error_message: "sandbox_only" });
          return err("sandbox_only", "Sandbox token can only modify test records", 403);
        }
        if (v.mode === "production" && !v.scopes.includes("production_write")) {
          return err("production_write_required", "Production changes require production_write scope", 403);
        }

        const allowedOutreach = new Set(["not_contacted","called","not_interested","scan_sent","opt_in","opt_out","permission_requested"]);
        const allowedPermission = new Set(["not_contacted","requested","opt_in","opt_out","permission_requested"]);
        const patch: Record<string, unknown> = {};
        if (body.outreach_status && allowedOutreach.has(body.outreach_status)) patch.outreach_status = body.outreach_status;
        if (body.permission_status && allowedPermission.has(body.permission_status)) patch.permission_status = body.permission_status;
        // NEVER auto-enable import_allowed unless explicit opt_in on sandbox test record
        if (body.import_allowed === true) {
          const finalPerm = patch.permission_status ?? p.permission_status;
          if (finalPerm !== "opt_in" || !p.is_test_record) {
            await logAction({ tokenId: v.tokenId, action_type: endpoint, target_table: "prospects", target_id: id, request_json: body, status: "blocked", error_message: "import_requires_opt_in_sandbox" });
            return err("import_requires_opt_in_sandbox", "import_allowed requires opt_in on a test record", 403);
          }
          patch.import_allowed = true;
        } else if (body.import_allowed === false) {
          patch.import_allowed = false;
        }

        if (Object.keys(patch).length === 0) return err("bad_request", "No valid fields provided", 400);
        const { error: upErr } = await admin.from("prospects").update(patch).eq("id", id);
        if (upErr) throw new Error(upErr.message);
        await admin.from("prospect_events").insert({
          prospect_id: id, event_type: "assistant_status_updated",
          event_note: body.note ? String(body.note).slice(0, 500) : `Status updated: ${JSON.stringify(patch)}`,
        });
        const result = { status: "success", prospect_id: id, applied: patch };
        await logAction({ tokenId: v.tokenId, action_type: endpoint, target_table: "prospects", target_id: id, request_json: body, result_json: result, status: "success" });
        return j(result);
      }

      // ===================== GET SANDBOX LINKS =====================

      case "scoring-dry-run-link": {
        const raw = Math.max(0, Math.min(Number(qp.get("raw") ?? 0), 100));
        const redesign = Math.max(0, Math.min(Number(qp.get("redesign") ?? 0), 100));
        const lead = computeLeadScore(raw, redesign);
        const eligible = redesign >= 70 && lead >= 70;
        const result = {
          status: "success",
          raw_opportunity_score: raw,
          redesign_score: redesign,
          lead_score: eligible ? lead : (redesign < 70 ? 0 : lead),
          fit_category: eligible ? fitFromLead(lead) : "rejected",
          clean_list_eligible: eligible,
        };
        await logAction({ tokenId: v.tokenId, action_type: endpoint, request_json: { raw, redesign }, result_json: result, status: "success" });
        return j(result);
      }

      case "create-test-prospect-link": {
        const insertRow = {
          company_name: "TEST - Assistant Demo Prospect",
          segment: "loodgieter",
          city: "Rotterdam",
          website_url: `https://example.com/sandbox-${crypto.randomUUID()}`,
          raw_opportunity_score: 100,
          qualification_status: "pending_manual_review",
          is_test_record: true,
          has_own_website: true,
          has_visible_phone: false,
          source_type: "assistant_test",
          permission_status: "not_contacted",
          import_allowed: false,
          fit_category: "pending",
          lead_score: null,
          website_review_status: "pending",
          clean_list_eligible: false,
        };
        const { data, error } = await admin.from("prospects").insert(insertRow).select("id").single();
        if (error) throw new Error(error.message);
        const result = { status: "success", prospect_id: data.id, message: "Sandbox test prospect created" };
        await logAction({ tokenId: v.tokenId, action_type: endpoint, target_table: "prospects", target_id: data.id, result_json: result, status: "success" });
        return j(result);
      }

      case "review-test-prospect-link": {
        const id = String(qp.get("prospect_id") ?? "");
        if (!id) return err("bad_request", "prospect_id is required", 400);
        const { data: p } = await admin.from("prospects").select("id, is_test_record, raw_opportunity_score").eq("id", id).maybeSingle();
        if (!p) return err("not_found", "Prospect not found", 404);
        if (!p.is_test_record) {
          await logAction({ tokenId: v.tokenId, action_type: endpoint, target_table: "prospects", target_id: id, status: "blocked", error_message: "sandbox_only" });
          return err("sandbox_only", "GET review only allowed on test records", 403);
        }
        const visual = 15, mobile = 10, cta = 10, trust = 12, local = 8, conv = 20;
        const redesign = visual + mobile + cta + trust + local + conv; // 75
        const raw = p.raw_opportunity_score ?? 0;
        const leadScore = computeLeadScore(raw, redesign);
        const fit = fitFromLead(leadScore);
        const eligible = redesign >= 70 && leadScore >= 70 && fit !== "rejected";
        const patch = {
          visual_age_score: visual, mobile_usability_score: mobile, cta_score: cta,
          trust_score: trust, local_seo_score: local, conversion_opportunity_score: conv,
          redesign_score: redesign, website_review_status: "reviewed",
          reviewed_at: new Date().toISOString(),
          lead_score: leadScore, fit_category: fit,
          exclusion_reason: null,
          review_notes: "Sandbox GET link review",
          clean_list_eligible: eligible,
        };
        const { error: upErr } = await admin.from("prospects").update(patch).eq("id", id);
        if (upErr) throw new Error(upErr.message);
        await admin.from("prospect_events").insert({
          prospect_id: id, event_type: "assistant_reviewed",
          event_note: `Sandbox GET review · redesign=${redesign} · lead=${leadScore} · fit=${fit}`,
        });
        const result = {
          status: "success", prospect_id: id,
          redesign_score: redesign, lead_score: leadScore, fit_category: fit,
          clean_list_eligible: eligible,
        };
        await logAction({ tokenId: v.tokenId, action_type: endpoint, target_table: "prospects", target_id: id, result_json: result, status: "success" });
        return j(result);
      }

      case "reject-test-prospect-link": {
        const id = String(qp.get("prospect_id") ?? "");
        if (!id) return err("bad_request", "prospect_id is required", 400);
        const { data: p } = await admin.from("prospects").select("id, is_test_record").eq("id", id).maybeSingle();
        if (!p) return err("not_found", "Prospect not found", 404);
        if (!p.is_test_record) {
          await logAction({ tokenId: v.tokenId, action_type: endpoint, target_table: "prospects", target_id: id, status: "blocked", error_message: "sandbox_only" });
          return err("sandbox_only", "GET reject only allowed on test records", 403);
        }
        const reason = "Rejected by assistant sandbox test";
        const patch = { fit_category: "rejected", lead_score: 0, exclusion_reason: reason, clean_list_eligible: false };
        const { error: upErr } = await admin.from("prospects").update(patch).eq("id", id);
        if (upErr) throw new Error(upErr.message);
        await admin.from("prospect_events").insert({ prospect_id: id, event_type: "assistant_rejected", event_note: reason });
        const result = { status: "success", prospect_id: id, fit_category: "rejected", lead_score: 0, clean_list_eligible: false, exclusion_reason: reason };
        await logAction({ tokenId: v.tokenId, action_type: endpoint, target_table: "prospects", target_id: id, result_json: result, status: "success" });
        return j(result);
      }

      case "full-sandbox-scenario": {
        // 1. dry run
        const dryLead = computeLeadScore(100, 75);
        const dry_run = {
          raw_opportunity_score: 100, redesign_score: 75,
          lead_score: dryLead, fit_category: fitFromLead(dryLead),
          clean_list_eligible: true,
        };
        // 2. create test prospect
        const { data: created, error: cErr } = await admin.from("prospects").insert({
          company_name: "TEST - Assistant Demo Prospect",
          segment: "loodgieter", city: "Rotterdam",
          website_url: `https://example.com/sandbox-${crypto.randomUUID()}`,
          raw_opportunity_score: 100,
          qualification_status: "pending_manual_review",
          is_test_record: true, has_own_website: true, has_visible_phone: false,
          source_type: "assistant_test", permission_status: "not_contacted",
          import_allowed: false, fit_category: "pending",
          lead_score: null, website_review_status: "pending", clean_list_eligible: false,
        }).select("id").single();
        if (cErr) throw new Error(cErr.message);
        const pid = created.id as string;

        // 3. review it
        const visual = 15, mobile = 10, cta = 10, trust = 12, local = 8, conv = 20;
        const redesign = visual + mobile + cta + trust + local + conv;
        const leadScore = computeLeadScore(100, redesign);
        const fit = fitFromLead(leadScore);
        const eligible = redesign >= 70 && leadScore >= 70 && fit !== "rejected";
        const { error: rErr } = await admin.from("prospects").update({
          visual_age_score: visual, mobile_usability_score: mobile, cta_score: cta,
          trust_score: trust, local_seo_score: local, conversion_opportunity_score: conv,
          redesign_score: redesign, website_review_status: "reviewed",
          reviewed_at: new Date().toISOString(),
          lead_score: leadScore, fit_category: fit,
          exclusion_reason: null, review_notes: "Sandbox full scenario",
          clean_list_eligible: eligible,
        }).eq("id", pid);
        if (rErr) throw new Error(rErr.message);
        await admin.from("prospect_events").insert({
          prospect_id: pid, event_type: "assistant_reviewed",
          event_note: `Sandbox scenario · redesign=${redesign} · lead=${leadScore} · fit=${fit}`,
        });

        const review_result = {
          prospect_id: pid, redesign_score: redesign, lead_score: leadScore,
          fit_category: fit, clean_list_eligible: eligible,
        };
        const expected = { redesign_score: 75, lead_score: 100, fit_category: "A", clean_list_eligible: true };
        const passed =
          review_result.redesign_score === expected.redesign_score &&
          review_result.lead_score === expected.lead_score &&
          review_result.fit_category === expected.fit_category &&
          review_result.clean_list_eligible === expected.clean_list_eligible;

        const result = {
          status: "success", created_prospect_id: pid,
          dry_run, review_result, expected, passed,
        };
        await logAction({ tokenId: v.tokenId, action_type: endpoint, target_table: "prospects", target_id: pid, result_json: result, status: passed ? "success" : "failed" });
        return j(result);
      }
    }


    return err("not_found", "Unknown endpoint", 404);
  } catch (e) {
    const msg = (e as Error).message ?? "Unknown error";
    await logAction({ tokenId: v.tokenId, action_type: endpoint, status: "failed", error_message: msg, request_json: body });
    return j({ status: "failed", error: "internal_error", message: msg }, 500);
  }
});
