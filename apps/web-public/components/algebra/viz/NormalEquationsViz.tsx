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
  leastSquares,
  classifySystem,
  matMul,
  matT,
  matVec,
  vecDot,
  vecSub,
  vecNorm,
  vecAdd,
  vecScale,
  formatNum,
  formatVec,
  rows,
  cols,
  matrixRank,
  LSQ_NEAR,
  LSQ_EPS,
  type Mat,
  type Vec,
  cloneMat,
  pseudoInverse,
} from './lsqMath';
import {
  GuideBlock,
  Badge,
  Chip,
  ChipRow,
  Segmented,
  CollapsibleEdit,
} from './transformHelpers';
import { VEC_W, VEC_H } from './vectorPlane';

const W = Math.max(VEC_W, 420);
const H = Math.max(VEC_H, 300);
const OX = W / 2;
const OY = H / 2 + 12;
const ISO_S = 48;

type Mode = 'geo' | 'derive' | 'system';
type PresetId = 'inexact' | 'exact' | 'deficient' | 'reg' | 'square' | null;
type ShapeId = '3x2' | '2x2';
type Emph =
  | 'none'
  | 'residual'
  | 'cols'
  | 'AtR'
  | 'substitute'
  | 'normal'
  | 'trial';

const MODE_OPTIONS = [
  { id: 'geo', label: 'Geometría' },
  { id: 'derive', label: 'Derivación' },
  { id: 'system', label: 'Sistema normal' },
];

const PRESET_INEXACT: { A: Mat; b: Vec } = {
  A: [
    [1, 0],
    [0, 1],
    [1, 1],
  ],
  b: [1, 1, 3],
};

const PRESET_EXACT: { A: Mat; b: Vec } = {
  A: [
    [1, 0],
    [0, 1],
    [1, 1],
  ],
  b: [1, 2, 3],
};

const PRESET_DEFICIENT: { A: Mat; b: Vec } = {
  A: [
    [1, 2],
    [2, 4],
    [3, 6],
  ],
  b: [1, 2, 3],
};

const PRESET_REG: { A: Mat; b: Vec } = {
  A: [
    [1, 1],
    [1, 2],
    [1, 3],
  ],
  b: [1.0, 2.1, 2.8],
};

const PRESET_SQUARE: { A: Mat; b: Vec } = {
  A: [
    [2, 1],
    [1, 3],
  ],
  b: [5, 4],
};

const DERIVE_STEPS = [
  {
    title: 'Residuo',
    body: 'r = b − Ax̂',
    detail: 'El error de aproximación en ℝᵐ.',
    emph: 'residual' as Emph,
  },
  {
    title: 'Ortogonalidad',
    body: 'r ⊥ Col(A)',
    detail: 'En el óptimo, el residuo es perpendicular a todo el plano de columnas.',
    emph: 'cols' as Emph,
  },
  {
    title: 'Forma matricial',
    body: 'Aᵀr = 0',
    detail: 'Aᵀr apila los productos punto aⱼ · r.',
    emph: 'AtR' as Emph,
  },
  {
    title: 'Sustituir',
    body: 'Aᵀ(b − Ax̂) = 0',
    detail: 'Reemplaza r por b − Ax̂.',
    emph: 'substitute' as Emph,
  },
  {
    title: 'Reordenar',
    body: 'AᵀA x̂ = Aᵀb',
    detail: 'Las ecuaciones normales.',
    emph: 'normal' as Emph,
  },
];

function cloneVec(v: Vec): Vec {
  return v.slice();
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function shapeOf(A: Mat): ShapeId {
  return rows(A) === 2 && cols(A) === 2 ? '2x2' : '3x2';
}

function resizeToShape(A: Mat, b: Vec, shape: ShapeId): { A: Mat; b: Vec } {
  const [tm, tn] = shape === '2x2' ? [2, 2] : [3, 2];
  const next: Mat = Array.from({ length: tm }, (_, i) =>
    Array.from({ length: tn }, (_, j) => A[i]?.[j] ?? (i === j ? 1 : 0)),
  );
  const nb = Array.from({ length: tm }, (_, i) => b[i] ?? 0);
  return { A: next, b: nb };
}

function columnOf(A: Mat, j: number): Vec {
  return A.map((row) => row[j] ?? 0);
}

function formatMatCompact(A: Mat): string {
  return `[${A.map((r) => `[${r.map((v) => formatNum(v)).join(',')}]`).join('')}]`;
}

function matNearSym(S: Mat, eps = LSQ_NEAR): boolean {
  const n = rows(S);
  if (n !== cols(S)) return false;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.abs((S[i]?.[j] ?? 0) - (S[j]?.[i] ?? 0)) > eps) return false;
    }
  }
  return true;
}

