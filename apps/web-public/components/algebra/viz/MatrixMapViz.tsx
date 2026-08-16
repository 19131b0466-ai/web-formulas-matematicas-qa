'use client';

import { useEffect, useId, useRef, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  SliderRow,
  VizButton,
  VizPanel,
  fmt,
  joinCaption,
} from './controls';
import type { Mat2, Vec2 } from './math2d';
import { present } from './matrixGrid';
import {
  Badge,
  Chip,
  ChipRow,
  CollapsibleEdit,
  DET_EPS,
  GuideBlock,
  I2,
  L_SHAPE,
  Mat2Editor,
  PRESET_GENERAL,
  PRESET_PROJECT_X,
  PRESET_REFLECT_X,
  PRESET_ROT45,
  PRESET_SCALE,
  PRESET_SHEAR,
  PRESET_SINGULAR,
  Segmented,
  applyMat,
  cloneMat2,
  cols,
  det2,
  formatPair,
  gridLines,
  matEq,
  matFromCols,
  matLerp,
  nearZero,
  polyPoints,
  rank2,
  transformPts,
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
/** Stable viewport scale — do not autofit (keeps scaling visible). */
const S = 38;
const CLAMP = 3.2;
const E1: Vec2 = { x: 1, y: 0 };
const E2: Vec2 = { x: 0, y: 1 };

const PRESETS: Array<{ id: string; label: string; m: Mat2 }> = [
  { id: 'id', label: 'Identidad', m: I2 },
  { id: 'scale', label: 'Escalamiento', m: PRESET_SCALE },
  { id: 'rot', label: 'Rotación', m: PRESET_ROT45 },
  { id: 'shear', label: 'Shear', m: PRESET_SHEAR },
  { id: 'reflect', label: 'Reflexión', m: PRESET_REFLECT_X },
  { id: 'proj', label: 'Proyección', m: PRESET_PROJECT_X },
  { id: 'sing', label: 'Singular', m: PRESET_SINGULAR },
];

type Tab = 'geo' | 'alg';
type View = 'plane' | 'vector' | 'base';
type Display = 'overlay' | 'split';

function describeAction(A: Mat2): string {
  if (matEq(A, I2)) return 'A ≈ I: no mueve el plano.';
  if (matEq(A, PRESET_SCALE)) return 'A escala de forma distinta en cada eje.';
  if (matEq(A, PRESET_ROT45)) return 'A rota el plano (≈ 45°).';
  if (matEq(A, PRESET_SHEAR)) return 'A aplica un shear (cizalla) horizontal.';
  if (matEq(A, PRESET_REFLECT_X)) return 'A refleja respecto del eje x.';
  if (matEq(A, PRESET_PROJECT_X)) return 'A proyecta sobre el eje x (colapsa y).';
  if (matEq(A, PRESET_SINGULAR)) return 'A es singular: aplasta el plano a una recta.';
  const d = det2(A);
  const r = rank2(A);
  if (r < 2) return 'A pierde dimensión: varias entradas se apilan en menos direcciones.';
  if (d < 0) return 'A deforma el plano e invierte la orientación.';
  return 'A empuja cada punto x a Ax (deformación lineal del plano).';
}

function GridLayer({
  lines,
  stroke,
  opacity,
  dashed,
}: {
  lines: Array<[Vec2, Vec2]>;
  stroke: string;
  opacity: number;
  dashed?: boolean;
}) {
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });
  return (
    <g opacity={opacity}>
      {lines.map(([a, b], i) => {
        const A = to(a);
        const B = to(b);
        return (
          <line
            key={i}
            x1={A.x}
            y1={A.y}
            x2={B.x}
            y2={B.y}
            stroke={stroke}
            strokeWidth={1}
            strokeDasharray={dashed ? '4 3' : undefined}
          />
        );
      })}
    </g>
  );
}

