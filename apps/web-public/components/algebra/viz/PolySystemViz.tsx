'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from './controls';
import { linspace } from './math2d';

const ZERO = 1e-8;
const W = 420;
const H = 260;
const MARGIN = { l: 36, r: 16, t: 16, b: 28 };

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

function formatPoly(name: string, a: number, b: number, c: number): string {
  const parts: string[] = [];
  const push = (coef: number, mono: string) => {
    if (Math.abs(coef) < ZERO) return;
    const abs = Math.abs(coef);
    const body = mono === '' ? present(abs) : abs === 1 ? mono : `${present(abs)}${mono}`;
    if (parts.length === 0) parts.push(coef < 0 ? `−${body}` : body);
    else parts.push(coef < 0 ? `−${body}` : `+${body}`);
  };
  push(a, 'x²');
  push(b, 'x');
  push(c, '');
  return parts.length ? `${name}(x)=${parts.join('')}` : `${name}(x)=0`;
}

type SolKind = 'two' | 'one' | 'none' | 'infinite' | 'linear';

function solveDiff(A: number, B: number, C: number): { kind: SolKind; roots: number[]; delta: number | null } {
  if (Math.abs(A) < ZERO && Math.abs(B) < ZERO) {
    if (Math.abs(C) < ZERO) return { kind: 'infinite', roots: [], delta: null };
    return { kind: 'none', roots: [], delta: null };
  }
  if (Math.abs(A) < ZERO) {
    return { kind: 'linear', roots: [-C / B], delta: null };
  }
  const delta = B * B - 4 * A * C;
  if (delta > ZERO) {
    const s = Math.sqrt(delta);
    return { kind: 'two', roots: [(-B - s) / (2 * A), (-B + s) / (2 * A)], delta };
  }
  if (Math.abs(delta) <= ZERO) {
    return { kind: 'one', roots: [-B / (2 * A)], delta: 0 };
  }
  return { kind: 'none', roots: [], delta };
}

/**
 * System y=P(x), y=Q(x) via intersections / P−Q=0 (ALG-POL-010).
 */
