'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { fmt } from '@/components/calculo/viz/calcMath';
import { PLOT_H, PLOT_M, PLOT_W, pathOf, toX, toY, yRange } from './plotUtils';

type Rational = {
  label: string;
  f: (x: number) => number;
  vAsym: number | null;
  oblique: (x: number) => number;
  xMin: number;
  xMax: number;
};

const RATIONALS: Rational[] = [
  {
    label: '(x²+1)/(x−1)',
    f: (x) => (x * x + 1) / (x - 1),
    vAsym: 1,
    oblique: (x) => x + 1,
    xMin: -4,
    xMax: 6,
  },
  {
    label: '(2x²+3)/(x+2)',
    f: (x) => (2 * x * x + 3) / (x + 2),
    vAsym: -2,
    oblique: (x) => 2 * x - 4,
    xMin: -5,
    xMax: 5,
  },
];

export function AsymptoteExplorerViz() {
  const t = useTranslations('vizDif.asymptote');
  const [idx, setIdx] = useState(0);
  const rat = RATIONALS[idx]!;
  const [window, setWindow] = useState(4);
  const xMin = -window;
  const xMax = window + 2;

  const range = yRange(rat.f, xMin, xMax, 400);
  const left = rat.vAsym && rat.vAsym > xMin ? pathOf(rat.f, xMin, rat.vAsym - 0.15, range.yMin, range.yMax) : '';
  const right = rat.vAsym && rat.vAsym < xMax ? pathOf(rat.f, rat.vAsym + 0.15, xMax, range.yMin, range.yMax) : pathOf(rat.f, xMin, xMax, range.yMin, range.yMax);
  const oblique = useMemo(
    () => pathOf(rat.oblique, xMin, xMax, range.yMin, range.yMax),
    [rat, xMin, xMax, range.yMin, range.yMax],
  );

  return (
    <VizPanel>
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-[var(--fg)]">{t('idea')}</p>
        <div className="flex flex-wrap gap-2">
          {RATIONALS.map((r, i) => (
            <button
              key={r.label}
              type="button"
              onClick={() => setIdx(i)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                i === idx
                  ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'border-[var(--border)] text-[var(--fg-muted)] hover:border-[var(--accent-strong)]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <ControlsStack>
          <SliderRow label={t('windowLabel')} value={window} min={2.5} max={6} step={0.25} onChange={setWindow} />
        </ControlsStack>
        <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="w-full rounded-lg border border-[var(--border)] bg-[var(--formula-bg)]">
          {rat.vAsym !== null ? (
            <line
              x1={toX(rat.vAsym, xMin, xMax)}
              y1={PLOT_M.t}
              x2={toX(rat.vAsym, xMin, xMax)}
              y2={PLOT_H - PLOT_M.b}
              stroke="#ef4444"
              strokeDasharray="5 4"
            />
          ) : null}
          <path d={oblique} fill="none" stroke="#22c55e" strokeWidth={1.5} strokeDasharray="4 3" />
          {left ? <path d={left} fill="none" stroke="var(--accent-strong)" strokeWidth={2} /> : null}
          {right ? <path d={right} fill="none" stroke="var(--accent-strong)" strokeWidth={2} /> : null}
        </svg>
        <p className="flex flex-wrap gap-4 text-xs text-[var(--fg-muted)]">
          <span><span className="text-[var(--accent-strong)]">—</span> f(x)</span>
          <span><span className="text-[#22c55e]">- -</span> {t('oblique')}</span>
          {rat.vAsym !== null ? <span><span className="text-[#ef4444]">|</span> {t('vertical')} x={fmt(rat.vAsym, 2)}</span> : null}
        </p>
      </div>
    </VizPanel>
  );
}
