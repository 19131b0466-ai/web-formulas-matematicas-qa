'use client';

import { useId, useMemo, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel } from './controls';
import { present, snap, yExtent } from './sequencePlot';

/**
 * Infinite geometric series (ALG-SEC-005).
 * Dual panels: terms a_n and partial sums S_n.
 */
export function GeometricSeriesViz() {
  const [a, setA] = useState(1);
  const [r, setR] = useState(0.6);
  const [N, setN] = useState(12);
  const [sel, setSel] = useState(4);
  const guideId = useId();
  const statusId = useId();

  const converges = Math.abs(r) < 1 - 1e-9;
  const terms = useMemo(
    () => Array.from({ length: N }, (_, n) => a * r ** n),
    [a, r, N],
  );
  const sums = useMemo(
    () =>
      Array.from({ length: N }, (_, n) => {
        if (Math.abs(r - 1) < 1e-9) return a * (n + 1);
        return (a * (1 - r ** (n + 1))) / (1 - r);
      }),
    [a, r, N],
  );
  const Sinf = converges ? a / (1 - r) : null;
  const k = Math.min(Math.max(0, sel), N - 1);
  const ak = terms[k]!;
  const Sk = sums[k]!;

  const termExt = yExtent(terms);
  const sumExt = yExtent(Sinf !== null ? [...sums, Sinf] : sums);

  const W = 420;
  const H = 170;
  const M = { l: 40, r: 16, t: 14, b: 24 };

  const plot = (values: number[], yMin: number, yMax: number, color: string, limit: number | null) => {
    const plotW = W - M.l - M.r;
    const plotH = H - M.t - M.b;
    const toX = (n: number) => M.l + (n / Math.max(1, N - 1)) * plotW;
    const toY = (y: number) => M.t + ((yMax - y) / (yMax - yMin || 1)) * plotH;
    const y0 = toY(0);
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-xl" role="img">
        <line x1={M.l} y1={y0} x2={W - M.r} y2={y0} stroke="currentColor" opacity={0.3} />
        <line x1={M.l} y1={M.t} x2={M.l} y2={H - M.b} stroke="currentColor" opacity={0.35} />
        <text x={W - M.r} y={H - 6} textAnchor="end" fontSize={10} opacity={0.65}>n</text>
        {limit !== null ? (
          <>
            <line
              x1={M.l}
              y1={toY(limit)}
              x2={W - M.r}
              y2={toY(limit)}
              stroke="orange"
              strokeDasharray="5 4"
              strokeWidth={1.5}
              opacity={0.8}
            />
            <text x={W - M.r - 4} y={toY(limit) - 6} textAnchor="end" fontSize={10} fill="orange">
              S∞={present(limit)}
            </text>
          </>
        ) : null}
        {values.map((y, n) => {
          const x = toX(n);
          const py = toY(y);
          const selected = n === k;
          return (
            <g key={n} style={{ cursor: 'pointer' }} onClick={() => setSel(n)}>
              {n > 0 ? (
                <line
                  x1={toX(n - 1)}
                  y1={toY(values[n - 1]!)}
                  x2={x}
                  y2={py}
                  stroke={color}
                  strokeWidth={1.2}
                  opacity={0.45}
                />
              ) : null}
              <circle cx={x} cy={py} r={selected ? 6 : 4.5} fill={selected ? 'orange' : color} />
              {(n === 0 || n === N - 1 || n % Math.ceil(N / 5) === 0) && (
                <text x={x} y={H - 8} textAnchor="middle" fontSize={9} opacity={0.45}>
                  {n}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  const sumChain = terms
    .slice(0, k + 1)
    .map(present)
    .join('+');

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Si |r|&lt;1, los términos aₙ=arⁿ se acercan a 0 y las sumas parciales Sₙ se acercan a un
            valor límite.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            {converges
              ? 'Cambia a, r y N: compara cómo los términos se apagan mientras las sumas se estabilizan en S∞=a/(1−r).'
              : 'En este caso (|r|≥1) la serie infinita no converge.'}
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
          <p className="text-base font-semibold">aₙ=a rⁿ</p>
          <p>
            Sₙ={Math.abs(r - 1) < 1e-9 ? 'a(n+1)' : 'a(1−rⁿ⁺¹)/(1−r)'}
            {converges ? ` · S∞=a/(1−r)=${present(Sinf!)}` : ' · S∞ no existe'}
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs">
            <span className="text-[var(--accent-strong)]">● términos aₙ</span>
            <span className="text-orange">● sumas Sₙ</span>
            {converges ? <span className="text-orange opacity-80">- - S∞</span> : null}
          </div>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
            Términos aₙ
          </p>
          {plot(terms, termExt.yMin, termExt.yMax, 'var(--accent-strong)', null)}
          <p className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
            Sumas parciales Sₙ
          </p>
          {plot(sums, sumExt.yMin, sumExt.yMax, 'orange', Sinf)}
          <p className="mt-2 font-mono text-sm">
            a<sub>{k}</sub>={present(a)}({present(r)})<sup>{k}</sup>={present(ak)} · S<sub>{k}</sub>=
            {present(Sk)}
          </p>
          <p className="font-mono text-xs text-[var(--fg-muted)]">
            S<sub>{k}</sub>={sumChain}
          </p>
        </section>

        <div id={statusId} className="rounded-lg border border-[var(--border)] px-3 py-2 font-mono text-sm" aria-live="polite">
          {converges
            ? `aₙ→0 · Sₙ→S∞=${present(Sinf!)} · a=${present(a)} · r=${present(r)}`
            : `aₙ=arⁿ · la serie infinita no converge · |r|=${present(Math.abs(r))}`}
        </div>

        <ControlsStack>
          <SliderRow label="a" value={a} min={-3} max={3} step={0.1} onChange={(v) => setA(snap(v, -3, 3, 0.1))} />
          <SliderRow label="r" value={r} min={-1.5} max={1.5} step={0.05} onChange={(v) => setR(snap(v, -1.5, 1.5, 0.05))} />
          <SliderRow label="N" value={N} min={3} max={30} step={1} onChange={(v) => setN(Math.round(v))} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
