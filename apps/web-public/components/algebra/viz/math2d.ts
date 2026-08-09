export type Vec2 = { x: number; y: number };
export type Mat2 = [[number, number], [number, number]];

export function add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(a: Vec2, s: number): Vec2 {
  return { x: a.x * s, y: a.y * s };
}

export function dot(a: Vec2, b: Vec2): number {
  return a.x * b.x + a.y * b.y;
}

export function norm(a: Vec2): number {
  return Math.hypot(a.x, a.y);
}

export function normalize(a: Vec2): Vec2 {
  const n = norm(a);
  if (n < 1e-9) return { x: 0, y: 0 };
  return scale(a, 1 / n);
}

export function applyMat(m: Mat2, v: Vec2): Vec2 {
  return {
    x: m[0][0] * v.x + m[0][1] * v.y,
    y: m[1][0] * v.x + m[1][1] * v.y,
  };
}

export function matMul(a: Mat2, b: Mat2): Mat2 {
  return [
    [a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1]],
    [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1]],
  ];
}

export function det2(m: Mat2): number {
  return m[0][0] * m[1][1] - m[0][1] * m[1][0];
}

export function inv2(m: Mat2): Mat2 | null {
  const d = det2(m);
  if (Math.abs(d) < 1e-9) return null;
  return [
    [m[1][1] / d, -m[0][1] / d],
    [-m[1][0] / d, m[0][0] / d],
  ];
}

export function transpose2(m: Mat2): Mat2 {
  return [
    [m[0][0], m[1][0]],
    [m[0][1], m[1][1]],
  ];
}

/** Simple 2×2 eigenpairs (real eigenvalues when discriminant ≥ 0). */
export function eigen2(m: Mat2): { values: [number, number]; vectors: [Vec2, Vec2] } | null {
  const a = m[0][0];
  const b = m[0][1];
  const c = m[1][0];
  const d = m[1][1];
  const tr = a + d;
  const det = a * d - b * c;
  const disc = tr * tr - 4 * det;
  if (disc < 0) return null;
  const s = Math.sqrt(disc);
  const l1 = (tr + s) / 2;
  const l2 = (tr - s) / 2;
  const eigenvector = (lambda: number): Vec2 => {
    // (A - λI)v = 0
    const m00 = a - lambda;
    const m01 = b;
    if (Math.abs(m00) + Math.abs(m01) > 1e-9) {
      return normalize({ x: -m01, y: m00 });
    }
    return normalize({ x: d - lambda, y: -c });
  };
  return { values: [l1, l2], vectors: [eigenvector(l1), eigenvector(l2)] };
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export function linspace(a: number, b: number, n: number): number[] {
  if (n <= 1) return [a];
  return Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));
}

export function project(u: Vec2, v: Vec2): Vec2 {
  const vv = dot(v, v);
  if (vv < 1e-12) return { x: 0, y: 0 };
  return scale(v, dot(u, v) / vv);
}
