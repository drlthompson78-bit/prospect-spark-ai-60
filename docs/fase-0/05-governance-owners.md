# Governance, owners en capaciteit (v1.0 — deels open)

Bron: blueprint §11.1, §16.2. Status: **open** — dit document vereist input van de oprichter(s) (besluitlog B-14, B-15).

## Vier verplichte rollen (in te vullen)

Ook wanneer meerdere rollen bij één persoon liggen, worden ze expliciet belegd — besluitrechten en veto's verschillen per rol.

| Rol | Verantwoordelijk voor | Naam |
|---|---|---|
| **Productowner** | Propositie, pakketten, prijzen, roadmapprioriteit | _in te vullen_ |
| **Creative owner** | Merk, creative direction, conceptvrijgave, design system | _in te vullen_ |
| **Technical owner** | Architectuur, security, stackbesluiten, code-kwaliteit | _in te vullen_ |
| **Launchowner** | Livegang-gate: QA, finance-check en klantapproval | _in te vullen_ |

## Besluitrechten (uit §16.2, bindend zodra namen zijn ingevuld)

| Besluit | Eigenaar | Consult / veto |
|---|---|---|
| Merk en creative direction | Creative owner | Productowner; legal bij claims |
| Pakket, prijs en korting | Productowner | Finance en operations |
| Technische architectuur | Technical owner | Security/privacy en productowner |
| AI-prompt naar productie | Taakeigenaar | Creative/technical reviewer |
| Klantconcept vrijgeven | Creative lead | Projectowner |
| Productielivegang | Launchowner | QA + finance + klantapproval vereist |
| Nieuwe sector / white-label | Management | Operations, finance en product |

## Capaciteitsvraag (bepaalt het tempo)

Het blueprint-pilotteam (§11.1) telt ± 2,5–4 fte over vijf rollen. De 16-wekenroute (§14.9) veronderstelt die bezetting; met minder is 24–30 weken realistisch, of Fase 2–3 moet smaller.

**In te vullen:**

| Vraag | Antwoord |
|---|---|
| Hoeveel fte is beschikbaar voor de bouwfase? | _in te vullen_ |
| Wie doet design/creative review (intern of flex)? | _in te vullen_ |
| Wie doet klantcontact tijdens de pilot? | _in te vullen_ |
| Gewenste pilotdatum eerste betalende klant? | _in te vullen_ |

**Capaciteitsregel bij live operatie (niet vergeten in planning):** max 60–70% betaalde productie; rest gereserveerd voor review, sales, productverbetering en buffer (§11.3).

## AI-bouwomgeving als capaciteitsfactor

Fase 1–3 wordt met een AI-ontwikkelomgeving (Claude Code) gebouwd volgens de master build prompt (§17.2). Dat verschuift de menselijke rol naar: richting geven, creative review, acceptatie per go/no-go-gate en de handmatige pilotproductie. De fte-vraag hierboven gaat dus vooral over review- en operatiecapaciteit, niet over programmeercapaciteit.
