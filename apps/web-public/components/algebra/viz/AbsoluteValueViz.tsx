'use client';

import { useId, useMemo, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel, fmt } from './controls';

const X_MIN = -5;
const X_MAX = 5;
const ZERO_EPS = 1e-9;

type AbsState = 'negative' | 'zero' | 'positive';

function absStateOf(x: number): AbsState {
  if (x < -ZERO_EPS) return 'negative';
  if (x > ZERO_EPS) return 'positive';
  return 'zero';
}

function algebraicRule(state: AbsState): string {
  if (state === 'negative') return 'x<0 ⇒ |x|=−x';
  if (state === 'positive') return 'x>0 ⇒ |x|=x';
  return '|0|=0';
}

/**
 * Absolute value as distance from x to 0 on the number line (ALG-FND-006).
 * Single source of truth: `x`. No arc from x to +|x|.
 */
export function AbsoluteValueViz() {
  const [x, setX] = useState(-3);
  const guideId = useId();
  const titleId = useId();
  const descId = useId();

  const absX = Math.abs(x);
  const state = absStateOf(x);
  const rule = algebraicRule(state);
  const showSegment = state !== 'zero';
  // Optional secondary: reflection of x across 0 (never labeled as distance).
  const showMirror = state === 'negative';

  const W = 560;
  const H = 168;
  const pad = 36;
  const axisY = 88;
  const span = X_MAX - X_MIN;
  const toX = (val: number) => pad + ((val - X_MIN) / span) * (W - 2 * pad);

  const ticks = useMemo(() => [-4, -2, 0, 2, 4], []);

  const xLabel = fmt(x);
  const absLabel = fmt(absX);
  const ariaDescription =
    state === 'zero'
      ? `x es 0. Su distancia al cero es 0. Por tanto, el valor absoluto de 0 es 0.`
      : `x es ${xLabel}. Su distancia al cero es ${absLabel}. Por tanto, el valor absoluto de ${xLabel} es ${absLabel}.`;

  // Place the x label above the point, nudging inward near ends to reduce clipping.
  const xLabelAnchor = x < -3.5 ? 'start' : x > 3.5 ? 'end' : 'middle';
  const distLabelX = toX((x + 0) / 2);
  const distLabelY = axisY - 22;

  return (
    <VizPanel>
      <div className="space-y-3">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            El valor absoluto de <span className="font-mono">x</span> es la distancia entre{' '}
            <span className="font-mono">x</span> y <span className="font-mono">0</span> en la recta
            numérica.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Mueve <span className="font-mono">x</span> y observa que la distancia al cero nunca es
            negativa.
          </p>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-labelledby={titleId}
          aria-describedby={descId}
        >
          <title id={titleId}>{`Valor absoluto: distancia de x=${xLabel} al 0`}</title>
          <desc id={descId}>{ariaDescription}</desc>

          {/* Axis */}
          <line
            x1={pad}
            y1={axisY}
            x2={W - pad}
            y2={axisY}
            stroke="currentColor"
            strokeWidth={2}
            opacity={0.4}
          />

          {/* Ticks + labels; 0 emphasized */}
          {ticks.map((t) => {
            const isZero = t === 0;
            return (
              <g key={t}>
                <line
                  x1={toX(t)}
                  y1={axisY - (isZero ? 10 : 6)}
                  x2={toX(t)}
                  y2={axisY + (isZero ? 10 : 6)}
                  stroke="currentColor"
                  strokeWidth={isZero ? 2.5 : 1.5}
                  opacity={isZero ? 0.95 : 0.45}
                />
                <text
                  x={toX(t)}
                  y={axisY + 26}
                  textAnchor="middle"
                  fontSize={isZero ? 13 : 11}
                  fontWeight={isZero ? 600 : 400}
                  fill="currentColor"
                  opacity={isZero ? 0.95 : 0.7}
                >
                  {t}
                </text>
              </g>
            );
          })}

          {/* Origin marker (dot on 0) */}
          <circle cx={toX(0)} cy={axisY} r={3.5} fill="currentColor" opacity={0.55} />

          {/* Optional mirror of x (reflection), never presented as distance */}
          {showMirror ? (
            <g opacity={0.55}>
              <circle
                cx={toX(-x)}
                cy={axisY}
                r={5}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeDasharray="3 2"
              />
              <text
                x={toX(-x)}
                y={axisY + 44}
                textAnchor="middle"
                fontSize={10}
                fill="currentColor"
              >
                −x (reflejo)
              </text>
            </g>
          ) : null}

          {/* Distance segment: only between x and 0 */}
          {showSegment ? (
            <>
              <line
                x1={toX(x)}
                y1={axisY}
                x2={toX(0)}
                y2={axisY}
                stroke="var(--accent-strong)"
                strokeWidth={6}
                strokeLinecap="round"
              />
              <text
                x={distLabelX}
                y={distLabelY}
                textAnchor="middle"
                fontSize={12}
                fill="currentColor"
              >
                {`distancia al 0 = |x| = ${absLabel}`}
              </text>
            </>
          ) : (
            <text x={toX(0)} y={distLabelY} textAnchor="middle" fontSize={12} fill="currentColor">
              distancia al 0 = 0
            </text>
          )}

          {/* Point x */}
          <circle
            cx={toX(x)}
            cy={axisY}
            r={8}
            fill="var(--accent-strong)"
            stroke="var(--bg-elevated)"
            strokeWidth={2}
          />
          <text
            x={toX(x)}
            y={axisY - 36}
            textAnchor={xLabelAnchor}
            fontSize={13}
            fontWeight={600}
            fill="currentColor"
          >
            {`x=${xLabel}`}
          </text>

          {/* Algebraic rule badge */}
          <rect
            x={pad}
            y={H - 34}
            width={Math.min(220, W - 2 * pad)}
            height={26}
            rx={6}
            fill="var(--accent-soft)"
            stroke="var(--border)"
          />
          <text x={pad + 12} y={H - 16} fontSize={12} fill="currentColor">
            {rule}
          </text>
        </svg>

        {/* Structured status (not a debug dump) */}
        <div
          className="grid gap-1 rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_70%,var(--bg-elevated))] px-3 py-2 font-mono text-sm sm:grid-cols-3"
          aria-live="polite"
        >
          <p>
            <span className="text-[var(--fg-muted)]">x=</span>
            {xLabel}
          </p>
          <p>
            <span className="text-[var(--fg-muted)]">distancia al 0=</span>
            {absLabel}
          </p>
          <p>
            <span className="text-[var(--fg-muted)]">{`|${xLabel}|=`}</span>
            {absLabel}
          </p>
        </div>

        <p className="text-xs leading-relaxed text-[var(--fg-muted)]">
          Los números opuestos están a la misma distancia del cero. Ejemplo:{' '}
          <span className="font-mono">|−2|=|2|=2</span>.
        </p>

        <ControlsStack>
          <SliderRow
            label="x"
            value={x}
            min={X_MIN}
            max={X_MAX}
            step={0.1}
            onChange={(val) => setX(clampToStep(val, X_MIN, X_MAX, 0.1))}
          />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

function clampToStep(val: number, min: number, max: number, step: number): number {
  const clamped = Math.min(max, Math.max(min, val));
  const steps = Math.round((clamped - min) / step);
  const snapped = min + steps * step;
  // Avoid −0 display / float drift near zero
  if (Math.abs(snapped) < step / 2) return 0;
  return Number(snapped.toFixed(1));
}
