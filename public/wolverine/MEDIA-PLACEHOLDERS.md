# Media-placeholder manifest — Wolverine Worldwide homepage-kopie

Elke media-uiting op de pagina is vervangen door een placeholder met een klein
maar zichtbaar nummer **linksonder** (badge, bv. `#M03`). Vervang de placeholder
door het echte bestand en verwijder daarna de badge (`<span class="ph-id">`).

| Nr.  | Type  | Locatie op de pagina           | Inhoud (origineel)                                   | Aanbevolen formaat |
|------|-------|--------------------------------|------------------------------------------------------|--------------------|
| #M01 | Logo  | Header, linksboven             | Wolverine Worldwide wordmark (donker op wit)         | SVG, ±190×40       |
| #M02 | Video | Hero, full-bleed achtergrond   | Sfeer-/merkenvideo (autoplay, muted, loop)           | MP4/WebM, 1920×1080|
| #M03 | Foto  | Merkengrid, tegel 1            | Merrell — outdoor beeld + merklogo                   | JPG, 1200×900      |
| #M04 | Foto  | Merkengrid, tegel 2            | Saucony — running beeld + merklogo                   | JPG, 1200×900      |
| #M05 | Foto  | Merkengrid, tegel 3            | Sweaty Betty — activewear beeld + merklogo           | JPG, 1200×900      |
| #M06 | Foto  | Merkengrid, tegel 4            | Wolverine — workwear beeld + merklogo                | JPG, 1200×900      |
| #M07 | Foto  | Merkengrid, tegel 5            | Chaco — outdoor lifestyle beeld + merklogo           | JPG, 1200×900      |
| #M08 | Foto  | Merkengrid, tegel 6            | Hush Puppies — casual beeld + merklogo               | JPG, 1200×900      |
| #M09 | Foto  | Merkengrid, tegel 7            | Bates — uniform/tactical beeld + merklogo            | JPG, 1200×900      |
| #M10 | Foto  | Merkengrid, tegel 8            | HYTEST — safety footwear beeld + merklogo            | JPG, 1200×900      |
| #M11 | Foto  | Merkengrid, tegel 9            | Stride Rite — kinderschoenen beeld + merklogo        | JPG, 1200×900      |
| #M12 | Foto  | Merkengrid, tegel 10           | Cat Footwear (licentie) — work beeld + merklogo      | JPG, 1200×900      |
| #M13 | Foto  | Merkengrid, tegel 11           | Harley-Davidson Footwear (licentie) — beeld + logo   | JPG, 1200×900      |
| #M14 | Foto  | Sectie "Who We Are", links     | Bedrijfsfoto (HQ Rockford / heritage / team)         | JPG, 1250×1000     |
| #M15 | Foto  | Sectie "Responsibility", rechts| Community/outdoor/duurzaamheidsbeeld                 | JPG, 1250×1000     |
| #M16 | Foto  | Nieuwscarrousel, kaart 1       | Beeld bij "Company of the Year — Footwear News"      | JPG, 1280×720      |
| #M17 | Foto  | Nieuwscarrousel, kaart 2       | Beeld bij "Q3 2025 Results"                          | JPG, 1280×720      |
| #M18 | Foto  | Nieuwscarrousel, kaart 3       | Beeld bij "Licensing Agreements"                     | JPG, 1280×720      |
| #M19 | Foto  | Nieuwscarrousel, kaart 4       | Beeld bij "Forbes Dream Employers"                   | JPG, 1280×720      |
| #M20 | Foto  | Nieuwscarrousel, kaart 5       | Beeld bij "HQ-renovatie Rockford"                    | JPG, 1280×720      |
| #M21 | Foto  | Nieuwscarrousel, kaart 6       | Beeld bij "Saucony Runner's World Awards"            | JPG, 1280×720      |
| #M22 | Foto  | Sectie "Investor Relations"    | Financieel/kantoorbeeld                              | JPG, 1250×1000     |
| #M23 | Foto  | Careers-banner, full-bleed     | Team-/werkplekfoto (donkere overlay eroverheen)      | JPG, 1920×900      |
| #M24 | Logo  | Footer, linksboven             | Wolverine Worldwide wordmark (wit op donker)         | SVG, ±200×42       |

## Vervangen — zo werkt het

1. Zoek in `index.html` naar het nummer, bv. `#M03`.
2. Vervang het `<span class="ph">…</span>`-blok door een `<img>` (of `<video>` voor #M02), bv.:
   `<img src="media/m03-merrell.jpg" alt="Merrell" loading="lazy" />`
3. Voor de hero-video (#M02):
   `<video autoplay muted loop playsinline src="media/m02-hero.mp4"></video>`
4. De omliggende CSS (hover-zoom, overlays, aspect-ratio) blijft gewoon werken.

## Overgenomen UX-features

- Sticky header die krimpt en schaduw krijgt bij scrollen
- Dropdown-menu's (hover + klik + toetsenbord, Esc sluit) met alle 11 merken
- Utility-bar met beursticker (NYSE: WWW — placeholderwaarden)
- Fullscreen zoek-overlay
- Mobiel hamburger-menu met uitschuiflade en accordeons
- Hero met langzame zoom-animatie, gradient-overlay en scroll-indicator
- Scroll-reveal animaties (IntersectionObserver, met vertraging per element)
- Tellende cijfers in de statistiekenbalk
- Merktegels met hover-zoom, kleuroverlay en "Discover →" die inschuift
- Nieuwscarrousel: pijlen, dots, responsief (3/2/1 kaarten) en touch-swipe
- Parallax-effect op de careers-banner
- E-mailalerts formulier met validatie en bevestiging
- Cookie-consent banner (Accept/Decline)
- "Terug naar boven"-knop na 600px scrollen
- Toegankelijkheid: skip-link, focus-stijlen, aria-labels, `prefers-reduced-motion`

## Herkomst / voorbehoud

Deze kopie is op 2026-07-11 gereconstrueerd. De live site (wolverineworldwide.com)
blokkeert geautomatiseerde toegang (WAF 403), en ook webarchieven waren vanuit de
bouw-omgeving niet bereikbaar. Structuur, navigatie, merkenportfolio, sectietitels
en footer zijn gereconstrueerd uit openbare bronnen (zoekresultaten, paginatitels,
IR-site-structuur). Controleer bij gelegenheid tegen de live site en corrigeer
afwijkingen in tekst/sectievolgorde.
