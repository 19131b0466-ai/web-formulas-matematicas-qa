'use client';

import { useId, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, ToggleRow, VizPanel } from '@/components/algebra/viz/controls';
import { findZeros, fmt, integrate, safeEval } from './calcMath';

type FnOpt = { label: string; f: (x: number) => number; aDefault: number; bDefault: number };
const FNS: FnOpt[] = [
  { label: 'x²', f: (x) => x * x, aDefault: 0, bDefault: 2 },
  { label: 'sen(x)', f: (x) => Math.sin(x), aDefault: 0, bDefault: Math.PI },
  { label: 'eˣ', f: (x) => Math.exp(x), aDefault: 0, bDefault: 1 },
  { label: 'x(4−x)', f: (x) => x * (4 - x), aDefault: 0, bDefault: 4 },
  { label: 'cos(x)', f: (x) => Math.cos(x), aDefault: 0, bDefault: Math.PI / 2 },
];

const W = 500;
const H = 280;
const M = { l: 44, r: 16, t: 16, b: 36 };

function toX(x: number, a: number, b: number) {
  return M.l + ((x - a) / (b - a || 1)) * (W - M.l - M.r);
}
function toY(y: number, yMin: number, yMax: number) {
  return M.t + ((yMax - y) / (yMax - yMin || 1)) * (H - M.t - M.b);
}

export function AverageValueViz() {
  const t = useTranslations('vizCalc');
  const statusId = useId();
  const [idx, setIdx] = useState(0);
  const [showRect, setShowRect] = useState(true);
  const [showC, setShowC] = useState(true);
  const fn = FNS[idx]!;
  const [a, setA] = useState(fn.aDefault);
  const [b, setB] = useState(fn.bDefault);

  const handle = (i: number) => {
    setIdx(i);
    setA(FNS[i]!.aDefault);
    setB(FNS[i]!.bDefault);
  };

  const area = useMemo(() => integrate(fn.f, a, b), [fn, a, b]);
  const avg = area / (b - a);
  const cs = useMemo(() => findZeros((x) => fn.f(x) - avg, a, b), [fn, a, b, avg]);

  const { yMin, yMax } = useMemo(() => {
    const ys: number[] = [0, avg];
    for (let i = 0; i <= 200; i++) {
      const y = safeEval(fn.f, a + (i / 200) * (b - a));
      if (isFinite(y)) ys.push(y);
    }
    const lo = Math.min(...ys);
    const hi = Math.max(...ys);
    const pad = (hi - lo) * 0.12 || 0.4;
    return { yMin: lo - pad, yMax: hi + pad };
  }, [fn, a, b, avg]);

  const y0 = toY(Math.max(yMin, Math.min(yMax, 0)), yMin, yMax);
  let curve = '';
  let shade = `M${toX(a, a, b)},${y0}`;
  let on = false;
  for (let i = 0; i <= 320; i++) {
    const x = a + (i / 320) * (b - a);
    const y = safeEval(fn.f, x);
    if (!isFinite(y)) {
      on = false;
      continue;
    }
    const sx = toX(x, a, b);
    const sy = toY(y, yMin, yMax);
    curve += on ? ` L${sx},${sy}` : `M${sx},${sy}`;
    shade += ` L${sx},${sy}`;
    on = true;
  }
  shade += ` L${toX(b, a, b)},${y0} Z`;

  const ay = toY(avg, yMin, yMax);
  const rectH = Math.abs(ay - y0);

  return (
    <VizPanel>
      <div className="space-y-4">
        <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">{t('average.idea')}</p>
        <div className="flex flex-wrap gap-2">
          {FNS.map((opt, i) => (
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
              {opt.label}
            </button>
          ))}
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-2xl" role="img" aria-labelledby={statusId}>
            <path d={shade} fill="#3b82f6" fillOpacity={0.2} />
            {showRect ? (
              <rect
                x={toX(a, a, b)}
                y={Math.min(ay, y0)}
                width={toX(b, a, b) - toX(a, a, b)}
                height={rectH}
                fill="#22c55e"
                fillOpacity={0.18}
                stroke="#22c55e"
              />
            ) : null}
            <line x1={M.l} y1={ay} x2={W - M.r} y2={ay} stroke="#ef4444" strokeDasharray="5 3" />
            <path d={curve} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
            {showC
              ? cs.map((c) => (
                  <g key={c}>
                    <line x1={toX(c, a, b)} y1={M.t} x2={toX(c, a, b)} y2={H - M.b} stroke="orange" strokeDasharray="3 3" opacity={0.7} />
                    <circle cx={toX(c, a, b)} cy={toY(fn.f(c), yMin, yMax)} r={5} fill="orange" />
                  </g>
                ))
              : null}
          </svg>
        </div>
        <div id={statusId} className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-xs" aria-live="polite">
          <p>
            f_prom = {fmt(avg)} · c ≈ {cs.length ? cs.map((c) => fmt(c, 2)).join(', ') : '—'}
          </p>
          <p>{t('average.areaEq')} = {fmt(area)}</p>
        </div>
        <ControlsStack>
          <SliderRow label={`a = ${fmt(a, 2)}`} value={a} min={-3} max={b - 0.5} step={0.25} onChange={setA} />
          <SliderRow label={`b = ${fmt(b, 2)}`} value={b} min={a + 0.5} max={5} step={0.25} onChange={setB} />
          <ToggleRow label={t('average.showRect')} checked={showRect} onChange={setShowRect} />
          <ToggleRow label={t('average.showC')} checked={showC} onChange={setShowC} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
