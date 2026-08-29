"use client";

import { create } from "zustand";

export interface CartAddon {
  addon_id: string;
  name: string;
  price: number;
  quantity: number;
}

interface BookingCartState {
  tourDate: string;
  numPeople: number;
  addons: CartAddon[];
  setTourDate: (date: string) => void;
  setNumPeople: (value: number) => void;
  addAddon: (addon: { addon_id: string; name: string; price: number }) => void;
  removeAddon: (addonId: string) => void;
  setAddonQuantity: (addonId: string, quantity: number) => void;
}

/**
 * Shared checkout cart for a single tour booking. Tracks the selected date,
 * number of travellers, and optional add-ons (PRD §4.2 / SOP add-ons cart).
 */
export const useBookingCart = create<BookingCartState>((set) => ({
  tourDate: "",
  numPeople: 1,
  addons: [],
  setTourDate: (tourDate) => set({ tourDate }),
  setNumPeople: (numPeople) =>
    set({ numPeople: Math.max(1, numPeople) }),
  addAddon: (addon) =>
    set((state) => {
      const existing = state.addons.find((a) => a.addon_id === addon.addon_id);
      if (existing) {
        return {
          addons: state.addons.map((a) =>
            a.addon_id === addon.addon_id
              ? { ...a, quantity: a.quantity + 1 }
              : a,
          ),
        };
      }
      return {
        addons: [...state.addons, { ...addon, quantity: 1 }],
      };
    }),
  removeAddon: (addonId) =>
    set((state) => ({
      addons: state.addons.filter((a) => a.addon_id !== addonId),
    })),
  setAddonQuantity: (addonId, quantity) =>
    set((state) => {
      const next = Math.max(0, quantity);
      return {
        addons:
          next === 0
            ? state.addons.filter((a) => a.addon_id !== addonId)
            : state.addons.map((a) =>
                a.addon_id === addonId ? { ...a, quantity: next } : a,
              ),
      };
    }),
}));

