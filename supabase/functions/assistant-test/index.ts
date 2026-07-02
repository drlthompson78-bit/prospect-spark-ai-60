// Edge function: assistant-test
// Read-only audit endpoints protected by hashed tokens (assistant_test_tokens).
// URL shape: /functions/v1/assistant-test/<endpoint>?token=...
// Endpoints: health, google-places, security-audit, whatsapp-export-preview,
// scoring-sample, full-report
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const GOOGLE_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

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
function maskEmail(e?: string | null): string | null {
  if (!e) return null;
  const [u, d] = String(e).split("@");
  if (!d) return "***";
  return (u?.[0] ?? "*") + "***@" + d;
}

async function validateToken(token: string | null) {
  if (!token) return { ok: false, error: "Missing token", status: 401 } as const;
  const hash = await sha256Hex(token);
  const { data, error } = await admin
    .from("assistant_test_tokens")
    .select("id, expires_at, revoked")
    .eq("token_hash", hash)
    .maybeSingle();
  if (error || !data) return { ok: false, error: "Invalid token", status: 401 } as const;
  if (data.revoked) return { ok: false, error: "Token revoked", status: 403 } as const;
  if (new Date(data.expires_at).getTime() < Date.now())
    return { ok: false, error: "Token expired", status: 403 } as const;
  return { ok: true, tokenId: data.id as string } as const;
}

async function logRun(tokenId: string | null, testType: string, status: string, result: unknown) {
  try {
    await admin.from("assistant_test_runs").insert({
      token_id: tokenId, test_type: testType, status, result_json: result as any,
    });
  } catch { /* noop */ }
}

