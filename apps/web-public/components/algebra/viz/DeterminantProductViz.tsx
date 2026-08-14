'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { ButtonRow, VizButton, VizPanel } from './controls';
import {
  DET_EPS,
  Mat2Editor,
  cloneMat2,
  formatSigned,
  orientationLabel,
} from './detHelpers';
import { det2, matMul, type Mat2, type Vec2 } from './math2d';
import { present } from './matrixGrid';
import { ArrowMarker, Axes, COLOR_U, COLOR_V, VEC_W, autoScale } from './vectorPlane';

const W = VEC_W;
const H = 280;
const ox = W / 2;
const oy = H / 2;

const DEFAULT_A: Mat2 = [
  [2, 1],
  [0, 1],
];
const DEFAULT_B: Mat2 = [
  [1, 0],
  [1, 3],
];
const IDENTITY: Mat2 = [
  [1, 0],
  [0, 1],
];
const FLIP_A: Mat2 = [
  [-1, 0],
  [0, 1],
];
const SINGULAR_B: Mat2 = [
  [2, 4],
  [1, 2],
];

type Stage = 'I' | 'B' | 'AB' | 'compare';

function colsOf(m: Mat2): { u: Vec2; v: Vec2 } {
  return {
    u: { x: m[0][0], y: m[1][0] },
    v: { x: m[0][1], y: m[1][1] },
  };
}

function polyPoints(
  u: Vec2,
  v: Vec2,
  to: (p: Vec2) => { x: number; y: number },
): string {
  const O = to({ x: 0, y: 0 });
  const U = to(u);
  const V = to(v);
  const UV = to({ x: u.x + v.x, y: u.y + v.y });
  return `${O.x},${O.y} ${U.x},${U.y} ${UV.x},${UV.y} ${V.x},${V.y}`;
}

function ParallelogramLayer({
  m,
  to,
  fill,
  stroke,
  opacity = 0.85,
  label,
  uid,
  showArrows = true,
}: {
  m: Mat2;
  to: (p: Vec2) => { x: number; y: number };
  fill: string;
  stroke: string;
  opacity?: number;
  label?: string;
  uid: string;
  showArrows?: boolean;
}) {
  const { u, v } = colsOf(m);
  const area = Math.abs(det2(m));
  const degenerate = area < DET_EPS;
  const O = to({ x: 0, y: 0 });
  const U = to(u);
  const V = to(v);
  const UV = to({ x: u.x + v.x, y: u.y + v.y });
  const cx = (O.x + U.x + V.x + UV.x) / 4;
  const cy = (O.y + U.y + V.y + UV.y) / 4;

  return (
    <g>
      {!degenerate ? (
        <polygon points={polyPoints(u, v, to)} fill={fill} stroke={stroke} strokeWidth={1.4} opacity={opacity} />
      ) : (
        <line
          x1={U.x}
          y1={U.y}
          x2={V.x}
          y2={V.y}
          stroke={stroke}
          strokeWidth={2}
          strokeDasharray="4 3"
          opacity={opacity}
        />
      )}
      {showArrows ? (
        <>
          <line x1={O.x} y1={O.y} x2={U.x} y2={U.y} stroke={COLOR_U} strokeWidth={2} markerEnd={`url(#${uid}-u)`} />
          <line x1={O.x} y1={O.y} x2={V.x} y2={V.y} stroke={COLOR_V} strokeWidth={2} markerEnd={`url(#${uid}-v)`} />
        </>
      ) : null}
      {label && !degenerate ? (
        <text x={cx} y={cy} textAnchor="middle" className="fill-[var(--fg)] text-[10px] font-medium">
          {label}
        </text>
      ) : null}
    </g>
  );
}

