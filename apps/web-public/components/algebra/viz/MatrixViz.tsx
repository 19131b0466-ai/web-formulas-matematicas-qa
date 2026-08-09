'use client';

import { useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from './controls';
import { det2, type Mat2 } from './math2d';

type Props = { formulaId: string; idea?: string };

function MatrixGrid({
  m,
  setM,
  highlightCol,
}: {
  m: Mat2;
  setM?: (m: Mat2) => void;
  highlightCol?: number;
}) {
  return (
    <div className="inline-grid grid-cols-2 gap-2 rounded-lg border border-[var(--border)] p-2">
      {m.map((row, i) =>
        row.map((v, j) => (
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
              highlightCol === j ? 'border-[var(--accent-strong)]' : 'border-[var(--border)]'
            }`}
          />
        )),
      )}
    </div>
  );
}

export function MatrixViz({ formulaId, idea }: Props) {
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
  const [step, setStep] = useState(0);
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

  const swapRows = () => setA([A[1], A[0]]);
  const scaleRow = () =>
    setA([
      [A[0][0] * c, A[0][1] * c],
      A[1],
    ]);
  const addRows = () =>
    setA([
      A[0],
      [A[1][0] + A[0][0], A[1][1] + A[0][1]],
    ]);

  const showAug = /SIS-|DET-006|LSQ-/.test(formulaId);
  const showOps = /SIS-003|SIS-004|DEC-001/.test(formulaId);
  const showProd = /MAT-004|DET-003/.test(formulaId);
  const showScale = /MAT-003|NOR-/.test(formulaId);
  const showT = /MAT-006|MAT-007/.test(formulaId);
  const showCode = /COD-002|COD-003/.test(formulaId);

  return (
    <VizPanel
      caption={`${idea ?? ''} · det(A)=${fmt(det)}${Math.abs(det) < 1e-9 ? ' (singular)' : ''}`}
    >
      <div className="flex flex-wrap items-start gap-4">
        <div>
          <p className="mb-1 text-xs text-[var(--fg-muted)]">A</p>
          <MatrixGrid m={A} setM={setA} />
        </div>
        {showProd || /MAT-002/.test(formulaId) ? (
          <div>
            <p className="mb-1 text-xs text-[var(--fg-muted)]">B</p>
            <MatrixGrid m={B} setM={setB} />
          </div>
        ) : null}
        {showAug ? (
          <div>
            <p className="mb-1 text-xs text-[var(--fg-muted)]">b (aumentada)</p>
            <div className="flex flex-col gap-2">
              {[0, 1].map((i) => (
                <input
                  key={i}
                  type="number"
                  className="w-16 rounded border border-[var(--border)] bg-[var(--bg)] px-1 py-1 text-center font-mono text-sm"
                  value={aug[i]}
                  onChange={(e) => {
                    const next: [number, number] = [...aug] as [number, number];
                    next[i] = Number(e.target.value);
                    setAug(next);
                  }}
                />
              ))}
            </div>
          </div>
        ) : null}
        <div>
          <p className="mb-1 text-xs text-[var(--fg-muted)]">
            {showT ? 'Aᵀ' : showScale ? 'cA' : showProd ? 'AB' : /MAT-002/.test(formulaId) ? 'A+B' : 'resultado'}
          </p>
          <MatrixGrid
            m={showT ? T : showScale ? scaled : showProd ? prod : /MAT-002/.test(formulaId) ? sum : A}
          />
        </div>
      </div>
      {showCode ? (
        <div className="mt-3 text-sm">
          <p className="font-mono">
            c = [{word.join(', ')}] · click bit para error
          </p>
          <ButtonRow>
            {word.map((bit, i) => (
              <VizButton key={i} active={errorBit === i} onClick={() => setErrorBit(errorBit === i ? -1 : i)}>
                c{i}={bit}
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
            <VizButton onClick={() => setStep((s) => s + 1)}>Paso LU {step}</VizButton>
          </ButtonRow>
        ) : null}
      </ControlsStack>
    </VizPanel>
  );
}
