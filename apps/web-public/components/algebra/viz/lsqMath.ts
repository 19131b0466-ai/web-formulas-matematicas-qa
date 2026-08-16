/**
 * Small rectangular-matrix algebra for least squares / pseudoinverse pedagogy.
 * Prefer SVD-based A⁺ over (AᵀA)⁻¹Aᵀ so singular / deficient-rank cases stay safe.
 */

export type Mat = number[][]; // row-major m×n
export type Vec = number[];

export const LSQ_EPS = 1e-10;
export const LSQ_NEAR = 1e-6;

export function rows(A: Mat): number {
  return A.length;
}

export function cols(A: Mat): number {
  return A[0]?.length ?? 0;
}

export function zeros(m: number, n: number): Mat {
  return Array.from({ length: m }, () => Array.from({ length: n }, () => 0));
}

export function identity(n: number): Mat {
  const I = zeros(n, n);
  for (let i = 0; i < n; i++) I[i]![i] = 1;
  return I;
}

export function cloneMat(A: Mat): Mat {
  return A.map((r) => r.slice());
}

export function cloneVec(v: Vec): Vec {
  return v.slice();
}

export function formatNum(n: number, digits = 3): string {
  if (!Number.isFinite(n)) return '—';
  if (Math.abs(n) < LSQ_EPS) return '0';
  const r = Math.round(n);
  if (Math.abs(n - r) < 1e-8 && Math.abs(n) < 1e6) return String(r);
  return Number(n.toFixed(digits)).toString();
}

export function formatVec(v: Vec, digits = 3): string {
  return `(${v.map((x) => formatNum(x, digits)).join(', ')})`;
}

export function vecDot(a: Vec, b: Vec): number {
  let s = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) s += a[i]! * b[i]!;
  return s;
}

export function vecNorm(a: Vec): number {
  let s = 0;
  for (const x of a) s += x * x;
  return Math.sqrt(s);
}

export function vecAdd(a: Vec, b: Vec): Vec {
  return a.map((x, i) => x + (b[i] ?? 0));
}

export function vecSub(a: Vec, b: Vec): Vec {
  return a.map((x, i) => x - (b[i] ?? 0));
}

export function vecScale(a: Vec, s: number): Vec {
  return a.map((x) => x * s);
}

export function matT(A: Mat): Mat {
  const m = rows(A);
  const n = cols(A);
  const T = zeros(n, m);
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) T[j]![i] = A[i]![j]!;
  }
  return T;
}

export function matMul(A: Mat, B: Mat): Mat {
  const m = rows(A);
  const k = cols(A);
  const n = cols(B);
  const C = zeros(m, n);
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      let s = 0;
      for (let t = 0; t < k; t++) s += A[i]![t]! * B[t]![j]!;
      C[i]![j] = s;
    }
  }
  return C;
}

export function matVec(A: Mat, x: Vec): Vec {
  const m = rows(A);
  const n = cols(A);
  const y = Array.from({ length: m }, () => 0);
  for (let i = 0; i < m; i++) {
    let s = 0;
    for (let j = 0; j < n; j++) s += A[i]![j]! * (x[j] ?? 0);
    y[i] = s;
  }
  return y;
}

export function matFrobenius(A: Mat): number {
  let s = 0;
  for (const row of A) for (const v of row) s += v * v;
  return Math.sqrt(s);
}

export function matNear(A: Mat, B: Mat, eps = LSQ_NEAR): boolean {
  if (rows(A) !== rows(B) || cols(A) !== cols(B)) return false;
  return matFrobenius(matSub(A, B)) <= eps * (1 + Math.max(matFrobenius(A), matFrobenius(B)));
}

export function matSub(A: Mat, B: Mat): Mat {
  return A.map((row, i) => row.map((v, j) => v - (B[i]?.[j] ?? 0)));
}

export function matScale(A: Mat, s: number): Mat {
  return A.map((row) => row.map((v) => v * s));
}

/** Tolerance for treating a singular value as zero. */
export function singularValueTolerance(sigmas: number[], m: number, n: number): number {
  const maxS = sigmas.length ? Math.max(...sigmas.map(Math.abs), 0) : 0;
  return Math.max(LSQ_EPS, LSQ_NEAR * maxS, Number.EPSILON * Math.max(m, n) * maxS);
}

/**
 * Jacobi diagonalization of a small symmetric matrix (n ≤ 4).
 * Returns orthonormal V and eigenvalues on the diagonal of D (as vector).
 */