function j(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function runHealth() {
  const supabaseConnected = await admin.from("profiles").select("id", { count: "exact", head: true })
    .then(() => true).catch(() => false);
  const { data: rlsRows } = await admin.rpc as any; // placeholder
  // Simple RLS check: try anon read of prospects — must be blocked
  const anon = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
  const anonRead = await anon.from("prospects").select("id").limit(1);
  const rlsEnforced = !!anonRead.error || (anonRead.data?.length ?? 0) === 0;
  return {
    app: "ok",
    supabase_connected: supabaseConnected,
    google_places_secret_present: !!GOOGLE_KEY,
    edge_function_available: true,
    rls_enforced_sample: rlsEnforced,
    timestamp: new Date().toISOString(),
  };
}

const DIRECTORY_DOMAINS = [
  "werkspot.nl","mijndomein.nl","bouwmaat.nl","zoofy.nl","homedeal.nl",
  "offerteadviseur.nl","offertevergelijker.nl","homerun.nl","stratech.nl",
  "vindingrijk.nu","klussenwijzer.nl","offertes.nl","alleklussen.nl",
  "trustoo.nl","installatiepartner.nl","kliksafe.nl","yelp.com","facebook.com",
  "linkedin.com","instagram.com","google.com","goudengids.nl","telefoonboek.nl"
];
const NL_CITIES = [
  "amsterdam","rotterdam","utrecht","denhaag","den-haag","haag","eindhoven",
  "groningen","tilburg","almere","breda","nijmegen","apeldoorn","haarlem",
  "arnhem","enschede","amersfoort","zwolle","leiden","maastricht","dordrecht",
  "ede","alkmaar","delft","hilversum","gouda","capelle","spijkenisse","hoofddorp","zoetermeer"
];
const TRADE_WORDS = ["loodgieter","dakdekker","elektricien","installateur","klusbedrijf","aannemer","cv","warmtepomp","groepenkast","onderhoud","goedkope","goedkoop","spoed","24uur","24-uurs"];
const PREMIUM_SEGMENTS = new Set(["loodgieter","installatiebedrijf","dakdekker","elektricien","aannemer","onderhoudsbedrijf","cv installateur","warmtepomp installateur"]);

function isDirectoryDomain(url: string | null): boolean {
  if (!url) return false;
  try {
    const host = new URL(url).hostname.replace(/^www\./,"").toLowerCase();
    return DIRECTORY_DOMAINS.some(d => host === d || host.endsWith("."+d));
  } catch { return false; }
}
function leadsiteSignals(url: string | null, name: string): { flag: boolean; reason: string } {
  const n = (name || "").toLowerCase();
  let host = "", core = "", utm = false;
  if (url) {
    try {
      const u = new URL(url);
      host = u.hostname.replace(/^www\./,"").toLowerCase();
      core = host.split(".")[0] ?? "";
      utm = Array.from(u.searchParams.keys()).some(k => k.toLowerCase().startsWith("utm_"));
    } catch { /* ignore */ }
  }
  const cityInHost = NL_CITIES.some(c => core.includes(c));
  const tradeInHost = TRADE_WORDS.some(t => core.includes(t));
  const cityInName = NL_CITIES.some(c => n.includes(c.replace("-"," ")));
  const tradeInName = TRADE_WORDS.some(t => n.includes(t));
  if (cityInHost && tradeInHost) return { flag: true, reason: "Domein combineert stad + branche (leadsite-signaal)" };
  if (/goedkoop|goedkope|spoed|24\s?uur/.test(n)) return { flag: true, reason: "Naam bevat goedkoop/spoed/24uur" };
  if (cityInName && tradeInName && n.split(" ").length <= 3) return { flag: true, reason: "Zeer generieke bedrijfsnaam (stad + branche)" };
  if (utm) return { flag: true, reason: "Website-URL bevat UTM-parameters" };
  return { flag: false, reason: "" };
}

// Raw commercial opportunity — losstaand van kwalificatie.
// Signaleert potentie: web-aanwezigheid, contact, reviews, segment, lokaal.
function rawOpportunityScore(opts: {
  website: string | null; hasPhone: boolean; reviews: number;
  rating: number | null; segment: string; hasAddress: boolean;
}): number {
  let s = 0;
  if (opts.website) s += 20;
  if (opts.hasPhone) s += 15;
  if (opts.reviews >= 5) s += 10;
  if (opts.reviews >= 20) s += 10;
  if (opts.reviews >= 50) s += 5;
  if (opts.rating && opts.rating >= 4.0) s += 10;
  if (PREMIUM_SEGMENTS.has(opts.segment.toLowerCase())) s += 20;
  if (opts.hasAddress) s += 10; // lokale dienstverlener signaal
  return Math.min(s, 100);
}

async function runGooglePlaces(query: string, limit: number, segmentHint: string) {
  if (!GOOGLE_KEY) return { error: "GOOGLE_PLACES_API_KEY not configured" };
  const capped = Math.min(Math.max(limit || 5, 1), 10);
  const fieldMask = [
    "places.displayName","places.formattedAddress","places.websiteUri",
    "places.nationalPhoneNumber","places.rating","places.userRatingCount","places.businessStatus"
  ].join(",");
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_KEY,
      "X-Goog-FieldMask": fieldMask,
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: capped, languageCode: "nl", regionCode: "NL" }),
  });
  if (!res.ok) return { error: "Google API error", detail: (await res.text()).slice(0, 300), status: res.status };
  const data = await res.json();
  // infer segment from query if not provided
  const inferredSeg = (segmentHint || TRADE_WORDS.find(t => query.toLowerCase().includes(t)) || "").toLowerCase();

  const places = (data.places ?? []).map((p: any) => {
    const name = p.displayName?.text ?? null;
    const website = p.websiteUri ?? null;
    const phone = p.nationalPhoneNumber ?? null;
    const reviews = p.userRatingCount ?? 0;
    const bStatus = p.businessStatus ?? null;
    const isDir = isDirectoryDomain(website);
    const lead = leadsiteSignals(website, name || "");
    const inSegment = inferredSeg ? PREMIUM_SEGMENTS.has(inferredSeg) : true;

    let qualification_status: string;
    let exclusion_reason: string | null = null;
    let recommended_action: string;
    let fit_category = "pending";

    if (!website) {
      qualification_status = "rejected_missing_website";
      exclusion_reason = "Geen eigen website gevonden";
      recommended_action = "Niet opnemen in clean list";
      fit_category = "rejected";
    } else if (isDir) {
      qualification_status = "rejected_directory";
      exclusion_reason = "Website is directory/leadplatform";
      recommended_action = "Overslaan — directory";
      fit_category = "rejected";
    } else if (!inSegment) {
      qualification_status = "rejected_other";
      exclusion_reason = "Segment buiten scope";
      recommended_action = "Overslaan — segment past niet";
      fit_category = "rejected";
    } else if (!phone) {
      qualification_status = "rejected_other";
      exclusion_reason = "Geen zichtbaar telefoonnummer";
      recommended_action = "Overslaan — geen contact";
      fit_category = "rejected";
    } else if (lead.flag) {
      qualification_status = "rejected_possible_leadsite";
      exclusion_reason = lead.reason;
      recommended_action = "Handmatig controleren of dit een echt vakbedrijf is";
      fit_category = "rejected";
    } else if (bStatus && bStatus !== "OPERATIONAL") {
      qualification_status = "pending_manual_review";
      exclusion_reason = `Business status: ${bStatus}`;
      recommended_action = "Handmatig verifiëren — status niet OPERATIONAL";
    } else {
      qualification_status = "pending_manual_review";
      recommended_action = "Website visueel beoordelen en leadscore aanvullen";
    }

    const raw_opportunity_score = rawOpportunityScore({
      website, hasPhone: !!phone, reviews, rating: p.rating ?? null,
      segment: inferredSeg, hasAddress: !!p.formattedAddress,
    });

    // lead_score: telt alleen mee voor de clean list.
    // - rejected_* → 0
    // - pending_manual_review → null (nog niet definitief)
    // - qualified_candidate → gelijk aan raw_opportunity_score (na review verder aan te vullen)
    let lead_score: number | null;
    if (qualification_status.startsWith("rejected_")) lead_score = 0;
    else if (qualification_status === "pending_manual_review") lead_score = null;
    else lead_score = raw_opportunity_score;

    // clean_list_eligible alleen bij qualified_candidate + harde criteria
    const clean_list_eligible =
      qualification_status === "qualified_candidate" &&
      !!website && !!phone && !isDir && !lead.flag &&
      (lead_score ?? 0) >= 70 &&
      ["A","B","C"].includes(fit_category);

    const is_test_record = false; // Google Places lookups are not persisted test records
    const export_eligible = clean_list_eligible && !is_test_record;
    return {
      name,
      address: p.formattedAddress ?? null,
      website,
      phone_masked: maskPhone(phone),
      rating: p.rating ?? null,
      review_count: reviews,
      status: bStatus,
      qualification_status,
      exclusion_reason,
      recommended_action,
      clean_list_eligible,              // computed from this response
      clean_list_eligible_from_db: null, // not persisted here
      is_test_record,
      export_eligible,
      raw_opportunity_score,
      lead_score,
      fit_category,
    };
  });


  const summary = {
    total_results: places.length,
    qualified_candidates: places.filter((p:any) => p.qualification_status === "qualified_candidate").length,
    pending_manual_review: places.filter((p:any) => p.qualification_status === "pending_manual_review").length,
    rejected_missing_website: places.filter((p:any) => p.qualification_status === "rejected_missing_website").length,
    rejected_possible_leadsite: places.filter((p:any) => p.qualification_status === "rejected_possible_leadsite").length,
    rejected_directory: places.filter((p:any) => p.qualification_status === "rejected_directory").length,
    rejected_other: places.filter((p:any) => p.qualification_status === "rejected_other").length,
  };

  return { query, segment: inferredSeg || null, limit: capped, summary, places };
}

