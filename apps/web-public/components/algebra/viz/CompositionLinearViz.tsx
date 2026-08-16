'use client';

import { useId, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  ToggleRow,
  VizButton,
  VizPanel,
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
  PRESET_REFLECT_X,
  PRESET_ROT45,
  PRESET_ROT90,
  PRESET_SCALE_2,
  PRESET_SHEAR,
  Segmented,
  applyMat,
  cloneMat2,
  det2,
  formatPair,
  gridLines,
  inv2,
  matEq,
  matMul,
  polyPoints,
  transformPts,
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
  labelOffset,
} from './vectorPlane';

const W = VEC_W;
const H = VEC_H;
const ox = W / 2;
const oy = H / 2;
const S = 36;

const P0: Vec2 = { x: 2, y: 1 };

const PRESET_DIAG_A: Mat2 = [
  [2, 0],
  [0, 0.5],
];

const PRESET_DIAG_B: Mat2 = [
  [0.5, 0],
  [0, 2],
];

type Tab = 'geo' | 'alg';
/** Order of application: first then second. A→B means BA as product. */
type Order = 'AB' | 'BA';
type Phase = 'original' | 'afterFirst' | 'afterBoth';

type PairPreset = {
  id: string;
  label: string;
  a: Mat2;
  b: Mat2 | 'inv';
};

const PAIR_PRESETS: PairPreset[] = [
  { id: 'shear-rot', label: 'Shear+rotación', a: PRESET_SHEAR, b: PRESET_ROT90 },
  { id: 'scale-rot', label: 'Escala+rotación', a: PRESET_SCALE_2, b: PRESET_ROT90 },
  { id: 'two-rot', label: 'Dos rotaciones', a: PRESET_ROT45, b: PRESET_ROT90 },
  { id: 'reflect-scale', label: 'Reflexión+escala', a: PRESET_REFLECT_X, b: PRESET_SCALE_2 },
  { id: 'inv', label: 'Inversa', a: PRESET_SHEAR, b: 'inv' },
  { id: 'commute', label: 'Conmutan', a: PRESET_DIAG_A, b: PRESET_DIAG_B },
];

function phaseLabel(phase: Phase, order: Order): string {
  if (phase === 'original') return 'Original';
  if (phase === 'afterFirst') {
    return order === 'AB' ? 'Después de A' : 'Después de B';
  }
  return order === 'AB' ? 'Después de B∘A' : 'Después de A∘B';
}

function phaseTone(phase: Phase): 'neutral' | 'warn' | 'ok' {
  if (phase === 'original') return 'neutral';
  if (phase === 'afterFirst') return 'warn';
  return 'ok';
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
        const A0 = to(a);
        const B0 = to(b);
        return (
          <line
            key={i}
            x1={A0.x}
            y1={A0.y}
            x2={B0.x}
            y2={B0.y}
            stroke={stroke}
            strokeWidth={1}
            strokeDasharray={dashed ? '4 3' : undefined}
          />
        );
      })}
    </g>
  );
}

/**
 * Composición de transformaciones lineales: x → Ax → B(Ax) = (BA)x.
 * El orden importa: BA ≠ AB en general.
 */
