'use client';

import { useMemo, useRef, useState } from 'react';
import { useVizLabels } from '@/lib/viz-labels';
import type { VectorMode } from '@/lib/viz-modes';
import { ControlsStack, SliderRow, VizPanel, fmt, joinCaption } from './controls';
import { add, dot, normalize, norm, project, scale, sub, type Vec2 } from './math2d';
import { ComplexRectangularViz } from './ComplexRectangularViz';
import { ComplexConjugateViz } from './ComplexConjugateViz';
import { ComplexModulusViz } from './ComplexModulusViz';
import { ComplexPolarViz } from './ComplexPolarViz';
import { EulerFormulaViz } from './EulerFormulaViz';
import { DeMoivreViz } from './DeMoivreViz';
import { VectorRnViz } from './VectorRnViz';
import { NormEuclideanViz } from './NormEuclideanViz';
import { UnitVectorViz } from './UnitVectorViz';
import { DotProductViz } from './DotProductViz';
import { AngleBetweenViz } from './AngleBetweenViz';
import { EuclideanDistanceViz } from './EuclideanDistanceViz';
import { LinearComboViz } from './LinearComboViz';
import { OrthogonalityViz } from './OrthogonalityViz';
import { OrthogonalProjectionViz } from './OrthogonalProjectionViz';

type Props = { formulaId: string; idea?: string; mode?: string };

function useDrag(set: (v: Vec2) => void, scalePx: number, origin: Vec2) {
  const dragging = useRef(false);
  return {
    onPointerDown: (e: React.PointerEvent) => {
      dragging.current = true;
      (e.target as Element).setPointerCapture?.(e.pointerId);
    },
    onPointerUp: () => {
      dragging.current = false;
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const svg = (e.target as SVGElement).ownerSVGElement;
      if (!svg) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const sp = pt.matrixTransform(ctm.inverse());
      set({
        x: (sp.x - origin.x) / scalePx,
        y: -(sp.y - origin.y) / scalePx,
      });
    },
  };
}

export function VectorViz({ formulaId, mode: modeProp }: Props) {
  if (formulaId.includes('COM-001')) return <ComplexRectangularViz />;
  if (formulaId.includes('COM-002')) return <ComplexConjugateViz />;
  if (formulaId.includes('COM-003')) return <ComplexModulusViz />;
  if (formulaId.includes('COM-004')) return <ComplexPolarViz />;
  if (formulaId.includes('COM-005')) return <EulerFormulaViz />;
  if (formulaId.includes('COM-006')) return <DeMoivreViz />;

  if (formulaId.includes('VEC-001')) return <VectorRnViz />;
  if (formulaId.includes('VEC-002')) return <NormEuclideanViz />;
  if (formulaId.includes('VEC-003')) return <UnitVectorViz />;
  if (formulaId.includes('VEC-004')) return <DotProductViz />;
  if (formulaId.includes('VEC-005')) return <AngleBetweenViz />;
  if (formulaId.includes('VEC-006')) return <EuclideanDistanceViz />;
  if (formulaId.includes('VEC-007')) return <LinearComboViz />;
  if (formulaId.includes('ORT-001')) return <OrthogonalityViz />;
  if (formulaId.includes('ORT-002')) return <OrthogonalProjectionViz />;

  return <VectorVizInner formulaId={formulaId} mode={modeProp} />;
}

