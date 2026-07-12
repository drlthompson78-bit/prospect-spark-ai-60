import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/shop/Reveal";
import { atelierHands } from "@/data/assets";

/** Over ons, met de originele tekst van hettaartenhuis.nl/over-ons. */
const OverOnsPage = () => (
  <div className="mx-auto max-w-[1400px] px-5 pb-24 pt-28 md:px-8 md:pt-36">
    <Reveal>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Over ons</p>
      <h1 className="mt-4 max-w-[24ch] font-display text-4xl leading-tight tracking-tight text-foreground md:text-6xl">
        Het Taartenhuis, al decennia een begrip in bijzondere taarten
      </h1>
    </Reveal>

    <div className="mt-12 grid gap-12 lg:grid-cols-[7fr_5fr] lg:gap-16">
      <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
        <Reveal>
          <p>
            Bij Het Taartenhuis draait alles om creativiteit, kwaliteit en passie. Esther van
            den Handel richtte Het Taartenhuis op in 2005, gedreven door haar liefde voor het
            maken van bijzondere taarten. Wat begon met een passie, groeide al snel uit tot een
            begrip in heel Nederland. Diezelfde passie drijft nog altijd het dynamische team
            achter Het Taartenhuis en dat zie je terug in elke taart die onze bakkerij verlaat.
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <p>
            We vonden destijds dat er al genoeg bedrijven waren die de &lsquo;simpele
            slagroomtaart&rsquo; door heel Nederland bezorgden. Dat kon creatiever! Esther
            wilde iets unieks neerzetten: op maat gemaakte taarten, afgestemd op het moment en
            de persoon en met een persoonlijke touch.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <p>
            Sindsdien hebben we duizenden taarten mogen maken voor verjaardagen, jubilea,
            bruiloften, bedrijfsfeesten, productlanceringen, klantbedankjes en zelfs als
            goedmaker. Met de tijd zijn we meegegroeid: we bieden onze taarten online aan,
            zodat bestellen snel en eenvoudig is geworden.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <h2 className="pt-4 font-display text-2xl tracking-tight text-foreground">
            Bijzondere taarten, met liefde en vakmanschap gemaakt
          </h2>
          <p className="mt-3">
            Het Taartenhuis is geen overkoepelende organisatie of keten. Wij maken alle taarten
            in eigen beheer, vanuit onze eigen bakkerij. Ambachtelijk bereid, altijd dagvers en
            volledig afgestemd op uw wensen. Onze foto&apos;s laten slechts een greep zien uit
            wat mogelijk is, maar we denken altijd met u mee om een taart te maken die écht
            indruk maakt.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <h2 className="pt-4 font-display text-2xl tracking-tight text-foreground">
            Afhalen in plaats van bezorgen
          </h2>
          <p className="mt-3">
            Helaas is er in de loop der jaren veel veranderd. De coronaperiode heeft zijn
            sporen nagelaten en de sterk gestegen kosten voor grondstoffen, verpakkingen,
            energie en brandstof hebben ons doen besluiten om onze bezorgservice te stoppen.
            Met succes bieden wij inmiddels al enkele jaren de mogelijkheid om uw taart op te
            halen in Rotterdam, een praktische en geliefde oplossing.
          </p>
        </Reveal>
        <Reveal delay={0.25}>
          <h2 className="pt-4 font-display text-2xl tracking-tight text-foreground">Ook voor bedrijven</h2>
          <p className="mt-3">
            Sinds 2005 zijn wij voor diverse bedrijven in heel Nederland de vaste
            taartenspecialist. Voor grote groepen draaien wij onze hand niet om. Of het nu gaat
            om een feest op kantoor, een productintroductie of een origineel relatiegeschenk:
            wij leveren maatwerk met smaak en uitstraling.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <h2 className="pt-4 font-display text-2xl tracking-tight text-foreground">
            Laat u inspireren en neem gerust contact op
          </h2>
          <p className="mt-3">
            Heeft u een idee of een bijzonder moment waarvoor u een unieke taart zoekt? Aarzel
            niet om contact op te nemen. Wij denken graag met u mee, want geen feest is
            compleet zonder een taart van Het Taartenhuis.
          </p>
          <p className="mt-5">
            Een zoete groet,
            <br />
            <span className="font-display text-lg text-foreground">Team Het Taartenhuis</span>
            <br />
            Esther van den Handel (founder)
          </p>
        </Reveal>
        <Reveal delay={0.35}>
          <div className="flex flex-wrap gap-4 pt-2">
            <Button asChild size="lg" className="h-12 px-7 text-base">
              <Link to="/onze-taarten">Laat u inspireren</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base">
              <Link to="/contact">Neem contact op</Link>
            </Button>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <div className="overflow-hidden rounded-xl">
          <img
            src={atelierHands}
            alt="Handen van een patissier die roosjes van crème op een taart spuit"
            loading="lazy"
            className="aspect-[4/5] w-full object-cover"
          />
        </div>
      </Reveal>
    </div>
  </div>
);

export default OverOnsPage;
