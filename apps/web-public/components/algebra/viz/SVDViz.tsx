'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  SliderRow,
  VizButton,
  VizPanel,
  joinCaption,
} from './controls';
import {
  type Mat,
  type Vec,
  LSQ_NEAR,
  cloneMat,
  formatNum,
  matFrobenius,
  matMul,
  matSub,
  matVec,
  svd,
} from './decompMath';
import {
  Badge,
  Chip,
  ChipRow,
  CollapsibleEdit,
  GuideBlock,
  Segmented,
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
} from './vectorPlane';

type Mode = 'transform' | 'dirs' | 'mats';
type Step = 'orig' | 'Vt' | 'S' | 'U';
type PresetId = 'rotstretch' | 'stretch' | 'rank1' | 'id' | 'ortho' | null;
type Highlight = 'v1' | 'v2';

const MODE_OPTS = [
  { id: 'transform', label: 'Transformación' },
  { id: 'dirs', label: 'Direcciones' },
  { id: 'mats', label: 'Matrices' },
];

const STEP_OPTS = [
  { id: 'orig', label: 'Original' },
  { id: 'Vt', label: 'Vᵀ' },
  { id: 'S', label: 'Σ' },
  { id: 'U', label: 'U' },
];

const PRESETS: Array<{ id: PresetId; label: string; A: Mat }> = [
  {
    id: 'rotstretch',
    label: 'Rotar+estirar',
    A: [
      [2.4, 0.9],
      [0.6, 1.5],
    ],
  },
  {
    id: 'stretch',
    label: 'Estirar',
    A: [
      [2.8, 0],
      [0, 1.1],
    ],
  },
  {
    id: 'rank1',
    label: 'Rango 1',
    A: [
      [2, 1],
      [2, 1],
    ],
  },
  {
    id: 'id',
    label: 'Identidad',
    A: [
      [1, 0],
      [0, 1],
    ],
  },
  {
    id: 'ortho',
    label: 'Ortogonal',
    A: (() => {
      const t = Math.PI / 5;
      const c = Math.cos(t);
      const s = Math.sin(t);
      return [
        [c, -s],
        [s, c],
      ];
    })(),
  },
];

const W = Math.round(VEC_W * 1.05);
const H = Math.round(VEC_H * 1.05);
const ox = W / 2;
const oy = H / 2;

function unitCircle(n = 96): Array<{ x: number; y: number }> {
  return Array.from({ length: n }, (_, i) => {
    const t = (2 * Math.PI * i) / n;
    return { x: Math.cos(t), y: Math.sin(t) };
  });
}

function apply2(M: Mat, p: { x: number; y: number }): { x: number; y: number } {
  return {
    x: (M[0]?.[0] ?? 0) * p.x + (M[0]?.[1] ?? 0) * p.y,
    y: (M[1]?.[0] ?? 0) * p.x + (M[1]?.[1] ?? 0) * p.y,
  };
}

function matFrom2x2(a: number, b: number, c: number, d: number): Mat {
  return [
    [a, b],
    [c, d],
  ];
}

function I2(): Mat {
  return matFrom2x2(1, 0, 0, 1);
}

function diag2(s1: number, s2: number): Mat {
  return matFrom2x2(s1, 0, 0, s2);
}

function polyPts(
  pts: Array<{ x: number; y: number }>,
  to: (p: { x: number; y: number }) => { x: number; y: number },
): string {
  return pts
    .map((p) => {
      const q = to(p);
      return `${q.x},${q.y}`;
    })
    .join(' ');
}

