'use client';

import { useId, useMemo, useState, type ReactNode } from 'react';
import { ControlsStack, SliderRow, VizPanel, fmt } from './controls';

const A_MIN = 0.5;
const A_MAX = 6;
const B_MIN = 0;
const B_MAX = 12;
const ZERO_EPS = 1e-9;

function snap(val: number, min: number, max: number, step: number): number {
  const clamped = Math.min(max, Math.max(min, val));
  const steps = Math.round((clamped - min) / step);
  const snapped = min + steps * step;
  if (Math.abs(snapped) < step / 2) return 0;
  return Number(snapped.toFixed(1));
}

function SqrtB({ b, approx }: { b: number; approx?: boolean }) {
  const exact = (
    <span className="font-mono">
      √{fmt(b)}
    </span>
  );
  if (!approx) return exact;
  return (
    <span className="font-mono">
      √{fmt(b)}
      <span className="text-[var(--fg-muted)]"> ≈ {fmt(Math.sqrt(b), 2)}</span>
    </span>
  );
}

function Binomial({ a, b, sign }: { a: number; b: number; sign: '+' | '−' }) {
  return (
    <span className="font-mono whitespace-nowrap">
      {fmt(a)}
      {sign}
      <SqrtB b={b} />
    </span>
  );
}

function Fraction({
  num,
  den,
  label,
}: {
  num: ReactNode;
  den: ReactNode;
  label?: string;
}) {
  return (
    <span className="inline-flex flex-col items-center px-1 align-middle" aria-label={label}>
      <span className="px-1 text-center font-mono leading-tight">{num}</span>
      <span className="my-0.5 h-px w-full min-w-[2.5rem] bg-[var(--fg)]" aria-hidden />
      <span className="px-1 text-center font-mono leading-tight">{den}</span>
    </span>
  );
}

/**
 * Rationalize 1/(a+√b) by multiplying by the conjugate (ALG-POT-008).
 * Focus: process (× conjugate/conjugate = 1), not only the identity.
 */
