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
          className="aspect-[3/4] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
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
