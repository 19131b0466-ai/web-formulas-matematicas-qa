'use client';

import { useId, useMemo, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  SliderRow,
  VizButton,
  VizPanel,
  fmt,
} from './controls';

const ZERO_EPS = 1e-9;
const DISC_EPS = 1e-10;
/** Option A: keep |a| ≥ ε so roots stay teachable. */
const A_MIN = 0.1;

const PRESETS = [
  { id: 'two', label: 'Δ>0 · dos raíces', a: 1, b: -1, c: -2 },
  { id: 'one', label: 'Δ=0 · raíz doble', a: 1, b: 2, c: 1 },
  { id: 'none', label: 'Δ<0 · sin raíces', a: 1, b: 1, c: 1 },
] as const;

function snap(val: number, min: number, max: number, step: number): number {
  const clamped = Math.min(max, Math.max(min, val));
  const steps = Math.round((clamped - min) / step);
  const snapped = min + steps * step;
  if (Math.abs(snapped) < step / 2) return 0;
  return Number(snapped.toFixed(2));
}

function snapA(val: number): number {
  let v = snap(val, -3, 3, 0.1);
  if (Math.abs(v) < A_MIN) {
    v = val >= 0 ? A_MIN : -A_MIN;
  }
  return Number(v.toFixed(2));
}

function present(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '—';
  return fmt(Number(n.toFixed(digits)), digits);
}

function isZero(n: number): boolean {
  return Math.abs(n) < ZERO_EPS;
}

