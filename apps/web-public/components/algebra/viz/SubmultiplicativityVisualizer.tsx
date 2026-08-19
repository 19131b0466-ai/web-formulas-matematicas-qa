'use client';

import { useId, useMemo, useState } from 'react';
import type { Mat2 } from './math2d';
import {
  ButtonRow,
  ControlsStack,
  ToggleRow,
  VizButton,
  VizPanel,
  fmt,
  joinCaption,
} from './controls';
import { formatNum, matMul, matVec, type Mat } from './decompMath';
import {
  inequalitySatisfied,
  projectToUnitPBoundary,
  spectralNorm,
  submultiplicativityRatio,
  svd2x2,
  transformPoints2D,
  unitBallBoundary2D,
  vectorTwoNorm,
} from './normMath';
import {
  Badge,
  Chip,
  ChipRow,
  CollapsibleEdit,
  GuideBlock,
  Mat2Editor,
  PRESET_ROT45,
  PRESET_SCALE,
  PRESET_SHEAR,
  PRESET_ZERO,
  Segmented,
  cloneMat2,
  matMul as matMul2,
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
  labelOffset,
  present,
} from './vectorPlane';

type Mode = 'vector' | 'circle' | 'inequality';
type VectorStage = 'x' | 'bx' | 'abx';
type PresetId = 'equal' | 'strict' | 'rot' | 'scale' | 'shear' | 'zero' | 'contract' | null;

const MODE_OPTS = [
  { id: 'vector', label: 'Vector' },
  { id: 'circle', label: 'Círculo unitario' },
  { id: 'inequality', label: 'Desigualdad' },
];

const STAGE_OPTS = [
  { id: 'x', label: 'x' },
  { id: 'bx', label: 'Bx' },
  { id: 'abx', label: 'ABx' },
];

const PRESET_EQUAL_A: Mat2 = [
  [3, 0],
  [0, 1],
];
const PRESET_EQUAL_B: Mat2 = [
  [2, 0],
  [0, 1],
];
const PRESET_STRICT_A: Mat2 = [
  [3, 0],
  [0, 1],
];
const PRESET_STRICT_B: Mat2 = [
  [1, 0],
  [0, 2],
];
const PRESET_CONTRACT_A: Mat2 = [
  [0.6, 0],
  [0, 0.4],
];
const PRESET_CONTRACT_B: Mat2 = [
  [0.5, 0],
  [0, 0.7],
];

const PRESETS: Array<{ id: PresetId; label: string; a: Mat2; b: Mat2 }> = [
  { id: 'equal', label: 'Igualdad', a: PRESET_EQUAL_A, b: PRESET_EQUAL_B },
  { id: 'strict', label: 'Cota no alcanzada', a: PRESET_STRICT_A, b: PRESET_STRICT_B },
  { id: 'rot', label: 'Rotación', a: PRESET_ROT45, b: PRESET_ROT45 },
  { id: 'scale', label: 'Escalado', a: PRESET_SCALE, b: PRESET_SCALE },
  { id: 'shear', label: 'Cizallamiento', a: PRESET_SHEAR, b: PRESET_SHEAR },
  { id: 'zero', label: 'Matriz cero', a: PRESET_ZERO, b: PRESET_SCALE },
  { id: 'contract', label: 'Contracción', a: PRESET_CONTRACT_A, b: PRESET_CONTRACT_B },
];

const W = Math.round(VEC_W * 0.92);
const H = Math.round(VEC_H * 0.88);

function mat2ToMat(m: Mat2): Mat {
  return [
    [m[0][0], m[0][1]],
    [m[1][0], m[1][1]],
  ];
}

function polyPts(
  pts: Array<{ x: number; y: number }>,
  to: (p: { x: number; y: number }) => { x: number; y: number },
) {
  return pts
    .map((p) => {
      const q = to(p);
      return `${q.x},${q.y}`;
    })
    .join(' ');
}

function CompareBar({
  label,
  value,
  max,
  tone,
  ariaLabel,
}: {
  label: string;
  value: number;
  max: number;
  tone: string;
  ariaLabel: string;
}) {
  const pct = max > 1e-9 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--fg-muted)]">{label}</span>
        <span className="font-mono tabular-nums">{fmt(value)}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-[var(--border)]" role="img" aria-label={ariaLabel}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: tone }} />
      </div>
    </div>
  );
}

