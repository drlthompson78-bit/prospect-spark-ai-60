/**
 * Alle beelden en video zijn gegenereerd via Higgsfield (Soul Cinema / Kling 3.0)
 * in een consistente cinematografische stijl. De URL's wijzen naar de Higgsfield
 * CDN; vervang ze door lokale bestanden zodra de assets gedownload zijn
 * (dit is de enige plek waar ze staan).
 */
const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3G4QegAsaFY0uHYmF8kpkZr8Wp8";

export const heroVideo = `${CDN}/hf_20260711_152540_f3391bbf-392b-4c13-bc79-be8b0bd1ddbf.mp4`;
export const heroPoster = `${CDN}/hf_20260711_152235_4a772b9f-14b5-4bf0-bf37-f1a7fda78009.png`;
export const heroPosterMin = `${CDN}/hf_20260711_152235_4a772b9f-14b5-4bf0-bf37-f1a7fda78009_min.webp`;
export const heroAlt = `${CDN}/hf_20260711_152235_1d9e872f-2eb2-4f78-bfb7-9a1d9bf4ae0c_min.webp`;
export const atelierHands = `${CDN}/hf_20260711_152407_ad66e76e-ce48-4909-84ea-1289170c2f21_min.webp`;

/**
 * De hero-taart: een Higgsfield-reconstructie van de echte IJsjes-taart Loua
 * (staat ook op de hero van hettaartenhuis.nl). Compleet beeld plus vier
 * losse lagen als transparante PNG's, voor de scroll-deconstructie.
 * Volgorde: topdek met hoorntje → slagroomvulling → cake → basis met drip.
 */
export const cakeWhole = `${CDN}/hf_20260711_233854_818d673b-e15f-4eab-99fd-449f774fef1f_min.png`;
export const cakeLayers = [
  `${CDN}/hf_20260711_233855_d994b79b-5162-41d2-b6be-7809fa2fc06e_min.png`,
  `${CDN}/hf_20260711_233856_a8189c62-3c36-4290-81d7-b80856d1a97a_min.png`,
  `${CDN}/hf_20260711_233904_092aeca1-edef-48c2-81a9-a13e2839a76a_min.png`,
  `${CDN}/hf_20260711_233905_5267eb35-f986-495c-95ba-6bc8a56fbe0a_min.png`,
] as const;

/** Donkere (versie 1) taart-assets, bewaard voor de cinematografische variant. */
export const cakeWholeDark = `${CDN}/hf_20260711_220945_9e8fdd0b-f049-494a-8f7a-0ac0ec0d77bf_min.png`;

/**
 * 360°-orbitvideo van de Loua-reconstructie (Kling 3.0 Turbo): de camera
 * draait om de taart heen, voor de 3D-wauwfactor in fase 1 van de hero.
 */
export const cakeOrbitVideo: string | null = `${CDN}/hf_20260712_153600_291112f2-c2e3-4c29-97ff-ea77dc7fa593.mp4`;

/**
 * Echte foto's van hettaartenhuis.nl (uit de wget-mirror), lokaal gehost in
 * public/fotos/. De klant herkent hierdoor zijn eigen werk in de webshop.
 * BASE_URL houdt rekening met de GitHub Pages preview-basis.
 */
const FOTOS = `${import.meta.env.BASE_URL}fotos`;

export const siteLogo = `${FOTOS}/logo.png`;

/**
 * Productknoppen: de echte taarten van Het Taartenhuis, door Higgsfield
 * herbouwd met een uniforme zachte studio-achtergrond. De klant herkent
 * zijn eigen werk, maar de frontpagina oogt strak en consistent.
 * De onbewerkte originelen staan in public/fotos/ (o.a. voor de galerij).
 */
export const productImages = {
  verjaardag: `${CDN}/hf_20260711_233727_f5063579-08e3-46de-a352-d8c99c1cca89_min.webp`,
  lagentaart: `${CDN}/hf_20260711_233730_ddb9be71-ad7c-486d-bbbf-569c9318a240_min.webp`,
  cijfertaart: `${CDN}/hf_20260711_233732_ba169281-e7bb-4ddb-b1a9-0aef0fbffd17_min.webp`,
  bruidstaart: `${CDN}/hf_20260711_233734_6e512d19-c213-4727-ab0c-8b4d6af6577f_min.webp`,
  dinotaart: `${CDN}/hf_20260711_233737_a1b4d250-c838-4fb1-af10-6a7f7cd75a8a_min.webp`,
  kindertaart: `${CDN}/hf_20260711_234152_c2655fef-7be5-46c5-8983-408718337573_min.webp`,
  genderReveal: `${CDN}/hf_20260711_233748_38ae5db4-4704-46b9-bc6e-bd3b0d88ee49_min.webp`,
  babyshower: `${CDN}/hf_20260711_233751_97ab7bc3-6efa-4fc3-98cf-e54f6b6d5dd9_min.webp`,
  geboorte: `${CDN}/hf_20260711_235938_e0985b74-e4c0-455a-8ab6-7e0f0f5d534c_min.webp`,
  geslaagd: `${CDN}/hf_20260711_233756_1d3f6129-76e0-4ea7-9ed1-9174b616cf46_min.webp`,
  bedrijfstaart: `${CDN}/hf_20260711_233825_e5512400-27a3-4e09-8a5f-9d5df3e02613_min.webp`,
  cupcakes: `${CDN}/hf_20260711_233827_577b27db-4128-4d74-8fdd-f67b744ffdaa_min.webp`,
  chocoladeDrip: `${CDN}/hf_20260711_233730_ddb9be71-ad7c-486d-bbbf-569c9318a240_min.webp`,
  communie: `${CDN}/hf_20260711_235938_e0985b74-e4c0-455a-8ab6-7e0f0f5d534c_min.webp`,
} as const;

/** De taart van de originele hero (IJsjes taart Loua), referentie voor de reconstructie. */
export const louaFoto = `${FOTOS}/ijsjes-taart-loua.jpg`;

/** Recentste echte werk, in de volgorde van de galerij op hettaartenhuis.nl/onze-taarten. */
export const galerij = [
  { src: `${FOTOS}/galerij-01.jpg`, alt: "Dierentaart" },
  { src: `${FOTOS}/galerij-02.jpg`, alt: "Combinatie-lagentaart" },
  { src: `${FOTOS}/galerij-03.jpg`, alt: "K-Pop Demon Hunters taart" },
  { src: `${FOTOS}/galerij-04.jpg`, alt: "T-shirt taart Suriname" },
  { src: `${FOTOS}/galerij-05.jpg`, alt: "Simba taart" },
  { src: `${FOTOS}/galerij-06.jpg`, alt: "De Zoete Zusjes taart" },
  { src: `${FOTOS}/galerij-07.jpg`, alt: "Ajax taart" },
  { src: `${FOTOS}/galerij-08.jpg`, alt: "Madeliefjes taart" },
] as const;
