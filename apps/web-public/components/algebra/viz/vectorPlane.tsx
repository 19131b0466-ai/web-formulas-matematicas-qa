'use client';

import { useRef } from 'react';
import { present } from './formatNumber';
import { clamp, norm, type Vec2 } from './math2d';

export { present };

export const VEC_W = 420;
export const VEC_H = 320;

export const COLOR_U = 'var(--accent-strong)';
export const COLOR_V = 'teal';
export const COLOR_W = 'orange';

export function formatPair(x: number, y: number, d = 2): string {
  return `(${present(x, d)}, ${present(y, d)})`;
}

export function formatTuple(vals: number[], d = 2): string {
  return `(${vals.map((v) => present(v, d)).join(', ')})`;
}

export function clampVec(p: Vec2, lim: number): Vec2 {
  return {
    x: clamp(p.x, -lim, lim),
    y: clamp(p.y, -lim, lim),
  };
}

export function useVecDrag(set: (v: Vec2) => void, scalePx: number, origin: Vec2) {
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

/** Auto scale keeping 1:1 aspect, origin centered, margin around content. */
export function autoScale(maxAbs: number, size: number, marginPx = 48, minS = 28, maxS = 56): number {
  const reach = Math.max(1.2, maxAbs);
  return clamp((size / 2 - marginPx) / reach, minS, maxS);
}

export function angleBetween(u: Vec2, v: Vec2): number {
  const nu = norm(u);
  const nv = norm(v);
  if (nu < 1e-9 || nv < 1e-9) return NaN;
  const c = clamp(dotSafe(u, v) / (nu * nv), -1, 1);
  return Math.acos(c);
}

function dotSafe(a: Vec2, b: Vec2): number {
  return a.x * b.x + a.y * b.y;
}

export function atan2Vec(p: Vec2): number {
  return Math.atan2(p.y, p.x);
}

/** Minor arc path from angle a0 to a1 (radians), counterclockwise if a1>a0 after unwrap. */
export function minorArcPath(
  ox: number,
  oy: number,
  S: number,
  r: number,
  a0: number,
  a1: number,
): string {
  let d = a1 - a0;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  const steps = Math.max(10, Math.ceil((Math.abs(d) * 28) / Math.PI));
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = a0 + (d * i) / steps;
    const x = ox + r * Math.cos(t) * S;
    const y = oy - r * Math.sin(t) * S;
    pts.push(`${i === 0 ? 'M' : 'L'}${x},${y}`);
  }
  return pts.join(' ');
}

export function sectorPath(
  ox: number,
  oy: number,
  S: number,
  r: number,
  a0: number,
  a1: number,
): string {
  let d = a1 - a0;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  const steps = Math.max(10, Math.ceil((Math.abs(d) * 28) / Math.PI));
  const pts: string[] = [`M${ox},${oy}`];
  for (let i = 0; i <= steps; i++) {
    const t = a0 + (d * i) / steps;
    const x = ox + r * Math.cos(t) * S;
    const y = oy - r * Math.sin(t) * S;
    pts.push(`L${x},${y}`);
  }
  pts.push('Z');
  return pts.join(' ');
}

export function labelOffset(p: Vec2, tip: { x: number; y: number }, ox: number, oy: number, pad = 14) {
  const dx = tip.x - ox;
  const dy = tip.y - oy;
  const len = Math.hypot(dx, dy) || 1;
  return {
    x: tip.x + (dx / len) * pad,
    y: tip.y + (dy / len) * pad,
  };
}

export function Axes({
  W,
  H,
  ox,
  oy,
  S,
  ticks = [-4, -2, 2, 4],
  xLabel = 'e₁',
  yLabel = 'e₂',
}: {
  W: number;
  H: number;
  ox: number;
  oy: number;
  S: number;
  ticks?: number[];
  xLabel?: string;
  yLabel?: string;
}) {
  return (
    <g aria-hidden>
      <line x1={20} y1={oy} x2={W - 20} y2={oy} stroke="currentColor" opacity={0.28} />
      <line x1={ox} y1={16} x2={ox} y2={H - 16} stroke="currentColor" opacity={0.28} />
      <text x={W - 28} y={oy - 8} fontSize={11} opacity={0.55}>
        {xLabel}
      </text>
      <text x={ox + 8} y={22} fontSize={11} opacity={0.55}>
        {yLabel}
      </text>
      {ticks.map((t) => {
        const px = ox + t * S;
        const py = oy - t * S;
        return (
          <g key={t}>
            {Math.abs(px - ox) > 8 && px > 24 && px < W - 24 ? (
              <text x={px} y={oy + 14} textAnchor="middle" fontSize={9} opacity={0.4}>
                {t}
              </text>
            ) : null}
            {Math.abs(py - oy) > 8 && py > 24 && py < H - 24 ? (
              <text x={ox - 8} y={py + 3} textAnchor="end" fontSize={9} opacity={0.4}>
                {t}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

export function ArrowMarker({ id, color }: { id: string; color: string }) {
  return (
    <marker id={id} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L6,3 L0,6 Z" fill={color} />
    </marker>
  );
}
