'use client';

import { useMemo, useState } from 'react';
import { useVizLabels } from '@/lib/viz-labels';
import { ControlsStack, SliderRow, ToggleRow, VizPanel } from './controls';
import { linspace } from './math2d';

type Props = { formulaId: string; idea?: string };

export function FunctionTransformViz({ formulaId, idea }: Props) {
  const v = useVizLabels();
  const [h, setH] = useState(1);
  const [k, setK] = useState(0.5);
  const [a, setA] = useState(1);
  const [b, setB] = useState(1);
  const [reflectX, setReflectX] = useState(false);
  const [x0, setX0] = useState(1.2);

  const W = 460;
  const H = 280;
  const ox = W / 2;
  const oy = H / 2 + 10;
  const S = 28;
  const to = (x: number, y: number) => ({ x: ox + x * S, y: oy - y * S });

  const base = (x: number) => Math.sin(x);

  const path = useMemo(() => {
    const xs = linspace(-6, 6, 180);
    const pts = xs
      .map((x) => {
        let xx = b * (x - (/FUN-007/.test(formulaId) ? h : 0));
        if (reflectX) xx = -xx;
        let y = a * base(xx);
        if (/FUN-007/.test(formulaId)) y += k;
        return to(x, y);
      })
      .filter((p) => p.y > -20 && p.y < H + 20);
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  }, [formulaId, h, k, a, b, reflectX]);

  const g = (x: number) => x / 2;
  const fog = a * base(b * g(x0));

  return (
    <VizPanel caption={idea}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img">
        <line x1={20} y1={oy} x2={W - 20} y2={oy} stroke="currentColor" opacity={0.25} />
        <line x1={ox} y1={20} x2={ox} y2={H - 20} stroke="currentColor" opacity={0.25} />
        <path d={path} fill="none" stroke="var(--accent-strong)" strokeWidth={2.5} />
        {formulaId.includes('FUN-002') ? (
          <text x={20} y={24} fontSize={12} fill="currentColor">
            x={x0.toFixed(2)} → g → f∘g ≈ {fog.toFixed(2)}
          </text>
        ) : null}
      </svg>
      <ControlsStack>
        {/FUN-007/.test(formulaId) ? (
          <>
            <SliderRow label="h" value={h} min={-3} max={3} step={0.1} onChange={setH} />
            <SliderRow label="k" value={k} min={-2} max={2} step={0.1} onChange={setK} />
          </>
        ) : null}
        {/FUN-008|FUN-002/.test(formulaId) ? (
          <>
            <SliderRow label="a" value={a} min={-2} max={2} step={0.1} onChange={setA} />
            <SliderRow label="b" value={b} min={0.2} max={3} step={0.1} onChange={setB} />
            <ToggleRow label={v.reflectH} checked={reflectX} onChange={setReflectX} />
          </>
        ) : null}
        {formulaId.includes('FUN-002') ? (
          <SliderRow label="x" value={x0} min={-3} max={3} step={0.1} onChange={setX0} />
        ) : null}
      </ControlsStack>
    </VizPanel>
  );
}
