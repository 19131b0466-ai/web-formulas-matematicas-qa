'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from './controls';
import { linspace } from './math2d';

const ZERO = 1e-9;
const W = 420;
const H = 240;
const VIEW = { min: -3, max: 3 };
const MARGIN = { l: 36, r: 16, t: 16, b: 26 };
const GRID = 28;

function present(n: number, d = 2): string {
  if (!Number.isFinite(n)) return '—';
  return fmt(Number(n.toFixed(d)), d);
}

function snap(v: number, min: number, max: number, step: number): number {
  const c = Math.min(max, Math.max(min, v));
  const s = min + Math.round((c - min) / step) * step;
  if (Math.abs(s) < step / 2) return 0;
  return Number(s.toFixed(2));
}

function formatP(a: number, b: number, c: number, mode: 'hom' | 'non'): string {
  const parts: string[] = [];
  const push = (coef: number, mono: string) => {
    if (Math.abs(coef) < ZERO) return;
    const abs = Math.abs(coef);
    const body = abs === 1 ? mono : `${present(abs)}${mono}`;
    if (parts.length === 0) parts.push(coef < 0 ? `−${body}` : body);
    else parts.push(coef < 0 ? `−${body}` : `+${body}`);
  };
  push(a, 'x²');
  push(b, 'xy');
  if (mode === 'hom') push(c, 'y²');
  else push(c, 'y');
  const lhs = mode === 'hom' ? 'P' : 'Q';
  return parts.length ? `${lhs}(x,y)=${parts.join('')}` : `${lhs}(x,y)=0`;
}

function evalHom(a: number, b: number, c: number, x: number, y: number): number {
  return a * x * x + b * x * y + c * y * y;
}
function evalNon(a: number, b: number, c: number, x: number, y: number): number {
  return a * x * x + b * x * y + c * y;
}

/**
 * Homogeneous polynomial: same total degree + P(tx,ty)=t^d P (ALG-POL-009).
 */
