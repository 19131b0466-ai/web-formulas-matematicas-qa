'use client';

import { dot, norm, normalize, project, scale, sub, type Vec2 } from './math2d';

export const ORT_EPS = 1e-8;
export const ORT_NEAR = 1e-4;

export function formatPair(p: Vec2, digits = 2): string {
  const f = (n: number) => {
    if (Math.abs(n) < ORT_EPS) return '0';
    const r = Math.round(n);
    if (Math.abs(n - r) < 1e-8) return String(r);
    return Number(n.toFixed(digits)).toString();
  };
  return `(${f(p.x)}, ${f(p.y)})`;
}

export function formatNum(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '—';
  if (Math.abs(n) < ORT_EPS) return '0';
  const r = Math.round(n);
  if (Math.abs(n - r) < 1e-8 && Math.abs(n) < 1e6) return String(r);
  return Number(n.toFixed(digits)).toString();
}

/** Relative orthogonality: |u·v| ≤ ε ‖u‖‖v‖ */
export function isOrthogonal(u: Vec2, v: Vec2, eps = ORT_NEAR): boolean {
  const nu = norm(u);
  const nv = norm(v);
  if (nu < ORT_EPS || nv < ORT_EPS) return Math.abs(dot(u, v)) < ORT_EPS;
  return Math.abs(dot(u, v)) <= eps * nu * nv;
}

export function isNearZero(v: Vec2, eps = ORT_EPS): boolean {
  return norm(v) < eps;
}

export function isParallel(u: Vec2, v: Vec2, eps = ORT_NEAR): boolean {
  const nu = norm(u);
  const nv = norm(v);
  if (nu < ORT_EPS || nv < ORT_EPS) return false;
  const c = Math.abs(dot(u, v)) / (nu * nv);
  return c > 1 - eps;
}

export type AngleKind = 'acute' | 'right' | 'obtuse' | 'undefined';

export function classifyDot(u: Vec2, v: Vec2): {
  kind: AngleKind;
  dot: number;
  thetaDeg: number | null;
} {
  const d = dot(u, v);
  const nu = norm(u);
  const nv = norm(v);
  if (nu < ORT_EPS || nv < ORT_EPS) {
    return { kind: 'undefined', dot: d, thetaDeg: null };
  }
  if (isOrthogonal(u, v)) {
    return { kind: 'right', dot: d, thetaDeg: 90 };
  }
  const cos = Math.max(-1, Math.min(1, d / (nu * nv)));
  const thetaDeg = (Math.acos(cos) * 180) / Math.PI;
  if (d > 0) return { kind: 'acute', dot: d, thetaDeg };
  return { kind: 'obtuse', dot: d, thetaDeg };
}

export function perpPlus(u: Vec2): Vec2 {
  return { x: -u.y, y: u.x };
}

export function perpMinus(u: Vec2): Vec2 {
  return { x: u.y, y: -u.x };
}

export function rotateToPerp(u: Vec2, v: Vec2, sign: 1 | -1 = 1): Vec2 {
  const nu = norm(u);
  const nv = norm(v);
  if (nu < ORT_EPS) return v;
  const dir = normalize(sign === 1 ? perpPlus(u) : perpMinus(u));
  return scale(dir, nv > ORT_EPS ? nv : 1);
}

export type ProjectionResult = {
  valid: boolean;
  coeff: number;
  proj: Vec2;
  residual: Vec2;
  orthoDot: number;
};

export function orthogonalProjection(u: Vec2, v: Vec2): ProjectionResult {
  const vv = dot(v, v);
  if (vv < ORT_EPS) {
    return { valid: false, coeff: 0, proj: { x: 0, y: 0 }, residual: u, orthoDot: 0 };
  }
  const coeff = dot(u, v) / vv;
  const proj = scale(v, coeff);
  const residual = sub(u, proj);
  return { valid: true, coeff, proj, residual, orthoDot: dot(residual, v) };
}

export { project, dot, norm, normalize, scale, sub };
