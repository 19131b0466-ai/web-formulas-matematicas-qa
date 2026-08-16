'use client';

import {
  applyMat,
  det2,
  dot,
  inv2,
  matMul,
  normalize,
  norm,
  scale,
  sub,
  transpose2,
  type Mat2,
  type Vec2,
} from './math2d';
import { DET_EPS, cloneMat2, matFromCols } from './detHelpers';
import { present as presentCell } from './matrixGrid';

export { DET_EPS, cloneMat2, matFromCols };
export {
  applyMat,
  det2,
  dot,
  inv2,
  matMul,
  normalize,
  norm,
  scale,
  sub,
  transpose2,
};

export const EIG_EPS = 1e-8;
export const EIG_NEAR = 1e-4;

export type EigenStatus =
  | 'diagonalizable'
  | 'not_diagonalizable'
  | 'complex'
  | 'degenerate';

export type EigenPair = { lambda: number; v: Vec2 };

export type EigenAnalysis = {
  status: EigenStatus;
  pairs: EigenPair[];
  /** Algebraic multiplicities matching pairs when repeated. */
  algMult: number[];
  /** Geometric multiplicity (dim eigenspace) per distinct λ. */
  geoMult: number[];
  P: Mat2 | null;
  Pinv: Mat2 | null;
  D: Mat2 | null;
  disc: number;
  tr: number;
  det: number;
};

export function I2(): Mat2 {
  return [
    [1, 0],
    [0, 1],
  ];
}

export function scalarMat(s: number): Mat2 {
  return [
    [s, 0],
    [0, s],
  ];
}

export function matSub(a: Mat2, b: Mat2): Mat2 {
  return [
    [a[0][0] - b[0][0], a[0][1] - b[0][1]],
    [a[1][0] - b[1][0], a[1][1] - b[1][1]],
  ];
}

export function isSymmetric(A: Mat2, eps = EIG_NEAR): boolean {
  return Math.abs(A[0][1] - A[1][0]) < eps;
}

export function formatPair(p: Vec2, digits = 2): string {
  const f = (n: number) => {
    if (Math.abs(n) < EIG_EPS) return '0';
    const r = Math.round(n);
    if (Math.abs(n - r) < 1e-8) return String(r);
    return presentCell(Number(n.toFixed(digits)));
  };
  return `(${f(p.x)}, ${f(p.y)})`;
}

export function formatNum(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '—';
  if (Math.abs(n) < EIG_EPS) return '0';
  const r = Math.round(n);
  if (Math.abs(n - r) < 1e-8 && Math.abs(n) < 1e6) return String(r);
  return presentCell(Number(n.toFixed(digits)));
}

/** Deterministic sign: first nonzero component ≥ 0. */
export function stabilizeSign(v: Vec2): Vec2 {
  const n = normalize(v);
  if (norm(n) < EIG_EPS) return { x: 0, y: 0 };
  if (n.x < -EIG_EPS || (Math.abs(n.x) < EIG_EPS && n.y < 0)) return scale(n, -1);
  return n;
}

/** Continuity vs previous vector (avoid q → −q flicker). */
export function continueSign(prev: Vec2 | null, next: Vec2): Vec2 {
  const n = stabilizeSign(next);
  if (!prev || norm(prev) < EIG_EPS) return n;
  return dot(prev, n) < 0 ? scale(n, -1) : n;
}

export function charPolyCoeffs(A: Mat2): { tr: number; det: number } {
  return { tr: A[0][0] + A[1][1], det: det2(A) };
}

/** p(λ) = det(A − λI) = λ² − tr λ + det */
export function charPolyAt(A: Mat2, lambda: number): number {
  const { tr, det } = charPolyCoeffs(A);
  return lambda * lambda - tr * lambda + det;
}

export function AminusLambdaI(A: Mat2, lambda: number): Mat2 {
  return matSub(A, scalarMat(lambda));
}

/** Nullspace basis of 2×2 matrix (0, 1 or 2 vectors). */
export function nullspace2(M: Mat2): Vec2[] {
  const a = M[0][0];
  const b = M[0][1];
  const c = M[1][0];
  const d = M[1][1];
  const det = a * d - b * c;
  if (Math.abs(det) > EIG_EPS) return [];
  const rowAbs = Math.abs(a) + Math.abs(b);
  const row2Abs = Math.abs(c) + Math.abs(d);
  if (rowAbs < EIG_EPS && row2Abs < EIG_EPS) {
    return [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ];
  }
  // Prefer first nonzero row
  if (rowAbs >= row2Abs) {
    if (Math.abs(a) + Math.abs(b) < EIG_EPS) return [{ x: 1, y: 0 }];
    // a x + b y = 0 → (-b, a) or (b, -a)
    return [stabilizeSign({ x: -b, y: a })];
  }
  return [stabilizeSign({ x: -d, y: c })];
}

