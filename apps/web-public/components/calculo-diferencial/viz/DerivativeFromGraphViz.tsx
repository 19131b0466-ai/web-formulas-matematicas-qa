'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { fmt } from '@/components/calculo/viz/calcMath';
import { PLOT_H, PLOT_M, PLOT_W, pathOf, toX, toY, yRange } from './plotUtils';

type Motion = {
  label: string;
  s: (t: number) => number;
  v: (t: number) => number;
  a: (t: number) => number;
  tMin: number;
  tMax: number;
};

const MOTIONS: Motion[] = [
  {
    label: 't³ − 3t',
    s: (t) => t ** 3 - 3 * t,
    v: (t) => 3 * t * t - 3,
    a: (t) => 6 * t,
    tMin: -2,
    tMax: 2,
  },
  {
    label: 'sen(t)',
    s: (t) => Math.sin(t),
    v: (t) => Math.cos(t),
    a: (t) => -Math.sin(t),
    tMin: 0,
    tMax: 2 * Math.PI,
  },
  {
    label: 't²',
    s: (t) => t * t,
    v: (t) => 2 * t,
    a: () => 2,
    tMin: -2,
    tMax: 2,
  },
];

const H = 0.001;

function centralDiff(fn: (x: number) => number, x: number) {
  return (fn(x + H) - fn(x - H)) / (2 * H);
}

type Props = { mode?: string };

function MiniPlot({
  label,
  fn,
  tMin,
  tMax,
  t,
  color,
  tangentSlope,
}: {
  label: string;
  fn: (t: number) => number;
  tMin: number;
  tMax: number;
  t: number;
  color: string;
  tangentSlope?: number;
}) {
  const h = PLOT_H * 0.72;
  const range = yRange(fn, tMin, tMax);
  const curve = pathOf(fn, tMin, tMax, range.yMin, range.yMax);
  const y = fn(t);

  const tangent =
    tangentSlope !== undefined && isFinite(tangentSlope)
      ? (() => {
          const span = (tMax - tMin) * 0.18;
          const t1 = t - span;
          const t2 = t + span;
          const y1 = y + tangentSlope * (t1 - t);
          const y2 = y + tangentSlope * (t2 - t);
          return `M${toX(t1, tMin, tMax)},${toY(y1, range.yMin, range.yMax, h)} L${toX(t2, tMin, tMax)},${toY(y2, range.yMin, range.yMax, h)}`;
        })()
      : '';

  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">{label}</p>
      <svg viewBox={`0 0 ${PLOT_W} ${h}`} className="w-full rounded-lg border border-[var(--border)] bg-[var(--formula-bg)]">
        <path d={curve} fill="none" stroke={color} strokeWidth={2} />
        {tangent ? (
          <path d={tangent} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 3" />
        ) : null}
        <line
          x1={toX(t, tMin, tMax)}
          y1={PLOT_M.t}
          x2={toX(t, tMin, tMax)}
          y2={h - PLOT_M.b}
          stroke="var(--fg-muted)"
          strokeDasharray="4 3"
          opacity={0.5}
        />
        <circle cx={toX(t, tMin, tMax)} cy={toY(y, range.yMin, range.yMax, h)} r={4} fill={color} />
      </svg>
      <p className="mt-1 font-mono text-xs text-[var(--fg-muted)]">{fmt(y, 4)}</p>
    </div>
  );
}

export function DerivativeFromGraphViz({ mode = 'kinematics' }: Props) {
  const t = useTranslations('vizDif.kinematics');
  const [idx, setIdx] = useState(0);
  const motion = MOTIONS[idx]!;
  const [time, setTime] = useState(0.5);
  const showAccel = mode === 'kinematics_accel';

  const sVal = motion.s(time);
  const vVal = motion.v(time);
  const aVal = motion.a(time);
  const vNumeric = useMemo(() => centralDiff(motion.s, time), [motion, time]);
  const aNumeric = useMemo(() => centralDiff(motion.v, time), [motion, time]);
  const vMatch = Math.abs(vNumeric - vVal) < 0.02;
  const aMatch = Math.abs(aNumeric - aVal) < 0.05;

  return (
    <VizPanel>
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-[var(--fg)]">
          {showAccel ? t('ideaAccel') : t('ideaVelocity')}
        </p>
        <div className="flex flex-wrap gap-2">
          {MOTIONS.map((m, i) => (
            <button
              key={m.label}
              type="button"
              onClick={() => setIdx(i)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                i === idx
                  ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'border-[var(--border)] text-[var(--fg-muted)] hover:border-[var(--accent-strong)]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <ControlsStack>
          <SliderRow
            label={t('timeLabel')}
            value={time}
            min={motion.tMin}
            max={motion.tMax}
            step={0.05}
            onChange={setTime}
          />
        </ControlsStack>
        <div className={`grid gap-4 ${showAccel ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
          <MiniPlot
            label={t('position')}
            fn={motion.s}
            tMin={motion.tMin}
            tMax={motion.tMax}
            t={time}
            color="var(--accent-strong)"
            tangentSlope={vVal}
          />
          <MiniPlot label={t('velocity')} fn={motion.v} tMin={motion.tMin} tMax={motion.tMax} t={time} color="#f59e0b" />
          {showAccel ? (
            <MiniPlot
              label={t('acceleration')}
              fn={motion.a}
              tMin={motion.tMin}
              tMax={motion.tMax}
              t={time}
              color="#22c55e"
            />
          ) : null}
        </div>
        <dl className={`grid gap-2 text-sm ${showAccel ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
          <div>
            <dt className="text-[var(--fg-muted)]">s(t)</dt>
            <dd className="font-mono font-semibold">{fmt(sVal, 4)}</dd>
          </div>
          <div>
            <dt className="text-[var(--fg-muted)]">v(t) = s′(t)</dt>
            <dd className="font-mono font-semibold">{fmt(vVal, 4)}</dd>
          </div>
          <div>
            <dt className="text-[var(--fg-muted)]">{t('slopeNumeric')}</dt>
            <dd className={`font-mono font-semibold ${vMatch ? 'text-[#22c55e]' : ''}`}>{fmt(vNumeric, 4)}</dd>
          </div>
          {showAccel ? (
            <div>
              <dt className="text-[var(--fg-muted)]">a(t) = s″(t)</dt>
              <dd className="font-mono font-semibold">{fmt(aVal, 4)}</dd>
            </div>
          ) : null}
        </dl>
        <p className="text-xs text-[var(--fg-muted)]">
          {t('slopeCheck')}: {vMatch ? t('slopeMatch') : t('slopeMismatch')}
          {showAccel ? ` · a(t): ${aMatch ? t('slopeMatch') : t('slopeMismatch')}` : ''}
        </p>
        <p className="text-xs text-[var(--fg-muted)]">{t('note')}</p>
      </div>
    </VizPanel>
  );
}
