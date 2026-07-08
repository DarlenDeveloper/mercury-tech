"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Check } from "lucide-react";
import { USD_RATE } from "@/lib/adminData";

export default function UsdRateBar({
  rate,
  prevRate,
  onApply,
}: {
  rate: number;
  prevRate: number;
  onApply: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(rate));
  const [updatedAt, setUpdatedAt] = useState(USD_RATE.updated);

  const diff = rate - prevRate;
  const up = diff >= 0;
  const pct = prevRate ? ((diff / prevRate) * 100).toFixed(2) : "0.00";
  const color = up ? "#16a34a" : "#e11d48";

  const apply = () => {
    const n = Number(draft.replace(/[,\s]/g, ""));
    if (!Number.isFinite(n) || n <= 0) return;
    onApply(n);
    setDraft(String(n));
    setUpdatedAt("just now");
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-white p-4">
      {/* Current rate */}
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint text-[#16a34a]">
          <DollarSign size={20} />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            {USD_RATE.pair} · Manual rate
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-ink">
              1 USD = {rate.toLocaleString()} UGX
            </span>
            {diff !== 0 && (
              <span
                className="flex items-center gap-0.5 text-xs font-semibold"
                style={{ color }}
              >
                {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {up ? "+" : ""}
                {pct}%
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-muted">
            All product prices are set in USD · Updated {updatedAt}
          </p>
        </div>
      </div>

      {/* Editable form */}
      <div className="flex items-end gap-2">
        <label className="flex flex-col">
          <span className="text-[11px] font-medium text-muted">
            Set rate (UGX per 1 USD)
          </span>
          <div className="mt-1 flex items-center rounded-xl border border-line bg-surface-soft px-3 transition focus-within:border-mercury focus-within:bg-white">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && apply()}
              inputMode="numeric"
              className="h-10 w-28 bg-transparent text-sm font-semibold text-ink outline-none"
              placeholder="0"
            />
            <span className="text-xs font-medium text-muted">UGX</span>
          </div>
        </label>
        <button
          onClick={apply}
          className="flex h-10 items-center gap-1.5 rounded-xl bg-ink px-4 text-sm font-semibold text-white transition hover:bg-black"
        >
          <Check size={15} />
          Update
        </button>
      </div>
    </div>
  );
}
