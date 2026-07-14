import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import ProductCard from "@/components/shop/ProductCard";
import Reveal from "@/components/shop/Reveal";
import { products } from "@/data/products";

/**
 * Gepinde horizontale filmrail: tijdens het scrollen schuift de signatuur-
 * collectie zijwaarts voorbij. Op mobiel en bij reduced motion wordt dit een
 * gewone swipebare rail met scroll-snap.
 */
const SignatureRail = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const featured = products.filter((p) => p.featured);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0.05, 0.95], ["0%", "-62%"]);

  const header = (
    <Reveal className="mx-auto max-w-[1400px] px-5 md:px-8">
      <h2 className="font-display text-3xl tracking-tight text-foreground md:text-5xl">Uw online taartenspecialist</h2>
      <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-muted-foreground">
        Voor de lekkerste taarten voor elke gelegenheid.
      </p>
    </Reveal>
  );

  if (reduced) {
    return (
      <section className="py-24 md:py-32">
        {header}
        <div className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 [scroll-padding-left:1.25rem] md:px-8">
          {featured.map((p) => (
            <div key={p.slug} className="w-[280px] shrink-0 snap-start md:w-[320px]">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 md:py-32">
      {header}

      {/* Mobiel: swipebare rail */}
      <div className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 [scroll-padding-left:1.25rem] md:hidden">
        {featured.map((p) => (
          <div key={p.slug} className="w-[280px] shrink-0 snap-start">
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {/* Desktop: gepinde horizontale pan */}
      <div ref={ref} className="hidden h-[260vh] md:block">
        <div className="sticky top-0 flex h-[100dvh] flex-col justify-center overflow-hidden">
          <motion.div style={{ x }} className="flex w-max gap-8 pl-[max(2rem,calc((100vw-1400px)/2+2rem))]">
            {featured.map((p) => (
              <div key={p.slug} className="w-[340px] shrink-0">
                <ProductCard product={p} />
              </div>
            ))}
            <div className="w-[20vw] shrink-0" aria-hidden="true" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SignatureRail;
