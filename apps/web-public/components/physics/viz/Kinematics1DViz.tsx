'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { G, clamp, xMrua, vMrua } from './physMath';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { ACCENT, ChartFrame, MUTED, ORANGE, TEAL, areaToAxis, fnPath, makePlot, padRange } from './physPlot';

const TMAX = 6;
const W = 420;
const TRACK_H = 72;

type Mode =
  | 'displacement'
  | 'avg_velocity'
  | 'avg_speed'
  | 'inst_velocity'
  | 'avg_accel'
  | 'inst_accel'
  | 'mru'
  | 'mrua_v'
  | 'mrua_x'
  | 'torricelli'
  | 'mrua_avg'
  | 'var_a'
  | 'var_v';

type Profile = 'const' | 'lineal' | 'escalon';

function stateAt(
  t: number,
  x0: number,
  v0: number,
  a: number,
  mode: Mode,
  profile: Profile,
): { x: number; v: number; acc: number } {
  const ts = TMAX / 2;
  if (mode === 'avg_speed') {
    const D = 6;
    const vTrip = D / ts;
    if (t <= ts) return { x: x0 + vTrip * t, v: vTrip, acc: 0 };
    return { x: x0 + D - vTrip * (t - ts), v: -vTrip, acc: 0 };
  }
  if (mode === 'mru') {
    return { x: x0 + v0 * t, v: v0, acc: 0 };
  }
  if (mode === 'var_a') {
    if (profile === 'escalon') {
      if (t <= ts) return { x: xMrua(x0, v0, a, t), v: vMrua(v0, a, t), acc: a };
      const vPlat = vMrua(v0, a, ts);
      const xPlat = xMrua(x0, v0, a, ts);
      return { x: xPlat + vPlat * (t - ts), v: vPlat, acc: 0 };
    }
    if (profile === 'lineal') {
      const k = -a / TMAX;
      return {
        acc: a + k * t,
        v: v0 + a * t + 0.5 * k * t * t,
        x: x0 + v0 * t + 0.5 * a * t * t + (1 / 6) * k * t * t * t,
      };
    }
    return { x: xMrua(x0, v0, a, t), v: vMrua(v0, a, t), acc: a };
  }
  if (mode === 'var_v') {
    if (profile === 'escalon') {
      if (t <= ts) return { x: x0 + v0 * t, v: v0, acc: 0 };
      return { x: x0 + v0 * ts + 0.25 * v0 * (t - ts), v: 0.25 * v0, acc: 0 };
    }
    if (profile === 'lineal') {
      return { x: xMrua(x0, v0, a, t), v: vMrua(v0, a, t), acc: a };
    }
    return { x: x0 + v0 * t, v: v0, acc: 0 };
  }
  return { x: xMrua(x0, v0, a, t), v: vMrua(v0, a, t), acc: a };
}

function Graph({
  label,
  f,
  t,
  tMax,
  color,
  chord,
  tangent,
  fillToT,
  rect,
}: {
  label: string;
  f: (tt: number) => number;
  t: number;
  tMax: number;
  color: string;
  chord?: { t0: number; t1: number };
  tangent?: boolean;
  fillToT?: boolean;
  rect?: { h: number };
}) {
  const samples = Array.from({ length: 80 }, (_, i) => f((i / 79) * tMax));
  const { yMin, yMax } = padRange(samples, 0.2, 2);
  const p = makePlot({ W, H: 118, xMin: 0, xMax: tMax, yMin, yMax });
  const y = f(t);
  let tan: { x1: number; y1: number; x2: number; y2: number } | null = null;
  if (tangent) {
    const dt = 0.08;
    const slope = (f(Math.min(tMax, t + dt)) - f(Math.max(0, t - dt))) / (2 * dt);
    const x0 = Math.max(0, t - 0.9);
    const x1 = Math.min(tMax, t + 0.9);
    tan = { x1: p.X(x0), y1: p.Y(y + slope * (x0 - t)), x2: p.X(x1), y2: p.Y(y + slope * (x1 - t)) };
  }
  return (
    <ChartFrame plot={p} xLabel="t (s)" yLabel={label} title={label}>
      {fillToT ? <path d={areaToAxis(f, 0, t, p)} fill={color} fillOpacity={0.22} /> : null}
      {rect ? (
        <rect
          x={p.X(0)}
          y={rect.h >= 0 ? p.Y(rect.h) : p.y0}
          width={p.X(t) - p.X(0)}
          height={Math.abs(p.Y(rect.h) - p.y0)}
          fill={ORANGE}
          fillOpacity={0.18}
          stroke={ORANGE}
          strokeDasharray="4 3"
        />
      ) : null}
      <path d={fnPath(f, 0, tMax, p)} fill="none" stroke={color} strokeWidth={1.8} />
      {chord ? (
        <line
          x1={p.X(chord.t0)}
          y1={p.Y(f(chord.t0))}
          x2={p.X(chord.t1)}
          y2={p.Y(f(chord.t1))}
          stroke={ORANGE}
          strokeWidth={2}
        />
      ) : null}
      {tan ? <line {...tan} stroke={ORANGE} strokeWidth={2} /> : null}
      <circle cx={p.X(t)} cy={p.Y(y)} r={4} fill={ORANGE} />
    </ChartFrame>
  );
}

