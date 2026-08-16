'use client';

import { useId, useState, type PointerEvent, type ReactNode } from 'react';
import {
  ButtonRow,
  ControlsStack,
  SliderRow,
  VizButton,
  VizPanel,
  fmt,
  joinCaption,
} from './controls';
import { add, scale, type Mat2, type Vec2 } from './math2d';
import { present } from './matrixGrid';
import {
  Badge,
  Chip,
  ChipRow,
  CollapsibleEdit,
  GuideBlock,
  I2,
  Mat2Editor,
  PRESET_GENERAL,
  PRESET_PROJECT_X,
  PRESET_ROT45,
  PRESET_SCALE,
  PRESET_SHEAR,
  PRESET_ZERO,
  Segmented,
  applyMat,
  cloneMat2,
  formatPair,
  matEq,
  vecEq,
} from './transformHelpers';
import {
  ArrowMarker,
  Axes,
  COLOR_U,
  COLOR_V,
  COLOR_W,
  VEC_H,
  VEC_W,
  autoScale,
  clampVec,
  labelOffset,
  useVecDrag,
} from './vectorPlane';

const W = VEC_W;
const H = VEC_H;
const ox = W / 2;
const oy = H / 2;
const CLAMP = 3.2;

type Tab = 'geo' | 'alg';
type Mode = 'sum' | 'scale' | 'general';
type MapKind = 'linear' | 'translation';

const PRESETS: Array<{ id: string; label: string; m: Mat2 }> = [
  { id: 'id', label: 'Identidad', m: I2 },
  { id: 'scale', label: 'Escala', m: PRESET_SCALE },
  { id: 'rot', label: 'Rotación', m: PRESET_ROT45 },
  { id: 'shear', label: 'Shear', m: PRESET_SHEAR },
  { id: 'proj', label: 'Proyección', m: PRESET_PROJECT_X },
  { id: 'zero', label: 'Cero', m: PRESET_ZERO },
];

const B_TRANS: Vec2 = { x: 1.2, y: 0.8 };

function applyMap(kind: MapKind, A: Mat2, v: Vec2, b: Vec2): Vec2 {
  if (kind === 'linear') return applyMat(A, v);
  return add(v, b);
}

function PathMini({
  left,
  right,
  ok,
}: {
  left: string;
  right: string;
  ok: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <span className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-0.5 font-mono">
        {left}
      </span>
      <span className="text-[var(--fg-muted)]">⇄</span>
      <span className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-0.5 font-mono">
        {right}
      </span>
      {ok ? <Badge tone="ok">✓</Badge> : <Badge tone="bad">≠</Badge>}
    </div>
  );
}

function PlanePanel({
  uid,
  title,
  S,
  children,
  onPointerMove,
  onPointerUp,
}: {
  uid: string;
  title: string;
  S: number;
  children: ReactNode;
  onPointerMove?: (e: PointerEvent) => void;
  onPointerUp?: () => void;
}) {
  return (
    <div className="space-y-1 min-w-0 flex-1">
      <div className="text-xs font-medium text-[var(--fg-muted)]">{title}</div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full touch-none rounded-xl border border-[var(--border)]"
        role="img"
        aria-label={title}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <defs>
          <ArrowMarker id={`${uid}-u`} color={COLOR_U} />
          <ArrowMarker id={`${uid}-v`} color={COLOR_V} />
          <ArrowMarker id={`${uid}-w`} color={COLOR_W} />
          <ArrowMarker id={`${uid}-g`} color="var(--fg-muted)" />
        </defs>
        <Axes W={W} H={H} ox={ox} oy={oy} S={S} xLabel="e₁" yLabel="e₂" />
        {children}
      </svg>
    </div>
  );
}

function VecArrow({
  tip,
  color,
  markerId,
  label,
  labelPos,
  dashed,
  width = 2.4,
}: {
  tip: { x: number; y: number };
  color: string;
  markerId: string;
  label: string;
  labelPos: { x: number; y: number };
  dashed?: boolean;
  width?: number;
}) {
  return (
    <>
      <line
        x1={ox}
        y1={oy}
        x2={tip.x}
        y2={tip.y}
        stroke={color}
        strokeWidth={width}
        strokeDasharray={dashed ? '5 3' : undefined}
        markerEnd={`url(#${markerId})`}
      />
      <text
        x={labelPos.x}
        y={labelPos.y}
        fontSize={12}
        fontWeight={700}
        fill={color}
        textAnchor="middle"
      >
        {label}
      </text>
    </>
  );
}

