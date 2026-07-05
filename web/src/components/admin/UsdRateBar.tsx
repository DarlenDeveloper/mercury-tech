import { TrendingUp, TrendingDown, RefreshCw, DollarSign } from "lucide-react";
import { USD_RATE } from "@/lib/adminData";

export default function UsdRateBar() {
  const diff = USD_RATE.value - USD_RATE.prev;
  const up = diff >= 0;
  const pct = ((diff / USD_RATE.prev) * 100).toFixed(2);
  const color = up ? "#16a34a" : "#e11d48";

  return (
    <div className="admin-card flex flex-wrap items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint text-[#16a34a]">
          <DollarSign size={20} />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            {USD_RATE.pair}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-ink">
              1 USD = {USD_RATE.value.toLocaleString()} UGX
            </span>
            <span
              className="flex items-center gap-0.5 text-xs font-semibold"
              style={{ color }}
            >
              {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {up ? "+" : ""}
              {pct}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <p className="hidden text-xs text-muted sm:block">
          All product prices are set in USD · Last updated {USD_RATE.updated}
        </p>
        <button className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-medium text-ink shadow-sm transition hover:text-mercury">
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>
    </div>
  );
}
