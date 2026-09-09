/** Pure physics helpers for Lote 5 visualizations (unit-tested). */

import { G, G_NEWTON } from './physMath';

export function orbitalMu(M: number, G = G_NEWTON): number {
  return G * M;
}

export function orbitalVelocity(mu: number, r: number): number {
  if (r <= 0) return NaN;
  return Math.sqrt(mu / r);
}

export function orbitalPeriod(mu: number, r: number): number {
  if (r <= 0 || mu <= 0) return NaN;
  return 2 * Math.PI * Math.sqrt((r * r * r) / mu);
}

export function escapeVelocity(mu: number, r: number): number {
  if (r <= 0) return NaN;
  return Math.sqrt((2 * mu) / r);
}

export function orbitalEnergy(mu: number, m: number, r: number, v: number): number {
  return 0.5 * m * v * v - (mu * m) / r;
}

export function hydrostaticPressure(P0: number, rho: number, h: number, g = G): number {
  return P0 + rho * g * h;
}

export function shmTotalEnergy(k: number, A: number): number {
  return 0.5 * k * A * A;
}

export function travelingWaveSpeed(lambda: number, f: number): number {
  return lambda * f;
}

export function waveSum(y1: number, y2: number): number {
  return y1 + y2;
}

export const FLUID_PRESETS = {
  water: { rho: 1000, label: 'water' },
  oil: { rho: 870, label: 'oil' },
  mercury: { rho: 13600, label: 'mercury' },
} as const;
