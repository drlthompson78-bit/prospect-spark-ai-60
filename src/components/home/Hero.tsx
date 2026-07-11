import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { Button } from "@/components/ui/button";
import { cakeWhole, cakeLayers, heroPoster } from "@/data/assets";

const headline = ["Taarten", "die je", "nooit vergeet"];

/**
 * Ingrediëntkaartjes naast de zwevende lagen; de teksten komen letterlijk
 * van de smaken-en-prijzenpagina van Het Taartenhuis.
 */
const layerNotes = [
  { nr: "01", title: "Marsepein of fondant", text: "Een dun laagje, in een kleur naar keuze. Liever pure chocolade? Kan ook.", side: "right" as const },
  { nr: "02", title: "Romige slagroomvulling", text: "Niet te zoet, met keuze uit ruim veertien smaken.", side: "left" as const },
  { nr: "03", title: "Luchtige cake", text: "Vanille of chocolade, altijd dagvers gebakken.", side: "right" as const },
  { nr: "04", title: "Met de hand gemaakt", text: "Ambachtelijk, sinds 2005. Elke taart is maatwerk.", side: "left" as const },
];

/** Zwevende lagen: eindpositie (y), lichte rotatie en x-drift per laag. */
const layerMotion = [
  { yFrom: "-4vh", yTo: "-27vh", rot: -5, x: "-2vw", width: "min(40vh, 76vw)" },
  { yFrom: "-1.5vh", yTo: "-9vh", rot: 3, x: "1.5vw", width: "min(42vh, 80vw)" },
  { yFrom: "1.5vh", yTo: "9vh", rot: -3, x: "-1vw", width: "min(42vh, 80vw)" },
  { yFrom: "4vh", yTo: "27vh", rot: 4, x: "2vw", width: "min(44vh, 84vw)" },
];

type LayerProps = {
  src: string;
  index: number;
  progress: MotionValue<number>;
};

/** Eén zwevende taartlaag: schuift bij het scrollen van gestapeld naar geëxplodeerd. */
const CakeLayer = ({ src, index, progress }: LayerProps) => {
  const cfg = layerMotion[index];
  const y = useTransform(progress, [0.3, 0.75], [cfg.yFrom, cfg.yTo]);
  const x = useTransform(progress, [0.3, 0.75], ["0vw", cfg.x]);
  const rotate = useTransform(progress, [0.3, 0.8], [0, cfg.rot]);
  return (
    // De buitenste div centreert; motion mag daardoor vrij over transform beschikken
    <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 - index }}>
      <motion.img
        src={src}
        alt=""
        aria-hidden="true"
        style={{ y, x, rotate, width: cfg.width }}
        className="select-none drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]"
        draggable={false}
      />
    </div>
  );
};

/**
 * Cinematografische hero: gepind toneel van 320vh waarin de signatuurtaart
 * bij het scrollen laag voor laag uit elkaar zweeft (deconstructie), met
 * ingrediëntkaartjes naast de lagen. Bij reduced motion: statisch beeld.
 */
