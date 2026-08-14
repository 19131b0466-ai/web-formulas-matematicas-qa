'use client';

import type { ReactNode } from 'react';
import { fmt } from './controls';

export type Matrix = number[][];
export type CellPos = { i: number; j: number }; // 0-based

export function present(n: number, d = 2): string {
  if (!Number.isFinite(n)) return '—';
  const r = Number(n.toFixed(d));
  if (Math.abs(r) < 5e-10) return '0';
  if (Math.abs(r - Math.round(r)) < 1e-9 && Math.abs(r) < 1e6) return fmt(Math.round(r), 0);
  return fmt(r, d);
}

export function sub(i: number): string {
  return '₀₁₂₃₄₅₆₇₈₉'[i] ?? String(i);
}

export function aLabel(i: number, j: number): string {
  return `a${sub(i + 1)}${sub(j + 1)}`;
}

export function dims(m: Matrix): { rows: number; cols: number } {
  return { rows: m.length, cols: m[0]?.length ?? 0 };
}

export function createMatrix(rows: number, cols: number, fill = 0): Matrix {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => fill));
}

export function cloneMatrix(m: Matrix): Matrix {
  return m.map((r) => [...r]);
}

export function resizeMatrix(m: Matrix, rows: number, cols: number, fill = 0): Matrix {
  const next = createMatrix(rows, cols, fill);
  for (let i = 0; i < Math.min(rows, m.length); i++) {
    for (let j = 0; j < Math.min(cols, m[i]?.length ?? 0); j++) {
      next[i]![j] = m[i]![j]!;
    }
  }
  return next;
}

export function setCell(m: Matrix, i: number, j: number, value: number): Matrix {
  const next = cloneMatrix(m);
  if (next[i]) next[i]![j] = value;
  return next;
}

export function getRow(m: Matrix, i: number): number[] {
  return [...(m[i] ?? [])];
}

export function getCol(m: Matrix, j: number): number[] {
  return m.map((r) => r[j] ?? 0);
}

export function transpose(m: Matrix): Matrix {
  const { rows, cols } = dims(m);
  const t = createMatrix(cols, rows);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) t[j]![i] = m[i]![j]!;
  }
  return t;
}

export function addMatrices(a: Matrix, b: Matrix): Matrix | null {
  const da = dims(a);
  const db = dims(b);
  if (da.rows !== db.rows || da.cols !== db.cols) return null;
  return a.map((row, i) => row.map((v, j) => v + (b[i]?.[j] ?? 0)));
}

export function scalarMultiply(m: Matrix, c: number): Matrix {
  return m.map((row) => row.map((v) => v * c));
}

export function multiplyMatrices(a: Matrix, b: Matrix): Matrix | null {
  const da = dims(a);
  const db = dims(b);
  if (da.cols !== db.rows) return null;
  const out = createMatrix(da.rows, db.cols);
  for (let i = 0; i < da.rows; i++) {
    for (let j = 0; j < db.cols; j++) {
      let s = 0;
      for (let k = 0; k < da.cols; k++) s += (a[i]?.[k] ?? 0) * (b[k]?.[j] ?? 0);
      out[i]![j] = s;
    }
  }
  return out;
}

export function identity(n: number): Matrix {
  const I = createMatrix(n, n, 0);
  for (let i = 0; i < n; i++) I[i]![i] = 1;
  return I;
}

export function matricesEqual(a: Matrix, b: Matrix, eps = 1e-9): boolean {
  const da = dims(a);
  const db = dims(b);
  if (da.rows !== db.rows || da.cols !== db.cols) return false;
  for (let i = 0; i < da.rows; i++) {
    for (let j = 0; j < da.cols; j++) {
      if (Math.abs((a[i]?.[j] ?? 0) - (b[i]?.[j] ?? 0)) > eps) return false;
    }
  }
  return true;
}

export function parseCellInput(raw: string, fallback: number): number {
  const t = raw.trim().replace(',', '.');
  if (t === '' || t === '-' || t === '.' || t === '-.') return fallback;
  const n = Number(t);
  return Number.isFinite(n) ? n : fallback;
}

