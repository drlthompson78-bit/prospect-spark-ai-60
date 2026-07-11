import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { Button } from "@/components/ui/button";
import { heroPoster, heroVideo } from "@/data/assets";

const headline = ["Taarten", "die je", "nooit vergeet"];

/**
 * Cinematografische hero: een gepind scroll-toneel van 180vh.
 * De video schaalt en dimt mee met de scroll, de serif-kop stijgt per regel op
 * en glijdt daarna omhoog weg terwijl het beeld zich terugtrekt in een kader.
 * Bij reduced motion: statisch posterbeeld, geen autoplay, geen pin-effect.
 */
const Hero = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  const mediaScale = useTransform(progress, [0, 1], [1, 1.18]);
  const mediaDim = useTransform(progress, [0, 0.8], [0, 0.55]);
  const frameInset = useTransform(progress, [0.15, 0.9], ["0rem", "1.5rem"]);
  const frameRadius = useTransform(progress, [0.15, 0.9], ["0rem", "1.5rem"]);
  const copyY = useTransform(progress, [0, 0.7], ["0%", "-60%"]);
  const copyOpacity = useTransform(progress, [0.1, 0.6], [1, 0]);

  return (
    <section ref={ref} className="relative h-[180vh]" aria-label="Introductie">
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        <motion.div
          style={reduced ? undefined : { inset: frameInset, borderRadius: frameRadius }}
          className="absolute inset-0 overflow-hidden"
        >
          <motion.div style={reduced ? undefined : { scale: mediaScale }} className="absolute inset-0">
            {reduced ? (
              <img
                src={heroPoster}
                alt="Drielaagse ivoorkleurige bruidstaart in het atelier van Het Taartenhuis"
                className="h-full w-full object-cover"
              />
            ) : (
              <video
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                poster={heroPoster}
                aria-hidden="true"
              >
                <source src={heroVideo} type="video/mp4" />
              </video>
            )}
          </motion.div>
          <motion.div
            style={reduced ? undefined : { opacity: mediaDim }}
            className="absolute inset-0 bg-background"
            aria-hidden="true"
          />
          <div className="hero-scrim absolute inset-0" aria-hidden="true" />
        </motion.div>

        <motion.div
          style={reduced ? undefined : { y: copyY, opacity: copyOpacity }}
          className="relative mx-auto flex h-full max-w-[1400px] flex-col justify-end px-5 pb-24 md:justify-center md:px-8 md:pb-0"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Ambachtelijk sinds 2005
          </p>
          <h1 className="mt-5 font-display text-5xl leading-[1.05] tracking-tight text-foreground md:text-7xl">
            {headline.map((line, i) => (
              // pb + negatieve mb geven staartletters (g, j) ruimte binnen het animatiemasker
              <span key={line} className="block overflow-hidden pb-[0.14em] -mb-[0.14em]">
                <motion.span
                  className="block"
                  initial={reduced ? false : { y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.9, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-[38ch] text-base leading-relaxed text-foreground/80 md:text-lg"
          >
            Handgemaakte taarten uit ons atelier, dagvers en volledig naar jouw idee.
          </motion.p>
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Button asChild size="lg" className="h-12 px-7 text-base active:scale-[0.98]">
              <Link to="/collectie">Bestel nu</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-foreground/25 bg-background/20 px-7 text-base backdrop-blur-sm hover:bg-background/40 active:scale-[0.98]"
            >
              <Link to="/op-maat">Taart op maat</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
