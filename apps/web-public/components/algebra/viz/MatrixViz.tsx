'use client';

import { useMemo, useState } from 'react';
import { useVizLabels } from '@/lib/viz-labels';
import type { MatrixMode } from '@/lib/viz-modes';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt, joinCaption } from './controls';
import { det2, type Mat2 } from './math2d';
import { AugmentedMatrixViz } from './AugmentedMatrixViz';
import { MatrixFormViz } from './MatrixFormViz';
import { RoucheCapelliViz } from './RoucheCapelliViz';
import { RowOpsViz } from './RowOpsViz';
import { SylvesterResultantViz } from './SylvesterResultantViz';

type Props = { formulaId: string; idea?: string; mode?: string };

/** Toy binary [3,2] generator / parity-check matrices over F₂. */
const CODE_G: [[number, number, number], [number, number, number]] = [
  [1, 0, 1],
  [0, 1, 1],
];
const CODE_H: [[number, number, number], [number, number, number]] = [
  [1, 1, 0],
  [1, 0, 1],
];

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

/** Compute rank of augmented [A|b] for 2×2 system. */
function rankAug(m: Mat2, aug: [number, number]): number {
  // [A|b] is 2×3; rank via row reduction
  const a00 = m[0][0], a01 = m[0][1], b0 = aug[0];
  const a10 = m[1][0], a11 = m[1][1], b1 = aug[1];
  // Try to find rank by checking all 2×2 minors of [A|b]
  const minors = [
    a00 * a11 - a01 * a10, // A itself
    a00 * b1 - b0 * a10,   // cols 0,2
    a01 * b1 - b0 * a11,   // cols 1,2
  ];
  if (minors.some((x) => Math.abs(x) > 1e-9)) return 2;
  if ([a00, a01, b0, a10, a11, b1].some((x) => Math.abs(x) > 1e-9)) return 1;
  return 0;
}

/** Simple 2×2 LU decomposition (no pivoting). Returns [L, U] or null if pivot is 0. */
function lu2(m: Mat2): [Mat2, Mat2] | null {
  const a = m[0][0];
  if (Math.abs(a) < 1e-9) return null;
  const l21 = m[1][0] / a;
  const u00 = a;
  const u01 = m[0][1];
  const u11 = m[1][1] - l21 * m[0][1];
  const L: Mat2 = [[1, 0], [l21, 1]];
  const U: Mat2 = [[u00, u01], [0, u11]];
  return [L, U];
}

export function MatrixViz({ formulaId, mode: modeProp }: Props) {
  if (formulaId.includes('POL-011')) {
    return <SylvesterResultantViz />;
  }
  if (formulaId.includes('SIS-002')) {
    return <MatrixFormViz />;
  }
  if (formulaId.includes('SIS-003')) {
    return <AugmentedMatrixViz />;
  }
  if (formulaId.includes('SIS-004')) {
    return <RowOpsViz />;
  }
  if (formulaId.includes('SIS-005')) {
    return <RoucheCapelliViz />;
  }
  return <MatrixVizInner formulaId={formulaId} mode={modeProp} />;
}

