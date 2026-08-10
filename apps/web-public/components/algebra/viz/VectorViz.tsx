'use client';

import { useMemo, useRef, useState } from 'react';
import { useVizLabels } from '@/lib/viz-labels';
import type { VectorMode } from '@/lib/viz-modes';
import { ControlsStack, SliderRow, VizPanel, fmt, joinCaption } from './controls';
import { add, dot, normalize, norm, project, scale, sub, type Vec2 } from './math2d';

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
  const vLab = useVizLabels();
  const mode = (modeProp ?? 'basic') as VectorMode;
  const [u, setU] = useState<Vec2>({ x: 2.2, y: 1.4 });
  const [v, setV] = useState<Vec2>({ x: 0.8, y: 2.1 });
  const [theta, setTheta] = useState(0.8);
  const [n, setN] = useState(3);

  const W = 420;
  const H = 320;
  const ox = W / 2;
  const oy = H / 2;
  const S = 42;
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });
  const dragU = useDrag(setU, S, { x: ox, y: oy });
  const dragV = useDrag(setV, S, { x: ox, y: oy });

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
      const r = Math.max(0.4, norm(u));
      return {
        p: null,
        r: null,
        label: `r=${fmt(r)} → rⁿ=${fmt(r ** n)} · θ→nθ=${fmt((n * theta * 180) / Math.PI)}°`,
      };
    }
    if (mode === 'complex' || mode === 'conjugate') {
      const r = norm(u);
      const t = Math.atan2(u.y, u.x);
      return { p: null, r: null, label: `r=${fmt(r)}, θ=${fmt((t * 180) / Math.PI)}°` };
    }
    if (mode === 'combo') {
      return { p: null, r: null, label: `0.7u+0.5v` };
    }
    return { p: null, r: null, label: `‖u‖=${fmt(norm(u))} · u·v=${fmt(dp)} (${angleKind})` };
  }, [u, v, mode, dp, angleKind, n, theta]);

  const polarU = { x: Math.cos(theta) * Math.max(0.4, norm(u)), y: Math.sin(theta) * Math.max(0.4, norm(u)) };
  const displayU = mode === 'moivre_power' || (mode === 'complex' && formulaId.includes('COM-004')) ? polarU : u;

  const powers =
    mode === 'moivre_power'
      ? Array.from({ length: Math.max(1, Math.round(n)) }, (_, k) => {
          const p = k + 1;
          const rr = Math.max(0.4, norm(u)) ** p;
          const ang = theta * p;
          return { x: rr * Math.cos(ang), y: rr * Math.sin(ang), p };
        })
      : [];

  const pu = to(displayU);
  const pv = to(v);
  const pProj = derived.p ? to(derived.p) : null;
  const pRes = derived.r ? to(derived.r) : null;
  const showV = mode !== 'moivre_power' && mode !== 'conjugate' && (mode !== 'complex' || /VEC-|ORT-/.test(formulaId));

  return (
    <VizPanel caption={joinCaption(derived.label)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full touch-none" role="img">
        <line x1={20} y1={oy} x2={W - 20} y2={oy} stroke="currentColor" opacity={0.2} />
        <line x1={ox} y1={20} x2={ox} y2={H - 20} stroke="currentColor" opacity={0.2} />
        {mode === 'complex' || mode === 'conjugate' || mode === 'moivre_power' ? (
          <circle cx={ox} cy={oy} r={Math.max(0.4, norm(u)) * S} fill="none" stroke="currentColor" opacity={0.25} />
        ) : null}
        <line x1={ox} y1={oy} x2={pu.x} y2={pu.y} stroke="var(--accent-strong)" strokeWidth={2.5} />
        <circle cx={pu.x} cy={pu.y} r={8} fill="var(--accent-strong)" {...dragU} style={{ cursor: 'grab' }} />
        {showV ? (
          <>
            <line x1={ox} y1={oy} x2={pv.x} y2={pv.y} stroke="teal" strokeWidth={2.5} />
            <circle cx={pv.x} cy={pv.y} r={8} fill="teal" {...dragV} style={{ cursor: 'grab' }} />
          </>
        ) : null}
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
        {mode === 'conjugate' ? (
          <line x1={ox} y1={oy} x2={to({ x: u.x, y: -u.y }).x} y2={to({ x: u.x, y: -u.y }).y} stroke="orange" strokeWidth={2} />
        ) : null}
        {mode === 'combo' ? (
          <line
            x1={ox}
            y1={oy}
            x2={to(add(scale(u, 0.7), scale(v, 0.5))).x}
            y2={to(add(scale(u, 0.7), scale(v, 0.5))).y}
            stroke="orange"
            strokeWidth={2}
          />
        ) : null}
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
        {mode === 'moivre_power' || mode === 'complex' ? (
          <SliderRow label="θ" value={theta} min={-Math.PI} max={Math.PI} step={0.05} onChange={setTheta} />
        ) : null}
        {mode === 'moivre_power' ? <SliderRow label="n" value={n} min={1} max={6} step={1} onChange={setN} /> : null}
        <p className="text-xs text-[var(--fg-muted)]">{vLab.dragVectors}</p>
      </ControlsStack>
    </VizPanel>
  );
}
