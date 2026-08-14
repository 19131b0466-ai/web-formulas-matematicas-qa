'use client';

import { useMemo, useState } from 'react';
import {
  MatrixBrackets,
  MatrixGrid,
  type CellPos,
  type Matrix,
  aLabel,
  dimSuperscript,
  getCol,
  getRow,
  identity,
  matricesEqual,
  multiplyMatrices,
  present,
  resizeMatrix,
  sub,
} from './matrixGrid';
import {
  ButtonRow,
  ControlsStack,
  SliderRow,
  VizButton,
  VizPanel,
  joinCaption,
} from './controls';

const INITIAL_A: Matrix = [
  [2, 5, -1],
  [4, 0, 3],
];

export function IdentityMatrixViz() {
  const [A, setA] = useState<Matrix>(INITIAL_A);
  const [m, setM] = useState(2);
  const [n, setN] = useState(3);
  const [mode, setMode] = useState<'left' | 'right'>('left');
  const [selResult, setSelResult] = useState<CellPos | null>({ i: 0, j: 1 });

  const I = useMemo(() => (mode === 'left' ? identity(m) : identity(n)), [mode, m, n]);

  const result = useMemo(
    () => (mode === 'left' ? multiplyMatrices(I, A) : multiplyMatrices(A, I)),
    [mode, I, A],
  );

  const isEqual = useMemo(
    () => result != null && matricesEqual(result, A),
    [result, A],
  );

  const handleSetM = (val: number) => {
    const v = Math.round(val);
    setM(v);
    setA((prev) => resizeMatrix(prev, v, n));
    setSelResult(null);
  };

  const handleSetN = (val: number) => {
    const v = Math.round(val);
    setN(v);
    setA((prev) => resizeMatrix(prev, m, v));
    setSelResult(null);
  };

  // Qué fila/columna resaltar en I y en A según la celda seleccionada en el resultado
  // Modo izquierda (I_m · A): fila i de I, columna j de A
  // Modo derecha (A · I_n): fila i de A, columna j de I
  const iHlRow = mode === 'left' && selResult != null ? selResult.i : null;
  const iHlCol = mode === 'right' && selResult != null ? selResult.j : null;
  const aHlRow = mode === 'right' && selResult != null ? selResult.i : null;
  const aHlCol = mode === 'left' && selResult != null ? selResult.j : null;

  // Términos del producto para la celda seleccionada
  const detail = useMemo(() => {
    if (!selResult || !result) return null;
    const { i, j } = selResult;
    const resVal = result[i]?.[j] ?? 0;

    if (mode === 'left') {
      // Fila i de I_m × Columna j de A: I[i][k] · A[k][j]
      const iRow = getRow(I, i);
      const aCol = getCol(A, j);
      return {
        terms: iRow.map((c, k) => ({
          text: `${present(c)}·${present(aCol[k] ?? 0)}`,
          active: c !== 0,
          key: String(k),
        })),
        result: resVal,
        label: `${aLabel(i, j)} — Fila ${i + 1} de I${sub(m)} × Columna ${j + 1} de A`,
      };
    }

    // Fila i de A × Columna j de I_n: A[i][k] · I[k][j]
    const aRow = getRow(A, i);
    const iCol = getCol(I, j);
    return {
      terms: aRow.map((v, k) => ({
        text: `${present(v)}·${present(iCol[k] ?? 0)}`,
        active: (iCol[k] ?? 0) !== 0,
        key: String(k),
      })),
      result: resVal,
      label: `${aLabel(i, j)} — Fila ${i + 1} de A × Columna ${j + 1} de I${sub(n)}`,
    };
  }, [selResult, result, mode, I, A, m, n]);

  const ISize = mode === 'left' ? m : n;
  const ILabel = mode === 'left' ? `I${sub(m)}` : `I${sub(n)}`;
  const statusStr =
    mode === 'left'
      ? `I${sub(m)}A = A ${isEqual ? '✓' : '?'}`
      : `AI${sub(n)} = A ${isEqual ? '✓' : '?'}`;
  const dimDesc =
    mode === 'left'
      ? `(${m}×${m})(${m}×${n}) → ${m}×${n}`
      : `(${m}×${n})(${n}×${n}) → ${m}×${n}`;

  const caption = joinCaption(dimDesc, statusStr);

  return (
    <VizPanel caption={caption}>
      <div className="space-y-4">
        {/* Guía embebida */}
        <div className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm leading-relaxed text-[var(--fg-muted)]">
          <p>
            <span className="font-semibold text-[var(--fg)]">Matriz identidad (ALG-MAT-005):</span>{' '}
            La identidad I actúa como el «1» en la multiplicación: para cualquier
            A ∈ ℝ<sup>m×n</sup>, I<sub>m</sub>A = A y AI<sub>n</sub> = A. Tiene
            unos en la diagonal principal y ceros en el resto.{' '}
            <span className="font-mono">1·a = a</span> ↔ IA = A.
          </p>
          <p className="mt-1 text-xs">
            Selecciona una celda del resultado para ver cómo la única entrada 1 de
            la fila (o columna) de I conserva el valor de A, mientras que los ceros
            anulan el resto.
          </p>
        </div>

        {/* Pestañas de modo */}
        <ButtonRow>
          <VizButton
            active={mode === 'left'}
            onClick={() => {
              setMode('left');
              setSelResult({ i: 0, j: 1 });
            }}
          >
            Identidad a la izquierda
          </VizButton>
          <VizButton
            active={mode === 'right'}
            onClick={() => {
              setMode('right');
              setSelResult({ i: 0, j: 1 });
            }}
          >
            Identidad a la derecha
          </VizButton>
        </ButtonRow>

        {/* Nota dimensional */}
        <p className="font-mono text-xs text-[var(--fg-muted)]">{dimDesc}</p>

        {/* Matrices */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {mode === 'left' ? (
            <>
              <MatrixBrackets label={ILabel} dimLabel={`∈ ℝ${dimSuperscript(ISize, ISize)}`}>
                <MatrixGrid
                  matrix={I}
                  readOnlyStyle
                  highlightRow={iHlRow}
                  highlightDiag
                  cellSize="sm"
                  name={ILabel}
                />
              </MatrixBrackets>
              <span className="self-center font-mono text-xl text-[var(--fg-muted)]">·</span>
              <MatrixBrackets label="A" dimLabel={`∈ ℝ${dimSuperscript(m, n)}`}>
                <MatrixGrid
                  matrix={A}
                  editable
                  onChange={setA}
                  highlightCol={aHlCol}
                  name="A"
                />
              </MatrixBrackets>
              <span className="self-center font-mono text-xl text-[var(--fg-muted)]">=</span>
              <MatrixBrackets label="I·A" dimLabel={`∈ ℝ${dimSuperscript(m, n)}`}>
                <MatrixGrid
                  matrix={result ?? A}
                  selected={selResult}
                  onSelect={(pos) => setSelResult(pos)}
                  readOnlyStyle
                  name="I·A"
                />
              </MatrixBrackets>
            </>
          ) : (
            <>
              <MatrixBrackets label="A" dimLabel={`∈ ℝ${dimSuperscript(m, n)}`}>
                <MatrixGrid
                  matrix={A}
                  editable
                  onChange={setA}
                  highlightRow={aHlRow}
                  name="A"
                />
              </MatrixBrackets>
              <span className="self-center font-mono text-xl text-[var(--fg-muted)]">·</span>
              <MatrixBrackets label={ILabel} dimLabel={`∈ ℝ${dimSuperscript(ISize, ISize)}`}>
                <MatrixGrid
                  matrix={I}
                  readOnlyStyle
                  highlightCol={iHlCol}
                  highlightDiag
                  cellSize="sm"
                  name={ILabel}
                />
              </MatrixBrackets>
              <span className="self-center font-mono text-xl text-[var(--fg-muted)]">=</span>
              <MatrixBrackets label="A·I" dimLabel={`∈ ℝ${dimSuperscript(m, n)}`}>
                <MatrixGrid
                  matrix={result ?? A}
                  selected={selResult}
                  onSelect={(pos) => setSelResult(pos)}
                  readOnlyStyle
                  name="A·I"
                />
              </MatrixBrackets>
            </>
          )}
        </div>

        {/* Estado */}
        <p className="text-center font-mono text-sm font-semibold text-[var(--accent-strong)]">
          {statusStr}
        </p>

        {/* Detalle del producto seleccionado */}
        {detail && selResult ? (
          <div className="rounded-lg border border-[var(--accent-strong)]/30 bg-[var(--accent-soft)] px-3 py-2">
            <p className="mb-1.5 text-xs text-[var(--fg-muted)]">{detail.label}</p>
            <p className="flex flex-wrap items-center gap-0.5 font-mono text-sm">
              {detail.terms.map((t, k) => (
                <span key={t.key} className="flex items-center gap-0.5">
                  {k > 0 && (
                    <span className="mx-0.5 text-[var(--fg-muted)]">+</span>
                  )}
                  <span
                    className={
                      t.active
                        ? 'font-semibold text-[var(--accent-strong)]'
                        : 'opacity-30'
                    }
                  >
                    {t.text}
                  </span>
                </span>
              ))}
              <span className="mx-1 text-[var(--fg-muted)]">=</span>
              <span className="font-semibold text-[var(--accent-strong)]">
                {present(detail.result)}
              </span>
            </p>
          </div>
        ) : null}

        {/* Controles */}
        <ControlsStack>
          <SliderRow
            label="m"
            ariaLabel="Filas de A"
            value={m}
            min={2}
            max={4}
            step={1}
            onChange={handleSetM}
          />
          <SliderRow
            label="n"
            ariaLabel="Columnas de A"
            value={n}
            min={2}
            max={4}
            step={1}
            onChange={handleSetN}
          />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
