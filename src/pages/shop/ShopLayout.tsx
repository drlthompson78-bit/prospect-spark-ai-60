import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import Lenis from "lenis";
import SiteHeader from "@/components/shop/SiteHeader";
import SocialRail from "@/components/shop/SocialRail";
import SiteFooter from "@/components/shop/SiteFooter";
import CartDrawer from "@/components/shop/CartDrawer";
import { CartProvider } from "@/context/CartContext";

/** Schil rond alle shop-pagina's: navigatie, soepel scrollen, winkelwagen, footer. */
const ShopLayout = () => {
  const location = useLocation();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.12 });
    let frame: number;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname, location.hash]);

  return (
    <CartProvider>
      <div className="grain-overlay" aria-hidden="true" />
      <SiteHeader />
      <SocialRail />
      {/* Zachte overgang bij elke paginawissel; key op pathname hertriggert de animatie */}
      <motion.main
        key={location.pathname}
        initial={reduced ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Outlet />
      </motion.main>
      <SiteFooter />
      <CartDrawer />
    </CartProvider>
  );
};

export default ShopLayout;
