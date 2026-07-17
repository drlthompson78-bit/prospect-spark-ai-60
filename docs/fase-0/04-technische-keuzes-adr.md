# Technische keuzes — Architecture Decision Records (v1.0-voorstel)

Status: voorgesteld, ter bevestiging (besluitlog B-06 t/m B-12). Elke ADR volgt: context → besluit → consequenties.

---

## ADR-001 — Projectstack: Next.js + TypeScript + Tailwind + Motion/GSAP

**Context.** De publieke site is SEO-kritisch (blueprint §9.2) en moet tegelijk cinematic motion dragen met een hard performancebudget (LCP <2,5s, CLS <0,1). Het bestaande Prospect OS is een Vite/React-SPA (Lovable) — geschikt voor interne tools, nadelig voor indexeerbare marketingpagina's.

**Besluit.** Next.js (App Router) + TypeScript + Tailwind. Motion: Framer Motion voor component-/UI-motion, GSAP + ScrollTrigger gericht voor de cinematic hero en scrollverhalen. Geen zware 3D-engine zonder aangetoonde noodzaak.

**Consequenties.** SSR/SSG voor marketingroutes (SEO), client components voor wizard/portaal. Afwijken van Lovable als primaire bouwomgeving voor het platform; Lovable blijft eventueel uitvoeringskanaal voor klántsites (adapter-principe, §10.7).

---

## ADR-002 — Repo-strategie: nieuw monorepo, gescheiden van Prospect OS

**Context.** Route-analyse (docs/ROUTE-ANALYSE-BLUEPRINT-V1.md): Prospect OS is het acquisitie-instrument, niet het platform; datamodellen en doelgroepen verschillen volledig.

**Besluit.** Nieuw repo (werknaam `drwebber-platform`) met de structuur uit blueprint §17.3:

```
/apps/web                 publieke site, wizard, klant/admin-UI
/packages/ui              componenten en design tokens
/packages/domain          prijsengine, statusmachine, validatie
/packages/ai              jobcontracten, prompts, providers, tests
/packages/db              schema, migraties, RLS, seeds
/packages/integrations    payments, e-mail, analytics, deploy-adapters
/packages/config          pakketten, add-ons, sectorlibraries
/docs                     ADRs, event catalog, runbooks, productregels
/tests                    e2e, integratie, visuele regressie
```

**Consequenties.** Prospect OS gaat in onderhoudsmodus; latere koppeling prospect → voorgevulde intake-link via API. Fase 0-documenten verhuizen mee naar het nieuwe repo zodra dat bestaat.

---

## ADR-003 — Database, auth en storage: Supabase

**Context.** Relationeel model met 20+ entiteiten, rolscheiding (8 rollen), RLS-vereisten en bestandsbeheer met signed URLs (§9.2, §18.3). Teamervaring met Supabase bestaat al (Prospect OS).

**Besluit.** Supabase: PostgreSQL + Auth (magic links voor klantportaal, MFA voor admins) + Storage. Alle schemawijzigingen via versiebeheerde migraties in Git; RLS-policies met tests (klant A/klant B/medewerker/admin).

**Consequenties.** Eén platformafhankelijkheid die zelf-hostbaar/PostgreSQL-migreerbaar blijft (geen lock-in op data). Langdurige jobs draaien níet in webrequests: start met een gecontroleerde jobtabel + workers (edge functions/cron), opschalen naar Trigger.dev/Inngest wanneer Fase 4-volume dat vraagt.

---

## ADR-004 — Betalingsprovider: Mollie

**Context.** Nederlandse doelgroep: iDEAL is dominant; nodig zijn conceptfee-checkout, projecttermijnen, Care-subscriptions en webhooks (§9.2, §16.3).

**Besluit.** Mollie (iDEAL, creditcard, subscriptions, NL-administratie). Integratie achter een payment-adapterinterface in `/packages/integrations`, zodat Stripe later zonder domeinwijzigingen kan worden toegevoegd.

**Consequenties.** Webhook-handlers idempotent met signature-verificatie. Nodig van eigenaar vóór Fase 3: Mollie-account + API-keys.

---

## ADR-005 — Deploymentmodel en hosting

**Context.** §16.3: primair model is beheer door Dr. Webber via Care; klantoverdracht mogelijk tegen voorwaarden.

**Besluit.** Platform-app op Vercel (previews per branch, productie na launchgate). Klantsites via deploymentadapters (Vercel/Cloudflare/static export); elke deployment geregistreerd met omgeving, commit, URL, status en rollback (entiteit `deployments`).

**Consequenties.** Preview-URL's per concept voor het klantportaal. E-mail transactioneel via Resend; monitoring via Sentry + uptime + productanalytics (met consent).

---

## ADR-006 — CMS-strategie

**Context.** §16.3 waarschuwt tegen een universele zware CMS-eis.

**Besluit.** Geen extern CMS in de MVP. Content van het platform zelf leeft in code/config; klantcontent in het eigen datamodel (`content_items`). Per klantprojecttype kan later een licht (headless) CMS als adapter worden toegevoegd.

**Consequenties.** Snellere MVP, geen extra leverancier; her-evaluatie zodra Growth-klanten structureel zelf content beheren willen.

---

## ADR-007 — Designsysteem-scheiding

**Context.** Risico uit de route-analyse (§3.3): de merk-site en de klant-componentlibrary zijn verschillende systemen; vermenging maakt beide slechter.

**Besluit.** Twee lagen met gedeelde basis: (1) `tokens-core` — spacing, grids, motion-primitieven, a11y-states; (2) `brand-drwebber` — de eigen merkstijl (warm zwart/charcoal, ivoor, zand/goud, serif-headlines); (3) `client-library` — sector-neutrale, themable componenten voor klantproductie, gevoed door sectorlibraries.

**Consequenties.** Fase 1 bouwt tokens-core + brand-drwebber; client-library start pas in Fase 4E (component/code-generatie) en erft alleen van tokens-core, nooit van de merkstijl.

---

## Niet-onderhandelbare technische regels (uit §17.2, bindend voor alle fasen)

- Git en PostgreSQL zijn source of truth; builders en modelproviders zijn adapters.
- Geen autonome klantpublicatie; human gates verplicht (G1–G5).
- Pakket- en prijsregels versioned en reproduceerbaar.
- Elke feature bevat loading-, empty-, error-, permission- en mobile-states.
- Reduced motion, toegankelijkheid, privacy en performancebudget gerespecteerd.
- Seed data zonder misleidende publieke claims.
- AI-output altijd versieerbaar: input, promptversie, model, tijdstip, reviewer.
