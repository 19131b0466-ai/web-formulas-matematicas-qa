'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, ToggleRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { fmt, integrate, safeEval } from './calcMath';

type Mode = 'p' | 'exp' | 'ln' | 'gauss';

const W = 280;
const H = 240;
const M = { l: 44, r: 16, t: 16, b: 32 };
const plotW = W - M.l - M.r;
const plotH = H - M.t - M.b;
const X0 = 1;
const B_MAX = 40;

function toX(x: number, xMin: number, xMax: number) {
  return M.l + ((x - xMin) / (xMax - xMin)) * plotW;
}
function toY(y: number, yMin: number, yMax: number) {
  return M.t + ((yMax - y) / (yMax - yMin)) * plotH;
}

function integrand(mode: Mode, p: number): (x: number) => number {
  if (mode === 'exp') return (x) => Math.exp(-x);
  if (mode === 'ln') return (x) => (x > 1 ? 1 / (x * Math.log(x)) : NaN);
  if (mode === 'gauss') return (x) => x * Math.exp(-x * x);
  return (x) => (x > 0 ? Math.pow(x, -p) : NaN);
}

function exactA(mode: Mode, p: number, b: number): number {
  const f = integrand(mode, p);
  if (mode === 'p') {
    if (Math.abs(p - 1) < 1e-9) return Math.log(b);
    return (Math.pow(b, 1 - p) - 1) / (1 - p);
  }
  if (mode === 'exp') return 1 - Math.exp(-b);
  if (mode === 'gauss') return 0.5 * (Math.exp(-1) - Math.exp(-b * b));
  return integrate(f, Math.max(X0, 1.001), b);
}

function limitInfo(mode: Mode, p: number): { converges: boolean; value: number; label: string } {
  if (mode === 'p') {
    const converges = p > 1;
    return { converges, value: converges ? 1 / (p - 1) : Infinity, label: converges ? `1/(p−1) = ${fmt(1 / (p - 1))}` : 'diverge' };
  }
  if (mode === 'exp') return { converges: true, value: Math.exp(-1), label: 'e⁻¹ ≈ 0.3679' };
  if (mode === 'gauss') return { converges: true, value: 0.5 * Math.exp(-1), label: '½ e⁻¹ ≈ 0.1839' };
  return { converges: false, value: Infinity, label: 'diverge' };
}

