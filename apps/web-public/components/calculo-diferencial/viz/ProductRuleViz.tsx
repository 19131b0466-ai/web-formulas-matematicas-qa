'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { fmt } from '@/components/calculo/viz/calcMath';
import { PLOT_H, PLOT_M, PLOT_W, pathOf, toX, toY, yRange } from './plotUtils';

type Pair = {
  label: string;
  f: (x: number) => number;
  df: (x: number) => number;
  g: (x: number) => number;
  dg: (x: number) => number;
  xMin: number;
  xMax: number;
};

const PAIRS: Pair[] = [
  {
    label: 'f=sen x, g=x',
    f: Math.sin,
    df: Math.cos,
    g: (x) => x,
    dg: () => 1,
    xMin: -Math.PI,
    xMax: Math.PI,
  },
  {
    label: 'f=x, g=cos x',
    f: (x) => x,
    df: () => 1,
    g: Math.cos,
    dg: (x) => -Math.sin(x),
    xMin: -Math.PI,
    xMax: Math.PI,
  },
  {
    label: 'f=eˣ, g=x²',
    f: Math.exp,
    df: Math.exp,
    g: (x) => x * x,
    dg: (x) => 2 * x,
    xMin: -1.5,
    xMax: 1.5,
  },
];

const H = 0.001;

export function ProductRuleViz() {
  const t = useTranslations('vizDif.productRule');
  const [idx, setIdx] = useState(0);
  const pair = PAIRS[idx]!;
  const [x, setX] = useState(0.6);
  const fg = (v: number) => pair.f(v) * pair.g(v);
  const range = yRange(fg, pair.xMin, pair.xMax);

  const fp = pair.df(x);
  const gp = pair.dg(x);
  const term1 = fp * pair.g(x);
  const term2 = pair.f(x) * gp;
  const productRule = term1 + term2;
  const numeric = (fg(x + H) - fg(x - H)) / (2 * H);
  const match = Math.abs(productRule - numeric) < 0.03;

  const curves = useMemo(() => {
    const fPath = pathOf(pair.f, pair.xMin, pair.xMax, range.yMin, range.yMax);
    const gPath = pathOf(pair.g, pair.xMin, pair.xMax, range.yMin, range.yMax);
    const fgPath = pathOf(fg, pair.xMin, pair.xMax, range.yMin, range.yMax);
    return { fPath, gPath, fgPath };
  }, [pair, range.yMin, range.yMax, fg]);

  return (
    <VizPanel>
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-[var(--fg)]">{t('idea')}</p>
        <div className="flex flex-wrap gap-2">
          {PAIRS.map((p, i) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setIdx(i)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                i === idx
                  ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'border-[var(--border)] text-[var(--fg-muted)] hover:border-[var(--accent-strong)]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <ControlsStack>
          <SliderRow label={t('xLabel')} value={x} min={pair.xMin + 0.2} max={pair.xMax - 0.2} step={0.05} onChange={setX} />
        </ControlsStack>
        <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="w-full rounded-lg border border-[var(--border)] bg-[var(--formula-bg)]">
          <path d={curves.fPath} fill="none" stroke="#3b82f6" strokeWidth={1.5} opacity={0.55} />
          <path d={curves.gPath} fill="none" stroke="#f59e0b" strokeWidth={1.5} opacity={0.55} />
          <path d={curves.fgPath} fill="none" stroke="var(--accent-strong)" strokeWidth={2.5} />
          <circle cx={toX(x, pair.xMin, pair.xMax)} cy={toY(fg(x), range.yMin, range.yMax)} r={5} fill="var(--accent-strong)" />
        </svg>
        <p className="text-xs text-[var(--fg-muted)]">
          <span className="text-[#3b82f6]">f</span> · <span className="text-[#f59e0b]">g</span> ·{' '}
          <span className="font-semibold text-[var(--accent-strong)]">fg</span>
        </p>
        <dl className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-[#3b82f6]/30 bg-[#3b82f6]/5 px-3 py-2">
            <dt className="text-[var(--fg-muted)]">{t('term1')}</dt>
            <dd className="font-mono font-semibold text-[#3b82f6]">{fmt(term1, 4)}</dd>
          </div>
          <div className="rounded-lg border border-[#f59e0b]/30 bg-[#f59e0b]/5 px-3 py-2">
            <dt className="text-[var(--fg-muted)]">{t('term2')}</dt>
            <dd className="font-mono font-semibold text-[#f59e0b]">{fmt(term2, 4)}</dd>
          </div>
          <div>
            <dt className="text-[var(--fg-muted)]">(fg)′</dt>
            <dd className="font-mono font-semibold">{fmt(productRule, 4)}</dd>
          </div>
          <div>
            <dt className="text-[var(--fg-muted)]">{t('numeric')}</dt>
            <dd className={`font-mono font-semibold ${match ? 'text-[#22c55e]' : ''}`}>{fmt(numeric, 4)}</dd>
          </div>
        </dl>
        <p className="text-xs text-[var(--fg-muted)]">{match ? t('match') : t('note')}</p>
      </div>
    </VizPanel>
  );
}
