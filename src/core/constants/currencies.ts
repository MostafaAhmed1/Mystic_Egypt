// Centralized currency constants (mirrors Prisma Currency enum).
export const CURRENCIES = {
  USD: "USD",
  GBP: "GBP",
  EUR: "EUR",
} as const;

export type Currency = (typeof CURRENCIES)[keyof typeof CURRENCIES];

// Display currency for a given ISO code (symbol).
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  GBP: "£",
  EUR: "€",
};
