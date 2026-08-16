'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, VizButton, VizPanel, joinCaption } from './controls';
import { nullspaceBasis, presentLin, type Matrix } from './linAlg';
import { normalize, scale, type Mat2, type Vec2 } from './math2d';
import { present } from './matrixGrid';
import {
  Badge,
  Chip,
  ChipRow,
  CollapsibleEdit,
  DET_EPS,
  GuideBlock,
  Mat2Editor,
  PRESET_GENERAL,
  PRESET_PROJECT_X,
  PRESET_SINGULAR,
  PRESET_ZERO,
  Segmented,
  applyMat,
  cloneMat2,
  cols,
  formatPair,
  gridLines,
  matEq,
  matFromCols,
  nearZero,
  rank2,
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
const S = 38;
const CLAMP = 3.2;
const LINE_EXT = 4.2;

type Tab = 'geo' | 'alg';
type Mode = 'one' | 'full';

const PRESETS: Array<{ id: string; label: string; m: Mat2 }> = [
  { id: 'inv', label: 'Invertible', m: PRESET_GENERAL },
  { id: 'proj', label: 'Proyección', m: PRESET_PROJECT_X },
  { id: 'dep', label: 'Dependiente', m: PRESET_SINGULAR },
  { id: 'zero', label: 'Matriz cero', m: PRESET_ZERO },
];

function toMatrix(A: Mat2): Matrix {
  return [
    [A[0][0], A[0][1]],
    [A[1][0], A[1][1]],
  ];
}

function kerGenerators(A: Mat2): Vec2[] {
  const basis = nullspaceBasis(toMatrix(A));
  return basis.map((v) => ({ x: v[0] ?? 0, y: v[1] ?? 0 }));
}

function describeKer(nullity: number, gens: Vec2[]): string {
  if (nullity === 0) return 'ker(A) = {0}';
  if (nullity === 1 && gens[0]) {
    return `ker(A) = span{${formatPair(gens[0])}} (recta por el origen)`;
  }
  return 'ker(A) = ℝ² (todo el dominio)';
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

function KerFill({
  nullity,
  gens,
}: {
  nullity: number;
  gens: Vec2[];
}) {
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });
  if (nullity === 0) {
    return <circle cx={ox} cy={oy} r={7} fill={COLOR_W} opacity={0.9} />;
  }
  if (nullity >= 2) {
    return (
      <rect
        x={24}
        y={20}
        width={W - 48}
        height={H - 40}
        fill={COLOR_W}
        opacity={0.14}
        rx={8}
      />
    );
  }
  const n = normalize(gens[0] ?? { x: 0, y: 1 });
  const a = to(scale(n, -LINE_EXT));
  const b = to(scale(n, LINE_EXT));
  return (
    <line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke={COLOR_W}
      strokeWidth={10}
      opacity={0.22}
      strokeLinecap="round"
    />
  );
}

