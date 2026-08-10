'use client';

import { useId, useMemo, useState } from 'react';
import { ControlsStack, SliderRow, ToggleRow, VizPanel, fmt } from './controls';

const N_MIN = 0;
const N_MAX = 6;
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

function factorial(m: number): number {
  let r = 1;
  for (let i = 2; i <= m; i++) r *= i;
  return r;
}

function binom(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  return Math.round(factorial(n) / (factorial(k) * factorial(n - k)));
}

/** Build Pascal triangle rows 0..maxN */
function pascalTriangle(maxN: number): number[][] {
  const rows: number[][] = [];
  for (let r = 0; r <= maxN; r++) {
    rows.push(Array.from({ length: r + 1 }, (_, k) => binom(r, k)));
  }
  return rows;
}

/** Format coefficient·a^{p}b^{q} simplified (omit ^0, omit ^1, omit coef 1 when variables remain). */
function formatTerm(coef: number, expA: number, expB: number): string {
  if (coef === 0) return '0';
  const parts: string[] = [];
  const hasVar = expA > 0 || expB > 0;
  if (coef !== 1 || !hasVar) {
    parts.push(String(coef));
  }
  if (expA > 0) parts.push(expA === 1 ? 'a' : `a${toSup(expA)}`);
  if (expB > 0) parts.push(expB === 1 ? 'b' : `b${toSup(expB)}`);
  return parts.join('') || '1';
}

function toSup(n: number): string {
  const map: Record<string, string> = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
  };
  return String(n)
    .split('')
    .map((c) => map[c] ?? c)
    .join('');
}

function formatRawTerm(coef: number, expA: number, expB: number): string {
  return `${coef}a${toSup(expA)}b${toSup(expB)}`;
}

function pow(base: number, exp: number): number {
  return base ** exp;
}

/**
 * Binomial theorem: (a+b)^n = Σ C(n,k) a^{n-k} b^k (ALG-IDN-008).
 * Pascal row ↔ term cards ↔ full expansion.
 */
