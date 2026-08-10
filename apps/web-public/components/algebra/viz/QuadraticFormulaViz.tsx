'use client';

import { useId, useMemo, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel, fmt } from './controls';

const ZERO_EPS = 1e-9;
const DISC_EPS = 1e-10;

function snap(val: number, min: number, max: number, step: number): number {
  const clamped = Math.min(max, Math.max(min, val));
  const steps = Math.round((clamped - min) / step);
  const snapped = min + steps * step;
  if (Math.abs(snapped) < step / 2) return 0;
  return Number(snapped.toFixed(2));
}

/** Snap a away from zero — quadratic requires a ≠ 0. */
function snapA(val: number, min: number, max: number, step: number): number {
  let v = snap(val, min, max, step);
  if (Math.abs(v) < ZERO_EPS) {
    v = val >= 0 ? step : -step;
    if (v < min) v = step;
    if (v > max) v = -step;
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

type RootCase = 'two' | 'one' | 'none' | 'not_quadratic';

/**
 * Solve ax²+bx+c=0 via the quadratic formula and the graph of y=ax²+bx+c (ALG-EQU-003).
 * Real roots are the x-coordinates where the parabola meets the x-axis (y=0).
 */
export function QuadraticFormulaViz() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(-1);
  const [c, setC] = useState(-2);
  const guideId = useId();
  const statusId = useId();

  const aZero = isZero(a);

  // Internal precision — display uses present() only
  const delta = b * b - 4 * a * c;
  const xv = aZero ? null : -b / (2 * a);
  const yv = xv !== null ? a * xv * xv + b * xv + c : null;

  let rootCase: RootCase = 'not_quadratic';
  let x1: number | null = null;
  let x2: number | null = null;
  let x0: number | null = null;

  if (!aZero) {
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
  }

  const aL = present(a);
  const bL = present(b);
  const cL = present(c);
  const dL = present(delta, 4);
  const x1L = x1 !== null ? present(x1) : null;
  const x2L = x2 !== null ? present(x2) : null;
  const x0L = x0 !== null ? present(x0) : null;
  const xvL = xv !== null ? present(xv) : null;
  const yvL = yv !== null ? present(yv) : null;
  const expr = formatQuadExpr(a, b, c);
  const sqrtDL = delta >= 0 ? present(Math.sqrt(Math.max(0, delta))) : null;

  const view = useMemo(() => {
    let xMin = -5;
    let xMax = 5;
    let yMin = -5;
    let yMax = 5;

    if (aZero) {
      return { xMin, xMax, yMin, yMax };
    }

    const focusX: number[] = [0];
    if (xv !== null) focusX.push(xv);
    if (x1 !== null) focusX.push(x1);
    if (x2 !== null) focusX.push(x2);
    if (x0 !== null) focusX.push(x0);

    const xLo = Math.min(...focusX);
    const xHi = Math.max(...focusX);
    const xPad = Math.max(2.2, (xHi - xLo) * 0.45 + 1.2);
    xMin = Math.min(-3, xLo - xPad);
    xMax = Math.max(3, xHi + xPad);

    // Sample parabola over the window + vertex + y=0
    const samples: number[] = [0];
    if (yv !== null) samples.push(yv);
    const n = 24;
    for (let i = 0; i <= n; i++) {
      const x = xMin + ((xMax - xMin) * i) / n;
      samples.push(a * x * x + b * x + c);
    }
    const yLo = Math.min(...samples);
    const yHi = Math.max(...samples);
    const yPad = Math.max(1.5, (yHi - yLo) * 0.22);
    yMin = Math.min(-2.5, yLo - yPad);
    yMax = Math.max(2.5, yHi + yPad);

    // Avoid huge empty viewports
    if (xMax - xMin > 36) {
      const mid = xv ?? (xLo + xHi) / 2;
      xMin = mid - 18;
      xMax = mid + 18;
    }
    if (yMax - yMin > 40) {
      const mid = yv ?? (yMin + yMax) / 2;
      yMin = mid - 20;
      yMax = mid + 20;
      // Keep x-axis in view when roots exist
      if (rootCase !== 'none') {
        yMin = Math.min(yMin, -1.5);
        yMax = Math.max(yMax, 1.5);
      }
    }

    return { xMin, xMax, yMin, yMax };
  }, [a, b, c, aZero, xv, yv, x1, x2, x0, rootCase]);

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
    if (aZero) return '';
    const pts: string[] = [];
    const n = 120;
    for (let i = 0; i <= n; i++) {
      const x = view.xMin + ((view.xMax - view.xMin) * i) / n;
      const y = a * x * x + b * x + c;
      pts.push(`${i === 0 ? 'M' : 'L'}${toX(x)},${toY(y)}`);
    }
    return pts.join(' ');
  }, [a, b, c, aZero, view]);

  const xTicks = useMemo(() => {
    const span = view.xMax - view.xMin;
    const step = span > 24 ? 5 : span > 12 ? 2 : 1;
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

  const deltaInterpretation = (() => {
    if (aZero) return 'Con a=0 la ecuación deja de ser cuadrática; no aplica la fórmula.';
    if (rootCase === 'two')
      return `Δ=${dL}>0 ⇒ hay dos soluciones reales distintas.`;
    if (rootCase === 'one')
      return `Δ=${dL}=0 ⇒ hay una solución real doble (la parábola toca el eje x).`;
    return `Δ=${dL}<0 ⇒ no hay soluciones reales (la parábola no corta el eje x).`;
  })();

  const vertexVsRootsNote = (() => {
    if (aZero || yv === null) return null;
    if (a > 0) {
      if (yv < -DISC_EPS)
        return 'a>0 (abre hacia arriba) y el vértice está bajo el eje x ⇒ suele haber dos raíces reales.';
      if (Math.abs(yv) <= DISC_EPS)
        return 'a>0 y el vértice está sobre el eje x ⇒ raíz real doble.';
      return 'a>0 y el vértice está por encima del eje x ⇒ sin raíces reales.';
    }
    if (yv > DISC_EPS)
      return 'a<0 (abre hacia abajo) y el vértice está sobre el eje x ⇒ suele haber dos raíces reales.';
    if (Math.abs(yv) <= DISC_EPS)
      return 'a<0 y el vértice está sobre el eje x ⇒ raíz real doble.';
    return 'a<0 y el vértice está bajo el eje x ⇒ sin raíces reales.';
  })();

  const ariaStatus = useMemo(() => {
    if (aZero) return 'a es cero: la ecuación ya no es cuadrática.';
    if (rootCase === 'two')
      return `Ecuación ${expr}=0. Función y=${expr}. Discriminante ${dL} positivo. Raíces x1=${x1L}, x2=${x2L}, puntos (${x1L},0) y (${x2L},0).`;
    if (rootCase === 'one')
      return `Ecuación ${expr}=0. Discriminante cero. Raíz doble x=${x0L}, punto (${x0L},0).`;
    return `Ecuación ${expr}=0. Discriminante ${dL} negativo. No hay raíces reales; la parábola no corta el eje x.`;
  }, [aZero, rootCase, expr, dL, x1L, x2L, x0L]);

  // Label placement: offset second root label if close
  const labelOffset = (which: 'left' | 'right') => {
    if (rootCase !== 'two' || x1 === null || x2 === null) return 0;
    const gap = Math.abs(toX(x2) - toX(x1));
    if (gap > 70) return 0;
    return which === 'left' ? -10 : 10;
  };

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Para visualizar la ecuación cuadrática, dibujamos la función y=ax²+bx+c. Las soluciones
            reales de la ecuación son los valores de x donde la función vale cero, es decir, donde la
            parábola corta el eje x.
          </p>
          <p className="mt-1 font-mono text-sm text-[var(--fg-muted)]">
            Fórmula: x=(−b±√(b²−4ac))/(2a) · a≠0
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Ecuación ↔ función
          </p>
          <p className="mt-2 font-mono text-base">
            ecuación: <span className="font-semibold">{expr}=0</span>
          </p>
          <p className="mt-1 font-mono text-base">
            función asociada: <span className="font-semibold">y={expr}</span>
          </p>
          <p className="mt-2 text-sm text-[var(--fg-muted)]">
            ecuación → función asociada → buscar y=0 → intersecciones con el eje x → raíces reales
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Discriminante
          </p>
          <p className="mt-2 font-mono text-base">
            Δ=b²−4ac=({bL})²−4({aL})({cL})={dL}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--fg)]">{deltaInterpretation}</p>
          {rootCase === 'none' ? (
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Opcional (complejos): x=(−b±i√|Δ|)/(2a). No son intersecciones con el eje x.
            </p>
          ) : null}
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Gráfica de y=ax²+bx+c
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

              {/* Axes */}
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
                eje y (x=0)
              </text>
              {inX(0) && inY(0) ? (
                <text
                  x={toX(0) + 8}
                  y={toY(0) + 14}
                  fontSize={10}
                  fill="currentColor"
                  opacity={0.6}
                >
                  (0,0)
                </text>
              ) : null}

              {/* Axis of symmetry */}
              {!aZero && xv !== null && inX(xv) ? (
                <g>
                  <line
                    x1={toX(xv)}
                    y1={toY(view.yMin)}
                    x2={toX(xv)}
                    y2={toY(view.yMax)}
                    stroke="teal"
                    strokeWidth={1.5}
                    strokeDasharray="5 4"
                    opacity={0.55}
                  />
                  <text
                    x={toX(xv) + 6}
                    y={toY(view.yMax) + 26}
                    fontSize={10}
                    fill="teal"
                    opacity={0.9}
                  >
                    x_v={xvL}
                  </text>
                </g>
              ) : null}

              {/* Parabola */}
              {parabolaPath ? (
                <path
                  d={parabolaPath}
                  fill="none"
                  stroke="var(--accent-strong)"
                  strokeWidth={2.5}
                />
              ) : null}

              {/* Vertex */}
              {!aZero && xv !== null && yv !== null && inX(xv) && inY(yv) ? (
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
                    x={toX(xv) + (xv >= 0 ? 10 : -10)}
                    y={toY(yv) - 10}
                    textAnchor={xv >= 0 ? 'start' : 'end'}
                    fontSize={11}
                    fill="currentColor"
                    opacity={0.9}
                  >
                    V=({xvL},{yvL})
                  </text>
                </g>
              ) : null}

              {/* Roots Δ>0 */}
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
                        x={toX(x1) + labelOffset('left')}
                        y={toY(0) - 26}
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight={600}
                        fill="currentColor"
                      >
                        x₁={x1L}
                      </text>
                      <text
                        x={toX(x1) + labelOffset('left')}
                        y={toY(0) + 28}
                        textAnchor="middle"
                        fontSize={11}
                        fill="currentColor"
                      >
                        ({x1L}, 0)
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
                        x={toX(x2) + labelOffset('right')}
                        y={toY(0) - 26}
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight={600}
                        fill="currentColor"
                      >
                        x₂={x2L}
                      </text>
                      <text
                        x={toX(x2) + labelOffset('right')}
                        y={toY(0) + 28}
                        textAnchor="middle"
                        fontSize={11}
                        fill="currentColor"
                      >
                        ({x2L}, 0)
                      </text>
                    </g>
                  ) : null}
                </>
              ) : null}

              {/* Double root */}
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
                    y={toY(0) - 26}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={600}
                    fill="currentColor"
                  >
                    raíz doble
                  </text>
                  <text
                    x={toX(x0)}
                    y={toY(0) + 28}
                    textAnchor="middle"
                    fontSize={11}
                    fill="currentColor"
                  >
                    x₁=x₂={x0L} · ({x0L}, 0)
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
                  Δ&lt;0 ⇒ sin intersecciones reales con el eje x
                </text>
              ) : null}

              {aZero ? (
                <text
                  x={W / 2}
                  y={H / 2}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={600}
                  fill="currentColor"
                >
                  Con a=0 la ecuación deja de ser cuadrática
                </text>
              ) : null}
            </svg>
          </div>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Los puntos naranjas están sobre el eje x: coordenadas (x, 0), o sea y=0. El vértice V y
            el eje de simetría x_v=−b/(2a) ayudan a relacionar la forma con el número de raíces.
          </p>
          {vertexVsRootsNote ? (
            <p className="mt-1 text-xs text-[var(--fg-muted)]">{vertexVsRootsNote}</p>
          ) : null}
        </section>

        <section className="space-y-2 rounded-xl border border-[var(--border)] px-3 py-3 text-sm leading-relaxed">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Desarrollo algebraico
          </p>
          {aZero ? (
            <>
              <p className="font-mono">{expr}=0</p>
              <p className="font-semibold">Con a=0 la ecuación deja de ser cuadrática.</p>
              <p className="text-[var(--fg-muted)]">
                No se aplica x=(−b±√(b²−4ac))/(2a). Quedaría una ecuación lineal (o degenerada).
              </p>
            </>
          ) : null}
          {!aZero ? (
            <>
              <p className="font-mono">{expr}=0</p>
              <p className="font-mono">
                Δ=b²−4ac=({bL})²−4({aL})({cL})={dL}
              </p>
              {rootCase === 'two' && x1 !== null && x2 !== null ? (
                <>
                  <p className="font-mono">
                    x=(−b±√Δ)/(2a)=(−({bL})±√({dL}))/(2·{aL})
                  </p>
                  <p className="font-mono">
                    x=(−({bL})±{sqrtDL})/({present(2 * a)})
                  </p>
                  <p className="font-mono">
                    x₁={x1L}, x₂={x2L}
                  </p>
                  <p className="text-[var(--fg-muted)]">
                    Intersecciones con el eje x: ({x1L}, 0) y ({x2L}, 0). Ahí y=0.
                  </p>
                </>
              ) : null}
              {rootCase === 'one' && x0 !== null ? (
                <>
                  <p className="font-mono">
                    Δ=0 ⇒ x=−b/(2a)=−({bL})/(2·{aL})={x0L}
                  </p>
                  <p className="font-mono">x₁=x₂={x0L} (raíz doble)</p>
                  <p className="text-[var(--fg-muted)]">
                    La parábola toca el eje x en un único punto: ({x0L}, 0).
                  </p>
                </>
              ) : null}
              {rootCase === 'none' ? (
                <>
                  <p className="font-semibold">No hay raíces reales.</p>
                  <p className="text-[var(--fg-muted)]">
                    Como Δ&lt;0, {expr}=0 no tiene soluciones reales. La fórmula con √Δ no produce
                    valores reales; la parábola no corta el eje x.
                  </p>
                  <p className="font-mono text-[var(--fg-muted)]">
                    (complejos) x=(−b±i√|Δ|)/(2a)=(−({bL})±i√({present(Math.abs(delta))}))/(
                    {present(2 * a)})
                  </p>
                </>
              ) : null}
            </>
          ) : null}
        </section>

        <div
          id={statusId}
          className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_70%,var(--bg-elevated))] px-3 py-2 text-sm leading-relaxed"
          aria-live="polite"
        >
          {aZero ? (
            <p className="font-mono">Con a=0 la ecuación deja de ser cuadrática.</p>
          ) : null}
          {rootCase === 'two' && x1L && x2L ? (
            <p className="font-mono">
              Δ={dL}&gt;0
              <br />
              x₁={x1L}, x₂={x2L}
              <span className="text-[var(--fg-muted)]">
                {' '}
                · cortes con el eje x: ({x1L},0), ({x2L},0)
              </span>
            </p>
          ) : null}
          {rootCase === 'one' && x0L ? (
            <p className="font-mono">
              Δ={dL}=0
              <br />
              x₁=x₂={x0L}
              <span className="text-[var(--fg-muted)]"> · toca el eje x en ({x0L},0)</span>
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

        <ControlsStack>
          <SliderRow
            label="a"
            ariaLabel={`Coeficiente a (a≠0), actualmente ${aL}`}
            value={a}
            min={-3}
            max={3}
            step={0.1}
            onChange={(val) => setA(snapA(val, -3, 3, 0.1))}
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
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
