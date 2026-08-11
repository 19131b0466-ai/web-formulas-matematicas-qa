'use client';

import { useId, useMemo, useState } from 'react';
import { ControlsStack, VizPanel, fmt } from './controls';
import { applyMat, det2, inv2, type Mat2 } from './math2d';

const ZERO_EPS = 1e-9;

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
 * Compact a 2×2 linear system as Ax=b (ALG-SIS-002).
 * Shows traditional equations, matrix form, Ax expansion, and det(A).
 */
export function MatrixFormViz() {
  const [A, setA] = useState<Mat2>([
    [2, 1],
    [1, 3],
  ]);
  const [b, setB] = useState<[number, number]>([5, 4]);
  const guideId = useId();
  const statusId = useId();

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

  const det = det2(A);
  const invertible = Math.abs(det) > ZERO_EPS;
  const inv = useMemo(() => inv2(A), [A]);
  const sol = useMemo(() => {
    if (!inv) return null;
    return applyMat(inv, { x: b1, y: b2 });
  }, [inv, b1, b2]);

  const left1 = formatLin(a11, a12);
  const left2 = formatLin(a21, a22);
  const eq1 = `${left1}=${present(b1)}`;
  const eq2 = `${left2}=${present(b2)}`;

  const ariaStatus = invertible
    ? `Sistema en forma Ax igual a b. Determinante ${present(det)} distinto de cero: A es invertible y hay solución única.`
    : `Sistema en forma Ax igual a b. Determinante cero: A no es invertible; puede no haber solución única.`;

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            La forma matricial compacta un sistema lineal en una sola expresión: Ax=b. Cada fila de A
            es una ecuación; cada columna corresponde a una variable.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            El vector x contiene las incógnitas; el vector b contiene los términos independientes.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Sistema tradicional
          </p>
          <div className="mt-2 space-y-1 font-mono text-base">
            <p>
              {'{'} {eq1}
            </p>
            <p className="pl-4">
              {eq2} {'}'}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Forma matricial · Ax=b
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 overflow-x-auto">
            <div className="text-center">
              <p className="mb-1 text-xs font-semibold text-[var(--accent-strong)]">
                A · coeficientes
              </p>
              <div className="inline-grid grid-cols-2 gap-1.5 rounded-lg border-2 border-[var(--accent-strong)] p-2">
                <CellInput value={a11} accent="A" ariaLabel="a11" onChange={(v) => setCell(0, 0, v)} />
                <CellInput value={a12} accent="A" ariaLabel="a12" onChange={(v) => setCell(0, 1, v)} />
                <CellInput value={a21} accent="A" ariaLabel="a21" onChange={(v) => setCell(1, 0, v)} />
                <CellInput value={a22} accent="A" ariaLabel="a22" onChange={(v) => setCell(1, 1, v)} />
              </div>
            </div>

            <span className="font-mono text-xl">×</span>

            <div className="text-center">
              <p className="mb-1 text-xs font-semibold" style={{ color: 'orange' }}>
                x · incógnitas
              </p>
              <div
                className="inline-grid grid-cols-1 gap-1.5 rounded-lg border-2 p-2"
                style={{ borderColor: 'orange' }}
              >
                <div className="flex h-9 w-14 items-center justify-center rounded border border-[var(--border)] bg-[var(--bg)] font-mono text-sm sm:w-16">
                  x
                </div>
                <div className="flex h-9 w-14 items-center justify-center rounded border border-[var(--border)] bg-[var(--bg)] font-mono text-sm sm:w-16">
                  y
                </div>
              </div>
            </div>

            <span className="font-mono text-xl">=</span>

            <div className="text-center">
              <p className="mb-1 text-xs font-semibold" style={{ color: 'teal' }}>
                b · términos indep.
              </p>
              <div
                className="inline-grid grid-cols-1 gap-1.5 rounded-lg border-2 p-2"
                style={{ borderColor: 'teal' }}
              >
                <CellInput value={b1} accent="b" ariaLabel="b1" onChange={(v) => setB([v, b2])} />
                <CellInput value={b2} accent="b" ariaLabel="b2" onChange={(v) => setB([b1, v])} />
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm text-[var(--fg-muted)]">
            Edita las celdas de A y de b: el sistema tradicional y la expansión de Ax se actualizan
            juntos.
          </p>
        </section>

        <section className="space-y-2 rounded-xl border border-[var(--border)] px-3 py-3 text-sm leading-relaxed">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Expansión de Ax
          </p>
          <p className="font-mono">
            A·[x y]ᵀ = [{left1} ; {left2}]ᵀ
          </p>
          <p className="font-mono">
            [{left1} ; {left2}]ᵀ = [{present(b1)} ; {present(b2)}]ᵀ
          </p>
          <p className="text-[var(--fg-muted)]">
            Al igualar componente a componente se recuperan las dos ecuaciones del sistema.
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 text-sm leading-relaxed">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Determinante e invertibilidad
          </p>
          <p className="mt-2 font-mono">
            det(A)=a₁₁a₂₂−a₁₂a₂₁={present(a11)}·{present(a22)}−{present(a12)}·{present(a21)}=
            {present(det)}
          </p>
          {invertible ? (
            <>
              <p className="mt-2 font-semibold">
                det(A)≠0 ⇒ A es invertible ⇒ el sistema tiene solución única.
              </p>
              {sol ? (
                <p className="mt-1 font-mono">
                  x=A⁻¹b ⇒ (x,y)=({present(sol.x)}, {present(sol.y)})
                </p>
              ) : null}
            </>
          ) : (
            <p className="mt-2 font-semibold">
              det(A)=0 ⇒ A no es invertible ⇒ el sistema puede no tener solución única (ninguna o
              infinitas).
            </p>
          )}
        </section>

        <div
          id={statusId}
          className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_70%,var(--bg-elevated))] px-3 py-2 text-sm leading-relaxed"
          aria-live="polite"
        >
          <p className="font-mono">
            Ax=b · det(A)={present(det)}
            <br />
            {invertible && sol
              ? `Solución única: (${present(sol.x)}, ${present(sol.y)})`
              : 'A singular: sin garantía de solución única.'}
          </p>
        </div>

        <p className="sr-only">{ariaStatus}</p>

        <ControlsStack>
          <p className="text-xs text-[var(--fg-muted)]">
            Tip: fila 1 de A → primera ecuación; columna 1 → coeficientes de x; columna 2 → de y.
          </p>
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
