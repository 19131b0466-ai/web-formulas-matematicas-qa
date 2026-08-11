'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from './controls';
import { linspace } from './math2d';

const ZERO = 1e-7;
const W = 420;
const H = 200;
const MARGIN = { l: 36, r: 16, t: 16, b: 26 };

function present(n: number, d = 2): string {
  if (!Number.isFinite(n)) return '—';
  const r = Number(n.toFixed(d));
  if (Math.abs(r - Math.round(r)) < 1e-9) return fmt(Math.round(r), 0);
  return fmt(r, d);
}

function snap(v: number, min: number, max: number, step: number): number {
  const c = Math.min(max, Math.max(min, v));
  const s = min + Math.round((c - min) / step) * step;
  if (Math.abs(s) < step / 2) return 0;
  return Number(s.toFixed(2));
}

function formatQuad(name: string, a2: number, a1: number, a0: number): string {
  const parts: string[] = [];
  const push = (coef: number, mono: string) => {
    if (Math.abs(coef) < ZERO) return;
    const abs = Math.abs(coef);
    const body = mono === '' ? present(abs) : abs === 1 ? mono : `${present(abs)}${mono}`;
    if (parts.length === 0) parts.push(coef < 0 ? `−${body}` : body);
    else parts.push(coef < 0 ? `−${body}` : `+${body}`);
  };
  push(a2, 'x²');
  push(a1, 'x');
  push(a0, '');
  return parts.length ? `${name}(x)=${parts.join('')}` : `${name}(x)=0`;
}

/** Exact-ish 4×4 determinant via Laplace / expansion. */
function det4(M: number[][]): number {
  const a = M;
  const det3 = (m: number[][]) =>
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  let d = 0;
  for (let j = 0; j < 4; j++) {
    const minor: number[][] = [];
    for (let i = 1; i < 4; i++) {
      minor.push(a[i].filter((_, k) => k !== j));
    }
    d += ((j % 2 === 0 ? 1 : -1) * a[0][j] * det3(minor));
  }
  return d;
}

function quadRoots(a: number, b: number, c: number): number[] {
  if (Math.abs(a) < ZERO) {
    if (Math.abs(b) < ZERO) return [];
    return [-c / b];
  }
  const d = b * b - 4 * a * c;
  if (d < -ZERO) return [];
  if (Math.abs(d) <= ZERO) return [-b / (2 * a)];
  const s = Math.sqrt(Math.max(0, d));
  return [(-b - s) / (2 * a), (-b + s) / (2 * a)];
}

/**
 * Resultant via Sylvester matrix for two quadratics (ALG-POL-011).
 */
