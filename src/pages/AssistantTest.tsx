import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Trash2 } from "lucide-react";

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID as string;
const FN_BASE = `https://${PROJECT_ID}.functions.supabase.co/assistant-test`;

type TokenRow = { id: string; expires_at: string; revoked: boolean; created_at: string };

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const ENDPOINTS: { path: string; label: string; extra?: string }[] = [
  { path: "health", label: "Health" },
  { path: "google-places", label: "Google Places (limit 5)", extra: "query=loodgieter%20Rotterdam&limit=5" },
  { path: "security-audit", label: "Security audit" },
  { path: "whatsapp-export-preview", label: "WhatsApp export preview" },
  { path: "scoring-sample", label: "Scoring sample" },
  { path: "full-report", label: "Full report (HTML)" },
];

type GPPlace = {
  name: string | null; address: string | null; website: string | null;
  phone_masked: string | null; rating: number | null; review_count: number; status: string | null;
  qualification_status: string; exclusion_reason: string | null; recommended_action: string;
  clean_list_eligible: boolean; lead_score_preliminary: number; fit_category: string;
};
type GPSummary = {
  total_results: number; qualified_candidates: number; pending_manual_review: number;
  rejected_missing_website: number; rejected_possible_leadsite: number;
  rejected_directory: number; rejected_other: number;
};

