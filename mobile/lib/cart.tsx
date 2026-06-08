import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "healteen-cart";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  currency: string;
  image?: string;
  quantity: number;
}

type CartContextValue = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  totalItems: number;
  totalCents: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const loaded = useRef(false);

  // Load persisted cart once on mount.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            setItems(JSON.parse(raw) as CartItem[]);
          } catch {
            /* ignore corrupt cart */
          }
        }
      })
      .finally(() => {
        loaded.current = true;
      });
  }, []);

  // Persist on change (after the initial load).
  useEffect(() => {
    if (loaded.current) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add: CartContextValue["add"] = (item, qty = 1) =>
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });

  const remove: CartContextValue["remove"] = (productId) =>
    setItems((prev) => prev.filter((i) => i.productId !== productId));

  const setQty: CartContextValue["setQty"] = (productId, qty) =>
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))
    );

  const clear = () => setItems([]);

  const totalItems = items.reduce((n, i) => n + i.quantity, 0);
  const totalCents = items.reduce((n, i) => n + i.priceCents * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, add, remove, setQty, clear, totalItems, totalCents }}
    >
      {children}
    </CartContext.Provider>
  );
}
