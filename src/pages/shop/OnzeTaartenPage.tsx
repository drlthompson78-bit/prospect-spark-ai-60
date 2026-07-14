import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import Reveal from "@/components/shop/Reveal";
import { cn } from "@/lib/utils";

interface Taart {
  slug: string;
  titel: string;
  categorie: string;
  foto: string;
  foto2x: string;
  /** De originele beschrijving van de detailpagina op hettaartenhuis.nl. */
  beschrijving: string;
}

const PAGINA_GROOTTE = 24;

/**
 * De volledige taartencatalogus van hettaartenhuis.nl/onze-taarten:
 * alle voorbeelden met de originele titels, soorten en foto's, geladen
 * uit taarten.json (geparsed uit de site-mirror). De introtekst en de
 * soortenlijst zijn letterlijk van de originele pagina overgenomen.
 */
const OnzeTaartenPage = () => {
  const [taarten, setTaarten] = useState<Taart[]>([]);
  const [soort, setSoort] = useState<string>("Alle");
  const [zichtbaar, setZichtbaar] = useState(PAGINA_GROOTTE);
  const [detail, setDetail] = useState<Taart | null>(null);

  // De catalogus (1200+ items) wordt pas geladen als de pagina opent,
  // zodat hij niet in de hoofdbundel terechtkomt.
  useEffect(() => {
    let actief = true;
    import("@/data/taarten.json").then((mod) => {
      if (actief) setTaarten(mod.default as Taart[]);
    });
    return () => {
      actief = false;
    };
  }, []);

  const soorten = useMemo(() => {
    const set = new Set<string>();
    taarten.forEach((t) => t.categorie.split(", ").forEach((c) => c && set.add(c)));
    return ["Alle", ...[...set].sort((a, b) => a.localeCompare(b, "nl"))];
  }, [taarten]);

  const selectie = useMemo(
    () => (soort === "Alle" ? taarten : taarten.filter((t) => t.categorie.split(", ").includes(soort))),
    [taarten, soort]
  );

  const kiesSoort = (s: string) => {
    setSoort(s);
    setZichtbaar(PAGINA_GROOTTE);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-24 pt-28 md:px-8 md:pt-36">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Onze taarten</p>
        <h1 className="mt-4 max-w-[20ch] font-display text-4xl leading-tight tracking-tight text-foreground md:text-6xl">
          Bekijk al onze taarten
        </h1>
        <p className="mt-5 max-w-[56ch] text-base leading-relaxed text-muted-foreground">
          Dit is een greep uit de reeds door ons gemaakte taarten. In het overzicht kun je
          diverse verschillende taarten bekijken. Er worden wekelijks nieuwe foto&apos;s van
          taarten toegevoegd.
        </p>
      </Reveal>

      {/* Soorten: de originele categorieën als filter. Op mobiel één horizontaal
          swipebare rij (23 chips zouden anders de taarten een scherm omlaag duwen). */}
      <div
        className="-mx-5 mt-10 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
        role="group"
        aria-label="Filter op soort"
      >
        {soorten.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => kiesSoort(s)}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-all duration-300",
              soort === s
                ? "border-primary bg-primary text-primary-foreground shadow-md"
                : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        {selectie.length} {selectie.length === 1 ? "taart" : "taarten"}
        {soort !== "Alle" ? ` in ${soort}` : ""}
      </p>

      <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {selectie.slice(0, zichtbaar).map((taart, i) => (
          <motion.li
            key={taart.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: (i % 4) * 0.05, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              type="button"
              onClick={() => setDetail(taart)}
              className="group block w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="block overflow-hidden rounded-xl bg-secondary">
                <img
                  src={taart.foto}
                  srcSet={`${taart.foto} 1x, ${taart.foto2x} 2x`}
                  alt={taart.titel}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                />
              </span>
              <span className="mt-3 block font-display text-base leading-snug text-foreground">{taart.titel}</span>
              <span className="mt-0.5 block text-xs uppercase tracking-wide text-muted-foreground">{taart.categorie}</span>
            </button>
          </motion.li>
        ))}
      </ul>

      {zichtbaar < selectie.length && (
        <div className="mt-12 text-center">
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-8 text-base"
            onClick={() => setZichtbaar((z) => z + PAGINA_GROOTTE)}
          >
            Meer taarten laden ({selectie.length - zichtbaar} resterend)
          </Button>
        </div>
      )}

      {/* Detailvenster met grote foto en aanvraagknop, volgens de echte werkwijze */}
      <Dialog open={detail !== null} onOpenChange={(open) => !open && setDetail(null)}>
        {/* max-h + scroll voorkomen dat de knop onder de vouw valt op kleinere schermen */}
        <DialogContent className="max-h-[92dvh] max-w-lg overflow-y-auto p-0">
          {detail && (
            <>
              <img src={detail.foto2x} alt={detail.titel} className="max-h-[52dvh] w-full object-cover" />
              <div className="p-6 pt-4">
                <DialogTitle className="font-display text-2xl tracking-tight">{detail.titel}</DialogTitle>
                <DialogDescription className="mt-1 text-sm uppercase tracking-wide">
                  {detail.categorie}
                </DialogDescription>
                {detail.beschrijving && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{detail.beschrijving}</p>
                )}
                <Button asChild size="lg" className="mt-5 h-12 w-full text-base">
                  <Link to="/op-maat">Vraag deze taart aan</Link>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OnzeTaartenPage;