function MatrixVizInner({ formulaId: _id, mode: modeProp }: Props) {
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
  const [msg, setMsg] = useState<[number, number]>([1, 0]);
  const [recv, setRecv] = useState<[number, number, number]>([1, 0, 1]);

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
  const I: Mat2 = [[1, 0], [0, 1]];
  // AI = A
  const identResult: Mat2 = [
    [A[0][0] * 1 + A[0][1] * 0, A[0][0] * 0 + A[0][1] * 1],
    [A[1][0] * 1 + A[1][1] * 0, A[1][0] * 0 + A[1][1] * 1],
  ];

  // Toy binary [3,2] code: G 2×3, H 2×3 over F₂ (module constants)
  const encodeCode = useMemo(() => {
    const c0 = (msg[0]! * CODE_G[0]![0]! + msg[1]! * CODE_G[1]![0]!) % 2;
    const c1 = (msg[0]! * CODE_G[0]![1]! + msg[1]! * CODE_G[1]![1]!) % 2;
    const c2 = (msg[0]! * CODE_G[0]![2]! + msg[1]! * CODE_G[1]![2]!) % 2;
    return [c0, c1, c2] as [number, number, number];
  }, [msg]);
  const syndrome = useMemo(() => {
    const s0 = (CODE_H[0]![0]! * recv[0]! + CODE_H[0]![1]! * recv[1]! + CODE_H[0]![2]! * recv[2]!) % 2;
    const s1 = (CODE_H[1]![0]! * recv[0]! + CODE_H[1]![1]! * recv[1]! + CODE_H[1]![2]! * recv[2]!) % 2;
    return [s0, s1] as [number, number];
  }, [recv]);
  const isEncode = _id.includes('COD-002');
  const isParity = _id.includes('COD-003') || (_id.includes('COD-') && !isEncode);

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
  const showIdentity = mode === 'identity';
  const showLU = mode === 'lu';

  const result: Mat2 = showT ? T : showScale ? scaled : showProd ? prod : showSum ? sum : showIdentity ? identResult : A;
  const rA = rank2(A);
  const rAug = rankAug(A, aug);
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

  // Transpose: is A symmetric?
  const isSymmetric = Math.abs(A[0][1] - A[1][0]) < 1e-9;

  // rank_compare Rouche-Capelli classification
  const rcClass = useMemo(() => {
    if (mode !== 'rank_compare') return null;
    if (rA === 2) return 'unique' as const;
    if (rA === rAug) return 'infinite' as const;
    return 'empty' as const;
  }, [mode, rA, rAug]);

  const luPair = useMemo(() => (showLU ? lu2(A) : null), [showLU, A]);

  const caption = useMemo(() => {
    if (mode === 'rank_compare') {
      const classStr =
        rcClass === 'unique' ? v.oneSolution : rcClass === 'infinite' ? v.infSolutions : v.noSolution;
      return joinCaption(`rg(A)=${rA}`, `rg([A|b])=${rAug}`, classStr);
    }
    if (mode === 'transpose')
      return joinCaption(`A=Aᵀ: ${isSymmetric ? v.symmetricYes : v.symmetricNo}`, `det=${fmt(det)}`);
    if (mode === 'identity') return joinCaption('AI = A', `det(A)=${fmt(det)}`);
    if (mode === 'code') {
      if (isEncode) return joinCaption(`c=[${encodeCode.join(',')}]`, 'mod 2');
      const ok = syndrome[0] === 0 && syndrome[1] === 0;
      return joinCaption(`s=[${syndrome.join(',')}]`, ok ? v.validCodeword : v.invalidCodeword);
    }
    if (mode === 'basic' || mode === 'row_ops' || mode === 'augmented_map')
      return joinCaption(`det(A)=${fmt(det)}${Math.abs(det) < 1e-9 ? ' (singular)' : ''}`);
    return undefined;
  }, [mode, rA, rAug, rcClass, isSymmetric, det, v, isEncode, encodeCode, syndrome]);

  // Only show result panel when it carries new information
  const showResultPanel = showT || showScale || showProd || showSum || showIdentity;

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
        ) : showIdentity ? (
          <>
            <div>
              <p className="mb-1 text-xs text-[var(--fg-muted)]">I</p>
              <MatrixGrid m={I} />
            </div>
            <div className="flex items-center self-center text-lg font-mono">×</div>
            <div>
              <p className="mb-1 text-xs text-[var(--fg-muted)]">A</p>
              <MatrixGrid m={A} setM={setA} />
            </div>
          </>
        ) : showLU ? (
          <>
            <div>
              <p className="mb-1 text-xs text-[var(--fg-muted)]">A</p>
              <MatrixGrid m={A} setM={setA} />
            </div>
          </>
        ) : showCode ? null : (
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
              {showT ? 'Aᵀ' : showScale ? 'cA' : showProd ? 'AB' : showSum ? 'A+B' : showIdentity ? 'IA' : v.result}
            </p>
            <MatrixGrid m={result} highlightCell={mode === 'product' ? cell : null} />
          </div>
        ) : null}
        {/* LU decomposition panels */}
        {showLU && luPair ? (
          <>
            <div className="flex items-center self-center text-lg font-mono">=</div>
            <div>
              <p className="mb-1 text-xs text-[var(--fg-muted)]">L</p>
              <MatrixGrid m={luPair[0]} />
            </div>
            <div className="flex items-center self-center text-lg font-mono">×</div>
            <div>
              <p className="mb-1 text-xs text-[var(--fg-muted)]">U</p>
              <MatrixGrid m={luPair[1]} />
            </div>
          </>
        ) : null}
        {showLU && !luPair ? (
          <p className="text-sm text-[var(--fg-muted)]">Pivote = 0, intercambia filas</p>
        ) : null}
      </div>

      {showT ? (
        <p className="mt-2 font-mono text-sm">
          A = Aᵀ:{' '}
          <span className={isSymmetric ? 'text-[var(--accent-strong)]' : 'opacity-60'}>
            {isSymmetric ? `✓ ${v.symmetricYes}` : `✗ ${v.symmetricNo}`}
          </span>
        </p>
      ) : null}

      {showIdentity ? (
        <p className="mt-2 font-mono text-sm text-[var(--accent-strong)]">AI = A ✓</p>
      ) : null}

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
        <div className="mt-3 space-y-1 font-mono text-sm">
          <p>
            rg(A) = {rA} · rg([A|b]) = {rAug}
          </p>
          <p
            className={
              rcClass === 'unique'
                ? 'text-[var(--accent-strong)]'
                : rcClass === 'infinite'
                  ? 'text-teal-600'
                  : 'text-orange-600'
            }
          >
            → {rcClass === 'unique' ? v.oneSolution : rcClass === 'infinite' ? v.infSolutions : v.noSolution}
          </p>
        </div>
      ) : null}

      {showCode && isEncode ? (
        <div className="mt-3 space-y-3 text-sm">
          <div>
            <p className="mb-1 text-xs text-[var(--fg-muted)]">G (2×3) sobre 𝔽₂</p>
            <div className="inline-grid grid-cols-3 gap-1 rounded border border-[var(--border)] p-2 font-mono">
              {CODE_G.flat().map((bit, i) => (
                <span key={i} className="w-8 text-center">
                  {bit}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs text-[var(--fg-muted)]">{v.encodeMsg}</p>
            <ButtonRow>
              {([0, 1] as const).map((i) => (
                <VizButton
                  key={i}
                  active={msg[i] === 1}
                  onClick={() => {
                    const next: [number, number] = [...msg] as [number, number];
                    next[i] = 1 - next[i]!;
                    setMsg(next);
                  }}
                >
                  m{i}={msg[i]}
                </VizButton>
              ))}
            </ButtonRow>
          </div>
          <p className="font-mono text-[var(--accent-strong)]">
            {v.codeword} = [{encodeCode.join(', ')}]
          </p>
        </div>
      ) : null}

      {showCode && isParity ? (
        <div className="mt-3 space-y-3 text-sm">
          <div>
            <p className="mb-1 text-xs text-[var(--fg-muted)]">H (2×3) sobre 𝔽₂</p>
            <div className="inline-grid grid-cols-3 gap-1 rounded border border-[var(--border)] p-2 font-mono">
              {CODE_H.flat().map((bit, i) => (
                <span key={i} className="w-8 text-center">
                  {bit}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs text-[var(--fg-muted)]">r (recibida)</p>
            <ButtonRow>
              {([0, 1, 2] as const).map((i) => (
                <VizButton
                  key={i}
                  active={recv[i] === 1}
                  onClick={() => {
                    const next: [number, number, number] = [...recv] as [number, number, number];
                    next[i] = 1 - next[i]!;
                    setRecv(next);
                  }}
                >
                  r{i}={recv[i]}
                </VizButton>
              ))}
            </ButtonRow>
          </div>
          <p className="font-mono">
            {v.syndrome} = [{syndrome.join(', ')}] ·{' '}
            {syndrome[0] === 0 && syndrome[1] === 0 ? v.validCodeword : v.invalidCodeword}
          </p>
          <ButtonRow>
            <VizButton onClick={() => setRecv(encodeCode)}>usar c = mG</VizButton>
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
