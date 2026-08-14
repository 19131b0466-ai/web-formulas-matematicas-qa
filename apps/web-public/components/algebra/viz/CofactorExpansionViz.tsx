'use client';

import { useMemo, useState } from 'react';
import { ButtonRow, ToggleRow, VizButton, VizPanel } from './controls';
import { DET_EPS, formatSigned } from './detHelpers';
import { det2, type Mat2 } from './math2d';
import {
  MatrixBrackets,
  MatrixGrid,
  aLabel,
  cloneMatrix,
  present,
  type Matrix,
} from './matrixGrid';

const DEFAULT: Matrix = [
  [2, 1, 3],
  [0, -1, 2],
  [1, 4, 0],
];

const ZEROS_EXAMPLE: Matrix = [
  [1, 0, 2],
  [0, 3, 0],
  [4, 0, 5],
];

type Axis = 'fila' | 'columna';

function minorMatrix(m: Matrix, i: number, j: number): Mat2 {
  const rows = m.filter((_, r) => r !== i).map((row) => row.filter((_, c) => c !== j));
  return [
    [rows[0]![0]!, rows[0]![1]!],
    [rows[1]![0]!, rows[1]![1]!],
  ];
}

function detViaExpansion(m: Matrix, axis: Axis, index: number): number {
  const n = m.length;
  if (n === 0) return 1;
  if (n === 1) return m[0]![0]!;
  if (n === 2) {
    return det2([
      [m[0]![0]!, m[0]![1]!],
      [m[1]![0]!, m[1]![1]!],
    ]);
  }
  let sum = 0;
  for (let k = 0; k < n; k++) {
    const i = axis === 'fila' ? index : k;
    const j = axis === 'fila' ? k : index;
    const a = m[i]![j]!;
    if (Math.abs(a) < DET_EPS) continue;
    const Mi = minorMatrix(m, i, j);
    const sign = (i + j) % 2 === 0 ? 1 : -1;
    sum += a * sign * det2(Mi);
  }
  return sum;
}

function countZerosOnLine(m: Matrix, axis: Axis, index: number): number {
  let z = 0;
  for (let k = 0; k < 3; k++) {
    const v = axis === 'fila' ? m[index]![k]! : m[k]![index]!;
    if (Math.abs(v) < DET_EPS) z += 1;
  }
  return z;
}

function suggestLine(m: Matrix): { axis: Axis; index: number } {
  let best: { axis: Axis; index: number; zeros: number } = {
    axis: 'fila',
    index: 0,
    zeros: -1,
  };
  for (const axis of ['fila', 'columna'] as Axis[]) {
    for (let index = 0; index < 3; index++) {
      const zeros = countZerosOnLine(m, axis, index);
      if (zeros > best.zeros) best = { axis, index, zeros };
    }
  }
  return { axis: best.axis, index: best.index };
}

function signOf(i: number, j: number): 1 | -1 {
  return (i + j) % 2 === 0 ? 1 : -1;
}

function termOnLine(axis: Axis, index: number, k: number): { i: number; j: number } {
  return axis === 'fila' ? { i: index, j: k } : { i: k, j: index };
}

