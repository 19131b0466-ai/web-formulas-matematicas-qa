'use client';

import { useId, useMemo, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel, fmt } from './controls';

const ZERO_EPS = 1e-9;

function snap(val: number, min: number, max: number, step: number): number {
  const clamped = Math.min(max, Math.max(min, val));
  const steps = Math.round((clamped - min) / step);
  const snapped = min + steps * step;
  if (Math.abs(snapped) < step / 2) return 0;
  return Number(snapped.toFixed(1));
}

/** Round for display from raw numeric values (avoid float artifacts). */
function present(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '—';
  const rounded = Number(n.toFixed(digits));
  return fmt(rounded, digits);
}

function isZero(n: number): boolean {
  return Math.abs(n) < ZERO_EPS;
}

/** Format a monomial coef·x^power with correct signs when joining. */
function monomial(coef: number, power: 0 | 1 | 2, { leading = false } = {}): string {
  if (isZero(coef)) return '';
  const abs = Math.abs(coef);
  const absStr = present(abs);
  let body: string;
  if (power === 0) {
    body = absStr;
  } else if (power === 1) {
    body = abs === 1 ? 'x' : `${absStr}x`;
  } else {
    body = abs === 1 ? 'x²' : `${absStr}x²`;
  }
  if (leading) {
    return coef < 0 ? `−${body}` : body;
  }
  return coef < 0 ? `−${body}` : `+${body}`;
}

function joinMonomials(terms: Array<{ coef: number; power: 0 | 1 | 2 }>): string {
  const nonzero = terms.filter((t) => !isZero(t.coef));
  if (!nonzero.length) return '0';
  return nonzero.map((t, i) => monomial(t.coef, t.power, { leading: i === 0 })).join('');
}

function termLabel(coef: number, power: 0 | 1 | 2): string {
  if (isZero(coef)) return '0';
  return monomial(coef, power, { leading: true });
}

/** Compact linear polynomial ax+b (omit +0; show ax if b=0). */
function formatLinear(a: number, b: number): string {
  return joinMonomials([
    { coef: a, power: 1 },
    { coef: b, power: 0 },
  ]);
}

function formatQuadratic(ac: number, mid: number, bd: number): string {
  return joinMonomials([
    { coef: ac, power: 2 },
    { coef: mid, power: 1 },
    { coef: bd, power: 0 },
  ]);
}

function xTerm(coef: number, label: string): string {
  if (isZero(coef)) return '0';
  if (Math.abs(coef) === 1) return coef < 0 ? `−${label}` : label;
  return `${present(coef)}${label}`;
}

type CellKey = 'acx2' | 'bcx' | 'adx' | 'bd';

/**
 * Product of linear polynomials (ax+b)(cx+d) = acx²+(ad+bc)x+bd (ALG-EXP-003).
 * Grid of term products → expand → group like terms → simplified polynomial.
 */
