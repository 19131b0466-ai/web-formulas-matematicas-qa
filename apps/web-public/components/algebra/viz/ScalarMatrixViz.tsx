'use client';

import { useId, useMemo, useState } from 'react';
import { ControlsStack, ToggleRow, VizPanel, joinCaption } from './controls';
import {
  type CellPos,
  type Matrix,
  MatrixBrackets,
  MatrixGrid,
  dims,
  dimSuperscript,
  present,
  scalarMultiply,
  sub,
} from './matrixGrid';

const INIT_A: Matrix = [
  [2, 1],
  [1, 3],
];

function getEffectLabel(c: number): string {
  const eps = 1e-9;
  const absC = Math.abs(c);
  if (absC < eps) return 'Matriz cero';
  if (Math.abs(c - 1) < eps) return 'Neutro — A sin cambios';
  if (Math.abs(c + 1) < eps) return 'Invierte signos';
  if (absC > 1 && c > 0) return 'Amplifica';
  if (absC > 1 && c < 0) return 'Amplifica e invierte signos';
  if (absC < 1 && c > 0) return 'Reduce';
  return 'Reduce e invierte signos';
}

function getEffectColor(c: number): string {
  const eps = 1e-9;
  const absC = Math.abs(c);
  if (absC < eps) return 'var(--fg-muted)';
  if (Math.abs(c - 1) < eps) return 'var(--accent-strong)';
  if (Math.abs(c + 1) < eps) return 'var(--fg)';
  if (c > 0) return 'var(--accent-strong)';
  return 'color-mix(in oklab, var(--accent-strong) 60%, red)';
}

