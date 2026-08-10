'use client';

import { useMemo, useState } from 'react';
import { useVizLabels } from '@/lib/viz-labels';
import type { GraphMode } from '@/lib/viz-modes';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt, joinCaption } from './controls';
import { linspace } from './math2d';
import { LinearEquationViz } from './LinearEquationViz';
import { QuadraticFormulaViz } from './QuadraticFormulaViz';

type Props = { formulaId: string; idea?: string; mode?: string };

export function GraphViz({ formulaId, mode: modeProp }: Props) {
  if (formulaId.includes('EQU-001')) {
    return <LinearEquationViz />;
  }
  if (formulaId.includes('EQU-003')) {
    return <QuadraticFormulaViz />;
  }
  return <GraphVizInner formulaId={formulaId} mode={modeProp} />;
}

function GraphVizInner({ formulaId, mode: modeProp }: Props) {
  const v = useVizLabels();
  const mode = (modeProp ?? 'line') as GraphMode;
  const [a, setA] = useState(1);
  const [b, setB] = useState(-1);
  const [c, setC] = useState(-2);
  const [m, setM] = useState(1.2);
  const [m2, setM2] = useState(-0.5);
  const [b2, setB2] = useState(2);
  const [a2, setA2] = useState(-0.4);
  const [c2, setC2] = useState(1.5);
  const [r, setR] = useState(0.6);
  const [base, setBase] = useState(2);
  const [terms, setTerms] = useState(12);
  const [geq, setGeq] = useState(true);

  const W = 480;
  const H = 280;
  const ox = W / 2;
  const oy = H / 2 + 10;
  const S = 28;
  const to = (x: number, y: number) => ({ x: ox + x * S, y: oy - y * S });

  // Prevent m=0 for line mode
  const safeM = Math.abs(m) < 0.05 ? (m >= 0 ? 0.05 : -0.05) : m;

  const disc = b * b - 4 * a * c;
  const roots = useMemo(() => {
    if (mode !== 'quadratic' && mode !== 'inequality' && mode !== 'poly_system') return [] as number[];
    if (Math.abs(a) < 1e-9) return [];
    if (disc < 0) return [];
    if (disc === 0) return [-b / (2 * a)];
    const s = Math.sqrt(disc);
    return [(-b - s) / (2 * a), (-b + s) / (2 * a)];
  }, [mode, a, b, disc]);

  // x-intercept for line mode: y=mx+b → x = -b/m
  const xIntercept = useMemo(() => {
    if (mode !== 'line') return null;
    return -b / safeM;
  }, [mode, b, safeM]);

  // poly_system: intersections of y=a x²+b x+c and y=a₂ x²+b₂ x+c₂
  // → (a-a₂)x² + (b-b₂)x + (c-c₂) = 0
  const polySystemRoots = useMemo(() => {
    if (mode !== 'poly_system') return [] as number[];
    const A = a - a2;
    const B = b - b2;
    const C = c - c2;
    if (Math.abs(A) < 1e-9) {
      if (Math.abs(B) < 1e-9) return [];
      return [-C / B];
    }
    const D = B * B - 4 * A * C;
    if (D < 0) return [];
    if (D === 0) return [-B / (2 * A)];
    const sq = Math.sqrt(D);
    return [(-B - sq) / (2 * A), (-B + sq) / (2 * A)];
  }, [mode, a, b, c, a2, b2, c2]);

  const path = useMemo(() => {
    const xs = linspace(-7, 7, 160);
    let ys: number[];
    if (mode === 'line') {
      ys = xs.map((x) => safeM * x + b);
    } else if (mode === 'system') {
      ys = xs.map((x) => m * x + b);
    } else if (mode === 'quadratic' || mode === 'inequality' || mode === 'poly_system') {
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
  }, [mode, formulaId, a, b, c, m, safeM, base]);

  // Shading for inequality: respect geq toggle
  const shadePath = useMemo(() => {
    if (mode !== 'inequality') return '';
    const xs = linspace(-7, 7, 80);
    const pts: Array<{ x: number; y: number }> = [];
    for (const x of xs) {
      const y = a * x * x + b * x + c;
      if (geq ? y >= 0 : y <= 0) {
        pts.push({ x, y: geq ? y : y });
      }
    }
    if (pts.length < 2) return '';
    const sign = geq ? 1 : -1;
    const filtered = pts.filter((p) => sign * p.y >= 0);
    if (filtered.length < 2) return '';
    const top = filtered.map((p, i) => `${i === 0 ? 'M' : 'L'}${to(p.x, p.y).x},${to(p.x, p.y).y}`).join(' ');
    const bottom = [...filtered]
      .reverse()
      .map((p) => `L${to(p.x, 0).x},${to(p.x, 0).y}`)
      .join(' ');
    return `${top} ${bottom} Z`;
  }, [mode, a, b, c, geq]);

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

  // Geometric partial sums for SEC-005
  const sumPoints = useMemo(() => {
    if (mode !== 'sequence' || !formulaId.includes('SEC-005')) return [] as Array<{ n: number; y: number }>;
    return Array.from({ length: terms }, (_, n) => {
      if (Math.abs(r - 1) < 1e-9) return { n, y: a * (n + 1) };
      return { n, y: a * (1 - r ** (n + 1)) / (1 - r) };
    });
  }, [mode, formulaId, a, r, terms]);

  const geomLimit = useMemo(() => {
    if (!formulaId.includes('SEC-005') || Math.abs(r) >= 1) return null;
    return a / (1 - r);
  }, [formulaId, a, r]);

  // FUN-006: perpendicular slope
  const perpSlope = -(1 / safeM);
  const isFun006 = /FUN-006/.test(formulaId);

  const path2 = useMemo(() => {
    if (mode !== 'inverse_pair' && mode !== 'system' && mode !== 'poly_system' && !isFun006) return '';
    const xs = linspace(-7, 7, 120);
    let ys: number[];
    if (mode === 'inverse_pair') ys = xs.map((x) => base ** x);
    else if (isFun006) ys = xs.map((x) => m2 * x + c);
    else if (mode === 'poly_system') ys = xs.map((x) => a2 * x * x + b2 * x + c2);
    else ys = xs.map((x) => m2 * x + b2);
    const pts = xs
      .map((x, i) => ({ x, y: ys[i]! }))
      .filter((p) => Number.isFinite(p.y) && Math.abs(p.y) < 10)
      .map((p) => to(p.x, p.y));
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  }, [mode, formulaId, base, m, safeM, c, m2, b2, a2, c2, isFun006]);

  const intersection = useMemo(() => {
    if (mode !== 'system') return null;
    if (Math.abs(m - m2) < 1e-9) return Math.abs(b - b2) < 1e-9 ? 'infinite' : 'none';
    const x = (b2 - b) / (m - m2);
    const y = m * x + b;
    return { x, y };
  }, [mode, m, b, m2, b2]);

  // FUN-006: parallel / perpendicular status
  const lineRelation = useMemo(() => {
    if (!isFun006) return '';
    if (Math.abs(safeM * m2 + 1) < 0.05) return '⊥ perpendicular';
    if (Math.abs(safeM - m2) < 0.05) return '∥ parallel';
    return `m₁·m₂ = ${fmt(safeM * m2)}`;
  }, [isFun006, safeM, m2]);

  const caption = useMemo(() => {
    if (mode === 'line') {
      const xInt = xIntercept;
      const parts: string[] = [];
      if (xInt !== null && Number.isFinite(xInt)) parts.push(`x-int: ${fmt(xInt)}`);
      if (isFun006) parts.push(lineRelation);
      return joinCaption(...parts);
    }
    if (mode === 'quadratic')
      return joinCaption(`Δ = ${fmt(disc)} (${disc > 0 ? v.roots2 : disc === 0 ? v.root1 : v.noRealRoot})`);
    if (mode === 'poly_system') {
      if (polySystemRoots.length === 0) return joinCaption(v.noRealRoot);
      return joinCaption(polySystemRoots.map((rx) => `x≈${fmt(rx)}`).join(', '));
    }
    if (mode === 'system')
      return joinCaption(
        intersection === 'none'
          ? v.noIntersection
          : intersection === 'infinite'
            ? '∞'
            : `${v.intersection} (${fmt((intersection as { x: number }).x)}, ${fmt((intersection as { y: number }).y)})`,
      );
    if (mode === 'inequality')
      return joinCaption(`${geq ? 'f(x) ≥ 0' : 'f(x) ≤ 0'} · ${v.solutionRegion}`);
    if (mode === 'sequence' && formulaId.includes('SEC-005') && geomLimit !== null)
      return joinCaption(`S∞ = a/(1−r) = ${fmt(geomLimit)}`);
    return undefined;
  }, [
    mode,
    xIntercept,
    isFun006,
    lineRelation,
    disc,
    polySystemRoots,
    intersection,
    geq,
    formulaId,
    geomLimit,
    v.roots2,
    v.root1,
    v.noRealRoot,
    v.noIntersection,
    v.intersection,
    v.solutionRegion,
  ]);

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
        {/* x-intercept for line mode */}
        {mode === 'line' && xIntercept !== null && Number.isFinite(xIntercept) && Math.abs(xIntercept) <= 7 ? (
          <circle cx={to(xIntercept, 0).x} cy={to(xIntercept, 0).y} r={7} fill="orange" />
        ) : null}
        {/* Roots for quadratic / inequality */}
        {(mode === 'quadratic' || mode === 'inequality') && roots.map((rx) => {
          const p = to(rx, 0);
          return <circle key={rx} cx={p.x} cy={p.y} r={6} fill="orange" />;
        })}
        {/* System intersection */}
        {intersection && typeof intersection === 'object' ? (
          <circle cx={to(intersection.x, intersection.y).x} cy={to(intersection.x, intersection.y).y} r={6} fill="orange" />
        ) : null}
        {/* poly_system intersections */}
        {mode === 'poly_system' && polySystemRoots.map((rx) => {
          const ry = a * rx * rx + b * rx + c;
          const p = to(rx, ry);
          return <circle key={rx} cx={p.x} cy={p.y} r={6} fill="orange" />;
        })}
        {/* Sequence points */}
        {seqPoints.map((p) => {
          const pt = to(p.n * 0.55 - 3, p.y);
          return <circle key={`s-${p.n}`} cx={pt.x} cy={pt.y} r={4} fill="var(--accent-strong)" />;
        })}
        {/* Partial sums for SEC-005 */}
        {sumPoints.map((p) => {
          const pt = to(p.n * 0.55 - 3, p.y);
          return <circle key={`sum-${p.n}`} cx={pt.x} cy={pt.y} r={4} fill="orange" />;
        })}
        {/* Limit line for geometric series */}
        {geomLimit !== null && Math.abs(geomLimit) < 9 ? (
          <line
            x1={20}
            y1={to(0, geomLimit).y}
            x2={W - 20}
            y2={to(0, geomLimit).y}
            stroke="orange"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            opacity={0.7}
          />
        ) : null}
      </svg>
      <ControlsStack>
        {mode === 'quadratic' || mode === 'inequality' || mode === 'poly_system' || /LOG-007/.test(formulaId) ? (
          <SliderRow
            label={mode === 'poly_system' ? 'a₁' : 'a'}
            value={a}
            min={-3}
            max={3}
            step={0.1}
            onChange={(val) => setA(val === 0 ? 0.1 : val)}
          />
        ) : null}
        {mode === 'line' || mode === 'system' || /FUN-006|SEC-001|SEC-007/.test(formulaId) ? (
          <SliderRow
            label={/SEC-/.test(formulaId) ? 'a₁' : mode === 'system' ? 'm₁' : 'm'}
            value={/SEC-/.test(formulaId) ? a : m}
            min={-3}
            max={3}
            step={0.1}
            onChange={/SEC-/.test(formulaId) ? setA : (val) => setM(Math.abs(val) < 0.05 ? 0.05 : val)}
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
                  : mode === 'poly_system'
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
        {mode === 'poly_system' ? (
          <>
            <SliderRow label="a₂" value={a2} min={-3} max={3} step={0.1} onChange={(val) => setA2(val === 0 ? 0.1 : val)} />
            <SliderRow label="b₂" value={b2} min={-4} max={4} step={0.1} onChange={setB2} />
            <SliderRow label="c₂" value={c2} min={-5} max={5} step={0.1} onChange={setC2} />
          </>
        ) : null}
        {mode === 'quadratic' || mode === 'inequality' || mode === 'poly_system' || /FUN-006|SEC-007/.test(formulaId) ? (
          <SliderRow label={mode === 'poly_system' ? 'c₁' : 'c'} value={c} min={-5} max={5} step={0.1} onChange={setC} />
        ) : null}
        {mode === 'poly_system' ? (
          <p className="text-xs text-[var(--fg-muted)]">P: a₁x²+b₁x+c₁ · Q: a₂x²+b₂x+c₂</p>
        ) : null}
        {isFun006 ? (
          <>
            <SliderRow label="m₂" value={m2} min={-4} max={4} step={0.1} onChange={setM2} />
            <ButtonRow>
              <VizButton onClick={() => setM2(Math.round(perpSlope * 100) / 100)}>{v.makePerp}</VizButton>
            </ButtonRow>
          </>
        ) : null}
        {mode === 'exp' || mode === 'log' || mode === 'inverse_pair' ? (
          <SliderRow label="base" value={base} min={1.1} max={5} step={0.1} onChange={setBase} />
        ) : null}
        {mode === 'sequence' ? <SliderRow label="n" value={terms} min={4} max={24} step={1} onChange={setTerms} /> : null}
        {mode === 'inequality' ? (
          <ButtonRow>
            <VizButton active={geq} onClick={() => setGeq(true)}>f(x) ≥ 0</VizButton>
            <VizButton active={!geq} onClick={() => setGeq(false)}>f(x) ≤ 0</VizButton>
          </ButtonRow>
        ) : null}
      </ControlsStack>
    </VizPanel>
  );
}
