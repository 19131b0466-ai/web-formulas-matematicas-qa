'use client';

import { useId, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from './controls';
import { dot, norm, normalize, project, type Vec2 } from './math2d';
import {
  Axes,
  COLOR_U,
  COLOR_V,
  COLOR_W,
  VEC_W,
  angleBetween,
  atan2Vec,
  clampVec,
  formatPair,
  labelOffset,
  minorArcPath,
  present,
  useVecDrag,
} from './vectorPlane';

const W = VEC_W; // 420
const H = 360;
const ox = W / 2; // 210
const oy = H / 2; // 180
const CLAMP = 4.2;

type Preset = 'agudo' | 'recto' | 'obtuso' | null;

export function DotProductViz() {
  const [u, setU] = useState<Vec2>({ x: 4, y: 0 });
  const [v, setV] = useState<Vec2>({ x: 3, y: 2 });
  const [preset, setPreset] = useState<Preset>(null);
  const uid = useId();

  // ── derived scalar quantities ───────────────────────────────────────────────
  const nu = norm(u);
  const nv = norm(v);
  const dp = dot(u, v);
  const theta = angleBetween(u, v); // radians; NaN if either is zero
  const thetaDeg = Number.isFinite(theta) ? (theta * 180) / Math.PI : NaN;

  const uIsZero = nu < 1e-9;
  const vIsZero = nv < 1e-9;
  const anyZero = uIsZero || vIsZero;

  // ~90° detection (tol 0.5° ≈ 0.0087 rad)
  const isRightAngle = Number.isFinite(theta) && Math.abs(theta - Math.PI / 2) < 0.009;

  // Projection of v onto u (foot of perpendicular)
  const foot: Vec2 = uIsZero ? { x: 0, y: 0 } : project(v, u);
  // Scalar component of v in the u direction
  const compUV = uIsZero ? 0 : dp / nu;

  // ── dynamic scale: fits both vectors while unit circle stays recognisable ──
  const maxNorm = Math.max(nu, nv, 1.5);
  const S = Math.min(46, Math.max(26, (oy - 32) / maxNorm));

  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });

  const pu = to(u);
  const pv = to(v);
  const pFoot = to(foot);

  // ── drag handlers ──────────────────────────────────────────────────────────
  const dragU = useVecDrag(
    (p) => {
      setU(clampVec(p, CLAMP));
      setPreset(null);
    },
    S,
    { x: ox, y: oy },
  );
  const dragV = useVecDrag(
    (p) => {
      setV(clampVec(p, CLAMP));
      setPreset(null);
    },
    S,
    { x: ox, y: oy },
  );

  // ── SVG geometry helpers ───────────────────────────────────────────────────
  const uLbl = labelOffset(u, pu, ox, oy, 20);
  const vLbl = labelOffset(v, pv, ox, oy, 20);

  // Support line of u — through origin, both directions, clipped
  const supportLine = (() => {
    if (uIsZero) return null;
    const d = normalize(u);
    const t = 7;
    return {
      x1: ox - d.x * t * S,
      y1: oy + d.y * t * S,
      x2: ox + d.x * t * S,
      y2: oy - d.y * t * S,
    };
  })();

  // Minor arc path for θ (not shown when ~90°)
  const arcR = 0.48;
  const arcPath =
    !anyZero && !isRightAngle
      ? minorArcPath(ox, oy, S, arcR, atan2Vec(u), atan2Vec(v))
      : '';

  // θ label at bisector of the minor arc
  const thetaLblPos = (() => {
    if (anyZero || !Number.isFinite(theta) || isRightAngle) return null;
    const a0 = atan2Vec(u);
    const a1 = atan2Vec(v);
    let d = a1 - a0;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    const ab = a0 + d / 2;
    const r = (arcR + 0.38) * S;
    return { x: ox + r * Math.cos(ab), y: oy - r * Math.sin(ab) };
  })();

  // Right-angle mark at origin (L-shaped, when θ ≈ 90°)
  const rightMarkPath = (() => {
    if (!isRightAngle || uIsZero || vIsZero) return '';
    const sz = 11;
    const ul = Math.hypot(pu.x - ox, pu.y - oy) || 1;
    const unx = ((pu.x - ox) / ul) * sz;
    const uny = ((pu.y - oy) / ul) * sz;
    const vl = Math.hypot(pv.x - ox, pv.y - oy) || 1;
    const vnx = ((pv.x - ox) / vl) * sz;
    const vny = ((pv.y - oy) / vl) * sz;
    return `M${ox + unx},${oy + uny} L${ox + unx + vnx},${oy + uny + vny} L${ox + vnx},${oy + vny}`;
  })();

  // Whether the projection segment is long enough to draw
  const projVisible = !uIsZero && !vIsZero && Math.abs(compUV) * S > 3;

  // ── preset actions ─────────────────────────────────────────────────────────
  function applyPreset(targetDeg: number, p: Preset) {
    const nvCurrent = Math.max(nv, 0.5);
    const uAngle = atan2Vec(u);
    const newAngle = uAngle + (targetDeg * Math.PI) / 180;
    setV(clampVec({ x: nvCurrent * Math.cos(newAngle), y: nvCurrent * Math.sin(newAngle) }, CLAMP));
    setPreset(p);
  }

  // ── sign badge ─────────────────────────────────────────────────────────────
  const signKind = anyZero
    ? 'neutral'
    : isRightAngle || Math.abs(dp) < 0.05 * nu * nv + 0.001
      ? 'cero'
      : dp > 0
        ? 'positivo'
        : 'negativo';

  const signInfo: Record<string, { label: string; color: string }> = {
    neutral: { label: '—', color: 'var(--fg-muted)' },
    positivo: { label: 'Positivo · ángulo agudo', color: COLOR_U },
    cero: { label: 'Cero · perpendiculares', color: 'currentColor' },
    negativo: { label: 'Negativo · ángulo obtuso', color: COLOR_W },
  };
  const { label: signLabel, color: signColor } = signInfo[signKind];

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <VizPanel>
      <div className="space-y-3">
        {/* Guide */}
        <div>
          <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Vas a ver que el producto punto mide cuánto apunta un vector en la dirección del otro.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Pruébalo — Arrastra u y v. Observa cómo cambian el ángulo, la proyección y u·v: positivo
            si apuntan en direcciones similares, cero si son perpendiculares y negativo si apuntan en
            sentidos opuestos.
          </p>
        </div>

        {/* SVG canvas */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full touch-none rounded-xl border border-[var(--border)]"
          role="img"
          aria-label={`u·v=${fmt(dp)}; ángulo θ≈${Number.isFinite(thetaDeg) ? fmt(thetaDeg, 1) : '—'}°`}
        >
          <defs>
            <clipPath id={`${uid}-clip`}>
              <rect x={0} y={0} width={W} height={H} />
            </clipPath>
          </defs>

          <Axes W={W} H={H} ox={ox} oy={oy} S={S} ticks={[-4, -3, -2, -1, 1, 2, 3, 4]} />

          {/* Support line of u — faint dashed, both directions */}
          {supportLine && (
            <line
              x1={supportLine.x1}
              y1={supportLine.y1}
              x2={supportLine.x2}
              y2={supportLine.y2}
              stroke={COLOR_U}
              strokeWidth={1}
              strokeDasharray="5 4"
              opacity={0.2}
              clipPath={`url(#${uid}-clip)`}
            />
          )}

          {/* Orange arc for θ (hidden when ~90°) */}
          {arcPath && (
            <path d={arcPath} fill="none" stroke={COLOR_W} strokeWidth={1.5} opacity={0.9} />
          )}

          {/* θ label at bisector */}
          {thetaLblPos && (
            <text
              x={thetaLblPos.x}
              y={thetaLblPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fontWeight={600}
              fill={COLOR_W}
            >
              {fmt(thetaDeg, 0)}°
            </text>
          )}

          {/* Right-angle mark at origin (when θ ≈ 90°) */}
          {rightMarkPath && (
            <path
              d={rightMarkPath}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              opacity={0.6}
            />
          )}

          {/* Dashed perpendicular: v tip → foot */}
          {!anyZero && (
            <line
              x1={pv.x}
              y1={pv.y}
              x2={pFoot.x}
              y2={pFoot.y}
              stroke="currentColor"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              opacity={0.4}
            />
          )}

          {/* Orange solid segment: origin → foot (projection) */}
          {projVisible && (
            <>
              <line
                x1={ox}
                y1={oy}
                x2={pFoot.x}
                y2={pFoot.y}
                stroke={COLOR_W}
                strokeWidth={3}
                opacity={0.9}
              />
              <circle cx={pFoot.x} cy={pFoot.y} r={4} fill={COLOR_W} />
            </>
          )}

          {/* v vector (teal) */}
          <line x1={ox} y1={oy} x2={pv.x} y2={pv.y} stroke={COLOR_V} strokeWidth={2.5} />

          {/* u vector (accent-strong / green) */}
          <line x1={ox} y1={oy} x2={pu.x} y2={pu.y} stroke={COLOR_U} strokeWidth={2.5} />

          {/* Drag handles */}
          <circle
            cx={pu.x}
            cy={pu.y}
            r={9}
            fill={COLOR_U}
            opacity={0.85}
            style={{ cursor: 'grab' }}
            {...dragU}
          />
          <circle
            cx={pv.x}
            cy={pv.y}
            r={9}
            fill={COLOR_V}
            opacity={0.85}
            style={{ cursor: 'grab' }}
            {...dragV}
          />

          {/* Tip labels */}
          <text
            x={uLbl.x}
            y={uLbl.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
            fontWeight={700}
            fill={COLOR_U}
          >
            u
          </text>
          <text
            x={vLbl.x}
            y={vLbl.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
            fontWeight={700}
            fill={COLOR_V}
          >
            v
          </text>
        </svg>

        {/* Coordinates readout */}
        <div className="flex flex-wrap gap-3 font-mono text-sm">
          <span>
            <span style={{ color: COLOR_U }}>u</span>
            <span className="text-[var(--fg-muted)]"> = </span>
            <span style={{ color: COLOR_U }}>{formatPair(u.x, u.y)}</span>
          </span>
          <span>
            <span style={{ color: COLOR_V }}>v</span>
            <span className="text-[var(--fg-muted)]"> = </span>
            <span style={{ color: COLOR_V }}>{formatPair(v.x, v.y)}</span>
          </span>
        </div>

        {/* Formula strip */}
        <div className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_60%,var(--bg-elevated))] px-3 py-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
            Fórmula
          </p>
          <div className="space-y-0.5 font-mono text-sm leading-relaxed">
            <p className="text-[var(--fg-muted)]">u·v = ∥u∥ ∥v∥ cos(θ)</p>
            <p>
              <span className="text-[var(--fg-muted)]">{'= '}</span>
              <span style={{ color: COLOR_U }}>{present(nu)}</span>
              <span className="text-[var(--fg-muted)]"> × </span>
              <span style={{ color: COLOR_V }}>{present(nv)}</span>
              <span className="text-[var(--fg-muted)]"> × cos(</span>
              <span style={{ color: COLOR_W }}>
                {Number.isFinite(thetaDeg) ? `${fmt(thetaDeg, 1)}°` : '—'}
              </span>
              <span className="text-[var(--fg-muted)]">)</span>
            </p>
            <p className="text-base font-bold text-[var(--fg)]">= {fmt(dp)}</p>
          </div>
        </div>

        {/* Sign badge + norms row */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-full border px-3 py-1 text-sm font-semibold"
            style={{
              color: signColor,
              borderColor: `color-mix(in oklab, ${signColor} 45%, transparent)`,
              backgroundColor: `color-mix(in oklab, ${signColor} 12%, transparent)`,
            }}
          >
            {signLabel}
          </span>
          <span className="ml-auto text-sm text-[var(--fg-muted)]">
            ∥u∥ = <span style={{ color: COLOR_U }}>{present(nu)}</span>
            {'  ·  '}
            ∥v∥ = <span style={{ color: COLOR_V }}>{present(nv)}</span>
          </span>
        </div>

        {/* comp_u(v) and u·v */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-[var(--border)] px-3 py-2">
            <p className="text-xs text-[var(--fg-muted)]">comp_u(v) = v·û</p>
            <p
              className="font-mono text-base font-semibold tabular-nums"
              style={{ color: COLOR_W }}
            >
              {anyZero ? '—' : present(compUV)}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] px-3 py-2">
            <p className="text-xs text-[var(--fg-muted)]">u · v</p>
            <p className="font-mono text-base font-semibold tabular-nums text-[var(--fg)]">
              {fmt(dp)}
            </p>
          </div>
        </div>

        {/* Alignment hint */}
        <div className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs leading-relaxed text-[var(--fg-muted)]">
          <span style={{ color: COLOR_U }}>Misma dirección</span>
          {' → máximo positivo  ·  '}
          <span>⟂ → 0</span>
          {'  ·  '}
          <span style={{ color: COLOR_W }}>Opuestas</span>
          {' → negativo máximo'}
        </div>

        {/* Preset buttons */}
        <ButtonRow>
          <VizButton active={preset === 'agudo'} onClick={() => applyPreset(40, 'agudo')}>
            Agudo
          </VizButton>
          <VizButton active={preset === 'recto'} onClick={() => applyPreset(90, 'recto')}>
            90°
          </VizButton>
          <VizButton active={preset === 'obtuso'} onClick={() => applyPreset(130, 'obtuso')}>
            Obtuso
          </VizButton>
        </ButtonRow>

        {/* Sliders */}
        <ControlsStack>
          <p className="text-xs font-semibold" style={{ color: COLOR_U }}>
            u
          </p>
          <SliderRow
            label="uₓ"
            value={u.x}
            min={-CLAMP}
            max={CLAMP}
            step={0.1}
            onChange={(val) => {
              setU((p) => clampVec({ x: val, y: p.y }, CLAMP));
              setPreset(null);
            }}
          />
          <SliderRow
            label="u_y"
            value={u.y}
            min={-CLAMP}
            max={CLAMP}
            step={0.1}
            onChange={(val) => {
              setU((p) => clampVec({ x: p.x, y: val }, CLAMP));
              setPreset(null);
            }}
          />
          <p className="pt-1 text-xs font-semibold" style={{ color: COLOR_V }}>
            v
          </p>
          <SliderRow
            label="vₓ"
            value={v.x}
            min={-CLAMP}
            max={CLAMP}
            step={0.1}
            onChange={(val) => {
              setV((p) => clampVec({ x: val, y: p.y }, CLAMP));
              setPreset(null);
            }}
          />
          <SliderRow
            label="v_y"
            value={v.y}
            min={-CLAMP}
            max={CLAMP}
            step={0.1}
            onChange={(val) => {
              setV((p) => clampVec({ x: p.x, y: val }, CLAMP));
              setPreset(null);
            }}
          />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