/**
 * Linealidad: A(u+v)=Au+Av y A(λu)=λAu. Contraste opcional con traslación.
 */
export function LinearityViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [A, setA] = useState<Mat2>(() => cloneMat2(PRESET_GENERAL));
  const [u, setU] = useState<Vec2>({ x: 1.6, y: 0.6 });
  const [v, setV] = useState<Vec2>({ x: 0.5, y: 1.5 });
  const [lambda, setLambda] = useState(1.5);
  const [alpha, setAlpha] = useState(0.8);
  const [beta, setBeta] = useState(0.6);
  const [mode, setMode] = useState<Mode>('sum');
  const [tab, setTab] = useState<Tab>('geo');
  const [kind, setKind] = useState<MapKind>('linear');
  const [editOpen, setEditOpen] = useState(false);

  const b = B_TRANS;
  const isLinear = kind === 'linear';

  const safeU = clampVec(u, CLAMP);
  const safeV = clampVec(v, CLAMP);

  const uPlusV = add(safeU, safeV);
  const Au = applyMap(kind, A, safeU, b);
  const Av = applyMap(kind, A, safeV, b);
  const AuPlusAv = add(Au, Av);
  const A_uPlusV = applyMap(kind, A, uPlusV, b);

  const lambdaU = scale(safeU, lambda);
  const A_lambdaU = applyMap(kind, A, lambdaU, b);
  const lambdaAu = scale(Au, lambda);

  const combo = add(scale(safeU, alpha), scale(safeV, beta));
  const A_combo = applyMap(kind, A, combo, b);
  const comboImages = add(scale(Au, alpha), scale(Av, beta));

  const addOk = vecEq(A_uPlusV, AuPlusAv);
  const scaleOk = vecEq(A_lambdaU, lambdaAu);
  const generalOk = vecEq(A_combo, comboImages);

  const modeOk =
    mode === 'sum' ? addOk : mode === 'scale' ? scaleOk : generalOk;

  const reach = Math.max(
    ...[
      safeU,
      safeV,
      uPlusV,
      Au,
      Av,
      AuPlusAv,
      A_uPlusV,
      lambdaU,
      A_lambdaU,
      lambdaAu,
      combo,
      A_combo,
      comboImages,
    ].map((p) => Math.hypot(p.x, p.y)),
    1.5,
  );
  const S = autoScale(reach, Math.min(W, H), 52, 26, 48);

  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });

  const dragU = useVecDrag((raw) => setU(clampVec(raw, CLAMP)), S, {
    x: ox,
    y: oy,
  });
  const dragV = useVecDrag((raw) => setV(clampVec(raw, CLAMP)), S, {
    x: ox,
    y: oy,
  });

  const footerMain = !isLinear
    ? 'NO LINEAL — la traslación F(x)=x+b no preserva suma ni el origen'
    : mode === 'sum'
      ? addOk
        ? 'Aditividad ✓'
        : 'Aditividad ✕'
      : mode === 'scale'
        ? scaleOk
          ? 'Homogeneidad ✓'
          : 'Homogeneidad ✕'
        : generalOk
          ? 'A(αu+βv)=αAu+βAv ✓'
          : 'Combinación lineal ✕';

  const caption = joinCaption(
    isLinear ? 'Lineal (Ax)' : 'Traslación F(x)=x+b',
    footerMain,
    mode === 'sum'
      ? `A(u+v)=${formatPair(A_uPlusV)}`
      : mode === 'scale'
        ? `λ=${fmt(lambda)}`
        : `α=${fmt(alpha)}, β=${fmt(beta)}`,
  );

  const setPreset = (m: Mat2) => {
    setA(cloneMat2(m));
    setKind('linear');
  };

  return (
    <VizPanel title="Linealidad" caption={caption}>
      <div className="space-y-3">
        <GuideBlock
          idea="Vas a ver que una transformación lineal lleva dos caminos al mismo resultado: transformar y luego combinar, o combinar y luego transformar."
          tryIt="Arrastra u y v. Compara A(u+v) con Au+Av. Prueba λ negativo o 0. Activa la traslación como contraejemplo."
          concept="Linealidad = aditividad + homogeneidad. Ambos caminos deben coincidir."
        />

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={[
              { id: 'sum', label: 'Suma' },
              { id: 'scale', label: 'Escalamiento' },
              { id: 'general', label: 'General' },
            ]}
            value={mode}
            onChange={(id) => setMode(id as Mode)}
          />
          <Segmented
            options={[
              { id: 'geo', label: 'Geométrica' },
              { id: 'alg', label: 'Algebraica' },
            ]}
            value={tab}
            onChange={(id) => setTab(id as Tab)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={[
              { id: 'linear', label: 'Lineal (Ax)' },
              { id: 'translation', label: 'Traslación no lineal F(x)=x+b' },
            ]}
            value={kind}
            onChange={(id) => setKind(id as MapKind)}
          />
          {isLinear ? (
            <Badge tone="ok">LINEAL ✓</Badge>
          ) : (
            <Badge tone="bad">NO LINEAL</Badge>
          )}
          {modeOk && isLinear ? (
            <Badge tone="ok">caminos coinciden ✓</Badge>
          ) : null}
          {!isLinear ? (
            <Badge tone="warn">F(0)≠0 · F(u+v)≠F(u)+F(v)</Badge>
          ) : null}
        </div>

        {isLinear ? (
          <ChipRow>
            {PRESETS.map((pr) => (
              <Chip
                key={pr.id}
                active={matEq(A, pr.m)}
                onClick={() => setPreset(pr.m)}
              >
                {pr.label}
              </Chip>
            ))}
          </ChipRow>
        ) : null}

        {tab === 'geo' ? (
          <div className="flex flex-col gap-3 md:flex-row">
            <PlanePanel
              uid={`${uid}-dom`}
              title="Dominio"
              S={S}
              onPointerMove={(e) => {
                dragU.onPointerMove(e);
                dragV.onPointerMove(e);
              }}
              onPointerUp={() => {
                dragU.onPointerUp();
                dragV.onPointerUp();
              }}
            >
              {mode === 'sum' ? (
                <>
                  {/* parallelogram helpers */}
                  <line
                    x1={to(safeU).x}
                    y1={to(safeU).y}
                    x2={to(uPlusV).x}
                    y2={to(uPlusV).y}
                    stroke={COLOR_V}
                    strokeWidth={1.3}
                    strokeDasharray="5 3"
                    opacity={0.45}
                  />
                  <line
                    x1={to(safeV).x}
                    y1={to(safeV).y}
                    x2={to(uPlusV).x}
                    y2={to(uPlusV).y}
                    stroke={COLOR_U}
                    strokeWidth={1.3}
                    strokeDasharray="5 3"
                    opacity={0.45}
                  />
                  <VecArrow
                    tip={to(safeU)}
                    color={COLOR_U}
                    markerId={`${uid}-dom-u`}
                    label="u"
                    labelPos={labelOffset(safeU, to(safeU), ox, oy, 14)}
                  />
                  <VecArrow
                    tip={to(safeV)}
                    color={COLOR_V}
                    markerId={`${uid}-dom-v`}
                    label="v"
                    labelPos={labelOffset(safeV, to(safeV), ox, oy, 14)}
                  />
                  <VecArrow
                    tip={to(uPlusV)}
                    color={COLOR_W}
                    markerId={`${uid}-dom-w`}
                    label="u+v"
                    labelPos={labelOffset(uPlusV, to(uPlusV), ox, oy, 16)}
                    width={2.8}
                  />
                  <circle
                    cx={to(safeU).x}
                    cy={to(safeU).y}
                    r={9}
                    fill={COLOR_U}
                    fillOpacity={0.18}
                    stroke={COLOR_U}
                    strokeWidth={1.1}
                    style={{ cursor: 'grab' }}
                    {...dragU}
                  />
                  <circle
                    cx={to(safeV).x}
                    cy={to(safeV).y}
                    r={9}
                    fill={COLOR_V}
                    fillOpacity={0.18}
                    stroke={COLOR_V}
                    strokeWidth={1.1}
                    style={{ cursor: 'grab' }}
                    {...dragV}
                  />
                </>
              ) : null}

              {mode === 'scale' ? (
                <>
                  <VecArrow
                    tip={to(safeU)}
                    color={COLOR_U}
                    markerId={`${uid}-dom-u`}
                    label="u"
                    labelPos={labelOffset(safeU, to(safeU), ox, oy, 14)}
                    dashed
                    width={1.8}
                  />
                  <VecArrow
                    tip={to(lambdaU)}
                    color={COLOR_W}
                    markerId={`${uid}-dom-w`}
                    label={`λu`}
                    labelPos={labelOffset(lambdaU, to(lambdaU), ox, oy, 16)}
                    width={2.8}
                  />
                  <circle
                    cx={to(safeU).x}
                    cy={to(safeU).y}
                    r={9}
                    fill={COLOR_U}
                    fillOpacity={0.18}
                    stroke={COLOR_U}
                    strokeWidth={1.1}
                    style={{ cursor: 'grab' }}
                    {...dragU}
                  />
                </>
              ) : null}

              {mode === 'general' ? (
                <>
                  <line
                    x1={to(scale(safeU, alpha)).x}
                    y1={to(scale(safeU, alpha)).y}
                    x2={to(combo).x}
                    y2={to(combo).y}
                    stroke={COLOR_V}
                    strokeWidth={1.2}
                    strokeDasharray="5 3"
                    opacity={0.4}
                  />
                  <line
                    x1={to(scale(safeV, beta)).x}
                    y1={to(scale(safeV, beta)).y}
                    x2={to(combo).x}
                    y2={to(combo).y}
                    stroke={COLOR_U}
                    strokeWidth={1.2}
                    strokeDasharray="5 3"
                    opacity={0.4}
                  />
                  <VecArrow
                    tip={to(safeU)}
                    color={COLOR_U}
                    markerId={`${uid}-dom-u`}
                    label="u"
                    labelPos={labelOffset(safeU, to(safeU), ox, oy, 12)}
                    dashed
                    width={1.6}
                  />
                  <VecArrow
                    tip={to(safeV)}
                    color={COLOR_V}
                    markerId={`${uid}-dom-v`}
                    label="v"
                    labelPos={labelOffset(safeV, to(safeV), ox, oy, 12)}
                    dashed
                    width={1.6}
                  />
                  <VecArrow
                    tip={to(combo)}
                    color={COLOR_W}
                    markerId={`${uid}-dom-w`}
                    label="αu+βv"
                    labelPos={labelOffset(combo, to(combo), ox, oy, 16)}
                    width={2.8}
                  />
                  <circle
                    cx={to(safeU).x}
                    cy={to(safeU).y}
                    r={9}
                    fill={COLOR_U}
                    fillOpacity={0.18}
                    stroke={COLOR_U}
                    strokeWidth={1.1}
                    style={{ cursor: 'grab' }}
                    {...dragU}
                  />
                  <circle
                    cx={to(safeV).x}
                    cy={to(safeV).y}
                    r={9}
                    fill={COLOR_V}
                    fillOpacity={0.18}
                    stroke={COLOR_V}
                    strokeWidth={1.1}
                    style={{ cursor: 'grab' }}
                    {...dragV}
                  />
                </>
              ) : null}
            </PlanePanel>

            <PlanePanel uid={`${uid}-cod`} title="Codominio" S={S}>
              {mode === 'sum' ? (
                <>
                  <line
                    x1={to(Au).x}
                    y1={to(Au).y}
                    x2={to(AuPlusAv).x}
                    y2={to(AuPlusAv).y}
                    stroke={COLOR_V}
                    strokeWidth={1.3}
                    strokeDasharray="5 3"
                    opacity={0.45}
                  />
                  <line
                    x1={to(Av).x}
                    y1={to(Av).y}
                    x2={to(AuPlusAv).x}
                    y2={to(AuPlusAv).y}
                    stroke={COLOR_U}
                    strokeWidth={1.3}
                    strokeDasharray="5 3"
                    opacity={0.45}
                  />
                  <VecArrow
                    tip={to(Au)}
                    color={COLOR_U}
                    markerId={`${uid}-cod-u`}
                    label={isLinear ? 'Au' : 'F(u)'}
                    labelPos={labelOffset(Au, to(Au), ox, oy, 14)}
                  />
                  <VecArrow
                    tip={to(Av)}
                    color={COLOR_V}
                    markerId={`${uid}-cod-v`}
                    label={isLinear ? 'Av' : 'F(v)'}
                    labelPos={labelOffset(Av, to(Av), ox, oy, 14)}
                  />
                  {/* Au+Av */}
                  <VecArrow
                    tip={to(AuPlusAv)}
                    color="var(--fg-muted)"
                    markerId={`${uid}-cod-g`}
                    label={isLinear ? 'Au+Av' : 'F(u)+F(v)'}
                    labelPos={labelOffset(AuPlusAv, to(AuPlusAv), ox, oy, 14)}
                    dashed
                    width={2}
                  />
                  {/* A(u+v) — orange emphasis; coincides when linear */}
                  <circle
                    cx={to(A_uPlusV).x}
                    cy={to(A_uPlusV).y}
                    r={6}
                    fill={COLOR_W}
                    opacity={0.95}
                  />
                  <text
                    x={labelOffset(A_uPlusV, to(A_uPlusV), ox, oy, 18).x}
                    y={labelOffset(A_uPlusV, to(A_uPlusV), ox, oy, 18).y}
                    fontSize={12}
                    fontWeight={700}
                    fill={COLOR_W}
                    textAnchor="middle"
                  >
                    {isLinear ? 'A(u+v)' : 'F(u+v)'}
                    {addOk ? ' ✓' : ''}
                  </text>
                  {!addOk ? (
                    <line
                      x1={ox}
                      y1={oy}
                      x2={to(A_uPlusV).x}
                      y2={to(A_uPlusV).y}
                      stroke={COLOR_W}
                      strokeWidth={2.4}
                      markerEnd={`url(#${uid}-cod-w)`}
                    />
                  ) : (
                    <line
                      x1={ox}
                      y1={oy}
                      x2={to(A_uPlusV).x}
                      y2={to(A_uPlusV).y}
                      stroke={COLOR_W}
                      strokeWidth={2.6}
                      markerEnd={`url(#${uid}-cod-w)`}
                    />
                  )}
                </>
              ) : null}

              {mode === 'scale' ? (
                <>
                  <VecArrow
                    tip={to(Au)}
                    color={COLOR_U}
                    markerId={`${uid}-cod-u`}
                    label={isLinear ? 'Au' : 'F(u)'}
                    labelPos={labelOffset(Au, to(Au), ox, oy, 12)}
                    dashed
                    width={1.8}
                  />
                  <VecArrow
                    tip={to(lambdaAu)}
                    color="var(--fg-muted)"
                    markerId={`${uid}-cod-g`}
                    label={isLinear ? 'λAu' : 'λF(u)'}
                    labelPos={labelOffset(lambdaAu, to(lambdaAu), ox, oy, 14)}
                    dashed
                    width={2}
                  />
                  <line
                    x1={ox}
                    y1={oy}
                    x2={to(A_lambdaU).x}
                    y2={to(A_lambdaU).y}
                    stroke={COLOR_W}
                    strokeWidth={2.6}
                    markerEnd={`url(#${uid}-cod-w)`}
                  />
                  <circle
                    cx={to(A_lambdaU).x}
                    cy={to(A_lambdaU).y}
                    r={6}
                    fill={COLOR_W}
                  />
                  <text
                    x={labelOffset(A_lambdaU, to(A_lambdaU), ox, oy, 18).x}
                    y={labelOffset(A_lambdaU, to(A_lambdaU), ox, oy, 18).y}
                    fontSize={12}
                    fontWeight={700}
                    fill={COLOR_W}
                    textAnchor="middle"
                  >
                    {isLinear ? 'A(λu)' : 'F(λu)'}
                    {scaleOk ? ' ✓' : ''}
                  </text>
                </>
              ) : null}

              {mode === 'general' ? (
                <>
                  <VecArrow
                    tip={to(Au)}
                    color={COLOR_U}
                    markerId={`${uid}-cod-u`}
                    label={isLinear ? 'Au' : 'F(u)'}
                    labelPos={labelOffset(Au, to(Au), ox, oy, 12)}
                    dashed
                    width={1.6}
                  />
                  <VecArrow
                    tip={to(Av)}
                    color={COLOR_V}
                    markerId={`${uid}-cod-v`}
                    label={isLinear ? 'Av' : 'F(v)'}
                    labelPos={labelOffset(Av, to(Av), ox, oy, 12)}
                    dashed
                    width={1.6}
                  />
                  <VecArrow
                    tip={to(comboImages)}
                    color="var(--fg-muted)"
                    markerId={`${uid}-cod-g`}
                    label={isLinear ? 'αAu+βAv' : 'αF(u)+βF(v)'}
                    labelPos={labelOffset(comboImages, to(comboImages), ox, oy, 14)}
                    dashed
                    width={2}
                  />
                  <line
                    x1={ox}
                    y1={oy}
                    x2={to(A_combo).x}
                    y2={to(A_combo).y}
                    stroke={COLOR_W}
                    strokeWidth={2.6}
                    markerEnd={`url(#${uid}-cod-w)`}
                  />
                  <circle cx={to(A_combo).x} cy={to(A_combo).y} r={6} fill={COLOR_W} />
                  <text
                    x={labelOffset(A_combo, to(A_combo), ox, oy, 18).x}
                    y={labelOffset(A_combo, to(A_combo), ox, oy, 18).y}
                    fontSize={12}
                    fontWeight={700}
                    fill={COLOR_W}
                    textAnchor="middle"
                  >
                    {isLinear ? 'A(αu+βv)' : 'F(αu+βv)'}
                    {generalOk ? ' ✓' : ''}
                  </text>
                </>
              ) : null}
            </PlanePanel>
          </div>
        ) : (
          <div className="space-y-3 rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
            {isLinear ? (
              <Mat2Editor m={A} name="A" readOnly />
            ) : (
              <p className="font-sans text-sm text-[var(--fg-muted)]">
                F(x) = x + b, con b = {formatPair(b)} (traslación).
              </p>
            )}
            <div className="border-t border-[var(--border)] pt-2 space-y-2 text-xs leading-relaxed">
              <p>
                u = {formatPair(safeU)} · v = {formatPair(safeV)}
              </p>
              {mode === 'sum' ? (
                <>
                  <p>
                    u+v = {formatPair(uPlusV)} →{' '}
                    {isLinear ? 'A(u+v)' : 'F(u+v)'} ={' '}
                    <span style={{ color: COLOR_W }}>{formatPair(A_uPlusV)}</span>
                  </p>
                  <p>
                    {isLinear ? 'Au' : 'F(u)'} = {formatPair(Au)},{' '}
                    {isLinear ? 'Av' : 'F(v)'} = {formatPair(Av)} → suma ={' '}
                    {formatPair(AuPlusAv)}
                  </p>
                  <PathMini
                    left={isLinear ? 'A(u+v)' : 'F(u+v)'}
                    right={isLinear ? 'Au+Av' : 'F(u)+F(v)'}
                    ok={addOk}
                  />
                </>
              ) : null}
              {mode === 'scale' ? (
                <>
                  <p>
                    λ = {present(lambda)} · λu = {formatPair(lambdaU)}
                  </p>
                  <p>
                    {isLinear ? 'A(λu)' : 'F(λu)'} ={' '}
                    <span style={{ color: COLOR_W }}>{formatPair(A_lambdaU)}</span>
                    {' · '}
                    {isLinear ? 'λAu' : 'λF(u)'} = {formatPair(lambdaAu)}
                  </p>
                  <PathMini
                    left={isLinear ? 'A(λu)' : 'F(λu)'}
                    right={isLinear ? 'λAu' : 'λF(u)'}
                    ok={scaleOk}
                  />
                </>
              ) : null}
              {mode === 'general' ? (
                <>
                  <p>
                    α = {present(alpha)}, β = {present(beta)} · αu+βv ={' '}
                    {formatPair(combo)}
                  </p>
                  <p>
                    {isLinear ? 'A(αu+βv)' : 'F(αu+βv)'} ={' '}
                    <span style={{ color: COLOR_W }}>{formatPair(A_combo)}</span>
                    {' · '}
                    {isLinear ? 'αAu+βAv' : 'αF(u)+βF(v)'} ={' '}
                    {formatPair(comboImages)}
                  </p>
                  <PathMini
                    left={isLinear ? 'A(αu+βv)' : 'F(αu+βv)'}
                    right={isLinear ? 'αAu+βAv' : 'αF(u)+βF(v)'}
                    ok={generalOk}
                  />
                </>
              ) : null}
              {!isLinear ? (
                <p className="font-sans text-[var(--fg-muted)]">
                  F(0) = {formatPair(b)} ≠ (0, 0).
                </p>
              ) : null}
            </div>
          </div>
        )}

        {tab === 'geo' ? (
          <div className="space-y-1.5">
            {mode === 'sum' ? (
              <PathMini
                left={isLinear ? 'A(u+v)' : 'F(u+v)'}
                right={isLinear ? 'Au+Av' : 'F(u)+F(v)'}
                ok={addOk}
              />
            ) : null}
            {mode === 'scale' ? (
              <PathMini
                left={isLinear ? 'A(λu)' : 'F(λu)'}
                right={isLinear ? 'λAu' : 'λF(u)'}
                ok={scaleOk}
              />
            ) : null}
            {mode === 'general' ? (
              <PathMini
                left={isLinear ? 'A(αu+βv)' : 'F(αu+βv)'}
                right={isLinear ? 'αAu+βAv' : 'αF(u)+βF(v)'}
                ok={generalOk}
              />
            ) : null}
          </div>
        ) : null}

        <ControlsStack>
          {mode === 'scale' ? (
            <SliderRow
              label="λ"
              ariaLabel="Escalar lambda"
              value={lambda}
              min={-3}
              max={3}
              step={0.1}
              onChange={setLambda}
            />
          ) : null}
          {mode === 'general' ? (
            <>
              <SliderRow
                label="α"
                ariaLabel="Coeficiente alfa"
                value={alpha}
                min={-2}
                max={2}
                step={0.1}
                onChange={setAlpha}
              />
              <SliderRow
                label="β"
                ariaLabel="Coeficiente beta"
                value={beta}
                min={-2}
                max={2}
                step={0.1}
                onChange={setBeta}
              />
            </>
          ) : null}
          <ButtonRow>
            <VizButton
              onClick={() => {
                setU({ x: 1.6, y: 0.6 });
                setV({ x: 0.5, y: 1.5 });
                setLambda(1.5);
                setAlpha(0.8);
                setBeta(0.6);
              }}
            >
              Restablecer vectores
            </VizButton>
            {mode === 'scale' ? (
              <>
                <VizButton onClick={() => setLambda(0)}>λ = 0</VizButton>
                <VizButton onClick={() => setLambda(-1)}>λ = −1</VizButton>
              </>
            ) : null}
          </ButtonRow>
        </ControlsStack>

        {isLinear ? (
          <CollapsibleEdit
            label="Editar matriz A"
            open={editOpen}
            onToggle={() => setEditOpen((o) => !o)}
          >
            <Mat2Editor m={A} name="A" onChange={setA} labels={['Ae₁', 'Ae₂']} />
          </CollapsibleEdit>
        ) : null}

        <p className="text-sm leading-relaxed text-[var(--fg)]">{footerMain}</p>
        <p className="text-xs text-[var(--fg-muted)]">
          {isLinear
            ? 'Toda matriz (incluida proyección y cero) es lineal.'
            : 'La traslación rompe aditividad y F(0)≠0.'}
        </p>
      </div>
    </VizPanel>
  );
}
