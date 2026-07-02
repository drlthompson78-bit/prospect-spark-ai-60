import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ExternalLink, ImageOff } from "lucide-react";

type Props = {
  prospect: any;
  onSaved: () => void;
};

const MAX = {
  visual_age_score: 20,
  mobile_usability_score: 15,
  cta_score: 15,
  trust_score: 15,
  local_seo_score: 10,
  conversion_opportunity_score: 25,
} as const;

type Field = keyof typeof MAX;

const LABELS: Record<Field, string> = {
  visual_age_score: "Visueel modern (0–20)",
  mobile_usability_score: "Mobiel bruikbaar (0–15)",
  cta_score: "CTA zichtbaar (0–15)",
  trust_score: "Vertrouwen / reviews (0–15)",
  local_seo_score: "Lokale SEO (0–10)",
  conversion_opportunity_score: "Conversie-kans (0–25)",
};

export default function WebsiteReview({ prospect, onSaved }: Props) {
  const p = prospect;
  const [scores, setScores] = useState<Record<Field, number | "">>({
    visual_age_score: p.visual_age_score ?? "",
    mobile_usability_score: p.mobile_usability_score ?? "",
    cta_score: p.cta_score ?? "",
    trust_score: p.trust_score ?? "",
    local_seo_score: p.local_seo_score ?? "",
    conversion_opportunity_score: p.conversion_opportunity_score ?? "",
  });
  const [notes, setNotes] = useState<string>(p.review_notes ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setScores({
      visual_age_score: p.visual_age_score ?? "",
      mobile_usability_score: p.mobile_usability_score ?? "",
      cta_score: p.cta_score ?? "",
      trust_score: p.trust_score ?? "",
      local_seo_score: p.local_seo_score ?? "",
      conversion_opportunity_score: p.conversion_opportunity_score ?? "",
    });
    setNotes(p.review_notes ?? "");
  }, [p.id]);

  const allFilled = (Object.keys(MAX) as Field[]).every(k => scores[k] !== "" && scores[k] !== null);

  const redesignScore = useMemo(() => {
    return (Object.keys(MAX) as Field[]).reduce((acc, k) => {
      const v = Number(scores[k] || 0);
      return acc + Math.max(0, Math.min(v, MAX[k]));
    }, 0);
  }, [scores]);

  const previewLeadScore = useMemo(() => {
    if (!allFilled) return null;
    const leadsite = !!p.is_directory_or_leadsite;
    if (leadsite) return 0;
    if (redesignScore < 70) return 0;
    const raw = p.raw_opportunity_score ?? 0;
    const combined = Math.round((raw / 100) * 40 + (redesignScore / 100) * 80);
    return Math.min(combined, 120);
  }, [allFilled, redesignScore, p.is_directory_or_leadsite, p.raw_opportunity_score]);


  const previewFit = useMemo(() => {
    if (!allFilled) return "pending";
    if (redesignScore < 70) return "rejected";
    const s = previewLeadScore ?? 0;
    if (s >= 100) return "A";
    if (s >= 85) return "B";
    if (s >= 70) return "C";
    return "rejected";
  }, [allFilled, redesignScore, previewLeadScore]);

  function setField(k: Field, raw: string) {
    if (raw === "") { setScores(s => ({ ...s, [k]: "" })); return; }
    const n = Math.max(0, Math.min(Number(raw), MAX[k]));
    setScores(s => ({ ...s, [k]: n }));
  }

  async function savePatch(patch: any, eventType: string, note?: string) {
    setSaving(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const { error } = await supabase.from("prospects").update(patch).eq("id", p.id);
      if (error) throw error;
      await supabase.from("prospect_events").insert({
        prospect_id: p.id, event_type: eventType, event_note: note, created_by: userRes.user?.id,
      });
      toast.success("Website review opgeslagen");
      onSaved();
    } catch (e: any) {
      toast.error(e.message ?? "Opslaan mislukt");
    } finally { setSaving(false); }
  }

  async function saveDraft() {
    await savePatch({
      ...Object.fromEntries((Object.keys(MAX) as Field[]).map(k => [k, scores[k] === "" ? null : scores[k]])),
      review_notes: notes || null,
      redesign_score: redesignScore,
      website_review_status: "in_review",
    }, "website_review_draft", `Concept opgeslagen · redesign_score=${redesignScore}`);
  }

  async function markReviewed() {
    if (!allFilled) { toast.error("Vul alle 6 scorevelden eerst in."); return; }
    const leadsite = !!p.is_directory_or_leadsite;
    const eligible = !leadsite && redesignScore >= 70;
    const leadScore = leadsite || redesignScore < 70 ? 0 : Math.min((p.raw_opportunity_score ?? 0) + redesignScore, 120);
    const fit = !eligible ? "rejected"
      : leadScore >= 100 ? "A"
      : leadScore >= 85 ? "B"
      : leadScore >= 70 ? "C"
      : "rejected";
    const { data: userRes } = await supabase.auth.getUser();

    await savePatch({
      ...Object.fromEntries((Object.keys(MAX) as Field[]).map(k => [k, scores[k]])),
      review_notes: notes || null,
      redesign_score: redesignScore,
      website_review_status: "reviewed",
      reviewed_by: userRes.user?.id ?? null,
      reviewed_at: new Date().toISOString(),
      lead_score: eligible ? leadScore : 0,
      fit_category: fit,
      exclusion_reason: eligible ? null : (leadsite ? "Directory/leadsite" : "Onvoldoende redesign-kans"),
    }, "website_reviewed", `Reviewed · redesign=${redesignScore} · lead=${leadScore} · fit=${fit}`);
  }

  async function rejectAfterReview() {
    const { data: userRes } = await supabase.auth.getUser();
    await savePatch({
      ...Object.fromEntries((Object.keys(MAX) as Field[]).map(k => [k, scores[k] === "" ? null : scores[k]])),
      review_notes: notes || null,
      redesign_score: redesignScore,
      website_review_status: "reviewed",
      reviewed_by: userRes.user?.id ?? null,
      reviewed_at: new Date().toISOString(),
      lead_score: 0,
      fit_category: "rejected",
      exclusion_reason: "Handmatig afgewezen na website review",
    }, "website_review_rejected", `Afgewezen na review · redesign=${redesignScore}`);
  }

  const status = p.website_review_status ?? "pending";
  const statusColor =
    status === "reviewed" ? "default" :
    status === "in_review" ? "secondary" :
    status === "failed" ? "destructive" : "outline";

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground">Website Review</h2>
        <Badge variant={statusColor as any}>{status}</Badge>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm">
          {p.website_url
            ? <a href={p.website_url} target="_blank" rel="noreferrer" className="text-accent inline-flex items-center gap-1 break-all">{p.website_url} <ExternalLink className="h-3 w-3"/></a>
            : <span className="text-muted-foreground">Geen website beschikbaar</span>}
        </div>
        <div className="text-xs text-muted-foreground">Raw opportunity: <b className="text-foreground">{p.raw_opportunity_score ?? 0}</b></div>
      </div>

      <div className="aspect-video bg-secondary rounded flex items-center justify-center text-muted-foreground text-xs">
        <div className="text-center"><ImageOff className="h-6 w-6 mx-auto mb-2"/> Screenshot pending · beoordeel handmatig via bovenstaande link</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(Object.keys(MAX) as Field[]).map(k => (
          <div key={k}>
            <Label className="text-xs">{LABELS[k]}</Label>
            <Input
              type="number" min={0} max={MAX[k]}
              value={scores[k]}
              onChange={e => setField(k, e.target.value)}
              placeholder={`0–${MAX[k]}`}
            />
          </div>
        ))}
      </div>

      <div>
        <Label className="text-xs">Review notities</Label>
        <Textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Wat valt op? Redesign-argumenten…"/>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm bg-secondary/40 rounded p-3">
        <div><div className="text-xs text-muted-foreground uppercase">Redesign score</div><b>{redesignScore}</b>/100</div>
        <div><div className="text-xs text-muted-foreground uppercase">Lead score (preview)</div><b>{allFilled ? previewLeadScore : "—"}</b>{allFilled && "/120"}</div>
        <div><div className="text-xs text-muted-foreground uppercase">Fit (preview)</div><b>{previewFit}</b></div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={saveDraft} disabled={saving}>Concept opslaan</Button>
        <Button size="sm" onClick={markReviewed} disabled={saving || !allFilled}>Mark as reviewed</Button>
        <Button size="sm" variant="destructive" onClick={rejectAfterReview} disabled={saving}>Reject after review</Button>
      </div>

      {p.website_review_status === "reviewed" && p.reviewed_at && (
        <div className="text-xs text-muted-foreground">
          Laatst gereviewed op {new Date(p.reviewed_at).toLocaleString()}.
        </div>
      )}
    </Card>
  );
}