function DomainSvg({
  uid,
  A,
  x,
  mode,
  editCols,
  showGen,
  onX,
  onCols,
}: {
  uid: string;
  A: Mat2;
  x: Vec2;
  mode: Mode;
  editCols: boolean;
  showGen: boolean;
  onX: (p: Vec2) => void;
  onCols: (c1: Vec2, c2: Vec2) => void;
}) {
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });
  const gens = kerGenerators(A);
  const nullity = 2 - rank2(A);
  const Ax = applyMat(A, x);
  const inKer = nearZero(Ax);
  const { u: c1, v: c2 } = cols(A);

  const dragX = useVecDrag((p) => onX(clampVec(p, CLAMP)), S, { x: ox, y: oy });
  const dragC1 = useVecDrag((p) => onCols(clampVec(p, CLAMP), c2), S, { x: ox, y: oy });
  const dragC2 = useVecDrag((p) => onCols(c1, clampVec(p, CLAMP)), S, { x: ox, y: oy });

  const px = to(x);
  const pc1 = to(c1);
  const pc2 = to(c2);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full touch-none rounded-xl border border-[var(--border)]"
      role="img"
      aria-label="Dominio: núcleo de A"
      onPointerMove={(e) => {
        dragX.onPointerMove(e);
        dragC1.onPointerMove(e);
        dragC2.onPointerMove(e);
      }}
      onPointerUp={() => {
        dragX.onPointerUp();
        dragC1.onPointerUp();
        dragC2.onPointerUp();
      }}
    >
      <defs>
        <ArrowMarker id={`${uid}-w`} color={COLOR_W} />
        <ArrowMarker id={`${uid}-u`} color={COLOR_U} />
        <ArrowMarker id={`${uid}-v`} color={COLOR_V} />
      </defs>
      <Axes W={W} H={H} ox={ox} oy={oy} S={S} />
      <GridLayer lines={gridLines([[1, 0], [0, 1]], 2.5, 9)} stroke="var(--fg-muted)" opacity={0.22} dashed />
      {(mode === 'full' || inKer) && <KerFill nullity={nullity} gens={gens} />}

      {mode === 'full' && nullity === 1 && gens[0] ? (
        (() => {
          const n = normalize(gens[0]);
          const a = to(scale(n, -LINE_EXT));
          const b = to(scale(n, LINE_EXT));
          return (
            <line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={COLOR_W}
              strokeWidth={2.4}
              opacity={0.95}
            />
          );
        })()
      ) : null}

      {showGen && gens.map((g, i) => {
        if (nearZero(g)) return null;
        const tip = to(g);
        return (
          <g key={i}>
            <line
              x1={ox}
              y1={oy}
              x2={tip.x}
              y2={tip.y}
              stroke={COLOR_W}
              strokeWidth={2}
              markerEnd={`url(#${uid}-w)`}
              opacity={0.85}
            />
            <text
              x={labelOffset(g, tip, ox, oy, 14).x}
              y={labelOffset(g, tip, ox, oy, 14).y}
              fontSize={11}
              fontWeight={700}
              fill={COLOR_W}
              textAnchor="middle"
            >
              n{gens.length > 1 ? i + 1 : ''}
            </text>
          </g>
        );
      })}

      {editCols ? (
        <>
          {!nearZero(c1) ? (
            <line x1={ox} y1={oy} x2={pc1.x} y2={pc1.y} stroke={COLOR_U} strokeWidth={1.8} strokeDasharray="4 3" markerEnd={`url(#${uid}-u)`} opacity={0.55} />
          ) : null}
          {!nearZero(c2) ? (
            <line x1={ox} y1={oy} x2={pc2.x} y2={pc2.y} stroke={COLOR_V} strokeWidth={1.8} strokeDasharray="4 3" markerEnd={`url(#${uid}-v)`} opacity={0.55} />
          ) : null}
          <circle cx={pc1.x} cy={pc1.y} r={8} fill={COLOR_U} fillOpacity={0.15} stroke={COLOR_U} strokeWidth={1.2} style={{ cursor: 'grab' }} {...dragC1} />
          <circle cx={pc2.x} cy={pc2.y} r={8} fill={COLOR_V} fillOpacity={0.15} stroke={COLOR_V} strokeWidth={1.2} style={{ cursor: 'grab' }} {...dragC2} />
        </>
      ) : null}

      <>
        {!nearZero(x) ? (
          <line
            x1={ox}
            y1={oy}
            x2={px.x}
            y2={px.y}
            stroke={inKer ? COLOR_W : 'var(--fg)'}
            strokeWidth={2.6}
            markerEnd={`url(#${uid}-w)`}
          />
        ) : null}
        <circle cx={px.x} cy={px.y} r={5.5} fill={inKer ? COLOR_W : 'var(--fg)'} />
        <text
          x={labelOffset(x, px, ox, oy, 14).x}
          y={labelOffset(x, px, ox, oy, 14).y}
          fontSize={12}
          fontWeight={700}
          fill={inKer ? COLOR_W : 'var(--fg)'}
          textAnchor="middle"
        >
          x
        </text>
        <circle
          cx={px.x}
          cy={px.y}
          r={11}
          fill="transparent"
          stroke={COLOR_W}
          strokeWidth={1}
          strokeOpacity={0.35}
          style={{ cursor: 'grab' }}
          {...dragX}
        />
      </>
    </svg>
  );
}