export function BinomialTheoremViz() {
  const [n, setN] = useState(5);
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);
  const [selectedK, setSelectedK] = useState<number | null>(2);
  const [showNumeric, setShowNumeric] = useState(true);
  const [showCombinatorial, setShowCombinatorial] = useState(false);
  const guideId = useId();
  const statusId = useId();

  const nn = Math.max(N_MIN, Math.min(N_MAX, Math.round(n)));
  const triangle = useMemo(() => pascalTriangle(N_MAX), []);
  const coeffs = useMemo(() => Array.from({ length: nn + 1 }, (_, k) => binom(nn, k)), [nn]);

  const terms = useMemo(
    () =>
      coeffs.map((coef, k) => ({
        k,
        coef,
        expA: nn - k,
        expB: k,
        simplified: formatTerm(coef, nn - k, k),
        raw: formatRawTerm(coef, nn - k, k),
      })),
    [coeffs, nn],
  );

  const expansionPretty = terms
    .map((t, i) => (i === 0 ? t.simplified : `+${t.simplified}`))
    .join('');

  const numericTerms = useMemo(() => {
    return terms.map((t) => {
      const val = t.coef * pow(a, t.expA) * pow(b, t.expB);
      return { ...t, val };
    });
  }, [terms, a, b]);

  const numericSum = numericTerms.reduce((s, t) => s + t.val, 0);
  const direct = pow(a + b, nn);

  const sel = selectedK !== null && selectedK <= nn ? selectedK : null;
  const selTerm = sel !== null ? terms[sel] : null;

  const aL = present(a);
  const bL = present(b);

  const ariaStatus = useMemo(() => {
    const parts = terms.map(
      (t) =>
        `Para k=${t.k}, el coeficiente es ${t.coef}, el exponente de a es ${t.expA} y el de b es ${t.expB}. El término es ${t.simplified}.`,
    );
    return [`Expansión de a más b elevado a ${nn}.`, ...parts, `Suma: ${expansionPretty}.`].join(' ');
  }, [terms, nn, expansionPretty]);

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Cada término tiene tres partes: un coeficiente binomial, una potencia de a y una potencia
            de b.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Los coeficientes aparecen en la fila n del triángulo de Pascal. El exponente de a baja de
            n a 0, mientras el de b sube de 0 a n. En cada término, los exponentes suman n.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Fórmula general
          </p>
          <p className="mt-2 font-mono text-base font-semibold leading-relaxed sm:text-lg">
            (a+b)<sup>{nn}</sup> = Σ<sub>k=0</sub>
            <sup>{nn}</sup> C({nn},k)·a<sup>n−k</sup>b<sup>k</sup>
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Secuencia: elegir n → coeficientes C(n,k) → exponentes a<sup>n−k</sup>b<sup>k</sup> →
            formar cada término → sumar.
          </p>
        </section>

        {/* Pascal triangle */}
        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Triángulo de Pascal
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Coeficientes para n = {nn} (fila resaltada)
          </p>
          <div className="mt-3 overflow-x-auto">
            <div className="inline-flex min-w-full flex-col items-center gap-1 font-mono text-sm">
              {triangle.map((row, r) => (
                <div
                  key={r}
                  className={`flex flex-wrap justify-center gap-1 rounded-md px-2 py-1 ${
                    r === nn
                      ? 'bg-[var(--accent-soft)] ring-2 ring-[var(--accent-strong)]'
                      : 'opacity-70'
                  }`}
                >
                  <span className="mr-2 w-14 shrink-0 text-right text-xs text-[var(--fg-muted)]">
                    n={r}
                  </span>
                  {row.map((c, k) => (
                    <button
                      key={k}
                      type="button"
                      disabled={r !== nn}
                      onClick={() => r === nn && setSelectedK(k)}
                      className={`min-w-8 rounded px-1.5 py-0.5 tabular-nums ${
                        r === nn && sel === k
                          ? 'bg-[var(--accent-strong)] font-semibold text-[var(--bg)]'
                          : r === nn
                            ? 'hover:bg-[color-mix(in_oklab,var(--accent-soft)_80%,transparent)]'
                            : ''
                      }`}
                      title={
                        r === nn
                          ? `C(${nn},${k}) = ${c}`
                          : r > 0 && k > 0 && k < r
                            ? `C(${r},${k}) = C(${r - 1},${k - 1})+C(${r - 1},${k})`
                            : `C(${r},${k}) = ${c}`
                      }
                    >
                      {c}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
          {selTerm && sel !== null && sel > 0 && sel < nn ? (
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Recurrencia:{' '}
              <span className="font-mono">
                C({nn},{sel}) = C({nn - 1},{sel - 1})+C({nn - 1},{sel}) ={' '}
                {binom(nn - 1, sel - 1)}+{binom(nn - 1, sel)} = {selTerm.coef}
              </span>
            </p>
          ) : null}
        </section>

        {/* Exponent pattern */}
        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Patrón de exponentes
          </p>
          <div className="mt-2 overflow-x-auto font-mono text-sm">
            <p>
              exp(a):{' '}
              {terms.map((t, i) => (
                <span key={`ea-${t.k}`}>
                  {i > 0 ? ' → ' : ''}
                  <span className="font-semibold">{t.expA}</span>
                </span>
              ))}{' '}
              <span className="text-[var(--fg-muted)]">(baja de {nn} a 0)</span>
            </p>
            <p className="mt-1">
              exp(b):{' '}
              {terms.map((t, i) => (
                <span key={`eb-${t.k}`}>
                  {i > 0 ? ' → ' : ''}
                  <span className="font-semibold">{t.expB}</span>
                </span>
              ))}{' '}
              <span className="text-[var(--fg-muted)]">(sube de 0 a {nn})</span>
            </p>
            <p className="mt-1 text-[var(--fg-muted)]">
              En cada término: (n−k)+k = n · grado total = {nn}
            </p>
          </div>
        </section>

        {/* Term cards */}
        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Términos T<sub>k</sub> = C({nn},k)·a<sup>{nn}−k</sup>b<sup>k</sup>
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Hay exactamente {nn + 1} términos (k = 0…{nn}). Pulsa una tarjeta para ver detalles.
          </p>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {terms.map((t) => {
              const active = sel === t.k;
              return (
                <button
                  key={t.k}
                  type="button"
                  onClick={() => setSelectedK(t.k)}
                  aria-label={`Para k=${t.k}, el coeficiente es ${t.coef}, el exponente de a es ${t.expA} y el de b es ${t.expB}. El término es ${t.simplified}.`}
                  className={`min-w-[7.5rem] shrink-0 rounded-xl border px-3 py-2 text-left transition ${
                    active
                      ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)]'
                      : 'border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_70%,var(--bg-elevated))]'
                  }`}
                >
                  <p className="text-xs text-[var(--fg-muted)]">k = {t.k}</p>
                  <p className="font-mono text-sm">
                    C({nn},{t.k}) = <span className="font-semibold">{t.coef}</span>
                  </p>
                  <p className="font-mono text-xs text-[var(--fg-muted)]">
                    a{toSup(t.expA)} · b{toSup(t.expB)}
                  </p>
                  <p className="mt-1 font-mono text-base font-semibold">{t.simplified}</p>
                  <p className="text-[10px] text-[var(--fg-muted)]">
                    {t.expA}+{t.expB}={nn}
                  </p>
                </button>
              );
            })}
          </div>

          {selTerm && sel !== null ? (
            <div className="mt-3 space-y-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
              <p className="font-mono">
                T<sub>{sel}</sub> = C({nn},{sel})·a{toSup(selTerm.expA)}b{toSup(selTerm.expB)} ={' '}
                {selTerm.coef}·a{toSup(selTerm.expA)}b{toSup(selTerm.expB)} ={' '}
                <span className="font-semibold">{selTerm.simplified}</span>
              </p>
              <p className="font-mono text-[var(--fg-muted)]">
                C({nn},{sel}) = {nn}! / ({sel}!·{nn - sel}!) = {factorial(nn)} / (
                {factorial(sel)}·{factorial(nn - sel)}) = {selTerm.coef}
              </p>
              <p className="text-[var(--fg-muted)]">
                El coeficiente {selTerm.coef} y el monomio a{toSup(selTerm.expA)}b
                {toSup(selTerm.expB)} forman un único término: {selTerm.simplified}.
              </p>
            </div>
          ) : null}
        </section>

        {/* Full expansion */}
        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Expansión completa
          </p>
          <p className="mt-2 overflow-x-auto font-mono text-sm text-[var(--fg-muted)]">
            {terms.map((t) => t.raw).join(' + ')}
          </p>
          <p className="mt-2 overflow-x-auto font-mono text-base font-semibold leading-relaxed sm:text-lg">
            (a+b){toSup(nn)} = {expansionPretty || '1'}
          </p>
          <p className="mt-2 overflow-x-auto font-mono text-sm text-[var(--fg-muted)]">
            [{coeffs.join(', ')}] ⇒ {expansionPretty || '1'}
          </p>
        </section>

        {/* Numeric mode */}
        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <ToggleRow
            label="Ejemplo numérico con a y b"
            checked={showNumeric}
            onChange={setShowNumeric}
          />
          {showNumeric ? (
            <div className="mt-3 space-y-2 text-sm leading-relaxed">
              <p className="font-mono">
                ({aL}+{bL}){toSup(nn)} = {present(direct)}
              </p>
              <p className="overflow-x-auto font-mono text-[var(--fg-muted)]">
                {numericTerms
                  .map(
                    (t) =>
                      `${t.coef}·${aL}${toSup(t.expA)}·${bL}${toSup(t.expB)}=${present(t.val)}`,
                  )
                  .join(' + ')}
              </p>
              <p className="font-mono font-semibold">
                {numericTerms.map((t) => present(t.val)).join(' + ')} = {present(numericSum)}
              </p>
              <p className="text-[var(--fg-muted)]">
                Comprobación: ({aL}+{bL}){toSup(nn)} = {present(direct)}
                {Math.abs(numericSum - direct) < ZERO_EPS ? ' ✓' : ''}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Activa el ejemplo numérico para evaluar cada término con los valores de a y b.
            </p>
          )}
        </section>

        {/* Combinatorial (advanced) */}
        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 text-left text-sm font-semibold"
            aria-expanded={showCombinatorial}
            onClick={() => setShowCombinatorial((s) => !s)}
          >
            <span>Interpretación combinatoria</span>
            <span className="text-[var(--fg-muted)]">{showCombinatorial ? '−' : '+'}</span>
          </button>
          {showCombinatorial ? (
            <div className="mt-2 space-y-2 text-sm leading-relaxed text-[var(--fg-muted)]">
              <p>
                C(n,k) cuenta cuántas formas hay de elegir k factores b entre los n factores de
                (a+b){toSup(nn)} = (a+b)(a+b)⋯(a+b).
              </p>
              {nn >= 1 && sel !== null && selTerm ? (
                <p>
                  Para el término con b{toSup(selTerm.expB)} (k={sel}), hay{' '}
                  <span className="font-mono text-[var(--fg)]">C({nn},{sel})={selTerm.coef}</span>{' '}
                  formas distintas de elegir en qué posiciones aparece b.
                  {nn === 3 && sel === 1 ? (
                    <>
                      {' '}
                      Ejemplo n=3, k=1: baa, aba, aab → coeficiente 3.
                    </>
                  ) : null}
                </p>
              ) : (
                <p>
                  Ejemplo n=3, término a²b: aparece como baa, aba y aab; por eso C(3,1)=3.
                </p>
              )}
            </div>
          ) : null}
        </section>

        <div
          id={statusId}
          className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_70%,var(--bg-elevated))] px-3 py-2 text-sm leading-relaxed"
          aria-live="polite"
        >
          <p className="overflow-x-auto font-mono">
            (a+b){toSup(nn)} = {expansionPretty || '1'}
          </p>
        </div>

        <p className="sr-only">{ariaStatus}</p>

        <ControlsStack>
          <SliderRow
            label="n"
            ariaLabel={`Exponente n, actualmente ${nn}`}
            value={nn}
            min={N_MIN}
            max={N_MAX}
            step={1}
            onChange={(val) => {
              const next = Math.round(val);
              setN(next);
              setSelectedK((k) => (k !== null && k > next ? next : k));
            }}
          />
          {showNumeric ? (
            <>
              <SliderRow
                label="a"
                ariaLabel={`Valor de a, actualmente ${aL}`}
                value={a}
                min={0.5}
                max={5}
                step={0.1}
                onChange={(val) => setA(snap(val, 0.5, 5, 0.1))}
              />
              <SliderRow
                label="b"
                ariaLabel={`Valor de b, actualmente ${bL}`}
                value={b}
                min={0.5}
                max={5}
                step={0.1}
                onChange={(val) => setB(snap(val, 0.5, 5, 0.1))}
              />
            </>
          ) : null}
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
