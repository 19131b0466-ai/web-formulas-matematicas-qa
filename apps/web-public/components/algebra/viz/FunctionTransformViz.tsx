'use client';

import { useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from './controls';
import { linspace } from './math2d';

type Props = { formulaId: string; idea?: string };

export function FunctionTransformViz({ formulaId }: Props) {
  const [h, setH] = useState(1);
  const [k, setK] = useState(0.5);
  const [a, setA] = useState(1);
  const [b, setB] = useState(1);
  const [x0, setX0] = useState(1.2);
  // FUN-002: compose stage 0=x, 1=g(x), 2=f(g(x))
  const [composeStage, setComposeStage] = useState(0);

  const W = 460;
  const H = 280;
  const ox = W / 2;
  const oy = H / 2 + 10;
  const S = 28;
  const to = (x: number, y: number) => ({ x: ox + x * S, y: oy - y * S });

  const base = (x: number) => Math.sin(x);
  const gFn = (x: number) => x / 2;

  const isFun007 = /FUN-007/.test(formulaId);
  const isFun008 = /FUN-008/.test(formulaId);
  const isFun002 = formulaId.includes('FUN-002');
  const showFadedBase = isFun007 || isFun008;

  // Faded base path (plain sin(x))
  const basePath = useMemo(() => {
    if (!showFadedBase) return '';
    const xs = linspace(-6, 6, 180);
    const pts = xs
      .map((x) => to(x, base(x)))
      .filter((p) => p.y > -20 && p.y < H + 20);
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  }, [showFadedBase, H]);

  // Transformed path
  const path = useMemo(() => {
    const xs = linspace(-6, 6, 180);
    const pts = xs
      .map((x) => {
        const xx = b * (x - (isFun007 ? h : 0));
        let y = a * base(xx);
        if (isFun007) y += k;
        return to(x, y);
      })
      .filter((p) => p.y > -20 && p.y < H + 20);
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  }, [formulaId, h, k, a, b, isFun007, H]);

  // FUN-002 composition values at x0
  const gx0 = gFn(x0);
  const fgx0 = a * base(b * gx0);

  return (
    <VizPanel>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img">
        <line x1={20} y1={oy} x2={W - 20} y2={oy} stroke="currentColor" opacity={0.25} />
        <line x1={ox} y1={20} x2={ox} y2={H - 20} stroke="currentColor" opacity={0.25} />
        {/* Faded base sin(x) for FUN-007 / FUN-008 */}
        {showFadedBase && basePath ? (
          <path d={basePath} fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.25} strokeDasharray="4 3" />
        ) : null}
        {/* Transformed path */}
        {path ? <path d={path} fill="none" stroke="var(--accent-strong)" strokeWidth={2.5} /> : null}
        {/* FUN-002 stage markers */}
        {isFun002 ? (
          <>
            {/* x0 marker */}
            <circle cx={to(x0, 0).x} cy={to(x0, 0).y} r={5} fill="var(--accent-strong)" />
            <text x={to(x0, 0).x + 4} y={to(x0, 0).y - 6} fontSize={11} fill="currentColor">
              x={x0.toFixed(2)}
            </text>
            {composeStage >= 1 ? (
              <>
                {/* g(x0) on x-axis */}
                <circle cx={to(gx0, 0).x} cy={to(gx0, 0).y} r={5} fill="teal" />
                <text x={to(gx0, 0).x + 4} y={to(gx0, 0).y - 6} fontSize={11} fill="currentColor">
                  g(x)={gx0.toFixed(2)}
                </text>
                {/* line from x0 to g(x0) on axis */}
                <line
                  x1={to(x0, 0).x}
                  y1={to(x0, 0).y}
                  x2={to(gx0, 0).x}
                  y2={to(gx0, 0).y}
                  stroke="teal"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                />
              </>
            ) : null}
            {composeStage >= 2 ? (
              <>
                {/* f(g(x0)) on curve */}
                <circle cx={to(gx0, fgx0).x} cy={to(gx0, fgx0).y} r={5} fill="orange" />
                <text x={to(gx0, fgx0).x + 4} y={to(gx0, fgx0).y - 6} fontSize={11} fill="currentColor">
                  f∘g={fgx0.toFixed(2)}
                </text>
                {/* vertical line from g(x0) axis to f(g(x0)) */}
                <line
                  x1={to(gx0, 0).x}
                  y1={to(gx0, 0).y}
                  x2={to(gx0, fgx0).x}
                  y2={to(gx0, fgx0).y}
                  stroke="orange"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                />
              </>
            ) : null}
            {/* Stage label */}
            <text x={20} y={24} fontSize={12} fill="currentColor">
              {composeStage === 0 ? `x = ${x0.toFixed(2)}` : composeStage === 1 ? `g(x) = x/2 = ${gx0.toFixed(2)}` : `f(g(x)) = ${fgx0.toFixed(2)}`}
            </text>
          </>
        ) : null}
        {/* FUN-007/008 label */}
        {showFadedBase ? (
          <text x={20} y={24} fontSize={11} fill="currentColor" opacity={0.7}>
            — — sin(x) &nbsp;&nbsp; — transformed
          </text>
        ) : null}
      </svg>
      <ControlsStack>
        {isFun007 ? (
          <>
            <SliderRow label="h" value={h} min={-3} max={3} step={0.1} onChange={setH} />
            <SliderRow label="k" value={k} min={-2} max={2} step={0.1} onChange={setK} />
          </>
        ) : null}
        {isFun008 ? (
          <>
            <SliderRow label="a" value={a} min={-2} max={2} step={0.1} onChange={setA} />
            <SliderRow label="b" value={b} min={0.2} max={3} step={0.1} onChange={setB} />
          </>
        ) : null}
        {isFun002 ? (
          <>
            <SliderRow label="x" value={x0} min={-3} max={3} step={0.1} onChange={setX0} />
            <ButtonRow>
              <VizButton active={composeStage === 0} onClick={() => setComposeStage(0)}>x</VizButton>
              <VizButton active={composeStage === 1} onClick={() => setComposeStage(1)}>g(x)</VizButton>
              <VizButton active={composeStage === 2} onClick={() => setComposeStage(2)}>f∘g</VizButton>
            </ButtonRow>
          </>
        ) : null}
        {/* FUN-007 also shows a/b when also FUN-008 */}
        {isFun007 && !isFun008 ? (
          <>
            <SliderRow label="a" value={a} min={0.2} max={3} step={0.1} onChange={setA} />
            <SliderRow label="b" value={b} min={0.2} max={3} step={0.1} onChange={setB} />
          </>
        ) : null}
      </ControlsStack>
    </VizPanel>
  );
}
