'use client';

import { useMemo, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  VizButton,
  VizPanel,
  fmt,
} from './controls';
import {
  DET_EPS,
  Mat2Editor,
  cloneMat2,
  formatFrac,
  formatSigned,
} from './detHelpers';
import { applyMat, det2, type Mat2 } from './math2d';
import { present } from './matrixGrid';

const DEFAULT_A: Mat2 = [
  [2, 1],
  [1, 3],
];
const DEFAULT_B: [number, number] = [5, 4];

type Mode = 'x' | 'y' | 'all';

const PRESETS: Record<string, { A: Mat2; b: [number, number] }> = {
  Ejemplo: { A: DEFAULT_A, b: DEFAULT_B },
  Diagonal: {
    A: [
      [2, 0],
      [0, 4],
    ],
    b: [6, 8],
  },
  Singular: {
    A: [
      [1, 2],
      [2, 4],
    ],
    b: [3, 6],
  },
  Negativo: {
    A: [
      [1, 2],
      [3, 4],
    ],
    b: [5, 6],
  },
};

function isZero(n: number): boolean {
  return Math.abs(n) < DET_EPS;
}

function formatLin(a: number, b: number): string {
  const parts: string[] = [];
  if (!isZero(a)) {
    if (Math.abs(a) === 1) parts.push(a < 0 ? '−x' : 'x');
    else parts.push(`${formatSigned(a)}x`);
  }
  if (!isZero(b)) {
    const absB = formatSigned(Math.abs(b));
    const by = Math.abs(b) === 1 ? 'y' : `${absB}y`;
    if (parts.length === 0) parts.push(b < 0 ? `−${by}` : by);
    else parts.push(b < 0 ? `−${by}` : `+${by}`);
  }
  return parts.length ? parts.join('') : '0';
}

