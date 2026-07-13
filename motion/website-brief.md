# Website-brief — hero-integratie Het Taartenhuis

## Doel
De bestaande homepage-hero vervangen door een scroll-gestuurde cinematografische hero waarin
de signatuurtaart draait en bij het scrollen laag voor laag uit elkaar trekt — via één
gescrubte AI-film, exact zoals BurgerLab dat met de burger deed, maar in het echte lichte merk
van Het Taartenhuis.

## Wat verandert
- Alleen `src/components/home/Hero.tsx` en de bijbehorende motion/asset-code.
- Nieuwe afhankelijkheden: `gsap` (met `gsap/ScrollTrigger`). Lenis bestaat al.
- Nieuw asset: `public/hero/loua-scroll.mp4` (all-keyframe).

## Wat NIET verandert (vergrendeld)
- Catalogus `Onze taarten` (1206 taarten, originele teksten).
- Smaken en prijzen, Bedrijven, Over ons, Contact.
- Webshop (collectie, productpagina's, winkelwagen, checkout).
- Navigatie, footer, social-elementen, licht/donker-schakelaar.
- Alle originele teksten, prijzen en foto's.

## Hero-copy (echt, HTML-overlay)
- Kicker: "Sinds 2005"
- Kop: "Welkom bij Het Taartenhuis"
- Subregel: "Uw online taartenspecialist voor de lekkerste taarten voor elke gelegenheid."
- Knoppen: "Bekijk al onze taarten" (→ /onze-taarten), "Voor bedrijven" (→ /bedrijven)
- Scroll-hint: "Scroll — laag voor laag"
- Ingrediënt-labels (letterlijk van smaken-en-prijzen): marsepein/fondant · slagroomvulling ·
  luchtige vanille- of chocoladecake · met de hand gemaakt

## Interactie
- Gepinde hero; scrollprogress → `video.currentTime` (frame-scrubbing).
- Fase 1 draaien, fase 2 verticale scheiding; copy schuift, labels verschijnen als overlay.
- Mobiel/reduced-motion: statische poster (`cakeWhole`) met dezelfde copy, geen pin.

## Acceptatie
- Soepel scrubben op desktop; leesbare copy; echte teksten; vergrendelde content intact;
  build + tests groen.