export function HomogeneousPolyViz() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0.4);
  const [c, setC] = useState(-0.6);
  const [t, setT] = useState(1.5);
  const [x0, setX0] = useState(1);
  const [y0, setY0] = useState(1);
  const [mode, setMode] = useState<'hom' | 'non'>('hom');
  const [showTerms, setShowTerms] = useState(true);
  const guideId = useId();
  const statusId = useId();

  const d = 2;
  const eq = formatP(a, b, c, mode);
  const evalF = mode === 'hom' ? evalHom : evalNon;
  const z0 = evalF(a, b, c, x0, y0);
  const xt = t * x0;
  const yt = t * y0;
  const zt = evalF(a, b, c, xt, yt);
  const scaled = mode === 'hom' ? Math.pow(t, d) * z0 : NaN;
  const match = mode === 'hom' && Number.isFinite(zt) && Math.abs(zt - scaled) < 1e-6;

  const plotW = W - MARGIN.l - MARGIN.r;
  const plotH = H - MARGIN.t - MARGIN.b;
  const toX = (x: number) => MARGIN.l + ((x - VIEW.min) / (VIEW.max - VIEW.min)) * plotW;
  const toY = (y: number) => MARGIN.t + ((VIEW.max - y) / (VIEW.max - VIEW.min)) * plotH;

  const cells = useMemo(() => {
    const xs = linspace(VIEW.min, VIEW.max, GRID);
    const ys = linspace(VIEW.min, VIEW.max, GRID);
    const fn = mode === 'hom' ? evalHom : evalNon;
    return ys.flatMap((y) => xs.map((x) => ({ x, y, z: fn(a, b, c, x, y) })));
  }, [a, b, c, mode]);

  const maxAbs = Math.max(0.5, ...cells.map((p) => Math.abs(p.z)));
  const cellW = plotW / GRID;
  const cellH = plotH / GRID;

  const raySamples = [0.5, 1, 1.5, 2].map((s) => {
    const px = s * x0;
    const py = s * y0;
    const pz = evalF(a, b, c, px, py);
    const expect = mode === 'hom' ? s * s * z0 : null;
    return { s, px, py, pz, expect };
  });

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Un polinomio es homogéneo cuando todos sus términos tienen el mismo grado total. En este
            ejemplo, x², xy e y² tienen grado 2.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Mueve t y observa qué ocurre al escalar simultáneamente x e y: el valor se multiplica
            por t². P(tx,ty)=t²P(x,y).
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="font-mono text-lg font-semibold text-[var(--accent-strong)]">{eq}</p>
          {mode === 'hom' ? (
            <div className="mt-2 grid gap-2 sm:grid-cols-3 text-center text-sm">
              <div className="rounded-lg border border-[var(--border)] px-2 py-2">
                <p className="font-mono">{present(a) === '1' || present(a) === '−1' ? (a < 0 ? '−x²' : 'x²') : `${present(a)}x²`}</p>
                <p className="text-xs text-[var(--fg-muted)]">deg=2 · (2,0)</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] px-2 py-2">
                <p className="font-mono">{Math.abs(b) < ZERO ? '0·xy' : `${present(b)}xy`}</p>
                <p className="text-xs text-[var(--fg-muted)]">1+1=2 · (1,1)</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] px-2 py-2">
                <p className="font-mono">{Math.abs(c) < ZERO ? '0·y²' : `${present(c)}y²`}</p>
                <p className="text-xs text-[var(--fg-muted)]">deg=2 · (0,2)</p>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Grados: deg(x²)=2, deg(xy)=2, deg(y)=1 → grados distintos → no es homogéneo.
            </p>
          )}
          {mode === 'hom' ? (
            <p className="mt-2 font-mono text-sm">2=2=2 · d=2 (calculado) · homogéneo de grado 2</p>
          ) : (
            <p className="mt-2 font-mono text-sm text-orange">No es homogéneo.</p>
          )}
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Comprobación P(tx,ty) ?=? t²P(x,y)
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 font-mono text-sm">
            <p>
              P({present(x0)},{present(y0)})={present(z0)}
            </p>
            <p>
              t={present(t)} → ({present(xt)},{present(yt)})
            </p>
            <p>
              P(tx,ty)={present(zt)}
            </p>
            <p>
              {mode === 'hom' ? (
                <>
                  t²P={present(scaled)} {match ? '✓' : ''}
                </>
              ) : (
                <>no hay un único d</>
              )}
            </p>
          </div>
          {mode === 'hom' && match ? (
            <p className="mt-1 text-sm text-teal">Se cumple P(tx,ty)=t²P(x,y).</p>
          ) : null}
          {mode === 'non' ? (
            <p className="mt-2 font-mono text-xs text-[var(--fg-muted)]">
              Q(tx,ty)=t²x²+{present(b)}t²xy{c >= 0 ? '+' : '−'}{present(Math.abs(c))}ty — potencias distintas de t.
            </p>
          ) : (
            <p className="mt-2 font-mono text-xs text-[var(--fg-muted)]">
              P(tx,ty)=a(tx)²+b(tx)(ty)+c(ty)²=t²(ax²+bxy+cy²)=t²P(x,y)
            </p>
          )}
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-xl" role="img" aria-labelledby={statusId}>
            {cells.map((cell, i) => {
              const xi = i % GRID;
              const yi = Math.floor(i / GRID);
              const tnorm = Math.max(-1, Math.min(1, cell.z / maxAbs));
              const fill =
                Math.abs(tnorm) < 0.05
                  ? 'rgb(210,210,210)'
                  : tnorm > 0
                    ? `rgb(${220 - 60 * tnorm},${160 - 80 * tnorm},80)`
                    : `rgb(80,${140 + 40 * tnorm},${220 + 30 * tnorm})`;
              return (
                <rect
                  key={i}
                  x={MARGIN.l + xi * cellW}
                  y={MARGIN.t + (GRID - 1 - yi) * cellH}
                  width={cellW + 0.4}
                  height={cellH + 0.4}
                  fill={fill}
                />
              );
            })}
            <line x1={toX(VIEW.min)} y1={toY(0)} x2={toX(VIEW.max)} y2={toY(0)} stroke="currentColor" opacity={0.5} />
            <line x1={toX(0)} y1={toY(VIEW.min)} x2={toX(0)} y2={toY(VIEW.max)} stroke="currentColor" opacity={0.5} />
            <line x1={toX(0)} y1={toY(0)} x2={toX(xt)} y2={toY(yt)} stroke="orange" strokeWidth={1.5} strokeDasharray="4 2" />
            <circle cx={toX(x0)} cy={toY(y0)} r={6} fill="var(--accent-strong)" />
            <text x={toX(x0) + 8} y={toY(y0) - 6} fontSize={10}>
              ({present(x0)},{present(y0)}) P={present(z0)}
            </text>
            <circle cx={toX(xt)} cy={toY(yt)} r={6} fill="orange" />
            <text x={toX(xt) + 8} y={toY(yt) + 12} fontSize={10} fill="orange">
              ({present(xt)},{present(yt)}) P={present(zt)}
            </text>
            {raySamples.map((r) => (
              <circle key={r.s} cx={toX(r.px)} cy={toY(r.py)} r={3} fill="teal" opacity={0.7} />
            ))}
          </svg>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">
            El punto escalado se mueve sobre el rayo desde el origen. Color = valor de P, no el grado.
          </p>
        </section>

        {showTerms && mode === 'hom' ? (
          <section className="overflow-x-auto rounded-xl border border-[var(--border)] px-3 py-3 text-sm">
            <table className="w-full text-left font-mono text-xs sm:text-sm">
              <thead>
                <tr className="text-[var(--fg-muted)]">
                  <th className="py-1">Término</th>
                  <th>Exponentes</th>
                  <th>Grado</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>ax²</td><td>(2,0)</td><td>2</td></tr>
                <tr><td>bxy</td><td>(1,1)</td><td>2</td></tr>
                <tr><td>cy²</td><td>(0,2)</td><td>2</td></tr>
              </tbody>
            </table>
            <p className="mt-1 font-mono">2=2=2 ∴ homogéneo de grado 2</p>
          </section>
        ) : null}

        <div id={statusId} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" aria-live="polite">
          <p className="font-mono">{eq} · d={mode === 'hom' ? 2 : '—'} · t={present(t)} · t²={present(t * t)}</p>
          {mode === 'hom' ? (
            <p className="mt-1 text-[var(--fg-muted)]">
              P({present(t)}x,{present(t)}y)={present(zt)} = {present(t * t)}·P={present(scaled)}
            </p>
          ) : null}
        </div>

        <ControlsStack>
          <ButtonRow>
            <VizButton active={mode === 'hom'} onClick={() => setMode('hom')}>Homogéneo</VizButton>
            <VizButton active={mode === 'non'} onClick={() => setMode('non')}>No homogéneo</VizButton>
            <VizButton active={showTerms} onClick={() => setShowTerms((s) => !s)}>Mostrar términos</VizButton>
          </ButtonRow>
          <SliderRow label="t" value={t} min={-2} max={2.5} step={0.1} onChange={(v) => setT(snap(v, -2, 2.5, 0.1))} />
          <SliderRow label="x₀" value={x0} min={-2} max={2} step={0.1} onChange={(v) => setX0(snap(v, -2, 2, 0.1))} />
          <SliderRow label="y₀" value={y0} min={-2} max={2} step={0.1} onChange={(v) => setY0(snap(v, -2, 2, 0.1))} />
          <SliderRow label="a" value={a} min={-2} max={2} step={0.1} onChange={(v) => setA(snap(v, -2, 2, 0.1))} />
          <SliderRow label="b" value={b} min={-2} max={2} step={0.1} onChange={(v) => setB(snap(v, -2, 2, 0.1))} />
          <SliderRow label="c" value={c} min={-2} max={2} step={0.1} onChange={(v) => setC(snap(v, -2, 2, 0.1))} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
