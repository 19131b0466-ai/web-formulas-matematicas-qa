/**
 * Shared RREF / rank / nullspace for rectangular matrices (ESP lessons).
 * Tolerance is centralized — do not compare floats with === 0.
 */

export const LIN_EPS = 1e-9;
export const LIN_NEAR = 0.04;

export type Matrix = number[][];

export function isNearZero(x: number, eps = LIN_EPS): boolean {
  return Math.abs(x) < eps;
}

export function cloneMat(m: Matrix): Matrix {
  return m.map((r) => [...r]);
}

export function matDims(m: Matrix): { rows: number; cols: number } {
  return { rows: m.length, cols: m[0]?.length ?? 0 };
}

export function getCol(m: Matrix, j: number): number[] {
  return m.map((r) => r[j] ?? 0);
}

export function matVec(m: Matrix, x: number[]): number[] {
  return m.map((row) => row.reduce((s, a, j) => s + a * (x[j] ?? 0), 0));
}

export function presentLin(n: number, d = 2): string {
  if (!Number.isFinite(n)) return '—';
  if (isNearZero(n)) return '0';
  const r = Number(n.toFixed(d));
  if (Math.abs(r - Math.round(r)) < 1e-8 && Math.abs(r) < 1e6) return String(Math.round(r));
  return String(r);
}

export function formatVec(v: number[], d = 2): string {
  return `(${v.map((x) => presentLin(x, d)).join(', ')})`;
}

function gcdInt(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

/** Scale a nearly-rational vector to small integers when safe. */
export function simplifyBasisVec(v: number[]): number[] {
  if (v.every((x) => isNearZero(x))) return v.map(() => 0);
  const maxAbs = Math.max(...v.map((x) => Math.abs(x))) || 1;
  const scaled = v.map((x) => x / maxAbs);
  const rounded = scaled.map((x) => Math.round(x * 12));
  const ok = rounded.every((r, i) => Math.abs(scaled[i]! * 12 - r) < 0.08);
  if (!ok) return v.map((x) => Number(x.toFixed(3)));
  let g = 0;
  for (const r of rounded) {
    if (r === 0) continue;
    g = g === 0 ? Math.abs(r) : gcdInt(g, r);
  }
  g = g || 1;
  return rounded.map((r) => r / g);
}

export type RrefResult = {
  rref: Matrix;
  pivots: number[]; // column indices (0-based)
  free: number[];
  rank: number;
};

/** Gauss–Jordan RREF with partial pivoting. */
export function rref(m: Matrix, eps = LIN_EPS): RrefResult {
  const A = cloneMat(m);
  const rows = A.length;
  const cols = A[0]?.length ?? 0;
  const pivots: number[] = [];
  let row = 0;

  for (let col = 0; col < cols && row < rows; col++) {
    let piv = row;
    for (let i = row + 1; i < rows; i++) {
      if (Math.abs(A[i]![col]!) > Math.abs(A[piv]![col]!)) piv = i;
    }
    if (isNearZero(A[piv]![col]!, eps)) continue;

    if (piv !== row) {
      const tmp = A[row]!;
      A[row] = A[piv]!;
      A[piv] = tmp;
    }

    const pivotVal = A[row]![col]!;
    for (let j = 0; j < cols; j++) A[row]![j]! /= pivotVal;

    for (let i = 0; i < rows; i++) {
      if (i === row) continue;
      const factor = A[i]![col]!;
      if (isNearZero(factor, eps)) continue;
      for (let j = 0; j < cols; j++) A[i]![j]! -= factor * A[row]![j]!;
    }

    pivots.push(col);
    row++;
  }

  // Clean tiny noise
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (isNearZero(A[i]![j]!, eps)) A[i]![j] = 0;
    }
  }

  const free = Array.from({ length: cols }, (_, j) => j).filter((j) => !pivots.includes(j));
  return { rref: A, pivots, free, rank: pivots.length };
}

export function rank(m: Matrix, eps = LIN_EPS): number {
  return rref(m, eps).rank;
}

export function nullity(m: Matrix, eps = LIN_EPS): number {
  const { cols } = matDims(m);
  return cols - rank(m, eps);
}

/**
 * Basis for Ker(A): one vector per free variable (from RREF).
 * Uses original column count n.
 */
export function nullspaceBasis(m: Matrix, eps = LIN_EPS): number[][] {
  const { cols } = matDims(m);
  const { rref: R, pivots, free } = rref(m, eps);
  const basis: number[][] = [];

  for (const freeCol of free) {
    const v = Array.from({ length: cols }, () => 0);
    v[freeCol] = 1;
    for (let i = 0; i < pivots.length; i++) {
      const p = pivots[i]!;
      // R[i][p] should be 1; free vars appear with coefficients in that row
      v[p] = -R[i]![freeCol]!;
    }
    basis.push(simplifyBasisVec(v));
  }
  return basis;
}

/** Column space basis from ORIGINAL matrix using pivot columns. */
export function columnSpaceBasis(m: Matrix, eps = LIN_EPS): number[][] {
  const { pivots } = rref(m, eps);
  return pivots.map((j) => getCol(m, j));
}

export function applyMat2x3(A: Matrix, x: [number, number, number]): [number, number] {
  const y0 = (A[0]?.[0] ?? 0) * x[0] + (A[0]?.[1] ?? 0) * x[1] + (A[0]?.[2] ?? 0) * x[2];
  const y1 = (A[1]?.[0] ?? 0) * x[0] + (A[1]?.[1] ?? 0) * x[1] + (A[1]?.[2] ?? 0) * x[2];
  return [y0, y1];
}

export function setEntry(m: Matrix, i: number, j: number, v: number): Matrix {
  const next = cloneMat(m);
  if (next[i]) next[i]![j] = v;
  return next;
}

export const PRESET_FULL: Matrix = [
  [1, 0, 1],
  [0, 1, 1],
];

export const PRESET_DEP: Matrix = [
  [1, 2, 3],
  [2, 4, 6],
];

export const PRESET_ZERO: Matrix = [
  [0, 0, 0],
  [0, 0, 0],
];

export const PRESET_ID2: Matrix = [
  [1, 0],
  [0, 1],
];