export function PolySystemViz() {
  const [a1, setA1] = useState(1);
  const [b1, setB1] = useState(-1);
  const [c1, setC1] = useState(-2);
  const [a2, setA2] = useState(-0.4);
  const [b2, setB2] = useState(2);
  const [c2, setC2] = useState(1.5);
  const [view, setView] = useState<'graph' | 'diff' | 'algebra'>('graph');
  const [sel, setSel] = useState(0);
  const guideId = useId();
  const statusId = useId();

  const P = (x: number) => a1 * x * x + b1 * x + c1;
  const Q = (x: number) => a2 * x * x + b2 * x + c2;
  const A = a1 - a2;
  const B = b1 - b2;
  const C = c1 - c2;
  const solved = useMemo(() => solveDiff(A, B, C), [A, B, C]);

  const sols = solved.roots.map((x) => ({ x, y: P(x) }));
  const selected = sols[Math.min(sel, Math.max(0, sols.length - 1))] ?? null;

  const xMin = -4;
  const xMax = 4;
  let yMin = -6;
  let yMax = 8;
  for (const x of linspace(xMin, xMax, 40)) {
    yMin = Math.min(yMin, P(x), Q(x));
    yMax = Math.max(yMax, P(x), Q(x));
  }
  for (const s of sols) {
    yMin = Math.min(yMin, s.y - 1);
    yMax = Math.max(yMax, s.y + 1);
  }
  const pad = (yMax - yMin) * 0.08 || 1;
  yMin -= pad;
  yMax += pad;

  const plotW = W - MARGIN.l - MARGIN.r;
  const plotH = H - MARGIN.t - MARGIN.b;
  const toX = (x: number) => MARGIN.l + ((x - xMin) / (xMax - xMin)) * plotW;
  const toY = (y: number) => MARGIN.t + ((yMax - y) / (yMax - yMin)) * plotH;

  const pathOf = (fn: (x: number) => number) => {
    const xs = linspace(xMin, xMax, 160);
    const pts = xs.map((x) => `${toX(x)},${toY(fn(x))}`);
    return pts.length >= 2 ? `M${pts.join(' L')}` : '';
  };

  const pPath = pathOf(P);
  const qPath = pathOf(Q);
  const rPath = pathOf((x) => P(x) - Q(x));

  const countLabel =
    solved.kind === 'infinite'
      ? 'Infinitas soluciones'
      : solved.kind === 'none'
        ? '0 soluciones reales'
        : solved.kind === 'one'
          ? '1 solución real (tangente · multiplicidad 2)'
          : solved.kind === 'linear'
            ? '1 solución real (diferencia lineal)'
            : '2 soluciones reales';

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Una solución de un sistema debe satisfacer las dos ecuaciones al mismo tiempo. En el
            gráfico, esto ocurre exactamente donde las curvas se intersectan.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Ejemplo: sistema de dos polinomios cuadráticos como y=P(x) y y=Q(x). P(x)=Q(x) ⟺
            P(x)−Q(x)=0.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">Sistema</p>
          <p className="mt-1">y={formatPoly('P', a1, b1, c1).replace('P(x)=', '')}</p>
          <p>y={formatPoly('Q', a2, b2, c2).replace('Q(x)=', '')}</p>
          <p className="mt-1 text-[var(--fg-muted)]">{formatPoly('P', a1, b1, c1)} · {formatPoly('Q', a2, b2, c2)}</p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <ButtonRow>
            <VizButton active={view === 'graph'} onClick={() => setView('graph')}>Gráfica</VizButton>
            <VizButton active={view === 'diff'} onClick={() => setView('diff')}>Ver P−Q</VizButton>
            <VizButton active={view === 'algebra'} onClick={() => setView('algebra')}>Algebraica</VizButton>
          </ButtonRow>

          {view !== 'algebra' ? (
            <>
              <div className="mt-2 flex gap-3 text-xs">
                <span className="text-[var(--accent-strong)]">P(x) — primera ecuación</span>
                <span className="text-teal">Q(x) — segunda ecuación</span>
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto mt-2 h-auto w-full max-w-xl" role="img" aria-labelledby={statusId}>
                <line x1={toX(xMin)} y1={toY(0)} x2={toX(xMax)} y2={toY(0)} stroke="currentColor" opacity={0.4} />
                <line x1={toX(0)} y1={toY(yMin)} x2={toX(0)} y2={toY(yMax)} stroke="currentColor" opacity={0.4} />
                {view === 'graph' ? (
                  <>
                    {pPath ? <path d={pPath} fill="none" stroke="var(--accent-strong)" strokeWidth={2.4} /> : null}
                    {qPath ? <path d={qPath} fill="none" stroke="teal" strokeWidth={2.4} /> : null}
                    <text x={toX(2.6)} y={toY(P(2.6)) - 6} fontSize={11} fill="var(--accent-strong)">P(x)</text>
                    <text x={toX(2.6)} y={toY(Q(2.6)) + 14} fontSize={11} fill="teal">Q(x)</text>
                  </>
                ) : (
                  <>
                    {rPath ? <path d={rPath} fill="none" stroke="orange" strokeWidth={2.4} /> : null}
                    <text x={20} y={24} fontSize={11} fill="orange">R(x)=P(x)−Q(x)</text>
                  </>
                )}
                {sols.map((s, i) => (
                  <g key={i}>
                    <line x1={toX(s.x)} y1={toY(yMin)} x2={toX(s.x)} y2={toY(s.y)} stroke="currentColor" strokeDasharray="3 2" opacity={0.35} />
                    <circle
                      cx={toX(s.x)}
                      cy={toY(view === 'diff' ? 0 : s.y)}
                      r={i === sel ? 7 : 5}
                      fill="orange"
                      opacity={i === sel ? 1 : 0.55}
                    />
                    <text x={toX(s.x) + 6} y={toY(view === 'diff' ? 0 : s.y) - 8} fontSize={10} fill="currentColor">
                      S{i + 1}=({present(s.x)},{present(s.y)})
                    </text>
                  </g>
                ))}
              </svg>
            </>
          ) : (
            <div className="mt-3 space-y-2 font-mono text-sm">
              <p>P(x)=Q(x)</p>
              <p>⇕</p>
              <p>P(x)−Q(x)=0</p>
              <p>
                ({present(A)})x²+({present(B)})x+({present(C)})=0
              </p>
              <p className="text-[var(--fg-muted)]">
                A=a₁−a₂={present(A)}, B=b₁−b₂={present(B)}, C=c₁−c₂={present(C)}
              </p>
              {Math.abs(A) < ZERO ? (
                <p className="text-orange">La diferencia se reduce a una ecuación lineal (o degenerada).</p>
              ) : (
                <p>Δ=B²−4AC={present(solved.delta ?? NaN)}</p>
              )}
              <p>
                raíces x: {solved.roots.length ? solved.roots.map((r) => present(r)).join(', ') : '—'}
              </p>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Soluciones del sistema
          </p>
          <p className="mt-1 font-medium">{countLabel}</p>
          {solved.kind === 'infinite' ? (
            <p className="text-[var(--fg-muted)]">Ambas ecuaciones representan la misma curva.</p>
          ) : sols.length ? (
            <p className="mt-1 font-mono">
              S={'{' + sols.map((s) => `(${present(s.x)},${present(s.y)})`).join(', ') + '}'}
            </p>
          ) : (
            <p className="text-[var(--fg-muted)]">Sin puntos de intersección reales.</p>
          )}
          {sols.length > 1 ? (
            <ButtonRow>
              {sols.map((_, i) => (
                <VizButton key={i} active={sel === i} onClick={() => setSel(i)}>
                  S{i + 1}
                </VizButton>
              ))}
            </ButtonRow>
          ) : null}
          {selected ? (
            <p className="mt-2 font-mono text-[var(--fg-muted)]">
              P({present(selected.x)})={present(P(selected.x))} · Q({present(selected.x)})=
              {present(Q(selected.x))} · iguales ✓
            </p>
          ) : null}
        </section>

        <div id={statusId} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" aria-live="polite">
          <p className="font-mono">
            P−Q=0 · {countLabel}
            {solved.delta != null ? ` · Δ=${present(solved.delta)}` : ''}
          </p>
        </div>

        <ControlsStack>
          <p className="text-xs font-semibold text-[var(--accent-strong)]">Polinomio P</p>
          <SliderRow label="a₁" value={a1} min={-2} max={2} step={0.1} onChange={(v) => setA1(snap(v, -2, 2, 0.1))} />
          <SliderRow label="b₁" value={b1} min={-3} max={3} step={0.1} onChange={(v) => setB1(snap(v, -3, 3, 0.1))} />
          <SliderRow label="c₁" value={c1} min={-4} max={4} step={0.1} onChange={(v) => setC1(snap(v, -4, 4, 0.1))} />
          <p className="text-xs font-semibold text-teal">Polinomio Q</p>
          <SliderRow label="a₂" value={a2} min={-2} max={2} step={0.1} onChange={(v) => setA2(snap(v, -2, 2, 0.1))} />
          <SliderRow label="b₂" value={b2} min={-3} max={3} step={0.1} onChange={(v) => setB2(snap(v, -3, 3, 0.1))} />
          <SliderRow label="c₂" value={c2} min={-4} max={4} step={0.1} onChange={(v) => setC2(snap(v, -4, 4, 0.1))} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
