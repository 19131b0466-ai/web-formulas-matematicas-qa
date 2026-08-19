'use client';

import { useId, useMemo, useState } from 'react';
import type { Mat2 } from './math2d';
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
import { cloneMat, formatNum, matVec, type Mat } from './decompMath';
import {
  amplification,
  spectralNorm,
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
  I2,
  Mat2Editor,
  PRESET_ROT45,
  PRESET_SCALE,
  PRESET_SHEAR,
  PRESET_SINGULAR,
  PRESET_ZERO,
  Segmented,
  cloneMat2,
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

type Mode = 'direction' | 'ellipse' | 'svd';
type PresetId = 'id' | 'scale' | 'rot' | 'shear' | 'rank1' | 'zero' | null;

const MODE_OPTS = [
  { id: 'direction', label: 'Explorar dirección' },
  { id: 'ellipse', label: 'Círculo → elipse' },
  { id: 'svd', label: 'SVD' },
];

const PRESETS: Array<{ id: PresetId; label: string; m: Mat2 }> = [
  { id: 'id', label: 'Identidad', m: I2 },
  { id: 'scale', label: 'Escalado', m: PRESET_SCALE },
  { id: 'rot', label: 'Rotación', m: PRESET_ROT45 },
  { id: 'shear', label: 'Cizallamiento', m: PRESET_SHEAR },
  { id: 'rank1', label: 'Rango 1', m: PRESET_SINGULAR },
  { id: 'zero', label: 'Cero', m: PRESET_ZERO },
];

const W = VEC_W;
const H = VEC_H;
const ox = W / 2;
const oy = H / 2;

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

function MatDisplay({ M, label }: { M: Mat; label: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2">
      <p className="mb-1 text-center text-xs font-medium text-[var(--fg-muted)]">{label}</p>
      <div className="font-mono text-xs tabular-nums text-[var(--fg)]">
        {M.map((row, i) => (
          <div key={i} className="flex justify-center gap-2">
            {row.map((v, j) => (
              <span key={j} className="min-w-[2.4rem] text-center">
                {formatNum(v)}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Norma espectral ‖A‖₂ = σ₁ como máximo estiramiento (ALG-NOR-005). */
export function SpectralNormVisualizer() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [mode, setMode] = useState<Mode>('direction');
  const [A2, setA2] = useState<Mat2>(() => cloneMat2(PRESET_SCALE));
  const [preset, setPreset] = useState<PresetId>('scale');
  const [theta, setTheta] = useState(Math.PI / 5);
  const [showSingular, setShowSingular] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const A = useMemo(() => mat2ToMat(A2), [A2]);
  const { sigma1, sigma2, v1, v2, u1, u2 } = useMemo(() => svd2x2(A), [A]);
  const normA = useMemo(() => spectralNorm(A), [A]);

  const x = useMemo(() => ({ x: Math.cos(theta), y: Math.sin(theta) }), [theta]);
  const xVec = useMemo<[number, number]>(() => [x.x, x.y], [x]);
  const Ax = useMemo(() => matVec(A, xVec), [A, xVec]);
  const axNorm = useMemo(() => vectorTwoNorm(Ax), [Ax]);
  const amp = useMemo(() => amplification(A, xVec, 2), [A, xVec]);

  const circle = useMemo(() => unitBallBoundary2D(2, 96), []);
  const ellipse = useMemo(() => transformPoints2D(A, circle), [A, circle]);

  const reach = Math.max(normA, axNorm, sigma2, 1.2) * 1.12;
  const S = autoScale(reach, Math.min(W, H), 48, 28, 58);
  const to = (p: { x: number; y: number }) => ({ x: ox + p.x * S, y: oy - p.y * S });

  const Umat: Mat = useMemo(
    () => [
      [u1.x, u2.x],
      [u1.y, u2.y],
    ],
    [u1, u2],
  );
  const VtMat: Mat = useMemo(
    () => [
      [v1.x, v1.y],
      [v2.x, v2.y],
    ],
    [v1, v2],
  );
  const Sigma: Mat = useMemo(
    () => [
      [sigma1, 0],
      [0, sigma2],
    ],
    [sigma1, sigma2],
  );

  const applyPreset = (id: PresetId) => {
    const p = PRESETS.find((item) => item.id === id);
    if (!p) return;
    setA2(cloneMat2(p.m));
    setPreset(id);
  };

  const seekMaximum = () => setTheta(Math.atan2(v1.y, v1.x));

  const caption = joinCaption(`‖A‖₂ = σ₁ = ${formatNum(normA)}`, `σ₂ = ${formatNum(sigma2)}`);

  const dragHandlers = {
    onPointerDown: (e: React.PointerEvent) => {
      (e.target as Element).setPointerCapture?.(e.pointerId);
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (!(e.buttons & 1)) return;
      const svg =
        (e.currentTarget as SVGSVGElement).ownerSVGElement ?? (e.currentTarget as SVGSVGElement);
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const sp = pt.matrixTransform(ctm.inverse());
      const wx = (sp.x - ox) / S;
      const wy = -(sp.y - oy) / S;
      if (Math.hypot(wx, wy) < 1e-9) return;
      setTheta(Math.atan2(wy, wx));
    },
  };

  const axPt = { x: Ax[0] ?? 0, y: Ax[1] ?? 0 };

  return (
    <VizPanel caption={caption}>
      <div className="space-y-3">
        <GuideBlock
          idea="Vas a ver que la norma espectral es el mayor estiramiento que A puede producir sobre un vector unitario."
          tryIt="Mueve x sobre el círculo unitario y compara ‖Ax‖₂. Encuentra la dirección donde el estiramiento es máximo."
        />

        <div className="flex flex-wrap items-center gap-2">
          <Segmented options={MODE_OPTS} value={mode} onChange={(id) => setMode(id as Mode)} />
          <Badge tone="neutral">Norma: ‖·‖₂</Badge>
        </div>

        <ChipRow>
          {PRESETS.map((p) => (
            <Chip key={p.id ?? 'custom'} active={preset === p.id} onClick={() => applyPreset(p.id)}>
              {p.label}
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

        {mode === 'direction' ? (
          <>
            <section className="rounded-xl border border-[var(--border)] px-2 py-2">
              <svg
                viewBox={`0 0 ${W} ${H}`}
                className="mx-auto h-auto w-full max-w-xl touch-none"
                role="img"
                aria-label="Círculo unitario de entrada y vector de salida Ax"
              >
                <defs>
                  <ArrowMarker id={`${uid}-x`} color={COLOR_U} />
                  <ArrowMarker id={`${uid}-ax`} color={COLOR_W} />
                </defs>
                <Axes W={W} H={H} ox={ox} oy={oy} S={S} ticks={[-2, -1, 1, 2]} xLabel="x" yLabel="y" />
                <circle cx={ox} cy={oy} r={S} fill="none" stroke={COLOR_U} strokeWidth={1.5} opacity={0.35} />
                <polygon
                  points={polyPts(ellipse, to)}
                  fill="color-mix(in oklab, orange 12%, transparent)"
                  stroke={COLOR_W}
                  strokeWidth={1.2}
                  opacity={0.55}
                />
                {showSingular ? (
                  <>
                    <line
                      x1={ox}
                      y1={oy}
                      x2={to(v1).x}
                      y2={to(v1).y}
                      stroke={COLOR_V}
                      strokeWidth={1.5}
                      strokeDasharray="5 4"
                      opacity={0.85}
                    />
                    <line
                      x1={ox}
                      y1={oy}
                      x2={to(v2).x}
                      y2={to(v2).y}
                      stroke={COLOR_V}
                      strokeWidth={1.2}
                      strokeDasharray="4 4"
                      opacity={0.55}
                    />
                    <text {...labelOffset(v1, to(v1), ox, oy)} fontSize={10} fill={COLOR_V}>
                      v₁
                    </text>
                  </>
                ) : null}
                <line
                  x1={ox}
                  y1={oy}
                  x2={to(x).x}
                  y2={to(x).y}
                  stroke={COLOR_U}
                  strokeWidth={2.5}
                  markerEnd={`url(#${uid}-x)`}
                  {...dragHandlers}
                />
                <line
                  x1={ox}
                  y1={oy}
                  x2={to(axPt).x}
                  y2={to(axPt).y}
                  stroke={COLOR_W}
                  strokeWidth={2.5}
                  markerEnd={`url(#${uid}-ax)`}
                />
                <circle cx={to(x).x} cy={to(x).y} r={7} fill={COLOR_U} opacity={0.25} {...dragHandlers} />
                <text {...labelOffset(x, to(x), ox, oy)} fontSize={11} fill={COLOR_U}>
                  x
                </text>
                <text {...labelOffset(axPt, to(axPt), ox, oy)} fontSize={11} fill={COLOR_W}>
                  Ax
                </text>
              </svg>
            </section>

            <ControlsStack>
              <SliderRow
                label="θ"
                ariaLabel="Ángulo del vector unitario x"
                value={theta}
                min={-Math.PI}
                max={Math.PI}
                step={0.02}
                onChange={setTheta}
              />
              <ToggleRow
                label="Mostrar direcciones singulares"
                checked={showSingular}
                onChange={setShowSingular}
              />
              <ButtonRow>
                <VizButton onClick={seekMaximum}>Buscar máximo → v₁</VizButton>
              </ButtonRow>
            </ControlsStack>

            <section className="rounded-xl border border-[var(--border)] px-3 py-3" aria-live="polite">
              <p className="font-mono text-sm">
                x = ({present(x.x)}, {present(x.y)}), ‖x‖₂ = 1
              </p>
              <p className="mt-1 font-mono text-sm">
                ‖Ax‖₂ = {present(axNorm)} · amplificación = {present(amp)}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <CompareBar
                  label="‖Ax‖₂ actual"
                  value={axNorm}
                  max={Math.max(normA, axNorm, 0.01)}
                  tone={COLOR_W}
                  ariaLabel={`Norma actual ${fmt(axNorm)}`}
                />
                <CompareBar
                  label="‖A‖₂ = σ₁ (techo)"
                  value={normA}
                  max={Math.max(normA, axNorm, 0.01)}
                  tone={COLOR_U}
                  ariaLabel={`Norma espectral ${fmt(normA)}`}
                />
              </div>
            </section>
          </>
        ) : null}

        {mode === 'ellipse' ? (
          <>
            <section className="rounded-xl border border-[var(--border)] px-2 py-2">
              <svg
                viewBox={`0 0 ${W} ${H}`}
                className="mx-auto h-auto w-full max-w-xl"
                role="img"
                aria-label="Transformación del círculo unitario en elipse"
              >
                <defs>
                  <ArrowMarker id={`${uid}-s1`} color={COLOR_W} />
                  <ArrowMarker id={`${uid}-s2`} color={COLOR_V} />
                </defs>
                <Axes W={W} H={H} ox={ox} oy={oy} S={S} ticks={[-2, -1, 1, 2]} />
                <circle cx={ox} cy={oy} r={S} fill="none" stroke={COLOR_U} strokeWidth={1.5} opacity={0.45} />
                <polygon
                  points={polyPts(ellipse, to)}
                  fill="color-mix(in oklab, orange 14%, transparent)"
                  stroke={COLOR_W}
                  strokeWidth={2}
                />
                {showSingular ? (
                  <>
                    <line
                      x1={ox}
                      y1={oy}
                      x2={to({ x: u1.x * sigma1, y: u1.y * sigma1 }).x}
                      y2={to({ x: u1.x * sigma1, y: u1.y * sigma1 }).y}
                      stroke={COLOR_W}
                      strokeWidth={2.5}
                      markerEnd={`url(#${uid}-s1)`}
                    />
                    <line
                      x1={ox}
                      y1={oy}
                      x2={to({ x: u2.x * sigma2, y: u2.y * sigma2 }).x}
                      y2={to({ x: u2.x * sigma2, y: u2.y * sigma2 }).y}
                      stroke={COLOR_V}
                      strokeWidth={2}
                      markerEnd={`url(#${uid}-s2)`}
                    />
                  </>
                ) : null}
              </svg>
            </section>
            <ControlsStack>
              <ToggleRow
                label="Mostrar direcciones singulares"
                checked={showSingular}
                onChange={setShowSingular}
              />
            </ControlsStack>
            <section className="rounded-xl border border-[var(--border)] px-3 py-3 text-sm leading-relaxed">
              <p>
                El círculo unitario se transforma en la elipse A(S¹). Semiejes: σ₁ = {formatNum(sigma1)}, σ₂ ={' '}
                {formatNum(sigma2)}.
              </p>
              <p className="mt-2 font-mono text-[var(--accent-strong)]">‖A‖₂ = σ₁ = {formatNum(normA)}</p>
            </section>
          </>
        ) : null}

        {mode === 'svd' ? (
          <>
            <section className="rounded-xl border border-[var(--border)] px-3 py-3 text-sm leading-relaxed">
              <p className="font-mono text-[var(--accent-strong)]">A = U Σ Vᵀ</p>
              <p className="mt-2 text-[var(--fg-muted)]">
                ‖A‖₂ = σ₁. Los vectores singulares derechos (filas de Vᵀ) son las direcciones de máximo
                estiramiento.
              </p>
            </section>
            <div className="grid gap-3 sm:grid-cols-3">
              <MatDisplay M={cloneMat(VtMat)} label="Vᵀ" />
              <MatDisplay M={Sigma} label="Σ" />
              <MatDisplay M={cloneMat(Umat)} label="U" />
            </div>
          </>
        ) : null}
      </div>
    </VizPanel>
  );
}
