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
import { cakeTypes, categories, formatPrice, getProduct, products } from "@/data/products";

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
  const [cake, setCake] = useState<string>(cakeTypes[0]);
  const [flavorLabel, setFlavorLabel] = useState(product.flavors[0]?.label ?? "");
  const [quantity, setQuantity] = useState(1);

  const related = useMemo(
    () => products.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 3),
    [product]
  );

  const size = product.sizes.find((s) => s.id === sizeId) ?? product.sizes[0];
  const vulling = product.flavors.find((f) => f.label === flavorLabel) ?? product.flavors[0];
  const unitPrice = size.price + (vulling?.surcharge ?? 0);
  const categoryLabel = categories.find((c) => c.slug === product.category)?.label;

  const handleAdd = () => {
    add({
      productSlug: product.slug,
      name: product.name,
      image: product.image,
      sizeId: size.id,
      sizeLabel: size.label,
      serves: size.serves,
      flavor: `${cake} · ${vulling.label}`,
      unitPrice,
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
              className="aspect-square w-full object-cover"
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

          <fieldset className="mt-6">
            <legend className="text-sm font-semibold text-foreground">Cake</legend>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {cakeTypes.map((c) => (
                <label
                  key={c}
                  className={cn(
                    "flex cursor-pointer items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold transition-colors",
                    cake === c ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:border-foreground/40"
                  )}
                >
                  <input
                    type="radio"
                    name="cake"
                    value={c}
                    checked={cake === c}
                    onChange={() => setCake(c)}
                    className="sr-only"
                  />
                  {c}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-6">
            <label htmlFor="vulling" className="text-sm font-semibold text-foreground">
              Keuzevulling
            </label>
            <select
              id="vulling"
              value={flavorLabel}
              onChange={(e) => setFlavorLabel(e.target.value)}
              className="mt-3 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {product.flavors.map((f) => (
                <option key={f.label} value={f.label}>
                  {f.label}
                  {f.surcharge > 0 ? ` (+ ${formatPrice(f.surcharge)} per taart)` : ""}
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
              In winkelwagen &middot; {formatPrice(unitPrice * quantity)}
            </Button>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Alle prijzen zijn vanafprijzen incl. 9% btw, exclusief decoratie. Voor afbeeldingen,
            teksten, bloemen of figuren geldt een meerprijs; die bevestigen we in de prijsopgave.
          </p>

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
                Je plaatst eerst een vrijblijvende bestelaanvraag; die geldt nog niet als
                definitieve bestelling. Je ontvangt van ons eerst een e-mail met de
                mogelijkheden en bijbehorende prijzen. Pas na jouw akkoord wordt de bestelling
                definitief en ontvang je een bevestiging met betaalgegevens, het volledige
                ophaaladres en het afhaaltijdstip. De taart haal je op in Rotterdam; de locatie
                is goed bereikbaar, met parkeergelegenheid voor de deur.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="bewaren">
              <AccordionTrigger className="text-sm font-semibold">Vers en houdbaar</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                Onze taarten worden ambachtelijk bereid en vers geleverd. Mits koel bewaard
                blijven ze nog ruim drie dagen goed.
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
