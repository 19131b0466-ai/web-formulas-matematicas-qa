'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, VizButton, VizPanel } from './controls';
import {
  LIN_EPS,
  PRESET_DEP,
  PRESET_FULL,
  PRESET_ZERO,
  cloneMat,
  formatVec,
  getCol,
  nullspaceBasis,
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
type Step = 'all' | 'dominio' | 'rango' | 'nucleo' | 'teorema';
type PresetId = 'full' | 'dep' | 'zero' | null;

const H = 260;
const OX = VEC_W / 2;
const OY = H / 2;
const COL_COLORS = [COLOR_U, COLOR_V, 'orange'] as const;

/**
 * Teorema rango-nulidad: rank + nullity = n (reparto de dimensiones del dominio).
 */
export function RankNullityViz() {
  const uid = useId().replace(/:/g, '');
  const [A, setA] = useState<Matrix>(() => cloneMat(PRESET_FULL));
  const [tab, setTab] = useState<Tab>('conceptual');
  const [preset, setPreset] = useState<PresetId>('full');
  const [step, setStep] = useState<Step>('all');

  const n = A[0]?.length ?? 0;
  const m = A.length;

  const info = useMemo(() => {
    const { pivots, free, rank: r } = rref(A);
    const nul = n - r;
    const ker = nullspaceBasis(A);
    const cols = Array.from({ length: n }, (_, j) => getCol(A, j));
    return { pivots, free, rank: r, nullity: nul, ker, cols };
  }, [A, n]);

  const maxAbs = Math.max(
    1.4,
    ...info.cols.flatMap((v) => [Math.abs(v[0] ?? 0), Math.abs(v[1] ?? 0)]),
  );
  const S = autoScale(maxAbs, Math.min(VEC_W, H), 40, 28, 58);
  const to = (x: number, y: number) => ({ x: OX + x * S, y: OY - y * S });

  const load = (mat: Matrix, id: PresetId) => {
    setA(cloneMat(mat));
    setPreset(id);
  };

  const onChange = (mat: Matrix) => {
    setA(mat);
    setPreset(null);
  };

  const showRango = step === 'all' || step === 'rango' || step === 'teorema';
  const showNucleo = step === 'all' || step === 'nucleo' || step === 'teorema';
  const showBar = step === 'all' || step === 'dominio' || step === 'teorema';
  const showCols = step === 'all' || step === 'rango' || step === 'dominio';

  const rankPct = n > 0 ? (info.rank / n) * 100 : 0;
  const nulPct = n > 0 ? (info.nullity / n) * 100 : 0;

  return (
    <VizPanel
      title="Teorema rango-nulidad"
      caption={`A: ℝ${n === 3 ? '³' : n === 2 ? '²' : `ⁿ`} → ℝ${m === 2 ? '²' : m === 1 ? '' : `ᵐ`} · rank + nullity = ${info.rank} + ${info.nullity} = ${n}`}
    >
      <div className="space-y-3">
        <p className="text-sm text-[var(--fg)]">
          <span className="font-medium">Idea — </span>
          Las n dimensiones del dominio se parten en las que sobreviven en la imagen (rango) y
          las que colapsan al cero (nulidad).
        </p>
        <p className="text-sm text-[var(--fg-muted)]">
          <span className="font-medium text-[var(--fg)]">Pruébalo — </span>
          Cambia el preset o edita A: la barra rank | nullity siempre suma n.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-sm font-semibold text-[var(--fg)]">
            A: ℝ{n === 3 ? '³' : n === 2 ? '²' : `ⁿ`} → ℝ{m === 2 ? '²' : `ᵐ`}
          </p>
          <ButtonRow>
            <VizButton active={tab === 'conceptual'} onClick={() => setTab('conceptual')}>
              Conceptual
            </VizButton>
            <VizButton active={tab === 'matriz'} onClick={() => setTab('matriz')}>
              Matriz
            </VizButton>
          </ButtonRow>
        </div>

        <ButtonRow>
          <VizButton active={preset === 'full'} onClick={() => load(PRESET_FULL, 'full')}>
            Rango completo
          </VizButton>
          <VizButton active={preset === 'dep'} onClick={() => load(PRESET_DEP, 'dep')}>
            Dependencia
          </VizButton>
          <VizButton active={preset === 'zero'} onClick={() => load(PRESET_ZERO, 'zero')}>
            Matriz cero
          </VizButton>
        </ButtonRow>

        <ButtonRow>
          {(
            [
              ['dominio', 'Dominio'],
              ['rango', 'Rango'],
              ['nucleo', 'Núcleo'],
              ['teorema', 'Teorema'],
              ['all', 'Ver todo'],
            ] as const
          ).map(([id, label]) => (
            <VizButton key={id} active={step === id} onClick={() => setStep(id)}>
              {label}
            </VizButton>
          ))}
        </ButtonRow>

        {showBar ? (
          <div className="space-y-1">
            <div className="flex h-9 overflow-hidden rounded-lg border border-[var(--border)]">
              {info.rank > 0 ? (
                <div
                  className="flex items-center justify-center bg-[var(--accent-soft)] px-2 font-mono text-xs font-semibold text-[var(--accent-strong)]"
                  style={{ width: `${rankPct}%` }}
                >
                  rango {info.rank}
                </div>
              ) : null}
              {info.nullity > 0 ? (
                <div
                  className="flex items-center justify-center bg-orange-500/20 px-2 font-mono text-xs font-semibold text-orange-800 dark:text-orange-200"
                  style={{ width: `${nulPct}%` }}
                >
                  nulidad {info.nullity}
                </div>
              ) : null}
              {info.rank === 0 && info.nullity === 0 ? (
                <div className="flex flex-1 items-center justify-center text-xs text-[var(--fg-muted)]">
                  n = 0
                </div>
              ) : null}
            </div>
            <p className="font-mono text-center text-sm text-[var(--fg)]">
              rank + nullity = n →{' '}
              <span className="text-[var(--accent-strong)]">{info.rank}</span> +{' '}
              <span className="text-orange-700 dark:text-orange-300">{info.nullity}</span> ={' '}
              {n}{' '}
              <span className="text-[var(--accent-strong)]">✓</span>
            </p>
          </div>
        ) : null}

        {tab === 'conceptual' ? (
          <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
            {showCols ? (
              <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                <svg
                  viewBox={`0 0 ${VEC_W} ${H}`}
                  className="h-auto w-full"
                  role="img"
                  aria-label="Columnas de A en ℝ² (imagen)"
                >
                  <defs>
                    {COL_COLORS.map((c, i) => (
                      <ArrowMarker key={i} id={`${uid}-c${i}`} color={c} />
                    ))}
                  </defs>
                  <Axes W={VEC_W} H={H} ox={OX} oy={OY} S={S} xLabel="e₁" yLabel="e₂" />
                  {showRango && info.rank === 2 ? (
                    <rect
                      x={24}
                      y={20}
                      width={VEC_W - 48}
                      height={H - 40}
                      fill="var(--accent-soft)"
                      opacity={0.35}
                      rx={8}
                    />
                  ) : null}
                  {showRango && info.rank === 1
                    ? (() => {
                        const d = info.cols.find((v) => (v[0] ?? 0) ** 2 + (v[1] ?? 0) ** 2 > LIN_EPS) ?? [
                          1, 0,
                        ];
                        const len = Math.hypot(d[0] ?? 0, d[1] ?? 0) || 1;
                        const ux = ((d[0] ?? 0) / len) * 4;
                        const uy = ((d[1] ?? 0) / len) * 4;
                        const a = to(-ux, -uy);
                        const b = to(ux, uy);
                        return (
                          <line
                            x1={a.x}
                            y1={a.y}
                            x2={b.x}
                            y2={b.y}
                            stroke="var(--accent-strong)"
                            strokeWidth={8}
                            opacity={0.2}
                            strokeLinecap="round"
                          />
                        );
                      })()
                    : null}
                  {info.cols.map((v, j) => {
                    const tip = to(v[0] ?? 0, v[1] ?? 0);
                    const isPivot = info.pivots.includes(j);
                    const color = COL_COLORS[Math.min(j, COL_COLORS.length - 1)]!;
                    const zero = (v[0] ?? 0) ** 2 + (v[1] ?? 0) ** 2 < LIN_EPS;
                    if (!showRango && !isPivot) return null;
                    return (
                      <g key={j}>
                        {!zero ? (
                          <line
                            x1={OX}
                            y1={OY}
                            x2={tip.x}
                            y2={tip.y}
                            stroke={color}
                            strokeWidth={2.3}
                            strokeDasharray={isPivot ? undefined : '4 3'}
                            markerEnd={`url(#${uid}-c${j})`}
                          />
                        ) : null}
                        <text x={tip.x + 6} y={tip.y - 6} fontSize={11} fill={color} fontWeight={600}>
                          c{j + 1}
                        </text>
                        <text
                          x={tip.x + 6}
                          y={tip.y + 8}
                          fontSize={9}
                          fill={isPivot ? 'var(--accent-strong)' : 'orange'}
                        >
                          {isPivot ? 'Pivote' : 'Libre'}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            ) : (
              <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--fg-muted)]">
                Enfoque en el núcleo
              </div>
            )}

            {showNucleo ? (
              <div className="flex flex-col justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                  Núcleo · Ker(A)
                </p>
                {info.nullity === 0 ? (
                  <p className="font-mono text-sm text-[var(--fg)]">Ker = {'{0}'}</p>
                ) : (
                  info.ker.map((v, i) => (
                    <div
                      key={i}
                      className="flex flex-wrap items-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500/10 px-2.5 py-2 font-mono text-xs"
                    >
                      <span className="text-orange-800 dark:text-orange-200">
                        v = {formatVec(v)}
                      </span>
                      <span className="text-[var(--fg-muted)]">→</span>
                      <span className="font-semibold text-[var(--accent-strong)]">A</span>
                      <span className="text-[var(--fg-muted)]">→</span>
                      <span className="text-[var(--fg)]">0</span>
                    </div>
                  ))
                )}
                <p className="text-[11px] text-[var(--fg-muted)]">
                  #pivotes + #libres = {info.pivots.length} + {info.free.length} = {n}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-3 text-sm text-[var(--fg-muted)]">
                Enfoque en la imagen
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-start gap-4">
            <MatrixBrackets label="A" dimLabel={`${m}×${n}`}>
              <MatrixGrid
                matrix={A}
                editable
                onChange={onChange}
                name="A"
                highlightCells={info.pivots.flatMap((j) =>
                  A.map((_, i) => [i, j] as [number, number]),
                )}
              />
            </MatrixBrackets>
            <div className="min-w-[12rem] flex-1 space-y-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 font-mono text-xs leading-relaxed">
              <p>
                Pivotes:{' '}
                <span className="text-[var(--accent-strong)]">
                  {info.pivots.length ? info.pivots.map((j) => `col ${j + 1}`).join(', ') : '—'}
                </span>
              </p>
              <p>
                Libres:{' '}
                <span className="text-orange-700 dark:text-orange-300">
                  {info.free.length ? info.free.map((j) => `col ${j + 1}`).join(', ') : '—'}
                </span>
              </p>
              <p>
                rank = {info.rank}, nullity = {info.nullity}, n = {n}
              </p>
              <p className="border-t border-[var(--border)] pt-2">
                {info.rank} + {info.nullity} = {n} ✓
              </p>
            </div>
          </div>
        )}

        {tab === 'conceptual' ? (
          <div className="flex flex-wrap items-start gap-3">
            <MatrixBrackets label="A" dimLabel={`${m}×${n}`}>
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
            <div className="flex flex-wrap gap-1.5 pt-1">
              {Array.from({ length: n }, (_, j) => {
                const isPivot = info.pivots.includes(j);
                return (
                  <span
                    key={j}
                    className={`rounded px-2 py-0.5 font-mono text-[10px] font-semibold ${
                      isPivot
                        ? 'bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                        : 'bg-orange-500/15 text-orange-700 dark:text-orange-300'
                    }`}
                  >
                    col {j + 1}: {isPivot ? 'Pivote' : 'Libre'}
                  </span>
                );
              })}
            </div>
          </div>
        ) : null}

        {m === 2 && n === 3 && info.rank === 2 ? (
          <p className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-xs text-[var(--fg-muted)]">
            Nota: ℝ³ → ℝ² debe perder al menos 1 dirección (nulidad ≥ 1). Aquí rank = 2 y
            nullity = 1.
          </p>
        ) : null}
      </div>
    </VizPanel>
  );
}
