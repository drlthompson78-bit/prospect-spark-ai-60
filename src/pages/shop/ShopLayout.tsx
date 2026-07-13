import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
import SiteHeader from "@/components/shop/SiteHeader";
import SocialRail from "@/components/shop/SocialRail";
import SiteFooter from "@/components/shop/SiteFooter";
import CartDrawer from "@/components/shop/CartDrawer";
import { CartProvider } from "@/context/CartContext";

/** Schil rond alle shop-pagina's: navigatie, soepel scrollen, winkelwagen, footer. */
const ShopLayout = () => {
  const location = useLocation();
  const reduced = useReducedMotion();

  // Lenis via de GSAP-ticker, gekoppeld aan ScrollTrigger (conform de motion-skill):
  // één instantie, zodat de gescrubte hero en het soepele scrollen samen optrekken.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.12 });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__lenis = lenis;
      (window as unknown as Record<string, unknown>).__ST = ScrollTrigger;
    }
    return () => {
      gsap.ticker.remove(tick);
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
