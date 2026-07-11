import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  addItem,
  cartCount,
  cartSubtotal,
  removeItem,
  updateQuantity,
  type CartItem,
} from "@/lib/cart";

const STORAGE_KEY = "taartenhuis-cart";

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (item: CartItem) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const loadCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(loadCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // opslag niet beschikbaar (private mode); winkelwagen blijft in memory
    }
  }, [items]);

  const add = useCallback((item: CartItem) => {
    setItems((prev) => addItem(prev, item));
    setIsOpen(true);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: cartCount(items),
      subtotal: cartSubtotal(items),
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      add,
      setQuantity: (key, quantity) => setItems((prev) => updateQuantity(prev, key, quantity)),
      remove: (key) => setItems((prev) => removeItem(prev, key)),
      clear: () => setItems([]),
    }),
    [items, isOpen, add]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart moet binnen CartProvider gebruikt worden");
  return ctx;
};
