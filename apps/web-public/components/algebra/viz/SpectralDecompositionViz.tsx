'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  SliderRow,
  ToggleRow,
  VizButton,
  VizPanel,
  joinCaption,
} from './controls';
import {
  type Mat,
  type Vec,
  LSQ_NEAR,
  formatNum,
  matAdd,
  matFrobenius,
  matMul,
  matScale,
  matSub,
  matT,
  matVec,
  outerProduct,
  symmetricEig,
} from './decompMath';
import { type Vec2 } from './math2d';
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
  clampVec,
  labelOffset,
  useVecDrag,
} from './vectorPlane';

type Mode = 'dirs' | 'diag' | 'comp';
type DiagStep = 'orig' | 'Qt' | 'Lam' | 'Q' | 'A';
type PresetId = 'pd' | 'indef' | 'semi' | 'rank1' | 'scalar' | 'diag' | null;
type Highlight = 'q1' | 'q2';

const MODE_OPTS = [
  { id: 'dirs', label: 'Direcciones propias' },
  { id: 'diag', label: 'Diagonalización' },
  { id: 'comp', label: 'Componentes' },
];

const STEP_OPTS: Array<{ id: DiagStep; label: string }> = [
  { id: 'orig', label: 'Original' },
  { id: 'Qt', label: 'Qᵀ' },
  { id: 'Lam', label: 'Λ' },
  { id: 'Q', label: 'Q' },
  { id: 'A', label: 'A' },
];

const PRESETS: Array<{
  id: Exclude<PresetId, null>;
  label: string;
  a: number;
  b: number;
  d: number;
  note?: string;
}> = [
  { id: 'pd', label: 'Positiva definida', a: 3, b: 1, d: 2 },
  { id: 'indef', label: 'Indefinida', a: 2, b: 1, d: -1 },
  { id: 'semi', label: 'Semidefinida', a: 2, b: 0, d: 0 },
  { id: 'rank1', label: 'Rango 1', a: 1, b: 1, d: 1 },
  { id: 'scalar', label: 'Escalar (λI)', a: 2, b: 0, d: 2, note: 'base no única' },
  { id: 'diag', label: 'Diagonal', a: 3, b: 0, d: 1 },
];

const W = Math.round(VEC_W * 1.05);
const H = Math.round(VEC_H * 1.05);
const ox = W / 2;
const oy = H / 2;
const CLAMP = 2.8;
const LINE_EXT = 4.5;
const EPS = Math.max(LSQ_NEAR, 1e-8);

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function symMat(a: number, b: number, d: number): Mat {
  return [
    [a, b],
    [b, d],
  ];
}

function I2(): Mat {
  return [
    [1, 0],
    [0, 1],
  ];
}

function diag2(l1: number, l2: number): Mat {
  return [
    [l1, 0],
    [0, l2],
  ];
}

function col(Q: Mat, j: number): Vec {
  return [Q[0]?.[j] ?? 0, Q[1]?.[j] ?? 0];
}

function toVec2(v: Vec): Vec2 {
  return { x: v[0] ?? 0, y: v[1] ?? 0 };
}

function apply2(M: Mat, p: { x: number; y: number }): { x: number; y: number } {
  return {
    x: (M[0]?.[0] ?? 0) * p.x + (M[0]?.[1] ?? 0) * p.y,
    y: (M[1]?.[0] ?? 0) * p.x + (M[1]?.[1] ?? 0) * p.y,
  };
}

