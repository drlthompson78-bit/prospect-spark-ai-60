import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function toCsv(rows: Record<string, any>[]): string {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  return [cols.join(","), ...rows.map(r => cols.map(c => esc(r[c])).join(","))].join("\n");
}

function download(name: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export default function Exports() {
  const [history, setHistory] = useState<any[]>([]);

  async function loadHistory() {
    const { data } = await supabase.from("exports").select("*").order("created_at", { ascending: false }).limit(20);
    setHistory(data ?? []);
  }
  useEffect(() => { loadHistory(); }, []);

  async function exportQualified() {
    const { data } = await supabase.from("prospects").select("*").in("fit_category", ["A","B","C"]).eq("is_test_record", false).eq("clean_list_eligible", true);
    if (!data?.length) { toast.error("Geen qualified prospects"); return; }
    const rows = data.map(p => ({
      rank_overall: p.rank_overall, company_name: p.company_name, segment: p.segment, city: p.city,
      website_url: p.website_url, phone_main: p.phone_main, phone_mobile_e164: p.phone_mobile_e164,
      whatsapp_visible: p.whatsapp_visible, google_rating: p.google_rating, google_review_count: p.google_review_count,
      lead_score: p.lead_score, fit_category: p.fit_category, permission_status: p.permission_status,
      import_allowed: p.import_allowed, outreach_status: p.outreach_status, reason_fit: p.reason_fit,
    }));
    download(`prospects-qualified-${Date.now()}.csv`, toCsv(rows));
    const { data: userRes } = await supabase.auth.getUser();
    await supabase.from("exports").insert({ export_type: "csv", filters_json: { fit_category: ["A","B","C"] }, row_count: rows.length, created_by: userRes.user?.id });
    loadHistory();
    toast.success(`${rows.length} rijen geëxporteerd`);
  }

  async function exportWhatsapp() {
    const { data } = await supabase.from("prospects").select("*, scan_pages(scan_slug, public_url)")
      .eq("import_allowed", true).eq("permission_status", "opt_in").eq("is_test_record", false).not("phone_mobile_e164", "is", null);

    if (!data?.length) { toast.error("Geen prospects met opt-in + import_allowed + mobiel"); return; }
    const rows = data.map((p: any) => ({
      phone_e164: p.phone_mobile_e164,
      company_name: p.company_name,
      website_url: p.website_url,
      scan_url: p.scan_pages?.[0]?.public_url ?? "",
      template_name: "scan_intro_v1",
      var_1_company: p.company_name,
      var_2_scanlink: p.scan_pages?.[0]?.public_url ?? "",
      permission_status: p.permission_status,
      opt_in_proof: `opt_in registered at prospect ${p.id}`,
      import_allowed: p.import_allowed,
    }));
    download(`whatsapp-import-${Date.now()}.csv`, toCsv(rows));
    const { data: userRes } = await supabase.auth.getUser();
    await supabase.from("exports").insert({ export_type: "whatsapp_csv", filters_json: { import_allowed: true, permission_status: "opt_in" }, row_count: rows.length, created_by: userRes.user?.id });
    loadHistory();
    toast.success(`${rows.length} rijen geëxporteerd`);
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-semibold mb-1">Export Center</h1>
      <p className="text-sm text-muted-foreground mb-6">Genereer CSV-exports voor sales en WhatsApp-tooling</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="p-6">
          <h2 className="font-semibold mb-2">Qualified CSV</h2>
          <p className="text-sm text-muted-foreground mb-4">Alle prospects met fit A/B/C.</p>
          <Button onClick={exportQualified}>Download CSV</Button>
        </Card>
        <Card className="p-6">
          <h2 className="font-semibold mb-2">WhatsApp Import CSV</h2>
          <p className="text-sm text-muted-foreground mb-4">Alleen prospects met opt-in, import_allowed en mobiel nummer.</p>
          <Button onClick={exportWhatsapp}>Download WhatsApp CSV</Button>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b"><h2 className="text-sm font-semibold uppercase text-muted-foreground">Geschiedenis</h2></div>
        <table className="w-full text-sm">
          <thead className="bg-secondary text-xs uppercase text-muted-foreground">
            <tr><th className="text-left p-3">Type</th><th className="text-left p-3">Rijen</th><th className="text-left p-3">Datum</th></tr>
          </thead>
          <tbody>
            {history.map(h => (
              <tr key={h.id} className="border-t"><td className="p-3">{h.export_type}</td><td className="p-3">{h.row_count ?? "—"}</td><td className="p-3 text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString()}</td></tr>
            ))}
            {history.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-muted-foreground text-sm">Nog geen exports</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