export function Kinematics1DViz({ mode }: { mode?: string }) {
  const m = (mode ?? 'mrua_x') as Mode;
  const tr = useTranslations('vizFisica');
  const uid = useId();
  const [x0, setX0] = useState(0);
  const [v0, setV0] = useState(4);
  const [a, setA] = useState(m === 'mru' ? 0 : -1.2);
  const [t, setT] = useState(1.5);
  const [playing, setPlaying] = useState(false);
  const [t0, setT0] = useState(0.6);
  const [t1, setT1] = useState(3.2);
  const [profile, setProfile] = useState<Profile>('escalon');
  useRafPlay(playing, setT, { min: 0, max: TMAX, speed: 1, loop: true });

  const acc = m === 'mru' ? 0 : a;
  const st = stateAt(t, x0, v0, acc, m, profile);
  const xf = stateAt(TMAX, x0, v0, acc, m, profile).x;
  const xi = stateAt(0, x0, v0, acc, m, profile).x;
  const s0 = stateAt(t0, x0, v0, acc, m, profile);
  const s1 = stateAt(t1, x0, v0, acc, m, profile);
  const xOf = (tt: number) => stateAt(tt, x0, v0, acc, m, profile).x;
  const vOf = (tt: number) => stateAt(tt, x0, v0, acc, m, profile).v;
  const aOf = (tt: number) => stateAt(tt, x0, v0, acc, m, profile).acc;

  const xsTrack = Array.from({ length: 40 }, (_, i) => xOf((i / 39) * TMAX));
  const xMin = Math.min(-12, ...xsTrack) - 1;
  const xMax = Math.max(12, ...xsTrack) + 1;
  const toPx = (x: number) => 24 + ((x - xMin) / (xMax - xMin)) * (W - 48);

  const dx = s1.x - s0.x;
  const dt = Math.max(1e-6, t1 - t0);
  const vAvg = dx / dt;
  const aAvg = (s1.v - s0.v) / dt;
  const vf = st.v;
  const dxNow = st.x - xi;
  const vTor = Math.sqrt(Math.max(0, v0 * v0 + 2 * acc * dxNow));
  const vMean = (v0 + vf) / 2;

  const totalDist = (() => {
    let d = 0;
    let prev = xOf(0);
    for (let i = 1; i <= 80; i++) {
      const xi2 = xOf((i / 80) * t);
      d += Math.abs(xi2 - prev);
      prev = xi2;
    }
    return d;
  })();

  const showX = ['displacement', 'avg_velocity', 'inst_velocity', 'mru', 'mrua_x', 'var_v'].includes(m);
  const showV = ['avg_accel', 'inst_accel', 'mru', 'mrua_v', 'mrua_avg', 'var_a', 'var_v', 'inst_velocity'].includes(m);
  const showA = ['inst_accel', 'var_a', 'mrua_v'].includes(m);
  const showTor = m === 'torricelli';

  const vVsX = makePlot({
    W,
    H: 130,
    xMin: Math.min(xi, xf, st.x) - 1,
    xMax: Math.max(xi, xf, st.x) + 1,
    ...padRange(
      Array.from({ length: 40 }, (_, i) => {
        const xx = xi + ((xf - xi) * i) / 39;
        return Math.sqrt(Math.max(0, v0 * v0 + 2 * acc * (xx - xi))) * Math.sign(v0 + acc * 0.01);
      }),
      0.2,
      2,
    ),
  });

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="kinematics_1d" mode={mode} />
        <PlayRow
          playing={playing}
          onToggle={() => setPlaying((p) => !p)}
          extra={
            <VizButton
              onClick={() => {
                setPlaying(false);
                setT(0);
              }}
            >
              {tr('reset')}
            </VizButton>
          }
        />
        <svg viewBox={`0 0 ${W} ${TRACK_H}`} className="h-auto w-full" role="img" aria-label="Móvil sobre una recta">
          <line x1={24} y1={40} x2={W - 24} y2={40} stroke={MUTED} strokeWidth={2} />
          {m === 'displacement' || m === 'avg_velocity' ? (
            <>
              <line x1={toPx(s0.x)} y1={40} x2={toPx(s1.x)} y2={40} stroke={ORANGE} strokeWidth={4} />
              <text x={toPx(s0.x)} y={22} textAnchor="middle" fontSize={11} fill={MUTED}>
                xi
              </text>
              <text x={toPx(s1.x)} y={22} textAnchor="middle" fontSize={11} fill={MUTED}>
                xf
              </text>
            </>
          ) : null}
          <circle cx={toPx(st.x)} cy={40} r={9} fill={ORANGE} />
          <line
            x1={toPx(st.x)}
            y1={40}
            x2={toPx(st.x) + Math.sign(st.v || 1) * clamp(Math.abs(st.v) * 6, 12, 48)}
            y2={40}
            stroke={TEAL}
            strokeWidth={2}
          />
        </svg>
        {showX ? (
          <Graph
            label="x (m)"
            f={xOf}
            t={t}
            tMax={TMAX}
            color={ACCENT}
            chord={m === 'avg_velocity' ? { t0, t1 } : undefined}
            tangent={m === 'inst_velocity'}
          />
        ) : null}
        {showV ? (
          <Graph
            label="v (m/s)"
            f={vOf}
            t={t}
            tMax={TMAX}
            color={TEAL}
            chord={m === 'avg_accel' ? { t0, t1 } : undefined}
            tangent={m === 'inst_accel'}
            fillToT={m === 'mrua_avg' || m === 'var_v'}
            rect={m === 'mrua_avg' ? { h: vMean } : undefined}
          />
        ) : null}
        {showA ? <Graph label="a (m/s²)" f={aOf} t={t} tMax={TMAX} color={ORANGE} fillToT={m === 'var_a'} /> : null}
        {showTor ? (
          <ChartFrame plot={vVsX} xLabel="x (m)" yLabel="v" title="v frente a x">
            <path
              d={fnPath(
                (xx) => Math.sign(v0 || 1) * Math.sqrt(Math.max(0, v0 * v0 + 2 * acc * (xx - xi))),
                vVsX.xMin,
                vVsX.xMax,
                vVsX,
              )}
              fill="none"
              stroke={TEAL}
              strokeWidth={1.8}
            />
            <circle cx={vVsX.X(st.x)} cy={vVsX.Y(st.v)} r={4} fill={ORANGE} />
          </ChartFrame>
        ) : null}
        <PhysStatus id={uid}>
          {m === 'displacement'
            ? `Δx = xf − xi = ${present(s1.x)} − ${present(s0.x)} = ${present(dx)} m`
            : m === 'avg_velocity'
              ? `vmed = Δx/Δt = ${present(vAvg)} m/s · Δt = ${present(dt)} s`
              : m === 'avg_speed'
                ? `dtotal = ${present(totalDist)} m · Δx = ${present(st.x - xi)} m · vmed = ${present((st.x - xi) / Math.max(t, 1e-6))} · rapidez media = ${present(totalDist / Math.max(t, 1e-6))} m/s`
                : m === 'inst_velocity'
                  ? `v(t) = ${present(st.v)} m/s (pendiente de la tangente)`
                  : m === 'avg_accel'
                    ? `amed = Δv/Δt = ${present(aAvg)} m/s²`
                    : m === 'inst_accel'
                      ? `a(t) = ${present(st.acc)} m/s²`
                      : m === 'torricelli'
                        ? `vf² = v0² + 2 a Δx = ${present(v0 * v0 + 2 * acc * dxNow)} · |vf| = ${present(vTor)} (sin t)`
                        : m === 'mrua_avg'
                          ? `Δx = ((v0+vf)/2) t = ${present(vMean * t)} m · área del trapecio`
                          : m === 'var_a'
                            ? `Δv = ∫ a dτ = ${present(st.v - v0)} m/s`
                            : m === 'var_v'
                              ? `Δx = ∫ v dτ = ${present(st.x - xi)} m`
                              : `x = ${present(st.x)} m · v = ${present(st.v)} m/s · a = ${present(st.acc)} m/s² · t = ${present(t)} s`}
        </PhysStatus>
        {(m === 'var_a' || m === 'var_v') && (
          <ButtonRow>
            {(['const', 'lineal', 'escalon'] as const).map((p) => (
              <VizButton key={p} active={profile === p} onClick={() => setProfile(p)}>
                {p}
              </VizButton>
            ))}
          </ButtonRow>
        )}
        <ControlsStack>
          <SliderRow label={`t (${fmt(t)} s)`} value={t} min={0} max={TMAX} step={0.05} onChange={setT} />
          {(m === 'avg_velocity' || m === 'avg_accel' || m === 'displacement') && (
            <>
              <SliderRow label={`ti (${fmt(t0)} s)`} value={t0} min={0} max={TMAX - 0.2} step={0.05} onChange={setT0} />
              <SliderRow label={`tf (${fmt(t1)} s)`} value={t1} min={0.2} max={TMAX} step={0.05} onChange={setT1} />
            </>
          )}
          <SliderRow label={`x0 (${fmt(x0)} m)`} value={x0} min={-8} max={8} step={0.1} onChange={setX0} />
          {m !== 'avg_speed' ? (
            <SliderRow label={`v0 (${fmt(v0)} m/s)`} value={v0} min={-10} max={10} step={0.1} onChange={setV0} />
          ) : null}
          {m !== 'mru' && m !== 'avg_speed' ? (
            <SliderRow label={`a (${fmt(acc)} m/s²)`} value={a} min={-6} max={6} step={0.1} onChange={setA} />
          ) : null}
        </ControlsStack>
        {m === 'displacement' ? (
          <p className="text-xs text-[var(--fg-muted)]">g = {G} solo aparece en caída libre; aquí a la fijas tú.</p>
        ) : null}
      </div>
    </VizPanel>
  );
}
