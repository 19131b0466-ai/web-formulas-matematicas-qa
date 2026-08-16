'use client';

import { useId, useMemo, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  SliderRow,
  VizButton,
  VizPanel,
  joinCaption,
} from './controls';
import {
  leastSquares,
  pseudoInverse,
  svd,
  moorePenroseChecks,
  classifySystem,
  nullspaceBasis,
  matVec,
  matMul,
  matT,
  vecNorm,
  vecAdd,
  vecScale,
  vecSub,
  formatNum,
  formatVec,
  det2x2,
  inv2x2,
  matNear,
  LSQ_NEAR,
  LSQ_EPS,
  type Mat,
  type Vec,
  rows,
  cols,
  matrixRank,
} from './lsqMath';
import {
  Badge,
  Chip,
  ChipRow,
  Segmented,
  CollapsibleEdit,
  GuideBlock,
} from './transformHelpers';

const W = 420;
const H = 300;
const OX = W / 2;
const OY = H / 2 + 12;
const ISO_S = 48;

type Mode = 'lsq' | 'minnorm' | 'svd' | 'verify';
type PresetId = 'over' | 'under' | 'sing' | 'inv' | null;
type ShapeId = '3x2' | '2x3' | '2x2';

const MODE_OPTIONS = [
  { id: 'lsq', label: 'Mínimos cuadrados' },
  { id: 'minnorm', label: 'Norma mínima' },
  { id: 'svd', label: 'SVD' },
  { id: 'verify', label: 'Verificar' },
];

const PRESET_OVER: { A: Mat; b: Vec } = {
  A: [
    [1, 0],
    [0, 1],
    [1, 1],
  ],
  b: [1, 1, 3],
};

const PRESET_UNDER: { A: Mat; b: Vec } = {
  A: [
    [1, 0, 1],
    [0, 1, 1],
  ],
  b: [3, 4],
};

const PRESET_SING: { A: Mat; b: Vec } = {
  A: [
    [1, 2],
    [2, 4],
  ],
  b: [1, 2],
};

const PRESET_INV: { A: Mat; b: Vec } = {
  A: [
    [2, 1],
    [1, 3],
  ],
  b: [5, 4],
};

const SHAPE_LABELS: Record<ShapeId, string> = {
  '3x2': '3×2',
  '2x3': '2×3',
  '2x2': '2×2',
};

function cloneMat(A: Mat): Mat {
  return A.map((r) => r.slice());
}

function cloneVec(v: Vec): Vec {
  return v.slice();
}

function shapeOf(A: Mat): ShapeId {
  const m = rows(A);
  const n = cols(A);
  if (m === 3 && n === 2) return '3x2';
  if (m === 2 && n === 3) return '2x3';
  return '2x2';
}

function resizeToShape(A: Mat, b: Vec, shape: ShapeId): { A: Mat; b: Vec } {
  const [tm, tn] = shape === '3x2' ? [3, 2] : shape === '2x3' ? [2, 3] : [2, 2];
  const next: Mat = Array.from({ length: tm }, (_, i) =>
    Array.from({ length: tn }, (_, j) => A[i]?.[j] ?? (i === j ? 1 : 0)),
  );
  const nb = Array.from({ length: tm }, (_, i) => b[i] ?? 0);
  return { A: next, b: nb };
}

function problemLabel(problem: ReturnType<typeof classifySystem>['problem']): {
  text: string;
  tone: 'ok' | 'bad' | 'warn' | 'neutral';
} {
  switch (problem) {
    case 'least_squares':
      return { text: 'SOBREDETERMINADO', tone: 'warn' };
    case 'infinite_exact':
      return { text: 'SUBDETERMINADO', tone: 'ok' };
    case 'unique_exact':
      return { text: 'ÚNICA EXACTA', tone: 'ok' };
    case 'inconsistent_deficient':
      return { text: 'DEFICIENTE / INCONSISTENTE', tone: 'bad' };
    default:
      return { text: '—', tone: 'neutral' };
  }
}

function modeFooterLabel(mode: Mode): string {
  switch (mode) {
    case 'lsq':
      return 'mínimos cuadrados';
    case 'minnorm':
      return 'norma mínima';
    case 'svd':
      return 'SVD → A⁺';
    case 'verify':
      return 'Moore–Penrose';
  }
}

/** Isometric map ℝ³ → screen (x right-forward, y left-forward, z up). */
function iso3(x: number, y: number, z: number): { x: number; y: number } {
  const cx = Math.cos(Math.PI / 6);
  const sx = Math.sin(Math.PI / 6);
  return {
    x: OX + (x - y) * cx * ISO_S,
    y: OY - (z + (x + y) * sx) * ISO_S * 0.92,
  };
}

function formatMatCompact(A: Mat): string {
  return `[${A.map((r) => `[${r.map((v) => formatNum(v)).join(',')}]`).join('')}]`;
}

