'use client';

import { useId, useMemo, useState, type ReactNode } from 'react';
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
import { formatNum, matVec, type Mat } from './decompMath';
import {
  amplification,
  columnAbsoluteSums,
  dominantIndices,
  inducedMatrixNorm,
  inequalitySatisfied,
  matrixInfinityNorm,
  matrixOneNorm,
  maximizingVectorForInfinityNorm,
  maximizingVectorForOneNorm,
  projectToUnitPBoundary,
  rowAbsoluteSums,
  scaleBoundary,
  spectralNorm,
  svd2x2,
  transformPoints2D,
  unitBallBoundary2D,
  vectorPNorm,
  type PNorm,
} from './normMath';
import {
  Badge,
  Chip,
  ChipRow,
  CollapsibleEdit,
  GuideBlock,
  I2,
  Mat2Editor,
  PRESET_GENERAL,
  PRESET_ROT45,
  PRESET_SCALE,
  PRESET_SCALE_2,
  PRESET_SINGULAR,
  PRESET_ZERO,
  Segmented,
  cloneMat2,
  formatPair,
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
  autoScale,
  clampVec,
  labelOffset,
  present,
  useVecDrag,
} from './vectorPlane';

type Tab = 'vector' | 'ball' | 'special';
type PresetId = 'general' | 'scale' | 'rot' | 'aniso' | 'singular' | 'id' | 'zero' | null;

const TAB_OPTS = [
  { id: 'vector', label: 'Explorar vector' },
  { id: 'ball', label: 'Bola unitaria' },
  { id: 'special', label: 'Casos especiales' },
];

const P_OPTS = [
  { id: '1', label: 'p = 1' },
  { id: '2', label: 'p = 2' },
  { id: 'inf', label: 'p = ∞' },
];

const PRESETS: Array<{ id: Exclude<PresetId, null>; label: string; m: Mat2 }> = [
  { id: 'general', label: 'General', m: PRESET_GENERAL },
  { id: 'scale', label: 'Escalado', m: PRESET_SCALE },
  { id: 'rot', label: 'Rotación', m: PRESET_ROT45 },
  { id: 'aniso', label: 'Anisotrópica', m: PRESET_SCALE_2 },
  { id: 'singular', label: 'Singular', m: PRESET_SINGULAR },
  { id: 'id', label: 'Identidad', m: I2 },
  { id: 'zero', label: 'Cero', m: PRESET_ZERO },
];

const W = Math.round(VEC_W * 0.92);
const H = Math.round(VEC_H * 0.82);
const CLAMP = 2.4;

function mat2ToMat(m: Mat2): Mat {
  return [
    [m[0][0], m[0][1]],
    [m[1][0], m[1][1]],
  ];
}

function pFromId(id: string): PNorm {
  if (id === '1') return 1;
  if (id === 'inf') return 'inf';
  return 2;
}

function pLabel(p: PNorm): string {
  if (p === 'inf') return '∞';
  return String(p);
}

function normASub(p: PNorm): string {
  if (p === 'inf') return '∞';
  return String(p);
}

function xNormLabel(p: PNorm): string {
  return `‖x‖_${normASub(p)}`;
}

function axNormLabel(p: PNorm): string {
  return `‖Ax‖_${normASub(p)}`;
}

function matrixNormLabel(p: PNorm): string {
  return `‖A‖_${normASub(p)}`;
}

