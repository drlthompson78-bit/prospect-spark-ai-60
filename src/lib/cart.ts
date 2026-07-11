export interface CartItem {
  productSlug: string;
  name: string;
  image: string;
  sizeId: string;
  sizeLabel: string;
  serves: number;
  flavor: string;
  unitPrice: number;
  quantity: number;
}

export const cartItemKey = (item: Pick<CartItem, "productSlug" | "sizeId" | "flavor">) =>
  `${item.productSlug}::${item.sizeId}::${item.flavor}`;

export const addItem = (items: CartItem[], item: CartItem): CartItem[] => {
  const key = cartItemKey(item);
  const existing = items.find((i) => cartItemKey(i) === key);
  if (existing) {
    return items.map((i) =>
      cartItemKey(i) === key ? { ...i, quantity: i.quantity + item.quantity } : i
    );
  }
  return [...items, item];
};

export const updateQuantity = (items: CartItem[], key: string, quantity: number): CartItem[] => {
  if (quantity <= 0) return items.filter((i) => cartItemKey(i) !== key);
  return items.map((i) => (cartItemKey(i) === key ? { ...i, quantity } : i));
};

export const removeItem = (items: CartItem[], key: string): CartItem[] =>
  items.filter((i) => cartItemKey(i) !== key);

export const cartSubtotal = (items: CartItem[]): number =>
  items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

export const cartCount = (items: CartItem[]): number =>
  items.reduce((sum, i) => sum + i.quantity, 0);
