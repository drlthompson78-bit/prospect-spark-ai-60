import { Fragment, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fitBadgeClass, SEGMENTS } from "@/lib/scoring";
import { Link } from "react-router-dom";
import { ExternalLink, Download, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

// Mask phone: keep first 6 chars, append ***.
function maskPhone(p: string | null | undefined): string {
  if (!p) return "";
  const s = String(p).trim();
  if (s.length <= 6) return s + "***";
  return s.slice(0, 6) + "***";
}

function csvEscape(v: any): string {
  if (v === null || v === undefined) return "";
  const s = typeof v === "string" ? v : (typeof v === "object" ? JSON.stringify(v) : String(v));
  if (/[",\n\r;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function buildCsv(rows: any[], columns: string[]): string {
  const header = columns.join(",");
  const body = rows.map(r => columns.map(c => csvEscape(r[c])).join(",")).join("\n");
  return header + "\n" + body + "\n";
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function tsStamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

async function logExport(action_type: string, count: number, extra: any = {}) {
  await supabase.from("assistant_action_logs").insert({
    action_type,
    status: "success",
    request_json: { source: "prospects_page", ...extra },
    result_json: { exported_count: count },
  });
}

// ============ CATEGORY PREDICATES ============
const TEST_SOURCES = ["test_seed", "assistant_test", "sandbox"];

function isTestOrSandbox(p: any): boolean {
  return p.is_test_record === true || TEST_SOURCES.includes(String(p.source_type ?? ""));
}

function isRejectedDebug(p: any): boolean {
  if (isTestOrSandbox(p)) return true;
  const qs = String(p.qualification_status ?? "");
  if (qs.startsWith("rejected")) return true;
  if (p.fit_category === "rejected") return true;
  if (!p.website_url) return true;
  return false;
}

function isReviewQueue(p: any): boolean {
  if (isTestOrSandbox(p)) return false;
  if (!p.website_url) return false;
  const qs = String(p.qualification_status ?? "");
  if (qs.startsWith("rejected")) return false;
  if (qs !== "pending_manual_review") return false;
  if (p.fit_category !== "pending") return false;
  if (p.clean_list_eligible === true) return false;
  if (p.lead_score !== null && p.lead_score !== undefined) return false;
  return true;
}

function isCleanOutreach(p: any): boolean {
  if (isTestOrSandbox(p)) return false;
  if (String(p.qualification_status ?? "").startsWith("rejected")) return false;
  return (
    p.clean_list_eligible === true &&
    p.website_review_status === "reviewed" &&
    ["A", "B", "C"].includes(p.fit_category) &&
    (p.lead_score ?? 0) >= 70 &&
    (p.redesign_score ?? 0) >= 70
  );
}

// ============ EXPORT COLUMNS ============
const REVIEW_QUEUE_COLUMNS = [
  "search_job_id","source_query","target_city","target_segment","actual_city","location_match",
  "company_name","segment","city","address","website_url",
  "phone_main_masked","phone_mobile_masked","whatsapp_visible",
  "google_rating","google_review_count","qualification_status",
  "raw_opportunity_score","website_review_status","fit_category",
  "clean_list_eligible","source_type","created_at","notes",
];

const CLEAN_COLUMNS = [
  "id","search_job_id","source_query","target_city","actual_city","location_match",
  "company_name","segment","city","address","website_url",
  "phone_main_masked","phone_mobile_masked","whatsapp_visible",
  "google_rating","google_review_count","raw_opportunity_score",
  "redesign_score","lead_score","fit_category","clean_list_eligible",
  "reason_fit","notes","created_at",
];

const DEBUG_COLUMNS = [
  "id","search_job_id","source_query","target_city","target_segment","actual_city","location_match",
  "company_name","segment","city","address","website_url",
  "phone_main_masked","phone_mobile_masked","whatsapp_visible",
  "google_rating","google_review_count","qualification_status","exclusion_reason",
  "raw_opportunity_score","website_review_status",
  "visual_age_score","mobile_usability_score","cta_score","trust_score",
  "local_seo_score","conversion_opportunity_score","redesign_score",
  "lead_score","fit_category","clean_list_eligible","is_test_record",
  "source_type","source_url","created_at","updated_at","notes",
];

function toExportRow(p: any) {
  return {
    ...p,
    phone_main_masked: maskPhone(p.phone_main),
    phone_mobile_masked: maskPhone(p.phone_mobile_e164),
  };
}


export default function Prospects() {
  const [prospects, setProspects] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [f, setF] = useState({ region: "all", segment: "all", fit: "all", whatsapp: "all", permission: "all", review: "all", q: "", target_city: "all", actual_city: "all", source_query: "all", search_job: "all" });

  useEffect(() => {
    supabase.from("regions").select("*").order("region_order").then(({ data }) => setRegions(data ?? []));
    // Testrecords worden altijd uitgesloten uit de fetch. Rejected records worden client-side gefilterd via de "Toon rejected/debug" toggle.
    supabase.from("prospects").select("*")
      .eq("is_test_record", false)
      .not("source_type", "in", "(test_seed,assistant_test,sandbox)")
      .limit(2000)
      .then(({ data }) => setProspects(data ?? []));
  }, []);


  const regionMap = useMemo(() => Object.fromEntries(regions.map(r => [r.id, r])), [regions]);

  // ============ COUNTS ============
  const counts = useMemo(() => {
    let reviewQueue = 0, cleanOutreach = 0, rejectedHidden = 0, testHidden = 0, usable = 0;
    for (const p of prospects) {
      if (isTestOrSandbox(p)) { testHidden++; continue; }
      if (isReviewQueue(p)) { reviewQueue++; usable++; continue; }
      if (isCleanOutreach(p)) { cleanOutreach++; usable++; continue; }
      if (isRejectedDebug(p)) { rejectedHidden++; continue; }
    }
    return { reviewQueue, cleanOutreach, rejectedHidden, testHidden, usable };
  }, [prospects]);

  const filtered = useMemo(() => {
    let list = prospects.filter(p => {
      // Default: alleen bruikbare prospects (review queue OR clean/outreach).
      // Wanneer showDebug aan staat: toon ook rejected/debug (maar nog steeds geen testrecords — die zijn uit de fetch geweerd).
      if (!showDebug) {
        if (!(isReviewQueue(p) || isCleanOutreach(p))) return false;
      }

      if (f.region !== "all" && p.region_id !== f.region) return false;
      if (f.segment !== "all" && p.segment !== f.segment) return false;
      if (f.fit !== "all" && p.fit_category !== f.fit) return false;
      if (f.whatsapp === "yes" && !p.whatsapp_visible) return false;
      if (f.whatsapp === "no" && p.whatsapp_visible) return false;
      if (f.permission !== "all" && p.permission_status !== f.permission) return false;
      if (f.review === "pending" && p.website_review_status === "reviewed") return false;
      if (f.review === "reviewed_eligible" && !(p.website_review_status === "reviewed" && (p.redesign_score ?? 0) >= 70 && ["A","B","C"].includes(p.fit_category))) return false;
      if (f.review === "reviewed_rejected" && !(p.website_review_status === "reviewed" && (p.fit_category === "rejected" || (p.redesign_score ?? 0) < 70))) return false;

      if (f.q && !(`${p.company_name} ${p.city ?? ""}`.toLowerCase().includes(f.q.toLowerCase()))) return false;
      return true;
    });
    const fitRank = (fit: string) => fit === "A" ? 0 : fit === "B" ? 1 : fit === "C" ? 2 : 3;
    list.sort((a, b) => {
      const ra = regionMap[a.region_id]?.region_order ?? 999;
      const rb = regionMap[b.region_id]?.region_order ?? 999;
      if (ra !== rb) return ra - rb;
      if ((b.lead_score ?? -1) !== (a.lead_score ?? -1)) return (b.lead_score ?? -1) - (a.lead_score ?? -1);
      const fr = fitRank(a.fit_category) - fitRank(b.fit_category);
      if (fr !== 0) return fr;
      if (a.whatsapp_visible !== b.whatsapp_visible) return b.whatsapp_visible ? 1 : -1;
      return (b.google_review_count ?? 0) - (a.google_review_count ?? 0);
    });
    return list;
  }, [prospects, f, regionMap, showDebug]);

  const grouped = useMemo(() => {
    const g = new Map<string, any[]>();
    for (const p of filtered) {
      const key = p.region_id ?? "none";
      if (!g.has(key)) g.set(key, []);
      g.get(key)!.push(p);
    }
    return Array.from(g.entries());
  }, [filtered]);

  // ============ EXPORT HANDLERS ============
  async function handleExportReviewQueue() {
    const rows = prospects.filter(isReviewQueue).map(toExportRow);
    if (rows.length === 0) { toast.error("No records match the export criteria."); return; }
    downloadCsv(`review-queue-prospects-${tsStamp()}.csv`, buildCsv(rows, REVIEW_QUEUE_COLUMNS));
    await logExport("export_review_queue_csv", rows.length);
    toast.success(`CSV export generated successfully. (${rows.length} records)`);
  }

  async function handleExportCleanOutreach() {
    const rows = prospects.filter(isCleanOutreach).map(toExportRow);
    if (rows.length === 0) { toast.error("No records match the export criteria."); return; }
    downloadCsv(`clean-outreach-prospects-${tsStamp()}.csv`, buildCsv(rows, CLEAN_COLUMNS));
    await logExport("export_clean_outreach_csv", rows.length);
    toast.success(`CSV export generated successfully. (${rows.length} records)`);
  }

  async function handleExportRawDebug() {
    if (!confirm("Deze export bevat ook rejected/debug records en is niet bedoeld voor outreach. Doorgaan?")) return;
    // Debug export: alle zichtbare records inclusief rejected (testrecords zijn al uit de fetch geweerd).
    const rows = prospects.map(toExportRow);
    if (rows.length === 0) { toast.error("No records match the export criteria."); return; }
    downloadCsv(`raw-debug-prospects-${tsStamp()}.csv`, buildCsv(rows, DEBUG_COLUMNS));
    await logExport("export_raw_debug_csv", rows.length);
    toast.success(`CSV export generated successfully. (${rows.length} records)`);
  }

  return (
    <div className="p-8">
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Prospect Master</h1>
          <p className="text-sm text-muted-foreground">
            Bruikbare prospects: <b>{counts.usable}</b> · In review queue: <b>{counts.reviewQueue}</b> · Clean/outreach ready: <b>{counts.cleanOutreach}</b> · Rejected verborgen: <b>{counts.rejectedHidden}</b> · Testrecords verborgen: <b>{counts.testHidden}</b>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={handleExportReviewQueue} title="Alleen prospects met qualification_status = pending_manual_review, met website. Geen rejected of testrecords.">
            <Download className="h-3 w-3 mr-1" /> Export review queue CSV
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportCleanOutreach} title="Alleen reviewed prospects met fit A/B/C, lead ≥ 70, redesign ≥ 70, niet-rejected en geen testrecords.">
            <Download className="h-3 w-3 mr-1" /> Export clean/outreach CSV
          </Button>
        </div>
      </div>


      <Card className="p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <Input placeholder="Zoek naam / stad" value={f.q} onChange={e => setF({...f, q: e.target.value})}/>
          <Select value={f.region} onValueChange={v => setF({...f, region: v})}>
            <SelectTrigger><SelectValue placeholder="Regio"/></SelectTrigger>
            <SelectContent><SelectItem value="all">Alle regio's</SelectItem>{regions.map(r => <SelectItem key={r.id} value={r.id}>R{String(r.region_order).padStart(2,"0")}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={f.segment} onValueChange={v => setF({...f, segment: v})}>
            <SelectTrigger><SelectValue placeholder="Segment"/></SelectTrigger>
            <SelectContent><SelectItem value="all">Alle segmenten</SelectItem>{SEGMENTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={f.fit} onValueChange={v => setF({...f, fit: v})}>
            <SelectTrigger><SelectValue placeholder="Fit"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle fits</SelectItem>
              <SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem><SelectItem value="C">C</SelectItem>
              <SelectItem value="pending">Pending</SelectItem><SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={f.whatsapp} onValueChange={v => setF({...f, whatsapp: v})}>
            <SelectTrigger><SelectValue placeholder="WhatsApp"/></SelectTrigger>
            <SelectContent><SelectItem value="all">Alle</SelectItem><SelectItem value="yes">WhatsApp zichtbaar</SelectItem><SelectItem value="no">Geen WhatsApp</SelectItem></SelectContent>
          </Select>
          <Select value={f.permission} onValueChange={v => setF({...f, permission: v})}>
            <SelectTrigger><SelectValue placeholder="Permission"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="not_contacted">Not contacted</SelectItem>
              <SelectItem value="requested">Requested</SelectItem>
              <SelectItem value="opt_in">Opt-in</SelectItem>
              <SelectItem value="opt_out">Opt-out</SelectItem>
            </SelectContent>
          </Select>
          <Select value={f.review} onValueChange={v => setF({...f, review: v})}>
            <SelectTrigger><SelectValue placeholder="Website review"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle reviews</SelectItem>
              <SelectItem value="pending">Pending website review</SelectItem>
              <SelectItem value="reviewed_eligible">Reviewed eligible</SelectItem>
              <SelectItem value="reviewed_rejected">Reviewed rejected</SelectItem>
            </SelectContent>
          </Select>


          <label className="flex items-center gap-2 text-xs px-2">
            <input type="checkbox" checked={showDebug} onChange={e => setShowDebug(e.target.checked)}/>
            Toon rejected/debug records
          </label>
        </div>

        {showDebug && (
          <div className="mt-4 p-3 border border-destructive/40 bg-destructive/5 rounded text-xs flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-destructive mb-1">Advanced / Debug modus actief</div>
              Rejected en debug records worden nu getoond. Deze zijn niet bedoeld voor outreach.
              <div className="mt-2">
                <Button size="sm" variant="destructive" onClick={handleExportRawDebug} title="Waarschuwing: bevat rejected en debug records. Niet voor outreach gebruiken.">
                  <Download className="h-3 w-3 mr-1" /> Export raw/debug CSV
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-2">#</th>
                <th className="text-left p-2">Bedrijf</th>
                <th className="text-left p-2">Segment</th>
                <th className="text-left p-2">Stad</th>
                <th className="text-left p-2">Website</th>
                <th className="text-left p-2">Telefoon</th>
                <th className="text-left p-2">Mobiel</th>
                <th className="text-left p-2">WA</th>
                <th className="text-left p-2">★</th>
                <th className="text-left p-2">Rev</th>
                <th className="text-left p-2">Raw</th>
                <th className="text-left p-2">Score</th>
                <th className="text-left p-2">Fit</th>
                <th className="text-left p-2">Perm</th>
                <th className="text-left p-2">Outreach</th>
                {showDebug && <th className="text-left p-2">Status</th>}
              </tr>
            </thead>
            <tbody>
              {grouped.map(([regionId, rows]) => {
                const r = regionMap[regionId];
                const colSpan = showDebug ? 16 : 15;
                return (
                  <Fragment key={regionId}>
                    <tr>
                      <td colSpan={colSpan} className="region-header">
                        === REGIO {String(r?.region_order ?? "??").padStart(2,"0")}: {(r?.region_name ?? "Onbekend").toUpperCase()} ({rows.length}) ===
                      </td>
                    </tr>
                    {rows.map((p, i) => {
                      const rejected = isRejectedDebug(p);
                      return (
                        <tr key={p.id} className={`border-t hover:bg-secondary/40 ${rejected && showDebug ? "opacity-70 bg-destructive/5" : ""}`}>
                          <td className="p-2 text-muted-foreground text-xs">{i+1}</td>
                          <td className="p-2 font-medium">
                            <Link to={`/prospects/${p.id}`} className="hover:text-accent">{p.company_name}</Link>
                            {showDebug && rejected && (
                              <Badge variant="destructive" className="ml-2 text-[10px] uppercase">
                                {String(p.qualification_status ?? "").startsWith("rejected") ? "Rejected" : "Debug"}
                              </Badge>
                            )}
                          </td>
                          <td className="p-2 text-xs">{p.segment}</td>
                          <td className="p-2 text-xs">{p.city}</td>
                          <td className="p-2">{p.website_url && <a href={p.website_url} target="_blank" rel="noreferrer" className="text-accent inline-flex items-center gap-1 text-xs"><ExternalLink className="h-3 w-3"/></a>}</td>
                          <td className="p-2 text-xs">{p.phone_main}</td>
                          <td className="p-2 text-xs">{p.phone_mobile_e164}</td>
                          <td className="p-2">{p.whatsapp_visible && <Badge variant="outline" className="text-xs">WA</Badge>}</td>
                          <td className="p-2 text-xs">{p.google_rating ?? "—"}</td>
                          <td className="p-2 text-xs">{p.google_review_count ?? 0}</td>
                          <td className="p-2 font-mono text-xs text-muted-foreground">{p.raw_opportunity_score ?? "—"}</td>
                          <td className="p-2 font-mono text-xs">{p.lead_score === null || p.lead_score === undefined ? <span className="italic text-muted-foreground">pending</span> : p.lead_score}</td>
                          <td className="p-2"><Badge className={fitBadgeClass(p.fit_category)}>{p.fit_category}</Badge></td>
                          <td className="p-2 text-xs">{p.permission_status}</td>
                          <td className="p-2 text-xs">{p.outreach_status}</td>
                          {showDebug && (
                            <td className="p-2 text-xs text-muted-foreground max-w-[240px]">
                              <div className="font-mono">{p.qualification_status ?? "—"}</div>
                              {p.exclusion_reason && <div className="text-[11px] text-destructive/80">{p.exclusion_reason}</div>}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </Fragment>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={showDebug ? 16 : 15} className="p-8 text-center text-muted-foreground text-sm">
                    {prospects.length === 0
                      ? "Nog geen prospects. Ga naar Sourcing om te starten."
                      : `Geen bruikbare prospects in huidige weergave. ${counts.rejectedHidden} rejected/debug records verborgen — activeer 'Toon rejected/debug records' om ze te bekijken.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