function VectorVizInner({ formulaId, mode: modeProp }: Props) {
  const vLab = useVizLabels();
  const mode = (modeProp ?? 'basic') as VectorMode;
  const [u, setU] = useState<Vec2>({ x: 2.2, y: 1.4 });
  const [v, setV] = useState<Vec2>({ x: 0.8, y: 2.1 });
  const [theta, setTheta] = useState(0.8);
  const [n, setN] = useState(3);
  const [alpha, setAlpha] = useState(0.7);
  const [beta, setBeta] = useState(0.5);

  const W = 420;
  const H = 320;
  const ox = W / 2;
  const oy = H / 2;
  // For moivre_power, keep radius clamped so powers stay on screen
  const S_base = 42;
  const moivreR = Math.max(0.4, Math.min(1.2, norm(u)));
  const S = mode === 'moivre_power' ? (S_base * 1.2) / moivreR : S_base;
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });
  const dragU = useDrag(setU, S_base, { x: ox, y: oy });
  const dragV = useDrag(setV, S_base, { x: ox, y: oy });

  const dp = dot(u, v);
  const angleKind =
    Math.abs(dp) < 1e-6 ? vLab.rightAngle : dp > 0 ? vLab.acute : vLab.obtuse;

  const derived = useMemo(() => {
    if (mode === 'proj') {
      const p = project(u, v);
      const r = sub(u, p);
      return {
        p,
        r,
        label: `u·v=${fmt(dp)} (${angleKind}) · proj=${fmt(norm(p))}`,
      };
    }
    if (mode === 'unit') {
      const uu = normalize(u);
      return { p: uu, r: null, label: `û · ‖û‖=${fmt(norm(uu))}` };
    }
    if (mode === 'angle') {
      const cos = dp / (norm(u) * norm(v) || 1);
      const deg = (Math.acos(Math.min(1, Math.max(-1, cos))) * 180) / Math.PI;
      return { p: null, r: null, label: `u·v=${fmt(dp)} · ∠=${fmt(deg)}° (${angleKind})` };
    }
    if (mode === 'moivre_power') {
      const r = moivreR;
      return {
        p: null,
        r: null,
        label: `r=${fmt(r)} → rⁿ=${fmt(r ** n)} · θ→nθ=${fmt((n * theta * 180) / Math.PI)}°`,
      };
    }
    if (mode === 'euler') {
      return {
        p: null,
        r: null,
        label: `e^{iθ}: (cos θ, sin θ) = (${fmt(Math.cos(theta))}, ${fmt(Math.sin(theta))})`,
      };
    }
    if (mode === 'distance') {
      const diff = sub(u, v);
      const dist = norm(diff);
      return { p: null, r: null, label: `‖u−v‖=${fmt(dist)}` };
    }
    if (mode === 'complex') {
      const r = norm(u);
      const t = Math.atan2(u.y, u.x);
      return { p: null, r: null, label: `r=${fmt(r)}, θ=${fmt((t * 180) / Math.PI)}°` };
    }
    if (mode === 'conjugate') {
      const r = norm(u);
      const zConj = { x: u.x, y: -u.y };
      const zz = dot(u, zConj) + u.y * u.y; // |z|² = x²+y²
      return {
        p: null,
        r: null,
        label: `r=${fmt(r)} · |z|²=${fmt(r * r)} · z·conj=${fmt(zz)}`,
      };
    }
    if (mode === 'combo') {
      const combo = add(scale(u, alpha), scale(v, beta));
      return { p: null, r: null, label: `${fmt(alpha)}u+${fmt(beta)}v · ‖‖=${fmt(norm(combo))}` };
    }
    return { p: null, r: null, label: `‖u‖=${fmt(norm(u))} · u·v=${fmt(dp)} (${angleKind})` };
  }, [u, v, mode, dp, angleKind, n, theta, moivreR, alpha, beta]);

  // For polar display: moivre, euler, and COM-004 use angle θ for direction of u
  const isPolarDisplay = mode === 'moivre_power' || mode === 'euler' || (mode === 'complex' && formulaId.includes('COM-004'));
  const polarR = mode === 'moivre_power' ? moivreR : 1; // euler locks to unit circle
  const polarU: Vec2 = { x: Math.cos(theta) * polarR, y: Math.sin(theta) * polarR };
  const displayU = isPolarDisplay ? polarU : u;

  const powers =
    mode === 'moivre_power'
      ? Array.from({ length: Math.max(1, Math.round(n)) }, (_, k) => {
          const p = k + 1;
          const rr = moivreR ** p;
          const ang = theta * p;
          return { x: rr * Math.cos(ang), y: rr * Math.sin(ang), p };
        })
      : [];

  const pu = to(displayU);
  const pv = to(v);
  const pProj = derived.p ? to(derived.p) : null;
  const pRes = derived.r ? to(derived.r) : null;
  const showV =
    mode !== 'moivre_power' &&
    mode !== 'euler' &&
    mode !== 'conjugate' &&
    mode !== 'unit' &&
    (mode !== 'complex' || /VEC-|ORT-/.test(formulaId));

  // θ slider: only for moivre_power, euler, and COM-004 polar
  const showThetaSlider = mode === 'moivre_power' || mode === 'euler' || (mode === 'complex' && formulaId.includes('COM-004'));

  // Euler: unit circle tip point
  const eulerTip: Vec2 = { x: Math.cos(theta), y: Math.sin(theta) };

  return (
    <VizPanel caption={joinCaption(derived.label)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full touch-none" role="img">
        <line x1={20} y1={oy} x2={W - 20} y2={oy} stroke="currentColor" opacity={0.2} />
        <line x1={ox} y1={20} x2={ox} y2={H - 20} stroke="currentColor" opacity={0.2} />

        {/* Unit circle for complex/moivre/euler modes */}
        {mode === 'complex' || mode === 'conjugate' || mode === 'moivre_power' ? (
          <circle cx={ox} cy={oy} r={Math.max(0.4, norm(u)) * S} fill="none" stroke="currentColor" opacity={0.25} />
        ) : null}
        {mode === 'euler' ? (
          <circle cx={ox} cy={oy} r={S} fill="none" stroke="currentColor" opacity={0.3} />
        ) : null}

        {/* Distance mode: show segment u−v */}
        {mode === 'distance' ? (
          <>
            <line
              x1={to(u).x}
              y1={to(u).y}
              x2={to(v).x}
              y2={to(v).y}
              stroke="orange"
              strokeWidth={2.5}
            />
            {/* Vector u−v from origin */}
            <line
              x1={ox}
              y1={oy}
              x2={to(sub(u, v)).x}
              y2={to(sub(u, v)).y}
              stroke="orange"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              opacity={0.7}
            />
          </>
        ) : null}

        {/* Main vector u */}
        <line x1={ox} y1={oy} x2={pu.x} y2={pu.y} stroke="var(--accent-strong)" strokeWidth={2.5} />
        <circle cx={pu.x} cy={pu.y} r={8} fill="var(--accent-strong)" {...(isPolarDisplay ? {} : dragU)} style={{ cursor: isPolarDisplay ? 'default' : 'grab' }} />

        {/* Vector v */}
        {showV ? (
          <>
            <line x1={ox} y1={oy} x2={pv.x} y2={pv.y} stroke="teal" strokeWidth={2.5} />
            <circle cx={pv.x} cy={pv.y} r={8} fill="teal" {...dragV} style={{ cursor: 'grab' }} />
          </>
        ) : null}

        {/* Distance mode: also show v */}
        {mode === 'distance' ? (
          <>
            <line x1={ox} y1={oy} x2={to(v).x} y2={to(v).y} stroke="teal" strokeWidth={2.5} />
            <circle cx={to(v).x} cy={to(v).y} r={8} fill="teal" {...dragV} style={{ cursor: 'grab' }} />
          </>
        ) : null}

        {/* Projection */}
        {pProj ? <line x1={ox} y1={oy} x2={pProj.x} y2={pProj.y} stroke="orange" strokeWidth={2} strokeDasharray="4 2" /> : null}
        {mode === 'proj' && pProj ? (
          <line x1={pu.x} y1={pu.y} x2={pProj.x} y2={pProj.y} stroke="currentColor" strokeDasharray="3 2" opacity={0.5} />
        ) : null}
        {mode === 'proj' && pRes ? (
          <line
            x1={pProj!.x}
            y1={pProj!.y}
            x2={to(add(derived.p!, derived.r!)).x}
            y2={to(add(derived.p!, derived.r!)).y}
            stroke="orange"
            strokeWidth={1.5}
            opacity={0.7}
          />
        ) : null}

        {/* Conjugate: show reflection */}
        {mode === 'conjugate' ? (
          <line x1={ox} y1={oy} x2={to({ x: u.x, y: -u.y }).x} y2={to({ x: u.x, y: -u.y }).y} stroke="orange" strokeWidth={2} />
        ) : null}

        {/* Combo: αu+βv and parallelogram */}
        {mode === 'combo' ? (
          <>
            {/* Parallelogram sides */}
            <line x1={to(u).x} y1={to(u).y} x2={to(add(u, v)).x} y2={to(add(u, v)).y} stroke="teal" strokeWidth={1} strokeDasharray="3 2" opacity={0.5} />
            <line x1={to(v).x} y1={to(v).y} x2={to(add(u, v)).x} y2={to(add(u, v)).y} stroke="var(--accent-strong)" strokeWidth={1} strokeDasharray="3 2" opacity={0.5} />
            {/* αu+βv vector */}
            <line
              x1={ox}
              y1={oy}
              x2={to(add(scale(u, alpha), scale(v, beta))).x}
              y2={to(add(scale(u, alpha), scale(v, beta))).y}
              stroke="orange"
              strokeWidth={2.5}
            />
            <circle cx={to(add(scale(u, alpha), scale(v, beta))).x} cy={to(add(scale(u, alpha), scale(v, beta))).y} r={6} fill="orange" />
          </>
        ) : null}

        {/* Euler mode: label the tip */}
        {mode === 'euler' ? (
          <>
            <text x={to(eulerTip).x + 10} y={to(eulerTip).y - 8} fontSize={12} fill="currentColor">
              {'e^{iθ}'}
            </text>
            {/* Dashed lines to axes */}
            <line x1={to(eulerTip).x} y1={to(eulerTip).y} x2={to(eulerTip).x} y2={oy} stroke="currentColor" strokeDasharray="3 2" opacity={0.35} />
            <line x1={to(eulerTip).x} y1={to(eulerTip).y} x2={ox} y2={to(eulerTip).y} stroke="currentColor" strokeDasharray="3 2" opacity={0.35} />
          </>
        ) : null}

        {/* De Moivre powers */}
        {powers.map((pt) => {
          const p = to(pt);
          return (
            <g key={pt.p}>
              <line x1={ox} y1={oy} x2={p.x} y2={p.y} stroke="orange" strokeWidth={1.5} opacity={0.55 + 0.45 * (pt.p / n)} />
              <circle cx={p.x} cy={p.y} r={5} fill="orange" />
              <text x={p.x + 8} y={p.y - 8} fontSize={11} fill="currentColor">
                z^{pt.p}
              </text>
            </g>
          );
        })}
      </svg>

      <ControlsStack>
        {showThetaSlider ? (
          <SliderRow label="θ" value={theta} min={-Math.PI} max={Math.PI} step={0.05} onChange={setTheta} />
        ) : null}
        {mode === 'moivre_power' ? <SliderRow label="n" value={n} min={1} max={6} step={1} onChange={setN} /> : null}
        {mode === 'combo' ? (
          <>
            <SliderRow label="α" value={alpha} min={-2} max={2} step={0.05} onChange={setAlpha} />
            <SliderRow label="β" value={beta} min={-2} max={2} step={0.05} onChange={setBeta} />
          </>
        ) : null}
        <p className="text-xs text-[var(--fg-muted)]">{vLab.dragVectors}</p>
      </ControlsStack>
    </VizPanel>
  );
}
