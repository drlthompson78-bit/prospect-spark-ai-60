import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Reveal from "@/components/shop/Reveal";
import { atelierHands } from "@/data/assets";
import { cn } from "@/lib/utils";

const minDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
};

const schema = z.object({
  name: z.string().min(2, "Vul je naam in"),
  email: z.string().email("Vul een geldig e-mailadres in"),
  phone: z.string().min(10, "Vul een geldig telefoonnummer in"),
  occasion: z.string().min(2, "Vertel voor welke gelegenheid de taart is"),
  persons: z.coerce.number().min(4, "Minimaal 4 personen").max(500, "Neem voor grote events even contact op"),
  date: z.string().refine((v) => v >= minDate(), "Voor maatwerk vragen we minimaal 7 dagen"),
  idea: z.string().min(20, "Beschrijf je idee in minstens een paar zinnen"),
});

type FormValues = z.infer<typeof schema>;

const CustomPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    const orderNumber = `TH-${Date.now().toString(36).toUpperCase()}`;
    sessionStorage.setItem(
      "taartenhuis-last-order",
      JSON.stringify({
        orderNumber,
        values: { ...values, fulfilment: "ophalen" },
        items: [],
        subtotal: 0,
      })
    );
    navigate("/bedankt");
  };

  const field = (error?: { message?: string }) =>
    cn(
      "mt-2 w-full rounded-xl border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
      error ? "border-destructive" : "border-border"
    );

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-24 pt-28 md:px-8 md:pt-36">
      <div className="grid gap-12 lg:grid-cols-[6fr_5fr] lg:gap-20">
        <div>
          <Reveal>
            <h1 className="font-display text-4xl tracking-tight text-foreground md:text-6xl">
              Taart op maat
            </h1>
            <p className="mt-5 max-w-[56ch] text-base leading-relaxed text-muted-foreground">
              Via onderstaand aanvraagformulier kunt u eenvoudig een prijsopgave aanvragen.
              Vermeld bij de opmerkingen eventuele specifieke wensen of de naam van de taart
              (als het om een voorbeeld van onze website gaat), en vergeet niet aan te geven
              voor hoeveel personen de taart bedoeld is.
            </p>
          </Reveal>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-10 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="text-sm font-semibold text-foreground">Naam</label>
                <Input id="name" autoComplete="name" className={field(errors.name)} {...register("name")} />
                {errors.name && <p className="mt-1.5 text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div>
                <label htmlFor="phone" className="text-sm font-semibold text-foreground">Telefoon</label>
                <Input id="phone" type="tel" autoComplete="tel" className={field(errors.phone)} {...register("phone")} />
                {errors.phone && <p className="mt-1.5 text-sm text-destructive">{errors.phone.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-semibold text-foreground">E-mailadres</label>
              <Input id="email" type="email" autoComplete="email" className={field(errors.email)} {...register("email")} />
              {errors.email && <p className="mt-1.5 text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <label htmlFor="occasion" className="text-sm font-semibold text-foreground">Gelegenheid</label>
                <Input id="occasion" placeholder="Bruiloft, jubileum..." className={field(errors.occasion)} {...register("occasion")} />
                {errors.occasion && <p className="mt-1.5 text-sm text-destructive">{errors.occasion.message}</p>}
              </div>
              <div>
                <label htmlFor="persons" className="text-sm font-semibold text-foreground">Aantal personen</label>
                <Input id="persons" type="number" min={4} className={field(errors.persons)} {...register("persons")} />
                {errors.persons && <p className="mt-1.5 text-sm text-destructive">{errors.persons.message}</p>}
              </div>
              <div>
                <label htmlFor="date" className="text-sm font-semibold text-foreground">Datum</label>
                <Input id="date" type="date" min={minDate()} className={field(errors.date)} {...register("date")} />
                {errors.date && <p className="mt-1.5 text-sm text-destructive">{errors.date.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="idea" className="text-sm font-semibold text-foreground">Jouw idee</label>
              <Textarea
                id="idea"
                rows={6}
                placeholder="Beschrijf het ontwerp, thema, kleuren en smaken die je voor je ziet"
                className={field(errors.idea)}
                {...register("idea")}
              />
              {errors.idea && <p className="mt-1.5 text-sm text-destructive">{errors.idea.message}</p>}
            </div>

            <Button type="submit" size="lg" disabled={isSubmitting} className="h-12 w-full text-base active:scale-[0.98] sm:w-auto sm:px-10">
              Aanvraag versturen
            </Button>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Vrijblijvend: je ontvangt eerst de mogelijkheden en prijzen per e-mail.
              Pas na jouw akkoord is de bestelling definitief.
            </p>
          </form>
        </div>

        <Reveal className="hidden lg:block">
          <div className="sticky top-28 overflow-hidden rounded-xl">
            <img
              src={atelierHands}
              alt="Patissier werkt met een spuitzak aan een taart in het atelier"
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default CustomPage;
