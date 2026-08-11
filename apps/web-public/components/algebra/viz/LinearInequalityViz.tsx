'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from './controls';

const ZERO_EPS = 1e-9;

type Op = '<' | '≤' | '>' | '≥';
type SolKind = 'ray' | 'all' | 'empty';

function snap(val: number, min: number, max: number, step: number): number {
  const clamped = Math.min(max, Math.max(min, val));
  const steps = Math.round((clamped - min) / step);
  const snapped = min + steps * step;
  if (Math.abs(snapped) < step / 2) return 0;
  return Number(snapped.toFixed(2));
}

function present(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '—';
  return fmt(Number(n.toFixed(digits)), digits);
}

function isZero(n: number): boolean {
  return Math.abs(n) < ZERO_EPS;
}

function flipOp(op: Op): Op {
  const m: Record<Op, Op> = { '<': '>', '≤': '≥', '>': '<', '≥': '≤' };
  return m[op];
}

function compareConst(b: number, op: Op): boolean {
  if (op === '<') return b < -ZERO_EPS;
  if (op === '≤') return b < ZERO_EPS || isZero(b);
  if (op === '>') return b > ZERO_EPS;
  return b > -ZERO_EPS || isZero(b); // ≥
}

function formatLinear(a: number, b: number): string {
  const aL = present(a);
  const bL = present(b);
  if (isZero(a) && isZero(b)) return '0';
  if (isZero(a)) return bL;
  const ax = Math.abs(a) === 1 ? (a < 0 ? '−x' : 'x') : `${aL}x`;
  if (isZero(b)) return ax;
  return b > 0 ? `${ax}+${bL}` : `${ax}−${present(Math.abs(b))}`;
}

function intervalOf(op: Op, k: number): string {
  const kL = present(k);
  if (op === '<') return `(−∞,${kL})`;
  if (op === '≤') return `(−∞,${kL}]`;
  if (op === '>') return `(${kL},∞)`;
  return `[${kL},∞)`;
}

function evalLinear(a: number, b: number, x: number): number {
  return a * x + b;
}

function satisfies(val: number, op: Op): boolean {
  if (op === '<') return val < -ZERO_EPS;
  if (op === '≤') return val <= ZERO_EPS;
  if (op === '>') return val > ZERO_EPS;
  return val >= -ZERO_EPS;
}

/**
 * Linear inequality ax+b □ 0 as a ray on the number line (ALG-INE-001).
 * Boundary from ax+b=0; shade from fully resolved inequality (handles a<0 flip).
 */
