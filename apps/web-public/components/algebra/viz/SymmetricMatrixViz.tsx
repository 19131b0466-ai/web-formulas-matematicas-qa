'use client';

import { useMemo, useState } from 'react';
import {
  type Matrix,
  type CellPos,
  present,
  aLabel,
  resizeMatrix,
  setCell,
  dims,
  dimSuperscript,
  MatrixBrackets,
  MatrixGrid,
  cloneMatrix,
  transpose,
  matricesEqual,
} from './matrixGrid';
import {
  VizPanel,
  ControlsStack,
  SliderRow,
  ButtonRow,
  VizButton,
  joinCaption,
} from './controls';

const INITIAL_SYMMETRIC: Matrix = [
  [2, 1, 4],
  [1, 3, -2],
  [4, -2, 5],
];

type Mode = 'build' | 'check';

/** Force lower triangle = upper triangle. */
function makeSymmetric(m: Matrix): Matrix {
  const result = cloneMatrix(m);
  for (let i = 0; i < result.length; i++) {
    for (let j = i + 1; j < (result[i]?.length ?? 0); j++) {
      if (result[j]) result[j]![i] = result[i]![j]!;
    }
  }
  return result;
}

/** Return all off-diagonal pairs (i, j) with i < j where a[i][j] ≠ a[j][i]. */
function getBrokenPairs(m: Matrix): Array<[number, number]> {
  const { rows } = dims(m);
  const pairs: Array<[number, number]> = [];
  for (let i = 0; i < rows; i++) {
    for (let j = i + 1; j < rows; j++) {
      if (Math.abs((m[i]?.[j] ?? 0) - (m[j]?.[i] ?? 0)) > 1e-9) {
        pairs.push([i, j]);
      }
    }
  }
  return pairs;
}

