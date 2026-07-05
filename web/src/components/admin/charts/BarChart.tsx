"use client";

import { useState } from "react";

const W = 820;
const H = 260;
const PAD_L = 40;
const PAD_R = 12;
const PAD_T = 16;
const PAD_B = 30;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

export default function BarChart({
  labels,
  values,
  color = "#1f3e97",
  unit = "",
  decimals = 0,
}: {
  labels: string[];
  values: number[];
  color?: string;
  unit?: string;
  decimals?: number;
}) {
  const [active, setActive] = useState<number | null>(null);
  const format = (v: number) => `${v.toFixed(decimals)}${unit}`;

  const yMax = Math.max(...values) * 1.15;
  const ticks = 4;
  const gridVals = Array.from({ length: ticks + 1 }, (_, i) => (yMax / ticks) * i);

  const slot = PLOT_W / values.length;
  const barW = Math.min(26, slot * 0.5);
  const yAt = (v: number) => PAD_T + (1 - v / yMax) * PLOT_H;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {gridVals.map((t) => {
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
            <text x={PAD_L - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#9ca3af">
              {format(t)}
            </text>
          </g>
        );
      })}

      {values.map((v, i) => {
        const cx = PAD_L + slot * i + slot / 2;
        const y = yAt(v);
        const h = PAD_T + PLOT_H - y;
        const isActive = active === i;
        return (
          <g
            key={i}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
          >
            <rect
              x={cx - slot / 2}
              y={PAD_T}
              width={slot}
              height={PLOT_H}
              fill="transparent"
            />
            <rect
              x={cx - barW / 2}
              y={y}
              width={barW}
              height={Math.max(0, h)}
              rx={6}
              fill={color}
              opacity={active === null || isActive ? 1 : 0.35}
            />
            {isActive && (
              <text
                x={cx}
                y={y - 8}
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#1f2937"
              >
                {format(v)}
              </text>
            )}
            <text
              x={cx}
              y={H - 8}
              textAnchor="middle"
              fontSize="11"
              fill={isActive ? "#1f2937" : "#9ca3af"}
              fontWeight={isActive ? 700 : 400}
            >
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
