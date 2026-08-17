'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  VizButton,
  VizPanel,
  joinCaption,
} from './controls';
import {
  luDecomposition,
  forwardSubstitution,
  backSubstitution,
  matMul,
  matVec,
  matSub,
  matFrobenius,
  formatNum,
  cloneMat,
  rows,
  cols,
  identity,
  LSQ_NEAR,
  LSQ_EPS,
  type Mat,
  type Vec,
  type LuStep,
} from './decompMath';
import {
  Badge,
  Chip,
  ChipRow,
  CollapsibleEdit,
  GuideBlock,
  Segmented,
} from './transformHelpers';

type Mode = 'elim' | 'factors' | 'solve';
type PresetId = 'nopivot' | 'pivot' | '3x3' | 'sing' | 'id' | null;

const MODE_OPTS = [
  { id: 'elim', label: 'Eliminación' },
  { id: 'factors', label: 'Factores' },
  { id: 'solve', label: 'Resolver Ax=b' },
];

const PRESETS: Array<{ id: Exclude<PresetId, null>; label: string; A: Mat; b: Vec }> = [
  {
    id: 'nopivot',
    label: 'Sin pivoteo',
    A: [
      [2, 1],
      [1, 3],
    ],
    b: [5, 4],
  },
  {
    id: 'pivot',
    label: 'Requiere pivoteo',
    A: [
      [0, 2],
      [3, 1],
    ],
    b: [4, 5],
  },
  {
    id: '3x3',
    label: '3×3 regular',
    A: [
      [2, 1, 1],
      [4, -6, 0],
      [-2, 7, 2],
    ],
    b: [5, -2, 9],
  },
  {
    id: 'sing',
    label: 'Singular',
    A: [
      [1, 2],
      [2, 4],
    ],
    b: [3, 6],
  },
  {
    id: 'id',
    label: 'Identidad',
    A: [
      [1, 0],
      [0, 1],
    ],
    b: [3, -1],
  },
];

const DEFAULT_A: Mat = [
  [2, 1],
  [1, 3],
];
const DEFAULT_B: Vec = [5, 4];

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function cloneVec(v: Vec): Vec {
  return v.slice();
}

function isPermutation(P: Mat, eps = LSQ_NEAR): boolean {
  const n = rows(P);
  if (n !== cols(P)) return false;
  for (let i = 0; i < n; i++) {
    let rowSum = 0;
    let colSum = 0;
    for (let j = 0; j < n; j++) {
      const rij = P[i]?.[j] ?? 0;
      const cij = P[j]?.[i] ?? 0;
      if (Math.abs(rij) > eps && Math.abs(rij - 1) > eps) return false;
      if (Math.abs(cij) > eps && Math.abs(cij - 1) > eps) return false;
      rowSum += rij;
      colSum += cij;
    }
    if (Math.abs(rowSum - 1) > eps || Math.abs(colSum - 1) > eps) return false;
  }
  return true;
}

function isIdentity(P: Mat, eps = LSQ_NEAR): boolean {
  const n = rows(P);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const want = i === j ? 1 : 0;
      if (Math.abs((P[i]?.[j] ?? 0) - want) > eps) return false;
    }
  }
  return true;
}

function unitDiagL(L: Mat, eps = LSQ_NEAR): boolean {
  const n = rows(L);
  for (let i = 0; i < n; i++) {
    if (Math.abs((L[i]?.[i] ?? 0) - 1) > eps) return false;
  }
  return true;
}

function isUpper(U: Mat, eps = LSQ_NEAR): boolean {
  const n = rows(U);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (Math.abs(U[i]?.[j] ?? 0) > eps) return false;
    }
  }
  return true;
}

