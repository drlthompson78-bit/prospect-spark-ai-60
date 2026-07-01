# AI Website Scan Prospect Platform — MVP Plan

Groot maar goed gescoped. Ik bouw dit in één sessie als samenhangende MVP op Lovable Cloud (Supabase onder de motorkap). Hieronder staat wat er precies wordt opgeleverd, in welke volgorde, en welke keuzes ik maak.

## Stack & fundering
- **Lovable Cloud** aan (Supabase: Postgres, Auth, Storage, Edge Functions).
- **Google Places API** uitsluitend server-side via Edge Function; key als secret `GOOGLE_PLACES_API_KEY` (jij voegt toe in Project Settings → Secrets — ik vraag ernaar zodra Cloud aan staat).
- **Frontend**: React + Tailwind + shadcn, zakelijke dashboardstijl (geen playful gradients), semantic tokens in `index.css`.
- **Auth**: email/wachtwoord. Eerste user via signup wordt handmatig admin gepromoveerd (of eerste user = admin via trigger).
- **Rollen**: `app_role` enum (`admin`, `sales`, `viewer`) + aparte `user_roles` tabel + `has_role()` security definer function (verplicht patroon, geen role op profiles).

## Databaseschema (migratie in één keer)
Alle tabellen zoals gespecificeerd:
`profiles`, `regions`, `search_jobs`, `prospects`, `prospect_events`, `screenshots`, `scan_pages`, `exports`, plus `user_roles` + `app_role` enum.

Extra's:
- `updated_at` trigger op prospects.
- Trigger op `prospects`: `import_allowed` mag alleen `true` worden als `permission_status = 'opt_in'`. Anders auto-reset naar `false` (compliance-guard in DB).
- Unieke index op `prospects.google_place_id` (waar niet null) + soft-uniek op `website_url` (dedup check in edge function).
- RLS aan op alles. Beleid: authenticated users lezen/schrijven prospects/events/exports/screenshots/scan_pages/search_jobs (MVP = admin-only in effect). `scan_pages` heeft aparte **public SELECT policy op basis van `scan_slug`** die alleen minimale velden exposet via een view.
- `public_scan_view`: view die alleen `company_name`, `city`, `scan_slug`, `scan_score`, `scan_status`, thumbnail path joint — voor de publieke `/scan/:slug` route.
- GRANT statements voor authenticated + service_role op elke public-tabel (en anon SELECT op de public scan view).

## Seed data
`regions` gevuld met de 6 opgegeven regio's (region_order 1–6, ring 1–4, active true).

## Edge Functions
1. **`search-google-places`** (verify_jwt=false, in-code JWT check):
   - Input: `{ query, region_id, segment, city, max_results }`.
   - Roept `https://places.googleapis.com/v1/places:searchText` met header `X-Goog-Api-Key` + FieldMask zoals gespecificeerd.
   - Maakt `search_jobs` row (queued→running→completed/failed).
   - Per result: dedup op `google_place_id` en `website_url`; als nieuw → insert met `segment`, `region_id`, `city`, coords, phones, rating, review count, `business_status`, `source_type='google_places'`, `google_place_id`.
   - Berekent `has_own_website`, `has_visible_phone`, `has_mobile_or_whatsapp` (06-prefix detectie op NL nummer → normaliseer naar E.164), en initiële `lead_score` + `fit_category` via de scoring hieronder.
   - Rejecteert directory/leadsite heuristisch op basis van bekende domein-blacklist (werkspot, mijndomein, bouwmaat, etc.) → `is_directory_or_leadsite=true`, `fit_category='rejected'`.
   - Retourneert per resultaat: `{ status: 'created'|'duplicate'|'rejected', prospect_id, company_name }`.

2. **`recalculate-score`** (optioneel, admin-only): herberekent lead_score en fit_category voor een set prospects.

3. **`export-prospects`** (edge function of client-side): genereert CSV. Voor MVP doe ik dit **client-side** (papaparse) om edge-function complexiteit te sparen — beide exports (algemeen + WhatsApp) met filters conform spec.

