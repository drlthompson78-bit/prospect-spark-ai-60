import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/data/products";
import type { CartItem } from "@/lib/cart";

interface StoredOrder {
  orderNumber: string;
  values: { name: string; email: string; date: string; fulfilment: string };
  items: CartItem[];
  subtotal: number;
}

const ThanksPage = () => {
  const [order, setOrder] = useState<StoredOrder | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("taartenhuis-last-order");
      if (raw) setOrder(JSON.parse(raw) as StoredOrder);
    } catch {
      setOrder(null);
    }
  }, []);

  return (
    <div className="mx-auto max-w-[760px] px-5 pb-24 pt-28 md:px-8 md:pt-40">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Aanvraag ontvangen</p>
      <h1 className="mt-4 font-display text-4xl leading-tight tracking-tight text-foreground md:text-5xl">
        Dankjewel{order ? `, ${order.values.name.split(" ")[0]}` : ""}. Wij gaan voor je aan de slag.
      </h1>
      <p className="mt-6 max-w-[56ch] text-base leading-relaxed text-muted-foreground">
        Je bestelaanvraag is binnen. Binnen 24 uur ontvang je per e-mail onze bevestiging met
        de definitieve prijs, betaalinformatie en het {order?.values.fulfilment === "bezorgen" ? "bezorgmoment" : "ophaalmoment"}.
        Pas na jouw akkoord is de bestelling definitief.
      </p>

      {order && (
        <div className="mt-10 rounded-xl border border-border bg-card p-6 md:p-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Referentie</p>
            <p className="font-mono text-sm text-foreground">{order.orderNumber}</p>
          </div>
          <ul className="mt-5 space-y-3 border-t border-border pt-5">
            {order.items.map((item, i) => (
              <li key={i} className="flex items-baseline justify-between gap-4 text-sm">
                <span className="text-foreground">
                  {item.quantity}&times; {item.name} ({item.sizeLabel})
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
            <span className="text-muted-foreground">Richtprijs</span>
            <span className="font-semibold tabular-nums text-foreground">{formatPrice(order.subtotal)}</span>
          </div>
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-4">
        <Button asChild size="lg">
          <Link to="/collectie">Verder kijken</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/">Naar de homepagina</Link>
        </Button>
      </div>
    </div>
  );
};

export default ThanksPage;
