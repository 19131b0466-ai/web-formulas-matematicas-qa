'use client';

import { useId, useMemo, useState } from 'react';
import {
  ControlsStack,
  SliderRow,
  ToggleRow,
  VizButton,
  VizPanel,
  joinCaption,
} from './controls';
import {
  type Matrix,
  MatrixBrackets,
  MatrixGrid,
  createMatrix,
  dimSuperscript,
  dims,
  present,
  resizeMatrix,
  sub,
} from './matrixGrid';
import type { Mat2, Vec2 } from './math2d';
import {
  amplification,
  columnAbsoluteSums,
  dominantIndices,
  matVec,
  matrixInfinityNorm,
  matrixOneNorm,
  maximizingVectorForInfinityNorm,
  maximizingVectorForOneNorm,
  normalizePNorm,
  rowAbsoluteSums,
  scaleBoundary,
  type PNorm,
  unitBallBoundary2D,
  vectorPNorm,
} from './normMath';
import {
  Badge,
  Chip,
  ChipRow,
  CollapsibleEdit,
  GuideBlock,
  Mat2Editor,
  Segmented,
  applyMat,
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
  clampVec,
  labelOffset,
  useVecDrag,
} from './vectorPlane';

export type MatrixNormOrientation = 'columns' | 'rows';

type Tab = 'groups' | 'operator' | 'geo';
type Size = 2 | 3;
type PresetId =
  | 'general'
  | 'neg'
  | 'tie'
  | 'id'
  | 'diag'
  | 'zero'
  | 'dominant'
  | null;

const W = VEC_W;
const H = VEC_H;
const ox = W / 2;
const oy = H / 2;
const S = 48;
const CLAMP = 2.4;

function orientationConfig(orientation: MatrixNormOrientation) {
  if (orientation === 'columns') {
    return {
      p: 1 as PNorm,
      normLabel: '‖A‖₁',
      xNormLabel: '‖x‖₁',
      axNormLabel: '‖Ax‖₁',
      groupsTab: 'Por columnas',
      groupNoun: 'columna',
      groupNounPl: 'columnas',
      formula: '‖A‖₁ = max_j Σᵢ |aᵢⱼ|',
      matrixNorm: matrixOneNorm,
      groupSums: columnAbsoluteSums,
      maximizing: maximizingVectorForOneNorm,
      dominantPresetLabel: 'Una columna grande',
    };
  }
  return {
    p: 'inf' as PNorm,
    normLabel: '‖A‖∞',
    xNormLabel: '‖x‖∞',
    axNormLabel: '‖Ax‖∞',
    groupsTab: 'Por filas',
    groupNoun: 'fila',
    groupNounPl: 'filas',
    formula: '‖A‖∞ = max_i Σⱼ |aᵢⱼ|',
    matrixNorm: matrixInfinityNorm,
    groupSums: rowAbsoluteSums,
    maximizing: maximizingVectorForInfinityNorm,
    dominantPresetLabel: 'Fila dominante',
  };
}

function mat2FromMatrix(m: Matrix): Mat2 {
  return [
    [m[0]?.[0] ?? 0, m[0]?.[1] ?? 0],
    [m[1]?.[0] ?? 0, m[1]?.[1] ?? 0],
  ];
}

function matrixFromMat2(m: Mat2): Matrix {
  return [
    [m[0][0], m[0][1]],
    [m[1][0], m[1][1]],
  ];
}

function defaultMatrix(size: Size, orientation: MatrixNormOrientation): Matrix {
  if (size === 2) {
    return orientation === 'columns'
      ? [
          [1.2, 0.4],
          [0.3, 0.9],
        ]
      : [
          [1.1, 0.5],
          [0.8, 1.3],
        ];
  }
  return orientation === 'columns'
    ? [
        [1.2, 0.3, -0.4],
        [0.4, 0.9, 0.2],
        [-0.2, 0.5, 1.0],
      ]
    : [
        [1.0, 0.4, 0.3],
        [0.8, 1.1, 0.5],
        [0.2, 0.6, 1.2],
      ];
}

