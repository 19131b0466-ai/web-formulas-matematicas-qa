'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from './controls';

const ZERO_EPS = 1e-9;

type Step = 0 | 1 | 2 | 3 | 4 | 5;

const STEP_META: { title: string; detail: string }[] = [
  {
    title: 'Expresión original',
    detail: 'Partimos de x²+bx. El cuadrado x² y el término lineal bx aún no forman un cuadrado perfecto.',
  },
  {
    title: 'División de bx',
    detail: 'Partimos bx en dos rectángulos iguales de área x·(b/2). Así preparamos el borde del cuadrado.',
  },
  {
    title: 'Añadir la esquina',
    detail: 'Añadimos la esquina faltante (b/2)² para cerrar el cuadrado. El total pasa a ser x²+bx+(b/2)².',
  },
  {
    title: 'Cuadrado completo',
    detail: 'La figura completa tiene lado x+b/2, así que su área es (x+b/2)².',
  },
  {
    title: 'Compensación',
    detail: 'Para no cambiar el valor de x²+bx, restamos la misma esquina que añadimos: −(b/2)².',
  },
  {
    title: 'Identidad final',
    detail: 'Queda la reescritura x²+bx = (x+b/2)² − (b/2)².',
  },
];

function snap(val: number, min: number, max: number, step: number): number {
  const clamped = Math.min(max, Math.max(min, val));
  const steps = Math.round((clamped - min) / step);
  return Number((min + steps * step).toFixed(2));
}

function present(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '—';
  return fmt(Number(n.toFixed(digits)), digits);
}

function isZero(n: number): boolean {
  return Math.abs(n) < ZERO_EPS;
}

/**
 * Geometric complete-the-square for x²+bx (ALG-EQU-005).
 * Restricted to x>0, b≥0 for a length/area model.
 */
