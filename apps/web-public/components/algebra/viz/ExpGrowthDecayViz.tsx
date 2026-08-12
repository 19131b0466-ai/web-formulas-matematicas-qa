'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from './controls';
import { linspace } from './math2d';

const ZERO = 1e-9;
const W = 420;
const H = 260;
const MARGIN = { l: 40, r: 16, t: 18, b: 30 };

function present(n: number, d = 2): string {
  if (!Number.isFinite(n)) return '—';
  const r = Number(n.toFixed(d));
  if (Math.abs(r - Math.round(r)) < 1e-9 && Math.abs(r) < 1e6) return fmt(Math.round(r), 0);
  return fmt(r, d);
}

function snap(v: number, min: number, max: number, step: number): number {
  const c = Math.min(max, Math.max(min, v));
  const s = min + Math.round((c - min) / step) * step;
  if (Math.abs(s) < step / 2) return 0;
  return Number(s.toFixed(2));
}

function formatK(k: number): string {
  if (Math.abs(k) < ZERO) return '0';
  return k > 0 ? present(k) : `−${present(Math.abs(k))}`;
}

/**
 * Exponential growth/decay P(t)=P₀ e^{kt} (ALG-LOG-007).
 */
export function ExpGrowthDecayViz() {
  const [p0, setP0] = useState(100);
  const [k, setK] = useState(0.2);
  const [t0, setT0] = useState(3);
  const [compare, setCompare] = useState(false);
  const guideId = useId();
  const statusId = useId();

  const P = (t: number, rate = k) => p0 * Math.exp(rate * t);
  const pt = P(t0);
  const growing = k > ZERO;
  const decaying = k < -ZERO;
  const flat = Math.abs(k) < ZERO;

  const behavior = flat
    ? 'Sin crecimiento ni decrecimiento'
    : growing
      ? 'Crecimiento exponencial'
      : 'Decrecimiento exponencial';
  const behaviorHint = flat
    ? 'P(t)=P₀ permanece constante.'
    : growing
      ? 'La cantidad aumenta cada vez más rápido.'
      : 'La cantidad disminuye y se aproxima a cero sin alcanzarlo.';

  const factor = Math.exp(k);
  const pct = (factor - 1) * 100;

  const tMax = 6;
  const yPeak = Math.max(P(tMax), P(tMax, -Math.abs(k) || -0.2), p0 * 1.2, pt * 1.15, 20);
  const VIEW = { tMin: -0.2, tMax, yMin: -yPeak * 0.05, yMax: yPeak };

  const plotW = W - MARGIN.l - MARGIN.r;
  const plotH = H - MARGIN.t - MARGIN.b;
  const toT = (t: number) => MARGIN.l + ((t - VIEW.tMin) / (VIEW.tMax - VIEW.tMin)) * plotW;
  const toY = (y: number) => MARGIN.t + ((VIEW.yMax - y) / (VIEW.yMax - VIEW.yMin)) * plotH;

  const mainPath = useMemo(() => {
    const ts = linspace(0, VIEW.tMax, 100);
    const pts = ts.map((t) => `${toT(t)},${toY(P(t))}`);
    return `M${pts.join(' L')}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p0, k, VIEW.yMax]);

  const mirrorPath = useMemo(() => {
    if (!compare || flat) return '';
    const rate = -k;
    const ts = linspace(0, VIEW.tMax, 100);
    const pts = ts.map((t) => `${toT(t)},${toY(P(t, rate))}`);
    return `M${pts.join(' L')}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p0, k, compare, flat, VIEW.yMax]);

  const applyPreset = (P0: number, rate: number) => {
    setP0(P0);
    setK(rate);
  };

  const kSign = flat ? '→ constante' : growing ? '↑ crecimiento' : '↓ decrecimiento';

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            El signo de k determina hacia dónde evoluciona la cantidad. Con k&gt;0 la curva crece, con
            k&lt;0 decrece y con k=0 permanece constante.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Mueve el tiempo t y observa cómo cambia P(t)=P₀ e<sup>kt</sup>. P₀ fija el valor inicial;
            k fija la tasa.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="font-mono text-lg font-semibold text-[var(--accent-strong)]">
            P(t)={present(p0)}e<sup>{formatK(k)}t</sup>
          </p>
          <p className="mt-1 font-mono text-sm">
            P({present(t0)})={present(p0)}e<sup>{formatK(k)}·{present(t0)}</sup>≈{present(pt)}
          </p>
          <p className="mt-1 text-sm font-medium">{behavior}</p>
          <p className="text-sm text-[var(--fg-muted)]">{behaviorHint}</p>
          <p className="mt-1 font-mono text-xs text-[var(--fg-muted)]">
            k={formatK(k)} {kSign} · factor/unidad e<sup>k</sup>≈{present(factor)} · variación ≈{present(pct, 1)}%
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-xl" role="img" aria-labelledby={statusId}>
            <line x1={toT(VIEW.tMin)} y1={toY(0)} x2={toT(VIEW.tMax)} y2={toY(0)} stroke="currentColor" strokeWidth={1.3} strokeDasharray="5 4" opacity={0.45} />
            {decaying || compare ? (
              <text x={toT(VIEW.tMax) - 4} y={toY(0) - 6} textAnchor="end" fontSize={9} opacity={0.65}>
                asíntota P=0
              </text>
            ) : null}
            <line x1={toT(0)} y1={toY(VIEW.yMin)} x2={toT(0)} y2={toY(VIEW.yMax)} stroke="currentColor" opacity={0.4} />
            {[1, 2, 3, 4, 5].map((t) => (
              <text key={t} x={toT(t)} y={toY(0) + 12} textAnchor="middle" fontSize={9} opacity={0.5}>
                {t}
              </text>
            ))}
            <text x={toT(VIEW.tMax) - 4} y={toY(0) + 22} textAnchor="end" fontSize={11}>t</text>
            <text x={toT(0) + 6} y={MARGIN.t + 12} fontSize={11}>P(t)</text>

            {mirrorPath ? <path d={mirrorPath} fill="none" stroke="teal" strokeWidth={2} strokeDasharray="5 3" opacity={0.85} /> : null}
            {mainPath ? <path d={mainPath} fill="none" stroke="var(--accent-strong)" strokeWidth={2.6} /> : null}

            <circle cx={toT(0)} cy={toY(p0)} r={7} fill="var(--accent-strong)" stroke="currentColor" strokeWidth={1} />
            <text x={toT(0) + 10} y={toY(p0) - 8} fontSize={11} fontWeight={600}>
              P₀={present(p0)}
            </text>

            <line x1={toT(t0)} y1={toY(0)} x2={toT(t0)} y2={toY(pt)} stroke="orange" strokeDasharray="3 2" opacity={0.5} />
            <line x1={toT(0)} y1={toY(pt)} x2={toT(t0)} y2={toY(pt)} stroke="orange" strokeDasharray="3 2" opacity={0.5} />
            <circle cx={toT(t0)} cy={toY(pt)} r={6} fill="orange" />
            <text x={toT(t0) + 8} y={toY(pt) - 8} fontSize={11} fill="orange" fontWeight={600}>
              ({present(t0)},{present(pt)})
            </text>

            {compare && !flat ? (
              <text x={toT(VIEW.tMax * 0.55)} y={MARGIN.t + 14} fontSize={10} fill="teal">
                −k · espejo
              </text>
            ) : null}
          </svg>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">
            No aumenta la misma cantidad cada período: cambia proporcionalmente al valor que ya
            tiene.
          </p>
        </section>

        <div id={statusId} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" aria-live="polite">
          <p className="font-mono">
            P₀={present(p0)} · k={formatK(k)} · {behavior} · P({present(t0)})≈{present(pt)}
          </p>
        </div>

        <ControlsStack>
          <ButtonRow>
            <VizButton onClick={() => applyPreset(100, 0.2)}>Población</VizButton>
            <VizButton onClick={() => applyPreset(1000, 0.05)}>Interés</VizButton>
            <VizButton onClick={() => applyPreset(100, -0.3)}>Desintegración</VizButton>
            <VizButton onClick={() => applyPreset(100, -0.1)}>Decaimiento</VizButton>
            <VizButton active={compare} onClick={() => setCompare((c) => !c)}>
              Comparar +k y −k
            </VizButton>
          </ButtonRow>
          <SliderRow label="P₀" value={p0} min={20} max={200} step={5} onChange={(v) => setP0(snap(v, 20, 200, 5))} />
          <div>
            <p className="mb-1 text-xs text-[var(--fg-muted)]">
              k: decrecimiento &lt; 0 &lt; crecimiento
            </p>
            <SliderRow label="k" value={k} min={-1} max={1} step={0.05} onChange={(v) => setK(snap(v, -1, 1, 0.05))} />
          </div>
          <SliderRow label="t" value={t0} min={0} max={6} step={0.1} onChange={(v) => setT0(snap(v, 0, 6, 0.1))} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
