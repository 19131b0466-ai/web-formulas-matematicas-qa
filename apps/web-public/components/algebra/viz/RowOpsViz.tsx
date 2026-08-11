'use client';

import { useId, useMemo, useState } from 'react';
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

type OpKind = 'swap' | 'scale' | 'add';
type Goal = 'free' | 'pivot_zero' | 'echelon' | 'rref';

type Row3 = [number, number, number];
type AugState = { A: Mat2; b: [number, number] };

type LastOp = {
  symbol: string;
  kind: OpKind;
  rows: number[];
  before: Row3;
  after: Row3;
  beforeOther?: Row3;
  afterOther?: Row3;
  other?: 0 | 1;
  target: 0 | 1;
  detNote: string;
};

function present(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '—';
  return fmt(Number(n.toFixed(digits)), digits);
}

function isZero(n: number): boolean {
  return Math.abs(n) < ZERO_EPS;
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

function formatEq(a: number, b: number, rhs: number): string {
  return `${formatLin(a, b)}=${present(rhs)}`;
}

function formatRow(r: Row3): string {
  return `(${present(r[0])}, ${present(r[1])} ∣ ${present(r[2])})`;
}

function getRow(state: AugState, i: 0 | 1): Row3 {
  return [state.A[i]![0]!, state.A[i]![1]!, state.b[i]!];
}

function cloneState(s: AugState): AugState {
  return {
    A: [
      [...s.A[0]] as [number, number],
      [...s.A[1]] as [number, number],
    ],
    b: [s.b[0], s.b[1]],
  };
}

function CellInput({
  value,
  onChange,
  ariaLabel,
  accent,
  active,
}: {
  value: number;
  onChange: (v: number) => void;
  ariaLabel: string;
  accent: 'A' | 'b';
  active?: boolean;
}) {
  return (
    <input
      type="number"
      step={0.1}
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`w-14 rounded border bg-[var(--bg)] px-1 py-1.5 text-center font-mono text-sm sm:w-16 ${
        active ? 'bg-[var(--accent-soft)]' : ''
      }`}
      style={{
        borderColor: accent === 'A' ? 'var(--accent-strong)' : 'teal',
        borderWidth: active ? 2 : 1,
      }}
    />
  );
}

function SystemBlock({
  title,
  eq1,
  eq2,
}: {
  title: string;
  eq1: string;
  eq2: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
        {title}
      </p>
      <div className="mt-1 space-y-0.5 font-mono text-sm">
        <p>
          {'{'} {eq1}
        </p>
        <p className="pl-4">
          {eq2} {'}'}
        </p>
      </div>
    </div>
  );
}

/**
 * Elementary row operations on [A|b] preserving solution set (ALG-SIS-004).
 */
