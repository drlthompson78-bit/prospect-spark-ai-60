import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Reveal from "@/components/shop/Reveal";
import { galerij } from "@/data/assets";

/**
 * Eerder gemaakt werk: de echte foto's van hettaartenhuis.nl/onze-taarten,
 * als twee rijen die zachtjes tegen elkaar in schuiven tijdens het scrollen.
 * Bij reduced motion staan de rijen stil.
 */
const Galerij = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rijA = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
  const rijB = useTransform(scrollYProgress, [0, 1], ["-8%", "0%"]);

  const boven = galerij.slice(0, 4);
  const onder = galerij.slice(4);

  return (
    <section ref={ref} className="overflow-hidden border-t border-border py-24 md:py-32" aria-label="Eerder gemaakt werk">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Eerder gemaakt</p>
          <h2 className="mt-4 max-w-[24ch] font-display text-3xl leading-tight tracking-tight text-foreground md:text-5xl">
            Op zoek naar inspiratie? Bekijk ons eerdere werk
          </h2>
          <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-muted-foreground">
            Dit is een greep uit de reeds door ons gemaakte taarten — er worden wekelijks
            nieuwe foto&apos;s toegevoegd.
          </p>
          <Link
            to="/onze-taarten"
            className="mt-5 inline-block text-sm font-semibold text-primary underline-offset-4 transition-colors hover:underline"
          >
            Bekijk al onze taarten →
          </Link>
        </Reveal>
      </div>

      <div className="mt-12 space-y-4">
        <motion.div style={reduced ? undefined : { x: rijA }} className="flex gap-4 pl-5 md:pl-8">
          {boven.map((foto) => (
            <figure
              key={foto.src}
              className="group w-[240px] shrink-0 overflow-hidden rounded-xl bg-secondary md:w-[320px]"
            >
              <img
                src={foto.src}
                alt={foto.alt}
                loading="lazy"
                className="aspect-square w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              />
            </figure>
          ))}
        </motion.div>
        <motion.div style={reduced ? undefined : { x: rijB }} className="flex gap-4 pl-10 md:pl-16">
          {onder.map((foto) => (
            <figure
              key={foto.src}
              className="group w-[240px] shrink-0 overflow-hidden rounded-xl bg-secondary md:w-[320px]"
            >
              <img
                src={foto.src}
                alt={foto.alt}
                loading="lazy"
                className="aspect-square w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              />
            </figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Galerij;
