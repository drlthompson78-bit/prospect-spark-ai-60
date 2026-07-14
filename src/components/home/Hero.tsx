import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { cakeWhole, heroScrollFilm, heroScrollFilmRaw } from "@/data/assets";

gsap.registerPlugin(ScrollTrigger);
// Voorkomt dat de scrub "skipt": op mobiel klapt de adresbalk in/uit tijdens het
// scrollen, wat een resize-event triggert; zonder deze regel herberekent
// ScrollTrigger dan de start/eindposities halverwege een scrollbeweging, met een
// sprong in de film als gevolg.
ScrollTrigger.config({ ignoreMobileResize: true });

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
  // Desktop: vier labels in de pagina-marge naast de (smallere) taart.
  const desktopLabelRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Mobiel: één onderschrift dat door de ingrediënten wisselt (labels over de
  // taart zouden 'm afdekken op een smal scherm).
  const mobileCaptionRef = useRef<HTMLDivElement>(null);
  const [staticMode, setStaticMode] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setStaticMode(true);
      return;
    }

    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    // De film wordt gescrubd, nooit écht afgespeeld — maar mobiele Safari negeert
    // preload="auto" en laadt pas beelddata na een echte play()-aanroep. Een gemute,
    // playsinline-video mag altijd autoplayen; we starten 'm dus direct heel even en
    // pauzeren meteen weer, puur om de framedata te laten laden.
    video.pause();
    video
      .play()
      .then(() => video.pause())
      .catch(() => {
        const unlock = () => {
          video.play().then(() => video.pause()).catch(() => {});
        };
        window.addEventListener("touchstart", unlock, { once: true, passive: true });
        window.addEventListener("pointerdown", unlock, { once: true, passive: true });
      });
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
      // Desktop-labels verschijnen gespreid tijdens de laagscheiding, in de marge
      desktopLabelRefs.current.forEach((el, i) => {
        if (!el) return;
        const start = 0.42 + i * 0.1;
        const o = clamp01((p - start) / 0.12);
        el.style.opacity = String(o);
        el.style.transform = `translateX(${(1 - o) * (labels[i].side === "left" ? -24 : 24)}px)`;
      });
      // Mobiel: één onderschrift dat door de vier ingrediënten heen wisselt terwijl
      // de lagen scheiden — de taart blijft zo volledig zichtbaar.
      const cap = mobileCaptionRef.current;
      if (cap) {
        const inSep = p > 0.4 && p < 0.99;
        cap.style.opacity = inSep ? "1" : "0";
        if (inSep) {
          const idx = Math.min(labels.length - 1, Math.max(0, Math.floor((p - 0.42) / 0.1)));
          const nrEl = cap.querySelector("[data-nr]");
          const titleEl = cap.querySelector("[data-title]");
          if (nrEl && nrEl.textContent !== labels[idx].nr) nrEl.textContent = labels[idx].nr;
          if (titleEl && titleEl.textContent !== labels[idx].title) titleEl.textContent = labels[idx].title;
        }
      }
      // scroll-hint dooft zodra er gescrold wordt
      if (hintRef.current) hintRef.current.style.opacity = String(1 - clamp01(p / 0.08));
    };

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      // GEEN invalidateOnRefresh: dat herberekent de start/eindpositie bij elke
      // refresh (bv. na het laden van de video) tegen de dán actuele scrollpositie
      // — middenin het scrollen voelde dat als een sprong terug naar het begin.
      // Onze start/eind ("top top"/"bottom bottom") zijn toch stabiel: ze hangen
      // alleen af van de sectiehoogte, niet van de video-laadstatus.
      onUpdate: (self) => render(self.progress),
    });

    const onMeta = () => {
      video.currentTime = 0;
      render(st.progress);
    };
    video.addEventListener("loadedmetadata", onMeta);

    render(0);

    return () => {
      st.kill();
      video.removeEventListener("loadedmetadata", onMeta);
    };
  }, []);

  // TIJDELIJK: debug-badge, alleen zichtbaar in dev-modus (npm run dev), nooit in productie.
  if (staticMode) {
    return (
      <section aria-label="Introductie" className="relative">
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
      {/* Op mobiel: tekst boven, film ertussen (vult alle overgebleven ruimte), knoppen
          onder — zo blijft er geen witruimte over. Op desktop (md:): de bestaande
          opstelling met film gecentreerd en tekst/knoppen er als overlay overheen.
          Hoogte in svh (small viewport height), niet dvh: dvh verandert van waarde
          telkens als de mobiele adresbalk in/uit klapt, waardoor de verticaal
          gecentreerde inhoud steeds herpositioneert — dát was het 'de hele pagina
          springt'-effect. svh blijft constant, dus niets reflowt bij het scrollen. */}
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden bg-background md:block">
        {/* Kop en subregel (fase 1) — echte siteteksten. De film staat hier nog op het
            rustige, egale openingsbeeld (complete taart op lichte achtergrond). */}
        <div
          ref={copyRef}
          className="relative z-20 order-1 shrink-0 px-5 pt-20 pb-2 md:mx-auto md:flex md:h-full md:max-w-[1400px] md:flex-col md:justify-center md:px-8 md:pt-0 md:pb-0 lg:pl-20"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Sinds 2005</p>
          <h1 className="mt-3 max-w-[13ch] font-display text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl md:mt-5 md:text-7xl">
            Welkom bij Het Taartenhuis
          </h1>
          <p className="mt-3 max-w-[34ch] text-base leading-relaxed text-foreground/80 md:mt-6 md:text-lg">
            Uw online taartenspecialist voor de lekkerste taarten voor elke gelegenheid.
          </p>
          {/* Op desktop staan de knoppen hier, als onderdeel van de wegfadende kop.
              Op mobiel staan ze los onder de film (zie verderop), zodat ze altijd
              zichtbaar blijven. */}
          <div className="mt-9 hidden flex-wrap items-center gap-4 md:flex">
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

        {/* De gescrubte film. Op mobiel: een op de taart-verhouding (828:1108) vaste box,
            zo groot als in de resterende ruimte past, gecentreerd — de wrapper vult de
            overgebleven hoogte en centreert de box. Doordat de box exact de
            taartverhouding heeft, vult de video 'm volledig zónder bij te snijden én
            zonder witruimte/mist. Op desktop (md:) valt de wrapper weg (contents) en
            positioneert de film zichzelf absoluut gecentreerd, zoals voorheen. */}
        <div className="order-2 flex min-h-0 w-full flex-1 items-center justify-center md:contents">
          <div className="hero-film relative h-full max-h-full max-w-full aspect-[828/1108] md:absolute md:left-1/2 md:top-1/2 md:h-[92%] md:max-h-none md:w-auto md:max-w-[92vw] md:-translate-x-1/2 md:-translate-y-1/2">
            <video
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              poster={cakeWhole}
              onError={() => setStaticMode(true)}
              aria-label="De ijsjestaart van Het Taartenhuis draait rond en gaat laag voor laag uit elkaar"
              className="h-full w-full object-contain"
            >
              <source src={heroScrollFilm} type="video/mp4" />
              <source src={heroScrollFilmRaw} type="video/mp4" />
            </video>
            <div className="hero-vignette pointer-events-none absolute inset-0" aria-hidden="true" />

            {/* Ingrediënten op mobiel: één compact onderschrift onderaan de film dat
                door de vier lagen wisselt terwijl ze scheiden. Zo dekt de tekst de
                taart niet af (vier losse kaarten deden dat wel op een smal scherm). */}
            <div
              ref={mobileCaptionRef}
              className="pointer-events-none absolute inset-x-0 bottom-3 z-30 flex justify-center px-4 opacity-0 transition-opacity duration-300 md:hidden"
              aria-hidden="true"
            >
              <div className="flex items-center gap-2 rounded-full bg-background/85 px-4 py-2 shadow-sm backdrop-blur-md">
                <span data-nr className="text-[10px] font-semibold tracking-[0.2em] text-primary">01</span>
                <span data-title className="font-display text-sm text-foreground">Marsepein of fondant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Knoppen op mobiel: eigen, altijd zichtbare rij onder de film */}
        <div className="order-3 flex shrink-0 flex-wrap items-center gap-3 px-5 pb-6 pt-3 md:hidden">
          {/* min-h i.p.v. h: op de allersmalste schermen mag de knoptekst naar een
              tweede regel groeien in plaats van afgeknipt te worden */}
          <Button asChild size="lg" className="min-h-12 flex-1 px-4 text-base active:scale-[0.98]">
            <Link to="/onze-taarten">Bekijk al onze taarten</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="min-h-12 flex-1 px-4 text-base active:scale-[0.98]">
            <Link to="/bedrijven">Voor bedrijven</Link>
          </Button>
        </div>

        {/* Ingrediëntlabels op desktop: in de pagina-marge naast de (smallere) film */}
        <div className="pointer-events-none absolute inset-0 z-30 hidden md:block" aria-hidden="true">
          {labels.map((n, i) => (
            <div
              key={n.nr}
              ref={(el) => {
                desktopLabelRefs.current[i] = el;
              }}
              style={{ top: n.top, opacity: 0 }}
              className={`absolute w-[240px] ${n.side === "left" ? "left-[6%] text-right lg:left-[13%]" : "right-[6%] lg:right-[13%]"}`}
            >
              <p className="text-xs font-semibold tracking-[0.25em] text-primary">{n.nr}</p>
              <h3 className="mt-1 font-display text-xl text-foreground">{n.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{n.text}</p>
            </div>
          ))}
        </div>

        <p
          ref={hintRef}
          className="absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-muted-foreground md:block"
        >
          Scroll — laag voor laag
        </p>
      </div>
    </section>
  );
};

export default Hero;
