import { TrendingUp, TrendingDown } from "lucide-react";
import { TOP_COUNTRIES } from "@/lib/adminData";

export default function TopCountries() {
  return (
    <section className="admin-card p-5">
      <h3 className="text-[15px] font-bold text-ink">Top Countries by Sells</h3>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-extrabold tracking-tight text-ink">
          {TOP_COUNTRIES.total}
        </span>
        <span className="text-[11px] text-muted">{TOP_COUNTRIES.note}</span>
      </div>

      <ul className="mt-4 flex flex-col gap-3.5">
        {TOP_COUNTRIES.items.map((c) => {
          const up = c.trend === "up";
          const color = up ? "#16a34a" : "#e11d48";
          return (
            <li key={c.name} className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-soft text-lg leading-none">
                {c.flag}
              </span>
              <span className="flex-1 text-sm font-medium text-ink">
                {c.name}
              </span>
              {up ? (
                <TrendingUp size={15} style={{ color }} />
              ) : (
                <TrendingDown size={15} style={{ color }} />
              )}
              <span className="w-14 text-right text-sm font-semibold text-ink">
                {c.value}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