export function SymmetricMatrixViz() {
  const [n, setN] = useState(3);
  const [matrix, setMatrix] = useState<Matrix>(INITIAL_SYMMETRIC);
  const [mode, setMode] = useState<Mode>('build');
  // Initial selection: a₁₃ ↔ a₃₁ (0-based i=0, j=2)
  const [selected, setSelected] = useState<CellPos | null>({ i: 0, j: 2 });
  const [hover, setHover] = useState<CellPos | null>(null);

  const tMatrix = useMemo(() => transpose(matrix), [matrix]);
  const isSymmetric = useMemo(() => matricesEqual(matrix, tMatrix), [matrix, tMatrix]);
  const brokenPairs = useMemo(() => getBrokenPairs(matrix), [matrix]);
  const pairCount = (n * (n - 1)) / 2;

  function handleNChange(newN: number) {
    setN(newN);
    setMatrix((prev) => makeSymmetric(resizeMatrix(prev, newN, newN)));
    setSelected(null);
  }

  /**
   * In 'build' mode, detect which single cell changed and mirror it to its
   * transpose partner so symmetry is maintained automatically.
   * In 'check' mode, accept changes as-is.
   */
  function handleMatrixChange(newMatrix: Matrix) {
    if (mode === 'build') {
      const sym = cloneMatrix(newMatrix);
      for (let r = 0; r < newMatrix.length; r++) {
        for (let c = 0; c < (newMatrix[r]?.length ?? 0); c++) {
          if (
            r !== c &&
            Math.abs((newMatrix[r]?.[c] ?? 0) - (matrix[r]?.[c] ?? 0)) > 1e-12
          ) {
            // Cell (r, c) changed — mirror to (c, r)
            if (sym[c]) sym[c]![r] = sym[r]![c]!;
          }
        }
      }
      setMatrix(sym);
    } else {
      setMatrix(newMatrix);
    }
  }

  function restoreSymmetry() {
    setMatrix(makeSymmetric(matrix));
  }

  function copyToSymmetric() {
    if (!selected || selected.i === selected.j) return;
    const { i, j } = selected;
    setMatrix(setCell(matrix, j, i, matrix[i]?.[j] ?? 0));
  }

  function switchMode(next: Mode) {
    setMode(next);
    // When switching to 'build', snap to symmetric so the toggle starts clean
    if (next === 'build') setMatrix(makeSymmetric(matrix));
    setSelected(null);
  }

  const isDiag = selected != null && selected.i === selected.j;
  const selLabel = selected != null ? aLabel(selected.i, selected.j) : null;
  const selVal = selected != null ? (matrix[selected.i]?.[selected.j] ?? 0) : null;
  const partnerLabel =
    selected != null && !isDiag ? aLabel(selected.j, selected.i) : null;
  const partnerVal =
    selected != null && !isDiag ? (matrix[selected.j]?.[selected.i] ?? 0) : null;
  const pairEqual =
    selVal != null && partnerVal != null
      ? Math.abs(selVal - partnerVal) < 1e-9
      : true;

  // Highlight both cells of the selected off-diagonal pair
  const highlightCells: Array<[number, number]> =
    selected != null && !isDiag
      ? [
          [selected.i, selected.j],
          [selected.j, selected.i],
        ]
      : [];

  const caption = joinCaption(
    isSymmetric ? 'A = Aᵀ' : 'A ≠ Aᵀ',
    isSymmetric
      ? `${pairCount} par${pairCount !== 1 ? 'es' : ''} simétrico${pairCount !== 1 ? 's' : ''}`
      : `${brokenPairs.length} par${brokenPairs.length !== 1 ? 'es' : ''} roto${brokenPairs.length !== 1 ? 's' : ''}`,
    selected != null && !isDiag
      ? `${selLabel}${pairEqual ? '=' : '≠'}${partnerLabel}`
      : null,
  );

  return (
    <VizPanel title="ALG-MAT-007 — Matriz simétrica (A = Aᵀ)" caption={caption}>
      {/* Guide */}
      <div className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 text-sm">
        <p className="font-semibold text-[var(--fg)]">Guía</p>
        <p className="mt-1 text-[var(--fg-muted)]">
          Una matriz es simétrica si A = Aᵀ, es decir, si cada entrada a<sub>ij</sub> es
          igual a a<sub>ji</sub>. Los elementos de la diagonal se reflejan sobre sí mismos:
          a<sub>ii</sub> = a<sub>ii</sub>.
        </p>
        <p className="mt-1 text-teal-600 dark:text-teal-400">
          Pruébalo — Selecciona una entrada fuera de la diagonal para ver cómo su pareja
          a<sub>ji</sub> se refleja. Cambia al modo «Comprobar» para editar libremente y
          detectar cuándo se rompe la simetría.
        </p>
      </div>

      {/* Mode selector */}
      <div className="mb-3">
        <ButtonRow>
          <VizButton onClick={() => switchMode('build')} active={mode === 'build'}>
            Construir simétrica
          </VizButton>
          <VizButton onClick={() => switchMode('check')} active={mode === 'check'}>
            Comprobar matriz
          </VizButton>
        </ButtonRow>
        <p className="mt-1.5 text-xs text-[var(--fg-muted)]">
          {mode === 'build'
            ? 'Editar a\u1D62\u2C7C refleja automáticamente a\u2C7C\u1D62 — la simetría siempre se mantiene.'
            : 'Edición libre — detecta si la simetría se rompe al cambiar entradas de forma independiente.'}
        </p>
      </div>

      {/* Symmetry status badge */}
      <div
        className={`mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${
          isSymmetric
            ? 'border-teal-500/40 bg-teal-500/10 text-teal-700 dark:text-teal-300'
            : 'border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400'
        }`}
      >
        {isSymmetric ? '✓ Matriz simétrica' : '✕ No es simétrica'}
        {!isSymmetric && (
          <span className="text-xs opacity-75">
            {brokenPairs.length} par{brokenPairs.length !== 1 ? 'es' : ''} roto
            {brokenPairs.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* A and Aᵀ side by side */}
      <div className="mb-3 flex flex-wrap items-start gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-xs text-[var(--fg-muted)]">
            A ∈ ℝ{dimSuperscript(n, n)}
          </p>
          <MatrixBrackets label="A">
            <MatrixGrid
              matrix={matrix}
              onChange={handleMatrixChange}
              editable
              selected={selected}
              hover={hover}
              highlightCells={highlightCells}
              highlightDiag
              onSelect={setSelected}
              onHover={setHover}
              showIndices
              name="A"
            />
          </MatrixBrackets>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-xs text-[var(--fg-muted)]">Aᵀ (transpuesta)</p>
          <MatrixBrackets label="Aᵀ">
            <MatrixGrid
              matrix={tMatrix}
              showIndices={false}
              readOnlyStyle
              cellSize="sm"
              name="Aᵀ"
            />
          </MatrixBrackets>
          {isSymmetric && (
            <p className="mt-1 text-center text-[10px] text-teal-600 dark:text-teal-400">
              A = Aᵀ ✓
            </p>
          )}
        </div>
      </div>

      {/* Selected-cell info panel */}
      {selected != null && (
        <div className="mb-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm">
          {isDiag ? (
            <p className="text-[var(--fg-muted)]">
              <span className="font-mono font-semibold text-[var(--fg)]">
                {selLabel} = {present(selVal ?? 0)}
              </span>
              &ensp;— elemento diagonal, se refleja sobre sí mismo.
            </p>
          ) : (
            <div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-mono font-semibold text-[var(--accent-strong)]">
                  {selLabel} = {present(selVal ?? 0)}
                </span>
                <span className="text-[var(--fg-muted)]">vs</span>
                <span
                  className={`font-mono font-semibold ${
                    pairEqual
                      ? 'text-teal-600 dark:text-teal-300'
                      : 'text-red-500 dark:text-red-400'
                  }`}
                >
                  {partnerLabel} = {present(partnerVal ?? 0)}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    pairEqual
                      ? 'text-teal-600 dark:text-teal-300'
                      : 'text-red-500 dark:text-red-400'
                  }`}
                >
                  {pairEqual ? '✓ iguales' : '✕ distintos'}
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                Reflejo diagonal: {selLabel} ↔ {partnerLabel}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Broken pairs list (check mode only) */}
      {mode === 'check' && !isSymmetric && brokenPairs.length > 0 && (
        <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs">
          <p className="mb-1.5 font-semibold text-red-600 dark:text-red-400">
            Pares rotos:
          </p>
          <div className="flex flex-wrap gap-2">
            {brokenPairs.map(([i, j]) => (
              <button
                key={`${i}-${j}`}
                type="button"
                onClick={() => setSelected({ i, j })}
                className="font-mono text-[var(--fg-muted)] underline hover:text-[var(--fg)]"
              >
                {aLabel(i, j)} ≠ {aLabel(j, i)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons (check mode, not symmetric) */}
      {mode === 'check' && !isSymmetric && (
        <div className="mb-3">
          <ButtonRow>
            <VizButton onClick={restoreSymmetry}>Restaurar simetría</VizButton>
            {selected != null && !isDiag && (
              <VizButton onClick={copyToSymmetric}>
                Copiar {selLabel} → {partnerLabel}
              </VizButton>
            )}
          </ButtonRow>
        </div>
      )}

      {/* Pair count info */}
      <p className="mb-3 text-xs text-[var(--fg-muted)]">
        Pares fuera de la diagonal: n(n−1)/2 = {n}×{n - 1}/2 = {pairCount}
      </p>

      {/* Size control */}
      <ControlsStack>
        <SliderRow
          label="n"
          ariaLabel="Tamaño n de la matriz cuadrada"
          value={n}
          min={2}
          max={5}
          step={1}
          onChange={handleNChange}
        />
      </ControlsStack>
    </VizPanel>
  );
}
