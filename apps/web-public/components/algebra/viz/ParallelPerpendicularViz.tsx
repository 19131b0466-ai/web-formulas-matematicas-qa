'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from './controls';

const ZERO_EPS = 1e-9;
const W = 420;
const H = 240;
const VIEW = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };
const MARGIN = { l: 34, r: 16, t: 20, b: 26 };

type RelationKind = 'secant' | 'parallel' | 'coincident' | 'perpendicular';

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

function angleBetweenLines(m1: number, m2: number): number {
  if (Math.abs(m1 * m2 + 1) < 0.02) return 90;
  if (Math.abs(m1 - m2) < 0.02) return 0;
  const tanTheta = Math.abs((m2 - m1) / (1 + m1 * m2));
  return (Math.atan(tanTheta) * 180) / Math.PI;
}

/**
 * Parallelism and perpendicularity via slopes (ALG-FUN-006).
 */
export function ParallelPerpendicularViz() {
  const [m1, setM1] = useState(1);
  const [b1, setB1] = useState(1);
  const [m2, setM2] = useState(-0.5);
  const [b2, setB2] = useState(2);
  const guideId = useId();
  const statusId = useId();

  const sameSlope = Math.abs(m1 - m2) < ZERO_EPS;
  const sameIntercept = Math.abs(b1 - b2) < ZERO_EPS;
  const productNearMinusOne = Math.abs(m1 * m2 + 1) < 0.02;

  let kind: RelationKind = 'secant';
  let ix: number | null = null;
  let iy: number | null = null;

  if (sameSlope) {
    kind = sameIntercept ? 'coincident' : 'parallel';
  } else if (productNearMinusOne) {
    kind = 'perpendicular';
    ix = (b2 - b1) / (m1 - m2);
    iy = m1 * ix + b1;
  } else {
    kind = 'secant';
    ix = (b2 - b1) / (m1 - m2);
    iy = m1 * ix + b1;
  }

  const m1L = present(m1);
  const b1L = present(b1);
  const m2L = present(m2);
  const b2L = present(b2);
  const eq1 = formatLine(m1, b1);
  const eq2 = formatLine(m2, b2);
  const ixL = ix !== null ? present(ix) : null;
  const iyL = iy !== null ? present(iy) : null;
  const theta = angleBetweenLines(m1, m2);
  const thetaL = present(theta, 1);

  const slopeCheck =
    sameSlope
      ? `m₁=m₂ (${m1L}=${m2L})`
      : productNearMinusOne
        ? `m₁·m₂≈−1 (${m1L}·${m2L}≈${present(m1 * m2)})`
        : `m₁≠m₂ y m₁·m₂≠−1`;

  const caseTitle =
    kind === 'parallel'
      ? 'Paralelas distintas'
      : kind === 'coincident'
        ? 'Coincidentes'
        : kind === 'perpendicular'
          ? 'Perpendiculares'
          : 'Secantes';

  const plotW = W - MARGIN.l - MARGIN.r;
  const plotH = H - MARGIN.t - MARGIN.b;
  const toX = (x: number) =>
    MARGIN.l + ((x - VIEW.xMin) / (VIEW.xMax - VIEW.xMin)) * plotW;
  const toY = (y: number) =>
    MARGIN.t + ((VIEW.yMax - y) / (VIEW.yMax - VIEW.yMin)) * plotH;

  const linePath = (m: number, b: number) => {
    const x0 = VIEW.xMin;
    const x1 = VIEW.xMax;
    return `M${toX(x0)},${toY(m * x0 + b)} L${toX(x1)},${toY(m * x1 + b)}`;
  };

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

  const intInView =
    kind === 'secant' &&
    ix !== null &&
    iy !== null &&
    ix >= VIEW.xMin &&
    ix <= VIEW.xMax &&
    iy >= VIEW.yMin &&
    iy <= VIEW.yMax;

  const makeParallel = () => {
    setM2(m1);
    if (Math.abs(b2 - b1) < ZERO_EPS) {
      const next = b1 + (b1 >= 0 ? -1 : 1);
      setB2(snap(next, -4, 4, 0.1));
    }
  };

  const makePerpendicular = () => {
    if (isZero(m1)) {
      setM2(snap(3, -3, 3, 0.1));
      return;
    }
    const perp = -1 / m1;
    setM2(snap(perp, -3, 3, 0.1));
  };

  const ariaStatus =
    kind === 'parallel'
      ? `Rectas paralelas con la misma pendiente ${m1L}.`
      : kind === 'coincident'
        ? 'Las rectas coinciden.'
        : kind === 'perpendicular'
          ? `Rectas perpendiculares. Ángulo θ≈${thetaL}°.`
          : `Rectas secantes. Intersección en (${ixL},${iyL}). Ángulo θ≈${thetaL}°.`;

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Dos rectas no verticales y=m₁x+b₁ y y=m₂x+b₂ se comparan por sus pendientes: paralelas
            si m₁=m₂, perpendiculares si m₁·m₂=−1.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Ajusta las pendientes e interceptos y observa si las rectas son paralelas, coinciden,
            se cortan en ángulo recto o son secantes con un ángulo θ entre ellas.
          </p>
        </div>

        <section className="rounded-xl border-2 border-[var(--accent-strong)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Clasificación automática
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            <li className={kind === 'parallel' ? 'font-semibold text-[var(--fg)]' : 'text-[var(--fg-muted)]'}>
              {kind === 'parallel' ? '→ ' : ''}m₁=m₂, b₁≠b₂ ⇒ paralelas distintas
            </li>
            <li className={kind === 'coincident' ? 'font-semibold text-[var(--fg)]' : 'text-[var(--fg-muted)]'}>
              {kind === 'coincident' ? '→ ' : ''}m₁=m₂, b₁=b₂ ⇒ coincidentes
            </li>
            <li
              className={kind === 'perpendicular' ? 'font-semibold text-[var(--fg)]' : 'text-[var(--fg-muted)]'}
            >
              {kind === 'perpendicular' ? '→ ' : ''}m₁·m₂=−1 ⇒ perpendiculares (θ=90°)
            </li>
            <li className={kind === 'secant' ? 'font-semibold text-[var(--fg)]' : 'text-[var(--fg-muted)]'}>
              {kind === 'secant' ? '→ ' : ''}en otro caso ⇒ secantes
            </li>
          </ul>
          <p className="mt-3 rounded-lg bg-[color-mix(in_oklab,var(--accent-soft)_55%,transparent)] px-3 py-2 text-sm font-semibold">
            Caso actual: {caseTitle} · {slopeCheck} · θ≈{thetaL}°
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Rectas
          </p>
          <p className="mt-2 font-mono text-base">
            <span style={{ color: 'var(--accent-strong)' }}>r₁: {eq1}</span>
          </p>
          <p className="mt-1 font-mono text-base">
            <span style={{ color: 'teal' }}>r₂: {eq2}</span>
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Plano · relación entre rectas
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
                d={linePath(m1, b1)}
                fill="none"
                stroke="var(--accent-strong)"
                strokeWidth={2.5}
              />
              <path d={linePath(m2, b2)} fill="none" stroke="teal" strokeWidth={2.5} />

              {intInView && ix !== null && iy !== null ? (
                <g>
                  <circle
                    cx={toX(ix)}
                    cy={toY(iy)}
                    r={6}
                    fill="orange"
                    stroke="currentColor"
                    strokeWidth={1}
                  />
                  <text
                    x={toX(ix) + 8}
                    y={toY(iy) - 8}
                    fontSize={10}
                    fontWeight={600}
                    fill="currentColor"
                  >
                    I=({ixL},{iyL})
                  </text>
                </g>
              ) : null}

              {kind === 'parallel' ? (
                <text
                  x={W / 2}
                  y={MARGIN.t + 10}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={600}
                  fill="currentColor"
                >
                  Paralelas · m₁=m₂={m1L}
                </text>
              ) : null}
              {kind === 'coincident' ? (
                <text
                  x={W / 2}
                  y={MARGIN.t + 10}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={600}
                  fill="currentColor"
                >
                  Coincidentes · misma recta
                </text>
              ) : null}
              {kind === 'perpendicular' ? (
                <text
                  x={W / 2}
                  y={MARGIN.t + 10}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={600}
                  fill="currentColor"
                >
                  Perpendiculares · θ=90°
                </text>
              ) : null}
            </svg>
          </div>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            <span style={{ color: 'var(--accent-strong)' }}>r₁</span> ·{' '}
            <span style={{ color: 'teal' }}>r₂</span>
            {kind === 'secant' ? ' · naranja = intersección I' : ''}
          </p>
        </section>

        <div
          id={statusId}
          className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_70%,var(--bg-elevated))] px-3 py-2 text-sm leading-relaxed"
          aria-live="polite"
        >
          <p className="font-mono">
            {caseTitle} · {slopeCheck} · θ≈{thetaL}°
            {kind === 'secant' && ixL && iyL ? (
              <>
                <br />
                Intersección I=({ixL},{iyL})
              </>
            ) : null}
          </p>
        </div>

        <p className="sr-only">{ariaStatus}</p>

        <ButtonRow>
          <VizButton onClick={makeParallel}>Hacer paralelas</VizButton>
          <VizButton onClick={makePerpendicular}>Hacer perpendiculares</VizButton>
        </ButtonRow>

        <ControlsStack>
          <p className="text-xs font-semibold" style={{ color: 'var(--accent-strong)' }}>
            r₁ · {eq1}
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
            r₂ · {eq2}
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
