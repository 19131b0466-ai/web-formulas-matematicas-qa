/** SI formatting for physics viz readouts. */

const PREFIX = [
  { scale: 1e12, sym: 'p' },
  { scale: 1e9, sym: 'n' },
  { scale: 1e6, sym: 'µ' },
  { scale: 1e3, sym: 'm' },
  { scale: 1, sym: '' },
  { scale: 1e-3, sym: 'k' },
  { scale: 1e-6, sym: 'M' },
  { scale: 1e-9, sym: 'G' },
] as const;

function pickPrefix(abs: number, baseUnit: string): { value: number; unit: string } {
  if (!Number.isFinite(abs) || abs === 0) return { value: 0, unit: baseUnit };
  for (const p of PREFIX) {
    const v = abs / p.scale;
    if (v >= 0.01 && v < 1000) {
      const sign = abs < 0 ? -1 : 1;
      return { value: sign * v, unit: `${p.sym}${baseUnit}` };
    }
  }
  return { value: abs, unit: baseUnit };
}

export function formatValue(value: number, unit: string, decimals = 3): string {
  if (!Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  if (abs === 0) return `0 ${unit}`;
  if (abs >= 1e4 || abs < 1e-4) return `${value.toExponential(decimals - 1)} ${unit}`;
  const { value: scaled, unit: u } = pickPrefix(value, unit);
  const d = Math.abs(scaled) >= 100 ? 0 : Math.abs(scaled) >= 10 ? 1 : decimals;
  return `${parseFloat(scaled.toFixed(d))} ${u}`;
}

export function formatCapacitance(c: number): string {
  return formatValue(c, 'F', 3);
}

export function formatCharge(q: number): string {
  return formatValue(q, 'C', 3);
}

export function formatVoltage(v: number): string {
  return formatValue(v, 'V', 3);
}

export function formatEnergy(j: number): string {
  return formatValue(j, 'J', 3);
}

export function formatPressure(pa: number): string {
  return formatValue(pa, 'Pa', 3);
}

export function formatFlowRate(q: number): string {
  return formatValue(q, 'm³/s', 3);
}

export function formatPercent(frac: number): string {
  if (!Number.isFinite(frac)) return '—';
  return `${(frac * 100).toFixed(1)} %`;
}
