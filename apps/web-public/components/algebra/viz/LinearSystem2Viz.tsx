'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from './controls';

const ZERO_EPS = 1e-9;

type SysKind = 'unique' | 'none' | 'infinite';

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

/** General form from y=mx+b → −m x + y = b */
function formatGeneral(m: number, b: number): string {
  const bL = present(b);
  if (isZero(m)) return `y=${bL}`;
  const coef = -m;
  const coefL = present(coef);
  const ax = Math.abs(coef) === 1 ? (coef < 0 ? '−x' : 'x') : `${coefL}x`;
  return `${ax}+y=${bL}`;
}

/**
 * 2×2 linear system as intersection of two lines y=mᵢx+bᵢ (ALG-SIS-001).
 */
export function LinearSystem2Viz() {
  const [m1, setM1] = useState(1);
  const [b1, setB1] = useState(1);
  const [m2, setM2] = useState(-0.5);
  const [b2, setB2] = useState(2);
  const guideId = useId();
  const statusId = useId();

  const sameSlope = Math.abs(m1 - m2) < ZERO_EPS;
  const sameIntercept = Math.abs(b1 - b2) < ZERO_EPS;

  let kind: SysKind = 'unique';
  let ix: number | null = null;
  let iy: number | null = null;

  if (!sameSlope) {
    kind = 'unique';
    ix = (b2 - b1) / (m1 - m2);
    iy = m1 * ix + b1;
  } else if (sameIntercept) {
    kind = 'infinite';
  } else {
    kind = 'none';
  }

  const m1L = present(m1);
  const b1L = present(b1);
  const m2L = present(m2);
  const b2L = present(b2);
  const eq1 = formatLine(m1, b1);
  const eq2 = formatLine(m2, b2);
  const ixL = ix !== null ? present(ix) : null;
  const iyL = iy !== null ? present(iy) : null;

  const view = useMemo(() => {
    let xMin = -5;
    let xMax = 5;
    let yMin = -5;
    let yMax = 5;
    if (kind === 'unique' && ix !== null && iy !== null) {
      const pad = Math.max(2.5, Math.max(Math.abs(ix), Math.abs(iy)) * 0.35 + 1.5);
      xMin = Math.min(-4, ix - pad);
      xMax = Math.max(4, ix + pad);
      yMin = Math.min(-4, iy - pad);
      yMax = Math.max(4, iy + pad);
    }
    // Sample both lines
    const samples: number[] = [b1, b2, 0];
    for (const x of [xMin, xMax, 0]) {
      samples.push(m1 * x + b1, m2 * x + b2);
    }
    if (kind === 'unique' && iy !== null) samples.push(iy);
    const yLo = Math.min(...samples);
    const yHi = Math.max(...samples);
    const yPad = Math.max(1.5, (yHi - yLo) * 0.25);
    yMin = Math.min(yMin, yLo - yPad);
    yMax = Math.max(yMax, yHi + yPad);
    return { xMin, xMax, yMin, yMax };
  }, [m1, b1, m2, b2, kind, ix, iy]);

  const W = 480;
  const H = 300;
  const margin = { l: 40, r: 20, t: 24, b: 30 };
  const plotW = W - margin.l - margin.r;
  const plotH = H - margin.t - margin.b;
  const toX = (x: number) =>
    margin.l + ((x - view.xMin) / (view.xMax - view.xMin)) * plotW;
  const toY = (y: number) =>
    margin.t + ((view.yMax - y) / (view.yMax - view.yMin)) * plotH;

  const linePath = (m: number, b: number) => {
    const x0 = view.xMin;
    const x1 = view.xMax;
    return `M${toX(x0)},${toY(m * x0 + b)} L${toX(x1)},${toY(m * x1 + b)}`;
  };

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

  const caseTitle =
    kind === 'unique'
      ? 'Una solución única'
      : kind === 'none'
        ? 'Sin solución'
        : 'Infinitas soluciones';

  const theory =
    kind === 'unique'
      ? 'm₁≠m₂ ⇒ una solución'
      : kind === 'none'
        ? 'm₁=m₂ y b₁≠b₂ ⇒ sin solución'
        : 'm₁=m₂ y b₁=b₂ ⇒ infinitas soluciones';

  const ariaStatus =
    kind === 'unique'
      ? `Sistema con solución única en el punto ${ixL}, ${iyL}. Las rectas se cruzan.`
      : kind === 'none'
        ? 'Las rectas son paralelas. El sistema no tiene solución.'
        : 'Las rectas coinciden. El sistema tiene infinitas soluciones.';

  const solInView =
    kind === 'unique' &&
    ix !== null &&
    iy !== null &&
    ix >= view.xMin - 1e-6 &&
    ix <= view.xMax + 1e-6 &&
    iy >= view.yMin - 1e-6 &&
    iy <= view.yMax + 1e-6;

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Cada ecuación define una recta. Resolver el sistema es encontrar el punto común a ambas
            rectas.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Si las rectas se cruzan, ese punto es la solución. Si son paralelas, no existe un punto
            común. Si coinciden, todos sus puntos son solución.
          </p>
        </div>

        <section className="rounded-xl border-2 border-[var(--accent-strong)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Clasificación
          </p>
          <ul className="mt-2 space-y-1.5 text-sm">
            <li className={kind === 'unique' ? 'font-semibold text-[var(--fg)]' : 'text-[var(--fg-muted)]'}>
              {kind === 'unique' ? '→ ' : ''}m₁≠m₂ ⇒ una solución (secantes)
            </li>
            <li className={kind === 'none' ? 'font-semibold text-[var(--fg)]' : 'text-[var(--fg-muted)]'}>
              {kind === 'none' ? '→ ' : ''}m₁=m₂, b₁≠b₂ ⇒ sin solución (paralelas)
            </li>
            <li
              className={kind === 'infinite' ? 'font-semibold text-[var(--fg)]' : 'text-[var(--fg-muted)]'}
            >
              {kind === 'infinite' ? '→ ' : ''}m₁=m₂, b₁=b₂ ⇒ infinitas soluciones (coincidentes)
            </li>
          </ul>
          <p className="mt-3 rounded-lg bg-[color-mix(in_oklab,var(--accent-soft)_55%,transparent)] px-3 py-2 text-sm font-semibold">
            Caso actual: {caseTitle} · {theory}
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Sistema
          </p>
          <p className="mt-2 font-mono text-base">
            <span style={{ color: 'var(--accent-strong)' }}>① {eq1}</span>
          </p>
          <p className="mt-1 font-mono text-base">
            <span style={{ color: 'teal' }}>② {eq2}</span>
          </p>
          <p className="mt-2 text-sm text-[var(--fg-muted)]">
            Forma general (equivalente): {formatGeneral(m1, b1)} · {formatGeneral(m2, b2)}
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Plano · intersección de rectas
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
                strokeWidth={1.5}
                opacity={0.45}
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

              <path
                d={linePath(m1, b1)}
                fill="none"
                stroke="var(--accent-strong)"
                strokeWidth={2.75}
              />
              <path d={linePath(m2, b2)} fill="none" stroke="teal" strokeWidth={2.75} />

              {kind === 'unique' && ix !== null && iy !== null && solInView ? (
                <g>
                  <circle
                    cx={toX(ix)}
                    cy={toY(iy)}
                    r={7}
                    fill="orange"
                    stroke="currentColor"
                    strokeWidth={1}
                  />
                  <text
                    x={toX(ix) + 10}
                    y={toY(iy) - 10}
                    fontSize={12}
                    fontWeight={600}
                    fill="currentColor"
                  >
                    solución ({ixL},{iyL})
                  </text>
                </g>
              ) : null}

              {kind === 'none' ? (
                <text
                  x={W / 2}
                  y={margin.t + 14}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={600}
                  fill="currentColor"
                >
                  Las rectas son paralelas · el sistema no tiene solución
                </text>
              ) : null}
              {kind === 'infinite' ? (
                <text
                  x={W / 2}
                  y={margin.t + 14}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={600}
                  fill="currentColor"
                >
                  Las rectas coinciden · infinitas soluciones
                </text>
              ) : null}
            </svg>
          </div>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            <span style={{ color: 'var(--accent-strong)' }}>Recta ①</span> ·{' '}
            <span style={{ color: 'teal' }}>Recta ②</span>
            {kind === 'unique' ? ' · naranja = punto común' : ''}
          </p>
        </section>

        <div
          id={statusId}
          className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_70%,var(--bg-elevated))] px-3 py-2 text-sm leading-relaxed"
          aria-live="polite"
        >
          {kind === 'unique' && ixL && iyL ? (
            <p className="font-mono">
              {eq1} · {eq2}
              <br />
              Solución única: ({ixL}, {iyL})
            </p>
          ) : null}
          {kind === 'none' ? (
            <p className="font-mono">
              Las rectas son paralelas.
              <br />
              El sistema no tiene solución.
            </p>
          ) : null}
          {kind === 'infinite' ? (
            <p className="font-mono">
              Las rectas coinciden.
              <br />
              El sistema tiene infinitas soluciones (todos los puntos de la recta).
            </p>
          ) : null}
        </div>

        <p className="sr-only">{ariaStatus}</p>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Ejemplos guiados
          </p>
          <ButtonRow>
            <VizButton
              active={kind === 'unique'}
              onClick={() => {
                setM1(1);
                setB1(1);
                setM2(-0.5);
                setB2(2);
              }}
            >
              Secantes
            </VizButton>
            <VizButton
              active={kind === 'none'}
              onClick={() => {
                setM1(1);
                setB1(1);
                setM2(1);
                setB2(-1);
              }}
            >
              Paralelas
            </VizButton>
            <VizButton
              active={kind === 'infinite'}
              onClick={() => {
                setM1(0.8);
                setB1(-1);
                setM2(0.8);
                setB2(-1);
              }}
            >
              Coincidentes
            </VizButton>
          </ButtonRow>
        </div>

        <ControlsStack>
          <p className="text-xs font-semibold" style={{ color: 'var(--accent-strong)' }}>
            Recta ① · {eq1}
          </p>
          <SliderRow
            label="m₁"
            ariaLabel={`Pendiente m1, actualmente ${m1L}`}
            value={m1}
            min={-3}
            max={3}
            step={0.1}
            onChange={(val) => setM1(snap(val, -3, 3, 0.1))}
          />
          <SliderRow
            label="b₁"
            ariaLabel={`Intercepto b1, actualmente ${b1L}`}
            value={b1}
            min={-4}
            max={4}
            step={0.1}
            onChange={(val) => setB1(snap(val, -4, 4, 0.1))}
          />
          <p className="pt-1 text-xs font-semibold" style={{ color: 'teal' }}>
            Recta ② · {eq2}
          </p>
          <SliderRow
            label="m₂"
            ariaLabel={`Pendiente m2, actualmente ${m2L}`}
            value={m2}
            min={-3}
            max={3}
            step={0.1}
            onChange={(val) => setM2(snap(val, -3, 3, 0.1))}
          />
          <SliderRow
            label="b₂"
            ariaLabel={`Intercepto b2, actualmente ${b2L}`}
            value={b2}
            min={-4}
            max={4}
            step={0.1}
            onChange={(val) => setB2(snap(val, -4, 4, 0.1))}
          />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
