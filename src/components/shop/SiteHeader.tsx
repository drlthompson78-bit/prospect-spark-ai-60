import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

const navItems = [
  { label: "Collectie", to: "/collectie" },
  { label: "Op maat", to: "/op-maat" },
  { label: "Ons verhaal", to: "/#atelier" },
  { label: "Contact", to: "/#contact" },
];

const SiteHeader = () => {
  const { count, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const location = useLocation();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
  });

  const solid = scrolled || location.pathname !== "/";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        solid ? "bg-background/90 backdrop-blur-md border-b border-border" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:h-[72px] md:px-8">
        <Link to="/" className="font-display text-lg tracking-tight text-foreground md:text-xl" onClick={() => setMenuOpen(false)}>
          Het Taartenhuis
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Hoofdnavigatie">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCart}
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
            className="flex h-11 w-11 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-secondary md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Menu sluiten" : "Menu openen"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          className="border-b border-border bg-background/95 px-5 pb-6 pt-2 backdrop-blur-md md:hidden"
          aria-label="Mobiele navigatie"
        >
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-3 py-3 text-base text-foreground transition-colors hover:bg-secondary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default SiteHeader;
