import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Lenis from "lenis";
import SiteHeader from "@/components/shop/SiteHeader";
import SiteFooter from "@/components/shop/SiteFooter";
import CartDrawer from "@/components/shop/CartDrawer";
import { CartProvider } from "@/context/CartContext";

/** Schil rond alle shop-pagina's: navigatie, soepel scrollen, winkelwagen, footer. */
const ShopLayout = () => {
  const location = useLocation();

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
      <main>
        <Outlet />
      </main>
      <SiteFooter />
      <CartDrawer />
    </CartProvider>
  );
};

export default ShopLayout;
