'use client';

import { useId, useMemo, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel, fmt } from './controls';

const ZERO_EPS = 1e-9;

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

type CaseKind = 'two' | 'one' | 'none';

/**
 * Solve |x|=a on the number line via distance to 0 (ALG-EQU-008).
 * Cases: a>0 → x=±a; a=0 → x=0; a<0 → no real solutions.
 */
export function AbsoluteEquationViz() {
  const [a, setA] = useState(2.9);
  const guideId = useId();
  const statusId = useId();

  const kind: CaseKind =
    a > ZERO_EPS ? 'two' : a < -ZERO_EPS ? 'none' : 'one';

  const aAbs = Math.abs(a);
  const aL = present(a);
  const aAbsL = present(aAbs);
  const x1 = kind === 'two' ? -a : kind === 'one' ? 0 : null;
  const x2 = kind === 'two' ? a : null;
  const x1L = x1 !== null ? present(x1) : null;
  const x2L = x2 !== null ? present(x2) : null;

  // Adaptive visible range: keep 0 and solutions in view
  const view = useMemo(() => {
    const need = kind === 'none' ? 3 : Math.max(3, aAbs * 1.35 + 0.8);
    return { min: -need, max: need };
  }, [aAbs, kind]);

  const W = 560;
  const H = 180;
  const pad = 36;
  const axisY = 100;
  const span = view.max - view.min;
  const toX = (val: number) => pad + ((val - view.min) / span) * (W - 2 * pad);

  const ticks = useMemo(() => {
    const spanAbs = view.max - view.min;
    const step = spanAbs > 14 ? 4 : spanAbs > 8 ? 2 : 1;
    const out: number[] = [];
    const start = Math.ceil(view.min / step) * step;
    for (let t = start; t <= view.max + 1e-9; t += step) {
      out.push(Number(t.toFixed(4)));
    }
    return out;
  }, [view]);

  const caseTitle =
    kind === 'two'
      ? 'a>0 ⇒ dos soluciones reales distintas'
      : kind === 'one'
        ? 'a=0 ⇒ una solución real'
        : 'a<0 ⇒ ninguna solución real';

  const ariaDescription = useMemo(() => {
    if (kind === 'two') {
      return `La ecuación es valor absoluto de x igual a ${aL}. Hay dos soluciones: x igual a ${x1L} y x igual a ${x2L}. Ambos puntos están a distancia ${aL} del cero.`;
    }
    if (kind === 'one') {
      return `La ecuación es valor absoluto de x igual a 0. Hay una solución: x igual a 0. El único punto a distancia 0 del cero es el propio 0.`;
    }
    return `La ecuación es valor absoluto de x igual a ${aL}. No hay soluciones reales porque el valor absoluto nunca es negativo y a es negativo.`;
  }, [kind, aL, x1L, x2L]);

  // Distance bracket helpers
  const bracket = (from: number, to: number, y: number, label: string) => {
    const xA = toX(from);
    const xB = toX(to);
    const mid = (xA + xB) / 2;
    return (
      <g>
        <line x1={xA} y1={y} x2={xB} y2={y} stroke="teal" strokeWidth={1.75} />
        <line x1={xA} y1={y - 5} x2={xA} y2={y + 5} stroke="teal" strokeWidth={1.5} />
        <line x1={xB} y1={y - 5} x2={xB} y2={y + 5} stroke="teal" strokeWidth={1.5} />
        <text x={mid} y={y - 8} textAnchor="middle" fontSize={12} fontWeight={600} fill="teal">
          {label}
        </text>
      </g>
    );
  };

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            |x| es la distancia de x al 0. Por tanto, |x|=a pregunta: ¿qué puntos están a distancia a
            del cero?
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Conexión con Valor absoluto: primero se entiende |x| como distancia; aquí se resuelve la
            ecuación que fija esa distancia.
          </p>
        </div>

        <section className="rounded-xl border-2 border-[var(--accent-strong)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Clasificación según a
          </p>
          <ul className="mt-2 space-y-1.5 text-sm">
            <li className={kind === 'two' ? 'font-semibold text-[var(--fg)]' : 'text-[var(--fg-muted)]'}>
              {kind === 'two' ? '→ ' : ''}a &gt; 0 ⇒ dos soluciones reales distintas
            </li>
            <li className={kind === 'one' ? 'font-semibold text-[var(--fg)]' : 'text-[var(--fg-muted)]'}>
              {kind === 'one' ? '→ ' : ''}a = 0 ⇒ una solución real
            </li>
            <li className={kind === 'none' ? 'font-semibold text-[var(--fg)]' : 'text-[var(--fg-muted)]'}>
              {kind === 'none' ? '→ ' : ''}a &lt; 0 ⇒ ninguna solución real
            </li>
          </ul>
          <p className="mt-3 rounded-lg bg-[color-mix(in_oklab,var(--accent-soft)_55%,transparent)] px-3 py-2 font-mono text-sm font-semibold">
            Caso actual: {caseTitle}
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Secuencia
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-relaxed">
            <li>
              Ecuación: <span className="font-mono">|x|={aL}</span>
            </li>
            <li>
              Interpretación: distancia de x a 0 = {aL}
            </li>
            {kind === 'two' ? (
              <>
                <li>
                  Buscar a ambos lados del cero: <span className="font-mono">−a</span> y{' '}
                  <span className="font-mono">+a</span>
                </li>
                <li>
                  Soluciones: <span className="font-mono">x=−a</span> o{' '}
                  <span className="font-mono">x=a</span>
                </li>
                <li>
                  Abreviatura: <span className="font-mono">x=±a</span>
                </li>
              </>
            ) : null}
            {kind === 'one' ? (
              <li>
                Solución: <span className="font-mono">x=0</span> (única)
              </li>
            ) : null}
            {kind === 'none' ? (
              <li>
                Imposible: <span className="font-mono">|x|≥0</span> para todo x, pero a&lt;0
              </li>
            ) : null}
          </ol>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
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
                const isZero = Math.abs(t) < ZERO_EPS;
                return (
                  <g key={t}>
                    <line
                      x1={toX(t)}
                      y1={axisY - (isZero ? 10 : 6)}
                      x2={toX(t)}
                      y2={axisY + (isZero ? 10 : 6)}
                      stroke="currentColor"
                      strokeWidth={isZero ? 2.5 : 1.5}
                      opacity={isZero ? 0.95 : 0.4}
                    />
                    <text
                      x={toX(t)}
                      y={axisY + 24}
                      textAnchor="middle"
                      fontSize={isZero ? 13 : 11}
                      fontWeight={isZero ? 600 : 400}
                      fill="currentColor"
                      opacity={isZero ? 0.95 : 0.65}
                    >
                      {isZero ? '0' : present(t, 0)}
                    </text>
                  </g>
                );
              })}

              {/* Distance brackets for a>0 */}
              {kind === 'two' && x1 !== null && x2 !== null ? (
                <>
                  {bracket(x1, 0, axisY - 36, `a=${aL}`)}
                  {bracket(0, x2, axisY - 36, `a=${aL}`)}
                  <text
                    x={W / 2}
                    y={22}
                    textAnchor="middle"
                    fontSize={12}
                    fill="currentColor"
                    opacity={0.85}
                  >
                    Las dos soluciones están a la misma distancia del 0
                  </text>
                </>
              ) : null}

              {kind === 'one' ? (
                <g>
                  <circle
                    cx={toX(0)}
                    cy={axisY}
                    r={8}
                    fill="orange"
                    stroke="currentColor"
                    strokeWidth={1}
                  />
                  <text
                    x={toX(0)}
                    y={axisY - 28}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={600}
                    fill="currentColor"
                  >
                    solución x=0
                  </text>
                  <text
                    x={W / 2}
                    y={22}
                    textAnchor="middle"
                    fontSize={12}
                    fill="currentColor"
                    opacity={0.85}
                  >
                    El único punto a distancia 0 del cero es el propio 0
                  </text>
                </g>
              ) : null}

              {kind === 'two' && x1 !== null && x2 !== null ? (
                <>
                  <circle
                    cx={toX(x1)}
                    cy={axisY}
                    r={7}
                    fill="orange"
                    stroke="currentColor"
                    strokeWidth={1}
                  />
                  <text
                    x={toX(x1)}
                    y={axisY + 42}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={600}
                    fill="currentColor"
                  >
                    x₁={x1L}
                  </text>
                  <text
                    x={toX(x1)}
                    y={axisY + 56}
                    textAnchor="middle"
                    fontSize={10}
                    fill="currentColor"
                    opacity={0.75}
                  >
                    solución
                  </text>

                  <circle
                    cx={toX(x2)}
                    cy={axisY}
                    r={7}
                    fill="orange"
                    stroke="currentColor"
                    strokeWidth={1}
                  />
                  <text
                    x={toX(x2)}
                    y={axisY - 48}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={600}
                    fill="currentColor"
                  >
                    x₂={x2L}
                  </text>
                  <text
                    x={toX(x2)}
                    y={axisY - 62}
                    textAnchor="middle"
                    fontSize={10}
                    fill="currentColor"
                    opacity={0.75}
                  >
                    solución
                  </text>
                </>
              ) : null}

              {kind === 'none' ? (
                <text
                  x={W / 2}
                  y={axisY - 28}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={600}
                  fill="currentColor"
                >
                  sin puntos solución · |x|≥0 siempre
                </text>
              ) : null}
            </svg>
          </div>
          {kind === 'two' ? (
            <p className="mt-1 text-sm text-[var(--fg-muted)]">
              d(−a, 0)=a y d(0, a)=a. Los puntos naranjas son las soluciones, no solo marcas de escala.
            </p>
          ) : null}
        </section>

        <section className="space-y-2 rounded-xl border border-[var(--border)] px-3 py-3 text-sm leading-relaxed">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Álgebra y comprobación
          </p>
          {kind === 'two' && x1L && x2L ? (
            <>
              <p className="font-mono text-base">|x|={aL}</p>
              <p className="font-mono">x=−a o x=a → x={x1L} o x={x2L}</p>
              <p className="font-mono">x=±{aL}</p>
              <p className="mt-2 font-mono text-[var(--fg-muted)]">
                Comprobación: |{x1L}|={aL} · |{x2L}|={aL}
              </p>
              <p className="font-semibold">2 soluciones reales.</p>
            </>
          ) : null}
          {kind === 'one' ? (
            <>
              <p className="font-mono text-base">|x|=0</p>
              <p className="font-mono">x=0</p>
              <p className="text-[var(--fg-muted)]">
                El único punto situado a distancia 0 del cero es el propio 0.
              </p>
              <p className="font-semibold">1 solución real.</p>
            </>
          ) : null}
          {kind === 'none' ? (
            <>
              <p className="font-mono text-base">|x|={aL}</p>
              <p className="font-mono">|x|≥0 para todo x∈ℝ</p>
              <p className="text-[var(--fg-muted)]">
                Como a&lt;0, |x|=a es imposible: una distancia no puede ser negativa.
              </p>
              <p className="font-semibold">No hay soluciones reales.</p>
            </>
          ) : null}
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 text-sm leading-relaxed">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Avanzado (opcional) · |f(x)|=a
          </p>
          <p className="mt-2 text-[var(--fg-muted)]">
            Si a≥0, |f(x)|=a equivale a resolver f(x)=a o f(x)=−a. Ejemplo: |2x−1|=3 genera 2x−1=3 o
            2x−1=−3. La recta de arriba enseña el caso básico |x|=a; esta regla lo generaliza.
          </p>
        </section>

        <div
          id={statusId}
          className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_70%,var(--bg-elevated))] px-3 py-2 text-sm leading-relaxed"
          aria-live="polite"
        >
          {kind === 'two' && x1L && x2L ? (
            <p className="font-mono">
              |x|={aL}
              <br />
              x={x1L} o x={x2L}
              <br />
              2 soluciones reales.
            </p>
          ) : null}
          {kind === 'one' ? (
            <p className="font-mono">
              |x|=0 ⇒ x=0
              <br />
              1 solución real.
            </p>
          ) : null}
          {kind === 'none' ? (
            <p className="font-mono">
              |x|={aL}
              <br />
              No hay soluciones reales.
            </p>
          ) : null}
        </div>

        <p className="sr-only">{ariaDescription}</p>

        <ControlsStack>
          <SliderRow
            label="a"
            ariaLabel={`Valor a en |x|=a, actualmente ${aL}`}
            value={a}
            min={-3}
            max={5}
            step={0.1}
            onChange={(val) => setA(snap(val, -3, 5, 0.1))}
          />
          <p className="text-xs text-[var(--fg-muted)]">
            a puede ser negativo para ver el caso imposible. Recuerda: una distancia no puede ser
            negativa (|x|≥0 siempre).
          </p>
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
