'use client';

import { useState } from 'react';
import { useVizLabels } from '@/lib/viz-labels';
import { ControlsStack, SliderRow, VizPanel, fmt, joinCaption } from './controls';
import { det2, type Mat2, type Vec2 } from './math2d';
import { ComplexRootsViz } from './ComplexRootsViz';
import { Determinant2x2Viz } from './Determinant2x2Viz';
import { DeterminantProductViz } from './DeterminantProductViz';
import { InvertibilityCriterionViz } from './InvertibilityCriterionViz';

type Props = { formulaId: string; idea?: string; mode?: string };

export function GeometryViz({ formulaId, mode }: Props) {
  if (formulaId.includes('COM-007')) {
    return <ComplexRootsViz />;
  }
  if (formulaId.includes('DET-001')) {
    return <Determinant2x2Viz />;
  }
  if (formulaId.includes('DET-003')) {
    return <DeterminantProductViz />;
  }
  if (formulaId.includes('DET-004')) {
    return <InvertibilityCriterionViz />;
  }

  return <GeometryVizInner formulaId={formulaId} mode={mode} />;
}

function GeometryVizInner({ formulaId, mode }: Props) {
  const lab = useVizLabels();
  const [u, setU] = useState<Vec2>({ x: 2, y: 0.3 });
  const [v, setV] = useState<Vec2>({ x: 0.5, y: 1.8 });
  const [n, setN] = useState(5);
  const [theta, setTheta] = useState(0.4);
  const [r, setR] = useState(2);

  const W = 420;
  const H = 300;
  const ox = W / 2;
  const oy = H / 2;
  const S = 40;
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });

  const M: Mat2 = [
    [u.x, v.x],
    [u.y, v.y],
  ];
  const area = det2(M);
  const singular = Math.abs(area) < 1e-3;

  // nth roots of r·e^{iθ}: the k-th root has angle (θ + 2πk)/n and radius r^{1/n}
  const rn = r ** (1 / Math.round(n));
  const roots = Array.from({ length: Math.round(n) }, (_, k) => {
    const ang = (theta + 2 * Math.PI * k) / Math.round(n);
    return { x: rn * Math.cos(ang), y: rn * Math.sin(ang) };
  });

  const isRoots = formulaId.includes('COM-007') || mode === 'roots';
  const isArea = /DET-001|DET-003|DET-004|LSQ-001/.test(formulaId) || mode === 'area';

  const rootsCaption = isRoots ? joinCaption(`r^{1/${Math.round(n)}}=${fmt(rn)}`) : undefined;
  const areaCaption = isArea ? joinCaption(`${lab.orientedArea}=${fmt(area)}`) : undefined;

  return (
    <VizPanel caption={rootsCaption ?? areaCaption}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img">
        <line x1={20} y1={oy} x2={W - 20} y2={oy} stroke="currentColor" opacity={0.2} />
        <line x1={ox} y1={20} x2={ox} y2={H - 20} stroke="currentColor" opacity={0.2} />
        {isArea ? (
          <>
            <polygon
              points={`${to({ x: 0, y: 0 }).x},${to({ x: 0, y: 0 }).y} ${to(u).x},${to(u).y} ${to({ x: u.x + v.x, y: u.y + v.y }).x},${to({ x: u.x + v.x, y: u.y + v.y }).y} ${to(v).x},${to(v).y}`}
              fill={singular ? 'color-mix(in oklab, orange 35%, transparent)' : 'var(--accent-soft)'}
              opacity={0.7}
            />
            <line x1={ox} y1={oy} x2={to(u).x} y2={to(u).y} stroke="var(--accent-strong)" strokeWidth={2.5} />
            <line x1={ox} y1={oy} x2={to(v).x} y2={to(v).y} stroke="teal" strokeWidth={2.5} />
          </>
        ) : null}
        {isRoots ? (
          <>
            {/* Outer circle at radius r^{1/n} where the roots lie */}
            <circle cx={ox} cy={oy} r={rn * S} fill="none" stroke="var(--accent-strong)" opacity={0.3} strokeDasharray="4 3" />
            {/* Reference circle at radius r (the original complex number) */}
            <circle cx={ox} cy={oy} r={r * S} fill="none" stroke="currentColor" opacity={0.15} />
            {roots.map((p, i) => (
              <g key={i}>
                <line x1={ox} y1={oy} x2={to(p).x} y2={to(p).y} stroke="var(--accent-strong)" strokeWidth={1.2} opacity={0.45} />
                <circle cx={to(p).x} cy={to(p).y} r={6} fill="var(--accent-strong)" />
              </g>
            ))}
          </>
        ) : null}
        {formulaId.includes('LSQ-001') ? (
          <circle cx={to({ x: 1.5, y: 2 }).x} cy={to({ x: 1.5, y: 2 }).y} r={6} fill="orange" />
        ) : null}
      </svg>
      <ControlsStack>
        {isArea ? (
          <>
            <SliderRow label="uₓ" value={u.x} min={-3} max={3} step={0.1} onChange={(x) => setU({ ...u, x })} />
            <SliderRow label="uᵧ" value={u.y} min={-3} max={3} step={0.1} onChange={(y) => setU({ ...u, y })} />
            <SliderRow label="vₓ" value={v.x} min={-3} max={3} step={0.1} onChange={(x) => setV({ ...v, x })} />
            <SliderRow label="vᵧ" value={v.y} min={-3} max={3} step={0.1} onChange={(y) => setV({ ...v, y })} />
          </>
        ) : null}
        {isRoots ? (
          <>
            <SliderRow label="n" value={n} min={2} max={10} step={1} onChange={setN} />
            <SliderRow label="r" value={r} min={0.5} max={3} step={0.1} onChange={setR} />
            <SliderRow label="θ" value={theta} min={-Math.PI} max={Math.PI} step={0.05} onChange={setTheta} />
          </>
        ) : null}
      </ControlsStack>
    </VizPanel>
  );
}
