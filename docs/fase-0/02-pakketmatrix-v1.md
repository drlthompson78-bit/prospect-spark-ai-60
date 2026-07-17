# Pakketmatrix v1.0 (voorstel)

Bron: blueprint H6. Status: voorgesteld, ter bevestiging (besluitlog B-03). Prijzen exclusief btw.
Deze matrix is de bron voor de prijsengine; elke wijziging krijgt een nieuw versienummer (`price_version`).

## Kernpakketten

| Kenmerk | Essential — vanaf €1.495 | Growth — vanaf €2.995 | Signature — vanaf €6.950 |
|---|---|---|---|
| Doel | Sterke professionele basis | Groei, autoriteit, leadgeneratie | Onderscheidende digitale merkervaring |
| Pagina's | Tot 5 kernpagina's | Tot 10 pagina's/contenttypes | Projectscope, maatwerkarchitectuur |
| Branding | Mini-brandbook / bestaande identiteit | Uitgebreide brand direction | Volledige digitale creative direction |
| Design | Bespoke styling binnen bewezen layouts | Meer unieke secties en custom componenten | Volledig maatwerk, editorial, art direction |
| Motion | Micro-interacties, rustige transitions | Geavanceerde scroll-/componentmotion | Cinematisch, optioneel 3D/video |
| CMS | Optioneel / beperkt | Standaard voor passende content | Maatwerk contentmodel |
| Copy | Structuur en redactie; volledige copy = add-on | Belangrijkste pagina's ondersteund | Strategische copy en story direction |
| Revisies | 1 gebundelde ronde | 2 gebundelde rondes | 3 rondes binnen projectscope |
| **Mensuren-target (hard)** | **max 9 directe uren** | **max 20 directe uren** | **max 48 directe uren** |
| Bouwtijd na akkoord | 5–10 werkdagen | 10–20 werkdagen | Projectplanning |

> **Prijswaarschuwing (uit blueprint §6.2):** de eerdere mockupprijzen €995/€1.995/€3.495 waren visuele placeholders en zijn níet houdbaar voor deze scope. Herijk prijzen en uren na elke 10 opgeleverde projecten met werkelijke data.

## Betaalmomenten

| Moment | Regeling |
|---|---|
| Betaald concept | €295 (zie conceptmodel), volledig verrekenbaar bij opdracht binnen 30 dagen |
| Start bouw | 50% van projectprijs minus conceptfee |
| Vóór livegang | 50% restant + goedgekeurde change requests |
| Care | Automatische maand- of jaarbetaling |

## Add-on library (indicatief, v1.0)

| Add-on | Prijsrichting | Opmerking |
|---|---|---|
| Extra unieke pagina | €175 | Herhaal-templatepagina €75 |
| Volledige copywriting | vanaf €450 | Incl. interviewinput, afgesproken correctieronde |
| Meertaligheid | vanaf €350 per taal | Techniek en vertaling apart |
| Afsprakenmodule | vanaf €350 | Standaardintegratie; maatwerk apart |
| Blog / kennisbank | vanaf €350 | Contentmodel + listing + detail |
| Webshop | vanaf €1.500 | Alleen gestandaardiseerde commerce in fase 1 |
| Video hero | vanaf €1.000 | Excl. productie; compressie + mobiele fallback verplicht |
| 3D / interactieve scene | vanaf €1.500 | Alleen na performance- en relevantietoets |
| Fotografie / beeld | offerte | Partnerkosten + art direction |
| CRM / marketingautomatisering | vanaf €500 | Afhankelijk van API en datamapping |

## Care-abonnementen

| Plan | Prijs p/m | Inhoud |
|---|---|---|
| Care | €79 | Hosting, security-updates, monitoring, backups, 30 min kleine wijzigingen |
| Care Growth | €179 | + 90 min wijzigingen, maandrapport, basis SEO/analytics-check |
| Performance | €395 | + structurele content/CRO/SEO-capaciteit, kwartaalroadmap |

**Bewaking:** wijzigingsverzoeken worden vanaf klant 1 geclassificeerd als incident / wijziging / verbetering (blueprint §11.5), anders wordt Care een verliespost.

## Scopecontrole (regels voor de engine en de operatie)

1. Elke aanvraag → expliciete deliverables én uitgesloten onderdelen.
2. Wijziging na conceptgoedkeuring → classificatie: correctie, revisie of scopewijziging (change request).
3. Impact op prijs/planning/pakketlimiet wordt berekend vóór acceptatie.
4. Geen ongeprijsde "kleine extra's"; alles geregistreerd (margedata).
5. Korting nooit onder minimale pakketbijdrage zonder expliciet besluit (guardrail in engine).
6. Directe projectkosten-target: max 30–36% van omzet.

## Prijsengine-scope per fase (bewuste beperking)

- **Fase 2 (MVP):** basisprijs + per-eenheid add-ons + conditionele modules + "handmatige review nodig"-flag. Bandbreedte tonen bij maatwerkrisico, nooit vaste prijs.
- **Fase 3+:** bundels, discount guardrails, quote-versioning, belasting/geldigheid.
