# Route-analyse — Dr. Webber Business & Product Blueprint v1.0

**Datum:** 17 juli 2026
**Input:** `Dr_Webber_Business_Product_Blueprint_v1.0.pdf` (42 p.) + huidige codebase (`prospect-spark-ai-60`, "Prospect OS")
**Doel:** onderbouwde analyse vóór het bepalen van de definitieve bouwroute.

---

## 1. Kernconclusie (TL;DR)

Het blueprint is een uitzonderlijk volwassen en intern consistent document — direct bruikbaar als bouwspecificatie. De belangrijkste constatering voor de routekeuze is echter deze:

> **De huidige codebase (Prospect OS) is níet het platform dat het blueprint beschrijft.** Prospect OS is een *acquisitie-instrument* (outbound leadsourcing: regio's scannen, prospects met verouderde websites vinden, reviewen en exporteren). Het blueprint beschrijft het *productplatform* (publieke site, intakewizard, prijsengine, productie-backend, klantportaal, Care).

Prospect OS dekt precies één onderdeel van het blueprint: **hoofdstuk 13.1, stap 3 — "Gerichte outbound: benader bedrijven met aantoonbaar verouderde websites."** Dat is waardevol en behouden waard, maar het is de vraagzijde, niet het product.

**Aanbeveling: route C (twee sporen, gescheiden codebases).** Prospect OS blijft het interne acquisitie-instrument; het Dr. Webber-platform start als nieuw project volgens de repositorystructuur uit hoofdstuk 17.3. Niet doorbouwen op dit repo als fundament voor het klantplatform.

---

## 2. Sterktepunten van het blueprint

1. **De juiste strategische keuze staat er al in (§1.5):** eerst een handmatig bestuurbare flow, pas daarna automatiseren. Dit is de belangrijkste risicoverlager in het hele document en moet leidend blijven bij elke routediscussie.
2. **Fasering met go/no-go-gates (H14):** Fase 1 (designbewijs) vóór funnelbouw is correct geprioriteerd — zonder visueel bewijs is de rest van de funnel waardeloos, zoals het document zelf stelt.
3. **Economische discipline:** urenlimieten per pakket (9/20/48), margetargets, prijswaarschuwing dat de oude mockupprijzen (€995/€1.995/€3.495) niet houdbaar zijn, en validatieregels per 10 projecten. Zeldzaam concreet.
4. **Leveranciersneutraliteit (§10.7):** Git + PostgreSQL als source of truth, Lovable/builders als vervangbare adapters. Dit beschermt tegen lock-in — relevant omdat het huidige repo een Lovable-project is.
5. **Prompts als productconfiguratie (§10.4):** versies, inputcontract, outputschema, testcases. Dit is het niveau dat nodig is om AI-output beheersbaar te houden.
6. **Eerlijkheid over onzekerheid:** geen top-down marktclaims; bottom-up validatie met de eerste 100–200 prospects en 20–30 projecten (§4.4). Conceptfee-cohorten (€195/€295/€495) zijn direct uitvoerbaar.
7. **Hoofdstuk 17 is direct uitvoerbaar:** master build prompt, repositorystructuur, epics E0–E10 en beslislog vormen samen een startklare briefing voor een AI-ontwikkelomgeving.

---

## 3. Kritische kanttekeningen en risico's

### 3.1 Ambitie versus teamcapaciteit
De 16-wekenroute (§14.9) veronderstelt impliciet het pilotteam uit §11.1 (± 2,5–4 fte over vijf rollen). Met een kleiner team is de route realistischer op 24–30 weken, óf de scope van Fase 2–3 moet smaller. De go/no-go-gates maken dit beheersbaar, maar de wekenplanning moet niet als belofte worden gelezen.

### 3.2 De 24–48-uursbelofte is operationeel de spannendste
De belofte geldt pas ná conceptfee, complete intake en bruikbare assets — die voorwaarden zijn goed afgebakend. Maar in de pilotfase, zonder geautomatiseerde briefing/analyse (Fase 4 komt pas ná Fase 2–3), draait deze belofte volledig op menselijke discipline. Advies: de belofte pas publiek voeren wanneer >90% interne tijdigheid is aangetoond (het document zegt dit zelf in §4.4 — dit verdient een hardere plek in de lancering).

### 3.3 Dubbele designlast in Fase 1
Fase 1 vraagt én een onderscheidend eigen designsysteem (cinematic hero, motion, drie sectorcases) én dat dit later herbruikbaar is voor klantproductie. Dat zijn twee verschillende designsystemen (merk-site vs. klant-componentlibrary). Het blueprint benoemt dit onderscheid niet expliciet; het risico is dat de eigen site-esthetiek de klantlibrary gaat dicteren of andersom. Beslispunt vóór Fase 1.

### 3.4 Prijsengine-complexiteit vs. MVP
De prijsengine (§8.3) met conditionele regels, bundels, complexiteitsflags en discount guardrails is als *doel* juist, maar voor Fase 2 volstaat een veel simpelere versie: basisprijs + per-eenheid add-ons + "review nodig"-flag. De volledige regelengine hoort bij Fase 3+. Het document laat dit open; expliciet klein starten voorkomt dat Fase 2 uitloopt.

### 3.5 Stack-keuze botst met huidige tooling
Het blueprint adviseert **Next.js + TypeScript** (SSR/SEO, §9.2) — terecht voor een publieke marketingsite met SEO-ambitie. Het huidige repo is **Vite + React SPA** (Lovable-standaard). Een SPA is voor de publieke site een reëel SEO-nadeel. Wie op Lovable wil blijven bouwen, accepteert een afwijking van de referentiestack; het blueprint staat dat toe mits gemotiveerd vastgelegd (ADR). Dit is een van de eerste beslissingen.

### 3.6 Kleinere punten
- Pakket-uren (9/20/48) zijn strak; de eerste 10 projecten zullen die vrijwel zeker overschrijden. Dat is oké als leerdata, mits gemeten vanaf project 1.
- Care €79 p/m met 30 min wijzigingen is scherp geprijsd; bewaak de classificatie incident/wijziging/verbetering (§11.5) vanaf de eerste klant, anders wordt Care een verliespost.
- De juridische werkpunten (§16.4: verwerkersovereenkomsten, AI-outputrechten, conceptfee-voorwaarden) staan er wel, maar hebben geen fase-eigenaar in de roadmap. Aan Fase 0 hangen.

---

## 4. Verhouding blueprint ↔ huidige codebase

| Aspect | Blueprint (Dr. Webber platform) | Huidig repo (Prospect OS) |
|---|---|---|
| Functie | Verkopen, produceren, leveren | Leads vínden (outbound sourcing) |
| Gebruiker | Prospect, klant, intern team | Alleen intern (admin/sales/viewer) |
| Kern-entiteiten | organizations, projects, quotes, payments, artifacts… | prospects, regions, search_jobs, scan_pages, screenshots |
| Stack | Next.js + Supabase (referentie) | Vite/React SPA + Supabase (Lovable) |
| Overlap | §13.1 stap 3: gerichte outbound; website-analyse als AI-taak | Google Places-sourcing, website-review met redesign_score/lead_score/fit |

Herbruikbaar uit Prospect OS voor het platform:
- **Website-review-logica** (redesign score, lead score, fit) is conceptueel de voorloper van de "Website analyzer"-taak (§10.2) en de gratis fit-check in de wizard.
- **Supabase-patronen** (RLS, rollen, edge functions, migraties) zijn dezelfde bouwstenen die het platform nodig heeft.
- **Prospectdata** wordt straks de voedingsbodem voor outbound met "concrete visuele preview/diagnose" (§13.1) — een directe koppeling tussen beide systemen is later waardevol (prospect → gepersonaliseerde intake-link).

Niet herbruikbaar als fundament: het datamodel, de routes en de UX van Prospect OS staan volledig los van de 20+ kernentiteiten en de klantreis uit het blueprint. Ombouwen kost meer dan opnieuw opzetten volgens §17.3.

---

## 5. Route-opties

**Route A — Prospect OS uitbouwen tot het platform.**
Snel gevoel van voortgang, één repo. Maar: verkeerd datamodel als fundament, SPA-stack voor een SEO-kritische publieke site, en vermenging van intern tool en klantomgeving (security/RLS-risico). *Afgeraden.*

**Route B — Alles nieuw, Prospect OS bevriezen.**
Schoon, conform blueprint. Maar gooit een werkend acquisitie-instrument weg dat juist nodig is voor founder-led sales en outbound in de eerste 90 dagen. *Onnodig verlies.*

**Route C — Twee sporen (aanbevolen).**
1. **Platform-spoor:** nieuw repo volgens §17.3 (monorepo), referentiestack Next.js + TypeScript + Tailwind + Supabase, gebouwd in de fasevolgorde van H14. Start met Fase 0 + Fase 1 zoals de "First Implementation Task" in §17.2 voorschrijft.
2. **Acquisitie-spoor:** Prospect OS blijft zoals het is (onderhoudsmodus) en levert de outbound-leads voor de pilot. Latere integratie: prospect-record → voorgevulde intake/scan in het platform.

Dit volgt bovendien het eigen principe van het blueprint (§9.1: modulair, los koppelbaar; §10.7: adapters).

---

## 6. Beslispunten vóór de definitieve route (Fase 0-agenda)

1. **Stack en bouwomgeving:** Next.js-monorepo (blueprint-conform) of doorbouwen in Lovable/Vite met gemotiveerde ADR-afwijking. Dit bepaalt SEO, deployment en wie er kan bouwen.
2. **Team en tempo:** bevestig beschikbare fte tegen §11.1 en herijk de 16-wekenroute daarop.
3. **Prijzen bevestigen:** €1.495 / €2.995 / €6.950 + conceptfee-cohorten (start €295) als versie 1.0 vastleggen — de prijsengine kan niet gebouwd worden zonder bevroren pakketmatrix.
4. **Designsysteem-scheiding:** expliciet besluit dat merk-site en klant-componentlibrary twee systemen zijn met gedeelde tokens-basis.
5. **Owners benoemen:** product-, creative-, technical- en launchowner (§16.2) — ook als meerdere rollen bij één persoon liggen, maak het expliciet.
6. **24–48u-belofte:** intern meten vanaf project 1, publiek pas voeren bij >90% tijdigheid.

Daarna is de eerste bouwopdracht letterlijk beschikbaar in §17.2: *Fase 0 + Fase 1 — repository, design tokens, componentinventaris, werkende cinematic hero met motion-toggle en reduced-motion-fallback, drie sectorcase-teasers, performance baseline en een ADR over de motiontechniek.*
