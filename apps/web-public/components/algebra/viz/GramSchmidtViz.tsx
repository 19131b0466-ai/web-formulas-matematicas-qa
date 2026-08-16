'use client';

import { useId, useState } from 'react';
import {
  ControlsStack,
  ToggleRow,
  VizPanel,
  joinCaption,
} from './controls';
import {
  add,
  dot,
  norm,
  normalize,
  scale,
  type Vec2,
} from './math2d';
import {
  ORT_EPS,
  ORT_NEAR,
  classifyDot,
  formatNum,
  formatPair,
  isNearZero,
  isOrthogonal,
  orthogonalProjection,
} from './orthoHelpers';
import {
  Badge,
  Chip,
  ChipRow,
  GuideBlock,
  Segmented,
} from './transformHelpers';
import {
  ArrowMarker,
  Axes,
  COLOR_U,
  COLOR_V,
  COLOR_W,
  VEC_H,
  VEC_W,
  angleBetween,
  atan2Vec,
  clampVec,
  labelOffset,
  minorArcPath,
  useVecDrag,
} from './vectorPlane';

const W = VEC_W;
const H = VEC_H;
const ox = W / 2;
const oy = H / 2;
/** Fixed visual scale (px per unit) — equal x/y so right angles look right. */
const S = 42;
const CLAMP = 4.2;
const LINE_EXT = 5.5;

type Step = '1' | '2' | '3' | '4' | '5';
type Tab = 'proceso' | 'algebra';
type PresetId =
  | 'general'
  | 'casi'
  | 'dep'
  | 'ortho'
  | 'ortonorm'
  | null;

const PRESETS: Array<{ id: PresetId; label: string; v1: Vec2; v2: Vec2 }> = [
  { id: 'general', label: 'General', v1: { x: 3, y: 1 }, v2: { x: 1, y: 3 } },
  { id: 'casi', label: 'Casi paralelos', v1: { x: 3, y: 1 }, v2: { x: 2.85, y: 1.15 } },
  { id: 'dep', label: 'Dependientes', v1: { x: 3, y: 1 }, v2: { x: 6, y: 2 } },
  { id: 'ortho', label: 'Ya ortogonales', v1: { x: 3, y: 1 }, v2: { x: -1, y: 3 } },
  { id: 'ortonorm', label: 'Ya ortonormales', v1: { x: 1, y: 0 }, v2: { x: 0, y: 1 } },
];

const STEP_OPTS = [
  { id: '1', label: '1 Vectores' },
  { id: '2', label: '2 Proyección' },
  { id: '3', label: '3 Restar' },
  { id: '4', label: '4 Ortogonal' },
  { id: '5', label: '5 Normalizar' },
];

function rightAngleAt(
  origin: Vec2,
  a: Vec2,
  b: Vec2,
  toPx: (p: Vec2) => { x: number; y: number },
  sizePx = 11,
): string {
  const na = norm(a);
  const nb = norm(b);
  if (na < ORT_EPS || nb < ORT_EPS) return '';
  const ua = scale(a, sizePx / (na * S));
  const ub = scale(b, sizePx / (nb * S));
  const p0 = toPx(origin);
  const pA = toPx(add(origin, ua));
  const pB = toPx(add(origin, ub));
  const pC = {
    x: p0.x + (pA.x - p0.x) + (pB.x - p0.x),
    y: p0.y + (pA.y - p0.y) + (pB.y - p0.y),
  };
  return `M${pA.x},${pA.y} L${pC.x},${pC.y} L${pB.x},${pB.y}`;
}

function spanLine(dir: Vec2): { a: Vec2; b: Vec2 } | null {
  const n = norm(dir);
  if (n < ORT_EPS) return null;
  const d = normalize(dir);
  return { a: scale(d, -LINE_EXT), b: scale(d, LINE_EXT) };
}

