'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, ToggleRow, VizButton, VizPanel, joinCaption } from './controls';
import { dot, inv2, linspace, normalize, project, scale, type Mat2, type Vec2 } from './math2d';
import { present } from './matrixGrid';
import {
  Badge,
  Chip,
  ChipRow,
  CollapsibleEdit,
  DET_EPS,
  GuideBlock,
  I2,
  Mat2Editor,
  PRESET_PROJECT_X,
  PRESET_ROT45,
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
type Mode = 'one' | 'many' | 'all';

const PRESETS: Array<{ id: string; label: string; m: Mat2 }> = [
  { id: 'full', label: 'Plano completo', m: I2 },
  { id: 'line', label: 'Recta', m: PRESET_SINGULAR },
  { id: 'origin', label: 'Solo origen', m: PRESET_ZERO },
  { id: 'proj', label: 'Proyección', m: PRESET_PROJECT_X },
  { id: 'rot', label: 'Rotación', m: PRESET_ROT45 },
];

function describeImage(rank: number, ae1: Vec2, ae2: Vec2): string {
  if (rank === 0) return 'Im(A) = {0}';
  if (rank === 1) {
    const dir = !nearZero(ae1) ? ae1 : ae2;
    return `Im(A) = span{${formatPair(dir)}} (recta por el origen)`;
  }
  return 'Im(A) = ℝ² (plano completo)';
}

function sampleGrid(n = 5, extent = 2): Vec2[] {
  const vals = linspace(-extent, extent, n);
  const pts: Vec2[] = [];
  for (const x of vals) {
    for (const y of vals) pts.push({ x, y });
  }
  return pts;
}

function reachableInfo(A: Mat2, y: Vec2): { ok: boolean; note: string; xHat: Vec2 | null } {
  const r = rank2(A);
  if (r === 2) {
    const Ainv = inv2(A);
    if (!Ainv) return { ok: false, note: 'No se pudo invertir A.', xHat: null };
    const xHat = applyMat(Ainv, y);
    return { ok: true, note: `Alcanzable: x = A⁻¹y = ${formatPair(xHat)}`, xHat };
  }
  if (r === 0) {
    const ok = nearZero(y);
    return {
      ok,
      note: ok ? 'Solo el origen es alcanzable.' : 'Im(A) = {0}: y no es el origen.',
      xHat: ok ? { x: 0, y: 0 } : null,
    };
  }
  const { u: ae1, v: ae2 } = cols(A);
  const dir = !nearZero(ae1) ? ae1 : ae2;
  const projY = project(y, dir);
  const residual = Math.hypot(y.x - projY.x, y.y - projY.y);
  const ok = residual < 1e-3;
  let xHat: Vec2 | null = null;
  if (ok) {
    const a2 = dot(ae1, ae1);
    const b2 = dot(ae2, ae2);
    if (a2 > DET_EPS) {
      xHat = { x: dot(projY, ae1) / a2, y: 0 };
    } else if (b2 > DET_EPS) {
      xHat = { x: 0, y: dot(projY, ae2) / b2 };
    }
  }
  return {
    ok,
    note: ok
      ? `y está en la recta imagen${xHat ? ` · una preimagen ≈ ${formatPair(xHat)}` : ''}`
      : `y no está en Im(A); proyección = ${formatPair(projY)}`,
    xHat: ok ? xHat : null,
  };
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

function ImageFill({ rank, ae1, ae2 }: { rank: number; ae1: Vec2; ae2: Vec2 }) {
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });
  if (rank === 0) {
    return <circle cx={ox} cy={oy} r={7} fill={COLOR_W} opacity={0.9} />;
  }
  if (rank === 2) {
    return (
      <rect
        x={24}
        y={20}
        width={W - 48}
        height={H - 40}
        fill={COLOR_W}
        opacity={0.12}
        rx={8}
      />
    );
  }
  const dir = normalize(!nearZero(ae1) ? ae1 : ae2);
  const a = to(scale(dir, -LINE_EXT));
  const b = to(scale(dir, LINE_EXT));
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
  x,
  mode,
  samples,
  onX,
}: {
  uid: string;
  x: Vec2;
  mode: Mode;
  samples: Vec2[];
  onX: (p: Vec2) => void;
}) {
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });
  const dragX = useVecDrag((p) => onX(clampVec(p, CLAMP)), S, { x: ox, y: oy });
  const px = to(x);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full touch-none rounded-xl border border-[var(--border)]"
      role="img"
      aria-label="Dominio"
      onPointerMove={dragX.onPointerMove}
      onPointerUp={dragX.onPointerUp}
    >
      <defs>
        <ArrowMarker id={`${uid}-w`} color={COLOR_W} />
      </defs>
      <Axes W={W} H={H} ox={ox} oy={oy} S={S} />
      <GridLayer lines={gridLines(I2, 2.5, 9)} stroke="var(--fg-muted)" opacity={0.22} dashed />

      {mode === 'many' || mode === 'all'
        ? samples.map((p, i) => {
            const q = to(p);
            return <circle key={i} cx={q.x} cy={q.y} r={3} fill="var(--fg-muted)" opacity={0.55} />;
          })
        : null}

      {mode === 'one' || mode === 'many' ? (
        <>
          {!nearZero(x) ? (
            <line
              x1={ox}
              y1={oy}
              x2={px.x}
              y2={px.y}
              stroke={COLOR_W}
              strokeWidth={2.4}
              markerEnd={`url(#${uid}-w)`}
            />
          ) : null}
          <circle cx={px.x} cy={px.y} r={5.5} fill={COLOR_W} />
          <text
            x={labelOffset(x, px, ox, oy, 14).x}
            y={labelOffset(x, px, ox, oy, 14).y}
            fontSize={12}
            fontWeight={700}
            fill={COLOR_W}
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
      ) : null}
    </svg>
  );
}