function jacobiSymmetric(S: Mat): { values: number[]; V: Mat } {
  const n = rows(S);
  const A = cloneMat(S);
  const V = identity(n);
  const maxIter = 40;

  for (let iter = 0; iter < maxIter; iter++) {
    let p = 0;
    let q = 1;
    let maxOff = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = Math.abs(A[i]![j]!);
        if (a > maxOff) {
          maxOff = a;
          p = i;
          q = j;
        }
      }
    }
    if (maxOff < 1e-14) break;

    const app = A[p]![p]!;
    const aqq = A[q]![q]!;
    const apq = A[p]![q]!;
    const tau = (aqq - app) / (2 * apq);
    // tau=0 must rotate by 45° — Math.sign(0)===0 would skip the plane
    const signTau = tau >= 0 ? 1 : -1;
    const t = signTau / (Math.abs(tau) + Math.sqrt(1 + tau * tau));
    const c = 1 / Math.sqrt(1 + t * t);
    const s = t * c;

    // Rotate A
    A[p]![p] = app - t * apq;
    A[q]![q] = aqq + t * apq;
    A[p]![q] = 0;
    A[q]![p] = 0;

    for (let k = 0; k < n; k++) {
      if (k === p || k === q) continue;
      const aik = A[k]![p]!;
      const aiq = A[k]![q]!;
      A[k]![p] = c * aik - s * aiq;
      A[p]![k] = A[k]![p]!;
      A[k]![q] = s * aik + c * aiq;
      A[q]![k] = A[k]![q]!;
    }

    for (let k = 0; k < n; k++) {
      const vip = V[k]![p]!;
      const viq = V[k]![q]!;
      V[k]![p] = c * vip - s * viq;
      V[k]![q] = s * vip + c * viq;
    }
  }

  const values = Array.from({ length: n }, (_, i) => A[i]![i]!);
  // Sort descending by |λ| then λ
  const order = values
    .map((v, i) => ({ v, i }))
    .sort((a, b) => Math.abs(b.v) - Math.abs(a.v) || b.v - a.v)
    .map((o) => o.i);
  const sortedValues = order.map((i) => Math.max(0, values[i]!)); // clamp tiny negatives
  const sortedV = zeros(n, n);
  for (let j = 0; j < n; j++) {
    const src = order[j]!;
    for (let i = 0; i < n; i++) sortedV[i]![j] = V[i]![src]!;
  }
  return { values: sortedValues, V: sortedV };
}

export type SvdResult = {
  U: Mat; // m×r thin (or m×n padded with zeros for display)
  S: number[]; // length min(m,n), descending
  Vt: Mat; // r×n thin (or n×n)
  rank: number;
  tol: number;
};

/**
 * Thin SVD via eigendecomposition of AᵀA (stable enough for tiny pedagogical matrices).
 * A = U Σ Vᵀ with Σ diagonal of length min(m,n).
 */
export function svd(A: Mat): SvdResult {
  const m = rows(A);
  const n = cols(A);
  if (m === 0 || n === 0) {
    return { U: [], S: [], Vt: [], rank: 0, tol: LSQ_EPS };
  }

  const AtA = matMul(matT(A), A);
  const { values, V } = jacobiSymmetric(AtA);
  const S = values.map((λ) => Math.sqrt(Math.max(0, λ)));
  const tol = singularValueTolerance(S, m, n);

  const r = S.filter((σ) => σ > tol).length;
  const U = zeros(m, n);
  for (let j = 0; j < n; j++) {
    const σ = S[j]!;
    const vj = Array.from({ length: n }, (_, i) => V[i]![j]!);
    if (σ > tol) {
      const uj = vecScale(matVec(A, vj), 1 / σ);
      for (let i = 0; i < m; i++) U[i]![j] = uj[i]!;
    }
  }

  // Orthonormalize leftover U columns if needed (not required for pinv)
  const Vt = matT(V);
  return { U, S, Vt, rank: r, tol };
}

/** Moore–Penrose pseudoinverse via SVD. A (m×n) → A⁺ (n×m). */
export function pseudoInverse(A: Mat): Mat {
  const m = rows(A);
  const n = cols(A);
  if (m === 0 || n === 0) return zeros(n, m);
  const { U, S, Vt, tol } = svd(A);
  const V = matT(Vt);
  const k = Math.min(m, n);
  // Thin factors: Up (m×r), Vp (n×r), Sp (r×r)
  const rIdx: number[] = [];
  for (let i = 0; i < k; i++) {
    if (S[i]! > tol) rIdx.push(i);
  }
  if (rIdx.length === 0) return zeros(n, m);

  const r = rIdx.length;
  const Up = zeros(m, r);
  const Vp = zeros(n, r);
  const Sp = zeros(r, r);
  for (let j = 0; j < r; j++) {
    const src = rIdx[j]!;
    Sp[j]![j] = 1 / S[src]!;
    for (let i = 0; i < m; i++) Up[i]![j] = U[i]![src]!;
    for (let i = 0; i < n; i++) Vp[i]![j] = V[i]![src]!;
  }
  // A⁺ = Vp Sp Upᵀ
  return matMul(Vp, matMul(Sp, matT(Up)));
}

