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
  qrDecomposition,
  matMul,
  matT,
  matVec,
  matSub,
  matFrobenius,
  formatNum,
  columnOf,
  cloneMat,
  rows,
  cols,
  identity,
  vecDot,
  vecNorm,
  vecScale,
  vecSub,
  LSQ_NEAR,
  LSQ_EPS,
  type Mat,
  type Vec,
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
  clampVec,
  labelOffset,
  useVecDrag,
} from './vectorPlane';
import type { Vec2 } from './math2d';

const W = VEC_W;
const H = VEC_H;
const ox = W / 2;
const oy = H / 2;
const CLAMP = 4.2;

type Mode = 'build' | 'factors' | 'transform';
type BuildStep = 'A' | 'q1' | 'proj' | 'q2' | 'R' | 'QR';
type TransformPhase = 'orig' | 'R' | 'Q';
type PresetId = 'oblique' | 'ortho' | 'near' | 'dep' | 'id' | null;
type RHover = 'r11' | 'r12' | 'r22' | null;

const MODE_OPTS = [
  { id: 'build', label: 'Construcción' },
  { id: 'factors', label: 'Factores Q y R' },
  { id: 'transform', label: 'Transformación' },
];

const STEP_OPTS: Array<{ id: BuildStep; label: string }> = [
  { id: 'A', label: 'A' },
  { id: 'q1', label: 'q₁' },
  { id: 'proj', label: 'Proyección' },
  { id: 'q2', label: 'q₂' },
  { id: 'R', label: 'R' },
  { id: 'QR', label: 'QR' },
];

const TRANSFORM_OPTS: Array<{ id: TransformPhase; label: string }> = [
  { id: 'orig', label: 'Original' },
  { id: 'R', label: 'R' },
  { id: 'Q', label: 'Q' },
];

const PRESETS: Array<{ id: Exclude<PresetId, null>; label: string; A: Mat }> = [
  {
    id: 'oblique',
    label: 'Columnas oblicuas',
    A: [
      [2, 1],
      [0.5, 2],
    ],
  },
  {
    id: 'ortho',
    label: 'Ortogonales',
    A: [
      [2, -1],
      [1, 2],
    ],
  },
  {
    id: 'near',
    label: 'Casi paralelas',
    A: [
      [3, 2.9],
      [1, 1.05],
    ],
  },
  {
    id: 'dep',
    label: 'Dependientes',
    A: [
      [2, 4],
      [1, 2],
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
];

const DEFAULT_A: Mat = [
  [2, 1],
  [0.5, 2],
];

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function toVec2(v: Vec): Vec2 {
  return { x: v[0] ?? 0, y: v[1] ?? 0 };
}

function fromVec2(p: Vec2): Vec {
  return [p.x, p.y];
}

function setColumn(A: Mat, j: number, col: Vec): Mat {
  const next = cloneMat(A);
  for (let i = 0; i < next.length; i++) next[i]![j] = col[i] ?? 0;
  return next;
}

function isUpperTriangular(R: Mat, eps = LSQ_NEAR): boolean {
  const n = rows(R);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (Math.abs(R[i]?.[j] ?? 0) > eps) return false;
    }
  }
  return true;
}

function qtqNearI(Q: Mat, eps = LSQ_NEAR): boolean {
  const QtQ = matMul(matT(Q), Q);
  const n = cols(Q);
  const I = identity(n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (Math.abs((QtQ[i]?.[j] ?? 0) - (I[i]?.[j] ?? 0)) > eps) return false;
    }
  }
  return true;
}

function rightAngleAt(
  origin: Vec2,
  a: Vec2,
  b: Vec2,
  toPx: (p: Vec2) => { x: number; y: number },
  S: number,
  sizePx = 11,
): string {
  const na = Math.hypot(a.x, a.y);
  const nb = Math.hypot(b.x, b.y);
  if (na < LSQ_EPS || nb < LSQ_EPS) return '';
  const ua = { x: (a.x / na) * (sizePx / S), y: (a.y / na) * (sizePx / S) };
  const ub = { x: (b.x / nb) * (sizePx / S), y: (b.y / nb) * (sizePx / S) };
  const p0 = toPx(origin);
  const pA = toPx({ x: origin.x + ua.x, y: origin.y + ua.y });
  const pB = toPx({ x: origin.x + ub.x, y: origin.y + ub.y });
  const pC = {
    x: p0.x + (pA.x - p0.x) + (pB.x - p0.x),
    y: p0.y + (pA.y - p0.y) + (pB.y - p0.y),
  };
  return `M${pA.x},${pA.y} L${pC.x},${pC.y} L${pB.x},${pB.y}`;
}

