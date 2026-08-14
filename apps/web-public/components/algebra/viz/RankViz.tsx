'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, VizButton, VizPanel } from './controls';
import {
  LIN_EPS,
  PRESET_DEP,
  PRESET_FULL,
  PRESET_ZERO,
  cloneMat,
  columnSpaceBasis,
  formatVec,
  getCol,
  isNearZero,
  presentLin,
  rref,
  type Matrix,
} from './linAlg';
import { MatrixBrackets, MatrixGrid } from './matrixGrid';
import {
  ArrowMarker,
  Axes,
  COLOR_U,
  COLOR_V,
  VEC_W,
  autoScale,
} from './vectorPlane';

type Tab = 'conceptual' | 'matriz';

const H = 300;
const OX = VEC_W / 2;
const OY = H / 2;

const COL_COLORS = [COLOR_U, COLOR_V, 'orange'] as const;
const COL_LABELS = ['c₁', 'c₂', 'c₃'] as const;

function nearEq(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((x, i) => Math.abs(x - (b[i] ?? 0)) < 0.08);
}

function dimWord(r: number): string {
  if (r <= 0) return 'punto';
  if (r === 1) return 'recta';
  return 'plano (ℝ²)';
}

/**
 * Rango = dim(Col(A)) = # pivotes. Enfoque geométrico en el espacio columna (no det).
 */
