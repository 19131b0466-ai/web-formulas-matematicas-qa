'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from './controls';

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

/**
 * Common factor: ab+ac → a(b+c) (ALG-FAC-001).
 * Two rectangles of equal height a join into one of width b+c.
 */
export function CommonFactorViz() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(2.7);
  const [c, setC] = useState(3.2);
  const [factored, setFactored] = useState(false);
  const guideId = useId();
  const statusId = useId();

  const ab = a * b;
  const ac = a * c;
  const sum = ab + ac;
  const width = b + c;
  const factoredArea = a * width;

  const aL = present(a);
  const bL = present(b);
  const cL = present(c);
  const abL = present(ab);
  const acL = present(ac);
  const sumL = present(sum);
  const widthL = present(width);

  // SVG layout — fixed height for a; widths proportional to b, c
  const padL = 48;
  const padT = 36;
  const padB = 56;
  const maxH = 120;
  const maxTotalW = 280;
  const gap = factored ? 0 : 28;

  const denom = Math.max(width, ZERO_EPS);
  const s = Math.min(
    a > ZERO_EPS ? maxH / a : maxH,
    denom > ZERO_EPS ? maxTotalW / denom : maxTotalW,
    36,
  );

  const ah = a * s;
  const bw = b * s;
  const cw = c * s;
  const totalW = bw + cw;
  const x0 = padL;
  const y0 = padT;
  const svgW = padL + totalW + gap + 40;
  const svgH = padT + ah + padB;

  const labelInside = (w: number, h: number) => w >= 28 && h >= 22;

  const ariaStatus = useMemo(() => {
    if (factored) {
      return `Los dos rectángulos están unidos. Forman un rectángulo de altura a igual a ${aL} y ancho b más c igual a ${widthL}. Área a por b más c igual a ${sumL}.`;
    }
    return `Hay dos rectángulos de la misma altura a igual a ${aL}. El primero tiene ancho b igual a ${bL} y área ab igual a ${abL}; el segundo tiene ancho c igual a ${cL} y área ac igual a ${acL}. Al unirlos forman un rectángulo de altura a y ancho b más c.`;
  }, [factored, aL, bL, cL, abL, acL, widthL, sumL]);

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Los términos ab y ac comparten el factor a. Geométricamente, ambos rectángulos tienen el
            mismo lado a.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Al unirlos, ese lado no cambia y los anchos b y c se suman. El nuevo rectángulo mide a
            por b+c. Factorizar es la inversa de aplicar la distributiva.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Forma principal
          </p>
          <p className="mt-2 font-mono text-lg font-semibold">
            {factored ? (
              <>
                a(b+c){' '}
                <span className="text-[var(--fg-muted)] font-normal text-base">← factorizado</span>
              </>
            ) : (
              <>
                <span className="underline decoration-2 decoration-[var(--accent-strong)]">a</span>b+
                <span className="underline decoration-2 decoration-[var(--accent-strong)]">a</span>c{' '}
                <span className="text-[var(--fg-muted)] font-normal text-base">
                  · factor común: a
                </span>
              </>
            )}
          </p>
          <p className="mt-1 font-mono text-sm text-[var(--fg-muted)]">
            ab+ac ⇄ a(b+c)
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
              Demostración geométrica
            </p>
            <ButtonRow>
              <VizButton onClick={() => setFactored(true)} active={factored}>
                Factorizar
              </VizButton>
              <VizButton onClick={() => setFactored(false)} active={!factored}>
                Distribuir
              </VizButton>
            </ButtonRow>
          </div>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            {factored
              ? 'Piezas unidas: misma altura a, anchos b y c adyacentes → ancho total b+c.'
              : 'Dos rectángulos separados con la misma altura a (el factor común).'}
          </p>

          <div className="mt-3 overflow-x-auto">
            <svg
              viewBox={`0 0 ${Math.max(svgW, 320)} ${svgH}`}
              className="mx-auto h-auto w-full max-w-lg"
              role="img"
              aria-labelledby={statusId}
            >
              {/* Height label a */}
              {!isZero(a) ? (
                <text
                  x={x0 - 14}
                  y={y0 + ah / 2 + 4}
                  textAnchor="middle"
                  fontSize={12}
                  fill="currentColor"
                  fontWeight={600}
                  transform={`rotate(-90 ${x0 - 14} ${y0 + ah / 2})`}
                >
                  a={aL}
                </text>
              ) : null}

              {!factored ? (
                <>
                  {/* Separate rectangles */}
                  {!isZero(b) && !isZero(a) ? (
                    <g>
                      <text
                        x={x0 + bw / 2}
                        y={y0 - 10}
                        textAnchor="middle"
                        fontSize={12}
                        fill="currentColor"
                      >
                        b={bL}
                      </text>
                      <rect
                        x={x0}
                        y={y0}
                        width={Math.max(bw, 0)}
                        height={ah}
                        fill="var(--accent-soft)"
                        stroke="var(--accent-strong)"
                        strokeWidth={2}
                      />
                      {labelInside(bw, ah) ? (
                        <text
                          x={x0 + bw / 2}
                          y={y0 + ah / 2 + 4}
                          textAnchor="middle"
                          fontSize={12}
                          fontWeight={600}
                          fill="currentColor"
                        >
                          ab
                        </text>
                      ) : (
                        <text x={x0 + bw / 2} y={y0 + ah + 16} textAnchor="middle" fontSize={11} fill="currentColor">
                          ab
                        </text>
                      )}
                      <title>{`Rectángulo a×b: área ab = ${abL}`}</title>
                    </g>
                  ) : null}

                  {!isZero(c) && !isZero(a) ? (
                    <g>
                      <text
                        x={x0 + bw + gap + cw / 2}
                        y={y0 - 10}
                        textAnchor="middle"
                        fontSize={12}
                        fill="currentColor"
                      >
                        c={cL}
                      </text>
                      <rect
                        x={x0 + bw + gap}
                        y={y0}
                        width={Math.max(cw, 0)}
                        height={ah}
                        fill="color-mix(in oklab, teal 28%, transparent)"
                        stroke="teal"
                        strokeWidth={2}
                      />
                      {labelInside(cw, ah) ? (
                        <text
                          x={x0 + bw + gap + cw / 2}
                          y={y0 + ah / 2 + 4}
                          textAnchor="middle"
                          fontSize={12}
                          fontWeight={600}
                          fill="currentColor"
                        >
                          ac
                        </text>
                      ) : (
                        <text
                          x={x0 + bw + gap + cw / 2}
                          y={y0 + ah + 16}
                          textAnchor="middle"
                          fontSize={11}
                          fill="currentColor"
                        >
                          ac
                        </text>
                      )}
                      <title>{`Rectángulo a×c: área ac = ${acL}`}</title>
                    </g>
                  ) : null}

                  <text
                    x={x0 + (bw + gap + cw) / 2}
                    y={y0 + ah + 34}
                    textAnchor="middle"
                    fontSize={12}
                    fill="currentColor"
                  >
                    misma altura a · factor común
                  </text>
                </>
              ) : (
                <>
                  {/* Joined rectangle with internal border */}
                  <text
                    x={x0 + totalW / 2}
                    y={y0 - 10}
                    textAnchor="middle"
                    fontSize={12}
                    fill="currentColor"
                  >
                    b+c = {widthL}
                  </text>
                  {!isZero(b) && !isZero(a) ? (
                    <g>
                      <rect
                        x={x0}
                        y={y0}
                        width={Math.max(bw, 0)}
                        height={ah}
                        fill="var(--accent-soft)"
                        stroke="var(--accent-strong)"
                        strokeWidth={2}
                      />
                      {labelInside(bw, ah) ? (
                        <text
                          x={x0 + bw / 2}
                          y={y0 + ah / 2 + 4}
                          textAnchor="middle"
                          fontSize={12}
                          fontWeight={600}
                          fill="currentColor"
                        >
                          ab
                        </text>
                      ) : null}
                      <title>{`Pieza ab = ${abL}`}</title>
                    </g>
                  ) : null}
                  {!isZero(c) && !isZero(a) ? (
                    <g>
                      <rect
                        x={x0 + bw}
                        y={y0}
                        width={Math.max(cw, 0)}
                        height={ah}
                        fill="color-mix(in oklab, teal 28%, transparent)"
                        stroke="teal"
                        strokeWidth={2}
                      />
                      {labelInside(cw, ah) ? (
                        <text
                          x={x0 + bw + cw / 2}
                          y={y0 + ah / 2 + 4}
                          textAnchor="middle"
                          fontSize={12}
                          fontWeight={600}
                          fill="currentColor"
                        >
                          ac
                        </text>
                      ) : null}
                      <title>{`Pieza ac = ${acL}`}</title>
                    </g>
                  ) : null}

                  {/* Width brackets */}
                  {!isZero(b) ? (
                    <text
                      x={x0 + bw / 2}
                      y={y0 + ah + 18}
                      textAnchor="middle"
                      fontSize={11}
                      fill="currentColor"
                    >
                      b={bL}
                    </text>
                  ) : null}
                  {!isZero(c) ? (
                    <text
                      x={x0 + bw + cw / 2}
                      y={y0 + ah + 18}
                      textAnchor="middle"
                      fontSize={11}
                      fill="currentColor"
                    >
                      c={cL}
                    </text>
                  ) : null}
                  <text
                    x={x0 + totalW / 2}
                    y={y0 + ah + 36}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={600}
                    fill="currentColor"
                  >
                    ← b →← c → = b+c
                  </text>
                </>
              )}

              {isZero(a) ? (
                <text x={x0 + 40} y={y0 + 40} fontSize={13} fill="currentColor">
                  a=0 → todas las áreas son 0
                </text>
              ) : null}
            </svg>
          </div>

          <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
            <li className="font-mono">
              ab = {aL}·{bL} = {abL}
            </li>
            <li className="font-mono">
              ac = {aL}·{cL} = {acL}
            </li>
            <li className="font-mono sm:col-span-2">
              ab+ac = {abL}+{acL} = {sumL}
            </li>
            <li className="font-mono sm:col-span-2">
              a(b+c) = {aL}({widthL}) = {present(factoredArea)}
            </li>
          </ul>

          {factored ? (
            <p className="mt-2 rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--accent-soft)_50%,transparent)] px-3 py-2 text-sm leading-relaxed">
              No hemos añadido ni eliminado área. Solo hemos unido las dos regiones que comparten el
              lado a. Por eso ab+ac = a(b+c).
            </p>
          ) : null}
        </section>

        <section className="space-y-2 rounded-xl border border-[var(--border)] px-3 py-3 text-sm leading-relaxed">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Paso a paso algebraico
          </p>
          <p className="font-mono">
            ab+ac ={' '}
            <span className="underline decoration-2 decoration-[var(--accent-strong)]">a</span>·b+
            <span className="underline decoration-2 decoration-[var(--accent-strong)]">a</span>·c
          </p>
          <p className="font-mono">
            ={' '}
            <span className="font-semibold underline decoration-2 decoration-[var(--accent-strong)]">
              a
            </span>
            (b+c)
          </p>
          <p className="text-[var(--fg-muted)]">
            Los dos factores a se extraen como un único factor común externo.
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Ejemplo actual
          </p>
          <p className="mt-2 overflow-x-auto font-mono text-sm leading-relaxed sm:text-base">
            {aL}({bL})+{aL}({cL}) = {abL}+{acL} = {sumL}
          </p>
          <p className="mt-1 overflow-x-auto font-mono text-sm leading-relaxed sm:text-base">
            {aL}({bL}+{cL}) = {aL}({widthL}) = {present(factoredArea)}
          </p>
          <p className="mt-1 font-mono text-sm font-semibold">
            {aL}({bL})+{aL}({cL}) = {aL}({bL}+{cL})
          </p>
          {isZero(b) ? (
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Caso b=0: ab=0 y ab+ac=ac = a(0+c).
            </p>
          ) : null}
          {isZero(c) ? (
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Caso c=0: ac=0 y ab+ac=ab = a(b+0).
            </p>
          ) : null}
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 text-sm text-[var(--fg-muted)]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em]">Generalización</p>
          <p className="mt-2">
            El mismo principio funciona con expresiones más complejas. Ejemplo:{' '}
            <span className="font-mono text-[var(--fg)]">6x²+9x = 3x(2x+3)</span>, donde{' '}
            <span className="font-mono text-[var(--fg)]">3x</span> es el factor común de ambos
            términos.
          </p>
        </section>

        <div
          id={statusId}
          className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_70%,var(--bg-elevated))] px-3 py-2 text-sm leading-relaxed"
          aria-live="polite"
        >
          <p className="font-mono">
            {factored
              ? `a(b+c) = ${aL}(${widthL}) = ${sumL}`
              : `ab+ac = ${abL}+${acL} = ${sumL}`}
          </p>
        </div>

        <p className="sr-only">{ariaStatus}</p>

        <ControlsStack>
          <SliderRow
            label="a"
            ariaLabel={`Altura común a, actualmente ${aL}`}
            value={a}
            min={0}
            max={5}
            step={0.1}
            onChange={(val) => setA(snap(val, 0, 5, 0.1))}
          />
          <SliderRow
            label="b"
            ariaLabel={`Ancho b, actualmente ${bL}`}
            value={b}
            min={0}
            max={5}
            step={0.1}
            onChange={(val) => setB(snap(val, 0, 5, 0.1))}
          />
          <SliderRow
            label="c"
            ariaLabel={`Ancho c, actualmente ${cL}`}
            value={c}
            min={0}
            max={5}
            step={0.1}
            onChange={(val) => setC(snap(val, 0, 5, 0.1))}
          />
        </ControlsStack>
        <p className="text-xs text-[var(--fg-muted)]">
          La identidad es válida algebraicamente para números reales; esta visualización utiliza
          valores no negativos porque representan longitudes.
        </p>
      </div>
    </VizPanel>
  );
}