export function CompleteSquareViz() {
  const [x, setX] = useState(3);
  const [b, setB] = useState(2);
  const [step, setStep] = useState<Step>(0);
  const guideId = useId();
  const statusId = useId();

  const halfB = b / 2;
  const x2 = x * x;
  const bx = x * b;
  const rectArea = x * halfB;
  const corner = halfB * halfB;
  const side = x + halfB;
  const fullSq = side * side;
  const lhs = x2 + bx;
  const rhs = fullSq - corner;

  const xL = present(x);
  const bL = present(b);
  const halfL = present(halfB);
  const x2L = present(x2);
  const bxL = present(bx);
  const rectL = present(rectArea);
  const cornerL = present(corner);
  const sideL = present(side);
  const fullL = present(fullSq);
  const lhsL = present(lhs);
  const rhsL = present(rhs);

  const showSplit = step >= 1;
  const showCorner = step >= 2;
  const highlightFull = step >= 3;
  const showSubtract = step >= 4;
  const showFinal = step >= 5;

  // Fit figure in a fixed box while preserving proportions
  const padL = 52;
  const padT = 40;
  const padR = 36;
  const padB = 56;
  const box = 230;
  const totalSide = Math.max(side, 0.2);
  const s = box / totalSide;
  const xPx = x * s;
  const hPx = halfB * s;
  const figW = xPx + hPx;
  const figH = xPx + hPx;
  const svgW = padL + box + padR;
  const svgH = padT + box + padB;
  const x0 = padL + (box - figW) / 2;
  const y0 = padT + (box - figH) / 2;

  const labelOk = (w: number, h: number) => w >= 34 && h >= 22;

  const statusText = useMemo(() => {
    if (showFinal) return `Se añade la esquina (b/2)² y luego se resta la misma para conservar la igualdad. Ahora el total forma un cuadrado de lado x+b/2.`;
    if (showSubtract) return `Se resta la misma esquina para conservar la igualdad.`;
    if (highlightFull) return `Ahora el total forma un cuadrado de lado x + b/2 = ${sideL}.`;
    if (showCorner) return `Se añade la esquina (b/2)² = ${cornerL}.`;
    if (showSplit) return `bx se parte en dos rectángulos x·(b/2).`;
    return `Expresión original x²+bx = ${lhsL}.`;
  }, [showFinal, showSubtract, highlightFull, showCorner, showSplit, sideL, cornerL, lhsL]);

  const ariaStatus = useMemo(() => {
    return [
      `Paso ${step + 1} de 6: ${STEP_META[step].title}.`,
      `x=${xL}, b=${bL}, b/2=${halfL}.`,
      `x al cuadrado = ${x2L}, bx = ${bxL}, esquina = ${cornerL}.`,
      `Cuadrado completo = ${fullL}. Identidad: ${lhsL} = ${fullL} − ${cornerL} = ${rhsL}.`,
      statusText,
    ].join(' ');
  }, [step, xL, bL, halfL, x2L, bxL, cornerL, fullL, lhsL, rhsL, statusText]);

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Completar el cuadrado consiste en convertir una expresión cuadrática en un cuadrado
            perfecto, añadiendo y luego compensando la misma cantidad.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            La cantidad que se añade es (b/2)², porque el término lineal bx se reparte en dos
            rectángulos de base x y ancho b/2.
          </p>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">
            Modelo geométrico con x&gt;0 y b≥0 (longitudes y áreas positivas). Este procedimiento también
            sirve para resolver ecuaciones cuadráticas y derivar la fórmula cuadrática.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Identidad objetivo
          </p>
          <p className="mt-2 font-mono text-lg font-semibold">
            x²+bx = (x+b/2)² − (b/2)²
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
              Construcción por áreas
            </p>
            <ButtonRow>
              <VizButton onClick={() => setStep((s) => (s > 0 ? ((s - 1) as Step) : s))}>
                Paso anterior
              </VizButton>
              <VizButton onClick={() => setStep((s) => (s < 5 ? ((s + 1) as Step) : s))}>
                Paso siguiente
              </VizButton>
              <VizButton onClick={() => setStep(5)} active={step === 5}>
                Ver identidad final
              </VizButton>
            </ButtonRow>
          </div>
          <p className="mt-2 text-sm">
            <span className="font-medium">Paso {step + 1} de 6 — {STEP_META[step].title}</span>
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">{STEP_META[step].detail}</p>
          <p className="mt-1 text-sm font-medium text-[var(--fg)]">{statusText}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {(
              [
                [0, 'Original'],
                [1, 'Dividir bx'],
                [2, 'Añadir (b/2)²'],
                [3, 'Formar cuadrado'],
                [4, 'Restar (b/2)²'],
                [5, 'Identidad'],
              ] as const
            ).map(([s, label]) => (
              <VizButton key={s} active={step === s} onClick={() => setStep(s)}>
                {label}
              </VizButton>
            ))}
          </div>

          <div className="mt-3 overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="mx-auto h-auto w-full max-w-md"
              role="img"
              aria-labelledby={statusId}
            >
              {/* Outer side labels when complete */}
              {highlightFull ? (
                <>
                  <text
                    x={x0 + figW / 2}
                    y={y0 - 12}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={600}
                    fill="currentColor"
                  >
                    x+b/2 = {sideL}
                  </text>
                  <text
                    x={x0 - 16}
                    y={y0 + figH / 2 + 4}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={600}
                    fill="currentColor"
                    transform={`rotate(-90 ${x0 - 16} ${y0 + figH / 2})`}
                  >
                    x+b/2 = {sideL}
                  </text>
                </>
              ) : (
                <>
                  <text
                    x={x0 + xPx / 2}
                    y={y0 - 12}
                    textAnchor="middle"
                    fontSize={12}
                    fill="currentColor"
                  >
                    x={xL}
                  </text>
                  {showSplit && !isZero(halfB) ? (
                    <text
                      x={x0 + xPx + hPx / 2}
                      y={y0 - 12}
                      textAnchor="middle"
                      fontSize={12}
                      fill="currentColor"
                    >
                      b/2={halfL}
                    </text>
                  ) : null}
                </>
              )}

              {/* Piece A: x² */}
              <rect
                x={x0}
                y={y0}
                width={Math.max(xPx, 0)}
                height={Math.max(xPx, 0)}
                fill="var(--accent-soft)"
                stroke="var(--accent-strong)"
                strokeWidth={2}
              />
              {labelOk(xPx, xPx) ? (
                <text
                  x={x0 + xPx / 2}
                  y={y0 + xPx / 2 + 4}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={600}
                  fill="currentColor"
                >
                  x²={x2L}
                </text>
              ) : (
                <text x={x0 + 4} y={y0 + 14} fontSize={10} fill="currentColor">
                  x²
                </text>
              )}

              {/* Pieces B & C: split of bx */}
              {showSplit && !isZero(halfB) ? (
                <>
                  <rect
                    x={x0 + xPx}
                    y={y0}
                    width={Math.max(hPx, 0)}
                    height={Math.max(xPx, 0)}
                    fill="color-mix(in oklab, teal 32%, transparent)"
                    stroke="teal"
                    strokeWidth={1.75}
                  />
                  {labelOk(hPx, xPx) ? (
                    <text
                      x={x0 + xPx + hPx / 2}
                      y={y0 + xPx / 2 + 4}
                      textAnchor="middle"
                      fontSize={11}
                      fill="currentColor"
                    >
                      x·(b/2)
                    </text>
                  ) : null}

                  <rect
                    x={x0}
                    y={y0 + xPx}
                    width={Math.max(xPx, 0)}
                    height={Math.max(hPx, 0)}
                    fill="color-mix(in oklab, teal 32%, transparent)"
                    stroke="teal"
                    strokeWidth={1.75}
                  />
                  {labelOk(xPx, hPx) ? (
                    <text
                      x={x0 + xPx / 2}
                      y={y0 + xPx + hPx / 2 + 4}
                      textAnchor="middle"
                      fontSize={11}
                      fill="currentColor"
                    >
                      x·(b/2)
                    </text>
                  ) : null}
                </>
              ) : null}

              {/* Original: show bx as a single strip beside x² if not yet split */}
              {!showSplit && !isZero(b) ? (
                <g>
                  <rect
                    x={x0 + xPx + 10}
                    y={y0}
                    width={Math.min(36, Math.max(18, b * s * 0.35))}
                    height={Math.max(xPx, 0)}
                    fill="color-mix(in oklab, teal 25%, transparent)"
                    stroke="teal"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                  />
                  <text
                    x={x0 + xPx + 10 + Math.min(36, Math.max(18, b * s * 0.35)) / 2}
                    y={y0 + xPx / 2 + 4}
                    textAnchor="middle"
                    fontSize={11}
                    fill="currentColor"
                  >
                    bx
                  </text>
                  <text
                    x={x0 + xPx + 10 + Math.min(36, Math.max(18, b * s * 0.35)) / 2}
                    y={y0 + xPx + 16}
                    textAnchor="middle"
                    fontSize={10}
                    fill="currentColor"
                    opacity={0.75}
                  >
                    ={bxL}
                  </text>
                </g>
              ) : null}

              {/* Piece D: corner */}
              {showCorner && !isZero(halfB) ? (
                <g>
                  <rect
                    x={x0 + xPx}
                    y={y0 + xPx}
                    width={Math.max(hPx, 0)}
                    height={Math.max(hPx, 0)}
                    fill={
                      showSubtract
                        ? 'color-mix(in oklab, orange 18%, transparent)'
                        : 'color-mix(in oklab, orange 42%, transparent)'
                    }
                    stroke="orange"
                    strokeWidth={2}
                    strokeDasharray={showSubtract ? '5 3' : undefined}
                    opacity={showSubtract && !showFinal ? 0.55 : 1}
                  />
                  {labelOk(hPx, hPx) ? (
                    <text
                      x={x0 + xPx + hPx / 2}
                      y={y0 + xPx + hPx / 2 + 4}
                      textAnchor="middle"
                      fontSize={11}
                      fontWeight={600}
                      fill="currentColor"
                    >
                      {showSubtract ? `−(b/2)²` : `(b/2)²`}
                    </text>
                  ) : (
                    <text
                      x={x0 + xPx + 2}
                      y={y0 + xPx + 12}
                      fontSize={10}
                      fill="currentColor"
                    >
                      (b/2)²
                    </text>
                  )}
                </g>
              ) : null}

              {/* Outline of completed square */}
              {highlightFull ? (
                <rect
                  x={x0}
                  y={y0}
                  width={figW}
                  height={figH}
                  fill="none"
                  stroke="var(--accent-strong)"
                  strokeWidth={2.5}
                />
              ) : null}

              {/* Legend under figure */}
              <text x={padL} y={svgH - 18} fontSize={11} fill="currentColor" opacity={0.8}>
                A: x² · B/C: x·(b/2) · D: (b/2)²
              </text>
            </svg>
          </div>
        </section>

        <section className="space-y-2 rounded-xl border border-[var(--border)] px-3 py-3 text-sm leading-relaxed">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Álgebra del paso actual
          </p>
          {step === 0 ? (
            <p className="font-mono text-base">x²+bx = {x2L}+{bxL} = {lhsL}</p>
          ) : null}
          {step === 1 ? (
            <>
              <p className="font-mono">bx = x·(b/2) + x·(b/2)</p>
              <p className="font-mono">
                {bxL} = {rectL} + {rectL}
              </p>
            </>
          ) : null}
          {step === 2 ? (
            <>
              <p className="font-mono text-base">
                x²+bx+(b/2)² = {x2L}+{bxL}+{cornerL}
              </p>
              <p className="text-[var(--fg-muted)]">Se añade la esquina (b/2)² para cerrar el cuadrado.</p>
            </>
          ) : null}
          {step === 3 ? (
            <>
              <p className="font-mono text-base">
                x²+bx+(b/2)² = (x+b/2)²
              </p>
              <p className="font-mono">
                {present(x2 + bx + corner)} = ({xL}+{halfL})² = {sideL}² = {fullL}
              </p>
            </>
          ) : null}
          {step >= 4 ? (
            <>
              <p className="font-mono text-base font-semibold">
                x²+bx = (x+b/2)² − (b/2)²
              </p>
              <p className="text-[var(--fg-muted)]">
                Se resta la misma esquina para conservar la igualdad con la expresión original.
              </p>
            </>
          ) : null}
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 text-sm leading-relaxed">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Verificación numérica
          </p>
          <div className="mt-2 space-y-1 font-mono">
            <p>x² = {x2L}</p>
            <p>cada rectángulo x·(b/2) = {rectL}</p>
            <p>bx = 2·{rectL} = {bxL}</p>
            <p>(b/2)² = ({halfL})² = {cornerL}</p>
            <p>(x+b/2)² = ({sideL})² = {fullL}</p>
            <p className="font-semibold">
              x²+bx = {lhsL} · (x+b/2)²−(b/2)² = {fullL}−{cornerL} = {rhsL}
            </p>
          </div>
          <p className="mt-2 text-[var(--fg-muted)]">
            {Math.abs(lhs - rhs) < 1e-9
              ? 'La identidad se cumple con los valores actuales.'
              : 'Revisa el redondeo: el cálculo interno debe coincidir.'}
          </p>
        </section>

        <div
          id={statusId}
          className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_70%,var(--bg-elevated))] px-3 py-2 text-sm leading-relaxed"
          aria-live="polite"
        >
          <p className="font-mono">
            x²+bx = {lhsL}
            <br />
            (x+b/2)² − (b/2)² = {fullL} − {cornerL} = {rhsL}
          </p>
        </div>

        <p className="sr-only">{ariaStatus}</p>

        <ControlsStack>
          <SliderRow
            label="x"
            ariaLabel={`Lado x del cuadrado principal, actualmente ${xL}`}
            value={x}
            min={0.5}
            max={5}
            step={0.1}
            onChange={(val) => setX(snap(val, 0.5, 5, 0.1))}
          />
          <SliderRow
            label="b"
            ariaLabel={`Coeficiente b (b≥0), actualmente ${bL}`}
            value={b}
            min={0}
            max={4}
            step={0.1}
            onChange={(val) => setB(snap(val, 0, 4, 0.1))}
          />
          <p className="text-xs text-[var(--fg-muted)]">
            Restricción geométrica: x&gt;0 y b≥0. Con b=0 la esquina desaparece y la identidad es trivial.
          </p>
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
