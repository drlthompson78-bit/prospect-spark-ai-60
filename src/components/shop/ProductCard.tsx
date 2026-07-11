import { Link } from "react-router-dom";
import { categories, formatPrice, type Product } from "@/data/products";

const ProductCard = ({ product }: { product: Product }) => {
  const categoryLabel = categories.find((c) => c.slug === product.category)?.label;

  return (
    <Link
      to={`/collectie/${product.slug}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
    >
      <div className="relative overflow-hidden rounded-xl bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="aspect-square w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
        {/* Bekijk-hint die bij hover van onderen in glijdt */}
        <span
          className="pointer-events-none absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-center rounded-lg bg-background/85 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-foreground opacity-0 backdrop-blur-sm transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100"
          aria-hidden="true"
        >
          Bekijk taart
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-3 pt-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {categoryLabel}
            {product.badge && <span className="text-primary"> &middot; {product.badge}</span>}
          </p>
          <h3 className="mt-1 font-display text-lg leading-snug text-foreground">{product.name}</h3>
        </div>
        <p className="shrink-0 text-sm text-muted-foreground">
          vanaf <span className="font-semibold text-foreground">{formatPrice(product.priceFrom)}</span>
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;
