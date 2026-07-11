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

export const productImages = {
  bruidstaart: `${CDN}/hf_20260711_152251_74233181-7fca-4b7b-a4f2-a497e7ed017f_min.webp`,
  dinotaart: `${CDN}/hf_20260711_152252_77be5d6b-ffe5-444d-ab85-0bfbb3704c0d_min.webp`,
  cijfertaart: `${CDN}/hf_20260711_152254_83e4f193-8ab0-4256-9ab6-5611667686dc_min.webp`,
  babyshower: `${CDN}/hf_20260711_152256_ba416870-c060-48a5-a32f-fa999763b30d_min.webp`,
  genderReveal: `${CDN}/hf_20260711_152258_f111ee65-d4ee-4668-a63b-ac1310d30fd9_min.webp`,
  chocoladeDrip: `${CDN}/hf_20260711_152300_1ae9fadb-e85d-4e3a-b2c6-f8f2bd119194_min.webp`,
  cupcakes: `${CDN}/hf_20260711_152309_3aae239a-1bb6-45bd-90d9-d698d67881b5_min.webp`,
  bedrijfstaart: `${CDN}/hf_20260711_152311_9978066d-635e-4b30-8255-f19492b89783_min.webp`,
  geslaagd: `${CDN}/hf_20260711_152313_242ed9ac-1b8a-4019-b57f-1bec80737417_min.webp`,
  communie: `${CDN}/hf_20260711_152402_2a60c775-db12-416f-a439-cf2c52576836_min.webp`,
  geboorte: `${CDN}/hf_20260711_152404_79ac7f2e-c0bb-46c0-96e7-24fe47f44770_min.webp`,
  verjaardag: `${CDN}/hf_20260711_152405_7e688777-c735-4ebc-a9af-8f8b75c1f2b0_min.webp`,
} as const;
