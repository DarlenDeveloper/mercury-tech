"use client";

import { useRef, useState } from "react";
import { smoothPath } from "@/lib/svgPath";

const W = 820;
const H = 260;
const PAD_L = 40;
const PAD_R = 12;
const PAD_T = 16;
const PAD_B = 30;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

export default function AreaChart({
  months,
  values,
  color = "#1f3e97",
  unit = "",
  decimals = 0,
}: {
  months: string[];
  values: number[];
  color?: string;
  unit?: string;
  decimals?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [active, setActive] = useState(values.length - 1);
  const format = (v: number) => `${v.toFixed(decimals)}${unit}`;

  const yMax = Math.max(...values) * 1.15 || 1;
  const xAt = (i: number) => PAD_L + (i / (months.length - 1)) * PLOT_W;
  const yAt = (v: number) => PAD_T + (1 - v / yMax) * PLOT_H;

  const pts = values.map((v, i) => [xAt(i), yAt(v)] as [number, number]);
  const line = smoothPath(pts);
  const area = `${line} L ${xAt(months.length - 1)} ${PAD_T + PLOT_H} L ${PAD_L} ${
    PAD_T + PLOT_H
  } Z`;

  const ticks = 4;
  const gridVals = Array.from({ length: ticks + 1 }, (_, i) => (yMax / ticks) * i);

  const handleMove = (e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.round(((relX - PAD_L) / PLOT_W) * (months.length - 1));
    setActive(Math.max(0, Math.min(months.length - 1, idx)));
  };

  const mx = xAt(active);
  const my = yAt(values[active]);
  const gid = `area-${color.replace("#", "")}`;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        onMouseMove={handleMove}
        onMouseLeave={() => setActive(values.length - 1)}
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        {gridVals.map((t, idx) => {
          const y = yAt(t);
          return (
            <g key={idx}>
              <line
                x1={PAD_L}
                x2={W - PAD_R}
                y1={y}
                y2={y}
                stroke="#eceef2"
                strokeDasharray="4 6"
              />
              <text x={PAD_L - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#9ca3af">
                {format(t)}
              </text>
            </g>
          );
        })}

        {months.map((m, i) => (
          <text
            key={m + i}
            x={xAt(i)}
            y={H - 8}
            textAnchor="middle"
            fontSize="11"
            fill={i === active ? "#1f2937" : "#9ca3af"}
            fontWeight={i === active ? 700 : 400}
          >
            {m}
          </text>
        ))}

        <path d={area} fill={`url(#${gid})`} />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <line
          x1={mx}
          x2={mx}
          y1={PAD_T}
          y2={PAD_T + PLOT_H}
          stroke="#c7cbd3"
          strokeDasharray="4 5"
        />
        <circle cx={mx} cy={my} r={5.5} fill={color} stroke="#fff" strokeWidth={2} />
      </svg>

      <div
        className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-ink px-2.5 py-1.5 text-white shadow-lg"
        style={{ left: `${(mx / W) * 100}%`, top: `${(my / H) * 100}%`, marginTop: -12 }}
      >
        <p className="text-xs font-bold leading-none">{format(values[active])}</p>
        <p className="mt-1 text-[9px] uppercase tracking-wide text-white/60">
          {months[active]} 2024
        </p>
      </div>
    </div>
  );
}