function gridLines(extent = 2.4, n = 9): Array<[{ x: number; y: number }, { x: number; y: number }]> {
  const lines: Array<[{ x: number; y: number }, { x: number; y: number }]> = [];
  for (let i = 0; i < n; i++) {
    const t = -extent + (2 * extent * i) / (n - 1);
    lines.push(
      [
        { x: t, y: -extent },
        { x: t, y: extent },
      ],
      [
        { x: -extent, y: t },
        { x: extent, y: t },
      ],
    );
  }
  return lines;
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

/**
 * Descomposición A = UΣVᵀ como orientación → escala → reorientación (ALG-DEC-004).
 * No menciona “SVD/QR” en la UI pedagógica de pasos.
 */
export function SVDViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [mode, setMode] = useState<Mode>('transform');
  const [step, setStep] = useState<Step>('orig');
  const [A, setA] = useState<Mat>(() => cloneMat(PRESETS[0]!.A));
  const [preset, setPreset] = useState<PresetId>('rotstretch');
  const [highlight, setHighlight] = useState<Highlight>('v1');
  const [follow, setFollow] = useState(false);
  const [xCoords, setXCoords] = useState({ x: 0.85, y: 0.55 });
  const [editOpen, setEditOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reduceMotion = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      reduceMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  const { U, S, Vt, rank, tol } = useMemo(() => svd(A), [A]);
  const σ1 = S[0] ?? 0;
  const σ2 = S[1] ?? 0;

  const Umat: Mat = useMemo(
    () => [
      [U[0]?.[0] ?? 1, U[0]?.[1] ?? 0],
      [U[1]?.[0] ?? 0, U[1]?.[1] ?? 1],
    ],
    [U],
  );
  const VtMat: Mat = useMemo(
    () => [
      [Vt[0]?.[0] ?? 1, Vt[0]?.[1] ?? 0],
      [Vt[1]?.[0] ?? 0, Vt[1]?.[1] ?? 1],
    ],
    [Vt],
  );
  const Sigma = useMemo(() => diag2(σ1, σ2), [σ1, σ2]);

  const recon = useMemo(() => matMul(Umat, matMul(Sigma, VtMat)), [Umat, Sigma, VtMat]);
  const reconErr = useMemo(() => matFrobenius(matSub(A, recon)), [A, recon]);

  const v1: Vec = useMemo(() => [Vt[0]?.[0] ?? 1, Vt[0]?.[1] ?? 0], [Vt]);
  const v2: Vec = useMemo(() => [Vt[1]?.[0] ?? 0, Vt[1]?.[1] ?? 1], [Vt]);
  const u1 = useMemo(() => ({ x: U[0]?.[0] ?? 1, y: U[1]?.[0] ?? 0 }), [U]);
  const u2 = useMemo(() => ({ x: U[0]?.[1] ?? 0, y: U[1]?.[1] ?? 1 }), [U]);

  const Av1 = useMemo(() => matVec(A, v1), [A, v1]);
  const Av2 = useMemo(() => matVec(A, v2), [A, v2]);

  /** Cumulative map for current step: I → Vᵀ → ΣVᵀ → UΣVᵀ. */
  const displayMat: Mat = useMemo(() => {
    if (step === 'orig') return I2();
    if (step === 'Vt') return VtMat;
    if (step === 'S') return matMul(Sigma, VtMat);
    return matMul(Umat, matMul(Sigma, VtMat));
  }, [step, VtMat, Sigma, Umat]);

  const reach = Math.max(σ1, σ2, 1.2) * 1.15;
  const Sscale = autoScale(reach, Math.min(W, H), 50, 24, 62);
  const to = (p: { x: number; y: number }) => ({ x: ox + p.x * Sscale, y: oy - p.y * Sscale });

  const circle = useMemo(() => unitCircle(96), []);
  const markers = useMemo(() => {
    // reference points on unit circle
    const angs = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, (5 * Math.PI) / 4];
    return angs.map((t) => ({ x: Math.cos(t), y: Math.sin(t) }));
  }, []);

  const transformedCircle = useMemo(
    () => circle.map((p) => apply2(displayMat, p)),
    [circle, displayMat],
  );
  const transformedMarkers = useMemo(
    () => markers.map((p) => apply2(displayMat, p)),
    [markers, displayMat],
  );
  const grid = useMemo(() => gridLines(2.2, 9), []);
  const transformedGrid = useMemo(
    () =>
      grid.map(([a, b]) => [apply2(displayMat, a), apply2(displayMat, b)] as const),
    [grid, displayMat],
  );

  const e1 = { x: 1, y: 0 };
  const e2 = { x: 0, y: 1 };
  const e1t = apply2(displayMat, e1);
  const e2t = apply2(displayMat, e2);
  const v1p = { x: v1[0]!, y: v1[1]! };
  const v2p = { x: v2[0]!, y: v2[1]! };

  const pipeline = useMemo(() => {
    const x0: Vec = [xCoords.x, xCoords.y];
    const xVt = matVec(VtMat, x0);
    const xS = matVec(Sigma, xVt);
    const xU = matVec(Umat, xS);
    const Ax = matVec(A, x0);
    return { x0, xVt, xS, xU, Ax };
  }, [xCoords.x, xCoords.y, VtMat, Sigma, Umat, A]);

  const followPos = useMemo(() => {
    if (!follow) return null;
    if (step === 'orig') return { x: pipeline.x0[0]!, y: pipeline.x0[1]! };
    if (step === 'Vt') return { x: pipeline.xVt[0]!, y: pipeline.xVt[1]! };
    if (step === 'S') return { x: pipeline.xS[0]!, y: pipeline.xS[1]! };
    return { x: pipeline.xU[0]!, y: pipeline.xU[1]! };
  }, [follow, step, pipeline]);

  const stopPlay = () => {
    if (playRef.current) {
      clearInterval(playRef.current);
      playRef.current = null;
    }
    setPlaying(false);
  };

  useEffect(() => () => stopPlay(), []);

  const playSteps = () => {
    if (reduceMotion.current) {
      // Jump through steps without animation
      const order: Step[] = ['orig', 'Vt', 'S', 'U'];
      const idx = order.indexOf(step);
      setStep(order[(idx + 1) % 4]!);
      return;
    }
    if (playing) {
      stopPlay();
      return;
    }
    setPlaying(true);
    setMode('transform');
    const order: Step[] = ['orig', 'Vt', 'S', 'U'];
    let i = 0;
    setStep('orig');
    playRef.current = setInterval(() => {
      i += 1;
      if (i >= order.length) {
        stopPlay();
        setStep('U');
        return;
      }
      setStep(order[i]!);
    }, 900);
  };

  const applyPreset = (id: PresetId) => {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    stopPlay();
    setA(cloneMat(p.A));
    setPreset(id);
    setStep('orig');
  };

  const onEdit = (i: number, j: number, raw: string) => {
    const v = Number(raw);
    if (!Number.isFinite(v)) return;
    const next = cloneMat(A);
    next[i]![j] = v;
    setA(next);
    setPreset(null);
    stopPlay();
  };

  const caption = joinCaption(
    `σ₁=${formatNum(σ1)}`,
    `σ₂=${formatNum(σ2)}`,
    `rango=${rank}`,
  );

  const hi = highlight === 'v1';
  const Av = hi ? Av1 : Av2;
  const σ = hi ? σ1 : σ2;
  const u = hi ? u1 : u2;
  const v = hi ? v1p : v2p;

  return (
    <VizPanel title="Orientación · escala · reorientación" caption={caption}>
      <div className="space-y-3">
        <GuideBlock
          idea="A = UΣVᵀ separa orientación (Vᵀ), escalado axial (Σ) y reorientación (U)."
          tryIt="Avanza Original → Vᵀ → Σ → U. El círculo permanece círculo tras Vᵀ; Σ lo convierte en elipse; U la gira."
          concept="Av_i = σ_i u_i: los vectores singulares derechos se estiran a la longitud σ_i en dirección u_i."
        />

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={MODE_OPTS}
            value={mode}
            onChange={(id) => {
              stopPlay();
              setMode(id as Mode);
            }}
          />
          {mode === 'transform' ? (
            <Segmented
              options={STEP_OPTS}
              value={step}
              onChange={(id) => {
                stopPlay();
                setStep(id as Step);
              }}
            />
          ) : null}
        </div>

        <ChipRow>
          {PRESETS.map((p) => (
            <Chip key={p.id} active={preset === p.id} onClick={() => applyPreset(p.id)}>
              {p.label}
            </Chip>
          ))}
        </ChipRow>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="ok">
            A v{hi ? '₁' : '₂'} = σ{hi ? '₁' : '₂'} u{hi ? '₁' : '₂'}
          </Badge>
          <Badge tone="neutral">
            ({formatNum(Av[0]!)}, {formatNum(Av[1]!)}) ≈ ({formatNum(σ * u.x)}, {formatNum(σ * u.y)})
          </Badge>
          {step === 'Vt' ? <Badge tone="ok">ORTOGONAL · forma preservada</Badge> : null}
          {step === 'S' ? <Badge tone="warn">ESCALA · elipse alineada</Badge> : null}
          {step === 'U' ? <Badge tone="ok">REORIENTACIÓN</Badge> : null}
        </div>

        {(mode === 'transform' || mode === 'dirs') && (
          <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg)]">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-auto w-full"
              role="img"
              aria-label="Transformación por factores de A"
              style={{ minHeight: 280 }}
            >
              <defs>
                <ArrowMarker id={`${uid}-e`} color="var(--fg-muted)" />
                <ArrowMarker id={`${uid}-v`} color={COLOR_V} />
                <ArrowMarker id={`${uid}-u`} color={COLOR_U} />
                <ArrowMarker id={`${uid}-w`} color={COLOR_W} />
              </defs>
              <Axes W={W} H={H} ox={ox} oy={oy} S={Sscale} ticks={[-2, -1, 1, 2]} />

              {/* low-opacity transformed grid */}
              <g opacity={0.22}>
                {transformedGrid.map(([a, b], i) => {
                  const A_ = to(a);
                  const B_ = to(b);
                  return (
                    <line
                      key={i}
                      x1={A_.x}
                      y1={A_.y}
                      x2={B_.x}
                      y2={B_.y}
                      stroke="var(--fg-muted)"
                      strokeWidth={1}
                    />
                  );
                })}
              </g>

              {/* unit circle ghost */}
              <polygon
                points={polyPts(circle, to)}
                fill="none"
                stroke="var(--fg-muted)"
                strokeWidth={1}
                strokeDasharray="4 3"
                opacity={0.35}
              />

              {/* transformed shape */}
              <polygon
                points={polyPts(transformedCircle, to)}
                fill="color-mix(in oklab, var(--accent-soft) 45%, transparent)"
                stroke="var(--accent-strong)"
                strokeWidth={2}
                opacity={0.95}
              />

              {/* markers on circle */}
              {transformedMarkers.map((p, i) => {
                const q = to(p);
                return (
                  <circle
                    key={i}
                    cx={q.x}
                    cy={q.y}
                    r={3.5}
                    fill="var(--fg-muted)"
                    opacity={0.7}
                  />
                );
              })}

              {/* e1, e2 after map */}
              <line
                x1={ox}
                y1={oy}
                x2={to(e1t).x}
                y2={to(e1t).y}
                stroke="var(--fg-muted)"
                strokeWidth={1.5}
                markerEnd={`url(#${uid}-e)`}
                opacity={0.7}
              />
              <line
                x1={ox}
                y1={oy}
                x2={to(e2t).x}
                y2={to(e2t).y}
                stroke="var(--fg-muted)"
                strokeWidth={1.5}
                markerEnd={`url(#${uid}-e)`}
                opacity={0.7}
              />
              <text x={to(e1t).x + 4} y={to(e1t).y - 4} fontSize={10} fill="var(--fg-muted)">
                e₁
              </text>
              <text x={to(e2t).x + 4} y={to(e2t).y - 4} fontSize={10} fill="var(--fg-muted)">
                e₂
              </text>

              {/* v1, v2 (domain) — shown at orig / Vt conceptually */}
              {(step === 'orig' || mode === 'dirs') && (
                <>
                  <line
                    x1={ox}
                    y1={oy}
                    x2={to(v1p).x}
                    y2={to(v1p).y}
                    stroke={COLOR_V}
                    strokeWidth={hi ? 2.4 : 1.4}
                    markerEnd={`url(#${uid}-v)`}
                    opacity={hi ? 1 : 0.45}
                  />
                  <line
                    x1={ox}
                    y1={oy}
                    x2={to(v2p).x}
                    y2={to(v2p).y}
                    stroke={COLOR_V}
                    strokeWidth={!hi ? 2.4 : 1.4}
                    markerEnd={`url(#${uid}-v)`}
                    opacity={!hi ? 1 : 0.45}
                    strokeDasharray={!hi ? undefined : '4 3'}
                  />
                  <text
                    x={labelOffset(v1p, to(v1p), ox, oy, 14).x}
                    y={labelOffset(v1p, to(v1p), ox, oy, 14).y}
                    fontSize={11}
                    fill={COLOR_V}
                  >
                    v₁
                  </text>
                  <text
                    x={labelOffset(v2p, to(v2p), ox, oy, 14).x}
                    y={labelOffset(v2p, to(v2p), ox, oy, 14).y}
                    fontSize={11}
                    fill={COLOR_V}
                  >
                    v₂
                  </text>
                </>
              )}

              {/* After Vt: show that Vᵀv_i = e_i */}
              {step === 'Vt' ? (
                <text x={24} y={H - 18} fontSize={11} fill="var(--fg-muted)">
                  Vᵀv₁ ≈ e₁ · Vᵀv₂ ≈ e₂
                </text>
              ) : null}

              {/* Σ step: axis-aligned ellipse labels */}
              {step === 'S' ? (
                <>
                  <text x={to({ x: σ1, y: 0 }).x + 4} y={oy - 6} fontSize={12} fill={COLOR_U}>
                    σ₁={formatNum(σ1)}
                  </text>
                  <text x={ox + 6} y={to({ x: 0, y: σ2 }).y - 4} fontSize={12} fill={COLOR_V}>
                    σ₂={formatNum(σ2)}
                  </text>
                </>
              ) : null}

              {/* U / full: σ u directions */}
              {(step === 'U' || mode === 'dirs') && (
                <>
                  <line
                    x1={ox}
                    y1={oy}
                    x2={to({ x: u1.x * σ1, y: u1.y * σ1 }).x}
                    y2={to({ x: u1.x * σ1, y: u1.y * σ1 }).y}
                    stroke={COLOR_U}
                    strokeWidth={hi ? 2.6 : 1.5}
                    markerEnd={`url(#${uid}-u)`}
                    opacity={hi ? 1 : 0.5}
                  />
                  {σ2 > tol ? (
                    <line
                      x1={ox}
                      y1={oy}
                      x2={to({ x: u2.x * σ2, y: u2.y * σ2 }).x}
                      y2={to({ x: u2.x * σ2, y: u2.y * σ2 }).y}
                      stroke={COLOR_U}
                      strokeWidth={!hi ? 2.6 : 1.5}
                      markerEnd={`url(#${uid}-u)`}
                      opacity={!hi ? 1 : 0.5}
                    />
                  ) : null}
                  <text
                    x={to({ x: u1.x * σ1, y: u1.y * σ1 }).x + 6}
                    y={to({ x: u1.x * σ1, y: u1.y * σ1 }).y - 4}
                    fontSize={11}
                    fill={COLOR_U}
                  >
                    σ₁ u₁
                  </text>
                  {σ2 > tol ? (
                    <text
                      x={to({ x: u2.x * σ2, y: u2.y * σ2 }).x + 6}
                      y={to({ x: u2.x * σ2, y: u2.y * σ2 }).y - 4}
                      fontSize={11}
                      fill={COLOR_U}
                    >
                      σ₂ u₂
                    </text>
                  ) : null}
                </>
              )}

              {/* follow vector x */}
              {follow && followPos ? (
                <>
                  <line
                    x1={ox}
                    y1={oy}
                    x2={to(followPos).x}
                    y2={to(followPos).y}
                    stroke={COLOR_W}
                    strokeWidth={2.2}
                    markerEnd={`url(#${uid}-w)`}
                  />
                  <text x={to(followPos).x + 6} y={to(followPos).y + 4} fontSize={11} fill={COLOR_W}>
                    x
                  </text>
                </>
              ) : null}

              {/* highlight Av */}
              {mode === 'dirs' ? (
                <line
                  x1={ox}
                  y1={oy}
                  x2={to({ x: Av[0]!, y: Av[1]! }).x}
                  y2={to({ x: Av[0]!, y: Av[1]! }).y}
                  stroke={COLOR_W}
                  strokeWidth={2}
                  markerEnd={`url(#${uid}-w)`}
                  opacity={0.85}
                />
              ) : null}
            </svg>
          </div>
        )}

        {mode === 'transform' || mode === 'dirs' ? (
          <div className="space-y-2">
            {step === 'S' || mode === 'dirs' ? (
              <div className="flex items-end gap-2" style={{ height: 56 }}>
                {[σ1, σ2].map((σv, i) => {
                  const maxS = Math.max(σ1, σ2, LSQ_NEAR);
                  const h = Math.max(4, (σv / maxS) * 48);
                  return (
                    <div key={i} className="flex flex-1 flex-col items-center gap-0.5">
                      <span className="font-mono text-[10px] text-[var(--fg-muted)]">{formatNum(σv)}</span>
                      <div
                        className="w-full max-w-[3rem] rounded-t-sm bg-teal-600/70"
                        style={{ height: h }}
                      />
                      <span className="font-mono text-[10px] text-[var(--fg-muted)]">σ{i + 1}</span>
                    </div>
                  );
                })}
              </div>
            ) : null}

            <ButtonRow>
              <VizButton active={highlight === 'v1'} onClick={() => setHighlight('v1')}>
                Destacar v₁
              </VizButton>
              <VizButton active={highlight === 'v2'} onClick={() => setHighlight('v2')}>
                Destacar v₂
              </VizButton>
              <VizButton active={follow} onClick={() => setFollow((f) => !f)}>
                Seguir un vector x
              </VizButton>
              <VizButton active={playing} onClick={playSteps}>
                ▶ Reproducir
              </VizButton>
            </ButtonRow>

            {follow ? (
              <ControlsStack>
                <SliderRow
                  label="x₁"
                  value={xCoords.x}
                  min={-2}
                  max={2}
                  step={0.05}
                  onChange={(v) => setXCoords((c) => ({ ...c, x: v }))}
                />
                <SliderRow
                  label="x₂"
                  value={xCoords.y}
                  min={-2}
                  max={2}
                  step={0.05}
                  onChange={(v) => setXCoords((c) => ({ ...c, y: v }))}
                />
                <p className="font-mono text-xs text-[var(--fg-muted)]">
                  x → Vᵀx=({formatNum(pipeline.xVt[0]!)}, {formatNum(pipeline.xVt[1]!)}) → Σ=(
                  {formatNum(pipeline.xS[0]!)}, {formatNum(pipeline.xS[1]!)}) → U=({formatNum(pipeline.xU[0]!)},{' '}
                  {formatNum(pipeline.xU[1]!)}) · Ax=({formatNum(pipeline.Ax[0]!)}, {formatNum(pipeline.Ax[1]!)})
                </p>
              </ControlsStack>
            ) : null}

            <p className="text-sm text-[var(--fg)]">
              <span className="font-medium">
                A{hi ? 'v₁' : 'v₂'} = σ{hi ? '₁' : '₂'} u{hi ? '₁' : '₂'}
              </span>
              <span className="text-[var(--fg-muted)]">
                {' '}
                · v=({formatNum(v.x)}, {formatNum(v.y)}) · σ={formatNum(σ)} · u=({formatNum(u.x)},{' '}
                {formatNum(u.y)})
              </span>
            </p>
          </div>
        ) : null}

        {mode === 'mats' ? (
          <div className="space-y-3">
            <div className="flex flex-wrap justify-center gap-3">
              <MatDisplay M={Umat} label="U" />
              <MatDisplay M={Sigma} label="Σ" />
              <MatDisplay M={VtMat} label="Vᵀ" />
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <MatDisplay M={A} label="A" />
              <MatDisplay M={recon} label="UΣVᵀ" />
            </div>
            <Badge tone={reconErr < LSQ_NEAR * 10 ? 'ok' : 'warn'}>
              ‖A − UΣVᵀ‖F ≈ {formatNum(reconErr)}
              {reconErr < LSQ_NEAR * 10 ? ' ≈ 0' : ''}
            </Badge>
          </div>
        ) : null}

        <CollapsibleEdit
          label="Editar A (2×2)"
          open={editOpen}
          onToggle={() => setEditOpen((o) => !o)}
        >
          <div
            className="inline-grid gap-1"
            style={{ gridTemplateColumns: 'repeat(2, minmax(0, 4.5rem))' }}
          >
            {A.map((row, i) =>
              row.map((v, j) => (
                <input
                  key={`${i}-${j}`}
                  type="number"
                  step={0.1}
                  value={Number(v.toFixed(3))}
                  onChange={(e) => onEdit(i, j, e.target.value)}
                  className="w-full rounded border border-[var(--border)] bg-[var(--bg)] px-1 py-1 font-mono text-xs text-[var(--fg)]"
                  aria-label={`a${i + 1}${j + 1}`}
                />
              )),
            )}
          </div>
        </CollapsibleEdit>
      </div>
    </VizPanel>
  );
}
