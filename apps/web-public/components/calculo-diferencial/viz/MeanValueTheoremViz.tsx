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
  b: number;
  xMin: number;
  xMax: number;
};

const ROLLE_PRESETS: Preset[] = [
  {
    label: 'sen x en [0, π]',
    f: Math.sin,
    df: Math.cos,
    a: 0,
    b: Math.PI,
    xMin: -0.3,
    xMax: Math.PI + 0.3,
  },
  {
    label: '(x−1)(x−3)',
    f: (x) => (x - 1) * (x - 3),
    df: (x) => 2 * x - 4,
    a: 1,
    b: 3,
    xMin: 0,
    xMax: 4,
  },
  {
    label: 'x³ − 4x',
    f: (x) => x ** 3 - 4 * x,
    df: (x) => 3 * x * x - 4,
    a: -2,
    b: 2,
    xMin: -2.5,
    xMax: 2.5,
  },
];

const MVT_PRESETS: (Omit<Preset, 'a' | 'b'> & { aDefault: number; bDefault: number })[] = [
  {
    label: 'x²',
    f: (x) => x * x,
    df: (x) => 2 * x,
    aDefault: 0,
    bDefault: 2,
    xMin: -0.5,
    xMax: 2.5,
  },
  {
    label: 'sen x',
    f: Math.sin,
    df: Math.cos,
    aDefault: 0,
    bDefault: Math.PI,
    xMin: -0.3,
    xMax: Math.PI + 0.3,
  },
  {
    label: 'ln x',
    f: (x) => Math.log(x),
    df: (x) => 1 / x,
    aDefault: 1,
    bDefault: 3,
    xMin: 0.5,
    xMax: 3.5,
  },
];

type Props = { mode?: string };

function findC(df: (x: number) => number, a: number, b: number, target: number) {
  let bestX = (a + b) / 2;
  let bestErr = Infinity;
  const steps = 400;
  for (let i = 1; i < steps; i++) {
    const x = a + (i / steps) * (b - a);
    const err = Math.abs(df(x) - target);
    if (err < bestErr) {
      bestErr = err;
      bestX = x;
    }
  }
  return bestX;
}

function linePath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
) {
  return `M${toX(x1, xMin, xMax)},${toY(y1, yMin, yMax)} L${toX(x2, xMin, xMax)},${toY(y2, yMin, yMax)}`;
}

