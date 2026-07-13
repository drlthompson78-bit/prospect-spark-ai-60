---
name: taartenhuis-motion-hero
description: >-
  Productie-workflow en bouwregels voor de scroll-gestuurde cinematografische hero van
  Het Taartenhuis, gebouwd met Claude Code, Higgsfield MCP (image-to-video), React, Vite,
  TypeScript, Tailwind, GSAP, ScrollTrigger en Lenis. Gebruik deze skill bij werk aan de
  homepage-hero: de door AI gegenereerde taartfilm, de scroll-gescrubte achtergrondvideo,
  video-encoding, motion-timing, en het koppelen van scrollpositie aan de afspeeltijd.
  Deze skill geldt UITSLUITEND voor de homepage-hero; de rest van de site (catalogus,
  smaken en prijzen, bedrijven, over ons, contact, webshop) is echte klantcontent en wordt
  niet aangeraakt. Triggers: taartenhuis hero, motion hero, scroll-scrubbed video, gescrubte
  film, Higgsfield MCP, GSAP, ScrollTrigger, Lenis, image-to-video, taart-deconstructie.
---

# Het Taartenhuis — scroll-gestuurde cinematografische hero

Een scroll-gestuurde hero voor de **bestaande** website van Het Taartenhuis (een echte
klant: ambachtelijke taartenbakkerij uit Rotterdam, sinds 2005). De hero moet één sterk
idee dragen:

> Bij binnenkomst zie je de signatuurtaart cinematografisch tot leven komen: hij draait,
> en trekt bij het scrollen laag voor laag uit elkaar — de scroll bestuurt de film.

Dit is de aanpak die BurgerLab (fictief, donker-luxe) zo overtuigend maakte, hier vertaald
naar het echte, lichte, warme merk van Het Taartenhuis. **We lenen de techniek en de
discipline, niet het merk.**

## Waarom deze aanpak (het kernverschil)

De eerdere hero gebruikte losse, platte uitgeknipte PNG-lagen die met CSS uit elkaar
schoven, plus een losse orbit-video. Dat voelt nooit echt 3D, omdat het platte lagen zijn
en de twee effecten losgekoppeld zijn.

Deze skill schrijft de BurgerLab-techniek voor:

- **Eén doorlopende AI-film** (opgebouwde taart → camera draait eromheen → lagen scheiden
  verticaal) als achtergrond van de hero.
- De **scrollpositie wordt frame-voor-frame op `video.currentTime` gemapt** — je scrubt de
  film met je scroll. Rotatie én deconstructie zitten in één beweging, want het is echte
  cinematische footage.
- De ruwe film wordt **her-geëncodeerd naar all-keyframe H.264** zodat elk frame direct
  seekbaar is en het scrubben boterzacht loopt.

---

## Scope-regel (belangrijk)

Deze skill raakt **alleen** de homepage-hero (`src/components/home/Hero.tsx` en de
bijbehorende assets/motion-code). Alles hieronder is **vergrendeld** en mag niet gewijzigd
worden vanuit deze skill:

- de catalogus `Onze taarten` (`src/data/taarten.json`, `OnzeTaartenPage.tsx`) en alle
  originele taartteksten;
