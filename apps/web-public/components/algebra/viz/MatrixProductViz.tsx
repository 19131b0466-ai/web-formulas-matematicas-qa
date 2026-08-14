'use client';

import { useMemo, useState } from 'react';
import { ControlsStack, ToggleRow, VizPanel, joinCaption } from './controls';
import {
  type CellPos,
  type Matrix,
  MatrixBrackets,
  MatrixGrid,
  dims,
  dimSuperscript,
  getCol,
  getRow,
  multiplyMatrices,
  present,
  sub,
} from './matrixGrid';

const INIT_A: Matrix = [
  [2, 1, 3],
  [1, -1, 2],
];
const INIT_B: Matrix = [
  [1, 2],
  [0, 3],
  [2, -1],
];

export function MatrixProductViz() {
  const [A, setA] = useState<Matrix>(INIT_A);
  const [B, setB] = useState<Matrix>(INIT_B);
  const [selected, setSelected] = useState<CellPos>({ i: 0, j: 0 });
  const [showCompare, setShowCompare] = useState(false);

  const AB = useMemo(() => multiplyMatrices(A, B), [A, B]);
  const BA = useMemo(() => multiplyMatrices(B, A), [A, B]);

  const dA = dims(A);
  const dB = dims(B);
  const compatible = dA.cols === dB.rows;
  const dAB = AB ? dims(AB) : null;
  const dBA = BA ? dims(BA) : null;

  const { i, j } = selected;

  const rowA = AB ? getRow(A, i) : [];
  const colB = AB ? getCol(B, j) : [];
  const innerLen = rowA.length;
  const products = rowA.map((v, k) => v * (colB[k] ?? 0));
  const cellVal = AB?.[i]?.[j] ?? 0;

  // 1-indexed subscripts for display
  const si = sub(i + 1);
  const sj = sub(j + 1);

  const prodSymbolic = Array.from({ length: innerLen }, (_, k) =>
    `a${si}${sub(k + 1)}·b${sub(k + 1)}${sj}`,
  ).join(' + ');

  const prodNumerical = rowA
    .map((av, k) => {
      const bv = colB[k] ?? 0;
      const bStr = bv < 0 ? `(${present(bv)})` : present(bv);
      const aStr = av < 0 ? `(${present(av)})` : present(av);
      return `${aStr}·${bStr}`;
    })
    .join(' + ');

  const prodSum = products
    .map((p) => (p < 0 ? `(${present(p)})` : present(p)))
    .join(' + ');

  const caption = useMemo(
    () =>
      joinCaption(
        AB
          ? `c${sub(i + 1)}${sub(j + 1)} = ${present(AB[i]?.[j] ?? 0)}`
          : 'Dimensiones incompatibles',
        compatible
          ? `${dA.rows}×${dA.cols} · ${dB.rows}×${dB.cols} → ${dA.rows}×${dB.cols}`
          : undefined,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [AB, i, j, compatible, dA.rows, dA.cols, dB.rows, dB.cols],
  );

  return (
    <VizPanel caption={caption}>
      <div className="space-y-4">
        {/* Guide */}
        <div className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--accent-soft)_30%,transparent)] px-3 py-2 text-sm">
          <p className="font-medium text-[var(--fg)]">
            Cada entrada c{si}{sj} del producto resulta de combinar la fila <em>i</em> de A con
            la columna <em>j</em> de B.
          </p>
          <p className="mt-1 text-[var(--fg-muted)]">
            Haz clic en cualquier celda de AB para ver qué fila de A y qué columna de B la
            producen. Los colores destacan la fila y la columna que intervienen.
          </p>
        </div>

        {/* Compatibility note with inner dims highlighted */}
        <div className="flex flex-wrap items-center gap-1 font-mono text-sm">
          <span className="text-[var(--fg-muted)]">Compatibilidad:</span>
          <span>
            ({dA.rows}×
            <span className="font-bold text-[var(--accent-strong)]">{dA.cols}</span>)(
            <span className="font-bold text-[var(--accent-strong)]">{dB.rows}</span>
            ×{dB.cols})
          </span>
          <span className="text-[var(--fg-muted)]">→</span>
          {compatible ? (
            <span className="font-semibold text-[var(--fg)]">
              {dA.rows}×{dB.cols}
            </span>
          ) : (
            <span className="text-orange-500">Incompatible</span>
          )}
        </div>

        {/* Main equation: A × B = AB */}
        <div className="flex flex-wrap items-center gap-3">
          <MatrixBrackets label="A" dimLabel={dimSuperscript(dA.rows, dA.cols)}>
            <MatrixGrid
              matrix={A}
              onChange={setA}
              editable
              highlightRow={AB ? i : null}
              name="A"
            />
          </MatrixBrackets>

          <span className="self-center text-xl font-mono text-[var(--fg-muted)]">×</span>

          <MatrixBrackets label="B" dimLabel={dimSuperscript(dB.rows, dB.cols)}>
            <MatrixGrid
              matrix={B}
              onChange={setB}
              editable
              highlightCol={AB ? j : null}
              name="B"
            />
          </MatrixBrackets>

          <span className="self-center text-xl font-mono text-[var(--fg-muted)]">=</span>

          {AB && dAB ? (
            <MatrixBrackets label="AB" dimLabel={dimSuperscript(dAB.rows, dAB.cols)}>
              <MatrixGrid
                matrix={AB}
                selected={selected}
                onSelect={(pos) => pos && setSelected(pos)}
                readOnlyStyle
                name="AB"
              />
            </MatrixBrackets>
          ) : (
            <span className="rounded border border-orange-400/40 bg-orange-400/10 px-3 py-2 text-sm text-orange-500">
              No definido
            </span>
          )}
        </div>

        {/* Step-by-step explanation for selected cell */}
        {AB && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-3 font-mono text-sm leading-relaxed">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              Construyendo c{si}{sj}
            </p>
            <p>
              <span className="text-[var(--fg-muted)]">fila {i + 1} de A: </span>
              {'['}
              {rowA.map((v, k) => (
                <span key={k}>
                  {k > 0 && <span className="text-[var(--fg-muted)]">, </span>}
                  {present(v)}
                </span>
              ))}
              {']'}
            </p>
            <p>
              <span className="text-[var(--fg-muted)]">col {j + 1} de B: </span>
              {'['}
              {colB.map((v, k) => (
                <span key={k}>
                  {k > 0 && <span className="text-[var(--fg-muted)]">; </span>}
                  {present(v)}
                </span>
              ))}
              {']'}
            </p>
            <p className="mt-2">
              <span className="text-[var(--fg-muted)]">c{si}{sj} = </span>
              {prodSymbolic}
            </p>
            <p>
              <span className="opacity-0 select-none">{'     '}</span>
              {'= '}
              {prodNumerical}
            </p>
            <p>
              <span className="opacity-0 select-none">{'     '}</span>
              {'= '}
              {prodSum}
            </p>
            <p className="mt-0.5 font-bold text-[var(--fg)]">
              <span className="opacity-0 select-none">{'     '}</span>
              {'= '}
              {present(cellVal)}
            </p>
            <p className="mt-3 text-[var(--fg-muted)]">
              c{si}{sj} = Σₖ a{si}ₖ·bₖ{sj} ={' '}
              {Array.from({ length: innerLen }, (_, k) =>
                `a${si}${sub(k + 1)}·b${sub(k + 1)}${sj}`,
              ).join(' + ')}{' '}
              ={' '}
              <span className="font-semibold text-[var(--fg)]">{present(cellVal)}</span>
            </p>
          </div>
        )}

        {/* Controls */}
        <ControlsStack>
          <ToggleRow
            label="Comparar AB / BA"
            checked={showCompare}
            onChange={setShowCompare}
          />
        </ControlsStack>

        {/* BA comparison panel */}
        {showCompare && (
          <div className="rounded-lg border border-[var(--border)] px-3 py-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              BA — producto en orden inverso
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <MatrixBrackets label="B" dimLabel={dimSuperscript(dB.rows, dB.cols)}>
                <MatrixGrid matrix={B} readOnlyStyle name="B" cellSize="sm" />
              </MatrixBrackets>
              <span className="self-center text-xl font-mono text-[var(--fg-muted)]">×</span>
              <MatrixBrackets label="A" dimLabel={dimSuperscript(dA.rows, dA.cols)}>
                <MatrixGrid matrix={A} readOnlyStyle name="A" cellSize="sm" />
              </MatrixBrackets>
              <span className="self-center text-xl font-mono text-[var(--fg-muted)]">=</span>
              {BA && dBA ? (
                <MatrixBrackets label="BA" dimLabel={dimSuperscript(dBA.rows, dBA.cols)}>
                  <MatrixGrid matrix={BA} readOnlyStyle name="BA" cellSize="sm" />
                </MatrixBrackets>
              ) : (
                <span className="text-sm text-orange-500">No definido</span>
              )}
            </div>
            {AB && BA && dAB && dBA && (
              <div className="mt-3 space-y-1 text-sm">
                <p className="text-[var(--fg-muted)]">
                  AB es {dAB.rows}×{dAB.cols} · BA es {dBA.rows}×{dBA.cols}
                </p>
                <p className="text-[var(--fg)]">
                  En general <strong>AB ≠ BA</strong> — el producto matricial no es conmutativo.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </VizPanel>
  );
}
