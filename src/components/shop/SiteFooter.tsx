import { Link } from "react-router-dom";
import { categories } from "@/data/products";

const SiteFooter = () => (
  <footer id="contact" className="border-t border-border bg-card">
    <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-16 md:grid-cols-[2fr_1fr_1fr_1fr] md:px-8 md:py-20">
      <div>
        <p className="font-display text-2xl text-foreground">Het Taartenhuis</p>
        <p className="mt-4 max-w-[42ch] text-sm leading-relaxed text-muted-foreground">
          Sinds 2005 een vertrouwd adres voor unieke, ambachtelijke taarten.
          Elke taart wordt met de hand gemaakt en is altijd dagvers.
        </p>
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground">Collectie</p>
        <ul className="mt-4 space-y-2">
          {categories.slice(0, 5).map((c) => (
            <li key={c.slug}>
              <Link
                to={`/collectie?categorie=${c.slug}`}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground">Bestellen</p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>
            <Link to="/collectie" className="transition-colors hover:text-foreground">
              Alle taarten
            </Link>
          </li>
          <li>
            <Link to="/op-maat" className="transition-colors hover:text-foreground">
              Taart op maat
            </Link>
          </li>
          <li>
            <Link to="/bestellen" className="transition-colors hover:text-foreground">
              Winkelwagen afronden
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground">Contact</p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>
            <a href="mailto:info@hettaartenhuis.nl" className="transition-colors hover:text-foreground">
              info@hettaartenhuis.nl
            </a>
          </li>
          <li>
            <a href="tel:+31634309927" className="transition-colors hover:text-foreground">
              06 343 099 27
            </a>
          </li>
          <li className="pt-2">Di t/m vr vanaf 11:00</li>
          <li>Weekend en maandag gesloten</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-border">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-5 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
        <p>&copy; {new Date().getFullYear()} Het Taartenhuis. Alle taarten worden vers en met de hand gemaakt.</p>
        <p>Afhalen op afspraak. Bezorging in overleg.</p>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
