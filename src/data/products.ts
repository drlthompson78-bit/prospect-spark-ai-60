import { productImages } from "./assets";

export interface ProductSize {
  id: string;
  label: string;
  serves: number;
  price: number;
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
  flavors: string[];
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

export const flavors = [
  "Vanille met verse aardbeien",
  "Chocolade met ganache",
  "Red velvet",
  "Citroen met lemon curd",
  "Karamel zeezout",
  "Hazelnoot praline",
];

const sizes = (base: number): ProductSize[] => [
  { id: "s", label: "Klein", serves: 8, price: base },
  { id: "m", label: "Middel", serves: 12, price: Math.round(base * 1.4) },
  { id: "l", label: "Groot", serves: 16, price: Math.round(base * 1.75) },
  { id: "xl", label: "Feestformaat", serves: 24, price: Math.round(base * 2.4) },
];

export const products: Product[] = [
  {
    slug: "verjaardagstaart-sparkle",
    name: "Verjaardagstaart Sparkle",
    category: "verjaardag",
    shortDescription: "Romige lagentaart met verse aardbeien en een feestelijke gouden gloed.",
    description:
      "Onze meest gevierde verjaardagstaart. Luchtig biscuit, zijdezachte creme en verse aardbeien, afgewerkt met een warme gouden touch. Persoonlijke tekst op de taart is altijd inbegrepen.",
    image: productImages.verjaardag,
    priceFrom: 42,
    sizes: sizes(42),
    flavors,
    featured: true,
    badge: "Favoriet",
  },
  {
    slug: "chocolade-drip-deluxe",
    name: "Chocolade Drip Deluxe",
    category: "verjaardag",
    shortDescription: "Glanzende ganache, chocoladescherven, rood fruit en eetbaar goud.",
    description:
      "Voor de echte chocoladeliefhebber. Lagen donkere chocolade en romige vulling, overgoten met een glanzende ganache-drip en bekroond met chocoladescherven, rood fruit en eetbaar goud.",
    image: productImages.chocoladeDrip,
    priceFrom: 46,
    sizes: sizes(46),
    flavors: ["Chocolade met ganache", "Karamel zeezout", "Hazelnoot praline"],
    featured: true,
  },
  {
    slug: "cijfertaart-royale",
    name: "Cijfertaart Royale",
    category: "mijlpaal",
    shortDescription: "Elk getal, opgebouwd uit krokante lagen, roosjes van creme en vers fruit.",
    description:
      "Een taart in de vorm van jouw mijlpaal. Krokante lagen, roosjes van vanillecreme en een afwerking met frambozen, vijgen, macarons en eetbaar goud. Geef bij je bestelling het gewenste getal door.",
    image: productImages.cijfertaart,
    priceFrom: 48,
    sizes: sizes(48),
    flavors: ["Vanille met verse aardbeien", "Citroen met lemon curd", "Red velvet"],
    featured: true,
  },
  {
    slug: "bruidstaart-rosalie",
    name: "Bruidstaart Rosalie",
    category: "bruiloft",
    shortDescription: "Twee etages met cascades van verse rozen en bladgoud.",
    description:
      "Een klassieke bruidstaart met moderne allure. Twee etages, cascades van verse rozen en subtiel bladgoud. Elke bruidstaart ontwerpen we samen met jullie tijdens een proeverij in ons atelier.",
    image: productImages.bruidstaart,
    priceFrom: 195,
    sizes: [
      { id: "m", label: "Twee etages", serves: 30, price: 195 },
      { id: "l", label: "Drie etages", serves: 50, price: 295 },
      { id: "xl", label: "Vier etages", serves: 80, price: 425 },
    ],
    flavors,
    quoteOnly: true,
    featured: true,
    badge: "Met proeverij",
  },
  {
    slug: "3d-dinotaart",
    name: "3D Dinotaart",
    category: "kinderfeest",
    shortDescription: "Een vriendelijke dino, volledig met de hand geboetseerd uit fondant.",
    description:
      "Onze 3D-taarten zijn kleine sculpturen. Deze vriendelijke dino wordt volledig met de hand geboetseerd. Elk ander thema is mogelijk: van raceauto tot eenhoorn, vertel ons de droom van je kind.",
    image: productImages.dinotaart,
    priceFrom: 68,
    sizes: sizes(68),
    flavors: ["Vanille met verse aardbeien", "Chocolade met ganache", "Red velvet"],
    featured: true,
    badge: "3D",
  },
  {
    slug: "babyshower-wolkje",
    name: "Babyshower Wolkje",
    category: "baby",
    shortDescription: "Zachte pasteltinten met handgemaakte slofjes en wolkjes van fondant.",
    description:
      "Een tedere taart voor het mooiste nieuws. Zachte pasteltinten, handgemaakte slofjes en wolkjes van fondant. Ook verkrijgbaar in blauw, mint of neutraal linnen.",
    image: productImages.babyshower,
    priceFrom: 52,
    sizes: sizes(52),
    flavors,
  },
  {
    slug: "gender-reveal-taart",
    name: "Gender Reveal Taart",
    category: "baby",
    shortDescription: "Strak wit fondant, gouden vraagtekens en een geheim vanbinnen.",
    description:
      "Het geheim zit vanbinnen: een felgekleurde vulling in roze of blauw die pas verschijnt bij het aansnijden. Wij verzegelen het antwoord, zelfs voor jullie.",
    image: productImages.genderReveal,
    priceFrom: 54,
    sizes: sizes(54),
    flavors: ["Vanille met verse aardbeien", "Red velvet", "Citroen met lemon curd"],
  },
  {
    slug: "geboortetaart-maantje",
    name: "Geboortetaart Maantje",
    category: "baby",
    shortDescription: "Een slapend kindje op een fondant maan, omringd door sterretjes.",
    description:
      "Om de allereerste dagen te vieren. Een met de hand geboetseerd slapend kindje op een maan van fondant, in zachte mint- en cremetinten. De naam van de kleine nemen we op in het ontwerp.",
    image: productImages.geboorte,
    priceFrom: 56,
    sizes: sizes(56),
    flavors,
  },
  {
    slug: "communietaart-ivoor",
    name: "Communietaart Ivoor",
    category: "mijlpaal",
    shortDescription: "Ivoorwit met suikerbloemen, drapering en een subtiel gouden kruis.",
    description:
      "Sereen en feestelijk tegelijk. Ivoorwitte fondant met zachte drapering, handgemaakte suikerbloemen en een subtiel gouden kruis. Ook geschikt voor lentefeesten en doopvieringen.",
    image: productImages.communie,
    priceFrom: 58,
    sizes: sizes(58),
    flavors,
  },
  {
    slug: "geslaagd-taart",
    name: "Geslaagd Taart",
    category: "mijlpaal",
    shortDescription: "Met fondant baret, diploma van witte chocolade en gouden confetti.",
    description:
      "Voor wie het gehaald heeft. Een feestelijke taart met fondant baret, een opgerold diploma van witte chocolade en gouden confetti. De naam en studierichting verwerken we in het ontwerp.",
    image: productImages.geslaagd,
    priceFrom: 44,
    sizes: sizes(44),
    flavors,
  },
  {
    slug: "bedrijfstaart-met-logo",
    name: "Bedrijfstaart met logo",
    category: "zakelijk",
    shortDescription: "Jullie logo, huisstijlkleuren en boodschap, tot in detail uitgewerkt.",
    description:
      "Sinds 2005 de specialist in bedrijfstaarten voor heel Nederland. Jubileum, opening, productlancering of relatiegeschenk: wij vertalen jullie huisstijl naar een taart die indruk maakt. Levering op locatie mogelijk.",
    image: productImages.bedrijfstaart,
    priceFrom: 85,
    sizes: [
      { id: "m", label: "Middel", serves: 20, price: 85 },
      { id: "l", label: "Groot", serves: 40, price: 145 },
      { id: "xl", label: "Event", serves: 80, price: 260 },
    ],
    flavors,
    quoteOnly: true,
  },
  {
    slug: "atelier-cupcakes",
    name: "Atelier Cupcakes",
    category: "klein-gebak",
    shortDescription: "Doos van zes, met geswirlde botercreme, bladgoud en vers fruit.",
    description:
      "Onze taartkunst in het klein. Zes cupcakes met geswirlde botercreme in creme-, blush- en chocoladetinten, afgewerkt met bladgoud en vers fruit. Per doos van zes te bestellen.",
    image: productImages.cupcakes,
    priceFrom: 24,
    sizes: [
      { id: "s", label: "Doos van 6", serves: 6, price: 24 },
      { id: "m", label: "Doos van 12", serves: 12, price: 45 },
      { id: "l", label: "Doos van 24", serves: 24, price: 84 },
    ],
    flavors: ["Vanille met verse aardbeien", "Chocolade met ganache", "Karamel zeezout"],
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", minimumFractionDigits: value % 1 === 0 ? 0 : 2 }).format(value);
