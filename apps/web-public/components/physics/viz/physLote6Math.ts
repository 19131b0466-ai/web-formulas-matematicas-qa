/** Pure physics helpers for Lote 6 visualizations (unit-tested). */

import { KE, R_GAS } from './physMath';

export function pathDifference(r1: number, r2: number): number {
  return Math.abs(r1 - r2);
}

export type InterferenceKind = 'constructive' | 'destructive' | 'partial';

export function interferenceKind(deltaR: number, lambda: number, tol = 0.08): InterferenceKind {
  if (lambda <= 0 || !Number.isFinite(deltaR)) return 'partial';
  const m = deltaR / lambda;
  const nearInt = Math.abs(m - Math.round(m)) < tol;
  const nearHalf = Math.abs(m - Math.round(m - 0.5) - 0.5) < tol;
  if (nearInt) return 'constructive';
  if (nearHalf) return 'destructive';
  return 'partial';
}

export function dopplerObservedFrequency(
  f: number,
  vSound: number,
  vs: number,
  vo: number,
  srcTowardObs: boolean,
  obsTowardSrc: boolean,
): number {
  const num = vSound + (obsTowardSrc ? vo : -vo);
  const den = vSound - (srcTowardObs ? vs : -vs);
  if (den <= 0) return NaN;
  return f * (num / den);
}

export function beatFrequency(f1: number, f2: number): number {
  return Math.abs(f1 - f2);
}

export function openTubeWavelength(n: number, L: number): number {
  return (2 * L) / n;
}

export function openTubeFrequency(n: number, L: number, v: number): number {
  if (n <= 0 || L <= 0) return NaN;
  return (n * v) / (2 * L);
}

export function closedTubeWavelength(n: number, L: number): number {
  if (n % 2 === 0) return NaN;
  return (4 * L) / n;
}

export function closedTubeFrequency(n: number, L: number, v: number): number {
  if (n <= 0 || L <= 0 || n % 2 === 0) return NaN;
  return (n * v) / (4 * L);
}

export function workIsobar(P: number, Vi: number, Vf: number): number {
  return P * (Vf - Vi);
}

export function workIsothermal(n: number, T: number, Vi: number, Vf: number, R = R_GAS): number {
  if (Vi <= 0 || Vf <= 0) return NaN;
  return n * R * T * Math.log(Vf / Vi);
}

export function adiabaticPressure(Pi: number, Vi: number, V: number, gamma: number): number {
  if (V <= 0 || Vi <= 0) return NaN;
  return Pi * Math.pow(Vi / V, gamma);
}

export function adiabaticFinalTemperature(Ti: number, Vi: number, Vf: number, gamma: number): number {
  if (Vi <= 0 || Vf <= 0) return NaN;
  return Ti * Math.pow(Vi / Vf, gamma - 1);
}

export function coulombForceMagnitude(q1: number, q2: number, r: number, k = KE): number {
  if (r <= 0) return NaN;
  return (k * Math.abs(q1 * q2)) / (r * r);
}

export function coulombIsAttractive(q1: number, q2: number): boolean {
  return q1 * q2 < 0;
}

export function electricFieldMagnitude(Q: number, r: number, k = KE): number {
  if (r <= 0) return NaN;
  return (k * Math.abs(Q)) / (r * r);
}

export function forceOnCharge(q: number, E: number): number {
  return q * E;
}
