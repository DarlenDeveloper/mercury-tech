"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type CurrencyCode = "USh" | "USD" | "EUR" | "GBP" | "KES";

type CurrencyInfo = {
  code: CurrencyCode;
  symbol: string;
  rate: number; // rate relative to UGX (how many UGX = 1 unit)
};

const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USh: { code: "USh", symbol: "USh", rate: 1 },
  USD: { code: "USD", symbol: "$", rate: 3780 },
  EUR: { code: "EUR", symbol: "€", rate: 4100 },
  GBP: { code: "GBP", symbol: "£", rate: 4750 },
  KES: { code: "KES", symbol: "KSh", rate: 29 },
};

type CurrencyCtx = {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  /** Format a UGX amount into the selected currency. */
  format: (ugx: number) => string;
  /** Convert UGX to selected currency (raw number). */
  convert: (ugx: number) => number;
};

const CurrencyContext = createContext<CurrencyCtx>({
  currency: "USh",
  setCurrency: () => {},
  format: (ugx) => `USh ${ugx.toLocaleString("en-UG")}`,
  convert: (ugx) => ugx,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>("USh");

  const convert = (ugx: number): number => {
    const info = CURRENCIES[currency];
    if (info.rate === 1) return ugx;
    return Math.round((ugx / info.rate) * 100) / 100;
  };

  const format = (ugx: number): string => {
    const info = CURRENCIES[currency];
    if (info.rate === 1) {
      return `USh ${ugx.toLocaleString("en-UG")}`;
    }
    const converted = convert(ugx);
    return `${info.symbol}${converted.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

export { CURRENCIES };