## Leadscore & fit
Server-side + herbruikbare util:
- Verouderde website (heuristiek: geen HTTPS, of geen website — later verrijken): +25
- WhatsApp/06 zichtbaar: +20
- Eigen vakbedrijf (niet directory): +20
- Lokale dienstverlener hoge klantwaarde (segment in premium set): +15
- Reviews aanwezig (>=5): +10
- Zwakke CTA's (placeholder default 10 als website aanwezig): +10
- Mobiel matig (placeholder 10): +10
- Bereikbaar MKB (phone + <50 reviews): +10
Cap 120. Fit: A≥90, B 75–89, C 70–74, anders `rejected`. Harde criteria eerst; bij fail → `rejected` met `exclusion_reason`.

## Frontend routes
- `/login` — email/password (Cloud auth), redirect naar `/`.
- `/` — Dashboard: KPI-cards (qualified/pending/rejected, per regio counts), snelle links.
- `/sourcing` — Prospect Sourcing: form (regio, segment, query, max_results) → knop → tabel met live resultaten en status badge.
- `/prospects` — Prospect Master: filters (regio, segment, fit, whatsapp, permission), gegroepeerd met regio-headers `=== REGIO 0X: NAAM ===`, sortering exact zoals spec. Kolommen zoals spec. Badges met kleuren (A groen, B blauw, C oranje, rejected rood/grijs).
- `/prospects/:id` — Detail: alle velden, score breakdown, events timeline, screenshot placeholder, statusknoppen (elk logt een `prospect_events` row én update prospect fields). Permission opt-in knop zet `permission_status='opt_in'` → daarna kan admin `import_allowed=true` togglen.
- `/exports` — Export Center: twee knoppen (Algemene CSV, WhatsApp CSV) met huidige filters + geschiedenis uit `exports` tabel.
- `/regions` — Settings: regio's tonen/togglen active.
- `/scan/:scan_slug` — **publieke** route (geen auth): toont bedrijfsnaam/city/score placeholder/thumbnail placeholder/CTA. Increment `opened_count` + `last_opened_at` via public RPC of edge function met `scan_slug` alleen.

Layout: sidebar nav (dashboard/sourcing/prospects/exports/regions), topbar met user + logout. Auth-gate op alle routes behalve `/login` en `/scan/:slug`.

## Security highlights
- Geen Google key in frontend, ooit.
- RLS: alle admin-tabellen `authenticated` only. Publieke scan pagina leest via view/RPC, geen prospects-tabel exposure.
- Trigger dwingt permission→import_allowed regel af (dubbele defensieve laag naast UI).
- `has_role()` security definer, geen recursieve RLS.

## Wat NIET in deze MVP zit (bewust)
- Echte screenshot capture (placeholder + status only, zoals gevraagd).
- Echte scan-content (placeholder pagina, tracking wél werkend).
- Excel/PDF export (CSV only in MVP, zoals aangegeven).
- Stripe / klantportaal.
- Automatische scan_link SMS/WhatsApp verzending.

## Build-volgorde in de sessie
1. Cloud aan → schema migratie (alle tabellen + enum + RLS + policies + grants + triggers + regions seed).
2. Auth pagina + protected layout + role bootstrap.
3. Design system tokens (zakelijk, kleuren voor fit categories).
4. Prospect Master + filters + regio-groepering.
5. Edge Function `search-google-places` + Sourcing UI.
6. Score util (gedeeld tussen edge + client display).
7. Prospect Detail + events + statusknoppen.
8. Export Center (CSV + WhatsApp CSV).
9. Publieke `/scan/:slug` + tracking RPC.
10. Regions settings + Dashboard KPI's.
11. Security sanity check.

## Twee aannames (corrigeer indien nodig)
- **Eerste admin**: ik maak een DB-trigger die de eerste geregistreerde user automatisch de `admin` rol geeft. Volgende users starten als `viewer` — jij kunt promoveren via een simpele Regions/Settings-uitbreiding (voeg ik toe als je wilt).
- **"Website verouderd" score**: er is geen echte site-analyse in MVP, dus deze factor wordt heuristisch (HTTPS + domein leeftijd niet beschikbaar → default 10, geen website → 25). Later vervangen door echte scan.

Zeg "ga" (of geef feedback) en ik bouw het in één keer. Zorg dat je klaar staat om na Cloud-activatie de `GOOGLE_PLACES_API_KEY` toe te voegen in Project Settings → Secrets.
