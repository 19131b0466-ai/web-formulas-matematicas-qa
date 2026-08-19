'use client';

import { useMemo, useState } from 'react';
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
import { matScale, svd, type Mat } from './decompMath';
import type { Mat2 } from './math2d';
import {
  frobeniusNorm,
  frobeniusNormSquared,
  formatNum,
  squaredMagnitudes,
  vectorTwoNorm,
  vectorizeColumnMajor,
} from './normMath';
import {
  Badge,
  Chip,
  ChipRow,
  CollapsibleEdit,
  GuideBlock,
  Mat2Editor,
  Segmented,
  cloneMat2,
} from './transformHelpers';

type Mode = 'entries' | 'vector' | 'svd';
type PresetId = 'general' | 'negativos' | 'dominante' | 'id' | 'diag' | 'cero' | null;
type Cell = [number, number];

const DEFAULT_A: Mat2 = [
  [2, -1],
  [1, 3],
];

const MODE_OPTS = [
  { id: 'entries', label: 'Por entradas' },
  { id: 'vector', label: 'Como vector' },
  { id: 'svd', label: 'Valores singulares' },
];

const PRESETS: Array<{ id: Exclude<PresetId, null>; label: string; A: Mat2 }> = [
  { id: 'general', label: 'General', A: DEFAULT_A },
  { id: 'negativos', label: 'Negativos', A: [[-2, -1], [-3, -2]] },
  { id: 'dominante', label: 'Una entrada dominante', A: [[5, 0.2], [0.1, 0.1]] },
  { id: 'id', label: 'Identidad', A: [[1, 0], [0, 1]] },
  { id: 'diag', label: 'Diagonal', A: [[3, 0], [0, 2]] },
  { id: 'cero', label: 'Cero', A: [[0, 0], [0, 0]] },
];

const STEP_HINTS = [
  'Paso 1: observa las entradas a_ij de A. Cada número contribuye al tamaño global.',
  'Paso 2: cada entrada aporta |a_ij|² — el signo desaparece al elevar al cuadrado.',
  'Paso 3: suma todos los cuadrados y aplica la raíz cuadrada para obtener ‖A‖_F.',
];

const CELL_LABELS: Cell[] = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
];

function cellName(i: number, j: number): string {
  return `a${i + 1}${j + 1}`;
}

function asMat(m: Mat2): Mat {
  return m;
}

function heatAlpha(value: number, max: number): number {
  if (max <= 0 || value <= 0) return 0.08;
  return 0.12 + 0.78 * (value / max);
}

function SqHeatCell({
  i,
  j,
  value,
  maxSq,
  selected,
  onSelect,
  showValue,
  ariaLabel,
}: {
  i: number;
  j: number;
  value: number;
  maxSq: number;
  selected: boolean;
  onSelect: () => void;
  showValue: boolean;
  ariaLabel: string;
}) {
  const alpha = heatAlpha(value, maxSq);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={ariaLabel}
      aria-pressed={selected}
      className={`relative flex h-14 w-14 items-center justify-center rounded border font-mono text-sm tabular-nums transition-colors ${
        selected
          ? 'border-[var(--accent-strong)] ring-2 ring-[var(--accent-strong)]/35'
          : 'border-[var(--border)]'
      }`}
      style={{
        backgroundColor: `color-mix(in oklab, var(--accent-strong) ${Math.round(alpha * 100)}%, var(--bg))`,
      }}
    >
      {showValue ? formatNum(value) : cellName(i, j)}
    </button>
  );
}

