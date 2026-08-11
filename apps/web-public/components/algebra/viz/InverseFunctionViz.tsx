'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from './controls';
import { linspace } from './math2d';

const ZERO_EPS = 1e-9;
const W = 420;
const H = 240;
const VIEW = { xMin: -5, xMax: 5, yMin: -2, yMax: 8 };
const MARGIN = { l: 34, r: 16, t: 20, b: 26 };

type FunKind = 'quadratic' | 'linear';

function present(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '—';
  return fmt(Number(n.toFixed(digits)), digits);
}

function snap(val: number, min: number, max: number, step: number): number {
  const clamped = Math.min(max, Math.max(min, val));
  const steps = Math.round((clamped - min) / step);
  return Number((min + steps * step).toFixed(2));
}

/**
 * Inverse function: reflection over y=x, injectivity, horizontal line test (ALG-FUN-003).
 */
export function InverseFunctionViz() {
  const [kind, setKind] = useState<FunKind>('quadratic');
  const [restricted, setRestricted] = useState(false);
  const [m, setM] = useState(2);
  const [b, setB] = useState(1);
  const [x0, setX0] = useState(2);
  const guideId = useId();
  const statusId = useId();

  const isQuad = kind === 'quadratic';
  const invertible = !isQuad || restricted;
  const xMinF = isQuad && restricted ? 0 : -5;

  const f = (x: number): number => (isQuad ? x * x : m * x + b);

  const y0 = f(x0);
  const px = x0;
  const py = y0;
  const ppx = py;
  const ppy = px;

  const plotW = W - MARGIN.l - MARGIN.r;
  const plotH = H - MARGIN.t - MARGIN.b;
  const toX = (x: number) => MARGIN.l + ((x - VIEW.xMin) / (VIEW.xMax - VIEW.xMin)) * plotW;
  const toY = (y: number) => MARGIN.t + ((VIEW.yMax - y) / (VIEW.yMax - VIEW.yMin)) * plotH;

  const fPaths = useMemo(() => {
    const paths: string[] = [];
    if (isQuad && !restricted) {
      const xs = linspace(xMinF, 5, 120);
      const pts = xs.map((x) => `${toX(x)},${toY(x * x)}`);
      if (pts.length >= 2) paths.push(`M${pts.join(' L')}`);
    } else if (isQuad && restricted) {
      const xs = linspace(0, 5, 80);
      const pts = xs.map((x) => `${toX(x)},${toY(x * x)}`);
      if (pts.length >= 2) paths.push(`M${pts.join(' L')}`);
      const xsFaded = linspace(-5, 0, 40);
      const faded = xsFaded.map((x) => `${toX(x)},${toY(x * x)}`);
      if (faded.length >= 2) paths.push(`M${faded.join(' L')}`);
    } else {
      const xs = linspace(VIEW.xMin, VIEW.xMax, 120);
      const pts = xs.map((x) => `${toX(x)},${toY(m * x + b)}`);
      if (pts.length >= 2) paths.push(`M${pts.join(' L')}`);
    }
    return paths;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, restricted, m, b]);

  const reflectPaths = useMemo(() => {
    const paths: string[] = [];
    if (isQuad && !restricted) {
      const ys = linspace(0, 8, 100);
      const upper = ys.map((y) => `${toX(y)},${toY(Math.sqrt(y))}`);
      const lower = ys.map((y) => `${toX(y)},${toY(-Math.sqrt(y))}`);
      if (upper.length >= 2) paths.push(`M${upper.join(' L')}`);
      if (lower.length >= 2) paths.push(`M${lower.join(' L')}`);
    } else if (isQuad && restricted) {
      const ys = linspace(0, 8, 80);
      const pts = ys.map((y) => `${toX(y)},${toY(Math.sqrt(y))}`);
      if (pts.length >= 2) paths.push(`M${pts.join(' L')}`);
    } else {
      const ys = linspace(VIEW.yMin, VIEW.yMax, 120);
      const pts = ys
        .map((y) => {
          const x = (y - b) / m;
          return Number.isFinite(x) ? `${toX(y)},${toY(x)}` : null;
        })
        .filter((p): p is string => p !== null);
      if (pts.length >= 2) paths.push(`M${pts.join(' L')}`);
    }
    return paths;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, restricted, m, b]);

  const diagPath = useMemo(() => {
    const lo = VIEW.xMin;
    const hi = VIEW.xMax;
    return `M${toX(lo)},${toY(lo)} L${toX(hi)},${toY(hi)}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showHLine = isQuad && !restricted && Math.abs(x0) > ZERO_EPS;
  const hLineY = isQuad ? x0 * x0 : 0;

  const fExpr = isQuad
    ? restricted
      ? 'f(x)=x², x≥0'
      : 'f(x)=x², x∈ℝ'
    : `f(x)=${present(m)}x${b >= 0 ? '+' : '−'}${present(Math.abs(b))}`;
  const invExpr = invertible
    ? isQuad
      ? 'f⁻¹(x)=√x'
      : `f⁻¹(x)=(x${b >= 0 ? '−' : '+'}${present(Math.abs(b))})/${present(m)}`
    : 'relación inversa — no es función';

  const reading =
    invertible && Number.isFinite(y0)
      ? `f(${present(px)})=${present(py)} ⟺ f⁻¹(${present(py)})=${present(px)}`
      : `f(${present(px)})=${present(py)}: dos entradas pueden dar la misma salida`;

  const domNote = invertible
    ? isQuad
      ? 'Dom(f⁻¹)=[0,∞) = Ran(f) · Ran(f⁻¹)=[0,∞) = Dom(f)'
      : 'Dom(f⁻¹)=ℝ = Ran(f) · Ran(f⁻¹)=ℝ = Dom(f)'
    : 'El reflejo sobre y=x existe como relación, pero no pasa la prueba de la línea vertical';

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Una función inversa deshace la función original: intercambia entradas y salidas.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Por eso los puntos (x,y) se convierten en (y,x), y las dos gráficas se reflejan respecto
            de y=x. f(x)=y ⟺ f⁻¹(y)=x.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="font-mono text-lg font-semibold text-[var(--accent-strong)]">{fExpr}</p>
          <p className="mt-1 font-mono text-sm text-[var(--fg)]">
            {invertible ? `y=f⁻¹(x): ${invExpr}` : invExpr}
          </p>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">{domNote}</p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-xl" role="img" aria-labelledby={statusId}>
              <line x1={toX(VIEW.xMin)} y1={toY(0)} x2={toX(VIEW.xMax)} y2={toY(0)} stroke="currentColor" strokeWidth={1.5} opacity={0.45} />
              <line x1={toX(0)} y1={toY(VIEW.yMin)} x2={toX(0)} y2={toY(VIEW.yMax)} stroke="currentColor" strokeWidth={1.5} opacity={0.45} />
              <path d={diagPath} fill="none" stroke="currentColor" strokeWidth={1.25} strokeDasharray="5 4" opacity={0.5} />
              <text x={toX(4.2)} y={toY(4.6)} fontSize={9} fill="currentColor" opacity={0.55}>y=x</text>

              {isQuad && restricted && fPaths[1] ? (
                <path d={fPaths[1]} fill="none" stroke="var(--accent-strong)" strokeWidth={2} opacity={0.2} strokeDasharray="4 3" />
              ) : null}
              {fPaths[0] ? (
                <path d={fPaths[0]} fill="none" stroke="var(--accent-strong)" strokeWidth={2.5} />
              ) : null}
              <text x={toX(3.5)} y={toY(9)} fontSize={10} fontWeight={600} fill="var(--accent-strong)">y=f(x)</text>

              {reflectPaths.map((d, i) => (
                <path key={i} d={d} fill="none" stroke="teal" strokeWidth={2} strokeDasharray={invertible ? undefined : '6 3'} opacity={0.9} />
              ))}
              <text x={toX(6)} y={toY(1.5)} fontSize={10} fontWeight={600} fill="teal">
                {invertible ? 'y=f⁻¹(x)' : 'relación inversa'}
              </text>

              {showHLine ? (
                <g>
                  <line x1={toX(-5)} y1={toY(hLineY)} x2={toX(5)} y2={toY(hLineY)} stroke="orange" strokeWidth={1.5} strokeDasharray="4 2" />
                  <circle cx={toX(-x0)} cy={toY(hLineY)} r={5} fill="orange" />
                  <circle cx={toX(x0)} cy={toY(hLineY)} r={5} fill="orange" />
                  <text x={toX(0)} y={toY(hLineY) - 8} textAnchor="middle" fontSize={9} fill="orange">
                    f(−{present(Math.abs(x0))})=f({present(x0)})={present(hLineY)}
                  </text>
                </g>
              ) : null}

              {Number.isFinite(py) && px >= xMinF - ZERO_EPS ? (
                <g>
                  <circle cx={toX(px)} cy={toY(py)} r={6} fill="var(--accent-strong)" />
                  <text x={toX(px) + 8} y={toY(py) - 6} fontSize={10} fill="currentColor">P=({present(px)},{present(py)})</text>
                  <circle cx={toX(ppx)} cy={toY(ppy)} r={6} fill="teal" />
                  <text x={toX(ppx) + 8} y={toY(ppy) + 14} fontSize={10} fill="teal">P&apos;=({present(ppx)},{present(ppy)})</text>
                  <line x1={toX(px)} y1={toY(py)} x2={toX(ppx)} y2={toY(ppy)} stroke="currentColor" strokeWidth={1} strokeDasharray="3 2" opacity={0.4} />
                </g>
              ) : null}
            </svg>
          </div>
        </section>

        <div id={statusId} className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_70%,var(--bg-elevated))] px-3 py-2 text-sm" aria-live="polite">
          <p className="font-mono">{reading}</p>
          {isQuad && !restricted ? (
            <p className="mt-1 text-[var(--fg-muted)]">
              Dos entradas distintas producen la misma salida. No es inyectiva. No tiene función
              inversa en todo ℝ. El reflejo x=y² da y=±√x (falla la prueba de la línea vertical).
            </p>
          ) : isQuad && restricted ? (
            <p className="mt-1 text-[var(--fg-muted)]">
              Con x≥0 la función es inyectiva: el reflejo es la función f⁻¹(x)=√x.
            </p>
          ) : (
            <p className="mt-1 text-[var(--fg-muted)]">
              Función lineal con m≠0: biyectiva en ℝ; el reflejo es una función inversa.
            </p>
          )}
        </div>

        <ControlsStack>
          <ButtonRow>
            <VizButton active={kind === 'quadratic'} onClick={() => { setKind('quadratic'); setRestricted(false); }}>Cuadrática x²</VizButton>
            <VizButton active={kind === 'linear'} onClick={() => setKind('linear')}>Lineal mx+b</VizButton>
          </ButtonRow>
          {isQuad ? (
            <VizButton active={restricted} onClick={() => setRestricted((r) => !r)}>
              {restricted ? 'Dominio completo ℝ' : 'Restringir dominio (x≥0)'}
            </VizButton>
          ) : (
            <>
              <SliderRow label="m" value={m} min={-3} max={3} step={0.1} onChange={(v) => setM(snap(v, -3, 3, 0.1) || 0.5)} />
              <SliderRow label="b" value={b} min={-4} max={4} step={0.1} onChange={(v) => setB(snap(v, -4, 4, 0.1))} />
            </>
          )}
          <SliderRow label="x₀" value={x0} min={-3} max={3} step={0.1} onChange={(v) => setX0(snap(v, -3, 3, 0.1))} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
