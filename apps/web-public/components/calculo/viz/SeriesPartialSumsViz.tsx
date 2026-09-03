'use client';

import { useId, useMemo, useState } from 'react';
import { ControlsStack, SliderRow, ToggleRow, VizPanel } from '@/components/algebra/viz/controls';
import { fmt } from './calcMath';

type SeriesOpt = {
  label: string;
  a: (n: number) => number;
  converges: boolean;
  sum: number | null;
  criterion: string;
  aLimit: string;
  alternating?: boolean;
};

const SERIES: SeriesOpt[] = [
  {
    label: 'Geométrica r=1/2',
    a: (n) => Math.pow(0.5, n),
    converges: true,
    sum: 1,
    criterion: 'Serie geométrica |r|<1',
    aLimit: '0',
  },
  {
    label: 'Geométrica r=0.9',
    a: (n) => Math.pow(0.9, n),
    converges: true,
    sum: 9,
    criterion: 'Serie geométrica |r|<1',
    aLimit: '0',
  },
  {
    label: 'Geométrica r=1.1',
    a: (n) => Math.pow(1.1, n),
    converges: false,
    sum: null,
    criterion: 'Término general: aₙ ↛ 0',
    aLimit: '∞',
  },
  {
    label: 'Armónica',
    a: (n) => 1 / n,
    converges: false,
    sum: null,
    criterion: 'Criterio integral / serie p con p=1',
    aLimit: '0 (necesario, no suficiente)',
  },
  {
    label: 'Serie p (p=2)',
    a: (n) => 1 / (n * n),
    converges: true,
    sum: Math.PI ** 2 / 6,
    criterion: 'Serie p con p=2 > 1',
    aLimit: '0',
  },
  {
    label: 'Alternada armónica',
    a: (n) => ((n % 2 === 1 ? 1 : -1) / n),
    converges: true,
    sum: Math.log(2),
    criterion: 'Criterio de Leibniz (alternada)',
    aLimit: '0',
    alternating: true,
  },
  {
    label: 'Telescópica',
    a: (n) => 1 / n - 1 / (n + 1),
    converges: true,
    sum: 1,
    criterion: 'Serie telescópica',
    aLimit: '0',
  },
];

const WA = 500;
const HA = 180;
const HS = 200;
const M = { l: 52, r: 16, t: 12, b: 28 };
const MS = { l: 52, r: 16, t: 12, b: 32 };

function toX(n: number, N: number, W: number, m: { l: number; r: number }) {
  return m.l + ((n - 1) / Math.max(1, N - 1)) * (W - m.l - m.r);
}
function toY(y: number, yMin: number, yMax: number, H: number, m: { t: number; b: number }) {
  return m.t + ((yMax - y) / (yMax - yMin || 1)) * (H - m.t - m.b);
}

