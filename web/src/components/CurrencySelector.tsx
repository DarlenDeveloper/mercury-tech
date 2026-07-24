"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useCurrency } from "@/components/CurrencyProvider";

export default function CurrencySelector({ light = false }: { light?: boolean }) {
  const [open, setOpen] = useState(false);
  const { currency, setCurrency } = useCurrency();
  const ref = useRef<HTMLDivElement>(null);

  const currencies = [
    { code: "USh" as const, label: "UGX", flag: <FlagUG /> },
    { code: "USD" as const, label: "USD", flag: <FlagUS /> },
    { code: "EUR" as const, label: "EUR", flag: <FlagEU /> },
    { code: "GBP" as const, label: "GBP", flag: <FlagGB /> },
    { code: "KES" as const, label: "KES", flag: <FlagKE /> },
    { code: "RWF" as const, label: "RWF", flag: <FlagRW /> },
  ];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 text-[12px] font-medium transition ${
          light ? "text-white/90 hover:text-white" : "text-ink hover:text-mercury"
        }`}
      >
        {currencies.find((c) => c.code === currency)?.flag}
        {currency === "USh" ? "UGX" : currency}
        <ChevronDown size={13} className={light ? "text-white/70" : "text-muted"} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-50 w-44 rounded-xl border border-line bg-white p-1.5 shadow-lg">
          {currencies.map((c) => (
            <button
              key={c.code}
              onClick={() => { setCurrency(c.code); setOpen(false); }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition hover:bg-surface-soft ${
                currency === c.code ? "font-semibold text-mercury" : "text-ink"
              }`}
            >
              {c.flag}
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SVG Flag Icons ──────────────────────────────────────────────────────────

function FlagWrap({ children }: { children: React.ReactNode }) {
  return <svg width="20" height="14" viewBox="0 0 20 14" className="shrink-0 rounded-[2px] overflow-hidden">{children}</svg>;
}
function FlagUG() {
  return <FlagWrap><rect width="20" height="2.33" fill="#000"/><rect y="2.33" width="20" height="2.33" fill="#FCDC04"/><rect y="4.67" width="20" height="2.33" fill="#D90000"/><rect y="7" width="20" height="2.33" fill="#000"/><rect y="9.33" width="20" height="2.33" fill="#FCDC04"/><rect y="11.67" width="20" height="2.33" fill="#D90000"/><circle cx="10" cy="7" r="3" fill="#fff"/></FlagWrap>;
}
function FlagUS() {
  return <FlagWrap><rect width="20" height="14" fill="#B22234"/><rect y="1.08" width="20" height="1.08" fill="#fff"/><rect y="3.23" width="20" height="1.08" fill="#fff"/><rect y="5.38" width="20" height="1.08" fill="#fff"/><rect y="7.54" width="20" height="1.08" fill="#fff"/><rect y="9.69" width="20" height="1.08" fill="#fff"/><rect y="11.85" width="20" height="1.08" fill="#fff"/><rect width="8" height="7.54" fill="#3C3B6E"/></FlagWrap>;
}
function FlagEU() {
  return <FlagWrap><rect width="20" height="14" fill="#003399"/><circle cx="10" cy="7" r="3.5" fill="none" stroke="#FFCC00" strokeWidth="0.8"/></FlagWrap>;
}
function FlagGB() {
  return <FlagWrap><rect width="20" height="14" fill="#012169"/><path d="M0 0L20 14M20 0L0 14" stroke="#fff" strokeWidth="2.5"/><path d="M0 0L20 14M20 0L0 14" stroke="#C8102E" strokeWidth="1.5"/><path d="M10 0V14M0 7H20" stroke="#fff" strokeWidth="4"/><path d="M10 0V14M0 7H20" stroke="#C8102E" strokeWidth="2.5"/></FlagWrap>;
}
function FlagKE() {
  return <FlagWrap><rect width="20" height="4.67" fill="#000"/><rect y="4.67" width="20" height="1" fill="#fff"/><rect y="5.67" width="20" height="3.67" fill="#BB0000"/><rect y="9.33" width="20" height="1" fill="#fff"/><rect y="10.33" width="20" height="3.67" fill="#006600"/></FlagWrap>;
}
function FlagRW() {
  return <FlagWrap><rect width="20" height="7" fill="#00A1DE"/><rect y="7" width="20" height="3.5" fill="#FAD201"/><rect y="10.5" width="20" height="3.5" fill="#20603D"/></FlagWrap>;
}
