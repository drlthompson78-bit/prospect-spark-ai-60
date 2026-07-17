# Edge.tech clone

Een front-end recreatie van [edge.tech](https://edge.tech) (EDGE — "The world needs better buildings"), de Amsterdamse ontwikkelaar van slimme, duurzame gebouwen.

## Bekijken

Open `index.html` direct in de browser — geen build, server of dependencies nodig.

## Gehanteerde principes

- **Eén zelfstandig bestand**: alle HTML, CSS en JavaScript in `index.html`; geen externe libraries, fonts of afbeeldingen (werkt volledig offline).
- **Scroll-gedreven animaties**: line-reveal in de hero, IntersectionObserver-reveals per sectie, tellende statistieken, een animerende voortgangsring en een subtiele hero-parallax. `prefers-reduced-motion` wordt gerespecteerd.
- **Eigen beeldmateriaal**: gevel-"foto's" worden als deterministisch gegenereerde SVG-rasters getekend in plaats van gekopieerde fotografie.
- **Responsief**: volledig bruikbaar van mobiel (met fullscreen menu) tot desktop.
- **Structuur van het origineel**: hero → missie + statistieken → portfolio (The Edge, EDGE Olympic, EDGE Amsterdam West, EDGE Suedkreuz, EDGE East Side, EDGE London Bridge) → impact (Paris Proof) → technologie (smart building platform) → nieuws → contact → footer met kantoren.

> Disclaimer: dit is een designstudie/oefening, niet geaffilieerd met EDGE. Teksten zijn eigen samenvattingen in de stijl van het origineel; er is geen fotografie of letterlijke sitecontent overgenomen.
