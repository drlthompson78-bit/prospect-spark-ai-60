import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { AlertTriangle, Copy, Trash2, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assistant-action`;

type Token = {
  id: string;
  scopes: string[];
  mode: string;
  expires_at: string;
  revoked: boolean;
  created_at: string;
};

type LogRow = {
  id: string; token_id: string | null; action_type: string;
  target_table: string | null; target_id: string | null;
  status: string; error_message: string | null;
  request_json: any; result_json: any; created_at: string;
};

const SCOPE_PRESETS = {
  read: ["read"],
  sandbox: ["read", "sandbox_write", "review_write", "status_write", "scoring_write"],
  production: ["read", "sandbox_write", "review_write", "status_write", "scoring_write", "production_write"],
} as const;

function randomToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}
async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function auditToTxt(data: any): string {
  const lines: string[] = [];
  const push = (s = "") => lines.push(s);
  const section = (title: string, body: any) => {
    push("=".repeat(72));
    push(title.toUpperCase());
    push("=".repeat(72));
    if (body === undefined || body === null) { push("(none)"); push(""); return; }
    if (typeof body === "string") { push(body); push(""); return; }
    try { push(JSON.stringify(body, null, 2)); } catch { push(String(body)); }
    push("");
  };
  push("FULL AUDIT REPORT");
  push(`Generated: ${new Date().toISOString()}`);
  push("");
  const sections = [
    "token_and_mode", "system_health", "prospect_database_summary",
    "google_places_sample", "scoring_formula_tests", "clean_list_recompute_summary",
    "export_eligibility_verification", "security_compliance_checks",
    "recent_action_logs", "batch_readiness", "overall_audit_result",
  ];
  for (const k of sections) section(k, data?.[k]);
  // Include any additional keys not listed above
  for (const k of Object.keys(data ?? {})) {
    if (!sections.includes(k)) section(k, data[k]);
  }
  return lines.join("\n");
}

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}


export default function AssistantAction() {
  const [enabled, setEnabled] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [hours, setHours] = useState(1);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [running, setRunning] = useState<string | null>(null);
  const [scenarioToken, setScenarioToken] = useState("");
  const [scenarioResult, setScenarioResult] = useState<any>(null);
  const [recomputeResult, setRecomputeResult] = useState<any>(null);
  const [maintenanceRuns, setMaintenanceRuns] = useState<LogRow[]>([]);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [cleanSeedResult, setCleanSeedResult] = useState<any>(null);
  const [auditLinks, setAuditLinks] = useState<{ html: string; json: string } | null>(null);
  const [auditData, setAuditData] = useState<any>(null);
  const [auditHtml, setAuditHtml] = useState<string | null>(null);
  const [auditTimestamp, setAuditTimestamp] = useState<string | null>(null);
  const [recomputeProgress, setRecomputeProgress] = useState(0);
  const [recomputeElapsed, setRecomputeElapsed] = useState(0);
  const [recomputeTotal, setRecomputeTotal] = useState<number | null>(null);

  async function loadMaintenance() {
    const { data } = await supabase.from("assistant_action_logs")
      .select("*")
      .in("action_type", ["recompute_clean_eligibility", "verify_clean_eligibility", "verify_export_eligibility", "clean_old_test_seed_records"])
      .order("created_at", { ascending: false }).limit(10);
    setMaintenanceRuns((data ?? []) as LogRow[]);
  }

  async function load() {
    const [s, t, l] = await Promise.all([
      supabase.from("assistant_action_settings").select("action_mode_enabled").eq("id", true).maybeSingle(),
      supabase.from("assistant_test_tokens").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("assistant_action_logs").select("*").order("created_at", { ascending: false }).limit(30),
    ]);
    setEnabled(!!s.data?.action_mode_enabled);
    setTokens((t.data ?? []) as Token[]);
    setLogs((l.data ?? []) as LogRow[]);
  }
  useEffect(() => { load(); loadMaintenance(); }, []);

  async function toggleEnabled(v: boolean) {
    const { data: userRes } = await supabase.auth.getUser();
    const { error } = await supabase.from("assistant_action_settings")
      .upsert({ id: true, action_mode_enabled: v, updated_at: new Date().toISOString(), updated_by: userRes.user?.id ?? null });
    if (error) { toast.error(error.message); return; }
    setEnabled(v);
    toast.success(`Action Mode ${v ? "aan" : "uit"}`);
  }

  async function createToken(kind: "read" | "sandbox" | "production") {
    if (kind === "production" && !confirm("Weet je zeker dat je een PRODUCTION token wilt maken? Dit staat mutaties op echte prospects toe.")) return;
    const token = randomToken();
    const hash = await sha256Hex(token);
    const scopes = [...SCOPE_PRESETS[kind]];
    const mode = kind === "production" ? "production" : "sandbox";
    const expires_at = new Date(Date.now() + hours * 3600 * 1000).toISOString();
    const { data: userRes } = await supabase.auth.getUser();
    const { error } = await supabase.from("assistant_test_tokens").insert({
      token_hash: hash, scopes, mode, expires_at, created_by: userRes.user?.id ?? null, revoked: false,
    });
    if (error) { toast.error(error.message); return; }
    setNewToken(token);
    setScenarioToken(token);
    toast.success(`${mode} token aangemaakt (geldig ${hours}u)`);
    load();
  }

  async function revokeToken(id: string) {
    await supabase.from("assistant_test_tokens").update({ revoked: true }).eq("id", id);
    toast.success("Token ingetrokken");
    load();
  }

  async function callAction(endpoint: string, body?: any, method: "GET" | "POST" = "POST") {
    const url = `${FN_URL}/${endpoint}?token=${encodeURIComponent(scenarioToken)}`;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "POST" ? JSON.stringify(body ?? {}) : undefined,
    });
    return res.json();
  }

  async function runScenario() {
    if (!scenarioToken) { toast.error("Kies of maak eerst een sandbox token"); return; }
    setRunning("scenario");
    const out: any = { steps: [] };
    try {
      const cap = await callAction("capabilities", undefined, "GET");
      out.steps.push({ step: "capabilities", result: cap });

      const created = await callAction("create-test-prospect", {
        company_name: "Loodgieter Demo", segment: "loodgieter", city: "Rotterdam",
        website_url: "https://example.com", raw_opportunity_score: 100,
        qualification_status: "pending_manual_review",
      });
      out.steps.push({ step: "create-test-prospect", result: created });
      const pid = created.prospect_id;

      const reviewHigh = await callAction("review-prospect", {
        prospect_id: pid, visual_age_score: 18, mobile_usability_score: 12, cta_score: 12,
        trust_score: 12, local_seo_score: 8, conversion_opportunity_score: 13, // sum = 75
        review_notes: "Test review high",
      });
      out.steps.push({ step: "review high (redesign=75)", expected: { lead_score: 100, fit: "A" }, result: reviewHigh });

      const created2 = await callAction("create-test-prospect", {
        company_name: "Loodgieter Demo Laag", segment: "loodgieter", city: "Rotterdam",
        website_url: "https://example.com", raw_opportunity_score: 100,
      });
      const pid2 = created2.prospect_id;
      const reviewLow = await callAction("review-prospect", {
        prospect_id: pid2, visual_age_score: 10, mobile_usability_score: 10, cta_score: 10,
        trust_score: 10, local_seo_score: 5, conversion_opportunity_score: 15, // sum = 60
      });
      out.steps.push({ step: "review low (redesign=60)", expected: { fit: "rejected", eligible: false }, result: reviewLow });

      const rej = await callAction("reject-prospect", { prospect_id: pid, reason: "Test reject" });
      out.steps.push({ step: "reject-prospect", result: rej });

      const audit = await callAction("audit-log", undefined, "GET");
      out.steps.push({ step: "audit-log", result: { count: audit?.logs?.length } });
      setScenarioResult(out);
      toast.success("Scenario voltooid");
      load();
    } catch (e: any) {
      toast.error(e.message ?? "Scenario mislukt");
      setScenarioResult({ error: e.message, out });
    } finally { setRunning(null); }
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Assistant Action Mode</h1>
        <p className="text-sm text-muted-foreground">Beveiligde mutatie-endpoints voor een externe AI-assistent. Standaard uit.</p>
        <div className="mt-3 rounded border border-primary/40 bg-primary/5 p-3 text-xs space-y-1">
          <div className="font-semibold text-primary">⚠️ ChatGPT kan Supabase-links niet ophalen ("Failed to fetch / Cache miss")</div>
          <div className="text-muted-foreground">
            Deel géén audit-URL met ChatGPT. Klik op <strong>Generate Full Audit Report</strong>,
            dan op <strong>Download audit JSON</strong> (of TXT), en <strong>upload dat bestand</strong> in het ChatGPT-gesprek.
            Zo krijgt de assistent de volledige inhoud zonder netwerkcall.
          </div>
        </div>
      </div>

      <Card className="p-4 flex items-center justify-between">
        <div>
          <div className="font-medium text-sm">Action Mode</div>
          <div className="text-xs text-muted-foreground">Als uit: alle mutatie-endpoints weigeren met <code>action_mode_disabled</code>.</div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={enabled ? "default" : "outline"}>{enabled ? "enabled" : "disabled"}</Badge>
          <Switch checked={enabled} onCheckedChange={toggleEnabled} />
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="font-medium text-sm">Recompute clean-list eligibility</div>
            <div className="text-xs text-muted-foreground">
              Zet <code>clean_list_eligible</code> voor alle prospects opnieuw op basis van huidige criteria
              (reviewed, redesign≥70, lead≥70, fit A/B/C, geen rejected, geen testrecord).
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            disabled={running === "recompute"}
            onClick={async () => {
              setRunning("recompute");
              setRecomputeResult(null);
              setRecomputeProgress(0);
              setRecomputeElapsed(0);
              setRecomputeTotal(null);

              // Get an estimated total up-front for the live counter
              const { count } = await supabase
                .from("prospects")
                .select("*", { count: "exact", head: true })
                .eq("is_test_record", false);
              setRecomputeTotal(count ?? null);

              const start = Date.now();
              const tick = setInterval(() => {
                const elapsed = (Date.now() - start) / 1000;
                setRecomputeElapsed(elapsed);
                // Asymptotic progress toward 95% (never completes until server responds)
                setRecomputeProgress(Math.min(95, 100 * (1 - Math.exp(-elapsed / 6))));
              }, 200);

              try {
                const { data, error } = await supabase.functions.invoke("recompute-clean-list", { body: {} });
                if (error) throw error;
                if (data?.status !== "success") throw new Error(data?.error_message ?? "Unknown error");
                setRecomputeResult(data);
                setRecomputeProgress(100);
                toast.success(`Herberekend: ${data.clean_list_eligible_true} eligible / ${data.total_checked} totaal`);
              } catch (e: any) {
                setRecomputeResult({ status: "failed", error_message: e.message ?? String(e), timestamp: new Date().toISOString() });
                setRecomputeProgress(0);
                toast.error(e.message ?? "Recompute mislukt");
              } finally {
                clearInterval(tick);
                setRecomputeElapsed((Date.now() - start) / 1000);
                setRunning(null);
                loadMaintenance();
              }
            }}
          >
            {running === "recompute" ? (
              <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Bezig…</>
            ) : "Recompute now"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={running === "recompute" || running === "verify"}
            onClick={async () => {
              setRunning("verify");
              setVerifyResult(null);
              try {
                const { data, error } = await supabase.functions.invoke("verify-export-eligibility", { body: {} });
                if (error) throw error;
                if (data?.status === "failed") throw new Error(data?.error_message ?? "Unknown error");
                setVerifyResult(data);
                if (data.status === "warning") {
                  toast.warning(`Verify: ${data.inconsistencies_found} inconsistentie(s) gevonden`);
                } else {
                  toast.success(`Verify OK: ${data.export_eligible_count} exporteerbaar / ${data.total_prospects_checked} totaal`);
                }
              } catch (e: any) {
                setVerifyResult({ status: "failed", error_message: e.message ?? String(e), timestamp: new Date().toISOString() });
                toast.error(e.message ?? "Verify mislukt");
              } finally { setRunning(null); loadMaintenance(); }
            }}
          >
            {running === "verify" ? (<><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Bezig…</>) : "Verify export eligibility"}
          </Button>
        </div>



        {running === "recompute" && (
          <div className="rounded border border-border p-3 space-y-2 bg-secondary/30">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground">
                Bezig met herberekenen{recomputeTotal !== null ? ` van ~${recomputeTotal} prospects` : ""}…
              </span>
              <span>{recomputeElapsed.toFixed(1)}s · {Math.round(recomputeProgress)}%</span>
            </div>
            <Progress value={recomputeProgress} className="h-2" />
            <div className="text-[11px] text-muted-foreground">
              Live teller: {recomputeTotal !== null
                ? `~${Math.round((recomputeProgress / 100) * recomputeTotal)} / ${recomputeTotal} geschat verwerkt`
                : "totaal onbekend"}
            </div>
          </div>
        )}


        {recomputeResult && recomputeResult.status === "success" && (
          <div className="rounded border border-border p-3 text-xs bg-secondary/40">
            <div className="flex items-center gap-2 mb-2">
              <Badge>success</Badge>
              <span className="text-muted-foreground">last_run_at: {new Date(recomputeResult.last_run_at).toLocaleString()}</span>
            </div>
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 font-mono">
              <div><dt className="text-muted-foreground inline">total_checked: </dt><dd className="inline">{recomputeResult.total_checked}</dd></div>
              <div><dt className="text-muted-foreground inline">clean_list_eligible_true: </dt><dd className="inline">{recomputeResult.clean_list_eligible_true}</dd></div>
              <div><dt className="text-muted-foreground inline">clean_list_eligible_false: </dt><dd className="inline">{recomputeResult.clean_list_eligible_false}</dd></div>
              <div><dt className="text-muted-foreground inline">test_records_excluded: </dt><dd className="inline">{recomputeResult.test_records_excluded}</dd></div>
              <div><dt className="text-muted-foreground inline">rejected_excluded: </dt><dd className="inline">{recomputeResult.rejected_excluded}</dd></div>
              <div><dt className="text-muted-foreground inline">pending_review_excluded: </dt><dd className="inline">{recomputeResult.pending_review_excluded}</dd></div>
              <div><dt className="text-muted-foreground inline">reviewed_but_not_eligible: </dt><dd className="inline">{recomputeResult.reviewed_but_not_eligible}</dd></div>
            </dl>
          </div>
        )}

        {recomputeResult && recomputeResult.status === "failed" && (
          <div className="rounded border border-destructive/40 p-3 text-xs bg-destructive/10 space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="destructive">failed</Badge>
              <span className="text-muted-foreground">{new Date(recomputeResult.timestamp).toLocaleString()}</span>
            </div>
            <div className="font-mono text-destructive">{recomputeResult.error_message}</div>
          </div>
        )}

        {verifyResult && verifyResult.status !== "failed" && (
          <div className={`rounded border p-3 text-xs space-y-2 ${verifyResult.status === "warning" ? "border-yellow-500/40 bg-yellow-500/10" : "border-border bg-secondary/40"}`}>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={verifyResult.status === "warning" ? "secondary" : "default"}>{verifyResult.status}</Badge>
              <span className="text-muted-foreground">last_run_at: {new Date(verifyResult.last_run_at).toLocaleString()}</span>
            </div>
            <div className="text-muted-foreground">{verifyResult.message}</div>
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 font-mono">
              <div><dt className="text-muted-foreground inline">total_prospects_checked: </dt><dd className="inline">{verifyResult.total_prospects_checked}</dd></div>
              <div><dt className="text-muted-foreground inline">export_eligible_count: </dt><dd className="inline">{verifyResult.export_eligible_count}</dd></div>
              <div><dt className="text-muted-foreground inline">blocked_test_records: </dt><dd className="inline">{verifyResult.blocked_test_records}</dd></div>
              <div><dt className="text-muted-foreground inline">blocked_pending_review: </dt><dd className="inline">{verifyResult.blocked_pending_review}</dd></div>
              <div><dt className="text-muted-foreground inline">blocked_rejected: </dt><dd className="inline">{verifyResult.blocked_rejected}</dd></div>
              <div><dt className="text-muted-foreground inline">blocked_low_score: </dt><dd className="inline">{verifyResult.blocked_low_score}</dd></div>
              <div><dt className="text-muted-foreground inline">blocked_missing_review: </dt><dd className="inline">{verifyResult.blocked_missing_review}</dd></div>
              <div><dt className="text-muted-foreground inline">blocked_clean_list_false: </dt><dd className="inline">{verifyResult.blocked_clean_list_false}</dd></div>
              <div><dt className="text-muted-foreground inline">inconsistencies_found: </dt><dd className="inline">{verifyResult.inconsistencies_found}</dd></div>
            </dl>
            {Array.isArray(verifyResult.inconsistencies) && verifyResult.inconsistencies.length > 0 && (
              <div className="pt-2 border-t border-border/60">
                <div className="text-muted-foreground mb-1">Inconsistente prospects (max 20):</div>
                <ul className="space-y-1 font-mono text-[11px]">
                  {verifyResult.inconsistencies.map((i: any, idx: number) => (
                    <li key={idx}>
                      <span className="text-muted-foreground">{i.id.slice(0, 8)}</span>
                      {i.company_name ? ` · ${i.company_name}` : ""} — {i.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {verifyResult && verifyResult.status === "failed" && (
          <div className="rounded border border-destructive/40 p-3 text-xs bg-destructive/10 space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="destructive">failed</Badge>
              <span className="text-muted-foreground">{new Date(verifyResult.timestamp).toLocaleString()}</span>
            </div>
            <div className="font-mono text-destructive">{verifyResult.error_message}</div>
          </div>
        )}
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="font-medium text-sm">Full Audit Report</div>
            <div className="text-xs text-muted-foreground">
              Read-only rapport dat alle system, security, scoring en export checks combineert.
              Toont de HTML-versie op de pagina en biedt JSON + TXT downloads.
              Bevat geen secrets, API keys of volledige telefoonnummers.
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={running === "audit"}
              onClick={async () => {
                setRunning("audit");
                setAuditData(null);
                setAuditHtml(null);
                try {
                  const token = randomToken();
                  const hash = await sha256Hex(token);
                  const expires_at = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
                  const { data: userRes } = await supabase.auth.getUser();
                  const { error } = await supabase.from("assistant_test_tokens").insert({
                    token_hash: hash, scopes: ["read"], mode: "sandbox", expires_at,
                    created_by: userRes.user?.id ?? null, revoked: false,
                  });
                  if (error) throw error;
                  const htmlUrl = `${FN_URL}/full-audit-report?token=${encodeURIComponent(token)}`;
                  const jsonUrl = `${FN_URL}/full-audit-report.json?token=${encodeURIComponent(token)}`;
                  setAuditLinks({ html: htmlUrl, json: jsonUrl });

                  // Fetch both in parallel
                  const [jsonRes, htmlRes] = await Promise.all([
                    fetch(jsonUrl),
                    fetch(htmlUrl),
                  ]);
                  if (!jsonRes.ok) throw new Error(`JSON fetch failed: ${jsonRes.status}`);
                  const jsonData = await jsonRes.json();
                  const htmlText = htmlRes.ok ? await htmlRes.text() : null;
                  setAuditData(jsonData);
                  setAuditHtml(htmlText);
                  setAuditTimestamp(new Date().toISOString());
                  toast.success("Audit rapport gegenereerd");
                  load();
                } catch (e: any) {
                  toast.error(e.message ?? "Kon audit rapport niet genereren");
                } finally { setRunning(null); }
              }}
            >
              {running === "audit" ? (<><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Bezig…</>) : "Generate Full Audit Report"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!auditData}
              onClick={() => {
                if (!auditData) return;
                const ts = (auditTimestamp ?? new Date().toISOString()).replace(/[:.]/g, "-");
                downloadBlob(`audit-report-${ts}.json`, JSON.stringify(auditData, null, 2), "application/json");
              }}
            >
              Download audit JSON
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!auditData}
              onClick={() => {
                if (!auditData) return;
                const ts = (auditTimestamp ?? new Date().toISOString()).replace(/[:.]/g, "-");
                downloadBlob(`audit-report-${ts}.txt`, auditToTxt(auditData), "text/plain;charset=utf-8");
              }}
            >
              Download audit TXT
            </Button>
          </div>
        </div>

        {auditLinks && (
          <div className="space-y-2">
            {[
              { label: "HTML rapport (deel deze link met de assistent)", url: auditLinks.html },
              { label: "Raw JSON endpoint", url: auditLinks.json },
            ].map(({ label, url }) => (
              <div key={label} className="bg-secondary rounded p-2 text-xs space-y-1">
                <div className="text-muted-foreground">{label}</div>
                <div className="flex items-center gap-2">
                  <code className="font-mono break-all flex-1">{url}</code>
                  <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(url); toast.success("Link gekopieerd"); }}>
                    <Copy className="h-3 w-3"/>
                  </Button>
                  <a href={url} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline">Open</Button>
                  </a>
                </div>
              </div>
            ))}
            <div className="text-[11px] text-muted-foreground">
              Alleen leestoegang. Bevat geen secrets of volledige telefoonnummers. Token kan via de tokentabel worden ingetrokken.
            </div>
          </div>
        )}

        {auditHtml && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">HTML-versie:</div>
            <iframe
              title="Full Audit Report"
              srcDoc={auditHtml}
              className="w-full h-[600px] rounded border border-border bg-background"
              sandbox=""
            />
          </div>
        )}

        {auditData && !auditHtml && (
          <pre className="bg-secondary rounded p-3 text-xs overflow-x-auto max-h-96">{JSON.stringify(auditData, null, 2)}</pre>
        )}
      </Card>




      <Card className="p-4 space-y-3">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground">Nieuw token</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label>Geldigheid</Label>
            <Select value={String(hours)} onValueChange={v => setHours(Number(v))}>
              <SelectTrigger className="w-32"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 uur</SelectItem>
                <SelectItem value="24">24 uur</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" variant="outline" onClick={() => createToken("read")}>Read-only token</Button>
          <Button size="sm" onClick={() => createToken("sandbox")}>Sandbox write token</Button>
          <Button size="sm" variant="destructive" onClick={() => createToken("production")}>
            <AlertTriangle className="h-4 w-4 mr-1"/> Production write token
          </Button>
        </div>
        {newToken && (
          <div className="bg-secondary rounded p-3 text-xs">
            <div className="text-muted-foreground mb-1">Kopieer nu — wordt niet nogmaals getoond:</div>
            <div className="flex items-center gap-2">
              <code className="font-mono break-all">{newToken}</code>
              <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(newToken); toast.success("Gekopieerd"); }}>
                <Copy className="h-3 w-3"/>
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Actieve tokens</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-muted-foreground uppercase">
              <tr><th className="text-left p-2">Mode</th><th className="text-left p-2">Scopes</th><th className="text-left p-2">Verloopt</th><th className="text-left p-2">Status</th><th></th></tr>
            </thead>
            <tbody>
              {tokens.map(t => (
                <tr key={t.id} className="border-t">
                  <td className="p-2"><Badge variant={t.mode === "production" ? "destructive" : "secondary"}>{t.mode}</Badge></td>
                  <td className="p-2 font-mono">{(t.scopes ?? []).join(", ")}</td>
                  <td className="p-2">{new Date(t.expires_at).toLocaleString()}</td>
                  <td className="p-2">{t.revoked ? <Badge variant="outline">revoked</Badge> : new Date(t.expires_at).getTime() < Date.now() ? <Badge variant="outline">expired</Badge> : <Badge>active</Badge>}</td>
                  <td className="p-2 text-right">
                    {!t.revoked && <Button size="sm" variant="ghost" onClick={() => revokeToken(t.id)}><Trash2 className="h-3 w-3"/></Button>}
                  </td>
                </tr>
              ))}
              {tokens.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">Nog geen tokens.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground">Testscenario</h2>
        <p className="text-xs text-muted-foreground">Maakt testprospects aan, voert 2 reviews uit (redesign=75 en =60) en rejecteert. Vereist een sandbox-token met alle write-scopes.</p>
        <div>
          <Label>Sandbox token</Label>
          <Input value={scenarioToken} onChange={e => setScenarioToken(e.target.value)} placeholder="plak token..." />
        </div>
        <Button size="sm" onClick={runScenario} disabled={running === "scenario"}>{running === "scenario" ? "Bezig…" : "Run scenario"}</Button>
        {scenarioResult && (
          <pre className="bg-secondary rounded p-3 text-xs overflow-x-auto max-h-96">{JSON.stringify(scenarioResult, null, 2)}</pre>
        )}
      </Card>

      <Card className="p-4 space-y-3">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground">Sandbox GET test links</h2>
        <p className="text-xs text-muted-foreground">
          Deze GET action links zijn <strong>alleen voor sandbox-tests</strong>. Production-write via GET is uitgeschakeld.
          Vul een sandbox token in en kopieer de link.
        </p>
        <div>
          <Label>Sandbox token (voor links)</Label>
          <Input value={scenarioToken} onChange={e => setScenarioToken(e.target.value)} placeholder="plak sandbox token..." />
        </div>
        {[
          { label: "Capabilities", path: `capabilities` },
          { label: "Scoring dry-run (raw=100, redesign=75)", path: `scoring-dry-run-link?raw=100&redesign=75` },
          { label: "Create test prospect", path: `create-test-prospect-link` },
          { label: "Full sandbox scenario", path: `full-sandbox-scenario` },
          { label: "Audit log", path: `audit-log` },
        ].map(({ label, path }) => {
          const sep = path.includes("?") ? "&" : "?";
          const link = `${FN_URL}/${path}${sep}token=${encodeURIComponent(scenarioToken || "<TOKEN>")}`;
          return (
            <div key={label} className="bg-secondary rounded p-2 text-xs space-y-1">
              <div className="text-muted-foreground">{label}</div>
              <div className="flex items-center gap-2">
                <code className="font-mono break-all flex-1">{link}</code>
                <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(link); toast.success("Link gekopieerd"); }}>
                  <Copy className="h-3 w-3"/>
                </Button>
              </div>
            </div>
          );
        })}
      </Card>

      <Card className="p-4">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Action log (laatste 30)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-muted-foreground uppercase">
              <tr><th className="text-left p-2">Tijd</th><th className="text-left p-2">Action</th><th className="text-left p-2">Target</th><th className="text-left p-2">Status</th><th className="text-left p-2">Error</th></tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} className="border-t">
                  <td className="p-2 whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="p-2 font-mono">{l.action_type}</td>
                  <td className="p-2 font-mono text-muted-foreground">{l.target_table ?? "—"}{l.target_id ? ` (${l.target_id.slice(0, 8)})` : ""}</td>
                  <td className="p-2"><Badge variant={l.status === "success" ? "default" : l.status === "blocked" ? "secondary" : "destructive"}>{l.status}</Badge></td>
                  <td className="p-2 text-muted-foreground">{l.error_message ?? "—"}</td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">Nog geen action logs.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Recent maintenance runs (laatste 10)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-muted-foreground uppercase">
              <tr>
                <th className="text-left p-2">Tijd</th>
                <th className="text-left p-2">Action</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Eligible / Total</th>
                <th className="text-left p-2">Excl. (test/rejected/pending/reviewed-not-eligible)</th>
                <th className="text-left p-2">Error</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceRuns.map(r => {
                const s = (r.result_json ?? {}) as any;
                return (
                  <tr key={r.id} className="border-t">
                    <td className="p-2 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="p-2 font-mono">{r.action_type}</td>
                    <td className="p-2"><Badge variant={r.status === "success" ? "default" : "destructive"}>{r.status}</Badge></td>
                    <td className="p-2 font-mono">{s.clean_list_eligible_true ?? "—"} / {s.total_checked ?? "—"}</td>
                    <td className="p-2 font-mono text-muted-foreground">
                      {s.test_records_excluded ?? "—"} / {s.rejected_excluded ?? "—"} / {s.pending_review_excluded ?? "—"} / {s.reviewed_but_not_eligible ?? "—"}
                    </td>
                    <td className="p-2 text-destructive">{r.error_message ?? "—"}</td>
                  </tr>
                );
              })}
              {maintenanceRuns.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">Nog geen maintenance runs.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