function CodomainSvg({
  uid,
  A,
  x,
  mode,
  samples,
  editCols,
  probe,
  probeY,
  onCols,
  onProbeY,
}: {
  uid: string;
  A: Mat2;
  x: Vec2;
  mode: Mode;
  samples: Vec2[];
  editCols: boolean;
  probe: boolean;
  probeY: Vec2;
  onCols: (c1: Vec2, c2: Vec2) => void;
  onProbeY: (p: Vec2) => void;
}) {
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });
  const { u: ae1, v: ae2 } = cols(A);
  const Ax = applyMat(A, x);
  const rank = rank2(A);
  const pAe1 = to(ae1);
  const pAe2 = to(ae2);
  const pAx = to(Ax);
  const pY = to(probeY);

  const dragAe1 = useVecDrag((p) => onCols(clampVec(p, CLAMP), ae2), S, { x: ox, y: oy });
  const dragAe2 = useVecDrag((p) => onCols(ae1, clampVec(p, CLAMP)), S, { x: ox, y: oy });
  const dragY = useVecDrag((p) => onProbeY(clampVec(p, CLAMP)), S, { x: ox, y: oy });

  const reach = probe ? reachableInfo(A, probeY) : null;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full touch-none rounded-xl border border-[var(--border)]"
      role="img"
      aria-label="Codominio e imagen"
      onPointerMove={(e) => {
        dragAe1.onPointerMove(e);
        dragAe2.onPointerMove(e);
        dragY.onPointerMove(e);
      }}
      onPointerUp={() => {
        dragAe1.onPointerUp();
        dragAe2.onPointerUp();
        dragY.onPointerUp();
      }}
    >
      <defs>
        <ArrowMarker id={`${uid}-u`} color={COLOR_U} />
        <ArrowMarker id={`${uid}-v`} color={COLOR_V} />
        <ArrowMarker id={`${uid}-w`} color={COLOR_W} />
        <ArrowMarker id={`${uid}-y`} color="var(--fg)" />
      </defs>
      <Axes W={W} H={H} ox={ox} oy={oy} S={S} />
      {/* Codomain R² always drawn */}
      <GridLayer lines={gridLines(I2, 2.5, 9)} stroke="var(--fg-muted)" opacity={0.18} dashed />
      <text x={28} y={28} fontSize={10} fill="var(--fg-muted)">
        Codominio = ℝ²
      </text>

      {(mode === 'all' || mode === 'many') && <ImageFill rank={rank} ae1={ae1} ae2={ae2} />}

      {mode === 'all' ? (
        <GridLayer lines={gridLines(A, 2.5, 9)} stroke={COLOR_W} opacity={0.45} />
      ) : null}

      {mode === 'many'
        ? samples.map((p, i) => {
            const q = to(applyMat(A, p));
            return <circle key={i} cx={q.x} cy={q.y} r={3.5} fill={COLOR_W} opacity={0.7} />;
          })
        : null}

      {/* Columns Ae1, Ae2 */}
      {!nearZero(ae1) ? (
        <line
          x1={ox}
          y1={oy}
          x2={pAe1.x}
          y2={pAe1.y}
          stroke={COLOR_U}
          strokeWidth={2.4}
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
          strokeWidth={2.4}
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

      {(mode === 'one' || mode === 'many') && (
        <>
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
          <circle cx={pAx.x} cy={pAx.y} r={5.5} fill={COLOR_W} />
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
        </>
      )}

      {probe ? (
        <>
          <circle
            cx={pY.x}
            cy={pY.y}
            r={6}
            fill={reach?.ok ? 'emerald' : 'rose'}
            fillOpacity={0.85}
            stroke="var(--fg)"
            strokeWidth={1}
          />
          <text x={pY.x + 10} y={pY.y - 8} fontSize={12} fontWeight={700} fill="var(--fg)">
            y
          </text>
          <circle
            cx={pY.x}
            cy={pY.y}
            r={12}
            fill="transparent"
            stroke="var(--fg)"
            strokeOpacity={0.35}
            style={{ cursor: 'grab' }}
            {...dragY}
          />
          <text
            x={ox}
            y={H - 16}
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            fill={reach?.ok ? 'var(--accent-strong)' : 'rgb(190 18 60)'}
          >
            {reach?.ok ? 'y ∈ Im(A) ✓' : 'y ∉ Im(A) ✕'}
          </text>
        </>
      ) : (
        <text x={ox} y={H - 16} textAnchor="middle" fontSize={10} fill="var(--fg-muted)">
          Imagen ⊂ codominio (resaltada)
        </text>
      )}
    </svg>
  );
}

