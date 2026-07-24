# Plan van aanpak — Vernieuwde website Arhin Zorg

**Doel:** arhinzorg.nl vernieuwen met de structuur, UX en beleving van pameijer.nl als referentie, volledig ingevuld met de eigen content, huisstijl en identiteit van Arhin Zorg.

**Status:** concept-voorstel voor samenwerking. Bijbehorende mockup: `index.html` in deze map.

---

## 1. Uitgangspunten

### Wat we van pameijer.nl overnemen (structuur & UX)
- **Duidelijke doelgroep-navigatie**: "Hulpaanbod" en "Informatie voor" (cliënten/ouders, verwijzers, gemeenten) als mega-menu's, plus "Over" en "Werken bij".
- **Servicebalk** bovenin met telefoonnummer, openingstijden en toegankelijkheidslink.
- **Hero met menselijke fotografie** in organische (blob)vormen, warme headline en twee duidelijke CTA's.
- **Themakaarten** per zorgvorm met eigen accentkleur, icoon en hover-effect.
- **Vertrouwensopbouw** op de homepage: missie/kernwaarden, cijfers, ervaringsverhalen (carrousel), nieuws.
- **Transparantie**: wachttijden en locatie prominent op de homepage.
- **Werken bij** als volwaardige sectie (werving is voor zorgorganisaties net zo belangrijk als instroom van cliënten).
- **Toegankelijkheid als ontwerpprincipe** (WCAG 2.1 AA): skip-links, toetsenbordnavigatie, contrast, begrijpelijke taal (B1), reduced-motion.
- **Effecten**: sticky header, zachte scroll-reveals, afgeronde vormen, pill-knoppen, golf-overgangen tussen secties.

### Wat van Arhin Zorg blijft (content & identiteit)
- Alle diensten: **begeleid wonen (24-uurs, ZIN/WLZ), ambulante begeleiding, dagbesteding, gezinshuis**.
- Doelgroep: kinderen, jongeren, jongvolwassenen en gezinnen met (L)VB en/of gedragsproblematiek.
- Kernwaarden: respect en liefde, zelfredzaamheid, toekomstperspectief.
- Contactgegevens: Dukdalfweg 19 Almere, 085-8002029, aanmelden@teamarhinzorg.nl, KvK 82452881.
- Bestaande pagina's als basis: hulpaanbod, wachttijd, contact, gezinshuisouder, hoofdbewoner, orthopedagoog.
- **Huisstijlkleuren**: in de mockup als CSS-variabelen opgezet (`--groen`, `--oranje`, `--geel`, `--blauw`) zodat de definitieve logokleuren van Arhin Zorg er in stap 1 exact 1-op-1 in gezet worden.

---

## 2. Fasering

### Fase 0 — Kick-off & validatie (week 1)
- Presentatie mockup aan Arhin Zorg; feedback ophalen.
- Aanleveren brand-assets: logo (vector), exacte kleurcodes, fotografie(rechten), tone-of-voice.
- Inventarisatie huidige content, doelgroepen en aanmeldproces; keuze domein/hosting/CMS-toegang.

### Fase 1 — Design system & definitief ontwerp (week 2–3)
- Design tokens vastleggen: kleuren, typografie, spacing, componenten (knoppen, kaarten, formulieren).
- Homepage + 3 templatepagina's uitwerken (dienstpagina, informatiepagina, vacaturepagina).
- Fotografieplan: echte mensen en locaties van Arhin Zorg (met toestemmings-/privacyprotocol, belangrijk bij jeugdzorg).

### Fase 2 — Content (week 3–5, parallel)
- Sitemap definitief: Home · Hulpaanbod (4 subpagina's) · Informatie voor (cliënten/ouders, verwijzers, gemeenten) · Over ons · Werken bij (vacatures) · Wachttijden · Nieuws · Contact/Aanmelden.
- Herschrijven teksten op B1-niveau; echte ervaringsverhalen verzamelen (met toestemming).
- Juridische pagina's: privacyverklaring (AVG), klachtenregeling, cookiebeleid, toegankelijkheidsverklaring.

### Fase 3 — Bouw (week 4–7)
- Technische stack: statische/headless opzet of gebruiksvriendelijk CMS zodat Arhin Zorg zelf nieuws, vacatures en wachttijden kan bijwerken.
- Componenten uit de mockup omzetten naar herbruikbare CMS-componenten.
- Aanmeldformulier met beveiligde verwerking (geen medische gegevens via onbeveiligde mail), bevestiging "reactie binnen 24 uur".
- Performance: statische generatie, geoptimaliseerde afbeeldingen, Core Web Vitals groen.

### Fase 4 — Kwaliteit & livegang (week 7–8)
- WCAG 2.1 AA-audit, test met toetsenbord en screenreader; test op mobiel (meerderheid zorgverkeer).
- SEO-migratie: 301-redirects van alle bestaande URL's (o.a. `/hulpaanbod`, `/Wachttijd`, `/gezinshuisouder`), meta-data, lokale vindbaarheid (Google Bedrijfsprofiel, "begeleid wonen Almere").
- Livegang met DNS-omzetting buiten kantoortijden; monitoring eerste 2 weken.

### Fase 5 — Beheer & doorontwikkeling (doorlopend)
- Redactietraining voor het team van Arhin Zorg.
- Kwartaalritme: wachttijden actualiseren, nieuws en vacatures bijhouden.
- Doorontwikkeling: cliëntenportaal, meertaligheid, online aanmeldflow met status-updates.

---

## 3. Rollen & beslismomenten

| Moment | Beslissing | Wie |
|---|---|---|
| Einde fase 0 | Akkoord op richting + aanlevering brand-assets | Arhin Zorg |
| Einde fase 1 | Akkoord definitief ontwerp | Arhin Zorg |
| Einde fase 2 | Akkoord content & juridische pagina's | Arhin Zorg |
| Einde fase 4 | Go/no-go livegang | Gezamenlijk |

## 4. Openstaande punten
- Exacte huisstijlkleuren en logobestanden van Arhin Zorg (mockup gebruikt nu een zorg-passend palet als placeholder, technisch voorbereid op 1-op-1 vervanging).
- Fotografie: nieuwe shoot of bestaand materiaal (incl. toestemming minderjarigen).
- Keuze CMS/hosting en wie het technisch beheer doet.
- Echte ervaringsverhalen en actuele wachttijden ter vervanging van de voorbeeldcontent in de mockup.
