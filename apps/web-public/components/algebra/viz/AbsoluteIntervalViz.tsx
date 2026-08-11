'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from './controls';

const ZERO_EPS = 1e-9;

type Op = '<' | '≤' | '>' | '≥';

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

function isInterior(op: Op): boolean {
  return op === '<' || op === '≤';
}

function isClosed(op: Op): boolean {
  return op === '≤' || op === '≥';
}

/**
 * Absolute-value inequalities |x| □ a as interior/exterior intervals (ALG-INE-004).
 * |x| = distance from x to 0; a ≥ 0.
 */
export function AbsoluteIntervalViz() {
  const [a, setA] = useState(2.5);
  const [op, setOp] = useState<Op>('<');
  const guideId = useId();
  const statusId = useId();

  const aZero = Math.abs(a) < ZERO_EPS;
  const aL = present(a);
  const negAL = present(-a);
  const interior = isInterior(op);
  const closed = isClosed(op);

  const equiv = useMemo(() => {
    if (aZero) {
      if (op === '<') return { ineq: 'imposible', interval: '∅', detail: '|x|<0 no tiene solución real.' };
      if (op === '≤') return { ineq: 'x=0', interval: '{0}', detail: 'Solo el 0 está a distancia ≤0 del 0.' };
      if (op === '>') return { ineq: 'x≠0', interval: '(−∞,0)∪(0,∞)', detail: 'Todo x salvo el 0.' };
      return { ineq: 'todo x', interval: 'ℝ', detail: '|x|≥0 es siempre verdadero.' };
    }
    if (op === '<')
      return {
        ineq: `${negAL}<x<${aL}`,
        interval: `(${negAL},${aL})`,
        detail: 'Distancia al 0 menor que a → interior abierto.',
      };
    if (op === '≤')
      return {
        ineq: `${negAL}≤x≤${aL}`,
        interval: `[${negAL},${aL}]`,
        detail: 'Distancia al 0 menor o igual que a → interior cerrado.',
      };
    if (op === '>')
      return {
        ineq: `x<${negAL} o x>${aL}`,
        interval: `(−∞,${negAL})∪(${aL},∞)`,
        detail: 'Distancia al 0 mayor que a → exterior abierto.',
      };
    return {
      ineq: `x≤${negAL} o x≥${aL}`,
      interval: `(−∞,${negAL}]∪[${aL},∞)`,
      detail: 'Distancia al 0 mayor o igual que a → exterior cerrado.',
    };
  }, [aZero, op, aL, negAL]);

  const view = useMemo(() => {
    const need = Math.max(3.5, a * 1.45 + 1);
    return { min: -need, max: need };
  }, [a]);

  const W = 560;
  const H = 150;
  const pad = 36;
  const axisY = 78;
  const span = view.max - view.min;
  const toX = (val: number) => pad + ((val - view.min) / span) * (W - 2 * pad);

  const ticks = useMemo(() => {
    const s = view.max - view.min;
    const step = s > 14 ? 4 : s > 8 ? 2 : 1;
    const out: number[] = [];
    const start = Math.ceil(view.min / step) * step;
    for (let t = start; t <= view.max + 1e-9; t += step) out.push(Number(t.toFixed(4)));
    return out;
  }, [view]);

  const pedagogy =
    interior
      ? `|x|${op}${aL}: la distancia de x al 0 es ${op === '<' ? 'menor' : 'menor o igual'} que ${aL}.`
      : `|x|${op}${aL}: la distancia de x al 0 es ${op === '>' ? 'mayor' : 'mayor o igual'} que ${aL}.`;

  const ariaStatus = `Inecuación valor absoluto de x ${op} ${aL}. Equivale a ${equiv.ineq}. Solución ${equiv.interval}.`;

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            |x| es la distancia de x al 0. Por eso |x|&lt;a y |x|≤a dan soluciones dentro del intervalo
            entre −a y a; |x|&gt;a y |x|≥a dan soluciones fuera de ese intervalo.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Los casos con &lt; o ≤ generan una región centrada en 0; los casos con &gt; o ≥ generan dos
            regiones exteriores simétricas.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Inecuación activa
          </p>
          <p className="mt-2 font-mono text-lg font-semibold">
            |x|{op}
            {aL}
          </p>
          <p className="mt-2 text-sm">{pedagogy}</p>
        </section>

        <section className="space-y-2 rounded-xl border border-[var(--border)] px-3 py-3 text-sm leading-relaxed">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Equivalencias
          </p>
          <p className="font-mono">
            |x|{op}
            {aL}
          </p>
          <p className="font-mono">⟺ {equiv.ineq}</p>
          <p className="font-mono">⟺ x∈{equiv.interval}</p>
          <p className="text-[var(--fg-muted)]">{equiv.detail}</p>
        </section>

        <section className="rounded-xl border-2 border-[var(--accent-strong)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Recta numérica · distancia al 0
          </p>
          <div className="mt-2 overflow-x-auto">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="mx-auto h-auto w-full max-w-xl"
              role="img"
              aria-labelledby={statusId}
            >
              {/* Shade */}
              {!aZero && interior ? (
                <rect
                  x={toX(-a)}
                  y={axisY - 16}
                  width={Math.max(2, toX(a) - toX(-a))}
                  height={32}
                  fill="var(--accent-soft)"
                  opacity={0.95}
                />
              ) : null}
              {!aZero && !interior ? (
                <>
                  <rect
                    x={pad}
                    y={axisY - 16}
                    width={Math.max(0, toX(-a) - pad)}
                    height={32}
                    fill="var(--accent-soft)"
                    opacity={0.95}
                  />
                  <rect
                    x={toX(a)}
                    y={axisY - 16}
                    width={Math.max(0, W - pad - toX(a))}
                    height={32}
                    fill="var(--accent-soft)"
                    opacity={0.95}
                  />
                </>
              ) : null}
              {aZero && op === '≥' ? (
                <rect
                  x={pad}
                  y={axisY - 16}
                  width={W - 2 * pad}
                  height={32}
                  fill="var(--accent-soft)"
                  opacity={0.95}
                />
              ) : null}
              {aZero && op === '>' ? (
                <>
                  <rect x={pad} y={axisY - 16} width={Math.max(0, toX(0) - pad)} height={32} fill="var(--accent-soft)" />
                  <rect
                    x={toX(0)}
                    y={axisY - 16}
                    width={Math.max(0, W - pad - toX(0))}
                    height={32}
                    fill="var(--accent-soft)"
                  />
                </>
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

              {/* Endpoints −a, a */}
              {!aZero ? (
                <>
                  <circle
                    cx={toX(-a)}
                    cy={axisY}
                    r={7}
                    fill={closed ? 'orange' : 'var(--formula-bg)'}
                    stroke="orange"
                    strokeWidth={2.5}
                  />
                  <circle
                    cx={toX(a)}
                    cy={axisY}
                    r={7}
                    fill={closed ? 'orange' : 'var(--formula-bg)'}
                    stroke="orange"
                    strokeWidth={2.5}
                  />
                  <text
                    x={toX(-a)}
                    y={axisY - 22}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={600}
                    fill="currentColor"
                  >
                    −a={negAL}
                  </text>
                  <text
                    x={toX(a)}
                    y={axisY - 22}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={600}
                    fill="currentColor"
                  >
                    a={aL}
                  </text>
                </>
              ) : null}

              {aZero && (op === '≤' || op === '≥') ? (
                <circle cx={toX(0)} cy={axisY} r={7} fill="orange" stroke="currentColor" strokeWidth={1} />
              ) : null}
              {aZero && op === '>' ? (
                <circle
                  cx={toX(0)}
                  cy={axisY}
                  r={7}
                  fill="var(--formula-bg)"
                  stroke="orange"
                  strokeWidth={2.5}
                />
              ) : null}

              <text
                x={W / 2}
                y={18}
                textAnchor="middle"
                fontSize={12}
                fontWeight={600}
                fill="currentColor"
              >
                {interior
                  ? aZero
                    ? op === '<'
                      ? 'sin región (∅)'
                      : 'solo el origen'
                    : 'región interior centrada en 0'
                  : aZero && op === '≥'
                    ? 'toda la recta'
                    : 'regiones exteriores simétricas'}
              </text>

              <text
                x={W / 2}
                y={H - 8}
                textAnchor="middle"
                fontSize={11}
                fill="currentColor"
                opacity={0.8}
              >
                {closed
                  ? 'extremos cerrados: −a y a se incluyen'
                  : aZero
                    ? ' '
                    : 'extremos abiertos: −a y a no se incluyen'}
              </text>
            </svg>
          </div>
        </section>

        <div
          id={statusId}
          className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_70%,var(--bg-elevated))] px-3 py-2 text-sm leading-relaxed"
          aria-live="polite"
        >
          <p className="font-mono">
            |x|{op}
            {aL} ⟺ {equiv.ineq}
            <br />
            Solución: {equiv.interval}
          </p>
        </div>

        <p className="sr-only">{ariaStatus}</p>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 text-sm text-[var(--fg-muted)]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em]">
            Ampliación (centrado en h)
          </p>
          <p className="mt-2">
            La misma idea vale para |x−h|{op}a: el intervalo (o el exterior) se centra en h en lugar
            de en 0. Por ejemplo, |x−3|&lt;2 ⟺ 1&lt;x&lt;5.
          </p>
        </section>

        <ControlsStack>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
              Desigualdad
            </p>
            <ButtonRow>
              {(['<', '≤', '>', '≥'] as const).map((o) => (
                <VizButton key={o} active={op === o} onClick={() => setOp(o)}>
                  |x|{o}a
                </VizButton>
              ))}
            </ButtonRow>
          </div>
          <SliderRow
            label="a"
            ariaLabel={`Radio a (a≥0), actualmente ${aL}`}
            value={a}
            min={0}
            max={5}
            step={0.1}
            onChange={(val) => setA(snap(val, 0, 5, 0.1))}
          />
          <p className="text-xs text-[var(--fg-muted)]">
            a≥0 porque una distancia no puede ser negativa. Prueba a=0 para ver ∅, solo el 0, todo
            excepto el 0, o toda la recta según el operador.
          </p>
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