function formatQuadExpr(a: number, b: number, c: number): string {
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

type RootCase = 'two' | 'one' | 'none';

/**
 * Teach Δ = b²−4ac as the classifier of real roots (ALG-EQU-004).
 * Graph of y=ax²+bx+c is support: number of x-axis cuts matches the case of Δ.
 */
export function DiscriminantViz() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(-1);
  const [c, setC] = useState(-2);
  const guideId = useId();
  const statusId = useId();

  const delta = b * b - 4 * a * c;
  const xv = -b / (2 * a);
  const yv = a * xv * xv + b * xv + c;

  let rootCase: RootCase = 'none';
  let x1: number | null = null;
  let x2: number | null = null;
  let x0: number | null = null;

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
    x0 = -b / (2 * a);
  }

  const aL = present(a);
  const bL = present(b);
  const cL = present(c);
  const dL = present(delta, 4);
  const x1L = x1 !== null ? present(x1) : null;
  const x2L = x2 !== null ? present(x2) : null;
  const x0L = x0 !== null ? present(x0) : null;
  const xvL = present(xv);
  const yvL = present(yv);
  const expr = formatQuadExpr(a, b, c);

  const caseLabel =
    rootCase === 'two'
      ? 'dos raíces reales distintas'
      : rootCase === 'one'
        ? 'una raíz real doble'
        : 'no hay raíces reales';

  const caseShort =
    rootCase === 'two'
      ? 'Δ > 0 → 2 raíces reales distintas'
      : rootCase === 'one'
        ? 'Δ = 0 → 1 raíz real doble'
        : 'Δ < 0 → no hay raíces reales';

  const activePreset =
    PRESETS.find((p) => p.a === a && p.b === b && p.c === c)?.id ?? null;

  const view = useMemo(() => {
    const focusX: number[] = [0, xv];
    if (x1 !== null) focusX.push(x1);
    if (x2 !== null) focusX.push(x2);
    if (x0 !== null) focusX.push(x0);

    const xLo = Math.min(...focusX);
    const xHi = Math.max(...focusX);
    const span = Math.max(xHi - xLo, 2);
    // Prefer fitting both roots; allow wide windows when needed
    const xPad = Math.max(1.5, span * 0.18 + 1);
    let xMin = xLo - xPad;
    let xMax = xHi + xPad;
    // Keep a little air if everything is one-sided
    if (xMin > -1) xMin = Math.min(xMin, -1);
    if (xMax < 1) xMax = Math.max(xMax, 1);

    const samples: number[] = [0, yv];
    const n = 28;
    for (let i = 0; i <= n; i++) {
      const x = xMin + ((xMax - xMin) * i) / n;
      samples.push(a * x * x + b * x + c);
    }
    const yLo = Math.min(...samples);
    const yHi = Math.max(...samples);
    const yPad = Math.max(1.2, (yHi - yLo) * 0.22);
    let yMin = Math.min(-2, yLo - yPad);
    let yMax = Math.max(2, yHi + yPad);
    // Always keep the x-axis in view for cut-counting
    yMin = Math.min(yMin, -1);
    yMax = Math.max(yMax, 1);

    return { xMin, xMax, yMin, yMax };
  }, [a, b, c, xv, yv, x1, x2, x0]);

  const W = 480;
  const H = 300;
  const margin = { l: 40, r: 22, t: 28, b: 34 };
  const plotW = W - margin.l - margin.r;
  const plotH = H - margin.t - margin.b;

  const toX = (x: number) =>
    margin.l + ((x - view.xMin) / (view.xMax - view.xMin)) * plotW;
  const toY = (y: number) =>
    margin.t + ((view.yMax - y) / (view.yMax - view.yMin)) * plotH;

  const parabolaPath = useMemo(() => {
    const pts: string[] = [];
    const n = 140;
    for (let i = 0; i <= n; i++) {
      const x = view.xMin + ((view.xMax - view.xMin) * i) / n;
      const y = a * x * x + b * x + c;
      pts.push(`${i === 0 ? 'M' : 'L'}${toX(x)},${toY(y)}`);
    }
    return pts.join(' ');
  }, [a, b, c, view]);

  const xTicks = useMemo(() => {
    const span = view.xMax - view.xMin;
    const step = span > 40 ? 10 : span > 20 ? 5 : span > 10 ? 2 : 1;
    const ticks: number[] = [];
    const start = Math.ceil(view.xMin / step) * step;
    for (let t = start; t <= view.xMax + 1e-9; t += step) {
      if (Math.abs(t) > ZERO_EPS) ticks.push(Number(t.toFixed(4)));
    }
    return ticks;
  }, [view]);

  const yTicks = useMemo(() => {
    const span = view.yMax - view.yMin;
    const step = span > 24 ? 5 : span > 12 ? 2 : 1;
    const ticks: number[] = [];
    const start = Math.ceil(view.yMin / step) * step;
    for (let t = start; t <= view.yMax + 1e-9; t += step) {
      if (Math.abs(t) > ZERO_EPS) ticks.push(Number(t.toFixed(4)));
    }
    return ticks;
  }, [view]);

  const inX = (x: number) => x >= view.xMin - 1e-6 && x <= view.xMax + 1e-6;
  const inY = (y: number) => y >= view.yMin - 1e-6 && y <= view.yMax + 1e-6;

  // Number-line domain always includes both roots when they exist
  const lineDomain = useMemo(() => {
    const pts: number[] = [0, xv];
    if (x1 !== null) pts.push(x1);
    if (x2 !== null) pts.push(x2);
    if (x0 !== null) pts.push(x0);
    const lo = Math.min(...pts);
    const hi = Math.max(...pts);
    const pad = Math.max(1.5, (hi - lo) * 0.15 + 1);
    return { lo: lo - pad, hi: hi + pad };
  }, [xv, x1, x2, x0]);

  const rootSpanWide =
    rootCase === 'two' && x1 !== null && x2 !== null && x2 - x1 > 12;

  const missingOnGraph =
    rootCase === 'two' &&
    x1 !== null &&
    x2 !== null &&
    (!inX(x1) || !inX(x2));

  const ariaStatus = useMemo(() => {
    if (rootCase === 'two')
      return `Discriminante ${dL} mayor que cero: ${caseLabel}. Raíces x1=${x1L}, x2=${x2L}.`;
    if (rootCase === 'one')
      return `Discriminante cero: ${caseLabel}. Raíz doble x=${x0L}.`;
    return `Discriminante ${dL} menor que cero: ${caseLabel}.`;
  }, [rootCase, dL, caseLabel, x1L, x2L, x0L]);

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            El discriminante Δ=b²−4ac no calcula las raíces por sí solo: su signo clasifica cuántas
            raíces reales tiene ax²+bx+c=0. La parábola y=ax²+bx+c solo apoya esa clasificación
            (número de cortes con el eje x).
          </p>
        </div>

        {/* Always-visible classification legend */}
        <section
          className="rounded-xl border-2 border-[var(--accent-strong)] px-3 py-3"
          aria-label="Clasificación por discriminante"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Clasificación (siempre)
          </p>
          <ul className="mt-2 space-y-1.5 text-sm">
            <li
              className={
                rootCase === 'two'
                  ? 'font-semibold text-[var(--fg)]'
                  : 'text-[var(--fg-muted)]'
              }
            >
              {rootCase === 'two' ? '→ ' : ''}Δ &gt; 0 → 2 raíces reales distintas
            </li>
            <li
              className={
                rootCase === 'one'
                  ? 'font-semibold text-[var(--fg)]'
                  : 'text-[var(--fg-muted)]'
              }
            >
              {rootCase === 'one' ? '→ ' : ''}Δ = 0 → 1 raíz real doble
            </li>
            <li
              className={
                rootCase === 'none'
                  ? 'font-semibold text-[var(--fg)]'
                  : 'text-[var(--fg-muted)]'
              }
            >
              {rootCase === 'none' ? '→ ' : ''}Δ &lt; 0 → no hay raíces reales
            </li>
          </ul>
          <p className="mt-3 rounded-lg bg-[color-mix(in_oklab,var(--accent-soft)_55%,transparent)] px-3 py-2 font-mono text-sm font-semibold">
            Caso actual: {caseShort}
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Cálculo de Δ
          </p>
          <p className="mt-2 font-mono text-sm text-[var(--fg-muted)]">Δ=b²−4ac</p>
          <p className="mt-1 font-mono text-base">
            Δ=({bL})²−4({aL})({cL})
          </p>
          <p className="mt-1 font-mono text-base font-semibold">Δ={dL}</p>
          <p className="mt-2 text-sm leading-relaxed">
            {rootCase === 'two'
              ? `Δ=${dL}>0 ⇒ dos raíces reales distintas.`
              : rootCase === 'one'
                ? `Δ=${dL}=0 ⇒ una raíz real doble.`
                : `Δ=${dL}<0 ⇒ no hay raíces reales.`}
          </p>
          <p className="mt-2 font-mono text-sm text-[var(--fg-muted)]">
            ecuación: {expr}=0 · función de apoyo: y={expr}
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Raíces reales (si existen)
          </p>
          {rootCase === 'two' && x1L && x2L ? (
            <div className="mt-2 space-y-1 text-sm">
              <p className="font-mono">
                x=(−b±√Δ)/(2a) → x₁={x1L}, x₂={x2L}
              </p>
              <p className="text-[var(--fg-muted)]">
                Dos valores distintos: existen dos raíces, aunque una esté lejos en la gráfica.
              </p>
            </div>
          ) : null}
          {rootCase === 'one' && x0L ? (
            <div className="mt-2 space-y-1 text-sm">
              <p className="font-mono">x₁=x₂=−b/(2a)={x0L} (raíz doble)</p>
              <p className="text-[var(--fg-muted)]">
                La parábola toca el eje x en un único punto ({x0L}, 0).
              </p>
            </div>
          ) : null}
          {rootCase === 'none' ? (
            <p className="mt-2 text-sm font-semibold">No hay raíces reales que listar.</p>
          ) : null}
        </section>

        {/* Secondary number line — backup so two roots are never “one visible dot” */}
        {rootCase !== 'none' ? (
          <section className="rounded-xl border border-[var(--border)] px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
              Recta numérica de raíces
            </p>
            <svg viewBox="0 0 480 56" className="mt-2 h-auto w-full" role="img">
              <line
                x1={24}
                y1={28}
                x2={456}
                y2={28}
                stroke="currentColor"
                strokeWidth={2}
                opacity={0.55}
              />
              {(() => {
                const map = (x: number) =>
                  24 + ((x - lineDomain.lo) / (lineDomain.hi - lineDomain.lo)) * 432;
                const marks: { x: number; label: string; fill: string }[] = [];
                if (rootCase === 'two' && x1 !== null && x2 !== null) {
                  marks.push({ x: x1, label: `x₁=${x1L}`, fill: 'orange' });
                  marks.push({ x: x2, label: `x₂=${x2L}`, fill: 'orange' });
                }
                if (rootCase === 'one' && x0 !== null) {
                  marks.push({ x: x0, label: `x=${x0L}`, fill: 'orange' });
                }
                marks.push({ x: 0, label: '0', fill: 'currentColor' });
                return marks.map((m) => (
                  <g key={`${m.label}-${m.x}`}>
                    <circle cx={map(m.x)} cy={28} r={m.label === '0' ? 4 : 6} fill={m.fill} />
                    <text
                      x={map(m.x)}
                      y={m.label === '0' ? 46 : 14}
                      textAnchor="middle"
                      fontSize={11}
                      fontWeight={m.label === '0' ? 400 : 600}
                      fill="currentColor"
                    >
                      {m.label}
                    </text>
                  </g>
                ));
              })()}
            </svg>
            {rootSpanWide ? (
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                Las raíces están muy separadas: esta recta garantiza ver ambas aunque el zoom de la
                parábola sea amplio.
              </p>
            ) : null}
          </section>
        ) : null}

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Gráfica de apoyo · y=ax²+bx+c
          </p>
          <div className="mt-2 overflow-x-auto">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="mx-auto h-auto w-full max-w-xl"
              role="img"
              aria-labelledby={statusId}
            >
              {xTicks.map((t) => (
                <g key={`xt-${t}`}>
                  <line
                    x1={toX(t)}
                    y1={toY(view.yMin)}
                    x2={toX(t)}
                    y2={toY(view.yMax)}
                    stroke="currentColor"
                    opacity={0.06}
                  />
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
              {yTicks.map((t) => (
                <g key={`yt-${t}`}>
                  <line
                    x1={toX(view.xMin)}
                    y1={toY(t)}
                    x2={toX(view.xMax)}
                    y2={toY(t)}
                    stroke="currentColor"
                    opacity={0.06}
                  />
                  <line
                    x1={toX(0) - 4}
                    y1={toY(t)}
                    x2={toX(0) + 4}
                    y2={toY(t)}
                    stroke="currentColor"
                    opacity={0.35}
                  />
                  <text
                    x={toX(0) - 10}
                    y={toY(t) + 3}
                    textAnchor="end"
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
                strokeWidth={2.25}
                opacity={0.7}
              />
              <line
                x1={toX(0)}
                y1={toY(view.yMin)}
                x2={toX(0)}
                y2={toY(view.yMax)}
                stroke="currentColor"
                strokeWidth={1.5}
                opacity={0.45}
              />
              <text
                x={toX(view.xMax) - 4}
                y={toY(0) - 8}
                textAnchor="end"
                fontSize={12}
                fontWeight={600}
                fill="currentColor"
              >
                eje x (y=0)
              </text>
              <text
                x={toX(0) + 10}
                y={toY(view.yMax) + 12}
                fontSize={12}
                fontWeight={600}
                fill="currentColor"
              >
                eje y
              </text>

              <path
                d={parabolaPath}
                fill="none"
                stroke="var(--accent-strong)"
                strokeWidth={2.5}
              />

              {inX(xv) && inY(yv) ? (
                <g>
                  <circle
                    cx={toX(xv)}
                    cy={toY(yv)}
                    r={5}
                    fill="none"
                    stroke="teal"
                    strokeWidth={2}
                  />
                  <text
                    x={toX(xv) + 8}
                    y={toY(yv) - 8}
                    fontSize={11}
                    fill="currentColor"
                    opacity={0.85}
                  >
                    V=({xvL},{yvL})
                  </text>
                </g>
              ) : null}

              {rootCase === 'two' && x1 !== null && x2 !== null ? (
                <>
                  {inX(x1) ? (
                    <g>
                      <circle
                        cx={toX(x1)}
                        cy={toY(0)}
                        r={7}
                        fill="orange"
                        stroke="currentColor"
                        strokeWidth={1}
                      />
                      <text
                        x={toX(x1)}
                        y={toY(0) - 14}
                        textAnchor="middle"
                        fontSize={11}
                        fontWeight={600}
                        fill="currentColor"
                      >
                        x₁
                      </text>
                    </g>
                  ) : null}
                  {inX(x2) ? (
                    <g>
                      <circle
                        cx={toX(x2)}
                        cy={toY(0)}
                        r={7}
                        fill="orange"
                        stroke="currentColor"
                        strokeWidth={1}
                      />
                      <text
                        x={toX(x2)}
                        y={toY(0) - 14}
                        textAnchor="middle"
                        fontSize={11}
                        fontWeight={600}
                        fill="currentColor"
                      >
                        x₂
                      </text>
                    </g>
                  ) : null}
                </>
              ) : null}

              {rootCase === 'one' && x0 !== null && inX(x0) ? (
                <g>
                  <circle
                    cx={toX(x0)}
                    cy={toY(0)}
                    r={7}
                    fill="orange"
                    stroke="currentColor"
                    strokeWidth={1}
                  />
                  <text
                    x={toX(x0)}
                    y={toY(0) - 14}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={600}
                    fill="currentColor"
                  >
                    raíz doble
                  </text>
                </g>
              ) : null}

              {rootCase === 'none' ? (
                <text
                  x={W / 2}
                  y={margin.t + 14}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={600}
                  fill="currentColor"
                >
                  sin intersecciones reales con el eje x
                </text>
              ) : null}

              {missingOnGraph ? (
                <text
                  x={W / 2}
                  y={margin.t + 14}
                  textAnchor="middle"
                  fontSize={12}
                  fill="currentColor"
                >
                  hay 2 raíces: ver lista y recta numérica arriba
                </text>
              ) : null}
            </svg>
          </div>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Apoyo visual: el número de cortes con el eje x coincide con el caso de Δ. La fuente de la
            clasificación es Δ, no el color de los puntos.
          </p>
        </section>

        <div
          id={statusId}
          className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_70%,var(--bg-elevated))] px-3 py-2 text-sm leading-relaxed"
          aria-live="polite"
        >
          {rootCase === 'two' && x1L && x2L ? (
            <p className="font-mono">
              Δ={dL}&gt;0
              <br />
              Hay dos raíces reales distintas
              <br />
              x₁={x1L}, x₂={x2L}
            </p>
          ) : null}
          {rootCase === 'one' && x0L ? (
            <p className="font-mono">
              Δ={dL}=0
              <br />
              Hay una raíz real doble
              <br />
              x₁=x₂={x0L}
            </p>
          ) : null}
          {rootCase === 'none' ? (
            <p className="font-mono">
              Δ={dL}&lt;0
              <br />
              No hay raíces reales.
            </p>
          ) : null}
        </div>

        <p className="sr-only">{ariaStatus}</p>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Ejemplos guiados
          </p>
          <ButtonRow>
            {PRESETS.map((p) => (
              <VizButton
                key={p.id}
                active={activePreset === p.id}
                onClick={() => {
                  setA(p.a);
                  setB(p.b);
                  setC(p.c);
                }}
              >
                {p.label}
              </VizButton>
            ))}
          </ButtonRow>
        </div>

        <ControlsStack>
          <SliderRow
            label="a"
            ariaLabel={`Coeficiente a (|a|≥${A_MIN}), actualmente ${aL}`}
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
          <p className="text-xs text-[var(--fg-muted)]">
            |a|≥{A_MIN} (a≠0). Así se evita el caso degenerado y se limita el alejamiento extremo de
            las raíces.
          </p>
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