function MiniPlane({
  uid,
  label,
  vec,
  unitCircle,
  ox,
  oy,
  S,
  color,
  draggable,
  onDrag,
}: {
  uid: string;
  label: string;
  vec: { x: number; y: number };
  unitCircle?: boolean;
  ox: number;
  oy: number;
  S: number;
  color: string;
  draggable?: boolean;
  onDrag?: (p: { x: number; y: number }) => void;
}) {
  const to = (p: { x: number; y: number }) => ({ x: ox + p.x * S, y: oy - p.y * S });
  const tip = to(vec);
  const dragHandlers = draggable
    ? {
        onPointerDown: (e: React.PointerEvent) => {
          (e.target as Element).setPointerCapture?.(e.pointerId);
        },
        onPointerMove: (e: React.PointerEvent) => {
          if (!(e.buttons & 1) || !onDrag) return;
          const svg =
            (e.currentTarget as SVGSVGElement).ownerSVGElement ?? (e.currentTarget as SVGSVGElement);
          const pt = svg.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const ctm = svg.getScreenCTM();
          if (!ctm) return;
          const sp = pt.matrixTransform(ctm.inverse());
          onDrag({ x: (sp.x - ox) / S, y: -(sp.y - oy) / S });
        },
      }
    : {};

  return (
    <div className="rounded-lg border border-[var(--border)] px-1 py-1">
      <p className="mb-1 text-center text-xs font-medium text-[var(--fg-muted)]">{label}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full touch-none" role="img" aria-label={label}>
        <defs>
          <ArrowMarker id={`${uid}-arr`} color={color} />
        </defs>
        <Axes W={W} H={H} ox={ox} oy={oy} S={S} ticks={[-2, -1, 1, 2]} />
        {unitCircle ? (
          <circle cx={ox} cy={oy} r={S} fill="none" stroke={COLOR_U} strokeWidth={1} opacity={0.35} />
        ) : null}
        <line
          x1={ox}
          y1={oy}
          x2={tip.x}
          y2={tip.y}
          stroke={color}
          strokeWidth={2.2}
          markerEnd={`url(#${uid}-arr)`}
          {...dragHandlers}
        />
        {draggable ? (
          <circle cx={tip.x} cy={tip.y} r={6} fill={color} opacity={0.25} {...dragHandlers} />
        ) : null}
        <text {...labelOffset(vec, tip, ox, oy, 10)} fontSize={10} fill={color}>
          {label}
        </text>
      </svg>
      <p className="text-center font-mono text-[10px] tabular-nums text-[var(--fg-muted)]">
        ‖{label}‖₂ = {present(Math.hypot(vec.x, vec.y))}
      </p>
    </div>
  );
}

