import { CURRENCY_SYMBOLS, type Currency } from "@/core/constants/currencies";

export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  return `${symbol}${amount.toFixed(2)}`;
}
