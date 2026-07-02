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
  "create-test-prospect": "sandbox_write",
  "review-prospect": "review_write",
  "reject-prospect": "status_write",
  "update-prospect-status": "status_write",
};

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

  let body: any = {};
  if (req.method === "POST") {
    try { body = await req.json(); } catch { body = {}; }
  }

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
        const patch = { fit_category: "rejected", lead_score: 0, exclusion_reason: reason };
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
    }

    return err("not_found", "Unknown endpoint", 404);
  } catch (e) {
    const msg = (e as Error).message ?? "Unknown error";
    await logAction({ tokenId: v.tokenId, action_type: endpoint, status: "failed", error_message: msg, request_json: body });
    return j({ status: "failed", error: "internal_error", message: msg }, 500);
  }
});
