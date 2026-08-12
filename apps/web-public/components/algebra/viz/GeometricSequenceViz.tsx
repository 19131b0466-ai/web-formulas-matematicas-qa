'use client';

import { useId, useMemo, useState } from 'react';
import { ControlsStack, SliderRow, ToggleRow, VizPanel } from './controls';
import { present, snap, yExtent } from './sequencePlot';

/**
 * Geometric sequence a_n = a₁ · r^(n-1) (ALG-SEC-003).
 */
export function GeometricSequenceViz() {
  const [a1, setA1] = useState(1);
  const [r, setR] = useState(0.6);
  const [N, setN] = useState(12);
  const [showRatio, setShowRatio] = useState(true);
  const [sel, setSel] = useState(5);
  const guideId = useId();
  const statusId = useId();

  const terms = useMemo(
    () => Array.from({ length: N }, (_, i) => a1 * r ** i),
    [a1, r, N],
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

  let behavior = '';
  if (Math.abs(r) < 1e-9) behavior = 'r=0 · a₁, 0, 0, 0, …';
  else if (Math.abs(r - 1) < 1e-9) behavior = 'Sucesión constante · aₙ=a₁';
  else if (Math.abs(r + 1) < 1e-9) behavior = 'Alternancia constante';
  else if (r > 1) behavior = 'r>1 → crecimiento geométrico';
  else if (r > 0 && r < 1) behavior = '0<r<1 → decrece hacia 0';
  else if (r > -1 && r < 0) behavior = '−1<r<0 → alterna y converge a 0';
  else behavior = 'r<−1 → alterna y crece en magnitud';

  const preview = terms.slice(0, 6);

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Cada término de una sucesión geométrica se obtiene multiplicando el anterior por la misma
            razón r.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Cambia a₁, r y N: observa cómo r controla si los términos crecen, disminuyen, alternan o
            permanecen constantes.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="font-mono text-base font-semibold">aₙ₊₁=r·aₙ</p>
          <p className="mt-1 font-mono text-sm">
            aₙ=a₁ r<sup>n−1</sup> = {present(a1)}·({present(r)})<sup>n−1</sup>
          </p>
          <p className="mt-1 text-sm">{behavior}</p>
          <p className="mt-1 font-mono text-sm text-[var(--fg-muted)]">
            {preview.map(present).join(', ')}
            {N > 6 ? ', …' : ''}
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-xl" role="img" aria-labelledby={statusId}>
            <line x1={M.l} y1={y0} x2={W - M.r} y2={y0} stroke="currentColor" opacity={0.35} />
            <line x1={M.l} y1={M.t} x2={M.l} y2={H - M.b} stroke="currentColor" opacity={0.35} />
            <text x={W - M.r} y={H - 8} textAnchor="end" fontSize={11} opacity={0.7}>n</text>
            <text x={M.l + 6} y={M.t + 12} fontSize={11} opacity={0.7}>aₙ</text>

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
                  {showRatio && i < Math.min(4, N - 1) ? (
                    <text
                      x={(toX(n) + toX(n + 1)) / 2}
                      y={Math.min(toY(y), toY(terms[i + 1]!)) - 8}
                      textAnchor="middle"
                      fontSize={10}
                      fill="orange"
                    >
                      ×{present(r)}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>
        </section>

        <div id={statusId} className="rounded-lg border border-[var(--border)] px-3 py-2 font-mono text-sm" aria-live="polite">
          a<sub>{k}</sub>={present(a1)}({present(r)})<sup>{k - 1}</sup>={present(ak)} · a₁=
          {present(a1)} · r={present(r)} · N={N}
        </div>

        <ControlsStack>
          <ToggleRow label="Mostrar razón" checked={showRatio} onChange={setShowRatio} />
          <SliderRow label="a₁" value={a1} min={-5} max={5} step={0.1} onChange={(v) => setA1(snap(v, -5, 5, 0.1))} />
          <SliderRow label="r" value={r} min={-2} max={2} step={0.05} onChange={(v) => setR(snap(v, -2, 2, 0.05))} />
          <SliderRow label="N" value={N} min={3} max={25} step={1} onChange={(v) => setN(Math.round(v))} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