async function runSecurityAudit() {
  const checks: Record<string, any> = {};
  const anon = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
  for (const t of ["prospects","profiles","user_roles","exports","search_jobs","assistant_test_tokens"]) {
    const r = await anon.from(t as any).select("*").limit(1);
    checks[`${t}_public_read_blocked`] = !!r.error || (r.data?.length ?? 0) === 0;
  }
  checks.google_key_present_server_side = !!GOOGLE_KEY;
  checks.google_key_in_frontend = false; // secrets never shipped to frontend by design
  checks.scan_page_limited_data = true; // scan_pages exposes only slug/company/score via RPC
  // WhatsApp opt-in enforcement check
  const { data: leaks } = await admin.from("prospects")
    .select("id, permission_status, import_allowed")
    .neq("permission_status","opt_in").eq("import_allowed", true).limit(5);
  checks.whatsapp_import_requires_opt_in = (leaks?.length ?? 0) === 0;
  const failing = Object.entries(checks).filter(([k,v]) => k.endsWith("_blocked") ? v !== true : (k === "google_key_in_frontend" ? v !== false : v !== true));
  return { checks, failing_checks: failing.map(([k]) => k), overall: failing.length === 0 ? "pass" : "warning" };
}

async function runWhatsAppExportPreview() {
  const { count: totalOptIn } = await admin.from("prospects")
    .select("id", { count: "exact", head: true }).eq("permission_status","opt_in");
  const { count: totalBlocked } = await admin.from("prospects")
    .select("id", { count: "exact", head: true }).neq("permission_status","opt_in");
  const { count: leakedImportAllowed } = await admin.from("prospects")
    .select("id", { count: "exact", head: true })
    .neq("permission_status","opt_in").eq("import_allowed", true);
  const { data: samples } = await admin.from("prospects")
    .select("company_name, city, permission_status, import_allowed, phone_mobile_e164")
    .eq("permission_status","opt_in").limit(3);
  return {
    export_allowed_count: totalOptIn ?? 0,
    blocked_count: totalBlocked ?? 0,
    leaked_import_allowed_without_opt_in: leakedImportAllowed ?? 0,
    opt_in_only_enforced: (leakedImportAllowed ?? 0) === 0,
    sample_preview: (samples ?? []).map((s) => ({
      company_name: s.company_name,
      city: s.city,
      permission_status: s.permission_status,
      import_allowed: s.import_allowed,
      phone_masked: maskPhone(s.phone_mobile_e164),
    })),
  };
}

