'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { fmt } from '@/components/calculo/viz/calcMath';
import { PLOT_H, PLOT_W, pathOf, yRange } from './plotUtils';

type Example = {
  label: string;
  f: (x: number) => number;
  df: (x: number) => number;
  g: (x: number) => number;
  dg: (x: number) => number;
  xMin: number;
  xMax: number;
};

const EXAMPLES: Example[] = [
  {
    label: 'y = xˣ',
    f: (x) => x,
    df: () => 1,
    g: (x) => x,
    dg: () => 1,
    xMin: 0.2,
    xMax: 2.5,
  },
  {
    label: 'y = (x²+1)ˣ',
    f: (x) => x * x + 1,
    df: (x) => 2 * x,
    g: (x) => x,
    dg: () => 1,
    xMin: 0.3,
    xMax: 2,
  },
];

const H = 0.001;

function yVal(ex: Example, x: number) {
  const base = ex.f(x);
  if (base <= 0) return NaN;
  return base ** ex.g(x);
}

function yPrime(ex: Example, x: number) {
  const fx = ex.f(x);
  const gx = ex.g(x);
  const fpx = ex.df(x);
  const gpx = ex.dg(x);
  if (fx <= 0) return NaN;
  const y = fx ** gx;
  const lnTerm = gpx * Math.log(fx) + gx * (fpx / fx);
  return y * lnTerm;
}

export function LogDiffViz() {
  const t = useTranslations('vizDif.logDiff');
  const [idx, setIdx] = useState(0);
  const ex = EXAMPLES[idx]!;
  const [x, setX] = useState(1);
  const y = yVal(ex, x);
  const yp = yPrime(ex, x);
  const numeric = (yVal(ex, x + H) - yVal(ex, x - H)) / (2 * H);
  const match = isFinite(yp) && Math.abs(yp - numeric) < 0.05;
  const range = yRange((v) => yVal(ex, v), ex.xMin, ex.xMax);
  const curve = pathOf((v) => yVal(ex, v), ex.xMin, ex.xMax, range.yMin, range.yMax);

  const fx = ex.f(x);
  const gx = ex.g(x);
  const fpx = ex.df(x);
  const gpx = ex.dg(x);
  const lnY = Math.log(fx);
  const bracket = gpx * lnY + gx * (fpx / fx);

  return (
    <VizPanel>
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-[var(--fg)]">{t('idea')}</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((e, i) => (
            <button
              key={e.label}
              type="button"
              onClick={() => setIdx(i)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                i === idx
                  ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'border-[var(--border)] text-[var(--fg-muted)] hover:border-[var(--accent-strong)]'
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
        <ControlsStack>
          <SliderRow label={t('xLabel')} value={x} min={ex.xMin + 0.05} max={ex.xMax - 0.05} step={0.05} onChange={setX} />
        </ControlsStack>
        <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="w-full rounded-lg border border-[var(--border)] bg-[var(--formula-bg)]">
          <path d={curve} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
        </svg>
        <ol className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-4 py-3 text-sm">
          <li>
            <span className="text-[var(--fg-muted)]">1.</span>{' '}
            <span className="font-mono">y = f(x)^g(x)</span> → y = {fmt(y, 4)}
          </li>
          <li>
            <span className="text-[var(--fg-muted)]">2.</span>{' '}
            <span className="font-mono">ln y = g(x) ln f(x)</span> → ln y = {fmt(lnY, 4)}
          </li>
          <li>
            <span className="text-[var(--fg-muted)]">3.</span>{' '}
            <span className="font-mono">y′/y = g′ ln f + g f′/f</span> → {fmt(bracket, 4)}
          </li>
          <li>
            <span className="text-[var(--fg-muted)]">4.</span>{' '}
            <span className="font-mono">y′ = y · (…)</span> → y′ = {fmt(yp, 4)}
          </li>
        </ol>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--fg-muted)]">{t('numeric')}</dt>
            <dd className={`font-mono font-semibold ${match ? 'text-[#22c55e]' : ''}`}>{fmt(numeric, 4)}</dd>
          </div>
          <div>
            <dt className="text-[var(--fg-muted)]">{t('check')}</dt>
            <dd className="font-semibold">{match ? t('match') : t('note')}</dd>
          </div>
        </dl>
      </div>
    </VizPanel>
  );
}
