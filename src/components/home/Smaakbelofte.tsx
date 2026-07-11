import Reveal from "@/components/shop/Reveal";

/**
 * De smaakbelofte van Het Taartenhuis, met de originele teksten van de
 * smaken-en-prijzenpagina ("Niet te zoet, wél onweerstaanbaar").
 */
const Smaakbelofte = () => (
  <section className="border-t border-border py-24 md:py-32">
    <div className="mx-auto grid max-w-[1400px] gap-12 px-5 md:grid-cols-[6fr_5fr] md:gap-16 md:px-8">
      <Reveal className="flex flex-col justify-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Onze smaken</p>
        <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight text-foreground md:text-5xl">
          Niet te zoet, wél onweerstaanbaar
        </h2>
        <p className="mt-6 max-w-[56ch] text-base leading-relaxed text-muted-foreground">
          Onze taarten staan bekend om hun subtiele zoetheid en juist daardoor is de kans
          groot dat u nog een tweede stukje wilt&hellip;
        </p>
      </Reveal>

      <div className="flex flex-col justify-center gap-10">
        <Reveal delay={0.1}>
          <div className="border-l-2 border-border pl-6">
            <h3 className="font-display text-xl text-foreground">De smaak van uw feest begint hier</h3>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Taarten van Het Taartenhuis worden gemaakt van luchtige vanille- of
              chocoladecake, gevuld met een romige, niet te zoete slagroomvulling. Naar wens
              voegen we hier een van onze smaken aan toe, van aardbei tot karamel.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.18}>
          <div className="border-l-2 border-border pl-6">
            <h3 className="font-display text-xl text-foreground">Uw taart, uw ontwerp</h3>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              U bepaalt hoe uw taart eruitziet. Heeft u zelf ideeën of een voorbeeld gezien?
              Laat het ons weten! Een vrijblijvende prijsopgave ontvangt u altijd per e-mail.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

export default Smaakbelofte;