export function SeriesPartialSumsViz() {
  const statusId = useId();
  const [idx, setIdx] = useState(0);
  const [N, setN] = useState(12);
  const [showCrit, setShowCrit] = useState(true);
  const [showSum, setShowSum] = useState(true);
  const s = SERIES[idx]!;

  const terms = useMemo(() => Array.from({ length: N }, (_, i) => s.a(i + 1)), [s, N]);
  const partials = useMemo(() => {
    const out: number[] = [];
    let acc = 0;
    for (const t of terms) {
      acc += t;
      out.push(acc);
    }
    return out;
  }, [terms]);

  const aExt = useMemo(() => {
    const ys = [...terms, 0];
    const lo = Math.min(...ys);
    const hi = Math.max(...ys);
    const pad = (hi - lo) * 0.18 || 0.2;
    return { yMin: lo - pad, yMax: hi + pad };
  }, [terms]);

  const sExt = useMemo(() => {
    const ys = [...partials];
    if (s.converges && s.sum !== null) ys.push(s.sum);
    const lo = Math.min(...ys, 0);
    const hi = Math.max(...ys, 0);
    const pad = (hi - lo) * 0.18 || 0.2;
    return { yMin: lo - pad, yMax: hi + pad };
  }, [partials, s]);

  const aN = terms[N - 1] ?? 0;
  const SN = partials[N - 1] ?? 0;
  const goesToZero = Math.abs(aN) < 0.08 && N >= 8 && s.aLimit !== '∞';

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Una serie converge si las sumas parciales Sₙ se acercan a un valor fijo. Que aₙ → 0 es <strong>necesario pero no suficiente</strong>.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Compara la armónica con 1/n²: ambas tienen términos que van a 0, pero solo la segunda converge.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          {SERIES.map((opt, i) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setIdx(i)}
              className={`rounded-md border px-2 py-1 text-xs transition ${
                i === idx
                  ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'border-[var(--border)] bg-[var(--bg)] text-[var(--fg)] hover:bg-[var(--accent-soft)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)]">
          <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
            Términos aₙ {goesToZero ? '· aₙ → 0' : ''}
          </p>
          <svg viewBox={`0 0 ${WA} ${HA}`} className="mx-auto h-auto w-full max-w-2xl" role="img">
            <line
              x1={M.l}
              y1={toY(0, aExt.yMin, aExt.yMax, HA, M)}
              x2={WA - M.r}
              y2={toY(0, aExt.yMin, aExt.yMax, HA, M)}
              stroke="currentColor"
              opacity={0.4}
            />
            {terms.map((y, i) => {
              const n = i + 1;
              const x = toX(n, N, WA, M);
              const y0 = toY(0, aExt.yMin, aExt.yMax, HA, M);
              const yy = toY(y, aExt.yMin, aExt.yMax, HA, M);
              const color = s.alternating ? (y >= 0 ? '#3b82f6' : '#ef4444') : 'var(--accent-strong)';
              return (
                <g key={n}>
                  <line x1={x} y1={y0} x2={x} y2={yy} stroke={color} opacity={0.45} />
                  <circle cx={x} cy={yy} r={3.5} fill={color} />
                </g>
              );
            })}
          </svg>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)]">
          <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
            Sumas parciales Sₙ {s.converges ? '' : '· → ∞'}
          </p>
          <svg viewBox={`0 0 ${WA} ${HS}`} className="mx-auto h-auto w-full max-w-2xl" role="img">
            {s.converges && s.sum !== null && showSum ? (
              <line
                x1={MS.l}
                y1={toY(s.sum, sExt.yMin, sExt.yMax, HS, MS)}
                x2={WA - MS.r}
                y2={toY(s.sum, sExt.yMin, sExt.yMax, HS, MS)}
                stroke="orange"
                strokeDasharray="5 3"
              />
            ) : null}
            <path
              d={partials
                .map((y, i) => {
                  const x = toX(i + 1, N, WA, MS);
                  const yy = toY(y, sExt.yMin, sExt.yMax, HS, MS);
                  return `${i === 0 ? 'M' : 'L'}${x},${yy}`;
                })
                .join(' ')}
              fill="none"
              stroke="var(--accent-strong)"
              strokeWidth={1.8}
            />
            {partials.map((y, i) => (
              <circle
                key={i}
                cx={toX(i + 1, N, WA, MS)}
                cy={toY(y, sExt.yMin, sExt.yMax, HS, MS)}
                r={i === N - 1 ? 6 : 3}
                fill={i === N - 1 ? 'orange' : 'var(--accent-strong)'}
              />
            ))}
          </svg>
        </div>

        {showCrit ? (
          <div className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs">
            <p>
              <strong>Criterio aplicado:</strong> {s.criterion}
            </p>
            <p>
              aₙ → {s.aLimit}
            </p>
            <p>
              Resultado: {s.converges ? 'Converge' : 'Diverge'}
              {showSum && s.sum !== null ? ` · S = ${fmt(s.sum, 4)}` : ''}
            </p>
          </div>
        ) : null}

        <div id={statusId} className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-xs" aria-live="polite">
          N = {N} · a<sub>N</sub> = {fmt(aN, 4)} · S<sub>N</sub> = {fmt(SN, 4)} ·{' '}
          {s.converges && s.sum !== null ? `converge a S = ${fmt(s.sum, 4)}` : 'diverge'}
        </div>

        <ControlsStack>
          <SliderRow label={`N = ${N}`} value={N} min={1} max={50} step={1} onChange={(v) => setN(Math.round(v))} />
          <ToggleRow label="Mostrar criterio aplicado" checked={showCrit} onChange={setShowCrit} />
          <ToggleRow label="Mostrar suma exacta" checked={showSum} onChange={setShowSum} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
