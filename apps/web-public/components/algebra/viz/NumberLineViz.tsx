'use client';

import { useMemo, useState } from 'react';
import { useVizLabels } from '@/lib/viz-labels';
import { AbsoluteEquationViz } from './AbsoluteEquationViz';
import { AbsoluteValueViz } from './AbsoluteValueViz';
import { DistanceNumberLineViz } from './DistanceNumberLineViz';
import { ControlsStack, SliderRow, VizPanel, fmt } from './controls';
import { clamp } from './math2d';

type Props = { formulaId: string; idea?: string };

export function NumberLineViz({ formulaId }: Props) {
  if (formulaId.includes('FND-006')) {
    return <AbsoluteValueViz />;
  }
  if (formulaId.includes('FND-007')) {
    return <DistanceNumberLineViz />;
  }
  if (formulaId.includes('EQU-008')) {
    return <AbsoluteEquationViz />;
  }

  return <NumberLineShared formulaId={formulaId} />;
}

function NumberLineShared({ formulaId }: Props) {
  const v = useVizLabels();
  const [sliderA, setSliderA] = useState(2);
  const [coefA, setCoefA] = useState(1);
  const [coefB, setCoefB] = useState(-2);
  const [bound, setBound] = useState(2);
  const [op, setOp] = useState<'<' | '≤' | '>' | '≥'>('<');

  const W = 520;
  const absEqMode = formulaId.includes('EQU-008');
  const ineq1Mode = formulaId.includes('INE-001');
  const ineq4Mode = formulaId.includes('INE-004');
  const ineqMode = formulaId.includes('INE');

  const H = 90;
  const pad = 28;
  const axisY = H / 2;
  const toX = (val: number) => pad + ((val + 5) / 10) * (W - 2 * pad);

  const boundary1 = useMemo(() => {
    if (!ineq1Mode) return 0;
    if (Math.abs(coefA) < 1e-9) return 0;
    return -coefB / coefA;
  }, [ineq1Mode, coefA, coefB]);

  const effectiveOp = useMemo((): '<' | '≤' | '>' | '≥' => {
    if (ineq1Mode && coefA < 0) {
      const flip: Record<'<' | '≤' | '>' | '≥', '<' | '≤' | '>' | '≥'> = {
        '<': '>',
        '≤': '≥',
        '>': '<',
        '≥': '≤',
      };
      return flip[op];
    }
    return op;
  }, [ineq1Mode, coefA, op]);

  const shade = useMemo(() => {
    if (ineq4Mode) {
      const hi = Math.abs(bound);
      const lo = -hi;
      return { lo, hi, exterior: effectiveOp === '>' || effectiveOp === '≥' };
    }
    if (ineq1Mode) {
      const bnd = clamp(boundary1, -5, 5);
      return {
        lo: effectiveOp === '>' || effectiveOp === '≥' ? bnd : -5,
        hi: effectiveOp === '<' || effectiveOp === '≤' ? bnd : 5,
        exterior: false,
      };
    }
    return null;
  }, [ineq4Mode, ineq1Mode, bound, effectiveOp, boundary1]);

  const isClosedOp = op === '≤' || op === '≥';

  return (
    <VizPanel>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img">
        <line x1={pad} y1={axisY} x2={W - pad} y2={axisY} stroke="currentColor" strokeWidth={2} opacity={0.35} />
        {[-4, -2, 0, 2, 4].map((t) => (
          <g key={t}>
            <line
              x1={toX(t)}
              y1={axisY - 6}
              x2={toX(t)}
              y2={axisY + 6}
              stroke="currentColor"
              strokeWidth={t === 0 ? 2.5 : 1.5}
              opacity={t === 0 ? 0.9 : 0.45}
            />
            <text x={toX(t)} y={axisY + 22} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.7}>
              {t}
            </text>
          </g>
        ))}

        {shade ? (
          <rect
            x={toX(shade.exterior ? -5 : shade.lo)}
            y={axisY - 14}
            width={toX(shade.exterior ? shade.lo : shade.hi) - toX(shade.exterior ? -5 : shade.lo)}
            height={28}
            fill="var(--accent-soft)"
            opacity={0.85}
          />
        ) : null}
        {shade?.exterior ? (
          <rect
            x={toX(shade.hi)}
            y={axisY - 14}
            width={toX(5) - toX(shade.hi)}
            height={28}
            fill="var(--accent-soft)"
            opacity={0.85}
          />
        ) : null}

        {absEqMode ? (
          <>
            <circle cx={toX(-sliderA)} cy={axisY} r={7} fill="var(--accent-strong)" />
            <circle cx={toX(sliderA)} cy={axisY} r={7} fill="var(--accent-strong)" />
            <line
              x1={toX(-sliderA)}
              y1={axisY}
              x2={toX(sliderA)}
              y2={axisY}
              stroke="var(--accent-strong)"
              strokeWidth={2}
              opacity={0.4}
            />
            <text x={toX(-sliderA)} y={18} textAnchor="middle" fontSize={11} fill="currentColor">
              -{fmt(sliderA)}
            </text>
            <text x={toX(sliderA)} y={18} textAnchor="middle" fontSize={11} fill="currentColor">
              +{fmt(sliderA)}
            </text>
            <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.7}>
              |x|={fmt(sliderA)} → x=±{fmt(sliderA)}
            </text>
          </>
        ) : null}

        {ineq1Mode ? (
          <circle
            cx={toX(clamp(boundary1, -5, 5))}
            cy={axisY}
            r={6}
            fill={isClosedOp ? 'var(--accent-strong)' : 'none'}
            stroke="var(--accent-strong)"
            strokeWidth={2}
          />
        ) : null}

        {ineq4Mode ? (
          <>
            <circle
              cx={toX(-Math.abs(bound))}
              cy={axisY}
              r={6}
              fill={isClosedOp ? 'var(--accent-strong)' : 'none'}
              stroke="var(--accent-strong)"
              strokeWidth={2}
            />
            <circle
              cx={toX(Math.abs(bound))}
              cy={axisY}
              r={6}
              fill={isClosedOp ? 'var(--accent-strong)' : 'none'}
              stroke="var(--accent-strong)"
              strokeWidth={2}
            />
          </>
        ) : null}
      </svg>

      <ControlsStack>
        {absEqMode ? (
          <SliderRow label="a" value={sliderA} min={0} max={5} step={0.1} onChange={(val) => setSliderA(clamp(val, 0, 5))} />
        ) : null}

        {ineq1Mode ? (
          <>
            <SliderRow label="a" value={coefA} min={-3} max={3} step={0.1} onChange={setCoefA} />
            <SliderRow label="b" value={coefB} min={-5} max={5} step={0.1} onChange={setCoefB} />
            {coefA < 0 ? <p className="text-xs text-[var(--fg-muted)]">a&lt;0 → desigualdad invertida</p> : null}
            {Math.abs(coefA) < 1e-9 ? (
              <p className="text-xs text-[var(--fg-muted)]">a=0 → sin solución o todo ℝ</p>
            ) : (
              <p className="font-mono text-sm">frontera: x = {fmt(boundary1)}</p>
            )}
            <div className="flex flex-wrap gap-2 text-sm">
              {(['<', '≤', '>', '≥'] as const).map((o) => (
                <button
                  key={o}
                  type="button"
                  className={`rounded border px-2 py-1 ${op === o ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)]' : 'border-[var(--border)]'}`}
                  onClick={() => setOp(o)}
                >
                  {o}
                </button>
              ))}
            </div>
          </>
        ) : null}

        {ineq4Mode ? (
          <>
            <SliderRow
              label="a"
              value={bound}
              min={0}
              max={5}
              step={0.1}
              onChange={(val) => setBound(clamp(val, 0, 5))}
            />
            <div className="flex flex-wrap gap-2 text-sm">
              {(['<', '≤', '>', '≥'] as const).map((o) => (
                <button
                  key={o}
                  type="button"
                  className={`rounded border px-2 py-1 ${op === o ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)]' : 'border-[var(--border)]'}`}
                  onClick={() => setOp(o)}
                >
                  {o}
                </button>
              ))}
            </div>
          </>
        ) : null}

        {ineqMode && !ineq1Mode && !ineq4Mode ? (
          <p className="text-xs text-[var(--fg-muted)]">{v.closedEnds}</p>
        ) : null}
      </ControlsStack>
    </VizPanel>
  );
}
