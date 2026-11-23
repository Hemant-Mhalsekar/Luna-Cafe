/** SVG path for the lit part of the moon at phase f (0 = new, 0.5 = full, towards 1 = new again). */
export function moonPath(f: number, cx = 20, cy = 20, r = 16): string {
  const k = (1 - Math.cos(2 * Math.PI * f)) / 2; // share of the disc that is lit
  const rx = r * Math.abs(Math.cos(2 * Math.PI * f)); // half-width of the terminator ellipse
  const top = `${cx} ${cy - r}`;
  const bottom = `${cx} ${cy + r}`;
  if (f <= 0.5) return `M ${top} A ${r} ${r} 0 0 1 ${bottom} A ${rx} ${r} 0 0 ${k > 0.5 ? 1 : 0} ${top} Z`;
  return `M ${top} A ${r} ${r} 0 0 0 ${bottom} A ${rx} ${r} 0 0 ${k > 0.5 ? 0 : 1} ${top} Z`;
}
