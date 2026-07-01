import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { fitBadgeClass, SEGMENTS } from "@/lib/scoring";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

export default function Prospects() {
  const [prospects, setProspects] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [f, setF] = useState({ region: "all", segment: "all", fit: "all", whatsapp: "all", permission: "all", q: "" });

  useEffect(() => {
    supabase.from("regions").select("*").order("region_order").then(({ data }) => setRegions(data ?? []));
    supabase.from("prospects").select("*").limit(2000).then(({ data }) => setProspects(data ?? []));
  }, []);

  const regionMap = useMemo(() => Object.fromEntries(regions.map(r => [r.id, r])), [regions]);

  const filtered = useMemo(() => {
    let list = prospects.filter(p => {
      if (f.region !== "all" && p.region_id !== f.region) return false;
      if (f.segment !== "all" && p.segment !== f.segment) return false;
      if (f.fit !== "all" && p.fit_category !== f.fit) return false;
      if (f.whatsapp === "yes" && !p.whatsapp_visible) return false;
      if (f.whatsapp === "no" && p.whatsapp_visible) return false;
      if (f.permission !== "all" && p.permission_status !== f.permission) return false;
      if (f.q && !(`${p.company_name} ${p.city ?? ""}`.toLowerCase().includes(f.q.toLowerCase()))) return false;
      return true;
    });
    // Sort: region_order asc, lead_score desc, fit A>B>C, whatsapp_visible true first, reviews desc
    const fitRank = (fit: string) => fit === "A" ? 0 : fit === "B" ? 1 : fit === "C" ? 2 : 3;
    list.sort((a, b) => {
      const ra = regionMap[a.region_id]?.region_order ?? 999;
      const rb = regionMap[b.region_id]?.region_order ?? 999;
      if (ra !== rb) return ra - rb;
      if (b.lead_score !== a.lead_score) return b.lead_score - a.lead_score;
      const fr = fitRank(a.fit_category) - fitRank(b.fit_category);
      if (fr !== 0) return fr;
      if (a.whatsapp_visible !== b.whatsapp_visible) return b.whatsapp_visible ? 1 : -1;
      return (b.google_review_count ?? 0) - (a.google_review_count ?? 0);
    });
    return list;
  }, [prospects, f, regionMap]);

  // Group by region
  const grouped = useMemo(() => {
    const g = new Map<string, any[]>();
    for (const p of filtered) {
      const key = p.region_id ?? "none";
      if (!g.has(key)) g.set(key, []);
      g.get(key)!.push(p);
    }
    return Array.from(g.entries());
  }, [filtered]);

  return (
    <div className="p-8">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Prospect Master</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} van {prospects.length} prospects</p>
        </div>
      </div>

      <Card className="p-4 mb-4">
        <div className="grid grid-cols-6 gap-3">
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
        </div>
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
                <th className="text-left p-2">Score</th>
                <th className="text-left p-2">Fit</th>
                <th className="text-left p-2">Perm</th>
                <th className="text-left p-2">Outreach</th>
              </tr>
            </thead>
            <tbody>
              {grouped.map(([regionId, rows]) => {
                const r = regionMap[regionId];
                return (
                  <>
                    <tr key={`h-${regionId}`}>
                      <td colSpan={14} className="region-header">
                        === REGIO {String(r?.region_order ?? "??").padStart(2,"0")}: {(r?.region_name ?? "Onbekend").toUpperCase()} ({rows.length}) ===
                      </td>
                    </tr>
                    {rows.map((p, i) => (
                      <tr key={p.id} className="border-t hover:bg-secondary/40">
                        <td className="p-2 text-muted-foreground text-xs">{i+1}</td>
                        <td className="p-2 font-medium"><Link to={`/prospects/${p.id}`} className="hover:text-accent">{p.company_name}</Link></td>
                        <td className="p-2 text-xs">{p.segment}</td>
                        <td className="p-2 text-xs">{p.city}</td>
                        <td className="p-2">{p.website_url && <a href={p.website_url} target="_blank" rel="noreferrer" className="text-accent inline-flex items-center gap-1 text-xs"><ExternalLink className="h-3 w-3"/></a>}</td>
                        <td className="p-2 text-xs">{p.phone_main}</td>
                        <td className="p-2 text-xs">{p.phone_mobile_e164}</td>
                        <td className="p-2">{p.whatsapp_visible && <Badge variant="outline" className="text-xs">WA</Badge>}</td>
                        <td className="p-2 text-xs">{p.google_rating ?? "—"}</td>
                        <td className="p-2 text-xs">{p.google_review_count ?? 0}</td>
                        <td className="p-2 font-mono text-xs">{p.lead_score}</td>
                        <td className="p-2"><Badge className={fitBadgeClass(p.fit_category)}>{p.fit_category}</Badge></td>
                        <td className="p-2 text-xs">{p.permission_status}</td>
                        <td className="p-2 text-xs">{p.outreach_status}</td>
                      </tr>
                    ))}
                  </>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={14} className="p-8 text-center text-muted-foreground text-sm">Nog geen prospects. Ga naar Sourcing om te starten.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
