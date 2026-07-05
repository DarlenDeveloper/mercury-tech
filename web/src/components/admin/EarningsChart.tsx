"use client";

import { useRef, useState } from "react";
import { smoothPath } from "@/lib/svgPath";
import { EARNINGS } from "@/lib/adminData";

// viewBox geometry
const W = 820;
const H = 300;
const PAD_L = 40;
const PAD_R = 12;
const PAD_T = 16;
const PAD_B = 34;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;
const Y_MAX = 200;

const xAt = (i: number) =>
  PAD_L + (i / (EARNINGS.months.length - 1)) * PLOT_W;
const yAt = (v: number) => PAD_T + (1 - v / Y_MAX) * PLOT_H;

const firstHalfPts = EARNINGS.firstHalf.map(
  (v, i) => [xAt(i), yAt(v)] as [number, number]
);
const topGrossPts = EARNINGS.topGross.map(
  (v, i) => [xAt(i), yAt(v)] as [number, number]
);

const firstHalfPath = smoothPath(firstHalfPts);
const topGrossPath = smoothPath(topGrossPts);

export default function EarningsChart() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [active, setActive] = useState(EARNINGS.defaultIndex);

  const handleMove = (e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * W;
    const frac = (relX - PAD_L) / PLOT_W;
    const idx = Math.round(frac * (EARNINGS.months.length - 1));
    setActive(Math.max(0, Math.min(EARNINGS.months.length - 1, idx)));
  };

  const markerX = xAt(active);
  const markerY = yAt(EARNINGS.firstHalf[active]);

  return (
    <section className="admin-card p-5">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-bold text-ink">Earnings</h3>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#16a34a]" />
            First half
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-ink" />
            Top Gross
          </span>
        </div>
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          onMouseMove={handleMove}
          onMouseLeave={() => setActive(EARNINGS.defaultIndex)}
        >
          {/* Gridlines + y labels */}
          {EARNINGS.yTicks.map((t) => {
            const y = yAt(t);
            return (
              <g key={t}>
                <line
                  x1={PAD_L}
                  x2={W - PAD_R}
                  y1={y}
                  y2={y}
                  stroke="#eceef2"
                  strokeDasharray="4 6"
                />
                <text
                  x={PAD_L - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#9ca3af"
                >
                  {t}
                </text>
              </g>
            );
          })}

          {/* x labels */}
          {EARNINGS.months.map((m, i) => (
            <text
              key={m + i}
              x={xAt(i)}
              y={H - 10}
              textAnchor="middle"
              fontSize="11"
              fill={i === active ? "#1f2937" : "#9ca3af"}
              fontWeight={i === active ? 700 : 400}
            >
              {m}
            </text>
          ))}

          {/* Series */}
          <path
            d={topGrossPath}
            fill="none"
            stroke="#111827"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={firstHalfPath}
            fill="none"
            stroke="#22c55e"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active marker */}
          <line
            x1={markerX}
            x2={markerX}
            y1={PAD_T}
            y2={H - PAD_B}
            stroke="#c7cbd3"
            strokeDasharray="4 5"
          />
          <circle cx={markerX} cy={markerY} r={6} fill="#111827" />
          <circle cx={markerX} cy={markerY} r={11} fill="#111827" opacity={0.12} />
        </svg>

        {/* Tooltip (HTML overlay for crisp text) */}
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl bg-ink px-3 py-2 text-white shadow-lg"
          style={{
            left: `${(markerX / W) * 100}%`,
            top: `${(markerY / H) * 100}%`,
            marginTop: -14,
          }}
        >
          <p className="text-sm font-bold leading-none">
            {EARNINGS.amounts[active]}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-wide text-white/60">
            {EARNINGS.months[active]} 2024
          </p>
        </div>
      </div>
    </section>
  );
}
