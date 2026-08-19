/**
 * Matrix and vector norms for pedagogy: Frobenius, spectral (2), L1 and L∞ induced norms.
 */
import {
  type Mat,
  type Vec,
  cols,
  formatNum as lsqFormatNum,
  matVec,
  rows,
  svd,
} from './lsqMath';
import type { Vec2 } from './math2d';

export { matVec };

export type PNorm = 1 | 2 | 'inf';

export function formatNum(n: number, digits = 3): string {
  return lsqFormatNum(n, digits);
}

export function vectorTwoNorm(v: Vec): number {
  let s = 0;
  for (const x of v) s += x * x;
  return Math.sqrt(s);
}

export function vectorPNorm(v: Vec, p: PNorm): number {
  if (v.length === 0) return 0;
  if (p === 2) return vectorTwoNorm(v);
  if (p === 1) {
    let s = 0;
    for (const x of v) s += Math.abs(x);
    return s;
  }
  let m = 0;
  for (const x of v) m = Math.max(m, Math.abs(x));
  return m;
}

export function normalizePNorm(v: Vec, p: PNorm): Vec {
  const n = vectorPNorm(v, p);
  if (n < 1e-12) return v.map(() => 0);
  return v.map((x) => x / n);
}

export function frobeniusNormSquared(A: Mat): number {
  let s = 0;
  for (const row of A) for (const v of row) s += v * v;
  return s;
}

export function frobeniusNorm(A: Mat): number {
  return Math.sqrt(frobeniusNormSquared(A));
}

export function squaredMagnitudes(A: Mat): Mat {
  return A.map((row) => row.map((v) => v * v));
}

export function vectorizeColumnMajor(A: Mat): Vec {
  const m = rows(A);
  const n = cols(A);
  const v: Vec = [];
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < m; i++) v.push(A[i]?.[j] ?? 0);
  }
  return v;
}

export function rowAbsoluteSums(A: Mat): number[] {
  return A.map((row) => row.reduce((s, v) => s + Math.abs(v), 0));
}

export function columnAbsoluteSums(A: Mat): number[] {
  const m = rows(A);
  const n = cols(A);
  const sums: number[] = [];
  for (let j = 0; j < n; j++) {
    let s = 0;
    for (let i = 0; i < m; i++) s += Math.abs(A[i]?.[j] ?? 0);
    sums.push(s);
  }
  return sums;
}

export function matrixOneNorm(A: Mat): number {
  const sums = columnAbsoluteSums(A);
  return sums.length ? Math.max(...sums) : 0;
}

export function matrixInfinityNorm(A: Mat): number {
  const sums = rowAbsoluteSums(A);
  return sums.length ? Math.max(...sums) : 0;
}

/** Induced matrix norm ‖A‖_p for p ∈ {1, 2, ∞}. */
export function inducedMatrixNorm(A: Mat, p: PNorm): number {
  if (p === 1) return matrixOneNorm(A);
  if (p === 2) return spectralNorm(A);
  return matrixInfinityNorm(A);
}

export function spectralNorm(A: Mat): number {
  const { S } = svd(A);
  return S.length ? Math.max(...S, 0) : 0;
}

function normVec2(v: Vec2): number {
  return Math.hypot(v.x, v.y);
}

function normalizeVec2(v: Vec2): Vec2 {
  const n = normVec2(v);
  if (n < 1e-12) return { x: 0, y: 0 };
  return { x: v.x / n, y: v.y / n };
}

/** 2×2 SVD factors for spectral norm pedagogy. */
export function svd2x2(A: Mat): {
  sigma1: number;
  sigma2: number;
  v1: Vec2;
  v2: Vec2;
  u1: Vec2;
  u2: Vec2;
} {
  const { U, S, Vt } = svd(A);
  const sigma1 = S[0] ?? 0;
  const sigma2 = S[1] ?? 0;
  const v1 = normalizeVec2({
    x: Vt[0]?.[0] ?? 1,
    y: Vt[0]?.[1] ?? 0,
  });
  const v2 = normalizeVec2({
    x: Vt[1]?.[0] ?? 0,
    y: Vt[1]?.[1] ?? 1,
  });
  const u1 = normalizeVec2({
    x: U[0]?.[0] ?? 1,
    y: U[1]?.[0] ?? 0,
  });
  const u2 = normalizeVec2({
    x: U[0]?.[1] ?? 0,
    y: U[1]?.[1] ?? 1,
  });
  return { sigma1, sigma2, v1, v2, u1, u2 };
}

