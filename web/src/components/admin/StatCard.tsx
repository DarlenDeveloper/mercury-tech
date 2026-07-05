import { TrendingUp, TrendingDown } from "lucide-react";
import type { Stat } from "@/lib/adminData";
import Sparkline from "./Sparkline";

export default function StatCard({ stat }: { stat: Stat }) {
  const up = stat.trend === "up";
  const color = up ? "#16a34a" : "#e11d48";

  return (
    <div
      className="rounded-2xl p-5 shadow-[0_10px_26px_-14px_rgba(16,24,40,0.22)]"
      style={{ backgroundColor: stat.tint }}
    >
      <p className="text-3xl font-extrabold tracking-tight text-ink">
        {stat.value}
      </p>
      <p className="mt-1 text-[13px] text-muted">{stat.label}</p>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            {up ? (
              <TrendingUp size={15} style={{ color }} />
            ) : (
              <TrendingDown size={15} style={{ color }} />
            )}
            <span className="text-sm font-semibold" style={{ color }}>
              {stat.delta}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-muted">{stat.period}</p>
        </div>
        <Sparkline data={stat.spark} color={color} />
      </div>
    </div>
  );
}