export function DeterminantProductViz() {
  const uid = useId().replace(/:/g, '');
  const [A, setA] = useState<Mat2>(() => cloneMat2(DEFAULT_A));
  const [B, setB] = useState<Mat2>(() => cloneMat2(DEFAULT_B));
  const [stage, setStage] = useState<Stage>('compare');
  const [animToken, setAnimToken] = useState(0);

  const AB = useMemo(() => matMul(A, B), [A, B]);
  const detA = det2(A);
  const detB = det2(B);
  const detAB = det2(AB);
  const product = detA * detB;
  const checkOk = Math.abs(detAB - product) < 1e-6;
  const singularB = Math.abs(detB) < DET_EPS;

  const I = IDENTITY;
  const maxAbs = useMemo(() => {
    const mats = [I, B, AB];
    let m = 1.5;
    for (const mat of mats) {
      const { u, v } = colsOf(mat);
      m = Math.max(
        m,
        Math.hypot(u.x, u.y),
        Math.hypot(v.x, v.y),
        Math.hypot(u.x + v.x, u.y + v.y),
      );
    }
    return m;
  }, [B, AB]);

  const S = autoScale(maxAbs, Math.min(W, H), 40, 28, 64);
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });

  // Short stage morph respecting prefers-reduced-motion
  useEffect(() => {
    if (animToken === 0) return;
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setStage('compare');
      return;
    }
    const order: Stage[] = ['I', 'B', 'AB', 'compare'];
    let i = 0;
    setStage(order[0]!);
    const id = window.setInterval(() => {
      i += 1;
      if (i >= order.length) {
        window.clearInterval(id);
        return;
      }
      setStage(order[i]!);
    }, 700);
    return () => window.clearInterval(id);
  }, [animToken]);

  const areaChain = `1 × |det B| × |det A| = ${present(1)} × ${present(Math.abs(detB))} × ${present(Math.abs(detA))} = ${present(Math.abs(detAB))}`;

  return (
    <VizPanel
      title="Determinante del producto"
      caption="Primero B, después A: (AB)x = A(Bx). El área se multiplica |det B| · |det A|; el signo de det es la orientación."
    >
      <div className="space-y-3">
        <p className="text-sm text-[var(--fg)]">
          Vas a ver que det(AB)=det(A)det(B): las áreas se multiplican.
        </p>
        <p className="text-sm text-[var(--fg-muted)]">
          <span className="font-medium text-[var(--fg)]">Pruébalo — </span>
          Cambia A y B y compara el área del producto con el producto de áreas. Observa la cadena
          S → B(S) → A(B(S)).
        </p>

        <div className="flex flex-wrap items-start gap-4">
          <div className="space-y-1">
            <div className="font-mono text-xs text-[var(--fg-muted)]">A</div>
            <Mat2Editor m={A} name="A" onChange={setA} />
            <div className="font-mono text-[11px]">
              det(A) = <span className="text-[var(--accent-strong)]">{present(detA)}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-mono text-xs text-[var(--fg-muted)]">B</div>
            <Mat2Editor m={B} name="B" onChange={setB} />
            <div className="font-mono text-[11px]">
              det(B) = <span className="text-[var(--accent-strong)]">{present(detB)}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-mono text-xs text-[var(--fg-muted)]">AB (solo lectura)</div>
            <Mat2Editor m={AB} name="AB" readOnly />
            <div className="font-mono text-[11px]">
              det(AB) = <span className="font-semibold text-[var(--accent-strong)]">{present(detAB)}</span>
            </div>
          </div>
          <div className="min-w-[11rem] flex-1 space-y-1 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm">
            <div className="font-mono text-xs text-[var(--fg-muted)]">Comprobación</div>
            <div className="font-mono text-xs leading-relaxed">
              det(A)·det(B) = ({formatSigned(detA)})({formatSigned(detB)}) = {present(product)}
              <br />
              det(AB) = {present(detAB)}
              <br />
              {checkOk ? (
                <span className="font-semibold text-[var(--accent-strong)]">✓ det(AB)=det(A)det(B)</span>
              ) : (
                <span className="text-orange-600 dark:text-orange-400">✕ no coincide (revisa redondeo)</span>
              )}
            </div>
            <div className="border-t border-[var(--border)] pt-1 text-xs text-[var(--fg-muted)]">
              Área |det|: |det A|={present(Math.abs(detA))}, |det B|={present(Math.abs(detB))}, |det AB|=
              {present(Math.abs(detAB))}
              <br />
              Orientación A: {orientationLabel(detA)} · B: {orientationLabel(detB)} · AB:{' '}
              {orientationLabel(detAB)}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ['I', 'Inicial'],
              ['B', 'B'],
              ['AB', 'AB'],
              ['compare', 'Comparar'],
            ] as const
          ).map(([key, lab]) => (
            <VizButton key={key} active={stage === key} onClick={() => setStage(key)}>
              {lab}
            </VizButton>
          ))}
          <VizButton onClick={() => setAnimToken((t) => t + 1)}>Ver transformación</VizButton>
        </div>

        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg)]">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Composición S → B(S) → AB(S)">
            <defs>
              <ArrowMarker id={`${uid}-u`} color={COLOR_U} />
              <ArrowMarker id={`${uid}-v`} color={COLOR_V} />
            </defs>
            <Axes W={W} H={H} ox={ox} oy={oy} S={S} xLabel="x" yLabel="y" />
            {stage === 'I' || stage === 'compare' ? (
              <ParallelogramLayer
                m={I}
                to={to}
                fill="color-mix(in oklab, var(--fg-muted) 18%, transparent)"
                stroke="var(--fg-muted)"
                opacity={stage === 'compare' ? 0.45 : 0.9}
                label={stage === 'I' ? 'S (área 1)' : 'S'}
                uid={uid}
                showArrows={stage === 'I'}
              />
            ) : null}
            {stage === 'B' || stage === 'compare' ? (
              <ParallelogramLayer
                m={B}
                to={to}
                fill="color-mix(in oklab, teal 22%, transparent)"
                stroke="teal"
                opacity={stage === 'compare' ? 0.55 : 0.9}
                label={`B(S) · |det B|=${present(Math.abs(detB))}`}
                uid={uid}
                showArrows={stage === 'B'}
              />
            ) : null}
            {stage === 'AB' || stage === 'compare' ? (
              <ParallelogramLayer
                m={AB}
                to={to}
                fill="var(--accent-soft)"
                stroke="var(--accent-strong)"
                opacity={0.9}
                label={`AB(S) · |det|=${present(Math.abs(detAB))}`}
                uid={uid}
                showArrows={stage === 'AB' || stage === 'compare'}
              />
            ) : null}
          </svg>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 font-mono text-xs sm:text-sm">
          Cadena de áreas: {areaChain}
          <div className="mt-1 text-[11px] text-[var(--fg-muted)]">
            Orden: primero B, después A. El signo de det es orientación; el área geométrica es |det|.
          </div>
        </div>

        {singularB ? (
          <p className="rounded-lg border border-orange-500/40 bg-orange-500/10 px-3 py-2 text-sm text-[var(--fg)]">
            B es singular (det B = 0): B(S) colapsa a un segmento (área 0). Entonces det(AB)=0 aunque A
            sea invertible — el producto de áreas se anula.
          </p>
        ) : null}

        <ButtonRow>
          <VizButton
            onClick={() => {
              setA(cloneMat2(DEFAULT_A));
              setB(cloneMat2(DEFAULT_B));
              setStage('compare');
            }}
          >
            Ejemplo
          </VizButton>
          <VizButton
            onClick={() => {
              setA(cloneMat2(IDENTITY));
              setStage('compare');
            }}
          >
            Identidad (A=I)
          </VizButton>
          <VizButton
            onClick={() => {
              setA(cloneMat2(FLIP_A));
              setStage('compare');
            }}
          >
            Invertir orientación
          </VizButton>
          <VizButton
            onClick={() => {
              setB(cloneMat2(SINGULAR_B));
              setStage('B');
            }}
          >
            Singular B
          </VizButton>
        </ButtonRow>
      </div>
    </VizPanel>
  );
}
