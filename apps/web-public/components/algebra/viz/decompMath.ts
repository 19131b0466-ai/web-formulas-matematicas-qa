/**
 * Matrix decompositions for pedagogy: QR, LU (partial pivoting), low-rank SVD trunc,
 * and signed symmetric eigendecomposition.
 */
import {
  type Mat,
  type Vec,
  cloneMat,
  cols,
  formatNum,
  identity,
  matFrobenius,
  matMul,
  matNear,
  matScale,
  matSub,
  matT,
  matVec,
  rows,
  svd,
  vecAdd,
  vecDot,
  vecNorm,
  vecScale,
  vecSub,
  zeros,
  LSQ_EPS,
  LSQ_NEAR,
} from './lsqMath';

export {
  type Mat,
  type Vec,
  svd,
  matMul,
  matT,
  matVec,
  matSub,
  matScale,
  matFrobenius,
  matNear,
  rows,
  cols,
  zeros,
  identity,
  cloneMat,
  formatNum,
  vecNorm,
  vecDot,
  vecAdd,
  vecSub,
  vecScale,
  LSQ_EPS,
  LSQ_NEAR,
};

/** Outer product u vᵀ → m×n matrix. */
export function outerProduct(u: Vec, v: Vec): Mat {
  const m = u.length;
  const n = v.length;
  const M = zeros(m, n);
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) M[i]![j] = u[i]! * v[j]!;
  }
  return M;
}

export function matAdd(A: Mat, B: Mat): Mat {
  return A.map((row, i) => row.map((v, j) => v + (B[i]?.[j] ?? 0)));
}

export function columnOf(A: Mat, j: number): Vec {
  return A.map((row) => row[j] ?? 0);
}

export function setColumn(A: Mat, j: number, col: Vec): Mat {
  const next = cloneMat(A);
  for (let i = 0; i < next.length; i++) next[i]![j] = col[i] ?? 0;
  return next;
}

/** Truncated SVD reconstruction A_k = Σ_{i=1}^k σ_i u_i v_iᵀ. */
export function lowRankApprox(A: Mat, k: number): {
  Ak: Mat;
  residual: Mat;
  frobeniusError: number;
  spectralError: number;
  energy: number;
  exactRank: number;
  S: number[];
  U: Mat;
  Vt: Mat;
  tol: number;
} {
  const m = rows(A);
  const n = cols(A);
  const { U, S, Vt, rank, tol } = svd(A);
  const r = Math.min(S.length, rank > 0 ? S.length : 0);
  const kk = Math.max(0, Math.min(k, r, Math.min(m, n)));
  let Ak = zeros(m, n);
  let keptEnergy = 0;
  let totalEnergy = 0;
  for (let i = 0; i < S.length; i++) {
    const σ = S[i]!;
    totalEnergy += σ * σ;
    if (i < kk && σ > tol) {
      const ui = Array.from({ length: m }, (_, row) => U[row]![i]!);
      const vi = Array.from({ length: n }, (_, col) => Vt[i]![col]!);
      Ak = matAdd(Ak, matScale(outerProduct(ui, vi), σ));
      keptEnergy += σ * σ;
    }
  }
  const residual = matSub(A, Ak);
  const frobeniusError = matFrobenius(residual);
  const spectralError = kk < S.length ? S[kk]! : 0;
  return {
    Ak,
    residual,
    frobeniusError,
    spectralError,
    energy: totalEnergy > LSQ_EPS ? keptEnergy / totalEnergy : 1,
    exactRank: rank,
    S,
    U,
    Vt,
    tol,
  };
}

/**
 * Thin QR via Modified Gram–Schmidt with positive diagonal convention.
 * A (m×n) → Q (m×n), R (n×n). Rank-deficient columns yield zero R diag and zero Q col.
 */
