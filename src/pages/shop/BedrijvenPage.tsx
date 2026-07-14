import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/shop/Reveal";
import { useIsMobile } from "@/hooks/use-mobile";

const redenen = [
  "Altijd dagvers, ambachtelijk bereid",
  "Persoonlijk contact en korte lijnen",
  "Oog voor detail, hoge kwaliteit en service",
  "Geen massaproductie, wél maatwerk",
  "Ook geschikt voor grote groepen",
];

/** Op mobiel verschijnt elk vinkje op zijn beurt tijdens het scrollen door de
 * lijst; op desktop blijft de bestaande fade-in van de hele kaart ineens. */
const RedenItem = ({
  text,
  index,
  total,
  progress,
  active,
}: {
  text: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
  active: boolean;
}) => {
  const step = 1 / total;
  const start = index * step;
  const end = Math.min(1, start + step * 1.5);
  const opacity = useTransform(progress, [start, end], [0.15, 1]);
  const checkOpacity = useTransform(progress, [start, end], [0.25, 1]);

  if (!active) {
    return (
      <li className="flex items-baseline gap-3 text-base leading-relaxed text-muted-foreground">
        <span className="font-semibold text-primary">✔</span>
        {text}
      </li>
    );
  }

  return (
    <motion.li
      style={{ opacity }}
      className="flex items-baseline gap-3 text-base leading-relaxed text-muted-foreground"
    >
      <motion.span style={{ opacity: checkOpacity }} className="font-semibold text-primary">
        ✔
      </motion.span>
      {text}
    </motion.li>
  );
};

interface Taart {
  slug: string;
  titel: string;
  categorie: string;
  foto: string;
  foto2x: string;
}

/** Bedrijven, met de originele tekst van hettaartenhuis.nl/voor-bedrijven. */
const BedrijvenPage = () => {
  const [voorbeelden, setVoorbeelden] = useState<Taart[]>([]);
  const listRef = useRef<HTMLUListElement>(null);
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 0.85", "end 0.55"],
  });
  const scrollTied = isMobile && !reducedMotion;

  // Toon echte bedrijfstaarten (KLM, Rabobank, KPMG, ...) uit de catalogus
  useEffect(() => {
    let actief = true;
    import("@/data/taarten.json").then((mod) => {
      if (!actief) return;
      const alle = mod.default as Taart[];
      setVoorbeelden(alle.filter((t) => t.categorie.split(", ").includes("Bedrijfstaart")).slice(0, 8));
    });
    return () => {
      actief = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-24 pt-28 md:px-8 md:pt-36">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Bedrijfstaarten</p>
        <h1 className="mt-4 max-w-[24ch] font-display text-4xl leading-tight tracking-tight text-foreground md:text-6xl">
          Bijzondere taarten voor bijzondere momenten, ook voor bedrijven
        </h1>
      </Reveal>

      <div className="mt-12 grid gap-12 lg:grid-cols-[7fr_5fr] lg:gap-16">
        <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
          <Reveal>
            <p>
              Het Taartenhuis is sinds 2005 dé specialist in het maken van unieke, op maat
              gemaakte taarten voor bedrijven in heel Nederland. Wij zijn voor veel organisaties
              een vertrouwde partner en een verlengstuk van hun service.
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <p>
              Of het nu gaat om een verjaardag, jubileum, afscheid, de lancering van een nieuw
              product of een origineel relatiegeschenk: wij zorgen voor een taart die niet
              alleen heerlijk is, maar ook een blijvende indruk achterlaat. Ook als u iets goed
              wilt maken of een klant wilt bedanken, een persoonlijke taart doet wonderen.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <p>
              Wij maken alle taarten in eigen beheer in onze eigen bakkerij, en dat proeft u.
              Onze zakelijke taarten zijn geliefd als relatiegeschenk of traktatie op kantoor.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <h2 className="pt-4 font-display text-2xl tracking-tight text-foreground">Meerdere taarten nodig?</h2>
            <p className="mt-3">
              Bij afname van meerdere taarten maken wij graag vrijblijvend een offerte op maat.
              Nieuwsgierig? Neem contact met ons op en ontdek de mogelijkheden voor uw bedrijf.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button asChild size="lg" className="h-12 px-7 text-base">
                <Link to="/op-maat">Vrijblijvende offerte aanvragen</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base">
                <Link to="/collectie/bedrijfstaart">Bekijk de bedrijfstaart</Link>
              </Button>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="rounded-xl border border-border bg-card p-6 md:p-8">
            <h2 className="font-display text-xl text-foreground">
              Waarom bedrijven kiezen voor Het Taartenhuis
            </h2>
            <ul ref={listRef} className="mt-5 space-y-3">
              {redenen.map((r, i) => (
                <RedenItem
                  key={r}
                  text={r}
                  index={i}
                  total={redenen.length}
                  progress={scrollYProgress}
                  active={scrollTied}
                />
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      {voorbeelden.length > 0 && (
        <section className="mt-20" aria-label="Onze bedrijfstaarten">
          <Reveal>
            <h2 className="font-display text-2xl tracking-tight text-foreground md:text-3xl">
              Onze bedrijfstaarten
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Een greep uit eerder gemaakt werk, van KLM en Rabobank tot KPMG.
            </p>
          </Reveal>
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
            {voorbeelden.map((t) => (
              <li key={t.slug}>
                <div className="overflow-hidden rounded-xl bg-secondary">
                  <img
                    src={t.foto}
                    srcSet={`${t.foto} 1x, ${t.foto2x} 2x`}
                    alt={t.titel}
                    loading="lazy"
                    className="aspect-square w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.05]"
                  />
                </div>
                <p className="mt-3 font-display text-base leading-snug text-foreground">{t.titel}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default BedrijvenPage;