function PlaneSvg({
  uid,
  M,
  x,
  showOriginalGrid,
  showTransformedGrid,
  showL,
  showBases,
  showX,
  editCols,
  onX,
  onCols,
}: {
  uid: string;
  M: Mat2;
  x: Vec2;
  showOriginalGrid: boolean;
  showTransformedGrid: boolean;
  showL: boolean;
  showBases: boolean;
  showX: boolean;
  editCols: boolean;
  onX: (p: Vec2) => void;
  onCols: (c1: Vec2, c2: Vec2) => void;
}) {
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });
  const { u: ae1, v: ae2 } = cols(M);
  const Ax = applyMat(M, x);
  const ghostL = L_SHAPE;
  const transformedL = transformPts(M, L_SHAPE);

  const dragX = useVecDrag((p) => onX(clampVec(p, CLAMP)), S, { x: ox, y: oy });
  const dragAe1 = useVecDrag(
    (p) => onCols(clampVec(p, CLAMP), ae2),
    S,
    { x: ox, y: oy },
  );
  const dragAe2 = useVecDrag(
    (p) => onCols(ae1, clampVec(p, CLAMP)),
    S,
    { x: ox, y: oy },
  );

  const px = to(x);
  const pAx = to(Ax);
  const pE1 = to(E1);
  const pE2 = to(E2);
  const pAe1 = to(ae1);
  const pAe2 = to(ae2);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full touch-none rounded-xl border border-[var(--border)]"
      role="img"
      aria-label="Transformación T(x)=Ax"
      onPointerMove={(e) => {
        dragX.onPointerMove(e);
        dragAe1.onPointerMove(e);
        dragAe2.onPointerMove(e);
      }}
      onPointerUp={() => {
        dragX.onPointerUp();
        dragAe1.onPointerUp();
        dragAe2.onPointerUp();
      }}
    >
      <defs>
        <ArrowMarker id={`${uid}-u`} color={COLOR_U} />
        <ArrowMarker id={`${uid}-v`} color={COLOR_V} />
        <ArrowMarker id={`${uid}-e`} color="var(--fg-muted)" />
        <ArrowMarker id={`${uid}-w`} color={COLOR_W} />
      </defs>

      <Axes W={W} H={H} ox={ox} oy={oy} S={S} xLabel="e₁" yLabel="e₂" />

      {showOriginalGrid ? (
        <GridLayer
          lines={gridLines(I2, 2.5, 11)}
          stroke="var(--fg-muted)"
          opacity={0.28}
          dashed
        />
      ) : null}
      {showTransformedGrid ? (
        <GridLayer
          lines={gridLines(M, 2.5, 11)}
          stroke="var(--accent-strong)"
          opacity={0.55}
        />
      ) : null}

      {showL ? (
        <>
          <polygon
            points={polyPoints(ghostL, to)}
            fill="none"
            stroke="var(--fg-muted)"
            strokeWidth={1.4}
            strokeDasharray="5 3"
            opacity={0.45}
          />
          <polygon
            points={polyPoints(transformedL, to)}
            fill="color-mix(in oklab, var(--accent-soft) 55%, transparent)"
            stroke="var(--accent-strong)"
            strokeWidth={2}
            opacity={0.9}
          />
        </>
      ) : null}

      {showBases ? (
        <>
          {/* original e1, e2 */}
          <line
            x1={ox}
            y1={oy}
            x2={pE1.x}
            y2={pE1.y}
            stroke="var(--fg-muted)"
            strokeWidth={1.6}
            strokeDasharray="4 3"
            markerEnd={`url(#${uid}-e)`}
            opacity={0.55}
          />
          <line
            x1={ox}
            y1={oy}
            x2={pE2.x}
            y2={pE2.y}
            stroke="var(--fg-muted)"
            strokeWidth={1.6}
            strokeDasharray="4 3"
            markerEnd={`url(#${uid}-e)`}
            opacity={0.55}
          />
          <text
            x={labelOffset(E1, pE1, ox, oy, 12).x}
            y={labelOffset(E1, pE1, ox, oy, 12).y}
            fontSize={11}
            fill="var(--fg-muted)"
            textAnchor="middle"
          >
            e₁
          </text>
          <text
            x={labelOffset(E2, pE2, ox, oy, 12).x}
            y={labelOffset(E2, pE2, ox, oy, 12).y}
            fontSize={11}
            fill="var(--fg-muted)"
            textAnchor="middle"
          >
            e₂
          </text>

          {/* Ae1, Ae2 = columns */}
          {!nearZero(ae1) ? (
            <line
              x1={ox}
              y1={oy}
              x2={pAe1.x}
              y2={pAe1.y}
              stroke={COLOR_U}
              strokeWidth={2.6}
              markerEnd={`url(#${uid}-u)`}
            />
          ) : null}
          {!nearZero(ae2) ? (
            <line
              x1={ox}
              y1={oy}
              x2={pAe2.x}
              y2={pAe2.y}
              stroke={COLOR_V}
              strokeWidth={2.6}
              markerEnd={`url(#${uid}-v)`}
            />
          ) : null}
          <text
            x={labelOffset(ae1, pAe1, ox, oy, 14).x}
            y={labelOffset(ae1, pAe1, ox, oy, 14).y}
            fontSize={12}
            fontWeight={700}
            fill={COLOR_U}
            textAnchor="middle"
          >
            Ae₁
          </text>
          <text
            x={labelOffset(ae2, pAe2, ox, oy, 14).x}
            y={labelOffset(ae2, pAe2, ox, oy, 14).y}
            fontSize={12}
            fontWeight={700}
            fill={COLOR_V}
            textAnchor="middle"
          >
            Ae₂
          </text>

          {editCols ? (
            <>
              <circle
                cx={pAe1.x}
                cy={pAe1.y}
                r={9}
                fill={COLOR_U}
                fillOpacity={0.2}
                stroke={COLOR_U}
                strokeWidth={1.2}
                style={{ cursor: 'grab' }}
                {...dragAe1}
              />
              <circle
                cx={pAe2.x}
                cy={pAe2.y}
                r={9}
                fill={COLOR_V}
                fillOpacity={0.2}
                stroke={COLOR_V}
                strokeWidth={1.2}
                style={{ cursor: 'grab' }}
                {...dragAe2}
              />
            </>
          ) : null}
        </>
      ) : null}

      {showX ? (
        <>
          {!nearZero(x) ? (
            <line
              x1={ox}
              y1={oy}
              x2={px.x}
              y2={px.y}
              stroke="var(--fg-muted)"
              strokeWidth={1.8}
              strokeDasharray="4 3"
              markerEnd={`url(#${uid}-e)`}
              opacity={0.7}
            />
          ) : null}
          {!nearZero(Ax) ? (
            <line
              x1={ox}
              y1={oy}
              x2={pAx.x}
              y2={pAx.y}
              stroke={COLOR_W}
              strokeWidth={2.8}
              markerEnd={`url(#${uid}-w)`}
            />
          ) : null}
          <circle cx={px.x} cy={px.y} r={4.5} fill="var(--fg-muted)" opacity={0.85} />
          <circle cx={pAx.x} cy={pAx.y} r={5.5} fill={COLOR_W} />
          <text
            x={labelOffset(x, px, ox, oy, 14).x}
            y={labelOffset(x, px, ox, oy, 14).y}
            fontSize={12}
            fill="var(--fg-muted)"
            textAnchor="middle"
          >
            x
          </text>
          <text
            x={labelOffset(Ax, pAx, ox, oy, 16).x}
            y={labelOffset(Ax, pAx, ox, oy, 16).y}
            fontSize={12}
            fontWeight={700}
            fill={COLOR_W}
            textAnchor="middle"
          >
            Ax
          </text>
          <circle
            cx={px.x}
            cy={px.y}
            r={10}
            fill="transparent"
            stroke="var(--fg-muted)"
            strokeWidth={1}
            strokeOpacity={0.35}
            style={{ cursor: 'grab' }}
            {...dragX}
          />
        </>
      ) : null}
    </svg>
  );
}