export type LsqResult = {
  xHat: Vec;
  bHat: Vec;
  residual: Vec;
  residualNorm: number;
  residualNormSq: number;
  Ap: Mat;
  rank: number;
  exact: boolean;
  AtResidual: Vec;
};

export function leastSquares(A: Mat, b: Vec): LsqResult {
  const Ap = pseudoInverse(A);
  const xHat = matVec(Ap, b);
  const bHat = matVec(A, xHat);
  const residual = vecSub(b, bHat);
  const residualNorm = vecNorm(residual);
  const AtResidual = matVec(matT(A), residual);
  const { rank, tol } = svd(A);
  return {
    xHat,
    bHat,
    residual,
    residualNorm,
    residualNormSq: residualNorm * residualNorm,
    Ap,
    rank,
    exact: residualNorm <= Math.max(tol, LSQ_NEAR) * (1 + vecNorm(b)),
    AtResidual,
  };
}

export function matrixRank(A: Mat): number {
  return svd(A).rank;
}

export function isInvertibleSquare(A: Mat): boolean {
  const m = rows(A);
  const n = cols(A);
  if (m !== n || m === 0) return false;
  return matrixRank(A) === m;
}

/** Kernel basis for small A via SVD (columns of V with σ≈0). */
export function nullspaceBasis(A: Mat): Vec[] {
  const n = cols(A);
  const { S, Vt, tol } = svd(A);
  const V = matT(Vt);
  const basis: Vec[] = [];
  for (let j = 0; j < n; j++) {
    if ((S[j] ?? 0) <= tol) {
      basis.push(Array.from({ length: n }, (_, i) => V[i]![j]!));
    }
  }
  return basis;
}

export function classifySystem(
  A: Mat,
  b: Vec,
): {
  shape: 'square' | 'tall' | 'wide';
  rank: number;
  fullColumnRank: boolean;
  fullRowRank: boolean;
  singular: boolean;
  invertible: boolean;
  problem:
    | 'unique_exact'
    | 'infinite_exact'
    | 'least_squares'
    | 'inconsistent_deficient';
  exact: boolean;
} {
  const m = rows(A);
  const n = cols(A);
  const { rank } = svd(A);
  const lsq = leastSquares(A, b);
  const shape = m === n ? 'square' : m > n ? 'tall' : 'wide';
  const fullColumnRank = rank === n;
  const fullRowRank = rank === m;
  const singular = m === n && rank < m;
  const invertible = m === n && rank === m;
  const exact = lsq.exact;

  let problem: 'unique_exact' | 'infinite_exact' | 'least_squares' | 'inconsistent_deficient';
  if (exact && fullColumnRank) problem = 'unique_exact';
  else if (exact && !fullColumnRank) problem = 'infinite_exact';
  else if (!exact && fullColumnRank) problem = 'least_squares';
  else problem = 'inconsistent_deficient';

  return {
    shape,
    rank,
    fullColumnRank,
    fullRowRank,
    singular,
    invertible,
    problem,
    exact,
  };
}

/** Check Moore–Penrose conditions; returns per-condition OK flags. */
export function moorePenroseChecks(A: Mat, Ap: Mat): {
  c1: boolean;
  c2: boolean;
  c3: boolean;
  c4: boolean;
  all: boolean;
} {
  const AAp = matMul(A, Ap);
  const ApA = matMul(Ap, A);
  const c1 = matNear(matMul(AAp, A), A);
  const c2 = matNear(matMul(ApA, Ap), Ap);
  const c3 = matNear(AAp, matT(AAp));
  const c4 = matNear(ApA, matT(ApA));
  return { c1, c2, c3, c4, all: c1 && c2 && c3 && c4 };
}

export function det2x2(A: Mat): number | null {
  if (rows(A) !== 2 || cols(A) !== 2) return null;
  return A[0]![0]! * A[1]![1]! - A[0]![1]! * A[1]![0]!;
}

export function inv2x2(A: Mat): Mat | null {
  const d = det2x2(A);
  if (d === null || Math.abs(d) < LSQ_NEAR) return null;
  return [
    [A[1]![1]! / d, -A[0]![1]! / d],
    [-A[1]![0]! / d, A[0]![0]! / d],
  ];
}
