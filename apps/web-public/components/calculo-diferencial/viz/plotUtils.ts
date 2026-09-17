import { safeEval } from '@/components/calculo/viz/calcMath';

export const PLOT_W = 500;
export const PLOT_H = 220;
export const PLOT_M = { l: 44, r: 16, t: 14, b: 28 };

export function toX(v: number, xMin: number, xMax: number, w = PLOT_W) {
  return PLOT_M.l + ((v - xMin) / (xMax - xMin || 1)) * (w - PLOT_M.l - PLOT_M.r);
}

export function toY(v: number, yMin: number, yMax: number, h = PLOT_H) {
  return PLOT_M.t + ((yMax - v) / (yMax - yMin || 1)) * (h - PLOT_M.t - PLOT_M.b);
}

export function yRange(fn: (x: number) => number, a: number, b: number, samples = 200) {
  const ys: number[] = [0];
  for (let i = 0; i <= samples; i++) {
    const y = safeEval(fn, a + (i / samples) * (b - a));
    if (isFinite(y)) ys.push(y);
  }
  const lo = Math.min(...ys);
  const hi = Math.max(...ys);
  const pad = (hi - lo) * 0.15 || 0.4;
  return { yMin: lo - pad, yMax: hi + pad };
}

export function pathOf(
  fn: (x: number) => number,
  a: number,
  b: number,
  yMin: number,
  yMax: number,
  h = PLOT_H,
) {
  let d = '';
  let on = false;
  for (let i = 0; i <= 320; i++) {
    const x = a + (i / 320) * (b - a);
    const y = safeEval(fn, x);
    if (!isFinite(y)) {
      on = false;
      continue;
    }
    const sx = toX(x, a, b);
    const sy = toY(Math.max(yMin, Math.min(yMax, y)), yMin, yMax, h);
    d += on ? ` L${sx},${sy}` : `M${sx},${sy}`;
    on = true;
  }
  return d;
}
