# Fase 0 — Besluitlog

Levend logboek van alle richtinggevende besluiten (conform blueprint §17.5).
Statussen: **voorgesteld** (aanbevolen startpunt, wacht op bevestiging) · **bevestigd** (definitief voor v1.0) · **open** (nog geen voorstel mogelijk zonder input).

| # | Besluit | Voorstel | Status | Eigenaar | Document |
|---|---------|----------|--------|----------|----------|
| B-01 | Positionering & propositie | Premium menselijk webdesignbureau; AI als interne motor, niet als merkclaim | voorgesteld | Productowner | [01-product-charter](01-product-charter.md) |
| B-02 | Eerste verticals | Zorg & welzijn · Zakelijke dienstverlening · Interieur/bouw/vastgoed | voorgesteld | Productowner | [01-product-charter](01-product-charter.md) |
| B-03 | Pakketprijzen v1.0 | Essential €1.495 · Growth €2.995 · Signature €6.950 (ex btw) | voorgesteld | Business owner | [02-pakketmatrix-v1](02-pakketmatrix-v1.md) |
| B-04 | Conceptfee | Start €295, verrekenbaar binnen 30 dagen; cohorttest €195/€495 later | voorgesteld | Business owner | [03-sla-en-conceptmodel](03-sla-en-conceptmodel.md) |
| B-05 | 24–48u-belofte | Intern meten vanaf project 1; publiek pas bij >90% tijdigheid | voorgesteld | Operations | [03-sla-en-conceptmodel](03-sla-en-conceptmodel.md) |
| B-06 | Projectstack | Next.js + TypeScript + Tailwind + Motion/GSAP | voorgesteld | Technical owner | [04-technische-keuzes-adr](04-technische-keuzes-adr.md) (ADR-001) |
| B-07 | Repo-strategie | Nieuw monorepo `drwebber-platform` (§17.3); Prospect OS blijft apart | voorgesteld | Technical owner | ADR-002 |
| B-08 | Database & auth | Supabase (PostgreSQL, Auth met magic links, Storage, RLS) | voorgesteld | Technical owner | ADR-003 |
| B-09 | Betalingsprovider | Mollie (iDEAL + NL-betaalmethoden + subscriptions) | voorgesteld | Business + technical | ADR-004 |
| B-10 | Deploymentmodel | Dr. Webber beheert hosting via Care; overdracht tegen aparte voorwaarden | voorgesteld | Business owner | ADR-005 |
| B-11 | CMS-strategie | Geen universeel zwaar CMS; eenvoudig contentmodel per projecttype | voorgesteld | Technical + creative | ADR-006 |
| B-12 | Designsysteem-scheiding | Merk-site en klant-componentlibrary zijn twee systemen met gedeelde tokens-basis | voorgesteld | Creative owner | ADR-007 |
| B-13 | Intellectueel eigendom | Klant krijgt gebruik/overdracht na volledige betaling; generieke libraries blijven van Dr. Webber | voorgesteld | Business owner | [03-sla-en-conceptmodel](03-sla-en-conceptmodel.md) |
| B-14 | Governance / owners | Vier rollen expliciet beleggen, ook bij personele overlap | **open** — namen invullen | Management | [05-governance-owners.md](05-governance-owners.md) |
| B-15 | Teamcapaciteit & tempo | Beschikbare fte bepalen → 16- of 24–30-wekenroute | **open** — input nodig | Management | [05-governance-owners.md](05-governance-owners.md) |

## Werkwijze

1. Elk "voorgesteld" besluit wordt bevestigd of aangepast door de eigenaar; daarna status → bevestigd.
2. Een bevestigd besluit wijzigt alleen via een nieuw genummerd besluit met reden (geen stilzwijgende wijzigingen — blueprint §17.2 delivery discipline).
3. B-14 en B-15 zijn de enige besluiten die niet zonder input van de oprichter(s) kunnen; alle overige kunnen bij akkoord direct naar bevestigd.

**Go/no-go Fase 0 → Fase 1:** alle besluiten op "bevestigd" en de eerste bouwopdracht (§17.2 First Implementation Task) vrijgegeven.
