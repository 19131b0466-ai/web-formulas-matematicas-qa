'use client';

import { useId, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  SliderRow,
  ToggleRow,
  VizButton,
  VizPanel,
  fmt,
  joinCaption,
} from './controls';
import {
  applyMat,
  det2,
  dot,
  matMul,
  norm,
  transpose2,
  type Mat2,
  type Vec2,
} from './math2d';
import { ORT_EPS, ORT_NEAR, formatNum, formatPair } from './orthoHelpers';
import { unitCircle, transformCircle } from './eigenHelpers';
import {
  Badge,
  Chip,
  ChipRow,
  CollapsibleEdit,
  GuideBlock,
  I2,
  Mat2Editor,
  Segmented,
  cloneMat2,
  cols,
  gridLines,
  matEq,
  polyPoints,
} from './transformHelpers';
import {
  ArrowMarker,
  Axes,
  COLOR_U,
  COLOR_V,
  COLOR_W,
  VEC_H,
  VEC_W,
  clampVec,
  labelOffset,
  useVecDrag,
} from './vectorPlane';

const W = VEC_W;
const H = VEC_H;
const ox = W / 2;
const oy = H / 2;
/** Fixed visual scale — equal x/y so right angles look right. */
const S = 48;
const CLAMP = 2.6;

type Mode = 'geo' | 'ortho' | 'verify';
type Kind = 'rot' | 'refl';
type Phase = 'id' | 'Q' | 'QT';
type PresetId = 'rot30' | 'rot90' | 'reflX' | 'reflY' | 'reflYX' | 'id' | null;

const PRESET_REFLECT_X: Mat2 = [
  [1, 0],
  [0, -1],
];
const PRESET_REFLECT_Y: Mat2 = [
  [-1, 0],
  [0, 1],
];
const PRESET_REFLECT_YX: Mat2 = [
  [0, 1],
  [1, 0],
];

const UNIT_SQUARE: Vec2[] = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
];

function rotMat(thetaDeg: number): Mat2 {
  const t = (thetaDeg * Math.PI) / 180;
  const c = Math.cos(t);
  const s = Math.sin(t);
  // Positive θ = counterclockwise in math coords (SVG y is flipped in `to`).
  return [
    [c, -s],
    [s, c],
  ];
}

function isOrthogonalMat(Q: Mat2, eps = ORT_NEAR): boolean {
  const { u: q1, v: q2 } = cols(Q);
  const n1 = norm(q1);
  const n2 = norm(q2);
  if (Math.abs(n1 - 1) > eps || Math.abs(n2 - 1) > eps) return false;
  return Math.abs(dot(q1, q2)) <= eps;
}

function rightAngleMark(
  a: Vec2,
  b: Vec2,
  toPx: (p: Vec2) => { x: number; y: number },
  sizePx = 12,
): string {
  const na = norm(a);
  const nb = norm(b);
  if (na < ORT_EPS || nb < ORT_EPS) return '';
  const ua = { x: (a.x / na) * (sizePx / S), y: (a.y / na) * (sizePx / S) };
  const ub = { x: (b.x / nb) * (sizePx / S), y: (b.y / nb) * (sizePx / S) };
  const pA = toPx(ua);
  const pB = toPx(ub);
  const pC = { x: ox + (pA.x - ox) + (pB.x - ox), y: oy + (pA.y - oy) + (pB.y - oy) };
  return `M${pA.x},${pA.y} L${pC.x},${pC.y} L${pB.x},${pB.y}`;
}

function formatMat(M: Mat2): string {
  return `[[${formatNum(M[0][0])}, ${formatNum(M[0][1])}], [${formatNum(M[1][0])}, ${formatNum(M[1][1])}]]`;
}

/**
 * Matriz ortogonal: QᵀQ = I, preserva longitudes y ángulos, Q⁻¹ = Qᵀ (ALG-ORT-003).
 */
