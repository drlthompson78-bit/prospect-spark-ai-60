import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { fitBadgeClass, slugify } from "@/lib/scoring";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, Phone, MessageCircle, Star, ImageOff } from "lucide-react";

export default function ProspectDetail() {
  const { id } = useParams();
  const [p, setP] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [scanPage, setScanPage] = useState<any>(null);
  const [note, setNote] = useState("");

  async function load() {
    const { data } = await supabase.from("prospects").select("*").eq("id", id).single();
    setP(data);
    const { data: ev } = await supabase.from("prospect_events").select("*").eq("prospect_id", id).order("created_at", { ascending: false });
    setEvents(ev ?? []);
    const { data: sp } = await supabase.from("scan_pages").select("*").eq("prospect_id", id).maybeSingle();
    setScanPage(sp);
  }
  useEffect(() => { if (id) load(); }, [id]);

  async function addEvent(event_type: string, event_note?: string) {
    const { data: userRes } = await supabase.auth.getUser();
    await supabase.from("prospect_events").insert({ prospect_id: id, event_type, event_note, created_by: userRes.user?.id });
    toast.success("Event toegevoegd");
    load();
  }
  async function updateProspect(patch: any, eventType?: string, note?: string) {
    await supabase.from("prospects").update(patch).eq("id", id);
    if (eventType) await addEvent(eventType, note);
    else load();
  }
  async function createScanPage() {
    if (!p) return;
    const slug = `${slugify(p.company_name)}-${slugify(p.city ?? "nl")}-${Math.random().toString(36).slice(2,7)}`;
    const public_url = `${window.location.origin}/scan/${slug}`;
    const { data, error } = await supabase.from("scan_pages").insert({
      prospect_id: p.id, scan_slug: slug, public_url, scan_status: "ready"
    }).select().single();
    if (error) { toast.error(error.message); return; }
    setScanPage(data);
    toast.success("Scan pagina aangemaakt");
  }

  if (!p) return <div className="p-8 text-sm text-muted-foreground">Laden…</div>;

  return (
    <div className="p-8 max-w-6xl">
      <Link to="/prospects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent mb-4"><ArrowLeft className="h-4 w-4"/> Terug</Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-semibold">{p.company_name}</h1>
            <Badge className={fitBadgeClass(p.fit_category)}>Fit {p.fit_category}</Badge>
            <Badge variant="outline">Score {p.lead_score}</Badge>
          </div>
          <div className="text-sm text-muted-foreground">{p.segment} · {p.city} · {p.address}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Bedrijfsgegevens</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info label="Website">{p.website_url ? <a className="text-accent inline-flex items-center gap-1" href={p.website_url} target="_blank" rel="noreferrer">{p.website_url} <ExternalLink className="h-3 w-3"/></a> : "—"}</Info>
              <Info label="Telefoon"><span className="inline-flex items-center gap-1"><Phone className="h-3 w-3"/>{p.phone_main ?? "—"}</span></Info>
              <Info label="Mobiel">{p.phone_mobile_e164 ?? "—"}</Info>
              <Info label="WhatsApp">{p.whatsapp_visible ? <span className="inline-flex items-center gap-1 text-[hsl(var(--fit-a))]"><MessageCircle className="h-3 w-3"/> zichtbaar</span> : "geen"}</Info>
              <Info label="Google rating"><span className="inline-flex items-center gap-1"><Star className="h-3 w-3"/>{p.google_rating ?? "—"} ({p.google_review_count ?? 0} reviews)</span></Info>
              <Info label="Business status">{p.business_status ?? "—"}</Info>
              <Info label="Directory/leadsite">{p.is_directory_or_leadsite ? "ja" : "nee"}</Info>
              <Info label="Google place id">{p.google_place_id ?? "—"}</Info>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Score & Reden</h2>
            <div className="text-sm mb-2">Lead score: <b>{p.lead_score}</b>/120 · Redesign score: {p.redesign_score}</div>
            <div className="text-sm text-muted-foreground">{p.reason_fit ?? p.exclusion_reason ?? "—"}</div>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Screenshot</h2>
            <div className="aspect-video bg-secondary rounded flex items-center justify-center text-muted-foreground text-sm">
              <div className="text-center"><ImageOff className="h-8 w-8 mx-auto mb-2"/> Nog geen screenshot (pending)</div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Notities</h2>
            <Textarea value={note || (p.notes ?? "")} onChange={e => setNote(e.target.value)} rows={3} placeholder="Notitie…"/>
            <Button size="sm" className="mt-2" onClick={() => updateProspect({ notes: note })}>Opslaan</Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Timeline</h2>
            <div className="space-y-2">
              {events.map(e => (
                <div key={e.id} className="text-sm border-l-2 border-border pl-3 py-1">
                  <div className="font-medium">{e.event_type}</div>
                  {e.event_note && <div className="text-muted-foreground text-xs">{e.event_note}</div>}
                  <div className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</div>
                </div>
              ))}
              {events.length === 0 && <div className="text-sm text-muted-foreground">Nog geen events.</div>}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <h2 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Status</h2>
            <div className="text-xs mb-1">Permission: <b>{p.permission_status}</b></div>
            <div className="text-xs mb-1">Outreach: <b>{p.outreach_status}</b></div>
            <div className="text-xs mb-3">Import allowed: <b>{p.import_allowed ? "ja" : "nee"}</b></div>
            <div className="grid gap-2">
              <Button size="sm" variant="outline" onClick={() => updateProspect({ fit_category: "A" }, "manually_reviewed", "Mark as qualified")}>Mark as qualified</Button>
              <Button size="sm" variant="outline" onClick={() => updateProspect({ fit_category: "rejected" }, "manually_reviewed", "Reject")}>Reject</Button>
              <Button size="sm" variant="outline" onClick={() => updateProspect({ outreach_status: "called" }, "called", "Gebeld")}>Called</Button>
              <Button size="sm" variant="outline" onClick={() => updateProspect({ permission_status: "requested" }, "permission_requested", "Permission gevraagd")}>Permission requested</Button>
              <Button size="sm" variant="outline" onClick={() => updateProspect({ permission_status: "opt_in" }, "opt_in_received", "Opt-in ontvangen")}>Opt-in received</Button>
              <Button size="sm" variant="outline" disabled={p.permission_status !== "opt_in"} onClick={() => updateProspect({ import_allowed: !p.import_allowed })}>{p.import_allowed ? "Import intrekken" : "Import allowed = true"}</Button>
              <Button size="sm" variant="outline" onClick={() => updateProspect({ outreach_status: "scan_sent" }, "scan_link_sent", "Scan link gestuurd")}>Scan link sent</Button>
              <Button size="sm" variant="outline" onClick={() => updateProspect({ outreach_status: "not_interested" }, "not_interested", "Niet geïnteresseerd")}>Not interested</Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3">Import allowed is alleen mogelijk bij permission_status = opt_in (afgedwongen in database).</p>
          </Card>

          <Card className="p-4">
            <h2 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Scan pagina</h2>
            {scanPage ? (
              <div className="space-y-2 text-xs">
                <div>Slug: <code>{scanPage.scan_slug}</code></div>
                <div>Views: {scanPage.opened_count}</div>
                <a className="text-accent break-all inline-flex items-center gap-1" href={`/scan/${scanPage.scan_slug}`} target="_blank" rel="noreferrer">
                  {window.location.origin}/scan/{scanPage.scan_slug} <ExternalLink className="h-3 w-3"/>
                </a>
              </div>
            ) : (
              <Button size="sm" onClick={createScanPage}>Genereer scan link</Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div><div>{children}</div></div>;
}
