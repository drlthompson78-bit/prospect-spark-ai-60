import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ChevronRight, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ProductCard from "@/components/shop/ProductCard";
import Reveal from "@/components/shop/Reveal";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { categories, formatPrice, getProduct, products } from "@/data/products";

const ProductPage = () => {
  const { slug } = useParams();
  const product = slug ? getProduct(slug) : undefined;

  if (!product) return <Navigate to="/collectie" replace />;

  // key zorgt dat formaat, smaak en aantal resetten bij navigatie naar een ander product
  return <ProductDetail key={product.slug} product={product} />;
};

const ProductDetail = ({ product }: { product: NonNullable<ReturnType<typeof getProduct>> }) => {
  const { add } = useCart();

  const [sizeId, setSizeId] = useState(product.sizes[0]?.id ?? "s");
  const [flavor, setFlavor] = useState(product.flavors[0] ?? "");
  const [quantity, setQuantity] = useState(1);

  const related = useMemo(
    () => products.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 3),
    [product]
  );

  const size = product.sizes.find((s) => s.id === sizeId) ?? product.sizes[0];
  const categoryLabel = categories.find((c) => c.slug === product.category)?.label;

  const handleAdd = () => {
    add({
      productSlug: product.slug,
      name: product.name,
      image: product.image,
      sizeId: size.id,
      sizeLabel: size.label,
      serves: size.serves,
      flavor,
      unitPrice: size.price,
      quantity,
    });
    toast.success(`${product.name} toegevoegd aan je winkelwagen`);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-24 pt-28 md:px-8 md:pt-36">
      <nav aria-label="Kruimelpad" className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/collectie" className="transition-colors hover:text-foreground">
          Collectie
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-12 md:grid-cols-[6fr_5fr] md:gap-16">
        <Reveal>
          <div className="overflow-hidden rounded-xl bg-secondary">
            <img
              src={product.image}
              alt={product.name}
              className="aspect-[3/4] w-full object-cover"
            />
          </div>
        </Reveal>

        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{categoryLabel}</p>
          <h1 className="mt-2 font-display text-3xl tracking-tight text-foreground md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-5 max-w-[56ch] text-base leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <fieldset className="mt-8">
            <legend className="text-sm font-semibold text-foreground">Formaat</legend>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {product.sizes.map((s) => (
                <label
                  key={s.id}
                  className={cn(
                    "flex cursor-pointer flex-col rounded-xl border px-4 py-3 transition-colors",
                    sizeId === s.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-foreground/40"
                  )}
                >
                  <input
                    type="radio"
                    name="formaat"
                    value={s.id}
                    checked={sizeId === s.id}
                    onChange={() => setSizeId(s.id)}
                    className="sr-only"
                  />
                  <span className="text-sm font-semibold text-foreground">{s.label}</span>
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    {s.serves} pers. &middot; {formatPrice(s.price)}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-6">
            <label htmlFor="smaak" className="text-sm font-semibold text-foreground">
              Smaak
            </label>
            <select
              id="smaak"
              value={flavor}
              onChange={(e) => setFlavor(e.target.value)}
              className="mt-3 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {product.flavors.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center rounded-xl border border-border">
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center text-foreground transition-colors hover:bg-secondary"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Aantal verlagen"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-base tabular-nums" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center text-foreground transition-colors hover:bg-secondary"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Aantal verhogen"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button size="lg" className="h-12 flex-1 text-base active:scale-[0.98]" onClick={handleAdd}>
              In winkelwagen &middot; {formatPrice(size.price * quantity)}
            </Button>
          </div>

          {product.quoteOnly && (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Voor deze taart nemen we na je bestelling persoonlijk contact op om het
              ontwerp samen af te stemmen. De prijs geldt als richtprijs.
            </p>
          )}

          <Accordion type="single" collapsible className="mt-10">
            <AccordionItem value="bestellen">
              <AccordionTrigger className="text-sm font-semibold">Bestellen en ophalen</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                Je plaatst eerst een vrijblijvende bestelaanvraag. Binnen 24 uur ontvang je
                onze bevestiging met betaalinformatie, het ophaaladres en het tijdstip.
                Bestel op tijd, zeker voor drukke periodes.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="allergenen">
              <AccordionTrigger className="text-sm font-semibold">Allergenen en bewaren</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                Onze taarten bevatten gluten, ei, melk en kunnen sporen van noten bevatten.
                Glutenvrij, lactosevrij of vegan is op aanvraag mogelijk. Bewaar de taart
                gekoeld en haal hem 30 minuten voor het serveren uit de koelkast.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <Reveal>
            <h2 className="font-display text-2xl tracking-tight text-foreground md:text-3xl">
              Ook mooi voor dit moment
            </h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.06}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductPage;