export function RankViz() {
  const uid = useId().replace(/:/g, '');
  const [A, setA] = useState<Matrix>(() => cloneMat(PRESET_FULL));
  const [tab, setTab] = useState<Tab>('conceptual');
  const [preset, setPreset] = useState<'full' | 'dep' | 'zero' | null>('full');

  const { cols } = useMemo(() => {
    const c = A[0]?.length ?? 0;
    return { cols: c };
  }, [A]);

  const info = useMemo(() => {
    const { pivots, free, rank: r } = rref(A);
    const basis = columnSpaceBasis(A);
    const vectors = Array.from({ length: cols }, (_, j) => getCol(A, j));
    return { pivots, free, rank: r, basis, vectors };
  }, [A, cols]);

  const c1 = info.vectors[0] ?? [0, 0];
  const c2 = info.vectors[1] ?? [0, 0];
  const c3 = info.vectors[2] ?? [0, 0];
  const isFullDepNote =
    cols >= 3 &&
    nearEq(c3, [c1[0]! + c2[0]!, c1[1]! + c2[1]!]) &&
    info.rank === 2 &&
    info.free.includes(2);

  const maxAbs = Math.max(
    1.4,
    ...info.vectors.flatMap((v) => [Math.abs(v[0] ?? 0), Math.abs(v[1] ?? 0)]),
    ...info.basis.flatMap((v) => [Math.abs(v[0] ?? 0), Math.abs(v[1] ?? 0)]),
  );
  const S = autoScale(maxAbs, Math.min(VEC_W, H), 44, 30, 64);
  const to = (x: number, y: number) => ({ x: OX + x * S, y: OY - y * S });

  const load = (m: Matrix, id: typeof preset) => {
    setA(cloneMat(m));
    setPreset(id);
  };

  const onChange = (m: Matrix) => {
    setA(m);
    setPreset(null);
  };

  const spanFill = (() => {
    if (info.rank <= 0) {
      return <circle cx={OX} cy={OY} r={7} fill="var(--accent-strong)" opacity={0.85} />;
    }
    if (info.rank === 1) {
      const dir = info.basis[0] ?? info.vectors.find((v) => !v.every((x) => isNearZero(x))) ?? [1, 0];
      const dx = dir[0] ?? 1;
      const dy = dir[1] ?? 0;
      const len = Math.hypot(dx, dy) || 1;
      const ux = (dx / len) * 4.5;
      const uy = (dy / len) * 4.5;
      const a = to(-ux, -uy);
      const b = to(ux, uy);
      return (
        <line
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke="var(--accent-strong)"
          strokeWidth={10}
          strokeLinecap="round"
          opacity={0.22}
        />
      );
    }
    // rank 2: soft parallelogram from Col basis (or first two independent cols)
    const u = info.basis[0] ?? c1;
    const v = info.basis[1] ?? c2;
    const scale = 1.35;
    const o = to(0, 0);
    const U = to((u[0] ?? 0) * scale, (u[1] ?? 0) * scale);
    const V = to((v[0] ?? 0) * scale, (v[1] ?? 0) * scale);
    const UV = to(((u[0] ?? 0) + (v[0] ?? 0)) * scale, ((u[1] ?? 0) + (v[1] ?? 0)) * scale);
    return (
      <polygon
        points={`${o.x},${o.y} ${U.x},${U.y} ${UV.x},${UV.y} ${V.x},${V.y}`}
        fill="var(--accent-soft)"
        stroke="var(--accent-strong)"
        strokeWidth={1}
        opacity={0.75}
      />
    );
  })();

  return (
    <VizPanel
      title="Rango"
      caption={`${cols} columnas → ${info.pivots.length} pivote${info.pivots.length === 1 ? '' : 's'} → dim Col(A) = ${info.rank} → rank(A) = ${info.rank}`}
    >
      <div className="space-y-3">
        <p className="text-sm text-[var(--fg)]">
          <span className="font-medium">Idea — </span>
          El rango mide cuántas direcciones independientes producen las columnas: rank(A) =
          dim(Col(A)) = número de pivotes.
        </p>
        <p className="text-sm text-[var(--fg-muted)]">
          <span className="font-medium text-[var(--fg)]">Pruébalo — </span>
          Edita las columnas y observa si Col(A) es un punto, una recta o un plano en ℝ².
        </p>

        <ButtonRow>
          <VizButton active={tab === 'conceptual'} onClick={() => setTab('conceptual')}>
            Conceptual
          </VizButton>
          <VizButton active={tab === 'matriz'} onClick={() => setTab('matriz')}>
            Matriz
          </VizButton>
        </ButtonRow>

        <ButtonRow>
          <VizButton active={preset === 'full'} onClick={() => load(PRESET_FULL, 'full')}>
            Rango 2
          </VizButton>
          <VizButton active={preset === 'dep'} onClick={() => load(PRESET_DEP, 'dep')}>
            Rango 1
          </VizButton>
          <VizButton active={preset === 'zero'} onClick={() => load(PRESET_ZERO, 'zero')}>
            Rango 0
          </VizButton>
        </ButtonRow>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
            Dimensión Col(A)
          </span>
          {[0, 1, 2].map((d) => (
            <span
              key={d}
              className={`rounded-md border px-2.5 py-1 font-mono text-xs font-semibold ${
                info.rank === d
                  ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'border-[var(--border)] bg-[var(--bg)] text-[var(--fg-muted)]'
              }`}
            >
              {d}
            </span>
          ))}
          <span className="font-mono text-xs text-[var(--fg-muted)]">→ {dimWord(info.rank)}</span>
        </div>

        {tab === 'conceptual' ? (
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg)]">
            <svg
              viewBox={`0 0 ${VEC_W} ${H}`}
              className="h-auto w-full"
              role="img"
              aria-label={`Columnas en ℝ²; Col(A) es ${dimWord(info.rank)}`}
            >
              <defs>
                {COL_COLORS.map((c, i) => (
                  <ArrowMarker key={i} id={`${uid}-c${i}`} color={c} />
                ))}
              </defs>
              <Axes W={VEC_W} H={H} ox={OX} oy={OY} S={S} xLabel="e₁" yLabel="e₂" />
              {spanFill}
              {info.vectors.map((v, j) => {
                const tip = to(v[0] ?? 0, v[1] ?? 0);
                const isPivot = info.pivots.includes(j);
                const color = COL_COLORS[j] ?? COLOR_U;
                const zero = (v[0] ?? 0) ** 2 + (v[1] ?? 0) ** 2 < LIN_EPS;
                return (
                  <g key={j}>
                    {!zero ? (
                      <line
                        x1={OX}
                        y1={OY}
                        x2={tip.x}
                        y2={tip.y}
                        stroke={color}
                        strokeWidth={isPivot ? 2.6 : 2}
                        strokeDasharray={isPivot ? undefined : '5 3'}
                        markerEnd={`url(#${uid}-c${j})`}
                        opacity={isPivot ? 1 : 0.85}
                      />
                    ) : (
                      <circle cx={OX} cy={OY} r={5} fill={color} opacity={0.7} />
                    )}
                    <text
                      x={tip.x + 8}
                      y={tip.y - 8}
                      fontSize={11}
                      fontWeight={600}
                      fill={color}
                    >
                      {COL_LABELS[j]}
                    </text>
                    <text
                      x={tip.x + 8}
                      y={tip.y + 6}
                      fontSize={9}
                      fill={isPivot ? 'var(--accent-strong)' : 'orange'}
                    >
                      {isPivot ? 'Pivote' : 'Dependiente'}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        ) : (
          <div className="flex flex-wrap items-start gap-4">
            <MatrixBrackets label="A" dimLabel={`${A.length}×${cols}`}>
              <MatrixGrid
                matrix={A}
                editable
                onChange={onChange}
                name="A"
                highlightCol={info.pivots[0] ?? null}
                highlightCells={info.pivots.flatMap((j) =>
                  A.map((_, i) => [i, j] as [number, number]),
                )}
              />
            </MatrixBrackets>
            <div className="min-w-[12rem] flex-1 space-y-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm">
              <p className="font-mono text-xs text-[var(--fg-muted)]">Columnas</p>
              {info.vectors.map((v, j) => {
                const isPivot = info.pivots.includes(j);
                return (
                  <div key={j} className="flex flex-wrap items-center gap-2 font-mono text-xs">
                    <span style={{ color: COL_COLORS[j] }}>{COL_LABELS[j]}</span>
                    <span>= {formatVec(v)}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        isPivot
                          ? 'bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                          : 'bg-orange-500/15 text-orange-700 dark:text-orange-300'
                      }`}
                    >
                      {isPivot ? 'Pivote' : 'Dependiente'}
                    </span>
                  </div>
                );
              })}
              <div className="border-t border-[var(--border)] pt-2 font-mono text-xs leading-relaxed">
                Pivotes (cols):{' '}
                {info.pivots.length
                  ? info.pivots.map((j) => j + 1).join(', ')
                  : 'ninguno'}
                <br />
                Base Col(A) (columnas originales):{' '}
                {info.basis.length
                  ? info.basis.map((b) => formatVec(b)).join(', ')
                  : '{ }'}
                <br />
                rank(A) = dim(Col(A)) ={' '}
                <span className="font-semibold text-[var(--accent-strong)]">{info.rank}</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'conceptual' ? (
          <ControlsStack>
            <div className="flex flex-wrap items-start gap-3">
              <MatrixBrackets label="A" dimLabel={`${A.length}×${cols}`}>
                <MatrixGrid
                  matrix={A}
                  editable
                  onChange={onChange}
                  name="A"
                  cellSize="sm"
                  highlightCells={info.pivots.flatMap((j) =>
                    A.map((_, i) => [i, j] as [number, number]),
                  )}
                />
              </MatrixBrackets>
              <div className="flex-1 space-y-1 font-mono text-xs text-[var(--fg-muted)]">
                <p>
                  Base Col(A):{' '}
                  <span className="text-[var(--fg)]">
                    {info.basis.length
                      ? info.basis.map((b) => formatVec(b)).join(', ')
                      : '{0}'}
                  </span>
                </p>
                <p>
                  Cadena: {cols} columnas → {info.pivots.length} pivote
                  {info.pivots.length === 1 ? '' : 's'} → dim Col = {info.rank} → rank ={' '}
                  {info.rank}
                </p>
              </div>
            </div>
          </ControlsStack>
        ) : null}

        {isFullDepNote ? (
          <p className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-xs text-orange-800 dark:text-orange-200">
            Nota: c₃ = c₁ + c₂ = ({presentLin(c1[0]! + c2[0]!)}, {presentLin(c1[1]! + c2[1]!)}),
            así que la tercera columna es dependiente y no aporta una dirección nueva.
          </p>
        ) : null}

        <p className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 font-mono text-xs text-[var(--fg)]">
          rank(A) = dim(Col(A)) = # pivotes = {info.rank}
          <span className="text-[var(--fg-muted)]"> · no usa det</span>
        </p>
      </div>
    </VizPanel>
  );
}
