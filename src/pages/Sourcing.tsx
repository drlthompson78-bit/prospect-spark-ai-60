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

export default function Sourcing() {
  const [regions, setRegions] = useState<any[]>([]);
  const [regionId, setRegionId] = useState<string>("");
  const [segment, setSegment] = useState<string>("loodgieter");
  const [query, setQuery] = useState("loodgieter Rotterdam");
  const [city, setCity] = useState("Rotterdam");
  const [maxResults, setMaxResults] = useState(20);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("regions").select("*").order("region_order").then(({ data }) => {
      setRegions(data ?? []);
      if (data?.[0]) setRegionId(data[0].id);
    });
  }, []);

  async function search() {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("search-google-places", {
        body: { query, region_id: regionId, segment, city, max_results: maxResults }
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setResults((data as any).results ?? []);
      toast.success(`${(data as any).results?.length ?? 0} resultaten verwerkt`);
    } catch (e: any) {
      toast.error(e.message ?? "Zoeken mislukt");
    } finally { setLoading(false); }
  }

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-semibold mb-1">Prospect Sourcing</h1>
      <p className="text-sm text-muted-foreground mb-6">Zoek bedrijven via Google Places (server-side)</p>

      <Card className="p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
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
            <Label>Zoekquery</Label>
            <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="loodgieter Rotterdam"/>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={search} disabled={loading || !query}>{loading ? "Zoeken…" : "Search Google Places"}</Button>
          <div className="text-xs text-muted-foreground self-center">Voorbeeld queries: loodgieter Rotterdam · dakdekker Capelle aan den IJssel · elektricien Barendrecht</div>
        </div>
      </Card>

      {results.length > 0 && (
        <Card>
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs uppercase text-muted-foreground">
              <tr><th className="text-left p-3">Bedrijf</th><th className="text-left p-3">Status</th><th className="text-left p-3">Fit</th><th className="text-left p-3">Score</th><th></th></tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="p-3">{r.company_name}</td>
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