function MatView({
  label,
  M,
  highlight,
  editable,
  onChange,
  structureHint,
  cellTitle,
}: {
  label: string;
  M: Mat;
  highlight?: {
    pivot?: { i: number; j: number };
    targetRow?: number;
    swapRows?: [number, number];
    Lfill?: { i: number; j: number };
    upperOnly?: boolean;
  };
  editable?: boolean;
  onChange?: (i: number, j: number, v: number) => void;
  structureHint?: string;
  cellTitle?: (i: number, j: number, v: number) => string | undefined;
}) {
  const m = rows(M);
  const n = cols(M);
  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs font-semibold text-[var(--fg-muted)]">{label}</span>
        {structureHint ? (
          <span className="rounded border border-[var(--border)] px-1.5 py-0.5 text-[10px] text-[var(--fg-muted)]">
            {structureHint}
          </span>
        ) : null}
      </div>
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
              const isPivot = highlight?.pivot?.i === i && highlight?.pivot?.j === j;
              const isTarget = highlight?.targetRow === i;
              const isSwap =
                highlight?.swapRows != null &&
                (highlight.swapRows[0] === i || highlight.swapRows[1] === i);
              const isLfill = highlight?.Lfill?.i === i && highlight?.Lfill?.j === j;
              const below = highlight?.upperOnly && i > j;
              let tone =
                'border-[var(--border)] bg-[var(--bg)] text-[var(--fg)]';
              if (below) tone = 'border-[var(--border)] bg-[var(--bg)] text-[var(--fg-muted)] opacity-30';
              if (isSwap) tone = 'border-amber-600/50 bg-amber-500/15 text-[var(--fg)]';
              if (isTarget) tone = 'border-teal-600/50 bg-teal-500/15 text-[var(--fg)]';
              if (isLfill) tone = 'border-orange-500/60 bg-orange-500/20 text-[var(--fg)]';
              if (isPivot)
                tone =
                  'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--fg)] ring-2 ring-[var(--accent-strong)]/30';
              const cls = `w-12 h-9 rounded border text-center font-mono text-sm tabular-nums ${tone}`;
              const title = cellTitle?.(i, j, v);
              if (editable && onChange) {
                return (
                  <input
                    key={`${i}-${j}`}
                    type="number"
                    step="any"
                    value={Number.isFinite(v) ? v : 0}
                    aria-label={`${label}_${i + 1}${j + 1}`}
                    title={title}
                    onChange={(e) => onChange(i, j, Number(e.target.value) || 0)}
                    className={`${cls} focus:outline-none focus:ring-2 focus:ring-[var(--accent-strong)]/40`}
                  />
                );
              }
              return (
                <div
                  key={`${i}-${j}`}
                  title={title}
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

function VecView({
  label,
  v,
  editable,
  onChange,
  highlight,
}: {
  label: string;
  v: Vec;
  editable?: boolean;
  onChange?: (i: number, val: number) => void;
  highlight?: boolean;
}) {
  return (
    <div className="inline-flex flex-col items-center gap-1">
      <span className="font-mono text-xs font-semibold text-[var(--fg-muted)]">{label}</span>
      <div className="relative px-2 py-1">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1.5 rounded-l-[4px] border-y-2 border-l-2 border-[var(--fg-muted)] opacity-55"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-1.5 rounded-r-[4px] border-y-2 border-r-2 border-[var(--fg-muted)] opacity-55"
        />
        <div className="grid grid-cols-1 gap-1.5">
          {v.map((val, i) => {
            const cls = `w-12 h-9 rounded border text-center font-mono text-sm tabular-nums ${
              highlight
                ? 'border-teal-600/50 bg-teal-500/15'
                : 'border-[var(--border)] bg-[var(--bg)]'
            }`;
            if (editable && onChange) {
              return (
                <input
                  key={i}
                  type="number"
                  step="any"
                  value={Number.isFinite(val) ? val : 0}
                  aria-label={`${label}_${i + 1}`}
                  onChange={(e) => onChange(i, Number(e.target.value) || 0)}
                  className={`${cls} focus:outline-none focus:ring-2 focus:ring-[var(--accent-strong)]/40`}
                />
              );
            }
            return (
              <div key={i} className={`flex items-center justify-center ${cls}`}>
                {formatNum(val)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Descomposición LU con pivoteo parcial: PA = LU (ALG-DEC-001).
 * U es el resultado de la eliminación; L almacena los multiplicadores.
 */
export function LUDecompositionViz() {
  const guideId = useId();
  const [A, setA] = useState<Mat>(() => cloneMat(DEFAULT_A));
  const [b, setB] = useState<Vec>(() => cloneVec(DEFAULT_B));
  const [mode, setMode] = useState<Mode>('elim');
  const [preset, setPreset] = useState<PresetId>('nopivot');
  const [stepIdx, setStepIdx] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const decomp = useMemo(() => {
    try {
      return luDecomposition(A);
    } catch {
      return null;
    }
  }, [A]);

  const steps = useMemo(() => decomp?.steps ?? [], [decomp]);
  const maxStep = Math.max(0, steps.length - 1);

  // Working state: apply steps[0..stepIdx] inclusive interpretation —
  // show state AFTER completing stepIdx (so 0 = after first pivot search highlight only).
  const working = useMemo(() => {
    if (!decomp) {
      return {
        U: cloneMat(A),
        Lpartial: identity(rows(A)),
        P: identity(rows(A)),
        highlight: {} as {
          pivot?: { i: number; j: number };
          targetRow?: number;
          swapRows?: [number, number];
          multiplier?: number;
          Lfill?: { i: number; j: number };
        },
      };
    }
    // Apply all steps with index < stepIdx, then use step at stepIdx for highlight
    // without necessarily applying its mutation yet for pivot (display only).
    const n = rows(A);
    const U = cloneMat(A);
    const L = identity(n);
    const P = identity(n);
    const highlight: {
      pivot?: { i: number; j: number };
      targetRow?: number;
      swapRows?: [number, number];
      multiplier?: number;
      Lfill?: { i: number; j: number };
    } = {};

    const applyThrough = Math.min(stepIdx, steps.length - 1);
    for (let s = 0; s <= applyThrough; s++) {
      const step = steps[s]!;
      const k = step.pivotCol;

      if (step.kind === 'pivot') {
        if (s === applyThrough) {
          highlight.pivot = { i: step.pivotRow, j: k };
        }
        continue;
      }

      if (step.kind === 'swap' && step.swapWith != null) {
        const piv = step.swapWith;
        for (let j = 0; j < n; j++) {
          const t = U[k]![j]!;
          U[k]![j] = U[piv]![j]!;
          U[piv]![j] = t;
          const tp = P[k]![j]!;
          P[k]![j] = P[piv]![j]!;
          P[piv]![j] = tp;
        }
        for (let j = 0; j < k; j++) {
          const t = L[k]![j]!;
          L[k]![j] = L[piv]![j]!;
          L[piv]![j] = t;
        }
        if (s === applyThrough) {
          highlight.swapRows = [k, piv];
          highlight.pivot = { i: k, j: k };
        }
        continue;
      }

      if (step.kind === 'eliminate' && step.targetRow != null && step.multiplier != null) {
        const i = step.targetRow;
        const mik = step.multiplier;
        // Show highlight before or after? Apply mutation, highlight result.
        L[i]![k] = mik;
        for (let j = k; j < n; j++) {
          U[i]![j]! -= mik * U[k]![j]!;
        }
        U[i]![k] = 0;
        if (s === applyThrough) {
          highlight.pivot = { i: k, j: k };
          highlight.targetRow = i;
          highlight.multiplier = mik;
          highlight.Lfill = { i, j: k };
        }
        continue;
      }

      // done — final state already applied
    }

    return { U, Lpartial: L, P, highlight };
  }, [A, decomp, stepIdx, steps]);

  const P = decomp?.P ?? identity(rows(A));
  const L = decomp?.L ?? identity(rows(A));
  const Ufinal = decomp?.U ?? cloneMat(A);
  const singular = decomp?.singular ?? false;
  const reconErr = decomp?.reconstructionError ?? NaN;
  const reconOk = Number.isFinite(reconErr) && reconErr <= Math.max(LSQ_NEAR, 1e-8 * (1 + matFrobenius(A)));
  const PAeqLU = reconOk;
  const Pidentity = isIdentity(P);
  const currentStep: LuStep | undefined = steps[Math.min(stepIdx, maxStep)];

  // Solve Ax=b via PA=LU without refactoring when only b changes
  const Pb = useMemo(() => matVec(P, b), [P, b]);
  const y = useMemo(() => {
    if (singular) return b.map(() => NaN);
    return forwardSubstitution(L, Pb);
  }, [L, Pb, singular, b]);
  const x = useMemo(() => {
    if (singular) return b.map(() => NaN);
    // Guard zero pivots on U
    const n = rows(Ufinal);
    for (let i = 0; i < n; i++) {
      if (Math.abs(Ufinal[i]?.[i] ?? 0) < LSQ_EPS) return b.map(() => NaN);
    }
    return backSubstitution(Ufinal, y);
  }, [Ufinal, y, singular, b]);
  const Ax = useMemo(() => matVec(A, x.map((v) => (Number.isFinite(v) ? v : 0))), [A, x]);
  const residual = useMemo(() => {
    if (x.some((v) => !Number.isFinite(v))) return NaN;
    return Math.hypot(...b.map((bi, i) => bi - (Ax[i] ?? 0)));
  }, [b, Ax, x]);

  const applyPreset = (id: Exclude<PresetId, null>) => {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setA(cloneMat(p.A));
    setB(cloneVec(p.b));
    setPreset(id);
    setStepIdx(0);
    setPlaying(false);
  };

  const setAij = (i: number, j: number, v: number) => {
    setA((prev) => {
      const next = cloneMat(prev);
      next[i]![j] = v;
      return next;
    });
    setPreset(null);
    setStepIdx(0);
    setPlaying(false);
  };

  const setBi = (i: number, v: number) => {
    setB((prev) => {
      const next = cloneVec(prev);
      next[i] = v;
      return next;
    });
  };

  useEffect(() => {
    // Clamp step when A changes
    setStepIdx((i) => Math.min(i, Math.max(0, (decomp?.steps.length ?? 1) - 1)));
  }, [decomp?.steps.length]);

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
      setStepIdx(maxStep);
      return;
    }
    playRef.current = setInterval(() => {
      setStepIdx((i) => {
        if (i >= maxStep) {
          setPlaying(false);
          return maxStep;
        }
        return i + 1;
      });
    }, 850);
    return () => {
      if (playRef.current) clearInterval(playRef.current);
    };
  }, [playing, maxStep]);

  const startPlay = () => {
    setMode('elim');
    setStepIdx(0);
    setPlaying(true);
  };

  const goPrevStep = () => {
    setMode('elim');
    setPlaying(false);
    setStepIdx((i) => Math.max(0, i - 1));
  };

  const goNextStep = () => {
    setMode('elim');
    setPlaying(false);
    setStepIdx((i) => {
      // En el último paso, reinicia (antes «Siguiente» no hacía nada).
      if (i >= maxStep) return 0;
      return i + 1;
    });
  };

  const atLastStep = stepIdx >= maxStep && steps.length > 0;
  const nextStep = atLastStep ? steps[0] : steps[Math.min(stepIdx + 1, maxStep)];
  const nextStepShort = nextStep
    ? nextStep.kind === 'pivot'
      ? 'Pivote'
      : nextStep.kind === 'swap'
        ? 'Intercambio'
        : nextStep.kind === 'eliminate'
          ? 'Eliminar'
          : 'Listo'
    : '—';

  const kindShort = (kind: LuStep['kind']) =>
    kind === 'pivot'
      ? 'Pivote'
      : kind === 'swap'
        ? 'Intercambio'
        : kind === 'eliminate'
          ? 'Eliminar'
          : 'Listo';

  const n = rows(A);
  const displayU = mode === 'elim' ? working.U : Ufinal;
  const displayL = mode === 'elim' ? working.Lpartial : L;
  const displayP = mode === 'elim' ? working.P : P;

  const stepLabel = currentStep?.message ?? '—';
  const mik = working.highlight.multiplier;

  const footer = [
    PAeqLU ? 'PA = LU ✓' : 'PA ≉ LU',
    `‖PA−LU‖_F = ${Number.isFinite(reconErr) ? formatNum(reconErr) : '—'}`,
    singular ? 'singular' : undefined,
  ]
    .filter(Boolean)
    .join(' · ');

  const caption = joinCaption(
    'PA = LU',
    Pidentity ? 'P = I' : 'con pivoteo',
    singular ? 'singular' : `${n}×${n}`,
  );

  return (
    <VizPanel title="Descomposición LU" caption={caption}>
      <div className="space-y-3" aria-describedby={guideId}>
        <div id={guideId}>
          <GuideBlock
            idea="U es el resultado de la eliminación gaussiana; L almacena los multiplicadores mᵢₖ bajo la diagonal (diag L = 1)."
            tryIt="En Eliminación: Paso k/N (pivote → eliminar → … → listo). Usa Siguiente o el reproductor. Cambia b en Resolver sin refactorizar."
            concept="PA = LU · P permuta filas · resolvemos Ly = Pb y luego Ux = y."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={MODE_OPTS}
            value={mode}
            onChange={(id) => {
              setMode(id as Mode);
              setPlaying(false);
            }}
          />
          {PAeqLU ? <Badge tone="ok">PA = LU</Badge> : <Badge tone="bad">PA ≉ LU</Badge>}
          {Pidentity ? <Badge tone="neutral">P = I</Badge> : <Badge tone="warn">pivoteo</Badge>}
          {singular ? <Badge tone="bad">SINGULAR</Badge> : <Badge tone="ok">regular</Badge>}
          {unitDiagL(L) ? <Badge tone="ok">diag L = 1</Badge> : null}
        </div>

        <ChipRow>
          {PRESETS.map((p) => (
            <Chip key={p.id} active={preset === p.id} onClick={() => applyPreset(p.id)}>
              {p.label}
            </Chip>
          ))}
        </ChipRow>

        {mode === 'elim' ? (
          <>
            <div className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-[var(--fg)]">
                  Paso {Math.min(stepIdx + 1, steps.length || 1)} de {steps.length || 1}:{' '}
                  <span className="text-[var(--accent-strong)]">
                    {currentStep ? kindShort(currentStep.kind) : '—'}
                  </span>
                </p>
                <Badge tone="neutral">pivote → eliminar → L/U</Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {steps.map((s, i) => (
                  <button
                    key={`${s.kind}-${i}`}
                    type="button"
                    onClick={() => {
                      setStepIdx(i);
                      setPlaying(false);
                    }}
                    className={`rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
                      i === stepIdx
                        ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--fg)]'
                        : 'border-[var(--border)] text-[var(--fg-muted)] hover:border-[var(--accent-strong)]/40'
                    }`}
                    title={s.message}
                  >
                    {i + 1}. {kindShort(s.kind)}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[var(--fg-muted)]">
                Pulsa un paso del recorrido, o usa Anterior / Siguiente. U es la matriz de trabajo; L guarda
                multiplicadores.
              </p>
            </div>

            <p
              className="rounded-md border border-[var(--accent-soft)] bg-[var(--accent-soft)]/40 px-3 py-2 text-sm leading-relaxed text-[var(--fg)]"
              aria-live="polite"
            >
              {stepLabel}
              {mik != null && currentStep?.kind === 'eliminate' ? (
                <span className="mt-1 block font-mono text-xs text-[var(--fg-muted)]">
                  m = {formatNum(mik)} · R{(currentStep.targetRow ?? 0) + 1} ← R
                  {(currentStep.targetRow ?? 0) + 1} − m R{(currentStep.pivotRow ?? 0) + 1}
                </span>
              ) : null}
            </p>

            <div className="flex flex-wrap items-start justify-center gap-4 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-4">
              <MatView
                label="U (trabajo)"
                M={displayU}
                highlight={{
                  pivot: working.highlight.pivot,
                  targetRow: working.highlight.targetRow,
                  swapRows: working.highlight.swapRows,
                  upperOnly: currentStep?.kind === 'done',
                }}
                cellTitle={(i, j, v) =>
                  working.highlight.pivot?.i === i && working.highlight.pivot?.j === j
                    ? `Pivote u${i + 1}${j + 1} = ${formatNum(v)}`
                    : undefined
                }
              />
              <MatView
                label="L (parcial)"
                M={displayL}
                highlight={{ Lfill: working.highlight.Lfill }}
                structureHint="diag=1"
                cellTitle={(i, j, v) =>
                  i > j ? `m${i + 1}${j + 1} = ${formatNum(v)}` : i === j ? '1' : '0'
                }
              />
              <MatView
                label="P"
                M={displayP}
                structureHint={isIdentity(displayP) ? 'I' : 'permutación'}
              />
            </div>
          </>
        ) : null}

        {mode === 'factors' ? (
          <div className="flex flex-wrap items-start justify-center gap-4 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-4">
            <MatView label="P" M={P} structureHint={Pidentity ? 'I (sin swaps)' : 'permutación'} />
            <span className="self-center font-mono text-lg text-[var(--fg-muted)]">A</span>
            <span className="self-center font-mono text-[var(--fg-muted)]">=</span>
            <MatView label="L" M={L} structureHint="diag L = 1 · inferior" />
            <MatView
              label="U"
              M={Ufinal}
              structureHint="triangular superior"
              highlight={{ upperOnly: true }}
            />
            <div className="w-full flex flex-wrap justify-center gap-2 pt-2">
              {isPermutation(P) ? <Badge tone="ok">P permutación</Badge> : null}
              {unitDiagL(L) ? <Badge tone="ok">diag(L)=1</Badge> : <Badge tone="bad">diag L</Badge>}
              {isUpper(Ufinal) ? <Badge tone="ok">U superior</Badge> : <Badge tone="warn">U</Badge>}
              <Badge tone={reconOk ? 'ok' : 'bad'}>
                ‖PA−LU‖_F = {formatNum(reconErr)}
              </Badge>
            </div>
            <div className="w-full overflow-x-auto">
              <p className="text-center font-mono text-xs text-[var(--fg-muted)]">
                PA ={' '}
                {formatNum(matFrobenius(matSub(matMul(P, A), matMul(L, Ufinal)))) === '0'
                  ? 'LU ✓'
                  : `LU · error ${formatNum(reconErr)}`}
              </p>
            </div>
          </div>
        ) : null}

        {mode === 'solve' ? (
          <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-4">
            {singular ? (
              <Badge tone="bad">Matriz singular — no se divide por pivotes ≈ 0</Badge>
            ) : (
              <Badge tone="ok">Ly = Pb → Ux = y</Badge>
            )}
            <div className="flex flex-wrap items-start justify-center gap-3">
              <MatView label="L" M={L} structureHint="forward" />
              <VecView label="y" v={y.map((v) => (Number.isFinite(v) ? v : 0))} highlight />
              <span className="self-center text-[var(--fg-muted)]">←</span>
              <VecView label="Pb" v={Pb} />
            </div>
            <div className="flex flex-wrap items-start justify-center gap-3">
              <MatView label="U" M={Ufinal} structureHint="back" highlight={{ upperOnly: true }} />
              <VecView
                label="x"
                v={x.map((v) => (Number.isFinite(v) ? v : 0))}
                highlight
              />
              <span className="self-center text-[var(--fg-muted)]">←</span>
              <VecView label="y" v={y.map((v) => (Number.isFinite(v) ? v : 0))} />
            </div>
            <div className="flex flex-wrap items-start justify-center gap-3 border-t border-[var(--border)] pt-3">
              <MatView label="A" M={A} />
              <VecView label="b" v={b} editable onChange={setBi} />
              <span className="self-center font-mono text-[var(--fg-muted)]">→</span>
              <VecView
                label="x"
                v={x.map((v) => (Number.isFinite(v) ? v : 0))}
              />
            </div>
            <p className="text-center font-mono text-xs text-[var(--fg-muted)]">
              ‖Ax − b‖ ≈ {Number.isFinite(residual) ? formatNum(residual) : '—'}
              {!singular && Number.isFinite(residual) && residual < LSQ_NEAR * 10
                ? ' · solución OK'
                : ''}
              {' · '}
              Cambia b sin refactorizar A (L, U, P fijos).
            </p>
            {x.some((v) => !Number.isFinite(v)) ? (
              <p className="text-center text-sm text-rose-700 dark:text-rose-300">
                Sustitución bloqueada: pivote nulo (sin división por cero).
              </p>
            ) : null}
          </div>
        ) : null}

        <ControlsStack>
          <ButtonRow>
            <VizButton active={playing} onClick={startPlay} disabled={playing}>
              {playing ? 'Reproduciendo…' : '▶ Reproducir eliminación'}
            </VizButton>
            {mode === 'elim' ? (
              <>
                <VizButton onClick={goPrevStep} disabled={stepIdx === 0 || playing}>
                  Anterior
                </VizButton>
                <VizButton onClick={goNextStep} disabled={playing}>
                  {atLastStep ? 'Reiniciar (paso 1)' : `Siguiente: ${nextStepShort}`}
                </VizButton>
              </>
            ) : (
              <VizButton
                onClick={() => {
                  setMode('elim');
                  setStepIdx(0);
                  setPlaying(false);
                }}
              >
                Ir a Eliminación
              </VizButton>
            )}
          </ButtonRow>
          {mode === 'elim' && !playing ? (
            <p className="text-xs text-[var(--fg-muted)]">
              {atLastStep
                ? 'Ya estás en el último paso (Listo). «Reiniciar» vuelve al pivote inicial.'
                : `«Siguiente» avanza al paso «${nextStepShort}» y actualiza U, L y P.`}
            </p>
          ) : null}

          <CollapsibleEdit
            label={`Editar A (${n}×${n})`}
            open={editOpen}
            onToggle={() => setEditOpen((o) => !o)}
          >
            <div className="space-y-3">
              <MatView label="A" M={A} editable onChange={setAij} />
              <VecView label="b" v={b} editable onChange={setBi} />
              <p className="text-xs text-[var(--fg-muted)]">
                Usa los presets para 2×2 / 3×3. En singular no se divide por pivotes ≈ 0.
              </p>
            </div>
          </CollapsibleEdit>
        </ControlsStack>

        <p className="border-t border-[var(--border)] pt-2 text-sm font-mono text-[var(--fg-muted)]">
          {footer}
        </p>
      </div>
    </VizPanel>
  );
}
