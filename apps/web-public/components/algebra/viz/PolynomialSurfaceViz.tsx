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
  // Default showTerms=false for POL-009 so homogeneous view is shown by default
  const [showTerms, setShowTerms] = useState(!formulaId.includes('POL-009'));

  const W = 420;
  const H = 300;

  const cells = useMemo(() => {
    const xs = linspace(-2, 2, 18);
    const ys = linspace(-2, 2, 14);
    return ys.flatMap((y, yi) =>
      xs.map((x, xi) => {
        let z: number;
        if (showTerms) {
          // Standard form: ax² + bxy + cy²
          z = a * x * x + b * x * y + c * y * y;
        } else {
          // Homogeneous view: P(tx, ty) = t^d * P(x, y) for degree-d homogeneous
          // For degree-2: P(tx,ty) = a(tx)²+b(tx)(ty)+c(ty)² = t²(ax²+bxy+cy²)
          // We show the scaled version for general d by using (tx)^d etc
          if (d === 2) {
            z = a * (t * x) * (t * x) + b * (t * x) * (t * y) + c * (t * y) * (t * y);
          } else {
            z = a * Math.pow(t * x, d) + c * Math.pow(t * y, d);
          }
        }
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

  // Homogeneity check using (x,y) = (1,1): P(t,t) vs t^d * P(1,1)
  const P11 = a + b + c;  // P(1,1) for degree-2
  const Pt11 = d === 2
    ? a * t * t + b * t * t + c * t * t  // P(t*1, t*1) = t²(a+b+c)
    : a * Math.pow(t, d) + c * Math.pow(t, d);
  const tdP11 = Math.pow(t, d) * P11;

  const caption = formulaId.includes('POL-009')
    ? joinCaption(
        showTerms
          ? `P(x,y) = ${fmt(a)}x² + ${fmt(b)}xy + ${fmt(c)}y²`
          : `P(t·x, t·y) ≈ ${fmt(Pt11)} · t^d·P(1,1) = ${fmt(tdP11)}`,
        !showTerms && Math.abs(Pt11 - tdP11) < 0.01 ? 'homogéneo ✓' : undefined,
      )
    : undefined;

  return (
    <VizPanel caption={caption}>
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
          {showTerms
            ? `z = ${fmt(a)}x² + ${fmt(b)}xy + ${fmt(c)}y²`
            : `z = ${v.homogeneousForm} ${d} · t=${fmt(t)}`}
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
