'use client';

import { useId, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, ToggleRow, VizPanel } from '@/components/algebra/viz/controls';
import { derivative, fmt, integrate, safeEval } from './calcMath';

type FnOpt = {
  label: string;
  f: (x: number) => number;
  df?: (x: number) => number;
  aDefault: number;
  bDefault: number;
};

const FNS: FnOpt[] = [
  { label: 'x²', f: (x) => x * x, df: (x) => 2 * x, aDefault: 0, bDefault: 2 },
  { label: 'sen(x)', f: (x) => Math.sin(x), df: (x) => Math.cos(x), aDefault: 0, bDefault: Math.PI },
  { label: 'x^(3/2)', f: (x) => Math.pow(Math.max(0, x), 1.5), df: (x) => (x > 0 ? 1.5 * Math.sqrt(x) : 0), aDefault: 0, bDefault: 4 },
  { label: 'ln(x)', f: (x) => Math.log(x), df: (x) => 1 / x, aDefault: 1, bDefault: 4 },
  { label: 'cosh(x)', f: (x) => Math.cosh(x), df: (x) => Math.sinh(x), aDefault: 0, bDefault: 1.5 },
];

const W = 500;
const H = 260;
const HC = 160;
const M = { l: 44, r: 16, t: 16, b: 32 };
const MC = { l: 60, r: 16, t: 12, b: 32 };

function toX(x: number, a: number, b: number, Wd: number, m: { l: number; r: number }) {
  return m.l + ((x - a) / (b - a || 1)) * (Wd - m.l - m.r);
}
function toY(y: number, yMin: number, yMax: number, Hd: number, m: { t: number; b: number }) {
  return m.t + ((yMax - y) / (yMax - yMin || 1)) * (Hd - m.t - m.b);
}

function polylineLength(f: (x: number) => number, a: number, b: number, n: number): number {
  const dx = (b - a) / n;
  let L = 0;
  for (let i = 0; i < n; i++) {
    const x0 = a + i * dx;
    const x1 = x0 + dx;
    const y0 = safeEval(f, x0);
    const y1 = safeEval(f, x1);
    if (isFinite(y0) && isFinite(y1)) L += Math.hypot(dx, y1 - y0);
  }
  return L;
}