/**
 * Im(A) = {Ax : x ∈ dominio} = Col(A) = span{Ae₁, Ae₂}. Enfoque en el codominio.
 */
export function ImageViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [A, setA] = useState<Mat2>(() => cloneMat2(I2));
  const [x, setX] = useState<Vec2>({ x: 1.4, y: 0.9 });
  const [mode, setMode] = useState<Mode>('one');
  const [tab, setTab] = useState<Tab>('geo');
  const [editOpen, setEditOpen] = useState(false);
  const [editCols, setEditCols] = useState(false);
  const [probe, setProbe] = useState(false);
  const [probeY, setProbeY] = useState<Vec2>({ x: 1, y: 1 });

  const { u: ae1, v: ae2 } = cols(A);
  const rank = rank2(A);
  const Ax = applyMat(A, x);
  const samples = useMemo(() => sampleGrid(5, 2), []);
  const reach = probe ? reachableInfo(A, probeY) : null;

  const caption = joinCaption(
    describeImage(rank, ae1, ae2),
    `dim Im(A) = rango = ${rank}`,
  );

  return (
    <VizPanel title="Imagen Im(A)" caption={caption}>
      <div className="space-y-3">
        <GuideBlock
          idea="La imagen es el conjunto de todas las salidas posibles: Im(A) = {Ax : x ∈ ℝ²} = span{Ae₁, Ae₂}."
          tryIt="Cambia de modo: un punto, muchos puntos o toda la imagen. Arrastra Ae₁/Ae₂ para editar columnas."
          concept="El codominio es siempre ℝ²; la imagen es el subconjunto resaltado."
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
              { id: 'one', label: 'Un punto' },
              { id: 'many', label: 'Muchos puntos' },
              { id: 'all', label: 'Toda la imagen' },
            ]}
            value={mode}
            onChange={(id) => setMode(id as Mode)}
          />
        </div>

        <ChipRow>
          {PRESETS.map((p) => (
            <Chip key={p.id} active={matEq(A, p.m)} onClick={() => setA(cloneMat2(p.m))}>
              {p.label}
            </Chip>
          ))}
        </ChipRow>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={rank === 2 ? 'ok' : rank === 1 ? 'warn' : 'neutral'}>
            dim Im = {rank}
          </Badge>
          <span className="text-xs text-[var(--fg-muted)]">
            Codominio = ℝ² · Imagen ⊂ codominio
          </span>
        </div>

        {tab === 'geo' ? (
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="text-xs font-medium text-[var(--fg-muted)]">Dominio</div>
              <DomainSvg
                uid={`${uid}-dom`}
                x={x}
                mode={mode}
                samples={samples}
                onX={setX}
              />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="text-xs font-medium text-[var(--fg-muted)]">Codominio (Imagen resaltada)</div>
              <CodomainSvg
                uid={`${uid}-cod`}
                A={A}
                x={x}
                mode={mode}
                samples={samples}
                editCols={editCols}
                probe={probe}
                probeY={probeY}
                onCols={(c1, c2) => setA(matFromCols(c1, c2))}
                onProbeY={setProbeY}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3 rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
            <p>
              Ax = x₁ · Ae₁ + x₂ · Ae₂
            </p>
            <p className="text-xs text-[var(--fg-muted)]">
              Ae₁ = <span style={{ color: COLOR_U }}>{formatPair(ae1)}</span>
              {' · '}
              Ae₂ = <span style={{ color: COLOR_V }}>{formatPair(ae2)}</span>
            </p>
            <p>
              x = {formatPair(x)} → Ax ={' '}
              <span style={{ color: COLOR_W }} className="font-semibold">
                {formatPair(Ax)}
              </span>
            </p>
            <p className="text-xs leading-relaxed text-[var(--fg-muted)]">
              ({present(x.x)})·({present(ae1.x)}, {present(ae1.y)}) + ({present(x.y)})·(
              {present(ae2.x)}, {present(ae2.y)}) = ({present(Ax.x)}, {present(Ax.y)})
            </p>
            <div className="border-t border-[var(--border)] pt-2 text-xs">
              <p style={{ color: 'orange' }} className="font-semibold">
                Im(A) = Col(A) = span&#123;Ae₁, Ae₂&#125;
              </p>
              <p className="mt-1 text-[var(--fg-muted)]">dim Im(A) = rango(A) = {rank}</p>
            </div>
          </div>
        )}

        <ControlsStack>
          <ButtonRow>
            <VizButton active={editCols} onClick={() => setEditCols((v) => !v)}>
              Arrastrar Ae₁ / Ae₂
            </VizButton>
          </ButtonRow>
          <ToggleRow
            label="Probar punto y en el codominio"
            checked={probe}
            onChange={setProbe}
          />
          {probe && reach ? (
            <p className={`text-xs ${reach.ok ? 'text-[var(--accent-strong)]' : 'text-rose-700 dark:text-rose-300'}`}>
              {reach.note}
            </p>
          ) : null}
          <p className="text-xs text-[var(--fg-muted)]">
            x = {formatPair(x)} → Ax = {formatPair(Ax)}
          </p>
        </ControlsStack>

        <CollapsibleEdit
          label="Editar matriz A"
          open={editOpen}
          onToggle={() => setEditOpen((o) => !o)}
        >
          <Mat2Editor m={A} onChange={setA} labels={['Ae₁', 'Ae₂']} />
        </CollapsibleEdit>
      </div>
    </VizPanel>
  );
}
