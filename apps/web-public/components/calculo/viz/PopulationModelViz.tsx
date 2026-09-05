'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, ToggleRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { fmt } from './calcMath';

type Mode = 'grow' | 'decay' | 'logistic';

const W = 520;
const HS = 240;
const HP = 180;
const M = { l: 52, r: 16, t: 12, b: 32 };

export function PopulationModelViz({ initialMode = 'logistic' }: { initialMode?: Mode }) {
  const statusId = useId();
  const t = useTranslations('vizCalc');
  const [mode, setMode] = useState<Mode>(initialMode);
  const [K, setK] = useState(4);
  const [y0, setY0] = useState(0.6);
  const [r, setR] = useState(0.8);
  const [T, setT] = useState(10);
  const [t0, setT0] = useState(3);
  const [phase, setPhase] = useState(true);

  const y = (t: number) => {
    if (mode === 'grow') return y0 * Math.exp(r * t);
    if (mode === 'decay') return y0 * Math.exp(-r * t);
    const A = (K - y0) / Math.max(y0, 1e-6);
    return K / (1 + A * Math.exp(-r * t));
  };
  const yp = (val: number) => {
    if (mode === 'grow') return r * val;
    if (mode === 'decay') return -r * val;
    return r * val * (1 - val / K);
  };

  const yMax = Math.max(K * 1.4, y(T), y0, 1) * 1.1;
  const toX = (t: number) => M.l + (t / T) * (W - M.l - M.r);
  const toY = (v: number, H: number) => M.t + ((yMax - v) / yMax) * (H - M.t - M.b);
  let curve = '';
  for (let i = 0; i <= 200; i++) {
    const t = (i / 200) * T;
    curve += `${i === 0 ? 'M' : 'L'}${toX(t)},${toY(y(t), HS)}`;
  }

  const yNow = y(t0);
  const ypNow = yp(yNow);
  const yPhaseMax = K * 1.5;
  const ypMax = Math.max(Math.abs(yp(K / 2)), Math.abs(yp(y0)), 0.4);
  const toYph = (v: number) => M.t + ((ypMax - v) / (2 * ypMax)) * (HP - M.t - M.b);
  const toXph = (v: number) => M.l + (v / yPhaseMax) * (W - M.l - M.r);
  let phasePath = '';
  for (let i = 0; i <= 80; i++) {
    const yy = (i / 80) * yPhaseMax;
    phasePath += `${i === 0 ? 'M' : 'L'}${toXph(yy)},${toYph(yp(yy))}`;
  }

  const behavior = mode === 'grow' ? 'y → ∞' : mode === 'decay' ? 'y → 0' : 'y → K';
  const edo = mode === 'grow' ? 'ky' : mode === 'decay' ? '−ky' : 'ry(1−y/K)';

  return (
    <VizPanel>
      <div className="space-y-4">
        <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">{t('population.idea')}</p>
        <ButtonRow>
          <VizButton active={mode === 'grow'} onClick={() => setMode('grow')}>
            {t('population.grow')}
          </VizButton>
          <VizButton active={mode === 'decay'} onClick={() => setMode('decay')}>
            {t('population.decay')}
          </VizButton>
          <VizButton active={mode === 'logistic'} onClick={() => setMode('logistic')}>
            {t('population.logistic')}
          </VizButton>
        </ButtonRow>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)]">
          <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">y(t)</p>
          <svg viewBox={`0 0 ${W} ${HS}`} className="h-auto w-full" role="img" aria-labelledby={statusId}>
            {mode === 'logistic' ? (
              <line x1={M.l} y1={toY(K, HS)} x2={W - M.r} y2={toY(K, HS)} stroke="orange" strokeDasharray="4 3" />
            ) : null}
            <path d={curve} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
            <circle cx={toX(t0)} cy={toY(yNow, HS)} r={5} fill="orange" />
          </svg>
        </div>
        {phase ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)]">
            <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">y′ vs y</p>
            <svg viewBox={`0 0 ${W} ${HP}`} className="h-auto w-full">
              <line x1={M.l} y1={toYph(0)} x2={W - M.r} y2={toYph(0)} stroke="currentColor" opacity={0.3} />
              <path d={phasePath} fill="none" stroke="#3b82f6" strokeWidth={2} />
              <circle cx={toXph(0)} cy={toYph(0)} r={4} fill="#ef4444" />
              {mode === 'logistic' ? <circle cx={toXph(K)} cy={toYph(0)} r={4} fill="#22c55e" /> : null}
              <circle cx={toXph(yNow)} cy={toYph(ypNow)} r={5} fill="orange" />
            </svg>
          </div>
        ) : null}
        <div id={statusId} className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-xs" aria-live="polite">
          dy/dt = {edo} · y(t₀)={fmt(yNow)} · y′={fmt(ypNow)} · {behavior}
        </div>
        <ControlsStack>
          <SliderRow label={`y₀ = ${fmt(y0, 2)}`} value={y0} min={0.05} max={Math.max(2 * K, 2)} step={0.05} onChange={setY0} />
          <SliderRow label={`r = ${fmt(r, 1)}`} value={r} min={0.1} max={3} step={0.1} onChange={setR} />
          {mode === 'logistic' ? <SliderRow label={`K = ${fmt(K, 1)}`} value={K} min={0.5} max={10} step={0.5} onChange={setK} /> : null}
          <SliderRow label={`T = ${fmt(T, 0)}`} value={T} min={1} max={20} step={1} onChange={setT} />
          <SliderRow label={`t₀ = ${fmt(t0, 1)}`} value={t0} min={0} max={T} step={0.1} onChange={setT0} />
          <ToggleRow label={t('population.showPhase')} checked={phase} onChange={setPhase} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