export function SylvesterResultantViz() {
  // Default: (x-1)(x-2)=x²-3x+2 and (x-1)(x-3)=x²-4x+3 → common root 1
  const [a2, setA2] = useState(1);
  const [a1, setA1] = useState(-3);
  const [a0, setA0] = useState(2);
  const [b2, setB2] = useState(1);
  const [b1, setB1] = useState(-4);
  const [b0, setB0] = useState(3);
  const [buildStep, setBuildStep] = useState(3);
  const [showAdv, setShowAdv] = useState(false);
  const guideId = useId();
  const statusId = useId();

  const S = useMemo(
    () => [
      [a2, a1, a0, 0],
      [0, a2, a1, a0],
      [b2, b1, b0, 0],
      [0, b2, b1, b0],
    ],
    [a2, a1, a0, b2, b1, b0],
  );

  const res = det4(S);
  const resZero = Math.abs(res) < 1e-5;
  const rootsF = quadRoots(a2, a1, a0);
  const rootsG = quadRoots(b2, b1, b0);
  const common = rootsF.filter((r) => rootsG.some((s) => Math.abs(r - s) < 1e-4));

  const xMin = -1;
  const xMax = 5;
  const yMin = -6;
  const yMax = 8;
  const plotW = W - MARGIN.l - MARGIN.r;
  const plotH = H - MARGIN.t - MARGIN.b;
  const toX = (x: number) => MARGIN.l + ((x - xMin) / (xMax - xMin)) * plotW;
  const toY = (y: number) => MARGIN.t + ((yMax - y) / (yMax - yMin)) * plotH;
  const f = (x: number) => a2 * x * x + a1 * x + a0;
  const g = (x: number) => b2 * x * x + b1 * x + b0;
  const path = (fn: (x: number) => number) => {
    const pts = linspace(xMin, xMax, 120).map((x) => `${toX(x)},${toY(fn(x))}`);
    return `M${pts.join(' L')}`;
  };

  const cellKind = (i: number, j: number): 'f' | 'g' | 'z' => {
    if (i < 2) return S[i][j] === 0 && !(i === 0 && j < 3) && !(i === 1 && j > 0) ? 'z' : S[i][j] === 0 ? 'z' : 'f';
    return S[i][j] === 0 ? 'z' : 'g';
  };

  const applyCommon = () => {
    setA2(1); setA1(-3); setA0(2);
    setB2(1); setB1(-4); setB0(3);
  };
  const applyNone = () => {
    setA2(1); setA1(-3); setA0(2);
    setB2(1); setB1(-7); setB0(12);
  };

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            La matriz de Sylvester organiza los coeficientes de dos polinomios. El determinante de
            esta matriz es su resultante.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Modifica los coeficientes de f y g. Cuando la resultante llega a ≈0, los dos polinomios
            comparten una raíz. det S(f,g)=0 ⟺ raíz común.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
          <p className="text-[var(--accent-strong)]">{formatQuad('f', a2, a1, a0)}</p>
          <p className="text-teal">{formatQuad('g', b2, b1, b0)}</p>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">
            f:[{present(a2)}, {present(a1)}, {present(a0)}] · g:[{present(b2)}, {present(b1)}, {present(b0)}]
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Construcción S(f,g)
          </p>
          <ButtonRow>
            <VizButton active={buildStep >= 0} onClick={() => setBuildStep(0)}>Coeficientes</VizButton>
            <VizButton active={buildStep >= 1} onClick={() => setBuildStep(1)}>Filas</VizButton>
            <VizButton active={buildStep >= 2} onClick={() => setBuildStep(2)}>Matriz</VizButton>
            <VizButton active={buildStep >= 3} onClick={() => setBuildStep(3)}>Resultante</VizButton>
          </ButtonRow>
          {buildStep >= 0 ? (
            <div className="mt-2 grid gap-2 sm:grid-cols-2 font-mono text-xs sm:text-sm">
              <p className="text-[var(--accent-strong)]">[a₂,a₁,a₀]=[{present(a2)},{present(a1)},{present(a0)}]</p>
              <p className="text-teal">[b₂,b₁,b₀]=[{present(b2)},{present(b1)},{present(b0)}]</p>
            </div>
          ) : null}
          {buildStep >= 1 ? (
            <div className="mt-2 space-y-1 font-mono text-xs text-[var(--fg-muted)]">
              <p>[{present(a2)},{present(a1)},{present(a0)},0]</p>
              <p>[0,{present(a2)},{present(a1)},{present(a0)}]</p>
              <p>[{present(b2)},{present(b1)},{present(b0)},0]</p>
              <p>[0,{present(b2)},{present(b1)},{present(b0)}]</p>
            </div>
          ) : null}
          {buildStep >= 2 ? (
            <div className="mt-3 inline-block overflow-x-auto">
              <p className="mb-1 font-mono text-sm">S(f,g) ∈ ℝ⁴ˣ⁴ (deg f=deg g=2 ⇒ m+n=4)</p>
              <div className="grid grid-cols-4 gap-1">
                {S.map((row, i) =>
                  row.map((v, j) => {
                    const kind = cellKind(i, j);
                    const cls =
                      kind === 'f'
                        ? 'border-[var(--accent-strong)] bg-[color-mix(in_oklab,var(--accent-strong)_12%,transparent)]'
                        : kind === 'g'
                          ? 'border-teal bg-[color-mix(in_oklab,teal_12%,transparent)]'
                          : 'border-[var(--border)] opacity-60';
                    return (
                      <div key={`${i}-${j}`} className={`flex h-10 w-12 items-center justify-center rounded border font-mono text-sm ${cls}`}>
                        {present(v)}
                      </div>
                    );
                  }),
                )}
              </div>
            </div>
          ) : null}
          {buildStep >= 3 ? (
            <div className="mt-3 font-mono text-sm">
              <p>Res(f,g)=det S(f,g)={resZero ? '≈0' : present(res)}</p>
              <p className={resZero ? 'text-teal' : 'text-[var(--fg-muted)]'}>
                {resZero
                  ? 'S(f,g) singular · los polinomios poseen al menos una raíz común'
                  : 'S(f,g) no singular · no hay raíces comunes'}
              </p>
            </div>
          ) : null}
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="mb-1 text-xs text-[var(--fg-muted)]">
            Una raíz común es un punto (r,0) en el eje x — no cualquier intersección f=g.
          </p>
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-xl" role="img" aria-labelledby={statusId}>
            <line x1={toX(xMin)} y1={toY(0)} x2={toX(xMax)} y2={toY(0)} stroke="currentColor" opacity={0.45} />
            <line x1={toX(0)} y1={toY(yMin)} x2={toX(0)} y2={toY(yMax)} stroke="currentColor" opacity={0.45} />
            <path d={path(f)} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
            <path d={path(g)} fill="none" stroke="teal" strokeWidth={2} />
            {rootsF.map((r, i) => (
              <circle key={`f${i}`} cx={toX(r)} cy={toY(0)} r={4} fill="var(--accent-strong)" opacity={0.7} />
            ))}
            {rootsG.map((r, i) => (
              <circle key={`g${i}`} cx={toX(r)} cy={toY(0)} r={4} fill="teal" opacity={0.7} />
            ))}
            {common.map((r, i) => (
              <g key={`c${i}`}>
                <circle cx={toX(r)} cy={toY(0)} r={7} fill="orange" stroke="currentColor" />
                <text x={toX(r)} y={toY(0) - 10} textAnchor="middle" fontSize={10} fill="orange">
                  r={present(r)}
                </text>
              </g>
            ))}
          </svg>
          <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2 font-mono">
            <p>Z_f={'{' + (rootsF.map(present).join(', ') || '∅') + '}'}</p>
            <p>Z_g={'{' + (rootsG.map(present).join(', ') || '∅') + '}'}</p>
          </div>
          <p className="mt-1 font-mono text-sm">
            Z_f ∩ Z_g={'{' + (common.map(present).join(', ') || '∅') + '}'}
          </p>
          {common.length ? (
            <p className="mt-1 font-mono text-xs text-[var(--fg-muted)]">
              f({present(common[0])})={present(f(common[0]))} · g({present(common[0])})=
              {present(g(common[0]))} · ambos ≈0 ✓
            </p>
          ) : null}
        </section>

        {showAdv ? (
          <section className="rounded-xl border border-[var(--border)] px-3 py-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
              Vista avanzada
            </p>
            <p className="mt-1 font-mono text-xs">
              Res(f,g)=a₂ⁿ ∏ g(αᵢ) (n=deg g). Si algún αᵢ es raíz de g, el producto es 0.
            </p>
          </section>
        ) : null}

        <div id={statusId} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" aria-live="polite">
          <p className="font-mono">
            deg f=2, deg g=2 · S:4×4 · Res={resZero ? '≈0' : present(res)} ·{' '}
            {resZero ? 'hay raíz común' : 'sin raíz común'}
            {common.length ? ` · x=${present(common[0])}` : ''}
          </p>
        </div>

        <ControlsStack>
          <ButtonRow>
            <VizButton onClick={applyCommon}>Con raíz común</VizButton>
            <VizButton onClick={applyNone}>Sin raíz común</VizButton>
            <VizButton active={showAdv} onClick={() => setShowAdv((s) => !s)}>Avanzado</VizButton>
          </ButtonRow>
          <p className="text-xs font-semibold text-[var(--accent-strong)]">Polinomio f</p>
          <SliderRow label="a₂" value={a2} min={-2} max={2} step={0.1} onChange={(v) => setA2(snap(v === 0 ? 0.1 : v, -2, 2, 0.1))} />
          <SliderRow label="a₁" value={a1} min={-6} max={6} step={0.1} onChange={(v) => setA1(snap(v, -6, 6, 0.1))} />
          <SliderRow label="a₀" value={a0} min={-6} max={6} step={0.1} onChange={(v) => setA0(snap(v, -6, 6, 0.1))} />
          <p className="text-xs font-semibold text-teal">Polinomio g</p>
          <SliderRow label="b₂" value={b2} min={-2} max={2} step={0.1} onChange={(v) => setB2(snap(v === 0 ? 0.1 : v, -2, 2, 0.1))} />
          <SliderRow label="b₁" value={b1} min={-8} max={4} step={0.1} onChange={(v) => setB1(snap(v, -8, 4, 0.1))} />
          <SliderRow label="b₀" value={b0} min={-4} max={14} step={0.1} onChange={(v) => setB0(snap(v, -4, 14, 0.1))} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