/** Submultiplicatividad ‖AB‖₂ ≤ ‖A‖₂‖B‖₂ (ALG-NOR-006). */
export function SubmultiplicativityVisualizer() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [mode, setMode] = useState<Mode>('vector');
  const [stage, setStage] = useState<VectorStage>('x');
  const [A2, setA2] = useState<Mat2>(() => cloneMat2(PRESET_EQUAL_A));
  const [B2, setB2] = useState<Mat2>(() => cloneMat2(PRESET_EQUAL_B));
  const [preset, setPreset] = useState<PresetId>('equal');
  const [xRaw, setXRaw] = useState({ x: 1, y: 0 });
  const [lockUnit, setLockUnit] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [atMax, setAtMax] = useState(false);

  const A = useMemo(() => mat2ToMat(A2), [A2]);
  const B = useMemo(() => mat2ToMat(B2), [B2]);
  const AB = useMemo(() => matMul(A, B), [A, B]);
  const AB2 = useMemo(() => matMul2(A2, B2), [A2, B2]);

  const normA = useMemo(() => spectralNorm(A), [A]);
  const normB = useMemo(() => spectralNorm(B), [B]);
  const normAB = useMemo(() => spectralNorm(AB), [AB]);
  const productBound = normA * normB;
  const rho = useMemo(() => submultiplicativityRatio(normAB, normA, normB), [normAB, normA, normB]);

  const xVec = useMemo<[number, number]>(() => {
    if (lockUnit) {
      const p = projectToUnitPBoundary([xRaw.x, xRaw.y], 2);
      return [p[0] ?? 1, p[1] ?? 0];
    }
    return [xRaw.x, xRaw.y];
  }, [xRaw, lockUnit]);

  const Bx = useMemo(() => matVec(B, xVec), [B, xVec]);
  const ABx = useMemo(() => matVec(AB, xVec), [AB, xVec]);

  const normX = vectorTwoNorm(xVec);
  const normBx = vectorTwoNorm(Bx);
  const normABx = vectorTwoNorm(ABx);

  const boundBx = normB * normX;
  const boundABxFull = normA * normB * normX;

  const { v1: maxDir } = useMemo(() => svd2x2(AB), [AB]);

  const seekMaximum = () => {
    setAtMax(true);
    setXRaw({ x: maxDir.x, y: maxDir.y });
    setStage('abx');
  };

  const applyPreset = (id: PresetId) => {
    const p = PRESETS.find((item) => item.id === id);
    if (!p) return;
    setA2(cloneMat2(p.a));
    setB2(cloneMat2(p.b));
    setPreset(id);
    setAtMax(false);
  };

  const handleDragX = (p: { x: number; y: number }) => {
    setAtMax(false);
    if (lockUnit) {
      const q = projectToUnitPBoundary([p.x, p.y], 2);
      setXRaw({ x: q[0] ?? 1, y: q[1] ?? 0 });
    } else {
      setXRaw(p);
    }
  };

  const xPt = { x: xVec[0] ?? 0, y: xVec[1] ?? 0 };
  const bxPt = { x: Bx[0] ?? 0, y: Bx[1] ?? 0 };
  const abxPt = { x: ABx[0] ?? 0, y: ABx[1] ?? 0 };

  const stageReach = Math.max(
    1.2,
    Math.hypot(xPt.x, xPt.y),
    Math.hypot(bxPt.x, bxPt.y),
    Math.hypot(abxPt.x, abxPt.y),
    normA,
    normB,
    normAB,
    productBound,
  );
  const ox = W / 2;
  const oy = H / 2;
  const S = autoScale(stageReach, Math.min(W, H), 40, 22, 50);

  const circle = useMemo(() => unitBallBoundary2D(2, 72), []);
  const bCircle = useMemo(() => transformPoints2D(B, circle), [B, circle]);
  const abCircle = useMemo(() => transformPoints2D(AB, circle), [AB, circle]);

  const geoReach = Math.max(1.2, normA, normB, normAB, productBound) * 1.1;
  const geoS = autoScale(geoReach, Math.min(W, H), 40, 22, 50);
  const geoOx = W / 2;
  const geoOy = H / 2;
  const geoTo = (p: { x: number; y: number }) => ({ x: geoOx + p.x * geoS, y: geoOy - p.y * geoS });

  const caption = joinCaption(
    `‖A‖₂·‖B‖₂ = ${formatNum(productBound)}`,
    `‖AB‖₂ = ${formatNum(normAB)}`,
    rho != null ? `ρ = ${formatNum(rho)}` : undefined,
  );

  const equalityReached = rho != null && Math.abs(rho - 1) <= 0.02;

  return (
    <VizPanel caption={caption}>
      <div className="space-y-3">
        <GuideBlock
          idea="Vas a ver por qué encadenar dos transformaciones no puede amplificar más que el producto de sus máximos estiramientos."
          tryIt="Mueve el vector x o modifica A y B. Compara ‖ABx‖ con ‖A‖·‖B‖·‖x‖."
        />

        <div className="flex flex-wrap items-center gap-2">
          <Segmented options={MODE_OPTS} value={mode} onChange={(id) => setMode(id as Mode)} />
          <Badge tone="neutral">Norma: ‖·‖₂</Badge>
          {equalityReached ? <Badge tone="ok">Cota alcanzada</Badge> : null}
        </div>

        <ChipRow>
          {PRESETS.map((p) => (
            <Chip key={p.id ?? 'custom'} active={preset === p.id} onClick={() => applyPreset(p.id)}>
              {p.label}
            </Chip>
          ))}
        </ChipRow>

        <CollapsibleEdit label="Editar matrices A y B" open={editOpen} onToggle={() => setEditOpen((v) => !v)}>
          <div className="flex flex-wrap items-start justify-center gap-6">
            <Mat2Editor
              m={A2}
              name="A"
              onChange={(m) => {
                setA2(m);
                setPreset(null);
                setAtMax(false);
              }}
            />
            <span className="self-center font-mono text-lg text-[var(--fg-muted)]">×</span>
            <Mat2Editor
              m={B2}
              name="B"
              onChange={(m) => {
                setB2(m);
                setPreset(null);
                setAtMax(false);
              }}
            />
            <span className="self-center font-mono text-lg text-[var(--fg-muted)]">=</span>
            <Mat2Editor m={AB2} name="AB" readOnly />
          </div>
        </CollapsibleEdit>

        {mode === 'vector' ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Segmented options={STAGE_OPTS} value={stage} onChange={(id) => setStage(id as VectorStage)} />
              <ToggleRow label="Mantener ‖x‖=1" checked={lockUnit} onChange={setLockUnit} />
            </div>

            <div className="grid gap-2 md:grid-cols-3">
              <MiniPlane
                uid={`${uid}-x`}
                label="x"
                vec={xPt}
                unitCircle={lockUnit}
                ox={ox}
                oy={oy}
                S={S}
                color={COLOR_U}
                draggable
                onDrag={handleDragX}
              />
              <MiniPlane uid={`${uid}-bx`} label="Bx" vec={bxPt} ox={ox} oy={oy} S={S} color={COLOR_V} />
              <MiniPlane uid={`${uid}-abx`} label="ABx" vec={abxPt} ox={ox} oy={oy} S={S} color={COLOR_W} />
            </div>

            <section className="rounded-xl border border-[var(--border)] px-3 py-3 text-sm" aria-live="polite">
              <p className="font-mono">x → B → Bx → A → ABx</p>
              <p className="mt-2 font-mono text-[var(--fg-muted)]">
                ‖x‖₂ = {present(normX)} · ‖Bx‖₂ = {present(normBx)} · ‖ABx‖₂ = {present(normABx)}
              </p>

              {stage === 'bx' || stage === 'abx' ? (
                <div className="mt-3 space-y-2">
                  <p className="font-mono">
                    ‖Bx‖₂ = {present(normBx)} ≤ ‖B‖₂·‖x‖₂ = {present(normB)}·{present(normX)} ={' '}
                    {present(boundBx)}
                  </p>
                  <CompareBar
                    label="‖Bx‖₂ real"
                    value={normBx}
                    max={Math.max(boundBx, normBx, 0.01)}
                    tone={COLOR_V}
                    ariaLabel={`Norma de Bx ${fmt(normBx)}`}
                  />
                  <CompareBar
                    label="Techo ‖B‖₂·‖x‖₂"
                    value={boundBx}
                    max={Math.max(boundBx, normBx, 0.01)}
                    tone={COLOR_U}
                    ariaLabel={`Cota de B ${fmt(boundBx)}`}
                  />
                </div>
              ) : null}

              {stage === 'abx' ? (
                <div className="mt-3 space-y-2">
                  <p className="font-mono">
                    ‖ABx‖₂ = {present(normABx)} ≤ ‖A‖₂·‖B‖₂·‖x‖₂ = {present(boundABxFull)}
                  </p>
                  <CompareBar
                    label="‖ABx‖₂ real"
                    value={normABx}
                    max={Math.max(boundABxFull, normABx, 0.01)}
                    tone={COLOR_W}
                    ariaLabel={`Norma de ABx ${fmt(normABx)}`}
                  />
                  <CompareBar
                    label="Techo ‖A‖₂·‖B‖₂·‖x‖₂"
                    value={boundABxFull}
                    max={Math.max(boundABxFull, normABx, 0.01)}
                    tone={COLOR_U}
                    ariaLabel={`Cota compuesta ${fmt(boundABxFull)}`}
                  />
                  {lockUnit ? (
                    <p className="text-[var(--fg-muted)]">
                      Con ‖x‖₂ = 1: ‖ABx‖₂ ≤ ‖A‖₂·‖B‖₂. El producto de normas es un techo para el
                      estiramiento total.
                    </p>
                  ) : null}
                  <p className="font-mono text-[var(--accent-strong)]">
                    ‖ABx‖₂ ≤ ‖A‖₂·‖Bx‖₂ ≤ ‖A‖₂·‖B‖₂·‖x‖₂
                  </p>
                </div>
              ) : null}
            </section>

            <ControlsStack>
              <ButtonRow>
                <VizButton onClick={seekMaximum}>Buscar máximo</VizButton>
              </ButtonRow>
            </ControlsStack>

            {atMax ? (
              <section className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-3 text-sm">
                <p className="font-mono">
                  max<sub>‖x‖₂=1</sub> ‖ABx‖₂ = ‖AB‖₂ = {formatNum(normAB)}
                </p>
                <p className="mt-1 font-mono text-[var(--accent-strong)]">
                  ‖AB‖₂ ≤ ‖A‖₂·‖B‖₂ = {formatNum(productBound)}
                </p>
              </section>
            ) : null}

            <section className="rounded-xl border border-[var(--border)] px-3 py-3" aria-label="Presupuesto de estiramiento">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
                Presupuesto de estiramiento
              </p>
              <ul className="space-y-1 font-mono text-sm">
                <li>B puede amplificar hasta × {formatNum(normB)}</li>
                <li>A puede amplificar después hasta × {formatNum(normA)}</li>
                <li>Techo compuesto × {formatNum(productBound)}</li>
                <li className="text-[var(--accent-strong)]">Amplificación real máxima de AB × {formatNum(normAB)}</li>
              </ul>
              {rho != null ? (
                <p className="mt-2 text-sm text-[var(--fg-muted)]">
                  Razón respecto de la cota: ρ = ‖AB‖₂ / (‖A‖₂·‖B‖₂) = {formatNum(rho)}
                </p>
              ) : null}
            </section>
          </>
        ) : null}

        {mode === 'circle' ? (
          <>
            <section className="rounded-xl border border-[var(--border)] px-2 py-2">
              <svg
                viewBox={`0 0 ${W} ${H}`}
                className="mx-auto h-auto w-full max-w-xl"
                role="img"
                aria-label="Círculo unitario, imagen bajo B e imagen bajo AB"
              >
                <Axes W={W} H={H} ox={geoOx} oy={geoOy} S={geoS} ticks={[-2, -1, 1, 2]} />
                <circle cx={geoOx} cy={geoOy} r={geoS} fill="none" stroke={COLOR_U} strokeWidth={1.5} opacity={0.4} />
                <polygon
                  points={polyPts(bCircle, geoTo)}
                  fill="color-mix(in oklab, teal 10%, transparent)"
                  stroke={COLOR_V}
                  strokeWidth={1.5}
                  opacity={0.7}
                />
                <polygon
                  points={polyPts(abCircle, geoTo)}
                  fill="color-mix(in oklab, orange 12%, transparent)"
                  stroke={COLOR_W}
                  strokeWidth={2}
                  opacity={0.85}
                />
                <circle
                  cx={geoOx}
                  cy={geoOy}
                  r={productBound * geoS}
                  fill="none"
                  stroke={COLOR_U}
                  strokeWidth={1.2}
                  strokeDasharray="5 4"
                  opacity={0.5}
                />
              </svg>
            </section>
            <section className="rounded-xl border border-[var(--border)] px-3 py-3 text-sm leading-relaxed">
              <p>
                El círculo unitario pasa a B(C) y luego a AB(C). El disco punteado tiene radio ‖A‖₂·‖B‖₂ ={' '}
                {formatNum(productBound)}.
              </p>
              <p className="mt-2 font-mono">‖AB‖₂ = {formatNum(normAB)} ≤ {formatNum(productBound)}</p>
            </section>
          </>
        ) : null}

        {mode === 'inequality' ? (
          <section className="space-y-4 rounded-xl border border-[var(--border)] px-3 py-3" aria-live="polite">
            <p className="font-mono text-[var(--accent-strong)]">‖AB‖₂ ≤ ‖A‖₂ · ‖B‖₂</p>
            <CompareBar
              label="‖AB‖₂"
              value={normAB}
              max={Math.max(productBound, normAB, 0.01)}
              tone={COLOR_W}
              ariaLabel={`Norma del producto ${fmt(normAB)}`}
            />
            <CompareBar
              label="‖A‖₂ · ‖B‖₂ (cota)"
              value={productBound}
              max={Math.max(productBound, normAB, 0.01)}
              tone={COLOR_U}
              ariaLabel={`Producto de normas ${fmt(productBound)}`}
            />
            <p className="text-sm text-[var(--fg-muted)]">
              {inequalitySatisfied(normAB, productBound)
                ? 'Se cumple la submultiplicatividad: el lado izquierdo no supera la cota.'
                : 'Revisa los valores numéricos.'}
            </p>
            {rho != null ? (
              <p className="font-mono text-sm">
                ρ = {formatNum(rho)}
                {equalityReached ? ' — la cota se alcanza exactamente.' : ' — la cota es estricta (caso típico).'}
              </p>
            ) : null}
          </section>
        ) : null}
      </div>
    </VizPanel>
  );
}