/**
 * Mapa matricial T(x)=Ax: cuadrícula original + transformada, columnas Ae₁/Ae₂ y vector Ax.
 */
export function MatrixMapViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [A, setA] = useState<Mat2>(() => cloneMat2(PRESET_GENERAL));
  const [x, setX] = useState<Vec2>({ x: 1.5, y: 1 });
  const [t, setT] = useState(1);
  const [tab, setTab] = useState<Tab>('geo');
  const [view, setView] = useState<View>('plane');
  const [display, setDisplay] = useState<Display>('overlay');
  const [editOpen, setEditOpen] = useState(false);
  const [editCols, setEditCols] = useState(false);
  const animRef = useRef<number | null>(null);

  const M = matLerp(A, t);
  const Ax = applyMat(M, x);
  const det = det2(A);
  const rank = rank2(A);

  useEffect(() => {
    return () => {
      if (animRef.current != null) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const stopAnim = () => {
    if (animRef.current != null) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
  };

  const animate = () => {
    stopAnim();
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setT(1);
      return;
    }
    const start = performance.now();
    const dur = 1100;
    const from = 0;
    setT(0);
    const tick = (now: number) => {
      const u = Math.min(1, (now - start) / dur);
      const eased = u * u * (3 - 2 * u);
      setT(from + (1 - from) * eased);
      if (u < 1) animRef.current = requestAnimationFrame(tick);
      else animRef.current = null;
    };
    animRef.current = requestAnimationFrame(tick);
  };

  const setPreset = (m: Mat2) => {
    stopAnim();
    setA(cloneMat2(m));
    setT(1);
  };

  const showL = view === 'plane';
  const showBases = view === 'plane' || view === 'base';
  const showX = view === 'plane' || view === 'vector';
  const showOrigGrid = view === 'plane' || view === 'base';
  const showTransGrid = view === 'plane' || view === 'base';

  const caption = joinCaption(
    describeAction(A),
    `det=${fmt(det)}`,
    `rango=${rank}`,
    `x=${formatPair(x)} → Ax=${formatPair(Ax)}`,
  );

  return (
    <VizPanel title="Mapa matricial T(x)=Ax" caption={caption}>
      <div className="space-y-3">
        <GuideBlock
          idea="Vas a ver que una matriz A empuja cada punto del plano: x → Ax."
          tryIt="Cambia el preset o arrastra x. Compara la cuadrícula original (tenue) con la transformada."
          concept="Las columnas de A son exactamente Ae₁ y Ae₂."
        />

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={[
              { id: 'geo', label: 'Geométrica' },
              { id: 'alg', label: 'Algebraica' },
            ]}
            value={tab}
            onChange={(id) => setTab(id as Tab)}
          />
          {tab === 'geo' ? (
            <>
              <Segmented
                options={[
                  { id: 'plane', label: 'Plano' },
                  { id: 'vector', label: 'Vector' },
                  { id: 'base', label: 'Base' },
                ]}
                value={view}
                onChange={(id) => setView(id as View)}
              />
              <Segmented
                options={[
                  { id: 'overlay', label: 'Superponer' },
                  { id: 'split', label: 'Antes/Después' },
                ]}
                value={display}
                onChange={(id) => setDisplay(id as Display)}
              />
            </>
          ) : null}
        </div>

        <ChipRow>
          {PRESETS.map((p) => (
            <Chip key={p.id} active={matEq(A, p.m)} onClick={() => setPreset(p.m)}>
              {p.label}
            </Chip>
          ))}
        </ChipRow>

        {tab === 'geo' ? (
          display === 'split' ? (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <div className="text-xs font-medium text-[var(--fg-muted)]">Antes (I)</div>
                <PlaneSvg
                  uid={`${uid}-before`}
                  M={I2}
                  x={x}
                  showOriginalGrid
                  showTransformedGrid={false}
                  showL={showL}
                  showBases={showBases}
                  showX={showX}
                  editCols={false}
                  onX={setX}
                  onCols={() => {}}
                />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-[var(--fg-muted)]">Después (A)</div>
                <PlaneSvg
                  uid={`${uid}-after`}
                  M={M}
                  x={x}
                  showOriginalGrid={false}
                  showTransformedGrid={showTransGrid}
                  showL={showL}
                  showBases={showBases}
                  showX={showX}
                  editCols={editCols && Math.abs(t - 1) < 1e-6}
                  onX={setX}
                  onCols={(c1, c2) => {
                    stopAnim();
                    setA(matFromCols(c1, c2));
                    setT(1);
                  }}
                />
              </div>
            </div>
          ) : (
            <PlaneSvg
              uid={uid}
              M={M}
              x={x}
              showOriginalGrid={showOrigGrid}
              showTransformedGrid={showTransGrid}
              showL={showL}
              showBases={showBases}
              showX={showX}
              editCols={editCols && Math.abs(t - 1) < 1e-6}
              onX={setX}
              onCols={(c1, c2) => {
                stopAnim();
                setA(matFromCols(c1, c2));
                setT(1);
              }}
            />
          )
        ) : (
          <div className="space-y-3 rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
            <div className="flex flex-wrap items-start gap-4">
              <Mat2Editor m={A} name="A" onChange={setA} labels={['Ae₁', 'Ae₂']} />
              <div className="space-y-1 text-xs leading-relaxed">
                <p>
                  x = {formatPair(x)}
                </p>
                <p>
                  Ax = A · x ={' '}
                  <span style={{ color: COLOR_W }} className="font-semibold">
                    {formatPair(applyMat(A, x))}
                  </span>
                </p>
                <p className="text-[var(--fg-muted)]">
                  ({present(A[0][0])})({present(x.x)}) + ({present(A[0][1])})({present(x.y)}) ={' '}
                  {present(applyMat(A, x).x)}
                  <br />
                  ({present(A[1][0])})({present(x.x)}) + ({present(A[1][1])})({present(x.y)}) ={' '}
                  {present(applyMat(A, x).y)}
                </p>
              </div>
            </div>
            <div className="border-t border-[var(--border)] pt-2 text-xs leading-relaxed">
              <p>
                Ae₁ = col₁(A) ={' '}
                <span style={{ color: COLOR_U }}>{formatPair(cols(A).u)}</span>
              </p>
              <p>
                Ae₂ = col₂(A) ={' '}
                <span style={{ color: COLOR_V }}>{formatPair(cols(A).v)}</span>
              </p>
              <p className="mt-1 text-[var(--fg-muted)]">
                Las columnas de A son las imágenes de la base canónica.
              </p>
            </div>
          </div>
        )}

        <ControlsStack>
          <SliderRow
            label="t"
            ariaLabel="Interpolación Original a A"
            value={t}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => {
              stopAnim();
              setT(v);
            }}
          />
          <p className="text-[11px] text-[var(--fg-muted)]">Original → A (t = {fmt(t)})</p>
          <ButtonRow>
            <VizButton onClick={animate}>Animar</VizButton>
            <VizButton
              active={editCols}
              onClick={() => {
                setEditCols((v) => !v);
                if (!editCols) setT(1);
              }}
            >
              Editar con vectores
            </VizButton>
          </ButtonRow>
          {editCols ? (
            <p className="text-xs text-[var(--fg-muted)]">
              Arrastra las puntas de Ae₁ y Ae₂ para editar las columnas de A (t = 1).
            </p>
          ) : null}
        </ControlsStack>

        <CollapsibleEdit
          label="Editar matriz A"
          open={editOpen}
          onToggle={() => setEditOpen((o) => !o)}
        >
          <Mat2Editor m={A} onChange={(m) => { stopAnim(); setA(m); setT(1); }} labels={['Ae₁', 'Ae₂']} />
        </CollapsibleEdit>

        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--fg-muted)]">
          <Badge tone={Math.abs(det) < DET_EPS ? 'bad' : 'ok'}>
            {Math.abs(det) < DET_EPS ? 'Singular' : 'Invertible'}
          </Badge>
          <span>
            det = {fmt(det)} · rango = {rank}
          </span>
        </div>
      </div>
    </VizPanel>
  );
}
