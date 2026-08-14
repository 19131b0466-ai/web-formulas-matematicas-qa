'use client';

import { useId, useMemo, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  SliderRow,
  ToggleRow,
  VizButton,
  VizPanel,
  fmt,
} from './controls';
import {
  DET_EPS,
  Mat2Editor,
  NEAR_SINGULAR,
  cols,
  formatSigned,
  matFromCols,
  orientationLabel,
  rank2,
} from './detHelpers';
import { det2, inv2, type Mat2, type Vec2 } from './math2d';
import { present } from './matrixGrid';
import {
  ArrowMarker,
  Axes,
  COLOR_U,
  COLOR_V,
  VEC_W,
  autoScale,
  clampVec,
  useVecDrag,
} from './vectorPlane';

const W = VEC_W;
const H = 300;
const ox = W / 2;
const oy = H / 2;
const CLAMP = 3.5;

const DEFAULT_A: Mat2 = [
  [2, 0.5],
  [0.3, 1.8],
];

const PRESETS: Record<string, Mat2> = {
  Invertible: DEFAULT_A,
  'Casi singular': [
    [1, 1],
    [1, 1.001],
  ],
  Singular: [
    [2, 4],
    [1, 2],
  ],
  'Matriz cero': [
    [0, 0],
    [0, 0],
  ],
};

function dimLossLabel(rank: 0 | 1 | 2): string {
  if (rank === 2) return 'ℝ² → ℝ² (conserva dimensión)';
  if (rank === 1) return 'ℝ² → línea (pierde 1 dimensión)';
  return 'ℝ² → punto (pierde 2 dimensiones)';
}

function Mat2Readonly({ m, name = 'A⁻¹' }: { m: Mat2; name?: string }) {
  return (
    <Mat2Editor m={m} name={name} readOnly />
  );
}

/**
 * Criterio de invertibilidad 2×2: A invertible ⇔ det≠0 ⇔ rank=2 ⇔ columnas independientes ⇔ área>0.
 */
