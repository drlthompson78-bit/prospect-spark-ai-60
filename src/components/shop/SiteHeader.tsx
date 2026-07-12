import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { Menu, Moon, ShoppingBag, Sun, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/hooks/useTheme";
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
  const { theme, toggle } = useTheme();

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
      <div className="relative z-10 mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:h-[72px] md:px-8">
        <Link to="/" className="font-display text-lg tracking-tight text-foreground md:text-xl" onClick={() => setMenuOpen(false)}>
          {theme === "light" ? (
            <img src={siteLogo} alt="Het Taartenhuis — sinds 2005" className="h-9 w-auto md:h-10" />
          ) : (
            "Het Taartenhuis"
          )}
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

        <div className="flex items-center gap-2">
          {/* Bestellen als uitgelichte knop, zoals op de originele site */}
          <Link
            to="/bestellen"
            onClick={() => setMenuOpen(false)}
            className="mr-1 hidden h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-300 hover:-translate-y-px hover:shadow-md md:inline-flex"
          >
            Bestellen
          </Link>
          <button
            type="button"
            onClick={toggle}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-secondary"
            aria-label={theme === "dark" ? "Schakel naar lichte weergave" : "Schakel naar donkere weergave"}
            title={theme === "dark" ? "Lichte versie" : "Donkere versie"}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              openCart();
            }}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-secondary"
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
            className="flex h-11 w-11 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-secondary"
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
