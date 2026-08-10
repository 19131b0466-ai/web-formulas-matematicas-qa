'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from './controls';

const A_MIN = 0.5;
const A_MAX = 6;
const ZERO_EPS = 1e-9;

function snap(val: number, min: number, max: number, step: number): number {
  const clamped = Math.min(max, Math.max(min, val));
  const steps = Math.round((clamped - min) / step);
  const snapped = min + steps * step;
  if (Math.abs(snapped) < step / 2) return 0;
  return Number(snapped.toFixed(1));
}

function present(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '—';
  return fmt(Number(n.toFixed(digits)), digits);
}

function isZero(n: number): boolean {
  return Math.abs(n) < ZERO_EPS;
}

type Step = 0 | 1 | 2 | 3 | 4;

/**
 * Geometric proof of (a−b)² = a²−2ab+b² (ALG-IDN-002).
 * Start from a², subtract two ab strips, correct the double-counted corner +b².
 */
export function SquareDifferenceViz() {
  const [a, setA] = useState(3.7);
  const [b, setB] = useState(1.3);
  const [step, setStep] = useState<Step>(0);
  const guideId = useId();
  const statusId = useId();
  const hatchId = useId();

  // Enforce a ≥ b ≥ 0
  const bb = Math.min(Math.max(0, b), a);
  const rem = Math.max(0, a - bb);

  const a2 = a * a;
  const ab = a * bb;
  const b2 = bb * bb;
  const twoAb = 2 * ab;
  const rem2 = rem * rem;
  // Algebraic check: a² − 2ab + b²
  const expanded = a2 - twoAb + b2;

  const aL = present(a);
  const bL = present(bb);
  const remL = present(rem);
  const a2L = present(a2);
  const abL = present(ab);
  const b2L = present(b2);
  const twoAbL = present(twoAb);
  const rem2L = present(rem2);
  const expandedL = present(expanded);

  const showStrips = step >= 1;
  const showBothStrips = step >= 2;
  const showCornerFix = step >= 3;
  const showGroup = step >= 4;

  const padL = 52;
  const padT = 40;
  const padR = showGroup ? 120 : 36;
  const padB = 56;
  const box = 220;
  const svgW = padL + box + padR;
  const svgH = padT + box + padB;

  const fracRem = a > ZERO_EPS ? rem / a : 0;
  const remPx = box * fracRem;
  const bPx = box - remPx;
  const x0 = padL;
  const y0 = padT;

  const labelInside = (w: number, h: number) => w >= 34 && h >= 26;

  const ariaStatus = useMemo(() => {
    return [
      `Partimos de un cuadrado de lado a igual a ${aL}, área a al cuadrado igual a ${a2L}.`,
      `Se restan dos franjas de área a por b igual a ${abL} cada una.`,
      `La esquina b al cuadrado igual a ${b2L} se restó dos veces y se corrige sumándola una vez.`,
      `El cuadrado restante tiene lado a menos b igual a ${remL} y área ${rem2L}.`,
      `Por eso a menos b al cuadrado es a al cuadrado menos 2ab más b al cuadrado.`,
    ].join(' ');
  }, [aL, a2L, abL, b2L, remL, rem2L]);

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Partimos de un cuadrado de lado a, cuya área es a². Quitamos una franja vertical de área
            ab y una horizontal de área ab.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            La esquina b² queda quitada dos veces, así que se suma una vez. El cuadrado que queda
            tiene lado a−b, por eso su área es (a−b)² = a²−2ab+b².
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Identidad general
          </p>
          <p className="mt-2 font-mono text-lg font-semibold">(a−b)² = a²−2ab+b²</p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
              Demostración geométrica
            </p>
            <ButtonRow>
              <VizButton onClick={() => setStep((s) => (s > 0 ? ((s - 1) as Step) : s))}>
                Paso anterior
              </VizButton>
              <VizButton onClick={() => setStep((s) => (s < 4 ? ((s + 1) as Step) : s))}>
                Paso siguiente
              </VizButton>
              <VizButton onClick={() => setStep(4)} active={step === 4}>
                Ver resultado final
              </VizButton>
            </ButtonRow>
          </div>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            <span className="font-medium text-[var(--fg)]">Paso {step + 1} de 5</span>
            {' — '}
            {step === 0 && 'cuadrado completo de lado a (área a²).'}
            {step === 1 && 'se marca la franja vertical de ancho b (área ab, a restar).'}
            {step === 2 && 'se marca también la franja horizontal; restamos ab y ab.'}
            {step === 3 && 'la esquina b² se restó dos veces: se corrige con +b².'}
            {step === 4 && 'el resto es (a−b)² y agrupamos −ab−ab=−2ab.'}
          </p>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">
            Estos botones solo cambian qué parte de la demostración se muestra. No cambian a ni b.
          </p>

          <div className="mt-3 overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="mx-auto h-auto w-full max-w-lg"
              role="img"
              aria-labelledby={statusId}
            >
              <defs>
                <pattern
                  id={hatchId}
                  width={6}
                  height={6}
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <line
                    x1={0}
                    y1={0}
                    x2={0}
                    y2={6}
                    stroke="currentColor"
                    strokeWidth={1.2}
                    opacity={0.45}
                  />
                </pattern>
              </defs>

              {/* Top labels */}
              {!isZero(rem) && showStrips ? (
                <text
                  x={x0 + remPx / 2}
                  y={y0 - 12}
                  textAnchor="middle"
                  fontSize={12}
                  fill="currentColor"
                >
                  a−b={remL}
                </text>
              ) : null}
              {!isZero(bb) && showStrips ? (
                <text
                  x={x0 + remPx + bPx / 2}
                  y={y0 - 12}
                  textAnchor="middle"
                  fontSize={12}
                  fill="currentColor"
                >
                  b={bL}
                </text>
              ) : (
                <text
                  x={x0 + box / 2}
                  y={y0 - 12}
                  textAnchor="middle"
                  fontSize={12}
                  fill="currentColor"
                >
                  a={aL}
                </text>
              )}

              {/* Left labels */}
              {!isZero(rem) && showBothStrips ? (
                <text
                  x={x0 - 16}
                  y={y0 + remPx / 2 + 4}
                  textAnchor="middle"
                  fontSize={12}
                  fill="currentColor"
                  transform={`rotate(-90 ${x0 - 16} ${y0 + remPx / 2})`}
                >
                  a−b={remL}
                </text>
              ) : null}
              {!isZero(bb) && showBothStrips ? (
                <text
                  x={x0 - 16}
                  y={y0 + remPx + bPx / 2 + 4}
                  textAnchor="middle"
                  fontSize={12}
                  fill="currentColor"
                  transform={`rotate(-90 ${x0 - 16} ${y0 + remPx + bPx / 2})`}
                >
                  b={bL}
                </text>
              ) : (
                <text
                  x={x0 - 16}
                  y={y0 + box / 2 + 4}
                  textAnchor="middle"
                  fontSize={12}
                  fill="currentColor"
                  transform={`rotate(-90 ${x0 - 16} ${y0 + box / 2})`}
                >
                  a={aL}
                </text>
              )}

              {/* Big square a² — starting point */}
              <rect
                x={x0}
                y={y0}
                width={box}
                height={box}
                fill="var(--accent-soft)"
                stroke="var(--accent-strong)"
                strokeWidth={2}
              />
              {step === 0 ? (
                <text
                  x={x0 + box / 2}
                  y={y0 + box / 2 + 5}
                  textAnchor="middle"
                  fontSize={16}
                  fontWeight={600}
                  fill="currentColor"
                >
                  a²
                </text>
              ) : null}

              {/* Remaining square (a−b)² */}
              {showStrips && !isZero(rem) ? (
                <g>
                  <rect
                    x={x0}
                    y={y0}
                    width={remPx}
                    height={showBothStrips ? remPx : box}
                    fill="var(--accent-soft)"
                    stroke="var(--accent-strong)"
                    strokeWidth={showGroup ? 2.5 : 1.5}
                  />
                  {showBothStrips && labelInside(remPx, remPx) ? (
                    <text
                      x={x0 + remPx / 2}
                      y={y0 + remPx / 2 + 4}
                      textAnchor="middle"
                      fontSize={Math.min(14, remPx / 5)}
                      fontWeight={600}
                      fill="currentColor"
                    >
                      (a−b)²
                    </text>
                  ) : null}
                  <title>{`Cuadrado restante de lado a−b: (a−b)² = ${rem2L}`}</title>
                </g>
              ) : null}

              {/* Vertical strip −ab (right) */}
              {showStrips && !isZero(bb) ? (
                <g>
                  <rect
                    x={x0 + remPx}
                    y={y0}
                    width={bPx}
                    height={showBothStrips ? remPx : box}
                    fill="color-mix(in oklab, var(--danger, #c44) 18%, transparent)"
                    stroke="var(--danger, #c44)"
                    strokeDasharray="4 3"
                    strokeWidth={1.5}
                  />
                  <rect
                    x={x0 + remPx}
                    y={y0}
                    width={bPx}
                    height={showBothStrips ? remPx : box}
                    fill={`url(#${hatchId})`}
                    opacity={0.7}
                  />
                  {(showBothStrips ? labelInside(bPx, remPx) : labelInside(bPx, box)) ? (
                    <text
                      x={x0 + remPx + bPx / 2}
                      y={y0 + (showBothStrips ? remPx : box) / 2 + 4}
                      textAnchor="middle"
                      fontSize={11}
                      fill="currentColor"
                    >
                      −ab
                    </text>
                  ) : (
                    <text
                      x={x0 + remPx + bPx / 2}
                      y={y0 - 24}
                      textAnchor="middle"
                      fontSize={11}
                      fill="currentColor"
                    >
                      −ab
                    </text>
                  )}
                  <title>{`Franja vertical retirada: ab = ${abL}`}</title>
                </g>
              ) : null}

              {/* Horizontal strip −ab (bottom) */}
              {showBothStrips && !isZero(bb) ? (
                <g>
                  <rect
                    x={x0}
                    y={y0 + remPx}
                    width={remPx}
                    height={bPx}
                    fill="color-mix(in oklab, var(--danger, #c44) 18%, transparent)"
                    stroke="var(--danger, #c44)"
                    strokeDasharray="4 3"
                    strokeWidth={1.5}
                  />
                  <rect
                    x={x0}
                    y={y0 + remPx}
                    width={remPx}
                    height={bPx}
                    fill={`url(#${hatchId})`}
                    opacity={0.7}
                  />
                  {labelInside(remPx, bPx) ? (
                    <text
                      x={x0 + remPx / 2}
                      y={y0 + remPx + bPx / 2 + 4}
                      textAnchor="middle"
                      fontSize={11}
                      fill="currentColor"
                    >
                      −ab
                    </text>
                  ) : (
                    <text
                      x={x0 - 38}
                      y={y0 + remPx + bPx / 2 + 4}
                      textAnchor="middle"
                      fontSize={11}
                      fill="currentColor"
                    >
                      −ab
                    </text>
                  )}
                  <title>{`Franja horizontal retirada: ab = ${abL}`}</title>
                </g>
              ) : null}

              {/* Corner +b² correction */}
              {showCornerFix && !isZero(bb) ? (
                <g>
                  <rect
                    x={x0 + remPx}
                    y={y0 + remPx}
                    width={bPx}
                    height={bPx}
                    fill="color-mix(in oklab, orange 38%, transparent)"
                    stroke="orange"
                    strokeWidth={2}
                  />
                  {labelInside(bPx, bPx) ? (
                    <text
                      x={x0 + remPx + bPx / 2}
                      y={y0 + remPx + bPx / 2 + 4}
                      textAnchor="middle"
                      fontSize={Math.min(13, bPx / 3)}
                      fontWeight={600}
                      fill="currentColor"
                    >
                      +b²
                    </text>
                  ) : (
                    <text
                      x={x0 + remPx + bPx / 2}
                      y={y0 + box + 16}
                      textAnchor="middle"
                      fontSize={11}
                      fill="currentColor"
                    >
                      +b²
                    </text>
                  )}
                  <title>{`Corrección: la esquina b² = ${b2L} se suma una vez`}</title>
                </g>
              ) : null}

              {/* Outer label */}
              <text
                x={x0 + box / 2}
                y={y0 + box + 22}
                textAnchor="middle"
                fontSize={12}
                fill="currentColor"
              >
                cuadrado grande: lado a={aL}, área a²={a2L}
              </text>

              {showGroup && !isZero(bb) ? (
                <g aria-label="Dos franjas restadas forman menos 2ab">
                  <path
                    d={`M ${x0 + box + 10} ${y0 + 8}
                        L ${x0 + box + 22} ${y0 + 8}
                        L ${x0 + box + 22} ${y0 + box - 8}
                        L ${x0 + box + 10} ${y0 + box - 8}`}
                    fill="none"
                    stroke="var(--danger, #c44)"
                    strokeWidth={1.5}
                  />
                  <text x={x0 + box + 34} y={y0 + box / 2 - 16} fontSize={11} fill="currentColor">
                    2 franjas
                  </text>
                  <text
                    x={x0 + box + 34}
                    y={y0 + box / 2 + 2}
                    fontSize={12}
                    fontWeight={600}
                    fill="var(--danger, #c44)"
                  >
                    −ab−ab=−2ab
                  </text>
                  <text x={x0 + box + 34} y={y0 + box / 2 + 18} fontSize={11} fill="currentColor">
                    = −{twoAbL}
                  </text>
                </g>
              ) : null}
            </svg>
          </div>

          {showStrips ? (
            <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
              <li className="font-mono">a×a → a² = {a2L}</li>
              <li className="font-mono">franja vertical → −ab = −{abL}</li>
              {showBothStrips ? (
                <li className="font-mono">franja horizontal → −ab = −{abL}</li>
              ) : null}
              {showCornerFix ? <li className="font-mono">corrección → +b² = +{b2L}</li> : null}
              {showBothStrips ? (
                <li className="font-mono sm:col-span-2">
                  cuadrado restante → (a−b)² = {rem2L}
                </li>
              ) : null}
            </ul>
          ) : null}

          {showCornerFix ? (
            <p className="mt-2 rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,orange_10%,transparent)] px-3 py-2 text-sm leading-relaxed">
              La esquina <span className="font-mono">b²</span> pertenece a las dos franjas{' '}
              <span className="font-mono">ab</span>, por eso al restar ambas se elimina dos veces. Se
              corrige sumándola una vez: <span className="font-mono">+b²</span>.
            </p>
          ) : null}

          {showGroup ? (
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Agrupación:{' '}
              <span className="font-mono">
                −ab−ab=−2ab=−{twoAbL}
              </span>
              . Las regiones rayadas se restan; no son áreas positivas añadidas.
            </p>
          ) : null}
        </section>

        <section className="space-y-2 rounded-xl border border-[var(--border)] px-3 py-3 text-sm leading-relaxed">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            De a² al cuadrado restante
          </p>
          <p>
            1. Área total:{' '}
            <span className="font-mono">
              A=a²={a2L}
            </span>
          </p>
          <p>
            2. Restar dos franjas:{' '}
            <span className="font-mono">
              a²−ab−ab={a2L}−{abL}−{abL}
            </span>
          </p>
          <p>
            3. Corregir la superposición:{' '}
            <span className="font-mono">
              a²−ab−ab+b²={a2L}−{abL}−{abL}+{b2L}
            </span>
          </p>
          <p>
            4. Resultado:{' '}
            <span className="font-mono font-semibold">
              (a−b)²={rem2L}=a²−2ab+b²={expandedL}
            </span>
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Ejemplo actual
          </p>
          <p className="mt-2 font-mono text-sm leading-relaxed sm:text-base">
            ({aL}−{bL})² = {aL}²−2({aL})({bL})+({bL})²
          </p>
          <p className="mt-1 font-mono text-sm leading-relaxed sm:text-base">
            {rem2L} = {a2L}−{twoAbL}+{b2L} = {expandedL}
          </p>
          <p className="mt-1 font-mono text-sm text-[var(--fg-muted)]">
            forma intermedia: {a2L}−{abL}−{abL}+{b2L}={rem2L}
          </p>
          {isZero(rem) ? (
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Caso a=b: el cuadrado restante tiene lado 0 y área 0. Comprueba:{' '}
              <span className="font-mono">
                a²−2a²+a²={present(a2 - 2 * a2 + a2)}
              </span>
              .
            </p>
          ) : null}
          {isZero(bb) ? (
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Caso b=0: no hay franjas;{' '}
              <span className="font-mono">
                (a−0)²=a²={a2L}
              </span>
              .
            </p>
          ) : null}
        </section>

        <div
          id={statusId}
          className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_70%,var(--bg-elevated))] px-3 py-2 text-sm leading-relaxed"
          aria-live="polite"
        >
          <p className="font-mono">
            ({aL}−{bL})² = {a2L}−{abL}−{abL}+{b2L} = {rem2L}
          </p>
        </div>

        <p className="sr-only">{ariaStatus}</p>

        <ControlsStack>
          <SliderRow
            label="a"
            ariaLabel={`Lado a del cuadrado grande, actualmente ${aL}`}
            value={a}
            min={A_MIN}
            max={A_MAX}
            step={0.1}
            onChange={(val) => {
              const next = snap(val, A_MIN, A_MAX, 0.1);
              setA(next);
              if (b > next) setB(next);
            }}
          />
          <SliderRow
            label="b"
            ariaLabel={`Ancho b de las franjas, actualmente ${bL}. Debe ser menor o igual que a.`}
            value={bb}
            min={0}
            max={a}
            step={0.1}
            onChange={(val) => setB(snap(val, 0, a, 0.1))}
          />
        </ControlsStack>
        <p className="text-xs text-[var(--fg-muted)]">
          Este modelo geométrico exige a≥b≥0 para que a−b sea una longitud no negativa. El control de
          b no puede superar a.
        </p>
      </div>
    </VizPanel>
  );
}