function rightAngleMark(
  at: { x: number; y: number },
  dirA: { x: number; y: number },
  dirB: { x: number; y: number },
  size = 10,
): string {
  const na = Math.hypot(dirA.x, dirA.y) || 1;
  const nb = Math.hypot(dirB.x, dirB.y) || 1;
  const ax = (dirA.x / na) * size;
  const ay = (dirA.y / na) * size;
  const bx = (dirB.x / nb) * size;
  const by = (dirB.y / nb) * size;
  const p1 = { x: at.x + ax, y: at.y + ay };
  const p2 = { x: at.x + ax + bx, y: at.y + ay + by };
  const p3 = { x: at.x + bx, y: at.y + by };
  return `M${p1.x},${p1.y} L${p2.x},${p2.y} L${p3.x},${p3.y}`;
}

function MappingDiagram({ m, n }: { m: number; n: number }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-mono text-[var(--fg-muted)]">
      <span className="rounded-md bg-[var(--accent-soft)] px-2 py-1 text-[var(--fg)]">ℝⁿ={n}</span>
      <span className="text-[var(--accent-strong)]">—A→</span>
      <span className="rounded-md bg-[var(--accent-soft)] px-2 py-1 text-[var(--fg)]">ℝᵐ={m}</span>
      <span className="mx-1 opacity-40">|</span>
      <span className="rounded-md border border-[var(--border)] px-2 py-1">ℝᵐ</span>
      <span className="text-orange-600 dark:text-orange-300">—A⁺→</span>
      <span className="rounded-md border border-[var(--border)] px-2 py-1">ℝⁿ</span>
    </div>
  );
}

