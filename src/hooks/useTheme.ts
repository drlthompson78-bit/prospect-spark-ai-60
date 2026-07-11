import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "taartenhuis-theme";

// Versie 2 opent standaard licht (herkenbaar als de huidige site); donker blijft schakelbaar
const readStored = (): Theme => {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
};

/**
 * Schakelt tussen de donkere (cinematografische) en lichte variant.
 * De keuze wordt onthouden in localStorage; de klasse op <html> stuurt
 * de CSS-variabelen in index.css aan.
 */
export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(readStored);

  useEffect(() => {
    document.documentElement.classList.toggle("theme-light", theme === "light");
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return { theme, toggle };
};
