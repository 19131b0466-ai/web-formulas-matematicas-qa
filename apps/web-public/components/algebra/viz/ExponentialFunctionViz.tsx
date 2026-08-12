'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from './controls';
import { linspace } from './math2d';

const ZERO = 1e-9;
const W = 420;
const H = 260;
const MARGIN = { l: 36, r: 16, t: 18, b: 28 };
function present(n: number, d = 2): string {
  if (!Number.isFinite(n)) return '—';
  const r = Number(n.toFixed(d));
  if (Math.abs(r - Math.round(r)) < 1e-9) return fmt(Math.round(r), 0);
  return fmt(r, d);
}

function snapBase(v: number): number {
  const c = Math.min(4, Math.max(0.15, v));
  if (Math.abs(c - 1) < 0.08) return c < 1 ? 0.9 : 1.1;
  return Number(c.toFixed(2));
}

function snapX(v: number): number {
  return Number(Math.min(3, Math.max(-3, v)).toFixed(2));
}

function formatPow(a: number, x: number, val: number): string {
  if (Math.abs(val) >= 0.01 && Math.abs(val) < 100 && Number.isInteger(1 / val) && val < 1 && val > 0) {
    return `1/${present(Math.round(1 / val), 0)}`;
  }
  return present(val);
}

/**
 * Exponential f(x)=a^x (ALG-LOG-001).
 */