export function InvertibilityCriterionViz() {
  const uid = useId().replace(/:/g, '');
  const [A, setA] = useState<Mat2>(DEFAULT_A);
  const [showInv, setShowInv] = useState(false);

  const { u, v } = useMemo(() => cols(A), [A]);
  const det = det2(A);
  const area = Math.abs(det);
  const rank = rank2(A);
  const singular = area < DET_EPS;
  const nearSingular = !singular && area < NEAR_SINGULAR;
  const invertible = !singular;
  const Ainv = useMemo(() => (invertible ? inv2(A) : null), [A, invertible]);

  const setFromCols = (nu: Vec2, nv: Vec2) => setA(matFromCols(nu, nv));

  const maxAbs = Math.max(
    1.5,
    Math.hypot(u.x, u.y),
    Math.hypot(v.x, v.y),
    Math.hypot(u.x + v.x, u.y + v.y),
  );
  const S = autoScale(maxAbs, Math.min(W, H), 40, 32, 70);
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });

  const O = { x: ox, y: oy };
  const U = to(u);
  const V = to(v);
  const UV = to({ x: u.x + v.x, y: u.y + v.y });
  const poly = `${O.x},${O.y} ${U.x},${U.y} ${UV.x},${UV.y} ${V.x},${V.y}`;
  const cx = (O.x + U.x + V.x + UV.x) / 4;
  const cy = (O.y + U.y + V.y + UV.y) / 4;

  const dragU = useVecDrag((p) => setFromCols(clampVec(p, CLAMP), v), S, { x: ox, y: oy });
  const dragV = useVecDrag((p) => setFromCols(u, clampVec(p, CLAMP)), S, { x: ox, y: oy });

  const statusBadge = singular ? (
    <span className="rounded-md border border-red-500/40 bg-red-500/10 px-2.5 py-1 font-mono text-xs font-semibold text-red-700 dark:text-red-300">
      ✕ SINGULAR
    </span>
  ) : nearSingular ? (
    <span className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 font-mono text-xs font-semibold text-amber-800 dark:text-amber-200">
      ⚠ Cercana a singular · ✓ INVERTIBLE
    </span>
  ) : (
    <span className="rounded-md border border-[var(--accent-strong)]/40 bg-[var(--accent-soft)] px-2.5 py-1 font-mono text-xs font-semibold text-[var(--accent-strong)]">
      ✓ INVERTIBLE
    </span>
  );

  const chain = invertible
    ? `A invertible ↔ det ≠ 0 (${present(det)}) ↔ rango = 2 ↔ columnas independientes ↔ área = ${present(area)} > 0 ↔ existe A⁻¹`
    : `A singular ↔ det = 0 ↔ rango = ${rank} ↔ columnas dependientes ↔ área = 0 ↔ A⁻¹ no existe`;

  return (
    <VizPanel
      title="Criterio de invertibilidad"
      caption="Las columnas generan un paralelogramo: si el área es positiva, A es invertible; si colapsa, se pierde dimensión y A⁻¹ no existe."
    >
      <div className="space-y-3">
        <p className="text-sm text-[var(--fg)]">
          Una matriz 2×2 es invertible exactamente cuando sus columnas generan área distinta de cero:
          det ≠ 0, rango 2 y columnas linealmente independientes son la misma condición.
        </p>
        <p className="text-sm text-[var(--fg-muted)]">
          <span className="font-medium text-[var(--fg)]">Pruébalo — </span>
          Edita A, arrastra u y v, o usa un preset. Observa el estado (invertible / singular) y la
          cadena de equivalencias.
        </p>

        <div className="flex flex-wrap items-center gap-2">{statusBadge}</div>

        <div className="flex flex-wrap items-start gap-4">
          <div className="space-y-1">
            <div className="font-mono text-xs text-[var(--fg-muted)]">A = [u | v]</div>
            <Mat2Editor m={A} labels={['u', 'v']} onChange={setA} />
            <div className="font-mono text-[11px] text-[var(--fg-muted)]">
              u=({formatSigned(u.x)}, {formatSigned(u.y)}) · v=({formatSigned(v.x)}, {formatSigned(v.y)})
            </div>
          </div>

          <div className="min-w-[12rem] flex-1 space-y-1 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm">
            <div className="font-mono text-xs text-[var(--fg-muted)]">Estado actual</div>
            <div className="font-mono text-xs leading-relaxed">
              det(A) = <span className="font-semibold text-[var(--accent-strong)]">{present(det)}</span>
              <br />
              Área = |det| = {present(area)}
              <br />
              Rango = {rank}
              <br />
              Orientación: {orientationLabel(det)}
              <br />
              Dimensión: {dimLossLabel(rank)}
            </div>
            {nearSingular ? (
              <p className="border-t border-[var(--border)] pt-1 text-xs text-amber-800 dark:text-amber-200">
                0 &lt; |det| &lt; {NEAR_SINGULAR}: numéricamente frágil, pero aún invertible.
              </p>
            ) : null}
          </div>
        </div>

        <p className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 font-mono text-xs leading-relaxed text-[var(--fg)]">
          {chain}
        </p>

        <div
          className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg)]"
          onPointerMove={(e) => {
            dragU.onPointerMove(e);
            dragV.onPointerMove(e);
          }}
          onPointerUp={() => {
            dragU.onPointerUp();
            dragV.onPointerUp();
          }}
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Columnas de A como paralelogramo">
            <defs>
              <ArrowMarker id={`${uid}-u`} color={COLOR_U} />
              <ArrowMarker id={`${uid}-v`} color={COLOR_V} />
            </defs>
            <Axes W={W} H={H} ox={ox} oy={oy} S={S} xLabel="x" yLabel="y" />
            {!singular ? (
              <polygon
                points={poly}
                fill="var(--accent-soft)"
                stroke="var(--accent)"
                strokeWidth={1.2}
                opacity={nearSingular ? 0.45 : 0.9}
              />
            ) : rank === 1 ? (
              <line
                x1={ox - (U.x - ox) * 1.2}
                y1={oy - (U.y - oy) * 1.2}
                x2={ox + (U.x - ox) * 1.2}
                y2={oy + (U.y - oy) * 1.2}
                stroke="var(--accent-strong)"
                strokeWidth={2}
                strokeDasharray="4 3"
              />
            ) : (
              <circle cx={ox} cy={oy} r={6} fill="var(--accent-strong)" opacity={0.7} />
            )}
            <line x1={U.x} y1={U.y} x2={UV.x} y2={UV.y} stroke={COLOR_V} strokeWidth={1.2} strokeDasharray="4 3" opacity={0.65} />
            <line x1={V.x} y1={V.y} x2={UV.x} y2={UV.y} stroke={COLOR_U} strokeWidth={1.2} strokeDasharray="4 3" opacity={0.65} />
            <line x1={ox} y1={oy} x2={U.x} y2={U.y} stroke={COLOR_U} strokeWidth={2.4} markerEnd={`url(#${uid}-u)`} />
            <line x1={ox} y1={oy} x2={V.x} y2={V.y} stroke={COLOR_V} strokeWidth={2.4} markerEnd={`url(#${uid}-v)`} />
            {!singular && area * S * S > 900 ? (
              <text x={cx} y={cy} textAnchor="middle" className="fill-[var(--fg)] text-[11px] font-medium">
                Área={present(area)}
              </text>
            ) : null}
            <text x={U.x + 8} y={U.y - 6} className="fill-[var(--accent-strong)] text-[11px] font-medium">
              u
            </text>
            <text x={V.x + 8} y={V.y - 6} className="fill-teal-700 text-[11px] font-medium dark:fill-teal-300">
              v
            </text>
            <circle
              cx={U.x}
              cy={U.y}
              r={9}
              fill={COLOR_U}
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={dragU.onPointerDown}
              aria-label="Arrastrar u"
            />
            <circle
              cx={V.x}
              cy={V.y}
              r={9}
              fill={COLOR_V}
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={dragV.onPointerDown}
              aria-label="Arrastrar v"
            />
          </svg>
        </div>

        <ButtonRow>
          {Object.entries(PRESETS).map(([label, m]) => (
            <VizButton
              key={label}
              active={
                A[0][0] === m[0][0] &&
                A[0][1] === m[0][1] &&
                A[1][0] === m[1][0] &&
                A[1][1] === m[1][1]
              }
              onClick={() => {
                setA(m);
                setShowInv(false);
              }}
            >
              {label}
            </VizButton>
          ))}
          <VizButton
            onClick={() => {
              const nu = { ...u };
              if (Math.hypot(nu.x, nu.y) < DET_EPS) nu.x = 1;
              setFromCols(nu, { x: 2 * nu.x, y: 2 * nu.y });
              setShowInv(false);
            }}
          >
            Hacer singular
          </VizButton>
        </ButtonRow>

        <ControlsStack>
          <SliderRow label="uₓ" ariaLabel="Componente x de u" value={u.x} min={-3} max={3} step={0.05} onChange={(x) => setFromCols({ ...u, x }, v)} />
          <SliderRow label="uᵧ" ariaLabel="Componente y de u" value={u.y} min={-3} max={3} step={0.05} onChange={(y) => setFromCols({ ...u, y }, v)} />
          <SliderRow label="vₓ" ariaLabel="Componente x de v" value={v.x} min={-3} max={3} step={0.05} onChange={(x) => setFromCols(u, { ...v, x })} />
          <SliderRow label="vᵧ" ariaLabel="Componente y de v" value={v.y} min={-3} max={3} step={0.05} onChange={(y) => setFromCols(u, { ...v, y })} />
        </ControlsStack>

        {invertible ? (
          <div className="space-y-2">
            <ToggleRow label="Ver A⁻¹" checked={showInv} onChange={setShowInv} />
            {showInv && Ainv ? (
              <div className="flex flex-wrap items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2">
                <div className="space-y-1">
                  <div className="font-mono text-xs text-[var(--fg-muted)]">A⁻¹</div>
                  <Mat2Readonly m={Ainv} />
                </div>
                <p className="max-w-sm text-xs text-[var(--fg-muted)]">
                  Como det ≠ 0, existe A⁻¹. Un det negativo (orientación {orientationLabel(det)}) no
                  impide la invertibilidad: solo indica sentido horario.
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--fg-muted)]">
            Columnas dependientes: el paralelogramo colapsa (área 0). La transformación pierde
            dimensión ({dimLossLabel(rank)}) y A⁻¹ no existe.
          </p>
        )}

        <p className="text-xs text-[var(--fg-muted)]">
          det = {fmt(det)} · área = {fmt(area)} · rango = {rank} · {orientationLabel(det)}.
        </p>
      </div>
    </VizPanel>
  );
}
