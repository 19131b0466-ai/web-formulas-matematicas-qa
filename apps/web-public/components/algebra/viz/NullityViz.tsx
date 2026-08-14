'use client';

import { useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from './controls';
import {
  LIN_EPS,
  PRESET_DEP,
  PRESET_FULL,
  PRESET_ID2,
  PRESET_ZERO,
  cloneMat,
  formatVec,
  matVec,
  nullspaceBasis,
  presentLin,
  rref,
  type Matrix,
} from './linAlg';
import { MatrixBrackets, MatrixGrid, present } from './matrixGrid';

type Tab = 'conceptual' | 'matriz';
type PresetId = 'id2' | 'full' | 'dep' | 'zero' | null;

function formatEqRow(row: number[], n: number): string {
  const vars = ['x₁', 'x₂', 'x₃', 'x₄'];
  const clean: string[] = [];
  for (let j = 0; j < n; j++) {
    const a = row[j] ?? 0;
    if (Math.abs(a) < LIN_EPS) continue;
    const name = vars[j] ?? `x${j + 1}`;
    if (clean.length === 0) {
      if (Math.abs(a - 1) < LIN_EPS) clean.push(name);
      else if (Math.abs(a + 1) < LIN_EPS) clean.push(`−${name}`);
      else clean.push(`${present(a)}${name}`);
    } else if (a < 0) {
      const body =
        Math.abs(a + 1) < LIN_EPS ? name : `${present(Math.abs(a))}${name}`;
      clean.push(`− ${body}`);
    } else {
      clean.push(`+ ${Math.abs(a - 1) < LIN_EPS ? name : `${present(a)}${name}`}`);
    }
  }
  return `${clean.length ? clean.join(' ') : '0'} = 0`;
}

function linCombo(basis: number[][], coeffs: number[]): number[] {
  if (basis.length === 0) return [];
  const n = basis[0]!.length;
  const out = Array.from({ length: n }, () => 0);
  for (let k = 0; k < basis.length; k++) {
    const c = coeffs[k] ?? 0;
    const v = basis[k]!;
    for (let i = 0; i < n; i++) out[i]! += c * (v[i] ?? 0);
  }
  return out;
}

/**
 * Nulidad = dim(Ker(A)) = # variables libres. No “cuenta soluciones”.
 */
export function NullityViz() {
  const [A, setA] = useState<Matrix>(() => cloneMat(PRESET_FULL));
  const [tab, setTab] = useState<Tab>('conceptual');
  const [preset, setPreset] = useState<PresetId>('full');
  const [t, setT] = useState(1);
  const [s, setS] = useState(0.5);

  const n = A[0]?.length ?? 0;
  const m = A.length;

  const info = useMemo(() => {
    const { pivots, free, rank: r } = rref(A);
    const nul = n - r;
    const basis = nullspaceBasis(A);
    return { pivots, free, rank: r, nullity: nul, basis };
  }, [A, n]);

  const coeffs = useMemo(() => {
    if (info.nullity <= 0) return [];
    if (info.nullity === 1) return [t];
    return [t, s];
  }, [info.nullity, t, s]);

  const x = useMemo(() => {
    if (info.nullity <= 0) return Array.from({ length: n }, () => 0);
    return linCombo(info.basis, coeffs);
  }, [info.nullity, info.basis, coeffs, n]);

  const Ax = useMemo(() => (x.length ? matVec(A, x) : []), [A, x]);
  const residual = Ax.reduce((acc, v) => acc + v * v, 0);
  const nearZero = residual < 1e-6;

  const load = (mat: Matrix, id: PresetId) => {
    setA(cloneMat(mat));
    setPreset(id);
    setT(1);
    setS(0.5);
  };

  const onChange = (mat: Matrix) => {
    setA(mat);
    setPreset(null);
  };

  const paramStr = (() => {
    if (info.nullity <= 0) return 'x = 0 (solo solución trivial)';
    if (info.nullity === 1 && info.basis[0]) {
      return `x = t · ${formatVec(info.basis[0])}`;
    }
    if (info.basis.length >= 2) {
      return `x = t · ${formatVec(info.basis[0]!)} + s · ${formatVec(info.basis[1]!)}`;
    }
    return `x = combinación de ${info.nullity} vectores base`;
  })();

  return (
    <VizPanel
      title="Nulidad"
      caption={`nullity(A) = dim(Ker A) = # libres = ${info.nullity} · rank + nullity = ${info.rank} + ${info.nullity} = ${n}`}
    >
      <div className="space-y-3">
        <p className="text-sm text-[var(--fg)]">
          <span className="font-medium">Idea — </span>
          La nulidad es la dimensión del núcleo: cuántas variables libres hay en Ax = 0, no
          “cuántas soluciones” (pueden ser infinitas con dimensión finita).
        </p>
        <p className="text-sm text-[var(--fg-muted)]">
          <span className="font-medium text-[var(--fg)]">Pruébalo — </span>
          Cambia A o el parámetro t (y s si hace falta) y comprueba que Ax ≈ 0.
        </p>

        <ButtonRow>
          <VizButton active={tab === 'conceptual'} onClick={() => setTab('conceptual')}>
            Conceptual
          </VizButton>
          <VizButton active={tab === 'matriz'} onClick={() => setTab('matriz')}>
            Matriz
          </VizButton>
        </ButtonRow>

        <ButtonRow>
          <VizButton active={preset === 'id2'} onClick={() => load(PRESET_ID2, 'id2')}>
            Nulidad 0
          </VizButton>
          <VizButton active={preset === 'full'} onClick={() => load(PRESET_FULL, 'full')}>
            Nulidad 1
          </VizButton>
          <VizButton active={preset === 'dep'} onClick={() => load(PRESET_DEP, 'dep')}>
            Nulidad 2
          </VizButton>
          <VizButton active={preset === 'zero'} onClick={() => load(PRESET_ZERO, 'zero')}>
            Matriz cero
          </VizButton>
        </ButtonRow>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 font-mono text-xs leading-relaxed">
          nullity = dim Ker = # libres ={' '}
          <span className="font-semibold text-[var(--accent-strong)]">{info.nullity}</span>
          {info.nullity === 0 ? (
            <span className="text-[var(--fg-muted)]"> · Ker = {'{0}'} (solo trivial)</span>
          ) : (
            <span className="text-orange-700 dark:text-orange-300">
              {' '}
              · infinitas soluciones, dimensión {info.nullity}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-start gap-4">
          <MatrixBrackets label="A" dimLabel={`${m}×${n}`}>
            <MatrixGrid
              matrix={A}
              editable
              onChange={onChange}
              name="A"
              highlightCells={info.pivots.flatMap((j) =>
                A.map((_, i) => [i, j] as [number, number]),
              )}
            />
          </MatrixBrackets>

          <div className="min-w-[13rem] flex-1 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              Ax = 0
            </p>
            <div className="space-y-1 font-mono text-sm">
              {A.map((row, i) => (
                <div key={i}>{formatEqRow(row, n)}</div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {Array.from({ length: n }, (_, j) => {
                const isPivot = info.pivots.includes(j);
                return (
                  <span
                    key={j}
                    className={`rounded px-2 py-0.5 font-mono text-[10px] font-semibold ${
                      isPivot
                        ? 'bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                        : 'bg-orange-500/15 text-orange-700 dark:text-orange-300'
                    }`}
                  >
                    x{j + 1}: {isPivot ? 'Pivote' : 'Libre'}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {tab === 'conceptual' ? (
          <div className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-3">
            <p className="font-mono text-sm text-[var(--fg)]">{paramStr}</p>
            {info.nullity > 0 ? (
              <ControlsStack>
                <SliderRow label="t" value={t} min={-2} max={2} step={0.1} onChange={setT} />
                {info.nullity >= 2 ? (
                  <SliderRow label="s" value={s} min={-2} max={2} step={0.1} onChange={setS} />
                ) : null}
              </ControlsStack>
            ) : (
              <p className="text-sm text-[var(--fg-muted)]">
                Con nulidad 0 el núcleo es solo el origen: no hay parámetros libres.
              </p>
            )}
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 font-mono text-xs">
                x = {formatVec(x.length ? x : Array.from({ length: n }, () => 0))}
              </div>
              <div
                className={`rounded-md border px-3 py-2 font-mono text-xs ${
                  nearZero
                    ? 'border-[var(--accent-strong)]/40 bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                    : 'border-orange-500/40 bg-orange-500/10 text-orange-800 dark:text-orange-200'
                }`}
              >
                Ax ≈ {formatVec(Ax.length ? Ax : Array.from({ length: m }, () => 0))}
                {nearZero ? ' ✓ ≈ 0' : ` · ‖Ax‖²≈${fmt(residual, 4)}`}
              </div>
            </div>
            {info.basis.length > 0 ? (
              <p className="font-mono text-[11px] text-[var(--fg-muted)]">
                Base Ker:{' '}
                {info.basis.map((b, i) => (
                  <span key={i}>
                    {i > 0 ? ', ' : ''}
                    {formatVec(b)}
                  </span>
                ))}
              </p>
            ) : (
              <p className="font-mono text-[11px] text-[var(--fg-muted)]">Base Ker: vacía · Ker = {'{0}'}</p>
            )}
          </div>
        ) : (
          <div className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 font-mono text-xs leading-relaxed">
            <p>
              Pivotes (cols):{' '}
              {info.pivots.length ? info.pivots.map((j) => j + 1).join(', ') : '—'}
            </p>
            <p>
              Libres (cols):{' '}
              <span className="text-orange-700 dark:text-orange-300">
                {info.free.length ? info.free.map((j) => j + 1).join(', ') : '—'}
              </span>
            </p>
            <p>
              rank = {info.rank}, nullity = {info.nullity}, n = {n}
            </p>
            <p className="text-[var(--fg-muted)]">
              Solución paramétrica: {paramStr}
              {info.nullity === 1 && info.basis[0]
                ? ` · con t=${presentLin(t)} → x=${formatVec(x)}`
                : ''}
            </p>
          </div>
        )}

        <p className="border-t border-[var(--border)] pt-2 text-xs text-[var(--fg-muted)]">
          rank + nullity = n → {info.rank} + {info.nullity} = {n}
        </p>
      </div>
    </VizPanel>
  );
}