export function LinearInequalityViz() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(-2);
  const [op, setOp] = useState<Op>('<');
  const guideId = useId();
  const statusId = useId();

  const aZero = isZero(a);
  const expr = formatLinear(a, b);
  const aL = present(a);
  const bL = present(b);

  let kind: SolKind = 'ray';
  let k: number | null = null;
  let finalOp: Op = op;
  let flipped = false;

  if (aZero) {
    kind = compareConst(b, op) ? 'all' : 'empty';
  } else {
    k = -b / a;
    if (a < 0) {
      finalOp = flipOp(op);
      flipped = true;
    } else {
      finalOp = op;
    }
    kind = 'ray';
  }

  const closed = finalOp === '≤' || finalOp === '≥';
  const shadeLeft = finalOp === '<' || finalOp === '≤';
  const kL = k !== null ? present(k) : null;
  const interval = k !== null ? intervalOf(finalOp, k) : kind === 'all' ? 'ℝ' : '∅';
  const finalIneq =
    kind === 'ray' && kL !== null
      ? `x${finalOp}${kL}`
      : kind === 'all'
        ? 'verdadera para todo x'
        : 'falsa para todo x';

  // Adaptive view
  const view = useMemo(() => {
    if (kind !== 'ray' || k === null) {
      return { min: -5, max: 5 };
    }
    const pad = Math.max(2.5, Math.abs(k) * 0.35 + 1.5);
    let min = Math.min(-3, k - pad);
    let max = Math.max(3, k + pad);
    // Keep origin if not too far
    if (min > -1 && Math.abs(k) < 8) min = -Math.max(3, Math.abs(k) + 1.5);
    if (max < 1 && Math.abs(k) < 8) max = Math.max(3, Math.abs(k) + 1.5);
    if (max - min > 30) {
      min = k - 12;
      max = k + 12;
    }
    return { min, max };
  }, [kind, k]);

  const W = 560;
  const H = 120;
  const pad = 36;
  const axisY = 58;
  const span = view.max - view.min;
  const toX = (val: number) => pad + ((val - view.min) / span) * (W - 2 * pad);

  const ticks = useMemo(() => {
    const s = view.max - view.min;
    const step = s > 20 ? 5 : s > 10 ? 2 : 1;
    const out: number[] = [];
    const start = Math.ceil(view.min / step) * step;
    for (let t = start; t <= view.max + 1e-9; t += step) out.push(Number(t.toFixed(4)));
    return out;
  }, [view]);

  // Test points
  const tests = useMemo(() => {
    if (kind === 'all') {
      return [
        { x: 0, ok: true },
        { x: 1, ok: true },
      ];
    }
    if (kind === 'empty') {
      return [
        { x: 0, ok: false },
        { x: 1, ok: false },
      ];
    }
    if (k === null) return [];
    const inside = shadeLeft ? k - Math.max(1, Math.abs(k) * 0.2 + 0.5) : k + Math.max(1, Math.abs(k) * 0.2 + 0.5);
    const outside = shadeLeft ? k + Math.max(1, Math.abs(k) * 0.2 + 0.5) : k - Math.max(1, Math.abs(k) * 0.2 + 0.5);
    return [
      { x: inside, ok: satisfies(evalLinear(a, b, inside), op) },
      { x: outside, ok: satisfies(evalLinear(a, b, outside), op) },
    ];
  }, [kind, k, shadeLeft, a, b, op]);

  const shadeRect = (() => {
    if (kind === 'all') {
      return { x: pad, w: W - 2 * pad };
    }
    if (kind === 'empty' || k === null) return null;
    const kx = toX(k);
    if (shadeLeft) return { x: pad, w: Math.max(0, kx - pad) };
    return { x: kx, w: Math.max(0, W - pad - kx) };
  })();

  const ariaStatus = useMemo(() => {
    if (kind === 'all') {
      return `Inecuación ${expr}${op}0. Como a es 0 y ${bL}${op}0 es verdadero, la solución es todos los reales.`;
    }
    if (kind === 'empty') {
      return `Inecuación ${expr}${op}0. Como a es 0 y ${bL}${op}0 es falso, no hay solución.`;
    }
    return `Inecuación ${expr}${op}0. Frontera en x=${kL}. Solución ${finalIneq}, intervalo ${interval}. El borde es ${closed ? 'cerrado' : 'abierto'}.`;
  }, [kind, expr, op, bL, kL, finalIneq, interval, closed]);

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Una inecuación lineal simple representa una semirrecta en la recta real; en casos
            especiales, puede tener como solución todos los números reales o no tener solución.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            La frontera sale de ax+b=0. El círculo abierto o cerrado dice si esa frontera se incluye.
            Si divides por un número negativo, el signo de la desigualdad se invierte.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Inecuación actual
          </p>
          <p className="mt-2 font-mono text-lg font-semibold">
            {expr}
            {op}0
          </p>
        </section>

        <section className="space-y-2 rounded-xl border border-[var(--border)] px-3 py-3 text-sm leading-relaxed">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Resolución algebraica
          </p>
          {!aZero ? (
            <>
              <p className="font-mono">
                {expr}
                {op}0
              </p>
              <p className="font-mono">
                {aL}x{op}{present(-b)}
              </p>
              {flipped ? (
                <p className="font-mono">
                  dividir por a={aL}&lt;0 ⇒ se invierte el signo → x{finalOp}
                  {kL}
                </p>
              ) : (
                <p className="font-mono">
                  dividir por a={aL}&gt;0 ⇒ el signo se conserva → x{finalOp}
                  {kL}
                </p>
              )}
              <p className="text-[var(--fg-muted)]">
                Frontera: resolver {expr}=0 ⇒ x=−b/a=−({bL})/({aL})={kL}. Ese punto separa donde{' '}
                {expr}&gt;0 de donde {expr}&lt;0.
              </p>
            </>
          ) : (
            <>
              <p className="font-mono">
                {expr}
                {op}0 → {bL}
                {op}0
              </p>
              <p className="font-semibold">
                {kind === 'all'
                  ? 'La proposición es verdadera ⇒ solución = ℝ'
                  : 'La proposición es falsa ⇒ solución = ∅'}
              </p>
              <p className="text-[var(--fg-muted)]">
                Con a=0 no hay frontera: la expresión no depende de x.
              </p>
            </>
          )}
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Recta numérica · conjunto solución
          </p>
          <div className="mt-2 overflow-x-auto">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="mx-auto h-auto w-full max-w-xl"
              role="img"
              aria-labelledby={statusId}
            >
              {shadeRect ? (
                <rect
                  x={shadeRect.x}
                  y={axisY - 16}
                  width={shadeRect.w}
                  height={32}
                  fill="var(--accent-soft)"
                  opacity={0.9}
                />
              ) : null}

              <line
                x1={pad}
                y1={axisY}
                x2={W - pad}
                y2={axisY}
                stroke="currentColor"
                strokeWidth={2}
                opacity={0.45}
              />

              {ticks.map((t) => {
                const isZ = Math.abs(t) < ZERO_EPS;
                return (
                  <g key={t}>
                    <line
                      x1={toX(t)}
                      y1={axisY - (isZ ? 10 : 6)}
                      x2={toX(t)}
                      y2={axisY + (isZ ? 10 : 6)}
                      stroke="currentColor"
                      strokeWidth={isZ ? 2.5 : 1.5}
                      opacity={isZ ? 0.95 : 0.4}
                    />
                    <text
                      x={toX(t)}
                      y={axisY + 24}
                      textAnchor="middle"
                      fontSize={isZ ? 13 : 11}
                      fontWeight={isZ ? 600 : 400}
                      fill="currentColor"
                      opacity={isZ ? 0.95 : 0.65}
                    >
                      {isZ ? '0' : present(t, 0)}
                    </text>
                  </g>
                );
              })}

              {kind === 'ray' && k !== null ? (
                <g>
                  <circle
                    cx={toX(k)}
                    cy={axisY}
                    r={7}
                    fill={closed ? 'orange' : 'var(--formula-bg)'}
                    stroke="orange"
                    strokeWidth={2.5}
                  />
                  <text
                    x={toX(k)}
                    y={axisY - 22}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={600}
                    fill="currentColor"
                  >
                    frontera x={kL}
                  </text>
                  <text
                    x={toX(k)}
                    y={H - 8}
                    textAnchor="middle"
                    fontSize={11}
                    fill="currentColor"
                    opacity={0.8}
                  >
                    {closed ? 'cerrado: la frontera sí se incluye' : 'abierto: la frontera no se incluye'}
                  </text>
                </g>
              ) : null}

              {kind === 'all' ? (
                <text
                  x={W / 2}
                  y={22}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={600}
                  fill="currentColor"
                >
                  solución: todo ℝ (recta completa sombreada)
                </text>
              ) : null}
              {kind === 'empty' ? (
                <text
                  x={W / 2}
                  y={22}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={600}
                  fill="currentColor"
                >
                  solución: ∅ (nada sombreado)
                </text>
              ) : null}
            </svg>
          </div>
          <p className="mt-2 font-mono text-sm">
            {kind === 'ray' ? (
              <>
                desigualdad final: {finalIneq} · intervalo: {interval}
                <br />
                S={'{'}x∈ℝ : {finalIneq}
                {'}'}
              </>
            ) : kind === 'all' ? (
              <>S = ℝ</>
            ) : (
              <>S = ∅</>
            )}
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            La zona sombreada es el conjunto de x que hacen verdadera la inecuación (ya resuelta,
            incluyendo la inversión si a&lt;0).
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 text-sm leading-relaxed">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Comprobación con puntos de prueba
          </p>
          <div className="mt-2 space-y-1 font-mono">
            {tests.map((t) => {
              const val = evalLinear(a, b, t.x);
              return (
                <p key={t.x}>
                  x={present(t.x)} ⇒ {aL}({present(t.x)})+({bL})={present(val)}
                  {op}0 → {t.ok ? 'verdadero' : 'falso'}
                </p>
              );
            })}
          </div>
        </section>

        <div
          id={statusId}
          className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_70%,var(--bg-elevated))] px-3 py-2 text-sm leading-relaxed"
          aria-live="polite"
        >
          {kind === 'ray' && kL ? (
            <p className="font-mono">
              {expr}
              {op}0 ⇒ {finalIneq}
              <br />
              Solución: {interval}
            </p>
          ) : null}
          {kind === 'all' ? (
            <p className="font-mono">
              {expr}
              {op}0 ⇒ ℝ
              <br />
              Solución: todos los reales.
            </p>
          ) : null}
          {kind === 'empty' ? (
            <p className="font-mono">
              {expr}
              {op}0 ⇒ ∅
              <br />
              Solución: ningún real.
            </p>
          ) : null}
        </div>

        <p className="sr-only">{ariaStatus}</p>

        <ControlsStack>
          <SliderRow
            label="a"
            ariaLabel={`Coeficiente a, actualmente ${aL}`}
            value={a}
            min={-3}
            max={3}
            step={0.1}
            onChange={(val) => setA(snap(val, -3, 3, 0.1))}
          />
          <SliderRow
            label="b"
            ariaLabel={`Término b, actualmente ${bL}`}
            value={b}
            min={-5}
            max={5}
            step={0.1}
            onChange={(val) => setB(snap(val, -5, 5, 0.1))}
          />
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
              Operador
            </p>
            <ButtonRow>
              {(['<', '≤', '>', '≥'] as const).map((o) => (
                <VizButton key={o} active={op === o} onClick={() => setOp(o)}>
                  {o}
                </VizButton>
              ))}
            </ButtonRow>
          </div>
          {a < -ZERO_EPS ? (
            <p className="text-xs text-[var(--fg-muted)]">
              a&lt;0: al aislar x se invierte el signo de la desigualdad.
            </p>
          ) : null}
          {aZero ? (
            <p className="text-xs text-[var(--fg-muted)]">
              a=0: la inecuación deja de depender de x; solo queda comparar b con 0.
            </p>
          ) : null}
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
