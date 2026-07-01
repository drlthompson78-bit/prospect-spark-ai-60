import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Search, Users, Download } from "lucide-react";

export default function Dashboard() {
  const [counts, setCounts] = useState({ qualified: 0, pending: 0, rejected: 0, total: 0 });
  const [byRegion, setByRegion] = useState<{ region_name: string; region_order: number; count: number }[]>([]);

  useEffect(() => {
    (async () => {
      const { data: all } = await supabase.from("prospects").select("id, fit_category, region_id");
      const qualified = all?.filter(p => ["A","B","C"].includes(p.fit_category)).length ?? 0;
      const pending = all?.filter(p => p.fit_category === "pending").length ?? 0;
      const rejected = all?.filter(p => p.fit_category === "rejected").length ?? 0;
      setCounts({ qualified, pending, rejected, total: all?.length ?? 0 });

      const { data: regions } = await supabase.from("regions").select("id, region_name, region_order").order("region_order");
      if (regions && all) {
        setByRegion(regions.map(r => ({
          region_name: r.region_name,
          region_order: r.region_order,
          count: all.filter(p => p.region_id === r.id).length,
        })));
      }
    })();
  }, []);

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-6">Overzicht van je prospectlijst</p>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <Kpi label="Totaal" value={counts.total} />
        <Kpi label="Qualified (A/B/C)" value={counts.qualified} tone="a" />
        <Kpi label="Pending" value={counts.pending} tone="pending" />
        <Kpi label="Rejected" value={counts.rejected} tone="rejected" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6 col-span-2">
          <h2 className="text-sm font-semibold mb-4">Per regio</h2>
          <div className="space-y-2">
            {byRegion.map(r => (
              <div key={r.region_order} className="flex justify-between items-center py-1.5 border-b last:border-0 text-sm">
                <span className="font-mono text-xs text-muted-foreground mr-3">R{String(r.region_order).padStart(2,"0")}</span>
                <span className="flex-1">{r.region_name}</span>
                <span className="font-semibold">{r.count}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6 space-y-3">
          <h2 className="text-sm font-semibold">Snel starten</h2>
          <Link to="/sourcing" className="flex items-center gap-2 text-sm hover:text-accent"><Search className="h-4 w-4"/> Nieuwe zoekopdracht</Link>
          <Link to="/prospects" className="flex items-center gap-2 text-sm hover:text-accent"><Users className="h-4 w-4"/> Prospect Master</Link>
          <Link to="/exports" className="flex items-center gap-2 text-sm hover:text-accent"><Download className="h-4 w-4"/> Export center</Link>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number; tone?: "a"|"pending"|"rejected" }) {
  const color = tone === "a" ? "text-[hsl(var(--fit-a))]"
    : tone === "pending" ? "text-[hsl(var(--fit-c))]"
    : tone === "rejected" ? "text-[hsl(var(--fit-rejected))]" : "text-foreground";
  return (
    <Card className="p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-3xl font-semibold mt-1 ${color}`}>{value}</div>
    </Card>
  );
}
