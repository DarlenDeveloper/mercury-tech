// Builds a smooth SVG path (Catmull-Rom spline converted to cubic béziers)
// through the given points. Returns an empty string for < 2 points.
export function smoothPath(points: [number, number][], tension = 0.5): string {
  if (points.length < 2) return "";
  const d: string[] = [`M ${points[0][0]} ${points[0][1]}`];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    const cp1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension * 2;
    const cp1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension * 2;
    const cp2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension * 2;
    const cp2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension * 2;

    d.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`);
  }
  return d.join(" ");
}
