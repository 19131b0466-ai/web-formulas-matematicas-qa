'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from './controls';

const ZERO_EPS = 1e-9;
const DISC_EPS = 1e-10;
const A_MIN = 0.1;

type Op = '<' | '≤' | '>' | '≥';
type RootCase = 'two' | 'one' | 'none';

type SolSet =
  | { kind: 'all' }
  | { kind: 'empty' }
  | { kind: 'point'; r: number }
  | { kind: 'punctured'; r: number }
  | { kind: 'interval'; lo: number; hi: number; leftClosed: boolean; rightClosed: boolean }
  | {
      kind: 'union';
      leftClosed: boolean;
      rightClosed: boolean;
      x1: number;
      x2: number;
    };

function snap(val: number, min: number, max: number, step: number): number {
  const clamped = Math.min(max, Math.max(min, val));
  const steps = Math.round((clamped - min) / step);
  const snapped = min + steps * step;
  if (Math.abs(snapped) < step / 2) return 0;
  return Number(snapped.toFixed(2));
}

function snapA(val: number): number {
  let v = snap(val, -3, 3, 0.1);
  if (Math.abs(v) < A_MIN) v = val >= 0 ? A_MIN : -A_MIN;
  return Number(v.toFixed(2));
}

function present(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '—';
  return fmt(Number(n.toFixed(digits)), digits);
}

function isZero(n: number): boolean {
  return Math.abs(n) < ZERO_EPS;
}

function formatQuad(a: number, b: number, c: number): string {
  const parts: string[] = [];
  if (!isZero(a)) {
    if (Math.abs(a) === 1) parts.push(a < 0 ? '−x²' : 'x²');
    else parts.push(`${present(a)}x²`);
  }
  if (!isZero(b)) {
    const absB = present(Math.abs(b));
    const bx = Math.abs(b) === 1 ? 'x' : `${absB}x`;
    if (parts.length === 0) parts.push(b < 0 ? `−${bx}` : bx);
    else parts.push(b < 0 ? `−${bx}` : `+${bx}`);
  }
  if (!isZero(c)) {
    const absC = present(Math.abs(c));
    if (parts.length === 0) parts.push(c < 0 ? `−${absC}` : absC);
    else parts.push(c < 0 ? `−${absC}` : `+${absC}`);
  }
  return parts.length ? parts.join('') : '0';
}

function wantNonNeg(op: Op): boolean {
  return op === '>' || op === '≥';
}
function wantNonPos(op: Op): boolean {
  return op === '<' || op === '≤';
}
function isStrict(op: Op): boolean {
  return op === '<' || op === '>';
}

function solveInequality(
  a: number,
  op: Op,
  rootCase: RootCase,
  x1: number | null,
  x2: number | null,
  r: number | null,
): SolSet {
  const up = a > 0;
  const ge = wantNonNeg(op); // f ≥ 0 or f > 0 region of interest for "positive side"
  const strict = isStrict(op);

  if (rootCase === 'none') {
    // always same sign as a
    if (up) {
      if (ge) return { kind: 'all' };
      return { kind: 'empty' };
    }
    if (wantNonPos(op)) return { kind: 'all' };
    return { kind: 'empty' };
  }

  if (rootCase === 'one' && r !== null) {
    const root = r;
    if (up) {
      if (op === '≥') return { kind: 'all' };
      if (op === '>') return { kind: 'punctured', r: root };
      if (op === '≤') return { kind: 'point', r: root };
      return { kind: 'empty' };
    }
    if (op === '≤') return { kind: 'all' };
    if (op === '<') return { kind: 'punctured', r: root };
    if (op === '≥') return { kind: 'point', r: root };
    return { kind: 'empty' };
  }

  // two roots
  if (x1 === null || x2 === null) return { kind: 'empty' };
  const closed = !strict;

  if (up) {
    // (+) (-) (+)
    if (ge) {
      // outside
      return { kind: 'union', x1, x2, leftClosed: closed, rightClosed: closed };
    }
    // inside
    return {
      kind: 'interval',
      lo: x1,
      hi: x2,
      leftClosed: closed,
      rightClosed: closed,
    };
  }

  // a < 0: (-) (+) (-)
  if (ge) {
    // inside
    return {
      kind: 'interval',
      lo: x1,
      hi: x2,
      leftClosed: closed,
      rightClosed: closed,
    };
  }
  // outside
  return { kind: 'union', x1, x2, leftClosed: closed, rightClosed: closed };
}