function unitCircle(n = 96): Array<{ x: number; y: number }> {
  return Array.from({ length: n }, (_, i) => {
    const t = (2 * Math.PI * i) / n;
    return { x: Math.cos(t), y: Math.sin(t) };
  });
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

function gridLines(extent = 2.2, n = 9): Array<[{ x: number; y: number }, { x: number; y: number }]> {
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

function spanEnds(v: Vec2, ext = LINE_EXT): { a: Vec2; b: Vec2 } | null {
  const n = Math.hypot(v.x, v.y);
  if (n < 1e-9) return null;
  const u = { x: v.x / n, y: v.y / n };
  return { a: { x: -u.x * ext, y: -u.y * ext }, b: { x: u.x * ext, y: u.y * ext } };
}

function rightAngleMark(
  q1: Vec2,
  q2: Vec2,
  to: (p: Vec2) => { x: number; y: number },
  S: number,
  size = 12,
): string {
  const n1 = Math.hypot(q1.x, q1.y) || 1;
  const n2 = Math.hypot(q2.x, q2.y) || 1;
  const u1 = { x: (q1.x / n1) * (size / S), y: (q1.y / n1) * (size / S) };
  const u2 = { x: (q2.x / n2) * (size / S), y: (q2.y / n2) * (size / S) };
  const p1 = to(u1);
  const p2 = to(u2);
  const corner = { x: ox + (p1.x - ox) + (p2.x - ox), y: oy + (p1.y - oy) + (p2.y - oy) };
  return `M${p1.x},${p1.y} L${corner.x},${corner.y} L${p2.x},${p2.y}`;
}

function classifySpectrum(l1: number, l2: number): {
  label: string;
  tone: 'ok' | 'warn' | 'neutral';
} {
  const pos = (x: number) => x > EPS;
  const neg = (x: number) => x < -EPS;
  const zero = (x: number) => Math.abs(x) <= EPS;
  if (pos(l1) && pos(l2)) return { label: 'POSITIVA DEFINIDA', tone: 'ok' };
  if (neg(l1) && neg(l2)) return { label: 'NEGATIVA DEFINIDA', tone: 'warn' };
  if ((pos(l1) && neg(l2)) || (neg(l1) && pos(l2))) return { label: 'INDEFINIDA', tone: 'warn' };
  if ((zero(l1) || zero(l2)) && !((pos(l1) && neg(l2)) || (neg(l1) && pos(l2)))) {
    return { label: 'SEMIDEFINIDA', tone: 'neutral' };
  }
  return { label: 'SEMIDEFINIDA', tone: 'neutral' };
}

function MatDisplay({ M, label, accent }: { M: Mat; label: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${
        accent
          ? 'border-orange-500/40 bg-orange-500/10'
          : 'border-[var(--border)] bg-[var(--bg)]'
      }`}
    >
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

function SpectrumBars({
  values,
  highlight,
}: {
  values: number[];
  highlight: Highlight;
}) {
  const maxAbs = Math.max(...values.map((v) => Math.abs(v)), EPS);
  const half = 44;
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-[var(--fg-muted)]">Espectro (autovalores λᵢ)</p>
      <div className="relative flex items-center gap-3" style={{ height: half * 2 + 8 }}>
        <div
          className="pointer-events-none absolute left-0 right-0 border-t border-[var(--fg-muted)]/50"
          style={{ top: half + 4 }}
        />
        {values.map((λ, i) => {
          const hi = (i === 0 && highlight === 'q1') || (i === 1 && highlight === 'q2');
          const h = Math.max(3, (Math.abs(λ) / maxAbs) * half);
          const up = λ >= 0;
          return (
            <div key={i} className="relative flex flex-1 flex-col items-center" style={{ height: '100%' }}>
              <span className="absolute top-0 font-mono text-[10px] tabular-nums text-[var(--fg-muted)]">
                {formatNum(λ)}
              </span>
              <div
                className="absolute w-full max-w-[2.5rem] rounded-sm"
                style={{
                  left: '50%',
                  transform: 'translateX(-50%)',
                  height: h,
                  top: up ? half + 4 - h : half + 4,
                  background: hi
                    ? i === 0
                      ? COLOR_V
                      : COLOR_U
                    : 'color-mix(in oklab, var(--fg-muted) 45%, transparent)',
                  opacity: hi ? 0.9 : 0.55,
                }}
                title={`λ${i + 1}=${formatNum(λ)}`}
              />
              <span
                className="absolute bottom-0 font-mono text-[10px] text-[var(--fg-muted)]"
                style={{ opacity: hi ? 1 : 0.7 }}
              >
                λ{i + 1}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-[var(--fg-muted)]">Eje cero · barras hacia arriba = λ &gt; 0 · abajo = λ &lt; 0</p>
    </div>
  );
}

/**
 * Descomposición espectral A = QΛQᵀ para matrices reales simétricas (ALG-DEC-003).
 */
export function SpectralDecompositionViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [a, setA] = useState(3);
  const [b, setB] = useState(1);
  const [d, setD] = useState(2);
  const [mode, setMode] = useState<Mode>('dirs');
  const [step, setStep] = useState<DiagStep>('orig');
  const [preset, setPreset] = useState<PresetId>('pd');
  const [highlight, setHighlight] = useState<Highlight>('q1');
  const [dragX, setDragX] = useState(false);
  const [x, setX] = useState<Vec2>({ x: 1.4, y: 0.9 });
  const [editOpen, setEditOpen] = useState(false);
  const [projOpen, setProjOpen] = useState(false);
  const [reveal, setReveal] = useState(0);
  const [showRecon, setShowRecon] = useState(false);
  const [playing, setPlaying] = useState(false);
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reduceMotion = useRef(false);

  useEffect(() => {
    reduceMotion.current = prefersReducedMotion();
  }, []);

  useEffect(() => () => {
    if (playRef.current) clearInterval(playRef.current);
  }, []);

  const A = useMemo(() => symMat(a, b, d), [a, b, d]);
  const { values, Q } = useMemo(() => symmetricEig(A), [A]);
  const l1 = values[0] ?? 0;
  const l2 = values[1] ?? 0;
  const q1v = useMemo(() => col(Q, 0), [Q]);
  const q2v = useMemo(() => col(Q, 1), [Q]);
  const q1 = toVec2(q1v);
  const q2 = toVec2(q2v);
  const Lambda = useMemo(() => diag2(l1, l2), [l1, l2]);
  const Qt = useMemo(() => matT(Q), [Q]);
  const recon = useMemo(() => matMul(Q, matMul(Lambda, Qt)), [Q, Lambda, Qt]);
  const reconErr = useMemo(() => matFrobenius(matSub(A, recon)), [A, recon]);
  const P1 = useMemo(() => outerProduct(q1v, q1v), [q1v]);
  const P2 = useMemo(() => outerProduct(q2v, q2v), [q2v]);
  const C1 = useMemo(() => matScale(P1, l1), [P1, l1]);
  const C2 = useMemo(() => matScale(P2, l2), [P2, l2]);
  const built = useMemo(() => {
    if (reveal <= 0) return null;
    if (reveal === 1) return C1;
    return matAdd(C1, C2);
  }, [reveal, C1, C2]);

  const Aq1 = useMemo(() => matVec(A, q1v), [A, q1v]);
  const Aq2 = useMemo(() => matVec(A, q2v), [A, q2v]);
  const dotQ = q1.x * q2.x + q1.y * q2.y;
  const orthoOk = Math.abs(dotQ) < 1e-4;
  const spectrum = classifySpectrum(l1, l2);
  const scalarCase = Math.abs(l1 - l2) < EPS && Math.abs(b) < EPS && Math.abs(a - d) < EPS;

  const c1 = q1.x * x.x + q1.y * x.y;
  const c2 = q2.x * x.x + q2.y * x.y;
  const Ax = matVec(A, [x.x, x.y]);
  const AxDecomp: Vec = [
    l1 * c1 * q1.x + l2 * c2 * q2.x,
    l1 * c1 * q1.y + l2 * c2 * q2.y,
  ];

  /** Cumulative map: I → Qᵀ → ΛQᵀ → QΛQᵀ. */
  const displayMat: Mat = useMemo(() => {
    if (step === 'orig') return I2();
    if (step === 'Qt') return Qt;
    if (step === 'Lam') return matMul(Lambda, Qt);
    return recon; // Q or A
  }, [step, Qt, Lambda, recon]);

  const circle = useMemo(() => unitCircle(96), []);
  const grid = useMemo(() => gridLines(2.2, 9), []);
  const transformedCircle = useMemo(
    () => circle.map((p) => apply2(displayMat, p)),
    [circle, displayMat],
  );
  const transformedGrid = useMemo(
    () => grid.map(([p, q]) => [apply2(displayMat, p), apply2(displayMat, q)] as const),
    [grid, displayMat],
  );

  const reachDirs = Math.max(
    Math.abs(l1),
    Math.abs(l2),
    Math.hypot(Aq1[0]!, Aq1[1]!),
    Math.hypot(Aq2[0]!, Aq2[1]!),
    Math.hypot(x.x, x.y),
    Math.hypot(Ax[0]!, Ax[1]!),
    1.4,
  );
  const reachDiag = Math.max(
    ...transformedCircle.map((p) => Math.hypot(p.x, p.y)),
    Math.abs(l1),
    Math.abs(l2),
    1.4,
  );
  const Sscale = autoScale(
    mode === 'diag' ? reachDiag : reachDirs,
    Math.min(W, H),
    50,
    24,
    62,
  );
  const to = (p: { x: number; y: number }) => ({ x: ox + p.x * Sscale, y: oy - p.y * Sscale });

  const vecDrag = useVecDrag((p) => setX(clampVec(p, CLAMP)), Sscale, { x: ox, y: oy });

  const stopPlay = () => {
    if (playRef.current) {
      clearInterval(playRef.current);
      playRef.current = null;
    }
    setPlaying(false);
  };

  const playSteps = () => {
    if (reduceMotion.current) {
      const order: DiagStep[] = ['orig', 'Qt', 'Lam', 'Q', 'A'];
      const idx = order.indexOf(step);
      setStep(order[(idx + 1) % order.length]!);
      return;
    }
    if (playing) {
      stopPlay();
      return;
    }
    setPlaying(true);
    setMode('diag');
    const order: DiagStep[] = ['orig', 'Qt', 'Lam', 'Q', 'A'];
    let i = 0;
    setStep('orig');
    playRef.current = setInterval(() => {
      i += 1;
      if (i >= order.length) {
        stopPlay();
        setStep('A');
        return;
      }
      setStep(order[i]!);
    }, 900);
  };

  const bump = (na: number, nb: number, nd: number) => {
    stopPlay();
    setA(na);
    setB(nb);
    setD(nd);
    setPreset(null);
    setShowRecon(false);
    setReveal(0);
  };

  const applyPreset = (id: Exclude<PresetId, null>) => {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    stopPlay();
    setPreset(id);
    setA(p.a);
    setB(p.b);
    setD(p.d);
    setStep('orig');
    setShowRecon(false);
    setReveal(0);
  };

  const hi1 = highlight === 'q1';
  const Aqi = hi1 ? Aq1 : Aq2;
  const λi = hi1 ? l1 : l2;
  const qi = hi1 ? q1 : q2;
  const span1 = spanEnds(q1);
  const span2 = spanEnds(q2);

  const caption = joinCaption(
    `λ₁=${formatNum(l1)}`,
    `λ₂=${formatNum(l2)}`,
    orthoOk ? 'q₁⊥q₂' : `q₁·q₂=${formatNum(dotQ)}`,
    'A=QΛQᵀ ✓',
  );

  return (
    <VizPanel title="Descomposición espectral" caption={caption}>
      <div className="space-y-3">
        <GuideBlock
          idea="Si A es real y simétrica (A = Aᵀ), el teorema espectral garantiza una base ortonormal de autovectores: A = QΛQᵀ."
          tryIt="Prueba presets (definida / indefinida / semidefinida). En Direcciones propias arrastra x; en Diagonalización reproduce Original → Qᵀ → Λ → Q → A."
          concept="Los autovalores λᵢ miden estiramiento (o inversión) a lo largo de qᵢ. Nunca son valores singulares: aquí el signo importa."
        />

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="ok">A = Aᵀ ✓</Badge>
          <Badge tone="ok">BASE ORTONORMAL</Badge>
          <Badge tone={spectrum.tone}>{spectrum.label}</Badge>
          {scalarCase ? <Badge tone="neutral">λI · base no única</Badge> : null}
        </div>

        <Segmented
          options={MODE_OPTS}
          value={mode}
          onChange={(id) => {
            stopPlay();
            setMode(id as Mode);
          }}
        />

        {mode === 'diag' ? (
          <Segmented
            options={STEP_OPTS}
            value={step}
            onChange={(id) => {
              stopPlay();
              setStep(id as DiagStep);
            }}
          />
        ) : null}

        <ChipRow>
          {PRESETS.map((p) => (
            <Chip key={p.id} active={preset === p.id} onClick={() => applyPreset(p.id)}>
              {p.label}
            </Chip>
          ))}
        </ChipRow>

        {/* —— Direcciones propias —— */}
        {mode === 'dirs' ? (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg)]">
              <svg
                viewBox={`0 0 ${W} ${H}`}
                className="h-auto w-full touch-none"
                role="img"
                aria-label="Direcciones propias ortonormales"
                style={{ minHeight: 280 }}
              >
                <defs>
                  <ArrowMarker id={`${uid}-q1`} color={COLOR_V} />
                  <ArrowMarker id={`${uid}-q2`} color={COLOR_U} />
                  <ArrowMarker id={`${uid}-aq`} color={COLOR_W} />
                  <ArrowMarker id={`${uid}-x`} color="var(--fg)" />
                </defs>
                <Axes W={W} H={H} ox={ox} oy={oy} S={Sscale} ticks={[-2, -1, 1, 2]} />

                {span1 ? (
                  <line
                    x1={to(span1.a).x}
                    y1={to(span1.a).y}
                    x2={to(span1.b).x}
                    y2={to(span1.b).y}
                    stroke={COLOR_V}
                    strokeWidth={hi1 ? 2.2 : 1.2}
                    opacity={hi1 ? 0.55 : 0.28}
                  />
                ) : null}
                {span2 ? (
                  <line
                    x1={to(span2.a).x}
                    y1={to(span2.a).y}
                    x2={to(span2.b).x}
                    y2={to(span2.b).y}
                    stroke={COLOR_U}
                    strokeWidth={!hi1 ? 2.2 : 1.2}
                    opacity={!hi1 ? 0.55 : 0.28}
                  />
                ) : null}

                {orthoOk ? (
                  <path
                    d={rightAngleMark(q1, q2, to, Sscale)}
                    fill="none"
                    stroke="var(--fg)"
                    strokeWidth={1.5}
                    opacity={0.7}
                  />
                ) : null}

                <line
                  x1={ox}
                  y1={oy}
                  x2={to(q1).x}
                  y2={to(q1).y}
                  stroke={COLOR_V}
                  strokeWidth={hi1 ? 2.6 : 1.6}
                  markerEnd={`url(#${uid}-q1)`}
                  opacity={hi1 ? 1 : 0.45}
                />
                <line
                  x1={ox}
                  y1={oy}
                  x2={to(q2).x}
                  y2={to(q2).y}
                  stroke={COLOR_U}
                  strokeWidth={!hi1 ? 2.6 : 1.6}
                  markerEnd={`url(#${uid}-q2)`}
                  opacity={!hi1 ? 1 : 0.45}
                />

                {/* Aqi = λi qi — negative λ reverses; λ=0 collapses */}
                {Math.hypot(Aq1[0]!, Aq1[1]!) > 0.04 ? (
                  <line
                    x1={ox}
                    y1={oy}
                    x2={to({ x: Aq1[0]!, y: Aq1[1]! }).x}
                    y2={to({ x: Aq1[0]!, y: Aq1[1]! }).y}
                    stroke={COLOR_W}
                    strokeWidth={hi1 ? 2.4 : 1.4}
                    markerEnd={`url(#${uid}-aq)`}
                    opacity={hi1 ? 0.95 : 0.4}
                  />
                ) : (
                  <circle cx={ox} cy={oy} r={hi1 ? 6 : 4} fill={COLOR_W} opacity={hi1 ? 0.85 : 0.35} />
                )}
                {Math.hypot(Aq2[0]!, Aq2[1]!) > 0.04 ? (
                  <line
                    x1={ox}
                    y1={oy}
                    x2={to({ x: Aq2[0]!, y: Aq2[1]! }).x}
                    y2={to({ x: Aq2[0]!, y: Aq2[1]! }).y}
                    stroke={COLOR_W}
                    strokeWidth={!hi1 ? 2.4 : 1.4}
                    markerEnd={`url(#${uid}-aq)`}
                    opacity={!hi1 ? 0.95 : 0.4}
                  />
                ) : (
                  <circle cx={ox} cy={oy} r={!hi1 ? 6 : 4} fill={COLOR_W} opacity={!hi1 ? 0.85 : 0.35} />
                )}

                <text
                  x={labelOffset(q1, to(q1), ox, oy, 16).x}
                  y={labelOffset(q1, to(q1), ox, oy, 16).y}
                  fontSize={12}
                  fill={COLOR_V}
                  fontWeight={600}
                >
                  q₁
                </text>
                <text
                  x={labelOffset(q2, to(q2), ox, oy, 16).x}
                  y={labelOffset(q2, to(q2), ox, oy, 16).y}
                  fontSize={12}
                  fill={COLOR_U}
                  fontWeight={600}
                >
                  q₂
                </text>
                <text
                  x={labelOffset(toVec2(Aq1), to({ x: Aq1[0]!, y: Aq1[1]! }), ox, oy, 18).x}
                  y={labelOffset(toVec2(Aq1), to({ x: Aq1[0]!, y: Aq1[1]! }), ox, oy, 18).y}
                  fontSize={11}
                  fill={COLOR_W}
                  fontWeight={600}
                  opacity={hi1 ? 1 : 0.5}
                >
                  λ₁={formatNum(l1)}
                </text>
                <text
                  x={labelOffset(toVec2(Aq2), to({ x: Aq2[0]!, y: Aq2[1]! }), ox, oy, 18).x}
                  y={labelOffset(toVec2(Aq2), to({ x: Aq2[0]!, y: Aq2[1]! }), ox, oy, 18).y}
                  fontSize={11}
                  fill={COLOR_W}
                  fontWeight={600}
                  opacity={!hi1 ? 1 : 0.5}
                >
                  λ₂={formatNum(l2)}
                </text>

                {dragX ? (
                  <g>
                    <line
                      x1={ox}
                      y1={oy}
                      x2={to(x).x}
                      y2={to(x).y}
                      stroke="var(--fg)"
                      strokeWidth={2.2}
                      markerEnd={`url(#${uid}-x)`}
                    />
                    <circle
                      cx={to(x).x}
                      cy={to(x).y}
                      r={10}
                      fill="transparent"
                      stroke="var(--fg)"
                      strokeWidth={1.5}
                      className="cursor-grab"
                      {...vecDrag}
                    />
                    <text
                      x={labelOffset(x, to(x), ox, oy, 16).x}
                      y={labelOffset(x, to(x), ox, oy, 16).y}
                      fontSize={12}
                      fill="var(--fg)"
                    >
                      x
                    </text>
                    <line
                      x1={ox}
                      y1={oy}
                      x2={to({ x: Ax[0]!, y: Ax[1]! }).x}
                      y2={to({ x: Ax[0]!, y: Ax[1]! }).y}
                      stroke={COLOR_W}
                      strokeWidth={2.2}
                      markerEnd={`url(#${uid}-aq)`}
                    />
                    <text
                      x={labelOffset(toVec2(Ax), to({ x: Ax[0]!, y: Ax[1]! }), ox, oy, 16).x}
                      y={labelOffset(toVec2(Ax), to({ x: Ax[0]!, y: Ax[1]! }), ox, oy, 16).y}
                      fontSize={12}
                      fill={COLOR_W}
                      fontWeight={600}
                    >
                      Ax
                    </text>
                  </g>
                ) : null}
              </svg>
            </div>

            <SpectrumBars values={[l1, l2]} highlight={highlight} />

            <ButtonRow>
              <VizButton active={highlight === 'q1'} onClick={() => setHighlight('q1')}>
                Destacar q₁
              </VizButton>
              <VizButton active={highlight === 'q2'} onClick={() => setHighlight('q2')}>
                Destacar q₂
              </VizButton>
            </ButtonRow>

            <p className="font-mono text-sm text-[var(--fg)]">
              Aq{hi1 ? '₁' : '₂'} = λ{hi1 ? '₁' : '₂'} q{hi1 ? '₁' : '₂'}
              <span className="text-[var(--fg-muted)]">
                {' '}
                · ({formatNum(Aqi[0]!)}, {formatNum(Aqi[1]!)}) ≈ (
                {formatNum(λi * qi.x)}, {formatNum(λi * qi.y)})
              </span>
            </p>

            <ControlsStack>
              <ToggleRow label="Arrastrar vector x" checked={dragX} onChange={setDragX} />
            </ControlsStack>

            {dragX ? (
              <div className="space-y-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm">
                <p className="font-mono">
                  x = c₁ q₁ + c₂ q₂ · c₁={formatNum(c1)} · c₂={formatNum(c2)}
                </p>
                <p className="font-mono text-[var(--fg-muted)]">
                  Ax = λ₁ c₁ q₁ + λ₂ c₂ q₂ = ({formatNum(AxDecomp[0]!)}, {formatNum(AxDecomp[1]!)})
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* —— Diagonalización —— */}
        {mode === 'diag' ? (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg)]">
              <svg
                viewBox={`0 0 ${W} ${H}`}
                className="h-auto w-full"
                role="img"
                aria-label="Pipeline Qᵀ → Λ → Q"
                style={{ minHeight: 280 }}
              >
                <defs>
                  <ArrowMarker id={`${uid}-e`} color="var(--fg-muted)" />
                  <ArrowMarker id={`${uid}-q`} color={COLOR_V} />
                </defs>
                <Axes W={W} H={H} ox={ox} oy={oy} S={Sscale} ticks={[-2, -1, 1, 2]} />
                <g opacity={0.22}>
                  {transformedGrid.map(([p, q], i) => {
                    const P = to(p);
                    const Qp = to(q);
                    return (
                      <line
                        key={i}
                        x1={P.x}
                        y1={P.y}
                        x2={Qp.x}
                        y2={Qp.y}
                        stroke="var(--fg-muted)"
                        strokeWidth={1}
                      />
                    );
                  })}
                </g>
                <polygon
                  points={polyPts(circle, to)}
                  fill="none"
                  stroke="var(--fg-muted)"
                  strokeWidth={1}
                  strokeDasharray="4 3"
                  opacity={0.35}
                />
                <polygon
                  points={polyPts(transformedCircle, to)}
                  fill="color-mix(in oklab, var(--accent-soft) 45%, transparent)"
                  stroke="var(--accent-strong)"
                  strokeWidth={2}
                />
                {(step === 'orig' || step === 'Qt') && (
                  <>
                    <line
                      x1={ox}
                      y1={oy}
                      x2={to(q1).x}
                      y2={to(q1).y}
                      stroke={COLOR_V}
                      strokeWidth={2}
                      markerEnd={`url(#${uid}-q)`}
                      opacity={0.85}
                    />
                    <line
                      x1={ox}
                      y1={oy}
                      x2={to(q2).x}
                      y2={to(q2).y}
                      stroke={COLOR_U}
                      strokeWidth={2}
                      markerEnd={`url(#${uid}-q)`}
                      opacity={0.85}
                    />
                  </>
                )}
                {step === 'Lam' ? (
                  <>
                    <text x={to({ x: l1, y: 0 }).x + 4} y={oy - 6} fontSize={12} fill={COLOR_V}>
                      λ₁={formatNum(l1)}
                    </text>
                    <text x={ox + 6} y={to({ x: 0, y: l2 }).y - 4} fontSize={12} fill={COLOR_U}>
                      λ₂={formatNum(l2)}
                    </text>
                  </>
                ) : null}
                {(step === 'Q' || step === 'A') && (
                  <>
                    <line
                      x1={ox}
                      y1={oy}
                      x2={to({ x: Aq1[0]!, y: Aq1[1]! }).x}
                      y2={to({ x: Aq1[0]!, y: Aq1[1]! }).y}
                      stroke={COLOR_W}
                      strokeWidth={2}
                      markerEnd={`url(#${uid}-e)`}
                    />
                    <line
                      x1={ox}
                      y1={oy}
                      x2={to({ x: Aq2[0]!, y: Aq2[1]! }).x}
                      y2={to({ x: Aq2[0]!, y: Aq2[1]! }).y}
                      stroke={COLOR_W}
                      strokeWidth={2}
                      markerEnd={`url(#${uid}-e)`}
                      opacity={0.85}
                    />
                  </>
                )}
              </svg>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge tone="ok">Qᵀ A Q = Λ</Badge>
              <Badge tone="ok">A = Q Λ Qᵀ</Badge>
              {step === 'Qt' ? <Badge tone="ok">ORTOGONAL · cambio a base propia</Badge> : null}
              {step === 'Lam' ? <Badge tone="warn">ESCALA axial por λᵢ</Badge> : null}
              {step === 'Q' || step === 'A' ? <Badge tone="ok">REORIENTACIÓN · A reconstruida</Badge> : null}
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <MatDisplay M={A} label="A" />
              <MatDisplay M={Q} label="Q" accent={step === 'Q'} />
              <MatDisplay M={Lambda} label="Λ" accent={step === 'Lam'} />
              <MatDisplay M={Qt} label="Qᵀ" accent={step === 'Qt'} />
            </div>

            {showRecon ? (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <MatDisplay M={recon} label="QΛQᵀ" accent />
                <Badge tone={reconErr < 1e-6 ? 'ok' : 'warn'}>
                  ‖A − QΛQᵀ‖F ≈ {formatNum(reconErr, 4)}
                </Badge>
              </div>
            ) : null}

            <ButtonRow>
              <VizButton
                onClick={() => setShowRecon(true)}
                active={showRecon}
              >
                Reconstruir A
              </VizButton>
              <VizButton onClick={playSteps} active={playing}>
                ▶ Ver descomposición
              </VizButton>
            </ButtonRow>
          </div>
        ) : null}

        {/* —— Componentes —— */}
        {mode === 'comp' ? (
          <div className="space-y-3">
            <p className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 font-mono text-xs leading-relaxed text-[var(--fg)] sm:text-sm">
              A = λ₁ q₁ q₁ᵀ + λ₂ q₂ q₂ᵀ
              {reveal > 0 ? (
                <span className="text-[var(--fg-muted)]">
                  {' '}
                  · mostrando {reveal === 1 ? '1ª' : '1ª+2ª'} componente
                  {reveal >= 2 ? 's' : ''}
                </span>
              ) : null}
            </p>

            <SpectrumBars values={[l1, l2]} highlight={highlight} />

            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              <MatDisplay M={C1} label={`λ₁ q₁q₁ᵀ (${formatNum(l1)})`} accent={reveal === 1} />
              <MatDisplay M={C2} label={`λ₂ q₂q₂ᵀ (${formatNum(l2)})`} accent={reveal === 2} />
              <MatDisplay M={built ?? A} label={built ? (reveal >= 2 ? 'Suma = A' : 'Parcial') : 'A'} />
            </div>

            <ButtonRow>
              <VizButton
                onClick={() => setReveal((r) => (r >= 2 ? 0 : r + 1))}
                active={reveal > 0}
              >
                Construir A
                {reveal > 0 ? ` (${reveal}/2)` : ''}
              </VizButton>
              {reveal > 0 ? (
                <VizButton onClick={() => setReveal(0)}>Mostrar A completa</VizButton>
              ) : null}
              <VizButton active={highlight === 'q1'} onClick={() => setHighlight('q1')}>
                q₁
              </VizButton>
              <VizButton active={highlight === 'q2'} onClick={() => setHighlight('q2')}>
                q₂
              </VizButton>
            </ButtonRow>

            <CollapsibleEdit
              label="Proyectores Pᵢ = qᵢ qᵢᵀ"
              open={projOpen}
              onToggle={() => setProjOpen((o) => !o)}
            >
              <div className="space-y-2">
                <p className="text-sm text-[var(--fg-muted)]">
                  Pᵢ proyecta ortogonalmente sobre span(qᵢ). Son simétricos, Pᵢ² = Pᵢ, y P₁ + P₂ = I.
                  Entonces A = λ₁ P₁ + λ₂ P₂.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <MatDisplay M={P1} label="P₁ = q₁q₁ᵀ" />
                  <MatDisplay M={P2} label="P₂ = q₂q₂ᵀ" />
                  <MatDisplay M={matAdd(P1, P2)} label="P₁+P₂ ≈ I" />
                </div>
              </div>
            </CollapsibleEdit>
          </div>
        ) : null}

        <ControlsStack>
          <CollapsibleEdit
            label="Editar a, b, d (A simétrica)"
            open={editOpen}
            onToggle={() => setEditOpen((o) => !o)}
          >
            <div className="space-y-2">
              <SliderRow label="a" value={a} min={-3} max={4} step={0.1} onChange={(v) => bump(v, b, d)} />
              <SliderRow label="b" value={b} min={-3} max={3} step={0.1} onChange={(v) => bump(a, v, d)} />
              <SliderRow label="d" value={d} min={-3} max={4} step={0.1} onChange={(v) => bump(a, b, v)} />
              <p className="font-mono text-xs text-[var(--fg-muted)]">
                A = [[{formatNum(a)}, {formatNum(b)}], [{formatNum(b)}, {formatNum(d)}]] · a₁₂ = a₂₁
              </p>
              {preset === 'scalar' ? (
                <p className="text-xs text-[var(--fg-muted)]">
                  Escalar λI: cualquier base ortonormal es propia (base no única).
                </p>
              ) : null}
            </div>
          </CollapsibleEdit>
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
