'use client';

import { useId, useMemo, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel, fmt } from './controls';
import { linspace } from './math2d';

const ZERO_EPS = 1e-9;
const W = 420;
const H = 240;
const VIEW = { xMin: -6, xMax: 6, yMin: -3, yMax: 8 };
const MARGIN = { l: 34, r: 16, t: 20, b: 26 };

function present(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '—';
  return fmt(Number(n.toFixed(digits)), digits);
}

function snap(val: number, min: number, max: number, step: number): number {
  const clamped = Math.min(max, Math.max(min, val));
  const steps = Math.round((clamped - min) / step);
  const snapped = min + steps * step;
  if (Math.abs(snapped) < step / 2) return 0;
  return Number(snapped.toFixed(2));
}

function formatSigned(n: number): string {
  if (Math.abs(n) < ZERO_EPS) return '0';
  return n > 0 ? present(n) : `−${present(Math.abs(n))}`;
}

function formatGExpr(h: number, k: number): string {
  const hAbs = Math.abs(h);
  const hPart =
    Math.abs(h) < ZERO_EPS
      ? 'x'
      : h > 0
        ? `x−${present(hAbs)}`
        : `x+${present(hAbs)}`;
  const kAbs = Math.abs(k);
  if (Math.abs(k) < ZERO_EPS) return `g(x)=(${hPart})²`;
  return k > 0 ? `g(x)=(${hPart})²+${present(kAbs)}` : `g(x)=(${hPart})²−${present(kAbs)}`;
}

/**
 * Translations g(x)=f(x−h)+k preserving shape (ALG-FUN-007).
 */