export function dimSuperscript(rows: number, cols: number): string {
  const map: Record<string, string> = {
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
  const to = (n: number) =>
    String(n)
      .split('')
      .map((c) => map[c] ?? c)
      .join('');
  return `${to(rows)}ˣ${to(cols)}`;
}

export function matrixTypeLabel(rows: number, cols: number): string {
  if (rows === 1 && cols === 1) return 'Matriz 1×1';
  if (rows === 1) return 'Matriz fila';
  if (cols === 1) return 'Matriz columna';
  if (rows === cols) return 'Matriz cuadrada';
  return 'Matriz rectangular';
}

type Highlight =
  | { kind: 'cell'; i: number; j: number }
  | { kind: 'row'; i: number }
  | { kind: 'col'; j: number }
  | { kind: 'pair'; i: number; j: number } // cell + transpose partner
  | { kind: 'diag' }
  | { kind: 'cells'; cells: Array<[number, number]> };

export function MatrixBrackets({
  children,
  label,
  dimLabel,
  className = '',
}: {
  children: ReactNode;
  label?: string;
  dimLabel?: string;
  className?: string;
}) {
  return (
    <div className={`inline-flex flex-col items-center gap-1 ${className}`}>
      {label ? (
        <p className="font-mono text-sm font-semibold text-[var(--fg)]">
          {label}
          {dimLabel ? <span className="ml-1 font-normal text-[var(--fg-muted)]">{dimLabel}</span> : null}
        </p>
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
        {children}
      </div>
    </div>
  );
}

export function MatrixGrid({
  matrix,
  onChange,
  editable = false,
  selected,
  hover,
  highlightRow,
  highlightCol,
  highlightCells,
  highlightDiag,
  onSelect,
  onHover,
  onRowIndexClick,
  onColIndexClick,
  showIndices = true,
  readOnlyStyle = false,
  name = 'A',
  cellSize = 'md',
}: {
  matrix: Matrix;
  onChange?: (m: Matrix) => void;
  editable?: boolean;
  selected?: CellPos | null;
  hover?: CellPos | null;
  highlightRow?: number | null;
  highlightCol?: number | null;
  highlightCells?: Array<[number, number]>;
  highlightDiag?: boolean;
  onSelect?: (pos: CellPos | null) => void;
  onHover?: (pos: CellPos | null) => void;
  onRowIndexClick?: (i: number) => void;
  onColIndexClick?: (j: number) => void;
  showIndices?: boolean;
  readOnlyStyle?: boolean;
  name?: string;
  cellSize?: 'sm' | 'md';
}) {
  const { rows, cols } = dims(matrix);
  const w = cellSize === 'sm' ? 'w-12' : 'w-14';
  const h = cellSize === 'sm' ? 'h-9' : 'h-10';
  const text = cellSize === 'sm' ? 'text-xs' : 'text-sm';

  const isHi = (i: number, j: number) =>
    highlightCells?.some(([r, c]) => r === i && c === j) ||
    (highlightDiag && i === j) ||
    false;

  return (
    <div className="overflow-x-auto">
      <div className="inline-grid gap-1" style={{ gridTemplateColumns: showIndices ? `auto repeat(${cols}, auto)` : `repeat(${cols}, auto)` }}>
        {showIndices ? <div /> : null}
        {showIndices
          ? Array.from({ length: cols }, (_, j) => (
              <button
                key={`c${j}`}
                type="button"
                onClick={() => onColIndexClick?.(j)}
                className="px-1 text-center font-mono text-[10px] text-[var(--fg-muted)] hover:text-[var(--accent-strong)]"
                aria-label={`Columna ${j + 1}`}
              >
                {j + 1}
              </button>
            ))
          : null}

        {matrix.map((row, i) => (
          <div key={`r${i}`} className="contents">
            {showIndices ? (
              <button
                type="button"
                onClick={() => onRowIndexClick?.(i)}
                className="pr-1 text-right font-mono text-[10px] text-[var(--fg-muted)] hover:text-[var(--accent-strong)]"
                aria-label={`Fila ${i + 1}`}
              >
                {i + 1}
              </button>
            ) : null}
            {row.map((v, j) => {
              const sel = selected?.i === i && selected?.j === j;
              const hov = hover?.i === i && hover?.j === j;
              const inRow = highlightRow === i;
              const inCol = highlightCol === j;
              const pair = isHi(i, j);
              const bg =
                sel || pair
                  ? 'bg-[var(--accent-soft)] border-[var(--accent-strong)]'
                  : inRow && inCol
                    ? 'bg-[var(--accent-soft)] border-[var(--accent-strong)]/60'
                    : inRow
                      ? 'bg-[var(--accent-soft)]/50 border-[var(--border)]'
                      : inCol
                        ? 'bg-teal/10 border-[var(--border)]'
                        : hov
                          ? 'bg-[var(--accent-soft)]/40 border-[var(--border)]'
                          : readOnlyStyle
                            ? 'bg-[var(--bg)]/60 border-[var(--border)]'
                            : 'bg-[var(--bg)] border-[var(--border)]';

              const common = `${w} ${h} ${text} rounded border text-center font-mono tabular-nums transition ${bg}`;

              if (editable && onChange) {
                return (
                  <input
                    key={`${i}-${j}`}
                    type="text"
                    inputMode="decimal"
                    value={Number.isFinite(v) ? present(v) : ''}
                    aria-label={`${name}, fila ${i + 1}, columna ${j + 1}, valor ${present(v)}`}
                    onFocus={() => onSelect?.({ i, j })}
                    onMouseEnter={() => onHover?.({ i, j })}
                    onMouseLeave={() => onHover?.(null)}
                    onChange={(e) => {
                      const next = parseCellInput(e.target.value, v);
                      onChange(setCell(matrix, i, j, next));
                      onSelect?.({ i, j });
                    }}
                    className={`${common} focus:outline-none focus:ring-2 focus:ring-[var(--accent-strong)]/40`}
                  />
                );
              }

              return (
                <button
                  key={`${i}-${j}`}
                  type="button"
                  aria-label={`${name}, fila ${i + 1}, columna ${j + 1}, valor ${present(v)}`}
                  onClick={() => onSelect?.({ i, j })}
                  onMouseEnter={() => onHover?.({ i, j })}
                  onMouseLeave={() => onHover?.(null)}
                  className={`${common} cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent-strong)]/40`}
                >
                  {present(v)}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export type { Highlight };
