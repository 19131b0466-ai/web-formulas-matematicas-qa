'use client';

import { useRef } from 'react';
import { fmt } from './controls';
import type { Vec2 } from './math2d';

export const COMPLEX_W = 420;
export const COMPLEX_H = 320;

export function present(n: number, d = 2): string {
  if (!Number.isFinite(n)) return '—';
  const r = Number(n.toFixed(d));
  if (Math.abs(r - Math.round(r)) < 1e-9 && Math.abs(r) < 1e6) return fmt(Math.round(r), 0);
  return fmt(r, d);
}

/** Format a+bi with correct signs and edge cases. */
export function formatComplex(a: number, b: number, d = 2): string {
  const aa = Number(a.toFixed(d));
  const bb = Number(b.toFixed(d));
  if (Math.abs(aa) < 1e-9 && Math.abs(bb) < 1e-9) return '0';
  if (Math.abs(bb) < 1e-9) return present(aa, d);
  if (Math.abs(aa) < 1e-9) {
    if (Math.abs(Math.abs(bb) - 1) < 1e-9) return bb > 0 ? 'i' : '−i';
    return `${bb < 0 ? '−' : ''}${present(Math.abs(bb), d)}i`;
  }
  const imagMag = Math.abs(Math.abs(bb) - 1) < 1e-9 ? '' : present(Math.abs(bb), d);
  return `${present(aa, d)}${bb >= 0 ? '+' : '−'}${imagMag}i`;
}

export function radToDeg(t: number): number {
  return (t * 180) / Math.PI;
}

export function degToRad(d: number): number {
  return (d * Math.PI) / 180;
}

export function formatAngle(theta: number, degrees: boolean, d = 2): string {
  if (degrees) return `${present(radToDeg(theta), d)}°`;
  // nice fractions of π
  const turns = theta / Math.PI;
  const candidates: Array<[number, string]> = [
    [0, '0'],
    [1 / 6, 'π/6'],
    [1 / 4, 'π/4'],
    [1 / 3, 'π/3'],
    [1 / 2, 'π/2'],
    [2 / 3, '2π/3'],
    [3 / 4, '3π/4'],
    [5 / 6, '5π/6'],
    [1, 'π'],
    [7 / 6, '7π/6'],
    [5 / 4, '5π/4'],
    [4 / 3, '4π/3'],
    [3 / 2, '3π/2'],
    [5 / 3, '5π/3'],
    [7 / 4, '7π/4'],
    [11 / 6, '11π/6'],
    [2, '2π'],
  ];
  for (const [v, s] of candidates) {
    if (Math.abs(turns - v) < 0.02) return s;
  }
  return `${present(theta, d)} rad`;
}

export function snap(v: number, min: number, max: number, step: number): number {
  const c = Math.min(max, Math.max(min, v));
  const s = min + Math.round((c - min) / step) * step;
  return Number(s.toFixed(4));
}

export function clampVec(p: Vec2, lim: number): Vec2 {
  return {
    x: Math.min(lim, Math.max(-lim, p.x)),
    y: Math.min(lim, Math.max(-lim, p.y)),
  };
}

/** SVG arc from angle a0 to a1 (radians), radius r in world units. */
export function polarArc(
  ox: number,
  oy: number,
  S: number,
  r: number,
  a0: number,
  a1: number,
): string {
  const steps = Math.max(8, Math.ceil((Math.abs(a1 - a0) * 24) / Math.PI));
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = a0 + ((a1 - a0) * i) / steps;
    const x = ox + r * Math.cos(t) * S;
    const y = oy - r * Math.sin(t) * S;
    pts.push(`${i === 0 ? 'M' : 'L'}${x},${y}`);
  }
  return pts.join(' ');
}

export function useComplexDrag(set: (v: Vec2) => void, scalePx: number, origin: Vec2) {
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
