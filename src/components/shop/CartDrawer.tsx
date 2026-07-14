import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { cartItemKey } from "@/lib/cart";
import { formatPrice } from "@/data/products";

const CartDrawer = () => {
  const { items, subtotal, isOpen, closeCart, setQuantity, remove } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex w-full flex-col border-border bg-card sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-xl font-normal">Winkelwagen</SheetTitle>
          <SheetDescription>
            {items.length === 0
              ? "Nog leeg. De mooiste taarten wachten op je."
              : "Controleer je selectie en rond de bestelling af."}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <p className="max-w-[26ch] text-sm text-muted-foreground">
              Bekijk de collectie en kies een taart voor jouw moment.
            </p>
            <Button asChild onClick={closeCart}>
              <Link to="/collectie">Bekijk de collectie</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="-mx-2 flex-1 space-y-1 overflow-y-auto py-2">
              {items.map((item) => {
                const key = cartItemKey(item);
                return (
                  <li key={key} className="flex gap-4 rounded-xl p-2 transition-colors hover:bg-secondary/60">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-16 shrink-0 rounded-lg object-cover"
                      loading="lazy"
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                        <button
                          type="button"
                          onClick={() => remove(key)}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                          aria-label={`${item.name} verwijderen`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.sizeLabel} ({item.serves} pers.) &middot; {item.flavor}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1 rounded-lg border border-border">
                          <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center text-foreground transition-colors hover:bg-secondary"
                            onClick={() => setQuantity(key, item.quantity - 1)}
                            aria-label="Aantal verlagen"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm tabular-nums" aria-live="polite">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center text-foreground transition-colors hover:bg-secondary"
                            onClick={() => setQuantity(key, item.quantity + 1)}
                            aria-label="Aantal verhogen"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-sm font-semibold tabular-nums text-foreground">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <SheetFooter className="mt-2 flex-col gap-3 border-t border-border pt-4 sm:flex-col">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotaal</span>
                <span className="font-semibold tabular-nums text-foreground">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Je plaatst een vrijblijvende bestelaanvraag; wij hanteren geen vaste
                besteltermijn. Je ontvangt van ons eerst een e-mail met de
                bevestiging en het afhaaltijdstip. Wij bezorgen niet.
              </p>
              <Button asChild size="lg" className="w-full" onClick={closeCart}>
                <Link to="/bestellen">Bestelling afronden</Link>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