function presetMatrix(id: PresetId, size: Size, orientation: MatrixNormOrientation): Matrix | null {
  if (!id) return null;
  if (id === 'general') return defaultMatrix(size, orientation);
  if (id === 'id') {
    const n = size;
    const m = createMatrix(n, n, 0);
    for (let i = 0; i < n; i++) m[i]![i] = 1;
    return m;
  }
  if (id === 'diag') {
    if (size === 2) return [[2.5, 0], [0, 0.6]];
    return [
      [2.2, 0, 0],
      [0, 1.1, 0],
      [0, 0, 0.5],
    ];
  }
  if (id === 'zero') return createMatrix(size, size, 0);
  if (id === 'neg') {
    if (size === 2) {
      return orientation === 'columns'
        ? [
            [-1.5, 0.6],
            [0.8, -1.2],
          ]
        : [
            [-1.4, 0.7],
            [0.5, -1.3],
          ];
    }
    return [
      [-1.2, 0.4, -0.3],
      [0.6, -1.0, 0.5],
      [-0.4, 0.3, -0.9],
    ];
  }
  if (id === 'tie') {
    if (size === 2) {
      return orientation === 'columns'
        ? [
            [1.5, 0.5],
            [0.5, 1.5],
          ]
        : [
            [1.2, 1.2],
            [0.8, 0.8],
          ];
    }
    return orientation === 'columns'
      ? [
          [1.4, 0.3, 0.3],
          [0.3, 1.4, 0.3],
          [0.3, 0.3, 1.4],
        ]
      : [
          [1.1, 1.1, 0.2],
          [0.9, 0.9, 0.2],
          [0.2, 0.2, 0.2],
        ];
  }
  if (id === 'dominant') {
    if (orientation === 'columns') {
      if (size === 2) return [[3.2, 0.2], [2.8, 0.1]];
      return [
        [3.0, 0.2, 0.1],
        [2.5, 0.3, 0.2],
        [2.2, 0.1, 0.1],
      ];
    }
    if (size === 2) return [[3.1, 2.9], [0.2, 0.1]];
    return [
      [3.0, 2.8, 2.5],
      [0.2, 0.1, 0.1],
      [0.1, 0.2, 0.1],
    ];
  }
  return null;
}

function formatVec(v: number[]): string {
  return `(${v.map((x) => present(x)).join(', ')})`;
}