function VecCol({
  values,
  label,
  highlight,
  editable,
  onChange,
}: {
  values: [number, number];
  label: string;
  highlight?: boolean;
  editable?: boolean;
  onChange?: (v: [number, number]) => void;
}) {
  const cls = `w-14 h-10 rounded border text-center font-mono text-sm tabular-nums ${
    highlight
      ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)]'
      : 'border-[var(--border)] bg-[var(--bg)]'
  }`;
  return (
    <div className="inline-flex flex-col items-center gap-1">
      <span
        className={`font-mono text-xs ${
          highlight ? 'font-semibold text-[var(--accent-strong)]' : 'text-[var(--fg-muted)]'
        }`}
      >
        {label}
      </span>
      <div className="relative px-2 py-1">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1.5 rounded-l-[4px] border-y-2 border-l-2 border-[var(--fg-muted)] opacity-60"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-1.5 rounded-r-[4px] border-y-2 border-r-2 border-[var(--fg-muted)] opacity-60"
        />
        <div className="grid grid-cols-1 gap-2">
          {editable && onChange ? (
            <>
              <input
                type="number"
                step="any"
                value={values[0]}
                aria-label={`${label}₁`}
                onChange={(e) => onChange([Number(e.target.value) || 0, values[1]])}
                className={`${cls} focus:outline-none focus:ring-2 focus:ring-[var(--accent-strong)]/40`}
              />
              <input
                type="number"
                step="any"
                value={values[1]}
                aria-label={`${label}₂`}
                onChange={(e) => onChange([values[0], Number(e.target.value) || 0])}
                className={`${cls} focus:outline-none focus:ring-2 focus:ring-[var(--accent-strong)]/40`}
              />
            </>
          ) : (
            <>
              <div className={`${cls} flex items-center justify-center`}>{formatSigned(values[0])}</div>
              <div className={`${cls} flex items-center justify-center`}>{formatSigned(values[1])}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function UnknownCol() {
  return (
    <div className="inline-flex flex-col items-center gap-1">
      <span className="font-mono text-xs text-[var(--fg-muted)]">X</span>
      <div className="relative px-2 py-1">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1.5 rounded-l-[4px] border-y-2 border-l-2 border-[var(--fg-muted)] opacity-60"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-1.5 rounded-r-[4px] border-y-2 border-r-2 border-[var(--fg-muted)] opacity-60"
        />
        <div className="grid grid-cols-1 gap-2">
          <div className="flex h-10 w-14 items-center justify-center rounded border border-[var(--border)] bg-[var(--bg)] font-mono text-sm">
            x
          </div>
          <div className="flex h-10 w-14 items-center justify-center rounded border border-[var(--border)] bg-[var(--bg)] font-mono text-sm">
            y
          </div>
        </div>
      </div>
    </div>
  );
}

function DetCard({
  name,
  m,
  det,
  highlightCol,
}: {
  name: string;
  m: Mat2;
  det: number;
  highlightCol?: number | null;
}) {
  const detLabel = name === 'A' ? 'Δ' : name === 'Aₓ' ? 'Δₓ' : 'Δᵧ';
  return (
    <div className="min-w-[8.5rem] flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2 py-2">
      <div className="mb-1 text-center font-mono text-xs font-semibold text-[var(--fg-muted)]">{name}</div>
      <div className="flex justify-center">
        <Mat2Editor m={m} readOnly highlightCol={highlightCol ?? null} name={name} />
      </div>
      <p className="mt-1 text-center font-mono text-xs">
        {detLabel} = <span className="font-semibold text-[var(--accent-strong)]">{present(det)}</span>
      </p>
    </div>
  );
}

/**
 * Regla de Cramer 2×2: reemplazar columnas por b y comparar determinantes.
 */
export function CramerRuleViz() {
  const [A, setA] = useState<Mat2>(DEFAULT_A);
  const [b, setB] = useState<[number, number]>(DEFAULT_B);
  const [mode, setMode] = useState<Mode>('x');

  const a11 = A[0][0];
  const a12 = A[0][1];
  const a21 = A[1][0];
  const a22 = A[1][1];

  const Ax: Mat2 = useMemo(
    () => [
      [b[0], a12],
      [b[1], a22],
    ],
    [a12, a22, b],
  );
  const Ay: Mat2 = useMemo(
    () => [
      [a11, b[0]],
      [a21, b[1]],
    ],
    [a11, a21, b],
  );

  const delta = det2(A);
  const deltaX = det2(Ax);
  const deltaY = det2(Ay);
  const singular = Math.abs(delta) < DET_EPS;

  const xSol = singular ? null : deltaX / delta;
  const ySol = singular ? null : deltaY / delta;

  const eq1 = `${formatLin(a11, a12)}=${formatSigned(b[0])}`;
  const eq2 = `${formatLin(a21, a22)}=${formatSigned(b[1])}`;

  const check = useMemo(() => {
    if (xSol === null || ySol === null) return null;
    const Axb = applyMat(A, { x: xSol, y: ySol });
    const ok = Math.abs(Axb.x - b[0]) < 1e-6 && Math.abs(Axb.y - b[1]) < 1e-6;
    return { Axb, ok };
  }, [A, b, xSol, ySol]);

  const showX = mode === 'x' || mode === 'all';
  const showY = mode === 'y' || mode === 'all';
  const highlightCol = mode === 'x' ? 0 : mode === 'y' ? 1 : null;

  return (
    <VizPanel
      title="Regla de Cramer"
      caption="Cada incógnita se obtiene reemplazando su columna por b y dividiendo determinantes: xᵢ = det(Aᵢ)/det(A)."
    >
      <div className="space-y-3">
        <p className="text-sm text-[var(--fg)]">
          Cramer obtiene cada incógnita reemplazando su columna de A por el vector b y comparando
          determinantes.
        </p>
        <p className="text-sm text-[var(--fg-muted)]">
          <span className="font-medium text-[var(--fg)]">Pruébalo — </span>
          Edita las seis entradas; elige Resolver x, Resolver y o Ver todo. Si Δ = 0, Cramer no es
          aplicable.
        </p>

        <section className="space-y-1 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
            Sistema
          </p>
          <div className="font-mono text-sm">
            <p>
              {'{'} {eq1}
            </p>
            <p className="pl-3">
              {eq2} {'}'}
            </p>
          </div>
        </section>

        <section className="space-y-2 rounded-lg border border-[var(--border)] px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
            A · X = b
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Mat2Editor
              m={A}
              labels={['x', 'y']}
              highlightCol={highlightCol}
              onChange={setA}
              name="A"
            />
            <span className="font-mono text-xl">·</span>
            <UnknownCol />
            <span className="font-mono text-xl">=</span>
            <VecCol values={b} label="b" editable onChange={setB} />
          </div>
          <p className="text-[11px] text-[var(--fg-muted)]">
            Edita A (columnas x, y) y b. Todo se actualiza en vivo.
          </p>
        </section>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 font-mono text-sm">
          <span className="text-[var(--fg-muted)]">Δ = det(A) = </span>
          ({formatSigned(a11)})({formatSigned(a22)}) − ({formatSigned(a12)})({formatSigned(a21)}) ={' '}
          <span className="font-semibold text-[var(--accent-strong)]">{present(delta)}</span>
          {singular ? (
            <p className="mt-1 font-sans text-xs text-amber-800 dark:text-amber-200">
              Cramer no es aplicable. Con Δ = 0, Cramer no determina una solución única.
            </p>
          ) : null}
        </div>

        <ButtonRow>
          <VizButton active={mode === 'x'} onClick={() => setMode('x')}>
            Resolver x
          </VizButton>
          <VizButton active={mode === 'y'} onClick={() => setMode('y')}>
            Resolver y
          </VizButton>
          <VizButton active={mode === 'all'} onClick={() => setMode('all')}>
            Ver todo
          </VizButton>
        </ButtonRow>

        <ButtonRow>
          {Object.entries(PRESETS).map(([label, p]) => (
            <VizButton
              key={label}
              onClick={() => {
                setA(cloneMat2(p.A));
                setB([p.b[0], p.b[1]]);
              }}
            >
              {label}
            </VizButton>
          ))}
        </ButtonRow>

        {showX ? (
          <section className="space-y-2 rounded-lg border border-[var(--border)] px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              Resolver x — reemplaza la columna x por b
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Mat2Editor m={A} labels={['x', 'y']} highlightCol={0} readOnly name="A" />
              <span className="text-sm text-[var(--fg-muted)]">↓ columna x ← b</span>
              <Mat2Editor m={Ax} labels={['b', 'y']} highlightCol={0} readOnly name="Aₓ" />
            </div>
            <p className="font-mono text-sm">
              Δₓ = det(Aₓ) = ({formatSigned(b[0])})({formatSigned(a22)}) − ({formatSigned(a12)})(
              {formatSigned(b[1])}) ={' '}
              <span className="font-semibold text-[var(--accent-strong)]">{present(deltaX)}</span>
            </p>
            {singular ? (
              <p className="text-sm text-[var(--fg-muted)]">
                Sin cociente: no se divide Δₓ entre Δ = 0.
              </p>
            ) : (
              <p className="font-mono text-sm">
                x = Δₓ/Δ = {formatFrac(deltaX, delta)}
                {Math.abs(deltaX / delta - Math.round(deltaX / delta)) > 1e-9
                  ? ` ≈ ${present(deltaX / delta)}`
                  : ''}
              </p>
            )}
          </section>
        ) : null}

        {showY ? (
          <section className="space-y-2 rounded-lg border border-[var(--border)] px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              Resolver y — reemplaza la columna y por b
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Mat2Editor m={A} labels={['x', 'y']} highlightCol={1} readOnly name="A" />
              <span className="text-sm text-[var(--fg-muted)]">↓ columna y ← b</span>
              <Mat2Editor m={Ay} labels={['x', 'b']} highlightCol={1} readOnly name="Aᵧ" />
            </div>
            <p className="font-mono text-sm">
              Δᵧ = det(Aᵧ) = ({formatSigned(a11)})({formatSigned(b[1])}) − ({formatSigned(b[0])})(
              {formatSigned(a21)}) ={' '}
              <span className="font-semibold text-[var(--accent-strong)]">{present(deltaY)}</span>
            </p>
            {singular ? (
              <p className="text-sm text-[var(--fg-muted)]">
                Sin cociente: no se divide Δᵧ entre Δ = 0.
              </p>
            ) : (
              <p className="font-mono text-sm">
                y = Δᵧ/Δ = {formatFrac(deltaY, delta)}
                {Math.abs(deltaY / delta - Math.round(deltaY / delta)) > 1e-9
                  ? ` ≈ ${present(deltaY / delta)}`
                  : ''}
              </p>
            )}
          </section>
        ) : null}

        {mode === 'all' ? (
          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              Tres determinantes
            </p>
            <div className="flex flex-wrap gap-2">
              <DetCard name="A" m={A} det={delta} />
              <DetCard name="Aₓ" m={Ax} det={deltaX} highlightCol={0} />
              <DetCard name="Aᵧ" m={Ay} det={deltaY} highlightCol={1} />
            </div>
            {!singular ? (
              <p className="font-mono text-sm">
                x = Δₓ/Δ = {formatFrac(deltaX, delta)} · y = Δᵧ/Δ = {formatFrac(deltaY, delta)}
              </p>
            ) : null}
            <p className="text-xs text-[var(--fg-muted)]">
              Aᵢ se obtiene reemplazando la columna i de A por b. En general: xᵢ = det(Aᵢ)/det(A).
            </p>
          </section>
        ) : null}

        {!singular && xSol !== null && ySol !== null && check ? (
          <section className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              Comprobación
            </p>
            <p className="font-mono text-xs leading-relaxed">
              {formatSigned(a11)}({formatFrac(deltaX, delta)}) + {formatSigned(a12)}(
              {formatFrac(deltaY, delta)}) = {formatSigned(check.Axb.x)}
              {Math.abs(check.Axb.x - b[0]) < 1e-6 ? ` = ${formatSigned(b[0])} ✓` : ''}
              <br />
              {formatSigned(a21)}({formatFrac(deltaX, delta)}) + {formatSigned(a22)}(
              {formatFrac(deltaY, delta)}) = {formatSigned(check.Axb.y)}
              {Math.abs(check.Axb.y - b[1]) < 1e-6 ? ` = ${formatSigned(b[1])} ✓` : ''}
            </p>
            <p className="font-mono text-sm">
              A X = b {check.ok ? '✓' : ''} · X = ({formatFrac(deltaX, delta)},{' '}
              {formatFrac(deltaY, delta)})
            </p>
          </section>
        ) : null}

        <ControlsStack>
          <p className="text-xs text-[var(--fg-muted)]">
            Δ = {fmt(delta)} · Δₓ = {fmt(deltaX)} · Δᵧ = {fmt(deltaY)}
            {singular ? ' · Cramer no aplicable' : ''}.
          </p>
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
