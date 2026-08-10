'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from './controls';

const A_MIN = 0;
const A_MAX = 5;
const B_MIN = 0;
const B_MAX = 5;
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
 * Geometric proof of (a+b)² = a²+2ab+b² (ALG-IDN-001 / ALG-FAC-003).
 * Same square area computed as whole side and as four regions.
 */
export function SquareSumViz({ formulaId = '' }: { formulaId?: string }) {
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);
  const [step, setStep] = useState<Step>(4);
  const guideId = useId();
  const statusId = useId();
  const isFactor = formulaId.includes('FAC-003');

  const side = a + b;
  const a2 = a * a;
  const ab = a * b;
  const b2 = b * b;
  const twoAb = 2 * ab;
  const total = side * side;

  const aL = present(a);
  const bL = present(b);
  const sideL = present(side);
  const a2L = present(a2);
  const abL = present(ab);
  const b2L = present(b2);
  const twoAbL = present(twoAb);
  const totalL = present(total);

  const showVDivide = step >= 1;
  const showHDivide = step >= 2;
  const showRegions = step >= 2;
  const highlightAb = step >= 3;
  const showGroup = step >= 4;

  // SVG layout: fixed outer square; internal split by a/(a+b)
  const padL = 48;
  const padT = 36;
  const padR = 28;
  const padB = 52;
  const box = 220;
  const svgW = padL + box + padR + (showGroup ? 100 : 20);
  const svgH = padT + box + padB;
  const degenerate = side <= ZERO_EPS;
  const fracA = !degenerate ? a / side : 0;
  const aw = degenerate ? 0 : box * fracA;
  const bw = degenerate ? 0 : box - aw;
  const ah = aw;
  const bh = bw;
  const x0 = padL;
  const y0 = padT;

  const labelInside = (w: number, h: number) => w >= 36 && h >= 28;

  const ariaStatus = useMemo(() => {
    return [
      `El cuadrado tiene lado a más b, igual a ${sideL}.`,
      `Está dividido en un cuadrado de área a al cuadrado igual a ${a2L},`,
      `dos rectángulos de área a por b igual a ${abL} cada uno,`,
      `y un cuadrado de área b al cuadrado igual a ${b2L}.`,
      `Los dos rectángulos aportan 2ab igual a ${twoAbL}.`,
      `El área total es ${totalL}.`,
    ].join(' ');
  }, [sideL, a2L, abL, b2L, twoAbL, totalL]);

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            {isFactor
              ? 'Un trinomio a²+2ab+b² se arma como un cuadrado de lado a+b: las cuatro piezas encajan exactamente.'
              : 'Un cuadrado de lado a+b tiene área (a+b)². Al dividir cada lado en una parte a y otra b, aparecen cuatro regiones.'}
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Sus áreas son a², ab, ab y b². Como hay dos rectángulos de área ab, juntos aportan 2ab. Por
            eso (a+b)² = a²+2ab+b².
          </p>
        </div>

        {/* Identity (symbolic, separate from numeric) */}
        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Identidad general
          </p>
          <p className="mt-2 font-mono text-lg font-semibold">(a+b)² = a²+2ab+b²</p>
        </section>

        {/* Geometric figure */}
        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
              Demostración geométrica
            </p>
            <ButtonRow>
              <VizButton onClick={() => setStep((s) => (s > 0 ? ((s - 1) as Step) : s))}>
                Anterior
              </VizButton>
              <VizButton onClick={() => setStep((s) => (s < 4 ? ((s + 1) as Step) : s))}>
                Siguiente
              </VizButton>
              <VizButton onClick={() => setStep(4)} active={step === 4}>
                Ver todo
              </VizButton>
            </ButtonRow>
          </div>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            {step === 0 && '1. Cuadrado completo de lado a+b.'}
            {step === 1 && '2. División vertical: segmentos a y b.'}
            {step === 2 && '3. División horizontal: aparecen a², ab, ab y b².'}
            {step === 3 && '4. Se resaltan los dos rectángulos de área ab.'}
            {step === 4 && '5. Esos dos rectángulos se agrupan como 2ab.'}
          </p>

          <div className="mt-3 overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="mx-auto h-auto w-full max-w-md"
              role="img"
              aria-labelledby={statusId}
            >
              {/* Top dimension labels */}
              {showVDivide && !isZero(a) ? (
                <text x={x0 + aw / 2} y={y0 - 10} textAnchor="middle" fontSize={12} fill="currentColor">
                  a={aL}
                </text>
              ) : null}
              {showVDivide && !isZero(b) ? (
                <text
                  x={x0 + aw + bw / 2}
                  y={y0 - 10}
                  textAnchor="middle"
                  fontSize={12}
                  fill="currentColor"
                >
                  b={bL}
                </text>
              ) : null}
              {!showVDivide ? (
                <text x={x0 + box / 2} y={y0 - 10} textAnchor="middle" fontSize={12} fill="currentColor">
                  a+b = {sideL}
                </text>
              ) : null}

              {/* Left dimension labels */}
              {showHDivide && !isZero(a) ? (
                <text
                  x={x0 - 14}
                  y={y0 + ah / 2 + 4}
                  textAnchor="middle"
                  fontSize={12}
                  fill="currentColor"
                  transform={`rotate(-90 ${x0 - 14} ${y0 + ah / 2})`}
                >
                  a={aL}
                </text>
              ) : null}
              {showHDivide && !isZero(b) ? (
                <text
                  x={x0 - 14}
                  y={y0 + ah + bh / 2 + 4}
                  textAnchor="middle"
                  fontSize={12}
                  fill="currentColor"
                  transform={`rotate(-90 ${x0 - 14} ${y0 + ah + bh / 2})`}
                >
                  b={bL}
                </text>
              ) : null}
              {!showHDivide ? (
                <text
                  x={x0 - 14}
                  y={y0 + box / 2 + 4}
                  textAnchor="middle"
                  fontSize={12}
                  fill="currentColor"
                  transform={`rotate(-90 ${x0 - 14} ${y0 + box / 2})`}
                >
                  a+b = {sideL}
                </text>
              ) : null}

              {/* Outer square (hidden when a=b=0: zero area) */}
              {!degenerate ? (
                <rect
                  x={x0}
                  y={y0}
                  width={box}
                  height={box}
                  fill="var(--accent-soft)"
                  stroke="var(--accent-strong)"
                  strokeWidth={2}
                />
              ) : (
                <text
                  x={x0 + box / 2}
                  y={y0 + box / 2}
                  textAnchor="middle"
                  fontSize={13}
                  fill="currentColor"
                >
                  área = 0
                </text>
              )}

              {/* Regions */}
              {showRegions ? (
                <>
                  {!isZero(a) ? (
                    <g>
                      <rect
                        x={x0}
                        y={y0}
                        width={aw}
                        height={ah}
                        fill="var(--accent-soft)"
                        stroke="var(--accent-strong)"
                      />
                      {labelInside(aw, ah) ? (
                        <text
                          x={x0 + aw / 2}
                          y={y0 + ah / 2 + 4}
                          textAnchor="middle"
                          fontSize={Math.min(13, aw / 4, ah / 3)}
                          fill="currentColor"
                        >
                          a²
                        </text>
                      ) : (
                        <>
                          <line
                            x1={x0 + aw / 2}
                            y1={y0 + ah / 2}
                            x2={x0 + aw / 2}
                            y2={y0 - 22}
                            stroke="currentColor"
                            strokeDasharray="2 2"
                            opacity={0.5}
                          />
                          <text
                            x={x0 + aw / 2}
                            y={y0 - 24}
                            textAnchor="middle"
                            fontSize={11}
                            fill="currentColor"
                          >
                            a²
                          </text>
                        </>
                      )}
                      <title>{`Cuadrado a×a: a² = ${a2L}`}</title>
                    </g>
                  ) : null}

                  {!isZero(a) && !isZero(b) ? (
                    <>
                      <g>
                        <rect
                          x={x0 + aw}
                          y={y0}
                          width={bw}
                          height={ah}
                          fill={
                            highlightAb
                              ? 'color-mix(in oklab, teal 42%, transparent)'
                              : 'color-mix(in oklab, teal 22%, transparent)'
                          }
                          stroke="teal"
                          strokeWidth={highlightAb ? 2.5 : 1}
                        />
                        {labelInside(bw, ah) ? (
                          <text
                            x={x0 + aw + bw / 2}
                            y={y0 + ah / 2 + 4}
                            textAnchor="middle"
                            fontSize={Math.min(13, bw / 3, ah / 3)}
                            fill="currentColor"
                          >
                            ab
                          </text>
                        ) : (
                          <text
                            x={x0 + aw + bw / 2}
                            y={y0 - 24}
                            textAnchor="middle"
                            fontSize={11}
                            fill="currentColor"
                          >
                            ab
                          </text>
                        )}
                        <title>{`Rectángulo a×b: ab = ${abL}`}</title>
                      </g>
                      <g>
                        <rect
                          x={x0}
                          y={y0 + ah}
                          width={aw}
                          height={bh}
                          fill={
                            highlightAb
                              ? 'color-mix(in oklab, teal 42%, transparent)'
                              : 'color-mix(in oklab, teal 22%, transparent)'
                          }
                          stroke="teal"
                          strokeWidth={highlightAb ? 2.5 : 1}
                        />
                        {labelInside(aw, bh) ? (
                          <text
                            x={x0 + aw / 2}
                            y={y0 + ah + bh / 2 + 4}
                            textAnchor="middle"
                            fontSize={Math.min(13, aw / 3, bh / 3)}
                            fill="currentColor"
                          >
                            ab
                          </text>
                        ) : (
                          <text
                            x={x0 - 36}
                            y={y0 + ah + bh / 2 + 4}
                            textAnchor="middle"
                            fontSize={11}
                            fill="currentColor"
                          >
                            ab
                          </text>
                        )}
                        <title>{`Rectángulo b×a: ab = ${abL}`}</title>
                      </g>
                    </>
                  ) : null}

                  {!isZero(b) ? (
                    <g>
                      <rect
                        x={x0 + aw}
                        y={y0 + ah}
                        width={bw}
                        height={bh}
                        fill="color-mix(in oklab, orange 32%, transparent)"
                        stroke="orange"
                      />
                      {labelInside(bw, bh) ? (
                        <text
                          x={x0 + aw + bw / 2}
                          y={y0 + ah + bh / 2 + 4}
                          textAnchor="middle"
                          fontSize={Math.min(13, bw / 4, bh / 3)}
                          fill="currentColor"
                        >
                          b²
                        </text>
                      ) : (
                        <text
                          x={x0 + aw + bw / 2}
                          y={y0 + box + 16}
                          textAnchor="middle"
                          fontSize={11}
                          fill="currentColor"
                        >
                          b²
                        </text>
                      )}
                      <title>{`Cuadrado b×b: b² = ${b2L}`}</title>
                    </g>
                  ) : null}
                </>
              ) : null}

              {/* Dividers */}
              {showVDivide && !isZero(a) && !isZero(b) ? (
                <line
                  x1={x0 + aw}
                  y1={y0}
                  x2={x0 + aw}
                  y2={y0 + box}
                  stroke="currentColor"
                  strokeWidth={1.5}
                />
              ) : null}
              {showHDivide && !isZero(a) && !isZero(b) ? (
                <line
                  x1={x0}
                  y1={y0 + ah}
                  x2={x0 + box}
                  y2={y0 + ah}
                  stroke="currentColor"
                  strokeWidth={1.5}
                />
              ) : null}

              {/* Bottom: total side */}
              <text
                x={x0 + box / 2}
                y={y0 + box + 22}
                textAnchor="middle"
                fontSize={12}
                fill="currentColor"
              >
                lado = a+b = {sideL}
              </text>

              {/* Brace grouping the two ab regions */}
              {showGroup && !isZero(ab) ? (
                <g aria-label="Dos rectángulos de área ab forman 2ab">
                  <path
                    d={`M ${x0 + box + 10} ${y0 + 8}
                        L ${x0 + box + 22} ${y0 + 8}
                        L ${x0 + box + 22} ${y0 + box - 8}
                        L ${x0 + box + 10} ${y0 + box - 8}`}
                    fill="none"
                    stroke="teal"
                    strokeWidth={1.5}
                  />
                  <text
                    x={x0 + box + 36}
                    y={y0 + box / 2 - 8}
                    fontSize={11}
                    fill="currentColor"
                  >
                    2 rectángulos
                  </text>
                  <text
                    x={x0 + box + 36}
                    y={y0 + box / 2 + 8}
                    fontSize={12}
                    fontWeight={600}
                    fill="teal"
                  >
                    ab+ab=2ab
                  </text>
                  <text x={x0 + box + 36} y={y0 + box / 2 + 24} fontSize={11} fill="currentColor">
                    = {twoAbL}
                  </text>
                </g>
              ) : null}
            </svg>
          </div>

          {/* Region values (textual, not color-only) */}
          {showRegions ? (
            <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
              <li className="font-mono">
                a×a → a² = {a2L}
              </li>
              <li className="font-mono">
                a×b → ab = {abL}
              </li>
              <li className="font-mono">
                b×a → ab = {abL}
              </li>
              <li className="font-mono">
                b×b → b² = {b2L}
              </li>
            </ul>
          ) : null}
          {showGroup ? (
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              2 rectángulos de área ab: <span className="font-mono">ab+ab=2ab={twoAbL}</span>
            </p>
          ) : null}
        </section>

        {/* Pedagogical chain */}
        <section className="rounded-xl border border-[var(--border)] px-3 py-3 space-y-2 text-sm leading-relaxed">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Misma área, dos cálculos
          </p>
          <p>
            1. Área del cuadrado completo:{' '}
            <span className="font-mono">
              A=(a+b)²={sideL}²={totalL}
            </span>
          </p>
          <p>
            2. Área por regiones:{' '}
            <span className="font-mono">
              A=a²+ab+ab+b²={a2L}+{abL}+{abL}+{b2L}={totalL}
            </span>
          </p>
          <p>
            3. Agrupación:{' '}
            <span className="font-mono">
              A=a²+2ab+b²={a2L}+{twoAbL}+{b2L}={totalL}
            </span>
          </p>
          <p>
            4. Igualdad: ambos cálculos miden el mismo cuadrado, por tanto{' '}
            <span className="font-mono font-semibold">(a+b)²=a²+2ab+b²</span>.
          </p>
        </section>

        {/* Numeric example (separate from identity) */}
        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Ejemplo actual
          </p>
          <p className="mt-2 font-mono text-sm leading-relaxed sm:text-base">
            ({aL}+{bL})² = {aL}²+2({aL})({bL})+({bL})²
          </p>
          <p className="mt-1 font-mono text-sm leading-relaxed sm:text-base">
            {totalL} = {a2L}+{twoAbL}+{b2L} = {totalL}
          </p>
          <p className="mt-1 font-mono text-sm text-[var(--fg-muted)]">
            regiones: {a2L}+{abL}+{abL}+{b2L}={totalL}
          </p>
          {!isZero(a) && Math.abs(a - b) < ZERO_EPS ? (
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Observación (a=b): <span className="font-mono">(2a)²=4a²</span> →{' '}
              <span className="font-mono">
                ({present(2 * a)})²={present(4 * a2)}
              </span>
              . No sustituye la identidad general.
            </p>
          ) : null}
          {(isZero(a) || isZero(b)) && !isZero(side) ? (
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Caso degenerado:{' '}
              <span className="font-mono">
                ({aL}+{bL})²={present(isZero(b) ? a2 : b2)}
              </span>
              ; las regiones de ancho o alto cero no aportan área.
            </p>
          ) : null}
        </section>

        <div
          id={statusId}
          className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_70%,var(--bg-elevated))] px-3 py-2 text-sm leading-relaxed"
          aria-live="polite"
        >
          <p className="font-mono">
            ({aL}+{bL})² = {a2L}+{twoAbL}+{b2L} = {totalL}
          </p>
        </div>

        <p className="sr-only">{ariaStatus}</p>

        <ControlsStack>
          <SliderRow
            label="a"
            ariaLabel={`Longitud a, actualmente ${aL}`}
            value={a}
            min={A_MIN}
            max={A_MAX}
            step={0.1}
            onChange={(val) => setA(snap(val, A_MIN, A_MAX, 0.1))}
          />
          <SliderRow
            label="b"
            ariaLabel={`Longitud b, actualmente ${bL}`}
            value={b}
            min={B_MIN}
            max={B_MAX}
            step={0.1}
            onChange={(val) => setB(snap(val, B_MIN, B_MAX, 0.1))}
          />
        </ControlsStack>
        <p className="text-xs text-[var(--fg-muted)]">
          a y b son longitudes geométricas (a≥0, b≥0). La identidad algebraica vale también con
          negativos, pero aquí no se representan longitudes negativas.
        </p>
      </div>
    </VizPanel>
  );
}
