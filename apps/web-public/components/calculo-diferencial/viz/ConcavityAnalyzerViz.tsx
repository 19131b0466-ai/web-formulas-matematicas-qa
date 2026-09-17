'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { VizPanel } from '@/components/algebra/viz/controls';
import { fmt } from '@/components/calculo/viz/calcMath';
import { PLOT_H, PLOT_M, PLOT_W, pathOf, toX, toY, yRange } from './plotUtils';

type FnTriple = {
  label: string;
  f: (x: number) => number;
  df: (x: number) => number;
  ddf: (x: number) => number;
  xMin: number;
  xMax: number;
};

const PRESETS: FnTriple[] = [
  {
    label: 'x³ − 3x',
    f: (x) => x ** 3 - 3 * x,
    df: (x) => 3 * x * x - 3,
    ddf: (x) => 6 * x,
    xMin: -2.2,
    xMax: 2.2,
  },
  {
    label: 'x⁴ − 4x²',
    f: (x) => x ** 4 - 4 * x * x,
    df: (x) => 4 * x ** 3 - 8 * x,
    ddf: (x) => 12 * x * x - 8,
    xMin: -2.2,
    xMax: 2.2,
  },
  {
    label: 'sen x',
    f: Math.sin,
    df: Math.cos,
    ddf: (x) => -Math.sin(x),
    xMin: -Math.PI,
    xMax: Math.PI,
  },
];

const H = 0.08;
const PANEL_H = PLOT_H * 0.62;

function SignBands({
  signFn,
  xMin,
  xMax,
  pos,
  neg,
}: {
  signFn: (x: number) => number;
  xMin: number;
  xMax: number;
  pos: string;
  neg: string;
}) {
  const steps = Math.floor((xMax - xMin) / H);
  const bandH = PANEL_H - PLOT_M.t - PLOT_M.b;
  return (
    <>
      {Array.from({ length: steps }, (_, i) => {
        const x0 = xMin + i * H;
        const x1 = x0 + H;
        const mid = (x0 + x1) / 2;
        const val = signFn(mid);
        if (!isFinite(val) || Math.abs(val) < 0.02) return null;
        const sx = toX(x0, xMin, xMax);
        const sw = toX(x1, xMin, xMax) - sx;
        return (
          <rect
            key={i}
            x={sx}
            y={PLOT_M.t}
            width={sw}
            height={bandH}
            fill={val > 0 ? pos : neg}
            opacity={0.12}
          />
        );
      })}
    </>
  );
}

function MiniPanel({
  label,
  fn,
  xMin,
  xMax,
  bands,
}: {
  label: string;
  fn: (x: number) => number;
  xMin: number;
  xMax: number;
  bands?: { pos: string; neg: string; signFn: (x: number) => number };
}) {
  const range = yRange(fn, xMin, xMax);
  const curve = pathOf(fn, xMin, xMax, range.yMin, range.yMax, PANEL_H);

  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">{label}</p>
      <svg viewBox={`0 0 ${PLOT_W} ${PANEL_H}`} className="w-full rounded-lg border border-[var(--border)] bg-[var(--formula-bg)]">
        {bands ? <SignBands signFn={bands.signFn} xMin={xMin} xMax={xMax} pos={bands.pos} neg={bands.neg} /> : null}
        <line
          x1={PLOT_M.l}
          y1={toY(0, range.yMin, range.yMax, PANEL_H)}
          x2={PLOT_W - PLOT_M.r}
          y2={toY(0, range.yMin, range.yMax, PANEL_H)}
          stroke="var(--border)"
        />
        <path d={curve} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
      </svg>
    </div>
  );
}

export function ConcavityAnalyzerViz() {
  const t = useTranslations('vizDif.concavity');
  const [idx, setIdx] = useState(0);
  const preset = PRESETS[idx]!;
  const { f, df, ddf, xMin, xMax } = preset;

  const critical = useMemo(() => {
    const pts: number[] = [];
    const steps = 300;
    let prev = df(xMin);
    for (let i = 1; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const cur = df(x);
      if (prev * cur <= 0 && Math.abs(cur - prev) > 0.01) {
        pts.push(x);
      }
      prev = cur;
    }
    return pts.slice(0, 4);
  }, [df, xMin, xMax]);

  return (
    <VizPanel>
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-[var(--fg)]">{t('idea')}</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, i) => (
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
        <div className="grid gap-3">
          <MiniPanel
            label={t('fLabel')}
            fn={f}
            xMin={xMin}
            xMax={xMax}
            bands={{
              pos: '#22c55e',
              neg: '#ef4444',
              signFn: ddf,
            }}
          />
          <MiniPanel
            label={t('fpLabel')}
            fn={df}
            xMin={xMin}
            xMax={xMax}
            bands={{
              pos: '#22c55e',
              neg: '#ef4444',
              signFn: df,
            }}
          />
          <MiniPanel label={t('fppLabel')} fn={ddf} xMin={xMin} xMax={xMax} />
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-[var(--fg-muted)]">
          <span><span className="inline-block h-2 w-4 rounded bg-[#22c55e]/40" /> {t('increasing')}</span>
          <span><span className="inline-block h-2 w-4 rounded bg-[#ef4444]/40" /> {t('decreasing')}</span>
          <span>{t('concaveUp')}: f″ &gt; 0 en f</span>
          <span>{t('concaveDown')}: f″ &lt; 0 en f</span>
        </div>
        {critical.length > 0 ? (
          <p className="text-sm text-[var(--fg-muted)]">
            {t('critical')}:{' '}
            <span className="font-mono font-semibold text-[var(--accent-strong)]">
              {critical.map((x) => fmt(x, 3)).join(', ')}
            </span>
          </p>
        ) : null}
      </div>
    </VizPanel>
  );
}