function problemLabel(problem: ReturnType<typeof classifySystem>['problem']): {
  text: string;
  tone: 'ok' | 'bad' | 'warn' | 'neutral';
} {
  switch (problem) {
    case 'least_squares':
      return { text: 'SOBREDETERMINADO', tone: 'warn' };
    case 'unique_exact':
      return { text: 'SOLUCIÓN EXACTA', tone: 'ok' };
    case 'infinite_exact':
      return { text: 'MÚLTIPLES EXACTAS', tone: 'ok' };
    case 'inconsistent_deficient':
      return { text: 'RANGO DEFICIENTE', tone: 'bad' };
    default:
      return { text: '—', tone: 'neutral' };
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

function ColPlaneSvg({
  uid,
  A,
  b,
  bHat,
  residual,
  trialAx,
  showTrial,
  emph = 'none',
  reveal = 5,
  compact = false,
}: {
  uid: string;
  A: Mat;
  b: Vec;
  bHat: Vec;
  residual: Vec;
  trialAx: Vec | null;
  showTrial: boolean;
  emph?: Emph;
  reveal?: number;
  compact?: boolean;
}) {
  const m = rows(A);
  const n = cols(A);
  const useR3 = m === 3 && n === 2;
  const a1 = useR3
    ? [A[0]![0]!, A[1]![0]!, A[2]![0]!]
    : [A[0]?.[0] ?? 1, A[1]?.[0] ?? 0, 0];
  const a2 =
    n >= 2
      ? useR3
        ? [A[0]![1]!, A[1]![1]!, A[2]![1]!]
        : [A[0]?.[1] ?? 0, A[1]?.[1] ?? 1, 0]
      : [0, 1, 0];
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
  const ext = 1.35;
  const q0 = iso3(
    -0.2 * a1[0]! - 0.2 * a2[0]!,
    -0.2 * a1[1]! - 0.2 * a2[1]!,
    -0.2 * a1[2]! - 0.2 * a2[2]!,
  );
  const q1 = iso3(
    ext * a1[0]! - 0.2 * a2[0]!,
    ext * a1[1]! - 0.2 * a2[1]!,
    ext * a1[2]! - 0.2 * a2[2]!,
  );
  const q2 = iso3(
    ext * a1[0]! + ext * a2[0]!,
    ext * a1[1]! + ext * a2[1]!,
    ext * a1[2]! + ext * a2[2]!,
  );
  const q3 = iso3(
    -0.2 * a1[0]! + ext * a2[0]!,
    -0.2 * a1[1]! + ext * a2[1]!,
    -0.2 * a1[2]! + ext * a2[2]!,
  );

  const pb = iso3(bp[0]!, bp[1]!, bp[2]!);
  const pbh = iso3(bhp[0]!, bhp[1]!, bhp[2]!);
  const ptrial = trialP ? iso3(trialP[0]!, trialP[1]!, trialP[2]!) : null;

  const rScreen = { x: pb.x - pbh.x, y: pb.y - pbh.y };
  const planeDir = { x: pA1.x - o.x, y: pA1.y - o.y };
  const rLen = Math.hypot(rScreen.x, rScreen.y);
  const right =
    rLen > 4 && reveal >= 4
      ? rightAngleMark(pbh, planeDir, rScreen, 11)
      : '';

  const showPlane = reveal >= 1;
  const showCols = reveal >= 1;
  const showB = reveal >= 2;
  const showBhat = reveal >= 3;
  const showR = reveal >= 4;
  const showRight = reveal >= 5;

  const emphCols = emph === 'cols' || emph === 'AtR' || emph === 'normal';
  const emphR = emph === 'residual' || emph === 'AtR' || emph === 'substitute';
  const emphBhat = emph === 'normal' || emph === 'substitute';
  const vw = compact ? 320 : W;
  const vh = compact ? 220 : H;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`h-auto w-full rounded-xl border border-[var(--border)] ${compact ? 'max-h-52' : ''}`}
      role="img"
      aria-label="Col(A) como plano; b fuera; b̂ = Ax̂; residuo ortogonal"
      style={compact ? { maxWidth: vw, maxHeight: vh } : undefined}
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
        <marker
          id={`${uid}-arr-a`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="var(--accent-strong)" />
        </marker>
      </defs>

      <line x1={40} y1={OY + 40} x2={W - 40} y2={OY + 40} stroke="currentColor" opacity={0.12} />
      <line x1={OX} y1={H - 28} x2={OX} y2={28} stroke="currentColor" opacity={0.12} />

      {showPlane && (
        <polygon
          points={`${q0.x},${q0.y} ${q1.x},${q1.y} ${q2.x},${q2.y} ${q3.x},${q3.y}`}
          fill="var(--accent-soft)"
          opacity={emphCols ? 0.75 : 0.55}
          stroke="var(--accent-strong)"
          strokeWidth={emphCols ? 2 : 1.2}
        />
      )}
      {showCols && (
        <polygon
          points={`${o.x},${o.y} ${pA1.x},${pA1.y} ${pSum.x},${pSum.y} ${pA2.x},${pA2.y}`}
          fill="var(--accent-strong)"
          fillOpacity={0.12}
          stroke="var(--accent-strong)"
          strokeWidth={1.4}
          strokeDasharray="4 3"
        />
      )}

      {showPlane && (
        <text x={q2.x - 8} y={q2.y - 8} fontSize={11} fontWeight={700} fill="var(--accent-strong)">
          Col(A)
        </text>
      )}

      <circle cx={o.x} cy={o.y} r={4} fill="currentColor" opacity={0.5} />
      <text x={o.x - 14} y={o.y + 14} fontSize={11} fill="currentColor" opacity={0.55}>
        O
      </text>

      {showCols && (
        <>
          <line
            x1={o.x}
            y1={o.y}
            x2={pA1.x}
            y2={pA1.y}
            stroke="var(--accent-strong)"
            strokeWidth={emphCols ? 2.6 : 2}
            markerEnd={`url(#${uid}-arr-a)`}
          />
          <text
            x={pA1.x + 6}
            y={pA1.y - 6}
            fontSize={11}
            fontWeight={700}
            fill="var(--accent-strong)"
          >
            a₁
          </text>
          <line
            x1={o.x}
            y1={o.y}
            x2={pA2.x}
            y2={pA2.y}
            stroke="var(--accent-strong)"
            strokeWidth={emphCols ? 2.6 : 2}
            markerEnd={`url(#${uid}-arr-a)`}
            opacity={0.85}
          />
          <text
            x={pA2.x + 6}
            y={pA2.y + 12}
            fontSize={11}
            fontWeight={700}
            fill="var(--accent-strong)"
          >
            a₂
          </text>
        </>
      )}

      {showBhat && (
        <>
          <line
            x1={o.x}
            y1={o.y}
            x2={pbh.x}
            y2={pbh.y}
            stroke="orange"
            strokeWidth={emphBhat ? 3 : 2.4}
            markerEnd={`url(#${uid}-arr-bh)`}
          />
          <circle cx={pbh.x} cy={pbh.y} r={5} fill="orange" />
          <text x={pbh.x + 8} y={pbh.y - 8} fontSize={12} fontWeight={700} fill="orange">
            b̂
          </text>
        </>
      )}

      {showR && rLen > 2 && (
        <line
          x1={pbh.x}
          y1={pbh.y}
          x2={pb.x}
          y2={pb.y}
          stroke="currentColor"
          strokeWidth={emphR ? 2.4 : 1.8}
          strokeDasharray="5 4"
          opacity={emphR ? 0.9 : 0.65}
        />
      )}
      {showRight && right ? (
        <path d={right} fill="none" stroke="orange" strokeWidth={1.6} />
      ) : null}

      {showB && (
        <>
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
        </>
      )}

      {showR && rLen > 8 && (
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
      <title>{`||r||=${formatNum(vecNorm(residual))}`}</title>
    </svg>
  );
}

function RegScatterSvg({
  A,
  b,
  xHat,
}: {
  A: Mat;
  b: Vec;
  xHat: Vec;
}) {
  const pad = 36;
  const rw = W;
  const rh = 240;
  const xs = A.map((row) => row[1] ?? 0);
  const ys = b.slice();
  const xMin = Math.min(...xs, 0) - 0.4;
  const xMax = Math.max(...xs, 1) + 0.6;
  const yMin = Math.min(...ys, 0) - 0.5;
  const yMax = Math.max(...ys, 1) + 0.8;
  const rx = (x: number) => pad + ((x - xMin) / (xMax - xMin || 1)) * (rw - 2 * pad);
  const ry = (y: number) => rh - pad - ((y - yMin) / (yMax - yMin || 1)) * (rh - 2 * pad);
  const b0 = xHat[0] ?? 0;
  const b1 = xHat[1] ?? 0;
  const yLine = (x: number) => b0 + b1 * x;

  return (
    <svg
      viewBox={`0 0 ${rw} ${rh}`}
      className="h-auto w-full rounded-xl border border-[var(--border)]"
      role="img"
      aria-label="Regresión lineal: nube de puntos, recta LS y residuos verticales"
    >
      <line
        x1={pad}
        y1={ry(0)}
        x2={rw - pad}
        y2={ry(0)}
        stroke="var(--fg-muted)"
        opacity={0.35}
      />
      <line
        x1={rx(0)}
        y1={pad}
        x2={rx(0)}
        y2={rh - pad}
        stroke="var(--fg-muted)"
        opacity={0.35}
      />
      <line
        x1={rx(xMin)}
        y1={ry(yLine(xMin))}
        x2={rx(xMax)}
        y2={ry(yLine(xMax))}
        stroke="orange"
        strokeWidth={2.4}
      />
      {xs.map((xi, i) => {
        const yi = ys[i]!;
        const yFit = yLine(xi);
        return (
          <g key={i}>
            <line
              x1={rx(xi)}
              y1={ry(yi)}
              x2={rx(xi)}
              y2={ry(yFit)}
              stroke="currentColor"
              strokeWidth={1.5}
              opacity={0.55}
              strokeDasharray="3 3"
            />
            <circle cx={rx(xi)} cy={ry(yi)} r={5} fill="teal" />
            <text x={rx(xi) + 7} y={ry(yi) - 7} fontSize={10} fill="var(--fg-muted)">
              ({formatNum(xi, 1)},{formatNum(yi, 1)})
            </text>
          </g>
        );
      })}
      <text x={pad} y={20} fontSize={11} fill="var(--fg-muted)">
        Residuos verticales · AᵀA β̂ = Aᵀb
      </text>
    </svg>
  );
}

/**
 * Ecuaciones normales: AᵀA x̂ = Aᵀb (ALG-LSQ-002).
 */
export function NormalEquationsViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [A, setA] = useState<Mat>(() => cloneMat(PRESET_INEXACT.A));
  const [b, setB] = useState<Vec>(() => cloneVec(PRESET_INEXACT.b));
  const [mode, setMode] = useState<Mode>('geo');
  const [preset, setPreset] = useState<PresetId>('inexact');
  const [editOpen, setEditOpen] = useState(false);
  const [tryOther, setTryOther] = useState(false);
  const [trialX, setTrialX] = useState<Vec>([0.2, 1.4]);
  /** 2 = Col(A)+b visibles; 5 = proyección completa. Arranca en 2 para que «Proyectar b» se note. */
  const [projectStep, setProjectStep] = useState(2);
  const [projectPlaying, setProjectPlaying] = useState(false);
  const projectTimers = useRef<number[]>([]);
  const [deriveStep, setDeriveStep] = useState(0);
  const [altDeriveOpen, setAltDeriveOpen] = useState(false);
  const [numNoteOpen, setNumNoteOpen] = useState(false);

  const PROJECT_CAPTIONS = [
    'Preparando el espacio…',
    'Col(A) = span{a₁, a₂}: ahí viven todos los Ax.',
    'El dato b está fuera de Col(A): no hay solución exacta.',
    'b̂ = Ax̂ es el punto de Col(A) más cercano a b.',
    'El residuo r = b − b̂ conecta b̂ con b.',
    'En el óptimo: r ⊥ Col(A)  ⇒  Aᵀr = 0  ⇒  AᵀA x̂ = Aᵀb.',
  ] as const;

  function clearProjectTimers() {
    for (const id of projectTimers.current) window.clearTimeout(id);
    projectTimers.current = [];
    setProjectPlaying(false);
  }

  useEffect(
    () => () => {
      for (const id of projectTimers.current) window.clearTimeout(id);
      projectTimers.current = [];
    },
    [],
  );

  const m = rows(A);
  const n = cols(A);
  const shape = shapeOf(A);

  const At = useMemo(() => matT(A), [A]);
  const AtA = useMemo(() => matMul(At, A), [At, A]);
  const Atb = useMemo(() => matVec(At, b), [At, b]);
  const lsq = useMemo(() => leastSquares(A, b), [A, b]);
  const AtR = useMemo(() => matVec(At, lsq.residual), [At, lsq.residual]);
  const cls = useMemo(() => classifySystem(A, b), [A, b]);
  const rank = matrixRank(A);
  const colDots = useMemo(() => {
    const r = lsq.residual;
    return Array.from({ length: n }, (_, j) => vecDot(columnOf(A, j), r));
  }, [A, lsq.residual, n]);

  const AtANearSym = matNearSym(AtA);
  const AtRNear0 =
    vecNorm(AtR) <= LSQ_NEAR * (1 + Math.max(1, vecNorm(b)) * (1 + lsq.residualNorm));
  const deficient = rank < n;
  const Ap = useMemo(() => (deficient ? pseudoInverse(A) : null), [A, deficient]);
  const xMinNorm = Ap ? matVec(Ap, b) : lsq.xHat;

  const xTrialFull = useMemo(() => {
    const base = trialX.slice(0, n);
    while (base.length < n) base.push(0);
    return base.slice(0, n);
  }, [trialX, n]);

  const trialAx = tryOther ? matVec(A, xTrialFull) : null;
  const trialRes = trialAx ? vecSub(b, trialAx) : null;
  const trialAtE = trialRes ? matVec(At, trialRes) : null;
  const trialErrNorm = trialRes ? vecNorm(trialRes) : null;
  const trialWorse =
    trialErrNorm != null &&
    trialErrNorm > lsq.residualNorm + Math.max(LSQ_EPS, LSQ_NEAR * (1 + vecNorm(b)));
  const trialAtNear0 =
    trialAtE != null &&
    vecNorm(trialAtE) <= LSQ_NEAR * (1 + Math.max(1, vecNorm(b)) * (1 + vecNorm(trialRes!)));
  // Distance of trial x from x̂ (for UI hint)
  const trialDeltaNorm = tryOther ? vecNorm(vecSub(xTrialFull, lsq.xHat)) : 0;

  const isReg = preset === 'reg';
  const problemBadge = problemLabel(cls.problem);
  const deriveEmph = DERIVE_STEPS[deriveStep]?.emph ?? 'none';

  function applyPreset(id: Exclude<PresetId, null>) {
    const map = {
      inexact: PRESET_INEXACT,
      exact: PRESET_EXACT,
      deficient: PRESET_DEFICIENT,
      reg: PRESET_REG,
      square: PRESET_SQUARE,
    }[id];
    setA(cloneMat(map.A));
    setB(cloneVec(map.b));
    setPreset(id);
    setTryOther(false);
    clearProjectTimers();
    setProjectStep(2);
    setDeriveStep(0);
    const nn = cols(map.A);
    setTrialX(Array.from({ length: Math.max(2, nn) }, (_, i) => (i === 0 ? 0.2 : 1.2)));
  }

  function setShape(next: ShapeId) {
    const resized = resizeToShape(A, b, next);
    setA(resized.A);
    setB(resized.b);
    setPreset(null);
    clearProjectTimers();
    setProjectStep(2);
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

  function projectB() {
    setTryOther(false);
    clearProjectTimers();
    if (prefersReducedMotion()) {
      setProjectStep(5);
      return;
    }
    // Desde Col(A)+b (paso 2) aparecen b̂ → r → 90°
    setProjectStep(2);
    setProjectPlaying(true);
    const delays = [450, 900, 1350]; // →3, →4, →5
    delays.forEach((ms, i) => {
      const id = window.setTimeout(() => {
        setProjectStep(3 + i);
        if (i === delays.length - 1) setProjectPlaying(false);
      }, ms);
      projectTimers.current.push(id);
    });
  }

  function resetProjectionView() {
    clearProjectTimers();
    setTryOther(false);
    setProjectStep(2);
  }

  const caption = joinCaption(
    `${m}×${n}`,
    `rango=${rank}`,
    `||r||=${formatNum(lsq.residualNorm)}`,
    AtRNear0 ? 'Aᵀr≈0' : `Aᵀr=${formatVec(AtR)}`,
  );

  const atADotsLabel =
    n >= 2
      ? `[[a1·a1=${formatNum(vecDot(columnOf(A, 0), columnOf(A, 0)))}, a1·a2=${formatNum(
          vecDot(columnOf(A, 0), columnOf(A, 1)),
        )}],[a2·a1=${formatNum(vecDot(columnOf(A, 1), columnOf(A, 0)))}, a2·a2=${formatNum(
          vecDot(columnOf(A, 1), columnOf(A, 1)),
        )}]]`
      : formatMatCompact(AtA);

  return (
    <VizPanel title="Ecuaciones normales · AᵀA x̂ = Aᵀb" caption={caption}>
      <div className="space-y-3">
        <GuideBlock
          idea="Las ecuaciones normales aparecen porque, en la mejor aproximación, el error es perpendicular a todas las columnas de A."
          tryIt="Proyecta b o prueba otra x: solo en el óptimo Aᵀr = 0 y se cumple AᵀA x̂ = Aᵀb."
          concept="Aᵀ reúne los productos punto del residuo con cada columna."
        />

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={MODE_OPTIONS}
            value={mode}
            onChange={(id) => {
              setMode(id as Mode);
              if (id === 'derive') setDeriveStep(0);
              if (id === 'geo') {
                clearProjectTimers();
                setProjectStep(2);
              }
            }}
          />
        </div>

        <ChipRow>
          <Chip active={preset === 'inexact'} onClick={() => applyPreset('inexact')}>
            Sin solución exacta
          </Chip>
          <Chip active={preset === 'exact'} onClick={() => applyPreset('exact')}>
            Solución exacta
          </Chip>
          <Chip active={preset === 'deficient'} onClick={() => applyPreset('deficient')}>
            Rango deficiente
          </Chip>
          <Chip active={preset === 'reg'} onClick={() => applyPreset('reg')}>
            Regresión
          </Chip>
          <Chip active={preset === 'square'} onClick={() => applyPreset('square')}>
            Cuadrada invertible
          </Chip>
        </ChipRow>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">
            {m}×{n}
          </Badge>
          <Badge tone="neutral">rango={rank}</Badge>
          <Badge tone={problemBadge.tone}>{problemBadge.text}</Badge>
          {deficient ? <Badge tone="bad">AᵀA singular</Badge> : null}
          {cls.exact ? <Badge tone="ok">r ≈ 0</Badge> : null}
        </div>

        {/* ——— Geometría ——— */}
        {mode === 'geo' && (
          <div className="space-y-3">
            {isReg ? (
              <RegScatterSvg A={A} b={b} xHat={lsq.xHat} />
            ) : (
              <ColPlaneSvg
                uid={`${uid}-geo`}
                A={A}
                b={b}
                bHat={lsq.bHat}
                residual={lsq.residual}
                trialAx={trialAx}
                showTrial={tryOther}
                emph={tryOther ? 'trial' : projectStep >= 5 ? 'none' : projectStep >= 3 ? 'normal' : 'cols'}
                reveal={tryOther ? 5 : projectStep}
              />
            )}

            {!isReg ? (
              <div
                className="rounded-lg border border-[var(--border)] bg-[var(--accent-soft)]/40 px-3 py-2 text-sm text-[var(--fg)]"
                aria-live="polite"
              >
                <span className="font-medium text-[var(--accent-strong)]">
                  {projectPlaying
                    ? `Proyectando… ${Math.min(projectStep, 5)}/5`
                    : projectStep < 5
                      ? `Antes de proyectar · ${projectStep}/5`
                      : 'Proyección completa · 5/5'}
                </span>
                <span className="mt-0.5 block text-[var(--fg-muted)]">
                  {PROJECT_CAPTIONS[Math.min(projectStep, PROJECT_CAPTIONS.length - 1)]}
                </span>
              </div>
            ) : null}

            <p className="text-sm text-[var(--fg-muted)]">
              &quot;Normal&quot; = perpendicular: el residuo es normal a Col(A).
            </p>

            <div className="rounded-xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_55%,var(--bg-elevated))] px-3 py-3 font-mono text-sm">
              {projectStep < 3 && !tryOther ? (
                <p className="text-[var(--fg-muted)]">
                  Pulsa <span className="font-sans font-medium text-[var(--fg)]">Proyectar b</span> para
                  localizar b̂ = Ax̂ sobre Col(A) y ver el residuo ortogonal.
                </p>
              ) : (
                <>
                  <p>
                    r = b − Ax̂ ={' '}
                    <span className="text-[var(--fg)]">{formatVec(lsq.residual)}</span>
                  </p>
                  <p className="mt-1">
                    ||r||₂ = {formatNum(lsq.residualNorm)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--fg-muted)]">
                    {Array.from({ length: n }, (_, j) => (
                      <span key={j} className="mr-3">
                        a{j + 1}·r ≈ {formatNum(colDots[j] ?? 0)}
                      </span>
                    ))}
                  </p>
                  <p className="mt-1">
                    Aᵀr = <span className="text-[var(--accent-strong)]">{formatVec(AtR)}</span>
                    {AtRNear0 ? ' ≈ 0 ✓' : ''}
                  </p>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {projectStep >= 5 || tryOther ? (
                AtRNear0 ? (
                  <Badge tone="ok">Aᵀr = 0 · ÓPTIMA</Badge>
                ) : (
                  <Badge tone="warn">Aᵀr ≠ 0</Badge>
                )
              ) : (
                <Badge tone="neutral">Pendiente de proyectar</Badge>
              )}
              {isReg ? (
                <Badge tone="neutral">AᵀA β̂ = Aᵀb</Badge>
              ) : null}
            </div>

            <ControlsStack>
              <ButtonRow>
                <VizButton
                  onClick={projectB}
                  active={projectPlaying || projectStep < 5}
                  disabled={projectPlaying}
                >
                  {projectStep >= 5 ? 'Repetir proyección' : 'Proyectar b'}
                </VizButton>
                {projectStep > 2 || projectPlaying ? (
                  <VizButton onClick={resetProjectionView} disabled={projectPlaying}>
                    Ver solo Col(A) y b
                  </VizButton>
                ) : null}
                <VizButton
                  active={tryOther}
                  onClick={() => {
                    clearProjectTimers();
                    setProjectStep(5);
                    setTryOther((v) => !v);
                    if (!tryOther) {
                      const delta = Array.from({ length: n }, (_, i) =>
                        i === 0 ? 1 : i === 1 ? -1 : 0.4,
                      );
                      setTrialX(vecAdd(lsq.xHat, vecScale(delta, 0.7)));
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
                    e = b − Ax = {formatVec(trialRes ?? [])}
                    {' · '}
                    ||e|| = {formatNum(trialErrNorm ?? 0)}
                    {trialWorse ? ' > ||r||' : ' ≈ ||r||'}
                    {' · '}
                    ||x − x̂|| = {formatNum(trialDeltaNorm)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {trialAtNear0 ? (
                      <Badge tone="ok">Aᵀe ≈ 0 · ÓPTIMA</Badge>
                    ) : (
                      <Badge tone="bad">
                        Aᵀe = {formatVec(trialAtE ?? [])} · NO ÓPTIMA
                      </Badge>
                    )}
                    <Badge tone="ok">Aᵀr = 0 en x̂</Badge>
                  </div>
                </div>
              )}
            </ControlsStack>
          </div>
        )}

        {/* ——— Derivación ——— */}
        {mode === 'derive' && (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                {DERIVE_STEPS.map((step, i) =>
                  i <= deriveStep ? (
                    <div
                      key={step.title}
                      className={`rounded-xl border px-3 py-2 text-sm ${
                        deriveStep === i
                          ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)]'
                          : 'border-[var(--border)] bg-[var(--bg)]'
                      }`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                        {i + 1}. {step.title}
                      </p>
                      <p className="mt-1 font-mono text-[var(--fg)]">{step.body}</p>
                      <p className="mt-0.5 text-xs text-[var(--fg-muted)]">{step.detail}</p>
                      {i === 2 && (
                        <p className="mt-1 font-mono text-xs text-[var(--fg-muted)]">
                          Aᵀr = [{colDots.map((d) => formatNum(d)).join(', ')}]ᵀ
                          {AtRNear0 ? ' ≈ 0' : ''}
                        </p>
                      )}
                    </div>
                  ) : null,
                )}
              </div>
              <ColPlaneSvg
                uid={`${uid}-der`}
                A={A}
                b={b}
                bHat={lsq.bHat}
                residual={lsq.residual}
                trialAx={null}
                showTrial={false}
                emph={deriveEmph}
                reveal={5}
                compact
              />
            </div>

            <ButtonRow>
              <VizButton
                onClick={() => setDeriveStep((s) => Math.min(4, s + 1))}
                active={deriveStep < 4}
              >
                Siguiente paso
              </VizButton>
              <VizButton onClick={() => setDeriveStep(4)}>Revelar todo</VizButton>
              <VizButton onClick={() => setDeriveStep(0)}>Reiniciar</VizButton>
            </ButtonRow>

            {deriveStep >= 4 && (
              <div className="rounded-xl border border-[var(--border)] px-3 py-2 font-mono text-sm">
                <p>
                  AᵀA x̂ = {formatMatCompact(AtA)} · {formatVec(lsq.xHat)}
                </p>
                <p className="mt-1">
                  Aᵀb = {formatVec(Atb)}
                  {' · '}
                  x̂ = {formatVec(lsq.xHat)}
                </p>
              </div>
            )}

            <CollapsibleEdit
              label="Ver otra derivación"
              open={altDeriveOpen}
              onToggle={() => setAltDeriveOpen((o) => !o)}
            >
              <div className="space-y-1.5 text-sm text-[var(--fg-muted)]">
                <p>
                  Minimiza E(x) = ||Ax − b||². El gradiente es ∇E = 2 Aᵀ(Ax − b).
                </p>
                <p className="font-mono text-[var(--fg)]">
                  ∇E = 0 ⇒ Aᵀ(Ax − b) = 0 ⇒ AᵀA x = Aᵀb
                </p>
                <p>Misma ecuación: la condición de estacionariedad es la ortogonalidad Aᵀr = 0.</p>
              </div>
            </CollapsibleEdit>
          </div>
        )}

        {/* ——— Sistema normal ——— */}
        {mode === 'system' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-mono text-[var(--fg-muted)]">
              <span className="rounded-md bg-[var(--accent-soft)] px-2 py-1 text-[var(--fg)]">
                A {m}×{n}
              </span>
              <span>→</span>
              <span className="rounded-md border border-[var(--border)] px-2 py-1">
                Aᵀ {n}×{m}
              </span>
              <span>→</span>
              <span className="rounded-md bg-[var(--accent-soft)] px-2 py-1 text-[var(--fg)]">
                AᵀA {n}×{n}
              </span>
              <span className="mx-0.5 opacity-40">,</span>
              <span className="rounded-md border border-[var(--border)] px-2 py-1">
                Aᵀb {n}×1
              </span>
              <span>→</span>
              <span className="rounded-md bg-orange-500/15 px-2 py-1 text-orange-700 dark:text-orange-300">
                x̂ {n}×1
              </span>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_55%,var(--bg-elevated))] px-3 py-3 font-mono text-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                AᵀA como productos de columnas
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--fg)]">{atADotsLabel}</p>
              <p className="mt-2">
                AᵀA = <span className="text-[var(--accent-strong)]">{formatMatCompact(AtA)}</span>
              </p>
              <p className="mt-1">
                Aᵀb = <span className="text-[var(--fg)]">{formatVec(Atb)}</span>
              </p>
              <p className="mt-1">
                x̂ ={' '}
                <span style={{ color: 'orange' }}>{formatVec(lsq.xHat)}</span>
                <span className="text-[var(--fg-muted)]"> (vía mínimos cuadrados / A⁺)</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {AtANearSym ? <Badge tone="ok">SIMÉTRICA</Badge> : <Badge tone="warn">no simétrica ≈</Badge>}
              {cls.fullColumnRank ? (
                <Badge tone="ok">rango completo de columnas</Badge>
              ) : (
                <Badge tone="bad">AᵀA singular · múltiples minimizadores</Badge>
              )}
            </div>

            {cls.fullColumnRank ? (
              <p className="text-sm text-[var(--fg-muted)]">
                Con rango de columnas completo:{' '}
                <span className="font-mono text-[var(--fg)]">
                  x̂ = (AᵀA)⁻¹ Aᵀb
                </span>{' '}
                (fórmula; aquí se calcula con leastSquares / A⁺).
              </p>
            ) : (
              <div className="rounded-xl border border-amber-600/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
                <p>
                  AᵀA es singular: hay muchos x que minimizan ||Ax − b||. La pseudoinversa elige
                  la de norma mínima: x = A⁺b = {formatVec(xMinNorm)}.
                </p>
                <p className="mt-1 text-xs">
                  <span className="font-medium">Ver Pseudoinversa</span> (ALG-LSQ-003) para el
                  pipeline SVD.
                </p>
              </div>
            )}

            <CollapsibleEdit
              label="Nota numérica"
              open={numNoteOpen}
              onToggle={() => setNumNoteOpen((o) => !o)}
            >
              <div className="space-y-1.5 text-sm text-[var(--fg-muted)]">
                <p>
                  Condicionamiento:{' '}
                  <span className="font-mono text-[var(--fg)]">κ(AᵀA) = κ(A)²</span>. Formar
                  AᵀA amplifica errores.
                </p>
                <p>
                  En la práctica se prefieren QR o SVD frente a resolver (AᵀA)x = Aᵀb de forma
                  directa.
                </p>
              </div>
            </CollapsibleEdit>
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
              <Chip active={shape === '3x2'} onClick={() => setShape('3x2')}>
                3×2
              </Chip>
              <Chip active={shape === '2x2'} onClick={() => setShape('2x2')}>
                2×2
              </Chip>
            </div>

            <p className="text-xs font-medium text-[var(--fg-muted)]">
              Matriz A ({m}×{n})
            </p>
            <div className="space-y-1">
              {A.map((row, i) => (
                <div key={i} className="flex flex-wrap items-center gap-1.5">
                  {row.map((v, j) => (
                    <label key={j} className="flex items-center gap-1 text-xs">
                      <span className="font-mono text-[var(--fg-muted)]">
                        a{i + 1}
                        {j + 1}
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
