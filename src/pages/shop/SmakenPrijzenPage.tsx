import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/shop/Reveal";
import { vullingen } from "@/data/products";

/** De prijstabellen, letterlijk overgenomen van hettaartenhuis.nl/smaken-en-prijzen. */
const prijsgroepen = [
  {
    vorm: "Rond",
    rijen: [
      ["ø 20 cm", "€ 34,50"],
      ["ø 26 cm", "€ 44,50"],
      ["ø 30 cm", "€ 54,50"],
      ["ø 32 cm", "€ 64,50"],
      ["ø 34 cm", "€ 74,50"],
    ],
  },
  {
    vorm: "Ovaal",
    rijen: [
      ["ø 15 cm (niet los verkrijgbaar)", "€ 24,50"],
      ["ø 25 cm", "€ 44,50"],
      ["ø 30 cm", "€ 54,50"],
      ["ø 35 cm", "€ 64,50"],
    ],
  },
  {
    vorm: "Vierkant",
    rijen: [
      ["22 × 22 cm", "€ 39,50"],
      ["26 × 26 cm", "€ 49,50"],
      ["30 × 30 cm", "€ 59,50"],
      ["40 × 40 cm", "€ 89,50"],
    ],
  },
  {
    vorm: "Rechthoek",
    rijen: [
      ["23 × 33 cm", "€ 54,50"],
      ["26 × 38 cm", "€ 79,50"],
    ],
  },
  {
    vorm: "6-hoek",
    rijen: [
      ["ø 15 cm (niet los verkrijgbaar)", "€ 24,50"],
      ["ø 25 cm", "€ 44,50"],
      ["ø 30 cm", "€ 54,50"],
      ["ø 35 cm", "€ 64,50"],
    ],
  },
  {
    vorm: "Bloem",
    rijen: [
      ["ø 15 cm (niet los verkrijgbaar)", "€ 24,50"],
      ["ø 25 cm", "€ 44,50"],
      ["ø 30 cm", "€ 54,50"],
      ["ø 35 cm", "€ 64,50"],
    ],
  },
  {
    vorm: "Hart",
    rijen: [
      ["ø 15 cm (niet los verkrijgbaar)", "€ 24,50"],
      ["ø 20 cm — Sweetheart", "€ 34,50"],
      ["ø 25 cm", "€ 44,50"],
      ["ø 30 cm", "€ 54,50"],
      ["ø 35 cm", "€ 64,50"],
    ],
  },
  {
    vorm: "Diverse o.a.",
    rijen: [
      ["Cupcakes per 12 st.", "vanaf € 44,50"],
      ["Koekjes per 15 st.", "vanaf € 34,50"],
      ["Cijfertaart (per cijfer) ± 30 cm", "€ 59,50"],
      ["Boek 36 × 26 cm", "€ 54,50"],
      ["T-shirt ± 30 cm", "€ 59,50"],
    ],
  },
];

/** Smaken en prijzen, met de originele teksten en tabellen van de site. */
const SmakenPrijzenPage = () => (
  <div className="mx-auto max-w-[1400px] px-5 pb-24 pt-28 md:px-8 md:pt-36">
    <Reveal>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Smaken en prijzen</p>
      <h1 className="mt-4 max-w-[22ch] font-display text-4xl leading-tight tracking-tight text-foreground md:text-6xl">
        De smaak van uw feest begint hier
      </h1>
      <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-muted-foreground">
        Hieronder vindt u de standaard vanafprijzen van onze taarten, exclusief decoratie. De
        uiteindelijke prijs is afhankelijk van uw wensen. Voor toevoegingen zoals afbeeldingen,
        teksten, bloemen of figuren rekenen wij een meerprijs. Ook voor taarten die extra hoog
        zijn, geldt een toeslag. <strong className="text-foreground">Elke taart is maatwerk!</strong>
      </p>
    </Reveal>

    <div className="mt-16 grid gap-16 lg:grid-cols-[5fr_6fr]">
      <div>
        <Reveal>
          <h2 className="font-display text-2xl tracking-tight text-foreground md:text-3xl">Onze smaken</h2>
          <p className="mt-4 max-w-[56ch] text-base leading-relaxed text-muted-foreground">
            Taarten van Het Taartenhuis worden gemaakt van luchtige vanille- of chocoladecake,
            gevuld met een romige, niet te zoete slagroomvulling. Naar wens voegen we hier een
            van de onderstaande smaken aan toe om de taart volledig naar uw smaak samen te
            stellen:
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-foreground">
            Keuze uit slagroomvullingen
          </h3>
          <ul className="mt-4 grid gap-1.5 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
            {vullingen.map((v) => (
              <li key={v.label} className="flex items-baseline gap-2">
                <span className="text-primary">✦</span>
                {v.label}
                {v.surcharge > 0 && <span className="text-xs">(+ € {v.surcharge.toFixed(2).replace(".", ",")})</span>}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.12}>
          <h3 className="mt-10 font-display text-xl text-foreground">Afwerking</h3>
          <p className="mt-3 max-w-[56ch] text-base leading-relaxed text-muted-foreground">
            Elke taart wordt bekleed met een dun laagje marsepein/fondant in een kleur naar
            keuze. Liever geen marsepein/fondant? Kies dan voor een afwerking met pure
            chocolade (+ € 5,00 per taart). De zijkant van de taart werken we af met pure
            chocoladehagel.
          </p>
        </Reveal>
        <Reveal delay={0.16}>
          <h3 className="mt-10 font-display text-xl text-foreground">Niet te zoet, wél onweerstaanbaar</h3>
          <p className="mt-3 max-w-[56ch] text-base leading-relaxed text-muted-foreground">
            Onze taarten staan bekend om hun subtiele zoetheid en juist daardoor is de kans
            groot dat u nog een tweede stukje wilt&hellip;
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <h3 className="mt-10 font-display text-xl text-foreground">Uw taart, uw ontwerp</h3>
          <p className="mt-3 max-w-[56ch] text-base leading-relaxed text-muted-foreground">
            U bepaalt hoe uw taart eruitziet. Heeft u zelf ideeën of een voorbeeld gezien? Laat
            het ons weten! Een vrijblijvende prijsopgave ontvangt u altijd per e-mail.
          </p>
        </Reveal>
      </div>

      <div>
        <Reveal>
          <h2 className="font-display text-2xl tracking-tight text-foreground md:text-3xl">Prijzen</h2>
        </Reveal>
        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          {prijsgroepen.map((groep, i) => (
            <Reveal key={groep.vorm} delay={i * 0.05}>
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-display text-lg text-foreground">{groep.vorm}</h3>
                <table className="mt-3 w-full text-sm">
                  <tbody className="divide-y divide-border">
                    {groep.rijen.map(([maat, prijs]) => (
                      <tr key={maat}>
                        <td className="py-2 pr-2 text-muted-foreground">{maat}</td>
                        <td className="py-2 text-right font-semibold tabular-nums text-foreground">{prijs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">Alle bovengenoemde prijzen zijn incl. 9% btw.</p>
        <Reveal delay={0.1}>
          <div className="mt-8 rounded-xl border border-border bg-secondary/60 p-6">
            <h3 className="font-display text-xl text-foreground">Vrijblijvende prijsaanvraag</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Vraag hier een vrijblijvende prijsaanvraag op voor uw persoonlijke taart!
            </p>
            <Button asChild size="lg" className="mt-4 h-12 px-7 text-base">
              <Link to="/op-maat">Aanvragen</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </div>
  </div>
);

export default SmakenPrijzenPage;