function eigenvectorFor(A: Mat2, lambda: number): Vec2 {
  const ns = nullspace2(AminusLambdaI(A, lambda));
  if (ns.length >= 1 && norm(ns[0]!) > EIG_EPS) return stabilizeSign(ns[0]!);
  // Fallback: (A−λI) nearly singular — use cofactor approach
  const a = A[0][0] - lambda;
  const b = A[0][1];
  if (Math.abs(a) + Math.abs(b) > EIG_EPS) return stabilizeSign({ x: -b, y: a });
  return stabilizeSign({ x: A[1][1] - lambda, y: -A[1][0] });
}

/**
 * Full 2×2 real eigen analysis with diagonalizability.
 * Orders λ₁ ≥ λ₂ when both real.
 */
export function analyzeEigen(A: Mat2, prev?: EigenPair[] | null): EigenAnalysis {
  const tr = A[0][0] + A[1][1];
  const det = det2(A);
  const disc = tr * tr - 4 * det;

  if (disc < -EIG_NEAR) {
    return {
      status: 'complex',
      pairs: [],
      algMult: [],
      geoMult: [],
      P: null,
      Pinv: null,
      D: null,
      disc,
      tr,
      det,
    };
  }

  // Scalar / near-scalar: every basis works
  const off = Math.abs(A[0][1]) + Math.abs(A[1][0]);
  const diagDiff = Math.abs(A[0][0] - A[1][1]);
  if (off < EIG_NEAR && diagDiff < EIG_NEAR) {
    const lam = (A[0][0] + A[1][1]) / 2;
    const q1 = continueSign(prev?.[0]?.v ?? null, { x: 1, y: 0 });
    const q2 = continueSign(prev?.[1]?.v ?? null, { x: 0, y: 1 });
    const P = matFromCols(q1, q2);
    return {
      status: 'degenerate',
      pairs: [
        { lambda: lam, v: q1 },
        { lambda: lam, v: q2 },
      ],
      algMult: [2, 2],
      geoMult: [2, 2],
      P,
      Pinv: I2(),
      D: scalarMat(lam),
      disc: Math.max(0, disc),
      tr,
      det,
    };
  }

  const s = Math.sqrt(Math.max(0, disc));
  let l1 = (tr + s) / 2;
  let l2 = (tr - s) / 2;
  // Order λ₁ ≥ λ₂
  if (l1 < l2) {
    const t = l1;
    l1 = l2;
    l2 = t;
  }

  const repeated = Math.abs(l1 - l2) < EIG_NEAR;

  if (repeated) {
    const lam = (l1 + l2) / 2;
    const ns = nullspace2(AminusLambdaI(A, lam));
    if (ns.length >= 2) {
      const q1 = continueSign(prev?.[0]?.v ?? null, ns[0]!);
      let q2 = continueSign(prev?.[1]?.v ?? null, ns[1]!);
      // Orthonormalize if needed for display
      if (Math.abs(dot(q1, q2)) > 0.9) {
        q2 = stabilizeSign({ x: -q1.y, y: q1.x });
      }
      const P = matFromCols(q1, q2);
      const Pinv = inv2(P);
      return {
        status: 'degenerate',
        pairs: [
          { lambda: lam, v: q1 },
          { lambda: lam, v: q2 },
        ],
        algMult: [2, 2],
        geoMult: [2, 2],
        P,
        Pinv,
        D: scalarMat(lam),
        disc: Math.max(0, disc),
        tr,
        det,
      };
    }
    // Defective: only 1D eigenspace
    const v1 = continueSign(prev?.[0]?.v ?? null, ns[0] ?? eigenvectorFor(A, lam));
    return {
      status: 'not_diagonalizable',
      pairs: [{ lambda: lam, v: v1 }],
      algMult: [2],
      geoMult: [1],
      P: null,
      Pinv: null,
      D: null,
      disc: Math.max(0, disc),
      tr,
      det,
    };
  }

  // Two distinct real eigenvalues → always diagonalizable over R
  const v1 = continueSign(prev?.[0]?.v ?? null, eigenvectorFor(A, l1));
  let v2 = continueSign(prev?.[1]?.v ?? null, eigenvectorFor(A, l2));
  // Ensure independence
  if (Math.abs(v1.x * v2.y - v1.y * v2.x) < EIG_EPS) {
    v2 = stabilizeSign({ x: -v1.y, y: v1.x });
  }
  const P = matFromCols(v1, v2);
  const Pinv = inv2(P);
  const D: Mat2 = [
    [l1, 0],
    [0, l2],
  ];
  return {
    status: Pinv ? 'diagonalizable' : 'not_diagonalizable',
    pairs: [
      { lambda: l1, v: v1 },
      { lambda: l2, v: v2 },
    ],
    algMult: [1, 1],
    geoMult: [1, 1],
    P: Pinv ? P : null,
    Pinv,
    D: Pinv ? D : null,
    disc: Math.max(0, disc),
    tr,
    det,
  };
}

