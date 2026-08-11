'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from './controls';
import { linspace } from './math2d';

const ZERO = 1e-9;
const W = 420;
const H = 260;
const VIEW = { min: -3, max: 3 };
const MARGIN = { l: 36, r: 56, t: 18, b: 28 };
const GRID = 36;

type TermFocus = 'all' | 'ax2' | 'bxy' | 'cy2';

function present(n: number, d = 2): string {
  if (!Number.isFinite(n)) return '—';
  return fmt(Number(n.toFixed(d)), d);
}

function snap(v: number, min: number, max: number, step: number): number {
  const c = Math.min(max, Math.max(min, v));
  const s = min + Math.round((c - min) / step) * step;
  if (Math.abs(s) < step / 2) return 0;
  return Number(s.toFixed(2));
}

function formatQuad(a: number, b: number, c: number): string {
  const parts: string[] = [];
  const push = (coef: number, mono: string) => {
    if (Math.abs(coef) < ZERO) return;
    const abs = Math.abs(coef);
    const body = abs === 1 ? mono : `${present(abs)}${mono}`;
    if (parts.length === 0) parts.push(coef < 0 ? `−${body}` : body);
    else parts.push(coef < 0 ? `−${body}` : `+${body}`);
  };
  push(a, 'x²');
  push(b, 'xy');
  push(c, 'y²');
  return parts.length ? `P(x,y)=${parts.join('')}` : 'P(x,y)=0';
}

function evalP(a: number, b: number, c: number, x: number, y: number, focus: TermFocus): number {
  const A = a * x * x;
  const B = b * x * y;
  const C = c * y * y;
  if (focus === 'ax2') return A;
  if (focus === 'bxy') return B;
  if (focus === 'cy2') return C;
  return A + B + C;
}

function colorForZ(z: number, maxAbs: number): string {
  const m = Math.max(maxAbs, 0.5);
  const t = Math.max(-1, Math.min(1, z / m));
  if (Math.abs(t) < 0.04) return 'rgb(220,220,220)';
  if (t > 0) {
    const u = t;
    return `rgb(${Math.round(255 - 80 * u)},${Math.round(180 - 120 * u)},${Math.round(80 + 40 * u)})`;
  }
  const u = -t;
  return `rgb(${Math.round(80 + 40 * u)},${Math.round(140 - 40 * u)},${Math.round(255 - 60 * u)})`;
}

/**
 * Quadratic multivariable polynomial P(x,y)=ax²+bxy+cy² (ALG-POL-007).
 */
