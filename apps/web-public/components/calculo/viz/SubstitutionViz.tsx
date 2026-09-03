'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, ToggleRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { fmt, integrate, safeEval } from './calcMath';

type Example = {
  label: string;
  integrandX: string;
  integrandU: string;
  gLabel: string;
  g: (x: number) => number;
  gp: (x: number) => number;
  orig: (x: number) => number;
  fu: (u: number) => number;
  aDefault: number;
  bDefault: number;
};

const EXAMPLES: Example[] = [
  {
    label: '2x cos(x²)',
    integrandX: '2x cos(x²)',
    integrandU: 'cos(u)',
    gLabel: 'x²',
    g: (x) => x * x,
    gp: (x) => 2 * x,
    orig: (x) => 2 * x * Math.cos(x * x),
    fu: (u) => Math.cos(u),
    aDefault: 0,
    bDefault: 1,
  },
  {
    label: '2x / (x²+1)',
    integrandX: '2x/(x²+1)',
    integrandU: '1/u',
    gLabel: 'x²+1',
    g: (x) => x * x + 1,
    gp: (x) => 2 * x,
    orig: (x) => (2 * x) / (x * x + 1),
    fu: (u) => 1 / u,
    aDefault: 1,
    bDefault: 2,
  },
  {
    label: 'sen(x) cos(x)',
    integrandX: 'sen(x) cos(x)',
    integrandU: 'u',
    gLabel: 'sen(x)',
    g: (x) => Math.sin(x),
    gp: (x) => Math.cos(x),
    orig: (x) => Math.sin(x) * Math.cos(x),
    fu: (u) => u,
    aDefault: 0,
    bDefault: Math.PI / 2,
  },
  {
    label: 'x e^(x²)',
    integrandX: 'x e^(x²)',
    integrandU: 'e^u / 2',
    gLabel: 'x²',
    g: (x) => x * x,
    gp: (x) => 2 * x,
    orig: (x) => x * Math.exp(x * x),
    fu: (u) => Math.exp(u) / 2,
    aDefault: 0,
    bDefault: 1,
  },
];

const W = 280;
const H = 220;
const M = { l: 40, r: 12, t: 12, b: 28 };

function toX(v: number, min: number, max: number) {
  return M.l + ((v - min) / (max - min || 1)) * (W - M.l - M.r);
}
function toY(v: number, min: number, max: number) {
  return M.t + ((max - v) / (max - min || 1)) * (H - M.t - M.b);
}

function curveAndShade(
  f: (x: number) => number,
  a: number,
  b: number,
  xMin: number,
  xMax: number,
) {
  const ys: number[] = [0];
  for (let i = 0; i <= 200; i++) {
    const y = safeEval(f, a + (i / 200) * (b - a));
    if (isFinite(y)) ys.push(y);
  }
  const yMin = Math.min(...ys) - 0.15;
  const yMax = Math.max(...ys) + 0.15;
  const y0 = toY(Math.max(yMin, Math.min(yMax, 0)), yMin, yMax);
  let curve = '';
  let shade = `M${toX(a, xMin, xMax)},${y0}`;
  let on = false;
  for (let i = 0; i <= 240; i++) {
    const x = a + (i / 240) * (b - a);
    const y = safeEval(f, x);
    if (!isFinite(y)) {
      on = false;
      continue;
    }
    const sx = toX(x, xMin, xMax);
    const sy = toY(Math.max(yMin, Math.min(yMax, y)), yMin, yMax);
    curve += on ? ` L${sx},${sy}` : `M${sx},${sy}`;
    shade += ` L${sx},${sy}`;
    on = true;
  }
  shade += ` L${toX(b, xMin, xMax)},${y0} Z`;
  return { curve, shade, y0, yMin, yMax };
}

