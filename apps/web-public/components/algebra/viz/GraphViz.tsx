'use client';

import { useMemo, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel, fmt } from './controls';
import { linspace } from './math2d';

type Props = { formulaId: string; idea?: string };

export function GraphViz({ formulaId, idea }: Props) {
  const [a, setA] = useState(1);
  const [b, setB] = useState(-1);
  const [c, setC] = useState(-2);
  const [m, setM] = useState(1.2);
  const [r, setR] = useState(0.6);
  const [base, setBase] = useState(2);
  const [terms, setTerms] = useState(12);

  const W = 480;
  const H = 280;
  const ox = W / 2;
  const oy = H / 2 + 10;
  const S = 28;
  const to = (x: number, y: number) => ({ x: ox + x * S, y: oy - y * S });

  const path = useMemo(() => {
    const xs = linspace(-7, 7, 160);
    let ys: number[];
    if (/EQU-001|FUN-005|SIS-001/.test(formulaId)) {
      ys = xs.map((x) => m * x + b);
    } else if (/EQU-003|EQU-004|INE-002/.test(formulaId)) {
      ys = xs.map((x) => a * x * x + b * x + c);
    } else if (/LOG-001|LOG-007/.test(formulaId)) {
      const k = formulaId.includes('LOG-007') ? b : Math.log(Math.max(base, 1.05));
      ys = xs.map((x) => (formulaId.includes('LOG-007') ? a * Math.exp(k * x) : base ** x));
    } else if (/LOG-002|FUN-003/.test(formulaId)) {
      ys = xs.map((x) => (x > 0.05 ? Math.log(x) / Math.log(Math.max(base, 1.05)) : NaN));
    } else if (/SEC-/.test(formulaId)) {
      return '';
    } else if (/FUN-001/.test(formulaId)) {
      ys = xs.map((x) => (x === 0 ? NaN : 1 / x));
    } else if (/FUN-006/.test(formulaId)) {
      ys = xs.map((x) => m * x + b);
    } else if (/POL-010/.test(formulaId)) {
      ys = xs.map((x) => a * x * x + c);
    } else {
      ys = xs.map((x) => a * x + b);
    }
    const pts = xs
      .map((x, i) => ({ x, y: ys[i]! }))
      .filter((p) => Number.isFinite(p.y) && Math.abs(p.y) < 10)
      .map((p) => to(p.x, p.y));
    if (!pts.length) return '';
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  }, [formulaId, a, b, c, m, base]);

  const disc = b * b - 4 * a * c;
  const seqPoints = useMemo(() => {
    if (!/SEC-/.test(formulaId)) return [] as Array<{ n: number; y: number }>;
    return Array.from({ length: terms }, (_, i) => {
      const n = i;
      if (formulaId.includes('SEC-003') || formulaId.includes('SEC-005')) {
        return { n, y: a * r ** n };
      }
      if (formulaId.includes('SEC-007')) {
        // simple recurrence demo
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
  }, [formulaId, a, b, c, r, terms]);

  const path2 = useMemo(() => {
    if (!/FUN-003|LOG-002|FUN-006|SIS-001/.test(formulaId)) return '';
    const xs = linspace(-7, 7, 120);
    let ys: number[];
    if (/FUN-003|LOG-002/.test(formulaId)) ys = xs.map((x) => base ** x);
    else if (/FUN-006/.test(formulaId)) ys = xs.map((x) => (-1 / (m || 1)) * x + c);
    else ys = xs.map((x) => (-0.5) * x + 2);
    const pts = xs
      .map((x, i) => ({ x, y: ys[i]! }))
      .filter((p) => Number.isFinite(p.y) && Math.abs(p.y) < 10)
      .map((p) => to(p.x, p.y));
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  }, [formulaId, base, m, c]);

  return (
    <VizPanel
      caption={
        /EQU-003|EQU-004/.test(formulaId)
          ? `${idea ?? ''} · Δ = ${fmt(disc)} (${disc > 0 ? '2 raíces' : disc === 0 ? '1 raíz' : 'sin raíz real'})`
          : idea
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img">
        <line x1={20} y1={oy} x2={W - 20} y2={oy} stroke="currentColor" opacity={0.25} />
        <line x1={ox} y1={20} x2={ox} y2={H - 20} stroke="currentColor" opacity={0.25} />
        {/FUN-003|LOG-002/.test(formulaId) ? (
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
        {path ? <path d={path} fill="none" stroke="var(--accent-strong)" strokeWidth={2.5} /> : null}
        {path2 ? <path d={path2} fill="none" stroke="teal" strokeWidth={2} /> : null}
        {seqPoints.map((p) => {
          const pt = to(p.n * 0.55 - 3, p.y);
          return <circle key={p.n} cx={pt.x} cy={pt.y} r={4} fill="var(--accent-strong)" />;
        })}
      </svg>
      <ControlsStack>
        {/EQU-003|EQU-004|INE-002|POL-010|LOG-007/.test(formulaId) ? (
          <SliderRow label="a" value={a} min={-3} max={3} step={0.1} onChange={(v) => setA(v === 0 ? 0.1 : v)} />
        ) : null}
        {/EQU-001|FUN-005|FUN-006|SIS-001|SEC-001|SEC-007/.test(formulaId) ? (
          <SliderRow label={/SEC-/.test(formulaId) ? 'a₁' : 'm'} value={/SEC-/.test(formulaId) ? a : m} min={-3} max={3} step={0.1} onChange={/SEC-/.test(formulaId) ? setA : setM} />
        ) : null}
        <SliderRow label={/SEC-001/.test(formulaId) ? 'd' : /SEC-003|SEC-005/.test(formulaId) ? 'r' : 'b'} value={/SEC-003|SEC-005/.test(formulaId) ? r : b} min={-3} max={3} step={0.05} onChange={/SEC-003|SEC-005/.test(formulaId) ? setR : setB} />
        {/EQU-003|EQU-004|INE-002|FUN-006|SEC-007/.test(formulaId) ? (
          <SliderRow label="c" value={c} min={-5} max={5} step={0.1} onChange={setC} />
        ) : null}
        {/LOG-001|LOG-002|FUN-003/.test(formulaId) ? (
          <SliderRow label="base" value={base} min={1.1} max={5} step={0.1} onChange={setBase} />
        ) : null}
        {/SEC-/.test(formulaId) ? (
          <SliderRow label="n" value={terms} min={4} max={24} step={1} onChange={setTerms} />
        ) : null}
      </ControlsStack>
    </VizPanel>
  );
}