export function dominantIndices(values: number[], eps = 1e-9): number[] {
  if (!values.length) return [];
  const max = Math.max(...values);
  return values
    .map((v, i) => (Math.abs(v - max) <= eps ? i : -1))
    .filter((i) => i >= 0);
}

/** Maximizer for ‖A‖₁ = max_{‖x‖₁=1} ‖Ax‖₁ — unit vector along dominant column. */
export function maximizingVectorForOneNorm(A: Mat): Vec {
  const n = cols(A);
  const colSums = columnAbsoluteSums(A);
  const maxSum = colSums.length ? Math.max(...colSums) : 0;
  const j = colSums.findIndex((s) => Math.abs(s - maxSum) < 1e-9);
  const x = Array.from({ length: n }, () => 0);
  if (j >= 0) x[j] = 1;
  return x;
}

/** Maximizer for ‖A‖∞ = max_{‖x‖∞=1} ‖Ax‖∞ — signs of dominant row. */
export function maximizingVectorForInfinityNorm(A: Mat): Vec {
  const n = cols(A);
  const rowSums = rowAbsoluteSums(A);
  const maxSum = rowSums.length ? Math.max(...rowSums) : 0;
  const i = rowSums.findIndex((s) => Math.abs(s - maxSum) < 1e-9);
  const x = Array.from({ length: n }, () => 0);
  if (i < 0) return x;
  for (let j = 0; j < n; j++) {
    const a = A[i]?.[j] ?? 0;
    x[j] = a === 0 ? 0 : Math.sign(a);
  }
  const inf = vectorPNorm(x, 'inf');
  if (inf < 1e-12) return x;
  if (inf < 1 - 1e-9) {
    const k = x.findIndex((v) => Math.abs(v) > 0);
    if (k >= 0) x[k] = Math.sign(x[k]) || 1;
  }
  return x;
}

export function amplification(A: Mat, x: Vec, p: PNorm): number {
  const xNorm = vectorPNorm(x, p);
  if (xNorm < 1e-12) return 0;
  const ax = matVec(A, x);
  return vectorPNorm(ax, p) / xNorm;
}

export function transformPoints2D(
  A: Mat,
  pts: Array<{ x: number; y: number }>,
): Array<{ x: number; y: number }> {
  return pts.map((p) => {
    const x = (A[0]?.[0] ?? 0) * p.x + (A[0]?.[1] ?? 0) * p.y;
    const y = (A[1]?.[0] ?? 0) * p.x + (A[1]?.[1] ?? 0) * p.y;
    return { x, y };
  });
}

/** Boundary of the 2D unit ball for p = 1 (diamond), 2 (circle) or p = ∞ (square). */
export function unitBallBoundary2D(
  p: PNorm,
  segmentsPerEdge = 24,
): Array<{ x: number; y: number }> {
  if (p === 2) {
    const n = segmentsPerEdge;
    return Array.from({ length: n }, (_, i) => {
      const t = (2 * Math.PI * i) / n;
      return { x: Math.cos(t), y: Math.sin(t) };
    });
  }
  if (p === 'inf') {
    const pts: Array<{ x: number; y: number }> = [];
    for (let k = 0; k < segmentsPerEdge; k++) {
      const t = k / segmentsPerEdge;
      pts.push({ x: 1 - 2 * t, y: -1 });
      pts.push({ x: 1, y: -1 + 2 * t });
      pts.push({ x: 1 - 2 * t, y: 1 });
      pts.push({ x: -1, y: 1 - 2 * t });
    }
    return pts;
  }
  return [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
  ];
}

export function scaleBoundary(
  pts: Array<{ x: number; y: number }>,
  r: number,
): Array<{ x: number; y: number }> {
  return pts.map((p) => ({ x: p.x * r, y: p.y * r }));
}

/** Project v onto the boundary of the unit p-ball (same direction, ‖v‖_p = 1). */
export function projectToUnitPBoundary(v: Vec, p: PNorm): Vec {
  const n = vectorPNorm(v, p);
  if (n < 1e-12) {
    const fallback = v.length ? 1 : 0;
    return v.length ? [fallback, ...v.slice(1).map(() => 0)] : [];
  }
  return v.map((x) => x / n);
}

export function inequalitySatisfied(left: number, bound: number, eps = 1e-9): boolean {
  return left <= bound + eps;
}

export function submultiplicativityRatio(
  normAB: number,
  normA: number,
  normB: number,
): number | null {
  const denom = normA * normB;
  if (denom < 1e-12) return null;
  return normAB / denom;
}
