'use client';

import { useId, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, ToggleRow, VizPanel } from '@/components/algebra/viz/controls';
import { fmt, integrate, safeEval } from './calcMath';

type Mode = 'p' | 'ln2' | 'exp' | 'ln';
const W = 520;
const H = 280;
const M = { l: 44, r: 16, t: 16, b: 36 };

export function IntegralTestViz() {
  const statusId = useId();
  const t = useTranslations('vizCalc');
  const [mode, setMode] = useState<Mode>('p');
  const [p, setP] = useState(2);
  const [N, setN] = useState(8);
  const [upper, setUpper] = useState(true);

  const f = (x: number) => {
    if (mode === 'p') return Math.pow(x, -p);
    if (mode === 'ln2') return x > 1.1 ? 1 / (x * Math.log(x) ** 2) : NaN;
    if (mode === 'exp') return Math.exp(-x);
    return x > 1.1 ? 1 / (x * Math.log(x)) : NaN;
  };
  const x0 = mode === 'p' || mode === 'exp' ? 1 : 2;
  const sum = useMemo(() => {
    let s = 0;
    for (let n = x0; n <= N; n++) s += safeEval(f, n) || 0;
    return s;
  }, [mode, p, N, x0]);
  const I = useMemo(() => integrate(f, x0, N), [mode, p, N, x0]);

  const yMax = Math.max(f(x0) || 1, 0.2) * 1.15;
  const toX = (x: number) => M.l + ((x - x0) / (N - x0 || 1)) * (W - M.l - M.r);
  const toY = (y: number) => M.t + ((yMax - y) / yMax) * (H - M.t - M.b);
  let curve = '';
  for (let i = 0; i <= 200; i++) {
    const x = x0 + (i / 200) * (N - x0);
    const y = safeEval(f, x);
    if (!isFinite(y)) continue;
    curve += `${i === 0 ? 'M' : 'L'}${toX(x)},${toY(y)}`;
  }

  const rects = Array.from({ length: Math.max(0, N - x0) }, (_, i) => {
    const n = upper ? x0 + i : x0 + i + 1;
    const xLeft = upper ? n : n - 1;
    const h = safeEval(f, n);
    return { xLeft, n, h };
  }).filter((r) => isFinite(r.h));

  const conv = mode === 'p' ? p > 1 : mode === 'ln' ? false : true;

  return (
    <VizPanel>
      <div className="space-y-4">
        <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">{t('intTest.idea')}</p>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'p' as const, label: '1/xᵖ' },
            { id: 'ln2' as const, label: '1/(x ln² x)' },
            { id: 'exp' as const, label: 'e⁻ˣ' },
            { id: 'ln' as const, label: '1/(x ln x)' },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setMode(opt.id)}
              className={`rounded-md border px-2 py-1 text-xs font-mono transition ${
                mode === opt.id
                  ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--accent-soft)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-2xl" role="img" aria-labelledby={statusId}>
            {rects.map((r) => (
              <rect
                key={r.n}
                x={toX(r.xLeft)}
                y={toY(r.h)}
                width={Math.max(2, toX(r.xLeft + 1) - toX(r.xLeft) - 1)}
                height={Math.max(0, toY(0) - toY(r.h))}
                fill="var(--accent-strong)"
                fillOpacity={0.22}
                stroke="var(--accent-strong)"
                strokeOpacity={0.5}
              />
            ))}
            <path d={curve} fill="none" stroke="orange" strokeWidth={2} />
          </svg>
        </div>
        <div id={statusId} className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-xs" aria-live="polite">
          <p>
            Σ f(n) = {fmt(sum)} · ∫₁ᴺ f = {fmt(I)} · {upper ? 'Σ f(n) ≥ ∫ f' : 'Σ f(n+1) ≤ ∫ f'}
          </p>
          <p>{t('intTest.criterion')} {conv ? t('intTest.critYes') : t('intTest.critNo')}</p>
        </div>
        <ControlsStack>
          <SliderRow label={`N = ${N}`} value={N} min={3} max={30} step={1} onChange={(v) => setN(Math.round(v))} />
          {mode === 'p' ? <SliderRow label={`p = ${fmt(p, 1)}`} value={p} min={0.5} max={3} step={0.1} onChange={setP} /> : null}
          <ToggleRow label={t('intTest.upper')} checked={upper} onChange={setUpper} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