function CodomainSvg({
  uid,
  A,
  x,
}: {
  uid: string;
  A: Mat2;
  x: Vec2;
}) {
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });
  const Ax = applyMat(A, x);
  const inKer = nearZero(Ax);
  const pAx = to(Ax);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full touch-none rounded-xl border border-[var(--border)]"
      role="img"
      aria-label="Codominio: Ax"
    >
      <defs>
        <ArrowMarker id={`${uid}-w`} color={COLOR_W} />
      </defs>
      <Axes W={W} H={H} ox={ox} oy={oy} S={S} />
      <GridLayer lines={gridLines([[1, 0], [0, 1]], 2.5, 9)} stroke="var(--fg-muted)" opacity={0.22} dashed />
      {/* Target: origin */}
      <circle cx={ox} cy={oy} r={10} fill={COLOR_W} opacity={0.18} />
      <circle cx={ox} cy={oy} r={4.5} fill={COLOR_W} />
      <text x={ox + 14} y={oy - 10} fontSize={11} fill={COLOR_W} fontWeight={600}>
        0
      </text>
      {!nearZero(Ax) ? (
        <line
          x1={ox}
          y1={oy}
          x2={pAx.x}
          y2={pAx.y}
          stroke={COLOR_W}
          strokeWidth={2.6}
          markerEnd={`url(#${uid}-w)`}
        />
      ) : null}
      <circle cx={pAx.x} cy={pAx.y} r={5.5} fill={COLOR_W} />
      <text
        x={labelOffset(Ax, pAx, ox, oy, 14).x}
        y={labelOffset(Ax, pAx, ox, oy, 14).y}
        fontSize={12}
        fontWeight={700}
        fill={COLOR_W}
        textAnchor="middle"
      >
        Ax
      </text>
      {inKer ? (
        <text x={ox} y={H - 18} textAnchor="middle" fontSize={12} fontWeight={700} fill={COLOR_W}>
          Ax ≈ 0 → x ∈ ker ✓
        </text>
      ) : (
        <text x={ox} y={H - 18} textAnchor="middle" fontSize={11} fill="var(--fg-muted)">
          Objetivo: llevar Ax al origen
        </text>
      )}
    </svg>
  );
}

/**
 * ker(A) = {x : Ax = 0} vive en el dominio. ¿Qué entradas desaparecen?
 */
