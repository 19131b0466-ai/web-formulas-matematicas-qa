/** Pure physics helpers for Lote 7 visualizations (unit-tested). */

export function seriesResistance(R1: number, R2: number): number {
  return R1 + R2;
}

export function parallelResistance(R1: number, R2: number): number {
  if (R1 <= 0 || R2 <= 0) return NaN;
  return 1 / (1 / R1 + 1 / R2);
}

export function circuitCurrent(emf: number, Req: number): number {
  if (Req <= 0) return NaN;
  return emf / Req;
}

export function voltageDrop(I: number, R: number): number {
  return I * R;
}

export function branchCurrent(V: number, R: number): number {
  if (R <= 0) return NaN;
  return V / R;
}

export function capacitorEnergyCV(C: number, V: number): number {
  return 0.5 * C * V * V;
}

export function capacitorEnergyQC(Q: number, C: number): number {
  if (C <= 0) return NaN;
  return (Q * Q) / (2 * C);
}

export function capacitorEnergyQV(Q: number, V: number): number {
  return 0.5 * Q * V;
}

export function capacitorVoltageFromQ(Q: number, C: number): number {
  if (C <= 0) return NaN;
  return Q / C;
}

export function capacitorChargeFromV(C: number, V: number): number {
  return C * V;
}
