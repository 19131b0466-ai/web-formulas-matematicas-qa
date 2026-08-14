'use client';

import { useMemo, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  ToggleRow,
  VizButton,
  VizPanel,
  fmt,
} from './controls';
import {
  DET_EPS,
  Mat2Editor,
  cloneMat2,
  formatFrac,
  formatSigned,
} from './detHelpers';
import { det2, matMul, type Mat2 } from './math2d';
import { present } from './matrixGrid';

const DEFAULT_A: Mat2 = [
  [2, 1],
  [1, 3],
];

const PRESETS: Record<string, Mat2> = {
  Ejemplo: DEFAULT_A,
  Diagonal: [
    [2, 0],
    [0, 4],
  ],
  Identidad: [
    [1, 0],
    [0, 1],
  ],
  Singular: [
    [2, 4],
    [1, 2],
  ],
};

const STEP_LABELS = ['Determinante', 'Intercambia', 'Signos', 'Escala'] as const;
type Step = 0 | 1 | 2 | 3;

function MatCell({
  value,
  highlight,
  muted,
}: {
  value: string;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex h-10 w-16 items-center justify-center rounded border font-mono text-sm tabular-nums ${
        highlight
          ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] font-semibold text-[var(--accent-strong)]'
          : muted
            ? 'border-[var(--border)] bg-[var(--bg)] text-[var(--fg-muted)]'
            : 'border-[var(--border)] bg-[var(--bg)]'
      }`}
    >
      {value}
    </div>
  );
}

function MatDisplay({
  entries,
  highlightCells,
  name,
}: {
  entries: [[string, string], [string, string]];
  highlightCells?: Array<[number, number]>;
  name?: string;
}) {
  const hi = (i: number, j: number) => highlightCells?.some(([r, c]) => r === i && c === j);
  return (
    <div className="inline-flex flex-col items-center gap-1">
      {name ? <div className="font-mono text-xs text-[var(--fg-muted)]">{name}</div> : null}
      <div className="relative px-3 py-1">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-2 rounded-l-[6px] border-y-2 border-l-2 border-[var(--fg-muted)] opacity-60"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-2 rounded-r-[6px] border-y-2 border-r-2 border-[var(--fg-muted)] opacity-60"
        />
        <div className="grid grid-cols-2 gap-2">
          <MatCell value={entries[0][0]} highlight={hi(0, 0)} />
          <MatCell value={entries[0][1]} highlight={hi(0, 1)} />
          <MatCell value={entries[1][0]} highlight={hi(1, 0)} />
          <MatCell value={entries[1][1]} highlight={hi(1, 1)} />
        </div>
      </div>
    </div>
  );
}

function nearI(m: Mat2): boolean {
  return (
    Math.abs(m[0][0] - 1) < 1e-6 &&
    Math.abs(m[0][1]) < 1e-6 &&
    Math.abs(m[1][0]) < 1e-6 &&
    Math.abs(m[1][1] - 1) < 1e-6
  );
}

/**
 * Construcción paso a paso de A⁻¹ para matrices 2×2 (ALG-DET-005).
 */
export function InverseMatrix2Viz() {
  const [A, setA] = useState<Mat2>(DEFAULT_A);
  const [step, setStep] = useState<Step>(0);
  const [showAll, setShowAll] = useState(false);
  const [leftFirst, setLeftFirst] = useState(true); // A·A⁻¹ vs A⁻¹·A

  const a = A[0][0];
  const b = A[0][1];
  const c = A[1][0];
  const d = A[1][1];
  const det = det2(A);
  const singular = Math.abs(det) < DET_EPS;

  const swapped: Mat2 = [
    [d, b],
    [c, a],
  ];
  const adj: Mat2 = [
    [d, -b],
    [-c, a],
  ];
  const inv: Mat2 | null = singular
    ? null
    : [
        [d / det, -b / det],
        [-c / det, a / det],
      ];

  const product = useMemo(() => {
    if (!inv) return null;
    return leftFirst ? matMul(A, inv) : matMul(inv, A);
  }, [A, inv, leftFirst]);

  const fmtEntry = (n: number) => formatSigned(n);
  const fmtInv = (n: number) => (singular ? '—' : formatFrac(n * det, det));

  const visibleStep = showAll ? 3 : step;
  const canAdvanceScale = !singular;

  const goNext = () => {
    if (showAll) return;
    if (step === 2 && singular) return;
    setStep((s) => Math.min(3, s + 1) as Step);
  };
  const goPrev = () => {
    setShowAll(false);
    setStep((s) => Math.max(0, s - 1) as Step);
  };

  return (
    <VizPanel
      title="Inversa 2×2"
      caption="A⁻¹ deshace lo que hace A: si det ≠ 0, se construye intercambiando la diagonal, cambiando signos fuera de ella y escalando por 1/det."
    >
      <div className="space-y-3">
        <p className="text-sm text-[var(--fg)]">
          Vas a construir A⁻¹ paso a paso: determinante, intercambio de diagonal, signos del
          adjunto y escala 1/det.
        </p>
        <p className="text-sm text-[var(--fg-muted)]">
          <span className="font-medium text-[var(--fg)]">Idea — </span>
          A⁻¹ deshace A. En símbolos: x → Ax → A⁻¹(Ax) = x.
        </p>

        <div className="flex flex-wrap items-start gap-4">
          <div className="space-y-1">
            <div className="font-mono text-xs text-[var(--fg-muted)]">A</div>
            <Mat2Editor m={A} onChange={setA} />
          </div>
          <div className="min-w-[11rem] flex-1 space-y-1 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm">
            <div className="font-mono text-xs text-[var(--fg-muted)]">det(A) = ad − bc</div>
            <div className="font-mono text-xs leading-relaxed">
              = ({fmtEntry(a)})({fmtEntry(d)}) − ({fmtEntry(b)})({fmtEntry(c)})
              <br />
              = {fmtEntry(a * d)} − {fmtEntry(b * c)}
              <br />= <span className="font-semibold text-[var(--accent-strong)]">{present(det)}</span>
            </div>
            {singular ? (
              <p className="border-t border-[var(--border)] pt-1 text-xs text-red-700 dark:text-red-300">
                ✕ A⁻¹ no existe — no se puede dividir por det = 0.
              </p>
            ) : (
              <p className="border-t border-[var(--border)] pt-1 text-xs text-[var(--accent-strong)]">
                ✓ det ≠ 0 → A⁻¹ existe
              </p>
            )}
          </div>
        </div>

        <ButtonRow>
          {Object.entries(PRESETS).map(([label, m]) => (
            <VizButton
              key={label}
              active={
                A[0][0] === m[0][0] &&
                A[0][1] === m[0][1] &&
                A[1][0] === m[1][0] &&
                A[1][1] === m[1][1]
              }
              onClick={() => {
                setA(cloneMat2(m));
                setStep(0);
                setShowAll(false);
              }}
            >
              {label}
            </VizButton>
          ))}
        </ButtonRow>

        <div className="flex flex-wrap items-center gap-2">
          {STEP_LABELS.map((lab, i) => (
            <VizButton
              key={lab}
              active={!showAll && step === i}
              onClick={() => {
                if (i === 3 && singular) return;
                setShowAll(false);
                setStep(i as Step);
              }}
            >
              {i + 1}. {lab}
            </VizButton>
          ))}
          <VizButton
            active={showAll}
            onClick={() => {
              if (singular) {
                setShowAll(false);
                setStep(2);
                return;
              }
              setShowAll(true);
              setStep(3);
            }}
          >
            Ver todo
          </VizButton>
        </div>

        <ButtonRow>
          <VizButton onClick={goPrev}>Anterior</VizButton>
          <VizButton onClick={goNext}>Siguiente</VizButton>
        </ButtonRow>

        <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-3">
          {(showAll || visibleStep >= 0) && (
            <section className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                1 · Determinante
              </p>
              <p className="font-mono text-sm">
                det(A) = ad − bc = {present(det)}
              </p>
            </section>
          )}

          {(showAll || visibleStep >= 1) && (
            <section className="space-y-2 border-t border-[var(--border)] pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                2 · Intercambia la diagonal
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <MatDisplay
                  name="A"
                  entries={[
                    [fmtEntry(a), fmtEntry(b)],
                    [fmtEntry(c), fmtEntry(d)],
                  ]}
                  highlightCells={[
                    [0, 0],
                    [1, 1],
                  ]}
                />
                <span className="text-[var(--fg-muted)]">→</span>
                <MatDisplay
                  name="intercambio"
                  entries={[
                    [fmtEntry(d), fmtEntry(b)],
                    [fmtEntry(c), fmtEntry(a)],
                  ]}
                  highlightCells={[
                    [0, 0],
                    [1, 1],
                  ]}
                />
              </div>
              <p className="text-xs text-[var(--fg-muted)]">a ↔ d; b y c permanecen.</p>
            </section>
          )}

          {(showAll || visibleStep >= 2) && (
            <section className="space-y-2 border-t border-[var(--border)] pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                3 · Cambia signos fuera de la diagonal → adj(A)
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <MatDisplay
                  name="intercambio"
                  entries={[
                    [fmtEntry(swapped[0][0]), fmtEntry(swapped[0][1])],
                    [fmtEntry(swapped[1][0]), fmtEntry(swapped[1][1])],
                  ]}
                />
                <span className="text-[var(--fg-muted)]">→</span>
                <MatDisplay
                  name="adj(A)"
                  entries={[
                    [fmtEntry(adj[0][0]), fmtEntry(adj[0][1])],
                    [fmtEntry(adj[1][0]), fmtEntry(adj[1][1])],
                  ]}
                  highlightCells={[
                    [0, 1],
                    [1, 0],
                  ]}
                />
              </div>
              <p className="text-xs text-[var(--fg-muted)]">
                adj(A) = [[d, −b], [−c, a]]
              </p>
            </section>
          )}

          {(showAll || visibleStep >= 3) && (
            <section className="space-y-2 border-t border-[var(--border)] pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                4 · Escala por 1/det → A⁻¹
              </p>
              {!canAdvanceScale || !inv ? (
                <p className="text-sm text-red-700 dark:text-red-300">
                  Escala bloqueada: no se divide por cero. A⁻¹ no existe.
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-sm">(1/{present(det)}) ·</span>
                    <MatDisplay
                      name="adj(A)"
                      entries={[
                        [fmtEntry(adj[0][0]), fmtEntry(adj[0][1])],
                        [fmtEntry(adj[1][0]), fmtEntry(adj[1][1])],
                      ]}
                    />
                    <span className="text-[var(--fg-muted)]">=</span>
                    <MatDisplay
                      name="A⁻¹"
                      entries={[
                        [fmtInv(inv[0][0]), fmtInv(inv[0][1])],
                        [fmtInv(inv[1][0]), fmtInv(inv[1][1])],
                      ]}
                    />
                  </div>
                  <p className="text-xs text-[var(--fg-muted)]">
                    A⁻¹ = (1/det) · adj(A). Entradas preferidas como fracción.
                  </p>
                </>
              )}
            </section>
          )}
        </div>

        {inv && product ? (
          <div className="space-y-2 rounded-lg border border-[var(--border)] px-3 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                Verificación
              </p>
              <ToggleRow
                label="Verificar A⁻¹ · A (en vez de A · A⁻¹)"
                checked={!leftFirst}
                onChange={(v) => setLeftFirst(!v)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <MatDisplay
                name={leftFirst ? 'A · A⁻¹' : 'A⁻¹ · A'}
                entries={[
                  [present(product[0][0]), present(product[0][1])],
                  [present(product[1][0]), present(product[1][1])],
                ]}
              />
              <span className="font-mono text-sm">
                {nearI(product) ? '= I ✓' : '≈ I'}
              </span>
            </div>
            <p className="font-mono text-[11px] text-[var(--fg-muted)]">
              x → Ax → A⁻¹(Ax) = x
            </p>
          </div>
        ) : null}

        <ControlsStack>
          <p className="text-xs text-[var(--fg-muted)]">
            Edita A arriba o usa presets. det = {fmt(det)}
            {singular ? ' · singular' : ` · 1/det = ${formatFrac(1, det)}`}.
          </p>
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
