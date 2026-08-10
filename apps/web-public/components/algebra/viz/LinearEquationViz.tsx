'use client';

import { useId, useMemo, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel, fmt } from './controls';

const ZERO_EPS = 1e-9;

function snap(val: number, min: number, max: number, step: number): number {
  const clamped = Math.min(max, Math.max(min, val));
  const steps = Math.round((clamped - min) / step);
  const snapped = min + steps * step;
  if (Math.abs(snapped) < step / 2) return 0;
  return Number(snapped.toFixed(2));
}

function present(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '—';
  return fmt(Number(n.toFixed(digits)), digits);
}

function isZero(n: number): boolean {
  return Math.abs(n) < ZERO_EPS;
}

function formatLinearExpr(a: number, b: number): string {
  const aL = present(a);
  const bL = present(b);
  if (isZero(a) && isZero(b)) return '0';
  if (isZero(a)) return bL;
  const ax = Math.abs(a) === 1 ? (a < 0 ? '−x' : 'x') : `${aL}x`;
  if (isZero(b)) return ax;
  return b > 0 ? `${ax}+${bL}` : `${ax}−${present(Math.abs(b))}`;
}

/**
 * Solve ax+b=0 via the graph of y=ax+b (ALG-EQU-001).
 * Solution is the x-coordinate where the line crosses the x-axis.
 */
