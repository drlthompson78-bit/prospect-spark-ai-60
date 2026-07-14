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

/**
 * De echte "soorten" van hettaartenhuis.nl (dezelfde 12 die ook in de webshop
 * een taart hebben) — geen zelfbedachte groepen, letterlijk de sitecategorieën.
 */
export const categories: Category[] = [
  { slug: "verjaardagstaart", label: "Verjaardagstaart" },
  { slug: "lagentaart", label: "Lagentaart" },
  { slug: "cijfertaart", label: "Cijfertaart" },
  { slug: "bruidstaart", label: "Bruidstaart" },
  { slug: "3d-taart", label: "3D Taart" },
  { slug: "kindertaart", label: "Kindertaart" },
  { slug: "gender-reveal", label: "Gender Reveal taarten" },
  { slug: "babyshower-taart", label: "Babyshower taart" },
  { slug: "geboortetaart", label: "Geboortetaart" },
  { slug: "geslaagd-taarten", label: "Geslaagd taarten" },
  { slug: "bedrijfstaart", label: "Bedrijfstaart" },
  { slug: "cupcakes", label: "Cupcakes" },
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


export const products: Product[] = [
  {
    slug: "verjaardagstaart",
    name: "Verjaardagstaart",
    category: "verjaardagstaart",
    shortDescription: "Op een verjaardag mag een verjaardagstaart niet ontbreken.",
    description:
      "Op een verjaardag mag een verjaardagstaart niet ontbreken. Zet een taart op tafel waar al uw gasten van zullen watertanden. Bij Het Taartenhuis kunt u een speciale taart laten maken die geheel past bij deze dag. U kunt gemakkelijk uw thema, smaak en vorm kiezen. Wij helpen mee met het bedenken van het ontwerp van uw taart, zodat u altijd een passende taart voor uw verjaardag heeft.",
    image: productImages.verjaardag,
    priceFrom: 34.5,
    sizes: rondeSizes,
    flavors: vullingen,
    featured: true,
  },
  {
    slug: "lagentaart",
    name: "Lagentaart",
    category: "lagentaart",
    shortDescription: "Meerdere taarten op elkaar gestapeld en mooi gedecoreerd; past bij alle gelegenheden.",
    description:
      "Bij een lagentaart worden meerdere taarten op elkaar gestapeld en mooi gedecoreerd. Er was een tijd dat dit alleen bij bruidstaarten werd gedaan, maar een lagentaart past bij alle gelegenheden. Het ziet er niet alleen super leuk uit, maar is ook erg handig bij een grote groep personen. Wij plaatsen iedere taart op een eigen plateau zodat de taart in delen kan worden aangesneden, en ondersteunen de taart aan de binnenkant zodat deze niet kan inzakken.",
    image: productImages.chocoladeDrip,
    priceFrom: 34.5,
    sizes: rondeSizes,
    flavors: vullingen,
    featured: true,
  },
  {
    slug: "cijfertaart",
    name: "Cijfertaart",
    category: "cijfertaart",
    shortDescription: "Taart in de vorm van een cijfer is alleen al door de vorm persoonlijk.",
    description:
      "Taart in de vorm van een cijfer is alleen al door de vorm persoonlijk. Gedecoreerd in thema naar keuze maakt toch elke cijfertaart uniek. Voor zowel kinderen als volwassenen: het kan niet gek genoeg! Of het thema nu Disney, sprookjes, sport, spel of hobby betreft, Het Taartenhuis maakt een passende taart voor iedereen. Geef bij uw bestelling het gewenste cijfer door.",
    image: productImages.cijfertaart,
    priceFrom: 59.5,
    sizes: [{ id: "c30", label: "Per cijfer, ± 30 cm", serves: 12, price: 59.5 }],
    flavors: vullingen,
    featured: true,
  },
  {
    slug: "bruidstaart",
    name: "Bruidstaart",
    category: "bruidstaart",
    shortDescription: "Het Taartenhuis maakt de taart van uw dromen.",
    description:
      "U heeft vast al wat ideeën en wensen betreft de taart. Het Taartenhuis bespreekt graag met u hoe deze bijzondere taart eruit moet komen te zien. Naar aanleiding hiervan ontvangt u per e-mail vrijblijvend onze offerte voor uw bruidstaart. Het Taartenhuis maakt de taart van uw dromen.",
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
    category: "3d-taart",
    shortDescription: "3D taarten zijn leuk en uniek! Wat het thema dan ook is.",
    description:
      "3D taarten zijn leuk en uniek! Wat het thema dan ook is: Het Taartenhuis maakt vrijwel alle soorten 3D taarten voor elke gelegenheid. U kunt gemakkelijk uw thema, smaak en vorm kiezen; wij helpen mee met het bedenken van het ontwerp van uw 3D-taart. Voor figuren en uitgebreide decoratie geldt een meerprijs; die bevestigen we vooraf in de prijsopgave.",
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
    category: "kindertaart",
    shortDescription: "Voor kinderen kan het niet gek genoeg!",
    description:
      "Voor kinderen kan het niet gek genoeg! Of het thema nu Disney, sprookjes, sport, spel of hobby betreft: Het Taartenhuis maakt hierbij een passende taart voor uw kind. Laat u inspireren en bekijk de foto's voor een kleine greep uit de reeds door ons gemaakte kindertaarten.",
    image: productImages.kindertaart,
    priceFrom: 34.5,
    sizes: rondeSizes,
    flavors: vullingen,
  },
  {
    slug: "gender-reveal-taart",
    name: "Gender Reveal taart",
    category: "gender-reveal",
    shortDescription: "Is it a boy or a girl?? Naar wens met een blauwe of roze vulling.",
    description:
      "Hoera! In verwachting! En nu wilt u natuurlijk op een bijzondere manier met familie en vrienden delen wat het geslacht van de baby is. Is it a boy or a girl?? Het Taartenhuis maakt voor deze speciale gelegenheid de taart naar wens met een blauwe of roze vulling.",
    image: productImages.genderReveal,
    priceFrom: 34.5,
    sizes: rondeSizes,
    flavors: vullingen,
  },
  {
    slug: "babyshower-taart",
    name: "Babyshower taart",
    category: "babyshower-taart",
    shortDescription: "Bij deze bijzondere dag hoort natuurlijk een unieke babyshower taart.",
    description:
      "Organiseert u een babyshower? Bij deze bijzondere dag hoort natuurlijk een unieke babyshower taart van Het Taartenhuis. Staat uw taart niet tussen de door ons reeds gemaakte taarten, maar heeft u zelf een leuk idee of voorbeeld van een taart? Stuur deze dan naar ons door. U kunt gemakkelijk uw thema, smaak en vorm kiezen.",
    image: productImages.babyshower,
    priceFrom: 34.5,
    sizes: rondeSizes,
    flavors: vullingen,
  },
  {
    slug: "geboortetaart",
    name: "Geboortetaart",
    category: "geboortetaart",
    shortDescription: "Het blijft een wonder! De geboorte van een baby.",
    description:
      "Het blijft een wonder! De geboorte van een baby. Dit moet natuurlijk gevierd worden met een mooie, heerlijke geboortetaart. Bijvoorbeeld bij een kraamfeest voor familie en vrienden, of stuur de ouders van de newborn een speciale geboortetaart als felicitatie.",
    image: productImages.geboorte,
    priceFrom: 34.5,
    sizes: rondeSizes,
    flavors: vullingen,
  },
  {
    slug: "geslaagd-taart",
    name: "Geslaagd taart",
    category: "geslaagd-taarten",
    shortDescription: "Vier jouw overwinning in stijl met de geslaagd taart.",
    description:
      "Diploma behaald, geslaagd of klaar met afstuderen? Vier jouw overwinning in stijl met de geslaagd taart van Het Taartenhuis. Ken je iemand die is geslaagd voor de examens? Verras de geslaagde dan met een leuke geslaagd taart!",
    image: productImages.geslaagd,
    priceFrom: 34.5,
    sizes: rondeSizes,
    flavors: vullingen,
  },
  {
    slug: "bedrijfstaart",
    name: "Bedrijfstaart",
    category: "bedrijfstaart",
    shortDescription: "Alle taarten worden in eigen beheer gemaakt, waardoor onze hoge kwaliteit gewaarborgd blijft.",
    description:
      "Heeft uw bedrijf iets te vieren? Werknemers trakteren voor hun harde inzet, een relatie trakteren op iets lekkers, of misschien als goedmakertje: Het Taartenhuis is het juiste adres voor uw taarten. Alle taarten worden in eigen beheer gemaakt, waardoor onze hoge kwaliteit gewaarborgd blijft. Toch iets anders in gedachten? Geen probleem, wij kijken graag samen met u naar de mogelijkheden.",
    image: productImages.bedrijfstaart,
    priceFrom: 39.5,
    sizes: vierkanteSizes,
    flavors: vullingen,
    quoteOnly: true,
  },
  {
    slug: "cupcakes",
    name: "Cupcakes",
    category: "cupcakes",
    shortDescription: "De cupcakes kunnen in elk desgewenst thema worden gedecoreerd.",
    description:
      "Ook voor uw cupcakes bent u bij Het Taartenhuis aan het juiste adres. De cupcakes kunnen in elk desgewenst thema worden gedecoreerd. De cupcakes worden per 12 of meervoud geleverd.",
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
