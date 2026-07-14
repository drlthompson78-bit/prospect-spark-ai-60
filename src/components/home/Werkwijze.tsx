import Reveal from "@/components/shop/Reveal";

/** Letterlijke zinnen van hettaartenhuis.nl/bestellen, alleen visueel als genummerde
 * stappen gepresenteerd (geen zelfbedachte titels boven elke alinea). */
const steps = [
  "In het bestelformulier kunt u eenvoudig uw wensen en ideeën doorgeven. Let op: het invullen van dit formulier geldt nog niet als een definitieve bestelling.",
  "U ontvangt van ons eerst een e-mail met de mogelijkheden en bijbehorende prijzen. Pas na uw akkoord wordt de bestelling definitief en ontvangt u een bevestiging met betaalgegevens, het volledige ophaaladres en het afhaaltijdstip.",
  "De taart kan worden opgehaald bij een collega in Rotterdam. De locatie is goed bereikbaar, met parkeergelegenheid voor de deur. Onze taarten worden ambachtelijk bereid en vers geleverd; mits koel bewaard blijven ze nog ruim 3 dagen goed.",
];

/** Werkwijze als verticale lijst met scheidingslijnen, geen kaartjescarrousel. */
const Werkwijze = () => (
  <section className="border-t border-border py-24 md:py-32">
    <div className="mx-auto grid max-w-[1400px] gap-12 px-5 md:grid-cols-[4fr_7fr] md:px-8">
      <Reveal>
        <p className="mt-4 max-w-[40ch] text-base leading-relaxed text-muted-foreground">
          Een aanvraag doet u makkelijk en vrijblijvend online via ons aanvraagformulier. We hanteren geen vaste besteltermijn, maar om teleurstelling te voorkomen raden we aan uw bestelling op tijd door te geven.
        </p>
      </Reveal>

      <div className="divide-y divide-border">
        {steps.map((text, i) => (
          <Reveal key={text.slice(0, 20)} delay={i * 0.08}>
            <div className="grid gap-2 py-8 first:pt-0 md:grid-cols-[1fr_2fr] md:gap-8">
              <span className="font-display text-xl text-primary">{String(i + 1).padStart(2, "0")}</span>
              <p className="max-w-[56ch] text-base leading-relaxed text-muted-foreground">{text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default Werkwijze;
