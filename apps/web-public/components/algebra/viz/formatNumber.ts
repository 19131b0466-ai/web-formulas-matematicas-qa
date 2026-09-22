/** Shared viz number formatting. Trailing zeros after a decimal are cosmetic; zeros in integers are significant. */

export function fmt(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '—';
  const a = Math.abs(n);
  if (a !== 0 && (a >= 1000 || a < 0.01)) return n.toExponential(2);
  const s = n.toFixed(digits);
  return (s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s) || '0';
}

export function present(n: number, d = 2): string {
  if (!Number.isFinite(n)) return '—';
  const r = Number(n.toFixed(d));
  if (Math.abs(r) < 5e-3) return '0';
  if (Math.abs(r - Math.round(r)) < 1e-9 && Math.abs(r) < 1e6) return String(Math.round(r));
  return fmt(r, d);
}
