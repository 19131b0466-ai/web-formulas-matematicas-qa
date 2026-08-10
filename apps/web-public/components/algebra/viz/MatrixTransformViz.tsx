'use client';

import { useMemo, useState } from 'react';
import { useVizLabels } from '@/lib/viz-labels';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from './controls';
import {
  applyMat,
  det2,
  eigen2,
  inv2,
  linspace,
  matMul,
  transpose2,
  type Mat2,
  type Vec2,
} from './math2d';

type Props = { formulaId: string; idea?: string };

export function MatrixTransformViz({ formulaId, idea }: Props) {
  const v = useVizLabels();
  const [a11, setA11] = useState(1.2);
  const [a12, setA12] = useState(0.4);
  const [a21, setA21] = useState(0.3);
  const [a22, setA22] = useState(0.9);
  const [k, setK] = useState(2);
  const [showEigen, setShowEigen] = useState(true);
  const [step, setStep] = useState(0);

  const A: Mat2 = [
    [a11, a12],
    [a21, a22],
  ];
  const det = det2(A);
  const eig = useMemo(() => eigen2(A), [a11, a12, a21, a22]);
  const Ainv = inv2(A);

  const W = 420;
  const H = 320;
  const ox = W / 2;
  const oy = H / 2;
  const S = 36;
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });

  const grid = useMemo(() => {
    const lines: Array<[Vec2, Vec2]> = [];
    for (const t of linspace(-2.5, 2.5, 11)) {
      lines.push([
        applyMat(A, { x: t, y: -2.5 }),
        applyMat(A, { x: t, y: 2.5 }),
      ]);
      lines.push([
        applyMat(A, { x: -2.5, y: t }),
        applyMat(A, { x: 2.5, y: t }),
      ]);
    }
    return lines;
  }, [A]);

  const e1 = applyMat(A, { x: 1, y: 0 });
  const e2 = applyMat(A, { x: 0, y: 1 });

  // Fake SVD singular values from eig of AᵀA
  const AtA = matMul(transpose2(A), A);
  const svdE = eigen2(AtA);
  const sigma = svdE ? svdE.values.map((v) => Math.sqrt(Math.max(0, v))) : [1, 1];

  const rankApprox: Mat2 =
    k <= 1
      ? [
          [sigma[0]! * 0.8, 0],
          [0, 0],
        ]
      : A;

  return (
    <VizPanel
      caption={`${idea ?? ''} · det=${fmt(det)} · σ≈(${fmt(sigma[0]!)}, ${fmt(sigma[1]!)})`}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img">
        <line x1={20} y1={oy} x2={W - 20} y2={oy} stroke="currentColor" opacity={0.2} />
        <line x1={ox} y1={20} x2={ox} y2={H - 20} stroke="currentColor" opacity={0.2} />
        {grid.map(([p, q], i) => {
          const P = to(p);
          const Q = to(q);
          return (
            <line
              key={i}
              x1={P.x}
              y1={P.y}
              x2={Q.x}
              y2={Q.y}
              stroke="var(--accent-soft)"
              strokeWidth={1}
            />
          );
        })}
        <line x1={ox} y1={oy} x2={to(e1).x} y2={to(e1).y} stroke="var(--accent-strong)" strokeWidth={2.5} />
        <line x1={ox} y1={oy} x2={to(e2).x} y2={to(e2).y} stroke="teal" strokeWidth={2.5} />
        {showEigen && eig
          ? eig.vectors.map((v, i) => {
              const p = to({ x: v.x * eig.values[i]!, y: v.y * eig.values[i]! });
              return (
                <line
                  key={i}
                  x1={ox}
                  y1={oy}
                  x2={p.x}
                  y2={p.y}
                  stroke="orange"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                />
              );
            })
          : null}
        {/DEC-004|NOR-/.test(formulaId) ? (
          <ellipse
            cx={ox}
            cy={oy}
            rx={Math.abs(sigma[0]!) * S}
            ry={Math.abs(sigma[1]!) * S}
            fill="none"
            stroke="orange"
            opacity={0.7}
          />
        ) : null}
      </svg>
      <ControlsStack>
        <SliderRow label="a₁₁" value={a11} min={-2} max={2.5} step={0.05} onChange={setA11} />
        <SliderRow label="a₁₂" value={a12} min={-2} max={2.5} step={0.05} onChange={setA12} />
        <SliderRow label="a₂₁" value={a21} min={-2} max={2.5} step={0.05} onChange={setA21} />
        <SliderRow label="a₂₂" value={a22} min={-2} max={2.5} step={0.05} onChange={setA22} />
        {/DEC-005|NOR-007/.test(formulaId) ? (
          <SliderRow label="k / κ" value={k} min={1} max={2} step={1} onChange={setK} />
        ) : null}
        <ButtonRow>
          <VizButton active={showEigen} onClick={() => setShowEigen((s) => !s)}>
            {v.eigenvectors}
          </VizButton>
          <VizButton
            onClick={() => {
              if (!Ainv) return;
              setA11(Ainv[0][0]);
              setA12(Ainv[0][1]);
              setA21(Ainv[1][0]);
              setA22(Ainv[1][1]);
            }}
          >
            {v.applyInverse}
          </VizButton>
          <VizButton onClick={() => setStep((s) => (s + 1) % 3)}>
            {v.svdStep} {step + 1}/3
          </VizButton>
        </ButtonRow>
        {k <= 1 ? (
          <p className="font-mono text-xs text-[var(--fg-muted)]">
            {v.lowRank}: [[{fmt(rankApprox[0][0])}, {fmt(rankApprox[0][1])}], [{fmt(rankApprox[1][0])},{' '}
            {fmt(rankApprox[1][1])}]]
          </p>
        ) : null}
      </ControlsStack>
    </VizPanel>
  );
}