export default function AssistantTest() {
  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [duration, setDuration] = useState("1");
  const [newToken, setNewToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [gpQuery, setGpQuery] = useState("loodgieter Rotterdam");
  const [gpLoading, setGpLoading] = useState(false);
  const [gpSummary, setGpSummary] = useState<GPSummary | null>(null);
  const [gpPlaces, setGpPlaces] = useState<GPPlace[]>([]);

  async function load() {
    const { data } = await supabase
      .from("assistant_test_tokens" as any)
      .select("id, expires_at, revoked, created_at")
      .order("created_at", { ascending: false });
    setTokens((data as any) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function runGooglePlacesTest() {
    if (!newToken) { toast.error("Genereer eerst een testlink"); return; }
    setGpLoading(true);
    try {
      const url = `${FN_BASE}/google-places?token=${encodeURIComponent(newToken)}&query=${encodeURIComponent(gpQuery)}&limit=10`;
      const r = await fetch(url);
      const data = await r.json();
      if (data.error) throw new Error(data.error + (data.detail ? " — " + data.detail : ""));
      setGpSummary(data.summary ?? null);
      setGpPlaces(data.places ?? []);
      toast.success(`${data.summary?.total_results ?? 0} resultaten`);
    } catch (e: any) {
      toast.error(e.message ?? "Test mislukt");
    } finally { setGpLoading(false); }
  }

  async function generate() {
    setLoading(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) { toast.error("Niet ingelogd"); return; }
      const token = randomToken();
      const token_hash = await sha256Hex(token);
      const hours = Number(duration);
      const expires_at = new Date(Date.now() + hours * 3600 * 1000).toISOString();
      const { error } = await supabase.from("assistant_test_tokens" as any).insert({
        token_hash, created_by: userRes.user.id, expires_at,
      });
      if (error) throw error;
      setNewToken(token);
      toast.success("Testlink aangemaakt — kopieer nu, wordt niet opnieuw getoond.");
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Kon token niet aanmaken");
    } finally { setLoading(false); }
  }

  async function revoke(id: string) {
    const { error } = await supabase.from("assistant_test_tokens" as any).update({ revoked: true }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Token ingetrokken"); load(); }
  }

  function buildUrl(path: string, extra?: string) {
    if (!newToken) return "";
    const qp = new URLSearchParams();
    if (extra) extra.split("&").forEach(p => { const [k,v] = p.split("="); qp.set(k, decodeURIComponent(v ?? "")); });
    qp.set("token", newToken);
    return `${FN_BASE}/${path}?${qp.toString()}`;
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">Assistant Test Mode</h1>
        <p className="text-sm text-muted-foreground">Genereer een tijdelijke, read-only auditlink voor een externe AI-assistent.</p>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-muted-foreground">Geldigheid</label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 uur</SelectItem>
                <SelectItem value="24">24 uur</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={generate} disabled={loading}>Generate test link</Button>
        </div>

        {newToken && (
          <div className="space-y-2 border rounded-md p-3 bg-muted/30">
            <div className="text-xs text-muted-foreground">
              Bewaar deze links nu — het token wordt niet opnieuw getoond.
            </div>
            {ENDPOINTS.map(e => {
              const url = buildUrl(e.path, e.extra);
              return (
                <div key={e.path} className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="text-xs font-medium w-full sm:w-56">{e.label}</div>
                  <code className="flex-1 text-[11px] break-all bg-background rounded px-2 py-1 border">{url}</code>
                  <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(url); toast.success("Gekopieerd"); }}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-sm font-medium">Google Places kwalificatie test</div>
            <div className="text-xs text-muted-foreground">Roept /assistant-test/google-places aan en toont qualification per resultaat.</div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input value={gpQuery} onChange={e => setGpQuery(e.target.value)} placeholder="loodgieter Rotterdam" />
          <Button onClick={runGooglePlacesTest} disabled={gpLoading || !newToken}>{gpLoading ? "Bezig…" : "Run test"}</Button>
        </div>
        {!newToken && <div className="text-xs text-muted-foreground">Genereer eerst een testlink hierboven.</div>}
        {gpSummary && (
          <div className="text-xs flex flex-wrap gap-x-4 gap-y-1 border rounded p-2 bg-muted/30">
            <span>Total: <b>{gpSummary.total_results}</b></span>
            <span>Qualified: <b>{gpSummary.qualified_candidates}</b></span>
            <span>Pending review: <b>{gpSummary.pending_manual_review}</b></span>
            <span>Missing website: <b>{gpSummary.rejected_missing_website}</b></span>
            <span>Possible leadsite: <b>{gpSummary.rejected_possible_leadsite}</b></span>
            <span>Directory: <b>{gpSummary.rejected_directory}</b></span>
            <span>Other rejected: <b>{gpSummary.rejected_other}</b></span>
          </div>
        )}
        {gpPlaces.length > 0 && (
          <div className="overflow-x-auto border rounded">
            <table className="w-full text-xs">
              <thead className="bg-secondary text-[10px] uppercase text-muted-foreground">
                <tr>
                  <th className="text-left p-2">Bedrijf</th>
                  <th className="text-left p-2">Website</th>
                  <th className="text-left p-2">Tel</th>
                  <th className="text-left p-2">Qualification</th>
                  <th className="text-left p-2">Fit</th>
                  <th className="text-left p-2">Score</th>
                  <th className="text-left p-2">Clean</th>
                  <th className="text-left p-2">Reason</th>
                  <th className="text-left p-2">Recommended</th>
                </tr>
              </thead>
              <tbody>
                {gpPlaces.map((p, i) => (
                  <tr key={i} className="border-t align-top">
                    <td className="p-2">{p.name ?? "—"}</td>
                    <td className="p-2">{p.website ? <a href={p.website} target="_blank" rel="noreferrer" className="text-accent underline">link</a> : "—"}</td>
                    <td className="p-2">{p.phone_masked ?? "—"}</td>
                    <td className="p-2"><Badge variant={p.qualification_status === "qualified_candidate" ? "default" : p.qualification_status === "pending_manual_review" ? "secondary" : "outline"}>{p.qualification_status}</Badge></td>
                    <td className="p-2">{p.fit_category}</td>
                    <td className="p-2">{p.lead_score_preliminary}</td>
                    <td className="p-2">{p.clean_list_eligible ? "✓" : "—"}</td>
                    <td className="p-2 max-w-[200px] text-muted-foreground">{p.exclusion_reason ?? "—"}</td>
                    <td className="p-2 max-w-[220px]">{p.recommended_action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <div className="text-sm font-medium mb-3">Bestaande tokens</div>
        {tokens.length === 0 && <div className="text-sm text-muted-foreground">Nog geen tokens.</div>}
        <div className="space-y-2">
          {tokens.map(t => {
            const expired = new Date(t.expires_at).getTime() < Date.now();
            const status = t.revoked ? "revoked" : expired ? "expired" : "active";
            return (
              <div key={t.id} className="flex items-center justify-between gap-3 border rounded p-2 text-xs">
                <div className="flex flex-col">
                  <span className="font-mono">{t.id.slice(0, 8)}…</span>
                  <span className="text-muted-foreground">verloopt {new Date(t.expires_at).toLocaleString()}</span>
                </div>
                <Badge variant={status === "active" ? "default" : "secondary"}>{status}</Badge>
                {!t.revoked && !expired && (
                  <Button size="sm" variant="ghost" onClick={() => revoke(t.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="text-xs text-muted-foreground">
        Endpoints zijn read-only. Google Places test is beperkt tot max. 10 resultaten en slaat niets op.
      </div>
    </div>
  );
}
