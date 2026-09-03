'use client';

import { useId, useMemo, useState } from 'react';
import { ControlsStack, SliderRow, ToggleRow, VizPanel } from '@/components/algebra/viz/controls';
import { fmt } from './calcMath';

type Seq = { label: string; a: (n: number) => number; L: number | null };
function fact(n: number) {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

const SEQS: Seq[] = [
  { label: '1/n', a: (n) => 1 / n, L: 0 },
  { label: '(−1)ⁿ/n', a: (n) => ((n % 2 === 0 ? 1 : -1) / n), L: 0 },
  { label: '(1+1/n)ⁿ', a: (n) => Math.pow(1 + 1 / n, n), L: Math.E },
  { label: '(−1)ⁿ', a: (n) => (n % 2 === 0 ? 1 : -1), L: null },
  { label: 'n/(n+1)', a: (n) => n / (n + 1), L: 1 },
  { label: '(2n+1)/(n+3)', a: (n) => (2 * n + 1) / (n + 3), L: 2 },
  { label: 'sen(n)/n', a: (n) => Math.sin(n) / n, L: 0 },
  { label: '2ⁿ/n!', a: (n) => Math.pow(2, n) / fact(n), L: 0 },
];

const W = 520;
const H = 300;
const M = { l: 52, r: 16, t: 16, b: 36 };

export function SequenceConvergenceViz() {
  const statusId = useId();
  const [idx, setIdx] = useState(0);
  const [N, setN] = useState(25);
  const [eps, setEps] = useState(0.2);
  const [showBand, setShowBand] = useState(true);
  const [showL, setShowL] = useState(true);
  const s = SEQS[idx]!;
  const terms = useMemo(() => Array.from({ length: N }, (_, i) => s.a(i + 1)), [s, N]);

  const Neps = useMemo(() => {
    if (s.L === null) return null;
    for (let n = 1; n <= N; n++) {
      let ok = true;
      for (let k = n; k <= N; k++) {
        if (Math.abs(s.a(k) - s.L) >= eps) {
          ok = false;
          break;
        }
      }
      if (ok) return n;
    }
    return null;
  }, [s, N, eps]);

  const ys = [...terms, s.L ?? 0, ...(showBand && s.L !== null ? [s.L - eps, s.L + eps] : [])];
  const yMin = Math.min(...ys) - 0.15;
  const yMax = Math.max(...ys) + 0.15;
  const toX = (n: number) => M.l + ((n - 1) / Math.max(1, N - 1)) * (W - M.l - M.r);
  const toY = (y: number) => M.t + ((yMax - y) / (yMax - yMin || 1)) * (H - M.t - M.b);
  const y0 = toY(Math.max(yMin, Math.min(yMax, 0)));

  return (
    <VizPanel>
      <div className="space-y-4">
        <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">
          aₙ → L significa: para todo ε &gt; 0 existe N tal que si n &gt; N entonces |aₙ − L| &lt; ε. La banda verde es el ε-entorno.
        </p>
        <div className="flex flex-wrap gap-2">
          {SEQS.map((opt, i) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setIdx(i)}
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
            {showBand && s.L !== null ? (
              <rect
                x={M.l}
                y={toY(s.L + eps)}
                width={W - M.l - M.r}
                height={Math.abs(toY(s.L - eps) - toY(s.L + eps))}
                fill="#22c55e"
                fillOpacity={0.15}
              />
            ) : null}
            {showL && s.L !== null ? <line x1={M.l} y1={toY(s.L)} x2={W - M.r} y2={toY(s.L)} stroke="orange" /> : null}
            <line x1={M.l} y1={y0} x2={W - M.r} y2={y0} stroke="currentColor" opacity={0.3} />
            {terms.map((y, i) => {
              const n = i + 1;
              const inside = s.L !== null && Math.abs(y - s.L) < eps;
              return (
                <g key={n}>
                  <line x1={toX(n)} y1={y0} x2={toX(n)} y2={toY(y)} stroke={inside ? '#22c55e' : '#3b82f6'} opacity={0.4} />
                  <circle cx={toX(n)} cy={toY(y)} r={3.5} fill={inside ? '#22c55e' : '#3b82f6'} />
                </g>
              );
            })}
          </svg>
        </div>
        <div id={statusId} className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-xs" aria-live="polite">
          aₙ = {s.label} · L = {s.L === null ? 'no converge' : fmt(s.L, 4)} · ε = {fmt(eps, 2)} · N(ε) = {Neps ?? '—'}
          {Neps ? ` · a partir de n = ${Neps} todos están en el ε-entorno (en la muestra)` : ''}
        </div>
        <ControlsStack>
          <SliderRow label={`N = ${N}`} value={N} min={5} max={60} step={1} onChange={(v) => setN(Math.round(v))} />
          <SliderRow label={`ε = ${fmt(eps, 2)}`} value={eps} min={0.01} max={1} step={0.01} onChange={setEps} />
          <ToggleRow label="Mostrar banda ε" checked={showBand} onChange={setShowBand} />
          <ToggleRow label="Mostrar L" checked={showL} onChange={setShowL} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
