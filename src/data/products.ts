import { productImages } from "./assets";

export interface ProductSize {
  id: string;
  label: string;
  serves: number;
  price: number;
}

/** Slagroomvulling zoals op de smaken-en-prijzenpagina, met eventuele meerprijs per taart. */
export interface Flavor {
  label: string;
  surcharge: number;
}

export interface Product {
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  image: string;
  priceFrom: number;
  sizes: ProductSize[];
  flavors: Flavor[];
  quoteOnly?: boolean;
  featured?: boolean;
  badge?: string;
}

export interface Category {
  slug: string;
  label: string;
}

export const categories: Category[] = [
  { slug: "verjaardag", label: "Verjaardag" },
  { slug: "bruiloft", label: "Bruiloft" },
  { slug: "baby", label: "Baby & geboorte" },
  { slug: "kinderfeest", label: "Kinderfeest" },
  { slug: "mijlpaal", label: "Mijlpalen" },
  { slug: "zakelijk", label: "Zakelijk" },
  { slug: "klein-gebak", label: "Klein gebak" },
];

/** De cakekeuze van Het Taartenhuis: luchtige vanille- of chocoladecake. */
export const cakeTypes = ["Vanillecake", "Chocoladecake"] as const;

/**
 * De keuzevullingen, letterlijk overgenomen van hettaartenhuis.nl/smaken-en-prijzen.
 * Meerprijzen gelden per taart.
 */
export const vullingen: Flavor[] = [
  { label: "Slagroom, zonder smaaktoevoeging", surcharge: 0 },
  { label: "Slagroom met aardbeiensmaak", surcharge: 0 },
  { label: "Slagroom met ananasstukjes", surcharge: 4 },
  { label: "Slagroom met banaansmaak", surcharge: 0 },
  { label: "Slagroom met bosvruchtensmaak", surcharge: 0 },
  { label: "Slagroom met chocoladehagel", surcharge: 0 },
  { label: "Slagroom met chocoladeschaafsel melk", surcharge: 3 },
  { label: "Slagroom met chocoladeschaafsel puur", surcharge: 3 },
  { label: "Slagroom met chocoladeschaafsel wit", surcharge: 3 },
  { label: "Slagroom met chocoladesmaak", surcharge: 0 },
  { label: "Slagroom met framboossmaak", surcharge: 0 },
  { label: "Slagroom met karamelsmaak", surcharge: 0 },
  { label: "Slagroom met kersjes", surcharge: 4 },
  { label: "Slagroom met kokos", surcharge: 0 },
  { label: "Slagroom met snoepjes", surcharge: 3 },
  { label: "Slagroom met vanillesmaak", surcharge: 0 },
  { label: "Slagroom met vruchtenmix", surcharge: 4 },
];

/** Ronde taarten: de standaard vanafprijzen van de prijzenpagina (incl. 9% btw, excl. decoratie). */
const rondeSizes: ProductSize[] = [
  { id: "r20", label: "Rond ø 20 cm", serves: 8, price: 34.5 },
  { id: "r26", label: "Rond ø 26 cm", serves: 12, price: 44.5 },
  { id: "r30", label: "Rond ø 30 cm", serves: 16, price: 54.5 },
  { id: "r32", label: "Rond ø 32 cm", serves: 20, price: 64.5 },
  { id: "r34", label: "Rond ø 34 cm", serves: 24, price: 74.5 },
];

/** Vierkante taarten, bijvoorbeeld voor logo- en bedrijfstaarten. */
const vierkanteSizes: ProductSize[] = [
  { id: "v22", label: "Vierkant 22 × 22 cm", serves: 10, price: 39.5 },
  { id: "v26", label: "Vierkant 26 × 26 cm", serves: 14, price: 49.5 },
  { id: "v30", label: "Vierkant 30 × 30 cm", serves: 18, price: 59.5 },
  { id: "v40", label: "Vierkant 40 × 40 cm", serves: 30, price: 89.5 },
];

