'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { fmt } from '@/components/calculo/viz/calcMath';

const R = 2;
const CX = 100;
const CY = 100;
const SCALE = 35;

type Props = { mode?: string };

export function ImplicitCurveViz({ mode = 'circle' }: Props) {
  const t = useTranslations('vizDif.implicit');
  const [theta, setTheta] = useState(Math.PI / 4);
  const px = R * Math.cos(theta);
  const py = R * Math.sin(theta);
  const slope = py !== 0 ? -px / py : NaN;
  const span = 1.2;

  const tangent = useMemo(() => {
    if (!isFinite(slope)) return null;
    const x1 = px - span;
    const x2 = px + span;
    const y1 = py + slope * (x1 - px);
    const y2 = py + slope * (x2 - px);
    return {
      x1: CX + x1 * SCALE,
      y1: CY - y1 * SCALE,
      x2: CX + x2 * SCALE,
      y2: CY - y2 * SCALE,
    };
  }, [px, py, slope]);

  const circlePath = `M ${CX + R * SCALE} ${CY} A ${R * SCALE} ${R * SCALE} 0 1 0 ${CX - R * SCALE} ${CY} A ${R * SCALE} ${R * SCALE} 0 1 0 ${CX + R * SCALE} ${CY}`;

  return (
    <VizPanel>
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-[var(--fg)]">{t('idea')}</p>
        <ControlsStack>
          <SliderRow label={t('angleLabel')} value={theta} min={0.15} max={Math.PI * 2 - 0.15} step={0.05} onChange={setTheta} />
        </ControlsStack>
        <svg viewBox="0 0 200 200" className="mx-auto w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--formula-bg)]">
          <line x1={0} y1={CY} x2={200} y2={CY} stroke="var(--border)" />
          <line x1={CX} y1={0} x2={CX} y2={200} stroke="var(--border)" />
          <path d={circlePath} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
          {tangent ? (
            <line x1={tangent.x1} y1={tangent.y1} x2={tangent.x2} y2={tangent.y2} stroke="#f59e0b" strokeWidth={2} />
          ) : null}
          <circle cx={CX + px * SCALE} cy={CY - py * SCALE} r={5} fill="#22c55e" />
        </svg>
        <dl className="grid gap-2 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-[var(--fg-muted)]">x</dt>
            <dd className="font-mono font-semibold">{fmt(px, 4)}</dd>
          </div>
          <div>
            <dt className="text-[var(--fg-muted)]">y</dt>
            <dd className="font-mono font-semibold">{fmt(py, 4)}</dd>
          </div>
          <div>
            <dt className="text-[var(--fg-muted)]">dy/dx</dt>
            <dd className="font-mono font-semibold text-[#f59e0b]">{isFinite(slope) ? fmt(slope, 4) : '∞'}</dd>
          </div>
          <div>
            <dt className="text-[var(--fg-muted)]">x²+y²</dt>
            <dd className="font-mono font-semibold">{fmt(px * px + py * py, 4)}</dd>
          </div>
        </dl>
        <p className="text-center font-mono text-xs text-[var(--fg-muted)]">dy/dx = −x/y</p>
      </div>
    </VizPanel>
  );
}