function formatSol(sol: SolSet): { ineq: string; interval: string } {
  if (sol.kind === 'all') return { ineq: 'todo x∈ℝ', interval: 'ℝ' };
  if (sol.kind === 'empty') return { ineq: 'ningún x', interval: '∅' };
  if (sol.kind === 'point') {
    const rL = present(sol.r);
    return { ineq: `x=${rL}`, interval: `{${rL}}` };
  }
  if (sol.kind === 'punctured') {
    const rL = present(sol.r);
    return {
      ineq: `x≠${rL}`,
      interval: `(−∞,${rL})∪(${rL},∞)`,
    };
  }
  if (sol.kind === 'interval') {
    const lo = present(sol.lo);
    const hi = present(sol.hi);
    const left = sol.leftClosed ? '≤' : '<';
    const right = sol.rightClosed ? '≤' : '<';
    const iLeft = sol.leftClosed ? '[' : '(';
    const iRight = sol.rightClosed ? ']' : ')';
    return {
      ineq: `${lo}${left}x${right}${hi}`,
      interval: `${iLeft}${lo},${hi}${iRight}`,
    };
  }
  // union outside
  const x1 = present(sol.x1);
  const x2 = present(sol.x2);
  const left = sol.leftClosed ? '≤' : '<';
  const right = sol.rightClosed ? '≥' : '>';
  const iLeft = sol.leftClosed ? ']' : ')';
  const iRight = sol.rightClosed ? '[' : '(';
  return {
    ineq: `x${left}${x1} o x${right}${x2}`,
    interval: `(−∞,${x1}${iLeft}∪${iRight}${x2},∞)`,
  };
}

/**
 * Quadratic inequality f(x)=ax²+bx+c □ 0 (ALG-INE-002).
 * Graph shows sign of f; number line shows the solution set as intervals.
 */
