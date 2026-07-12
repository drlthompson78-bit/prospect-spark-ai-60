import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/context/CartContext";
import { cartItemKey } from "@/lib/cart";
import { formatPrice } from "@/data/products";
import { cn } from "@/lib/utils";

const minDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().split("T")[0];
};

const schema = z.object({
  name: z.string().min(2, "Vul je naam in"),
  email: z.string().email("Vul een geldig e-mailadres in"),
  phone: z.string().min(10, "Vul een geldig telefoonnummer in"),
  date: z.string().refine((v) => v >= minDate(), "Kies een datum minimaal 3 dagen vooruit"),
  notes: z.string().max(600).optional(),
});

type FormValues = z.infer<typeof schema>;

const CheckoutPage = () => {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (values: FormValues) => {
    const orderNumber = `TH-${Date.now().toString(36).toUpperCase()}`;
    // In een echte koppeling gaat dit naar de backend; hier bewaren we de
    // aanvraag lokaal zodat de bevestigingspagina hem kan tonen.
    sessionStorage.setItem(
      "taartenhuis-last-order",
      JSON.stringify({ orderNumber, values, items, subtotal })
    );
    clear();
    navigate("/bedankt");
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-[1400px] flex-col items-start px-5 pb-24 pt-28 md:px-8 md:pt-36">
        <h1 className="font-display text-4xl tracking-tight text-foreground md:text-5xl">Bestellen</h1>
        <p className="mt-4 text-base text-muted-foreground">Je winkelwagen is nog leeg.</p>
        <Button asChild size="lg" className="mt-8">
          <Link to="/collectie">Bekijk de collectie</Link>
        </Button>
      </div>
    );
  }

  const field = (error?: { message?: string }) =>
    cn(
      "mt-2 w-full rounded-xl border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
      error ? "border-destructive" : "border-border"
    );

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-24 pt-28 md:px-8 md:pt-36">
      <h1 className="font-display text-4xl tracking-tight text-foreground md:text-5xl">Bestellen</h1>
      <p className="mt-4 max-w-[56ch] text-base leading-relaxed text-muted-foreground">
        Je plaatst een vrijblijvende bestelaanvraag. Binnen 24 uur ontvang je per e-mail onze
        bevestiging met betaalinformatie en het ophaal- of bezorgmoment.
      </p>

      <div className="mt-12 grid gap-12 lg:grid-cols-[7fr_5fr] lg:gap-16">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="text-sm font-semibold text-foreground">
                Naam
              </label>
              <Input id="name" autoComplete="name" className={field(errors.name)} {...register("name")} />
              {errors.name && <p className="mt-1.5 text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="text-sm font-semibold text-foreground">
                Telefoon
              </label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                className={field(errors.phone)}
                {...register("phone")}
              />
              {errors.phone && <p className="mt-1.5 text-sm text-destructive">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-semibold text-foreground">
              E-mailadres
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className={field(errors.email)}
              {...register("email")}
            />
            {errors.email && <p className="mt-1.5 text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="date" className="text-sm font-semibold text-foreground">
                Wanneer heb je de taart nodig?
              </label>
              <Input id="date" type="date" min={minDate()} className={field(errors.date)} {...register("date")} />
              {errors.date && <p className="mt-1.5 text-sm text-destructive">{errors.date.message}</p>}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Ophalen</p>
              {/* De site bezorgt niet: ophalen di t/m za op afspraak in Rotterdam */}
              <p className="mt-2 rounded-xl border border-border bg-secondary/60 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                De taart haal je op bij een collega in Rotterdam, van dinsdag t/m zaterdag en
                alleen op afspraak. Makkelijk bereikbaar, met parkeergelegenheid voor de deur.
                Wij bezorgen niet.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="text-sm font-semibold text-foreground">
              Wensen of opmerkingen
            </label>
            <Textarea
              id="notes"
              rows={4}
              placeholder="Bijvoorbeeld een tekst op de taart, kleuren of een thema"
              className={field(errors.notes)}
              {...register("notes")}
            />
          </div>

          <Button type="submit" size="lg" disabled={isSubmitting} className="h-12 w-full text-base active:scale-[0.98] sm:w-auto sm:px-10">
            Bestelaanvraag versturen
          </Button>
        </form>

        <aside className="h-fit rounded-xl border border-border bg-card p-6 md:p-8">
          <h2 className="font-display text-xl text-foreground">Jouw bestelling</h2>
          <ul className="mt-6 space-y-5">
            {items.map((item) => (
              <li key={cartItemKey(item)} className="flex gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="h-16 w-14 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {item.quantity}&times; {item.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.sizeLabel} ({item.serves} pers.) &middot; {item.flavor}
                  </p>
                </div>
                <p className="shrink-0 text-sm tabular-nums text-foreground">
                  {formatPrice(item.unitPrice * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Subtotaal</span>
            <span className="font-semibold tabular-nums text-foreground">{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Betaling volgt na onze bevestiging per e-mail. Je zit dus nog nergens aan vast.
          </p>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
