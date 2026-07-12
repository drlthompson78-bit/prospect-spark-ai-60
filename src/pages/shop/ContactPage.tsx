import { Link } from "react-router-dom";
import { Mail, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/shop/Reveal";

/** Contact, met de originele informatie van hettaartenhuis.nl/contact. */
const ContactPage = () => (
  <div className="mx-auto max-w-[1400px] px-5 pb-24 pt-28 md:px-8 md:pt-36">
    <Reveal>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Contact</p>
      <h1 className="mt-4 font-display text-4xl leading-tight tracking-tight text-foreground md:text-6xl">
        Het Taartenhuis
      </h1>
      <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-muted-foreground">
        Doordat wij erg druk zijn met de voorbereidingen, gaat alle contact via e-mail. Heeft u
        liever telefonisch contact? Mail ons dan een terugbelverzoek; wij nemen dan zo snel
        mogelijk contact met u op.
      </p>
    </Reveal>

    <div className="mt-12 grid gap-6 md:grid-cols-3">
      <Reveal>
        <div className="h-full rounded-xl border border-border bg-card p-6 md:p-8">
          <Mail className="h-6 w-6 text-primary" aria-hidden="true" />
          <h2 className="mt-4 font-display text-xl text-foreground">E-mail</h2>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            Vragen kunt u stellen via{" "}
            <a href="mailto:info@hettaartenhuis.nl" className="text-primary underline-offset-4 hover:underline">
              info@hettaartenhuis.nl
            </a>
          </p>
          <p className="mt-3 text-sm text-muted-foreground">KvK Rotterdam: 50433962</p>
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <div className="h-full rounded-xl border border-border bg-card p-6 md:p-8">
          <MapPin className="h-6 w-6 text-primary" aria-hidden="true" />
          <h2 className="mt-4 font-display text-xl text-foreground">Ophalen</h2>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            Op bestelling kunt u van dinsdag t/m zaterdag bij een collega in Rotterdam de taart
            ophalen (alleen op afspraak). Makkelijk bereikbaar en parkeren voor de deur. Wij
            bezorgen niet.
          </p>
        </div>
      </Reveal>
      <Reveal delay={0.16}>
        <div className="h-full rounded-xl border border-border bg-card p-6 md:p-8">
          <Clock className="h-6 w-6 text-primary" aria-hidden="true" />
          <h2 className="mt-4 font-display text-xl text-foreground">Let op!</h2>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            In het weekend en op maandag zijn wij gesloten.
          </p>
        </div>
      </Reveal>
    </div>

    <Reveal delay={0.2}>
      <div className="mt-12 rounded-xl border border-border bg-secondary/60 p-6 md:p-8">
        <h2 className="font-display text-xl text-foreground">Vrijblijvende prijsaanvraag</h2>
        <p className="mt-2 max-w-[56ch] text-base leading-relaxed text-muted-foreground">
          Een aanvraag doet u makkelijk en vrijblijvend online via ons aanvraagformulier. U
          ontvangt van ons eerst een e-mail met de mogelijkheden en bijbehorende prijzen.
        </p>
        <Button asChild size="lg" className="mt-5 h-12 px-7 text-base">
          <Link to="/op-maat">Naar het aanvraagformulier</Link>
        </Button>
      </div>
    </Reveal>
  </div>
);

export default ContactPage;
