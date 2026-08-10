'use client';

import { useState } from 'react';
import { useVizLabels } from '@/lib/viz-labels';
import { ButtonRow, ControlsStack, SliderRow, ToggleRow, VizButton, VizPanel, fmt } from './controls';
import { add, applyMat, det2, scale, type Mat2, type Vec2 } from './math2d';

type Props = { formulaId: string; idea?: string };

export function VectorSpaceViz({ formulaId, idea }: Props) {
  const vLab = useVizLabels();
  const [u, setU] = useState<Vec2>({ x: 2, y: 0.4 });
  const [v, setV] = useState<Vec2>({ x: 0.6, y: 1.8 });
  const [s, setS] = useState(0.7);
  const [t, setT] = useState(0.5);
  const [step, setStep] = useState(0);
  const [basisOn, setBasisOn] = useState(true);

  const W = 420;
  const H = 300;
  const ox = W / 2;
  const oy = H / 2;
  const S = 40;
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });

  const M: Mat2 = [
    [u.x, v.x],
    [u.y, v.y],
  ];
  const area = Math.abs(det2(M));
  const combo = add(scale(u, s), scale(v, t));

  // Gram-Schmidt steps
  const e1 = { x: u.x, y: u.y };
  const proj = scale(e1, (v.x * e1.x + v.y * e1.y) / (e1.x * e1.x + e1.y * e1.y || 1));
  const e2 = { x: v.x - proj.x, y: v.y - proj.y };

  const nullVec = applyMat(
    [
      [u.y, -u.x],
      [-v.y, v.x],
    ] as Mat2,
    { x: 0.3, y: 0.3 },
  );

  return (
    <VizPanel caption={`${idea ?? ''} · ${vLab.areaDet} ≈ ${fmt(area)} (${area < 1e-3 ? vLab.dependent : vLab.independent})`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img">
        <line x1={20} y1={oy} x2={W - 20} y2={oy} stroke="currentColor" opacity={0.2} />
        <line x1={ox} y1={20} x2={ox} y2={H - 20} stroke="currentColor" opacity={0.2} />
        {/* span parallelogram */}
        <polygon
          points={`${to({ x: 0, y: 0 }).x},${to({ x: 0, y: 0 }).y} ${to(u).x},${to(u).y} ${to(combo).x},${to(combo).y} ${to(scale(v, t)).x},${to(scale(v, t)).y}`}
          fill="var(--accent-soft)"
          opacity={0.55}
        />
        {basisOn ? (
          <>
            <line x1={ox} y1={oy} x2={to(u).x} y2={to(u).y} stroke="var(--accent-strong)" strokeWidth={2.5} />
            <line x1={ox} y1={oy} x2={to(v).x} y2={to(v).y} stroke="teal" strokeWidth={2.5} />
          </>
        ) : null}
        <line x1={ox} y1={oy} x2={to(combo).x} y2={to(combo).y} stroke="orange" strokeWidth={2} />
        {/ORT-004|ESP-/.test(formulaId) && step >= 1 ? (
          <line x1={ox} y1={oy} x2={to(e2).x} y2={to(e2).y} stroke="orange" strokeWidth={2} strokeDasharray="4 2" />
        ) : null}
        {/TRA-003|ESP-005|ESP-006/.test(formulaId) ? (
          <line
            x1={ox}
            y1={oy}
            x2={to(nullVec).x}
            y2={to(nullVec).y}
            stroke="currentColor"
            strokeDasharray="3 2"
            opacity={0.6}
          />
        ) : null}
      </svg>
      <ControlsStack>
        <SliderRow label="uₓ" value={u.x} min={-3} max={3} step={0.1} onChange={(x) => setU({ ...u, x })} />
        <SliderRow label="uᵧ" value={u.y} min={-3} max={3} step={0.1} onChange={(y) => setU({ ...u, y })} />
        <SliderRow label="vₓ" value={v.x} min={-3} max={3} step={0.1} onChange={(x) => setV({ ...v, x })} />
        <SliderRow label="vᵧ" value={v.y} min={-3} max={3} step={0.1} onChange={(y) => setV({ ...v, y })} />
        <SliderRow label="s" value={s} min={-1.5} max={1.5} step={0.05} onChange={setS} />
        <SliderRow label="t" value={t} min={-1.5} max={1.5} step={0.05} onChange={setT} />
        <ToggleRow label={vLab.showBasis} checked={basisOn} onChange={setBasisOn} />
        <ButtonRow>
          <VizButton onClick={() => setStep((x) => (x + 1) % 3)}>
            {vLab.gramStep} {step + 1}
          </VizButton>
        </ButtonRow>
      </ControlsStack>
    </VizPanel>
  );
}
