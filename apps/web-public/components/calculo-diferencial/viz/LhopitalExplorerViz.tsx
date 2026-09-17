'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { fmt } from '@/components/calculo/viz/calcMath';

type Example = {
  label: string;
  f: (x: number) => number;
  df: (x: number) => number;
  g: (x: number) => number;
  dg: (x: number) => number;
  a: number;
  xStart: number;
};

const EXAMPLES: Example[] = [
  {
    label: 'sen x / x',
    f: Math.sin,
    df: Math.cos,
    g: (x) => x,
    dg: () => 1,
    a: 0,
    xStart: 0.8,
  },
  {
    label: '(eˣ−1) / x',
    f: (x) => Math.exp(x) - 1,
    df: Math.exp,
    g: (x) => x,
    dg: () => 1,
    a: 0,
    xStart: 0.6,
  },
  {
    label: '(1−cos x) / x²',
    f: (x) => 1 - Math.cos(x),
    df: Math.sin,
    g: (x) => x * x,
    dg: (x) => 2 * x,
    a: 0,
    xStart: 0.7,
  },
];

export function LhopitalExplorerViz() {
  const t = useTranslations('vizDif.lhopital');
  const [idx, setIdx] = useState(0);
  const ex = EXAMPLES[idx]!;
  const [x, setX] = useState(ex.xStart);

  const ratio = ex.g(x) !== 0 ? ex.f(x) / ex.g(x) : NaN;
  const ratioDeriv = ex.g(x) !== 0 ? ex.df(x) / ex.dg(x) : NaN;
  const xs = [x, x / 2, x / 4, x / 8].filter((v) => Math.abs(v) > 0.001);

  return (
    <VizPanel>
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-[var(--fg)]">{t('idea')}</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((e, i) => (
            <button
              key={e.label}
              type="button"
              onClick={() => {
                setIdx(i);
                setX(e.xStart);
              }}
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
          <SliderRow label={t('xLabel')} value={x} min={0.05} max={1.2} step={0.02} onChange={setX} />
        </ControlsStack>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-[var(--fg-muted)]">
              <th className="py-1 pr-3">x</th>
              <th className="py-1 pr-3">f(x)/g(x)</th>
              <th className="py-1">f′(x)/g′(x)</th>
            </tr>
          </thead>
          <tbody>
            {xs.map((xv) => {
              const r = ex.g(xv) !== 0 ? ex.f(xv) / ex.g(xv) : NaN;
              const rd = ex.g(xv) !== 0 && ex.dg(xv) !== 0 ? ex.df(xv) / ex.dg(xv) : NaN;
              return (
                <tr key={xv} className="border-b border-[var(--border)] font-mono">
                  <td className="py-1 pr-3">{fmt(xv, 4)}</td>
                  <td className="py-1 pr-3">{fmt(r, 6)}</td>
                  <td className="py-1 text-[var(--accent-strong)]">{fmt(rd, 6)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--fg-muted)]">f/g @ x</dt>
            <dd className="font-mono font-semibold">{fmt(ratio, 6)}</dd>
          </div>
          <div>
            <dt className="text-[var(--fg-muted)]">f′/g′ @ x</dt>
            <dd className="font-mono font-semibold text-[var(--accent-strong)]">{fmt(ratioDeriv, 6)}</dd>
          </div>
        </dl>
        <p className="text-xs text-[var(--fg-muted)]">{t('note')}</p>
      </div>
    </VizPanel>
  );
}
