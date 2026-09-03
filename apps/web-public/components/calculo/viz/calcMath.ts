/**
 * Shared math utilities for Cálculo Integral visualizations.
 */

export type SumType = 'left' | 'right' | 'midpoint' | 'trapezoid';

/** Evaluate f safely, returning NaN on errors (division by zero, sqrt of negative, etc.) */
export function safeEval(f: (x: number) => number, x: number): number {
  try {
    const v = f(x);
    return isFinite(v) ? v : NaN;
  } catch {
    return NaN;
  }
}

/** Linspace: n+1 evenly spaced points from a to b */
export function linspace(a: number, b: number, n: number): number[] {
  const pts: number[] = [];
  for (let i = 0; i <= n; i++) pts.push(a + (i / n) * (b - a));
  return pts;
}

/** Riemann sum */
export function riemannSum(
  f: (x: number) => number,
  a: number,
  b: number,
  n: number,
  type: SumType,
): number {
  const dx = (b - a) / n;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const x0 = a + i * dx;
    const x1 = x0 + dx;
    let height: number;
    if (type === 'left') height = safeEval(f, x0);
    else if (type === 'right') height = safeEval(f, x1);
    else if (type === 'midpoint') height = safeEval(f, (x0 + x1) / 2);
    else {
      // trapezoid
      const fa = safeEval(f, x0);
      const fb = safeEval(f, x1);
      height = (fa + fb) / 2;
    }
    if (isFinite(height)) sum += height * dx;
  }
  return sum;
}

/** Rectangle sample points for each subinterval */
export function samplePoints(
  a: number,
  b: number,
  n: number,
  type: SumType,
): number[] {
  const dx = (b - a) / n;
  return Array.from({ length: n }, (_, i) => {
    const x0 = a + i * dx;
    if (type === 'left') return x0;
    if (type === 'right') return x0 + dx;
    if (type === 'midpoint') return x0 + dx / 2;
    return x0; // trapezoid uses x0 and x0+dx
  });
}

/**
 * Numerical integration via adaptive Simpson (recursive), tolerance 1e-8.
 * Falls back to 20-point Gauss-Legendre for speed on wide intervals.
 */
export function integrate(f: (x: number) => number, a: number, b: number): number {
  // 20-point Gauss-Legendre weights and abscissae on [-1,1]
  const GL_X = [
    -0.9931285991850949, -0.9639719272779138, -0.9122344282513259,
    -0.8391169718222188, -0.7463062256567499, -0.6360536807265150,
    -0.5108670019508271, -0.3737060887154195, -0.2277858511416451,
    -0.0765265211334973, 0.0765265211334973, 0.2277858511416451,
    0.3737060887154195, 0.5108670019508271, 0.6360536807265150,
    0.7463062256567499, 0.8391169718222188, 0.9122344282513259,
    0.9639719272779138, 0.9931285991850949,
  ];
  const GL_W = [
    0.0176140071391521, 0.0406014298003869, 0.0626720483341091,
    0.0832767415767048, 0.1019301198172404, 0.1181945319615184,
    0.1316886384491766, 0.1420961093183820, 0.1491729864726037,
    0.1527533871307258, 0.1527533871307258, 0.1491729864726037,
    0.1420961093183820, 0.1316886384491766, 0.1181945319615184,
    0.1019301198172404, 0.0832767415767048, 0.0626720483341091,
    0.0406014298003869, 0.0176140071391521,
  ];
  const mid = (a + b) / 2;
  const half = (b - a) / 2;
  let sum = 0;
  for (let i = 0; i < GL_X.length; i++) {
    const x = mid + half * GL_X[i]!;
    sum += GL_W[i]! * safeEval(f, x);
  }
  return half * sum;
}

/** RK4 step for ODEs dy/dx = f(x, y) */
export function rk4Step(
  f: (x: number, y: number) => number,
  x: number,
  y: number,
  h: number,
): { x: number; y: number } {
  const k1 = f(x, y);
  const k2 = f(x + h / 2, y + (h / 2) * k1);
  const k3 = f(x + h / 2, y + (h / 2) * k2);
  const k4 = f(x + h, y + h * k3);
  return { x: x + h, y: y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4) };
}

/** Solve ODE y'=f(x,y) with RK4 from (x0,y0), producing `steps` points */
export function solveODE(
  f: (x: number, y: number) => number,
  x0: number,
  y0: number,
  h: number,
  steps: number,
  yLimit = 20,
): Array<{ x: number; y: number }> {
  const pts: Array<{ x: number; y: number }> = [{ x: x0, y: y0 }];
  let cur = { x: x0, y: y0 };
  for (let i = 0; i < steps; i++) {
    cur = rk4Step(f, cur.x, cur.y, h);
    if (!isFinite(cur.y) || Math.abs(cur.y) > yLimit) break;
    pts.push({ x: cur.x, y: cur.y });
  }
  return pts;
}

/** Find zeros of g in [a,b] using bisection; tolerance 1e-6 */
export function findZeros(
  g: (x: number) => number,
  a: number,
  b: number,
  steps = 500,
): number[] {
  const zeros: number[] = [];
  const dx = (b - a) / steps;
  for (let i = 0; i < steps; i++) {
    const x0 = a + i * dx;
    const x1 = x0 + dx;
    const f0 = g(x0);
    const f1 = g(x1);
    if (!isFinite(f0) || !isFinite(f1)) continue;
    if (f0 * f1 > 0) continue;
    // bisect
    let lo = x0, hi = x1;
    for (let j = 0; j < 40; j++) {
      const mid = (lo + hi) / 2;
      if (g(lo) * g(mid) <= 0) hi = mid;
      else lo = mid;
    }
    const z = (lo + hi) / 2;
    if (zeros.length === 0 || Math.abs(z - zeros[zeros.length - 1]!) > 1e-4) {
      zeros.push(z);
    }
  }
  return zeros;
}

/** Numerical derivative via central difference */
export function derivative(f: (x: number) => number, x: number, h = 1e-5): number {
  return (f(x + h) - f(x - h)) / (2 * h);
}

/** Format number nicely */
export function fmt(n: number, digits = 4): string {
  if (!isFinite(n)) return '—';
  const a = Math.abs(n);
  if (a !== 0 && (a >= 10000 || a < 0.001)) return n.toExponential(2);
  return n.toFixed(digits).replace(/\.?0+$/, '') || '0';
}
