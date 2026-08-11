'use client';

import { useMemo, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  ToggleRow,
  VizButton,
  VizPanel,
  fmt,
} from './controls';
import { det2, type Mat2 } from './math2d';

const ZERO_EPS = 1e-9;
const N = 2; // number of unknowns for this 2×2 lesson

type Kind = 'unique' | 'infinite' | 'none';
type Row3 = [number, number, number];

type Preset = {
  id: Kind;
  label: string;
  A: Mat2;
  b: [number, number];
};

const PRESETS: Preset[] = [
  {
    id: 'unique',
    label: 'Una solución',
    A: [
      [2, 1],
      [1, 3],
    ],
    b: [5, 4],
  },
  {
    id: 'infinite',
    label: 'Infinitas',
    A: [
      [1, 2],
      [2, 4],
    ],
    b: [3, 6],
  },
  {
    id: 'none',
    label: 'Sin solución',
    A: [
      [1, 2],
      [2, 4],
    ],
    b: [3, 7],
  },
];

function present(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '—';
  return fmt(Number(n.toFixed(digits)), digits);
}

function isZero(n: number): boolean {
  return Math.abs(n) < ZERO_EPS;
}

function rank2(m: Mat2): number {
  if (Math.abs(det2(m)) > ZERO_EPS) return 2;
  if (m.flat().some((x) => !isZero(x))) return 1;
  return 0;
}

function rankAug(m: Mat2, b: [number, number]): number {
  const a00 = m[0][0];
  const a01 = m[0][1];
  const b0 = b[0];
  const a10 = m[1][0];
  const a11 = m[1][1];
  const b1 = b[1];
  const minors = [
    a00 * a11 - a01 * a10,
    a00 * b1 - b0 * a10,
    a01 * b1 - b0 * a11,
  ];
  if (minors.some((x) => Math.abs(x) > ZERO_EPS)) return 2;
  if ([a00, a01, b0, a10, a11, b1].some((x) => !isZero(x))) return 1;
  return 0;
}

function classify(rA: number, rAug: number, n: number): Kind {
  if (rA !== rAug) return 'none';
  if (rA === n) return 'unique';
  return 'infinite';
}

function formatLin(a: number, b: number): string {
  const parts: string[] = [];
  if (!isZero(a)) {
    if (Math.abs(a) === 1) parts.push(a < 0 ? '−x' : 'x');
    else parts.push(`${present(a)}x`);
  }
  if (!isZero(b)) {
    const absB = present(Math.abs(b));
    const by = Math.abs(b) === 1 ? 'y' : `${absB}y`;
    if (parts.length === 0) parts.push(b < 0 ? `−${by}` : by);
    else parts.push(b < 0 ? `−${by}` : `+${by}`);
  }
  return parts.length ? parts.join('') : '0';
}

function formatEq(a: number, bCoef: number, rhs: number): string {
  return `${formatLin(a, bCoef)}=${present(rhs)}`;
}

function formatRow(r: Row3): string {
  return `[${present(r[0])} ${present(r[1])} ∣ ${present(r[2])}]`;
}

function rowNonzero(r: Row3): boolean {
  return r.some((x) => !isZero(x));
}

/** Brief Gaussian elimination on [A|b] for pedagogy (2×3). */
function echelonSteps(A: Mat2, b: [number, number]): {
  steps: string[];
  rows: [Row3, Row3];
  inconsistentRow: Row3 | null;
} {
  let r1: Row3 = [A[0][0], A[0][1], b[0]];
  let r2: Row3 = [A[1][0], A[1][1], b[1]];
  const steps: string[] = [`Inicio: R₁=${formatRow(r1)}, R₂=${formatRow(r2)}`];

  if (isZero(r1[0]) && !isZero(r2[0])) {
    const tmp = r1;
    r1 = r2;
    r2 = tmp;
    steps.push('R₁ ↔ R₂ (buscar pivote en la primera columna)');
  }

  if (!isZero(r1[0])) {
    const factor = r2[0] / r1[0];
    if (!isZero(factor)) {
      r2 = [r2[0] - factor * r1[0], r2[1] - factor * r1[1], r2[2] - factor * r1[2]];
      const c =
        Math.abs(factor - 1) < ZERO_EPS
          ? '1'
          : Math.abs(factor + 1) < ZERO_EPS
            ? '−1'
            : present(factor);
      steps.push(`R₂ ← R₂ − (${c})R₁ → R₂=${formatRow(r2)}`);
    }
  } else if (!isZero(r1[1]) && !isZero(r2[1])) {
    const factor = r2[1] / r1[1];
    r2 = [r2[0] - factor * r1[0], r2[1] - factor * r1[1], r2[2] - factor * r1[2]];
    steps.push(`R₂ ← R₂ − (${present(factor)})R₁ → R₂=${formatRow(r2)}`);
  }

  const inconsistentRow =
    isZero(r2[0]) && isZero(r2[1]) && !isZero(r2[2])
      ? r2
      : isZero(r1[0]) && isZero(r1[1]) && !isZero(r1[2])
        ? r1
        : null;

  if (inconsistentRow) {
    steps.push(
      `Fila ${formatRow(inconsistentRow)} ≡ 0=${present(inconsistentRow[2])} (contradicción)`,
    );
  } else {
    const nonzero = [r1, r2].filter(rowNonzero).length;
    steps.push(`Filas no nulas = ${nonzero} ⇒ rango de [A∣b] = ${nonzero}`);
  }

  return { steps, rows: [r1, r2], inconsistentRow };
}