export function RowOpsViz() {
  const initial = useMemo<AugState>(
    () => ({
      A: [
        [2, 1],
        [1, 3],
      ],
      b: [5, 4],
    }),
    [],
  );
  const [original, setOriginal] = useState<AugState>(() => cloneState(initial));
  const [state, setState] = useState<AugState>(() => cloneState(initial));
  const [op, setOp] = useState<OpKind>('add');
  const [i, setI] = useState<0 | 1>(1); // target / destination
  const [j, setJ] = useState<0 | 1>(0); // source
  const [c, setC] = useState(-2);
  const [last, setLast] = useState<LastOp | null>(null);
  const [goal, setGoal] = useState<Goal>('pivot_zero');
  const [showDet, setShowDet] = useState(false);
  const [showAdv, setShowAdv] = useState(false);
  const guideId = useId();

  const A = state.A;
  const b = state.b;
  const a11 = A[0][0];
  const a12 = A[0][1];
  const a21 = A[1][0];
  const a22 = A[1][1];
  const b1 = b[0];
  const b2 = b[1];

  const eq1 = formatEq(a11, a12, b1);
  const eq2 = formatEq(a21, a22, b2);
  const origEq1 = formatEq(original.A[0][0], original.A[0][1], original.b[0]);
  const origEq2 = formatEq(original.A[1][0], original.A[1][1], original.b[1]);

  const det = det2(A);
  const detOrig = det2(original.A);

  const highlight = last?.rows ?? [];

  const setCell = (ri: 0 | 1, cj: 0 | 1, v: number) => {
    setState((prev) => {
      const next = cloneState(prev);
      next.A[ri]![cj] = v;
      return next;
    });
    setLast(null);
  };

  const setB = (ri: 0 | 1, v: number) => {
    setState((prev) => {
      const next = cloneState(prev);
      next.b[ri] = v;
      return next;
    });
    setLast(null);
  };

  const resetToInitial = () => {
    const fresh = cloneState(initial);
    setOriginal(cloneState(fresh));
    setState(cloneState(fresh));
    setLast(null);
    setI(1);
    setJ(0);
    setC(-2);
    setOp('add');
  };

  const captureAsOriginal = () => {
    setOriginal(cloneState(state));
    setLast(null);
  };

  const applyOp = () => {
    if (op === 'swap' && i === j) return;
    if (op === 'scale' && isZero(c)) return;
    if (op === 'add' && i === j) return;

    const beforeState = cloneState(state);
    const next = cloneState(state);
    let symbol = '';
    let rows: number[] = [];
    let target: 0 | 1 = i;
    let detNote = '';

    if (op === 'swap') {
      const rowI = getRow(beforeState, i);
      const rowJ = getRow(beforeState, j);
      next.A[i] = [rowJ[0], rowJ[1]];
      next.A[j] = [rowI[0], rowI[1]];
      next.b[i] = rowJ[2];
      next.b[j] = rowI[2];
      symbol = `R${i + 1} ↔ R${j + 1}`;
      rows = [i, j];
      target = i;
      detNote = 'Intercambio de filas: det cambia de signo.';
    } else if (op === 'scale') {
      next.A[i] = [beforeState.A[i]![0]! * c, beforeState.A[i]![1]! * c];
      next.b[i] = beforeState.b[i]! * c;
      if (c === 1) symbol = `R${i + 1} ← R${i + 1}`;
      else if (c === -1) symbol = `R${i + 1} ← −R${i + 1}`;
      else symbol = `R${i + 1} ← ${present(c)}R${i + 1}`;
      rows = [i];
      target = i;
      detNote = `Multiplicación por c: det se multiplica por ${present(c)}.`;
    } else {
      next.A[i] = [
        beforeState.A[i]![0]! + c * beforeState.A[j]![0]!,
        beforeState.A[i]![1]! + c * beforeState.A[j]![1]!,
      ];
      next.b[i] = beforeState.b[i]! + c * beforeState.b[j]!;
      const cPart =
        c === 1
          ? `+R${j + 1}`
          : c === -1
            ? `−R${j + 1}`
            : c < 0
              ? `−${present(-c)}R${j + 1}`
              : `+${present(c)}R${j + 1}`;
      symbol = `R${i + 1} ← R${i + 1}${cPart}`;
      rows = [i, j];
      target = i;
      detNote = 'Suma de múltiplo de otra fila: det no cambia.';
    }

    const before = getRow(beforeState, target);
    const after = getRow(next, target);
    const other: 0 | 1 | undefined = op === 'swap' ? j : undefined;
    setState(next);
    setLast({
      symbol,
      kind: op,
      rows,
      before,
      after,
      target,
      detNote,
      other,
      beforeOther: other != null ? getRow(beforeState, other) : undefined,
      afterOther: other != null ? getRow(next, other) : undefined,
    });
  };

  // Goal checks
  const pivotZeroOk = isZero(a21);
  const echelonOk =
    (!isZero(a11) && isZero(a21)) || (isZero(a11) && !isZero(a21) && isZero(a12));
  // Prefer standard: a21≈0 and a11≠0
  const echelonStd = !isZero(a11) && isZero(a21);
  const rrefOk =
    Math.abs(a11 - 1) < ZERO_EPS &&
    isZero(a12) &&
    isZero(a21) &&
    Math.abs(a22 - 1) < ZERO_EPS;

  const goalStatus = (() => {
    if (goal === 'free') return null;
    if (goal === 'pivot_zero') {
      return pivotZeroOk
        ? { ok: true, msg: '¡Listo! La entrada bajo el pivote (a₂₁) es cero.' }
        : {
            ok: false,
            msg: 'Objetivo: haz a₂₁ = 0. Prueba R₂ ← R₂ − (a₂₁/a₁₁)R₁ si a₁₁ ≠ 0.',
          };
    }
    if (goal === 'echelon') {
      return echelonStd || echelonOk
        ? { ok: true, msg: 'Forma escalonada: debajo del pivote hay ceros.' }
        : {
            ok: false,
            msg: 'Objetivo: forma escalonada (típicamente a₂₁ = 0 con pivote a₁₁ ≠ 0).',
          };
    }
    return rrefOk
      ? { ok: true, msg: 'Forma escalonada reducida: A es la identidad.' }
      : {
          ok: false,
          msg: 'Objetivo: forma escalonada reducida (A ≈ I). Escala pivotes a 1 y anula el resto.',
        };
  })();

  const previewSymbol = (() => {
    if (op === 'swap') {
      if (i === j) return 'Elige dos filas distintas';
      return `R${i + 1} ↔ R${j + 1}`;
    }
    if (op === 'scale') {
      if (isZero(c)) return 'c no puede ser 0';
      if (c === 1) return `R${i + 1} ← R${i + 1}`;
      if (c === -1) return `R${i + 1} ← −R${i + 1}`;
      return `R${i + 1} ← ${present(c)}R${i + 1}`;
    }
    if (i === j) return 'En suma, destino y origen deben ser distintas';
    const cPart =
      c === 1 ? `+R${j + 1}` : c === -1 ? `−R${j + 1}` : c < 0 ? `−${present(-c)}R${j + 1}` : `+${present(c)}R${j + 1}`;
    return `R${i + 1} ← R${i + 1}${cPart}`;
  })();

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Las operaciones elementales cambian la forma del sistema, pero no su solución. Cada fila
            representa una ecuación.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            La eliminación de Gauss usa estas operaciones para llevar la matriz a forma escalonada;
            Gauss-Jordan sigue hasta la forma reducida.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Meta guiada
          </p>
          <ButtonRow>
            <VizButton active={goal === 'pivot_zero'} onClick={() => setGoal('pivot_zero')}>
              Cero bajo el pivote
            </VizButton>
            <VizButton active={goal === 'echelon'} onClick={() => setGoal('echelon')}>
              Forma escalonada
            </VizButton>
            <VizButton active={goal === 'rref'} onClick={() => setGoal('rref')}>
              Escalonada reducida
            </VizButton>
            <VizButton active={goal === 'free'} onClick={() => setGoal('free')}>
              Libre
            </VizButton>
          </ButtonRow>
          {goalStatus ? (
            <p
              className={`mt-2 text-sm ${
                goalStatus.ok ? 'font-semibold text-[var(--accent-strong)]' : 'text-[var(--fg-muted)]'
              }`}
            >
              {goalStatus.msg}
            </p>
          ) : (
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Explora las tres operaciones con libertad.
            </p>
          )}
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
              Matriz aumentada actual · [A∣b]
            </p>
            <ButtonRow>
              <VizButton onClick={resetToInitial}>Restablecer</VizButton>
              <VizButton onClick={captureAsOriginal}>Usar como original</VizButton>
            </ButtonRow>
          </div>
          <div className="mt-2 inline-flex items-stretch rounded-lg border-2 border-[var(--border)] p-2">
            <div className="inline-grid grid-cols-2 gap-1.5">
              {(
                [
                  [0, 0, a11],
                  [0, 1, a12],
                  [1, 0, a21],
                  [1, 1, a22],
                ] as const
              ).map(([ri, cj, val]) => (
                <CellInput
                  key={`${ri}-${cj}`}
                  value={val}
                  accent="A"
                  active={highlight.includes(ri)}
                  ariaLabel={`a${ri + 1}${cj + 1}`}
                  onChange={(v) => setCell(ri, cj, v)}
                />
              ))}
            </div>
            <div
              className="mx-2.5 w-1 self-stretch rounded-full bg-[var(--accent-strong)]"
              aria-hidden
            />
            <div className="flex flex-col justify-center gap-1.5">
              <CellInput
                value={b1}
                accent="b"
                active={highlight.includes(0)}
                ariaLabel="b1"
                onChange={(v) => setB(0, v)}
              />
              <CellInput
                value={b2}
                accent="b"
                active={highlight.includes(1)}
                ariaLabel="b2"
                onChange={(v) => setB(1, v)}
              />
            </div>
          </div>
          <p className="mt-3 font-mono text-sm">
            Sistema actual:{' '}
            <span className="font-semibold">
              {'{'} {eq1} ; {eq2} {'}'}
            </span>
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Operación a aplicar
          </p>
          <ButtonRow>
            <VizButton active={op === 'swap'} onClick={() => setOp('swap')}>
              Ri ↔ Rj
            </VizButton>
            <VizButton active={op === 'scale'} onClick={() => setOp('scale')}>
              Ri ← c Ri
            </VizButton>
            <VizButton
              active={op === 'add'}
              onClick={() => {
                setOp('add');
                if (i === j) {
                  setI(1);
                  setJ(0);
                }
              }}
            >
              Ri ← Ri + c Rj
            </VizButton>
          </ButtonRow>

          <div className="flex flex-wrap items-end gap-3 text-sm">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-[var(--fg-muted)]">
                {op === 'swap' ? 'Fila i' : op === 'scale' ? 'Fila i' : 'Destino i'}
              </span>
              <select
                value={i}
                onChange={(e) => setI(Number(e.target.value) as 0 | 1)}
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 font-mono"
                aria-label="Fila i"
              >
                <option value={0}>R₁</option>
                <option value={1}>R₂</option>
              </select>
            </label>
            {op !== 'scale' ? (
              <label className="flex flex-col gap-1">
                <span className="text-xs text-[var(--fg-muted)]">
                  {op === 'swap' ? 'Fila j' : 'Origen j'}
                </span>
                <select
                  value={j}
                  onChange={(e) => setJ(Number(e.target.value) as 0 | 1)}
                  className="rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 font-mono"
                  aria-label="Fila j"
                >
                  <option value={0}>R₁</option>
                  <option value={1}>R₂</option>
                </select>
              </label>
            ) : null}
            {op !== 'swap' ? (
              <label className="flex flex-col gap-1">
                <span className="text-xs text-[var(--fg-muted)]">Escalar c {op === 'scale' ? '(≠0)' : ''}</span>
                <input
                  type="number"
                  step={0.5}
                  value={c}
                  onChange={(e) => setC(Number(e.target.value))}
                  className="w-20 rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 text-center font-mono"
                  aria-label="Escalar c"
                />
              </label>
            ) : null}
            <VizButton onClick={applyOp}>Aplicar</VizButton>
          </div>

          <p className="font-mono text-sm">
            Vista previa: <span className="font-semibold text-[var(--accent-strong)]">{previewSymbol}</span>
          </p>
        </section>

        {last ? (
          <section className="rounded-xl border border-[var(--accent-strong)] px-3 py-3 text-sm leading-relaxed">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
              Operación aplicada
            </p>
            <p className="mt-1 font-mono text-base font-semibold text-[var(--accent-strong)]">
              {last.symbol}
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <div className="font-mono space-y-1">
                <p className="text-xs font-semibold text-[var(--fg-muted)]">Antes</p>
                <p>
                  R{last.target + 1}={formatRow(last.before)}
                </p>
                {last.other != null && last.beforeOther ? (
                  <p>
                    R{last.other + 1}={formatRow(last.beforeOther)}
                  </p>
                ) : null}
              </div>
              <div className="font-mono space-y-1">
                <p className="text-xs font-semibold text-[var(--fg-muted)]">Después</p>
                <p>
                  R{last.target + 1}={formatRow(last.after)}
                </p>
                {last.other != null && last.afterOther ? (
                  <p>
                    R{last.other + 1}={formatRow(last.afterOther)}
                  </p>
                ) : null}
              </div>
            </div>
            {showDet ? <p className="mt-2 text-[var(--fg-muted)]">{last.detNote}</p> : null}
          </section>
        ) : null}

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Equivalencia del sistema
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <SystemBlock title="Sistema original" eq1={origEq1} eq2={origEq2} />
            <SystemBlock title="Sistema transformado" eq1={eq1} eq2={eq2} />
          </div>
          <p className="text-sm font-semibold">
            Ambos sistemas tienen la misma solución (operaciones equivalentes).
          </p>
          <p className="text-sm text-[var(--fg-muted)]">
            Las operaciones simplifican el sistema hacia Gauss / Gauss-Jordan sin cambiar el
            conjunto solución.
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 space-y-2">
          <ToggleRow
            label="Ver efecto en det(A) (secundario)"
            checked={showDet}
            onChange={setShowDet}
          />
          {showDet ? (
            <div className="space-y-1 text-sm text-[var(--fg-muted)]">
              <p className="font-mono">
                det(A) actual={present(det)} · det(A) original={present(detOrig)}
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Intercambio: cambia el signo de det.</li>
                <li>Multiplicar fila por c: multiplica det por c.</li>
                <li>Sumar múltiplo de otra fila: det no cambia.</li>
              </ul>
            </div>
          ) : null}
          <ToggleRow
            label="Avanzado: complejidad computacional"
            checked={showAdv}
            onChange={setShowAdv}
          />
          {showAdv ? (
            <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
              Con el algoritmo clásico, la eliminación de Gauss sobre una matriz densa n×n cuesta{' '}
              <span className="font-mono">O(n³)</span> en tiempo y{' '}
              <span className="font-mono">O(n²)</span> en memoria. La sustitución hacia atrás, ya en
              forma triangular, cuesta <span className="font-mono">O(n²)</span>.
            </p>
          ) : null}
        </section>

        <div
          className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_70%,var(--bg-elevated))] px-3 py-2 text-sm leading-relaxed"
          aria-live="polite"
        >
          <p className="font-mono">
            {last ? last.symbol : previewSymbol}
            <br />
            Sistema transformado equivalente al original
            {showDet ? ` · det(A)=${present(det)}` : ''}
          </p>
        </div>

        <ControlsStack>
          <p className="text-xs text-[var(--fg-muted)]">
            Tip: para anular a₂₁ con pivote a₁₁≠0, usa Ri←Ri+cRj con i=2, j=1 y c=−a₂₁/a₁₁.
          </p>
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
