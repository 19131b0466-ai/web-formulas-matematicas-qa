'use client';

import { det2, type Mat2 } from './math2d';
import { present } from './matrixGrid';

export const DET_EPS = 1e-9;
export const NEAR_SINGULAR = 0.05;

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

/** Format n/d as simplified fraction string when both near-integers. */
export function formatFrac(num: number, den: number): string {
  if (!Number.isFinite(num) || !Number.isFinite(den) || Math.abs(den) < DET_EPS) return '—';
  const sign = num * den < 0 ? '-' : '';
  const n = Math.abs(num);
  const d = Math.abs(den);
  const nr = Math.round(n);
  const dr = Math.round(d);
  if (Math.abs(n - nr) < 1e-8 && Math.abs(d - dr) < 1e-8) {
    const g = gcd(nr, dr);
    const nn = nr / g;
    const dd = dr / g;
    if (dd === 1) return `${sign}${nn}`;
    return `${sign}${nn}/${dd}`;
  }
  return present(num / den);
}

export function formatSigned(n: number): string {
  if (Math.abs(n) < DET_EPS) return '0';
  return present(n);
}

export function mat2FromEntries(a: number, b: number, c: number, d: number): Mat2 {
  return [
    [a, b],
    [c, d],
  ];
}

export function cloneMat2(m: Mat2): Mat2 {
  return [
    [m[0][0], m[0][1]],
    [m[1][0], m[1][1]],
  ];
}

export function setMat2(m: Mat2, i: number, j: number, v: number): Mat2 {
  const next = cloneMat2(m);
  next[i]![j] = v;
  return next;
}

export function cols(m: Mat2): { u: { x: number; y: number }; v: { x: number; y: number } } {
  return {
    u: { x: m[0][0], y: m[1][0] },
    v: { x: m[0][1], y: m[1][1] },
  };
}

export function matFromCols(u: { x: number; y: number }, v: { x: number; y: number }): Mat2 {
  return [
    [u.x, v.x],
    [u.y, v.y],
  ];
}

export function rank2(m: Mat2): 0 | 1 | 2 {
  const d = Math.abs(det2(m));
  if (d > DET_EPS) return 2;
  const flat = [m[0][0], m[0][1], m[1][0], m[1][1]];
  if (flat.some((x) => Math.abs(x) > DET_EPS)) return 1;
  return 0;
}

export function orientationLabel(det: number): string {
  if (Math.abs(det) < DET_EPS) return 'degenerada';
  return det > 0 ? 'antihoraria' : 'horaria';
}

export function Mat2Editor({
  m,
  onChange,
  labels,
  highlightCol,
  highlightCells,
  name = 'A',
  readOnly = false,
}: {
  m: Mat2;
  onChange?: (m: Mat2) => void;
  labels?: [string, string];
  highlightCol?: number | null;
  highlightCells?: Array<[number, number]>;
  name?: string;
  readOnly?: boolean;
}) {
  const cell = (i: number, j: number) => {
    const hi =
      highlightCol === j || highlightCells?.some(([r, c]) => r === i && c === j);
    const cls = `w-14 h-10 rounded border text-center font-mono text-sm tabular-nums ${
      hi
        ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)]'
        : 'border-[var(--border)] bg-[var(--bg)]'
    }`;
    if (readOnly || !onChange) {
      return (
        <div key={`${i}-${j}`} className={`${cls} flex items-center justify-center`}>
          {formatSigned(m[i]![j]!)}
        </div>
      );
    }
    return (
      <input
        key={`${i}-${j}`}
        type="number"
        step="any"
        value={m[i]![j]!}
        aria-label={`${name}, fila ${i + 1}, columna ${j + 1}`}
        onChange={(e) => onChange(setMat2(m, i, j, Number(e.target.value) || 0))}
        className={`${cls} focus:outline-none focus:ring-2 focus:ring-[var(--accent-strong)]/40`}
      />
    );
  };

  return (
    <div className="inline-flex flex-col items-center gap-1">
      {labels ? (
        <div className="grid grid-cols-2 gap-2 pl-0">
          {labels.map((lab, j) => (
            <span
              key={lab}
              className={`text-center font-mono text-xs ${
                highlightCol === j ? 'font-semibold text-[var(--accent-strong)]' : 'text-[var(--fg-muted)]'
              }`}
            >
              {lab}
            </span>
          ))}
        </div>
      ) : null}
      <div className="relative px-3 py-1">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-2 rounded-l-[6px] border-y-2 border-l-2 border-[var(--fg-muted)] opacity-60"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-2 rounded-r-[6px] border-y-2 border-r-2 border-[var(--fg-muted)] opacity-60"
        />
        <div className="grid grid-cols-2 gap-2">
          {cell(0, 0)}
          {cell(0, 1)}
          {cell(1, 0)}
          {cell(1, 1)}
        </div>
      </div>
    </div>
  );
}