export function QuadraticInequalityViz() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(-1);
  const [c, setC] = useState(-2);
  const [op, setOp] = useState<Op>('≤');
  const guideId = useId();
  const statusId = useId();

  const delta = b * b - 4 * a * c;
  const xv = -b / (2 * a);
  const yv = a * xv * xv + b * xv + c;

  let rootCase: RootCase = 'none';
  let x1: number | null = null;
  let x2: number | null = null;
  let r: number | null = null;

  if (delta > DISC_EPS) {
    rootCase = 'two';
    const s = Math.sqrt(delta);
    x1 = (-b - s) / (2 * a);
    x2 = (-b + s) / (2 * a);
    if (x1 > x2) [x1, x2] = [x2, x1];
  } else if (delta < -DISC_EPS) {
    rootCase = 'none';
  } else {
    rootCase = 'one';
    r = -b / (2 * a);
  }

  const sol = solveInequality(a, op, rootCase, x1, x2, r);
  const { ineq: solIneq, interval: solInterval } = formatSol(sol);

  const expr = formatQuad(a, b, c);
  const aL = present(a);
  const bL = present(b);
  const cL = present(c);
  const dL = present(delta, 4);
  const x1L = x1 !== null ? present(x1) : null;
  const x2L = x2 !== null ? present(x2) : null;
  const rL = r !== null ? present(r) : null;
  const xvL = present(xv);
  const yvL = present(yv);

  const signs =
    rootCase === 'two'
      ? a > 0
        ? ['+', '−', '+']
        : ['−', '+', '−']
      : null;

  const view = useMemo(() => {
    const focusX: number[] = [0, xv];
    if (x1 !== null) focusX.push(x1);
    if (x2 !== null) focusX.push(x2);
    if (r !== null) focusX.push(r);
    const xLo = Math.min(...focusX);
    const xHi = Math.max(...focusX);
    const xPad = Math.max(2, (xHi - xLo) * 0.35 + 1.2);
    const xMin = Math.min(-3, xLo - xPad);
    const xMax = Math.max(3, xHi + xPad);

    const samples: number[] = [0, yv];
    for (let i = 0; i <= 24; i++) {
      const x = xMin + ((xMax - xMin) * i) / 24;
      samples.push(a * x * x + b * x + c);
    }
    const yLo = Math.min(...samples);
    const yHi = Math.max(...samples);
    const yPad = Math.max(1.2, (yHi - yLo) * 0.22);
    let yMin = Math.min(-2.5, yLo - yPad);
    let yMax = Math.max(2.5, yHi + yPad);
    yMin = Math.min(yMin, -1);
    yMax = Math.max(yMax, 1);
    return { xMin, xMax, yMin, yMax };
  }, [a, b, c, xv, yv, x1, x2, r]);

  const W = 480;
  const H = 280;
  const margin = { l: 40, r: 22, t: 24, b: 30 };
  const plotW = W - margin.l - margin.r;
  const plotH = H - margin.t - margin.b;
  const toX = (x: number) =>
    margin.l + ((x - view.xMin) / (view.xMax - view.xMin)) * plotW;
  const toY = (y: number) =>
    margin.t + ((view.yMax - y) / (view.yMax - view.yMin)) * plotH;

  const parabolaPath = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 120; i++) {
      const x = view.xMin + ((view.xMax - view.xMin) * i) / 120;
      const y = a * x * x + b * x + c;
      pts.push(`${i === 0 ? 'M' : 'L'}${toX(x)},${toY(y)}`);
    }
    return pts.join(' ');
  }, [a, b, c, view]);

  const xTicks = useMemo(() => {
    const span = view.xMax - view.xMin;
    const step = span > 20 ? 5 : span > 10 ? 2 : 1;
    const ticks: number[] = [];
    const start = Math.ceil(view.xMin / step) * step;
    for (let t = start; t <= view.xMax + 1e-9; t += step) {
      if (Math.abs(t) > ZERO_EPS) ticks.push(Number(t.toFixed(4)));
    }
    return ticks;
  }, [view]);

  // Number line domain
  const lineDom = useMemo(() => {
    const pts = [0, xv];
    if (x1 !== null) pts.push(x1);
    if (x2 !== null) pts.push(x2);
    if (r !== null) pts.push(r);
    const lo = Math.min(...pts);
    const hi = Math.max(...pts);
    const pad = Math.max(2, (hi - lo) * 0.25 + 1);
    return { lo: lo - pad, hi: hi + pad };
  }, [xv, x1, x2, r]);

  const mapLine = (x: number) =>
    28 + ((x - lineDom.lo) / (lineDom.hi - lineDom.lo)) * 424;

  const ariaStatus = useMemo(() => {
    return `Inecuación ${expr}${op}0. Discriminante ${dL}. Solución ${solInterval}.`;
  }, [expr, op, dL, solInterval]);

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            La solución de una inecuación cuadrática es el conjunto de valores de x para los cuales
            la parábola está por encima, por debajo, o sobre el eje x, según la desigualdad elegida.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            La gráfica ayuda a decidir el signo de la función; la solución final se expresa como
            intervalos en la recta real (no como un “área del plano”).
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Inecuación actual
          </p>
          <p className="mt-2 font-mono text-lg font-semibold">
            {expr}
            {op}0
          </p>
          <p className="mt-1 font-mono text-sm text-[var(--fg-muted)]">f(x)={expr}</p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 text-sm leading-relaxed">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Discriminante y orientación
          </p>
          <p className="mt-2 font-mono">
            Δ=b²−4ac=({bL})²−4({aL})({cL})={dL}
          </p>
          <p className="mt-1">
            {rootCase === 'two'
              ? `Δ=${dL}>0 ⇒ dos raíces reales.`
              : rootCase === 'one'
                ? `Δ=${dL}=0 ⇒ una raíz doble.`
                : `Δ=${dL}<0 ⇒ sin raíces reales.`}
          </p>
          <p className="mt-1">
            {a > 0
              ? 'a>0: la parábola abre hacia arriba.'
              : 'a<0: la parábola abre hacia abajo.'}
          </p>
          {rootCase === 'two' && x1L && x2L ? (
            <p className="mt-1 font-mono">
              x₁={x1L}, x₂={x2L}
            </p>
          ) : null}
          {rootCase === 'one' && rL ? (
            <p className="mt-1 font-mono">x₁=x₂={rL}</p>
          ) : null}
        </section>

        {signs && x1L && x2L ? (
          <section className="rounded-xl border border-[var(--border)] px-3 py-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
              Análisis de signos
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center font-mono">
              <div className="rounded-lg border border-[var(--border)] px-2 py-2">
                <p className="text-xs text-[var(--fg-muted)]">(−∞,x₁)</p>
                <p className="mt-1 text-lg font-semibold">{signs[0]}</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] px-2 py-2">
                <p className="text-xs text-[var(--fg-muted)]">(x₁,x₂)</p>
                <p className="mt-1 text-lg font-semibold">{signs[1]}</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] px-2 py-2">
                <p className="text-xs text-[var(--fg-muted)]">(x₂,∞)</p>
                <p className="mt-1 text-lg font-semibold">{signs[2]}</p>
              </div>
            </div>
            <p className="mt-2 text-[var(--fg-muted)]">
              Con a{a > 0 ? '>0' : '<0'} el patrón es ({signs.join(')(')}).
            </p>
          </section>
        ) : null}

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Gráfica de apoyo · y=f(x)
          </p>
          <div className="mt-2 overflow-x-auto">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="mx-auto h-auto w-full max-w-xl"
              role="img"
              aria-labelledby={statusId}
            >
              {/* Sign bands on axis (subtle) */}
              {rootCase === 'two' && x1 !== null && x2 !== null ? (
                <>
                  <rect
                    x={toX(view.xMin)}
                    y={toY(0) - 10}
                    width={toX(x1) - toX(view.xMin)}
                    height={20}
                    fill={a > 0 ? 'color-mix(in oklab, teal 18%, transparent)' : 'color-mix(in oklab, orange 18%, transparent)'}
                  />
                  <rect
                    x={toX(x1)}
                    y={toY(0) - 10}
                    width={toX(x2) - toX(x1)}
                    height={20}
                    fill={a > 0 ? 'color-mix(in oklab, orange 18%, transparent)' : 'color-mix(in oklab, teal 18%, transparent)'}
                  />
                  <rect
                    x={toX(x2)}
                    y={toY(0) - 10}
                    width={toX(view.xMax) - toX(x2)}
                    height={20}
                    fill={a > 0 ? 'color-mix(in oklab, teal 18%, transparent)' : 'color-mix(in oklab, orange 18%, transparent)'}
                  />
                </>
              ) : null}

              {xTicks.map((t) => (
                <g key={t}>
                  <line
                    x1={toX(t)}
                    y1={toY(0) - 4}
                    x2={toX(t)}
                    y2={toY(0) + 4}
                    stroke="currentColor"
                    opacity={0.35}
                  />
                  <text
                    x={toX(t)}
                    y={toY(0) + 16}
                    textAnchor="middle"
                    fontSize={10}
                    fill="currentColor"
                    opacity={0.55}
                  >
                    {present(t, 0)}
                  </text>
                </g>
              ))}

              <line
                x1={toX(view.xMin)}
                y1={toY(0)}
                x2={toX(view.xMax)}
                y2={toY(0)}
                stroke="currentColor"
                strokeWidth={2}
                opacity={0.65}
              />
              <line
                x1={toX(0)}
                y1={toY(view.yMin)}
                x2={toX(0)}
                y2={toY(view.yMax)}
                stroke="currentColor"
                strokeWidth={1.5}
                opacity={0.4}
              />
              <text
                x={toX(view.xMax) - 4}
                y={toY(0) - 8}
                textAnchor="end"
                fontSize={11}
                fontWeight={600}
                fill="currentColor"
              >
                eje x
              </text>

              <path
                d={parabolaPath}
                fill="none"
                stroke="var(--accent-strong)"
                strokeWidth={2.5}
              />

              <circle
                cx={toX(xv)}
                cy={toY(yv)}
                r={4}
                fill="none"
                stroke="teal"
                strokeWidth={1.5}
              />
              <text
                x={toX(xv) + 8}
                y={toY(yv) - 8}
                fontSize={10}
                fill="currentColor"
                opacity={0.8}
              >
                V=({xvL},{yvL})
              </text>

              {rootCase === 'two' && x1 !== null && x2 !== null ? (
                <>
                  <circle cx={toX(x1)} cy={toY(0)} r={6} fill="orange" stroke="currentColor" strokeWidth={1} />
                  <text x={toX(x1)} y={toY(0) - 12} textAnchor="middle" fontSize={11} fontWeight={600} fill="currentColor">
                    x₁
                  </text>
                  <circle cx={toX(x2)} cy={toY(0)} r={6} fill="orange" stroke="currentColor" strokeWidth={1} />
                  <text x={toX(x2)} y={toY(0) - 12} textAnchor="middle" fontSize={11} fontWeight={600} fill="currentColor">
                    x₂
                  </text>
                </>
              ) : null}
              {rootCase === 'one' && r !== null ? (
                <g>
                  <circle cx={toX(r)} cy={toY(0)} r={6} fill="orange" stroke="currentColor" strokeWidth={1} />
                  <text x={toX(r)} y={toY(0) - 12} textAnchor="middle" fontSize={11} fontWeight={600} fill="currentColor">
                    raíz doble
                  </text>
                </g>
              ) : null}
              {rootCase === 'none' ? (
                <text x={W / 2} y={margin.t + 12} textAnchor="middle" fontSize={12} fontWeight={600} fill="currentColor">
                  sin raíces reales · f no cambia de signo
                </text>
              ) : null}
            </svg>
          </div>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">
            Franjas sobre el eje x: teal ≈ f&gt;0, naranja ≈ f&lt;0 (según a). La solución no es esa
            franja del plano: mira la recta numérica.
          </p>
        </section>

        <section className="rounded-xl border-2 border-[var(--accent-strong)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Solución en la recta real
          </p>
          <svg viewBox="0 0 480 72" className="mt-2 h-auto w-full" role="img">
            {/* Shade solution */}
            {sol.kind === 'all' ? (
              <rect x={28} y={28} width={424} height={16} fill="var(--accent-soft)" />
            ) : null}
            {sol.kind === 'interval' ? (
              <rect
                x={mapLine(sol.lo)}
                y={28}
                width={Math.max(2, mapLine(sol.hi) - mapLine(sol.lo))}
                height={16}
                fill="var(--accent-soft)"
              />
            ) : null}
            {sol.kind === 'union' ? (
              <>
                <rect
                  x={28}
                  y={28}
                  width={Math.max(2, mapLine(sol.x1) - 28)}
                  height={16}
                  fill="var(--accent-soft)"
                />
                <rect
                  x={mapLine(sol.x2)}
                  y={28}
                  width={Math.max(2, 452 - mapLine(sol.x2))}
                  height={16}
                  fill="var(--accent-soft)"
                />
              </>
            ) : null}
            {sol.kind === 'punctured' ? (
              <>
                <rect x={28} y={28} width={Math.max(2, mapLine(sol.r) - 28)} height={16} fill="var(--accent-soft)" />
                <rect
                  x={mapLine(sol.r)}
                  y={28}
                  width={Math.max(2, 452 - mapLine(sol.r))}
                  height={16}
                  fill="var(--accent-soft)"
                />
              </>
            ) : null}

            <line x1={28} y1={36} x2={452} y2={36} stroke="currentColor" strokeWidth={2} opacity={0.5} />

            {/* Endpoints */}
            {sol.kind === 'interval' ? (
              <>
                <circle
                  cx={mapLine(sol.lo)}
                  cy={36}
                  r={6}
                  fill={sol.leftClosed ? 'orange' : 'var(--formula-bg)'}
                  stroke="orange"
                  strokeWidth={2}
                />
                <circle
                  cx={mapLine(sol.hi)}
                  cy={36}
                  r={6}
                  fill={sol.rightClosed ? 'orange' : 'var(--formula-bg)'}
                  stroke="orange"
                  strokeWidth={2}
                />
              </>
            ) : null}
            {sol.kind === 'union' ? (
              <>
                <circle
                  cx={mapLine(sol.x1)}
                  cy={36}
                  r={6}
                  fill={sol.leftClosed ? 'orange' : 'var(--formula-bg)'}
                  stroke="orange"
                  strokeWidth={2}
                />
                <circle
                  cx={mapLine(sol.x2)}
                  cy={36}
                  r={6}
                  fill={sol.rightClosed ? 'orange' : 'var(--formula-bg)'}
                  stroke="orange"
                  strokeWidth={2}
                />
              </>
            ) : null}
            {sol.kind === 'point' ? (
              <circle cx={mapLine(sol.r)} cy={36} r={7} fill="orange" stroke="currentColor" strokeWidth={1} />
            ) : null}
            {sol.kind === 'punctured' ? (
              <circle
                cx={mapLine(sol.r)}
                cy={36}
                r={6}
                fill="var(--formula-bg)"
                stroke="orange"
                strokeWidth={2}
              />
            ) : null}

            <text x={mapLine(0)} y={58} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.7}>
              0
            </text>
            {x1 !== null ? (
              <text x={mapLine(x1)} y={16} textAnchor="middle" fontSize={11} fontWeight={600} fill="currentColor">
                x₁
              </text>
            ) : null}
            {x2 !== null ? (
              <text x={mapLine(x2)} y={16} textAnchor="middle" fontSize={11} fontWeight={600} fill="currentColor">
                x₂
              </text>
            ) : null}
            {r !== null && rootCase === 'one' ? (
              <text x={mapLine(r)} y={16} textAnchor="middle" fontSize={11} fontWeight={600} fill="currentColor">
                r
              </text>
            ) : null}

            {sol.kind === 'empty' ? (
              <text x={240} y={20} textAnchor="middle" fontSize={12} fontWeight={600} fill="currentColor">
                ∅ · nada sombreado
              </text>
            ) : null}
            {sol.kind === 'all' ? (
              <text x={240} y={20} textAnchor="middle" fontSize={12} fontWeight={600} fill="currentColor">
                ℝ · toda la recta
              </text>
            ) : null}
          </svg>
          <p className="mt-2 font-mono text-sm">
            {expr}
            {op}0 ⇒ {solIneq}
            <br />
            Solución: {solInterval}
          </p>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">
            Círculo cerrado = extremo incluido; abierto = excluido (desigualdad estricta).
          </p>
        </section>

        <div
          id={statusId}
          className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_70%,var(--bg-elevated))] px-3 py-2 text-sm leading-relaxed"
          aria-live="polite"
        >
          <p className="font-mono">
            f(x)={expr}
            <br />
            f(x){op}0 ⇒ x∈{solInterval}
          </p>
        </div>

        <p className="sr-only">{ariaStatus}</p>

        <ControlsStack>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
              Desigualdad
            </p>
            <ButtonRow>
              {(['<', '≤', '>', '≥'] as const).map((o) => (
                <VizButton key={o} active={op === o} onClick={() => setOp(o)}>
                  f(x){o}0
                </VizButton>
              ))}
            </ButtonRow>
          </div>
          <SliderRow
            label="a"
            ariaLabel={`Coeficiente a, actualmente ${aL}`}
            value={a}
            min={-3}
            max={3}
            step={0.1}
            onChange={(val) => setA(snapA(val))}
          />
          <SliderRow
            label="b"
            ariaLabel={`Coeficiente b, actualmente ${bL}`}
            value={b}
            min={-4}
            max={4}
            step={0.05}
            onChange={(val) => setB(snap(val, -4, 4, 0.05))}
          />
          <SliderRow
            label="c"
            ariaLabel={`Coeficiente c, actualmente ${cL}`}
            value={c}
            min={-5}
            max={5}
            step={0.1}
            onChange={(val) => setC(snap(val, -5, 5, 0.1))}
          />
          <p className="text-xs text-[var(--fg-muted)]">|a|≥{A_MIN} (a≠0).</p>
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