export function qrDecomposition(A: Mat): {
  Q: Mat;
  R: Mat;
  rank: number;
  deficient: boolean;
} {
  const m = rows(A);
  const n = cols(A);
  const Q = zeros(m, n);
  const R = zeros(n, n);
  const work: Vec[] = Array.from({ length: n }, (_, j) => columnOf(A, j));
  let rank = 0;
  const tolBase = Math.max(LSQ_NEAR, LSQ_EPS * Math.max(m, n));

  for (let j = 0; j < n; j++) {
    let v = work[j]!;
    for (let i = 0; i < j; i++) {
      const qi = columnOf(Q, i);
      const rij = vecDot(qi, v);
      R[i]![j] = rij;
      v = vecSub(v, vecScale(qi, rij));
    }
    const nrm = vecNorm(v);
    const scaleTol = tolBase * (1 + Math.max(...work.map(vecNorm), 1));
    if (nrm <= scaleTol) {
      R[j]![j] = 0;
      // leave Q column zero
    } else {
      R[j]![j] = nrm;
      const qj = vecScale(v, 1 / nrm);
      for (let i = 0; i < m; i++) Q[i]![j] = qj[i]!;
      rank += 1;
    }
  }
  return { Q, R, rank, deficient: rank < n };
}

export type LuStep = {
  kind: 'pivot' | 'swap' | 'eliminate' | 'done';
  pivotCol: number;
  pivotRow: number;
  swapWith?: number;
  multiplier?: number;
  targetRow?: number;
  message: string;
};

/**
 * LU with partial pivoting (Doolittle): PA = LU, diag(L)=1.
 * Returns elimination history for pedagogy.
 */
export function luDecomposition(A: Mat): {
  P: Mat;
  L: Mat;
  U: Mat;
  swaps: Array<[number, number]>;
  steps: LuStep[];
  singular: boolean;
  reconstructionError: number;
} {
  const n = rows(A);
  if (n !== cols(A)) {
    throw new Error('LU expects a square matrix');
  }
  const U = cloneMat(A);
  const L = identity(n);
  const P = identity(n);
  const swaps: Array<[number, number]> = [];
  const steps: LuStep[] = [];
  let singular = false;
  const tol = Math.max(LSQ_NEAR, LSQ_EPS * n * (1 + matFrobenius(A)));

  for (let k = 0; k < n; k++) {
    // Partial pivot
    let piv = k;
    let maxAbs = Math.abs(U[k]![k]!);
    for (let i = k + 1; i < n; i++) {
      const a = Math.abs(U[i]![k]!);
      if (a > maxAbs) {
        maxAbs = a;
        piv = i;
      }
    }
    steps.push({
      kind: 'pivot',
      pivotCol: k,
      pivotRow: piv,
      message: `Buscando pivote en columna ${k + 1}: |máx|=${formatNum(maxAbs)}`,
    });

    if (maxAbs <= tol) {
      singular = true;
      steps.push({
        kind: 'done',
        pivotCol: k,
        pivotRow: k,
        message: `Pivote ≈ 0 en columna ${k + 1}: matriz singular / rango deficiente.`,
      });
      break;
    }

    if (piv !== k) {
      // Swap rows in U, P, and L (columns 0..k-1 of L)
      for (let j = 0; j < n; j++) {
        const t = U[k]![j]!;
        U[k]![j] = U[piv]![j]!;
        U[piv]![j] = t;
        const tp = P[k]![j]!;
        P[k]![j] = P[piv]![j]!;
        P[piv]![j] = tp;
      }
      for (let j = 0; j < k; j++) {
        const t = L[k]![j]!;
        L[k]![j] = L[piv]![j]!;
        L[piv]![j] = t;
      }
      swaps.push([k, piv]);
      steps.push({
        kind: 'swap',
        pivotCol: k,
        pivotRow: k,
        swapWith: piv,
        message: `Intercambio R${k + 1} ↔ R${piv + 1}`,
      });
    }

    for (let i = k + 1; i < n; i++) {
      const mik = U[i]![k]! / U[k]![k]!;
      L[i]![k] = mik;
      steps.push({
        kind: 'eliminate',
        pivotCol: k,
        pivotRow: k,
        multiplier: mik,
        targetRow: i,
        message: `m${i + 1}${k + 1}=${formatNum(mik)} · R${i + 1} ← R${i + 1} − m R${k + 1}`,
      });
      for (let j = k; j < n; j++) {
        U[i]![j]! -= mik * U[k]![j]!;
      }
      U[i]![k] = 0;
    }
  }

  const PA = matMul(P, A);
  const LU = matMul(L, U);
  const reconstructionError = matFrobenius(matSub(PA, LU));
  steps.push({
    kind: 'done',
    pivotCol: n - 1,
    pivotRow: n - 1,
    message: `PA = LU · ||PA−LU||_F=${formatNum(reconstructionError)}`,
  });

  return { P, L, U, swaps, steps, singular, reconstructionError };
}

