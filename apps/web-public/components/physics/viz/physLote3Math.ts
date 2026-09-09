/** Pure physics helpers for Lote 3 visualizations (unit-tested). */

import { G } from './physMath';

export function beamSupports(W1: number, x1: number, W2: number, x2: number, L: number): { N1: number; N2: number } {
  const N2 = (W1 * x1 + W2 * x2) / L;
  const N1 = W1 + W2 - N2;
  return { N1, N2 };
}

export function torqueAboutPivot(x: number, F: number, pivot: number): number {
  return (x - pivot) * F;
}

export function bernoulliHead(P: number, rho: number, v: number, y: number): number {
  return P + 0.5 * rho * v * v + rho * G * y;
}

export function totalLinearMomentum(m1: number, v1: number, m2: number, v2: number): number {
  return m1 * v1 + m2 * v2;
}

export function totalKineticEnergy(m1: number, v1: number, m2: number, v2: number): number {
  return 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;
}

export function stress(F: number, A: number): number {
  if (A <= 0) return NaN;
  return F / A;
}

export function strain(dL: number, L0: number): number {
  if (L0 <= 0) return NaN;
  return dL / L0;
}

export function youngModulus(sigma: number, epsilon: number): number {
  if (epsilon === 0) return NaN;
  return sigma / epsilon;
}

export function kirchhoffNodeCurrent(I1: number, I2: number): number {
  return I1 - I2;
}
