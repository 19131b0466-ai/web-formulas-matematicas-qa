'use client';

import { useMemo, useState } from 'react';
import { useVizLabels } from '@/lib/viz-labels';
import type { MatrixMode } from '@/lib/viz-modes';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt, joinCaption } from './controls';
import { det2, type Mat2 } from './math2d';

type Props = { formulaId: string; idea?: string; mode?: string };

function MatrixGrid({
  m,
  setM,
  highlightCell,
  highlightRow,
}: {
  m: Mat2;
  setM?: (m: Mat2) => void;
  highlightCell?: [number, number] | null;
  highlightRow?: number | null;
}) {
  return (
    <div className="inline-grid grid-cols-2 gap-2 rounded-lg border border-[var(--border)] p-2">
      {m.map((row, i) =>
        row.map((v, j) => {
          const on =
            (highlightCell && highlightCell[0] === i && highlightCell[1] === j) ||
            (highlightRow != null && highlightRow === i);
          return (
            <input
              key={`${i}-${j}`}
              type="number"
              step={0.1}
              value={v}
              disabled={!setM}
              onChange={(e) => {
                if (!setM) return;
                const next: Mat2 = [
                  [...m[0]] as [number, number],
                  [...m[1]] as [number, number],
                ];
                next[i]![j] = Number(e.target.value);
                setM(next);
              }}
              className={`w-16 rounded border bg-[var(--bg)] px-1 py-1 text-center font-mono text-sm ${
                on ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)]' : 'border-[var(--border)]'
              }`}
            />
          );
        }),
      )}
    </div>
  );
}

function rank2(m: Mat2): number {
  const d = Math.abs(det2(m));
  if (d > 1e-9) return 2;
  const nonzero = m.flat().some((x) => Math.abs(x) > 1e-9);
  return nonzero ? 1 : 0;
}

