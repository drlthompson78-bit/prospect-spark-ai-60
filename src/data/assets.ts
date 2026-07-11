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
 * De signatuurtaart voor de hero-deconstructie: het complete beeld plus de
 * vier losse lagen (transparante PNG's, achtergrond server-side verwijderd).
 * Volgorde: topdek → slagroomvulling → chocoladecake → basis.
 */
export const cakeWhole = `${CDN}/hf_20260711_220945_9e8fdd0b-f049-494a-8f7a-0ac0ec0d77bf_min.png`;
export const cakeLayers = [
  `${CDN}/hf_20260711_220946_7e07d849-e206-40d2-a768-6c6d5a294b72_min.png`,
  `${CDN}/hf_20260711_220947_04bb82a1-5ac9-427d-a9a4-cc372fff1665_min.png`,
  `${CDN}/hf_20260711_220948_34aedc78-0933-4a68-a65c-d728524394d5_min.png`,
  `${CDN}/hf_20260711_220950_42cf2354-c753-4766-81bf-e72eb46b9039_min.png`,
] as const;

/**
 * Echte foto's van hettaartenhuis.nl (uit de wget-mirror), lokaal gehost in
 * public/fotos/. De klant herkent hierdoor zijn eigen werk in de webshop.
 * BASE_URL houdt rekening met de GitHub Pages preview-basis.
 */
const FOTOS = `${import.meta.env.BASE_URL}fotos`;

export const siteLogo = `${FOTOS}/logo.png`;

export const productImages = {
  verjaardag: `${FOTOS}/product-verjaardagstaart.jpg`,
  lagentaart: `${FOTOS}/product-lagentaart.jpg`,
  cijfertaart: `${FOTOS}/product-cijfertaart.jpg`,
  bruidstaart: `${FOTOS}/product-bruidstaart.jpg`,
  dinotaart: `${FOTOS}/product-3d-taart.jpg`,
  kindertaart: `${FOTOS}/product-kindertaart.jpg`,
  genderReveal: `${FOTOS}/product-gender-reveal.jpg`,
  babyshower: `${FOTOS}/product-babyshower.jpg`,
  geboorte: `${FOTOS}/product-geboortetaart.jpg`,
  geslaagd: `${FOTOS}/product-geslaagd.jpg`,
  bedrijfstaart: `${FOTOS}/product-bedrijfstaart.jpg`,
  cupcakes: `${FOTOS}/product-cupcakes.jpg`,
  chocoladeDrip: `${FOTOS}/product-lagentaart.jpg`,
  communie: `${FOTOS}/product-geboortetaart.jpg`,
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