function ContributionBars({
  squares,
  maxSq,
  selected,
  onSelect,
}: {
  squares: Mat;
  maxSq: number;
  selected: Cell | null;
  onSelect: (cell: Cell) => void;
}) {
  return (
    <div
      className="flex items-end justify-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-3"
      role="img"
      aria-label="Contribución de cada entrada al cuadrado de la norma"
    >
      {CELL_LABELS.map(([i, j]) => {
        const v = squares[i]?.[j] ?? 0;
        const h = maxSq > 0 ? Math.max(4, (v / maxSq) * 72) : 4;
        const hi = selected?.[0] === i && selected?.[1] === j;
        return (
          <button
            key={`${i}-${j}`}
            type="button"
            onClick={() => onSelect([i, j])}
            aria-label={`${cellName(i, j)}² = ${formatNum(v)}`}
            aria-pressed={hi}
            className="flex flex-col items-center gap-1"
          >
            <span className="font-mono text-[10px] text-[var(--fg-muted)]">{formatNum(v)}</span>
            <div
              className={`w-10 rounded-t-sm transition-colors ${
                hi ? 'bg-[var(--accent-strong)]' : 'bg-teal-600/70'
              }`}
              style={{ height: h }}
            />
            <span className="font-mono text-[10px] text-[var(--fg-muted)]">{cellName(i, j)}²</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Norma de Frobenius ‖A‖_F vía suma de cuadrados de entradas (ALG-NOR-002).
 */
export function FrobeniusNormVisualizer() {
  const [A, setA] = useState<Mat2>(() => cloneMat2(DEFAULT_A));
  const [activeMode, setActiveMode] = useState<Mode>('entries');
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [preset, setPreset] = useState<PresetId>('general');
  const [showDistribution, setShowDistribution] = useState(true);
  const [svdReady, setSvdReady] = useState(false);
  const [propsOpen, setPropsOpen] = useState(false);
  const [homogeneityC, setHomogeneityC] = useState(1.5);

  const Amat = asMat(A);
  const squares = useMemo(() => squaredMagnitudes(Amat), [Amat]);
  const normSq = useMemo(() => frobeniusNormSquared(Amat), [Amat]);
  const normF = useMemo(() => frobeniusNorm(Amat), [Amat]);
  const vecA = useMemo(() => vectorizeColumnMajor(Amat), [Amat]);
  const vecNorm = useMemo(() => vectorTwoNorm(vecA), [vecA]);
  const maxSq = useMemo(() => Math.max(...squares.flat(), 0), [squares]);

  const svdResult = useMemo(() => (svdReady ? svd(Amat) : null), [Amat, svdReady]);
  const sigmas = svdResult?.S ?? [];
  const sigmaSqSum = useMemo(
    () => sigmas.reduce((s, σ) => s + σ * σ, 0),
    [sigmas],
  );

  const scaledA = useMemo(() => matScale(Amat, homogeneityC), [Amat, homogeneityC]);
  const scaledNorm = useMemo(() => frobeniusNorm(scaledA), [scaledA]);
  const homogeneityOk = useMemo(() => {
    const expected = Math.abs(homogeneityC) * normF;
    return Math.abs(scaledNorm - expected) <= 1e-8 * (1 + expected);
  }, [scaledNorm, homogeneityC, normF]);

  const squareTerms = CELL_LABELS.map(([i, j]) => {
    const v = A[i]?.[j] ?? 0;
    const sq = squares[i]?.[j] ?? 0;
    return { i, j, v, sq, label: `${cellName(i, j)}²=${formatNum(sq)}` };
  });

  const applyPreset = (id: Exclude<PresetId, null>) => {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setA(cloneMat2(p.A));
    setPreset(id);
    setSelectedCell(null);
    setActiveStep(0);
    setSvdReady(false);
  };

  const onMatrixChange = (m: Mat2) => {
    setA(m);
    setPreset(null);
    setSvdReady(false);
  };

  const advanceStep = () => setActiveStep((s) => (s + 1) % 3);

  const caption = joinCaption(
    `‖A‖_F=${formatNum(normF)}`,
    activeMode === 'vector' ? `‖vec(A)‖₂=${formatNum(vecNorm)}` : undefined,
    activeMode === 'svd' && svdReady ? `Σσᵢ²=${formatNum(sigmaSqSum)}` : undefined,
  );

  const showSqValues = activeStep >= 1;
  const showExpansion = activeStep >= 2;

  return (
    <VizPanel title="Norma de Frobenius" caption={caption}>
      <div className="space-y-3">
        <GuideBlock
          idea="Vas a ver que la norma de Frobenius mide el tamaño global de una matriz: cada entrada aporta su magnitud al cuadrado."
          tryIt="Edita A y observa cómo cada entrada contribuye a la suma total antes de aplicar la raíz cuadrada."
        />

        <Segmented
          options={MODE_OPTS}
          value={activeMode}
          onChange={(id) => {
            setActiveMode(id as Mode);
            if (id !== 'svd') setSvdReady(false);
          }}
        />

        {activeMode === 'entries' ? (
          <div className="space-y-3">
            <ChipRow>
              {PRESETS.map((p) => (
                <Chip key={p.id} active={preset === p.id} onClick={() => applyPreset(p.id)}>
                  {p.label}
                </Chip>
              ))}
            </ChipRow>

            <div className="flex flex-wrap items-start justify-center gap-4">
              <div className="space-y-1">
                <p className="text-center text-xs font-medium text-[var(--fg-muted)]">Matriz A</p>
                <Mat2Editor
                  m={A}
                  onChange={onMatrixChange}
                  highlightCells={selectedCell ? [selectedCell] : undefined}
                />
              </div>

              {activeStep >= 1 ? (
                <div className="space-y-1">
                  <p className="text-center text-xs font-medium text-[var(--fg-muted)]">|a_ij|²</p>
                  <div className="grid grid-cols-2 gap-2 px-1">
                    {CELL_LABELS.map(([i, j]) => (
                      <SqHeatCell
                        key={`sq-${i}-${j}`}
                        i={i}
                        j={j}
                        value={squares[i]?.[j] ?? 0}
                        maxSq={maxSq}
                        selected={selectedCell?.[0] === i && selectedCell?.[1] === j}
                        onSelect={() => setSelectedCell([i, j])}
                        showValue={showSqValues}
                        ariaLabel={`|${cellName(i, j)}|² = ${formatNum(squares[i]?.[j] ?? 0)}`}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {showExpansion ? (
              <section
                className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-3 font-mono text-sm leading-relaxed text-[var(--fg)]"
                aria-live="polite"
              >
                <p>
                  {squareTerms.map((t, idx) => (
                    <span key={`${t.i}-${t.j}`}>
                      {idx > 0 ? ' + ' : ''}
                      <span className="text-[var(--accent-strong)]">{cellName(t.i, t.j)}²</span>
                      <span className="text-[var(--fg-muted)]">({formatNum(t.v)}²={formatNum(t.sq)})</span>
                    </span>
                  ))}
                </p>
                <p className="mt-2">
                  ={' '}
                  <span className="font-semibold text-[var(--accent-strong)]">
                    {squareTerms.map((t) => formatNum(t.sq)).join(' + ')}
                  </span>
                  = <span className="font-semibold">‖A‖_F² = {formatNum(normSq)}</span>
                </p>
                <p className="mt-1">
                  ‖A‖_F = √{formatNum(normSq)} ={' '}
                  <span className="font-semibold text-[var(--accent-strong)]">{formatNum(normF)}</span>
                </p>
              </section>
            ) : (
              <p className="text-sm text-[var(--fg-muted)]" aria-live="polite">
                {STEP_HINTS[activeStep]}
              </p>
            )}

            {showDistribution ? (
              <ContributionBars
                squares={squares}
                maxSq={maxSq}
                selected={selectedCell}
                onSelect={setSelectedCell}
              />
            ) : null}

            <ControlsStack>
              <ToggleRow
                label="Mostrar barras por entrada"
                checked={showDistribution}
                onChange={setShowDistribution}
              />
              <ButtonRow>
                <VizButton onClick={advanceStep} active={activeStep > 0}>
                  Ver cálculo
                </VizButton>
                {activeStep > 0 ? (
                  <VizButton onClick={() => setActiveStep(0)}>Reiniciar pasos</VizButton>
                ) : null}
              </ButtonRow>
              <p className="text-xs text-[var(--fg-muted)]">
                Paso {activeStep + 1} de 3 — pulsa «Ver cálculo» para avanzar.
              </p>
            </ControlsStack>
          </div>
        ) : null}

        {activeMode === 'vector' ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-start justify-center gap-4">
              <Mat2Editor m={A} onChange={onMatrixChange} readOnly />
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3">
                <p className="mb-2 text-xs font-medium text-[var(--fg-muted)]">
                  vec(A) — apilado por columnas
                </p>
                <div className="flex flex-col gap-1 font-mono text-sm tabular-nums">
                  {vecA.map((v, idx) => (
                    <span key={idx} className="text-[var(--fg)]">
                      [{idx + 1}] {formatNum(v)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <section
              className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-3 font-mono text-sm text-[var(--fg)]"
              aria-label="Norma euclidiana del vector apilado"
            >
              <p>
                ‖vec(A)‖₂ = √(
                {vecA.map((v, i) => (
                  <span key={i}>
                    {i > 0 ? ' + ' : ''}
                    {formatNum(v)}²
                  </span>
                ))}
                )
              </p>
              <p className="mt-1">
                = √{formatNum(vecA.reduce((s, x) => s + x * x, 0))} ={' '}
                <span className="font-semibold text-[var(--accent-strong)]">{formatNum(vecNorm)}</span>
              </p>
              <div className="mt-2">
                <Badge tone="ok">‖vec(A)‖₂ = ‖A‖_F = {formatNum(normF)}</Badge>
              </div>
            </section>

            <p className="text-sm text-[var(--fg-muted)]">
              Apilar las columnas de A en un vector y medir su longitud euclidiana reproduce la norma
              de Frobenius.
            </p>
          </div>
        ) : null}

        {activeMode === 'svd' ? (
          <div className="space-y-3">
            <Mat2Editor m={A} onChange={onMatrixChange} readOnly />

            <ButtonRow>
              <VizButton active={svdReady} onClick={() => setSvdReady(true)}>
                Calcular valores singulares
              </VizButton>
            </ButtonRow>

            {svdReady && svdResult ? (
              <>
                <div
                  className="flex items-end justify-center gap-4 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-4"
                  role="img"
                  aria-label="Valores singulares de A"
                >
                  {[sigmas[0] ?? 0, sigmas[1] ?? 0].map((σ, i) => {
                    const maxS = Math.max(sigmas[0] ?? 0, sigmas[1] ?? 0, 1e-9);
                    const h = Math.max(6, (σ / maxS) * 80);
                    return (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <span className="font-mono text-xs text-[var(--fg-muted)]">{formatNum(σ)}</span>
                        <div
                          className="w-12 rounded-t-sm bg-[var(--accent-strong)]/75"
                          style={{ height: h }}
                        />
                        <span className="font-mono text-xs text-[var(--fg-muted)]">σ{i + 1}</span>
                        <span className="font-mono text-[10px] text-[var(--fg-muted)]">
                          σ{i + 1}²={formatNum(σ * σ)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <section
                  className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-3 font-mono text-sm text-[var(--fg)]"
                  aria-live="polite"
                >
                  <p>
                    σ₁² + σ₂² = {formatNum((sigmas[0] ?? 0) ** 2)} + {formatNum((sigmas[1] ?? 0) ** 2)} ={' '}
                    <span className="font-semibold">{formatNum(sigmaSqSum)}</span>
                  </p>
                  <p className="mt-1">
                    ‖A‖_F² = {formatNum(normSq)} · ‖A‖_F ={' '}
                    <span className="font-semibold text-[var(--accent-strong)]">{formatNum(normF)}</span>
                  </p>
                  <div className="mt-2">
                    <Badge tone={Math.abs(sigmaSqSum - normSq) < 1e-6 ? 'ok' : 'warn'}>
                      Σσᵢ² = ‖A‖_F²
                      {Math.abs(sigmaSqSum - normSq) < 1e-6 ? ' ✓' : ''}
                    </Badge>
                  </div>
                </section>
              </>
            ) : (
              <p className="text-sm text-[var(--fg-muted)]">
                Calcula los valores singulares para ver que la suma de sus cuadrados coincide con ‖A‖_F².
              </p>
            )}
          </div>
        ) : null}

        <CollapsibleEdit
          label="Propiedades"
          open={propsOpen}
          onToggle={() => setPropsOpen((o) => !o)}
        >
          <div className="space-y-3">
            <p className="text-sm text-[var(--fg-muted)]">
              Homogeneidad: escala toda la matriz por c y la norma se multiplica por |c|.
            </p>
            <SliderRow
              label="c"
              ariaLabel="factor de escala c"
              value={homogeneityC}
              min={-2.5}
              max={2.5}
              step={0.1}
              onChange={setHomogeneityC}
            />
            <div className="font-mono text-sm text-[var(--fg)]">
              <p>
                ‖{fmt(homogeneityC)}·A‖_F = {formatNum(scaledNorm)} · |c|·‖A‖_F ={' '}
                {formatNum(Math.abs(homogeneityC) * normF)}
              </p>
            </div>
            <Badge tone={homogeneityOk ? 'ok' : 'warn'}>
              ‖cA‖_F = |c|‖A‖_F{homogeneityOk ? ' ✓' : ''}
            </Badge>
          </div>
        </CollapsibleEdit>

        <p
          className="border-t border-[var(--border)] pt-2 text-sm font-mono text-[var(--fg)]"
          aria-label={`Norma de Frobenius: ${formatNum(normF)}`}
        >
          ‖A‖_F = <span className="font-semibold text-[var(--accent-strong)]">{formatNum(normF)}</span>
        </p>
      </div>
    </VizPanel>
  );
}