export function ImproperIntegralViz() {
  const statusId = useId();
  const [mode, setMode] = useState<Mode>('p');
  const [p, setP] = useState(2);
  const [b, setB] = useState(8);
  const [playing, setPlaying] = useState(false);
  const [showLimit, setShowLimit] = useState(true);
  const playRef = useRef<number | null>(null);

  const f = useMemo(() => integrand(mode, p), [mode, p]);
  const info = limitInfo(mode, p);
  const area = exactA(mode, p, b);
  const xMax = Math.max(b, 6);

  useEffect(() => {
    if (!playing) return;
    const tick = () => {
      setB((prev) => {
        if (prev >= B_MAX) {
          setPlaying(false);
          return B_MAX;
        }
        return Math.min(B_MAX, prev + 0.4);
      });
      playRef.current = requestAnimationFrame(tick);
    };
    playRef.current = requestAnimationFrame(tick);
    return () => {
      if (playRef.current) cancelAnimationFrame(playRef.current);
    };
  }, [playing]);

  const { yMin, yMax } = useMemo(() => {
    const ys: number[] = [0];
    for (let i = 0; i <= 200; i++) {
      const x = X0 + (i / 200) * (xMax - X0);
      const y = safeEval(f, x);
      if (isFinite(y)) ys.push(y);
    }
    const hi = Math.max(...ys, 0.2);
    return { yMin: -0.05 * hi, yMax: hi * 1.15 };
  }, [f, xMax]);

  const curve = useMemo(() => {
    let d = '';
    let on = false;
    for (let i = 0; i <= 240; i++) {
      const x = X0 + (i / 240) * (b - X0);
      const y = safeEval(f, x);
      if (!isFinite(y)) {
        on = false;
        continue;
      }
      const sx = toX(x, X0, xMax);
      const sy = toY(Math.max(yMin, Math.min(yMax, y)), yMin, yMax);
      d += on ? ` L${sx},${sy}` : `M${sx},${sy}`;
      on = true;
    }
    return d;
  }, [f, b, xMax, yMin, yMax]);

  const shade = useMemo(() => {
    const y0 = toY(0, yMin, yMax);
    let d = `M${toX(X0, X0, xMax)},${y0}`;
    for (let i = 0; i <= 240; i++) {
      const x = X0 + (i / 240) * (b - X0);
      const y = safeEval(f, x);
      if (!isFinite(y)) continue;
      d += ` L${toX(x, X0, xMax)},${toY(Math.max(yMin, Math.min(yMax, y)), yMin, yMax)}`;
    }
    d += ` L${toX(b, X0, xMax)},${y0} Z`;
    return d;
  }, [f, b, xMax, yMin, yMax]);

  const aSamples = useMemo(() => {
    const pts: Array<{ x: number; y: number }> = [];
    for (let i = 0; i <= 80; i++) {
      const bi = X0 + 0.5 + (i / 80) * (B_MAX - X0 - 0.5);
      pts.push({ x: bi, y: exactA(mode, p, bi) });
    }
    return pts;
  }, [mode, p]);

  const aYMax = useMemo(() => {
    const vals = aSamples.filter((pt) => pt.x <= Math.max(b, 8)).map((pt) => pt.y);
    const hi = Math.max(...vals, info.converges ? info.value : 1, 0.4);
    return hi * 1.2;
  }, [aSamples, b, info]);

  const aPath = useMemo(() => {
    let d = '';
    aSamples.forEach((pt, i) => {
      const sx = toX(pt.x, X0, B_MAX);
      const sy = toY(Math.max(0, Math.min(aYMax, pt.y)), 0, aYMax);
      d += i === 0 ? `M${sx},${sy}` : ` L${sx},${sy}`;
    });
    return d;
  }, [aSamples, aYMax]);

  const fnLabel =
    mode === 'p' ? `1/xᵖ, p = ${fmt(p, 1)}` : mode === 'exp' ? 'e⁻ˣ' : mode === 'ln' ? '1/(x ln x)' : 'x e⁻ˣ²';

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            ∫₁^∞ f(x) dx se define como lim<sub>b→∞</sub> ∫₁<sup>b</sup> f. Si el área se estabiliza, <strong>converge</strong>; si crece sin límite, <strong>diverge</strong>.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Para 1/xᵖ: p &gt; 1 converge a 1/(p−1). La curva 1/x se aplasta, pero su área acumulada no para de crecer.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          {[
            { id: 'p' as const, label: '1/xᵖ' },
            { id: 'exp' as const, label: 'e⁻ˣ' },
            { id: 'ln' as const, label: '1/(x ln x)' },
            { id: 'gauss' as const, label: 'x e⁻ˣ²' },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setMode(opt.id);
                setB(8);
              }}
              className={`rounded-md border px-2 py-1 text-xs font-mono transition ${
                mode === opt.id
                  ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'border-[var(--border)] bg-[var(--bg)] text-[var(--fg)] hover:bg-[var(--accent-soft)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="min-w-[240px] flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
            <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">f(x)</p>
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img">
              <path d={shade} fill="var(--accent-strong)" fillOpacity={0.22} />
              <line x1={M.l} y1={toY(0, yMin, yMax)} x2={W - M.r} y2={toY(0, yMin, yMax)} stroke="currentColor" opacity={0.4} />
              <path d={curve} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
              <polygon
                points={`${W - 22},${toY(0, yMin, yMax) - 4} ${W - 10},${toY(0, yMin, yMax)} ${W - 22},${toY(0, yMin, yMax) + 4}`}
                fill="currentColor"
                opacity={0.45}
              />
              {b >= 30 ? (
                <text x={W - M.r - 6} y={H - 10} textAnchor="end" fontSize={12} opacity={0.5} fill="currentColor">
                  …
                </text>
              ) : null}
              <text x={W - M.r} y={H - 10} textAnchor="end" fontSize={10} opacity={0.45} fill="currentColor">
                b → ∞
              </text>
            </svg>
          </div>
          <div className="min-w-[240px] flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
            <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">A(b)</p>
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img">
              {showLimit && info.converges ? (
                <line
                  x1={M.l}
                  y1={toY(info.value, 0, aYMax)}
                  x2={W - M.r}
                  y2={toY(info.value, 0, aYMax)}
                  stroke="orange"
                  strokeDasharray="4 3"
                />
              ) : null}
              <path d={aPath} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
              <circle cx={toX(b, X0, B_MAX)} cy={toY(Math.min(area, aYMax), 0, aYMax)} r={5} fill="orange" />
              <text x={W - M.r} y={M.t + 12} textAnchor="end" fontSize={10} fill="currentColor" opacity={0.6}>
                {info.converges ? `→ ${fmt(info.value)}` : '→ ∞'}
              </text>
            </svg>
          </div>
        </div>

        <div id={statusId} className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-xs" aria-live="polite">
          <p>f(x) = {fnLabel}</p>
          <p>
            ∫₁<sup>{fmt(b, 1)}</sup> f = {fmt(area)} · límite b→∞: {info.label}
          </p>
        </div>

        <ButtonRow>
          <VizButton active={playing} onClick={() => setPlaying((v) => !v)}>
            {playing ? 'Pausar' : 'Animar b → ∞'}
          </VizButton>
        </ButtonRow>

        <ControlsStack>
          <SliderRow label={`b = ${fmt(b, 1)}`} value={b} min={1.5} max={B_MAX} step={0.5} onChange={(v) => { setPlaying(false); setB(v); }} />
          {mode === 'p' ? (
            <SliderRow label={`p = ${fmt(p, 1)}`} value={p} min={0.5} max={3} step={0.1} onChange={setP} />
          ) : null}
          <ToggleRow label="Mostrar valor límite" checked={showLimit} onChange={setShowLimit} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