function ColPlaneSvg({
  uid,
  A,
  b,
  bHat,
  residual,
  trialAx,
  showTrial,
}: {
  uid: string;
  A: Mat;
  b: Vec;
  bHat: Vec;
  residual: Vec;
  trialAx: Vec | null;
  showTrial: boolean;
}) {
  const m = rows(A);
  const n = cols(A);
  // Conceptual R³ view when tall 3×2; otherwise project first two coords + synthetic height
  const useR3 = m === 3 && n === 2;
  const a1 = useR3
    ? [A[0]![0]!, A[1]![0]!, A[2]![0]!]
    : [A[0]?.[0] ?? 1, A[1]?.[0] ?? 0, 0];
  const a2 = useR3
    ? [A[0]![1]!, A[1]![1]!, A[2]![1]!]
    : [A[0]?.[1] ?? 0, A[1]?.[1] ?? 1, 0];
  const bp = useR3 ? [b[0]!, b[1]!, b[2]!] : [b[0] ?? 0, b[1] ?? 0, 0];
  const bhp = useR3
    ? [bHat[0]!, bHat[1]!, bHat[2]!]
    : [bHat[0] ?? 0, bHat[1] ?? 0, 0];
  const trialP =
    showTrial && trialAx
      ? useR3
        ? [trialAx[0]!, trialAx[1]!, trialAx[2]!]
        : [trialAx[0] ?? 0, trialAx[1] ?? 0, 0]
      : null;

  const o = iso3(0, 0, 0);
  const pA1 = iso3(a1[0]!, a1[1]!, a1[2]!);
  const pA2 = iso3(a2[0]!, a2[1]!, a2[2]!);
  const pSum = iso3(a1[0]! + a2[0]!, a1[1]! + a2[1]!, a1[2]! + a2[2]!);
  // Extend plane patch a bit past the parallelogram
  const ext = 1.35;
  const q0 = iso3(-0.2 * a1[0]! - 0.2 * a2[0]!, -0.2 * a1[1]! - 0.2 * a2[1]!, -0.2 * a1[2]! - 0.2 * a2[2]!);
  const q1 = iso3(ext * a1[0]! - 0.2 * a2[0]!, ext * a1[1]! - 0.2 * a2[1]!, ext * a1[2]! - 0.2 * a2[2]!);
  const q2 = iso3(
    ext * a1[0]! + ext * a2[0]!,
    ext * a1[1]! + ext * a2[1]!,
    ext * a1[2]! + ext * a2[2]!,
  );
  const q3 = iso3(-0.2 * a1[0]! + ext * a2[0]!, -0.2 * a1[1]! + ext * a2[1]!, -0.2 * a1[2]! + ext * a2[2]!);

  const pb = iso3(bp[0]!, bp[1]!, bp[2]!);
  const pbh = iso3(bhp[0]!, bhp[1]!, bhp[2]!);
  const ptrial = trialP ? iso3(trialP[0]!, trialP[1]!, trialP[2]!) : null;

  const rScreen = { x: pb.x - pbh.x, y: pb.y - pbh.y };
  // Direction along plane near b̂: prefer a1 projection in screen
  const planeDir = { x: pA1.x - o.x, y: pA1.y - o.y };
  const rLen = Math.hypot(rScreen.x, rScreen.y);
  const right =
    rLen > 4
      ? rightAngleMark(pbh, planeDir, rScreen, 11)
      : '';

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full rounded-xl border border-[var(--border)]"
      role="img"
      aria-label="Col(A) como plano; b fuera; b̂ = Ax̂ sobre el plano; residuo ortogonal"
    >
      <defs>
        <marker
          id={`${uid}-arr-b`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="teal" />
        </marker>
        <marker
          id={`${uid}-arr-bh`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="orange" />
        </marker>
      </defs>

      {/* faint axes */}
      <line x1={40} y1={OY + 40} x2={W - 40} y2={OY + 40} stroke="currentColor" opacity={0.12} />
      <line x1={OX} y1={H - 28} x2={OX} y2={28} stroke="currentColor" opacity={0.12} />

      {/* Col(A) plane patch */}
      <polygon
        points={`${q0.x},${q0.y} ${q1.x},${q1.y} ${q2.x},${q2.y} ${q3.x},${q3.y}`}
        fill="var(--accent-soft)"
        opacity={0.55}
        stroke="var(--accent-strong)"
        strokeWidth={1.2}
      />
      {/* parallelogram from columns */}
      <polygon
        points={`${o.x},${o.y} ${pA1.x},${pA1.y} ${pSum.x},${pSum.y} ${pA2.x},${pA2.y}`}
        fill="var(--accent-strong)"
        fillOpacity={0.12}
        stroke="var(--accent-strong)"
        strokeWidth={1.4}
        strokeDasharray="4 3"
      />

      <text x={q2.x - 8} y={q2.y - 8} fontSize={11} fontWeight={700} fill="var(--accent-strong)">
        Col(A)
      </text>

      {/* O */}
      <circle cx={o.x} cy={o.y} r={4} fill="currentColor" opacity={0.5} />
      <text x={o.x - 14} y={o.y + 14} fontSize={11} fill="currentColor" opacity={0.55}>
        O
      </text>

      {/* b̂ on plane */}
      <line
        x1={o.x}
        y1={o.y}
        x2={pbh.x}
        y2={pbh.y}
        stroke="orange"
        strokeWidth={2.4}
        markerEnd={`url(#${uid}-arr-bh)`}
      />
      <circle cx={pbh.x} cy={pbh.y} r={5} fill="orange" />
      <text x={pbh.x + 8} y={pbh.y - 8} fontSize={12} fontWeight={700} fill="orange">
        b̂
      </text>

      {/* residual b̂ → b */}
      {rLen > 2 && (
        <line
          x1={pbh.x}
          y1={pbh.y}
          x2={pb.x}
          y2={pb.y}
          stroke="currentColor"
          strokeWidth={1.8}
          strokeDasharray="5 4"
          opacity={0.65}
        />
      )}
      {right ? <path d={right} fill="none" stroke="orange" strokeWidth={1.6} /> : null}

      {/* b */}
      <line
        x1={o.x}
        y1={o.y}
        x2={pb.x}
        y2={pb.y}
        stroke="teal"
        strokeWidth={2.2}
        markerEnd={`url(#${uid}-arr-b)`}
        opacity={0.9}
      />
      <circle cx={pb.x} cy={pb.y} r={5.5} fill="teal" />
      <text x={pb.x + 8} y={pb.y + 4} fontSize={12} fontWeight={700} fill="teal">
        b
      </text>

      {rLen > 8 && (
        <text
          x={(pbh.x + pb.x) / 2 + 10}
          y={(pbh.y + pb.y) / 2}
          fontSize={11}
          fontWeight={700}
          fill="currentColor"
          opacity={0.7}
        >
          r
        </text>
      )}

      {/* trial Ax */}
      {ptrial && (
        <>
          <circle cx={ptrial.x} cy={ptrial.y} r={4.5} fill="var(--fg-muted)" opacity={0.85} />
          <text
            x={ptrial.x + 8}
            y={ptrial.y + 12}
            fontSize={10}
            fontWeight={600}
            fill="var(--fg-muted)"
          >
            Ax
          </text>
          <line
            x1={ptrial.x}
            y1={ptrial.y}
            x2={pb.x}
            y2={pb.y}
            stroke="currentColor"
            strokeWidth={1.2}
            strokeDasharray="3 3"
            opacity={0.35}
          />
        </>
      )}

      <text x={16} y={H - 12} fontSize={10} fill="currentColor" opacity={0.5}>
        {useR3 ? 'Vista isométrica en ℝ³ · plano Col(A)' : 'Vista conceptual · Col(A)'}
      </text>
      {/* silence unused residual warning by referencing length */}
      <title>{`||r||=${formatNum(vecNorm(residual))}`}</title>
    </svg>
  );
}

function ParamSpaceSvg({
  uid,
  xHat,
  z,
  t,
}: {
  uid: string;
  xHat: Vec;
  z: Vec;
  t: number;
}) {
  const n = xHat.length;
  // Project to 2D: first two coords, or (x,y) from R³ via light iso if n≥3
  const toScreen = (v: Vec) => {
    if (n >= 3) {
      const p = iso3(v[0] ?? 0, v[1] ?? 0, v[2] ?? 0);
      return { x: p.x, y: p.y - 8 };
    }
    return { x: OX + (v[0] ?? 0) * 42, y: OY - (v[1] ?? 0) * 42 };
  };

  const o = toScreen(Array.from({ length: n }, () => 0));
  const px = toScreen(xHat);
  const xt = toScreen(vecAdd(xHat, vecScale(z, t)));
  // Line extent
  const a = toScreen(vecAdd(xHat, vecScale(z, -2.8)));
  const b = toScreen(vecAdd(xHat, vecScale(z, 2.8)));

  // Perp marker: x̂ ⊥ z (direction from O to x̂ vs along z)
  const alongKer = { x: b.x - a.x, y: b.y - a.y };
  const toXhat = { x: px.x - o.x, y: px.y - o.y };
  const mark =
    Math.hypot(toXhat.x, toXhat.y) > 8
      ? rightAngleMark(px, { x: -toXhat.x, y: -toXhat.y }, alongKer, 10)
      : '';

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full rounded-xl border border-[var(--border)]"
      role="img"
      aria-label="Conjunto de soluciones x = x̂ + t z en el espacio de parámetros"
    >
      <defs>
        <marker
          id={`${uid}-arr-x`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="orange" />
        </marker>
      </defs>

      <line x1={30} y1={OY} x2={W - 30} y2={OY} stroke="currentColor" opacity={0.12} />
      <line x1={OX} y1={24} x2={OX} y2={H - 24} stroke="currentColor" opacity={0.12} />

      {/* solution affine line */}
      <line
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke="var(--accent-strong)"
        strokeWidth={3}
        opacity={0.35}
        strokeLinecap="round"
      />
      <text
        x={(a.x + b.x) / 2 + 12}
        y={(a.y + b.y) / 2 - 10}
        fontSize={11}
        fontWeight={700}
        fill="var(--accent-strong)"
      >
        {`{x : Ax = b}`}
      </text>

      {/* O → x̂ */}
      <line
        x1={o.x}
        y1={o.y}
        x2={px.x}
        y2={px.y}
        stroke="orange"
        strokeWidth={2.4}
        markerEnd={`url(#${uid}-arr-x)`}
      />
      {mark ? <path d={mark} fill="none" stroke="orange" strokeWidth={1.6} /> : null}

      <circle cx={o.x} cy={o.y} r={4.5} fill="currentColor" opacity={0.55} />
      <text x={o.x - 12} y={o.y + 16} fontSize={12} fontWeight={700} fill="currentColor" opacity={0.6}>
        O
      </text>

      <circle cx={px.x} cy={px.y} r={6} fill="orange" />
      <text x={px.x + 9} y={px.y - 8} fontSize={12} fontWeight={700} fill="orange">
        x̂
      </text>

      {/* movable point */}
      <circle cx={xt.x} cy={xt.y} r={6} fill="teal" stroke="currentColor" strokeWidth={1} />
      <text x={xt.x + 9} y={xt.y + 14} fontSize={11} fontWeight={700} fill="teal">
        x(t)
      </text>
      <line
        x1={o.x}
        y1={o.y}
        x2={xt.x}
        y2={xt.y}
        stroke="teal"
        strokeWidth={1.4}
        strokeDasharray="4 3"
        opacity={0.55}
      />

      <text x={16} y={H - 12} fontSize={10} fill="currentColor" opacity={0.5}>
        x = x̂ + t z, z ∈ ker(A) · ||x̂|| mínima
      </text>
    </svg>
  );
}

/**
 * Pseudoinversa A⁺: mínimos cuadrados / norma mínima / SVD / Moore–Penrose (ALG-LSQ-003).
 */
export function PseudoinverseViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [A, setA] = useState<Mat>(() => cloneMat(PRESET_OVER.A));
  const [b, setB] = useState<Vec>(() => cloneVec(PRESET_OVER.b));
  const [mode, setMode] = useState<Mode>('lsq');
  const [preset, setPreset] = useState<PresetId>('over');
  const [editOpen, setEditOpen] = useState(false);
  const [tryOther, setTryOther] = useState(false);
  const [trialX, setTrialX] = useState<Vec>([0.2, 1.4]);
  const [tParam, setTParam] = useState(0.8);
  const [svdReveal, setSvdReveal] = useState(0);

  const m = rows(A);
  const n = cols(A);
  const shape = shapeOf(A);

  const lsq = useMemo(() => leastSquares(A, b), [A, b]);
  const cls = useMemo(() => classifySystem(A, b), [A, b]);
  const Ap = useMemo(() => pseudoInverse(A), [A]);
  const svdRes = useMemo(() => svd(A), [A]);
  const ker = useMemo(() => nullspaceBasis(A), [A]);
  const mp = useMemo(() => moorePenroseChecks(A, Ap), [A, Ap]);
  const det = det2x2(A);
  const Ainv = inv2x2(A);
  const rank = matrixRank(A);
  const AtR = useMemo(() => matVec(matT(A), lsq.residual), [A, lsq.residual]);

  const z = ker[0] ?? Array.from({ length: n }, (_, i) => (i === n - 1 ? 1 : 0));
  const xTrialFull = useMemo(() => {
    const base = trialX.slice(0, n);
    while (base.length < n) base.push(0);
    return base;
  }, [trialX, n]);

  const trialAx = tryOther ? matVec(A, xTrialFull) : null;
  const trialResNorm = trialAx ? vecNorm(vecSub(b, trialAx)) : null;

  const xOnLine = vecAdd(lsq.xHat, vecScale(z, tParam));
  const normXt = vecNorm(xOnLine);
  const normXhat = vecNorm(lsq.xHat);
  const AxCheck = matVec(A, xOnLine);
  const exactOnLine = vecNorm(vecSub(AxCheck, b)) <= Math.max(LSQ_NEAR, LSQ_EPS) * (1 + vecNorm(b));
  const xHatPerpKer =
    ker.length === 0 ||
    Math.abs(
      lsq.xHat.reduce((s, xi, i) => s + xi * (z[i] ?? 0), 0),
    ) <= LSQ_NEAR * (1 + normXhat);

  const AtRNear0 = vecNorm(AtR) <= LSQ_NEAR * (1 + vecNorm(b));
  const problemBadge = problemLabel(cls.problem);
  const isSpecialInv = cls.invertible && Ainv != null && matNear(Ap, Ainv);

  function applyPreset(id: Exclude<PresetId, null>) {
    const map = {
      over: { ...PRESET_OVER, mode: 'lsq' as Mode },
      under: { ...PRESET_UNDER, mode: 'minnorm' as Mode },
      sing: { ...PRESET_SING, mode: 'svd' as Mode },
      inv: { ...PRESET_INV, mode: 'verify' as Mode },
    }[id];
    setA(cloneMat(map.A));
    setB(cloneVec(map.b));
    setMode(map.mode);
    setPreset(id);
    setSvdReveal(0);
    setTryOther(false);
    setTParam(0.8);
    const nn = cols(map.A);
    setTrialX(Array.from({ length: Math.max(2, nn) }, (_, i) => (i === 0 ? 0.2 : 1.2)));
  }

  function setShape(next: ShapeId) {
    const resized = resizeToShape(A, b, next);
    setA(resized.A);
    setB(resized.b);
    setPreset(null);
    setSvdReveal(0);
    setTrialX(Array.from({ length: cols(resized.A) }, (_, i) => (i === 0 ? 0.5 : 0.5)));
  }

  function updateAEntry(i: number, j: number, val: number) {
    const next = cloneMat(A);
    if (!next[i]) return;
    next[i]![j] = val;
    setA(next);
    setPreset(null);
  }

  function updateBEntry(i: number, val: number) {
    const next = cloneVec(b);
    next[i] = val;
    setB(next);
    setPreset(null);
  }

  // When entering min-norm with a tall system without exact solutions, nudge to underdetermined preset
  function onModeChange(id: string) {
    const next = id as Mode;
    if (next === 'minnorm') {
      const wideOrExactKer =
        (cols(A) > rows(A) && cls.exact) || (ker.length > 0 && cls.exact);
      if (!wideOrExactKer) {
        applyPreset('under');
        setMode('minnorm');
        return;
      }
    }
    setMode(next);
    if (next === 'svd') setSvdReveal(0);
  }

  const caption = joinCaption(
    `${m}×${n}`,
    `rango=${rank}`,
    mode === 'lsq' || mode === 'verify'
      ? `||r||=${formatNum(lsq.residualNorm)}`
      : mode === 'minnorm'
        ? `||x̂||=${formatNum(normXhat)}`
        : `σ=[${svdRes.S.map((s) => formatNum(s)).join(',')}]`,
    modeFooterLabel(mode),
    isSpecialInv && mode === 'verify' ? 'A⁺≈A⁻¹' : null,
  );

  const AAp = matMul(A, Ap);
  const ApA = matMul(Ap, A);

  return (
    <VizPanel title="Pseudoinversa · A⁺" caption={caption}>
      <div className="space-y-3">
        <GuideBlock
          idea="Vas a ver cómo A⁺ encuentra la mejor solución cuando Ax=b no puede resolverse con una inversa ordinaria."
          tryIt="Cambia el preset o edita A,b y observa cómo Ax̂ es el punto de Col(A) más cercano a b."
          concept="Si hay muchas soluciones exactas, A⁺ elige la de menor norma."
        />

        <div className="flex flex-wrap items-center gap-2">
          <Segmented options={MODE_OPTIONS} value={mode} onChange={onModeChange} />
        </div>

        <ChipRow>
          <Chip active={preset === 'over'} onClick={() => applyPreset('over')}>
            Sobredeterminado
          </Chip>
          <Chip active={preset === 'under'} onClick={() => applyPreset('under')}>
            Subdeterminado
          </Chip>
          <Chip active={preset === 'sing'} onClick={() => applyPreset('sing')}>
            Singular
          </Chip>
          <Chip active={preset === 'inv'} onClick={() => applyPreset('inv')}>
            Invertible
          </Chip>
        </ChipRow>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">
            {m}×{n}
          </Badge>
          <Badge tone="neutral">rango={rank}</Badge>
          <Badge tone={problemBadge.tone}>{problemBadge.text}</Badge>
          {cls.singular ? <Badge tone="bad">A⁻¹ no existe</Badge> : null}
          {cls.invertible ? <Badge tone="ok">CASO ESPECIAL A⁺=A⁻¹</Badge> : null}
          {preset === 'sing' ? <Badge tone="ok">A⁺ sí existe</Badge> : null}
        </div>

        {/* ——— Mode: Mínimos cuadrados ——— */}
        {mode === 'lsq' && (
          <div className="space-y-3">
            <ColPlaneSvg
              uid={uid}
              A={A}
              b={b}
              bHat={lsq.bHat}
              residual={lsq.residual}
              trialAx={trialAx}
              showTrial={tryOther}
            />

            <div className="rounded-xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_55%,var(--bg-elevated))] px-3 py-3 font-mono text-sm">
              <p>
                x̂ = A⁺b = <span className="text-[var(--accent-strong)]">{formatVec(lsq.xHat)}</span>
                <span className="text-[var(--fg-muted)]"> ∈ ℝⁿ</span>
              </p>
              <p className="mt-1">
                b̂ = Ax̂ = <span style={{ color: 'orange' }}>{formatVec(lsq.bHat)}</span>
                <span className="text-[var(--fg-muted)]"> ∈ ℝᵐ</span>
              </p>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                ||r||₂ = {formatNum(lsq.residualNorm)}
                {' · '}
                Aᵀr ≈ {formatVec(AtR)}
                {AtRNear0 ? ' ≈ 0 ✓' : ''}
              </p>
            </div>

            <p className="text-sm text-[var(--fg-muted)]">
              AA⁺ proyecta <span className="font-medium text-[var(--fg)]">b</span> sobre Col(A).
              Distingue <span className="font-mono text-[var(--fg)]">x̂ ∈ ℝⁿ</span> de{' '}
              <span className="font-mono text-[var(--fg)]">b̂ ∈ ℝᵐ</span>.
            </p>

            <MappingDiagram m={m} n={n} />

            <ControlsStack>
              <ButtonRow>
                <VizButton
                  active={tryOther}
                  onClick={() => {
                    setTryOther((v) => !v);
                    if (!tryOther) {
                      setTrialX(
                        lsq.xHat.map((xi, i) => xi + (i === 0 ? 0.6 : -0.4)),
                      );
                    }
                  }}
                >
                  Probar otra x
                </VizButton>
              </ButtonRow>
              {tryOther && (
                <div className="space-y-2 rounded-lg border border-[var(--border)] px-3 py-2">
                  {Array.from({ length: n }, (_, i) => (
                    <SliderRow
                      key={i}
                      label={`x${i + 1}`}
                      ariaLabel={`Componente ${i + 1} de x de prueba`}
                      value={xTrialFull[i] ?? 0}
                      min={-2}
                      max={3}
                      step={0.05}
                      onChange={(v) => {
                        const next = xTrialFull.slice();
                        next[i] = v;
                        setTrialX(next);
                      }}
                    />
                  ))}
                  <p className="font-mono text-xs text-[var(--fg-muted)]">
                    Ax = {formatVec(trialAx ?? [])}
                    {' · '}
                    ||b−Ax|| = {formatNum(trialResNorm ?? 0)}
                    {' vs '}
                    ||b−Ax̂|| = {formatNum(lsq.residualNorm)}
                    {trialResNorm != null && trialResNorm + LSQ_NEAR >= lsq.residualNorm
                      ? ' · Ax̂ gana ✓'
                      : ''}
                  </p>
                </div>
              )}
            </ControlsStack>
          </div>
        )}

        {/* ——— Mode: Norma mínima ——— */}
        {mode === 'minnorm' && (
          <div className="space-y-3">
            {ker.length === 0 ? (
              <p className="rounded-lg border border-amber-600/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
                ker(A) = {'{0}'}: la solución (si existe) es única. Prueba el preset Subdeterminado.
              </p>
            ) : (
              <>
                <ParamSpaceSvg uid={uid} xHat={lsq.xHat} z={z} t={tParam} />
                <div className="rounded-xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_55%,var(--bg-elevated))] px-3 py-3 font-mono text-sm">
                  <p>
                    x(t) = x̂ + t z = {formatVec(xOnLine)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--fg-muted)]">
                    z ∈ ker(A) = {formatVec(z)}
                    {' · '}
                    Ax(t) = {formatVec(AxCheck)}
                    {exactOnLine ? ' = b ✓' : ''}
                  </p>
                  <p className="mt-1 text-xs text-[var(--fg-muted)]">
                    ||x(t)|| = {formatNum(normXt)}
                    {' · '}
                    ||x̂|| = {formatNum(normXhat)}
                    {normXt + LSQ_NEAR >= normXhat ? ' · x̂ más cercana a O ✓' : ''}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {exactOnLine ? <Badge tone="ok">Ax = b para todo t</Badge> : <Badge tone="warn">Ax ≈ b</Badge>}
                  {xHatPerpKer ? <Badge tone="ok">x̂ ⊥ ker(A)</Badge> : <Badge tone="neutral">x̂ · z</Badge>}
                  <Badge tone="ok">NORMA MÍNIMA ✓</Badge>
                </div>
                <p className="text-sm text-[var(--fg-muted)]">
                  Todas las x(t) resuelven Ax = b; A⁺ elige la más cercana al origen.
                </p>
                <ControlsStack>
                  <SliderRow
                    label="t"
                    ariaLabel="Parámetro t a lo largo del núcleo"
                    value={tParam}
                    min={-2.5}
                    max={2.5}
                    step={0.05}
                    onChange={setTParam}
                  />
                </ControlsStack>
              </>
            )}
          </div>
        )}

        {/* ——— Mode: SVD ——— */}
        {mode === 'svd' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-[var(--fg-muted)]">Valores singulares</span>
              <ChipRow>
                {svdRes.S.map((σ, i) => (
                  <span
                    key={i}
                    className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1 font-mono text-xs text-[var(--fg)]"
                  >
                    σ{i + 1}={formatNum(σ)}
                    {σ <= svdRes.tol ? ' ≈0' : ''}
                  </span>
                ))}
              </ChipRow>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--fg-muted)]">
              <Badge tone="neutral">
                A {m}×{n}
              </Badge>
              <Badge tone="neutral">
                A⁺ {n}×{m}
              </Badge>
              <Badge tone={cls.singular || rank < Math.min(m, n) ? 'warn' : 'ok'}>
                rango={rank}
              </Badge>
              {cls.singular ? (
                <Badge tone="bad">A⁻¹ no existe · A⁺ sí</Badge>
              ) : null}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {[
                {
                  step: 0,
                  title: 'A',
                  body: `${m}×${n} · ${formatMatCompact(A)}`,
                },
                {
                  step: 1,
                  title: 'U Σ Vᵀ',
                  body: `A = U Σ Vᵀ · Σ = diag(${svdRes.S.map((s) => formatNum(s)).join(', ')})`,
                },
                {
                  step: 2,
                  title: 'Σ⁺',
                  body: `σ>0 → 1/σ · σ≈0 → 0 (nunca ∞) · Σ⁺ = diag(${svdRes.S.map((s) =>
                    s > svdRes.tol ? formatNum(1 / s) : '0',
                  ).join(', ')})`,
                },
                {
                  step: 3,
                  title: 'V Σ⁺ Uᵀ',
                  body: 'Recomposición: A⁺ = V Σ⁺ Uᵀ',
                },
                {
                  step: 4,
                  title: 'A⁺',
                  body: `${n}×${m} · ${formatMatCompact(Ap)}`,
                },
              ].map((card) =>
                svdReveal >= card.step ? (
                  <div
                    key={card.step}
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      svdReveal === card.step
                        ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)]'
                        : 'border-[var(--border)] bg-[var(--bg)]'
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                      {card.step + 1}. {card.title}
                    </p>
                    <p className="mt-1 font-mono text-xs leading-relaxed text-[var(--fg)]">
                      {card.body}
                    </p>
                  </div>
                ) : null,
              )}
            </div>

            <ButtonRow>
              <VizButton
                onClick={() => setSvdReveal((s) => Math.min(4, s + 1))}
                active={svdReveal < 4}
              >
                Construir A⁺
              </VizButton>
              <VizButton onClick={() => setSvdReveal(4)}>Revelar todo</VizButton>
              <VizButton onClick={() => setSvdReveal(0)}>Reiniciar</VizButton>
            </ButtonRow>
            <p className="text-xs text-[var(--fg-muted)]">
              En Σ⁺ solo se invierten σ &gt; 0; los nulos se dejan en 0 — jamás ∞.
            </p>
          </div>
        )}

        {/* ——— Mode: Verificar ——— */}
        {mode === 'verify' && (
          <div className="space-y-3">
            <div className="rounded-xl border border-[var(--border)] px-3 py-3 text-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                Condiciones de Moore–Penrose
              </p>
              <ul className="space-y-1.5 font-mono text-xs">
                <li className="flex flex-wrap items-center gap-2">
                  <Badge tone={mp.c1 ? 'ok' : 'bad'}>{mp.c1 ? '✓' : '✗'}</Badge>
                  <span>A A⁺ A = A</span>
                </li>
                <li className="flex flex-wrap items-center gap-2">
                  <Badge tone={mp.c2 ? 'ok' : 'bad'}>{mp.c2 ? '✓' : '✗'}</Badge>
                  <span>A⁺ A A⁺ = A⁺</span>
                </li>
                <li className="flex flex-wrap items-center gap-2">
                  <Badge tone={mp.c3 ? 'ok' : 'bad'}>{mp.c3 ? '✓' : '✗'}</Badge>
                  <span>(A A⁺)ᵀ = A A⁺</span>
                </li>
                <li className="flex flex-wrap items-center gap-2">
                  <Badge tone={mp.c4 ? 'ok' : 'bad'}>{mp.c4 ? '✓' : '✗'}</Badge>
                  <span>(A⁺ A)ᵀ = A⁺ A</span>
                </li>
              </ul>
              <p className="mt-2">
                {mp.all ? (
                  <Badge tone="ok">Las 4 condiciones se cumplen</Badge>
                ) : (
                  <Badge tone="warn">Revisa tolerancia numérica</Badge>
                )}
              </p>
            </div>

            <div className="space-y-1.5 text-sm text-[var(--fg-muted)]">
              <p>
                <span className="font-medium text-[var(--fg)]">AA⁺</span> = proyección ortogonal
                sobre Col(A)
                {m <= 3 && n <= 3 ? (
                  <span className="font-mono text-xs"> · {formatMatCompact(AAp)}</span>
                ) : null}
                . En general <span className="font-mono">≠ I</span>.
              </p>
              <p>
                <span className="font-medium text-[var(--fg)]">A⁺A</span> = proyección ortogonal
                sobre Row(A)
                {m <= 3 && n <= 3 ? (
                  <span className="font-mono text-xs"> · {formatMatCompact(ApA)}</span>
                ) : null}
                . En general <span className="font-mono">≠ I</span>.
              </p>
            </div>

            {cls.invertible && Ainv && det != null ? (
              <div className="rounded-xl border border-emerald-600/40 bg-emerald-500/10 px-3 py-3 text-sm">
                <div className="mb-1 flex flex-wrap gap-2">
                  <Badge tone="ok">CASO ESPECIAL A⁺ = A⁻¹</Badge>
                  <Badge tone="neutral">det(A) = {formatNum(det)}</Badge>
                </div>
                <p className="font-mono text-xs text-[var(--fg)]">
                  A⁻¹ ≈ {formatMatCompact(Ainv)}
                  {' · '}
                  A⁺ ≈ {formatMatCompact(Ap)}
                  {isSpecialInv ? ' · coinciden ✓' : ''}
                </p>
              </div>
            ) : cls.singular ? (
              <p className="text-sm text-[var(--fg-muted)]">
                A es singular: no hay A⁻¹, pero A⁺ sigue definida (rango={rank}).
              </p>
            ) : (
              <p className="text-sm text-[var(--fg-muted)]">
                A no es cuadrada invertible: A⁺ generaliza la inversa sin exigir det ≠ 0.
              </p>
            )}
          </div>
        )}

        <CollapsibleEdit
          label="Editar A y b"
          open={editOpen}
          onToggle={() => setEditOpen((o) => !o)}
        >
          <ControlsStack>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[var(--fg-muted)]">Forma</span>
              {(['3x2', '2x3', '2x2'] as ShapeId[]).map((s) => (
                <Chip key={s} active={shape === s} onClick={() => setShape(s)}>
                  {SHAPE_LABELS[s]}
                </Chip>
              ))}
            </div>

            <p className="text-xs font-medium text-[var(--fg-muted)]">Matriz A ({m}×{n})</p>
            <div className="space-y-1">
              {A.map((row, i) => (
                <div key={i} className="flex flex-wrap items-center gap-1.5">
                  {row.map((v, j) => (
                    <label key={j} className="flex items-center gap-1 text-xs">
                      <span className="font-mono text-[var(--fg-muted)]">
                        a{i + 1}{j + 1}
                      </span>
                      <input
                        type="number"
                        step={0.1}
                        value={v}
                        onChange={(e) => updateAEntry(i, j, Number(e.target.value))}
                        className="w-16 rounded-md border border-[var(--border)] bg-[var(--bg)] px-1.5 py-1 font-mono text-sm"
                      />
                    </label>
                  ))}
                </div>
              ))}
            </div>

            <p className="text-xs font-medium text-[var(--fg-muted)]">Vector b ∈ ℝ{m}</p>
            <div className="flex flex-wrap items-center gap-1.5">
              {b.map((vi, i) => (
                <label key={i} className="flex items-center gap-1 text-xs">
                  <span className="font-mono text-[var(--fg-muted)]">b{i + 1}</span>
                  <input
                    type="number"
                    step={0.1}
                    value={vi}
                    onChange={(e) => updateBEntry(i, Number(e.target.value))}
                    className="w-16 rounded-md border border-[var(--border)] bg-[var(--bg)] px-1.5 py-1 font-mono text-sm"
                  />
                </label>
              ))}
            </div>
          </ControlsStack>
        </CollapsibleEdit>
      </div>
    </VizPanel>
  );
}
