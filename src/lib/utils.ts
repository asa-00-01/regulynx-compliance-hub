
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string): string {
  const currencyConfig: Record<string, { locale: string, symbol: string }> = {
    'USD': { locale: 'en-US', symbol: '$' },
    'EUR': { locale: 'de-DE', symbol: '€' },
    'GBP': { locale: 'en-GB', symbol: '£' },
    'SEK': { locale: 'sv-SE', symbol: 'kr' },
  };

  const config = currencyConfig[currency] || { locale: 'en-US', symbol: currency };

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