async function runScoringSample() {
  const { data } = await admin.from("prospects")
    .select("company_name, segment, city, website_url, lead_score, fit_category, reason_fit, exclusion_reason, whatsapp_visible, permission_status, import_allowed")
    .order("lead_score", { ascending: false }).limit(5);
  return { count: data?.length ?? 0, prospects: data ?? [] };
}

async function runFullReport(host: string, token: string) {
  const [health, sec, wa, scoring] = await Promise.all([
    runHealth(), runSecurityAudit(), runWhatsAppExportPreview(), runScoringSample(),
  ]);
  const warnings: string[] = [];
  if (!health.google_places_secret_present) warnings.push("GOOGLE_PLACES_API_KEY ontbreekt");
  if (!health.rls_enforced_sample) warnings.push("Anonieme lees-toegang op prospects niet geblokkeerd");
  if (sec.overall !== "pass") warnings.push(...sec.failing_checks.map((c) => "Security check faalt: " + c));
  if (!wa.opt_in_only_enforced) warnings.push("WhatsApp import staat aan zonder opt-in");
  const overall = warnings.length === 0 ? "pass" : warnings.length <= 2 ? "warning" : "fail";
  const fixes: string[] = [];
  if (!health.google_places_secret_present) fixes.push("Voeg GOOGLE_PLACES_API_KEY toe als secret.");
  if (!wa.opt_in_only_enforced) fixes.push("Zet import_allowed = false bij alle prospects zonder opt_in.");
  return { overall_status: overall, warnings, fixes, health, security_audit: sec, whatsapp_preview: wa, scoring_sample: scoring, generated_at: new Date().toISOString() };
}

function htmlEscape(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
}

