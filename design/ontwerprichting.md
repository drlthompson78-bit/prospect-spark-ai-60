# Ontwerprichting — Leegstandbeheer Rotterdam

**Werktitel merk:** Tussentijd — Leegstandbeheer Rotterdam
**Status:** voorstel + homepage-mockup (`design/mockup-homepage.html`)
**Bron:** Business Analyse & Verdienmodel — Leegstandbeheer Rotterdam (maart 2026)

---

## 1. Concept: "Het blauwe uur"

De hele identiteit is gebouwd op één beeld dat het product *is*: **een leeg pand in
de schemering, met de stad die eromheen leeft**. Donkere ramen tussen verlichte —
dat is letterlijk de markt (17.278 leegstaande woningen) én de belofte: wij zetten
de donkere ramen aan.

Daaruit volgen alle keuzes:

- **Cinematografisch, niet corporate.** De hero is een filmstill (letterbox,
  filmkorrel, trage Ken Burns-zoom, lower-third titel) — geen stockfoto met
  glimlachende makelaars.
- **Rotterdams, niet landelijk.** Architectonisch raster, beton, havensignalisatie.
  De differentiatie uit het rapport ("hyperlocaal, persoonlijk, geen callcenter")
  moet je *zien*, niet alleen lezen.
- **Dossier-esthetiek.** Doelgroep is de pandeigenaar: zakelijk, risicomijdend.
  Cijfers, termijnen en voorwaarden staan er als kadaster-regels in monospace —
  precisie als ontwerptaal, want juridische zorgvuldigheid ís de propositie.

## 2. Kleur — "Rotterdams blauwe uur"

| Token | Hex | Rol |
|---|---|---|
| `--nacht` | `#0B141F` | Grond donker (blauwzwart, geen puur zwart) |
| `--maas` | `#13202F` | Verhoogde vlakken op donker |
| `--natrium` | `#E19A3F` | Accent: natriumlicht / verlichte ramen — CTA's, nadruk |
| `--natrium-diep` | `#C07F2B` | Accent op lichte grond |
| `--krijt` | `#F1ECE2` | Tekst op donker (warm, niet puur wit) |
| `--staal` | `#93A0AD` | Gedempte tekst op donker |
| `--beton` | `#E8E6E0` | Grond lichte banden (grijs beton, geen crème) |
| `--inkt` | `#17232F` | Tekst op licht |

De pagina wisselt bewust tussen donkere (cinema: hero, werkwijze, urgentie) en
lichte betonbanden (informatie: markt, doelgroepen, contact). Eén gecommitteerde
visuele wereld — geen light/dark-switch; het contrast tussen de banden geeft het
ritme.

## 3. Typografie

| Rol | Font | Gebruik |
|---|---|---|
| Display | **Barlow Condensed** 600/700 | Koppen, uppercase, line-height .92 — havensignalisatie |
| Lopend | **Archivo** (variabel 100–900) | Body, no-nonsense grotesk |
| Data | **IBM Plex Mono** 400/500 | Eyebrows, cijfers, termijnen, voorwaarden — tabular-nums |

Alle fonts zijn als data-URI ingesloten (geen externe requests, geen FOUT).

## 4. Beeld — Higgsfield (Cinema Studio Image 2.5)

Gegenereerd op 12-07-2026, consistent gegradeerd in inktblauw + amber:

| Asset | Job-ID | Formaat | Gebruik |
|---|---|---|---|
| Hero: leeg appartement, uitzicht Erasmusbrug, blauwe uur | `e92bc57f-0549-48d4-8390-e13b8bccb640` | 21:9, 2K | Hero (in mockup) |
| Hero variant B (zelfde prompt, andere seed) | `b9edad50-f8f9-43af-a1cf-9f421f720703` | 21:9, 2K | Alternatief |
| Luchtopname Rotterdam / Maas bij schemering | `1625159c-ee14-4ea0-aedb-3a87627afb5e` | 16:9, 2K | Sectie "De markt" |

Beeldregie voor vervolgpagina's: altijd blauwe uur, altijd amber/inktblauw-grading,
lege interieurs of stadsgezichten — nooit mensen die in de camera lachen.
Voor de bouwfase: video-hero (subtiele parallax/timelapse blauwe uur) genereren met
hetzelfde Higgsfield-model in 21:9.

## 5. Layout & structuur

- Kader 1240px, hairlines als bouwtekening-registratielijnen boven elke sectiekop.
- Sectiekoppen: mono-eyebrow naast condensed kop op één basislijn.
- **Genummerde stappen alléén bij de werkwijze** (echte sequentie uit het rapport:
  pandscan → vergunning → huurder/contract → beheer → verlenging/oplevering).
- Statband onder de hero als "dossierregel": 17.278 / 9.500 / ~56% / 3–7 wkn.
- Scherpe hoeken overal (geen border-radius) — architectonisch, geen SaaS-template.

## 6. Beweging

Eén georkestreerd moment: de hero-laadsequentie (Ken Burns op het beeld, titelregels
schuiven gestaffeld op, statband telt op). Daarna alleen rustige scroll-reveals en
één betekenisvol detail: het **ramenraster** in de urgentiesectie, waar donkere
ramen één voor één aangaan zodra je scrollt — het merkverhaal in vier seconden.
`prefers-reduced-motion` schakelt alles uit.

## 7. Copy-toon

Direct, Rotterdams, eigenaar-eerst. Korte stellende koppen ("Uw pand staat leeg.
Rotterdam niet." / "De gemeente kijkt mee. Wees haar vóór."). Cijfers en juridische
kaders altijd concreet en herleidbaar naar het rapport (Leegstandwet, €166,30 leges,
min. 6 maanden, opzegtermijn 3 maanden, max. 5/7/10 jaar).

## 8. Vervolg (bouwfase)

1. Keuze hero-variant + merknaam bevestigen ("Tussentijd" is een voorstel).
2. Video-hero + beeldset per doelgroeppagina genereren (Higgsfield).
3. Pagina's: Werkwijze (detail), Voor eigenaren (3 doelgroepen), Tarieven
   (commissiemodel 8–12% + opstartfee), Kennisbank/Leegstandwet, Contact.
4. Pandscan-formulier koppelen (Supabase in deze repo ligt voor de hand) en
   hosting bepalen: aparte marketingsite naast het bestaande Prospect OS-dashboard.