export function CompositionLinearViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [A, setA] = useState<Mat2>(() => cloneMat2(PRESET_SHEAR));
  const [B, setB] = useState<Mat2>(() => cloneMat2(PRESET_ROT90));
  const [p] = useState<Vec2>(P0);
  const [order, setOrder] = useState<Order>('AB');
  const [phase, setPhase] = useState<Phase>('original');
  const [tab, setTab] = useState<Tab>('geo');
  const [showTrail, setShowTrail] = useState(true);
  const [editA, setEditA] = useState(false);
  const [editB, setEditB] = useState(false);
  const [activePreset, setActivePreset] = useState('shear-rot');

  // First applied / second applied according to order control
  const first = order === 'AB' ? A : B;
  const second = order === 'AB' ? B : A;
  const firstName = order === 'AB' ? 'A' : 'B';
  const secondName = order === 'AB' ? 'B' : 'A';
  const composeLabel = order === 'AB' ? 'B∘A' : 'A∘B';
  const productLabel = order === 'AB' ? 'BA' : 'AB';
  const product = order === 'AB' ? matMul(B, A) : matMul(A, B);
  const otherProduct = order === 'AB' ? matMul(A, B) : matMul(B, A);
  const commute = matEq(product, otherProduct);

  const M =
    phase === 'original' ? I2 : phase === 'afterFirst' ? first : product;

  const pOrig = p;
  const pAfterFirst = applyMat(first, p);
  const pFinal = applyMat(product, p);
  const pNow = applyMat(M, p);
  const pViaSteps = applyMat(second, pAfterFirst);
  const stepsMatch = vecEq(pViaSteps, pFinal);

  const shapeNow = transformPts(M, L_SHAPE);
  const shapeOrig = L_SHAPE;
  const shapeMid = transformPts(first, L_SHAPE);

  const to = (v: Vec2) => ({ x: ox + v.x * S, y: oy - v.y * S });
  const tipNow = to(pNow);
  const tipOrig = to(pOrig);
  const tipMid = to(pAfterFirst);

  const reset = (nextA?: Mat2, nextB?: Mat2) => {
    if (nextA) setA(cloneMat2(nextA));
    if (nextB) setB(cloneMat2(nextB));
    setPhase('original');
  };

  const applyPreset = (pr: PairPreset) => {
    setActivePreset(pr.id);
    if (pr.b === 'inv') {
      const inv = inv2(pr.a);
      if (!inv || Math.abs(det2(pr.a)) < DET_EPS) return;
      reset(pr.a, inv);
      return;
    }
    reset(pr.a, pr.b);
  };

  const applyFirst = () => {
    if (phase !== 'original') return;
    setPhase('afterFirst');
  };

  const applySecond = () => {
    if (phase !== 'afterFirst') return;
    setPhase('afterBoth');
  };

  const compareProduct = () => {
    setPhase('afterBoth');
  };

  const changeOrder = (next: Order) => {
    setOrder(next);
    setPhase('original');
  };

  const footerMain = stepsMatch
    ? `${secondName}(${firstName}p)=(${productLabel})p ✓`
    : `${composeLabel}: los caminos no coinciden`;

  const caption = joinCaption(
    composeLabel,
    productLabel,
    commute ? 'BA = AB (conmutan)' : `${productLabel} ≠ ${order === 'AB' ? 'AB' : 'BA'}`,
    footerMain,
  );

  return (
    <VizPanel title="Composición lineal" caption={caption}>
      <div className="space-y-3">
        <GuideBlock
          idea="Vas a ver que componer transformaciones es aplicar una después de la otra: x → Ax → B(Ax)."
          tryIt="Aplica A, luego B. Compara con BA en un solo paso. Cambia el orden A→B / B→A."
          concept="El orden importa: B∘A significa A primero y B después."
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
          <Segmented
            options={[
              { id: 'original', label: 'Original' },
              {
                id: 'afterFirst',
                label: order === 'AB' ? 'Después de A' : 'Después de B',
              },
              {
                id: 'afterBoth',
                label: order === 'AB' ? 'Después de B∘A' : 'Después de A∘B',
              },
            ]}
            value={phase}
            onChange={(id) => setPhase(id as Phase)}
          />
          <Badge tone={phaseTone(phase)}>ESTADO: {phaseLabel(phase, order)}</Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--fg-muted)]">Orden:</span>
          <Segmented
            options={[
              { id: 'AB', label: 'A → B' },
              { id: 'BA', label: 'B → A' },
            ]}
            value={order}
            onChange={(id) => changeOrder(id as Order)}
          />
        </div>

        <ChipRow>
          {PAIR_PRESETS.map((pr) => {
            const disabled =
              pr.b === 'inv' &&
              (Math.abs(det2(pr.a)) < DET_EPS || inv2(pr.a) == null);
            return (
              <Chip
                key={pr.id}
                active={activePreset === pr.id}
                disabled={disabled}
                onClick={() => applyPreset(pr)}
              >
                {pr.label}
              </Chip>
            );
          })}
        </ChipRow>

        {tab === 'geo' ? (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full rounded-xl border border-[var(--border)]"
            role="img"
            aria-label={`Composición ${composeLabel}`}
          >
            <defs>
              <ArrowMarker id={`${uid}-u`} color={COLOR_U} />
              <ArrowMarker id={`${uid}-v`} color={COLOR_V} />
              <ArrowMarker id={`${uid}-w`} color={COLOR_W} />
              <ArrowMarker id={`${uid}-g`} color="var(--fg-muted)" />
            </defs>
            <Axes W={W} H={H} ox={ox} oy={oy} S={S} xLabel="e₁" yLabel="e₂" />

            <GridLayer
              lines={gridLines(I2, 2.5, 9)}
              stroke="var(--fg-muted)"
              opacity={0.28}
              dashed
            />
            <GridLayer
              lines={gridLines(M, 2.5, 9)}
              stroke="var(--accent-strong)"
              opacity={0.5}
            />

            {showTrail && phase !== 'original' ? (
              <polygon
                points={polyPoints(shapeOrig, to)}
                fill="none"
                stroke="var(--fg-muted)"
                strokeWidth={1.3}
                strokeDasharray="5 3"
                opacity={0.45}
              />
            ) : null}

            {showTrail && phase === 'afterBoth' ? (
              <polygon
                points={polyPoints(shapeMid, to)}
                fill="none"
                stroke={COLOR_U}
                strokeWidth={1.4}
                strokeDasharray="4 3"
                opacity={0.55}
              />
            ) : null}

            <polygon
              points={polyPoints(shapeNow, to)}
              fill="color-mix(in oklab, var(--accent-soft) 50%, transparent)"
              stroke="var(--accent-strong)"
              strokeWidth={2.2}
            />

            {showTrail && phase !== 'original' ? (
              <>
                <circle cx={tipOrig.x} cy={tipOrig.y} r={4} fill="var(--fg-muted)" opacity={0.5} />
                <text
                  x={labelOffset(pOrig, tipOrig, ox, oy, 12).x}
                  y={labelOffset(pOrig, tipOrig, ox, oy, 12).y}
                  fontSize={11}
                  fill="var(--fg-muted)"
                  textAnchor="middle"
                >
                  p
                </text>
              </>
            ) : null}

            {showTrail && phase === 'afterBoth' ? (
              <>
                <circle cx={tipMid.x} cy={tipMid.y} r={4} fill={COLOR_U} opacity={0.65} />
                <text
                  x={labelOffset(pAfterFirst, tipMid, ox, oy, 12).x}
                  y={labelOffset(pAfterFirst, tipMid, ox, oy, 12).y}
                  fontSize={11}
                  fill={COLOR_U}
                  textAnchor="middle"
                >
                  {firstName}p
                </text>
              </>
            ) : null}

            <line
              x1={ox}
              y1={oy}
              x2={tipNow.x}
              y2={tipNow.y}
              stroke={COLOR_W}
              strokeWidth={2.6}
              markerEnd={`url(#${uid}-w)`}
            />
            <circle cx={tipNow.x} cy={tipNow.y} r={5.5} fill={COLOR_W} />
            <text
              x={labelOffset(pNow, tipNow, ox, oy, 14).x}
              y={labelOffset(pNow, tipNow, ox, oy, 14).y}
              fontSize={12}
              fontWeight={700}
              fill={COLOR_W}
              textAnchor="middle"
            >
              {phase === 'original'
                ? 'p'
                : phase === 'afterFirst'
                  ? `${firstName}p`
                  : `${secondName}(${firstName}p)`}
            </text>
          </svg>
        ) : (
          <div className="space-y-3 rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
            <div className="flex flex-wrap items-start gap-4">
              <Mat2Editor m={A} name="A" readOnly />
              <Mat2Editor m={B} name="B" readOnly />
              <Mat2Editor m={product} name={productLabel} readOnly />
            </div>
            <div className="border-t border-[var(--border)] pt-2 text-xs leading-relaxed">
              <p>
                p = {formatPair(pOrig)} → {firstName}p = {formatPair(pAfterFirst)} →{' '}
                {secondName}({firstName}p) ={' '}
                <span style={{ color: COLOR_W }} className="font-semibold">
                  {formatPair(pViaSteps)}
                </span>
              </p>
              <p>
                ({productLabel})p ={' '}
                <span style={{ color: COLOR_W }} className="font-semibold">
                  {formatPair(pFinal)}
                </span>{' '}
                {stepsMatch ? (
                  <Badge tone="ok">
                    {secondName}({firstName}p)=({productLabel})p ✓
                  </Badge>
                ) : (
                  <Badge tone="bad">no coinciden</Badge>
                )}
              </p>
              <p className="mt-1 text-[var(--fg-muted)]">
                {commute ? (
                  <>
                    BA = AB en este caso (conmutan).
                  </>
                ) : (
                  <>
                    {productLabel} ≠ {order === 'AB' ? 'AB' : 'BA'} en general — el orden importa.
                  </>
                )}
              </p>
              <p className="text-[var(--fg-muted)]">
                ({present(product[0][0])})({present(p.x)}) + ({present(product[0][1])})(
                {present(p.y)}) = {present(pFinal.x)}
                <br />
                ({present(product[1][0])})({present(p.x)}) + ({present(product[1][1])})(
                {present(p.y)}) = {present(pFinal.y)}
              </p>
            </div>
          </div>
        )}

        <ButtonRow>
          <VizButton onClick={applyFirst}>Aplicar {firstName}</VizButton>
          <button
            type="button"
            disabled={phase !== 'afterFirst'}
            title={
              phase !== 'afterFirst'
                ? `Primero aplica ${firstName}`
                : `Aplicar ${secondName}`
            }
            onClick={applySecond}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
              phase === 'afterFirst'
                ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                : 'border-[var(--border)] bg-[var(--bg)] text-[var(--fg)] hover:bg-[var(--accent-soft)] disabled:hover:bg-[var(--bg)]'
            }`}
          >
            Aplicar {secondName}
          </button>
          <VizButton onClick={compareProduct}>
            Comparar con {productLabel}
          </VizButton>
          <VizButton onClick={() => reset()}>Restablecer</VizButton>
        </ButtonRow>

        <ControlsStack>
          <ToggleRow
            label="Mostrar trayectoria"
            checked={showTrail}
            onChange={setShowTrail}
          />
        </ControlsStack>

        <div className="rounded-lg border border-[var(--border)] px-3 py-2">
          <p className="mb-2 text-xs font-medium text-[var(--fg-muted)]">
            Matriz equivalente ({productLabel})
          </p>
          <Mat2Editor m={product} name={productLabel} readOnly />
        </div>

        <CollapsibleEdit
          label="Editar matriz A"
          open={editA}
          onToggle={() => setEditA((o) => !o)}
        >
          <Mat2Editor
            m={A}
            name="A"
            onChange={(m) => {
              setActivePreset('');
              reset(m, B);
            }}
          />
        </CollapsibleEdit>

        <CollapsibleEdit
          label="Editar matriz B"
          open={editB}
          onToggle={() => setEditB((o) => !o)}
        >
          <Mat2Editor
            m={B}
            name="B"
            onChange={(m) => {
              setActivePreset('');
              reset(A, m);
            }}
          />
        </CollapsibleEdit>

        <p className="text-sm leading-relaxed text-[var(--fg)]">{footerMain}</p>
        <p className="text-xs text-[var(--fg-muted)]">
          {composeLabel} · {productLabel}
          {commute ? ' · conmutan' : ` · ${productLabel} ≠ ${order === 'AB' ? 'AB' : 'BA'}`}
        </p>
      </div>
    </VizPanel>
  );
}