- de pagina's Smaken en prijzen, Bedrijven, Over ons, Contact;
- de webshop (collectie, productpagina's, winkelwagen, checkout);
- alle originele teksten, prijzen en foto's uit de site-mirror;
- de bestaande licht/donker-thema-schakelaar, navigatie, footer en social-elementen.

De hero is een verbetering van de bestaande site, geen herbouw.

---

## Projectfeiten

- **Projecttype:** scroll-gestuurde cinematografische hero binnen een bestaande multi-page site
- **Merk:** Het Taartenhuis (echte klant, sinds 2005)
- **Signatuurproduct voor de film:** de IJsjes-taart (roze driptaart met omgekeerd
  ijshoorntje, ijsjes en raketjes) — dit is de taart die ook op de originele hero van
  hettaartenhuis.nl staat
- **Kerninteractie:** scroll-gescrubte AI-taartfilm in de hero
- **Filmconcept:** de complete taart staat centraal, de camera draait eromheen, en in de
  tweede helft scheiden de bestaande lagen zich verticaal in een elegante exploded view
- **Bouwomgeving:** Claude Code, bestaand project `prospect-spark-ai-60`
- **Stack:** Vite + React + TypeScript + Tailwind + **GSAP + ScrollTrigger + Lenis** +
  Higgsfield MCP (image-to-video) + `ffmpeg` voor all-keyframe H.264
- **Achtergrondvideoformaat:** licht, cinematisch, langzaam, all-keyframe H.264 na encoding

---

## Claude Code werkregels (approval-gates)

Gedraag je als een zorgvuldige productie-assistent, niet als een ongecontroleerde generator.
Vóór media genereren of credits uitgeven:

1. Lees deze skill.
2. Zorg dat de planningsbestanden in `motion/` bestaan en kloppen.
3. Geef een kort plan met exact wat je wilt genereren.
4. **Vraag expliciete goedkeuring vóór elke Higgsfield-generatie** (`generate_video`,
   `generate_image`).

Doe NIET:

- willekeurige assets genereren zonder plan;
- credits uitgeven vóór goedkeuring;
- meer varianten genereren dan gevraagd;
- tekst in beeld of video bakken (alle tekst blijft HTML/CSS-overlay);
- de vergrendelde content of pagina's aanpassen;
- **teksten, prijzen of foto's verzinnen** — alle content is echte klantdata en is leidend.

Doe WEL:

- prompts en generatie-notities in `motion/` bewaren vóór het genereren;
- elk Higgsfield-resultaat meteen naar de juiste plek in het project halen;
- de hero lokaal draaien en verifiëren (dev-server + browsercheck/screenshots);
- een productie-build draaien vóór je klaar bent.

### Higgsfield MCP-notities

- Gebruik `generate_video` (image-to-video) voor de achtergrondfilm, met de bestaande
  taart-still als enige referentie.
- Modelkeuze: een image-to-video-model dat één naadloze shot levert (bijv. `seedance_2_0`
  of `kling3_0_turbo`). Kies bij goedkeuring; leg de keuze vast in `video-prompt.md`.
- Is een job asynchroon: poll de status en rapporteer voortgang in plaats van stil te wachten.
- De film wordt pas gegenereerd nadat de taart-still-referentie is goedgekeurd.

---

## Merkidentiteit (echt, niet fictief)

Bron van waarheid: de bestaande site en de mirror. Toon: **warm, ambachtelijk, persoonlijk,
verzorgd**. Opgericht in 2005 door Esther van den Handel; alle taarten met de hand gemaakt,
dagvers, maatwerk, ophalen in Rotterdam (geen bezorging).

Vermijd: donker-luxe/charcoal, "premium fast-food"-energie, koele tech-uitstraling,
verzonnen marketingtaal. Het merk is een familiebakkerij, geen luxe-lab.

---

## Merktokens (licht thema — al aanwezig in `src/index.css`)

De hero volgt het bestaande lichte thema. Niet opnieuw definiëren; hergebruiken:

```css
/* uit :root.theme-light */
--background: 340 30% 98%;   /* warm wit */
--foreground: 240 10% 12%;   /* bijna zwart */
--primary:    168 52% 40%;   /* turquoise, uit het logo (knoppen, accenten) */
--accent:     168 52% 40%;
/* logo-roze (de "T") als tweede accent, spaarzaam: ~ hsl(326 78% 52%) */
```

Regels:
- Turquoise is het primaire accent (knoppen, actieve staat, voortgang).
- Logo-roze alleen spaarzaam als tweede accent.
- De hero-achtergrond is licht/warm wit, niet donker.
- Geen neon, geen glaseffect-overdaad.

## Typografie

- **Display/koppen:** `Prata` (serif) — al in gebruik via `.font-display`.
- **Body:** de bestaande Tailwind sans.
- **Labels/prijzen:** de bestaande sans; geen aparte mono introduceren.

---

## Media-asset-plan

De hero heeft drie assetgroepen. **Twee bestaan al** (hergebruiken, geen credits):

### 1. Taart-still (assembled) — BESTAAT AL
De Higgsfield-reconstructie van de IJsjes-taart Loua op lichte studio-achtergrond.
Job `3cb2719a-4931-4870-a168-2d6a5a394c61`. Dient als film-referentie én als poster/mobile
fallback. Zie `src/data/assets.ts` → `cakeWhole`.

### 2. Exploded/lagen-referentie — BESTAAT AL
De vier losse laag-renders (`cakeLayers` in `assets.ts`). Alleen als visuele referentie voor
de scheidingsvolgorde in de film; niet meer als losse CSS-lagen in de nieuwe hero.

### 3. De scroll-film — TE GENEREREN (na goedkeuring)
Ruwe versie:
```txt
motion/assets/loua-hero-scroll-raw.mp4
```
Productieversie (all-keyframe):
```txt
public/hero/loua-scroll.mp4
```
Concept: de complete taart staat centraal op lichte achtergrond; de camera duwt zacht in en
draait eromheen; in de tweede helft scheiden de bestaande lagen zich verticaal tot een
elegante exploded view. Langzaam, stabiel, leesbaar tijdens handmatig scrubben.

---

## Filmprompt (leg vast in `motion/video-prompt.md` vóór genereren)

Kern (volledige versie in `video-prompt.md`):

> Eén doorlopende, naadloze cinematografische shot van exact de taart uit de referentie
> (roze driptaart met omgekeerd ijshoorntje, ijsjes, raketjes, snoep). Start met de
> complete taart, gecentreerd op een zachte warm-witte studio-achtergrond met diffuus
> daglicht. Camera duwt zacht in en draait rustig om de taart. In de tweede helft scheiden
> de **bestaande zichtbare lagen** zich verticaal in een nette exploded view.
> **Voeg geen ingrediënten toe** die niet in de referentie staan. Zelfde kleuren,
> proporties en identiteit van begin tot eind. Geen tekst, geen logo's, geen handen, geen
> mensen, geen snelle cuts, geen camera-shake. Genoeg lichte negatieve ruimte voor
> tekstoverlay. Duur 8–12s.

Consistentieregel (cruciaal): alleen de bestaande lagen scheiden, niets toevoegen of
veranderen — anders "verandert" de taart tijdens het scrubben.

---

## Her-encoden naar all-keyframe H.264

Ruwe AI-MP4's seeken slecht tijdens scrubben. Encode naar all-keyframe:

```bash
mkdir -p public/hero
ffmpeg -y -i motion/assets/loua-hero-scroll-raw.mp4 -an -c:v libx264 -preset slow -crf 18 \
  -g 1 -keyint_min 1 -sc_threshold 0 -pix_fmt yuv420p \
  -movflags +faststart public/hero/loua-scroll.mp4
```

`-g 1 -keyint_min 1 -sc_threshold 0` = elk frame een keyframe → direct seekbaar.

---

## Hero-sectieplan (mapping scroll → film + copy)

De hero is een gepinde sectie waarin de scrollprogress de film scrubt. Copy is **echte
sitetekst**, als HTML-overlay:

| Scrollfase | Film | Overlay-copy (bestaand, echt) |
|---|---|---|
| 0.0–0.3 | taart compleet, camera duwt in | kicker "Sinds 2005" + kop "Welkom bij Het Taartenhuis" + "Uw online taartenspecialist voor de lekkerste taarten voor elke gelegenheid." + knoppen "Bekijk al onze taarten" / "Voor bedrijven" |
| 0.3–0.8 | camera draait, lagen beginnen te scheiden | kop schuift weg; ingrediënt-labels verschijnen als HTML-overlay (marsepein/fondant, slagroomvulling, cake — letterlijke zinnen van smaken-en-prijzen) |
| 0.8–1.0 | volledig exploded | "Scroll — laag voor laag"; overgang naar de volgende sectie |

Labels zijn HTML/CSS-overlays. Nooit in de video bakken.

---

## Laag-architectuur (alleen binnen de hero)

De film is `position: sticky/fixed` **binnen de hero-sectie**, niet achter de hele site.

| Element | z-index | Rol |
|---|---:|---|
| hero-film `<video>` | 0 | gescrubt door scroll, `object-fit: cover` |
| scrim/tint | 1 | zachte leesbaarheidslaag (licht, subtiel) |
| grain | 2 | bestaande filmkorrel |
| hero-copy | 20 | kop, subregel, knoppen, labels |

---

## Scroll-scrub-implementatie (GSAP + ScrollTrigger + bestaande Lenis)

**Let op — Lenis bestaat al** in `src/pages/shop/ShopLayout.tsx`. Instantieer geen tweede
Lenis. Koppel de bestaande Lenis aan GSAP/ScrollTrigger en registreer ScrollTrigger één keer.

Patroon (React/TS, in de hero):

```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

// in een useEffect van de hero, met ref naar het <video> en de sectie:
const video = videoRef.current!;
video.pause();
let last = -1;

const st = ScrollTrigger.create({
  trigger: sectionRef.current!,
  start: "top top",
  end: () => "+=" + window.innerHeight * 2.4, // pin-lengte = scrub-lengte
  pin: pinRef.current!,
  scrub: true,
  invalidateOnRefresh: true,
  onUpdate: (self) => {
    if (!video.duration) return;
    const t = self.progress * (video.duration - 0.05);
    if (Math.abs(t - last) > 0.008) { video.currentTime = t; last = t; }
  },
});
video.addEventListener("loadedmetadata", () => { video.currentTime = 0; });
return () => st.kill();
```

Koppel Lenis aan ScrollTrigger op één plek (ShopLayout), niet per component:

```ts
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

Dev-hooks in development: `window.__heroVideo`, `window.__ST`.

---

## Mobiel gedrag

Scroll-scrubben is zwaar op mobiel. Fallback:

- verberg de film op touch/kleine schermen;
- toon de taart-still (`cakeWhole`) als poster;
- geen pin op mobiel; toon een compacte statische hero met dezelfde copy;
- respecteer `prefers-reduced-motion`: altijd de statische poster.

---

## Content-integriteitsregels (les uit dit project)

- Alle teksten, prijzen en foto's zijn **echte klantdata** en zijn leidend. Nooit verzinnen,
  nooit parafraseren waar een letterlijke sitetekst bestaat.
- Functionele UI-labels (knoppen, foutmeldingen) mogen nieuw zijn; inhoudelijke copy niet.
- Bij twijfel over een tekst: haal de letterlijke versie uit de mirror
  (`origin/reference/hettaartenhuis-mirror`).

---

## Verificatie-checklist

- [ ] `motion/brand-kit.md`, `asset-plan.md`, `image-prompts.md`, `video-prompt.md`,
      `website-brief.md` bestaan en kloppen
- [ ] taart-still-referentie bestaat en is goedgekeurd
- [ ] ruwe film bestaat in `motion/assets/`
- [ ] all-keyframe film bestaat op `public/hero/loua-scroll.mp4`
- [ ] GSAP + ScrollTrigger geïnstalleerd en één keer geregistreerd
- [ ] bestaande Lenis hergebruikt (geen tweede instantie)
- [ ] film scrubt soepel op scroll (desktop)
- [ ] hero-copy blijft leesbaar en is echte sitetekst
- [ ] ingrediënt-labels zijn HTML-overlays, niet in de video
- [ ] mobiele/reduced-motion fallback met poster werkt
- [ ] vergrendelde pagina's/content ongewijzigd
- [ ] `npm run build` en `npm test` slagen
- [ ] geen tekst/logo's in de film gebakken

---

## Bouwvolgorde

1. Skill + planningsbestanden schrijven (deze stap, geen credits)
2. Taart-still-referentie bevestigen (bestaat al)
3. Filmprompt vastleggen in `video-prompt.md`
4. **Goedkeuring vragen**
5. Film genereren (image-to-video) → ruwe MP4 in `motion/assets/`
6. Her-encoden naar all-keyframe → `public/hero/loua-scroll.mp4`
7. GSAP + ScrollTrigger toevoegen; Lenis koppelen in ShopLayout
8. Hero herbouwen met gescrubte film + HTML-overlay-copy
9. Mobiele/reduced-motion fallback
10. Verifiëren (dev + screenshots), build + tests, pushen
