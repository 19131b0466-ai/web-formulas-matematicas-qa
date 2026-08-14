'use client';

import { useId, useMemo, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel } from './controls';
import { norm, normalize, type Vec2 } from './math2d';
import {
  Axes,
  ArrowMarker,
  COLOR_U,
  COLOR_V,
  VEC_H,
  VEC_W,
  clampVec,
  formatPair,
  labelOffset,
  present,
  useVecDrag,
} from './vectorPlane';

const S = 52; // px per unit — unit circle radius = 52 px, clearly visible
const CLAMP = 3.9; // keep tip within SVG viewport

export function UnitVectorViz() {
  const [u, setU] = useState<Vec2>({ x: 3, y: 2 });
  const uid = useId();
  const W = VEC_W;
  const H = VEC_H;
  const ox = W / 2;
  const oy = H / 2;

  // ── derived geometry ───────────────────────────────────────────────────────
  const nu = norm(u);
  const isZero = nu < 1e-9;
  const uHat: Vec2 = isZero ? { x: 0, y: 0 } : normalize(u);

  const pu = { x: ox + u.x * S, y: oy - u.y * S };
  const pHat = { x: ox + uHat.x * S, y: oy - uHat.y * S };

  const nuStr = present(nu);
  const hatStr = formatPair(uHat.x, uHat.y);

  const uLbl = labelOffset(u, pu, ox, oy, 20);
  const hatLbl = labelOffset(uHat, pHat, ox, oy, 17);

  // Perpendicular offset direction in SVG space (for midpoint labels)
  const uDx = pu.x - ox;
  const uDy = pu.y - oy;
  const uDlen = Math.hypot(uDx, uDy) || 1;
  const perpX = -uDy / uDlen;
  const perpY = uDx / uDlen;

  // Midpoints for ∥u∥ / ∥û∥=1 labels
  const uMid = { x: (ox + pu.x) / 2, y: (oy + pu.y) / 2 };
  const hatMid = { x: (ox + pHat.x) / 2, y: (oy + pHat.y) / 2 };

  // Guide line through origin along u direction (clipped to SVG)
  const guide = useMemo(() => {
    if (isZero) return null;
    const d = normalize(u);
    const t = 7;
    return {
      x1: ox - d.x * t * S,
      y1: oy + d.y * t * S,
      x2: ox + d.x * t * S,
      y2: oy - d.y * t * S,
    };
  }, [isZero, u, ox, oy]);

  const dragU = useVecDrag((v) => setU(clampVec(v, CLAMP)), S, { x: ox, y: oy });

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <VizPanel>
      <div className="space-y-3">
        {/* Guide */}
        <p className="text-sm leading-relaxed text-[var(--fg-muted)]">
          Vas a ver que normalizar un vector conserva su dirección, pero cambia su longitud a 1.
        </p>

        {/* Top sequence strip: u → ÷∥u∥ → û  and  formula û = u/∥u∥ */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_60%,var(--bg-elevated))] px-3 py-2 font-mono text-sm">
          <span style={{ color: COLOR_V }}>u={formatPair(u.x, u.y)}</span>
          <span className="select-none text-[var(--fg-muted)]">÷ ∥u∥</span>
          <span className="select-none text-[var(--fg-muted)]">→</span>
          {isZero ? (
            <span className="text-orange-400 dark:text-orange-300">indefinido</span>
          ) : (
            <span style={{ color: COLOR_U }}>û={hatStr}</span>
          )}
          <span className="ml-auto shrink-0 text-xs text-[var(--fg-muted)]">û = u / ∥u∥</span>
        </div>

        {/* SVG canvas */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full touch-none rounded-xl border border-[var(--border)]"
          role="img"
          aria-label={
            isZero
              ? 'Vector u es cero; la normalización no está definida.'
              : `Vector u con ∥u∥=${nuStr}; û normalizado sobre el círculo unitario`
          }
        >
          <defs>
            <ArrowMarker id={`${uid}-u`} color={COLOR_V} />
            <ArrowMarker id={`${uid}-hat`} color={COLOR_U} />
            <clipPath id={`${uid}-clip`}>
              <rect x={0} y={0} width={W} height={H} />
            </clipPath>
          </defs>

          <Axes W={W} H={H} ox={ox} oy={oy} S={S} ticks={[-3, -2, -1, 1, 2, 3]} />

          {/* Direction guide line (faint, clipped) */}
          {guide && (
            <line
              x1={guide.x1}
              y1={guide.y1}
              x2={guide.x2}
              y2={guide.y2}
              stroke={COLOR_V}
              strokeWidth={1}
              strokeDasharray="5 4"
              opacity={0.2}
              clipPath={`url(#${uid}-clip)`}
            />
          )}

          {/* Faint unit circle r=1 */}
          <circle
            cx={ox}
            cy={oy}
            r={S}
            fill="none"
            stroke="currentColor"
            strokeDasharray="4 3"
            opacity={0.32}
          />
          <text x={ox + S + 5} y={oy - 5} fontSize={10} fill="currentColor" opacity={0.5}>
            r=1
          </text>

          {/* û vector (accent-strong/green) — behind u so u appears on top */}
          {!isZero && (
            <line
              x1={ox}
              y1={oy}
              x2={pHat.x}
              y2={pHat.y}
              stroke={COLOR_U}
              strokeWidth={2.5}
              markerEnd={`url(#${uid}-hat)`}
            />
          )}

          {/* u vector (teal) */}
          <line
            x1={ox}
            y1={oy}
            x2={pu.x}
            y2={pu.y}
            stroke={COLOR_V}
            strokeWidth={2.5}
            markerEnd={`url(#${uid}-u)`}
          />

          {/* ∥u∥ label — perpendicular offset from u midpoint */}
          {!isZero && nu > 0.25 && (
            <text
              x={uMid.x + perpX * 16}
              y={uMid.y + perpY * 16}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={10}
              fill={COLOR_V}
              opacity={0.9}
            >
              ∥u∥={nuStr}
            </text>
          )}

          {/* ∥û∥=1 label — opposite perpendicular offset from û midpoint */}
          {!isZero && (
            <text
              x={hatMid.x - perpX * 15}
              y={hatMid.y - perpY * 15}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={10}
              fill={COLOR_U}
              opacity={0.9}
            >
              ∥û∥=1
            </text>
          )}

          {/* Tip label — u */}
          <text
            x={uLbl.x}
            y={uLbl.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={13}
            fontWeight={700}
            fill={COLOR_V}
          >
            u
          </text>

          {/* Tip label — û */}
          {!isZero && (
            <text
              x={hatLbl.x}
              y={hatLbl.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={13}
              fontWeight={700}
              fill={COLOR_U}
            >
              û
            </text>
          )}

          {/* Drag handle on u tip only */}
          <circle
            cx={pu.x}
            cy={pu.y}
            r={9}
            fill={COLOR_V}
            opacity={0.85}
            style={{ cursor: 'grab' }}
            {...dragU}
          />

          {/* Zero-vector message */}
          {isZero && (
            <text
              x={W / 2}
              y={oy - 52}
              textAnchor="middle"
              fontSize={12}
              fill="currentColor"
              opacity={0.7}
            >
              El vector cero no puede normalizarse porque ∥u∥=0.
            </text>
          )}
        </svg>

        {/* Live readout — ∥u∥, û, ∥û∥ */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-[var(--border)] px-2 py-2">
            <p className="text-xs text-[var(--fg-muted)]">∥u∥</p>
            <p className="font-mono text-sm font-semibold tabular-nums" style={{ color: COLOR_V }}>
              {nuStr}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] px-2 py-2">
            <p className="text-xs text-[var(--fg-muted)]">û =</p>
            <p className="font-mono text-xs font-semibold tabular-nums" style={{ color: COLOR_U }}>
              {isZero ? '—' : hatStr}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] px-2 py-2">
            <p className="text-xs text-[var(--fg-muted)]">∥û∥</p>
            <p className="font-mono text-sm font-semibold tabular-nums" style={{ color: COLOR_U }}>
              {isZero ? '—' : '1'}
            </p>
          </div>
        </div>

        {/* Discrete indicators */}
        <div className="flex flex-wrap gap-2">
          <span
            className="rounded-full border px-3 py-1 text-xs font-medium"
            style={{
              color: 'teal',
              borderColor: 'color-mix(in oklab, teal 40%, transparent)',
              backgroundColor: 'color-mix(in oklab, teal 12%, transparent)',
            }}
          >
            Se conserva: dirección
          </span>
          <span
            className="rounded-full border px-3 py-1 text-xs font-medium"
            style={{
              color: COLOR_U,
              borderColor: `color-mix(in oklab, ${COLOR_U} 40%, transparent)`,
              backgroundColor: `color-mix(in oklab, ${COLOR_U} 12%, transparent)`,
            }}
          >
            Cambia: longitud → 1
          </span>
        </div>

        {/* Sliders — synced with drag */}
        <ControlsStack>
          <SliderRow
            label="uₓ"
            value={u.x}
            min={-4.5}
            max={4.5}
            step={0.1}
            onChange={(val) => setU((p) => clampVec({ x: val, y: p.y }, CLAMP))}
          />
          <SliderRow
            label="u_y"
            value={u.y}
            min={-4.5}
            max={4.5}
            step={0.1}
            onChange={(val) => setU((p) => clampVec({ x: p.x, y: val }, CLAMP))}
          />
          <p className="text-xs leading-relaxed text-[var(--fg-muted)]">
            Pruébalo — Arrastra u y compara su extremo con û: el vector normalizado siempre termina
            sobre el círculo unitario.
          </p>
        </ControlsStack>

        {/* Footer */}
        <p className="border-t border-[var(--border)] pt-2 text-sm text-[var(--fg-muted)]">
          {isZero
            ? 'El vector cero no puede normalizarse · ∥u∥ = 0'
            : `∥u∥ = ${nuStr} · ∥û∥ = 1`}
        </p>
      </div>
    </VizPanel>
  );
}
