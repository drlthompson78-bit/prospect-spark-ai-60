# Het Taartenhuis - cinematografische redesign

Een award-waardige, cinematografische herontwerp van [hettaartenhuis.nl](https://hettaartenhuis.nl/) met volledige webshop-functionaliteit. Gebouwd met React 18, Vite, Tailwind en shadcn/ui; motion (Framer Motion) en Lenis verzorgen de scroll-choreografie.

## Highlights

- **Cinematische hero** met een door Higgsfield gegenereerde 10s videoloop (Kling 3.0, 1080p): de video schaalt en dimt mee met de scroll, de serif-kop stijgt per regel op en het beeld trekt zich terug in een kader.
- **Gepinde horizontale filmrail** voor de signatuurcollectie (desktop), swipebare rail op mobiel.
- **Webshop**: collectie met categoriefilters en sortering, productpagina's met formaat/smaak/aantal, winkelwagen (localStorage) en een checkout die de echte werkwijze van Het Taartenhuis volgt (vrijblijvende bestelaanvraag, bevestiging met betaalinfo per e-mail).
- **Taart op maat**: aanvraagformulier met validatie (react-hook-form + zod).
- Reduced-motion-vriendelijk: alle pins, parallax en autoplay vallen terug op statische composities.

## Assets

Alle fotografie en de herovideo zijn gegenereerd via de Higgsfield MCP (Soul Cinema / Kling 3.0 Turbo) in een consistente chiaroscuro-stijl. De URL's staan centraal in `src/data/assets.ts` en verwijzen naar de Higgsfield CDN; download ze naar `public/` en pas dat ene bestand aan om ze lokaal te hosten.

## Ontwikkelen

```sh
npm install
npm run dev    # ontwikkelserver
npm test       # vitest (o.a. winkelwagenlogica)
npm run build  # productiebuild
```

Let op: `package-lock.json` verwijst naar de publieke npm-registry. De winkelwagen- en prijslogica staat in `src/lib/cart.ts` met tests in `src/test/cart.test.ts`.
