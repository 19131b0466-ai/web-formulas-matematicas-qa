'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from './controls';
import { linspace } from './math2d';

const ZERO_EPS = 1e-9;
const GRAPH_W = 420;
const GRAPH_H = 220;
const LINE_W = 420;
const LINE_H = 88;

type FunKind = 'poly' | 'rational' | 'radical' | 'log';

function present(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '—';
  return fmt(Number(n.toFixed(digits)), digits);
}

function formatBSub(b: number): string {
  if (Math.abs(b) < ZERO_EPS) return '';
  return b > 0 ? `−${present(b)}` : `+${present(-b)}`;
}

function evalF(kind: FunKind, b: number, x: number): number {
  if (kind === 'poly') return x * x + 1;
  if (kind === 'rational') {
    if (Math.abs(x - b) < 1e-4) return NaN;
    return 1 / (x - b);
  }
  if (kind === 'radical') {
    if (x < b - ZERO_EPS) return NaN;
    return Math.sqrt(Math.max(0, x - b));
  }
  if (x <= b + ZERO_EPS) return NaN;
  return Math.log(x - b);
  return NaN;
}

function buildPaths(
  kind: FunKind,
  b: number,
  toX: (x: number) => number,
  toY: (y: number) => number,
  xMin: number,
  xMax: number,
): string[] {
  const paths: string[] = [];
  const yCap = 8;

  if (kind === 'rational') {
    const eps = 0.06;
    for (const [lo, hi] of [
      [xMin, b - eps],
      [b + eps, xMax],
    ] as const) {
      if (hi <= lo) continue;
      const xs = linspace(lo, hi, 100);
      const pts = xs
        .map((x) => ({ x, y: evalF(kind, b, x) }))
        .filter((p) => Number.isFinite(p.y) && Math.abs(p.y) <= yCap)
        .map((p) => `${toX(p.x)},${toY(p.y)}`);
      if (pts.length >= 2) paths.push(`M${pts.join(' L')}`);
    }
    return paths;
  }

  const xs = linspace(xMin, xMax, 160);
  let segment: string[] = [];
  for (const x of xs) {
    const y = evalF(kind, b, x);
    if (!Number.isFinite(y) || Math.abs(y) > yCap) {
      if (segment.length >= 2) paths.push(`M${segment.join(' L')}`);
      segment = [];
      continue;
    }
    segment.push(`${toX(x)},${toY(y)}`);
  }
  if (segment.length >= 2) paths.push(`M${segment.join(' L')}`);
  return paths;
}

/**
 * Domain Dom(f) = {x : f(x) is defined} (ALG-FUN-001).
 */
