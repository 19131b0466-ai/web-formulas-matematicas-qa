'use client';

import { useId, useMemo, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  SliderRow,
  VizButton,
  VizPanel,
  fmt,
} from './controls';
import {
  DET_EPS,
  Mat2Editor,
  formatSigned,
  matFromCols,
  orientationLabel,
} from './detHelpers';
import { det2, type Vec2 } from './math2d';
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

const DEFAULT_U: Vec2 = { x: 2, y: 0.3 };
const DEFAULT_V: Vec2 = { x: 0.5, y: 1.8 };

export function Determinant2x2Viz() {
  const uid = useId().replace(/:/g, '');
  const [u, setU] = useState<Vec2>(DEFAULT_U);
  const [v, setV] = useState<Vec2>(DEFAULT_V);

  const M = useMemo(() => matFromCols(u, v), [u, v]);
  const det = det2(M);
  const area = Math.abs(det);
  const degenerate = area < DET_EPS;

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

  const dragU = useVecDrag((p) => setU(clampVec(p, CLAMP)), S, { x: ox, y: oy });
  const dragV = useVecDrag((p) => setV(clampVec(p, CLAMP)), S, { x: ox, y: oy });

  const swap = () => {
    setU(v);
    setV(u);
  };

  const arc = (() => {
    if (degenerate) return null;
    const lu = Math.hypot(u.x, u.y) || 1;
    const lv = Math.hypot(v.x, v.y) || 1;
    const r = 0.42 * Math.min(lu, lv, 1.4);
    const a = to({ x: (u.x / lu) * r, y: (u.y / lu) * r });
    const b = to({ x: (v.x / lv) * r, y: (v.y / lv) * r });
    const sweep = det > 0 ? 0 : 1;
    const rr = Math.hypot(a.x - ox, a.y - oy);
    return `M ${a.x} ${a.y} A ${rr} ${rr} 0 0 ${sweep} ${b.x} ${b.y}`;
  })();

  return (
    <VizPanel
      title="Determinante 2×2"
      caption="Las columnas de A son u y v: det(A) es el área orientada del paralelogramo. El signo indica el giro u → v."
    >
      <div className="space-y-3">
        <p className="text-sm text-[var(--fg)]">
          Vas a ver que el determinante de una matriz 2×2 mide el área orientada del paralelogramo
          generado por sus columnas.
        </p>
        <p className="text-sm text-[var(--fg-muted)]">
          <span className="font-medium text-[var(--fg)]">Pruébalo — </span>
          Mueve u y v: observa cómo cambian el área y el signo. Si quedan alineados, det = 0.
        </p>

        <div className="flex flex-wrap items-start gap-4">
          <div className="space-y-1">
            <div className="font-mono text-xs text-[var(--fg-muted)]">A = [u | v]</div>
            <Mat2Editor
              m={M}
              labels={['u', 'v']}
              onChange={(next) => {
                setU({ x: next[0][0], y: next[1][0] });
                setV({ x: next[0][1], y: next[1][1] });
              }}
            />
            <div className="font-mono text-[11px] text-[var(--fg-muted)]">
              u=({formatSigned(u.x)}, {formatSigned(u.y)}) · v=({formatSigned(v.x)}, {formatSigned(v.y)})
            </div>
          </div>
          <div className="min-w-[11rem] flex-1 space-y-1 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm">
            <div className="font-mono text-xs text-[var(--fg-muted)]">Cálculo</div>
            <div className="font-mono text-xs leading-relaxed">
              det(A) = uₓvᵧ − uᵧvₓ
              <br />
              = ({formatSigned(u.x)})({formatSigned(v.y)}) − ({formatSigned(u.y)})({formatSigned(v.x)})
              <br />
              = {formatSigned(u.x * v.y)} − {formatSigned(u.y * v.x)}
              <br />= <span className="font-semibold text-[var(--accent-strong)]">{present(det)}</span>
            </div>
            <div className="border-t border-[var(--border)] pt-1 font-mono text-xs">
              Área = |det| = {present(area)}
              <br />
              Orientación: {orientationLabel(det)}
              <br />
              {degenerate ? '✕ Matriz no invertible' : '✓ Matriz invertible'}
            </div>
          </div>
        </div>

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
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Paralelogramo de las columnas">
            <defs>
              <ArrowMarker id={`${uid}-u`} color={COLOR_U} />
              <ArrowMarker id={`${uid}-v`} color={COLOR_V} />
              <marker id={`${uid}-arc`} markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent-strong)" />
              </marker>
            </defs>
            <Axes W={W} H={H} ox={ox} oy={oy} S={S} xLabel="x" yLabel="y" />
            {!degenerate ? (
              <polygon points={poly} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={1.2} opacity={0.9} />
            ) : (
              <line x1={U.x} y1={U.y} x2={V.x} y2={V.y} stroke="var(--accent-strong)" strokeWidth={2} strokeDasharray="4 3" />
            )}
            <line x1={U.x} y1={U.y} x2={UV.x} y2={UV.y} stroke={COLOR_V} strokeWidth={1.2} strokeDasharray="4 3" opacity={0.65} />
            <line x1={V.x} y1={V.y} x2={UV.x} y2={UV.y} stroke={COLOR_U} strokeWidth={1.2} strokeDasharray="4 3" opacity={0.65} />
            <line x1={ox} y1={oy} x2={U.x} y2={U.y} stroke={COLOR_U} strokeWidth={2.4} markerEnd={`url(#${uid}-u)`} />
            <line x1={ox} y1={oy} x2={V.x} y2={V.y} stroke={COLOR_V} strokeWidth={2.4} markerEnd={`url(#${uid}-v)`} />
            {arc ? (
              <path d={arc} fill="none" stroke="var(--accent-strong)" strokeWidth={1.6} opacity={0.85} markerEnd={`url(#${uid}-arc)`} />
            ) : null}
            {!degenerate && area * S * S > 900 ? (
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
            {!degenerate ? (
              <text x={UV.x + 6} y={UV.y - 6} className="fill-[var(--fg-muted)] text-[10px]">
                u+v
              </text>
            ) : null}
            <circle
              cx={U.x}
              cy={U.y}
              r={9}
              fill={COLOR_U}
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={dragU.onPointerDown}
              aria-label="Componente del vector u"
            />
            <circle
              cx={V.x}
              cy={V.y}
              r={9}
              fill={COLOR_V}
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={dragV.onPointerDown}
              aria-label="Componente del vector v"
            />
          </svg>
        </div>

        <ButtonRow>
          <VizButton onClick={swap}>Intercambiar u ↔ v</VizButton>
          <VizButton
            onClick={() => {
              setU({ x: 2, y: 1 });
              setV({ x: 4, y: 2 });
            }}
          >
            Ver det = 0
          </VizButton>
          <VizButton
            onClick={() => {
              setU(DEFAULT_U);
              setV(DEFAULT_V);
            }}
          >
            Reiniciar
          </VizButton>
        </ButtonRow>

        <ControlsStack>
          <SliderRow label="uₓ" ariaLabel="Componente x del vector u" value={u.x} min={-3} max={3} step={0.05} onChange={(x) => setU((p) => ({ ...p, x }))} />
          <SliderRow label="uᵧ" ariaLabel="Componente y del vector u" value={u.y} min={-3} max={3} step={0.05} onChange={(y) => setU((p) => ({ ...p, y }))} />
          <SliderRow label="vₓ" ariaLabel="Componente x del vector v" value={v.x} min={-3} max={3} step={0.05} onChange={(x) => setV((p) => ({ ...p, x }))} />
          <SliderRow label="vᵧ" ariaLabel="Componente y del vector v" value={v.y} min={-3} max={3} step={0.05} onChange={(y) => setV((p) => ({ ...p, y }))} />
        </ControlsStack>

        {degenerate ? (
          <p className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--fg-muted)]">
            Vectores linealmente dependientes: el paralelogramo colapsa (área 0) y la matriz no es invertible.
          </p>
        ) : (
          <p className="text-xs text-[var(--fg-muted)]">
            det = {fmt(det)} · área = {fmt(area)} · orientación {orientationLabel(det)}. Intercambiar columnas conserva el área y cambia el signo.
          </p>
        )}
      </div>
    </VizPanel>
  );
}
