'use client';

import { useMemo, useState } from 'react';
import { useVizLabels } from '@/lib/viz-labels';
import { ButtonRow, ControlsStack, SliderRow, ToggleRow, VizButton, VizPanel, fmt, joinCaption } from './controls';
import { add, det2, scale, type Mat2, type Vec2 } from './math2d';

type Props = { formulaId: string; idea?: string };

export function VectorSpaceVizLegacy({ formulaId }: Props) {
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

  // Parallelogram: 0, u, u+v, v
  const uPlusV = add(u, v);

  // Gram-Schmidt steps
  const uDotU = u.x * u.x + u.y * u.y || 1;
  const proj = scale(u, (v.x * u.x + v.y * u.y) / uDotU);
  const e2 = { x: v.x - proj.x, y: v.y - proj.y };

  // Nullspace: if |det| < ε, find null vector of M (Mx = 0)
  // M = [[u.x, v.x], [u.y, v.y]]
  // Null vector proportional to (v.x, -u.x) or (v.y, -u.y) etc
  const nullVec: Vec2 | null = useMemo(() => {
    if (area > 1e-3) return null;
    // M has a null vector: if v ≠ 0, null direction is v×(M row)
    // Solve [[u.x, v.x], [u.y, v.y]] · [a, b]ᵀ = 0
    // If u.x ≠ 0: b = -u.x/v.x * a → pick a=v.x, b=-u.x
    // But normalize to unit-ish
    let nx = v.x, ny = -u.x;
    const len = Math.hypot(nx, ny);
    if (len < 1e-9) { nx = v.y; ny = -u.y; }
    const len2 = Math.hypot(nx, ny);
    if (len2 < 1e-9) return null;
    return { x: nx / len2, y: ny / len2 };
  }, [area, u, v]);

  return (
    <VizPanel caption={joinCaption(`${vLab.areaDet} ≈ ${fmt(area)} (${area < 1e-3 ? vLab.dependent : vLab.independent})`)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img">
        <line x1={20} y1={oy} x2={W - 20} y2={oy} stroke="currentColor" opacity={0.2} />
        <line x1={ox} y1={20} x2={ox} y2={H - 20} stroke="currentColor" opacity={0.2} />
        {/* Span parallelogram: vertices 0, u, u+v, v */}
        <polygon
          points={`${to({ x: 0, y: 0 }).x},${to({ x: 0, y: 0 }).y} ${to(u).x},${to(u).y} ${to(uPlusV).x},${to(uPlusV).y} ${to(v).x},${to(v).y}`}
          fill="var(--accent-soft)"
          opacity={0.45}
        />
        {basisOn ? (
          <>
            <line x1={ox} y1={oy} x2={to(u).x} y2={to(u).y} stroke="var(--accent-strong)" strokeWidth={2.5} />
            <text x={to(u).x + 4} y={to(u).y - 4} fontSize={11} fill="currentColor">u</text>
            <line x1={ox} y1={oy} x2={to(v).x} y2={to(v).y} stroke="teal" strokeWidth={2.5} />
            <text x={to(v).x + 4} y={to(v).y - 4} fontSize={11} fill="currentColor">v</text>
          </>
        ) : null}
        {/* Linear combination su+tv as orange vector */}
        <line x1={ox} y1={oy} x2={to(combo).x} y2={to(combo).y} stroke="orange" strokeWidth={2} />
        <circle cx={to(combo).x} cy={to(combo).y} r={4} fill="orange" />
        <text x={to(combo).x + 4} y={to(combo).y - 4} fontSize={11} fill="orange">su+tv</text>
        {/* Gram-Schmidt: step 1 = show proj, step 2 = show e2 */}
        {/ORT-004/.test(formulaId) && step >= 1 ? (
          <>
            <line x1={ox} y1={oy} x2={to(proj).x} y2={to(proj).y} stroke="orange" strokeWidth={1.5} strokeDasharray="4 2" />
            <text x={to(proj).x + 4} y={to(proj).y - 4} fontSize={10} fill="orange">proj</text>
          </>
        ) : null}
        {/ORT-004/.test(formulaId) && step >= 2 ? (
          <>
            <line x1={ox} y1={oy} x2={to(e2).x} y2={to(e2).y} stroke="teal" strokeWidth={2} strokeDasharray="4 2" />
            <text x={to(e2).x + 4} y={to(e2).y - 4} fontSize={11} fill="teal">e₂⊥</text>
          </>
        ) : null}
        {/* Nullspace vector */}
        {/TRA-003/.test(formulaId) ? (
          nullVec ? (
            <>
              <line
                x1={ox}
                y1={oy}
                x2={to(nullVec).x}
                y2={to(nullVec).y}
                stroke="currentColor"
                strokeDasharray="3 2"
                opacity={0.6}
              />
              <text x={to(nullVec).x + 4} y={to(nullVec).y - 4} fontSize={10} fill="currentColor" opacity={0.7}>
                ker
              </text>
            </>
          ) : (
            <text x={ox - 40} y={30} fontSize={11} fill="currentColor" opacity={0.6}>
              ker = &#123;0&#125;
            </text>
          )
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
        {/ORT-004/.test(formulaId) ? (
          <ButtonRow>
            <VizButton active={step === 0} onClick={() => setStep(0)}>
              {vLab.gramStep} 1
            </VizButton>
            <VizButton active={step === 1} onClick={() => setStep(1)}>
              {vLab.gramStep} 2
            </VizButton>
            <VizButton active={step === 2} onClick={() => setStep(2)}>
              {vLab.gramStep} 3
            </VizButton>
          </ButtonRow>
        ) : null}
      </ControlsStack>
    </VizPanel>
  );
}
