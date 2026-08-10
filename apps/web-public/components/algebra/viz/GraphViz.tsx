'use client';

import { useMemo, useState } from 'react';
import { useVizLabels } from '@/lib/viz-labels';
import type { GraphMode } from '@/lib/viz-modes';
import { ControlsStack, SliderRow, VizPanel, fmt, joinCaption } from './controls';
import { linspace } from './math2d';

type Props = { formulaId: string; idea?: string; mode?: string };

export function GraphViz({ formulaId, mode: modeProp }: Props) {
  const v = useVizLabels();
  const mode = (modeProp ?? 'line') as GraphMode;
  const [a, setA] = useState(1);
  const [b, setB] = useState(-1);
  const [c, setC] = useState(-2);
  const [m, setM] = useState(1.2);
  const [m2, setM2] = useState(-0.5);
  const [b2, setB2] = useState(2);
  const [r, setR] = useState(0.6);
  const [base, setBase] = useState(2);
  const [terms, setTerms] = useState(12);

  const W = 480;
  const H = 280;
  const ox = W / 2;
  const oy = H / 2 + 10;
  const S = 28;
  const to = (x: number, y: number) => ({ x: ox + x * S, y: oy - y * S });

  const disc = b * b - 4 * a * c;
  const roots = useMemo(() => {
    if (mode !== 'quadratic' && mode !== 'inequality') return [] as number[];
    if (Math.abs(a) < 1e-9) return [];
    if (disc < 0) return [];
    if (disc === 0) return [-b / (2 * a)];
    const s = Math.sqrt(disc);
    return [(-b - s) / (2 * a), (-b + s) / (2 * a)];
  }, [mode, a, b, disc]);

  const path = useMemo(() => {
    const xs = linspace(-7, 7, 160);
    let ys: number[];
    if (mode === 'line' || mode === 'system') {
      ys = xs.map((x) => m * x + b);
    } else if (mode === 'quadratic' || mode === 'inequality') {
      ys = xs.map((x) => a * x * x + b * x + c);
    } else if (mode === 'exp') {
      const k = formulaId.includes('LOG-007') ? b : Math.log(Math.max(base, 1.05));
      ys = xs.map((x) => (formulaId.includes('LOG-007') ? a * Math.exp(k * x) : base ** x));
    } else if (mode === 'log' || mode === 'inverse_pair') {
      ys = xs.map((x) => (x > 0.05 ? Math.log(x) / Math.log(Math.max(base, 1.05)) : NaN));
    } else if (mode === 'reciprocal') {
      ys = xs.map((x) => (Math.abs(x) < 0.08 ? NaN : 1 / x));
    } else if (mode === 'sequence') {
      return '';
    } else {
      ys = xs.map((x) => a * x + b);
    }
    const pts = xs
      .map((x, i) => ({ x, y: ys[i]! }))
      .filter((p) => Number.isFinite(p.y) && Math.abs(p.y) < 10)
      .map((p) => to(p.x, p.y));
    if (!pts.length) return '';
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  }, [mode, formulaId, a, b, c, m, base]);

  const shadePath = useMemo(() => {
    if (mode !== 'inequality') return '';
    const xs = linspace(-7, 7, 80);
    const above = a >= 0; // simple: shade where y_curve >= 0 region for ax²+bx+c ≥ 0 when a>0 outside roots
    const pts: Array<{ x: number; y: number }> = [];
    for (const x of xs) {
      const y = a * x * x + b * x + c;
      if (y >= 0 === above || y >= 0) {
        // shade between curve and x-axis for solution of f(x)≥0
        if (y >= 0) pts.push({ x, y });
      }
    }
    if (pts.length < 2) return '';
    const top = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${to(p.x, p.y).x},${to(p.x, p.y).y}`).join(' ');
    const bottom = [...pts]
      .reverse()
      .map((p) => `L${to(p.x, 0).x},${to(p.x, 0).y}`)
      .join(' ');
    return `${top} ${bottom} Z`;
  }, [mode, a, b, c]);

  const seqPoints = useMemo(() => {
    if (mode !== 'sequence') return [] as Array<{ n: number; y: number }>;
    return Array.from({ length: terms }, (_, i) => {
      const n = i;
      if (formulaId.includes('SEC-003') || formulaId.includes('SEC-005')) {
        return { n, y: a * r ** n };
      }
      if (formulaId.includes('SEC-007')) {
        let p0 = a;
        let p1 = b;
        for (let k = 2; k <= n; k++) {
          const next = c * p1 + r * p0;
          p0 = p1;
          p1 = next;
        }
        return { n, y: n === 0 ? a : n === 1 ? b : p1 };
      }
      return { n, y: a + n * b };
    });
  }, [mode, formulaId, a, b, c, r, terms]);

  const path2 = useMemo(() => {
    if (mode !== 'inverse_pair' && mode !== 'system' && !/FUN-006/.test(formulaId)) return '';
    const xs = linspace(-7, 7, 120);
    let ys: number[];
    if (mode === 'inverse_pair') ys = xs.map((x) => base ** x);
    else if (/FUN-006/.test(formulaId)) ys = xs.map((x) => (-1 / (m || 1)) * x + c);
    else ys = xs.map((x) => m2 * x + b2);
    const pts = xs
      .map((x, i) => ({ x, y: ys[i]! }))
      .filter((p) => Number.isFinite(p.y) && Math.abs(p.y) < 10)
      .map((p) => to(p.x, p.y));
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  }, [mode, formulaId, base, m, c, m2, b2]);

  const intersection = useMemo(() => {
    if (mode !== 'system') return null;
    if (Math.abs(m - m2) < 1e-9) return Math.abs(b - b2) < 1e-9 ? 'infinite' : 'none';
    const x = (b2 - b) / (m - m2);
    const y = m * x + b;
    return { x, y };
  }, [mode, m, b, m2, b2]);

  const caption =
    mode === 'quadratic'
      ? joinCaption(`Δ = ${fmt(disc)} (${disc > 0 ? v.roots2 : disc === 0 ? v.root1 : v.noRealRoot})`)
      : mode === 'system'
        ? joinCaption(
            intersection === 'none'
              ? v.noIntersection
              : intersection === 'infinite'
                ? '∞'
                : `${v.intersection} (${fmt((intersection as { x: number }).x)}, ${fmt((intersection as { y: number }).y)})`,
          )
        : mode === 'inequality'
          ? joinCaption(v.solutionRegion)
          : undefined;

  return (
    <VizPanel caption={caption}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img">
        <line x1={20} y1={oy} x2={W - 20} y2={oy} stroke="currentColor" opacity={0.25} />
        <line x1={ox} y1={20} x2={ox} y2={H - 20} stroke="currentColor" opacity={0.25} />
        {mode === 'inverse_pair' ? (
          <line
            x1={to(-5, -5).x}
            y1={to(-5, -5).y}
            x2={to(5, 5).x}
            y2={to(5, 5).y}
            stroke="currentColor"
            strokeDasharray="4 3"
            opacity={0.4}
          />
        ) : null}
        {shadePath ? <path d={shadePath} fill="var(--accent-soft)" opacity={0.55} stroke="none" /> : null}
        {path ? <path d={path} fill="none" stroke="var(--accent-strong)" strokeWidth={2.5} /> : null}
        {path2 ? <path d={path2} fill="none" stroke="teal" strokeWidth={2} /> : null}
        {roots.map((rx) => {
          const p = to(rx, 0);
          return <circle key={rx} cx={p.x} cy={p.y} r={6} fill="orange" />;
        })}
        {intersection && typeof intersection === 'object' ? (
          <circle cx={to(intersection.x, intersection.y).x} cy={to(intersection.x, intersection.y).y} r={6} fill="orange" />
        ) : null}
        {seqPoints.map((p) => {
          const pt = to(p.n * 0.55 - 3, p.y);
          return <circle key={p.n} cx={pt.x} cy={pt.y} r={4} fill="var(--accent-strong)" />;
        })}
      </svg>
      <ControlsStack>
        {mode === 'quadratic' || mode === 'inequality' || /POL-010|LOG-007/.test(formulaId) ? (
          <SliderRow label="a" value={a} min={-3} max={3} step={0.1} onChange={(val) => setA(val === 0 ? 0.1 : val)} />
        ) : null}
        {mode === 'line' || mode === 'system' || /FUN-006|SEC-001|SEC-007/.test(formulaId) ? (
          <SliderRow
            label={/SEC-/.test(formulaId) ? 'a₁' : mode === 'system' ? 'm₁' : 'm'}
            value={/SEC-/.test(formulaId) ? a : m}
            min={-3}
            max={3}
            step={0.1}
            onChange={/SEC-/.test(formulaId) ? setA : setM}
          />
        ) : null}
        <SliderRow
          label={
            /SEC-001/.test(formulaId)
              ? 'd'
              : /SEC-003|SEC-005/.test(formulaId)
                ? 'r'
                : mode === 'system'
                  ? 'b₁'
                  : 'b'
          }
          value={/SEC-003|SEC-005/.test(formulaId) ? r : b}
          min={-3}
          max={3}
          step={0.05}
          onChange={/SEC-003|SEC-005/.test(formulaId) ? setR : setB}
        />
        {mode === 'system' ? (
          <>
            <SliderRow label="m₂" value={m2} min={-3} max={3} step={0.1} onChange={setM2} />
            <SliderRow label="b₂" value={b2} min={-3} max={3} step={0.1} onChange={setB2} />
          </>
        ) : null}
        {mode === 'quadratic' || mode === 'inequality' || /FUN-006|SEC-007/.test(formulaId) ? (
          <SliderRow label="c" value={c} min={-5} max={5} step={0.1} onChange={setC} />
        ) : null}
        {mode === 'exp' || mode === 'log' || mode === 'inverse_pair' ? (
          <SliderRow label="base" value={base} min={1.1} max={5} step={0.1} onChange={setBase} />
        ) : null}
        {mode === 'sequence' ? <SliderRow label="n" value={terms} min={4} max={24} step={1} onChange={setTerms} /> : null}
      </ControlsStack>
    </VizPanel>
  );
}