export function DomainViz() {
  const [kind, setKind] = useState<FunKind>('rational');
  const [b, setB] = useState(2);
  const guideId = useId();
  const statusId = useId();

  const bL = present(b);
  const needsB = kind !== 'poly';

  const meta = useMemo(() => {
    switch (kind) {
      case 'poly':
        return {
          label: 'Polinómica',
          expr: 'f(x)=x²+1',
          condition: 'Siempre definida para todo x real',
          restriction: 'Sin restricción',
          domainSet: 'ℝ',
          domainInterval: '(−∞,∞)',
          hasAsymptote: false,
        };
      case 'rational':
        return {
          label: 'Racional',
          expr: Math.abs(b) < ZERO_EPS ? 'f(x)=1/x' : `f(x)=1/(x${formatBSub(b)})`,
          condition: 'x−b≠0',
          restriction: `x≠${bL}`,
          domainSet: `ℝ∖{${bL}}`,
          domainInterval: `(−∞,${bL})∪(${bL},∞)`,
          hasAsymptote: true,
        };
      case 'radical':
        return {
          label: 'Radical',
          expr: Math.abs(b) < ZERO_EPS ? 'f(x)=√x' : `f(x)=√(x${formatBSub(b)})`,
          condition: 'x−b≥0',
          restriction: `x≥${bL}`,
          domainSet: `[${bL},∞)`,
          domainInterval: `[${bL},∞)`,
          hasAsymptote: false,
        };
      case 'log':
        return {
          label: 'Logarítmica',
          expr: Math.abs(b) < ZERO_EPS ? 'f(x)=ln(x)' : `f(x)=ln(x${formatBSub(b)})`,
          condition: 'x−b>0',
          restriction: `x>${bL}`,
          domainSet: `(${bL},∞)`,
          domainInterval: `(${bL},∞)`,
          hasAsymptote: false,
        };
    }
  }, [kind, b, bL]);

  const view = useMemo(() => {
    const pad = 2.5;
    const xMin = Math.min(-4, b - pad);
    const xMax = Math.max(6, b + pad);
    const yMin = -4;
    const yMax = 6;
    return { xMin, xMax, yMin, yMax };
  }, [b]);

  const { xMin, xMax, yMin, yMax } = view;
  const padG = 36;
  const plotW = GRAPH_W - padG * 2;
  const plotH = GRAPH_H - padG * 2;

  const toX = (x: number) => padG + ((x - xMin) / (xMax - xMin)) * plotW;
  const toY = (y: number) => padG + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

  const paths = useMemo(
    () => buildPaths(kind, b, toX, toY, xMin, xMax),
    // toX/toY depend on view bounds; xMin/xMax capture that.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable mapping for fixed view box
    [kind, b, xMin, xMax, yMin, yMax],
  );

  const linePad = 28;
  const linePlotW = LINE_W - linePad * 2;
  const lineX = (x: number) => linePad + ((x - xMin) / (xMax - xMin)) * linePlotW;
  const lineAxisY = LINE_H / 2 + 6;

  const ticks = useMemo(() => {
    const out: number[] = [];
    const step = (xMax - xMin) > 12 ? 2 : 1;
    for (let t = Math.ceil(xMin); t <= Math.floor(xMax); t += step) out.push(t);
    if (!out.includes(0) && xMin < 0 && xMax > 0) out.push(0);
    if (needsB && !out.includes(b)) out.push(b);
    return out.sort((a, c) => a - c);
  }, [xMin, xMax, b, needsB]);

  const domainShades = useMemo(() => {
    if (kind === 'poly') {
      return [{ x: lineX(xMin), w: linePlotW }];
    }
    if (kind === 'rational') {
      const xb = lineX(b);
      return [
        { x: lineX(xMin), w: xb - lineX(xMin) },
        { x: xb, w: lineX(xMax) - xb },
      ];
    }
    return [{ x: lineX(b), w: lineX(xMax) - lineX(b) }];
  }, [kind, b, xMin, xMax, linePad, linePlotW]);

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            El dominio es el conjunto de valores de x para los cuales la función está definida:
            Dom(f)=&#123;x∈ℝ : f(x) está definida&#125;.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Relaciona la expresión, la gráfica y los valores permitidos sobre el eje x. La recta
            del dominio (abajo) muestra solo entradas válidas, no la gráfica y=f(x).
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Tipo de función
          </p>
          <ButtonRow>
            <VizButton active={kind === 'poly'} onClick={() => setKind('poly')}>
              Polinómica
            </VizButton>
            <VizButton active={kind === 'rational'} onClick={() => setKind('rational')}>
              Racional
            </VizButton>
            <VizButton active={kind === 'radical'} onClick={() => setKind('radical')}>
              Radical
            </VizButton>
            <VizButton active={kind === 'log'} onClick={() => setKind('log')}>
              Logarítmica
            </VizButton>
          </ButtonRow>
        </section>

        {needsB ? (
          <SliderRow
            label="b"
            ariaLabel="Parámetro b"
            value={b}
            min={-3}
            max={5}
            step={0.5}
            onChange={setB}
          />
        ) : null}

        <section className="space-y-2 rounded-xl border border-[var(--border)] px-3 py-3 text-sm leading-relaxed">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            De la expresión al dominio
          </p>
          <p className="font-mono">Expresión · {meta.expr}</p>
          <p className="text-[var(--fg-muted)]">↓</p>
          <p className="font-mono">Condición · {meta.condition}</p>
          <p className="text-[var(--fg-muted)]">↓</p>
          <p className="font-mono">Restricción · {meta.restriction}</p>
          <p className="text-[var(--fg-muted)]">↓</p>
          <p className="font-mono font-semibold text-[var(--accent-strong)]">
            Dominio · Dom(f)={meta.domainSet}
          </p>
          {kind === 'rational' ? (
            <p className="text-sm text-[var(--fg-muted)]">
              En f(x)=1/(x−b), x=b hace cero el denominador. Por eso ese valor queda excluido del
              dominio.
            </p>
          ) : null}
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Gráfica y=f(x)
          </p>
          <div className="mt-2 overflow-x-auto">
            <svg
              viewBox={`0 0 ${GRAPH_W} ${GRAPH_H}`}
              className="mx-auto h-auto w-full max-w-xl"
              role="img"
              aria-label={`Gráfica de ${meta.expr}`}
            >
              <line
                x1={padG}
                y1={toY(0)}
                x2={GRAPH_W - padG}
                y2={toY(0)}
                stroke="currentColor"
                strokeWidth={1}
                opacity={0.25}
              />
              <line
                x1={toX(0)}
                y1={padG}
                x2={toX(0)}
                y2={GRAPH_H - padG}
                stroke="currentColor"
                strokeWidth={1}
                opacity={0.25}
              />
              {meta.hasAsymptote ? (
                <>
                  <line
                    x1={toX(b)}
                    y1={padG}
                    x2={toX(b)}
                    y2={GRAPH_H - padG}
                    stroke="var(--accent-strong)"
                    strokeWidth={1.5}
                    strokeDasharray="6 4"
                  />
                  <text
                    x={toX(b) + 6}
                    y={padG + 14}
                    fontSize={11}
                    fill="var(--accent-strong)"
                    fontWeight={600}
                  >
                    x={bL}: función no definida
                  </text>
                </>
              ) : null}
              {paths.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke="var(--accent-strong)"
                  strokeWidth={2.5}
                />
              ))}
            </svg>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Recta del dominio (solo valores de x permitidos)
          </p>
          <div className="mt-2 overflow-x-auto">
            <svg
              viewBox={`0 0 ${LINE_W} ${LINE_H}`}
              className="mx-auto h-auto w-full max-w-xl"
              role="img"
              aria-labelledby={statusId}
            >
              {domainShades.map((seg, i) => (
                <rect
                  key={i}
                  x={seg.x}
                  y={lineAxisY - 14}
                  width={Math.max(0, seg.w)}
                  height={28}
                  fill="var(--accent-soft)"
                  opacity={0.95}
                />
              ))}
              <line
                x1={linePad}
                y1={lineAxisY}
                x2={LINE_W - linePad}
                y2={lineAxisY}
                stroke="currentColor"
                strokeWidth={2}
                opacity={0.45}
              />
              {ticks.map((t) => (
                <g key={t}>
                  <line
                    x1={lineX(t)}
                    y1={lineAxisY - 6}
                    x2={lineX(t)}
                    y2={lineAxisY + 6}
                    stroke="currentColor"
                    strokeWidth={1.5}
                    opacity={0.4}
                  />
                  <text
                    x={lineX(t)}
                    y={lineAxisY + 22}
                    textAnchor="middle"
                    fontSize={11}
                    fill="currentColor"
                    opacity={0.7}
                  >
                    {present(t, 0)}
                  </text>
                </g>
              ))}
              {needsB ? (
                <circle
                  cx={lineX(b)}
                  cy={lineAxisY}
                  r={7}
                  fill={kind === 'radical' ? 'var(--accent-strong)' : 'var(--bg)'}
                  stroke="var(--accent-strong)"
                  strokeWidth={2}
                />
              ) : null}
            </svg>
          </div>
          <p id={statusId} className="mt-2 font-mono text-sm">
            Dom(f)={meta.domainSet}={meta.domainInterval}
          </p>
          {kind === 'rational' ? (
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              Círculo abierto en x={bL}: valor excluido (asíntota vertical en la gráfica).
            </p>
          ) : kind === 'radical' ? (
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              Punto cerrado en x={bL}: el extremo del dominio está incluido.
            </p>
          ) : kind === 'log' ? (
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              Círculo abierto en x={bL}: ln(x−b) requiere x&gt;{bL}.
            </p>
          ) : null}
        </section>

        <div
          className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_70%,var(--bg-elevated))] px-3 py-2 text-sm leading-relaxed"
          aria-live="polite"
        >
          <p className="font-mono">
            {meta.expr} · Dom(f)={meta.domainSet}
          </p>
        </div>

        <ControlsStack>
          <p className="text-xs text-[var(--fg-muted)]">
            {needsB
              ? 'Mueve b y observa cómo el valor excluido, la asíntota y el dominio se desplazan juntos.'
              : 'Cambia el tipo de función y compara cómo cambian la condición y el dominio.'}
          </p>
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