export function TranslationViz() {
  const [h, setH] = useState(2);
  const [k, setK] = useState(-1);
  const guideId = useId();
  const statusId = useId();

  const f = (x: number) => x * x;
  const g = (x: number) => f(x - h) + k;

  const x0 = 0;
  const y0 = f(x0);
  const px = x0;
  const py = y0;
  const ppx = x0 + h;
  const ppy = y0 + k;

  const plotW = W - MARGIN.l - MARGIN.r;
  const plotH = H - MARGIN.t - MARGIN.b;
  const toX = (x: number) => MARGIN.l + ((x - VIEW.xMin) / (VIEW.xMax - VIEW.xMin)) * plotW;
  const toY = (y: number) => MARGIN.t + ((VIEW.yMax - y) / (VIEW.yMax - VIEW.yMin)) * plotH;

  const basePath = useMemo(() => {
    const xs = linspace(VIEW.xMin, VIEW.xMax, 160);
    const pts = xs
      .map((x) => ({ x, y: f(x) }))
      .filter((p) => p.y >= VIEW.yMin && p.y <= VIEW.yMax)
      .map((p) => `${toX(p.x)},${toY(p.y)}`);
    return pts.length >= 2 ? `M${pts.join(' L')}` : '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gPath = useMemo(() => {
    const xs = linspace(VIEW.xMin, VIEW.xMax, 160);
    const pts = xs
      .map((x) => ({ x, y: g(x) }))
      .filter((p) => p.y >= VIEW.yMin && p.y <= VIEW.yMax)
      .map((p) => `${toX(p.x)},${toY(p.y)}`);
    return pts.length >= 2 ? `M${pts.join(' L')}` : '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [h, k]);

  const hDesc =
    h > ZERO_EPS
      ? `Desplazamiento horizontal: ${present(h)} unidades hacia la derecha.`
      : h < -ZERO_EPS
        ? `Desplazamiento horizontal: ${present(Math.abs(h))} unidades hacia la izquierda.`
        : 'Sin desplazamiento horizontal.';
  const kDesc =
    k > ZERO_EPS
      ? `Desplazamiento vertical: ${present(k)} unidades hacia arriba.`
      : k < -ZERO_EPS
        ? `Desplazamiento vertical: ${present(Math.abs(k))} unidades hacia abajo.`
        : 'Sin desplazamiento vertical.';

  const noShift = Math.abs(h) < ZERO_EPS && Math.abs(k) < ZERO_EPS;
  const onlyH = Math.abs(h) > ZERO_EPS && Math.abs(k) < ZERO_EPS;
  const onlyK = Math.abs(h) < ZERO_EPS && Math.abs(k) > ZERO_EPS;

  const status =
    noShift
      ? 'Sin traslación: g(x)=f(x).'
      : onlyH
        ? 'Solo traslación horizontal.'
        : onlyK
          ? 'Solo traslación vertical.'
          : 'Traslación horizontal y vertical.';

  const eq = formatGExpr(h, k);

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            En g(x)=f(x−h)+k, h desplaza la gráfica horizontalmente y k verticalmente. Su forma no
            cambia.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Mueve h y observa cómo todos los puntos se desplazan a izquierda o derecha. Mueve k y
            observa cómo la gráfica completa sube o baja. Aunque aparece x−h, un h positivo mueve la
            gráfica hacia la derecha.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Ecuación dinámica
          </p>
          <p className="mt-1 font-mono text-lg font-semibold text-[var(--accent-strong)]">{eq}</p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">f(x)=x² · g(x)=f(x−h)+k</p>
          <p className="mt-1 text-sm">{hDesc}</p>
          <p className="text-sm">{kDesc}</p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <div className="mb-2 flex flex-wrap gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-current opacity-50" />
              Función original f(x)
            </span>
            <span className="inline-flex items-center gap-1.5 text-teal">
              <span className="inline-block h-0.5 w-4 bg-teal" />
              Función trasladada g(x)
            </span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-xl" role="img" aria-labelledby={statusId}>
            <line x1={toX(VIEW.xMin)} y1={toY(0)} x2={toX(VIEW.xMax)} y2={toY(0)} stroke="currentColor" strokeWidth={1.5} opacity={0.4} />
            <line x1={toX(0)} y1={toY(VIEW.yMin)} x2={toX(0)} y2={toY(VIEW.yMax)} stroke="currentColor" strokeWidth={1.5} opacity={0.4} />
            {basePath ? (
              <path d={basePath} fill="none" stroke="currentColor" strokeWidth={2} strokeDasharray="5 4" opacity={0.45} />
            ) : null}
            {gPath ? <path d={gPath} fill="none" stroke="teal" strokeWidth={2.5} /> : null}

            <circle cx={toX(px)} cy={toY(py)} r={6} fill="currentColor" opacity={0.7} />
            <text x={toX(px) + 8} y={toY(py) - 6} fontSize={10}>
              P=({present(px)},{present(py)})
            </text>
            <circle cx={toX(ppx)} cy={toY(ppy)} r={6} fill="teal" />
            <text x={toX(ppx) + 8} y={toY(ppy) - 6} fontSize={10} fill="teal">
              P&apos;=({present(ppx)},{present(ppy)})
            </text>
            {!noShift ? (
              <>
                <defs>
                  <marker id="arrow-t" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="orange" />
                  </marker>
                </defs>
                <line
                  x1={toX(px)}
                  y1={toY(py)}
                  x2={toX(ppx)}
                  y2={toY(ppy)}
                  stroke="orange"
                  strokeWidth={1.75}
                  markerEnd="url(#arrow-t)"
                />
                <text x={(toX(px) + toX(ppx)) / 2} y={(toY(py) + toY(ppy)) / 2 - 8} fontSize={10} fill="orange" textAnchor="middle">
                  t⃗=({formatSigned(h)},{formatSigned(k)})
                </text>
              </>
            ) : null}
          </svg>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            El vértice (0,0) de f se transforma en (h,k)=({present(h)},{present(k)}). Δx=h · Δy=k.
          </p>
        </section>

        <div id={statusId} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" aria-live="polite">
          <p className="font-mono">
            h={present(h)}, k={present(k)} · t⃗=({formatSigned(h)},{formatSigned(k)})
          </p>
          <p className="mt-1 text-[var(--fg-muted)]">{status}</p>
        </div>

        <ControlsStack>
          <SliderRow label="h — horizontal" value={h} min={-4} max={4} step={0.1} onChange={(v) => setH(snap(v, -4, 4, 0.1))} />
          <SliderRow label="k — vertical" value={k} min={-3} max={4} step={0.1} onChange={(v) => setK(snap(v, -3, 4, 0.1))} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
