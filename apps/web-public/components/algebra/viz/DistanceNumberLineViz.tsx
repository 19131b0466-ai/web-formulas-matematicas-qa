'use client';

import { useId, useMemo, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel, fmt } from './controls';

const X_MIN = -5;
const X_MAX = 5;
const ZERO_EPS = 1e-9;

function snap(val: number, min: number, max: number, step: number): number {
  const clamped = Math.min(max, Math.max(min, val));
  const steps = Math.round((clamped - min) / step);
  const snapped = min + steps * step;
  if (Math.abs(snapped) < step / 2) return 0;
  return Number(snapped.toFixed(1));
}

/** Inside of |a−b| with safe parentheses for negatives. */
function formatDiffInside(a: number, b: number): string {
  const left = fmt(a);
  if (b < 0) return `${left}−(${fmt(b)})`;
  return `${left}−${fmt(b)}`;
}

/**
 * Distance on the real line: d(a,b)=|a−b| (ALG-FND-007).
 * Single sources of truth: a and b. Distance never inferred from pixels.
 */
export function DistanceNumberLineViz() {
  const [a, setA] = useState(-1.4);
  const [b, setB] = useState(1.9);
  const guideId = useId();
  const titleId = useId();
  const descId = useId();

  const d = Math.abs(a - b);
  const equal = d < ZERO_EPS;
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const diff = a - b;

  const W = 560;
  const H = 178;
  const pad = 36;
  const axisY = 96;
  const span = X_MAX - X_MIN;
  const toX = (val: number) => pad + ((val - X_MIN) / span) * (W - 2 * pad);

  const ticks = useMemo(() => [-4, -2, 0, 2, 4], []);

  const aLabel = fmt(a);
  const bLabel = fmt(b);
  const dLabel = fmt(d);
  const diffInside = formatDiffInside(a, b);
  const diffLabel = fmt(diff);

  const close = !equal && d < 0.35;
  // When close, put a label above and b below to avoid overlap (no fake horizontal separation).
  const aLabelY = axisY - 34;
  const bLabelY = close || equal ? axisY + 42 : axisY - 34;
  const distLabelY = close ? axisY - 52 : axisY - 28;

  const ariaDescription = equal
    ? `a y b valen ${aLabel}. La distancia entre ambos es 0.`
    : `a vale ${aLabel} y b vale ${bLabel}. La distancia entre ambos es ${dLabel}.`;

  return (
    <VizPanel>
      <div className="space-y-3">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            La distancia entre dos números reales es la longitud del segmento que los separa en la
            recta numérica. Se calcula como <span className="font-mono">|a−b|</span>.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Mueve <span className="font-mono">a</span> y <span className="font-mono">b</span>.
            Observa que la distancia depende de cuánto están separados y no de cuál aparece primero.
          </p>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-labelledby={titleId}
          aria-describedby={descId}
        >
          <title id={titleId}>{`Distancia d(a,b)=${dLabel}`}</title>
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

          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={toX(t)}
                y1={axisY - 6}
                x2={toX(t)}
                y2={axisY + 6}
                stroke="currentColor"
                strokeWidth={1.5}
                opacity={0.45}
              />
              <text
                x={toX(t)}
                y={axisY + 22}
                textAnchor="middle"
                fontSize={11}
                fill="currentColor"
                opacity={0.7}
              >
                {t}
              </text>
            </g>
          ))}

          {/* Distance segment min→max */}
          {!equal ? (
            <>
              <line
                x1={toX(lo)}
                y1={axisY}
                x2={toX(hi)}
                y2={axisY}
                stroke="var(--accent-strong)"
                strokeWidth={6}
                strokeLinecap="round"
              />
              {/* Bidirectional indicator */}
              <line
                x1={toX(lo)}
                y1={distLabelY + 8}
                x2={toX(hi)}
                y2={distLabelY + 8}
                stroke="currentColor"
                strokeWidth={1.5}
                opacity={0.55}
              />
              <polygon
                points={`${toX(lo)},${distLabelY + 8} ${toX(lo) + 6},${distLabelY + 4} ${toX(lo) + 6},${distLabelY + 12}`}
                fill="currentColor"
                opacity={0.55}
              />
              <polygon
                points={`${toX(hi)},${distLabelY + 8} ${toX(hi) - 6},${distLabelY + 4} ${toX(hi) - 6},${distLabelY + 12}`}
                fill="currentColor"
                opacity={0.55}
              />
              <text
                x={(toX(lo) + toX(hi)) / 2}
                y={distLabelY}
                textAnchor="middle"
                fontSize={12}
                fontWeight={600}
                fill="currentColor"
              >
                {`d(a,b)=${dLabel}`}
              </text>
            </>
          ) : (
            <text x={toX(a)} y={distLabelY} textAnchor="middle" fontSize={12} fill="currentColor">
              {`d(a,a)=0`}
            </text>
          )}

          {/* Point a — filled circle */}
          <circle
            cx={toX(a)}
            cy={axisY}
            r={equal ? 9 : 8}
            fill="var(--accent-strong)"
            stroke="var(--bg-elevated)"
            strokeWidth={2}
          />
          {/* Point b — ring / diamond-ish via square rotated when not equal; ring when distinct */}
          {!equal ? (
            <>
              <circle
                cx={toX(b)}
                cy={axisY}
                r={8}
                fill="var(--bg-elevated)"
                stroke="currentColor"
                strokeWidth={2.5}
              />
              <circle cx={toX(b)} cy={axisY} r={3} fill="currentColor" />
            </>
          ) : (
            <rect
              x={toX(a) - 5}
              y={axisY - 5}
              width={10}
              height={10}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              transform={`rotate(45 ${toX(a)} ${axisY})`}
            />
          )}

          <text
            x={toX(a)}
            y={aLabelY}
            textAnchor={a < -3.5 ? 'start' : a > 3.5 ? 'end' : 'middle'}
            fontSize={12}
            fontWeight={600}
            fill="currentColor"
          >
            {equal ? `a = b = ${aLabel}` : `a = ${aLabel}`}
          </text>
          {!equal ? (
            <text
              x={toX(b)}
              y={bLabelY}
              textAnchor={b < -3.5 ? 'start' : b > 3.5 ? 'end' : 'middle'}
              fontSize={12}
              fontWeight={600}
              fill="currentColor"
            >
              {`b = ${bLabel}`}
            </text>
          ) : null}
        </svg>

        {/* Algebraic development */}
        <div
          className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_70%,var(--bg-elevated))] px-3 py-2 font-mono text-sm leading-relaxed"
          aria-live="polite"
        >
          {equal ? (
            <p>
              d(a,a)=|a−a|=|{aLabel}−{aLabel}|=0
            </p>
          ) : (
            <>
              <p>d(a,b)=|a−b|</p>
              <p>
                =|{diffInside}|
              </p>
              <p>
                =|{diffLabel}|
              </p>
              <p>= {dLabel}</p>
            </>
          )}
        </div>

        <div className="grid gap-1 rounded-lg border border-[var(--border)] px-3 py-2 font-mono text-sm sm:grid-cols-3">
          <p>
            <span className="text-[var(--fg-muted)]">a = </span>
            {aLabel}
          </p>
          <p>
            <span className="text-[var(--fg-muted)]">b = </span>
            {bLabel}
          </p>
          <p>
            <span className="text-[var(--fg-muted)]">distancia = </span>
            {dLabel}
          </p>
        </div>

        <p className="text-xs leading-relaxed text-[var(--fg-muted)]">
          El valor absoluto hace que la distancia siempre sea no negativa. Además{' '}
          <span className="font-mono">d(a,b)=d(b,a)</span>
          {equal ? (
            <>
              {' '}
              y <span className="font-mono">d(a,b)=0 ⇔ a=b</span>
            </>
          ) : null}
          .
        </p>

        <ControlsStack>
          <SliderRow
            label="a"
            ariaLabel="Valor de a"
            value={a}
            min={X_MIN}
            max={X_MAX}
            step={0.1}
            onChange={(val) => setA(snap(val, X_MIN, X_MAX, 0.1))}
          />
          <SliderRow
            label="b"
            ariaLabel="Valor de b"
            value={b}
            min={X_MIN}
            max={X_MAX}
            step={0.1}
            onChange={(val) => setB(snap(val, X_MIN, X_MAX, 0.1))}
          />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
