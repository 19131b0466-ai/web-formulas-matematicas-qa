'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { fmt } from '@/components/calculo/viz/calcMath';
import { PLOT_H, PLOT_M, PLOT_W, pathOf, toX, toY, yRange } from './plotUtils';

type Preset = {
  label: string;
  f: (x: number) => number;
  df: (x: number) => number;
  a: number;
  xMin: number;
  xMax: number;
};

const PRESETS: Preset[] = [
  { label: '√x', f: Math.sqrt, df: (x) => 0.5 / Math.sqrt(x), a: 4, xMin: 0, xMax: 9 },
  { label: 'sen x', f: Math.sin, df: Math.cos, a: 0.5, xMin: -1, xMax: 2.5 },
  { label: 'eˣ', f: Math.exp, df: Math.exp, a: 0, xMin: -1.5, xMax: 2 },
];

export function LinearApproximationViz() {
  const t = useTranslations('vizDif.linearApprox');
  const [idx, setIdx] = useState(0);
  const preset = PRESETS[idx]!;
  const [x, setX] = useState(preset.a + 0.4);

  const { f, df, a, xMin, xMax } = preset;
  const fa = f(a);
  const m = df(a);
  const L = (v: number) => fa + m * (v - a);
  const range = yRange((v) => Math.max(f(v), L(v)), xMin, xMax);
  const fCurve = pathOf(f, xMin, xMax, range.yMin, range.yMax);
  const lCurve = useMemo(() => pathOf(L, xMin, xMax, range.yMin, range.yMax), [L, xMin, xMax, range.yMin, range.yMax]);
  const error = f(x) - L(x);

  return (
    <VizPanel>
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-[var(--fg)]">{t('idea')}</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setIdx(i);
                setX(p.a + 0.4);
              }}
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
          <SliderRow label={t('xLabel')} value={x} min={xMin + 0.1} max={xMax - 0.1} step={0.05} onChange={setX} />
        </ControlsStack>
        <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="w-full rounded-lg border border-[var(--border)] bg-[var(--formula-bg)]">
          <path d={fCurve} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
          <path d={lCurve} fill="none" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 4" />
          <circle cx={toX(a, xMin, xMax)} cy={toY(fa, range.yMin, range.yMax)} r={5} fill="var(--accent-strong)" />
          <circle cx={toX(x, xMin, xMax)} cy={toY(f(x), range.yMin, range.yMax)} r={5} fill="#22c55e" />
        </svg>
        <dl className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-[var(--fg-muted)]">f(x)</dt>
            <dd className="font-mono font-semibold">{fmt(f(x), 4)}</dd>
          </div>
          <div>
            <dt className="text-[var(--fg-muted)]">L(x)</dt>
            <dd className="font-mono font-semibold text-[#f59e0b]">{fmt(L(x), 4)}</dd>
          </div>
          <div>
            <dt className="text-[var(--fg-muted)]">{t('error')}</dt>
            <dd className="font-mono font-semibold">{fmt(error, 4)}</dd>
          </div>
          <div>
            <dt className="text-[var(--fg-muted)]">a</dt>
            <dd className="font-mono font-semibold">{fmt(a, 2)}</dd>
          </div>
        </dl>
        <p className="text-xs text-[var(--fg-muted)]">{t('note')}</p>
      </div>
    </VizPanel>
  );
}
