import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Reveal from "@/components/shop/Reveal";
import { atelierHands } from "@/data/assets";

/** Verhaal van het atelier: tekst links, beeld met subtiele parallax rechts. */
const AtelierStory = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <section id="atelier" ref={ref} className="border-t border-border py-24 md:py-32">
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-5 md:grid-cols-[5fr_6fr] md:gap-16 md:px-8">
        <div>
          <Reveal>
            <h2 className="font-display text-3xl tracking-tight text-foreground md:text-5xl">
              Het atelier na sluitingstijd
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-6 max-w-[56ch] text-base leading-relaxed text-muted-foreground">
              Sinds 2005 maken wij taarten zoals ze bedoeld zijn: met de hand, dagvers en
              zonder haast. Jij bepaalt hoe jouw taart eruitziet, van smaak tot ontwerp.
              Wij denken mee, schetsen voor en bakken tot het klopt.
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <blockquote className="mt-10 border-l-2 border-primary pl-6">
              <p className="font-display text-xl leading-relaxed text-foreground">
                &ldquo;Een taart is het middelpunt van een feest. Die verantwoordelijkheid
                proef je in elk detail.&rdquo;
              </p>
              <footer className="mt-3 text-sm text-muted-foreground">
                Het team van Het Taartenhuis
              </footer>
            </blockquote>
          </Reveal>
          <Reveal delay={0.24}>
            <Link
              to="/op-maat"
              className="mt-10 inline-block text-sm font-semibold text-primary underline-offset-4 transition-colors hover:underline"
            >
              Vertel ons jouw idee
            </Link>
          </Reveal>
        </div>

        <div className="overflow-hidden rounded-xl">
          <motion.img
            style={reduced ? undefined : { y: imageY, scale: 1.12 }}
            src={atelierHands}
            alt="Handen van een patissier die roosjes van creme op een taart spuit"
            loading="lazy"
            className="aspect-[16/11] w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default AtelierStory;
