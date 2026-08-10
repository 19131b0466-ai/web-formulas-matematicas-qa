'use client';

import { useMemo, useState } from 'react';
import { useVizLabels } from '@/lib/viz-labels';
import { ControlsStack, SliderRow, ToggleRow, VizPanel, fmt } from './controls';
import { clamp } from './math2d';

type Props = { formulaId: string; idea?: string };

export function NumberLineViz({ formulaId, idea }: Props) {
  const v = useVizLabels();
  const [x, setX] = useState(2.5);
  const [a, setA] = useState(-1);
  const [b, setB] = useState(3);
  const [bound, setBound] = useState(2);
  const [op, setOp] = useState<'<' | '≤' | '>' | '≥'>('<');
  const [closed, setClosed] = useState(false);

  const W = 520;
  const H = 90;
  const pad = 28;
  const toX = (v: number) => pad + ((v + 5) / 10) * (W - 2 * pad);

  const absMode = formulaId.includes('FND-006') || formulaId.includes('EQU-008');
  const distMode = formulaId.includes('FND-007');
  const ineqMode = formulaId.includes('INE');

  const shade = useMemo(() => {
    if (!ineqMode) return null;
    if (formulaId.includes('INE-004')) {
      // |x| < a style
      const lo = -Math.abs(bound);
      const hi = Math.abs(bound);
      return { lo, hi, exterior: op === '>' || op === '≥' };
    }
    // linear half-line around a
    return { lo: op === '>' || op === '≥' ? a : -5, hi: op === '<' || op === '≤' ? a : 5, exterior: false };
  }, [ineqMode, formulaId, bound, op, a]);

  return (
    <VizPanel caption={idea}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img">
        <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="currentColor" strokeWidth={2} opacity={0.35} />
        {[-4, -2, 0, 2, 4].map((t) => (
          <g key={t}>
            <line x1={toX(t)} y1={H / 2 - 6} x2={toX(t)} y2={H / 2 + 6} stroke="currentColor" strokeWidth={1.5} opacity={0.45} />
            <text x={toX(t)} y={H / 2 + 22} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.7}>
              {t}
            </text>
          </g>
        ))}
        {shade ? (
          <rect
            x={toX(shade.exterior ? -5 : shade.lo)}
            y={H / 2 - 14}
            width={toX(shade.exterior ? shade.lo : shade.hi) - toX(shade.exterior ? -5 : shade.lo)}
            height={28}
            fill="var(--accent-soft)"
            opacity={0.85}
          />
        ) : null}
        {shade?.exterior ? (
          <rect
            x={toX(shade.hi)}
            y={H / 2 - 14}
            width={toX(5) - toX(shade.hi)}
            height={28}
            fill="var(--accent-soft)"
            opacity={0.85}
          />
        ) : null}
        {absMode ? (
          <>
            <circle cx={toX(x)} cy={H / 2} r={7} fill="var(--accent-strong)" />
            <line x1={toX(0)} y1={H / 2} x2={toX(x)} y2={H / 2} stroke="var(--accent-strong)" strokeWidth={3} />
            <text x={toX(x)} y={18} textAnchor="middle" fontSize={12} fill="currentColor">
              x={fmt(x)} · |x|={fmt(Math.abs(x))}
            </text>
          </>
        ) : null}
        {distMode ? (
          <>
            <circle cx={toX(a)} cy={H / 2} r={7} fill="var(--accent-strong)" />
            <circle cx={toX(b)} cy={H / 2} r={7} fill="teal" />
            <line x1={toX(a)} y1={H / 2} x2={toX(b)} y2={H / 2} stroke="currentColor" strokeWidth={3} opacity={0.7} />
            <text x={W / 2} y={18} textAnchor="middle" fontSize={12} fill="currentColor">
              d={fmt(Math.abs(a - b))}
            </text>
          </>
        ) : null}
        {ineqMode && formulaId.includes('INE-004') ? (
          <>
            <circle
              cx={toX(-Math.abs(bound))}
              cy={H / 2}
              r={6}
              fill={closed || op.includes('=') || op === '≤' || op === '≥' ? 'var(--accent-strong)' : 'none'}
              stroke="var(--accent-strong)"
              strokeWidth={2}
            />
            <circle
              cx={toX(Math.abs(bound))}
              cy={H / 2}
              r={6}
              fill={closed || op === '≤' || op === '≥' ? 'var(--accent-strong)' : 'none'}
              stroke="var(--accent-strong)"
              strokeWidth={2}
            />
          </>
        ) : null}
      </svg>
      <ControlsStack>
        {absMode ? <SliderRow label="x" value={x} min={-5} max={5} step={0.1} onChange={setX} /> : null}
        {distMode ? (
          <>
            <SliderRow label="a" value={a} min={-5} max={5} step={0.1} onChange={setA} />
            <SliderRow label="b" value={b} min={-5} max={5} step={0.1} onChange={setB} />
          </>
        ) : null}
        {ineqMode ? (
          <>
            <SliderRow
              label={formulaId.includes('INE-004') ? 'a' : 'c'}
              value={formulaId.includes('INE-004') ? bound : a}
              min={0}
              max={5}
              step={0.1}
              onChange={(v) => (formulaId.includes('INE-004') ? setBound(clamp(v, 0, 5)) : setA(v))}
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
            <ToggleRow label={v.closedEnds} checked={closed} onChange={setClosed} />
          </>
        ) : null}
      </ControlsStack>
    </VizPanel>
  );
}
