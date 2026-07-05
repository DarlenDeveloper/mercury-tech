import type { Segment } from "@/lib/adminData";

const SIZE = 160;
const R = 66;
const INNER = 44;
const C = SIZE / 2;

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function segmentPath(startAngle: number, endAngle: number) {
  const [ox1, oy1] = polar(C, C, R, endAngle);
  const [ox2, oy2] = polar(C, C, R, startAngle);
  const [ix1, iy1] = polar(C, C, INNER, startAngle);
  const [ix2, iy2] = polar(C, C, INNER, endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${ox1} ${oy1}`,
    `A ${R} ${R} 0 ${large} 0 ${ox2} ${oy2}`,
    `L ${ix1} ${iy1}`,
    `A ${INNER} ${INNER} 0 ${large} 1 ${ix2} ${iy2}`,
    "Z",
  ].join(" ");
}

export default function DonutChart({
  data,
  centerLabel,
  centerValue,
}: {
  data: Segment[];
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let angle = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="shrink-0">
        {data.map((d) => {
          const sweep = (d.value / total) * 360;
          const start = angle;
          const end = angle + sweep - 1.5; // small gap between segments
          angle += sweep;
          return <path key={d.name} d={segmentPath(start, end)} fill={d.color} />;
        })}
        {(centerValue || centerLabel) && (
          <>
            {centerValue && (
              <text
                x={C}
                y={C - 2}
                textAnchor="middle"
                fontSize="20"
                fontWeight="800"
                fill="#1f2937"
              >
                {centerValue}
              </text>
            )}
            {centerLabel && (
              <text x={C} y={C + 16} textAnchor="middle" fontSize="10" fill="#9ca3af">
                {centerLabel}
              </text>
            )}
          </>
        )}
      </svg>

      {/* Legend */}
      <ul className="flex flex-1 flex-col gap-2.5">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2.5 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="flex-1 text-muted">{d.name}</span>
            <span className="font-semibold text-ink">{d.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