export function ScalarMatrixViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const listId = `${uid}-c-marks`;

  const [A, setA] = useState<Matrix>(INIT_A);
  const [c, setC] = useState(2);
  const [selected, setSelected] = useState<CellPos>({ i: 0, j: 0 });
  const [showSteps, setShowSteps] = useState(false);

  const cA = useMemo(() => scalarMultiply(A, c), [A, c]);
  const dA = dims(A);

  const { i, j } = selected;
  const selA = A[i]?.[j] ?? 0;
  const selCA = cA[i]?.[j] ?? 0;
  const si = sub(i + 1);
  const sj = sub(j + 1);

  const effectLabel = getEffectLabel(c);
  const effectColor = getEffectColor(c);

  const caption = useMemo(
    () =>
      joinCaption(
        `(cA)${si}${sj} = ${present(c)}·${present(selA) === '-' ? '—' : present(selA)} = ${present(selCA)}`,
        `c = ${present(c)}`,
        `${dA.rows}×${dA.cols} → ${dA.rows}×${dA.cols}`,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [si, sj, c, selA, selCA, dA.rows, dA.cols],
  );

  return (
    <VizPanel caption={caption}>
      <div className="space-y-4">
        {/* Guide */}
        <div className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--accent-soft)_30%,transparent)] px-3 py-2 text-sm">
          <p className="font-medium text-[var(--fg)]">
            Multiplicar una matriz por un escalar aplica <em>el mismo factor c a cada entrada</em>.
          </p>
          <p className="mt-1 text-[var(--fg-muted)]">
            Mueve el deslizador y observa cómo todas las entradas de A se escalan por el mismo
            valor c. Haz clic en cualquier celda de cA para ver el detalle de esa entrada.
          </p>
        </div>

        {/* Main equation: c × A = cA */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Large c display */}
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs font-semibold text-[var(--fg-muted)]">c</p>
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl border-2 text-2xl font-bold tabular-nums font-mono"
              style={{
                borderColor: effectColor,
                color: effectColor,
                backgroundColor: `color-mix(in oklab, ${effectColor} 10%, transparent)`,
              }}
            >
              {present(c)}
            </div>
          </div>

          <span className="self-center text-xl font-mono text-[var(--fg-muted)]">×</span>

          <MatrixBrackets label="A" dimLabel={dimSuperscript(dA.rows, dA.cols)}>
            <MatrixGrid
              matrix={A}
              onChange={setA}
              editable
              selected={selected}
              onSelect={(pos) => pos && setSelected(pos)}
              highlightCells={[[i, j]]}
              name="A"
            />
          </MatrixBrackets>

          <span className="self-center text-xl font-mono text-[var(--fg-muted)]">=</span>

          <MatrixBrackets label="cA" dimLabel={dimSuperscript(dA.rows, dA.cols)}>
            <MatrixGrid
              matrix={cA}
              selected={selected}
              onSelect={(pos) => pos && setSelected(pos)}
              readOnlyStyle
              name="cA"
            />
          </MatrixBrackets>
        </div>

        {/* Selected cell detail */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-3 font-mono text-sm leading-relaxed">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
            Entrada seleccionada ({i + 1},{j + 1})
          </p>
          <p>
            <span className="text-[var(--fg-muted)]">(cA){si}{sj} = </span>
            c · a{si}{sj}
          </p>
          <p>
            <span className="opacity-0 select-none">{'          '}</span>
            {'= '}
            {present(c)} · {selA < 0 ? `(${present(selA)})` : present(selA)}
          </p>
          <p className="mt-0.5 font-bold text-[var(--fg)]">
            <span className="opacity-0 select-none">{'          '}</span>
            {'= '}
            {present(selCA)}
          </p>
        </div>

        {/* Effect badge */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-[var(--fg-muted)]">Efecto:</span>
          <span
            className="rounded-full border px-3 py-1 text-sm font-semibold"
            style={{
              color: effectColor,
              borderColor: `color-mix(in oklab, ${effectColor} 45%, transparent)`,
              backgroundColor: `color-mix(in oklab, ${effectColor} 10%, transparent)`,
            }}
          >
            {effectLabel}
          </span>
        </div>

        {/* Step-by-step display */}
        {showSteps && (
          <div className="rounded-lg border border-[var(--border)] px-3 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              Elemento a elemento: {present(c)}·A
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <MatrixBrackets>
                <div
                  className="inline-grid gap-1"
                  style={{ gridTemplateColumns: `repeat(${dA.cols}, auto)` }}
                >
                  {A.map((row, ri) =>
                    row.map((v, ci) => {
                      const vStr = v < 0 ? `(${present(v)})` : present(v);
                      const isSel = ri === i && ci === j;
                      return (
                        <div
                          key={`${ri}-${ci}`}
                          className={`h-10 w-20 rounded border text-center font-mono text-xs flex items-center justify-center ${
                            isSel
                              ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)]'
                              : 'border-[var(--border)] bg-[var(--bg)]/60'
                          }`}
                        >
                          {present(c)}·{vStr}
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
                  {cA.map((row, ri) =>
                    row.map((v, ci) => {
                      const isSel = ri === i && ci === j;
                      return (
                        <div
                          key={`${ri}-${ci}`}
                          className={`h-10 w-20 rounded border text-center font-mono text-sm flex items-center justify-center font-semibold ${
                            isSel
                              ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                              : 'border-[var(--border)] bg-[var(--bg)]/60'
                          }`}
                        >
                          {present(v)}
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
          Dimensiones: {dA.rows}×{dA.cols} + escalar → {dA.rows}×{dA.cols} (sin cambio).
        </p>

        {/* Slider + controls */}
        <ControlsStack>
          {/* Custom slider with marks and synced number input */}
          <div className="flex items-center gap-3 text-sm">
            <span className="w-6 shrink-0 font-mono font-semibold text-[var(--fg-muted)]">c</span>
            <div className="flex flex-1 flex-col gap-0.5">
              <input
                type="range"
                min={-3}
                max={3}
                step={0.25}
                value={c}
                list={listId}
                aria-label="Escalar c"
                onChange={(e) => setC(Number(e.target.value))}
                className="h-2 w-full accent-[var(--accent-strong)]"
              />
              <datalist id={listId}>
                <option value="-1" />
                <option value="0" />
                <option value="1" />
              </datalist>
              <div className="flex justify-between px-0.5 text-[10px] text-[var(--fg-muted)]">
                <span>-3</span>
                <span>-1</span>
                <span>0</span>
                <span>1</span>
                <span>3</span>
              </div>
            </div>
            <input
              type="number"
              min={-3}
              max={3}
              step={0.25}
              value={c}
              aria-label="Valor de c"
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v >= -3 && v <= 3) setC(v);
              }}
              className="w-16 shrink-0 rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-center font-mono text-sm"
            />
          </div>
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
