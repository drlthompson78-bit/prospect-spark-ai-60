import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { cakeWhole, siteLogo } from "@/data/assets";

/** De navigatie volgt de originele site: Onze taarten t/m Contact, plus de webshop-collectie. */
const navItems = [
  { label: "Onze taarten", to: "/onze-taarten" },
  { label: "Smaken en prijzen", to: "/smaken-en-prijzen" },
  { label: "Bedrijven", to: "/bedrijven" },
  { label: "Over ons", to: "/over-ons" },
  { label: "Contact", to: "/contact" },
];

/** Items voor de fullscreen overlay, met de webshop en het bestellen erbij. */
const overlayItems = [
  { nr: "01", label: "Onze taarten", to: "/onze-taarten" },
  { nr: "02", label: "Smaken en prijzen", to: "/smaken-en-prijzen" },
  { nr: "03", label: "Collectie", to: "/collectie" },
  { nr: "04", label: "Bedrijven", to: "/bedrijven" },
  { nr: "05", label: "Over ons", to: "/over-ons" },
  { nr: "06", label: "Contact", to: "/contact" },
  { nr: "07", label: "Bestellen", to: "/bestellen" },
];

const SiteHeader = () => {
  const { count, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const location = useLocation();
  const reduced = useReducedMotion();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
  });

  // Scroll-lock zolang de overlay open staat
  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const solid = scrolled || location.pathname !== "/";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        solid && !menuOpen ? "bg-background/90 backdrop-blur-md border-b border-border" : "bg-transparent"
      )}
    >
      {/* Topbalk zoals op de originele site: socials links, e-mail rechts */}
      {!scrolled && !menuOpen && (
        <div className="hidden border-b border-border/60 bg-background/80 md:block">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-1.5 text-sm">
            <div className="flex items-center gap-4">
              <a href="https://www.facebook.com/Het-Taartenhuis-834943116631128/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground transition-colors hover:text-foreground">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.instagram.com/hettaartenhuis/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground transition-colors hover:text-foreground">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="https://nl.pinterest.com/hettaartenhuis/" target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className="text-muted-foreground transition-colors hover:text-foreground">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/></svg>
              </a>
            </div>
            <a href="mailto:info@hettaartenhuis.nl" className="text-muted-foreground transition-colors hover:text-foreground">
              info@hettaartenhuis.nl
            </a>
          </div>
        </div>
      )}
      <div className="relative z-10 mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:h-[72px] md:px-8">
        <Link to="/" className="font-display text-lg tracking-tight text-foreground md:text-xl" onClick={() => setMenuOpen(false)}>
          <img src={siteLogo} alt="Het Taartenhuis — sinds 2005" className="h-7 w-auto md:h-10" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Hoofdnavigatie">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="nav-link text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-0.5 md:gap-2">
          {/* Bestellen als uitgelichte knop, zoals op de originele site — ook op
              mobiel zichtbaar (daar maakt de themaknop plaats, de primaire actie wint).
              Compacter op mobiel: naast een groter logo is daar weinig ruimte over. */}
          <Link
            to="/bestellen"
            onClick={() => setMenuOpen(false)}
            className="inline-flex h-9 items-center rounded-full bg-primary px-2 text-[13px] font-semibold text-primary-foreground shadow-sm transition-all duration-300 hover:-translate-y-px hover:shadow-md md:mr-1 md:h-10 md:px-5 md:text-sm"
          >
            Bestellen
          </Link>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              openCart();
            }}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-secondary md:h-11 md:w-11"
            aria-label={`Winkelwagen openen, ${count} ${count === 1 ? "artikel" : "artikelen"}`}
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground"
              >
                {count}
              </motion.span>
            )}
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-secondary md:h-11 md:w-11"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Menu sluiten" : "Menu openen"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Fullscreen overlay: grote outlined navigatie links, de signatuurtaart rechts */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed inset-0 bg-background/95 backdrop-blur-xl"
            aria-label="Menu"
          >
            <div className="mx-auto flex h-full max-w-[1400px] flex-col justify-between px-5 pb-10 pt-24 md:flex-row md:items-center md:px-8 md:pt-16">
              <ul className="flex flex-col gap-1 md:gap-2">
                {overlayItems.map((item, i) => (
                  <motion.li
                    key={item.to}
                    initial={reduced ? false : { y: 32, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.55, delay: 0.08 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      className="group flex items-baseline gap-4"
                    >
                      <span className="text-xs font-semibold tracking-[0.25em] text-primary">{item.nr}</span>
                      <span className="text-outline font-display text-4xl uppercase leading-[1.15] tracking-tight md:text-6xl lg:text-7xl">
                        {item.label}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                initial={reduced ? false : { opacity: 0, scale: 0.92, rotate: 3 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="relative mx-auto hidden w-[min(34vw,420px)] md:block"
                aria-hidden="true"
              >
                <img src={cakeWhole} alt="" className="w-full select-none drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)]" draggable={false} />
                <span className="absolute -left-6 top-8 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary-foreground shadow-lg -rotate-6">
                  Altijd dagvers
                </span>
                <span className="absolute -right-4 bottom-12 rounded-full border border-border bg-card px-4 py-2 text-xs text-card-foreground shadow-lg rotate-3">
                  Taarten vanaf € 34,50
                </span>
              </motion.div>

              <motion.div
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-muted-foreground md:absolute md:bottom-10 md:left-1/2 md:-translate-x-1/2"
              >
                <span className="italic text-primary">Vrijblijvende prijsopgave</span>
                <a href="mailto:info@hettaartenhuis.nl" className="transition-colors hover:text-foreground">
                  info@hettaartenhuis.nl
                </a>
                <span>www.hettaartenhuis.nl</span>
              </motion.div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default SiteHeader;