const Hero = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  // Fase 1 → 2: kop en knoppen wijken, complete taart maakt plaats voor de lagen
  const copyY = useTransform(progress, [0.05, 0.3], ["0%", "-45%"]);
  const copyOpacity = useTransform(progress, [0.08, 0.26], [1, 0]);
  const wholeOpacity = useTransform(progress, [0.26, 0.4], [1, 0]);
  const wholeScale = useTransform(progress, [0, 0.4], [1, 1.06]);
  const stackOpacity = useTransform(progress, [0.28, 0.42], [0, 1]);
  const glowOpacity = useTransform(progress, [0.2, 0.5], [0.5, 0.85]);
  // Fase 3: het hele toneel maakt zich los richting de volgende sectie
  const stageY = useTransform(progress, [0.85, 1], ["0vh", "-12vh"]);
  const stageOpacity = useTransform(progress, [0.88, 1], [1, 0]);

  if (reduced) {
    return (
      <section aria-label="Introductie" className="relative">
        <div className="relative flex min-h-[100dvh] flex-col justify-end overflow-hidden md:justify-center">
          <img
            src={heroPoster}
            alt="Drielaagse ivoorkleurige taart in het atelier van Het Taartenhuis"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="hero-scrim absolute inset-0" aria-hidden="true" />
          <div className="relative mx-auto w-full max-w-[1400px] px-5 pb-24 md:px-8 md:pb-0">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Ambachtelijk sinds 2005</p>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
              {headline.join(" ")}
            </h1>
            <p className="mt-6 max-w-[38ch] text-base leading-relaxed text-foreground/80 md:text-lg">
              Handgemaakte taarten uit ons atelier, dagvers en volledig naar jouw idee.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Button asChild size="lg" className="h-12 px-7 text-base"><Link to="/collectie">Bestel nu</Link></Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base"><Link to="/op-maat">Taart op maat</Link></Button>
            </div>
          </div>
        </div>
        <ul className="mx-auto grid max-w-[1400px] gap-6 px-5 pb-20 pt-12 md:grid-cols-4 md:px-8">
          {layerNotes.map((n) => (
            <li key={n.nr}>
              <p className="text-xs font-semibold tracking-[0.2em] text-primary">{n.nr}</p>
              <h3 className="mt-2 font-display text-xl">{n.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{n.text}</p>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[320vh]" aria-label="Introductie">
      <motion.div
        style={{ y: stageY, opacity: stageOpacity }}
        className="sticky top-0 h-[100dvh] overflow-hidden"
      >
        {/* Warme lichtvlek achter de taart, wordt sterker tijdens de deconstructie */}
        <motion.div
          style={{ opacity: glowOpacity }}
          className="absolute left-1/2 top-1/2 h-[90vh] w-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,hsl(30_56%_40%/0.35)_0%,transparent_65%)]"
          aria-hidden="true"
        />

        {/* De complete signatuurtaart (fase 1) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.img
            src={cakeWhole}
            alt="Signatuurtaart van Het Taartenhuis met karamel en verse vijgen"
            style={{ opacity: wholeOpacity, scale: wholeScale, width: "min(58vh, 88vw)" }}
            className="select-none drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
            draggable={false}
          />
        </div>

        {/* De vier lagen (fase 2): zweven uit elkaar */}
        <motion.div style={{ opacity: stackOpacity }} className="absolute inset-0" aria-hidden="true">
          {cakeLayers.map((src, i) => (
            <CakeLayer key={src} src={src} index={i} progress={progress} />
          ))}
        </motion.div>

        {/* Ingrediëntkaartjes naast de lagen */}
        <div className="pointer-events-none absolute inset-0 z-30 hidden md:block" aria-hidden="true">
          {layerNotes.map((n, i) => {
            const range: [number, number] = [0.42 + i * 0.07, 0.52 + i * 0.07];
            return <LayerNote key={n.nr} note={n} index={i} range={range} progress={progress} />;
          })}
        </div>

        {/* Kop, subregel en CTA's (fase 1) */}
        <motion.div
          style={{ y: copyY, opacity: copyOpacity }}
          className="relative z-20 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-5 pb-24 md:justify-center md:px-8 md:pb-0"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Ambachtelijk sinds 2005
          </p>
          <h1 className="mt-5 max-w-[10ch] font-display text-5xl leading-[1.05] tracking-tight text-foreground md:text-7xl">
            {headline.map((line, i) => (
              // pb + negatieve mb geven staartletters (g, j) ruimte binnen het animatiemasker
              <span key={line} className="block overflow-hidden pb-[0.14em] -mb-[0.14em]">
                <motion.span
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.9, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-[34ch] text-base leading-relaxed text-foreground/80 md:text-lg"
          >
            Handgemaakte taarten uit ons atelier, dagvers en volledig naar jouw idee.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
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
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.4 }}
            className="mt-14 text-xs uppercase tracking-[0.3em] text-muted-foreground md:absolute md:bottom-10 md:left-1/2 md:mt-0 md:-translate-x-1/2"
          >
            Scroll — laag voor laag
          </motion.p>
        </motion.div>
      </motion.div>
    </section>
  );
};

type NoteProps = {
  note: (typeof layerNotes)[number];
  index: number;
  range: [number, number];
  progress: MotionValue<number>;
};

/** Kaartje dat naast een laag verschijnt zodra die zich losmaakt. */
const LayerNote = ({ note, index, range, progress }: NoteProps) => {
  const opacity = useTransform(progress, range, [0, 1]);
  const x = useTransform(progress, range, [note.side === "left" ? -24 : 24, 0]);
  // Verticale ankerpunten grofweg gelijk aan de eindposities van de lagen
  const tops = ["19%", "37%", "55%", "71%"];
  return (
    <motion.div
      style={{ opacity, x, top: tops[index] }}
      className={`absolute w-[240px] ${note.side === "left" ? "left-[6%] text-right lg:left-[14%]" : "right-[6%] lg:right-[14%]"}`}
    >
      <p className="text-xs font-semibold tracking-[0.25em] text-primary">{note.nr}</p>
      <h3 className="mt-1 font-display text-xl text-foreground">{note.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{note.text}</p>
    </motion.div>
  );
};

export default Hero;
