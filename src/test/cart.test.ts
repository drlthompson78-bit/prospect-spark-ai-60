import { describe, it, expect } from "vitest";
import {
  addItem,
  cartCount,
  cartItemKey,
  cartSubtotal,
  removeItem,
  updateQuantity,
  type CartItem,
} from "@/lib/cart";

const item = (overrides: Partial<CartItem> = {}): CartItem => ({
  productSlug: "verjaardagstaart-sparkle",
  name: "Verjaardagstaart Sparkle",
  image: "img.webp",
  sizeId: "m",
  sizeLabel: "Middel",
  serves: 12,
  flavor: "Vanille met verse aardbeien",
  unitPrice: 59,
  quantity: 1,
  ...overrides,
});

describe("cart", () => {
  it("adds a new item", () => {
    const items = addItem([], item());
    expect(items).toHaveLength(1);
    expect(cartCount(items)).toBe(1);
  });

  it("merges identical product, size and flavor", () => {
    const items = addItem(addItem([], item()), item({ quantity: 2 }));
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
  });

  it("keeps different sizes as separate lines", () => {
    const items = addItem(addItem([], item()), item({ sizeId: "l", sizeLabel: "Groot" }));
    expect(items).toHaveLength(2);
  });

  it("updates quantity and removes at zero", () => {
    const base = addItem([], item());
    const key = cartItemKey(base[0]);
    expect(updateQuantity(base, key, 4)[0].quantity).toBe(4);
    expect(updateQuantity(base, key, 0)).toHaveLength(0);
  });

  it("removes an item by key", () => {
    const base = addItem([], item());
    expect(removeItem(base, cartItemKey(base[0]))).toHaveLength(0);
  });

  it("computes the subtotal", () => {
    const items = addItem(addItem([], item({ quantity: 2 })), item({ sizeId: "l", unitPrice: 74 }));
    expect(cartSubtotal(items)).toBe(59 * 2 + 74);
  });
});