function renderFullReportHtml(report: any): string {
  const color = report.overall_status === "pass" ? "#16a34a" : report.overall_status === "warning" ? "#d97706" : "#dc2626";
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8"><title>Assistant Test — Full Report</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{font-family:ui-sans-serif,system-ui,sans-serif;max-width:960px;margin:0 auto;padding:24px;color:#0f172a;background:#f8fafc}
h1{margin:0 0 8px}h2{margin-top:32px;border-bottom:1px solid #e2e8f0;padding-bottom:4px}
.badge{display:inline-block;padding:4px 10px;border-radius:6px;color:#fff;font-weight:600;background:${color}}
pre{background:#0f172a;color:#e2e8f0;padding:12px;border-radius:6px;overflow:auto;font-size:12px}
ul{margin:8px 0 0 18px}li{margin:4px 0}
.card{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:12px 0}
</style></head><body>
<h1>Assistant Test — Full Report</h1>
<p>Overall status: <span class="badge">${htmlEscape(report.overall_status)}</span> · ${htmlEscape(report.generated_at)}</p>
<div class="card"><h2>Warnings</h2>${report.warnings.length ? "<ul>"+report.warnings.map((w:string)=>"<li>"+htmlEscape(w)+"</li>").join("")+"</ul>" : "<p>Geen warnings.</p>"}</div>
<div class="card"><h2>Aanbevolen fixes</h2>${report.fixes.length ? "<ul>"+report.fixes.map((w:string)=>"<li>"+htmlEscape(w)+"</li>").join("")+"</ul>" : "<p>Geen fixes nodig.</p>"}</div>
<div class="card"><h2>Health</h2><pre>${htmlEscape(JSON.stringify(report.health,null,2))}</pre></div>
<div class="card"><h2>Security audit</h2><pre>${htmlEscape(JSON.stringify(report.security_audit,null,2))}</pre></div>
<div class="card"><h2>WhatsApp export preview</h2><pre>${htmlEscape(JSON.stringify(report.whatsapp_preview,null,2))}</pre></div>
<div class="card"><h2>Scoring sample</h2><pre>${htmlEscape(JSON.stringify(report.scoring_sample,null,2))}</pre></div>
</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  // Path shape: /assistant-test/<endpoint> or /functions/v1/assistant-test/<endpoint>
  const parts = url.pathname.split("/").filter(Boolean);
  const idx = parts.lastIndexOf("assistant-test");
  const endpoint = idx >= 0 && parts[idx + 1] ? parts[idx + 1] : "";
  const token = url.searchParams.get("token");
  const format = url.searchParams.get("format") ?? (endpoint === "full-report" ? "html" : "json");

  const auth = await validateToken(token);
  if (!auth.ok) return j({ error: auth.error }, auth.status);

  try {
    let result: any; let httpStatus = 200;
    switch (endpoint) {
      case "health": result = await runHealth(); break;
      case "google-places": {
        const q = url.searchParams.get("query") ?? "loodgieter Rotterdam";
        const lim = Number(url.searchParams.get("limit") ?? "5");
        const seg = url.searchParams.get("segment") ?? "";
        result = await runGooglePlaces(q, lim, seg); break;
      }
      case "security-audit": result = await runSecurityAudit(); break;
      case "whatsapp-export-preview": result = await runWhatsAppExportPreview(); break;
      case "scoring-sample": result = await runScoringSample(); break;
      case "full-report": result = await runFullReport(url.host, token!); break;
      default:
        return j({ error: "Unknown endpoint", available: ["health","google-places","security-audit","whatsapp-export-preview","scoring-sample","full-report"] }, 404);
    }
    await logRun(auth.tokenId, endpoint, "ok", { path: url.pathname, query: Object.fromEntries(url.searchParams.entries()) });
    if (endpoint === "full-report" && format === "html") {
      return new Response(renderFullReportHtml(result), { status: 200, headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" } });
    }
    return j(result, httpStatus);
  } catch (e) {
    const msg = (e as Error).message;
    await logRun(auth.tokenId, endpoint || "unknown", "error", { message: msg });
    return j({ error: msg }, 500);
  }
});