export function ConjugateRationalizeViz() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(5);
  const [showExpand, setShowExpand] = useState(false);
  const guideId = useId();
  const statusId = useId();

  const sqrtB = Math.sqrt(Math.max(0, b));
  const denomExact = a * a - b;
  const invalid = Math.abs(denomExact) < ZERO_EPS || Math.abs(a - sqrtB) < ZERO_EPS;

  const aLabel = fmt(a);
  const bLabel = fmt(b);
  const denomLabel = fmt(denomExact);

  const ariaStatus = useMemo(() => {
    if (invalid) {
      return `Caso no válido: a es ${aLabel} y b es ${bLabel}, porque el conjugado es cero y el denominador final sería 0.`;
    }
    return `Se está racionalizando 1 entre ${aLabel} más raíz de ${bLabel} multiplicando por ${aLabel} menos raíz de ${bLabel} sobre sí mismo. El resultado es ${aLabel} menos raíz de ${bLabel} sobre ${denomLabel}.`;
  }, [invalid, aLabel, bLabel, denomLabel]);

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Para eliminar la raíz del denominador, multiplicamos numerador y denominador por el
            conjugado del denominador.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            El conjugado de <span className="font-mono">a+√b</span> es{' '}
            <span className="font-mono">a−√b</span>. Multiplicar por{' '}
            <span className="font-mono">(a−√b)/(a−√b)</span> no cambia el valor porque esa fracción
            vale 1.
          </p>
        </div>

        {/* Stage 1 */}
        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            1. Expresión original
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Fraction
              label={`1 entre ${aLabel} más raíz de ${bLabel}`}
              num={1}
              den={<Binomial a={a} b={b} sign="+" />}
            />
            <span className="text-sm text-[var(--fg-muted)]">
              denominador con radical:{' '}
              <span className="font-mono">
                a+√b = {aLabel}+√{bLabel}
                <span className="text-[var(--fg-muted)]"> ≈ {fmt(a + sqrtB, 2)}</span>
              </span>
            </span>
          </div>
        </section>

        <p className="text-center text-sm text-[var(--fg-muted)]" aria-hidden>
          ↓ multiplicar por conjugado / conjugado (= 1) ↓
        </p>

        {/* Stage 2 */}
        <section className="rounded-xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_65%,var(--bg-elevated))] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            2. Multiplicación por el conjugado
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-lg">
            <Fraction num={1} den={<Binomial a={a} b={b} sign="+" />} />
            <span className="font-mono px-1">·</span>
            <Fraction
              label="conjugado sobre conjugado"
              num={<Binomial a={a} b={b} sign="−" />}
              den={<Binomial a={a} b={b} sign="−" />}
            />
          </div>
          <p className="mt-2 text-sm text-[var(--fg-muted)]">
            Conjugado:{' '}
            <span className="font-mono">
              a−√b = {aLabel}−√{bLabel}
              <span className="text-[var(--fg-muted)]"> ≈ {fmt(a - sqrtB, 2)}</span>
            </span>
            . Como{' '}
            <span className="font-mono">
              (a−√b)/(a−√b)=1
            </span>{' '}
            (si a−√b ≠ 0), el valor de la fracción no cambia; solo su forma.
          </p>
        </section>

        <p className="text-center text-sm text-[var(--fg-muted)]" aria-hidden>
          ↓ resultado racionalizado ↓
        </p>

        {/* Stage 3 */}
        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            3. Resultado racionalizado
          </p>

          {invalid ? (
            <p className="mt-3 rounded-lg border border-[var(--danger)] bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] px-3 py-2 text-sm text-[var(--fg)]">
              Este caso no es válido para esta racionalización porque el conjugado es cero y el
              denominador final sería 0 (a²−b = 0).
            </p>
          ) : (
            <>
              <div className="mt-3 flex flex-wrap items-center gap-2 overflow-x-auto text-base leading-relaxed">
                <Fraction
                  num={
                    <span className="font-mono">
                      1·(<Binomial a={a} b={b} sign="−" />)
                    </span>
                  }
                  den={
                    <span className="font-mono">
                      (<Binomial a={a} b={b} sign="+" />)(<Binomial a={a} b={b} sign="−" />)
                    </span>
                  }
                />
                <span className="font-mono">=</span>
                <Fraction
                  num={<Binomial a={a} b={b} sign="−" />}
                  den={<span className="font-mono">a²−b</span>}
                />
                <span className="font-mono">=</span>
                <Fraction
                  num={<Binomial a={a} b={b} sign="−" />}
                  den={<span className="font-mono font-semibold">{denomLabel}</span>}
                />
              </div>
              <p className="mt-2 text-sm">
                Denominador racionalizado:{' '}
                <span className="font-mono font-semibold">{denomLabel}</span>
                <span className="text-[var(--fg-muted)]"> (sin raíz)</span>
              </p>
            </>
          )}
        </section>

        {/* Why identity panel */}
        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 text-left text-sm font-semibold text-[var(--fg)]"
            aria-expanded={showExpand}
            onClick={() => setShowExpand((s) => !s)}
          >
            <span>¿Por qué (a+√b)(a−√b) = a²−b?</span>
            <span className="text-[var(--fg-muted)]">{showExpand ? '−' : '+'}</span>
          </button>
          {showExpand ? (
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--fg-muted)]">
              <p>
                La identidad de conjugados es la herramienta que hace posible la racionalización:
              </p>
              <p className="font-mono text-[var(--fg)]">
                (a+√b)(a−√b) = a² − a√b + a√b − b
              </p>
              <p>
                Se cancelan{' '}
                <span className="font-mono line-through decoration-[var(--danger)]">−a√b</span> y{' '}
                <span className="font-mono line-through decoration-[var(--danger)]">+a√b</span>:
              </p>
              <p className="font-mono text-[var(--fg)]">
                = a² − b = {aLabel}² − {bLabel} = {denomLabel}
              </p>
              <p>
                Al multiplicarlos, los términos con raíz se cancelan y el denominador se convierte
                en a²−b, que ya es racional.
              </p>
            </div>
          ) : null}
        </section>

        {/* Readable summary */}
        <div
          id={statusId}
          className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_70%,var(--bg-elevated))] px-3 py-2 text-sm leading-relaxed"
          aria-live="polite"
        >
          {invalid ? (
            <p className="font-mono">a² − b = 0 → caso no válido</p>
          ) : (
            <p className="font-mono">
              1/({aLabel}+√{bLabel}) · ({aLabel}−√{bLabel})/({aLabel}−√{bLabel}) = ({aLabel}−√
              {bLabel})/{denomLabel}
            </p>
          )}
        </div>

        <p className="sr-only">{ariaStatus}</p>

        <ControlsStack>
          <SliderRow
            label="a"
            ariaLabel={`Valor de a, actualmente ${aLabel}`}
            value={a}
            min={A_MIN}
            max={A_MAX}
            step={0.1}
            onChange={(val) => setA(snap(val, A_MIN, A_MAX, 0.1))}
          />
          <SliderRow
            label="b"
            ariaLabel={`Valor de b bajo la raíz, actualmente ${bLabel}`}
            value={b}
            min={B_MIN}
            max={B_MAX}
            step={0.1}
            onChange={(val) => setB(snap(val, B_MIN, B_MAX, 0.1))}
          />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