export function OrthogonalMatrixViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [theta, setTheta] = useState(30);
  const [kind, setKind] = useState<Kind>('rot');
  const [mode, setMode] = useState<Mode>('geo');
  const [Q, setQ] = useState<Mat2>(() => rotMat(30));
  const [v, setV] = useState<Vec2>({ x: 1.2, y: 0.7 });
  const [showGrid, setShowGrid] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('id');
  const [preset, setPreset] = useState<PresetId>('rot30');

  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });

  const syncRot = (deg: number) => {
    setTheta(deg);
    setKind('rot');
    setQ(rotMat(deg));
    setPhase('id');
    setPreset(Math.abs(deg - 30) < 1e-9 ? 'rot30' : Math.abs(deg - 90) < 1e-9 ? 'rot90' : null);
  };

  const applyReflect = (m: Mat2, id: PresetId) => {
    setKind('refl');
    setQ(cloneMat2(m));
    setPhase('id');
    setPreset(id);
  };

  const applyPreset = (id: PresetId) => {
    if (id === 'rot30') {
      syncRot(30);
      setPreset('rot30');
      return;
    }
    if (id === 'rot90') {
      syncRot(90);
      setPreset('rot90');
      return;
    }
    if (id === 'reflX') {
      applyReflect(PRESET_REFLECT_X, 'reflX');
      return;
    }
    if (id === 'reflY') {
      applyReflect(PRESET_REFLECT_Y, 'reflY');
      return;
    }
    if (id === 'reflYX') {
      applyReflect(PRESET_REFLECT_YX, 'reflYX');
      return;
    }
    if (id === 'id') {
      setKind('rot');
      setTheta(0);
      setQ(cloneMat2(I2));
      setPhase('id');
      setPreset('id');
    }
  };

  const onEditQ = (m: Mat2) => {
    setQ(cloneMat2(m));
    setPreset(null);
    setPhase('id');
    // Infer kind from det when possible
    const d = det2(m);
    if (isOrthogonalMat(m)) {
      setKind(d < 0 ? 'refl' : 'rot');
    }
  };

  const ortho = isOrthogonalMat(Q);
  const det = det2(Q);
  const QT = transpose2(Q);
  const QTQ = matMul(QT, Q);
  const { u: q1, v: q2 } = cols(Q);
  const nq1 = norm(q1);
  const nq2 = norm(q2);
  const qDot = dot(q1, q2);
  const Qv = applyMat(Q, v);
  const nv = norm(v);
  const nQv = norm(Qv);
  const e1: Vec2 = { x: 1, y: 0 };
  const e2: Vec2 = { x: 0, y: 1 };
  const Qe1 = q1;
  const Qe2 = q2;

  const displayMat: Mat2 =
    phase === 'id' ? I2 : phase === 'Q' ? Q : QT;
  const shapeQ = UNIT_SQUARE.map((p) => applyMat(Q, p));
  const shapeNow = UNIT_SQUARE.map((p) => applyMat(displayMat, p));
  const circleSrc = unitCircle(72);
  const circleQ = transformCircle(Q, 72);
  const circleNow = circleSrc.map((p) => applyMat(displayMat, p));

  const dragV = useVecDrag(
    (p) => setV(clampVec(p, CLAMP)),
    S,
    { x: ox, y: oy },
  );

  const pq1 = to(Qe1);
  const pq2 = to(Qe2);
  const pe1 = to(e1);
  const pe2 = to(e2);
  const pv = to(v);
  const pQv = to(Qv);
  const q1Lbl = labelOffset(Qe1, pq1, ox, oy, 16);
  const q2Lbl = labelOffset(Qe2, pq2, ox, oy, 16);
  const vLbl = labelOffset(v, pv, ox, oy, 16);
  const QvLbl = labelOffset(Qv, pQv, ox, oy, 16);

  const rightQ =
    ortho && nq1 > ORT_EPS && nq2 > ORT_EPS ? rightAngleMark(Qe1, Qe2, to) : '';
  const qtqNearI =
    Math.abs(QTQ[0][0] - 1) < ORT_NEAR &&
    Math.abs(QTQ[1][1] - 1) < ORT_NEAR &&
    Math.abs(QTQ[0][1]) < ORT_NEAR &&
    Math.abs(QTQ[1][0]) < ORT_NEAR;

  const detBadge =
    ortho && det > 0
      ? { tone: 'ok' as const, label: 'ROTACIÓN · det(Q) = +1' }
      : ortho && det < 0
        ? { tone: 'ok' as const, label: 'REFLEXIÓN · det(Q) = −1' }
        : { tone: 'bad' as const, label: 'NO ORTOGONAL' };

  const caption = joinCaption(
    ortho ? 'QᵀQ = I ✓' : 'QᵀQ ≠ I',
    ortho ? `det(Q) = ${det > 0 ? '+1' : '−1'}` : `det(Q) = ${fmt(det)}`,
    `∥v∥=${formatNum(nv)} · ∥Qv∥=${formatNum(nQv)}`,
  );

  return (
    <VizPanel title="Matriz ortogonal" caption={caption}>
      <div className="space-y-3">
        <GuideBlock
          idea="Una matriz ortogonal rota o refleja sin deformar: preserva longitudes y ángulos."
          tryIt="Gira θ o elige una reflexión. Arrastra v: ∥v∥ = ∥Qv∥ y el círculo unitario sigue siendo círculo."
          concept="QᵀQ = I ⇒ Q⁻¹ = Qᵀ. Las columnas son una base ortonormal."
        />

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={[
              { id: 'geo', label: 'Geometría' },
              { id: 'ortho', label: 'Ortonormalidad' },
              { id: 'verify', label: 'Verificar' },
            ]}
            value={mode}
            onChange={(id) => setMode(id as Mode)}
          />
          <Badge tone={detBadge.tone}>{detBadge.label}</Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={[
              { id: 'rot', label: 'Rotación' },
              { id: 'refl', label: 'Reflexión' },
            ]}
            value={kind}
            onChange={(id) => {
              const k = id as Kind;
              setKind(k);
              if (k === 'rot') syncRot(theta === 0 && preset === 'id' ? 30 : theta || 30);
              else applyReflect(PRESET_REFLECT_X, 'reflX');
            }}
          />
        </div>

        <ChipRow>
          <Chip active={preset === 'rot30'} onClick={() => applyPreset('rot30')}>
            Rot 30°
          </Chip>
          <Chip active={preset === 'rot90'} onClick={() => applyPreset('rot90')}>
            Rot 90°
          </Chip>
          <Chip active={preset === 'reflX'} onClick={() => applyPreset('reflX')}>
            Reflexión X
          </Chip>
          <Chip active={preset === 'reflY'} onClick={() => applyPreset('reflY')}>
            Reflexión Y
          </Chip>
          <Chip active={preset === 'reflYX'} onClick={() => applyPreset('reflYX')}>
            Reflexión y=x
          </Chip>
          <Chip active={preset === 'id'} onClick={() => applyPreset('id')}>
            Identidad
          </Chip>
        </ChipRow>

        {kind === 'rot' ? (
          <ControlsStack>
            <SliderRow
              label="θ°"
              ariaLabel="Ángulo de rotación en grados"
              value={theta}
              min={-180}
              max={180}
              step={1}
              onChange={(d) => syncRot(d)}
            />
          </ControlsStack>
        ) : (
          <ChipRow>
            <Chip active={matEq(Q, PRESET_REFLECT_X)} onClick={() => applyReflect(PRESET_REFLECT_X, 'reflX')}>
              eje x
            </Chip>
            <Chip active={matEq(Q, PRESET_REFLECT_Y)} onClick={() => applyReflect(PRESET_REFLECT_Y, 'reflY')}>
              eje y
            </Chip>
            <Chip active={matEq(Q, PRESET_REFLECT_YX)} onClick={() => applyReflect(PRESET_REFLECT_YX, 'reflYX')}>
              y = x
            </Chip>
          </ChipRow>
        )}

        {mode === 'geo' ? (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full touch-none rounded-xl border border-[var(--border)]"
            role="img"
            aria-label="Geometría de matriz ortogonal"
          >
            <defs>
              <ArrowMarker id={`${uid}-e`} color="var(--fg-muted)" />
              <ArrowMarker id={`${uid}-q1`} color={COLOR_U} />
              <ArrowMarker id={`${uid}-q2`} color={COLOR_V} />
              <ArrowMarker id={`${uid}-v`} color={COLOR_W} />
              <ArrowMarker id={`${uid}-qv`} color="var(--accent-strong)" />
              <clipPath id={`${uid}-clip`}>
                <rect x={0} y={0} width={W} height={H} />
              </clipPath>
            </defs>
            <Axes W={W} H={H} ox={ox} oy={oy} S={S} ticks={[-2, -1, 1, 2]} />

            {showGrid && ortho ? (
              <g opacity={0.4} clipPath={`url(#${uid}-clip)`}>
                {gridLines(Q, 2.4, 9).map(([a, b], i) => {
                  const A0 = to(a);
                  const B0 = to(b);
                  return (
                    <line
                      key={`g-${i}`}
                      x1={A0.x}
                      y1={A0.y}
                      x2={B0.x}
                      y2={B0.y}
                      stroke="var(--accent-strong)"
                      strokeWidth={1}
                    />
                  );
                })}
              </g>
            ) : null}

            {/* Unit circle (source) */}
            <polygon
              points={polyPoints(circleSrc, to)}
              fill="none"
              stroke="var(--fg-muted)"
              strokeWidth={1.2}
              strokeDasharray="4 3"
              opacity={0.4}
            />

            {/* Q(circle): stays circle if orthogonal; ellipse contrast otherwise */}
            <polygon
              points={polyPoints(circleQ, to)}
              fill={
                ortho
                  ? 'color-mix(in oklab, var(--accent-soft) 35%, transparent)'
                  : 'color-mix(in oklab, orange 18%, transparent)'
              }
              stroke={ortho ? 'var(--accent-strong)' : 'orange'}
              strokeWidth={1.8}
              opacity={0.95}
            />

            {/* Unit square → image under Q */}
            <polygon
              points={polyPoints(UNIT_SQUARE, to)}
              fill="none"
              stroke="var(--fg-muted)"
              strokeWidth={1.2}
              strokeDasharray="4 3"
              opacity={0.45}
            />
            <polygon
              points={polyPoints(shapeQ, to)}
              fill="color-mix(in oklab, var(--accent-soft) 40%, transparent)"
              stroke="var(--accent-strong)"
              strokeWidth={2}
            />

            {/* e1, e2 faint */}
            <line
              x1={ox}
              y1={oy}
              x2={pe1.x}
              y2={pe1.y}
              stroke="var(--fg-muted)"
              strokeWidth={1.4}
              markerEnd={`url(#${uid}-e)`}
              opacity={0.45}
            />
            <line
              x1={ox}
              y1={oy}
              x2={pe2.x}
              y2={pe2.y}
              stroke="var(--fg-muted)"
              strokeWidth={1.4}
              markerEnd={`url(#${uid}-e)`}
              opacity={0.45}
            />

            {/* Qe1, Qe2 = columns */}
            <line
              x1={ox}
              y1={oy}
              x2={pq1.x}
              y2={pq1.y}
              stroke={COLOR_U}
              strokeWidth={2.6}
              markerEnd={`url(#${uid}-q1)`}
            />
            <line
              x1={ox}
              y1={oy}
              x2={pq2.x}
              y2={pq2.y}
              stroke={COLOR_V}
              strokeWidth={2.6}
              markerEnd={`url(#${uid}-q2)`}
            />
            <text x={q1Lbl.x} y={q1Lbl.y} textAnchor="middle" fontSize={11} fill={COLOR_U} fontWeight={600}>
              Qe₁
            </text>
            <text x={q2Lbl.x} y={q2Lbl.y} textAnchor="middle" fontSize={11} fill={COLOR_V} fontWeight={600}>
              Qe₂
            </text>
            {rightQ ? <path d={rightQ} fill="none" stroke={COLOR_W} strokeWidth={1.6} /> : null}

            {/* Length circle through tip of v */}
            {nv > ORT_EPS ? (
              <circle
                cx={ox}
                cy={oy}
                r={nv * S}
                fill="none"
                stroke={COLOR_W}
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.35}
              />
            ) : null}

            {/* v and Qv */}
            <line
              x1={ox}
              y1={oy}
              x2={pv.x}
              y2={pv.y}
              stroke={COLOR_W}
              strokeWidth={2.2}
              markerEnd={`url(#${uid}-v)`}
            />
            <line
              x1={ox}
              y1={oy}
              x2={pQv.x}
              y2={pQv.y}
              stroke="var(--accent-strong)"
              strokeWidth={2.2}
              markerEnd={`url(#${uid}-qv)`}
            />
            <text x={vLbl.x} y={vLbl.y} textAnchor="middle" fontSize={11} fill={COLOR_W} fontWeight={600}>
              v
            </text>
            <text
              x={QvLbl.x}
              y={QvLbl.y}
              textAnchor="middle"
              fontSize={11}
              fill="var(--accent-strong)"
              fontWeight={600}
            >
              Qv
            </text>
            <circle cx={pv.x} cy={pv.y} r={8} fill={COLOR_W} opacity={0.9} style={{ cursor: 'grab' }} {...dragV} />
          </svg>
        ) : null}

        {mode === 'ortho' ? (
          <div className="space-y-3">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-auto w-full rounded-xl border border-[var(--border)]"
              role="img"
              aria-label="Columnas ortonormales de Q"
            >
              <defs>
                <ArrowMarker id={`${uid}-o1`} color={COLOR_U} />
                <ArrowMarker id={`${uid}-o2`} color={COLOR_V} />
              </defs>
              <Axes W={W} H={H} ox={ox} oy={oy} S={S} ticks={[-2, -1, 1, 2]} />
              <circle cx={ox} cy={oy} r={S} fill="none" stroke="currentColor" strokeDasharray="4 3" opacity={0.35} />
              <line
                x1={ox}
                y1={oy}
                x2={pq1.x}
                y2={pq1.y}
                stroke={COLOR_U}
                strokeWidth={2.8}
                markerEnd={`url(#${uid}-o1)`}
              />
              <line
                x1={ox}
                y1={oy}
                x2={pq2.x}
                y2={pq2.y}
                stroke={COLOR_V}
                strokeWidth={2.8}
                markerEnd={`url(#${uid}-o2)`}
              />
              {rightQ ? <path d={rightQ} fill="none" stroke={COLOR_W} strokeWidth={1.6} /> : null}
              <text x={q1Lbl.x} y={q1Lbl.y} textAnchor="middle" fontSize={12} fill={COLOR_U} fontWeight={600}>
                q₁
              </text>
              <text x={q2Lbl.x} y={q2Lbl.y} textAnchor="middle" fontSize={12} fill={COLOR_V} fontWeight={600}>
                q₂
              </text>
            </svg>
            <div className="space-y-1.5 rounded-lg border border-[var(--border)] px-3 py-2 font-mono text-sm">
              <p>
                ∥q₁∥ = {formatNum(nq1)} {Math.abs(nq1 - 1) < ORT_NEAR ? '✓' : '✕'}
                <span className="text-[var(--fg-muted)]"> · </span>
                ∥q₂∥ = {formatNum(nq2)} {Math.abs(nq2 - 1) < ORT_NEAR ? '✓' : '✕'}
              </p>
              <p>
                q₁·q₂ = {formatNum(qDot)} {Math.abs(qDot) < ORT_NEAR ? '≈ 0 ✓' : '≠ 0 ✕'}
              </p>
              <p className="text-[var(--fg-muted)]">
                Las entradas de QᵀQ son productos punto de columnas: (QᵀQ)<sub>ij</sub> = qᵢ·qⱼ. Si las
                columnas son ortonormales, QᵀQ = I.
              </p>
              <p>
                QᵀQ = {formatMat(QTQ)} {qtqNearI ? '≈ I ✓' : '≠ I'}
              </p>
            </div>
          </div>
        ) : null}

        {mode === 'verify' ? (
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-[var(--border)] px-3 py-2 font-mono text-sm">
                <p className="mb-1 text-xs font-sans font-medium text-[var(--fg-muted)]">QᵀQ</p>
                <p>{formatMat(QTQ)}</p>
                <p className="mt-1">{qtqNearI ? '≈ I ✓' : '≠ I ✕'}</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] px-3 py-2 font-mono text-sm">
                <p className="mb-1 text-xs font-sans font-medium text-[var(--fg-muted)]">Qᵀ (= Q⁻¹ si ortogonal)</p>
                <p>{formatMat(QT)}</p>
                <p className="mt-1">
                  {ortho ? 'Q⁻¹ = Qᵀ ✓' : 'Q no ortogonal → Q⁻¹ ≠ Qᵀ en general'}
                </p>
              </div>
            </div>

            <ButtonRow>
              <VizButton
                active={phase === 'Q'}
                onClick={() => setPhase(phase === 'QT' ? 'id' : 'Q')}
              >
                Aplicar Q
              </VizButton>
              <VizButton
                active={phase === 'QT'}
                onClick={() => setPhase(phase === 'Q' ? 'id' : 'QT')}
              >
                Aplicar Qᵀ
              </VizButton>
              <VizButton active={phase === 'id'} onClick={() => setPhase('id')}>
                Identidad
              </VizButton>
            </ButtonRow>

            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-auto w-full rounded-xl border border-[var(--border)]"
              role="img"
              aria-label="Aplicar Q y Q traspuesta"
            >
              <defs>
                <ArrowMarker id={`${uid}-vv`} color={COLOR_W} />
              </defs>
              <Axes W={W} H={H} ox={ox} oy={oy} S={S} ticks={[-2, -1, 1, 2]} />
              <polygon
                points={polyPoints(UNIT_SQUARE, to)}
                fill="none"
                stroke="var(--fg-muted)"
                strokeDasharray="4 3"
                opacity={0.4}
              />
              <polygon
                points={polyPoints(shapeNow, to)}
                fill="color-mix(in oklab, var(--accent-soft) 45%, transparent)"
                stroke="var(--accent-strong)"
                strokeWidth={2}
              />
              <polygon
                points={polyPoints(circleNow, to)}
                fill="none"
                stroke="var(--accent-strong)"
                strokeWidth={1.5}
                opacity={0.7}
              />
              <line
                x1={ox}
                y1={oy}
                x2={to(applyMat(displayMat, v)).x}
                y2={to(applyMat(displayMat, v)).y}
                stroke={COLOR_W}
                strokeWidth={2.2}
                markerEnd={`url(#${uid}-vv)`}
              />
            </svg>
            <p className="text-sm text-[var(--fg-muted)]">
              {phase === 'id'
                ? 'Estado identidad. Aplica Q; luego Qᵀ deshace (si Q es ortogonal).'
                : phase === 'Q'
                  ? 'Figura transformada por Q. Pulsa Aplicar Qᵀ para volver (QᵀQ = I).'
                  : 'Aplicaste Qᵀ sobre el estado actual.'}
            </p>
          </div>
        ) : null}

        <ControlsStack>
          <ToggleRow
            label="Mostrar malla"
            checked={showGrid}
            onChange={setShowGrid}
          />
          {!ortho && showGrid ? (
            <p className="text-xs text-[var(--fg-muted)]">
              La malla ortogonal solo se dibuja cuando Q es ortogonal.
            </p>
          ) : null}
        </ControlsStack>

        <CollapsibleEdit
          label="Editar matriz Q"
          open={editOpen}
          onToggle={() => setEditOpen((o) => !o)}
        >
          <Mat2Editor m={Q} onChange={onEditQ} name="Q" labels={['q₁', 'q₂']} />
          {!ortho ? (
            <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
              NO ORTOGONAL: el círculo unitario se deforma en elipse (contraste con rotación/reflexión).
            </p>
          ) : null}
        </CollapsibleEdit>

        <div className="flex flex-wrap gap-3 font-mono text-xs text-[var(--fg-muted)]">
          <span>
            ∥v∥ = {formatNum(nv)} · ∥Qv∥ = {formatNum(nQv)}
            {ortho && Math.abs(nv - nQv) < ORT_NEAR ? ' ✓' : ''}
          </span>
          <span>
            q₁ = {formatPair(q1)} · q₂ = {formatPair(q2)}
          </span>
          <span>det(Q) = {ortho ? (det > 0 ? '+1' : '−1') : formatNum(det)}</span>
        </div>
      </div>
    </VizPanel>
  );
}
