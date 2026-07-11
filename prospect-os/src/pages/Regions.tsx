import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function Regions() {
  const [regions, setRegions] = useState<any[]>([]);
  async function load() {
    const { data } = await supabase.from("regions").select("*").order("region_order");
    setRegions(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function toggle(id: string, active: boolean) {
    await supabase.from("regions").update({ active }).eq("id", id);
    toast.success("Regio bijgewerkt");
    load();
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">Regio's</h1>
      <Card>
        <table className="w-full text-sm">
          <thead className="bg-secondary text-xs uppercase text-muted-foreground">
            <tr><th className="text-left p-3">#</th><th className="text-left p-3">Naam</th><th className="text-left p-3">Ring</th><th className="text-left p-3">Afstand (km)</th><th className="text-left p-3">Actief</th></tr>
          </thead>
          <tbody>
            {regions.map(r => (
              <tr key={r.id} className="border-t">
                <td className="p-3 font-mono">R{String(r.region_order).padStart(2,"0")}</td>
                <td className="p-3">{r.region_name}</td>
                <td className="p-3">{r.ring}</td>
                <td className="p-3">{r.distance_from_rotterdam_km}</td>
                <td className="p-3"><Switch checked={r.active} onCheckedChange={v => toggle(r.id, v)}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