function MatBracket({
  label,
  M,
  highlight,
  onHoverCell,
  tooltipFor,
  editable,
  onChange,
  dimmedBelow,
}: {
  label: string;
  M: Mat;
  highlight?: Set<string> | null;
  onHoverCell?: (key: RHover) => void;
  tooltipFor?: (i: number, j: number, v: number) => string | undefined;
  editable?: boolean;
  onChange?: (i: number, j: number, v: number) => void;
  dimmedBelow?: boolean;
}) {
  const m = rows(M);
  const n = cols(M);
  return (
    <div className="inline-flex flex-col items-center gap-1">
      <span className="font-mono text-xs font-semibold text-[var(--fg-muted)]">{label}</span>
      <div className="relative px-2.5 py-1.5">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1.5 rounded-l-[4px] border-y-2 border-l-2 border-[var(--fg-muted)] opacity-55"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-1.5 rounded-r-[4px] border-y-2 border-r-2 border-[var(--fg-muted)] opacity-55"
        />
        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${n}, minmax(2.75rem, auto))` }}
        >
          {Array.from({ length: m }, (_, i) =>
            Array.from({ length: n }, (_, j) => {
              const v = M[i]?.[j] ?? 0;
              const key = i === 0 && j === 0 ? 'r11' : i === 0 && j === 1 ? 'r12' : i === 1 && j === 1 ? 'r22' : null;
              const hi = highlight?.has(`${i},${j}`) || (key != null && highlight?.has(key));
              const tip = tooltipFor?.(i, j, v);
              const belowDiag = dimmedBelow && i > j;
              const cls = `w-12 h-9 rounded border text-center font-mono text-sm tabular-nums transition-colors ${
                hi
                  ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--fg)]'
                  : belowDiag
                    ? 'border-[var(--border)] bg-[var(--bg)] text-[var(--fg-muted)] opacity-35'
                    : 'border-[var(--border)] bg-[var(--bg)] text-[var(--fg)]'
              }`;
              if (editable && onChange) {
                return (
                  <input
                    key={`${i}-${j}`}
                    type="number"
                    step="any"
                    value={Number.isFinite(v) ? v : 0}
                    aria-label={`${label}_${i + 1}${j + 1}`}
                    title={tip}
                    onChange={(e) => onChange(i, j, Number(e.target.value) || 0)}
                    onMouseEnter={() => key && onHoverCell?.(key)}
                    onMouseLeave={() => onHoverCell?.(null)}
                    className={`${cls} focus:outline-none focus:ring-2 focus:ring-[var(--accent-strong)]/40`}
                  />
                );
              }
              return (
                <div
                  key={`${i}-${j}`}
                  title={tip}
                  onMouseEnter={() => key && onHoverCell?.(key)}
                  onMouseLeave={() => onHoverCell?.(null)}
                  className={`flex items-center justify-center ${cls}`}
                >
                  {formatNum(v)}
                </div>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}

function UnitSquare({ to }: { to: (p: Vec2) => { x: number; y: number } }) {
  const pts = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ].map(to);
  return (
    <polygon
      points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
      fill="var(--accent-soft)"
      stroke="var(--accent-strong)"
      strokeWidth={1.5}
      opacity={0.55}
    />
  );
}

/**
 * Descomposición QR vía Gram–Schmidt modificado: A = QR (ALG-DEC-002).
 * Q = base ortonormal de Col(A); R guarda las coordenadas triangulares.
 */
export function QRDecompositionViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [A, setA] = useState<Mat>(() => cloneMat(DEFAULT_A));
  const [mode, setMode] = useState<Mode>('build');
  const [step, setStep] = useState<BuildStep>('A');
  const [phase, setPhase] = useState<TransformPhase>('orig');
  const [preset, setPreset] = useState<PresetId>('oblique');
  const [editOpen, setEditOpen] = useState(false);
  const [hoverR, setHoverR] = useState<RHover>(null);
  const [playing, setPlaying] = useState(false);
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const decomp = useMemo(() => qrDecomposition(A), [A]);
  const { Q, R, deficient, rank } = decomp;

  const a1 = columnOf(A, 0);
  const a2 = columnOf(A, 1);
  const q1 = columnOf(Q, 0);
  const q2 = columnOf(Q, 1);
  const r11 = R[0]?.[0] ?? 0;
  const r12 = R[0]?.[1] ?? 0;
  const r22 = R[1]?.[1] ?? 0;

  const nA1 = vecNorm(a1);
  const q1Ok = vecNorm(q1) > LSQ_EPS;
  const q2Ok = vecNorm(q2) > LSQ_EPS;

  // Classical Gram–Schmidt intermediates for pedagogy (same result as MGS for 2 cols).
  const proj = q1Ok ? vecScale(q1, r12) : ([0, 0] as Vec);
  const u2 = vecSub(a2, proj);
  const nU2 = vecNorm(u2);
  const u2Zero = nU2 <= Math.max(LSQ_NEAR, LSQ_EPS * (1 + nA1 + vecNorm(a2)));

  const QR = matMul(Q, R);
  const reconErr = matFrobenius(matSub(A, QR));
  const qtqOk = qtqNearI(Q);
  const rTri = isUpperTriangular(R);
  const reconOk = reconErr <= Math.max(LSQ_NEAR, 1e-8 * (1 + matFrobenius(A)));

  const maxAbs = Math.max(
    1.2,
    ...a1.map(Math.abs),
    ...a2.map(Math.abs),
    ...q1.map(Math.abs),
    ...q2.map(Math.abs),
    1,
  );
  const S = autoScale(maxAbs, Math.min(W, H));
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });

  const a1v = toVec2(a1);
  const a2v = toVec2(a2);
  const q1v = toVec2(q1);
  const q2v = toVec2(q2);
  const projV = toVec2(proj);
  const u2v = toVec2(u2);

  const drag1 = useVecDrag(
    (p) => {
      const c = clampVec(p, CLAMP);
      setA((prev) => setColumn(prev, 0, fromVec2(c)));
      setPreset(null);
      setPlaying(false);
    },
    S,
    { x: ox, y: oy },
  );
  const drag2 = useVecDrag(
    (p) => {
      const c = clampVec(p, CLAMP);
      setA((prev) => setColumn(prev, 1, fromVec2(c)));
      setPreset(null);
      setPlaying(false);
    },
    S,
    { x: ox, y: oy },
  );

  const applyPreset = (id: Exclude<PresetId, null>) => {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setA(cloneMat(p.A));
    setPreset(id);
    setStep('A');
    setPhase('orig');
    setPlaying(false);
  };

  const setAij = (i: number, j: number, v: number) => {
    setA((prev) => {
      const next = cloneMat(prev);
      next[i]![j] = v;
      return next;
    });
    setPreset(null);
  };

  useEffect(() => {
    if (!playing) {
      if (playRef.current) {
        clearInterval(playRef.current);
        playRef.current = null;
      }
      return;
    }
    if (prefersReducedMotion()) {
      setPlaying(false);
      setStep('QR');
      return;
    }
    const order: BuildStep[] = ['A', 'q1', 'proj', 'q2', 'R', 'QR'];
    let idx = Math.max(0, order.indexOf(step));
    playRef.current = setInterval(() => {
      idx += 1;
      if (idx >= order.length) {
        setPlaying(false);
        setStep('QR');
        return;
      }
      setStep(order[idx]!);
    }, 900);
    return () => {
      if (playRef.current) clearInterval(playRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- play from current step once
  }, [playing]);

  const startPlay = () => {
    setMode('build');
    setStep('A');
    setPlaying(true);
  };

  const emphasize =
    hoverR === 'r11'
      ? 'r11'
      : hoverR === 'r12'
        ? 'r12'
        : hoverR === 'r22'
          ? 'r22'
          : step === 'R' || step === 'QR'
            ? 'combo'
            : null;
  const showACols = step === 'A' || step === 'QR' || emphasize === 'combo';
  const showQ1 = step === 'q1' || step === 'proj' || step === 'q2' || step === 'R' || step === 'QR';
  const showProj = step === 'proj' || step === 'q2' || hoverR === 'r12';
  const showU2 = step === 'proj' || step === 'q2';
  const showQ2 = (step === 'q2' || step === 'R' || step === 'QR') && !u2Zero;
  const showA1 =
    showACols || step === 'q1' || emphasize === 'r11' || hoverR === 'r11';
  const showA2 =
    showACols || step === 'proj' || emphasize === 'r12' || hoverR === 'r12';

  const pa1 = to(a1v);
  const pa2 = to(a2v);
  const pq1 = to(q1v);
  const pq2 = to(q2v);
  const pProj = to(projV);
  const pu2Tip = to({ x: projV.x + u2v.x, y: projV.y + u2v.y });

  const rightFoot =
    showProj && q1Ok && !u2Zero
      ? rightAngleAt(projV, q1v, u2v, to, S)
      : showQ2 && q1Ok && q2Ok
        ? rightAngleAt({ x: 0, y: 0 }, q1v, q2v, to, S)
        : '';

  // Transform mode: unit square through R then Q (Ax = Q(Rx))
  const apply2 = (M: Mat, p: Vec2): Vec2 => {
    const v = matVec(M, [p.x, p.y]);
    return { x: v[0] ?? 0, y: v[1] ?? 0 };
  };
  const squarePts: Vec2[] = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ];
  const displayMat: Mat =
    phase === 'orig' ? identity(2) : phase === 'R' ? R : matMul(Q, R);
  const shapeNow = squarePts.map((p) => apply2(displayMat, p));
  const sampleX: Vec2 = { x: 1.2, y: 0.6 };
  const Rx = apply2(R, sampleX);
  const QRx = apply2(Q, Rx);
  const Ax = apply2(A, sampleX);

  const rHighlight = new Set<string>();
  if (hoverR === 'r11' || emphasize === 'r11') rHighlight.add('0,0');
  if (hoverR === 'r12' || emphasize === 'r12') rHighlight.add('0,1');
  if (hoverR === 'r22' || emphasize === 'r22') rHighlight.add('1,1');
  if (step === 'R' || step === 'QR') {
    rHighlight.add('0,0');
    rHighlight.add('0,1');
    rHighlight.add('1,1');
  }

  const footerParts = [
    qtqOk ? 'QᵀQ ≈ I ✓' : 'QᵀQ ≉ I',
    rTri ? 'R triangular ✓' : 'R no triangular',
    `‖A−QR‖_F ≈ ${formatNum(reconErr)}${reconOk ? ' ≈ 0 ✓' : ''}`,
  ];
  if (deficient) footerParts.push(`r₂₂ ≈ 0 · rango ${rank}`);

  const caption = joinCaption(
    `A = QR`,
    deficient ? 'columnas dependientes' : 'rango completo',
    reconOk ? 'reconstrucción OK' : undefined,
  );

  const stepHint = (() => {
    if (mode !== 'build') return null;
    switch (step) {
      case 'A':
        return 'Columnas a₁, a₂ de A (arrástralas). QR construirá una base ortonormal del mismo span.';
      case 'q1':
        return `q₁ = a₁/‖a₁‖ · r₁₁ = ‖a₁‖ = ${formatNum(r11)}. Primera dirección de la base ortonormal.`;
      case 'proj':
        return `proj_{q₁}(a₂) = r₁₂ q₁ (naranja). Residual u₂ = a₂ − proj; ángulo recto en el pie.`;
      case 'q2':
        return u2Zero
          ? 'u₂ ≈ 0: columnas dependientes → r₂₂ = 0 y q₂ = 0 (sin NaN).'
          : `q₂ = u₂/‖u₂‖ · r₂₂ = ‖u₂‖ = ${formatNum(r22)}. Segunda dirección ortonormal.`;
      case 'R':
        return 'R almacena coordenadas: a₁ = r₁₁ q₁, a₂ = r₁₂ q₁ + r₂₂ q₂. Pasa el cursor por las celdas.';
      case 'QR':
        return 'Producto QR reconstruye A. Verifica QᵀQ ≈ I y ‖A−QR‖_F ≈ 0.';
    }
  })();

  return (
    <VizPanel title="Descomposición QR" caption={caption}>
      <div className="space-y-3">
        <GuideBlock
          idea="QR construye una base ortonormal de Col(A); R guarda las coordenadas de las columnas de A en esa base."
          tryIt="Avanza A → q₁ → proyección → q₂ → R → QR, o pulsa «Ver QR paso a paso». Prueba el preset Dependientes."
          concept="A = QR · Q tiene columnas ortonormales (no solo una «rotación») · R es triangular superior."
        />

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={MODE_OPTS}
            value={mode}
            onChange={(id) => {
              setMode(id as Mode);
              setPlaying(false);
            }}
          />
          {qtqOk ? <Badge tone="ok">QᵀQ ≈ I</Badge> : <Badge tone="warn">QᵀQ</Badge>}
          {rTri ? <Badge tone="ok">R △</Badge> : null}
          {deficient ? <Badge tone="warn">r₂₂ ≈ 0</Badge> : <Badge tone="ok">rango {rank}</Badge>}
          {reconOk ? <Badge tone="ok">A ≈ QR</Badge> : <Badge tone="bad">A ≉ QR</Badge>}
        </div>

        <ChipRow>
          {PRESETS.map((p) => (
            <Chip key={p.id} active={preset === p.id} onClick={() => applyPreset(p.id)}>
              {p.label}
            </Chip>
          ))}
        </ChipRow>

        {mode === 'build' ? (
          <Segmented
            options={STEP_OPTS}
            value={step}
            onChange={(id) => {
              setStep(id as BuildStep);
              setPlaying(false);
            }}
          />
        ) : null}

        {mode === 'transform' ? (
          <Segmented
            options={TRANSFORM_OPTS}
            value={phase}
            onChange={(id) => setPhase(id as TransformPhase)}
          />
        ) : null}

        {mode === 'build' || mode === 'transform' ? (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full touch-none rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--fg)]"
            role="img"
            aria-label="Geometría de columnas y base ortonormal Q"
          >
            <defs>
              <ArrowMarker id={`${uid}-a1`} color={COLOR_U} />
              <ArrowMarker id={`${uid}-a2`} color={COLOR_V} />
              <ArrowMarker id={`${uid}-q1`} color="var(--accent-strong)" />
              <ArrowMarker id={`${uid}-q2`} color="teal" />
              <ArrowMarker id={`${uid}-proj`} color={COLOR_W} />
              <ArrowMarker id={`${uid}-u2`} color="var(--fg-muted)" />
              <ArrowMarker id={`${uid}-x`} color="var(--fg)" />
            </defs>
            <Axes W={W} H={H} ox={ox} oy={oy} S={S} />

            {mode === 'transform' ? (
              <>
                <UnitSquare to={to} />
                <polygon
                  points={shapeNow.map((p) => `${to(p).x},${to(p).y}`).join(' ')}
                  fill="teal"
                  fillOpacity={0.18}
                  stroke="teal"
                  strokeWidth={2}
                />
                {/* sample vector x → Rx → Q(Rx) */}
                <line
                  x1={ox}
                  y1={oy}
                  x2={to(sampleX).x}
                  y2={to(sampleX).y}
                  stroke="var(--fg-muted)"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  markerEnd={`url(#${uid}-x)`}
                  opacity={phase === 'orig' ? 1 : 0.35}
                />
                {phase !== 'orig' ? (
                  <line
                    x1={ox}
                    y1={oy}
                    x2={to(Rx).x}
                    y2={to(Rx).y}
                    stroke={COLOR_W}
                    strokeWidth={2}
                    markerEnd={`url(#${uid}-proj)`}
                    opacity={phase === 'R' ? 1 : 0.45}
                  />
                ) : null}
                {phase === 'Q' ? (
                  <line
                    x1={ox}
                    y1={oy}
                    x2={to(QRx).x}
                    y2={to(QRx).y}
                    stroke={COLOR_U}
                    strokeWidth={2.5}
                    markerEnd={`url(#${uid}-a1)`}
                  />
                ) : null}
                <text x={12} y={H - 14} fontSize={11} className="fill-[var(--fg-muted)]">
                  {phase === 'orig'
                    ? 'Cuadrado unidad · Ax = Q(Rx)'
                    : phase === 'R'
                      ? 'Tras R (coordenadas triangulares)'
                      : 'Tras Q · base ortonormal · Ax ≈ Q(Rx)'}
                </text>
              </>
            ) : (
              <>
                {/* a1, a2 */}
                {showA1 ? (
                  <g opacity={step === 'A' || emphasize === 'r11' || step === 'q1' ? 1 : 0.4}>
                    <line
                      x1={ox}
                      y1={oy}
                      x2={pa1.x}
                      y2={pa1.y}
                      stroke={COLOR_U}
                      strokeWidth={2.5}
                      markerEnd={`url(#${uid}-a1)`}
                    />
                    <text
                      x={labelOffset(a1v, pa1, ox, oy).x}
                      y={labelOffset(a1v, pa1, ox, oy).y}
                      fontSize={12}
                      fill={COLOR_U}
                      fontWeight={600}
                    >
                      a₁
                    </text>
                    <circle
                      cx={pa1.x}
                      cy={pa1.y}
                      r={10}
                      fill="transparent"
                      className="cursor-grab"
                      {...drag1}
                    />
                  </g>
                ) : null}
                {showA2 ? (
                  <g opacity={step === 'A' || emphasize === 'r12' || step === 'proj' ? 1 : 0.35}>
                    <line
                      x1={ox}
                      y1={oy}
                      x2={pa2.x}
                      y2={pa2.y}
                      stroke={COLOR_V}
                      strokeWidth={2.5}
                      markerEnd={`url(#${uid}-a2)`}
                    />
                    <text
                      x={labelOffset(a2v, pa2, ox, oy).x}
                      y={labelOffset(a2v, pa2, ox, oy).y}
                      fontSize={12}
                      fill={COLOR_V}
                      fontWeight={600}
                    >
                      a₂
                    </text>
                    <circle
                      cx={pa2.x}
                      cy={pa2.y}
                      r={10}
                      fill="transparent"
                      className="cursor-grab"
                      {...drag2}
                    />
                  </g>
                ) : null}

                {/* projection */}
                {showProj && q1Ok ? (
                  <g>
                    <line
                      x1={ox}
                      y1={oy}
                      x2={pProj.x}
                      y2={pProj.y}
                      stroke={COLOR_W}
                      strokeWidth={2.5}
                      markerEnd={`url(#${uid}-proj)`}
                    />
                    <text
                      x={labelOffset(projV, pProj, ox, oy, 14).x}
                      y={labelOffset(projV, pProj, ox, oy, 14).y}
                      fontSize={11}
                      fill={COLOR_W}
                      fontWeight={600}
                    >
                      r₁₂ q₁
                    </text>
                    {!u2Zero ? (
                      <line
                        x1={pProj.x}
                        y1={pProj.y}
                        x2={pa2.x}
                        y2={pa2.y}
                        stroke="var(--fg-muted)"
                        strokeWidth={1.75}
                        strokeDasharray="5 4"
                        markerEnd={`url(#${uid}-u2)`}
                      />
                    ) : null}
                  </g>
                ) : null}

                {showU2 && !u2Zero ? (
                  <text
                    x={labelOffset(u2v, { x: (pProj.x + pu2Tip.x) / 2, y: (pProj.y + pu2Tip.y) / 2 }, ox, oy, 8).x}
                    y={labelOffset(u2v, { x: (pProj.x + pu2Tip.x) / 2, y: (pProj.y + pu2Tip.y) / 2 }, ox, oy, 8).y}
                    fontSize={11}
                    fill="var(--fg-muted)"
                  >
                    u₂
                  </text>
                ) : null}

                {rightFoot ? (
                  <path d={rightFoot} fill="none" stroke="var(--fg)" strokeWidth={1.5} opacity={0.7} />
                ) : null}

                {/* q1 */}
                {showQ1 && q1Ok ? (
                  <g opacity={emphasize === 'r11' || step === 'q1' ? 1 : 0.9}>
                    <line
                      x1={ox}
                      y1={oy}
                      x2={pq1.x}
                      y2={pq1.y}
                      stroke="var(--accent-strong)"
                      strokeWidth={3}
                      markerEnd={`url(#${uid}-q1)`}
                    />
                    <text
                      x={labelOffset(q1v, pq1, ox, oy, 16).x}
                      y={labelOffset(q1v, pq1, ox, oy, 16).y}
                      fontSize={13}
                      fill="var(--accent-strong)"
                      fontWeight={700}
                    >
                      q₁
                    </text>
                  </g>
                ) : null}

                {/* q2 */}
                {showQ2 && q2Ok ? (
                  <g opacity={emphasize === 'r22' || step === 'q2' ? 1 : 0.9}>
                    <line
                      x1={ox}
                      y1={oy}
                      x2={pq2.x}
                      y2={pq2.y}
                      stroke="teal"
                      strokeWidth={3}
                      markerEnd={`url(#${uid}-q2)`}
                    />
                    <text
                      x={labelOffset(q2v, pq2, ox, oy, 16).x}
                      y={labelOffset(q2v, pq2, ox, oy, 16).y}
                      fontSize={13}
                      fill="teal"
                      fontWeight={700}
                    >
                      q₂
                    </text>
                  </g>
                ) : null}

                {/* combo overlays for R / QR */}
                {(step === 'R' || step === 'QR') && q1Ok ? (
                  <g opacity={0.35}>
                    <line
                      x1={ox}
                      y1={oy}
                      x2={to(toVec2(vecScale(q1, r11))).x}
                      y2={to(toVec2(vecScale(q1, r11))).y}
                      stroke={COLOR_U}
                      strokeWidth={2}
                      strokeDasharray="3 3"
                    />
                  </g>
                ) : null}
              </>
            )}
          </svg>
        ) : null}

        {mode === 'factors' ? (
          <div className="flex flex-wrap items-start justify-center gap-4 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-4">
            <MatBracket label="A" M={A} />
            <span className="self-center font-mono text-lg text-[var(--fg-muted)]">=</span>
            <MatBracket
              label="Q"
              M={Q}
              tooltipFor={(i, j) =>
                j === 0
                  ? `q₁[${i + 1}] — columna ortonormal 1`
                  : `q₂[${i + 1}] — columna ortonormal 2`
              }
            />
            <MatBracket
              label="R"
              M={R}
              dimmedBelow
              highlight={rHighlight}
              onHoverCell={setHoverR}
              tooltipFor={(i, j, v) => {
                if (i === 0 && j === 0) return `r₁₁ = ‖a₁‖ = ${formatNum(v)} · a₁ = r₁₁ q₁`;
                if (i === 0 && j === 1) return `r₁₂ = q₁·a₂ = ${formatNum(v)} · proj = r₁₂ q₁`;
                if (i === 1 && j === 1)
                  return u2Zero
                    ? `r₂₂ ≈ 0 (columnas dependientes)`
                    : `r₂₂ = ‖u₂‖ = ${formatNum(v)} · a₂ = r₁₂ q₁ + r₂₂ q₂`;
                if (i > j) return '0 (triangular superior)';
                return formatNum(v);
              }}
            />
          </div>
        ) : null}

        {(mode === 'build' || mode === 'factors') && (
          <div className="flex flex-wrap items-start justify-center gap-3">
            {mode === 'build' ? (
              <>
                <MatBracket label="A" M={A} />
                {(step === 'R' || step === 'QR' || step === 'q1' || step === 'proj' || step === 'q2') && (
                  <MatBracket
                    label="R"
                    M={R}
                    dimmedBelow
                    highlight={rHighlight}
                    onHoverCell={setHoverR}
                    tooltipFor={(i, j, v) => {
                      if (i === 0 && j === 0) return `r₁₁ = ${formatNum(v)} · a₁ = r₁₁ q₁`;
                      if (i === 0 && j === 1) return `r₁₂ = ${formatNum(v)} · proj_{q₁}(a₂)`;
                      if (i === 1 && j === 1) return `r₂₂ = ${formatNum(v)}`;
                      return undefined;
                    }}
                  />
                )}
                {(step === 'QR' || step === 'q2' || step === 'R') && <MatBracket label="Q" M={Q} />}
              </>
            ) : null}
          </div>
        )}

        {mode === 'transform' ? (
          <div className="space-y-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 font-mono text-xs text-[var(--fg-muted)]">
            <p>
              x = ({formatNum(sampleX.x)}, {formatNum(sampleX.y)}) · Rx = ({formatNum(Rx.x)},{' '}
              {formatNum(Rx.y)}) · Q(Rx) = ({formatNum(QRx.x)}, {formatNum(QRx.y)})
            </p>
            <p>
              Ax = ({formatNum(Ax.x)}, {formatNum(Ax.y)}) · ‖Ax − Q(Rx)‖ ≈{' '}
              {formatNum(Math.hypot(Ax.x - QRx.x, Ax.y - QRx.y))}
            </p>
            <p className="text-[var(--fg)]">Ax = Q(Rx) — R cambia coordenadas; Q aplica la base ortonormal.</p>
          </div>
        ) : null}

        {stepHint ? (
          <p className="text-sm leading-relaxed text-[var(--fg-muted)]">{stepHint}</p>
        ) : null}

        <div className="flex flex-wrap gap-2 text-xs font-mono text-[var(--fg-muted)]">
          <span>
            a₁ = r₁₁ q₁ → ({formatNum(r11)}) · q₁
          </span>
          <span className="opacity-40">·</span>
          <span>
            a₂ = r₁₂ q₁ + r₂₂ q₂
            {u2Zero ? ' (r₂₂≈0)' : ''}
          </span>
          <span className="opacity-40">·</span>
          <span>
            q₁·q₂ = {formatNum(vecDot(q1, q2))}
          </span>
        </div>

        <ControlsStack>
          <ButtonRow>
            <VizButton active onClick={startPlay} disabled={playing}>
              {playing ? 'Reproduciendo…' : '▶ Ver QR paso a paso'}
            </VizButton>
            <VizButton
              onClick={() => {
                setStep((s) => {
                  const order: BuildStep[] = ['A', 'q1', 'proj', 'q2', 'R', 'QR'];
                  const i = order.indexOf(s);
                  return order[Math.min(i + 1, order.length - 1)]!;
                });
                setMode('build');
                setPlaying(false);
              }}
            >
              Siguiente
            </VizButton>
          </ButtonRow>

          <CollapsibleEdit
            label="Editar matriz A (2×2)"
            open={editOpen}
            onToggle={() => setEditOpen((o) => !o)}
          >
            <div className="space-y-2">
              <MatBracket label="A" M={A} editable onChange={setAij} />
              <p className="text-xs text-[var(--fg-muted)]">
                También puedes arrastrar las puntas de a₁ y a₂ en el plano.
              </p>
              <SliderRow
                label="a₁₁"
                value={A[0]?.[0] ?? 0}
                min={-4}
                max={4}
                step={0.1}
                onChange={(v) => setAij(0, 0, v)}
              />
              <SliderRow
                label="a₂₁"
                value={A[1]?.[0] ?? 0}
                min={-4}
                max={4}
                step={0.1}
                onChange={(v) => setAij(1, 0, v)}
              />
              <SliderRow
                label="a₁₂"
                value={A[0]?.[1] ?? 0}
                min={-4}
                max={4}
                step={0.1}
                onChange={(v) => setAij(0, 1, v)}
              />
              <SliderRow
                label="a₂₂"
                value={A[1]?.[1] ?? 0}
                min={-4}
                max={4}
                step={0.1}
                onChange={(v) => setAij(1, 1, v)}
              />
            </div>
          </CollapsibleEdit>
        </ControlsStack>

        <p className="border-t border-[var(--border)] pt-2 text-sm font-mono text-[var(--fg-muted)]">
          {footerParts.join(' · ')}
        </p>
      </div>
    </VizPanel>
  );
}