export function ArcLengthViz() {
  const statusId = useId();
  const t = useTranslations('vizCalc');
  const [idx, setIdx] = useState(0);
  const [n, setN] = useState(6);
  const [showConv, setShowConv] = useState(true);
  const [highlight, setHighlight] = useState(true);
  const [hover, setHover] = useState<number | null>(null);
  const fn = FNS[idx]!;
  const [a, setA] = useState(fn.aDefault);
  const [b, setB] = useState(fn.bDefault);

  const handleFn = (i: number) => {
    setIdx(i);
    setA(FNS[i]!.aDefault);
    setB(FNS[i]!.bDefault);
  };

  const L = useMemo(() => {
    const dfn = fn.df ?? ((x: number) => derivative(fn.f, x));
    return integrate((x) => Math.sqrt(1 + dfn(x) ** 2), a, b);
  }, [fn, a, b]);
  const Ln = useMemo(() => polylineLength(fn.f, a, b, n), [fn, a, b, n]);

  const segs = useMemo(() => {
    const dx = (b - a) / n;
    return Array.from({ length: n }, (_, i) => {
      const x0 = a + i * dx;
      const x1 = x0 + dx;
      const y0 = safeEval(fn.f, x0);
      const y1 = safeEval(fn.f, x1);
      return { x0, x1, y0, y1, len: Math.hypot(dx, y1 - y0) };
    });
  }, [fn, a, b, n]);

  const { yMin, yMax } = useMemo(() => {
    const ys: number[] = [0];
    for (let i = 0; i <= 200; i++) {
      const y = safeEval(fn.f, a + (i / 200) * (b - a));
      if (isFinite(y)) ys.push(y);
    }
    const lo = Math.min(...ys);
    const hi = Math.max(...ys);
    const pad = (hi - lo) * 0.12 || 0.4;
    return { yMin: lo - pad, yMax: hi + pad };
  }, [fn, a, b]);

  const curve = useMemo(() => {
    let d = '';
    let on = false;
    for (let i = 0; i <= 360; i++) {
      const x = a + (i / 360) * (b - a);
      const y = safeEval(fn.f, x);
      if (!isFinite(y)) {
        on = false;
        continue;
      }
      const sx = toX(x, a, b, W, M);
      const sy = toY(y, yMin, yMax, H, M);
      d += on ? ` L${sx},${sy}` : `M${sx},${sy}`;
      on = true;
    }
    return d;
  }, [fn, a, b, yMin, yMax]);

  const conv = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => {
      const k = i + 2;
      return { k, L: polylineLength(fn.f, a, b, k) };
    });
  }, [fn, a, b]);

  const y0 = toY(Math.max(yMin, Math.min(yMax, 0)), yMin, yMax, H, M);
  const cMax = Math.max(L, ...conv.map((c) => c.L)) * 1.05;
  const cMin = Math.min(L, ...conv.map((c) => c.L)) * 0.95;

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">{t('arc.idea')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {FNS.map((opt, i) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => handleFn(i)}
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
            <path d={`${curve} L${toX(b, a, b, W, M)},${y0} L${toX(a, a, b, W, M)},${y0} Z`} fill="var(--accent-strong)" fillOpacity={0.08} />
            <path d={curve} fill="none" stroke="#3b82f6" strokeWidth={2.2} />
            {segs.map((s, i) => {
              const x1 = toX(s.x0, a, b, W, M);
              const y1 = toY(s.y0, yMin, yMax, H, M);
              const x2 = toX(s.x1, a, b, W, M);
              const y2 = toY(s.y1, yMin, yMax, H, M);
              const active = hover === i;
              const dim = highlight && hover !== null && !active;
              return (
                <g key={i}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="transparent"
                    strokeWidth={18}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                  />
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="orange"
                    strokeWidth={highlight && active ? 4 : 2}
                    opacity={dim ? 0.25 : 0.95}
                    pointerEvents="none"
                  />
                </g>
              );
            })}
            {hover !== null && segs[hover] ? (
              <text
                x={toX((segs[hover].x0 + segs[hover].x1) / 2, a, b, W, M)}
                y={toY((segs[hover].y0 + segs[hover].y1) / 2, yMin, yMax, H, M) - 8}
                textAnchor="middle"
                fontSize={10}
                fill="currentColor"
              >
                {fmt(segs[hover].len, 3)}
              </text>
            ) : null}
          </svg>
        </div>

        {showConv ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)]">
            <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">Convergencia Lₙ</p>
            <svg viewBox={`0 0 ${W} ${HC}`} className="mx-auto h-auto w-full max-w-2xl">
              <line
                x1={MC.l}
                y1={toY(L, cMin, cMax, HC, MC)}
                x2={W - MC.r}
                y2={toY(L, cMin, cMax, HC, MC)}
                stroke="orange"
                strokeDasharray="4 3"
              />
              <path
                d={conv
                  .map((c, i) => `${i === 0 ? 'M' : 'L'}${toX(c.k, 2, 26, W, MC)},${toY(c.L, cMin, cMax, HC, MC)}`)
                  .join(' ')}
                fill="none"
                stroke="var(--accent-strong)"
                strokeWidth={1.6}
              />
              <circle cx={toX(n, 2, 26, W, MC)} cy={toY(Ln, cMin, cMax, HC, MC)} r={5} fill="orange" />
            </svg>
          </div>
        ) : null}

        <div id={statusId} className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-xs" aria-live="polite">
          <p>
            Lₙ (n={n}) = {fmt(Ln)} · L = {fmt(L)} · error = {fmt(Math.abs(Ln - L))}
          </p>
        </div>

        <ControlsStack>
          <SliderRow label={`n = ${n}`} value={n} min={2} max={50} step={1} onChange={(v) => setN(Math.round(v))} />
          <SliderRow label={`a = ${fmt(a, 2)}`} value={a} min={fn.label === 'ln(x)' ? 0.5 : -3} max={b - 0.5} step={0.5} onChange={setA} />
          <SliderRow label={`b = ${fmt(b, 2)}`} value={b} min={a + 0.5} max={6} step={0.5} onChange={setB} />
          <ToggleRow label={t('arc.showConv')} checked={showConv} onChange={setShowConv} />
          <ToggleRow label={t('arc.highlightSegs')} checked={highlight} onChange={setHighlight} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
