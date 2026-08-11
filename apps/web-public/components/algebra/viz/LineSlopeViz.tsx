'use client';

import { useId, useMemo, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel, fmt } from './controls';

const ZERO_EPS = 1e-9;
const W = 420;
const H = 240;
const VIEW = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };
const MARGIN = { l: 34, r: 16, t: 20, b: 26 };

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

function formatLine(m: number, b: number): string {
  const mL = present(m);
  const bL = present(b);
  const mx = isZero(m) ? '' : Math.abs(m) === 1 ? (m < 0 ? '−x' : 'x') : `${mL}x`;
  if (isZero(m) && isZero(b)) return 'y=0';
  if (isZero(m)) return `y=${bL}`;
  if (isZero(b)) return `y=${mx}`;
  return b > 0 ? `y=${mx}+${bL}` : `y=${mx}−${present(Math.abs(b))}`;
}

/**
 * Slope-intercept form y=mx+b with slope triangle (ALG-FUN-005).
 */
export function LineSlopeViz() {
  const [m, setM] = useState(1.2);
  const [b, setB] = useState(-1);
  const guideId = useId();
  const statusId = useId();

  const mL = present(m);
  const bL = present(b);
  const eq = formatLine(m, b);
  const mZero = isZero(m);
  const xInt = !mZero ? -b / m : null;
  const xIntL = xInt !== null ? present(xInt) : null;

  const qY = m + b;
  const qYL = present(qY);

  const slopeLabel = m > ZERO_EPS
    ? 'Pendiente positiva · recta creciente.'
    : m < -ZERO_EPS
      ? 'Pendiente negativa · recta decreciente.'
      : 'Pendiente cero · recta horizontal.';

  const plotW = W - MARGIN.l - MARGIN.r;
  const plotH = H - MARGIN.t - MARGIN.b;
  const toX = (x: number) =>
    MARGIN.l + ((x - VIEW.xMin) / (VIEW.xMax - VIEW.xMin)) * plotW;
  const toY = (y: number) =>
    MARGIN.t + ((VIEW.yMax - y) / (VIEW.yMax - VIEW.yMin)) * plotH;

  const linePath = useMemo(() => {
    const x0 = VIEW.xMin;
    const x1 = VIEW.xMax;
    return `M${toX(x0)},${toY(m * x0 + b)} L${toX(x1)},${toY(m * x1 + b)}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fixed view box
  }, [m, b]);

  const xTicks = useMemo(() => {
    const ticks: number[] = [];
    for (let t = Math.ceil(VIEW.xMin); t <= VIEW.xMax; t += 1) {
      if (!isZero(t)) ticks.push(t);
    }
    return ticks;
  }, []);

  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    for (let t = Math.ceil(VIEW.yMin); t <= VIEW.yMax; t += 1) {
      if (!isZero(t)) ticks.push(t);
    }
    return ticks;
  }, []);

  const pInView = b >= VIEW.yMin && b <= VIEW.yMax;
  const qInView = qY >= VIEW.yMin && qY <= VIEW.yMax && 1 >= VIEW.xMin && 1 <= VIEW.xMax;
  const showTriangle = !mZero && pInView && qInView;
  const xIntInView =
    xInt !== null && xInt >= VIEW.xMin && xInt <= VIEW.xMax;

  const ariaStatus = `Recta ${eq}. Pendiente m=${mL}, intercepto en y b=${bL}. Punto principal P=(0,${bL}). ${slopeLabel}.`;

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            En y=mx+b, m controla la inclinación de la recta y b fija el corte con el eje y en el
            punto (0,b).
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            La pendiente m es el cambio vertical Δy dividido por el cambio horizontal Δx entre dos
            puntos de la recta. Al mover m, el punto (0,b) permanece fijo; al mover b, la recta se
            desplaza verticalmente.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Ecuación en tiempo real
          </p>
          <p className="mt-2 font-mono text-lg font-semibold text-[var(--accent-strong)]">{eq}</p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            m=Δy/Δx · b=corte con el eje y · {slopeLabel}
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Gráfica · pendiente e intercepto
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
                    y1={toY(VIEW.yMin)}
                    x2={toX(t)}
                    y2={toY(VIEW.yMax)}
                    stroke="currentColor"
                    opacity={0.06}
                  />
                  <text
                    x={toX(t)}
                    y={toY(0) + 14}
                    textAnchor="middle"
                    fontSize={9}
                    fill="currentColor"
                    opacity={0.5}
                  >
                    {present(t, 0)}
                  </text>
                </g>
              ))}
              {yTicks.map((t) => (
                <g key={`yt-${t}`}>
                  <line
                    x1={toX(VIEW.xMin)}
                    y1={toY(t)}
                    x2={toX(VIEW.xMax)}
                    y2={toY(t)}
                    stroke="currentColor"
                    opacity={0.06}
                  />
                  <text
                    x={toX(0) - 8}
                    y={toY(t) + 3}
                    textAnchor="end"
                    fontSize={9}
                    fill="currentColor"
                    opacity={0.5}
                  >
                    {present(t, 0)}
                  </text>
                </g>
              ))}

              <line
                x1={toX(VIEW.xMin)}
                y1={toY(0)}
                x2={toX(VIEW.xMax)}
                y2={toY(0)}
                stroke="currentColor"
                strokeWidth={1.5}
                opacity={0.45}
              />
              <line
                x1={toX(0)}
                y1={toY(VIEW.yMin)}
                x2={toX(0)}
                y2={toY(VIEW.yMax)}
                stroke="currentColor"
                strokeWidth={1.5}
                opacity={0.45}
              />

              <path
                d={linePath}
                fill="none"
                stroke="var(--accent-strong)"
                strokeWidth={2.5}
              />

              {showTriangle ? (
                <g>
                  <line
                    x1={toX(0)}
                    y1={toY(b)}
                    x2={toX(1)}
                    y2={toY(b)}
                    stroke="currentColor"
                    strokeWidth={1.25}
                    strokeDasharray="4 3"
                    opacity={0.65}
                  />
                  <line
                    x1={toX(1)}
                    y1={toY(b)}
                    x2={toX(1)}
                    y2={toY(qY)}
                    stroke="currentColor"
                    strokeWidth={1.25}
                    strokeDasharray="4 3"
                    opacity={0.65}
                  />
                  <text
                    x={(toX(0) + toX(1)) / 2}
                    y={toY(b) + (m > 0 ? 14 : -6)}
                    textAnchor="middle"
                    fontSize={10}
                    fill="currentColor"
                    opacity={0.8}
                  >
                    Δx=1
                  </text>
                  <text
                    x={toX(1) + 8}
                    y={(toY(b) + toY(qY)) / 2 + 3}
                    fontSize={10}
                    fill="currentColor"
                    opacity={0.8}
                  >
                    Δy={mL}
                  </text>
                  <text
                    x={toX(1) + 18}
                    y={toY(qY) - 6}
                    fontSize={10}
                    fontWeight={600}
                    fill="var(--accent-strong)"
                  >
                    m=Δy/Δx
                  </text>
                  <circle
                    cx={toX(1)}
                    cy={toY(qY)}
                    r={4}
                    fill="var(--accent-strong)"
                    opacity={0.85}
                  />
                  <text
                    x={toX(1) + 8}
                    y={toY(qY) + 14}
                    fontSize={9}
                    fill="currentColor"
                    opacity={0.75}
                  >
                    Q=(1,{qYL})
                  </text>
                </g>
              ) : null}

              {pInView ? (
                <g>
                  <circle
                    cx={toX(0)}
                    cy={toY(b)}
                    r={7}
                    fill="var(--accent-strong)"
                    stroke="currentColor"
                    strokeWidth={1}
                  />
                  <text
                    x={toX(0) + 10}
                    y={toY(b) - 10}
                    fontSize={11}
                    fontWeight={600}
                    fill="currentColor"
                  >
                    P=(0,{bL})
                  </text>
                  <text
                    x={toX(0) + 10}
                    y={toY(b) + 4}
                    fontSize={10}
                    fill="var(--fg-muted)"
                  >
                    b=corte con el eje y
                  </text>
                </g>
              ) : null}

              {!mZero && xIntInView && xIntL ? (
                <g>
                  <circle
                    cx={toX(xInt!)}
                    cy={toY(0)}
                    r={5}
                    fill="none"
                    stroke="teal"
                    strokeWidth={2}
                  />
                  <text
                    x={toX(xInt!)}
                    y={toY(0) + 22}
                    textAnchor="middle"
                    fontSize={9}
                    fill="currentColor"
                    opacity={0.7}
                  >
                    corte en x: ({xIntL},0)
                  </text>
                </g>
              ) : null}
            </svg>
          </div>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            El punto principal es P=(0,b). El triángulo de pendiente usa Q=(1,m+b): al avanzar una
            unidad en x, y cambia en m. El corte con el eje x es secundario.
          </p>
        </section>

        <div
          id={statusId}
          className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_70%,var(--bg-elevated))] px-3 py-2 text-sm leading-relaxed"
          aria-live="polite"
        >
          <p className="font-mono">
            {eq} · m={mL} · b={bL} · P=(0,{bL})
            {!mZero && xIntL ? (
              <span className="text-[var(--fg-muted)]"> · corte en x≈({xIntL},0)</span>
            ) : null}
          </p>
        </div>

        <p className="sr-only">{ariaStatus}</p>

        <ControlsStack>
          <SliderRow
            label="m"
            ariaLabel={`Pendiente m, actualmente ${mL}`}
            value={m}
            min={-3}
            max={3}
            step={0.1}
            onChange={(val) => setM(snap(val, -3, 3, 0.1))}
          />
          <SliderRow
            label="b"
            ariaLabel={`Intercepto b, actualmente ${bL}`}
            value={b}
            min={-4}
            max={4}
            step={0.1}
            onChange={(val) => setB(snap(val, -4, 4, 0.1))}
          />
          <p className="text-xs text-[var(--fg-muted)]">
            Mueve m: la recta gira alrededor de (0,b). Mueve b: la recta sube o baja sin cambiar la
            inclinación.
          </p>
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
