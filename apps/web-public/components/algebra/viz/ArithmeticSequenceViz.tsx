'use client';

import { useId, useMemo, useState } from 'react';
import { ControlsStack, SliderRow, ToggleRow, VizPanel } from './controls';
import { present, snap, yExtent } from './sequencePlot';

/**
 * Arithmetic sequence a_n = a₁ + (n-1)d (ALG-SEC-001).
 */
export function ArithmeticSequenceViz() {
  const [a1, setA1] = useState(1);
  const [d, setD] = useState(2);
  const [N, setN] = useState(10);
  const [showDiff, setShowDiff] = useState(true);
  const [showTrend, setShowTrend] = useState(false);
  const [sel, setSel] = useState(6);
  const guideId = useId();
  const statusId = useId();

  const terms = useMemo(
    () => Array.from({ length: N }, (_, i) => a1 + i * d),
    [a1, d, N],
  );
  const k = Math.min(Math.max(1, sel), N);
  const ak = terms[k - 1]!;
  const { yMin, yMax } = yExtent(terms);

  const W = 420;
  const H = 260;
  const M = { l: 40, r: 16, t: 16, b: 28 };
  const plotW = W - M.l - M.r;
  const plotH = H - M.t - M.b;
  const toX = (n: number) => M.l + ((n - 1) / Math.max(1, N - 1)) * plotW;
  const toY = (y: number) => M.t + ((yMax - y) / (yMax - yMin || 1)) * plotH;
  const y0 = toY(0);

  const behavior =
    Math.abs(d) < 1e-9 ? 'Sucesión constante' : d > 0 ? 'Sucesión creciente' : 'Sucesión decreciente';
  const behaviorHint =
    Math.abs(d) < 1e-9
      ? 'Todos los términos tienen el mismo valor.'
      : d > 0
        ? `Cada término aumenta ${present(d)} unidades.`
        : `Cada término disminuye ${present(Math.abs(d))} unidades.`;

  const preview = terms.slice(0, 6);

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            En una sucesión aritmética cada término se obtiene sumando siempre la misma cantidad d al
            término anterior.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Cambia a₁, d y N: observa cómo d determina el salto constante entre todos los términos.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
            Regla paso a paso
          </p>
          <p className="font-mono text-base font-semibold">aₙ₊₁=aₙ{d >= 0 ? '+' : '−'}{present(Math.abs(d))}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
            Término general
          </p>
          <p className="font-mono text-sm">
            aₙ=a₁+(n−1)d = {present(a1)}+(n−1)({present(d)})
          </p>
          <p className="mt-1 text-sm">
            {behavior} · {behaviorHint}
          </p>
          <p className="mt-1 font-mono text-sm text-[var(--fg-muted)]">
            {preview.map(present).join(', ')}
            {N > 6 ? ', …' : ''}
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-xl" role="img" aria-labelledby={statusId}>
            <line x1={M.l} y1={y0} x2={W - M.r} y2={y0} stroke="currentColor" opacity={0.3} />
            <line x1={M.l} y1={M.t} x2={M.l} y2={H - M.b} stroke="currentColor" opacity={0.35} />
            <text x={W - M.r} y={H - 8} textAnchor="end" fontSize={11} opacity={0.7}>n</text>
            <text x={M.l + 6} y={M.t + 12} fontSize={11} opacity={0.7}>aₙ</text>

            {showTrend && N >= 2 ? (
              <line
                x1={toX(1)}
                y1={toY(terms[0]!)}
                x2={toX(N)}
                y2={toY(terms[N - 1]!)}
                stroke="currentColor"
                strokeDasharray="5 4"
                opacity={0.35}
              />
            ) : null}

            {terms.map((y, i) => {
              const n = i + 1;
              const x = toX(n);
              const py = toY(y);
              const selected = n === k;
              return (
                <g key={n} style={{ cursor: 'pointer' }} onClick={() => setSel(n)}>
                  <line x1={x} y1={y0} x2={x} y2={py} stroke="currentColor" opacity={0.2} />
                  <circle cx={x} cy={py} r={selected ? 7 : 5} fill={selected ? 'orange' : 'var(--accent-strong)'} />
                  {(n === 1 || n === N || n % Math.ceil(N / 6) === 0) && (
                    <text x={x} y={H - 10} textAnchor="middle" fontSize={9} opacity={0.5}>
                      {n}
                    </text>
                  )}
                  {showDiff && i < Math.min(5, N - 1) ? (
                    <text
                      x={(toX(n) + toX(n + 1)) / 2}
                      y={Math.min(toY(y), toY(terms[i + 1]!)) - 8}
                      textAnchor="middle"
                      fontSize={10}
                      fill="orange"
                    >
                      {d >= 0 ? `+${present(d)}` : present(d)}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>
          {k >= 2 ? (
            <p className="mt-1 font-mono text-sm">
              a<sub>{k}</sub>−a<sub>{k - 1}</sub>={present(ak)}−{present(terms[k - 2]!)}={present(d)}
            </p>
          ) : null}
        </section>

        <div id={statusId} className="rounded-lg border border-[var(--border)] px-3 py-2 font-mono text-sm" aria-live="polite">
          a<sub>{k}</sub>={present(a1)}+({k}−1)({present(d)})={present(ak)} · a₁={present(a1)} · d=
          {present(d)} · N={N}
        </div>

        <ControlsStack>
          <ToggleRow label="Mostrar diferencias" checked={showDiff} onChange={setShowDiff} />
          <ToggleRow label="Mostrar tendencia" checked={showTrend} onChange={setShowTrend} />
          <SliderRow label="a₁" value={a1} min={-10} max={10} step={0.5} onChange={(v) => setA1(snap(v, -10, 10, 0.5))} />
          <SliderRow label="d" value={d} min={-5} max={5} step={0.5} onChange={(v) => setD(snap(v, -5, 5, 0.5))} />
          <SliderRow label="N" value={N} min={3} max={25} step={1} onChange={(v) => setN(Math.round(v))} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