export function MultivariablePolyViz() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0.4);
  const [c, setC] = useState(-0.6);
  const [x0, setX0] = useState(2);
  const [y0, setY0] = useState(-1);
  const [showTerms, setShowTerms] = useState(true);
  const [focus, setFocus] = useState<TermFocus>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [view3d, setView3d] = useState(false);
  const guideId = useId();
  const statusId = useId();

  const eq = formatQuad(a, b, c);
  const plotW = W - MARGIN.l - MARGIN.r;
  const plotH = H - MARGIN.t - MARGIN.b;
  const toX = (x: number) => MARGIN.l + ((x - VIEW.min) / (VIEW.max - VIEW.min)) * plotW;
  const toY = (y: number) => MARGIN.t + ((VIEW.max - y) / (VIEW.max - VIEW.min)) * plotH;

  const termFocus = showTerms ? focus : 'all';
  const Aterm = a * x0 * x0;
  const Bterm = b * x0 * y0;
  const Cterm = c * y0 * y0;
  const Pval = Aterm + Bterm + Cterm;

  const cells = useMemo(() => {
    const xs = linspace(VIEW.min, VIEW.max, GRID);
    const ys = linspace(VIEW.min, VIEW.max, GRID);
    const out: { x: number; y: number; z: number }[] = [];
    for (const y of ys) {
      for (const x of xs) out.push({ x, y, z: evalP(a, b, c, x, y, termFocus) });
    }
    return out;
  }, [a, b, c, termFocus]);

  const maxAbs = useMemo(() => {
    let m = 0;
    for (const cell of cells) m = Math.max(m, Math.abs(cell.z));
    return m || 1;
  }, [cells]);

  const cellW = plotW / GRID;
  const cellH = plotH / GRID;

  const contours = useMemo(() => {
    const levels = [-4, -2, 0, 2, 4];
    const paths: { k: number; d: string }[] = [];
    const xs = linspace(VIEW.min, VIEW.max, 80);
    for (const k of levels) {
      const segs: string[] = [];
      // March along y for each x looking for sign changes is heavy; sample polar for quadratic forms
      for (let i = 0; i < 120; i++) {
        const th = (i / 120) * Math.PI * 2;
        // Solve a cos² + b cos sin + c sin² = k/r² ⇒ r² = k / Q(u)
        const ux = Math.cos(th);
        const uy = Math.sin(th);
        const Q = evalP(a, b, c, ux, uy, termFocus);
        if (Math.abs(Q) < ZERO) continue;
        const r2 = k / Q;
        if (r2 <= 0) continue;
        const r = Math.sqrt(r2);
        if (r > VIEW.max * 1.4) continue;
        const x = r * ux;
        const y = r * uy;
        if (x < VIEW.min || x > VIEW.max || y < VIEW.min || y > VIEW.max) continue;
        segs.push(`${segs.length === 0 ? 'M' : 'L'}${toX(x)},${toY(y)}`);
      }
      if (segs.length > 4) paths.push({ k, d: segs.join('') + 'Z' });
    }
    return paths;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a, b, c, termFocus]);

  const D = 4 * a * c - b * b;
  const geom =
    D > ZERO && a > ZERO
      ? 'Forma definida positiva: P(x,y)>0 fuera de (0,0).'
      : D > ZERO && a < -ZERO
        ? 'Forma definida negativa: P(x,y)<0 fuera de (0,0).'
        : D < -ZERO
          ? 'Forma indefinida: hay regiones positivas y negativas.'
          : 'Forma semidefinida o degenerada (D≈0).';

  const aExpl =
    Math.abs(a) < ZERO
      ? 'El término x² desaparece.'
      : a > 0
        ? 'La contribución de x² es positiva fuera de x=0.'
        : 'La contribución de x² es negativa fuera de x=0.';
  const cExpl =
    Math.abs(c) < ZERO
      ? 'El término y² desaparece.'
      : c > 0
        ? 'La contribución de y² es positiva fuera de y=0.'
        : 'La contribución de y² es negativa fuera de y=0.';
  const bExpl =
    Math.abs(b) < ZERO
      ? 'No existe término cruzado.'
      : 'bxy acopla las dos variables: su contribución depende simultáneamente de x y de y.';

  const applyPreset = (aa: number, bb: number, cc: number) => {
    setA(aa);
    setB(bb);
    setC(cc);
  };

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Un polinomio de dos variables recibe un punto (x,y) y le asigna un valor. Aquí el color
            representa P(x,y).
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Este es un caso de polinomio multivariable: una expresión que depende de más de una
            variable. Mueve el punto sobre el plano; luego modifica a, b y c.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Polinomio cuadrático en dos variables
          </p>
          <p className="mt-1 font-mono text-sm text-[var(--fg-muted)]">P(x,y)=ax²+bxy+cy²</p>
          <p className="mt-1 font-mono text-lg font-semibold text-[var(--accent-strong)]">{eq}</p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <div className="mb-2 flex flex-wrap gap-2">
            <VizButton active={!view3d} onClick={() => setView3d(false)}>Mapa 2D</VizButton>
            <VizButton active={view3d} onClick={() => setView3d(true)}>Superficie 3D</VizButton>
          </div>

          {!view3d ? (
            <>
              <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-xl" role="img" aria-labelledby={statusId}>
                {cells.map((cell, i) => {
                  const xi = i % GRID;
                  const yi = Math.floor(i / GRID);
                  return (
                    <rect
                      key={i}
                      x={MARGIN.l + xi * cellW}
                      y={MARGIN.t + (GRID - 1 - yi) * cellH}
                      width={cellW + 0.4}
                      height={cellH + 0.4}
                      fill={colorForZ(cell.z, maxAbs)}
                      opacity={0.95}
                    />
                  );
                })}
                {contours.map(({ k, d }) => (
                  <path
                    key={k}
                    d={d}
                    fill="none"
                    stroke={k === 0 ? 'currentColor' : 'rgba(0,0,0,0.35)'}
                    strokeWidth={k === 0 ? 2 : 1}
                    strokeDasharray={k === 0 ? undefined : '3 2'}
                    opacity={0.85}
                  />
                ))}
                <line x1={toX(VIEW.min)} y1={toY(0)} x2={toX(VIEW.max)} y2={toY(0)} stroke="currentColor" strokeWidth={1.4} opacity={0.55} />
                <line x1={toX(0)} y1={toY(VIEW.min)} x2={toX(0)} y2={toY(VIEW.max)} stroke="currentColor" strokeWidth={1.4} opacity={0.55} />
                <text x={toX(VIEW.max) - 8} y={toY(0) - 6} fontSize={11} fill="currentColor">x</text>
                <text x={toX(0) + 6} y={toY(VIEW.max) + 12} fontSize={11} fill="currentColor">y</text>
                {[-2, -1, 1, 2].map((t) => (
                  <g key={t}>
                    <text x={toX(t)} y={toY(0) + 12} textAnchor="middle" fontSize={9} opacity={0.55}>{t}</text>
                    <text x={toX(0) - 8} y={toY(t) + 3} textAnchor="end" fontSize={9} opacity={0.55}>{t}</text>
                  </g>
                ))}
                {/* color legend */}
                {linspace(-1, 1, 24).map((t, i) => (
                  <rect
                    key={`leg-${i}`}
                    x={W - 42}
                    y={MARGIN.t + i * ((plotH) / 24)}
                    width={10}
                    height={plotH / 24 + 0.5}
                    fill={colorForZ(t * maxAbs, maxAbs)}
                  />
                ))}
                <text x={W - 28} y={MARGIN.t + 8} fontSize={8} fill="currentColor">+{present(maxAbs, 1)}</text>
                <text x={W - 28} y={MARGIN.t + plotH / 2} fontSize={8} fill="currentColor">0</text>
                <text x={W - 28} y={MARGIN.t + plotH} fontSize={8} fill="currentColor">−{present(maxAbs, 1)}</text>
                <text x={W - 44} y={MARGIN.t - 4} fontSize={9} fill="currentColor">z=P</text>

                <circle cx={toX(x0)} cy={toY(y0)} r={7} fill="orange" stroke="currentColor" strokeWidth={1} />
                <text x={toX(x0) + 10} y={toY(y0) - 8} fontSize={11} fontWeight={600} fill="currentColor">
                  ({present(x0)},{present(y0)})→{present(Pval)}
                </text>
              </svg>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                Cada curva une puntos donde el polinomio tiene el mismo valor. La curva gruesa es P=0.
              </p>
            </>
          ) : (
            <div className="space-y-2">
              <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-xl" role="img">
                {/* Simple isometric ridge sketch */}
                <line x1={60} y1={200} x2={360} y2={200} stroke="currentColor" opacity={0.4} />
                <line x1={210} y1={210} x2={210} y2={40} stroke="currentColor" opacity={0.4} />
                <text x={360} y={214} fontSize={11}>x</text>
                <text x={40} y={210} fontSize={11}>y</text>
                <text x={218} y={40} fontSize={11}>z=P(x,y)</text>
                {linspace(-2, 2, 9).map((x, i) => {
                  const y = 0;
                  const z = evalP(a, b, c, x, y, 'all');
                  const px = 210 + x * 40 - y * 28;
                  const py = 180 - z * 8 - y * 18;
                  return <circle key={i} cx={px} cy={py} r={3} fill="teal" opacity={0.7} />;
                })}
                {(() => {
                  const z = Pval;
                  const px = 210 + x0 * 40 - y0 * 28;
                  const py = 180 - z * 8 - y0 * 18;
                  return (
                    <g>
                      <circle cx={px} cy={py} r={6} fill="orange" />
                      <text x={px + 8} y={py} fontSize={10}>
                        ({present(x0)},{present(y0)},{present(z)})
                      </text>
                    </g>
                  );
                })()}
              </svg>
              <p className="text-xs text-[var(--fg-muted)]">
                La superficie muestra P como altura. El mapa 2D usa colores; las curvas de nivel unen
                la misma altura.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
          <p>
            P({present(x0)},{present(y0)})={present(a)}({present(x0)})²
            {b >= 0 ? '+' : '−'}{present(Math.abs(b))}({present(x0)})({present(y0)})
            {c >= 0 ? '+' : '−'}{present(Math.abs(c))}({present(y0)})²
          </p>
          <p className="mt-1">
            ={present(Aterm)}{Bterm >= 0 ? '+' : '−'}{present(Math.abs(Bterm))}
            {Cterm >= 0 ? '+' : '−'}{present(Math.abs(Cterm))}={present(Pval)}
          </p>
          {showTerms ? (
            <div className="mt-2 space-y-1 text-[var(--fg-muted)]">
              <p>Contribuciones: ax²={present(Aterm)} · bxy={present(Bterm)} · cy²={present(Cterm)}</p>
              <p>
                {present(Aterm)}+({present(Bterm)})+({present(Cterm)})={present(Pval)}
              </p>
            </div>
          ) : null}
        </section>

        <div id={statusId} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" aria-live="polite">
          <p className="font-mono">{eq} · (x,y)=({present(x0)},{present(y0)}) · P={present(Pval)}</p>
          <p className="mt-1 text-[var(--fg-muted)]">{aExpl} {cExpl}</p>
          <p className="text-[var(--fg-muted)]">{bExpl}</p>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">Secundario: D=4ac−b²={present(D)}. {geom}</p>
        </div>

        {showAdvanced ? (
          <section className="rounded-xl border border-[var(--border)] px-3 py-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
              Vista avanzada · conexión con álgebra lineal
            </p>
            <p className="mt-2 font-mono">
              P=[x y][ a , b/2 ; b/2 , c ][x;y] · A=[{present(a)}, {present(b / 2)}; {present(b / 2)}, {present(c)}]
            </p>
          </section>
        ) : null}

        <ControlsStack>
          <SliderRow label="x₀" value={x0} min={-2.5} max={2.5} step={0.1} onChange={(v) => setX0(snap(v, -2.5, 2.5, 0.1))} />
          <SliderRow label="y₀" value={y0} min={-2.5} max={2.5} step={0.1} onChange={(v) => setY0(snap(v, -2.5, 2.5, 0.1))} />
          <SliderRow label="a" value={a} min={-2} max={2} step={0.1} onChange={(v) => setA(snap(v, -2, 2, 0.1))} />
          <SliderRow label="b" value={b} min={-2} max={2} step={0.1} onChange={(v) => setB(snap(v, -2, 2, 0.1))} />
          <SliderRow label="c" value={c} min={-2} max={2} step={0.1} onChange={(v) => setC(snap(v, -2, 2, 0.1))} />
          <ButtonRow>
            <VizButton active={showTerms} onClick={() => setShowTerms((s) => !s)}>Mostrar términos</VizButton>
            <VizButton active={showAdvanced} onClick={() => setShowAdvanced((s) => !s)}>Vista avanzada</VizButton>
          </ButtonRow>
          {showTerms ? (
            <ButtonRow>
              <VizButton active={focus === 'all'} onClick={() => setFocus('all')}>Todos</VizButton>
              <VizButton active={focus === 'ax2'} onClick={() => setFocus('ax2')}>ax²</VizButton>
              <VizButton active={focus === 'bxy'} onClick={() => setFocus('bxy')}>bxy</VizButton>
              <VizButton active={focus === 'cy2'} onClick={() => setFocus('cy2')}>cy²</VizButton>
            </ButtonRow>
          ) : null}
          <ButtonRow>
            <VizButton onClick={() => applyPreset(1, 0, 1)}>Cuenco</VizButton>
            <VizButton onClick={() => applyPreset(1, 0, -1)}>Silla</VizButton>
            <VizButton onClick={() => applyPreset(1, 1, 1)}>Con xy</VizButton>
            <VizButton onClick={() => applyPreset(0, 1, 0)}>Solo xy</VizButton>
          </ButtonRow>
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