export function PolynomialProductViz() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);
  const [c, setC] = useState(1.5);
  const [d, setD] = useState(1.2);
  const [showConv, setShowConv] = useState(false);
  const guideId = useId();
  const statusId = useId();

  const ac = a * c;
  const ad = a * d;
  const bc = b * c;
  const bd = b * d;
  const mid = ad + bc;

  const aL = present(a);
  const bL = present(b);
  const cL = present(c);
  const dL = present(d);

  const pExpr = formatLinear(a, b);
  const qExpr = formatLinear(c, d);
  const expanded = joinMonomials([
    { coef: ac, power: 2 },
    { coef: bc, power: 1 },
    { coef: ad, power: 1 },
    { coef: bd, power: 0 },
  ]);
  const simplified = formatQuadratic(ac, mid, bd);
  const axLabel = xTerm(a, 'x');
  const cxLabel = xTerm(c, 'x');

  const cells: Array<{
    key: CellKey;
    factors: string;
    product: string;
    aria: string;
    tone: string;
  }> = [
    {
      key: 'acx2',
      factors: `(${axLabel})(${cxLabel})`,
      product: termLabel(ac, 2),
      aria: `Fila cx, columna ax: el producto es ${termLabel(ac, 2)}.`,
      tone: 'bg-[color-mix(in_oklab,var(--accent-soft)_85%,transparent)]',
    },
    {
      key: 'bcx',
      factors: `(${bL})(${cxLabel})`,
      product: termLabel(bc, 1),
      aria: `Fila cx, columna b: el producto es ${termLabel(bc, 1)}.`,
      tone: 'bg-[color-mix(in_oklab,teal_16%,transparent)]',
    },
    {
      key: 'adx',
      factors: `(${axLabel})(${dL})`,
      product: termLabel(ad, 1),
      aria: `Fila d, columna ax: el producto es ${termLabel(ad, 1)}.`,
      tone: 'bg-[color-mix(in_oklab,teal_16%,transparent)]',
    },
    {
      key: 'bd',
      factors: `(${bL})(${dL})`,
      product: present(bd),
      aria: `Fila d, columna b: el producto es ${present(bd)}.`,
      tone: 'bg-[color-mix(in_oklab,var(--bg-elevated)_80%,transparent)]',
    },
  ];

  const ariaStatus = useMemo(() => {
    return [
      `Se multiplican P de x igual a ${pExpr} y Q de x igual a ${qExpr}.`,
      'Cada término del primero se multiplica por cada término del segundo.',
      `Los productos parciales son ${termLabel(ac, 2)}, ${termLabel(ad, 1)}, ${termLabel(bc, 1)} y ${present(bd)}.`,
      'Los términos adx y bcx son semejantes y se suman.',
      `El resultado es ${simplified}.`,
    ].join(' ');
  }, [pExpr, qExpr, ac, ad, bc, bd, simplified]);

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Cada término del primer polinomio se multiplica por cada término del segundo. Después
            agrupamos los términos que tienen la misma potencia de x.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Se aplica repetidamente la distributiva{' '}
            <span className="font-mono">u(v+w)=uv+uw</span>. FOIL, si se menciona, es solo un
            mnemónico para dos binomios, no una regla aparte.
          </p>
        </div>

        {/* Original polynomials */}
        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Polinomios
          </p>
          <div className="mt-2 space-y-1 font-mono text-base">
            <p>
              P(x) = ax+b = <span className="font-semibold">{pExpr}</span>
            </p>
            <p>
              Q(x) = cx+d = <span className="font-semibold">{qExpr}</span>
            </p>
            <p className="text-sm text-[var(--fg-muted)]">
              (ax+b)(cx+d) = ({pExpr})({qExpr})
            </p>
          </div>
        </section>

        <p className="text-center text-sm text-[var(--fg-muted)]" aria-hidden>
          ↓ productos parciales (distributiva) ↓
        </p>

        {/* 2×2 grid — fixed cell size, not geometric area */}
        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Cuadrícula de productos
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Columnas: términos de P · Filas: términos de Q
          </p>

          <div className="mt-3 overflow-x-auto">
            <div
              className="mx-auto grid min-w-[18rem] max-w-lg gap-0"
              style={{
                gridTemplateColumns: '3.25rem minmax(0,1fr) minmax(0,1fr)',
                gridTemplateRows: 'auto minmax(4.5rem,auto) minmax(4.5rem,auto)',
              }}
              role="table"
              aria-label="Cuadrícula 2 por 2 de productos de términos"
            >
              <div aria-hidden />
              <div className="px-1 pb-1 text-center font-mono text-sm font-semibold" role="columnheader">
                ax = {axLabel}
              </div>
              <div className="px-1 pb-1 text-center font-mono text-sm font-semibold" role="columnheader">
                b = {bL}
              </div>

              <div
                className="flex items-center justify-end pr-2 font-mono text-sm font-semibold"
                role="rowheader"
              >
                cx = {cxLabel}
              </div>
              {[cells[0], cells[1]].map((cell) => (
                <div
                  key={cell.key}
                  role="cell"
                  aria-label={cell.aria}
                  className={`flex min-h-[4.5rem] flex-col items-center justify-center border border-[var(--border)] px-2 py-2 text-center ${cell.tone}`}
                >
                  <span className="font-mono text-xs text-[var(--fg-muted)]">{cell.factors}</span>
                  <span className="mt-1 font-mono text-sm font-semibold">={cell.product}</span>
                </div>
              ))}

              <div
                className="flex items-center justify-end pr-2 font-mono text-sm font-semibold"
                role="rowheader"
              >
                d = {dL}
              </div>
              {[cells[2], cells[3]].map((cell) => (
                <div
                  key={cell.key}
                  role="cell"
                  aria-label={cell.aria}
                  className={`flex min-h-[4.5rem] flex-col items-center justify-center border border-[var(--border)] px-2 py-2 text-center ${cell.tone}`}
                >
                  <span className="font-mono text-xs text-[var(--fg-muted)]">{cell.factors}</span>
                  <span className="mt-1 font-mono text-sm font-semibold">={cell.product}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <p className="text-center text-sm text-[var(--fg-muted)]" aria-hidden>
          ↓ expansión ↓
        </p>

        {/* Expansion */}
        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Expansión
          </p>
          <p className="mt-2 font-mono text-base leading-relaxed">
            acx² + bcx + adx + bd = <span className="font-semibold">{expanded}</span>
          </p>
        </section>

        <p className="text-center text-sm text-[var(--fg-muted)]" aria-hidden>
          ↓ agrupar términos semejantes ↓
        </p>

        {/* Like terms */}
        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Términos semejantes
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Las dos contribuciones de grado 1, <span className="font-mono">adx</span> y{' '}
            <span className="font-mono">bcx</span>, se combinan en{' '}
            <span className="font-mono">(ad+bc)x</span> porque ambas tienen potencia x¹.
          </p>

          <div className="mt-3 overflow-x-auto">
            <div className="mx-auto grid min-w-[16rem] max-w-lg grid-cols-4 gap-1 text-center font-mono text-sm">
              <div className="rounded-md border border-[var(--border)] px-1 py-2">{termLabel(ac, 2)}</div>
              <div className="rounded-md border border-[var(--border)] bg-[color-mix(in_oklab,teal_16%,transparent)] px-1 py-2">
                {termLabel(bc, 1)}
              </div>
              <div className="rounded-md border border-[var(--border)] bg-[color-mix(in_oklab,teal_16%,transparent)] px-1 py-2">
                {termLabel(ad, 1)}
              </div>
              <div className="rounded-md border border-[var(--border)] px-1 py-2">{present(bd)}</div>
            </div>
            <div
              className="mx-auto mt-1 grid min-w-[16rem] max-w-lg grid-cols-4 gap-1 text-center text-xs text-[var(--fg-muted)]"
              aria-hidden
            >
              <div>│</div>
              <div className="col-span-2">└────┬────┘</div>
              <div>│</div>
            </div>
            <div className="mx-auto mt-1 grid min-w-[16rem] max-w-lg grid-cols-3 gap-2 text-center font-mono text-sm font-semibold">
              <div className="rounded-md border border-[var(--border)] px-1 py-2">{termLabel(ac, 2)}</div>
              <div className="rounded-md border border-[var(--accent-strong)] bg-[var(--accent-soft)] px-1 py-2">
                ({present(bc)}+{present(ad)})x = {termLabel(mid, 1)}
              </div>
              <div className="rounded-md border border-[var(--border)] px-1 py-2">{present(bd)}</div>
            </div>
          </div>
          <p className="sr-only">
            Los términos adx y bcx son semejantes y se suman formando ({present(ad)}+{present(bc)})x.
          </p>
        </section>

        <p className="text-center text-sm text-[var(--fg-muted)]" aria-hidden>
          ↓ resultado simplificado ↓
        </p>

        {/* Result */}
        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Resultado
          </p>
          <p className="mt-2 font-mono text-base leading-relaxed">
            (ax+b)(cx+d) = acx²+(ad+bc)x+bd
          </p>
          <p className="mt-1 font-mono text-lg font-semibold leading-relaxed">
            ({pExpr})({qExpr}) = {simplified}
          </p>
          <p className="mt-2 text-sm text-[var(--fg-muted)]">
            Coeficientes del producto:{' '}
            <span className="font-mono">
              [{present(ac)}, {present(mid)}, {present(bd)}]
            </span>{' '}
            (grados 2, 1 y 0).
          </p>
        </section>

        {/* Convolution (advanced) */}
        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 text-left text-sm font-semibold text-[var(--fg)]"
            aria-expanded={showConv}
            onClick={() => setShowConv((s) => !s)}
          >
            <span>Modo avanzado: convolución de coeficientes</span>
            <span className="text-[var(--fg-muted)]">{showConv ? '−' : '+'}</span>
          </button>
          {showConv ? (
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--fg-muted)]">
              <p>
                Con coeficientes de mayor a menor grado:{' '}
                <span className="font-mono text-[var(--fg)]">
                  P → [{aL}, {bL}]
                </span>
                ,{' '}
                <span className="font-mono text-[var(--fg)]">
                  Q → [{cL}, {dL}]
                </span>
                .
              </p>
              <p className="font-mono text-[var(--fg)]">
                [a, b] ∗ [c, d] = [ac, ad+bc, bd] = [{present(ac)}, {present(mid)}, {present(bd)}]
              </p>
              <ul className="list-inside list-disc space-y-1">
                <li>
                  grado 2: <span className="font-mono">a·c = {present(ac)}</span>
                </li>
                <li>
                  grado 1: <span className="font-mono">a·d + b·c = {present(ad)} + {present(bc)} = {present(mid)}</span>
                </li>
                <li>
                  grado 0: <span className="font-mono">b·d = {present(bd)}</span>
                </li>
              </ul>
              <p>
                Por eso los coeficientes del producto son la convolución de los vectores de
                coeficientes.
              </p>
            </div>
          ) : null}
        </section>

        <div
          id={statusId}
          className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_70%,var(--bg-elevated))] px-3 py-2 text-sm leading-relaxed"
          aria-live="polite"
        >
          <p className="font-mono">
            ({pExpr})({qExpr}) = {expanded} = {simplified}
          </p>
        </div>

        <p className="sr-only">{ariaStatus}</p>

        <ControlsStack>
          <SliderRow
            label="a"
            ariaLabel={`Coeficiente a de ax, actualmente ${aL}`}
            value={a}
            min={0.5}
            max={5}
            step={0.1}
            onChange={(val) => setA(snap(val, 0.5, 5, 0.1))}
          />
          <SliderRow
            label="b"
            ariaLabel={`Término independiente b, actualmente ${bL}`}
            value={b}
            min={0}
            max={4}
            step={0.1}
            onChange={(val) => setB(snap(val, 0, 4, 0.1))}
          />
          <SliderRow
            label="c"
            ariaLabel={`Coeficiente c de cx, actualmente ${cL}`}
            value={c}
            min={0.2}
            max={4}
            step={0.1}
            onChange={(val) => setC(snap(val, 0.2, 4, 0.1))}
          />
          <SliderRow
            label="d"
            ariaLabel={`Término independiente d, actualmente ${dL}`}
            value={d}
            min={0}
            max={4}
            step={0.1}
            onChange={(val) => setD(snap(val, 0, 4, 0.1))}
          />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
