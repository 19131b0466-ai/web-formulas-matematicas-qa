'use client';

import { useId, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  ToggleRow,
  VizButton,
  VizPanel,
  fmt,
} from './controls';
import type { Mat2 } from './math2d';

const ZERO_EPS = 1e-9;

function present(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '—';
  return fmt(Number(n.toFixed(digits)), digits);
}

function isZero(n: number): boolean {
  return Math.abs(n) < ZERO_EPS;
}

/** Clean linear left-hand side: x, −y, 2x−3y, … */
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

/**
 * Augmented matrix [A|b]: each row is one equation (ALG-SIS-003).
 */
export function AugmentedMatrixViz() {
  const [A, setA] = useState<Mat2>([
    [2, 1],
    [1, 3],
  ]);
  const [b, setB] = useState<[number, number]>([5, 4]);
  const [selRow, setSelRow] = useState<0 | 1>(0);
  const [showOps, setShowOps] = useState(false);
  const [scale, setScale] = useState(2);
  const guideId = useId();

  const a11 = A[0][0];
  const a12 = A[0][1];
  const a21 = A[1][0];
  const a22 = A[1][1];
  const b1 = b[0];
  const b2 = b[1];

  const setCell = (i: 0 | 1, j: 0 | 1, v: number) => {
    const next: Mat2 = [
      [...A[0]] as [number, number],
      [...A[1]] as [number, number],
    ];
    next[i]![j] = v;
    setA(next);
  };

  const eq1 = formatEq(a11, a12, b1);
  const eq2 = formatEq(a21, a22, b2);
  const activeEq = selRow === 0 ? eq1 : eq2;

  const swapRows = () => {
    setA([
      [...A[1]] as [number, number],
      [...A[0]] as [number, number],
    ]);
    setB([b2, b1]);
    setSelRow((r) => (r === 0 ? 1 : 0));
  };

  const scaleActive = () => {
    const c = scale;
    if (!Number.isFinite(c) || isZero(c)) return;
    const next: Mat2 = [
      [...A[0]] as [number, number],
      [...A[1]] as [number, number],
    ];
    next[selRow] = [next[selRow]![0]! * c, next[selRow]![1]! * c];
    setA(next);
    const nb: [number, number] = [...b] as [number, number];
    nb[selRow] = nb[selRow]! * c;
    setB(nb);
  };

  const addMultiple = () => {
    // R_other ← R_other + 1·R_sel
    const other: 0 | 1 = selRow === 0 ? 1 : 0;
    const next: Mat2 = [
      [...A[0]] as [number, number],
      [...A[1]] as [number, number],
    ];
    next[other] = [
      next[other]![0]! + next[selRow]![0]!,
      next[other]![1]! + next[selRow]![1]!,
    ];
    setA(next);
    const nb: [number, number] = [...b] as [number, number];
    nb[other] = nb[other]! + nb[selRow]!;
    setB(nb);
    setSelRow(other);
  };

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            La matriz aumentada reúne coeficientes y términos independientes. Cada fila representa
            una ecuación del sistema.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            La barra separa la matriz de coeficientes A del vector b. Es la forma habitual de
            trabajar un sistema con eliminación por filas.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 text-sm leading-relaxed">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Por qué se llama «aumentada»
          </p>
          <p className="mt-2 font-mono text-[13px] sm:text-sm">
            A=[{present(a11)} {present(a12)}; {present(a21)} {present(a22)}],{' '}
            <span style={{ color: 'teal' }}>b=[{present(b1)}; {present(b2)}]</span>
          </p>
          <p className="mt-1 font-mono text-[13px] sm:text-sm">
            ⇒ [A∣b]=[{present(a11)} {present(a12)}{' '}
            <span className="text-[var(--accent-strong)]">|</span>{' '}
            <span style={{ color: 'teal' }}>
              {present(b1)}
            </span>
            ; {present(a21)} {present(a22)}{' '}
            <span className="text-[var(--accent-strong)]">|</span>{' '}
            <span style={{ color: 'teal' }}>{present(b2)}</span>]
          </p>
          <p className="mt-2 text-[var(--fg-muted)]">
            Se «aumenta» A pegando la columna b a la derecha.
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Matriz aumentada · [A∣b]
          </p>
          <div className="mt-2 flex flex-wrap items-end gap-6">
            <div>
              <div className="mb-1 flex items-center justify-between gap-4 px-1 text-xs font-semibold">
                <span style={{ color: 'var(--accent-strong)' }}>A · coeficientes</span>
                <span style={{ color: 'teal' }}>b · términos indep.</span>
              </div>
              <div className="inline-flex items-stretch rounded-lg border-2 border-[var(--border)] p-2">
                <div className="inline-grid grid-cols-2 gap-1.5">
                  <CellInput
                    value={a11}
                    accent="A"
                    active={selRow === 0}
                    ariaLabel="a11"
                    onChange={(v) => {
                      setCell(0, 0, v);
                      setSelRow(0);
                    }}
                  />
                  <CellInput
                    value={a12}
                    accent="A"
                    active={selRow === 0}
                    ariaLabel="a12"
                    onChange={(v) => {
                      setCell(0, 1, v);
                      setSelRow(0);
                    }}
                  />
                  <CellInput
                    value={a21}
                    accent="A"
                    active={selRow === 1}
                    ariaLabel="a21"
                    onChange={(v) => {
                      setCell(1, 0, v);
                      setSelRow(1);
                    }}
                  />
                  <CellInput
                    value={a22}
                    accent="A"
                    active={selRow === 1}
                    ariaLabel="a22"
                    onChange={(v) => {
                      setCell(1, 1, v);
                      setSelRow(1);
                    }}
                  />
                </div>
                <div
                  className="mx-2.5 w-1 self-stretch rounded-full bg-[var(--accent-strong)]"
                  title="Barra que separa A de b"
                  aria-hidden
                />
                <div className="flex flex-col justify-center gap-1.5">
                  <CellInput
                    value={b1}
                    accent="b"
                    active={selRow === 0}
                    ariaLabel="b1"
                    onChange={(v) => {
                      setB([v, b2]);
                      setSelRow(0);
                    }}
                  />
                  <CellInput
                    value={b2}
                    accent="b"
                    active={selRow === 1}
                    ariaLabel="b2"
                    onChange={(v) => {
                      setB([b1, v]);
                      setSelRow(1);
                    }}
                  />
                </div>
              </div>
              <p className="mt-2 text-center text-xs text-[var(--fg-muted)]">
                ← A &nbsp;|&nbsp; b →
              </p>
            </div>
          </div>

          <div className="mt-3">
            <p className="mb-1 text-xs font-semibold text-[var(--fg-muted)]">Selecciona una fila</p>
            <ButtonRow>
              <VizButton active={selRow === 0} onClick={() => setSelRow(0)}>
                R₁
              </VizButton>
              <VizButton active={selRow === 1} onClick={() => setSelRow(1)}>
                R₂
              </VizButton>
            </ButtonRow>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Fila activa → ecuación
          </p>
          <p className="mt-2 font-mono text-base font-semibold text-[var(--accent-strong)]">
            R{selRow + 1}: {activeEq}
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Sistema completo
          </p>
          <div className="mt-2 space-y-1 font-mono text-base">
            <p>
              {'{'}{' '}
              <span
                className={selRow === 0 ? 'font-semibold text-[var(--accent-strong)]' : undefined}
              >
                {eq1}
              </span>
            </p>
            <p className="pl-4">
              <span
                className={selRow === 1 ? 'font-semibold text-[var(--accent-strong)]' : undefined}
              >
                {eq2}
              </span>{' '}
              {'}'}
            </p>
          </div>
          <p className="mt-2 text-sm text-[var(--fg-muted)]">
            La fila resaltada en [A∣b] es exactamente la ecuación resaltada del sistema.
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <ToggleRow
            label="Etapa opcional: operaciones elementales de fila (hacia Gauss)"
            checked={showOps}
            onChange={setShowOps}
          />
          {showOps ? (
            <div className="mt-3 space-y-3 text-sm">
              <p className="text-[var(--fg-muted)]">
                Las operaciones de fila cambian [A∣b], pero el sistema sigue siendo equivalente.
                Usa la fila activa (R{selRow + 1}).
              </p>
              <ButtonRow>
                <VizButton onClick={swapRows}>R₁ ↔ R₂</VizButton>
                <VizButton onClick={scaleActive}>
                  R{selRow + 1} ← {present(scale)}·R{selRow + 1}
                </VizButton>
                <VizButton onClick={addMultiple}>
                  R{selRow === 0 ? 2 : 1} ← R{selRow === 0 ? 2 : 1}+R{selRow + 1}
                </VizButton>
              </ButtonRow>
              <label className="flex items-center gap-2 text-sm">
                <span className="font-mono text-[var(--fg-muted)]">constante c</span>
                <input
                  type="number"
                  step={0.5}
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-16 rounded border border-[var(--border)] bg-[var(--bg)] px-1 py-1 text-center font-mono text-sm"
                  aria-label="Constante para escalar la fila"
                />
              </label>
            </div>
          ) : null}
        </section>

        <div
          className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_70%,var(--bg-elevated))] px-3 py-2 text-sm leading-relaxed"
          aria-live="polite"
        >
          <p className="font-mono">
            [A∣b] · fila R{selRow + 1} → {activeEq}
          </p>
        </div>

        <ControlsStack>
          <p className="text-xs text-[var(--fg-muted)]">
            Tip: columna 1 → coeficientes de x; columna 2 → de y; última columna → términos
            independientes.
          </p>
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