function CellInput({
  value,
  onChange,
  ariaLabel,
  accent,
}: {
  value: number;
  onChange: (v: number) => void;
  ariaLabel: string;
  accent: 'A' | 'b';
}) {
  return (
    <input
      type="number"
      step={0.1}
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-14 rounded border bg-[var(--bg)] px-1 py-1.5 text-center font-mono text-sm sm:w-16"
      style={{
        borderColor: accent === 'A' ? 'var(--accent-strong)' : 'teal',
      }}
    />
  );
}

/**
 * Rouché–Capelli: classify Ax=b via rank(A), rank([A|b]) and n (ALG-SIS-005).
 */
export function RoucheCapelliViz() {
  const [A, setA] = useState<Mat2>(PRESETS[0]!.A.map((r) => [...r]) as Mat2);
  const [b, setB] = useState<[number, number]>([...PRESETS[0]!.b] as [number, number]);
  const [activePreset, setActivePreset] = useState<Kind | null>('unique');
  const [showRankHow, setShowRankHow] = useState(false);

  const rA = useMemo(() => rank2(A), [A]);
  const rAug = useMemo(() => rankAug(A, b), [A, b]);
  const kind = classify(rA, rAug, N);
  const det = det2(A);
  const singular = Math.abs(det) <= ZERO_EPS;

  const eq1 = formatEq(A[0][0], A[0][1], b[0]);
  const eq2 = formatEq(A[1][0], A[1][1], b[1]);

  const echelon = useMemo(() => echelonSteps(A, b), [A, b]);

  const setCell = (i: 0 | 1, j: 0 | 1, v: number) => {
    setActivePreset(null);
    setA((prev) => {
      const next: Mat2 = [
        [...prev[0]] as [number, number],
        [...prev[1]] as [number, number],
      ];
      next[i]![j] = v;
      return next;
    });
  };

  const setBCell = (i: 0 | 1, v: number) => {
    setActivePreset(null);
    setB((prev) => {
      const next: [number, number] = [prev[0], prev[1]];
      next[i] = v;
      return next;
    });
  };

  const loadPreset = (p: Preset) => {
    setA(p.A.map((r) => [...r]) as Mat2);
    setB([...p.b] as [number, number]);
    setActivePreset(p.id);
  };

  const statusLabel =
    kind === 'unique'
      ? 'Una solución'
      : kind === 'infinite'
        ? 'Infinitas soluciones'
        : 'Sin solución';
  const statusSymbol = kind === 'unique' ? '1' : kind === 'infinite' ? '∞' : '∅';

  const chain =
    kind === 'none'
      ? `${rA} ≠ ${rAug} ⇒ sin solución`
      : kind === 'unique'
        ? `${rA} = ${rAug} = ${N} ⇒ una solución`
        : `${rA} = ${rAug} < ${N} ⇒ infinitas soluciones`;

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Primero compara los rangos. Si son distintos, el sistema es incompatible. Si son
            iguales, compáralos con el número de incógnitas: si el rango es n, hay una solución; si
            es menor que n, hay infinitas.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Criterio completo: rank(A) frente a rank([A∣b]) y, si coinciden, frente a n.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Casos pedagógicos
          </p>
          <ButtonRow>
            {PRESETS.map((p) => (
              <VizButton key={p.id} active={activePreset === p.id} onClick={() => loadPreset(p)}>
                {p.label}
              </VizButton>
            ))}
          </ButtonRow>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Matriz aumentada · [A∣b]
          </p>
          <div className="mt-2 mb-1 flex items-center justify-between gap-4 px-1 text-xs font-semibold">
            <span style={{ color: 'var(--accent-strong)' }}>A · coeficientes</span>
            <span style={{ color: 'teal' }}>b · términos indep.</span>
          </div>
          <div className="inline-flex items-stretch rounded-lg border-2 border-[var(--border)] p-2">
            <div className="inline-grid grid-cols-2 gap-1.5">
              <CellInput value={A[0][0]} accent="A" ariaLabel="a11" onChange={(v) => setCell(0, 0, v)} />
              <CellInput value={A[0][1]} accent="A" ariaLabel="a12" onChange={(v) => setCell(0, 1, v)} />
              <CellInput value={A[1][0]} accent="A" ariaLabel="a21" onChange={(v) => setCell(1, 0, v)} />
              <CellInput value={A[1][1]} accent="A" ariaLabel="a22" onChange={(v) => setCell(1, 1, v)} />
            </div>
            <div
              className="mx-2.5 w-1 self-stretch rounded-full bg-[var(--accent-strong)]"
              aria-hidden
            />
            <div className="flex flex-col justify-center gap-1.5">
              <CellInput value={b[0]} accent="b" ariaLabel="b1" onChange={(v) => setBCell(0, v)} />
              <CellInput value={b[1]} accent="b" ariaLabel="b2" onChange={(v) => setBCell(1, v)} />
            </div>
          </div>
          <p className="mt-3 font-mono text-sm">
            Sistema: {'{'} {eq1} ; {eq2} {'}'}
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Razonamiento
          </p>
          <div className="grid gap-1 font-mono text-sm sm:grid-cols-3">
            <p>
              rank(A) = <span className="font-semibold">{rA}</span>
            </p>
            <p>
              rank([A∣b]) = <span className="font-semibold">{rAug}</span>
            </p>
            <p>
              n = <span className="font-semibold">{N}</span>
            </p>
          </div>
          <ol className="list-decimal space-y-1 pl-5 text-sm leading-relaxed">
            <li>
              Compara rank(A) con rank([A∣b]):{' '}
              {rA === rAug ? (
                <span>
                  {rA} = {rAug} (compatibles)
                </span>
              ) : (
                <span className="font-semibold">
                  {rA} ≠ {rAug} ⇒ incompatible
                </span>
              )}
            </li>
            <li>
              {rA !== rAug ? (
                <span className="text-[var(--fg-muted)]">
                  Como los rangos difieren, no hace falta comparar con n.
                </span>
              ) : (
                <span>
                  Como son iguales, compara con n: {rA} {rA === N ? '=' : '<'} {N}
                </span>
              )}
            </li>
          </ol>
          <p className="font-mono text-base font-semibold text-[var(--accent-strong)]">{chain}</p>
        </section>

        <section
          className="rounded-xl border-2 border-[var(--accent-strong)] px-3 py-3"
          aria-live="polite"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Clasificación
          </p>
          <p className="mt-1 text-lg font-semibold">
            {statusLabel}{' '}
            <span className="font-mono text-[var(--fg-muted)]" aria-hidden>
              ({statusSymbol})
            </span>
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            {kind === 'unique'
              ? 'rank(A) = rank([A∣b]) = n'
              : kind === 'infinite'
                ? 'rank(A) = rank([A∣b]) < n'
                : 'rank(A) ≠ rank([A∣b])'}
          </p>
        </section>

        {singular ? (
          <section className="rounded-xl border border-[var(--border)] px-3 py-3 text-sm leading-relaxed">
            <p className="font-semibold">det(A) = 0 ⇒ A es singular</p>
            <p className="mt-1 text-[var(--fg-muted)]">
              Eso descarta una solución única, pero no basta: aún debes comparar rank(A) y
              rank([A∣b]) para distinguir entre sin solución e infinitas soluciones.
              {kind === 'unique'
                ? ''
                : ` Aquí: ${kind === 'none' ? 'sin solución' : 'infinitas soluciones'}.`}
            </p>
          </section>
        ) : (
          <section className="rounded-xl border border-[var(--border)] px-3 py-3 text-sm text-[var(--fg-muted)]">
            det(A) = {present(det)} ≠ 0 ⇒ A invertible y, con n = 2, rank(A) = 2: el criterio da una
            solución.
          </section>
        )}

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <ToggleRow
            label="Ver cómo se obtiene el rango"
            checked={showRankHow}
            onChange={setShowRankHow}
          />
          {showRankHow ? (
            <div className="mt-3 space-y-2 text-sm leading-relaxed">
              <p className="text-[var(--fg-muted)]">
                Reducción breve a forma escalonada; el rango es el número de filas no nulas (pivotes).
              </p>
              <div className="font-mono text-[13px] space-y-1">
                {echelon.steps.map((s) => (
                  <p key={s}>{s}</p>
                ))}
              </div>
              <p className="font-mono">
                Forma escalonada: R₁={formatRow(echelon.rows[0])} · R₂={formatRow(echelon.rows[1])}
              </p>
              {echelon.inconsistentRow ? (
                <p className="font-semibold">
                  {formatRow(echelon.inconsistentRow)} significa 0 ={' '}
                  {present(echelon.inconsistentRow[2])}, que es falso ⇒ el sistema no tiene
                  solución.
                </p>
              ) : (
                <p className="text-[var(--fg-muted)]">
                  Filas no nulas en [A∣b]: {echelon.rows.filter(rowNonzero).length} (coincide con
                  rank([A∣b]) = {rAug}).
                </p>
              )}
            </div>
          ) : null}
        </section>

        <ControlsStack>
          <p className="text-xs text-[var(--fg-muted)]">
            Tip: edita celdas o carga un caso. El razonamiento rank(A) → rank([A∣b]) → n se actualiza
            al instante.
          </p>
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
