'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  MatrixBrackets,
  MatrixGrid,
  type CellPos,
  type Matrix,
  aLabel,
  dimSuperscript,
  present,
  resizeMatrix,
  transpose,
} from './matrixGrid';
import {
  ButtonRow,
  ControlsStack,
  SliderRow,
  ToggleRow,
  VizButton,
  VizPanel,
  joinCaption,
} from './controls';

const INITIAL_A: Matrix = [
  [2, 5, -1],
  [4, 0, 3],
];

export function TransposeMatrixViz() {
  const [A, setA] = useState<Matrix>(INITIAL_A);
  const [m, setM] = useState(2);
  const [n, setN] = useState(3);
  const [sel, setSel] = useState<CellPos | null>({ i: 0, j: 2 }); // a₁₃ = −1
  const [hlMode, setHlMode] = useState<'cell' | 'row' | 'col' | null>('cell');
  const [hlRow, setHlRow] = useState<number | null>(null);
  const [hlCol, setHlCol] = useState<number | null>(null);
  const [cycling, setCycling] = useState(false);
  const [cycleStep, setCycleStep] = useState(0);
  const [showDoubleT, setShowDoubleT] = useState(false);

  const AT = useMemo(() => transpose(A), [A]);
  const ATT = useMemo(() => transpose(AT), [AT]);
  const totalSteps = m + n;

  useEffect(() => {
    if (!cycling) return;
    const id = setInterval(() => setCycleStep((s) => (s + 1) % totalSteps), 650);
    return () => clearInterval(id);
  }, [cycling, totalSteps]);

  const handleSetM = (val: number) => {
    const v = Math.round(val);
    setM(v);
    setA((prev) => resizeMatrix(prev, v, n));
    setSel(null);
    setHlMode(null);
    setHlRow(null);
    setHlCol(null);
    setCycling(false);
    setCycleStep(0);
  };

  const handleSetN = (val: number) => {
    const v = Math.round(val);
    setN(v);
    setA((prev) => resizeMatrix(prev, m, v));
    setSel(null);
    setHlMode(null);
    setHlRow(null);
    setHlCol(null);
    setCycling(false);
    setCycleStep(0);
  };

  const handleSelectA = (pos: CellPos | null) => {
    setSel(pos);
    setHlMode(pos ? 'cell' : null);
    setHlRow(null);
    setHlCol(null);
    setCycling(false);
  };

  const handleRowClick = (i: number) => {
    setSel(null);
    setHlMode('row');
    setHlRow(i);
    setHlCol(null);
    setCycling(false);
  };

  const handleColClick = (j: number) => {
    setSel(null);
    setHlMode('col');
    setHlRow(null);
    setHlCol(j);
    setCycling(false);
  };

  const toggleCycle = () => {
    if (cycling) {
      setCycling(false);
      setCycleStep(0);
    } else {
      setSel(null);
      setHlMode(null);
      setCycleStep(0);
      setCycling(true);
    }
  };

  // Effective highlight derivation
  const cycleHlARow = cycling && cycleStep < m ? cycleStep : null;
  const cycleHlACol = cycling && cycleStep >= m ? cycleStep - m : null;
  const cycleHlATCol = cycling && cycleStep < m ? cycleStep : null;
  const cycleHlATRow = cycling && cycleStep >= m ? cycleStep - m : null;

  const aHlRow = cycling ? cycleHlARow : hlMode === 'row' ? hlRow : null;
  const aHlCol = cycling ? cycleHlACol : hlMode === 'col' ? hlCol : null;
  const aSelCell = cycling ? null : hlMode === 'cell' ? sel : null;
  const atHlRow = cycling ? cycleHlATRow : hlMode === 'col' ? hlCol : null;
  const atHlCol = cycling ? cycleHlATCol : hlMode === 'row' ? hlRow : null;
  const atSelCell: CellPos | null =
    !cycling && hlMode === 'cell' && sel ? { i: sel.j, j: sel.i } : null;

  const detailMsg = useMemo(() => {
    if (cycling) {
      if (cycleStep < m) return `Fila ${cycleStep + 1} de A → Columna ${cycleStep + 1} de Aᵀ`;
      const c = cycleStep - m;
      return `Columna ${c + 1} de A → Fila ${c + 1} de Aᵀ`;
    }
    if (hlMode === 'cell' && sel) {
      const val = A[sel.i]?.[sel.j] ?? 0;
      return `${aLabel(sel.i, sel.j)} = ${present(val)}  →  posición (${sel.j + 1},${sel.i + 1}) en Aᵀ  ·  mismo valor: ${present(val)}`;
    }
    if (hlMode === 'row' && hlRow !== null)
      return `Fila ${hlRow + 1} de A → Columna ${hlRow + 1} de Aᵀ`;
    if (hlMode === 'col' && hlCol !== null)
      return `Columna ${hlCol + 1} de A → Fila ${hlCol + 1} de Aᵀ`;
    return null;
  }, [cycling, cycleStep, m, hlMode, sel, hlRow, hlCol, A]);

  const caption = joinCaption(
    `A: ${m}×${n} → Aᵀ: ${n}×${m}`,
    !cycling && hlMode === 'cell' && sel
      ? `(${sel.i + 1},${sel.j + 1})↔(${sel.j + 1},${sel.i + 1})`
      : undefined,
  );

  return (
    <VizPanel caption={caption}>
      <div className="space-y-4">
        {/* Guía embebida */}
        <div className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm leading-relaxed text-[var(--fg-muted)]">
          <p>
            <span className="font-semibold text-[var(--fg)]">Transposición (ALG-MAT-006):</span>{' '}
            La transpuesta Aᵀ se obtiene intercambiando filas y columnas. Si A ∈ ℝ
            <sup>m×n</sup>, entonces Aᵀ ∈ ℝ<sup>n×m</sup>. Regla elemento a elemento:
            (Aᵀ)<sub>ij</sub> = a<sub>ji</sub> — la entrada (i,j) de Aᵀ es la entrada
            (j,i) de A.
          </p>
          <p className="mt-1 text-xs">
            Clic en una celda: ve la correspondencia (i,j)↔(j,i). Clic en índice de
            fila: «fila i de A → columna i de Aᵀ». Clic en columna: «columna j de A → fila j de Aᵀ».
          </p>
        </div>

        {/* Matrices lado a lado */}
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center sm:gap-5">
          <MatrixBrackets label="A" dimLabel={`∈ ℝ${dimSuperscript(m, n)}`}>
            <MatrixGrid
              matrix={A}
              editable
              onChange={setA}
              selected={aSelCell}
              highlightRow={aHlRow}
              highlightCol={aHlCol}
              onSelect={handleSelectA}
              onRowIndexClick={handleRowClick}
              onColIndexClick={handleColClick}
              name="A"
            />
          </MatrixBrackets>

          <div className="flex shrink-0 flex-col items-center gap-1 self-center">
            <span className="text-2xl leading-none text-[var(--accent-strong)]">⟶</span>
            <span className="text-xs font-semibold text-[var(--accent-strong)]">Transponer</span>
            <span className="font-mono text-[10px] text-[var(--fg-muted)]">
              {m}×{n} → {n}×{m}
            </span>
          </div>

          <MatrixBrackets label="Aᵀ" dimLabel={`∈ ℝ${dimSuperscript(n, m)}`}>
            <MatrixGrid
              matrix={AT}
              selected={atSelCell}
              highlightRow={atHlRow}
              highlightCol={atHlCol}
              readOnlyStyle
              name="Aᵀ"
            />
          </MatrixBrackets>
        </div>

        {/* Mensaje de detalle */}
        {detailMsg ? (
          <p className="rounded-lg border border-[var(--accent-strong)]/30 bg-[var(--accent-soft)] px-3 py-2 text-center font-mono text-sm text-[var(--accent-strong)]">
            {detailMsg}
          </p>
        ) : null}

        {/* Doble transposición */}
        {showDoubleT ? (
          <div className="rounded-lg border border-[var(--border)] px-3 py-2">
            <p className="mb-2 text-sm font-semibold text-[var(--fg)]">(Aᵀ)ᵀ = A</p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <MatrixBrackets label="(Aᵀ)ᵀ" dimLabel={`∈ ℝ${dimSuperscript(m, n)}`}>
                <MatrixGrid
                  matrix={ATT}
                  readOnlyStyle
                  cellSize="sm"
                  name="(Aᵀ)ᵀ"
                />
              </MatrixBrackets>
              <span className="font-mono font-semibold text-[var(--accent-strong)]">= A ✓</span>
            </div>
          </div>
        ) : null}

        {/* Controles */}
        <ControlsStack>
          <SliderRow
            label="m"
            ariaLabel="Número de filas de A"
            value={m}
            min={2}
            max={4}
            step={1}
            onChange={handleSetM}
          />
          <SliderRow
            label="n"
            ariaLabel="Número de columnas de A"
            value={n}
            min={2}
            max={4}
            step={1}
            onChange={handleSetN}
          />
          <ButtonRow>
            <VizButton active={cycling} onClick={toggleCycle}>
              {cycling ? 'Detener' : 'Ver transposición'}
            </VizButton>
          </ButtonRow>
          <ToggleRow label="(Aᵀ)ᵀ = A" checked={showDoubleT} onChange={setShowDoubleT} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
