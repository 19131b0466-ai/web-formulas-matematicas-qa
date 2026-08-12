'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from './controls';
import { linspace } from './math2d';

const ZERO = 1e-9;
const W = 420;
const H = 280;
const MARGIN = { l: 36, r: 16, t: 18, b: 28 };

function present(n: number, d = 2): string {
  if (!Number.isFinite(n)) return '—';
  const r = Number(n.toFixed(d));
  if (Math.abs(r - Math.round(r)) < 1e-9) return fmt(Math.round(r), 0);
  return fmt(r, d);
}

function snapBase(v: number): number {
  const c = Math.min(4, Math.max(0.2, v));
  if (Math.abs(c - 1) < 0.08) return c < 1 ? 0.9 : 1.1;
  return Number(c.toFixed(2));
}

function snapX(v: number): number {
  return Number(Math.min(12, Math.max(0.15, v)).toFixed(2));
}

/**
 * Logarithm definition: log_b(x)=y ⟺ b^y=x (ALG-LOG-002).
 */
export function LogarithmDefViz() {
  const [b, setB] = useState(2);
  const [x, setX] = useState(8);
  const [showNotes, setShowNotes] = useState(false);
  const [quiz, setQuiz] = useState(false);
  const [revealed, setRevealed] = useState(true);
  const guideId = useId();
  const statusId = useId();

  const y = Math.log(x) / Math.log(b);
  const growing = b > 1 + ZERO;
  const nearOne = Math.abs(b - 1) < 0.12;

  // Include P=(x,y) and reflected Q=(y,x) so inverses stay readable
  const xMax = Math.max(8, x + 1.2, Math.abs(y) + 1.2, b + 1, 1 / b + 1);
  const yMax = Math.max(4, Math.abs(y) + 1.5, x + 1.2, 3);
  const VIEW = { xMin: -0.7, xMax, yMin: -yMax, yMax };

  const plotW = W - MARGIN.l - MARGIN.r;
  const plotH = H - MARGIN.t - MARGIN.b;
  const toX = (vx: number) => MARGIN.l + ((vx - VIEW.xMin) / (VIEW.xMax - VIEW.xMin)) * plotW;
  const toY = (vy: number) => MARGIN.t + ((VIEW.yMax - vy) / (VIEW.yMax - VIEW.yMin)) * plotH;

  const logPath = useMemo(() => {
    const xs = linspace(0.08, VIEW.xMax, 140);
    const pts = xs
      .map((t) => ({ x: t, y: Math.log(t) / Math.log(b) }))
      .filter((p) => p.y >= VIEW.yMin && p.y <= VIEW.yMax)
      .map((p) => `${toX(p.x)},${toY(p.y)}`);
    return pts.length >= 2 ? `M${pts.join(' L')}` : '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [b, VIEW.xMax, VIEW.yMin, VIEW.yMax]);

  const expPath = useMemo(() => {
    // y = b^t with t on the horizontal axis
    const ts = linspace(Math.max(VIEW.xMin, -3), Math.min(VIEW.xMax, 4), 120);
    const pts = ts
      .map((t) => ({ x: t, y: b ** t }))
      .filter((p) => p.y >= VIEW.yMin && p.y <= VIEW.yMax && p.x >= VIEW.xMin && p.x <= VIEW.xMax)
      .map((p) => `${toX(p.x)},${toY(p.y)}`);
    return pts.length >= 2 ? `M${pts.join(' L')}` : '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [b, VIEW.xMin, VIEW.xMax, VIEW.yMin, VIEW.yMax]);

  const diagLo = Math.max(VIEW.xMin, VIEW.yMin);
  const diagHi = Math.min(VIEW.xMax, VIEW.yMax);

  const notables = [-2, -1, 0, 1, 2, 3].map((e) => ({ e, val: b ** e }));

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            El logaritmo responde una pregunta sobre exponentes: log<sub>b</sub>(x) indica a qué
            potencia debemos elevar b para obtener x.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Mueve la base y el valor x. Observa que si log<sub>b</sub>(x)=y, entonces b<sup>y</sup>=x.
            Los puntos (x,y) y (y,x) aparecen reflejados respecto a y=x.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 text-center">
          <p className="font-mono text-base font-semibold">
            log<sub>b</sub>(x)=y ⟺ b<sup>y</sup>=x
          </p>
          <p className="mt-2 text-sm text-[var(--fg-muted)]">
            ¿A qué exponente elevamos {present(b)} para obtener {present(x)}?
          </p>
          {quiz && !revealed ? (
            <p className="mt-2 font-mono text-lg">
              {present(b)}<sup>?</sup>={present(x)}
            </p>
          ) : (
            <>
              <p className="mt-2 font-mono text-lg font-semibold text-[var(--accent-strong)]">
                log<sub>{present(b)}</sub>({present(x)})={present(y)}
              </p>
              <p className="mt-1 font-mono text-lg font-semibold text-teal">
                {present(b)}<sup>{present(y)}</sup>={present(x)}
              </p>
            </>
          )}
          {quiz && !revealed ? (
            <button
              type="button"
              className="mt-2 text-sm font-semibold text-[var(--accent-strong)] underline"
              onClick={() => setRevealed(true)}
            >
              Revelar ?= {present(y)}
            </button>
          ) : null}
          <p className="mt-2 text-sm">
            {growing ? 'Logaritmo creciente' : 'Logaritmo decreciente'}
            {nearOne ? ' · b≠1 (la base 1 no determina un exponente único)' : ''}
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <div className="mb-2 flex flex-wrap gap-3 text-xs">
            <span className="text-[var(--accent-strong)]">— y=log<sub>b</sub>(x)</span>
            <span className="text-teal">— y=bˣ</span>
            <span className="opacity-70">- - y=x</span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-xl" role="img" aria-labelledby={statusId}>
            {/* region x>0 hint */}
            <rect x={toX(0)} y={MARGIN.t} width={toX(VIEW.xMax) - toX(0)} height={plotH} fill="var(--accent-strong)" opacity={0.03} />
            <line x1={toX(0)} y1={toY(VIEW.yMin)} x2={toX(0)} y2={toY(VIEW.yMax)} stroke="currentColor" strokeWidth={1.5} strokeDasharray="5 4" opacity={0.55} />
            <text x={toX(0) + 6} y={MARGIN.t + 12} fontSize={9} opacity={0.7}>asíntota x=0 · x&gt;0</text>
            <line x1={toX(VIEW.xMin)} y1={toY(0)} x2={toX(VIEW.xMax)} y2={toY(0)} stroke="currentColor" opacity={0.35} />
            <line
              x1={toX(diagLo)}
              y1={toY(diagLo)}
              x2={toX(diagHi)}
              y2={toY(diagHi)}
              stroke="currentColor"
              strokeWidth={1.25}
              strokeDasharray="5 4"
              opacity={0.5}
            />
            <text x={toX(diagHi) - 4} y={toY(diagHi) - 8} fontSize={9} opacity={0.65}>y=x</text>
            {[-2, -1, 1, 2, 3].map((t) =>
              t > VIEW.xMin && t < VIEW.xMax ? (
                <text key={`xt${t}`} x={toX(t)} y={toY(0) + 12} textAnchor="middle" fontSize={9} opacity={0.45}>
                  {t}
                </text>
              ) : null,
            )}
            {[-2, -1, 1, 2, 3].map((t) =>
              t > VIEW.yMin && t < VIEW.yMax ? (
                <text key={`yt${t}`} x={toX(0) - 8} y={toY(t) + 3} textAnchor="end" fontSize={9} opacity={0.45}>
                  {t}
                </text>
              ) : null,
            )}

            {expPath ? <path d={expPath} fill="none" stroke="teal" strokeWidth={2} opacity={0.85} /> : null}
            {logPath ? <path d={logPath} fill="none" stroke="var(--accent-strong)" strokeWidth={2.6} /> : null}

            {/* log guides */}
            <line x1={toX(x)} y1={toY(0)} x2={toX(x)} y2={toY(y)} stroke="var(--accent-strong)" strokeDasharray="3 2" opacity={0.45} />
            <line x1={toX(0)} y1={toY(y)} x2={toX(x)} y2={toY(y)} stroke="var(--accent-strong)" strokeDasharray="3 2" opacity={0.45} />
            {/* exp guides Q=(y,x) on y=b^t */}
            <line x1={toX(y)} y1={toY(0)} x2={toX(y)} y2={toY(x)} stroke="teal" strokeDasharray="3 2" opacity={0.4} />
            <line x1={toX(0)} y1={toY(x)} x2={toX(y)} y2={toY(x)} stroke="teal" strokeDasharray="3 2" opacity={0.4} />
            <line x1={toX(x)} y1={toY(y)} x2={toX(y)} y2={toY(x)} stroke="orange" strokeWidth={1.25} strokeDasharray="4 2" opacity={0.7} />

            <circle cx={toX(1)} cy={toY(0)} r={5} fill="currentColor" opacity={0.7} />
            <text x={toX(1) + 6} y={toY(0) - 8} fontSize={9}>(1,0)</text>
            <circle cx={toX(b)} cy={toY(1)} r={5} fill="currentColor" opacity={0.7} />
            <text x={toX(b) + 6} y={toY(1) - 8} fontSize={9}>(b,1)</text>
            {1 / b > 0.15 ? (
              <>
                <circle cx={toX(1 / b)} cy={toY(-1)} r={4} fill="currentColor" opacity={0.55} />
                <text x={toX(1 / b) + 4} y={toY(-1) + 12} fontSize={8} opacity={0.7}>(1/b,−1)</text>
              </>
            ) : null}

            <circle cx={toX(x)} cy={toY(y)} r={7} fill="var(--accent-strong)" />
            <text x={toX(x) + 8} y={toY(y) - 8} fontSize={11} fontWeight={600} fill="var(--accent-strong)">
              P=({present(x)},{present(y)})
            </text>
            <circle cx={toX(y)} cy={toY(x)} r={7} fill="teal" />
            <text x={toX(y) + 8} y={toY(x) + 14} fontSize={11} fontWeight={600} fill="teal">
              Q=({present(y)},{present(x)})
            </text>

            {showNotes
              ? notables
                  .filter((n) => n.val > 0.1 && n.val < VIEW.xMax && n.e > VIEW.yMin && n.e < VIEW.yMax)
                  .map((n) => (
                    <circle key={n.e} cx={toX(n.val)} cy={toY(n.e)} r={3.5} fill="var(--accent-strong)" opacity={0.55} />
                  ))
              : null}
          </svg>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">
            (x,y)↔(y,x) · la exponencial y el logaritmo intercambian entrada y salida. y=x es el eje de
            simetría entre una función y su inversa.
          </p>
          <p className="text-xs text-[var(--fg-muted)]">
            Toda log pasa por (1,0) porque b⁰=1. También (b,1) porque log<sub>b</sub>(b)=1.
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-sm">
            <span className="rounded-lg border border-[var(--border)] px-2 py-1">{present(x)}</span>
            <span>→ log<sub>{present(b)}</sub> →</span>
            <span className="rounded-lg border border-[var(--accent-strong)] px-2 py-1 font-semibold">{present(y)}</span>
            <span>→ {present(b)}⁽·⁾ →</span>
            <span className="rounded-lg border border-teal px-2 py-1 font-semibold text-teal">{present(x)}</span>
          </div>
          <p className="mt-2 text-center text-xs text-[var(--fg-muted)]">
            Dom(log<sub>b</sub> x)=(0,∞) · Im(log<sub>b</sub> x)=ℝ
          </p>
        </section>

        {showNotes ? (
          <section className="rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-xs sm:text-sm">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
              Valores notables
            </p>
            <div className="grid gap-1 sm:grid-cols-2">
              {notables.map((n) => (
                <p key={n.e}>
                  {present(b)}<sup>{present(n.e, 0)}</sup>={present(n.val)} · log<sub>{present(b)}</sub>({present(n.val)})=
                  {present(n.e, 0)}
                </p>
              ))}
            </div>
          </section>
        ) : null}

        <div id={statusId} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" aria-live="polite">
          <p className="font-mono">
            b={present(b)} · x={present(x)} · log={present(y)} · {present(b)}^{present(y)}={present(x)} · P=({present(x)},
            {present(y)}) · Q=({present(y)},{present(x)})
          </p>
        </div>

        <ControlsStack>
          <ButtonRow>
            <VizButton onClick={() => { setB(2); setX(8); }}>b=2, x=8</VizButton>
            <VizButton onClick={() => setB(0.5)}>b=1/2</VizButton>
            <VizButton onClick={() => setB(10)}>b=10</VizButton>
            <VizButton
              active={showNotes}
              onClick={() => setShowNotes((s) => !s)}
            >
              Valores notables
            </VizButton>
            <VizButton
              active={quiz}
              onClick={() => {
                setQuiz((q) => !q);
                setRevealed(false);
              }}
            >
              ¿Qué exponente?
            </VizButton>
          </ButtonRow>
          <SliderRow label="Base (b)" value={b} min={0.25} max={4} step={0.05} onChange={(v) => setB(snapBase(v))} />
          <SliderRow label="Valor (x)" value={x} min={0.2} max={12} step={0.1} onChange={(v) => setX(snapX(v))} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