function footerForStep(
  step: Step,
  v1Zero: boolean,
  dependent: boolean,
  alreadyOrtho: boolean,
): string {
  if (v1Zero) {
    return 'v₁ = 0: no se puede proyectar sobre el vector nulo (división por cero). Elige otro v₁.';
  }
  if (step === '1') {
    return 'Parte de dos vectores independientes. El ángulo entre ellos mide cuán «oblicuos» están.';
  }
  if (step === '2') {
    return 'proj es la sombra de v₂ sobre span{u₁}. El segmento discontinuo es la perpendicular al pie.';
  }
  if (step === '3') {
    return 'El residual u₂ = v₂ − proj es ortogonal a u₁. Si v₁ ∥ v₂, el residual es 0.';
  }
  if (step === '4') {
    if (dependent) return 'u₂ = 0: los vectores eran dependientes; no hay una segunda dirección ortogonal.';
    if (alreadyOrtho) return 'Ya eran ortogonales: proj ≈ 0 y u₂ ≈ v₂.';
    return 'u₁ y u₂ forman una base ortogonal del mismo plano: span{v₁,v₂} = span{u₁,u₂}.';
  }
  if (dependent) {
    return 'No se puede normalizar u₂ = 0. Solo e₁ = u₁/∥u₁∥ está definido.';
  }
  return 'Normalizar da una base ortonormal: ∥e₁∥ = ∥e₂∥ = 1 y e₁ · e₂ = 0.';
}

/**
 * Gram–Schmidt en ℝ²: ortogonaliza v₁,v₂ → u₁,u₂ y opcionalmente e₁,e₂ (ALG-ORT-004).
 */