export function forwardSubstitution(L: Mat, b: Vec): Vec {
  const n = rows(L);
  const y = Array.from({ length: n }, () => 0);
  for (let i = 0; i < n; i++) {
    let s = b[i] ?? 0;
    for (let j = 0; j < i; j++) s -= L[i]![j]! * y[j]!;
    const d = L[i]![i]!;
    y[i] = Math.abs(d) < LSQ_EPS ? 0 : s / d;
  }
  return y;
}

export function backSubstitution(U: Mat, y: Vec): Vec {
  const n = rows(U);
  const x = Array.from({ length: n }, () => 0);
  for (let i = n - 1; i >= 0; i--) {
    let s = y[i] ?? 0;
    for (let j = i + 1; j < n; j++) s -= U[i]![j]! * x[j]!;
    const d = U[i]![i]!;
    x[i] = Math.abs(d) < LSQ_EPS ? 0 : s / d;
  }
  return x;
}

/** Jacobi eigendecomposition for small symmetric matrices (signed eigenvalues). */
export function symmetricEig(A: Mat): { values: number[]; Q: Mat } {
  const n = rows(A);
  const S = cloneMat(A);
  // Enforce symmetry numerically
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const avg = 0.5 * (S[i]![j]! + S[j]![i]!);
      S[i]![j] = avg;
      S[j]![i] = avg;
    }
  }
  const Q = identity(n);
  for (let iter = 0; iter < 48; iter++) {
    let p = 0;
    let q = 1;
    let maxOff = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = Math.abs(S[i]![j]!);
        if (a > maxOff) {
          maxOff = a;
          p = i;
          q = j;
        }
      }
    }
    if (maxOff < 1e-14) break;
    const app = S[p]![p]!;
    const aqq = S[q]![q]!;
    const apq = S[p]![q]!;
    const tau = (aqq - app) / (2 * apq);
    const signTau = tau >= 0 ? 1 : -1;
    const t = signTau / (Math.abs(tau) + Math.sqrt(1 + tau * tau));
    const c = 1 / Math.sqrt(1 + t * t);
    const s = t * c;
    S[p]![p] = app - t * apq;
    S[q]![q] = aqq + t * apq;
    S[p]![q] = 0;
    S[q]![p] = 0;
    for (let k = 0; k < n; k++) {
      if (k === p || k === q) continue;
      const aik = S[k]![p]!;
      const aiq = S[k]![q]!;
      S[k]![p] = c * aik - s * aiq;
      S[p]![k] = S[k]![p]!;
      S[k]![q] = s * aik + c * aiq;
      S[q]![k] = S[k]![q]!;
    }
    for (let k = 0; k < n; k++) {
      const vip = Q[k]![p]!;
      const viq = Q[k]![q]!;
      Q[k]![p] = c * vip - s * viq;
      Q[k]![q] = s * vip + c * viq;
    }
  }
  const values = Array.from({ length: n }, (_, i) => S[i]![i]!);
  // Sort descending λ₁ ≥ λ₂ ≥ …
  const order = values
    .map((v, i) => ({ v, i }))
    .sort((a, b) => b.v - a.v)
    .map((o) => o.i);
  const sortedValues = order.map((i) => values[i]!);
  const sortedQ = zeros(n, n);
  for (let j = 0; j < n; j++) {
    const src = order[j]!;
    for (let i = 0; i < n; i++) sortedQ[i]![j] = Q[i]![src]!;
  }
  // Stabilize signs: first nonzero entry of each column ≥ 0
  for (let j = 0; j < n; j++) {
    let flip = false;
    for (let i = 0; i < n; i++) {
      if (Math.abs(sortedQ[i]![j]!) > 1e-12) {
        flip = sortedQ[i]![j]! < 0;
        break;
      }
    }
    if (flip) {
      for (let i = 0; i < n; i++) sortedQ[i]![j]! *= -1;
    }
  }
  return { values: sortedValues, Q: sortedQ };
}

export function formatMat(A: Mat, digits = 2): string {
  return A.map((r) => `[${r.map((v) => formatNum(v, digits)).join(' ')}]`).join('\n');
}
