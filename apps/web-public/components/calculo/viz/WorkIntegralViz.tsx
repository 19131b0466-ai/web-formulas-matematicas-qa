'use client';

import { useId, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, ToggleRow, VizPanel } from '@/components/algebra/viz/controls';
import { fmt, integrate } from './calcMath';

type Mode = 'hooke' | 'quad' | 'const' | 'tank';

const MODES: { id: Mode; label: string }[] = [
  { id: 'hooke', label: 'Resorte' },
  { id: 'quad', label: 'Fuerza x²' },
  { id: 'const', label: 'Constante' },
  { id: 'tank', label: 'Tanque' },
];

export function WorkIntegralViz() {
  const statusId = useId();
  const t = useTranslations('vizCalc');
  const [mode, setMode] = useState<Mode>('hooke');
  const [k, setK] = useState(4);
  const [b, setB] = useState(3);
  const [x, setX] = useState(2);
  const [units, setUnits] = useState(true);
  const a = 0;
  const xb = Math.min(x, b);

  const F = (s: number) => {
    if (mode === 'hooke') return k * s;
    if (mode === 'quad') return k * s * s;
    if (mode === 'const') return k;
    return k * Math.max(0, 4 - s);
  };
  const expr = mode === 'hooke' ? `${k}·x` : mode === 'quad' ? `${k}·x²` : mode === 'const' ? `${k}` : `${k}(H−y)`;
  const Wval = useMemo(() => integrate(F, a, xb), [mode, k, xb]);
  const unit = units ? ' J' : '';
  const nUnit = units ? ' N' : '';

  const WG = 480;
  const HG = 200;
  const M = { l: 52, r: 16, t: 12, b: 32 };
  const yMax = Math.max(F(b), F(a), 1) * 1.15;
  const toX = (v: number) => M.l + (v / (b || 1)) * (WG - M.l - M.r);
  const toY = (v: number) => M.t + ((yMax - v) / yMax) * (HG - M.t - M.b);
  let curve = '';
  let shade = `M${toX(a)},${toY(0)}`;
  for (let i = 0; i <= 160; i++) {
    const s = (i / 160) * xb;
    const y = F(s);
    curve += `${i === 0 ? 'M' : 'L'}${toX(s)},${toY(y)}`;
    shade += ` L${toX(s)},${toY(y)}`;
  }
  shade += ` L${toX(xb)},${toY(0)} Z`;

  const springPts = Array.from({ length: 12 }, (_, i) => {
    const t = i / 11;
    const sx = 40 + t * (80 + xb * 40);
    const sy = 90 + (i % 2 === 0 ? -18 : 18);
    return `${sx},${sy}`;
  }).join(' ');

  return (
    <VizPanel>
      <div className="space-y-4">
        <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">{t('work.idea')}</p>
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`rounded-md border px-2 py-1 text-xs transition ${
                mode === m.id
                  ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--accent-soft)]'
              }`}
            >
              {t(`work.${m.id}`)}
            </button>
          ))}
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-2">
          <svg viewBox="0 0 480 180" className="mx-auto h-auto w-full max-w-2xl">
            {mode === 'hooke' || mode === 'quad' || mode === 'const' ? (
              <>
                <polyline points={springPts} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
                <rect x={80 + xb * 40} y={70} width={36} height={40} rx={4} fill="orange" />
                <line x1={120 + xb * 40} y1={90} x2={120 + xb * 40 + F(xb) * 4} y2={90} stroke="#ef4444" strokeWidth={3} />
                <polygon
                  points={`${120 + xb * 40 + F(xb) * 4},90 ${110 + xb * 40 + F(xb) * 4},84 ${110 + xb * 40 + F(xb) * 4},96`}
                  fill="#ef4444"
                />
              </>
            ) : (
              <>
                <rect x={160} y={30} width={140} height={120} fill="none" stroke="currentColor" />
                <rect x={162} y={30 + (xb / 4) * 120} width={136} height={Math.max(4, 120 - (xb / 4) * 120)} fill="#3b82f6" fillOpacity={0.45} />
              </>
            )}
          </svg>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)]">
          <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">F(x)</p>
          <svg viewBox={`0 0 ${WG} ${HG}`} className="h-auto w-full">
            <path d={shade} fill="var(--accent-strong)" fillOpacity={0.22} />
            <path d={curve} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
            <circle cx={toX(xb)} cy={toY(F(xb))} r={5} fill="orange" />
          </svg>
        </div>
        <div id={statusId} className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-xs" aria-live="polite">
          F(x) = {expr}
          {nUnit} · W = ∫ = {fmt(Wval)}
          {unit} · [{fmt(a, 1)}, {fmt(xb, 2)}] m
        </div>
        <ControlsStack>
          <SliderRow label={`x = ${fmt(xb, 2)}`} value={xb} min={0.1} max={b} step={0.1} onChange={setX} />
          <SliderRow label={`b = ${fmt(b, 1)}`} value={b} min={1} max={6} step={0.5} onChange={setB} />
          <SliderRow label={`k = ${fmt(k, 1)}`} value={k} min={1} max={10} step={0.5} onChange={setK} />
          <ToggleRow label={t('work.showUnits')} checked={units} onChange={setUnits} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
