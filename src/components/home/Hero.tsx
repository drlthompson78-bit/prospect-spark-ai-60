import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { cakeWhole, heroScrollFilm, heroScrollFilmRaw } from "@/data/assets";

gsap.registerPlugin(ScrollTrigger);

/**
 * Ingrediënt-labels als HTML-overlay (nooit in de video gebakken).
 * Letterlijke zinnen van de smaken-en-prijzenpagina en homepage.
 */
const labels = [
  { nr: "01", title: "Marsepein of fondant", text: "Elke taart wordt bekleed met een dun laagje marsepein/fondant in een kleur naar keuze.", side: "right" as const, top: "20%" },
  { nr: "02", title: "Slagroomvulling", text: "Gevuld met een romige, niet te zoete slagroomvulling.", side: "left" as const, top: "38%" },
  { nr: "03", title: "Luchtige cake", text: "Gemaakt van luchtige vanille- of chocoladecake.", side: "right" as const, top: "56%" },
  { nr: "04", title: "Met de hand gemaakt", text: "Al onze taarten worden met de hand gemaakt en zijn altijd dagvers.", side: "left" as const, top: "72%" },
];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Scroll-gescrubte cinematografische hero (motion-skill, BurgerLab-techniek):
 * één doorlopende AI-film — taart compleet → camera draait → lagen scheiden
 * verticaal — waarvan de afspeeltijd frame-voor-frame aan de scrollpositie
 * hangt via GSAP ScrollTrigger. De copy en labels zijn HTML-overlays met
 * echte siteteksten. Werkt ook op mobiel/touch (Lenis zorgt voor de vloeiende
 * scroll waarop gescrubd wordt); alleen bij reduced motion of als de film
 * niet laadt volgt de statische hero met de taart-still.
 */
