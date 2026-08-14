'use client';

import { useState } from 'react';
import {
  type Matrix,
  type CellPos,
  present,
  aLabel,
  resizeMatrix,
  getRow,
  getCol,
  dims,
  dimSuperscript,
  matrixTypeLabel,
  MatrixBrackets,
  MatrixGrid,
} from './matrixGrid';
import { VizPanel, ControlsStack, SliderRow, joinCaption } from './controls';

const INITIAL_MATRIX: Matrix = [
  [2, 1, 0, 4],
  [1, 3, -1, 2],
  [0, 2, 5, 1],
];

type VectorView = { kind: 'row'; i: number } | { kind: 'col'; j: number } | null;

export function MatrixSizeViz() {
  const [m, setM] = useState(3);
  const [n, setN] = useState(4);
  const [matrix, setMatrix] = useState<Matrix>(INITIAL_MATRIX);
  const [selected, setSelected] = useState<CellPos | null>({ i: 1, j: 2 });
  const [hover, setHover] = useState<CellPos | null>(null);
  const [vectorView, setVectorView] = useState<VectorView>(null);

  function handleMChange(newM: number) {
    setM(newM);
    setMatrix((prev) => resizeMatrix(prev, newM, n));
    setSelected(null);
    setVectorView(null);
  }

  function handleNChange(newN: number) {
    setN(newN);
    setMatrix((prev) => resizeMatrix(prev, m, newN));
    setSelected(null);
    setVectorView(null);
  }

  const { rows, cols } = dims(matrix);
  const totalEntries = rows * cols;
  const typeLabel = matrixTypeLabel(rows, cols);

  const selLabel = selected != null ? aLabel(selected.i, selected.j) : null;
  const selVal = selected != null ? (matrix[selected.i]?.[selected.j] ?? 0) : null;

  const vectorLabel =
    vectorView != null
      ? vectorView.kind === 'row'
        ? `Fila ${vectorView.i + 1} extraída como vector fila`
        : `Columna ${vectorView.j + 1} extraída como vector columna`
      : null;

  const vectorValues =
    vectorView != null
      ? vectorView.kind === 'row'
        ? getRow(matrix, vectorView.i)
        : getCol(matrix, vectorView.j)
      : null;

  const vectorMatrix: Matrix | null =
    vectorValues != null
      ? vectorView?.kind === 'row'
        ? [vectorValues]
        : vectorValues.map((v) => [v])
      : null;

  const caption = joinCaption(
    `Dimensión: ${rows}×${cols}`,
    `${totalEntries} entrada${totalEntries !== 1 ? 's' : ''}`,
    selLabel != null ? `${selLabel} = ${present(selVal ?? 0)}` : null,
  );

  return (
    <VizPanel title="ALG-MAT-001 — Dimensión de una matriz" caption={caption}>
      {/* Guide */}
      <div className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 text-sm">
        <p className="font-semibold text-[var(--fg)]">Guía</p>
        <p className="mt-1 text-[var(--fg-muted)]">
          Vas a ver que una matriz m×n organiza valores en m filas y n columnas. Cada
          entrada a<sub>ij</sub> se localiza en la fila i y la columna j.
        </p>
        <p className="mt-1 text-teal-600 dark:text-teal-400">
          Pruébalo — Cambia m y n, y selecciona una entrada a<sub>ij</sub> para
          identificar su fila i y su columna j.
        </p>
      </div>

      {/* Header row */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <span className="font-mono text-lg font-semibold text-[var(--fg)]">
          A ∈ ℝ{dimSuperscript(rows, cols)}
        </span>
        <span className="text-sm text-[var(--fg-muted)]">
          {rows} fila{rows !== 1 ? 's' : ''} × {cols} columna{cols !== 1 ? 's' : ''}
        </span>
        <span className="rounded-full border border-[var(--border)] bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--accent-strong)]">
          {typeLabel}
        </span>
      </div>

      {/* Matrix with dimensional hints */}
      <div className="mb-3 inline-flex flex-col gap-1">
        {/* Top hint: ← n columnas → */}
        <span className="self-center pl-6 text-[10px] text-[var(--fg-muted)]">
          ← {cols} columna{cols !== 1 ? 's' : ''} →
        </span>

        <div className="flex items-center gap-2">
          {/* Left hint: m filas (vertical) */}
          <span
            className="shrink-0 select-none text-[10px] text-[var(--fg-muted)]"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            {rows} fila{rows !== 1 ? 's' : ''}
          </span>

          <MatrixBrackets label="A">
            <MatrixGrid
              matrix={matrix}
              onChange={setMatrix}
              editable
              selected={selected}
              hover={hover}
              highlightRow={selected?.i ?? null}
              highlightCol={selected?.j ?? null}
              onSelect={setSelected}
              onHover={setHover}
              onRowIndexClick={(i) => {
                setVectorView((prev) =>
                  prev?.kind === 'row' && prev.i === i ? null : { kind: 'row', i },
                );
              }}
              onColIndexClick={(j) => {
                setVectorView((prev) =>
                  prev?.kind === 'col' && prev.j === j ? null : { kind: 'col', j },
                );
              }}
              showIndices
              name="A"
            />
          </MatrixBrackets>
        </div>

        <p className="mt-0.5 pl-6 text-[10px] text-[var(--fg-muted)]">
          Haz clic en un número de fila o columna para extraer ese vector.
        </p>
      </div>

      {/* Selected-cell info panel */}
      {selected != null && (
        <div className="mb-3 rounded-lg border border-[var(--accent-strong)]/40 bg-[var(--accent-soft)]/30 px-3 py-2 text-sm">
          <p className="font-mono font-semibold text-[var(--fg)]">
            Entrada seleccionada: {selLabel} = {present(selVal ?? 0)}
          </p>
          <p className="mt-1 text-[var(--fg-muted)]">
            · fila i = {selected.i + 1}&emsp;· columna j = {selected.j + 1}
          </p>
          <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
            i = fila (posición vertical) &nbsp;·&nbsp; j = columna (posición horizontal)
          </p>
        </div>
      )}

      {/* Extracted vector panel */}
      {vectorMatrix != null && vectorView != null && (
        <div className="mb-3 rounded-lg border border-teal-500/40 bg-teal-500/10 px-3 py-2 text-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-mono font-semibold text-[var(--fg)]">{vectorLabel}</p>
            <button
              type="button"
              onClick={() => setVectorView(null)}
              className="text-xs text-[var(--fg-muted)] underline hover:text-[var(--fg)]"
            >
              Cerrar
            </button>
          </div>
          <MatrixBrackets>
            <MatrixGrid
              matrix={vectorMatrix}
              showIndices={false}
              readOnlyStyle
              cellSize="sm"
              name={
                vectorView.kind === 'row'
                  ? `f${vectorView.i + 1}`
                  : `c${vectorView.j + 1}`
              }
            />
          </MatrixBrackets>
        </div>
      )}

      {/* Dimension controls */}
      <p className="mb-1 text-xs text-[var(--fg-muted)]">m = filas &nbsp;·&nbsp; n = columnas</p>
      <ControlsStack>
        <SliderRow
          label="m"
          ariaLabel="Número de filas m"
          value={m}
          min={1}
          max={6}
          step={1}
          onChange={handleMChange}
        />
        <SliderRow
          label="n"
          ariaLabel="Número de columnas n"
          value={n}
          min={1}
          max={6}
          step={1}
          onChange={handleNChange}
        />
      </ControlsStack>
    </VizPanel>
  );
}
