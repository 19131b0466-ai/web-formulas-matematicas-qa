/** Pure physics helpers for Lote 4 visualizations (unit-tested). */

import { G_NEWTON } from './physMath';

export function gravitationForce(m1: number, m2: number, r: number, G = G_NEWTON): number {
  if (r <= 0) return NaN;
  return (G * m1 * m2) / (r * r);
}

export function gravitationPotential(M: number, m: number, r: number, G = G_NEWTON): number {
  if (r <= 0) return NaN;
  return (-G * M * m) / r;
}

export function particleInertiaContribution(m: number, r: number): number {
  return m * r * r;
}

export function momentOfInertiaParticles(masses: number[], radii: number[]): number {
  return masses.reduce((sum, m, i) => sum + particleInertiaContribution(m, radii[i] ?? 0), 0);
}

export function inclinedWeightComponents(mg: number, thetaRad: number): { parallel: number; perpendicular: number } {
  return { parallel: mg * Math.sin(thetaRad), perpendicular: mg * Math.cos(thetaRad) };
}

export function kirchhoffLoopVoltage(emf: number, I: number, R1: number, R2: number, clockwise = true): number {
  const s = clockwise ? 1 : -1;
  return s * emf - I * R1 - I * R2;
}

export function dotProductFromMagnitudes(aMag: number, bMag: number, cosTheta: number): number {
  return aMag * bMag * cosTheta;
}

export function crossProductMagnitude(aMag: number, bMag: number, sinTheta: number): number {
  return aMag * bMag * Math.abs(sinTheta);
}

export function impulseFromConstantForce(F: number, dt: number): number {
  return F * dt;
}

export function impulseFromTriangularPeak(Fmax: number, dt: number): number {
  return 0.5 * Fmax * dt;
}
