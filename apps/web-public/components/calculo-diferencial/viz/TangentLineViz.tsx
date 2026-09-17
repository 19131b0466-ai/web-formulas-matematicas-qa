'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { fmt } from '@/components/calculo/viz/calcMath';
import { PLOT_H, PLOT_M, PLOT_W, pathOf, toX, toY, yRange } from './plotUtils';

type FnPreset = {
  label: string;
  f: (x: number) => number;
  df: (x: number) => number;
  xMin: number;
  xMax: number;
  aDefault: number;
};

const PRESETS: FnPreset[] = [
  {
    label: 'x²',
    f: (x) => x * x,
    df: (x) => 2 * x,
    xMin: -2.5,
    xMax: 2.5,
    aDefault: 1,
  },
  {
    label: 'x³ − 3x',
    f: (x) => x ** 3 - 3 * x,
    df: (x) => 3 * x * x - 3,
    xMin: -2.5,
    xMax: 2.5,
    aDefault: 0.5,
  },
  {
    label: 'sen(x)',
    f: (x) => Math.sin(x),
    df: (x) => Math.cos(x),
    xMin: -Math.PI,
    xMax: Math.PI,
    aDefault: 0.8,
  },
  {
    label: 'eˣ',
    f: (x) => Math.exp(x),
    df: (x) => Math.exp(x),
    xMin: -2,
    xMax: 2,
    aDefault: 0,
  },
];

type Props = { mode?: string };

function linePath(
  a: number,
  fa: number,
  slope: number,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
) {
  const span = (xMax - xMin) * 0.35;
  const x1 = a - span;
  const x2 = a + span;
  const y1 = fa + slope * (x1 - a);
  const y2 = fa + slope * (x2 - a);
  return `M${toX(x1, xMin, xMax)},${toY(y1, yMin, yMax)} L${toX(x2, xMin, xMax)},${toY(y2, yMin, yMax)}`;
}

export function TangentLineViz({ mode = 'tangent' }: Props) {
  const t = useTranslations('vizDif.tangent');
  const isNormal = mode === 'normal';
  const [idx, setIdx] = useState(0);
  const preset = PRESETS[idx]!;
  const [a, setA] = useState(preset.aDefault);

  const handlePreset = (i: number) => {
    setIdx(i);
    setA(PRESETS[i]!.aDefault);
  };

  const { f, df, xMin, xMax } = preset;
  const fa = f(a);
  const mTan = df(a);
  const mNorm = Math.abs(mTan) > 1e-6 ? -1 / mTan : NaN;
  const range = yRange(f, xMin, xMax);

  const curve = pathOf(f, xMin, xMax, range.yMin, range.yMax);
  const tangent = useMemo(
    () => linePath(a, fa, mTan, xMin, xMax, range.yMin, range.yMax),
    [a, fa, mTan, xMin, xMax, range.yMin, range.yMax],
  );
  const normal = useMemo(() => {
    if (!isFinite(mNorm)) return '';
    return linePath(a, fa, mNorm, xMin, xMax, range.yMin, range.yMax);
  }, [a, fa, mNorm, isNormal, xMin, xMax, range.yMin, range.yMax]);

  const idea = isNormal ? t('normalIdea') : t('idea');
  const activeSlope = isNormal ? mNorm : mTan;
  const slopeLabel = isNormal ? t('normalSlope') : t('slope');
  const eqPrefix = isNormal ? t('normalEquation') : t('equation');

  return (
    <VizPanel>
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-[var(--fg)]">{idea}</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, i) => (
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
          <SliderRow label={t('aLabel')} value={a} min={xMin + 0.2} max={xMax - 0.2} step={0.05} onChange={setA} />
        </ControlsStack>
        <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="w-full rounded-lg border border-[var(--border)] bg-[var(--formula-bg)]">
          <line x1={PLOT_M.l} y1={toY(0, range.yMin, range.yMax)} x2={PLOT_W - PLOT_M.r} y2={toY(0, range.yMin, range.yMax)} stroke="var(--border)" />
          <path d={curve} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
          {isNormal ? (
            <>
              <path d={tangent} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 4" opacity={0.7} />
              {normal ? <path d={normal} fill="none" stroke="#22c55e" strokeWidth={2} /> : null}
            </>
          ) : (
            <path d={tangent} fill="none" stroke="#f59e0b" strokeWidth={2} />
          )}
          <circle cx={toX(a, xMin, xMax)} cy={toY(fa, range.yMin, range.yMax)} r={5} fill="var(--accent-strong)" />
        </svg>
        {isNormal && !isFinite(mNorm) ? (
          <p className="text-sm text-[var(--fg-muted)]">{t('horizontalTangent')}</p>
        ) : null}
        <dl className="grid gap-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[var(--fg-muted)]">f(a)</dt>
            <dd className="font-mono font-semibold">{fmt(fa, 4)}</dd>
          </div>
          <div>
            <dt className="text-[var(--fg-muted)]">{slopeLabel}</dt>
            <dd className="font-mono font-semibold text-[var(--accent-strong)]">
              {isFinite(activeSlope) ? fmt(activeSlope, 4) : '—'}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-[var(--fg-muted)]">{eqPrefix}</dt>
            <dd className="font-mono text-xs sm:text-sm">
              {isFinite(activeSlope)
                ? `y − ${fmt(fa, 3)} = ${fmt(activeSlope, 3)}(x − ${fmt(a, 3)})`
                : '—'}
            </dd>
          </div>
        </dl>
        {isNormal ? (
          <p className="text-xs text-[var(--fg-muted)]">
            {t('perpendicularNote')}: m<sub>tan</sub> = {fmt(mTan, 3)}, m<sub>norm</sub> = −1/m<sub>tan</sub>
          </p>
        ) : null}
      </div>
    </VizPanel>
  );
}