/** Symmetric eigendecomposition A = Q Λ Qᵀ with orthonormal Q. */
export function analyzeSymmetric(
  A: Mat2,
  prev?: EigenPair[] | null,
): EigenAnalysis & { Q: Mat2; Lambda: Mat2; QTQ: Mat2 } {
  // Force symmetry
  const S: Mat2 = [
    [A[0][0], (A[0][1] + A[1][0]) / 2],
    [(A[0][1] + A[1][0]) / 2, A[1][1]],
  ];
  const base = analyzeEigen(S, prev);
  if (base.pairs.length === 0) {
    // Should not happen for real symmetric
    const Q = I2();
    return { ...base, status: 'complex', Q, Lambda: I2(), QTQ: I2() };
  }
  let q1 = normalize(base.pairs[0]!.v);
  let q2: Vec2;
  if (base.pairs.length >= 2 && Math.abs(base.pairs[0]!.lambda - base.pairs[1]!.lambda) > EIG_NEAR) {
    q2 = normalize(base.pairs[1]!.v);
    // Enforce orthogonality numerically
    q2 = normalize(sub(q2, scale(q1, dot(q1, q2))));
    if (norm(q2) < EIG_EPS) q2 = stabilizeSign({ x: -q1.y, y: q1.x });
  } else {
    q2 = stabilizeSign({ x: -q1.y, y: q1.x });
  }
  q1 = continueSign(prev?.[0]?.v ?? null, q1);
  q2 = continueSign(prev?.[1]?.v ?? null, q2);
  // Ensure right-handed / det(Q)>0 when possible
  if (q1.x * q2.y - q1.y * q2.x < 0) q2 = scale(q2, -1);

  const l1 = base.pairs[0]!.lambda;
  const l2 = base.pairs.length >= 2 ? base.pairs[1]!.lambda : l1;
  const Q = matFromCols(q1, q2);
  const Lambda: Mat2 = [
    [l1, 0],
    [0, l2],
  ];
  const QT = transpose2(Q);
  return {
    ...base,
    status: 'diagonalizable',
    pairs: [
      { lambda: l1, v: q1 },
      { lambda: l2, v: q2 },
    ],
    P: Q,
    Pinv: QT,
    D: Lambda,
    Q,
    Lambda,
    QTQ: matMul(QT, Q),
  };
}

export function reconstructPDP(P: Mat2, D: Mat2, Pinv: Mat2): Mat2 {
  return matMul(P, matMul(D, Pinv));
}

export function matPowDiag(D: Mat2, n: number): Mat2 {
  if (n === 0) return I2();
  const l1 = D[0][0];
  const l2 = D[1][1];
  // 0^n for n>0 is 0; avoid 0^0
  const p1 = l1 === 0 ? (n > 0 ? 0 : 1) : l1 ** n;
  const p2 = l2 === 0 ? (n > 0 ? 0 : 1) : l2 ** n;
  return [
    [p1, 0],
    [0, p2],
  ];
}

export function rayleigh(A: Mat2, v: Vec2): number {
  const n2 = dot(v, v);
  if (n2 < EIG_EPS) return 0;
  return dot(v, applyMat(A, v)) / n2;
}

export function eigenResidual(A: Mat2, v: Vec2, lambda: number): number {
  return norm(sub(applyMat(A, v), scale(v, lambda)));
}

export function isEigenvector(A: Mat2, v: Vec2, eps = EIG_NEAR): boolean {
  if (norm(v) < EIG_EPS) return false;
  const lam = rayleigh(A, v);
  return eigenResidual(A, v, lam) <= eps * (1 + Math.abs(lam)) * norm(v);
}

export function unitCircle(n = 64): Vec2[] {
  return Array.from({ length: n }, (_, i) => {
    const t = (2 * Math.PI * i) / n;
    return { x: Math.cos(t), y: Math.sin(t) };
  });
}

export function transformCircle(A: Mat2, n = 64): Vec2[] {
  return unitCircle(n).map((p) => applyMat(A, p));
}

export function effectLabel(lambda: number): string {
  if (Math.abs(lambda) < EIG_EPS) return 'Envía al origen';
  if (Math.abs(lambda - 1) < EIG_EPS) return 'Invariante';
  if (Math.abs(lambda + 1) < EIG_EPS) return 'Invierte el sentido';
  if (lambda > 1) return 'Estira';
  if (lambda > 0 && lambda < 1) return 'Contrae';
  if (lambda < -1) return 'Invierte y estira';
  return 'Invierte y contrae';
}

/** Quadratic roots of λ² − tr λ + det = 0 */
export function charRoots(A: Mat2): {
  kind: 'two_real' | 'repeated' | 'complex';
  roots: number[];
  disc: number;
} {
  const { tr, det } = charPolyCoeffs(A);
  const disc = tr * tr - 4 * det;
  if (disc < -EIG_NEAR) return { kind: 'complex', roots: [], disc };
  if (Math.abs(disc) <= EIG_NEAR) {
    return { kind: 'repeated', roots: [tr / 2], disc: 0 };
  }
  const s = Math.sqrt(disc);
  const r1 = (tr + s) / 2;
  const r2 = (tr - s) / 2;
  return { kind: 'two_real', roots: r1 >= r2 ? [r1, r2] : [r2, r1], disc };
}
