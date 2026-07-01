import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageOff } from "lucide-react";

export default function ScanPage() {
  const { scan_slug } = useParams();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc("get_scan_page", { _slug: scan_slug! });
      setPage((data as any[])?.[0] ?? null);
      setLoading(false);
    })();
  }, [scan_slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Laden…</div>;
  if (!page) return <div className="min-h-screen flex items-center justify-center text-sm">Scan pagina niet gevonden.</div>;

  return (
    <div className="min-h-screen bg-secondary py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-xs font-mono tracking-wider text-muted-foreground mb-3">WEBSITE SCAN</div>
        <h1 className="text-4xl font-semibold mb-2">{page.company_name}</h1>
        <p className="text-muted-foreground mb-8">Persoonlijke scan van {page.website_url ?? "je website"} — {page.city}</p>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-xs uppercase text-muted-foreground mb-2">Voorlopige score</div>
            <div className="text-5xl font-semibold text-accent">{page.scan_score ?? "—"}</div>
            <div className="text-xs text-muted-foreground mt-2">Volledige scan in aanvraag</div>
          </Card>
          <Card className="p-6">
            <div className="text-xs uppercase text-muted-foreground mb-2">Huidige website</div>
            <div className="aspect-video bg-secondary rounded flex items-center justify-center text-muted-foreground">
              <div className="text-center text-xs"><ImageOff className="h-6 w-6 mx-auto mb-1"/> Screenshot volgt</div>
            </div>
          </Card>
        </div>

        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-3">Wil je de volledige scan?</h2>
          <p className="text-sm text-muted-foreground mb-5">Ontvang binnen 24 uur een uitgebreid rapport met verbeterpunten voor conversie, mobiel en snelheid.</p>
          <Button size="lg">Vraag volledige scan aan</Button>
        </Card>
      </div>
    </div>
  );
}
