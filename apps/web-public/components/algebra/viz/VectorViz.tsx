'use client';

import { useMemo, useRef, useState } from 'react';
import { useVizLabels } from '@/lib/viz-labels';
import { ControlsStack, SliderRow, VizPanel, fmt } from './controls';
import { add, dot, normalize, norm, project, scale, sub, type Vec2 } from './math2d';

type Props = { formulaId: string; idea?: string };

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

export function VectorViz({ formulaId, idea }: Props) {
  const vLab = useVizLabels();
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

  const complex = /COM-/.test(formulaId);
  const proj = /VEC-004|ORT-002/.test(formulaId);
  const angle = formulaId.includes('VEC-005');
  const unit = formulaId.includes('VEC-003') || formulaId.includes('COM-005');
  const moivre = formulaId.includes('COM-006') || formulaId.includes('COM-007');

  const derived = useMemo(() => {
    if (proj) {
      const p = project(u, v);
      return { p, r: sub(u, p), label: `proj=${fmt(norm(p))}` };
    }
    if (unit) {
      const uu = normalize(u);
      return { p: uu, r: null, label: `‖û‖=${fmt(norm(uu))}` };
    }
    if (angle) {
      const cos = dot(u, v) / (norm(u) * norm(v) || 1);
      return { p: null, r: null, label: `∠=${fmt((Math.acos(Math.min(1, Math.max(-1, cos))) * 180) / Math.PI)}°` };
    }
    if (complex) {
      const r = norm(u);
      const t = Math.atan2(u.y, u.x);
      return { p: null, r: null, label: `r=${fmt(r)}, θ=${fmt((t * 180) / Math.PI)}°` };
    }
    return { p: null, r: null, label: `‖u‖=${fmt(norm(u))}` };
  }, [u, v, proj, unit, angle, complex]);

  const polar = complex
    ? { x: Math.cos(theta) * norm(u), y: Math.sin(theta) * norm(u) }
    : u;

  const roots = moivre
    ? Array.from({ length: Math.max(2, Math.round(n)) }, (_, k) => {
        const ang = (theta + 2 * Math.PI * k) / Math.max(2, Math.round(n));
        const rr = norm(u) ** (1 / Math.max(2, Math.round(n)));
        return { x: rr * Math.cos(ang), y: rr * Math.sin(ang) };
      })
    : [];

  const pu = to(complex && formulaId.includes('COM-004') ? polar : u);
  const pv = to(v);
  const pProj = derived.p ? to(derived.p) : null;
  const pRes = derived.r ? to(derived.r) : null;

  return (
    <VizPanel caption={`${idea ?? ''} · ${derived.label}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full touch-none" role="img">
        <line x1={20} y1={oy} x2={W - 20} y2={oy} stroke="currentColor" opacity={0.2} />
        <line x1={ox} y1={20} x2={ox} y2={H - 20} stroke="currentColor" opacity={0.2} />
        {complex ? (
          <circle cx={ox} cy={oy} r={norm(u) * S} fill="none" stroke="currentColor" opacity={0.25} />
        ) : null}
        <line x1={ox} y1={oy} x2={pu.x} y2={pu.y} stroke="var(--accent-strong)" strokeWidth={2.5} />
        <circle cx={pu.x} cy={pu.y} r={8} fill="var(--accent-strong)" {...dragU} style={{ cursor: 'grab' }} />
        {!complex || formulaId.includes('ORT') || /VEC-/.test(formulaId) ? (
          <>
            <line x1={ox} y1={oy} x2={pv.x} y2={pv.y} stroke="teal" strokeWidth={2.5} />
            <circle cx={pv.x} cy={pv.y} r={8} fill="teal" {...dragV} style={{ cursor: 'grab' }} />
          </>
        ) : null}
        {pProj ? <line x1={ox} y1={oy} x2={pProj.x} y2={pProj.y} stroke="orange" strokeWidth={2} strokeDasharray="4 2" /> : null}
        {proj && pProj ? (
          <line x1={pu.x} y1={pu.y} x2={pProj.x} y2={pProj.y} stroke="currentColor" strokeDasharray="3 2" opacity={0.5} />
        ) : null}
        {formulaId.includes('COM-002') ? (
          <line x1={ox} y1={oy} x2={to({ x: u.x, y: -u.y }).x} y2={to({ x: u.x, y: -u.y }).y} stroke="orange" strokeWidth={2} />
        ) : null}
        {formulaId.includes('VEC-007') ? (
          <line
            x1={ox}
            y1={oy}
            x2={to(add(scale(u, 0.7), scale(v, 0.5))).x}
            y2={to(add(scale(u, 0.7), scale(v, 0.5))).y}
            stroke="orange"
            strokeWidth={2}
          />
        ) : null}
        {roots.map((pt, i) => {
          const p = to(pt);
          return <circle key={i} cx={p.x} cy={p.y} r={5} fill="orange" />;
        })}
        {pRes && false ? null : null}
      </svg>
      <ControlsStack>
        {complex ? <SliderRow label="θ" value={theta} min={-Math.PI} max={Math.PI} step={0.05} onChange={setTheta} /> : null}
        {moivre ? <SliderRow label="n" value={n} min={2} max={8} step={1} onChange={setN} /> : null}
        <p className="text-xs text-[var(--fg-muted)]">{vLab.dragVectors}</p>
      </ControlsStack>
    </VizPanel>
  );
}