export function ExponentialFunctionViz() {
  const [a, setA] = useState(2);
  const [x0, setX0] = useState(3);
  const guideId = useId();
  const statusId = useId();

  const y0 = a ** x0;
  const growing = a > 1 + ZERO;
  const yPeak = Math.min(Math.max(y0 * 1.2, a * 1.2, 1 / a + 1, a ** 2.2, 4), 20);
  const VIEW = { xMin: -3, xMax: 3.5, yMin: -yPeak * 0.06, yMax: yPeak };
  const plotW = W - MARGIN.l - MARGIN.r;
  const plotH = H - MARGIN.t - MARGIN.b;
  const toX = (x: number) => MARGIN.l + ((x - VIEW.xMin) / (VIEW.xMax - VIEW.xMin)) * plotW;
  const toY = (y: number) => MARGIN.t + ((VIEW.yMax - y) / (VIEW.yMax - VIEW.yMin)) * plotH;

  const path = useMemo(() => {
    const xs = linspace(VIEW.xMin, VIEW.xMax, 160);
    const pts = xs
      .map((x) => ({ x, y: a ** x }))
      .filter((p) => p.y >= VIEW.yMin && p.y <= VIEW.yMax + 2)
      .map((p) => `${toX(p.x)},${toY(Math.min(p.y, VIEW.yMax))}`);
    return pts.length >= 2 ? `M${pts.join(' L')}` : '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a, VIEW.yMax]);

  const tableXs = [-2, -1, 0, 1, 2];
  const nearOne = Math.abs(a - 1) < 0.12;

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Una función exponencial eleva una base fija a a distintos exponentes x. Cada vez que x
            aumenta en 1, el valor se multiplica por a.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Si a&gt;1, la curva crece. Si 0&lt;a&lt;1, decrece. En todos los casos pasa por (0,1) y se
            aproxima a y=0 sin tocarla.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="font-mono text-lg font-semibold text-[var(--accent-strong)]">
            f(x)={present(a)}<sup>x</sup>
          </p>
          <p className="mt-1 font-mono text-sm">
            f({present(x0)})={present(a)}<sup>{present(x0)}</sup>={formatPow(a, x0, y0)}
          </p>
          <p className="mt-1 text-sm">
            {growing ? 'Función creciente · al aumentar x, aˣ aumenta.' : 'Función decreciente · al aumentar x, aˣ disminuye.'}
          </p>
          {nearOne ? (
            <p className="mt-1 text-xs text-orange">a≠1 · si a=1, entonces 1ˣ=1 para todo x.</p>
          ) : null}
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-xl" role="img" aria-labelledby={statusId}>
            <line x1={toX(VIEW.xMin)} y1={toY(0)} x2={toX(VIEW.xMax)} y2={toY(0)} stroke="currentColor" strokeWidth={1.4} opacity={0.45} strokeDasharray="5 4" />
            <text x={toX(VIEW.xMax) - 8} y={toY(0) - 6} fontSize={9} fill="currentColor" opacity={0.7}>asíntota y=0</text>
            <line x1={toX(0)} y1={toY(VIEW.yMin)} x2={toX(0)} y2={toY(VIEW.yMax)} stroke="currentColor" strokeWidth={1.4} opacity={0.4} />
            {[-2, -1, 1, 2, 3].map((t) => (
              <text key={t} x={toX(t)} y={toY(0) + 12} textAnchor="middle" fontSize={9} opacity={0.5}>{t}</text>
            ))}
            {path ? <path d={path} fill="none" stroke="var(--accent-strong)" strokeWidth={2.6} /> : null}

            {/* guides for interactive point */}
            <line x1={toX(x0)} y1={toY(0)} x2={toX(x0)} y2={toY(Math.min(y0, VIEW.yMax))} stroke="currentColor" strokeDasharray="3 2" opacity={0.4} />
            <line x1={toX(0)} y1={toY(Math.min(y0, VIEW.yMax))} x2={toX(x0)} y2={toY(Math.min(y0, VIEW.yMax))} stroke="currentColor" strokeDasharray="3 2" opacity={0.4} />

            <circle cx={toX(0)} cy={toY(1)} r={7} fill="var(--accent-strong)" stroke="currentColor" strokeWidth={1} />
            <text x={toX(0) + 10} y={toY(1) - 8} fontSize={11} fontWeight={600}>(0,1)</text>

            {a > VIEW.yMin && a < VIEW.yMax ? (
              <>
                <circle cx={toX(1)} cy={toY(a)} r={5} fill="teal" />
                <text x={toX(1) + 6} y={toY(a) - 6} fontSize={10} fill="teal">(1,{present(a)})</text>
              </>
            ) : null}
            {1 / a < VIEW.yMax ? (
              <>
                <circle cx={toX(-1)} cy={toY(1 / a)} r={5} fill="teal" opacity={0.85} />
                <text x={toX(-1) + 6} y={toY(1 / a) - 6} fontSize={9} fill="teal">(−1,{present(1 / a)})</text>
              </>
            ) : null}

            <circle cx={toX(x0)} cy={toY(Math.min(y0, VIEW.yMax))} r={6} fill="orange" />
            <text x={toX(x0) + 8} y={toY(Math.min(y0, VIEW.yMax)) - 8} fontSize={11} fontWeight={600} fill="orange">
              P=({present(x0)},{formatPow(a, x0, y0)})
            </text>
            <text x={toX(VIEW.xMax) - 4} y={MARGIN.t + 12} textAnchor="end" fontSize={11} fill="currentColor">x</text>
            <text x={toX(0) + 8} y={MARGIN.t + 12} fontSize={11} fill="currentColor">y</text>
          </svg>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">
            Cada avance de +1 en x multiplica por a. Dom(aˣ)=ℝ · Im(aˣ)=(0,∞).
          </p>
        </section>

        <section className="overflow-x-auto rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">Tabla de valores</p>
          <table className="w-full text-left font-mono text-sm">
            <thead>
              <tr className="text-[var(--fg-muted)]">
                <th className="py-1 pr-4">x</th>
                <th>{present(a)}ˣ</th>
              </tr>
            </thead>
            <tbody>
              {tableXs.map((x) => (
                <tr key={x} className={Math.abs(x - x0) < ZERO ? 'font-semibold text-[var(--accent-strong)]' : ''}>
                  <td className="py-0.5 pr-4">{present(x, 0)}</td>
                  <td>{formatPow(a, x, a ** x)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 font-mono text-sm">
            {present(x0)} → {present(a)}<sup>{present(x0)}</sup>={formatPow(a, x0, y0)}
          </p>
        </section>

        <div id={statusId} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" aria-live="polite">
          <p className="font-mono">
            f(x)={present(a)}ˣ · f({present(x0)})={formatPow(a, x0, y0)} · P=({present(x0)},{formatPow(a, x0, y0)}) ·{' '}
            {growing ? 'creciente' : 'decreciente'} · (0,1) · y→0⁺
          </p>
        </div>

        <ControlsStack>
          <ButtonRow>
            <VizButton onClick={() => setA(2)}>a=2</VizButton>
            <VizButton onClick={() => setA(0.5)}>a=1/2</VizButton>
            <VizButton onClick={() => setA(3)}>a=3</VizButton>
            <VizButton onClick={() => setA(10)}>a=10</VizButton>
          </ButtonRow>
          <SliderRow label="Base (a)" value={a} min={0.2} max={4} step={0.05} onChange={(v) => setA(snapBase(v))} />
          <SliderRow label="Valor (x)" value={x0} min={-3} max={3} step={0.1} onChange={(v) => setX0(snapX(v))} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
