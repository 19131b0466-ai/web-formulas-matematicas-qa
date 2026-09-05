'use client';

import { useId, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, ToggleRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { findZeros, fmt, integrate, safeEval } from './calcMath';

type Pair = {
  label: string;
  fLabel: string;
  gLabel: string;
  f: (x: number) => number;
  g: (x: number) => number;
  aDefault: number;
  bDefault: number;
  yInv?: { c: number; d: number; right: (y: number) => number; left: (y: number) => number };
};

const PAIRS: Pair[] = [
  {
    label: 'x² y x',
    fLabel: 'x²',
    gLabel: 'x',
    f: (x) => x * x,
    g: (x) => x,
    aDefault: 0,
    bDefault: 1,
    yInv: { c: 0, d: 1, right: (y) => y, left: (y) => Math.sqrt(y) },
  },
  {
    label: '√x y x²',
    fLabel: '√x',
    gLabel: 'x²',
    f: (x) => Math.sqrt(Math.max(0, x)),
    g: (x) => x * x,
    aDefault: 0,
    bDefault: 1,
    yInv: { c: 0, d: 1, right: (y) => Math.sqrt(y), left: (y) => y * y },
  },
  {
    label: 'sen y cos',
    fLabel: 'sen(x)',
    gLabel: 'cos(x)',
    f: (x) => Math.sin(x),
    g: (x) => Math.cos(x),
    aDefault: 0,
    bDefault: (5 * Math.PI) / 4,
  },
  {
    label: '4−x² y x+2',
    fLabel: '4−x²',
    gLabel: 'x+2',
    f: (x) => 4 - x * x,
    g: (x) => x + 2,
    aDefault: -3,
    bDefault: 1,
  },
  {
    label: 'x³ y x',
    fLabel: 'x³',
    gLabel: 'x',
    f: (x) => x * x * x,
    g: (x) => x,
    aDefault: -1,
    bDefault: 1,
  },
];

const W = 520;
const H = 300;
const M = { l: 44, r: 16, t: 16, b: 36 };

function toX(x: number, a: number, b: number) {
  return M.l + ((x - a) / (b - a || 1)) * (W - M.l - M.r);
}
function toY(y: number, yMin: number, yMax: number) {
  return M.t + ((yMax - y) / (yMax - yMin || 1)) * (H - M.t - M.b);
}

export function AreaBetweenCurvesViz() {
  const t = useTranslations('vizCalc');
  const statusId = useId();
  const [idx, setIdx] = useState(0);
  const [axisY, setAxisY] = useState(false);
  const [absArea, setAbsArea] = useState(true);
  const [showX, setShowX] = useState(true);
  const pair = PAIRS[idx]!;
  const [a, setA] = useState(pair.aDefault);
  const [b, setB] = useState(pair.bDefault);

  const handlePair = (i: number) => {
    setIdx(i);
    setA(PAIRS[i]!.aDefault);
    setB(PAIRS[i]!.bDefault);
    setAxisY(false);
  };

  const zeros = useMemo(() => findZeros((x) => pair.f(x) - pair.g(x), a, b), [pair, a, b]);

  const { yMin, yMax } = useMemo(() => {
    const ys: number[] = [0];
    for (let i = 0; i <= 240; i++) {
      const x = a + (i / 240) * (b - a);
      const fy = safeEval(pair.f, x);
      const gy = safeEval(pair.g, x);
      if (isFinite(fy)) ys.push(fy);
      if (isFinite(gy)) ys.push(gy);
    }
    const lo = Math.min(...ys);
    const hi = Math.max(...ys);
    const pad = (hi - lo) * 0.12 || 0.4;
    return { yMin: lo - pad, yMax: hi + pad };
  }, [pair, a, b]);

  const pathOf = (fn: (x: number) => number) => {
    let d = '';
    let on = false;
    for (let i = 0; i <= 360; i++) {
      const x = a + (i / 360) * (b - a);
      const y = safeEval(fn, x);
      if (!isFinite(y)) {
        on = false;
        continue;
      }
      const sx = toX(x, a, b);
      const sy = toY(Math.max(yMin, Math.min(yMax, y)), yMin, yMax);
      d += on ? ` L${sx},${sy}` : `M${sx},${sy}`;
      on = true;
    }
    return d;
  };

  const bands = useMemo(() => {
    const cuts = [a, ...zeros.filter((z) => z > a + 1e-4 && z < b - 1e-4), b];
    const out: Array<{ x0: number; x1: number; top: (x: number) => number; bot: (x: number) => number; pos: boolean }> = [];
    for (let i = 0; i < cuts.length - 1; i++) {
      const x0 = cuts[i]!;
      const x1 = cuts[i + 1]!;
      const mid = (x0 + x1) / 2;
      const pos = pair.f(mid) >= pair.g(mid);
      out.push({
        x0,
        x1,
        top: pos ? pair.f : pair.g,
        bot: pos ? pair.g : pair.f,
        pos,
      });
    }
    return out;
  }, [pair, a, b, zeros]);

  const shade = (band: (typeof bands)[number], colorPos: boolean) => {
    if (!absArea && colorPos !== band.pos) return '';
    if (absArea === false && !band.pos && colorPos) return '';
    let d = '';
    const n = 80;
    for (let i = 0; i <= n; i++) {
      const x = band.x0 + (i / n) * (band.x1 - band.x0);
      const y = safeEval(band.top, x);
      d += `${i === 0 ? 'M' : 'L'}${toX(x, a, b)},${toY(y, yMin, yMax)}`;
    }
    for (let i = n; i >= 0; i--) {
      const x = band.x0 + (i / n) * (band.x1 - band.x0);
      const y = safeEval(band.bot, x);
      d += ` L${toX(x, a, b)},${toY(y, yMin, yMax)}`;
    }
    return d + ' Z';
  };

  const signed = useMemo(() => integrate((x) => pair.f(x) - pair.g(x), a, b), [pair, a, b]);
  const geometric = useMemo(() => integrate((x) => Math.abs(pair.f(x) - pair.g(x)), a, b), [pair, a, b]);
  const areaY = useMemo(() => {
    if (!pair.yInv) return null;
    const { c, d, right, left } = pair.yInv;
    return integrate((y) => Math.abs(right(y) - left(y)), c, d);
  }, [pair]);

  const y0 = toY(Math.max(yMin, Math.min(yMax, 0)), yMin, yMax);
  const canY = Boolean(pair.yInv);

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">{t('area.idea')}</p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">{t('area.note')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {PAIRS.map((p, i) => (
            <button
              key={p.label}
              type="button"
              onClick={() => handlePair(i)}
              className={`rounded-md border px-2 py-1 text-xs transition ${
                i === idx
                  ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--accent-soft)]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <ButtonRow>
          <VizButton active={!axisY} onClick={() => setAxisY(false)}>
            {t('area.wrtX')}
          </VizButton>
          <VizButton active={axisY} disabled={!canY} onClick={() => canY && setAxisY(true)}>
            {t('area.wrtY')}
          </VizButton>
        </ButtonRow>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-2xl" role="img" aria-labelledby={statusId}>
            {bands.map((band, i) => (
              <path
                key={i}
                d={shade(band, true)}
                fill={absArea || band.pos ? '#22c55e' : '#ef4444'}
                fillOpacity={0.28}
              />
            ))}
            {!absArea
              ? bands
                  .filter((b) => !b.pos)
                  .map((band, i) => <path key={`n${i}`} d={shade(band, false)} fill="#ef4444" fillOpacity={0.28} />)
              : null}
            <line x1={M.l} y1={y0} x2={W - M.r} y2={y0} stroke="currentColor" opacity={0.35} />
            <path d={pathOf(pair.f)} fill="none" stroke="#3b82f6" strokeWidth={2} />
            <path d={pathOf(pair.g)} fill="none" stroke="orange" strokeWidth={2} />
            {showX
              ? zeros.map((z) => (
                  <g key={z}>
                    <circle cx={toX(z, a, b)} cy={toY(pair.f(z), yMin, yMax)} r={4} fill="currentColor" />
                    <text x={toX(z, a, b)} y={toY(pair.f(z), yMin, yMax) - 8} textAnchor="middle" fontSize={9} fill="currentColor">
                      {fmt(z, 2)}
                    </text>
                  </g>
                ))
              : null}
            <text x={W - 80} y={M.t + 14} fontSize={10} fill="#3b82f6">
              f = {pair.fLabel}
            </text>
            <text x={W - 80} y={M.t + 28} fontSize={10} fill="orange">
              g = {pair.gLabel}
            </text>
          </svg>
        </div>

        <div id={statusId} className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-xs" aria-live="polite">
          <p>
            f(x) = {pair.fLabel} · g(x) = {pair.gLabel}
          </p>
          <p>Intersecciones: {zeros.length ? zeros.map((z) => fmt(z, 2)).join(', ') : '—'}</p>
          <p>
            {axisY && areaY !== null
              ? `A = ∫ |x_der − x_izq| dy ≈ ${fmt(areaY)}`
              : absArea
                ? `A = ∫ |f−g| dx = ${fmt(geometric)}`
                : `A = ∫ (f−g) dx = ${fmt(signed)}`}
          </p>
        </div>

        <ControlsStack>
          <SliderRow label={`a = ${fmt(a, 2)}`} value={a} min={pair.aDefault - 1} max={b - 0.1} step={0.1} onChange={setA} />
          <SliderRow label={`b = ${fmt(b, 2)}`} value={b} min={a + 0.1} max={pair.bDefault + 1} step={0.1} onChange={setB} />
          <ToggleRow label={t('area.abs')} checked={absArea} onChange={setAbsArea} />
          <ToggleRow label={t('area.showX')} checked={showX} onChange={setShowX} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