function RolleMode() {
  const t = useTranslations('vizDif.meanValueTheorem');
  const [idx, setIdx] = useState(0);
  const preset = ROLLE_PRESETS[idx]!;
  const { f, df, a, b, xMin, xMax } = preset;
  const fa = f(a);
  const fb = f(b);
  const range = yRange(f, xMin, xMax);
  const curve = pathOf(f, xMin, xMax, range.yMin, range.yMax);
  const c = useMemo(() => findC(df, a, b, 0), [df, a, b]);
  const fc = f(c);
  const tangent = useMemo(() => {
    const span = (xMax - xMin) * 0.2;
    return linePath(c - span, fc, c + span, fc, xMin, xMax, range.yMin, range.yMax);
  }, [c, fc, xMin, xMax, range.yMin, range.yMax]);

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-[var(--fg)]">{t('rolleIdea')}</p>
      <div className="flex flex-wrap gap-2">
        {ROLLE_PRESETS.map((p, i) => (
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
      <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="w-full rounded-lg border border-[var(--border)] bg-[var(--formula-bg)]">
        <path d={curve} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
        <path d={tangent} fill="none" stroke="#22c55e" strokeWidth={2} />
        <circle cx={toX(a, xMin, xMax)} cy={toY(fa, range.yMin, range.yMax)} r={5} fill="#3b82f6" />
        <circle cx={toX(b, xMin, xMax)} cy={toY(fb, range.yMin, range.yMax)} r={5} fill="#3b82f6" />
        <circle cx={toX(c, xMin, xMax)} cy={toY(fc, range.yMin, range.yMax)} r={5} fill="#22c55e" />
      </svg>
      <dl className="grid gap-2 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-[var(--fg-muted)]">f(a)</dt>
          <dd className="font-mono font-semibold">{fmt(fa, 4)}</dd>
        </div>
        <div>
          <dt className="text-[var(--fg-muted)]">f(b)</dt>
          <dd className="font-mono font-semibold">{fmt(fb, 4)}</dd>
        </div>
        <div>
          <dt className="text-[var(--fg-muted)]">c</dt>
          <dd className="font-mono font-semibold text-[#22c55e]">{fmt(c, 4)}</dd>
        </div>
        <div>
          <dt className="text-[var(--fg-muted)]">f′(c)</dt>
          <dd className="font-mono font-semibold">{fmt(df(c), 4)}</dd>
        </div>
      </dl>
    </div>
  );
}

function MvtMode() {
  const t = useTranslations('vizDif.meanValueTheorem');
  const [idx, setIdx] = useState(0);
  const base = MVT_PRESETS[idx]!;
  const [a, setA] = useState(base.aDefault);
  const [b, setB] = useState(base.bDefault);
  const { f, df, xMin, xMax } = base;

  const handlePreset = (i: number) => {
    setIdx(i);
    setA(MVT_PRESETS[i]!.aDefault);
    setB(MVT_PRESETS[i]!.bDefault);
  };

  const fa = f(a);
  const fb = f(b);
  const secantSlope = (fb - fa) / (b - a);
  const c = useMemo(() => findC(df, a, b, secantSlope), [df, a, b, secantSlope]);
  const fc = f(c);
  const range = yRange(f, xMin, xMax);
  const curve = pathOf(f, xMin, xMax, range.yMin, range.yMax);
  const secant = linePath(a, fa, b, fb, xMin, xMax, range.yMin, range.yMax);
  const tangent = useMemo(() => {
    const span = (xMax - xMin) * 0.18;
    const m = df(c);
    const y1 = fc + m * (-span);
    const y2 = fc + m * span;
    return linePath(c - span, y1, c + span, y2, xMin, xMax, range.yMin, range.yMax);
  }, [c, fc, df, xMin, xMax, range.yMin, range.yMax]);

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-[var(--fg)]">{t('mvtIdea')}</p>
      <div className="flex flex-wrap gap-2">
        {MVT_PRESETS.map((p, i) => (
          <button
            key={p.label}
            type="button"
            onClick={() => handlePreset(i)}
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
        <SliderRow label={t('aLabel')} value={a} min={xMin + 0.1} max={b - 0.15} step={0.05} onChange={setA} />
        <SliderRow label={t('bLabel')} value={b} min={a + 0.15} max={xMax - 0.1} step={0.05} onChange={setB} />
      </ControlsStack>
      <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="w-full rounded-lg border border-[var(--border)] bg-[var(--formula-bg)]">
        <path d={curve} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
        <path d={secant} fill="none" stroke="#3b82f6" strokeWidth={2} strokeDasharray="6 4" />
        <path d={tangent} fill="none" stroke="#22c55e" strokeWidth={2} />
        <circle cx={toX(a, xMin, xMax)} cy={toY(fa, range.yMin, range.yMax)} r={5} fill="#3b82f6" />
        <circle cx={toX(b, xMin, xMax)} cy={toY(fb, range.yMin, range.yMax)} r={5} fill="#3b82f6" />
        <circle cx={toX(c, xMin, xMax)} cy={toY(fc, range.yMin, range.yMax)} r={5} fill="#22c55e" />
      </svg>
      <dl className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-[var(--fg-muted)]">{t('secantSlope')}</dt>
          <dd className="font-mono font-semibold text-[#3b82f6]">{fmt(secantSlope, 4)}</dd>
        </div>
        <div>
          <dt className="text-[var(--fg-muted)]">f′(c)</dt>
          <dd className="font-mono font-semibold text-[#22c55e]">{fmt(df(c), 4)}</dd>
        </div>
        <div>
          <dt className="text-[var(--fg-muted)]">c</dt>
          <dd className="font-mono font-semibold">{fmt(c, 4)}</dd>
        </div>
        <div>
          <dt className="text-[var(--fg-muted)]">{t('parallel')}</dt>
          <dd className="font-semibold">{Math.abs(df(c) - secantSlope) < 0.05 ? t('yes') : t('approx')}</dd>
        </div>
      </dl>
    </div>
  );
}

export function MeanValueTheoremViz({ mode = 'mvt' }: Props) {
  const t = useTranslations('vizDif.meanValueTheorem');
  const body = mode === 'rolle' ? <RolleMode /> : <MvtMode />;

  return (
    <VizPanel>
      {body}
      <p className="mt-3 text-xs text-[var(--fg-muted)]">{t('note')}</p>
    </VizPanel>
  );
}
