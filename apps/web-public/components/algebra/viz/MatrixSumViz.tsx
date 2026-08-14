'use client';

import { useMemo, useState } from 'react';
import { ControlsStack, ToggleRow, VizPanel, joinCaption } from './controls';
import {
  type CellPos,
  type Matrix,
  MatrixBrackets,
  MatrixGrid,
  addMatrices,
  dims,
  dimSuperscript,
  present,
  sub,
} from './matrixGrid';

const INIT_A: Matrix = [
  [2, 1],
  [1, 3],
];
const INIT_B: Matrix = [
  [1, -1],
  [0, 2],
];

/** Format addition term: a + b, or a + (b) when b is negative */
function addTerm(a: number, b: number): string {
  const aStr = present(a);
  const bStr = b < 0 ? `(${present(b)})` : present(b);
  return `${aStr} + ${bStr}`;
}

export function MatrixSumViz() {
  const [A, setA] = useState<Matrix>(INIT_A);
  const [B, setB] = useState<Matrix>(INIT_B);
  const [selected, setSelected] = useState<CellPos>({ i: 0, j: 0 });
  const [showSteps, setShowSteps] = useState(false);

  const S = useMemo(() => addMatrices(A, B), [A, B]);

  const dA = dims(A);
  const dB = dims(B);
  const compatible = dA.rows === dB.rows && dA.cols === dB.cols;
  const dS = S ? dims(S) : null;

  const { i, j } = selected;
  const aVal = A[i]?.[j] ?? 0;
  const bVal = B[i]?.[j] ?? 0;
  const sVal = S?.[i]?.[j] ?? 0;
  const si = sub(i + 1);
  const sj = sub(j + 1);

  const caption = useMemo(
    () =>
      joinCaption(
        S
          ? `(A+B)${si}${sj} = ${addTerm(aVal, bVal)} = ${present(sVal)}`
          : 'Dimensiones distintas',
        compatible
          ? `${dA.rows}×${dA.cols} + ${dB.rows}×${dB.cols} → ${dA.rows}×${dA.cols}`
          : undefined,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [S, si, sj, aVal, bVal, sVal, compatible, dA.rows, dA.cols, dB.rows, dB.cols],
  );

  return (
    <VizPanel caption={caption}>
      <div className="space-y-4">
        {/* Guide */}
        <div className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--accent-soft)_30%,transparent)] px-3 py-2 text-sm">
          <p className="font-medium text-[var(--fg)]">
            La suma de matrices añade las entradas en la <em>misma posición</em>: (A+B)ᵢⱼ = aᵢⱼ + bᵢⱼ.
          </p>
          <p className="mt-1 text-[var(--fg-muted)]">
            Haz clic en cualquier celda para ver la suma de las entradas correspondientes en A y B.
            La misma posición (i, j) queda resaltada en las tres matrices a la vez.
          </p>
        </div>

        {/* Main equation: A + B = A+B */}
        <div className="flex flex-wrap items-center gap-3">
          <MatrixBrackets label="A" dimLabel={dimSuperscript(dA.rows, dA.cols)}>
            <MatrixGrid
              matrix={A}
              onChange={setA}
              editable
              selected={selected}
              onSelect={(pos) => pos && setSelected(pos)}
              name="A"
            />
          </MatrixBrackets>

          <span className="self-center text-xl font-mono text-[var(--fg-muted)]">+</span>

          <MatrixBrackets label="B" dimLabel={dimSuperscript(dB.rows, dB.cols)}>
            <MatrixGrid
              matrix={B}
              onChange={setB}
              editable
              selected={selected}
              onSelect={(pos) => pos && setSelected(pos)}
              name="B"
            />
          </MatrixBrackets>

          <span className="self-center text-xl font-mono text-[var(--fg-muted)]">=</span>

          {S && dS ? (
            <MatrixBrackets label="A+B" dimLabel={dimSuperscript(dS.rows, dS.cols)}>
              <MatrixGrid
                matrix={S}
                selected={selected}
                onSelect={(pos) => pos && setSelected(pos)}
                readOnlyStyle
                name="A+B"
              />
            </MatrixBrackets>
          ) : (
            <span className="rounded border border-orange-400/40 bg-orange-400/10 px-3 py-2 text-sm text-orange-500">
              Dims distintas
            </span>
          )}
        </div>

        {/* Explanation for selected cell */}
        {S && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-3 font-mono text-sm leading-relaxed">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              Entrada ({i + 1},{j + 1})
            </p>
            <p>
              <span className="text-[var(--fg-muted)]">(A+B){si}{sj} = </span>
              a{si}{sj} + b{si}{sj}
            </p>
            <p>
              <span className="opacity-0 select-none">{'          '}</span>
              {'= '}
              {addTerm(aVal, bVal)}
            </p>
            <p className="mt-0.5 font-bold text-[var(--fg)]">
              <span className="opacity-0 select-none">{'          '}</span>
              {'= '}
              {present(sVal)}
            </p>
          </div>
        )}

        {/* Step-by-step display */}
        {showSteps && S && (
          <div className="rounded-lg border border-[var(--border)] px-3 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              Elemento a elemento
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <MatrixBrackets>
                <div
                  className="inline-grid gap-1"
                  style={{ gridTemplateColumns: `repeat(${dA.cols}, auto)` }}
                >
                  {A.map((row, ri) =>
                    row.map((av, ci) => {
                      const bv = B[ri]?.[ci] ?? 0;
                      const isSel = ri === i && ci === j;
                      return (
                        <div
                          key={`${ri}-${ci}`}
                          className={`flex h-10 w-20 items-center justify-center rounded border text-center font-mono text-xs ${
                            isSel
                              ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)]'
                              : 'border-[var(--border)] bg-[var(--bg)]/60'
                          }`}
                        >
                          {addTerm(av, bv)}
                        </div>
                      );
                    }),
                  )}
                </div>
              </MatrixBrackets>
              <span className="self-center text-xl font-mono text-[var(--fg-muted)]">=</span>
              <MatrixBrackets>
                <div
                  className="inline-grid gap-1"
                  style={{ gridTemplateColumns: `repeat(${dA.cols}, auto)` }}
                >
                  {S.map((row, ri) =>
                    row.map((sv, ci) => {
                      const isSel = ri === i && ci === j;
                      return (
                        <div
                          key={`${ri}-${ci}`}
                          className={`flex h-10 w-20 items-center justify-center rounded border text-center font-mono text-sm font-semibold ${
                            isSel
                              ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                              : 'border-[var(--border)] bg-[var(--bg)]/60'
                          }`}
                        >
                          {present(sv)}
                        </div>
                      );
                    }),
                  )}
                </div>
              </MatrixBrackets>
            </div>
          </div>
        )}

        {/* Dim note */}
        <p className="text-xs text-[var(--fg-muted)]">
          {compatible
            ? `Dimensiones: ${dA.rows}×${dA.cols} + ${dB.rows}×${dB.cols} → ${dA.rows}×${dA.cols} (coinciden).`
            : `Suma no definida: ${dA.rows}×${dA.cols} ≠ ${dB.rows}×${dB.cols}.`}
        </p>

        {/* Controls */}
        <ControlsStack>
          <ToggleRow
            label="Ver elemento a elemento"
            checked={showSteps}
            onChange={setShowSteps}
          />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
