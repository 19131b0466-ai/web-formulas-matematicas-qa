'use client';

import { useMemo, useState } from 'react';
import { useVizLabels } from '@/lib/viz-labels';
import { ControlsStack, SliderRow, ToggleRow, VizPanel, fmt, joinCaption } from './controls';
import { linspace } from './math2d';

type Props = { formulaId: string; idea?: string };

export function PolynomialSurfaceViz({ formulaId }: Props) {
  const v = useVizLabels();
  const [a, setA] = useState(1);
  const [b, setB] = useState(0.4);
  const [c, setC] = useState(-0.6);
  const [t, setT] = useState(1.2);
  const [d, setD] = useState(2);
  const [showTerms, setShowTerms] = useState(true);

  const W = 420;
  const H = 300;

  // Project z=P(x,y) as contour-ish heatmap strips
  const cells = useMemo(() => {
    const xs = linspace(-2, 2, 18);
    const ys = linspace(-2, 2, 14);
    return ys.flatMap((y, yi) =>
      xs.map((x, xi) => {
        const z = showTerms
          ? a * x * x + b * x * y + c * y * y
          : a * (t * x) ** d + c * (t * y) ** d;
        return { xi, yi, z, x, y };
      }),
    );
  }, [a, b, c, t, d, showTerms]);

  const zs = cells.map((c) => c.z);
  const zmin = Math.min(...zs);
  const zmax = Math.max(...zs);
  const norm = (z: number) => (zmax === zmin ? 0.5 : (z - zmin) / (zmax - zmin));

  const cw = W / 18;
  const ch = (H - 40) / 14;

  const homogCheck = a * (t * 1) ** d + c * (t * 1) ** d;
  const scaled = t ** d * (a + c);

  return (
    <VizPanel
      caption={
        formulaId.includes('POL-009')
          ? joinCaption(`P(tx,ty)≈${fmt(homogCheck)}`, `t^d P≈${fmt(scaled)}`)
          : undefined
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img">
        {cells.map((cell) => {
          const g = Math.round(40 + norm(cell.z) * 180);
          return (
            <rect
              key={`${cell.xi}-${cell.yi}`}
              x={cell.xi * cw}
              y={20 + cell.yi * ch}
              width={cw + 0.5}
              height={ch + 0.5}
              fill={`rgb(${g},${Math.round(g * 0.75)},${220 - g})`}
              opacity={0.9}
            />
          );
        })}
        <text x={12} y={14} fontSize={12} fill="currentColor">
          z = {showTerms ? `${fmt(a)}x² + ${fmt(b)}xy + ${fmt(c)}y²` : `${v.homogeneousForm} ${d}`}
        </text>
      </svg>
      <ControlsStack>
        <SliderRow label="a" value={a} min={-2} max={2} step={0.1} onChange={setA} />
        <SliderRow label="b" value={b} min={-2} max={2} step={0.1} onChange={setB} />
        <SliderRow label="c" value={c} min={-2} max={2} step={0.1} onChange={setC} />
        {formulaId.includes('POL-009') ? (
          <>
            <SliderRow label="t" value={t} min={0.2} max={2} step={0.05} onChange={setT} />
            <SliderRow label="d" value={d} min={1} max={4} step={1} onChange={setD} />
          </>
        ) : null}
        <ToggleRow label={v.showTerms} checked={showTerms} onChange={setShowTerms} />
      </ControlsStack>
    </VizPanel>
  );
}
