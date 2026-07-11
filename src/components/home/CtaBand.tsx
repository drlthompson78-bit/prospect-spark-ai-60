import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/shop/Reveal";
import { heroAlt } from "@/data/assets";

const CtaBand = () => (
  <section className="relative overflow-hidden border-t border-border">
    <img
      src={heroAlt}
      alt=""
      aria-hidden="true"
      loading="lazy"
      className="absolute inset-0 h-full w-full object-cover"
    />
    <div className="absolute inset-0 bg-background/80" aria-hidden="true" />
    <div className="relative mx-auto flex max-w-[1400px] flex-col items-start gap-6 px-5 py-24 md:px-8 md:py-32">
      <Reveal>
        <h2 className="max-w-[22ch] font-display text-3xl leading-tight tracking-tight text-foreground md:text-5xl">
          Jouw moment verdient een taart uit ons atelier
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <Button asChild size="lg" className="h-12 px-7 text-base active:scale-[0.98]">
          <Link to="/collectie">Bestel nu</Link>
        </Button>
      </Reveal>
    </div>
  </section>
);

export default CtaBand;