export function SubstitutionViz() {
  const statusId = useId();
  const [idx, setIdx] = useState(0);
  const [showDu, setShowDu] = useState(true);
  const [transformed, setTransformed] = useState(false);
  const ex = EXAMPLES[idx]!;
  const [a, setA] = useState(ex.aDefault);
  const [b, setB] = useState(ex.bDefault);

  const handleEx = (i: number) => {
    setIdx(i);
    setA(EXAMPLES[i]!.aDefault);
    setB(EXAMPLES[i]!.bDefault);
    setTransformed(false);
  };

  const ua = ex.g(a);
  const ub = ex.g(b);
  const uLo = Math.min(ua, ub);
  const uHi = Math.max(ua, ub);

  const left = useMemo(
    () => curveAndShade(ex.orig, a, b, a, b),
    [ex, a, b],
  );
  const right = useMemo(
    () => curveAndShade(ex.fu, uLo, uHi, uLo, uHi),
    [ex, uLo, uHi],
  );

  const areaX = useMemo(() => integrate(ex.orig, a, b), [ex, a, b]);
  const areaU = useMemo(() => integrate(ex.fu, ua, ub), [ex, ua, ub]);

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            La sustitución u = g(x) simplifica el integrando. Los límites también cambian: de [a, b] en x a [g(a), g(b)] en u. El área sombreada es la misma.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((e, i) => (
            <button
              key={e.label}
              type="button"
              onClick={() => handleEx(i)}
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

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="min-w-[240px] flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] transition-opacity duration-500"
            style={{ opacity: transformed ? 0.45 : 1 }}
          >
            <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              Eje x · {ex.integrandX}
            </p>
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
              <path d={left.shade} fill="var(--accent-strong)" fillOpacity={0.22} />
              <line x1={M.l} y1={left.y0} x2={W - M.r} y2={left.y0} stroke="currentColor" opacity={0.4} />
              <path d={left.curve} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
              <text x={W - M.r} y={H - 8} textAnchor="end" fontSize={11} opacity={0.5} fill="currentColor">
                x
              </text>
            </svg>
          </div>
          <svg viewBox="0 0 48 80" className="hidden h-16 w-10 shrink-0 sm:block" aria-hidden>
            <path d="M4,40 C18,18 30,18 44,40" fill="none" stroke="currentColor" opacity={0.5} />
            <polygon points="40,34 48,40 40,46" fill="currentColor" opacity={0.5} />
            <text x="24" y="16" textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.6}>
              u=g(x)
            </text>
          </svg>
          <div
            className="min-w-[240px] flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] transition-all duration-500"
            style={{ opacity: transformed ? 1 : 0.45, transform: transformed ? 'translateX(0)' : 'translateX(-6px)' }}
          >
            <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              Eje u · {ex.integrandU}
            </p>
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
              <path d={right.shade} fill="orange" fillOpacity={0.22} />
              <line x1={M.l} y1={right.y0} x2={W - M.r} y2={right.y0} stroke="currentColor" opacity={0.4} />
              <path d={right.curve} fill="none" stroke="orange" strokeWidth={2} />
              <text x={W - M.r} y={H - 8} textAnchor="end" fontSize={11} opacity={0.5} fill="currentColor">
                u
              </text>
            </svg>
          </div>
        </div>

        <div id={statusId} className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-xs" aria-live="polite">
          <p>
            u = {ex.gLabel}
            {showDu ? ` · du = g'(x) dx` : ''}
          </p>
          <p>
            [{fmt(a, 2)}, {fmt(b, 2)}] en x → [{fmt(ua, 2)}, {fmt(ub, 2)}] en u
          </p>
          <p>
            ∫ {ex.integrandX} dx = ∫ {ex.integrandU} du = {fmt(areaX)} (u: {fmt(areaU)})
          </p>
        </div>

        <ButtonRow>
          <VizButton active={transformed} onClick={() => setTransformed((v) => !v)}>
            {transformed ? 'Ver original' : 'Transformar'}
          </VizButton>
        </ButtonRow>

        <ControlsStack>
          <SliderRow label={`a = ${fmt(a, 2)}`} value={a} min={ex.aDefault - 0.5} max={b - 0.1} step={0.1} onChange={setA} />
          <SliderRow label={`b = ${fmt(b, 2)}`} value={b} min={a + 0.1} max={ex.bDefault + 0.8} step={0.1} onChange={setB} />
          <ToggleRow label="Mostrar du = g'(x) dx" checked={showDu} onChange={setShowDu} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