function maximizingVector(A: Mat, p: PNorm): [number, number] {
  if (p === 1) {
    const v = maximizingVectorForOneNorm(A);
    return [v[0] ?? 0, v[1] ?? 0];
  }
  if (p === 'inf') {
    const v = maximizingVectorForInfinityNorm(A);
    return [v[0] ?? 0, v[1] ?? 0];
  }
  const { v1 } = svd2x2(A);
  return [v1.x, v1.y];
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

function SpecialCaseCard({
  title,
  formula,
  value,
  detail,
  active,
}: {
  title: string;
  formula: string;
  value: number;
  detail: ReactNode;
  active: boolean;
}) {
  return (
    <article
      className={`rounded-xl border px-3 py-3 ${
        active
          ? 'border-[var(--accent-strong)] bg-[color-mix(in_oklab,var(--accent-soft)_18%,transparent)]'
          : 'border-[var(--border)] bg-[var(--bg)]'
      }`}
    >
      <h3 className="text-sm font-semibold text-[var(--fg)]">{title}</h3>
      <p className="mt-1 font-mono text-xs text-[var(--accent-strong)]">{formula}</p>
      <p className="mt-2 font-mono text-sm">
        {title} = <strong>{present(value)}</strong>
      </p>
      <div className="mt-2 text-xs leading-relaxed text-[var(--fg-muted)]">{detail}</div>
    </article>
  );
}

/** Norma matricial inducida ‖A‖_p (ALG-NOR-001). */
export function InducedMatrixNormVisualizer() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [tab, setTab] = useState<Tab>('vector');
  const [pId, setPId] = useState('2');
  const [A2, setA2] = useState<Mat2>(() => cloneMat2(PRESET_GENERAL));
  const [preset, setPreset] = useState<PresetId>('general');
  const [xRaw, setXRaw] = useState({ x: 0.7, y: -0.5 });
  const [unitX, setUnitX] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const p = pFromId(pId);
  const A = useMemo(() => mat2ToMat(A2), [A2]);

  const normA = useMemo(() => inducedMatrixNorm(A, p), [A, p]);
  const norm1 = useMemo(() => matrixOneNorm(A), [A]);
  const norm2 = useMemo(() => spectralNorm(A), [A]);
  const normInf = useMemo(() => matrixInfinityNorm(A), [A]);
  const colSums = useMemo(() => columnAbsoluteSums(A), [A]);
  const rowSums = useMemo(() => rowAbsoluteSums(A), [A]);
  const domCols = useMemo(() => dominantIndices(colSums), [colSums]);
  const domRows = useMemo(() => dominantIndices(rowSums), [rowSums]);
  const { sigma1, sigma2 } = useMemo(() => svd2x2(A), [A]);

  const xVec = useMemo<[number, number]>(() => {
    if (unitX) {
      const q = projectToUnitPBoundary([xRaw.x, xRaw.y], p);
      return [q[0] ?? 1, q[1] ?? 0];
    }
    return [xRaw.x, xRaw.y];
  }, [xRaw, unitX, p]);

  const Ax = useMemo(() => matVec(A, xVec), [A, xVec]);
  const xNorm = useMemo(() => vectorPNorm(xVec, p), [xVec, p]);
  const axNorm = useMemo(() => vectorPNorm(Ax, p), [Ax, p]);
  const amp = useMemo(() => amplification(A, xVec, p), [A, xVec, p]);
  const bound = normA * (unitX ? 1 : xNorm);
  const inequalityOk = inequalitySatisfied(axNorm, bound);

  const unitBall = useMemo(() => unitBallBoundary2D(p, p === 2 ? 96 : p === 'inf' ? 16 : 4), [p]);
  const transformedUnit = useMemo(() => transformPoints2D(A, unitBall), [A, unitBall]);
  const containingBall = useMemo(() => scaleBoundary(unitBall, normA), [unitBall, normA]);

  const xPt = { x: xVec[0] ?? 0, y: xVec[1] ?? 0 };
  const axPt = { x: Ax[0] ?? 0, y: Ax[1] ?? 0 };

  const inputReach = Math.max(1.2, Math.hypot(xPt.x, xPt.y));
  const outputReach = Math.max(1.2, normA, Math.hypot(axPt.x, axPt.y));
  const ballReach = Math.max(1.2, normA, ...transformedUnit.map((q) => Math.hypot(q.x, q.y)));

  const ox = W / 2;
  const oy = H / 2;
  const SIn = autoScale(inputReach, Math.min(W, H), 36, 24, 52);
  const SOut = autoScale(outputReach, Math.min(W, H), 36, 24, 52);
  const SBall = autoScale(ballReach, Math.min(W, H), 40, 24, 52);

  const toIn = (pt: { x: number; y: number }) => ({ x: ox + pt.x * SIn, y: oy - pt.y * SIn });
  const toOut = (pt: { x: number; y: number }) => ({ x: ox + pt.x * SOut, y: oy - pt.y * SOut });
  const toBall = (pt: { x: number; y: number }) => ({ x: ox + pt.x * SBall, y: oy - pt.y * SBall });

  const handleDragX = (raw: { x: number; y: number }) => {
    if (unitX) {
      const q = projectToUnitPBoundary([raw.x, raw.y], p);
      setXRaw({ x: q[0] ?? 1, y: q[1] ?? 0 });
    } else {
      setXRaw(clampVec(raw, CLAMP));
    }
  };

  const dragVIn = useVecDrag(handleDragX, SIn, { x: ox, y: oy });
  const dragVBall = useVecDrag(handleDragX, SBall, { x: ox, y: oy });

  const applyPreset = (id: PresetId) => {
    const item = PRESETS.find((entry) => entry.id === id);
    if (!item) return;
    setA2(cloneMat2(item.m));
    setPreset(id);
  };

  const findMaximum = () => {
    const [mx, my] = maximizingVector(A, p);
    setXRaw({ x: mx, y: my });
    setUnitX(true);
  };

  const ballHint =
    p === 1
      ? 'La bola unidad B₁ es un rombo (diamante). La imagen A·B₁ queda dentro de una bola de radio ‖A‖₁.'
      : p === 2
        ? 'La bola unidad B₂ es un círculo. La imagen A·B₂ queda dentro de una bola de radio ‖A‖₂.'
        : 'La bola unidad B∞ es un cuadrado. La imagen A·B∞ queda dentro de una bola de radio ‖A‖∞.';

  const caption = joinCaption(
    `p = ${pLabel(p)}`,
    `${matrixNormLabel(p)} = ${present(normA)}`,
    `estiramiento actual = ${present(amp)}`,
  );

  return (
    <VizPanel caption={caption}>
      <div className="space-y-4">
        <GuideBlock
          idea="Vas a ver que una norma matricial inducida mide el mayor estiramiento que A puede producir sobre un vector."
          tryIt="Mueve x sobre la bola unitaria y observa cómo cambia ‖Ax‖_p. Busca la dirección donde el estiramiento es máximo."
        />

        <div className="flex flex-wrap items-center gap-2">
          <Segmented options={TAB_OPTS} value={tab} onChange={(id) => setTab(id as Tab)} />
          <Segmented options={P_OPTS} value={pId} onChange={setPId} />
          <Badge tone="neutral">Norma: {matrixNormLabel(p)}</Badge>
        </div>

        <ChipRow>
          {PRESETS.map((item) => (
            <Chip key={item.id} active={preset === item.id} onClick={() => applyPreset(item.id)}>
              {item.label}
            </Chip>
          ))}
        </ChipRow>

        <CollapsibleEdit label="Editar matriz A" open={editOpen} onToggle={() => setEditOpen((v) => !v)}>
          <Mat2Editor
            m={A2}
            name="A"
            onChange={(m) => {
              setA2(m);
              setPreset(null);
            }}
          />
        </CollapsibleEdit>

        {tab === 'vector' ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <section className="rounded-xl border border-[var(--border)] px-2 py-2">
                <p className="mb-1 text-center text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
                  Entrada
                </p>
                <svg
                  viewBox={`0 0 ${W} ${H}`}
                  className="mx-auto h-auto w-full touch-none"
                  role="img"
                  aria-label={`Bola unitaria de entrada y vector x con norma ${xNormLabel(p)}`}
                >
                  <defs>
                    <ArrowMarker id={`${uid}-xin`} color={COLOR_V} />
                  </defs>
                  <Axes W={W} H={H} ox={ox} oy={oy} S={SIn} ticks={[-1, 1]} xLabel="x₁" yLabel="x₂" />
                  <polygon
                    points={polyPoints(unitBall, toIn)}
                    fill="color-mix(in oklab, var(--accent-soft) 22%, transparent)"
                    stroke={COLOR_V}
                    strokeWidth={1.5}
                    strokeDasharray="5 4"
                    opacity={0.9}
                  />
                  <line
                    x1={ox}
                    y1={oy}
                    x2={toIn(xPt).x}
                    y2={toIn(xPt).y}
                    stroke={COLOR_V}
                    strokeWidth={2.5}
                    markerEnd={`url(#${uid}-xin)`}
                  />
                  <circle
                    cx={toIn(xPt).x}
                    cy={toIn(xPt).y}
                    r={7}
                    fill={COLOR_V}
                    opacity={0.28}
                    style={{ cursor: 'grab' }}
                    {...dragVIn}
                  />
                  <text {...labelOffset(xPt, toIn(xPt), ox, oy)} fontSize={11} fill={COLOR_V}>
                    x
                  </text>
                </svg>
              </section>

              <section className="rounded-xl border border-[var(--border)] px-2 py-2">
                <p className="mb-1 text-center text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
                  Salida
                </p>
                <svg
                  viewBox={`0 0 ${W} ${H}`}
                  className="mx-auto h-auto w-full"
                  role="img"
                  aria-label={`Imagen Ax con norma ${axNormLabel(p)}`}
                >
                  <defs>
                    <ArrowMarker id={`${uid}-axout`} color={COLOR_U} />
                  </defs>
                  <Axes W={W} H={H} ox={ox} oy={oy} S={SOut} ticks={[-2, -1, 1, 2]} xLabel="(Ax)₁" yLabel="(Ax)₂" />
                  <polygon
                    points={polyPoints(
                      transformedUnit.map((q) => ({ x: q.x, y: q.y })),
                      toOut,
                    )}
                    fill="color-mix(in oklab, var(--accent-strong) 16%, transparent)"
                    stroke={COLOR_W}
                    strokeWidth={1.4}
                    opacity={0.65}
                  />
                  <polygon
                    points={polyPoints(containingBall, toOut)}
                    fill="none"
                    stroke={COLOR_W}
                    strokeWidth={1.2}
                    strokeDasharray="4 3"
                    opacity={0.55}
                  />
                  <line
                    x1={ox}
                    y1={oy}
                    x2={toOut(axPt).x}
                    y2={toOut(axPt).y}
                    stroke={COLOR_U}
                    strokeWidth={2.5}
                    markerEnd={`url(#${uid}-axout)`}
                  />
                  <text {...labelOffset(axPt, toOut(axPt), ox, oy)} fontSize={11} fill={COLOR_U}>
                    Ax
                  </text>
                </svg>
              </section>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-[var(--border)] px-3 py-2">
                <p className="text-xs font-semibold uppercase text-[var(--fg-muted)]">Vector x</p>
                <p className="mt-1 font-mono text-sm">x = {formatPair(xPt)}</p>
                <p className="mt-1 font-mono text-xs text-[var(--fg-muted)]">
                  {xNormLabel(p)} = {present(xNorm)}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--border)] px-3 py-2">
                <p className="text-xs font-semibold uppercase text-[var(--fg-muted)]">Imagen Ax</p>
                <p className="mt-1 font-mono text-sm">Ax = {formatPair(axPt)}</p>
                <p className="mt-1 font-mono text-xs text-[var(--fg-muted)]">
                  {axNormLabel(p)} = {present(axNorm)}
                </p>
                <p className="mt-1 font-mono text-xs">
                  Estiramiento = {present(amp)}
                  {amp >= normA - 1e-6 ? (
                    <span className="ml-2">
                      <Badge tone="ok">≈ máximo</Badge>
                    </span>
                  ) : null}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <CompareBar
                label={`${axNormLabel(p)} actual`}
                value={axNorm}
                max={Math.max(normA, axNorm, 0.01)}
                tone={COLOR_U}
                ariaLabel={`Norma actual ${fmt(axNorm)}`}
              />
              <CompareBar
                label={`${matrixNormLabel(p)} (techo)`}
                value={normA}
                max={Math.max(normA, axNorm, 0.01)}
                tone={COLOR_W}
                ariaLabel={`Norma inducida ${fmt(normA)}`}
              />
            </div>

            <div
              className={`rounded-lg border px-3 py-2 font-mono text-sm ${
                inequalityOk
                  ? 'border-emerald-600/30 bg-emerald-500/10'
                  : 'border-rose-600/30 bg-rose-500/10'
              }`}
              aria-live="polite"
            >
              {axNormLabel(p)} ≤ {matrixNormLabel(p)}
              {unitX ? '' : ` · ${xNormLabel(p)}`} → {present(axNorm)} ≤ {present(bound)}
            </div>

            <ControlsStack>
              <ToggleRow
                label={`Mantener ${xNormLabel(p)}=1`}
                checked={unitX}
                onChange={setUnitX}
              />
              <ButtonRow>
                <VizButton onClick={findMaximum}>Encontrar máximo</VizButton>
              </ButtonRow>
            </ControlsStack>
          </div>
        ) : null}

        {tab === 'ball' ? (
          <div className="space-y-3">
            <p className="text-sm text-[var(--fg-muted)]">{ballHint}</p>
            <section className="rounded-xl border border-[var(--border)] px-2 py-2">
              <svg
                viewBox={`0 0 ${W} ${H}`}
                className="mx-auto h-auto w-full touch-none"
                role="img"
                aria-label={`Transformación de la bola unitaria B_${normASub(p)} bajo A`}
              >
                <defs>
                  <ArrowMarker id={`${uid}-xball`} color={COLOR_V} />
                  <ArrowMarker id={`${uid}-axball`} color={COLOR_U} />
                </defs>
                <Axes W={W} H={H} ox={ox} oy={oy} S={SBall} ticks={[-2, -1, 1, 2]} />
                <polygon
                  points={polyPoints(unitBall, toBall)}
                  fill="color-mix(in oklab, var(--accent-soft) 25%, transparent)"
                  stroke={COLOR_V}
                  strokeWidth={1.5}
                  strokeDasharray="5 4"
                  opacity={0.85}
                />
                <polygon
                  points={polyPoints(
                    transformedUnit.map((q) => ({ x: q.x, y: q.y })),
                    toBall,
                  )}
                  fill="color-mix(in oklab, var(--accent-strong) 20%, transparent)"
                  stroke="var(--accent-strong)"
                  strokeWidth={2}
                />
                <polygon
                  points={polyPoints(containingBall, toBall)}
                  fill="none"
                  stroke={COLOR_W}
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  opacity={0.7}
                />
                <line
                  x1={ox}
                  y1={oy}
                  x2={toBall(xPt).x}
                  y2={toBall(xPt).y}
                  stroke={COLOR_V}
                  strokeWidth={2}
                  markerEnd={`url(#${uid}-xball)`}
                />
                <line
                  x1={ox}
                  y1={oy}
                  x2={toBall(axPt).x}
                  y2={toBall(axPt).y}
                  stroke={COLOR_U}
                  strokeWidth={2.5}
                  markerEnd={`url(#${uid}-axball)`}
                />
                <circle
                  cx={toBall(xPt).x}
                  cy={toBall(xPt).y}
                  r={7}
                  fill={COLOR_V}
                  style={{ cursor: 'grab' }}
                  {...dragVBall}
                />
                <text {...labelOffset(xPt, toBall(xPt), ox, oy)} fontSize={11} fill={COLOR_V}>
                  x
                </text>
                <text {...labelOffset(axPt, toBall(axPt), ox, oy)} fontSize={11} fill={COLOR_U}>
                  Ax
                </text>
              </svg>
            </section>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <Badge tone="neutral">x = {formatPair(xPt)}</Badge>
              <Badge tone="neutral">Ax = {formatPair(axPt)}</Badge>
              <Badge tone="ok">
                {matrixNormLabel(p)} = {present(normA)}
              </Badge>
            </div>
            <ControlsStack>
              <ToggleRow label={`Mantener ${xNormLabel(p)}=1`} checked={unitX} onChange={setUnitX} />
              <ButtonRow>
                <VizButton onClick={findMaximum}>Encontrar máximo</VizButton>
              </ButtonRow>
            </ControlsStack>
          </div>
        ) : null}

        {tab === 'special' ? (
          <div className="grid gap-3 lg:grid-cols-3">
            <SpecialCaseCard
              title="‖A‖₁"
              formula="‖A‖₁ = max_j Σᵢ |aᵢⱼ|"
              value={norm1}
              active={p === 1}
              detail={
                <>
                  <p>Suma absoluta por columna:</p>
                  <ul className="mt-1 space-y-0.5 font-mono">
                    {colSums.map((s, j) => (
                      <li key={j} className={domCols.includes(j) ? 'text-[var(--accent-strong)] font-semibold' : ''}>
                        col {j + 1}: Σ|aᵢ{j + 1}| = {present(s)}
                      </li>
                    ))}
                  </ul>
                </>
              }
            />
            <SpecialCaseCard
              title="‖A‖₂"
              formula="‖A‖₂ = σ₁"
              value={norm2}
              active={p === 2}
              detail={
                <p>
                  Valores singulares de A: σ₁ = {formatNum(sigma1)}, σ₂ = {formatNum(sigma2)}. La norma espectral es el
                  mayor estiramiento sobre vectores unitarios en ℓ₂.
                </p>
              }
            />
            <SpecialCaseCard
              title="‖A‖∞"
              formula="‖A‖∞ = max_i Σⱼ |aᵢⱼ|"
              value={normInf}
              active={p === 'inf'}
              detail={
                <>
                  <p>Suma absoluta por fila:</p>
                  <ul className="mt-1 space-y-0.5 font-mono">
                    {rowSums.map((s, i) => (
                      <li key={i} className={domRows.includes(i) ? 'text-[var(--accent-strong)] font-semibold' : ''}>
                        fila {i + 1}: Σ|aᵢⱼ| = {present(s)}
                      </li>
                    ))}
                  </ul>
                </>
              }
            />
          </div>
        ) : null}
      </div>
    </VizPanel>
  );
}
