/** Letterlijk de "Soorten"-lijst van hettaartenhuis.nl/onze-taarten. */
const items = [
  "Bruidstaart",
  "Kindertaart",
  "Cijfertaart",
  "Babyshower taart",
  "Gender Reveal taarten",
  "Cupcakes",
  "Bedrijfstaart",
  "Geboortetaart",
  "Lagentaart",
  "Verjaardagstaart",
];

type Props = {
  /** Kantel het lint licht, zoals de filmische linten in de referentie. */
  angle?: number;
  /** Draai de looprichting om zodat twee linten elkaar kruisen. */
  reverse?: boolean;
};

/**
 * Doorlopend lint met de taartcategorieën van Het Taartenhuis.
 * De inhoud staat er twee keer in zodat de CSS-loop naadloos rondgaat;
 * bij reduced motion staat het lint stil.
 */
const Marquee = ({ angle = -2, reverse = false }: Props) => {
  const row = [...items, ...items];
  return (
    <div className="relative -my-4 overflow-hidden py-4" aria-hidden="true">
      <div
        style={{ transform: `rotate(${angle}deg) scale(1.02)` }}
        className="border-y border-border bg-secondary/60 backdrop-blur-sm"
      >
        <div className={`marquee-track flex w-max items-center gap-8 py-3 ${reverse ? "marquee-reverse" : ""}`}>
          {row.map((item, i) => (
            <span key={`${item}-${i}`} className="flex items-center gap-8 whitespace-nowrap">
              <span className="text-sm uppercase tracking-[0.25em] text-muted-foreground">{item}</span>
              <span className="text-primary">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marquee;
