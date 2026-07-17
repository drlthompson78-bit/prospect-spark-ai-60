# SLA, conceptmodel en intellectueel eigendom (v1.0-voorstel)

Bron: blueprint §3.5, §5.4–5.6, §16.3. Status: voorgesteld (besluitlog B-04, B-05, B-13).

## Tweelaags conceptmodel

| Laag | Inhoud | Doel | Begrenzing |
|---|---|---|---|
| **Gratis richting** | Sectorinspiratie, palet, stijlkaart, voorbeeldstructuur, indicatieve fit-score en prijsbandbreedte | Conversie en vertrouwen | Geen uniek homepage-ontwerp; watermerk; geen overdraagbare bronbestanden |
| **Betaald concept — €295** | Brand direction, homepage/hero-concept, structuur, eerste copyrichting, projectscope | Kwalificatie en besluit | Vast aantal richtingen/revisies; fee verrekenbaar bij opdracht binnen 30 dagen |
| **Volledige bouw** | Alle pakketdeliverables, responsive uitwerking, integraties, QA, livegang | Omzet en relatie | Scope volgens pakketmatrix + change-request-proces |

**Cohorttest (na eerste pilots):** €195 en €495 testen per cohort; optimaliseren op projectbijdrage per bezoeker, niet alleen fee-conversie (blueprint §13.5).

## De 24–48-uursbelofte

**Definitie:** een intern goedgekeurd eerste concept binnen 24–48 *werkuren*, gerekend vanaf: (1) ontvangen conceptfee, (2) complete intake, (3) bruikbare assets. Interne review is inbegrepen. Het betreft een concept, nooit een live site.

**Lanceringsregel (aanscherping t.o.v. blueprint):** de belofte wordt intern gemeten vanaf project 1, maar pas publiek gevoerd wanneer >90% van de interne concepten aantoonbaar tijdig is. Tot die tijd communiceren we "snel eerste concept" zonder harde urenclaim.

## Servicelevels

| Moment | Norm |
|---|---|
| Reactie op betaalde conceptopdracht | Automatische bevestiging direct; menselijke controle binnen 4 werkuren |
| Eerste intern concept | 24–48 werkuren na complete intake en assets |
| Klantfeedback | Binnen 5 werkdagen; daarna herinnering en mogelijke planning-reset |
| Revisies | Essential 1 · Growth 2 · Signature 3 |
| Bouwtijd na akkoord | Essential 5–10 wd · Growth 10–20 wd · Signature planning |
| Support na livegang | Volgens Care-plan en prioriteit (P1–P4, blueprint §11.5) |
| Bereikbaarheid | Werkuren expliciet; P1-bereikbaarheid alleen in passend Care-plan |

## Statusmodel (bindend voor de backend)

`draft_lead → intake_in_progress → qualified → concept_fee_pending → intake_complete → analysis_running → concept_in_production → internal_review → client_review → revision → build_scheduled → building → quality_assurance → awaiting_final_payment → approved_for_launch → live → care_active` (+ `on_hold`, `cancelled`)

Elke status heeft een eigenaar, deadline, toegestane overgangen en automatisch bericht.

## Intellectueel eigendom en deployment

- Klant krijgt gebruiksrecht/overdracht van projectspecifiek werk **na volledige betaling**.
- Dr. Webber behoudt generieke libraries, componenten, prompts en tooling.
- **Deploymentmodel:** Dr. Webber beheert hosting via Care (primair model); volledige overdracht kan tegen aparte voorwaarden. Git + database blijven source of truth.
- Externe productiekosten (fotografie, stock, fonts) worden met opslag en duidelijke rechtenvoorwaarden doorbelast.

## Juridische werkpunten — eigenaar: Fase 0 (niet doorschuiven)

- [ ] Privacyverklaring (prospects, klanten, analytics) en cookie/consent-beleid.
- [ ] Verwerkersovereenkomsten: hosting, e-mail, AI-, betaal- en analyticsleveranciers.
- [ ] Algemene voorwaarden: conceptfee, annulering, revisies, scope, livegang, Care.
- [ ] Rechtenregeling klantassets, stock, fonts, AI-beelden en gegenereerde output.
- [ ] Dataretentie- en verwijderprocedure voor leads en projectbestanden.