export function KernelViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [A, setA] = useState<Mat2>(() => cloneMat2(PRESET_PROJECT_X));
  const [x, setX] = useState<Vec2>({ x: 0, y: 1.5 });
  const [mode, setMode] = useState<Mode>('one');
  const [tab, setTab] = useState<Tab>('geo');
  const [editOpen, setEditOpen] = useState(false);
  const [editCols, setEditCols] = useState(false);
  const [showGen, setShowGen] = useState(true);

  const rank = rank2(A);
  const nullity = (2 - rank) as 0 | 1 | 2;
  const gens = useMemo(() => kerGenerators(A), [A]);
  const Ax = applyMat(A, x);
  const inKer = nearZero(Ax);

  const setPreset = (m: Mat2) => {
    setA(cloneMat2(m));
    if (matEq(m, PRESET_PROJECT_X)) setX({ x: 0, y: 1.5 });
    else if (matEq(m, PRESET_ZERO)) setX({ x: 1.2, y: 0.8 });
    else if (matEq(m, PRESET_SINGULAR)) setX({ x: 2, y: -1 });
    else setX({ x: 1, y: 0.6 });
  };

  const eqRows = [
    `${present(A[0][0])} x₁ + ${present(A[0][1])} x₂ = 0`,
    `${present(A[1][0])} x₁ + ${present(A[1][1])} x₂ = 0`,
  ];

  const spanText =
    nullity === 0
      ? 'ker(A) = {0}'
      : nullity === 1 && gens[0]
        ? `ker(A) = { t · ${formatPair(gens[0])} : t ∈ ℝ }`
        : 'ker(A) = span{e₁, e₂} = ℝ²';

  const caption = joinCaption(
    describeKer(nullity, gens),
    `Nulidad = ${nullity}`,
    `rank + nullity = ${rank} + ${nullity} = 2`,
  );

  return (
    <VizPanel title="Núcleo ker(A)" caption={caption}>
      <div className="space-y-3">
        <GuideBlock
          idea="El núcleo son los vectores del dominio que A manda al cero: ker(A) = {x : Ax = 0}."
          tryIt="Mueve x hasta que Ax ≈ 0, o cambia a «Ver núcleo completo» para ver el subespacio entero."
          concept="Siempre hay al menos el origen: ker(A) ⊇ {0}."
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
              { id: 'one', label: 'Un vector' },
              { id: 'full', label: 'Ver núcleo completo' },
            ]}
            value={mode}
            onChange={(id) => setMode(id as Mode)}
          />
        </div>

        <ChipRow>
          {PRESETS.map((p) => (
            <Chip key={p.id} active={matEq(A, p.m)} onClick={() => setPreset(p.m)}>
              {p.label}
            </Chip>
          ))}
        </ChipRow>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={inKer ? 'ok' : 'neutral'}>
            {inKer ? 'x ∈ ker ✓' : 'x ∉ ker'}
          </Badge>
          <Badge tone="warn">Nulidad = {nullity}</Badge>
          <span className="text-xs text-[var(--fg-muted)]">
            rank + nullity = {rank} + {nullity} = 2
          </span>
        </div>

        {tab === 'geo' ? (
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="text-xs font-medium text-[var(--fg-muted)]">Dominio (ker vive aquí)</div>
              <DomainSvg
                uid={`${uid}-dom`}
                A={A}
                x={x}
                mode={mode}
                editCols={editCols}
                showGen={showGen && mode === 'full'}
                onX={setX}
                onCols={(c1, c2) => setA(matFromCols(c1, c2))}
              />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="text-xs font-medium text-[var(--fg-muted)]">Codominio (Ax → 0)</div>
              <CodomainSvg uid={`${uid}-cod`} A={A} x={x} />
            </div>
          </div>
        ) : (
          <div className="space-y-3 rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
            <p className="text-xs text-[var(--fg-muted)]">Sistema Ax = 0</p>
            {eqRows.map((eq) => (
              <p key={eq}>{eq}</p>
            ))}
            <div className="border-t border-[var(--border)] pt-2 text-xs leading-relaxed">
              <p className="font-semibold text-[var(--fg)]" style={{ color: 'orange' }}>
                {spanText}
              </p>
              {gens.map((g, i) => (
                <p key={i} className="mt-1 text-[var(--fg-muted)]">
                  Generador{gens.length > 1 ? ` n${i + 1}` : ''}: {formatPair(g)}
                  {g.x !== 0 || g.y !== 0
                    ? ` · (coords ≈ ${presentLin(g.x)}, ${presentLin(g.y)})`
                    : ''}
                </p>
              ))}
              {nullity === 0 ? (
                <p className="mt-1 text-[var(--fg-muted)]">
                  Solo la solución trivial: x = 0.
                </p>
              ) : null}
            </div>
          </div>
        )}

        <ControlsStack>
          <ButtonRow>
            <VizButton
              active={editCols}
              onClick={() => setEditCols((v) => !v)}
            >
              Arrastrar columnas
            </VizButton>
            <VizButton
              active={showGen}
              onClick={() => setShowGen((v) => !v)}
            >
              Mostrar generador n
            </VizButton>
            {nullity === 1 && gens[0] ? (
              <VizButton
                onClick={() => {
                  setMode('one');
                  setX(clampVec(scale(normalize(gens[0]!), 1.5), CLAMP));
                }}
              >
                Colocar x en ker
              </VizButton>
            ) : null}
            {nullity === 2 ? (
              <VizButton
                onClick={() => {
                  setMode('one');
                  setX({ x: 1.2, y: 0.9 });
                }}
              >
                Cualquier x ∈ ker
              </VizButton>
            ) : null}
            {nullity === 0 ? (
              <VizButton
                onClick={() => {
                  setMode('one');
                  setX({ x: 0, y: 0 });
                }}
              >
                Ir al origen
              </VizButton>
            ) : null}
          </ButtonRow>
          <p className="text-xs text-[var(--fg-muted)]">
            x = {formatPair(x)} → Ax = {formatPair(Ax)}
            {inKer ? ' · x ∈ ker ✓' : ''}
          </p>
        </ControlsStack>

        <CollapsibleEdit
          label="Editar matriz A"
          open={editOpen}
          onToggle={() => setEditOpen((o) => !o)}
        >
          <Mat2Editor m={A} onChange={setA} labels={['col₁', 'col₂']} />
        </CollapsibleEdit>
      </div>
    </VizPanel>
  );
}
