import Reveal from "@/components/shop/Reveal";

const steps = [
  {
    title: "Vertel je idee",
    text: "Kies een taart uit de collectie of beschrijf je eigen ontwerp. Elke aanvraag is vrijblijvend.",
  },
  {
    title: "Wij bevestigen",
    text: "Binnen 24 uur ontvang je per e-mail de mogelijkheden, de prijs en het voorstel voor jouw taart.",
  },
  {
    title: "Vers gebakken, klaar om te vieren",
    text: "Na jouw akkoord bakken wij dagvers. Je haalt de taart op in het atelier of we bezorgen in overleg.",
  },
];

/** Werkwijze als verticale lijst met scheidingslijnen, geen kaartjescarrousel. */
const Werkwijze = () => (
  <section className="border-t border-border py-24 md:py-32">
    <div className="mx-auto grid max-w-[1400px] gap-12 px-5 md:grid-cols-[4fr_7fr] md:px-8">
      <Reveal>
        <h2 className="font-display text-3xl tracking-tight text-foreground md:text-5xl">Zo werkt het</h2>
        <p className="mt-4 max-w-[40ch] text-base leading-relaxed text-muted-foreground">
          Bestellen bij een atelier voelt anders dan bij een fabriek. Zo hoort het.
        </p>
      </Reveal>

      <div className="divide-y divide-border">
        {steps.map((step, i) => (
          <Reveal key={step.title} delay={i * 0.08}>
            <div className="grid gap-2 py-8 first:pt-0 md:grid-cols-[1fr_2fr] md:gap-8">
              <h3 className="font-display text-xl text-foreground">{step.title}</h3>
              <p className="max-w-[56ch] text-base leading-relaxed text-muted-foreground">{step.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default Werkwijze;
