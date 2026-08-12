import { fmt } from './controls';

export function present(n: number, d = 2): string {
  if (!Number.isFinite(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1e5 || (abs > 0 && abs < 1e-3)) {
    const exp = Math.floor(Math.log10(abs));
    const mant = n / 10 ** exp;
    return `${fmt(Number(mant.toFixed(2)), 2)}×10${expToSup(exp)}`;
  }
  const r = Number(n.toFixed(d));
  if (Math.abs(r - Math.round(r)) < 1e-9 && Math.abs(r) < 1e6) return fmt(Math.round(r), 0);
  return fmt(r, d);
}

function expToSup(e: number): string {
  const map: Record<string, string> = {
    '-': '⁻',
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
  };
  return String(e)
    .split('')
    .map((c) => map[c] ?? c)
    .join('');
}

export function snap(v: number, min: number, max: number, step: number): number {
  const c = Math.min(max, Math.max(min, v));
  const s = min + Math.round((c - min) / step) * step;
  return Number(s.toFixed(4));
}

export function formatSignedCoeff(v: number, symbol: string): string {
  if (Math.abs(v) < 1e-9) return '';
  if (Math.abs(v - 1) < 1e-9) return `+${symbol}`;
  if (Math.abs(v + 1) < 1e-9) return `−${symbol}`;
  const sign = v >= 0 ? '+' : '−';
  return `${sign}${present(Math.abs(v))}${symbol}`;
}

/** Format a_n = b·a_{n-1} + c·a_{n-2} with clean signs. */
export function formatRecurrence(b: number, c: number): string {
  const left = 'aₙ';
  let right = '';
  if (Math.abs(b) < 1e-9) {
    // no b term
  } else if (Math.abs(b - 1) < 1e-9) {
    right += 'aₙ₋₁';
  } else if (Math.abs(b + 1) < 1e-9) {
    right += '−aₙ₋₁';
  } else {
    right += `${present(b)}aₙ₋₁`;
  }
  if (Math.abs(c) >= 1e-9) {
    if (!right) {
      if (Math.abs(c - 1) < 1e-9) right = 'aₙ₋₂';
      else if (Math.abs(c + 1) < 1e-9) right = '−aₙ₋₂';
      else right = `${present(c)}aₙ₋₂`;
    } else if (Math.abs(c - 1) < 1e-9) right += '+aₙ₋₂';
    else if (Math.abs(c + 1) < 1e-9) right += '−aₙ₋₂';
    else if (c > 0) right += `+${present(c)}aₙ₋₂`;
    else right += `−${present(Math.abs(c))}aₙ₋₂`;
  }
  if (!right) right = '0';
  return `${left}=${right}`;
}

export function yExtent(values: number[], pad = 0.12): { yMin: number; yMax: number } {
  const finite = values.filter((v) => Number.isFinite(v));
  if (!finite.length) return { yMin: -1, yMax: 1 };
  let lo = Math.min(...finite, 0);
  let hi = Math.max(...finite, 0);
  if (Math.abs(hi - lo) < 1e-9) {
    lo -= 1;
    hi += 1;
  }
  const span = hi - lo;
  return { yMin: lo - span * pad, yMax: hi + span * pad };
}
