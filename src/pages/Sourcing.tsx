import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SEGMENTS } from "@/lib/scoring";
import { toast } from "sonner";
import { Link } from "react-router-dom";

type ResultRow = {
  status: string;
  company_name: string;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  rating?: number | null;
  review_count?: number | null;
  fit_category?: string | null;
  lead_score?: number | null;
  prospect_id?: string | null;
};

type TestStatus = {
  apiConnected: boolean | null;
  lastQuery: string;
  resultsFound: number;
  created: number;
  duplicates: number;
  missingWebsite: number;
  pendingReview: number;
  error: string | null;
};

function humanizeError(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes("google_places_api_key")) return "❌ Ontbrekende API-key (GOOGLE_PLACES_API_KEY niet geconfigureerd).";
  if (s.includes("api_key_invalid") || s.includes("api key not valid")) return "❌ API-key ongeldig.";
  if (s.includes("permission_denied") && s.includes("places")) return "❌ Places API (New) niet geactiveerd voor dit project.";
  if (s.includes("billing")) return "❌ Billing niet actief op Google Cloud project.";
  if (s.includes("fieldmask") || s.includes("field mask")) return "❌ Field mask fout in de request.";
  if (s.includes("quota") || s.includes("rate_limit") || s.includes("resource_exhausted")) return "❌ Quota / rate limit bereikt.";
  if (s.includes("unauthorized")) return "❌ Niet ingelogd — log eerst in.";
  if (s.includes("google places error")) return "❌ Google API response error: " + raw;
  return raw;
}

export default function Sourcing() {
  const [regions, setRegions] = useState<any[]>([]);
  const [regionId, setRegionId] = useState<string>("");
  const [segment, setSegment] = useState<string>("loodgieter");
  const [query, setQuery] = useState("loodgieter Rotterdam");
  const [city, setCity] = useState("Rotterdam");
  const [maxResults, setMaxResults] = useState(10);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [status, setStatus] = useState<TestStatus>({
    apiConnected: null, lastQuery: "", resultsFound: 0,
    created: 0, duplicates: 0, missingWebsite: 0, pendingReview: 0, error: null,
  });

  useEffect(() => {
    supabase.from("regions").select("*").order("region_order").then(({ data }) => {
      setRegions(data ?? []);
      if (data?.[0]) setRegionId(data[0].id);
    });
  }, []);

  async function search() {
    setLoading(true);
    setStatus(s => ({ ...s, lastQuery: query, error: null }));
    try {
      const { data, error } = await supabase.functions.invoke("search-google-places", {
        body: { query, region_id: regionId, segment, city, max_results: maxResults }
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      const rows: ResultRow[] = (data as any).results ?? [];
      setResults(rows);

      const created = rows.filter(r => r.status === "created").length;
      const duplicates = rows.filter(r => r.status === "duplicate").length;
      const missingWebsite = rows.filter(r => r.status === "missing_website").length;
      const pendingReview = rows.filter(r => r.status === "pending_review" || r.status === "rejected").length;

      setStatus({
        apiConnected: true,
        lastQuery: query,
        resultsFound: rows.length,
        created, duplicates, missingWebsite, pendingReview,
        error: null,
      });
      toast.success(`${rows.length} resultaten · ${created} nieuw · ${duplicates} duplicate`);
    } catch (e: any) {
      const msg = humanizeError(e.message ?? "Zoeken mislukt");
      setStatus(s => ({ ...s, apiConnected: false, error: msg }));
      toast.error(msg);
    } finally { setLoading(false); }
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <h1 className="text-xl md:text-2xl font-semibold mb-1">Prospect Sourcing</h1>
      <p className="text-sm text-muted-foreground mb-6">Zoek bedrijven via Google Places (server-side, API-key nooit in de browser)</p>

      <Card className="p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Regio</Label>
            <Select value={regionId} onValueChange={setRegionId}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                {regions.map(r => (
                  <SelectItem key={r.id} value={r.id}>R{String(r.region_order).padStart(2,"0")} — {r.region_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Segment</Label>
            <Select value={segment} onValueChange={setSegment}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                {SEGMENTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Stad (label)</Label>
            <Input value={city} onChange={e => setCity(e.target.value)} />
          </div>
          <div>
            <Label>Max resultaten (1–20)</Label>
            <Input type="number" min={1} max={20} value={maxResults} onChange={e => setMaxResults(Number(e.target.value))} />
          </div>
          <div className="col-span-2">
          <div className="sm:col-span-2">
            <Label>Zoekquery</Label>
            <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="loodgieter Rotterdam"/>
          </div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-center">
          <Button onClick={search} disabled={loading || !query} className="w-full sm:w-auto">{loading ? "Zoeken…" : "Search Google Places"}</Button>
          <div className="text-xs text-muted-foreground">Voorbeeld: loodgieter Rotterdam · dakdekker Capelle</div>
        </div>
      </Card>

      {/* Teststatus */}
      <Card className="p-4 mb-6 text-sm">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <div>API connected: <Badge variant={status.apiConnected === true ? "default" : status.apiConnected === false ? "destructive" : "secondary"}>
            {status.apiConnected === null ? "nog niet getest" : status.apiConnected ? "yes" : "no"}
          </Badge></div>
          <div>Last query: <span className="font-mono">{status.lastQuery || "—"}</span></div>
          <div>Results found: <b>{status.resultsFound}</b></div>
          <div>Created: <b>{status.created}</b></div>
          <div>Duplicates skipped: <b>{status.duplicates}</b></div>
          <div>Missing website: <b>{status.missingWebsite}</b></div>
          <div>Pending review / rejected: <b>{status.pendingReview}</b></div>
        </div>
        {status.error && <div className="mt-2 text-destructive">{status.error}</div>}
      </Card>

      {results.length > 0 && (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3">Bedrijf</th>
                <th className="text-left p-3">Adres</th>
                <th className="text-left p-3">Telefoon</th>
                <th className="text-left p-3">Website</th>
                <th className="text-left p-3">★</th>
                <th className="text-left p-3">Reviews</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Fit</th>
                <th className="text-left p-3">Score</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="border-t align-top">
                  <td className="p-3">{r.company_name}</td>
                  <td className="p-3 text-xs text-muted-foreground">{r.address ?? "—"}</td>
                  <td className="p-3 text-xs">{r.phone ?? "—"}</td>
                  <td className="p-3 text-xs">{r.website ? <a href={r.website} target="_blank" rel="noreferrer" className="text-accent hover:underline">link</a> : "—"}</td>
                  <td className="p-3">{r.rating ?? "—"}</td>
                  <td className="p-3">{r.review_count ?? "—"}</td>
                  <td className="p-3">
                    <Badge variant={r.status === "created" ? "default" : r.status === "duplicate" ? "secondary" : "outline"}>{r.status}</Badge>
                  </td>
                  <td className="p-3">{r.fit_category ?? "—"}</td>
                  <td className="p-3">{r.lead_score ?? "—"}</td>
                  <td className="p-3 text-right">
                    {r.prospect_id && <Link to={`/prospects/${r.prospect_id}`} className="text-accent hover:underline text-xs">Bekijk</Link>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
