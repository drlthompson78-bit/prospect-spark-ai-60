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
import { AlertTriangle, Copy, Trash2 } from "lucide-react";

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

export default function AssistantAction() {
  const [enabled, setEnabled] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [hours, setHours] = useState(1);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [running, setRunning] = useState<string | null>(null);
  const [scenarioToken, setScenarioToken] = useState("");
  const [scenarioResult, setScenarioResult] = useState<any>(null);

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
  useEffect(() => { load(); }, []);

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
    </div>
  );
}
