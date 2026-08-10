'use client';

import { useMemo, useState } from 'react';
import { useVizLabels } from '@/lib/viz-labels';
import type { MatrixTransformMode } from '@/lib/viz-modes';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt, joinCaption } from './controls';
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

type Props = { formulaId: string; idea?: string; mode?: string };

export function MatrixTransformViz({ formulaId: _id, mode: modeProp }: Props) {
  const v = useVizLabels();
  const mode = (modeProp ?? 'map') as MatrixTransformMode;
  const [a11, setA11] = useState(1.2);
  const [a12, setA12] = useState(0.4);
  const [a21, setA21] = useState(0.3);
  const [a22, setA22] = useState(0.9);
  const [k, setK] = useState(2);
  const [showEigen, setShowEigen] = useState(mode === 'eigen' || mode === 'map');
  const [svdStep, setSvdStep] = useState(0);

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

  const AtA = matMul(transpose2(A), A);
  const svdE = eigen2(AtA);
  const sigma = svdE ? svdE.values.map((val) => Math.sqrt(Math.max(0, val))) : [1, 1];

  // Pedagogical SVD stages on the unit circle / basis:
  // 0: original grid under A
  // 1: rotate (show circle + V directions ≈ eigenvectors of AtA)
  // 2: scale by σ (ellipse)
  // 3/0 cycle: full A
  const displayMat: Mat2 = useMemo(() => {
    if (mode !== 'svd') return A;
    if (svdStep === 1) {
      // approximate rotation: orthonormalize eigvecs of AtA if available
      if (!svdE) return A;
      const v0 = svdE.vectors[0]!;
      const v1 = svdE.vectors[1]!;
      return [
        [v0.x, v1.x],
        [v0.y, v1.y],
      ];
    }
    if (svdStep === 2) {
      return [
        [sigma[0]!, 0],
        [0, sigma[1]!],
      ];
    }
    return A;
  }, [mode, A, svdStep, svdE, sigma]);

  const grid = useMemo(() => {
    const lines: Array<[Vec2, Vec2]> = [];
    const M = mode === 'low_rank' && k <= 1 ? ([[sigma[0]! * 0.8, 0], [0, 0]] as Mat2) : displayMat;
    for (const t of linspace(-2.5, 2.5, 11)) {
      lines.push([applyMat(M, { x: t, y: -2.5 }), applyMat(M, { x: t, y: 2.5 })]);
      lines.push([applyMat(M, { x: -2.5, y: t }), applyMat(M, { x: 2.5, y: t })]);
    }
    return lines;
  }, [displayMat, mode, k, sigma]);

  const e1 = applyMat(displayMat, { x: 1, y: 0 });
  const e2 = applyMat(displayMat, { x: 0, y: 1 });

  const svdLabel =
    mode === 'svd'
      ? svdStep === 1
        ? v.svdRotate
        : svdStep === 2
          ? v.svdScale
          : v.svdCompose
      : '';

  return (
    <VizPanel
      caption={joinCaption(`det=${fmt(det)}`, `σ≈(${fmt(sigma[0]!)}, ${fmt(sigma[1]!)})`, svdLabel)}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img">
        <line x1={20} y1={oy} x2={W - 20} y2={oy} stroke="currentColor" opacity={0.2} />
        <line x1={ox} y1={20} x2={ox} y2={H - 20} stroke="currentColor" opacity={0.2} />
        {grid.map(([p, q], i) => {
          const P = to(p);
          const Q = to(q);
          return (
            <line key={i} x1={P.x} y1={P.y} x2={Q.x} y2={Q.y} stroke="var(--accent-soft)" strokeWidth={1} />
          );
        })}
        <line x1={ox} y1={oy} x2={to(e1).x} y2={to(e1).y} stroke="var(--accent-strong)" strokeWidth={2.5} />
        <line x1={ox} y1={oy} x2={to(e2).x} y2={to(e2).y} stroke="teal" strokeWidth={2.5} />
        {showEigen && eig
          ? eig.vectors.map((vec, i) => {
              const p = to({ x: vec.x * eig.values[i]!, y: vec.y * eig.values[i]! });
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
        {mode === 'svd' || /NOR-/.test(_id) ? (
          <ellipse
            cx={ox}
            cy={oy}
            rx={Math.abs(sigma[0]!) * S * (svdStep === 1 ? 1 : 1)}
            ry={Math.abs(sigma[1]!) * S * (svdStep === 1 ? 1 : 1)}
            fill="none"
            stroke="orange"
            opacity={svdStep === 2 || mode !== 'svd' ? 0.85 : 0.35}
          />
        ) : null}
      </svg>
      <ControlsStack>
        <SliderRow label="a₁₁" value={a11} min={-2} max={2.5} step={0.05} onChange={setA11} />
        <SliderRow label="a₁₂" value={a12} min={-2} max={2.5} step={0.05} onChange={setA12} />
        <SliderRow label="a₂₁" value={a21} min={-2} max={2.5} step={0.05} onChange={setA21} />
        <SliderRow label="a₂₂" value={a22} min={-2} max={2.5} step={0.05} onChange={setA22} />
        {mode === 'low_rank' ? (
          <SliderRow label="k / κ" value={k} min={1} max={2} step={1} onChange={setK} />
        ) : null}
        <ButtonRow>
          <VizButton active={showEigen} onClick={() => setShowEigen((s) => !s)}>
            {v.eigenvectors}
          </VizButton>
          {(mode === 'inverse' || mode === 'map') && Ainv ? (
            <VizButton
              onClick={() => {
                setA11(Ainv[0][0]);
                setA12(Ainv[0][1]);
                setA21(Ainv[1][0]);
                setA22(Ainv[1][1]);
              }}
            >
              {v.applyInverse}
            </VizButton>
          ) : null}
          {mode === 'svd' ? (
            <VizButton onClick={() => setSvdStep((s) => (s + 1) % 3)}>
              {v.svdStep} {(svdStep % 3) + 1}/3
            </VizButton>
          ) : null}
        </ButtonRow>
        {mode === 'low_rank' && k <= 1 ? (
          <p className="font-mono text-xs text-[var(--fg-muted)]">
            {v.lowRank}: σ₁≈{fmt(sigma[0]!)}, σ₂→0
          </p>
        ) : null}
      </ControlsStack>
    </VizPanel>
  );
}
