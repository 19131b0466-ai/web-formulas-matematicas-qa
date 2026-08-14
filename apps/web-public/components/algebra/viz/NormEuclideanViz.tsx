'use client';

import { useId, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  SliderRow,
  ToggleRow,
  VizButton,
  VizPanel,
  joinCaption,
} from './controls';
import {
  Axes,
  ArrowMarker,
  COLOR_U,
  VEC_H,
  VEC_W,
  autoScale,
  clampVec,
  present,
  useVecDrag,
} from './vectorPlane';
import type { Vec2 } from './math2d';

type ViewMode = 'geo' | 'formula';

export function NormEuclideanViz() {
  const [u, setU] = useState<Vec2>({ x: 2, y: 1.5 });
  const [showCircle, setShowCircle] = useState(true);
  const [view, setView] = useState<ViewMode>('geo');
  const markId = useId();
  const guideId = useId();

  const x = u.x;
  const y = u.y;
  const normU = Math.hypot(x, y);
  const isZero = normU < 1e-9;

  const W = VEC_W;
  const H = VEC_H;
  const ox = W / 2;
  const oy = H / 2;
  const maxAbs = Math.max(1, Math.abs(x), Math.abs(y));
  const S = autoScale(maxAbs, Math.min(W, H));

  const tip = { x: ox + x * S, y: oy - y * S };
  const mid = { x: (ox + tip.x) / 2, y: (oy + tip.y) / 2 };

  const drag = useVecDrag((p) => setU(clampVec(p, 5)), S, { x: ox, y: oy });

  // Label offset: perpendicular to vector direction
  const dx = tip.x - ox;
  const dy = tip.y - oy;
  const len = Math.hypot(dx, dy) || 1;
  const perpX = -dy / len;
  const perpY = dx / len;
  const normLabelX = mid.x + perpX * 16;
  const normLabelY = mid.y + perpY * 16;

  return (
    <VizPanel
      caption={joinCaption(
        `u=(${present(x)}, ${present(y)})`,
        `‖u‖=√(${present(x)}²+${present(y)}²)=${present(normU)}`,
      )}
    >
      <div className="space-y-4">
        {/* Guide */}
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Vas a ver que la norma euclidiana mide la longitud del vector, es decir, su distancia al
            origen.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Pruébalo — Arrastra el extremo del vector o cambia x e y y observa cómo ‖u‖ se obtiene
            con el teorema de Pitágoras.
          </p>
        </div>

        {/* View selector */}
        <ButtonRow>
          <VizButton active={view === 'geo'} onClick={() => setView('geo')}>
            Geométrica
          </VizButton>
          <VizButton active={view === 'formula'} onClick={() => setView('formula')}>
            Fórmula
          </VizButton>
        </ButtonRow>

        {/* Dynamic formula strip */}
        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="font-mono text-base font-semibold text-[var(--accent-strong)]">
            u=({present(x)}, {present(y)})
          </p>
          <p className="mt-1 font-mono text-sm">
            ‖u‖ = √(x²+y²) = √({present(x)}²+{present(y)}²) = √({present(x * x + y * y)}) ={' '}
            <strong>{present(normU)}</strong>
          </p>
          {isZero ? (
            <p className="mt-1 text-sm text-[var(--fg-muted)]">
              Vector cero — ‖u‖=0 es el único vector con norma nula.
            </p>
          ) : null}
        </section>

        {/* SVG */}
        {view === 'geo' ? (
          <section className="rounded-xl border border-[var(--border)] px-2 py-2">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="mx-auto h-auto w-full max-w-xl touch-none"
              role="img"
              aria-labelledby={guideId}
            >
              <defs>
                <ArrowMarker id={`${markId}-u`} color={COLOR_U} />
              </defs>

              <Axes
                W={W}
                H={H}
                ox={ox}
                oy={oy}
                S={S}
                ticks={[-4, -2, 2, 4]}
                xLabel="x"
                yLabel="y"
              />

              {/* Faint circle of radius ‖u‖ */}
              {showCircle && !isZero ? (
                <circle
                  cx={ox}
                  cy={oy}
                  r={normU * S}
                  fill="none"
                  stroke={COLOR_U}
                  strokeWidth={1}
                  opacity={0.18}
                />
              ) : null}

              {!isZero ? (
                <>
                  {/* Right triangle: dashed projections */}
                  <line
                    x1={ox}
                    y1={oy}
                    x2={tip.x}
                    y2={oy}
                    stroke="teal"
                    strokeDasharray="4 3"
                    strokeWidth={1.5}
                    opacity={0.65}
                  />
                  <line
                    x1={tip.x}
                    y1={oy}
                    x2={tip.x}
                    y2={tip.y}
                    stroke="orange"
                    strokeDasharray="4 3"
                    strokeWidth={1.5}
                    opacity={0.65}
                  />

                  {/* Right angle mark at foot of perpendicular */}
                  {Math.abs(y) > 0.15 && Math.abs(x) > 0.15 ? (
                    <path
                      d={`M ${tip.x - 7 * Math.sign(x)} ${oy} L ${tip.x - 7 * Math.sign(x)} ${oy - 7 * Math.sign(y)} L ${tip.x} ${oy - 7 * Math.sign(y)}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1}
                      opacity={0.3}
                    />
                  ) : null}

                  {/* Leg labels */}
                  <text
                    x={(ox + tip.x) / 2}
                    y={oy + 16}
                    textAnchor="middle"
                    fontSize={10}
                    fill="teal"
                  >
                    x={present(x)}
                  </text>
                  <text
                    x={tip.x + (x >= 0 ? 8 : -8)}
                    y={(oy + tip.y) / 2 + 4}
                    textAnchor={x >= 0 ? 'start' : 'end'}
                    fontSize={10}
                    fill="orange"
                  >
                    y={present(y)}
                  </text>

                  {/* Main vector (hypotenuse) */}
                  <line
                    x1={ox}
                    y1={oy}
                    x2={tip.x}
                    y2={tip.y}
                    stroke={COLOR_U}
                    strokeWidth={2.8}
                    markerEnd={`url(#${markId}-u)`}
                  />

                  {/* ‖u‖ label along vector */}
                  <text
                    x={normLabelX}
                    y={normLabelY}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={600}
                    fill={COLOR_U}
                  >
                    ‖u‖={present(normU)}
                  </text>

                  {/* Tip label */}
                  <text
                    x={tip.x + (x >= 0 ? 10 : -10)}
                    y={tip.y - 10}
                    textAnchor={x >= 0 ? 'start' : 'end'}
                    fontSize={12}
                    fontWeight={600}
                    fill={COLOR_U}
                  >
                    u=({present(x)}, {present(y)})
                  </text>
                </>
              ) : null}

              {isZero ? (
                <>
                  <circle cx={ox} cy={oy} r={7} fill={COLOR_U} opacity={0.9} />
                  <text x={ox + 10} y={oy - 10} fontSize={12} fontWeight={600} fill={COLOR_U}>
                    Vector cero · ‖u‖=0
                  </text>
                </>
              ) : null}

              {/* Draggable tip */}
              <circle
                cx={tip.x}
                cy={tip.y}
                r={8}
                fill={COLOR_U}
                style={{ cursor: 'grab' }}
                {...drag}
              />
            </svg>

            <p className="mt-1 text-center text-xs text-[var(--fg-muted)]">
              ‖u‖ = longitud del vector = hipotenusa del triángulo rectángulo
            </p>
          </section>
        ) : (
          /* Formula view */
          <section className="rounded-xl border border-[var(--border)] px-4 py-4 space-y-3">
            <p className="text-sm font-medium text-[var(--fg)]">Desglose del cálculo:</p>

            <div className="overflow-x-auto">
              <table className="w-full font-mono text-sm">
                <tbody className="divide-y divide-[var(--border)]">
                  <tr>
                    <td className="py-2 pr-4 text-[var(--fg-muted)]">Vector</td>
                    <td className="py-2 font-semibold text-[var(--accent-strong)]">
                      u = ({present(x)}, {present(y)})
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-[var(--fg-muted)]">Cuadrados</td>
                    <td className="py-2">
                      x² = {present(x * x)} · y² = {present(y * y)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-[var(--fg-muted)]">Suma</td>
                    <td className="py-2">
                      x²+y² = {present(x * x + y * y)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-[var(--fg-muted)]">Raíz</td>
                    <td className="py-2 font-semibold text-[var(--accent-strong)]">
                      ‖u‖ = √{present(x * x + y * y)} = {present(normU)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-[var(--fg-muted)]">
              La norma es siempre ≥ 0. Para cualquier vector u=(x,y) en cualquier cuadrante,
              x² y y² son positivos, por lo que ‖u‖ ≥ 0.
            </p>
          </section>
        )}

        {/* Controls */}
        <ControlsStack>
          <SliderRow
            label="x"
            ariaLabel="componente x"
            value={x}
            min={-5}
            max={5}
            step={0.1}
            onChange={(v) => setU({ x: v, y: u.y })}
          />
          <SliderRow
            label="y"
            ariaLabel="componente y"
            value={y}
            min={-5}
            max={5}
            step={0.1}
            onChange={(v) => setU({ x: u.x, y: v })}
          />
          <ToggleRow
            label="Mostrar circunferencia de radio ‖u‖"
            checked={showCircle}
            onChange={setShowCircle}
          />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
