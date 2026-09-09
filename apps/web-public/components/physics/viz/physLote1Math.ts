/** Pure physics helpers for Lote 1 visualizations (unit-tested). */

import { EPS0, R_GAS } from './physMath';

export function vectorMagnitude(ax: number, ay: number, az = 0): number {
  return Math.sqrt(ax * ax + ay * ay + az * az);
}

export function linearMomentum(m: number, v: number): number {
  return m * v;
}

export function kineticEnergy(m: number, v: number): number {
  return 0.5 * m * v * v;
}

export function volumetricFlow(A: number, v: number): number {
  return A * v;
}

export function idealGasPressure(n: number, T: number, V: number): number {
  if (V <= 0) return NaN;
  return (n * R_GAS * T) / V;
}

export function capacitanceFromQV(Q: number, V: number): number {
  if (V === 0) return NaN;
  return Q / V;
}

export function parallelPlateCapacitance(A: number, d: number, kappa = 1): number {
  if (d <= 0) return NaN;
  return (kappa * EPS0 * A) / d;
}

export function angularMomentum(I: number, omega: number): number {
  return I * omega;
}

export function rotationalKineticEnergy(I: number, omega: number): number {
  return 0.5 * I * omega * omega;
}

export function rollingInertia(beta: number, m: number, R: number): number {
  return beta * m * R * R;
}

export function heatEngineWork(QH: number, QC: number): number {
  return QH - QC;
}

export function heatEngineEfficiency(QH: number, QC: number): number {
  if (QH <= 0) return NaN;
  return heatEngineWork(QH, QC) / QH;
}

export function isValidHeatEngine(QH: number, QC: number): boolean {
  return QH > 0 && QC >= 0 && QC <= QH;
}
