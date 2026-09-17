'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { fmt } from '@/components/calculo/viz/calcMath';

type Props = { mode?: string };

export function RelatedRatesViz({ mode = 'sphere' }: Props) {
  const t = useTranslations('vizDif.relatedRates');
  const [r, setR] = useState(1.5);
  const [dVdt, setDVdt] = useState(2);
  const dArea = 4 * Math.PI * r * r;
  const drdt = dVdt / dArea;
  const V = (4 / 3) * Math.PI * r ** 3;

  const size = 40 + r * 22;

  return (
    <VizPanel>
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-[var(--fg)]">{t('idea')}</p>
        <ControlsStack>
          <SliderRow label={t('radiusLabel')} value={r} min={0.5} max={3} step={0.05} onChange={setR} />
          <SliderRow label={t('dVdtLabel')} value={dVdt} min={0.5} max={8} step={0.1} onChange={setDVdt} />
        </ControlsStack>
        <div className="flex justify-center">
          <svg viewBox="0 0 200 160" className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--formula-bg)]">
            <circle cx={100} cy={80} r={size} fill="var(--accent-soft)" stroke="var(--accent-strong)" strokeWidth={2} />
            <line x1={100} y1={80} x2={100 + size} y2={80} stroke="#f59e0b" strokeWidth={2} />
            <text x={100 + size / 2} y={74} textAnchor="middle" className="fill-[#f59e0b] text-[11px]">r</text>
            <text x={100} y={150} textAnchor="middle" className="fill-[var(--fg-muted)] text-[11px]">
              dV/dt = {fmt(dVdt, 2)} → dr/dt = {fmt(drdt, 4)}
            </text>
          </svg>
        </div>
        <dl className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-[var(--fg-muted)]">V</dt>
            <dd className="font-mono font-semibold">{fmt(V, 4)}</dd>
          </div>
          <div>
            <dt className="text-[var(--fg-muted)]">4πr²</dt>
            <dd className="font-mono font-semibold">{fmt(dArea, 4)}</dd>
          </div>
          <div>
            <dt className="text-[var(--fg-muted)]">dV/dt</dt>
            <dd className="font-mono font-semibold">{fmt(dVdt, 4)}</dd>
          </div>
          <div>
            <dt className="text-[var(--fg-muted)]">dr/dt</dt>
            <dd className="font-mono font-semibold text-[var(--accent-strong)]">{fmt(drdt, 6)}</dd>
          </div>
        </dl>
        <p className="text-center font-mono text-xs text-[var(--fg-muted)]">dV/dt = 4πr² · dr/dt</p>
      </div>
    </VizPanel>
  );
}
