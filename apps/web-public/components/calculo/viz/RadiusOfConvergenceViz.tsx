'use client';

import { useId, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { fmt, safeEval } from './calcMath';

function fact(n: number) {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

type Series = {
  label: string;
  nameKey?: 'sinTaylor';
  f: (x: number) => number;
  Sn: (x: number, n: number) => number;
  R: number;
  a0: number;
  xMin: number;
  xMax: number;
};

const SERIES: Series[] = [
  {
    label: 'Σ xⁿ',
    f: (x) => 1 / (1 - x),
    Sn: (x, n) => {
      let s = 0;
      for (let k = 0; k <= n; k++) s += x ** k;
      return s;
    },
    R: 1,
    a0: 0,
    xMin: -1.6,
    xMax: 1.6,
  },
  {
    label: 'Σ (−1)ⁿ⁺¹ xⁿ/n',
    f: (x) => Math.log(1 + x),
    Sn: (x, n) => {
      let s = 0;
      for (let k = 1; k <= n; k++) s += ((k % 2 === 1 ? 1 : -1) * x ** k) / k;
      return s;
    },
    R: 1,
    a0: 0,
    xMin: -1.4,
    xMax: 1.4,
  },
  {
    label: 'Σ xⁿ/n!',
    f: (x) => Math.exp(x),
    Sn: (x, n) => {
      let s = 0;
      for (let k = 0; k <= n; k++) s += x ** k / fact(k);
      return s;
    },
    R: Infinity,
    a0: 0,
    xMin: -3,
    xMax: 3,
  },
  {
    label: 'sin(x)',
    nameKey: 'sinTaylor',
    f: (x) => Math.sin(x),
    Sn: (x, n) => {
      let s = 0;
      for (let k = 0; k <= n; k++) {
        const p = 2 * k + 1;
        s += ((k % 2 === 0 ? 1 : -1) * x ** p) / fact(p);
      }
      return s;
    },
    R: Infinity,
    a0: 0,
    xMin: -8,
    xMax: 8,
  },
  {
    label: 'Σ (x−1)ⁿ/2ⁿ',
    f: (x) => 2 / (3 - x),
    Sn: (x, n) => {
      let s = 0;
      for (let k = 0; k <= n; k++) s += (x - 1) ** k / 2 ** k;
      return s;
    },
    R: 2,
    a0: 1,
    xMin: -2,
    xMax: 4,
  },
];

const W = 540;
const H = 300;
const M = { l: 44, r: 16, t: 16, b: 36 };

export function RadiusOfConvergenceViz() {
  const statusId = useId();
  const t = useTranslations('vizCalc');
  const [idx, setIdx] = useState(0);
  const [n, setN] = useState(6);
  const s = SERIES[idx]!;
  const [center, setCenter] = useState(s.a0);
  const [x, setX] = useState(s.a0 + (isFinite(s.R) ? s.R * 0.4 : 1));

  const handle = (i: number) => {
    setIdx(i);
    setCenter(SERIES[i]!.a0);
    setX(SERIES[i]!.a0 + 0.3);
  };

  const R = s.R;
  const left = isFinite(R) ? center - R : s.xMin;
  const right = isFinite(R) ? center + R : s.xMax;
  const yClip = 10;
  const toXv = (v: number) => M.l + ((v - s.xMin) / (s.xMax - s.xMin)) * (W - M.l - M.r);
  const toY = (y: number) => M.t + ((yClip - y) / (2 * yClip)) * (H - M.t - M.b);

  const fPath = useMemo(() => {
    let d = '';
    let on = false;
    for (let i = 0; i <= 300; i++) {
      const xv = s.xMin + (i / 300) * (s.xMax - s.xMin);
      const y = safeEval(s.f, xv);
      if (!isFinite(y) || Math.abs(y) > yClip) {
        on = false;
        continue;
      }
      d += `${on ? 'L' : 'M'}${toXv(xv)},${toY(y)}`;
      on = true;
    }
    return d;
  }, [s]);

  const snPath = useMemo(() => {
    let d = '';
    let on = false;
    for (let i = 0; i <= 300; i++) {
      const xv = s.xMin + (i / 300) * (s.xMax - s.xMin);
      const y = s.Sn(xv, n);
      if (!isFinite(y) || Math.abs(y) > yClip) {
        on = false;
        continue;
      }
      d += `${on ? 'L' : 'M'}${toXv(xv)},${toY(y)}`;
      on = true;
    }
    return d;
  }, [s, n]);

  const inside = !isFinite(R) || Math.abs(x - center) < R - 1e-6;
  const Snx = s.Sn(x, n);
  const fx = safeEval(s.f, x);

  return (
    <VizPanel>
      <div className="space-y-4">
        <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">{t('radius.idea')}</p>
        <div className="flex flex-wrap gap-2">
          {SERIES.map((opt, i) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => handle(i)}
              className={`rounded-md border px-2 py-1 text-xs font-mono transition ${
                i === idx
                  ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--accent-soft)]'
              }`}
            >
              {opt.nameKey ? t(`radius.${opt.nameKey}`) : opt.label}
            </button>
          ))}
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-2xl" role="img" aria-labelledby={statusId}>
            {isFinite(R) ? (
              <>
                <rect x={toXv(s.xMin)} y={M.t} width={toXv(left) - toXv(s.xMin)} height={H - M.t - M.b} fill="#ef4444" fillOpacity={0.06} />
                <rect x={toXv(right)} y={M.t} width={toXv(s.xMax) - toXv(right)} height={H - M.t - M.b} fill="#ef4444" fillOpacity={0.06} />
                <rect x={toXv(left)} y={M.t} width={toXv(right) - toXv(left)} height={H - M.t - M.b} fill="#22c55e" fillOpacity={0.08} />
                <line x1={toXv(left)} y1={M.t} x2={toXv(left)} y2={H - M.b} stroke="#ef4444" />
                <line x1={toXv(right)} y1={M.t} x2={toXv(right)} y2={H - M.b} stroke="#ef4444" />
              </>
            ) : null}
            <line x1={toXv(center)} y1={M.t} x2={toXv(center)} y2={H - M.b} stroke="currentColor" strokeDasharray="4 3" opacity={0.35} />
            <path d={fPath} fill="none" stroke="#3b82f6" strokeWidth={2} />
            <path d={snPath} fill="none" stroke="orange" strokeWidth={2} opacity={0.85} />
            <line x1={toXv(x)} y1={M.t} x2={toXv(x)} y2={H - M.b} stroke="orange" strokeDasharray="3 2" opacity={0.5} />
          </svg>
        </div>
        <div id={statusId} className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-xs" aria-live="polite">
          <p>
            {s.nameKey ? t(`radius.${s.nameKey}`) : s.label} · a = {fmt(center, 1)} · R = {isFinite(R) ? fmt(R) : '∞'} · {t('radius.interval')} ({isFinite(R) ? `${fmt(left)}, ${fmt(right)}` : 'ℝ'})
          </p>
          <p>
            x = {fmt(x, 2)}: {inside ? t('common.converge') : t('common.diverge')} · Sₙ(x) = {fmt(Snx)} · f(x) = {fmt(fx)}
          </p>
        </div>
        <ControlsStack>
          <SliderRow label={`n = ${n}`} value={n} min={1} max={15} step={1} onChange={(v) => setN(Math.round(v))} />
          <SliderRow label={`x = ${fmt(x, 2)}`} value={x} min={s.xMin} max={s.xMax} step={0.05} onChange={setX} />
          {s.label.includes('x−1') ? (
            <SliderRow label={`${t('radius.center')} = ${fmt(center, 1)}`} value={center} min={0} max={2} step={0.25} onChange={setCenter} />
          ) : null}
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
