import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "@/components/shop/ProductCard";
import Reveal from "@/components/shop/Reveal";
import { cn } from "@/lib/utils";
import { categories, products } from "@/data/products";

type SortOption = "aanbevolen" | "prijs-op" | "prijs-af";

const CollectionPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("categorie");
  const [sort, setSort] = useState<SortOption>("aanbevolen");

  const visible = useMemo(() => {
    const filtered = activeCategory ? products.filter((p) => p.category === activeCategory) : [...products];
    if (sort === "prijs-op") filtered.sort((a, b) => a.priceFrom - b.priceFrom);
    if (sort === "prijs-af") filtered.sort((a, b) => b.priceFrom - a.priceFrom);
    return filtered;
  }, [activeCategory, sort]);

  const selectCategory = (slug: string | null) => {
    if (slug) setSearchParams({ categorie: slug });
    else setSearchParams({});
  };

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-24 pt-28 md:px-8 md:pt-36">
      <Reveal>
        <h1 className="font-display text-4xl tracking-tight text-foreground md:text-6xl">De collectie</h1>
        <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-muted-foreground">
          Elke taart is maatwerk! Al onze taarten worden met de hand gemaakt en zijn altijd dagvers.
        </p>
      </Reveal>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter op categorie">
          <button
            type="button"
            onClick={() => selectCategory(null)}
            className={cn(
              "rounded-xl border px-4 py-2 text-sm transition-colors",
              !activeCategory
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            )}
          >
            Alles
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => selectCategory(c.slug)}
              className={cn(
                "rounded-xl border px-4 py-2 text-sm transition-colors",
                activeCategory === c.slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Sorteer
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="aanbevolen">Aanbevolen</option>
            <option value="prijs-op">Prijs oplopend</option>
            <option value="prijs-af">Prijs aflopend</option>
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="mt-16 rounded-xl border border-border bg-card p-12 text-center">
          <p className="font-display text-xl text-foreground">Niets gevonden in deze categorie</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Bekijk de volledige collectie of vraag een taart op maat aan.
          </p>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((p, i) => (
            <Reveal key={p.slug} delay={Math.min(i, 5) * 0.05}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionPage;
