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
 * Geometric proof of a²−b² = (a−b)(a+b) (ALG-IDN-003 / ALG-FAC-002).
 * Remove b² from a², split the L into two rectangles, reorder into (a−b)×(a+b).
 */
export function DiffSquaresViz({ formulaId = '' }: { formulaId?: string }) {
  const [a, setA] = useState(3.7);
  const [b, setB] = useState(1.9);
  const [step, setStep] = useState<Step>(0);
  const guideId = useId();
  const statusId = useId();
  const hatchId = useId();
  const isFactor = formulaId.includes('FAC-002');

  const bb = Math.min(Math.max(0, b), a);
  const rem = Math.max(0, a - bb);

  const a2 = a * a;
  const b2 = bb * bb;
  const diff = a2 - b2;
  const piece1 = a * rem; // a(a−b)
  const piece2 = bb * rem; // b(a−b)
  const factored = rem * (a + bb); // (a−b)(a+b)

  const aL = present(a);
  const bL = present(bb);
  const remL = present(rem);
  const sumL = present(a + bb);
  const a2L = present(a2);
  const b2L = present(b2);
  const diffL = present(diff);
  const p1L = present(piece1);
  const p2L = present(piece2);
  const factL = present(factored);

  const showRemoved = step >= 1;
  const showSplit = step >= 2;
  const separating = step === 3;
  const reordered = step >= 4;
  const degenerate = isZero(rem) || isZero(diff);

  // SVG geometry: fixed outer box for square of side a
  const padL = 56;
  const padT = 40;
  const padR = 40;
  const padB = 48;
  const box = 200;
  const scale = a > ZERO_EPS ? box / a : 0;
  const remPx = rem * scale;
  const bPx = bb * scale;
  const aPx = a * scale;
  const x0 = padL;
  const y0 = padT;

  // Final rectangle (a−b) × (a+b) — scale to fit similar width
  const finalW = remPx;
  const finalH = (a + bb) * scale;
  const maxFinalH = 260;
  const finalScale = finalH > maxFinalH && finalH > ZERO_EPS ? maxFinalH / finalH : 1;
  const fw = finalW * finalScale;
  const fh = finalH * finalScale;
  const fRem = remPx * finalScale;
  const fA = aPx * finalScale;
  const fB = bPx * finalScale;

  const svgW = padL + Math.max(box, fw + 40) + padR + 20;
  const svgH = padT + Math.max(box, fh) + padB + (reordered ? 8 : 0);

  const labelInside = (w: number, h: number) => w >= 32 && h >= 24;

  // Piece positions:
  // L layout: piece1 left (rem × a), piece2 top-right (b × rem)
  // Reordered: piece1 on top (rem × a), piece2 below rotated (rem × b)
  const p1L_x = x0;
  const p1L_y = y0;
  const p1L_w = remPx;
  const p1L_h = aPx;

  const p2L_x = x0 + remPx;
  const p2L_y = y0;
  const p2L_w = bPx;
  const p2L_h = remPx;

  const rectX = x0 + 10;
  const rectY = y0;
  const p1R_x = rectX;
  const p1R_y = rectY;
  const p1R_w = fRem;
  const p1R_h = fA;
  const p2R_x = rectX;
  const p2R_y = rectY + fA;
  const p2R_w = fRem;
  const p2R_h = fB;

  // Intermediate separation: piece2 drifts right/down slightly
  const sep = 14;

  const ariaStatus = useMemo(() => {
    return [
      `De un cuadrado de lado a igual a ${aL} se retira uno de lado b igual a ${bL}.`,
      `El área restante es a al cuadrado menos b al cuadrado, igual a ${diffL}.`,
      `Esa región se divide en dos piezas de áreas ${p1L} y ${p2L}.`,
      `Al reordenarlas forman un rectángulo de lados a menos b igual a ${remL} y a más b igual a ${sumL}, área ${factL}.`,
    ].join(' ');
  }, [aL, bL, diffL, p1L, p2L, remL, sumL, factL]);

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            {isFactor
              ? 'Factorizar a²−b² es rearmar el área sobrante como un rectángulo de lados a−b y a+b.'
              : 'Partimos de un cuadrado de lado a y retiramos un cuadrado de lado b. El área que queda es a²−b².'}
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Dividimos esa región en dos rectángulos y los reordenamos. Las mismas piezas forman un
            rectángulo de lados a−b y a+b; el área no cambia.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Identidad general
          </p>
          <p className="mt-2 font-mono text-lg font-semibold">a²−b² = (a−b)(a+b)</p>
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
                Reordenar / factorizar
              </VizButton>
            </ButtonRow>
          </div>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            <span className="font-medium text-[var(--fg)]">Paso {step + 1} de 5</span>
            {' — '}
            {step === 0 && 'cuadrado original de lado a (área a²).'}
            {step === 1 && 'se retira el cuadrado de lado b; queda la región en L = a²−b².'}
            {step === 2 && 'se divide la L en dos rectángulos: a(a−b) y b(a−b).'}
            {step === 3 && 'se separan las mismas piezas (ninguna cambia de área).'}
            {step === 4 && 'se reordenan formando el rectángulo (a−b)×(a+b).'}
          </p>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">
            Los botones solo cambian la demostración. a y b se cambian con los deslizadores.
          </p>

          <div className="mt-3 overflow-x-auto">
            {degenerate && showRemoved ? (
              <p className="mb-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
                {isZero(bb)
                  ? `Caso b=0: no se retira nada; a²−0=(a−0)(a+0)=${a2L}.`
                  : `Caso a=b: el área restante es 0; (a−b)(a+b)=0. No hay rectángulo de área positiva.`}
              </p>
            ) : null}

            <svg
              viewBox={`0 0 ${svgW} ${Math.max(svgH, padT + box + padB)}`}
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

              {!reordered ? (
                <>
                  {/* Dimension labels for square */}
                  <text
                    x={x0 + aPx / 2}
                    y={y0 - 12}
                    textAnchor="middle"
                    fontSize={12}
                    fill="currentColor"
                  >
                    a={aL}
                  </text>
                  {showRemoved && !isZero(rem) ? (
                    <text
                      x={x0 + remPx / 2}
                      y={y0 + aPx + 18}
                      textAnchor="middle"
                      fontSize={11}
                      fill="currentColor"
                    >
                      a−b={remL}
                    </text>
                  ) : null}
                  {showRemoved && !isZero(bb) ? (
                    <text
                      x={x0 + remPx + bPx / 2}
                      y={y0 + aPx + 18}
                      textAnchor="middle"
                      fontSize={11}
                      fill="currentColor"
                    >
                      b={bL}
                    </text>
                  ) : null}
                  <text
                    x={x0 - 16}
                    y={y0 + aPx / 2 + 4}
                    textAnchor="middle"
                    fontSize={12}
                    fill="currentColor"
                    transform={`rotate(-90 ${x0 - 16} ${y0 + aPx / 2})`}
                  >
                    a={aL}
                  </text>

                  {/* Outer square outline */}
                  <rect
                    x={x0}
                    y={y0}
                    width={aPx}
                    height={aPx}
                    fill="var(--accent-soft)"
                    stroke="var(--accent-strong)"
                    strokeWidth={2}
                  />

                  {step === 0 ? (
                    <text
                      x={x0 + aPx / 2}
                      y={y0 + aPx / 2 + 5}
                      textAnchor="middle"
                      fontSize={16}
                      fontWeight={600}
                      fill="currentColor"
                    >
                      a²
                    </text>
                  ) : null}

                  {/* Removed b² */}
                  {showRemoved && !isZero(bb) ? (
                    <g>
                      <rect
                        x={x0 + remPx}
                        y={y0 + remPx}
                        width={bPx}
                        height={bPx}
                        fill="color-mix(in oklab, var(--danger, #c44) 14%, transparent)"
                        stroke="var(--danger, #c44)"
                        strokeDasharray="4 3"
                        strokeWidth={1.5}
                      />
                      <rect
                        x={x0 + remPx}
                        y={y0 + remPx}
                        width={bPx}
                        height={bPx}
                        fill={`url(#${hatchId})`}
                        opacity={0.75}
                      />
                      {labelInside(bPx, bPx) ? (
                        <text
                          x={x0 + remPx + bPx / 2}
                          y={y0 + remPx + bPx / 2 + 4}
                          textAnchor="middle"
                          fontSize={11}
                          fill="currentColor"
                        >
                          quitar b²
                        </text>
                      ) : (
                        <text
                          x={x0 + remPx + bPx / 2}
                          y={y0 + aPx + 32}
                          textAnchor="middle"
                          fontSize={11}
                          fill="currentColor"
                        >
                          área retirada = b²
                        </text>
                      )}
                      <title>{`Área retirada b² = ${b2L}`}</title>
                    </g>
                  ) : null}

                  {/* Pieces of the L */}
                  {showSplit && !degenerate ? (
                    <>
                      {/* Piece 1: left a×(a−b) as rem × a */}
                      <g
                        style={{
                          transition: 'transform 0.45s ease',
                          transform: separating ? `translate(-${sep}px, 0)` : undefined,
                        }}
                      >
                        <rect
                          x={p1L_x}
                          y={p1L_y}
                          width={p1L_w}
                          height={p1L_h}
                          fill="var(--accent-soft)"
                          stroke="var(--accent-strong)"
                          strokeWidth={2}
                        />
                        {labelInside(p1L_w, p1L_h) ? (
                          <text
                            x={p1L_x + p1L_w / 2}
                            y={p1L_y + p1L_h / 2 + 4}
                            textAnchor="middle"
                            fontSize={11}
                            fontWeight={600}
                            fill="currentColor"
                          >
                            pieza 1
                          </text>
                        ) : null}
                        <title>{`Pieza 1: a×(a−b) = ${p1L}`}</title>
                      </g>

                      {/* Piece 2: top-right b×(a−b) */}
                      <g
                        style={{
                          transition: 'transform 0.45s ease',
                          transform: separating
                            ? `translate(${sep}px, -${sep / 2}px)`
                            : undefined,
                        }}
                      >
                        <rect
                          x={p2L_x}
                          y={p2L_y}
                          width={p2L_w}
                          height={p2L_h}
                          fill="color-mix(in oklab, teal 32%, transparent)"
                          stroke="teal"
                          strokeWidth={2}
                        />
                        {labelInside(p2L_w, p2L_h) ? (
                          <text
                            x={p2L_x + p2L_w / 2}
                            y={p2L_y + p2L_h / 2 + 4}
                            textAnchor="middle"
                            fontSize={11}
                            fontWeight={600}
                            fill="currentColor"
                          >
                            pieza 2
                          </text>
                        ) : null}
                        <title>{`Pieza 2: b×(a−b) = ${p2L}`}</title>
                      </g>
                    </>
                  ) : null}

                  {/* L highlight when removed but not yet split */}
                  {showRemoved && !showSplit && !degenerate ? (
                    <text
                      x={x0 + remPx / 2}
                      y={y0 + remPx / 2 + 4}
                      textAnchor="middle"
                      fontSize={13}
                      fontWeight={600}
                      fill="currentColor"
                    >
                      L = a²−b²
                    </text>
                  ) : null}
                </>
              ) : (
                <>
                  {/* Reordered rectangle — same two pieces */}
                  {!degenerate ? (
                    <>
                      <text
                        x={rectX + fw / 2}
                        y={rectY - 12}
                        textAnchor="middle"
                        fontSize={12}
                        fill="currentColor"
                      >
                        a−b={remL}
                      </text>
                      <text
                        x={rectX - 16}
                        y={rectY + fh / 2 + 4}
                        textAnchor="middle"
                        fontSize={12}
                        fill="currentColor"
                        transform={`rotate(-90 ${rectX - 16} ${rectY + fh / 2})`}
                      >
                        a+b={sumL}
                      </text>

                      {/* Piece 1 on top: still a×(a−b) as rem × a */}
                      <rect
                        x={p1R_x}
                        y={p1R_y}
                        width={p1R_w}
                        height={p1R_h}
                        fill="var(--accent-soft)"
                        stroke="var(--accent-strong)"
                        strokeWidth={2}
                      />
                      {labelInside(p1R_w, p1R_h) ? (
                        <text
                          x={p1R_x + p1R_w / 2}
                          y={p1R_y + p1R_h / 2 + 4}
                          textAnchor="middle"
                          fontSize={11}
                          fontWeight={600}
                          fill="currentColor"
                        >
                          pieza 1
                        </text>
                      ) : null}
                      <title>{`Pieza 1 (misma): a×(a−b) = ${p1L}`}</title>

                      {/* Piece 2 below: rotated to rem × b */}
                      <rect
                        x={p2R_x}
                        y={p2R_y}
                        width={p2R_w}
                        height={p2R_h}
                        fill="color-mix(in oklab, teal 32%, transparent)"
                        stroke="teal"
                        strokeWidth={2}
                      />
                      {labelInside(p2R_w, p2R_h) ? (
                        <text
                          x={p2R_x + p2R_w / 2}
                          y={p2R_y + p2R_h / 2 + 4}
                          textAnchor="middle"
                          fontSize={11}
                          fontWeight={600}
                          fill="currentColor"
                        >
                          pieza 2
                        </text>
                      ) : null}
                      <title>{`Pieza 2 (misma, rotada): b×(a−b) = ${p2L}`}</title>

                      <text
                        x={rectX + fw / 2}
                        y={rectY + fh + 20}
                        textAnchor="middle"
                        fontSize={12}
                        fill="currentColor"
                      >
                        rectángulo (a−b)(a+b) = {factL}
                      </text>
                    </>
                  ) : null}
                </>
              )}
            </svg>
          </div>

          {showRemoved ? (
            <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
              <li className="font-mono">área grande a² = {a2L}</li>
              <li className="font-mono">área retirada b² = {b2L}</li>
              <li className="font-mono sm:col-span-2">
                área restante a²−b² = {a2L}−{b2L} = {diffL}
              </li>
              {showSplit && !degenerate ? (
                <>
                  <li className="font-mono">
                    pieza 1: a(a−b) = {aL}·{remL} = {p1L}
                  </li>
                  <li className="font-mono">
                    pieza 2: b(a−b) = {bL}·{remL} = {p2L}
                  </li>
                </>
              ) : null}
            </ul>
          ) : null}

          {reordered && !degenerate ? (
            <p className="mt-2 rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,teal_10%,transparent)] px-3 py-2 text-sm leading-relaxed">
              Las piezas son las mismas; solo se han reordenado (la pieza 2 se rota 90°). Por eso el
              área no cambia: <span className="font-mono">a²−b²=(a−b)(a+b)</span>.
            </p>
          ) : null}
        </section>

        <section className="space-y-2 rounded-xl border border-[var(--border)] px-3 py-3 text-sm leading-relaxed">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            De la L al factor común
          </p>
          <p>
            1. Cuadrado original: <span className="font-mono">A=a²={a2L}</span>
          </p>
          <p>
            2. Retirar el cuadrado pequeño:{' '}
            <span className="font-mono">
              A=a²−b²={diffL}
            </span>
          </p>
          <p>
            3. Dividir el área restante:{' '}
            <span className="font-mono">
              A=a(a−b)+b(a−b)={p1L}+{p2L}
            </span>
          </p>
          <p>
            4. Extraer el factor común{' '}
            <span className="font-mono">a−b</span>:{' '}
            <span className="font-mono">
              A=(a−b)(a+b)={remL}·{sumL}={factL}
            </span>
          </p>
          <p>
            5. Identidad:{' '}
            <span className="font-mono font-semibold">a²−b²=(a−b)(a+b)</span>
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Ejemplo actual
          </p>
          <p className="mt-2 font-mono text-sm leading-relaxed sm:text-base">
            {aL}²−{bL}² = {a2L}−{b2L} = {diffL}
          </p>
          <p className="mt-1 font-mono text-sm leading-relaxed sm:text-base">
            ({aL}−{bL})({aL}+{bL}) = ({remL})({sumL}) = {factL}
          </p>
          <p className="mt-1 font-mono text-sm font-semibold leading-relaxed sm:text-base">
            {aL}²−{bL}² = ({aL}−{bL})({aL}+{bL}) = {diffL}
          </p>
        </section>

        <div
          id={statusId}
          className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_70%,var(--bg-elevated))] px-3 py-2 text-sm leading-relaxed"
          aria-live="polite"
        >
          <p className="font-mono">
            {aL}²−{bL}² = ({remL})({sumL}) = {diffL}
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
            ariaLabel={`Lado b del cuadrado retirado, actualmente ${bL}. Debe ser menor o igual que a.`}
            value={bb}
            min={0}
            max={a}
            step={0.1}
            onChange={(val) => setB(snap(val, 0, a, 0.1))}
          />
        </ControlsStack>
        <p className="text-xs text-[var(--fg-muted)]">
          La identidad algebraica es válida para números reales; esta representación geométrica usa
          a≥b≥0 (longitudes).
        </p>
      </div>
    </VizPanel>
  );
}