export function GramSchmidtViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [v1, setV1] = useState<Vec2>({ x: 3, y: 1 });
  const [v2, setV2] = useState<Vec2>({ x: 1, y: 3 });
  const [step, setStep] = useState<Step>('1');
  const [tab, setTab] = useState<Tab>('proceso');
  const [showSpan, setShowSpan] = useState(false);
  const [preset, setPreset] = useState<PresetId>('general');

  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });

  const v1Zero = isNearZero(v1);
  const u1 = v1;
  const projRes = orthogonalProjection(v2, u1);
  const proj = projRes.valid ? projRes.proj : ({ x: 0, y: 0 } as Vec2);
  const coeff = projRes.valid ? projRes.coeff : 0;
  const u2 = projRes.valid ? projRes.residual : v2;
  const u2Zero = isNearZero(u2);
  const dependent = !v1Zero && u2Zero;
  const n1 = norm(u1);
  const n2 = norm(u2);
  const e1 = n1 > ORT_EPS ? normalize(u1) : ({ x: 0, y: 0 } as Vec2);
  const e2 = n2 > ORT_EPS ? normalize(u2) : ({ x: 0, y: 0 } as Vec2);
  const e1Ok = n1 > ORT_EPS;
  const e2Ok = n2 > ORT_EPS;
  const orthoDot = dot(u1, u2);
  const orthoOk = !v1Zero && !u2Zero && isOrthogonal(u1, u2);
  const alreadyOrtho =
    !v1Zero && !u2Zero && Math.abs(coeff) < ORT_NEAR * (norm(v2) / Math.max(n1, ORT_EPS) + 1);
  const ang = angleBetween(v1, v2);
  const angDeg = Number.isFinite(ang) ? (ang * 180) / Math.PI : null;
  const cls = classifyDot(v1, v2);

  const drag1 = useVecDrag(
    (p) => {
      setV1(clampVec(p, CLAMP));
      setPreset(null);
    },
    S,
    { x: ox, y: oy },
  );
  const drag2 = useVecDrag(
    (p) => {
      setV2(clampVec(p, CLAMP));
      setPreset(null);
    },
    S,
    { x: ox, y: oy },
  );

  const applyPreset = (id: PresetId) => {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setPreset(id);
    setV1(p.v1);
    setV2(p.v2);
  };

  const p1 = to(v1);
  const p2 = to(v2);
  const pu1 = to(u1);
  const pProj = to(proj);
  const pu2 = to(u2);
  const pe1 = to(e1);
  const pe2 = to(e2);
  const tipTailStart = to(proj);
  const tipTailEnd = to(v2);

  const v1Lbl = labelOffset(v1, p1, ox, oy, 18);
  const v2Lbl = labelOffset(v2, p2, ox, oy, 18);
  const u1Lbl = labelOffset(u1, pu1, ox, oy, 18);
  const u2Lbl = labelOffset(u2, pu2, ox, oy, 18);
  const e1Lbl = labelOffset(e1, pe1, ox, oy, 16);
  const e2Lbl = labelOffset(e2, pe2, ox, oy, 16);

  const spanU1 = spanLine(u1);
  const spanV = showSpan && !v1Zero && !u2Zero ? true : false;

  const showStep1 = step === '1';
  const showStep2 = step === '2';
  const showStep3 = step === '3';
  const showStep4 = step === '4' || step === '5';
  const showStep5 = step === '5';

  const arcPath =
    showStep1 && !v1Zero && !isNearZero(v2) && angDeg != null && Math.abs(angDeg - 90) > 0.8
      ? minorArcPath(ox, oy, S, 0.55, atan2Vec(v1), atan2Vec(v2))
      : '';

  const rightAtFoot =
    (showStep2 || showStep3) && projRes.valid && !v1Zero && !u2Zero
      ? rightAngleAt(proj, u1, u2, to)
      : '';
  const rightAtOrigin =
    (showStep4 || showStep5) && orthoOk ? rightAngleAt({ x: 0, y: 0 }, u1, u2, to) : '';
  const rightAtOriginE =
    showStep5 && e1Ok && e2Ok && isOrthogonal(e1, e2)
      ? rightAngleAt({ x: 0, y: 0 }, e1, e2, to)
      : '';

  const footer = footerForStep(step, v1Zero, dependent, alreadyOrtho);

  const caption = joinCaption(
    v1Zero ? 'v₁ = 0 ✕' : dependent ? 'Dependientes · u₂ = 0' : 'Independientes',
    orthoOk ? 'u₁ ⟂ u₂ ✓' : undefined,
    e1Ok && e2Ok ? 'ortonormal disponible' : undefined,
  );

  return (
    <VizPanel title="Gram–Schmidt" caption={caption}>
      <div className="space-y-3">
        <GuideBlock
          idea="Gram–Schmidt convierte vectores en una base ortogonal (mismo span, direcciones a 90°)."
          tryIt="Avanza los pasos: proyecta v₂ sobre u₁, resta el residual y, si u₂ ≠ 0, normaliza."
          concept="span{v₁,v₂} = span{u₁,u₂}. Ortogonal ≠ ortonormal: la normalización hace ∥eᵢ∥ = 1."
        />

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={[
              { id: 'proceso', label: 'Proceso' },
              { id: 'algebra', label: 'Álgebra' },
            ]}
            value={tab}
            onChange={(id) => setTab(id as Tab)}
          />
          {v1Zero ? <Badge tone="bad">v₁ = 0</Badge> : null}
          {dependent ? <Badge tone="warn">DEPENDIENTES · u₂ = 0</Badge> : null}
          {!v1Zero && !dependent && orthoOk && step === '4' ? (
            <Badge tone="ok">BASE ORTOGONAL</Badge>
          ) : null}
          {!v1Zero && e1Ok && e2Ok && step === '5' ? (
            <Badge tone="ok">BASE ORTONORMAL</Badge>
          ) : null}
        </div>

        <Segmented
          options={STEP_OPTS}
          value={step}
          onChange={(id) => setStep(id as Step)}
        />

        <ChipRow>
          {PRESETS.map((p) => (
            <Chip key={p.id} active={preset === p.id} onClick={() => applyPreset(p.id)}>
              {p.label}
            </Chip>
          ))}
        </ChipRow>

        {tab === 'proceso' ? (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full touch-none rounded-xl border border-[var(--border)]"
            role="img"
            aria-label="Proceso Gram–Schmidt en el plano"
          >
            <defs>
              <ArrowMarker id={`${uid}-v1`} color={COLOR_U} />
              <ArrowMarker id={`${uid}-v2`} color={COLOR_V} />
              <ArrowMarker id={`${uid}-u1`} color={COLOR_U} />
              <ArrowMarker id={`${uid}-u2`} color="var(--accent-strong)" />
              <ArrowMarker id={`${uid}-proj`} color={COLOR_W} />
              <ArrowMarker id={`${uid}-e1`} color={COLOR_U} />
              <ArrowMarker id={`${uid}-e2`} color={COLOR_V} />
              <clipPath id={`${uid}-clip`}>
                <rect x={0} y={0} width={W} height={H} />
              </clipPath>
            </defs>

            <Axes W={W} H={H} ox={ox} oy={oy} S={S} ticks={[-4, -2, 2, 4]} />

            {/* Optional span card: parallelogram hint */}
            {spanV ? (
              <polygon
                points={`${to({ x: 0, y: 0 }).x},${to({ x: 0, y: 0 }).y} ${p1.x},${p1.y} ${to(add(v1, v2)).x},${to(add(v1, v2)).y} ${p2.x},${p2.y}`}
                fill="color-mix(in oklab, var(--accent-soft) 45%, transparent)"
                stroke="var(--accent-strong)"
                strokeWidth={1}
                opacity={0.55}
                clipPath={`url(#${uid}-clip)`}
              />
            ) : null}

            {/* Unit circle (normalize step) */}
            {showStep5 ? (
              <circle
                cx={ox}
                cy={oy}
                r={S}
                fill="none"
                stroke="currentColor"
                strokeDasharray="4 3"
                opacity={0.35}
              />
            ) : null}

            {/* span(u1) */}
            {(showStep2 || showStep3) && spanU1 ? (
              <line
                x1={to(spanU1.a).x}
                y1={to(spanU1.a).y}
                x2={to(spanU1.b).x}
                y2={to(spanU1.b).y}
                stroke={COLOR_U}
                strokeWidth={1}
                strokeDasharray="5 4"
                opacity={0.35}
                clipPath={`url(#${uid}-clip)`}
              />
            ) : null}

            {/* Angle arc (step 1) */}
            {arcPath ? (
              <path d={arcPath} fill="none" stroke={COLOR_W} strokeWidth={1.5} opacity={0.9} />
            ) : null}
            {showStep1 && angDeg != null && Math.abs(angDeg - 90) <= 0.8 && !v1Zero && !isNearZero(v2)
              ? (
                <path
                  d={rightAngleAt({ x: 0, y: 0 }, v1, v2, to)}
                  fill="none"
                  stroke={COLOR_W}
                  strokeWidth={1.6}
                />
              )
              : null}
            {showStep1 && angDeg != null && Math.abs(angDeg - 90) > 0.8 && cls.thetaDeg != null
              ? (() => {
                  const a0 = atan2Vec(v1);
                  const a1 = atan2Vec(v2);
                  let d = a1 - a0;
                  while (d > Math.PI) d -= 2 * Math.PI;
                  while (d < -Math.PI) d += 2 * Math.PI;
                  const ab = a0 + d / 2;
                  const r = 0.9 * S;
                  return (
                    <text
                      x={ox + r * Math.cos(ab)}
                      y={oy - r * Math.sin(ab)}
                      textAnchor="middle"
                      fontSize={11}
                      fill={COLOR_W}
                    >
                      {formatNum(angDeg, 0)}°
                    </text>
                  );
                })()
              : null}

            {/* Projection (steps 2–3) */}
            {(showStep2 || showStep3) && projRes.valid && !v1Zero ? (
              <>
                <line
                  x1={ox}
                  y1={oy}
                  x2={pProj.x}
                  y2={pProj.y}
                  stroke={COLOR_W}
                  strokeWidth={3}
                  markerEnd={`url(#${uid}-proj)`}
                  opacity={0.95}
                />
                <line
                  x1={p2.x}
                  y1={p2.y}
                  x2={pProj.x}
                  y2={pProj.y}
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  opacity={0.45}
                />
                {rightAtFoot ? (
                  <path d={rightAtFoot} fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.7} />
                ) : null}
                <circle cx={pProj.x} cy={pProj.y} r={4} fill={COLOR_W} />
                <text
                  x={pProj.x + 10}
                  y={pProj.y - 8}
                  fontSize={11}
                  fill={COLOR_W}
                  fontWeight={600}
                >
                  proj
                </text>
              </>
            ) : null}

            {/* Tip-to-tail residual (step 3) */}
            {showStep3 && projRes.valid && !v1Zero ? (
              <line
                x1={tipTailStart.x}
                y1={tipTailStart.y}
                x2={tipTailEnd.x}
                y2={tipTailEnd.y}
                stroke="var(--accent-strong)"
                strokeWidth={2.4}
                strokeDasharray="6 3"
                markerEnd={`url(#${uid}-u2)`}
                opacity={0.85}
              />
            ) : null}

            {/* Original vectors (steps 1–3, faded later) */}
            {(showStep1 || showStep2 || showStep3) && (
              <>
                <line
                  x1={ox}
                  y1={oy}
                  x2={p1.x}
                  y2={p1.y}
                  stroke={COLOR_U}
                  strokeWidth={showStep1 ? 2.6 : 2}
                  markerEnd={`url(#${uid}-v1)`}
                  opacity={showStep1 ? 1 : 0.55}
                />
                <line
                  x1={ox}
                  y1={oy}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={COLOR_V}
                  strokeWidth={showStep1 ? 2.6 : 2}
                  markerEnd={`url(#${uid}-v2)`}
                  opacity={showStep1 ? 1 : 0.55}
                />
                <text x={v1Lbl.x} y={v1Lbl.y} textAnchor="middle" fontSize={12} fill={COLOR_U} fontWeight={600}>
                  {showStep2 || showStep3 ? 'v₁ = u₁' : 'v₁'}
                </text>
                <text x={v2Lbl.x} y={v2Lbl.y} textAnchor="middle" fontSize={12} fill={COLOR_V} fontWeight={600}>
                  v₂
                </text>
              </>
            )}

            {/* Orthogonal basis u1, u2 (steps 4–5) */}
            {showStep4 && !v1Zero ? (
              <>
                <line
                  x1={ox}
                  y1={oy}
                  x2={pu1.x}
                  y2={pu1.y}
                  stroke={COLOR_U}
                  strokeWidth={showStep5 ? 1.6 : 2.6}
                  markerEnd={`url(#${uid}-u1)`}
                  opacity={showStep5 ? 0.35 : 1}
                />
                {!u2Zero ? (
                  <line
                    x1={ox}
                    y1={oy}
                    x2={pu2.x}
                    y2={pu2.y}
                    stroke="var(--accent-strong)"
                    strokeWidth={showStep5 ? 1.6 : 2.6}
                    markerEnd={`url(#${uid}-u2)`}
                    opacity={showStep5 ? 0.35 : 1}
                  />
                ) : null}
                {!showStep5 ? (
                  <>
                    <text x={u1Lbl.x} y={u1Lbl.y} textAnchor="middle" fontSize={12} fill={COLOR_U} fontWeight={600}>
                      u₁
                    </text>
                    {!u2Zero ? (
                      <text
                        x={u2Lbl.x}
                        y={u2Lbl.y}
                        textAnchor="middle"
                        fontSize={12}
                        fill="var(--accent-strong)"
                        fontWeight={600}
                      >
                        u₂
                      </text>
                    ) : (
                      <text x={ox + 12} y={oy - 14} fontSize={12} fill="var(--fg-muted)">
                        u₂ = 0
                      </text>
                    )}
                  </>
                ) : null}
                {rightAtOrigin && !showStep5 ? (
                  <path d={rightAtOrigin} fill="none" stroke={COLOR_W} strokeWidth={1.6} />
                ) : null}
              </>
            ) : null}

            {/* Orthonormal e1, e2 */}
            {showStep5 && e1Ok ? (
              <>
                <line
                  x1={ox}
                  y1={oy}
                  x2={pe1.x}
                  y2={pe1.y}
                  stroke={COLOR_U}
                  strokeWidth={2.8}
                  markerEnd={`url(#${uid}-e1)`}
                />
                <text x={e1Lbl.x} y={e1Lbl.y} textAnchor="middle" fontSize={12} fill={COLOR_U} fontWeight={600}>
                  e₁
                </text>
                {e2Ok ? (
                  <>
                    <line
                      x1={ox}
                      y1={oy}
                      x2={pe2.x}
                      y2={pe2.y}
                      stroke={COLOR_V}
                      strokeWidth={2.8}
                      markerEnd={`url(#${uid}-e2)`}
                    />
                    <text x={e2Lbl.x} y={e2Lbl.y} textAnchor="middle" fontSize={12} fill={COLOR_V} fontWeight={600}>
                      e₂
                    </text>
                    {rightAtOriginE ? (
                      <path d={rightAtOriginE} fill="none" stroke={COLOR_W} strokeWidth={1.6} />
                    ) : null}
                  </>
                ) : (
                  <text x={ox + 14} y={oy + 20} fontSize={11} fill="var(--fg-muted)">
                    e₂ indefinido (u₂ = 0)
                  </text>
                )}
              </>
            ) : null}

            {/* Step 3: also show u2 at origin */}
            {showStep3 && !v1Zero && !u2Zero ? (
              <line
                x1={ox}
                y1={oy}
                x2={pu2.x}
                y2={pu2.y}
                stroke="var(--accent-strong)"
                strokeWidth={2.4}
                markerEnd={`url(#${uid}-u2)`}
              />
            ) : null}
            {showStep3 && !v1Zero && u2Zero ? (
              <text x={ox + 14} y={oy - 16} fontSize={12} fill="var(--fg-muted)" fontWeight={600}>
                u₂ = 0
              </text>
            ) : null}

            {/* Drag handles always on v1, v2 */}
            <circle cx={p1.x} cy={p1.y} r={9} fill={COLOR_U} opacity={0.9} style={{ cursor: 'grab' }} {...drag1} />
            <circle cx={p2.x} cy={p2.y} r={9} fill={COLOR_V} opacity={0.9} style={{ cursor: 'grab' }} {...drag2} />
          </svg>
        ) : (
          <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-3 font-mono text-sm">
            <p>
              <span className="text-[var(--fg-muted)]">v₁ = </span>
              <span style={{ color: COLOR_U }}>{formatPair(v1)}</span>
              <span className="text-[var(--fg-muted)]"> · v₂ = </span>
              <span style={{ color: COLOR_V }}>{formatPair(v2)}</span>
            </p>
            {v1Zero ? (
              <p className="text-rose-700 dark:text-rose-300">
                Error: ∥v₁∥ = 0 → no se define proj<sub>u₁</sub>(v₂) (división por cero).
              </p>
            ) : (
              <>
                <p>
                  <span className="text-[var(--fg-muted)]">u₁ = v₁ = </span>
                  {formatPair(u1)}
                </p>
                <p>
                  <span className="text-[var(--fg-muted)]">
                    proj = (v₂·u₁ / u₁·u₁) u₁ = ({formatNum(dot(v2, u1))} / {formatNum(dot(u1, u1))}) u₁ ={' '}
                  </span>
                  <span style={{ color: COLOR_W }}>{formatPair(proj)}</span>
                  <span className="text-[var(--fg-muted)]"> · coef = {formatNum(coeff)}</span>
                </p>
                <p>
                  <span className="text-[var(--fg-muted)]">u₂ = v₂ − proj = </span>
                  <span style={{ color: 'var(--accent-strong)' }}>{formatPair(u2)}</span>
                  {u2Zero ? <span className="ml-2 text-amber-700 dark:text-amber-300">(= 0)</span> : null}
                </p>
                <p>
                  <span className="text-[var(--fg-muted)]">u₁·u₂ = </span>
                  {formatNum(orthoDot)}
                  {orthoOk ? <span className="ml-2 text-emerald-700 dark:text-emerald-300">≈ 0 ✓</span> : null}
                </p>
                <p>
                  <span className="text-[var(--fg-muted)]">e₁ = u₁/∥u₁∥ = </span>
                  {e1Ok ? formatPair(e1) : '—'}
                  <span className="text-[var(--fg-muted)]"> · ∥u₁∥ = {formatNum(n1)}</span>
                </p>
                <p>
                  <span className="text-[var(--fg-muted)]">e₂ = u₂/∥u₂∥ = </span>
                  {e2Ok ? (
                    formatPair(e2)
                  ) : (
                    <span className="text-amber-700 dark:text-amber-300">indefinido (∥u₂∥ = 0)</span>
                  )}
                  {e2Ok ? <span className="text-[var(--fg-muted)]"> · ∥u₂∥ = {formatNum(n2)}</span> : null}
                </p>
              </>
            )}
          </div>
        )}

        <ControlsStack>
          <ToggleRow label="Mostrar span" checked={showSpan} onChange={setShowSpan} />
        </ControlsStack>

        <p className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--accent-soft)_25%,transparent)] px-3 py-2 text-sm leading-relaxed text-[var(--fg-muted)]">
          {footer}
        </p>

        {!v1Zero && step === '4' ? (
          <p className="font-mono text-xs text-[var(--fg-muted)]">
            u₁·u₂ = {formatNum(orthoDot)} {orthoOk ? '≈ 0' : ''}
          </p>
        ) : null}
        {!v1Zero && step === '5' && e1Ok ? (
          <p className="font-mono text-xs text-[var(--fg-muted)]">
            ∥e₁∥ = {formatNum(norm(e1))}
            {e2Ok ? ` · ∥e₂∥ = ${formatNum(norm(e2))} · e₁·e₂ = ${formatNum(dot(e1, e2))}` : ' · e₂ no definido'}
          </p>
        ) : null}
      </div>
    </VizPanel>
  );
}