const basisBeschrijving =
  "Gemaakt van luchtige vanille- of chocoladecake, gevuld met een romige, niet te zoete slagroomvulling. " +
  "Elke taart wordt bekleed met een dun laagje marsepein of fondant in een kleur naar keuze en de zijkant " +
  "werken we af met pure chocoladehagel. Met de hand gemaakt en altijd dagvers.";

export const products: Product[] = [
  {
    slug: "verjaardagstaart",
    name: "Verjaardagstaart",
    category: "verjaardag",
    shortDescription: "Volledig naar eigen wens: u bepaalt zelf hoe uw taart eruitziet, van smaak tot ontwerp.",
    description:
      "Bij ons bepaalt u zelf hoe uw verjaardagstaart eruitziet, van smaak tot ontwerp. " +
      basisBeschrijving +
      " Een persoonlijke tekst of afbeelding geeft u door bij de bestelling.",
    image: productImages.verjaardag,
    priceFrom: 34.5,
    sizes: rondeSizes,
    flavors: vullingen,
    featured: true,
  },
  {
    slug: "lagentaart",
    name: "Lagentaart",
    category: "verjaardag",
    shortDescription: "Meerdere lagen cake en slagroom, feestelijk afgewerkt voor grotere gezelschappen.",
    description:
      "Een taart met meerdere lagen, voor wie groots uitpakt. " +
      basisBeschrijving +
      " Voor taarten die extra hoog zijn geldt een toeslag; die bevestigen we vooraf in de prijsopgave.",
    image: productImages.chocoladeDrip,
    priceFrom: 34.5,
    sizes: rondeSizes,
    flavors: vullingen,
    featured: true,
  },
  {
    slug: "cijfertaart",
    name: "Cijfertaart",
    category: "mijlpaal",
    shortDescription: "Een taart in de vorm van uw mijlpaal, per cijfer van ongeveer 30 cm.",
    description:
      "Een taart in de vorm van het getal dat u viert, per cijfer ongeveer 30 cm groot. " +
      basisBeschrijving +
      " Geef bij uw bestelling het gewenste cijfer door.",
    image: productImages.cijfertaart,
    priceFrom: 34.5,
    sizes: [{ id: "c30", label: "Per cijfer, ± 30 cm", serves: 12, price: 34.5 }],
    flavors: vullingen,
    featured: true,
  },
  {
    slug: "bruidstaart",
    name: "Bruidstaart",
    category: "bruiloft",
    shortDescription: "Voor de mooiste dag: samen samengesteld, volledig naar jullie idee.",
    description:
      "Elke bruidstaart is maatwerk. Jullie bepalen het ontwerp, wij denken graag mee om er " +
      "een persoonlijke en onvergetelijke taart van te maken. " +
      basisBeschrijving,
    image: productImages.bruidstaart,
    priceFrom: 74.5,
    sizes: [
      { id: "b2", label: "Twee etages", serves: 30, price: 109 },
      { id: "b3", label: "Drie etages", serves: 50, price: 164 },
    ],
    flavors: vullingen,
    quoteOnly: true,
    featured: true,
    badge: "Maatwerk",
  },
  {
    slug: "3d-taart",
    name: "3D Taart",
    category: "kinderfeest",
    shortDescription: "Een taart als sculptuur, in elke gewenste vorm met de hand opgebouwd.",
    description:
      "Van dino tot raceauto: een 3D-taart wordt in de gewenste vorm met de hand opgebouwd " +
      "en bekleed. Voor figuren en uitgebreide decoratie geldt een meerprijs; die bevestigen " +
      "we vooraf in de prijsopgave. " +
      basisBeschrijving,
    image: productImages.dinotaart,
    priceFrom: 44.5,
    sizes: rondeSizes.slice(1),
    flavors: vullingen,
    quoteOnly: true,
    featured: true,
    badge: "3D",
  },
  {
    slug: "kindertaart",
    name: "Kindertaart",
    category: "kinderfeest",
    shortDescription: "Met het favoriete thema van uw kind, van tekenfilm tot voetbalclub.",
    description:
      "Het feest van uw kind verdient een taart met het favoriete thema, van tekenfilmfiguur " +
      "tot voetbalclub. Voor afbeeldingen en figuren geldt een meerprijs; die bevestigen we " +
      "vooraf. " +
      basisBeschrijving,
    image: productImages.kindertaart,
    priceFrom: 34.5,
    sizes: rondeSizes,
    flavors: vullingen,
  },
  {
    slug: "gender-reveal-taart",
    name: "Gender Reveal Taart",
    category: "baby",
    shortDescription: "Het antwoord zit vanbinnen: een roze of blauwe vulling die verschijnt bij het aansnijden.",
    description:
      "Het grote nieuws zit vanbinnen: een roze of blauwe vulling die pas verschijnt bij het " +
      "aansnijden. Geef bij de bestelling door wie het geheim mag weten. " +
      basisBeschrijving,
    image: productImages.genderReveal,
    priceFrom: 34.5,
    sizes: rondeSizes,
    flavors: vullingen,
  },
  {
    slug: "babyshower-taart",
    name: "Babyshower Taart",
    category: "baby",
    shortDescription: "Zachte tinten voor het mooiste vooruitzicht, naar wens met naam of thema.",
    description:
      "Een feestelijke taart voor de babyshower, in zachte tinten en naar wens met naam of " +
      "thema. " +
      basisBeschrijving,
    image: productImages.babyshower,
    priceFrom: 34.5,
    sizes: rondeSizes,
    flavors: vullingen,
  },
  {
    slug: "geboortetaart",
    name: "Geboortetaart",
    category: "baby",
    shortDescription: "Om de allereerste dagen te vieren, met de naam van de kleine in het ontwerp.",
    description:
      "Om de geboorte te vieren, met de naam van de kleine in het ontwerp verwerkt. " +
      basisBeschrijving,
    image: productImages.geboorte,
    priceFrom: 34.5,
    sizes: rondeSizes,
    flavors: vullingen,
  },
  {
    slug: "geslaagd-taart",
    name: "Geslaagd Taart",
    category: "mijlpaal",
    shortDescription: "Voor wie het gehaald heeft: feestelijk, met naam en studierichting naar wens.",
    description:
      "Geslaagd! Dat vieren we met een feestelijke taart, naar wens met naam en " +
      "studierichting in het ontwerp. " +
      basisBeschrijving,
    image: productImages.geslaagd,
    priceFrom: 34.5,
    sizes: rondeSizes,
    flavors: vullingen,
  },
  {
    slug: "bedrijfstaart",
    name: "Bedrijfstaart met logo",
    category: "zakelijk",
    shortDescription: "Uw logo en huisstijl op een taart, voor jubilea, openingen en recepties.",
    description:
      "Voor bedrijven verzorgen wij taarten met logo of huisstijl, voor jubilea, openingen, " +
      "productlanceringen en recepties. Voor afbeeldingen en logo's geldt een meerprijs; die " +
      "bevestigen we vooraf in de prijsopgave. " +
      basisBeschrijving,
    image: productImages.bedrijfstaart,
    priceFrom: 39.5,
    sizes: vierkanteSizes,
    flavors: vullingen,
    quoteOnly: true,
  },
  {
    slug: "cupcakes",
    name: "Cupcakes",
    category: "klein-gebak",
    shortDescription: "Per twaalf stuks, gedecoreerd in het thema van uw feest.",
    description:
      "Onze cupcakes bestellen we per twaalf stuks, gedecoreerd in het thema van uw feest. " +
      "Gemaakt van dezelfde luchtige vanille- of chocoladecake als onze taarten, met de hand " +
      "gedecoreerd en altijd dagvers.",
    image: productImages.cupcakes,
    priceFrom: 44.5,
    sizes: [
      { id: "c12", label: "12 stuks", serves: 12, price: 44.5 },
      { id: "c24", label: "24 stuks", serves: 24, price: 89 },
    ],
    flavors: vullingen,
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", minimumFractionDigits: value % 1 === 0 ? 0 : 2 }).format(value);
