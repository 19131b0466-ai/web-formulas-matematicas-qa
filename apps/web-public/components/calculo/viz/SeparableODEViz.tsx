'use client';

import { useId, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, ToggleRow, VizPanel } from '@/components/algebra/viz/controls';
import { fmt, solveODE } from './calcMath';

type Eq = {
  label: string;
  ode: string;
  sep: string;
  sol: string;
  f: (x: number, y: number) => number;
  solKey?: 'logistic';
};

const EQS: Eq[] = [
  { label: 'y', ode: 'dy/dx = y', sep: 'dy/y = dx', sol: 'y = A eˣ', f: (_x, y) => y },
  { label: '−y', ode: 'dy/dx = −y', sep: 'dy/y = −dx', sol: 'y = A e⁻ˣ', f: (_x, y) => -y },
  { label: 'xy', ode: 'dy/dx = xy', sep: 'dy/y = x dx', sol: 'y = A e^(x²/2)', f: (x, y) => x * y },
  { label: 'y(1−y)', ode: 'dy/dx = y(1−y)', sep: 'dy/[y(1−y)] = dx', sol: 'logística', solKey: 'logistic', f: (_x, y) => y * (1 - y) },
  { label: 'x/y', ode: 'dy/dx = x/y', sep: 'y dy = x dx', sol: 'y² − x² = C', f: (x, y) => (y !== 0 ? x / y : NaN) },
  { label: '−x/y', ode: 'dy/dx = −x/y', sep: 'y dy = −x dx', sol: 'x² + y² = C', f: (x, y) => (y !== 0 ? -x / y : NaN) },
];

const W = 380;
const H = 360;
const M = { l: 40, r: 12, t: 12, b: 32 };
const xMin = -3;
const xMax = 3;
const yMin = -3;
const yMax = 3;

function toX(x: number) {
  return M.l + ((x - xMin) / (xMax - xMin)) * (W - M.l - M.r);
}
function toY(y: number) {
  return M.t + ((yMax - y) / (yMax - yMin)) * (H - M.t - M.b);
}

export function SeparableODEViz() {
  const statusId = useId();
  const t = useTranslations('vizCalc');
  const [idx, setIdx] = useState(0);
  const [C, setC] = useState(0.4);
  const [x0, setX0] = useState(0);
  const [y0, setY0] = useState(1);
  const [sides, setSides] = useState(true);
  const eq = EQS[idx]!;

  const family = useMemo(() => {
    const Cs = [-1.2, -0.6, 0, 0.4, 0.8, 1.4, 2];
    return Cs.map((c) => {
      const yStart = eq.label === '−x/y' || eq.label === 'x/y' ? Math.max(0.3, Math.sqrt(Math.abs(c) + 0.2)) : Math.exp(c);
      const pts = [
        ...solveODE(eq.f, 0, eq.label.includes('y') && !eq.label.includes('/') ? Math.exp(c) : yStart, 0.04, 90, 8).reverse(),
        ...solveODE(eq.f, 0, eq.label.includes('/') ? yStart : Math.exp(c), 0.04, 90, 8),
      ];
      return { c, pts };
    });
  }, [eq]);

  const selected = useMemo(() => {
    const yInit = y0;
    return [
      ...solveODE(eq.f, x0, yInit, -0.04, 100, 8).reverse(),
      ...solveODE(eq.f, x0, yInit, 0.04, 100, 8),
    ];
  }, [eq, x0, y0]);

  const pathOf = (pts: Array<{ x: number; y: number }>) => {
    let d = '';
    let on = false;
    for (const p of pts) {
      if (p.x < xMin || p.x > xMax || p.y < yMin || p.y > yMax || !isFinite(p.y)) {
        on = false;
        continue;
      }
      d += `${on ? 'L' : 'M'}${toX(p.x)},${toY(p.y)}`;
      on = true;
    }
    return d;
  };

  return (
    <VizPanel>
      <div className="space-y-4">
        <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">{t('separable.idea')}</p>
        <div className="flex flex-wrap gap-2">
          {EQS.map((e, i) => (
            <button
              key={e.label}
              type="button"
              onClick={() => setIdx(i)}
              className={`rounded-md border px-2 py-1 text-xs font-mono transition ${
                i === idx
                  ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--accent-soft)]'
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-2">
            <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-md" role="img" aria-labelledby={statusId}>
              {family.map((sol) => (
                <path key={sol.c} d={pathOf(sol.pts)} fill="none" stroke="#3b82f6" opacity={0.28} strokeWidth={1.4} />
              ))}
              <path d={pathOf(selected)} fill="none" stroke="orange" strokeWidth={2.4} />
              <circle cx={toX(x0)} cy={toY(y0)} r={5} fill="orange" />
            </svg>
          </div>
          {sides ? (
            <div className="flex min-w-[160px] flex-1 flex-col gap-2 text-xs text-[var(--fg-muted)]">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2">
                <p className="font-semibold text-[var(--fg)]">{t('separable.sepTitle')}</p>
                <p className="mt-1 font-mono">{eq.sep}</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2">
                <p className="font-semibold text-[var(--fg)]">{t('separable.solTitle')}</p>
                <p className="mt-1 font-mono">{eq.solKey ? t(`separable.${eq.solKey}`) : eq.sol}</p>
              </div>
            </div>
          ) : null}
        </div>
        <div id={statusId} className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-xs" aria-live="polite">
          {eq.ode} · {eq.sep} · {eq.solKey ? t(`separable.${eq.solKey}`) : eq.sol} · C≈{fmt(C, 2)} · y({fmt(x0, 1)})={fmt(y0, 2)}
        </div>
        <ControlsStack>
          <SliderRow label={`C = ${fmt(C, 2)}`} value={C} min={-3} max={3} step={0.1} onChange={setC} />
          <SliderRow label={`x₀ = ${fmt(x0, 2)}`} value={x0} min={-2} max={2} step={0.1} onChange={setX0} />
          <SliderRow label={`y₀ = ${fmt(y0, 2)}`} value={y0} min={-2} max={2} step={0.1} onChange={setY0} />
          <ToggleRow label={t('separable.showSep')} checked={sides} onChange={setSides} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
