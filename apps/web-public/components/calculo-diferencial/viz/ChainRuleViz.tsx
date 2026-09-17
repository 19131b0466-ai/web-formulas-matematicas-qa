'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { fmt } from '@/components/calculo/viz/calcMath';
import { PLOT_H, PLOT_W, pathOf, toX, toY, yRange } from './plotUtils';

type Comp = {
  label: string;
  g: (x: number) => number;
  dg: (x: number) => number;
  f: (u: number) => number;
  df: (u: number) => number;
  xMin: number;
  xMax: number;
};

const COMPS: Comp[] = [
  {
    label: 'f(u)=u², g=sen x',
    g: Math.sin,
    dg: Math.cos,
    f: (u) => u * u,
    df: (u) => 2 * u,
    xMin: -Math.PI,
    xMax: Math.PI,
  },
  {
    label: 'f(u)=eᵘ, g=x²',
    g: (x) => x * x,
    dg: (x) => 2 * x,
    f: Math.exp,
    df: Math.exp,
    xMin: -1.5,
    xMax: 1.5,
  },
  {
    label: 'f(u)=cos u, g=2x',
    g: (x) => 2 * x,
    dg: () => 2,
    f: Math.cos,
    df: (u) => -Math.sin(u),
    xMin: -2,
    xMax: 2,
  },
];

const H = 0.001;

export function ChainRuleViz() {
  const t = useTranslations('vizDif.chainRule');
  const [idx, setIdx] = useState(0);
  const comp = COMPS[idx]!;
  const [x, setX] = useState(0.5);
  const h = (v: number) => comp.f(comp.g(v));
  const u = comp.g(x);
  const du = comp.dg(x);
  const dfu = comp.df(u);
  const chain = dfu * du;
  const numeric = (h(x + H) - h(x - H)) / (2 * H);
  const match = Math.abs(chain - numeric) < 0.03;
  const range = yRange(h, comp.xMin, comp.xMax);
  const curve = pathOf(h, comp.xMin, comp.xMax, range.yMin, range.yMax);

  return (
    <VizPanel>
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-[var(--fg)]">{t('idea')}</p>
        <div className="flex flex-wrap gap-2">
          {COMPS.map((c, i) => (
            <button
              key={c.label}
              type="button"
              onClick={() => setIdx(i)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                i === idx
                  ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'border-[var(--border)] text-[var(--fg-muted)] hover:border-[var(--accent-strong)]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-4 py-3 text-sm">
          <span className="rounded-md bg-[var(--accent-soft)] px-2 py-1 font-mono">x</span>
          <span className="text-[var(--fg-muted)]">→</span>
          <span className="rounded-md bg-[#f59e0b]/15 px-2 py-1 font-mono text-[#f59e0b]">g(x)={fmt(u, 3)}</span>
          <span className="text-[var(--fg-muted)]">→</span>
          <span className="rounded-md bg-[var(--accent-soft)] px-2 py-1 font-mono">f(g(x))</span>
        </div>
        <ControlsStack>
          <SliderRow label={t('xLabel')} value={x} min={comp.xMin + 0.2} max={comp.xMax - 0.2} step={0.05} onChange={setX} />
        </ControlsStack>
        <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="w-full rounded-lg border border-[var(--border)] bg-[var(--formula-bg)]">
          <path d={curve} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
          <circle cx={toX(x, comp.xMin, comp.xMax)} cy={toY(h(x), range.yMin, range.yMax)} r={5} fill="var(--accent-strong)" />
        </svg>
        <dl className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-[var(--fg-muted)]">g′(x)</dt>
            <dd className="font-mono font-semibold text-[#f59e0b]">{fmt(du, 4)}</dd>
          </div>
          <div>
            <dt className="text-[var(--fg-muted)]">f′(g(x))</dt>
            <dd className="font-mono font-semibold text-[#3b82f6]">{fmt(dfu, 4)}</dd>
          </div>
          <div>
            <dt className="text-[var(--fg-muted)]">(f∘g)′</dt>
            <dd className="font-mono font-semibold">{fmt(chain, 4)}</dd>
          </div>
          <div>
            <dt className="text-[var(--fg-muted)]">{t('numeric')}</dt>
            <dd className={`font-mono font-semibold ${match ? 'text-[#22c55e]' : ''}`}>{fmt(numeric, 4)}</dd>
          </div>
        </dl>
        <p className="text-center font-mono text-sm text-[var(--fg-muted)]">
          (f∘g)′(x) = f′(g(x)) · g′(x) = {fmt(dfu, 3)} × {fmt(du, 3)}
        </p>
        <p className="text-xs text-[var(--fg-muted)]">{match ? t('match') : t('note')}</p>
      </div>
    </VizPanel>
  );
}