export function LinearEquationViz() {
  const [a, setA] = useState(1.2);
  const [b, setB] = useState(-1);
  const guideId = useId();
  const statusId = useId();

  const aZero = isZero(a);
  const bZero = isZero(b);

  type SolKind = 'unique' | 'none' | 'all';
  const kind: SolKind = !aZero ? 'unique' : bZero ? 'all' : 'none';
  // Exact internal solution — never inferred from pixel position
  const xs = kind === 'unique' ? -b / a : null;

  const aL = present(a);
  const bL = present(b);
  const xsL = xs !== null ? present(xs, 2) : null;
  const expr = formatLinearExpr(a, b);

  // Adaptive view window so the solution stays visible when reasonable
  const view = useMemo(() => {
    let xMin = -5;
    let xMax = 5;
    let yMin = -5;
    let yMax = 5;

    if (kind === 'unique' && xs !== null) {
      const pad = Math.max(2, Math.abs(xs) * 0.35);
      xMin = Math.min(-4, xs - pad);
      xMax = Math.max(4, xs + pad);
    }
    if (kind === 'none' || kind === 'all') {
      xMin = -5;
      xMax = 5;
    }

    const ySamples = [b, a * xMin + b, a * xMax + b];
    if (kind === 'unique') ySamples.push(0);
    const yLo = Math.min(...ySamples);
    const yHi = Math.max(...ySamples);
    const yPad = Math.max(1.5, (yHi - yLo) * 0.25);
    yMin = Math.min(-3, yLo - yPad);
    yMax = Math.max(3, yHi + yPad);

    // Cap extreme zooms
    if (xMax - xMin > 40) {
      const mid = ((xs ?? 0) + 0) / 2;
      xMin = mid - 20;
      xMax = mid + 20;
    }
    if (yMax - yMin > 40) {
      const mid = (yMin + yMax) / 2;
      yMin = mid - 20;
      yMax = mid + 20;
    }

    return { xMin, xMax, yMin, yMax };
  }, [a, b, kind, xs]);

  const W = 480;
  const H = 280;
  const margin = { l: 36, r: 20, t: 24, b: 28 };
  const plotW = W - margin.l - margin.r;
  const plotH = H - margin.t - margin.b;

  const toX = (x: number) =>
    margin.l + ((x - view.xMin) / (view.xMax - view.xMin)) * plotW;
  const toY = (y: number) =>
    margin.t + ((view.yMax - y) / (view.yMax - view.yMin)) * plotH;

  const linePath = useMemo(() => {
    const x0 = view.xMin;
    const x1 = view.xMax;
    const y0 = a * x0 + b;
    const y1 = a * x1 + b;
    return `M${toX(x0)},${toY(y0)} L${toX(x1)},${toY(y1)}`;
  }, [a, b, view]);

  // Tick marks
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

  const yTicks = useMemo(() => {
    const span = view.yMax - view.yMin;
    const step = span > 20 ? 5 : span > 10 ? 2 : 1;
    const ticks: number[] = [];
    const start = Math.ceil(view.yMin / step) * step;
    for (let t = start; t <= view.yMax + 1e-9; t += step) {
      if (Math.abs(t) > ZERO_EPS) ticks.push(Number(t.toFixed(4)));
    }
    return ticks;
  }, [view]);

  const solInView =
    xs !== null && xs >= view.xMin - 1e-6 && xs <= view.xMax + 1e-6;
  const yIntInView = b >= view.yMin - 1e-6 && b <= view.yMax + 1e-6;

  const ariaStatus = useMemo(() => {
    if (kind === 'none') {
      return `La función es y=${expr}. Es una recta horizontal que no cruza el eje x. La ecuación ${expr}=0 no tiene solución.`;
    }
    if (kind === 'all') {
      return `La función es y=0, que coincide con el eje x. La ecuación 0=0 tiene infinitas soluciones: cualquier x la satisface.`;
    }
    return `La función es y=${expr}. Cruza el eje x aproximadamente en x=${xsL}. Por tanto, ${xsL} es la solución de ${expr}=0.`;
  }, [kind, expr, xsL]);

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Resolver ax+b=0 significa encontrar el valor de x que hace cero la expresión. Para verlo
            gráficamente, dibujamos y=ax+b.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Cuando la recta cruza el eje x, y=0. Por eso la coordenada x de ese punto es la solución.
            No confundas la ecuación ax+b=0 con la función asociada y=ax+b.
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
            <span className="ml-2 text-sm font-normal text-[var(--fg-muted)]">
              (a = pendiente)
            </span>
          </p>
          <p className="mt-2 text-sm text-[var(--fg-muted)]">
            ecuación → función asociada → buscar y=0 → intersección con el eje x → solución
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Gráfica de y=ax+b
          </p>
          <div className="mt-2 overflow-x-auto">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="mx-auto h-auto w-full max-w-xl"
              role="img"
              aria-labelledby={statusId}
            >
              {/* Grid ticks */}
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

              {/* Axes — emphasize y=0 (eje x) as the solution line */}
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
              <text
                x={toX(0) + 8}
                y={toY(0) + 14}
                fontSize={10}
                fill="currentColor"
                opacity={0.6}
              >
                (0,0)
              </text>

              {/* Line */}
              <path
                d={linePath}
                fill="none"
                stroke="var(--accent-strong)"
                strokeWidth={2.5}
              />

              {/* y-intercept (secondary) */}
              {yIntInView ? (
                <g>
                  <circle
                    cx={toX(0)}
                    cy={toY(b)}
                    r={5}
                    fill="none"
                    stroke="teal"
                    strokeWidth={2}
                  />
                  <text
                    x={toX(0) + 10}
                    y={toY(b) - 8}
                    fontSize={11}
                    fill="currentColor"
                    opacity={0.85}
                  >
                    intercepto en y: (0,{bL})
                  </text>
                </g>
              ) : null}

              {/* Solution on x-axis: explicitly y=0 */}
              {kind === 'unique' && xs !== null && solInView ? (
                <g>
                  {/* Drop guide from nowhere — just mark that this is ON y=0 */}
                  <line
                    x1={toX(xs)}
                    y1={toY(0) - 22}
                    x2={toX(xs)}
                    y2={toY(0) + 10}
                    stroke="orange"
                    strokeWidth={1}
                    strokeDasharray="3 2"
                    opacity={0.7}
                  />
                  <circle
                    cx={toX(xs)}
                    cy={toY(0)}
                    r={7}
                    fill="orange"
                    stroke="currentColor"
                    strokeWidth={1}
                  />
                  <text
                    x={toX(xs)}
                    y={toY(0) - 28}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={600}
                    fill="currentColor"
                  >
                    solución (y=0)
                  </text>
                  <text
                    x={toX(xs)}
                    y={toY(0) + 28}
                    textAnchor="middle"
                    fontSize={11}
                    fill="currentColor"
                  >
                    punto ({xsL}, 0) · x≈{xsL}
                  </text>
                </g>
              ) : null}

              {kind === 'unique' && xs !== null && !solInView ? (
                <text
                  x={W / 2}
                  y={margin.t + 12}
                  textAnchor="middle"
                  fontSize={12}
                  fill="currentColor"
                >
                  raíz x≈{xsL} fuera de esta ventana
                </text>
              ) : null}

              {kind === 'none' ? (
                <text
                  x={W / 2}
                  y={toY(b) - 16}
                  textAnchor="middle"
                  fontSize={12}
                  fill="currentColor"
                >
                  y={bL} (horizontal, no cruza el eje x)
                </text>
              ) : null}

              {kind === 'all' ? (
                <text
                  x={W / 2}
                  y={toY(1.5)}
                  textAnchor="middle"
                  fontSize={12}
                  fill="currentColor"
                >
                  y=0 coincide con el eje x
                </text>
              ) : null}
            </svg>
          </div>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            El punto naranja está sobre el eje x: su coordenada es (x, 0), o sea y=0. El círculo
            abierto en el eje y es solo el intercepto (0,b); no es la solución.
          </p>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">
            {a > ZERO_EPS
              ? 'a>0: recta creciente.'
              : a < -ZERO_EPS
                ? 'a<0: recta decreciente.'
                : 'a=0: recta horizontal.'}{' '}
            b desplaza el intercepto (0,b).
          </p>
        </section>

        <section className="space-y-2 rounded-xl border border-[var(--border)] px-3 py-3 text-sm leading-relaxed">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Desarrollo algebraico
          </p>
          {kind === 'unique' && xs !== null ? (
            <>
              <p className="font-mono">{expr}=0</p>
              <p className="font-mono">
                ax=−b → {aL}x={present(-b)}
                <span className="text-[var(--fg-muted)]">
                  {' '}
                  (−b es un número en el despeje, no un cruce en y={present(-b)})
                </span>
              </p>
              <p className="font-mono">
                x=−b/a=−({bL})/({aL})≈{xsL}
              </p>
              <p className="text-[var(--fg-muted)]">
                La solución es el punto ({xsL}, <strong className="text-[var(--fg)]">0</strong>)
                sobre el eje x. Ahí la función vale y=0.
              </p>
            </>
          ) : null}
          {kind === 'none' ? (
            <>
              <p className="font-mono">{expr}=0 → {bL}=0</p>
              <p className="font-semibold text-[var(--fg)]">Sin solución.</p>
              <p className="text-[var(--fg-muted)]">
                No se calcula −b/0. La recta y={bL} nunca cruza el eje x.
              </p>
            </>
          ) : null}
          {kind === 'all' ? (
            <>
              <p className="font-mono">0=0</p>
              <p className="font-semibold text-[var(--fg)]">
                Infinitas soluciones: cualquier x satisface la ecuación.
              </p>
              <p className="text-[var(--fg-muted)]">No hay un único punto solución.</p>
            </>
          ) : null}
        </section>

        <div
          id={statusId}
          className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_70%,var(--bg-elevated))] px-3 py-2 text-sm leading-relaxed"
          aria-live="polite"
        >
          {kind === 'unique' && xs !== null ? (
            <p className="font-mono">
              Solución: x=−b/a=−({bL})/({aL})≈{xsL}
              <span className="text-[var(--fg-muted)]"> · intersección con x: ({xsL},0)</span>
            </p>
          ) : null}
          {kind === 'none' ? <p className="font-mono">Solución: sin solución</p> : null}
          {kind === 'all' ? (
            <p className="font-mono">Solución: infinitas (cualquier x)</p>
          ) : null}
        </div>

        <p className="sr-only">{ariaStatus}</p>

        <ControlsStack>
          <SliderRow
            label="a"
            ariaLabel={`Coeficiente a (pendiente), actualmente ${aL}`}
            value={a}
            min={-3}
            max={3}
            step={0.1}
            onChange={(val) => setA(snap(val, -3, 3, 0.1))}
          />
          <SliderRow
            label="b"
            ariaLabel={`Término b (intercepto en y), actualmente ${bL}`}
            value={b}
            min={-3}
            max={3}
            step={0.05}
            onChange={(val) => setB(snap(val, -3, 3, 0.05))}
          />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