export function CofactorExpansionViz() {
  const [A, setA] = useState<Matrix>(() => cloneMatrix(DEFAULT));
  const [axis, setAxis] = useState<Axis>('fila');
  const [lineIndex, setLineIndex] = useState(0); // 0-based; default fila 1
  const [termK, setTermK] = useState(0); // position along the chosen line
  const [showSigns, setShowSigns] = useState(false);

  const { i: selI, j: selJ } = termOnLine(axis, lineIndex, termK);
  const aij = A[selI]![selJ]!;
  const Mij = useMemo(() => minorMatrix(A, selI, selJ), [A, selI, selJ]);
  const detM = det2(Mij);
  const sgn = signOf(selI, selJ);
  const Cij = sgn * detM;
  const term = aij * Cij;

  const detA = useMemo(() => detViaExpansion(A, axis, lineIndex), [A, axis, lineIndex]);

  const expansionTerms = useMemo(() => {
    return [0, 1, 2].map((k) => {
      const { i, j } = termOnLine(axis, lineIndex, k);
      const a = A[i]![j]!;
      const M = minorMatrix(A, i, j);
      const s = signOf(i, j);
      const C = s * det2(M);
      return { k, i, j, a, M, s, C, term: a * C };
    });
  }, [A, axis, lineIndex]);

  const eliminatedCells = useMemo(() => {
    const cells: Array<[number, number]> = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (r === selI || c === selJ) cells.push([r, c]);
      }
    }
    return cells;
  }, [selI, selJ]);

  const onSelectCell = (pos: { i: number; j: number } | null) => {
    if (!pos) return;
    if (axis === 'fila') {
      if (pos.i === lineIndex) {
        setTermK(pos.j);
      } else {
        // Jump expansion to the clicked row (keep column as term).
        setLineIndex(pos.i);
        setTermK(pos.j);
      }
    } else if (pos.j === lineIndex) {
      setTermK(pos.i);
    } else {
      setLineIndex(pos.j);
      setTermK(pos.i);
    }
  };

  const pickExpansion = () => {
    const s = suggestLine(A);
    setAxis(s.axis);
    setLineIndex(s.index);
    setTermK(0);
  };

  return (
    <VizPanel
      title="Expansión por cofactores"
      caption="El menor Mᵢⱼ es el det de la submatriz al borrar fila i y columna j. El cofactor es Cᵢⱼ = (−1)ⁱ⁺ʲ Mᵢⱼ. det(A) = Σ aᵢⱼ Cᵢⱼ sobre una fila o columna."
    >
      <div className="space-y-3">
        <p className="text-sm text-[var(--fg)]">
          Vas a ver que el determinante se puede expandir por una fila o columna (cofactores).
        </p>
        <p className="text-sm text-[var(--fg-muted)]">
          <span className="font-medium text-[var(--fg)]">Pruébalo — </span>
          Elige fila o columna, selecciona un término aᵢⱼ y compara menor Mᵢⱼ frente a cofactor Cᵢⱼ. Con
          ceros, la expansión se acorta.
        </p>

        <div className="flex flex-wrap items-start gap-4">
          <div className="space-y-2">
            <MatrixBrackets label="A" dimLabel="3×3">
              <MatrixGrid
                matrix={A}
                editable
                showIndices
                name="A"
                highlightRow={axis === 'fila' ? lineIndex : null}
                highlightCol={axis === 'columna' ? lineIndex : null}
                selected={{ i: selI, j: selJ }}
                highlightCells={[[selI, selJ]]}
                onSelect={onSelectCell}
                onRowIndexClick={(i) => {
                  setAxis('fila');
                  setLineIndex(i);
                  setTermK(0);
                }}
                onColIndexClick={(j) => {
                  setAxis('columna');
                  setLineIndex(j);
                  setTermK(0);
                }}
                onChange={(next) => setA(next)}
              />
            </MatrixBrackets>
            {showSigns ? (
              <div className="mt-2" aria-label="Patrón de signos (−1)ⁱ⁺ʲ">
                <div className="mb-1 font-mono text-[10px] text-[var(--fg-muted)]">signos (−1)ⁱ⁺ʲ</div>
                <div className="inline-grid gap-1" style={{ gridTemplateColumns: 'repeat(3, 2.5rem)' }}>
                  {[0, 1, 2].map((i) =>
                    [0, 1, 2].map((j) => {
                      const s = signOf(i, j);
                      return (
                        <div
                          key={`${i}-${j}`}
                          className={`flex h-8 items-center justify-center rounded border font-mono text-sm font-bold ${
                            s > 0
                              ? 'border-[var(--accent-strong)]/40 bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                              : 'border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400'
                          }`}
                        >
                          {s > 0 ? '+' : '−'}
                        </div>
                      );
                    }),
                  )}
                </div>
              </div>
            ) : null}
            <p className="font-mono text-sm">
              det(A) ={' '}
              <span className="font-semibold text-[var(--accent-strong)]">{present(detA)}</span>
            </p>
          </div>

          <div className="min-w-[14rem] flex-1 space-y-2">
            <div className="flex flex-wrap gap-2">
              <VizButton active={axis === 'fila'} onClick={() => setAxis('fila')}>
                Fila
              </VizButton>
              <VizButton active={axis === 'columna'} onClick={() => setAxis('columna')}>
                Columna
              </VizButton>
              {[0, 1, 2].map((idx) => (
                <VizButton
                  key={idx}
                  active={lineIndex === idx}
                  onClick={() => {
                    setLineIndex(idx);
                    setTermK(0);
                  }}
                >
                  {idx + 1}
                </VizButton>
              ))}
            </div>
            <p className="text-xs text-[var(--fg-muted)]">
              Expansión por {axis} {lineIndex + 1}. Término seleccionado:{' '}
              <span className="font-mono text-[var(--fg)]">{aLabel(selI, selJ)}</span>
            </p>
            <div className="flex flex-wrap gap-1">
              {expansionTerms.map((t) => (
                <VizButton key={t.k} active={termK === t.k} onClick={() => setTermK(t.k)}>
                  {aLabel(t.i, t.j)}
                </VizButton>
              ))}
            </div>
          </div>
        </div>

        {/* Menor vs cofactor */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              Menor M{selI + 1}
              {selJ + 1}
            </div>
            <p className="text-xs text-[var(--fg-muted)]">
              Borra la fila {selI + 1} y la columna {selJ + 1} (atenuadas). El menor es el determinante
              de la submatriz 2×2 restante.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="opacity-90">
                <div
                  className="inline-grid gap-1"
                  style={{ gridTemplateColumns: 'repeat(3, 2.75rem)' }}
                >
                  {A.map((row, r) =>
                    row.map((v, c) => {
                      const elim = r === selI || c === selJ;
                      const sel = r === selI && c === selJ;
                      return (
                        <div
                          key={`${r}-${c}`}
                          className={`flex h-9 items-center justify-center rounded border font-mono text-xs tabular-nums ${
                            sel
                              ? 'border-orange-500 bg-orange-500/15 text-orange-700 dark:text-orange-300'
                              : elim
                                ? 'border-[var(--border)] bg-[var(--bg)]/40 text-[var(--fg-muted)] opacity-40 line-through'
                                : 'border-[var(--accent-strong)]/50 bg-[var(--accent-soft)]'
                          }`}
                        >
                          {present(v)}
                        </div>
                      );
                    }),
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <MatrixBrackets label={`M${selI + 1}${selJ + 1}`} dimLabel="2×2">
                  <MatrixGrid matrix={Mij} showIndices={false} readOnlyStyle cellSize="sm" name="M" />
                </MatrixBrackets>
                <div className="font-mono text-xs">
                  det(M) = ad − bc = <span className="font-semibold">{present(detM)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              Cofactor C{selI + 1}
              {selJ + 1}
            </div>
            <p className="text-xs text-[var(--fg-muted)]">
              El cofactor añade el signo (−1)ⁱ⁺ʲ al menor. No confundas Mᵢⱼ con Cᵢⱼ.
            </p>
            <div className="space-y-1 font-mono text-xs leading-relaxed">
              <div>
                signo (−1)ⁱ⁺ʲ = (−1){selI + 1}+{selJ + 1} ={' '}
                <span className={sgn > 0 ? 'text-[var(--accent-strong)]' : 'text-orange-600 dark:text-orange-400'}>
                  {sgn > 0 ? '+1' : '−1'}
                </span>
              </div>
              <div>
                Cᵢⱼ = ({formatSigned(sgn)}) · Mᵢⱼ = ({formatSigned(sgn)})({present(detM)}) ={' '}
                <span className="font-semibold text-[var(--accent-strong)]">{present(Cij)}</span>
              </div>
              <div className="border-t border-[var(--border)] pt-1">
                término aᵢⱼ Cᵢⱼ = ({present(aij)})({present(Cij)}) ={' '}
                <span className="font-semibold">{present(term)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full expansion */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
            Expansión completa ({axis} {lineIndex + 1})
          </div>
          <div className="font-mono text-xs leading-relaxed sm:text-sm">
            det(A) ={' '}
            {expansionTerms.map((t, idx) => (
              <span key={t.k}>
                {idx > 0 ? ' + ' : null}
                <button
                  type="button"
                  onClick={() => setTermK(t.k)}
                  className={`rounded px-0.5 ${
                    termK === t.k
                      ? 'bg-[var(--accent-soft)] font-semibold text-[var(--accent-strong)]'
                      : 'hover:bg-[var(--accent-soft)]/50'
                  }`}
                >
                  {aLabel(t.i, t.j)} C{t.i + 1}
                  {t.j + 1}
                </button>
              </span>
            ))}
            <br />
            ={' '}
            {expansionTerms.map((t, idx) => (
              <span key={`v-${t.k}`}>
                {idx > 0 ? (t.term >= 0 ? ' + ' : ' − ') : t.term < 0 ? '−' : null}
                {present(Math.abs(t.term))}
              </span>
            ))}{' '}
            = <span className="font-semibold text-[var(--accent-strong)]">{present(detA)}</span>
          </div>
          <p className="mt-1 text-[11px] text-[var(--fg-muted)]">
            Celdas eliminadas al formar el menor actual: fila {selI + 1} y columna {selJ + 1} (
            {eliminatedCells.length} entradas atenuadas arriba).
          </p>
        </div>

        <ToggleRow label="Ver patrón de signos" checked={showSigns} onChange={setShowSigns} />
        {showSigns ? (
          <p className="text-xs text-[var(--fg-muted)]">
            Tablero +/− de (−1)ⁱ⁺ʲ. El naranja marca signo negativo; el verde, positivo.
          </p>
        ) : null}

        <ButtonRow>
          <VizButton
            onClick={() => {
              setA(cloneMatrix(ZEROS_EXAMPLE));
              const s = suggestLine(ZEROS_EXAMPLE);
              setAxis(s.axis);
              setLineIndex(s.index);
              setTermK(0);
            }}
          >
            Ejemplo con ceros
          </VizButton>
          <VizButton onClick={pickExpansion}>Sugerir expansión</VizButton>
          <VizButton
            onClick={() => {
              setA(cloneMatrix(DEFAULT));
              setAxis('fila');
              setLineIndex(0);
              setTermK(0);
              setShowSigns(false);
            }}
          >
            Reiniciar
          </VizButton>
        </ButtonRow>
      </div>
    </VizPanel>
  );
}