const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [staticMode, setStaticMode] = useState(false);
  // TIJDELIJK (debug mobiele scrub-hero): reden waarom staticMode aanspringt,
  // alleen zichtbaar in dev-modus. Verwijderen zodra de oorzaak gevonden is.
  const [debugInfo, setDebugInfo] = useState("init");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setStaticMode(true);
      setDebugInfo("static: prefers-reduced-motion");
      return;
    }

    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) {
      setDebugInfo("geen section/video ref");
      return;
    }

    // De film wordt gescrubd, nooit afgespeeld
    video.pause();
    let lastT = -1;

    const render = (p: number) => {
      // scroll → currentTime (laatste stukje progress reserveren we voor de uitloop)
      if (video.duration) {
        const t = clamp01(p / 0.96) * (video.duration - 0.05);
        if (Math.abs(t - lastT) > 0.008) {
          video.currentTime = t;
          lastT = t;
        }
      }
      // kop en knoppen wijken in de eerste fase
      if (copyRef.current) {
        const out = clamp01(p / 0.22);
        copyRef.current.style.opacity = String(1 - out);
        copyRef.current.style.transform = `translateY(${out * -46}px)`;
        copyRef.current.style.pointerEvents = out > 0.6 ? "none" : "auto";
      }
      // ingrediënt-labels verschijnen gespreid tijdens de laagscheiding
      labelRefs.current.forEach((el, i) => {
        if (!el) return;
        const start = 0.42 + i * 0.1;
        const o = clamp01((p - start) / 0.12);
        el.style.opacity = String(o);
        el.style.transform = `translateX(${(1 - o) * (labels[i].side === "left" ? -24 : 24)}px)`;
      });
      // scroll-hint dooft zodra er gescrold wordt
      if (hintRef.current) hintRef.current.style.opacity = String(1 - clamp01(p / 0.08));
      setDebugInfo(
        `p=${p.toFixed(2)} t=${video.currentTime.toFixed(1)}/${(video.duration || 0).toFixed(1)} ` +
          `readyState=${video.readyState} networkState=${video.networkState} src=${video.currentSrc.split("/").pop()}`
      );
    };

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => render(self.progress),
    });

    const onMeta = () => {
      video.currentTime = 0;
      render(st.progress);
    };
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("error", () => {
      const err = video.error;
      setDebugInfo(`video error code=${err?.code} message=${err?.message} src=${video.currentSrc}`);
    });

    render(0);

    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__heroVideo = video;
    }

    return () => {
      st.kill();
      video.removeEventListener("loadedmetadata", onMeta);
    };
  }, []);

  // TIJDELIJK: debug-badge, alleen zichtbaar in dev-modus (npm run dev), nooit in productie.
  const debugBadge = import.meta.env.DEV && (
    <div className="fixed bottom-0 left-0 z-[999] max-w-full break-all bg-black/80 px-2 py-1 font-mono text-[10px] text-lime-300">
      {debugInfo}
    </div>
  );

  if (staticMode) {
    return (
      <section aria-label="Introductie" className="relative">
        {debugBadge}
        <div className="mx-auto grid min-h-[88dvh] max-w-[1400px] items-center gap-10 px-5 pb-16 pt-28 md:grid-cols-2 md:px-8 lg:pl-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Sinds 2005</p>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] tracking-tight text-foreground md:text-6xl">
              Welkom bij Het Taartenhuis
            </h1>
            <p className="mt-6 max-w-[38ch] text-base leading-relaxed text-foreground/80 md:text-lg">
              Uw online taartenspecialist voor de lekkerste taarten voor elke gelegenheid.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Button asChild size="lg" className="h-12 px-7 text-base">
                <Link to="/onze-taarten">Bekijk al onze taarten</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base">
                <Link to="/bedrijven">Voor bedrijven</Link>
              </Button>
            </div>
          </div>
          <img
            src={cakeWhole}
            alt="De ijsjestaart van Het Taartenhuis: roze driptaart met ijshoorntje, ijsjes en raketjes"
            className="mx-auto w-full max-w-[440px] select-none drop-shadow-[0_30px_60px_rgba(0,0,0,0.18)]"
            draggable={false}
          />
        </div>
        <ul className="mx-auto grid max-w-[1400px] gap-6 px-5 pb-20 md:grid-cols-4 md:px-8">
          {labels.map((n) => (
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
    <section ref={sectionRef} className="relative h-[230vh] md:h-[340vh]" aria-label="Introductie">
      {debugBadge}
      {/* Expliciete paginakleur als achtergrond: multiply mengt de witte film-achtergrond
          hiertegen, ook als een ouder-wrapper (paginaovergang) een isolatielaag maakt */}
      <div className="sticky top-0 h-[100dvh] overflow-hidden bg-background">
        {/* De gescrubte film in een box op de taart-verhoudingen. De film heeft de
            paginakleur ingebakken; de vignet-laag erover dekt de vier videoranden af
            met exact de paginakleur (gewone CSS, werkt dus ook in Safari waar
            blend/mask op video onbetrouwbaar zijn). */}
        <div className="hero-film absolute left-1/2 top-1/2 h-[92%] aspect-[828/1108] -translate-x-1/2 -translate-y-1/2">
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            poster={cakeWhole}
            onError={(e) => {
              const err = e.currentTarget.error;
              setDebugInfo(`static: video onError code=${err?.code} message=${err?.message}`);
              setStaticMode(true);
            }}
            aria-label="De ijsjestaart van Het Taartenhuis draait rond en gaat laag voor laag uit elkaar"
            className="h-full w-full object-contain"
          >
            <source src={heroScrollFilm} type="video/mp4" />
            <source src={heroScrollFilmRaw} type="video/mp4" />
          </video>
          <div className="hero-vignette pointer-events-none absolute inset-0" aria-hidden="true" />
        </div>

        {/* Kop, subregel en CTA's (fase 1) — echte siteteksten, HTML-overlay */}
        <div
          ref={copyRef}
          className="relative z-20 mx-auto flex h-full max-w-[1400px] flex-col justify-center px-5 md:px-8 lg:pl-20"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Sinds 2005</p>
          <h1 className="mt-5 max-w-[13ch] font-display text-5xl leading-[1.05] tracking-tight text-foreground md:text-7xl">
            Welkom bij Het Taartenhuis
          </h1>
          <p className="mt-6 max-w-[34ch] text-base leading-relaxed text-foreground/80 md:text-lg">
            Uw online taartenspecialist voor de lekkerste taarten voor elke gelegenheid.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="h-12 px-7 text-base active:scale-[0.98]">
              <Link to="/onze-taarten">Bekijk al onze taarten</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-foreground/25 bg-background/20 px-7 text-base backdrop-blur-sm hover:bg-background/40 active:scale-[0.98]"
            >
              <Link to="/bedrijven">Voor bedrijven</Link>
            </Button>
          </div>
        </div>

        {/* Ingrediënt-labels tijdens de laagscheiding (fase 2); smaller op mobiel */}
        <div className="pointer-events-none absolute inset-0 z-30" aria-hidden="true">
          {labels.map((n, i) => (
            <div
              key={n.nr}
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              style={{ top: n.top, opacity: 0 }}
              className={`absolute w-[168px] sm:w-[240px] ${n.side === "left" ? "left-[4%] text-right md:left-[6%] lg:left-[13%]" : "right-[4%] md:right-[6%] lg:right-[13%]"}`}
            >
              <p className="text-[10px] font-semibold tracking-[0.2em] text-primary sm:text-xs sm:tracking-[0.25em]">{n.nr}</p>
              <h3 className="mt-1 font-display text-base text-foreground sm:text-xl">{n.title}</h3>
              <p className="mt-1.5 hidden text-sm leading-relaxed text-muted-foreground sm:block">{n.text}</p>
            </div>
          ))}
        </div>

        <p
          ref={hintRef}
          className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-muted-foreground"
        >
          Scroll — laag voor laag
        </p>
      </div>
    </section>
  );
};

export default Hero;