export function MatrixViz({ formulaId: _id, mode: modeProp }: Props) {
  const v = useVizLabels();
  const mode = (modeProp ?? 'basic') as MatrixMode;
  const [A, setA] = useState<Mat2>([
    [2, 1],
    [1, 3],
  ]);
  const [B, setB] = useState<Mat2>([
    [1, -1],
    [0, 2],
  ]);
  const [c, setC] = useState(2);
  const [aug, setAug] = useState<[number, number]>([5, 4]);
  const [selRow, setSelRow] = useState(0);
  const [cell, setCell] = useState<[number, number]>([0, 0]);
  const [errorBit, setErrorBit] = useState(-1);

  const det = det2(A);
  const sum: Mat2 = [
    [A[0][0] + B[0][0], A[0][1] + B[0][1]],
    [A[1][0] + B[1][0], A[1][1] + B[1][1]],
  ];
  const scaled: Mat2 = [
    [c * A[0][0], c * A[0][1]],
    [c * A[1][0], c * A[1][1]],
  ];
  const prod: Mat2 = [
    [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
    [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
  ];
  const T: Mat2 = [
    [A[0][0], A[1][0]],
    [A[0][1], A[1][1]],
  ];

  const word = useMemo(() => {
    const w = [1, 0, 1, 1];
    if (errorBit >= 0 && errorBit < w.length) w[errorBit] = 1 - w[errorBit]!;
    return w;
  }, [errorBit]);

  const swapRows = () => {
    setA([A[1], A[0]]);
    setAug([aug[1], aug[0]]);
  };
  const scaleRow = () => {
    setA([
      [A[0][0] * c, A[0][1] * c],
      A[1],
    ]);
    setAug([aug[0] * c, aug[1]]);
  };
  const addRows = () => {
    setA([
      A[0],
      [A[1][0] + A[0][0], A[1][1] + A[0][1]],
    ]);
    setAug([aug[0], aug[1] + aug[0]]);
  };

  const showAug = mode === 'augmented_map' || mode === 'row_ops' || mode === 'rank_compare';
  const showOps = mode === 'row_ops';
  const showProd = mode === 'product';
  const showScale = mode === 'scale';
  const showT = mode === 'transpose';
  const showCode = mode === 'code';
  const showSum = mode === 'sum';

  const result: Mat2 = showT ? T : showScale ? scaled : showProd ? prod : showSum ? sum : A;
  const rA = rank2(A);
  const i = cell[0];
  const j = cell[1];
  const cellDetail =
    mode === 'product'
      ? `(AB)_{${i + 1}${j + 1}} = a_${i + 1}1·b_1${j + 1} + a_${i + 1}2·b_2${j + 1} = ${fmt(
          A[i]![0]! * B[0]![j]! + A[i]![1]! * B[1]![j]!,
        )}`
      : null;

  const eq =
    mode === 'augmented_map' || mode === 'row_ops'
      ? `${fmt(A[selRow]![0]!)} x + ${fmt(A[selRow]![1]!)} y = ${fmt(aug[selRow]!)}`
      : null;

  const caption =
    mode === 'rank_compare'
      ? joinCaption(`${v.rankLabel}(A)=${rA}`, Math.abs(det) < 1e-9 && 'singular')
      : mode === 'basic' || mode === 'row_ops' || mode === 'augmented_map'
        ? joinCaption(`det(A)=${fmt(det)}${Math.abs(det) < 1e-9 ? ' (singular)' : ''}`)
        : undefined;

  const showResultPanel = showT || showScale || showProd || showSum || mode === 'basic' || mode === 'code';

  return (
    <VizPanel caption={caption}>
      <div className="flex flex-wrap items-start gap-4">
        {showAug ? (
          <div>
            <p className="mb-1 text-xs text-[var(--fg-muted)]">[A | b]</p>
            <div className="inline-flex items-stretch gap-0 rounded-lg border border-[var(--border)] p-2">
              <MatrixGrid
                m={A}
                setM={setA}
                highlightRow={mode === 'augmented_map' || mode === 'row_ops' ? selRow : null}
              />
              <div className="mx-2 w-px self-stretch bg-[var(--accent-strong)]" aria-hidden />
              <div className="flex flex-col justify-center gap-2">
                {[0, 1].map((ri) => (
                  <input
                    key={ri}
                    type="number"
                    className={`w-16 rounded border bg-[var(--bg)] px-1 py-1 text-center font-mono text-sm ${
                      selRow === ri ? 'border-[var(--accent-strong)]' : 'border-[var(--border)]'
                    }`}
                    value={aug[ri]}
                    onChange={(e) => {
                      const next: [number, number] = [...aug] as [number, number];
                      next[ri] = Number(e.target.value);
                      setAug(next);
                    }}
                    onFocus={() => setSelRow(ri)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-1 text-xs text-[var(--fg-muted)]">A</p>
            <MatrixGrid
              m={A}
              setM={setA}
              highlightRow={mode === 'product' ? i : null}
            />
          </div>
        )}
        {showProd || showSum ? (
          <div>
            <p className="mb-1 text-xs text-[var(--fg-muted)]">B</p>
            <MatrixGrid m={B} setM={setB} />
          </div>
        ) : null}
        {showResultPanel ? (
          <div>
            <p className="mb-1 text-xs text-[var(--fg-muted)]">
              {showT ? 'Aᵀ' : showScale ? 'cA' : showProd ? 'AB' : showSum ? 'A+B' : v.result}
            </p>
            <MatrixGrid m={result} highlightCell={mode === 'product' ? cell : null} />
          </div>
        ) : null}
      </div>

      {eq ? (
        <p className="mt-3 font-mono text-sm">
          {v.equationOfRow} R{selRow + 1}: {eq}
        </p>
      ) : null}

      {mode === 'augmented_map' ? (
        <ButtonRow>
          <VizButton active={selRow === 0} onClick={() => setSelRow(0)}>
            R₁
          </VizButton>
          <VizButton active={selRow === 1} onClick={() => setSelRow(1)}>
            R₂
          </VizButton>
        </ButtonRow>
      ) : null}

      {mode === 'product' ? (
        <div className="mt-3 space-y-2 text-sm">
          <p className="font-mono text-[var(--fg-muted)]">{v.cellProduct}</p>
          <ButtonRow>
            {([0, 1] as const).flatMap((ri) =>
              ([0, 1] as const).map((cj) => (
                <VizButton key={`${ri}${cj}`} active={cell[0] === ri && cell[1] === cj} onClick={() => setCell([ri, cj])}>
                  ({ri + 1},{cj + 1})
                </VizButton>
              )),
            )}
          </ButtonRow>
          <p className="font-mono">{cellDetail}</p>
        </div>
      ) : null}

      {mode === 'rank_compare' ? (
        <p className="mt-3 font-mono text-sm">
          {v.rankLabel}(A)={rA}
          {rA < 2
            ? ` · ${
                Math.abs(A[0][0]! * aug[1]! - A[1][0]! * aug[0]!) < 1e-6 &&
                Math.abs(A[0][1]! * aug[1]! - A[1][1]! * aug[0]!) < 1e-6
                  ? '∞'
                  : '∅'
              }`
            : ` · det≠0 → 1`}
        </p>
      ) : null}

      {showCode ? (
        <div className="mt-3 text-sm">
          <p className="font-mono">
            c = [{word.join(', ')}] · {v.clickBitError}
          </p>
          <ButtonRow>
            {word.map((bit, bi) => (
              <VizButton key={bi} active={errorBit === bi} onClick={() => setErrorBit(errorBit === bi ? -1 : bi)}>
                c{bi}={bit}
              </VizButton>
            ))}
          </ButtonRow>
        </div>
      ) : null}

      <ControlsStack>
        {showScale || showOps ? <SliderRow label="c" value={c} min={-3} max={3} step={0.1} onChange={setC} /> : null}
        {showOps ? (
          <ButtonRow>
            <VizButton onClick={swapRows}>R₁ ↔ R₂</VizButton>
            <VizButton onClick={scaleRow}>c·R₁</VizButton>
            <VizButton onClick={addRows}>R₂ ← R₂+R₁</VizButton>
          </ButtonRow>
        ) : null}
      </ControlsStack>
    </VizPanel>
  );
}
