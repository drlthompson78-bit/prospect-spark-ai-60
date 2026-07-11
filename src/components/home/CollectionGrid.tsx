import { Link } from "react-router-dom";
import Reveal from "@/components/shop/Reveal";
import { products } from "@/data/products";

const tiles = [
  { slug: "bruidstaart-rosalie", size: "md:col-span-2 md:row-span-2" },
  { slug: "cijfertaart-royale", size: "" },
  { slug: "3d-dinotaart", size: "" },
  { slug: "babyshower-wolkje", size: "" },
  { slug: "bedrijfstaart-met-logo", size: "" },
];

/** Asymmetrisch collectie-mozaiek dat doorlinkt naar de shop. */
const CollectionGrid = () => (
  <section className="border-t border-border py-24 md:py-32">
    <div className="mx-auto max-w-[1400px] px-5 md:px-8">
      <Reveal className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="font-display text-3xl tracking-tight text-foreground md:text-5xl">
            Voor elk moment een taart
          </h2>
          <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-muted-foreground">
            Van bruiloft tot babyshower en van mijlpaal tot maandagmiddag.
          </p>
        </div>
        <Link
          to="/collectie"
          className="text-sm font-semibold text-primary underline-offset-4 transition-colors hover:underline"
        >
          Bekijk de collectie
        </Link>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4 md:grid-rows-2">
        {tiles.map(({ slug, size }, i) => {
          const product = products.find((p) => p.slug === slug);
          if (!product) return null;
          return (
            <Reveal key={slug} delay={i * 0.06} className={size}>
              <Link
                to={`/collectie/${product.slug}`}
                className="group relative block h-full overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="h-full min-h-[260px] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent"
                  aria-hidden="true"
                />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="font-display text-lg text-foreground">{product.name}</p>
                  <p className="mt-1 text-sm text-foreground/70">{product.shortDescription}</p>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);

export default CollectionGrid;