function SumBars({
  sums,
  dominant,
  orientation,
  maxBar = 120,
}: {
  sums: number[];
  dominant: number[];
  orientation: MatrixNormOrientation;
  maxBar?: number;
}) {
  const peak = Math.max(...sums, 1e-9);
  const label = orientation === 'columns' ? 'Σ|col|' : 'Σ|fil|';
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--fg-muted)]">{label}</p>
      <div
        className={`grid gap-1 ${orientation === 'columns' ? 'grid-flow-col' : ''}`}
        style={
          orientation === 'columns'
            ? { gridTemplateColumns: `repeat(${sums.length}, minmax(0, 1fr))` }
            : undefined
        }
      >
        {sums.map((s, idx) => {
          const w = Math.max(4, (s / peak) * maxBar);
          const isDom = dominant.includes(idx);
          return (
            <div
              key={idx}
              className={`flex items-center gap-2 ${orientation === 'rows' ? '' : 'flex-col'}`}
            >
              {orientation === 'rows' ? (
                <span className="w-6 font-mono text-[10px] text-[var(--fg-muted)]">{idx + 1}</span>
              ) : null}
              <div
                className={`rounded ${orientation === 'columns' ? 'w-full' : ''} ${
                  isDom
                    ? 'bg-[var(--accent-strong)]'
                    : 'bg-[color-mix(in_oklab,var(--accent-soft)_70%,transparent)]'
                }`}
                style={
                  orientation === 'columns'
                    ? { height: 6, width: '100%', transform: `scaleX(${w / maxBar})`, transformOrigin: 'left' }
                    : { height: 8, width: w }
                }
                title={`${present(s)}`}
              />
              <span
                className={`font-mono text-[10px] tabular-nums ${
                  isDom ? 'font-semibold text-[var(--accent-strong)]' : 'text-[var(--fg-muted)]'
                }`}
              >
                {present(s)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AbsoluteMatrix({ matrix }: { matrix: Matrix }) {
  const abs = matrix.map((row) => row.map((v) => Math.abs(v)));
  return (
    <MatrixBrackets label="|A|" dimLabel={dimSuperscript(dims(matrix).rows, dims(matrix).cols)}>
      <MatrixGrid matrix={abs} readOnlyStyle name="|A|" cellSize="sm" showIndices={false} />
    </MatrixBrackets>
  );
}

export function MatrixOrientedNormVisualizer({
  orientation,
  guideIdea,
  guideTryIt,
}: {
  orientation: MatrixNormOrientation;
  guideIdea: string;
  guideTryIt: string;
}) {
  const cfg = orientationConfig(orientation);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [size, setSize] = useState<Size>(2);
  const [A, setA] = useState<Matrix>(() => defaultMatrix(2, orientation));
  const [tab, setTab] = useState<Tab>('groups');
  const [preset, setPreset] = useState<PresetId>(null);
  const [showAbs, setShowAbs] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [x, setX] = useState<number[]>([0.6, -0.4]);
  const [unitX, setUnitX] = useState(true);
  const [v2, setV2] = useState<Vec2>({ x: 0.7, y: -0.5 });

  const d = dims(A);
  const n = d.cols;
  const normA = cfg.matrixNorm(A);
  const sums = cfg.groupSums(A);
  const dominant = dominantIndices(sums);
  const highlightRow = orientation === 'rows' ? dominant[0] ?? null : null;
  const highlightCol = orientation === 'columns' ? dominant[0] ?? null : null;

  const xVec = useMemo(() => {
    const base = size === 2 ? [v2.x, v2.y] : x.slice(0, n);
    while (base.length < n) base.push(0);
    if (unitX) return normalizePNorm(base, cfg.p);
    return base;
  }, [size, v2, x, n, unitX, cfg.p]);

  const ax = matVec(A, xVec);
  const xNorm = vectorPNorm(xVec, cfg.p);
  const axNorm = vectorPNorm(ax, cfg.p);
  const amp = amplification(A, xVec, cfg.p);
  const bound = normA * xNorm;
  const inequalityOk = axNorm <= bound + 1e-6;

  const tabOpts = [
    { id: 'groups', label: cfg.groupsTab },
    { id: 'operator', label: 'Como operador' },
    { id: 'geo', label: 'Geometría 2D' },
  ];

  const basePresets: Array<{ id: PresetId; label: string }> = [
    { id: 'general', label: 'General' },
    { id: 'neg', label: 'Negativos' },
    { id: 'tie', label: 'Empate' },
    { id: 'id', label: 'Identidad' },
    { id: 'diag', label: 'Diagonal' },
    { id: 'zero', label: 'Cero' },
    { id: 'dominant', label: cfg.dominantPresetLabel },
  ];

  const applyPreset = (id: PresetId) => {
    const m = presetMatrix(id, size, orientation);
    if (!m) return;
    setA(m);
    setPreset(id);
  };

  const changeSize = (next: Size) => {
    setSize(next);
    setA(resizeMatrix(A, next, next, 0));
    setPreset(null);
    if (next === 2) setV2({ x: xVec[0] ?? 0.5, y: xVec[1] ?? -0.3 });
    setX(xVec);
  };

  const findMaxVector = () => {
    const maxX = cfg.maximizing(A);
    if (size === 2) setV2({ x: maxX[0] ?? 0, y: maxX[1] ?? 0 });
    setX(maxX);
    setUnitX(true);
  };

  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });
  const dragV = useVecDrag((p) => setV2(clampVec(p, CLAMP)), S, { x: ox, y: oy });

  const A2 = size === 2 ? mat2FromMatrix(A) : null;
  const unitBall = unitBallBoundary2D(cfg.p, cfg.p === 'inf' ? 16 : 4);
  const scaledBall = scaleBoundary(unitBall, normA);
  const transformedUnit = A2
    ? unitBall.map((p) => applyMat(A2, { x: p.x, y: p.y }))
    : [];
  const ax2 = A2 ? applyMat(A2, { x: xVec[0] ?? 0, y: xVec[1] ?? 0 }) : { x: 0, y: 0 };
  const tipX = to({ x: xVec[0] ?? 0, y: xVec[1] ?? 0 });
  const tipAx = to(ax2);

  const caption = joinCaption(
    `${cfg.normLabel} = ${present(normA)}`,
    dominant.length
      ? `${cfg.groupNoun} dominante: ${dominant.map((i) => i + 1).join(', ')}`
      : undefined,
  );

  return (
    <VizPanel caption={caption}>
      <div className="space-y-4">
        <GuideBlock idea={guideIdea} tryIt={guideTryIt} />

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={tabOpts}
            value={tab}
            onChange={(id) => setTab(id as Tab)}
          />
          <Segmented
            options={[
              { id: '2', label: '2×2' },
              { id: '3', label: '3×3' },
            ]}
            value={String(size)}
            onChange={(id) => changeSize(Number(id) as Size)}
          />
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
          <p className="text-[var(--accent-strong)] font-semibold">{cfg.formula}</p>
          <p className="mt-1">
            {cfg.normLabel} = <strong>{present(normA)}</strong>
            {dominant.length ? (
              <span className="text-[var(--fg-muted)]">
                {' '}
                · {cfg.groupNoun} {dominant.map((i) => i + 1).join(', ')}
              </span>
            ) : null}
          </p>
        </section>

        <ChipRow>
          {basePresets.map((p) => (
            <Chip key={p.id ?? 'none'} active={preset === p.id} onClick={() => applyPreset(p.id)}>
              {p.label}
            </Chip>
          ))}
        </ChipRow>

        {tab === 'groups' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-start gap-4">
              <MatrixBrackets label="A" dimLabel={dimSuperscript(d.rows, d.cols)}>
                <MatrixGrid
                  matrix={A}
                  onChange={(m) => {
                    setA(m);
                    setPreset(null);
                  }}
                  editable
                  highlightRow={highlightRow}
                  highlightCol={highlightCol}
                  name="A"
                />
              </MatrixBrackets>
              {showAbs ? <AbsoluteMatrix matrix={A} /> : null}
            </div>

            <SumBars sums={sums} dominant={dominant} orientation={orientation} />

            <ToggleRow label="Mostrar valores absolutos |aᵢⱼ|" checked={showAbs} onChange={setShowAbs} />

            <div className="flex flex-wrap gap-2">
              {dominant.map((idx) => (
                <Badge key={idx} tone="ok">
                  {cfg.groupNoun} {idx + 1}: Σ = {present(sums[idx] ?? 0)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {tab === 'operator' && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--fg-muted)]">
              Norma inducida: max<sub>‖x‖=1</sub> ‖Ax‖. La amplificación ‖Ax‖ / ‖x‖ nunca supera {cfg.normLabel}.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 rounded-lg border border-[var(--border)] p-3">
                <p className="text-xs font-semibold uppercase text-[var(--fg-muted)]">Vector x</p>
                <p className="font-mono text-sm">x = {formatVec(xVec)}</p>
                <p className="font-mono text-xs text-[var(--fg-muted)]">
                  {cfg.xNormLabel} = {present(xNorm)}
                </p>
                {size === 2 ? (
                  <ControlsStack>
                    <SliderRow
                      label="x₁"
                      value={unitX ? v2.x : x[0] ?? 0}
                      min={-2}
                      max={2}
                      step={0.05}
                      onChange={(v) => {
                        if (unitX) setV2({ x: v, y: v2.y });
                        else setX([v, x[1] ?? 0, x[2] ?? 0]);
                        setPreset(null);
                      }}
                    />
                    <SliderRow
                      label="x₂"
                      value={unitX ? v2.y : x[1] ?? 0}
                      min={-2}
                      max={2}
                      step={0.05}
                      onChange={(v) => {
                        if (unitX) setV2({ x: v2.x, y: v });
                        else setX([x[0] ?? 0, v, x[2] ?? 0]);
                        setPreset(null);
                      }}
                    />
                  </ControlsStack>
                ) : (
                  <ControlsStack>
                    {Array.from({ length: n }, (_, i) => (
                      <SliderRow
                        key={i}
                        label={`x${sub(i + 1)}`}
                        value={xVec[i] ?? 0}
                        min={-2}
                        max={2}
                        step={0.05}
                        onChange={(v) => {
                          const next = [...xVec];
                          next[i] = v;
                          setX(next);
                          setUnitX(false);
                          setPreset(null);
                        }}
                      />
                    ))}
                  </ControlsStack>
                )}
              </div>

              <div className="space-y-2 rounded-lg border border-[var(--border)] p-3">
                <p className="text-xs font-semibold uppercase text-[var(--fg-muted)]">Imagen Ax</p>
                <p className="font-mono text-sm">Ax = {formatVec(ax)}</p>
                <p className="font-mono text-xs text-[var(--fg-muted)]">
                  {cfg.axNormLabel} = {present(axNorm)}
                </p>
                <p className="font-mono text-xs">
                  Amplificación = {present(amp)}
                  {amp >= normA - 1e-6 ? (
                    <span className="ml-2">
                      <Badge tone="ok">≈ máximo</Badge>
                    </span>
                  ) : null}
                </p>
              </div>
            </div>

            <div
              className={`rounded-lg border px-3 py-2 font-mono text-sm ${
                inequalityOk
                  ? 'border-emerald-600/30 bg-emerald-500/10'
                  : 'border-rose-600/30 bg-rose-500/10'
              }`}
            >
              {cfg.axNormLabel} ≤ {cfg.normLabel} · {cfg.xNormLabel} → {present(axNorm)} ≤{' '}
              {present(bound)}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ToggleRow
                label={`Mantener ${cfg.xNormLabel}=1`}
                checked={unitX}
                onChange={setUnitX}
              />
              <VizButton onClick={findMaxVector}>Encontrar vector máximo</VizButton>
            </div>

            <CollapsibleEdit label="Editar A" open={editOpen} onToggle={() => setEditOpen(!editOpen)}>
              {size === 2 ? (
                <Mat2Editor m={mat2FromMatrix(A)} onChange={(m) => setA(matrixFromMat2(m))} />
              ) : (
                <MatrixGrid matrix={A} onChange={setA} editable name="A" />
              )}
            </CollapsibleEdit>
          </div>
        )}

        {tab === 'geo' && (
          <div className="space-y-3">
            {size !== 2 ? (
              <p className="text-sm text-[var(--fg-muted)]">
                La vista geométrica solo está disponible para matrices 2×2. Cambia a 2×2.
              </p>
            ) : (
              <>
                <p className="text-sm text-[var(--fg-muted)]">
                  {cfg.p === 1
                    ? 'La bola unidad L₁ es un rombo (diamante). La imagen A·B₁ queda dentro de una bola de radio ‖A‖₁.'
                    : 'La bola unidad L∞ es un cuadrado. La imagen A·B∞ queda dentro de una bola de radio ‖A‖∞.'}
                </p>

                <div className="overflow-hidden rounded-lg border border-[var(--border)]">
                  <svg
                    viewBox={`0 0 ${W} ${H}`}
                    className="h-auto w-full touch-none"
                    role="img"
                    aria-label="Geometría de la norma matricial"
                    style={{ minHeight: 260 }}
                  >
                    <defs>
                      <ArrowMarker id={`${uid}-x`} color={COLOR_V} />
                      <ArrowMarker id={`${uid}-ax`} color={COLOR_U} />
                    </defs>
                    <Axes W={W} H={H} ox={ox} oy={oy} S={S} ticks={[-2, -1, 1, 2]} />

                    {/* Unit ball */}
                    <polygon
                      points={polyPoints(unitBall, to)}
                      fill="color-mix(in oklab, var(--accent-soft) 25%, transparent)"
                      stroke={COLOR_V}
                      strokeWidth={1.5}
                      strokeDasharray="5 4"
                      opacity={0.85}
                    />

                    {/* Transformed unit ball A·B */}
                    <polygon
                      points={polyPoints(transformedUnit, to)}
                      fill="color-mix(in oklab, var(--accent-strong) 20%, transparent)"
                      stroke="var(--accent-strong)"
                      strokeWidth={2}
                    />

                    {/* Containing ball of radius ‖A‖ */}
                    <polygon
                      points={polyPoints(scaledBall, to)}
                      fill="none"
                      stroke={COLOR_W}
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      opacity={0.7}
                    />

                    {/* x and Ax */}
                    <line
                      x1={ox}
                      y1={oy}
                      x2={tipX.x}
                      y2={tipX.y}
                      stroke={COLOR_V}
                      strokeWidth={2}
                      markerEnd={`url(#${uid}-x)`}
                    />
                    <line
                      x1={ox}
                      y1={oy}
                      x2={tipAx.x}
                      y2={tipAx.y}
                      stroke={COLOR_U}
                      strokeWidth={2.5}
                      markerEnd={`url(#${uid}-ax)`}
                    />

                    <text
                      x={labelOffset({ x: xVec[0] ?? 0, y: xVec[1] ?? 0 }, tipX, ox, oy, 14).x}
                      y={labelOffset({ x: xVec[0] ?? 0, y: xVec[1] ?? 0 }, tipX, ox, oy, 14).y}
                      fontSize={11}
                      fill={COLOR_V}
                    >
                      x
                    </text>
                    <text
                      x={labelOffset(ax2, tipAx, ox, oy, 14).x}
                      y={labelOffset(ax2, tipAx, ox, oy, 14).y}
                      fontSize={11}
                      fill={COLOR_U}
                    >
                      Ax
                    </text>

                    <circle
                      cx={tipX.x}
                      cy={tipX.y}
                      r={7}
                      fill={COLOR_V}
                      style={{ cursor: 'grab' }}
                      {...dragV}
                    />
                  </svg>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  <Badge tone="neutral">
                    x = {formatPair({ x: xVec[0] ?? 0, y: xVec[1] ?? 0 })}
                  </Badge>
                  <Badge tone="neutral">Ax = {formatPair(ax2)}</Badge>
                  <Badge tone="ok">{cfg.normLabel} = {present(normA)}</Badge>
                </div>

                <ControlsStack>
                  <ToggleRow
                    label={`Mantener ${cfg.xNormLabel}=1`}
                    checked={unitX}
                    onChange={setUnitX}
                  />
                  <VizButton onClick={findMaxVector}>Encontrar vector máximo</VizButton>
                </ControlsStack>

                <CollapsibleEdit label="Editar A" open={editOpen} onToggle={() => setEditOpen(!editOpen)}>
                  <Mat2Editor m={mat2FromMatrix(A)} onChange={(m) => setA(matrixFromMat2(m))} />
                </CollapsibleEdit>
              </>
            )}
          </div>
        )}
      </div>
    </VizPanel>
  );
}
