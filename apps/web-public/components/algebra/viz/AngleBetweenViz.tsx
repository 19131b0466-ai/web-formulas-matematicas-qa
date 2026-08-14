'use client';

import { useId, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  ToggleRow,
  VizButton,
  VizPanel,
  joinCaption,
} from './controls';
import { dot, norm, normalize, type Vec2 } from './math2d';
import {
  Axes,
  ArrowMarker,
  COLOR_U,
  COLOR_V,
  COLOR_W,
  VEC_H,
  VEC_W,
  angleBetween,
  atan2Vec,
  clampVec,
  formatPair,
  labelOffset,
  minorArcPath,
  present,
  sectorPath,
  useVecDrag,
} from './vectorPlane';

const W = VEC_W;
const H = VEC_H;
const OX = W / 2;
const OY = H / 2;
const S = 42; // px per data unit — fixed, no autozoom
const MIN_MAG = 0.18;
const ARC_R = 0.62; // radius of θ-arc in data units
const RM_SIZE = 0.18; // right-angle square arm size in data units

function toPx(p: Vec2) {
  return { x: OX + p.x * S, y: OY - p.y * S };
}

function ensureMinMag(raw: Vec2): Vec2 {
  const clamped = clampVec(raw, 4.8);
  const n = norm(clamped);
  if (n < MIN_MAG) {
    const dir = norm(raw) < 1e-9 ? { x: 1, y: 0 } : normalize(raw);
    return { x: dir.x * MIN_MAG, y: dir.y * MIN_MAG };
  }
  return clamped;
}

function classifyAngle(deg: number): {
  label: string;
  color: string;
  cosHint: string;
} {
  if (deg < 0.5) return { label: 'Misma dirección', color: COLOR_U, cosHint: 'cos θ → 1' };
  if (deg > 179.5) return { label: 'Direcciones opuestas', color: COLOR_W, cosHint: 'cos θ → −1' };
  if (Math.abs(deg - 90) < 0.5) return { label: 'Recto · u⊥v', color: COLOR_W, cosHint: 'cos θ = 0' };
  if (deg < 90) return { label: 'Agudo', color: COLOR_U, cosHint: 'cos θ > 0' };
  return { label: 'Obtuso', color: COLOR_W, cosHint: 'cos θ < 0' };
}

export function AngleBetweenViz() {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const markerUId = `${uid}u`;
  const markerVId = `${uid}v`;

  // Initial: v horizontal, u at ~40° → angle ≈ 40°
  const [u, setU] = useState<Vec2>({ x: 1.53, y: 1.29 });
  const [v, setV] = useState<Vec2>({ x: 2.0, y: 0.0 });
  const [showCalc, setShowCalc] = useState(false);

  const safeU = ensureMinMag(u);
  const safeV = ensureMinMag(v);

  const theta = angleBetween(safeU, safeV);
  const isNull = isNaN(theta);
  const thetaDeg = isNull ? NaN : (theta * 180) / Math.PI;
  const cosT = isNull ? NaN : Math.cos(theta);
  const dotUV = dot(safeU, safeV);
  const normU = norm(safeU);
  const normV = norm(safeV);

  const isRight = !isNull && Math.abs(thetaDeg - 90) < 0.5;
  const showArc = !isNull && thetaDeg > 1;
  const showThetaLabel = !isNull && thetaDeg > 5 && thetaDeg < 175;

  const cls = isNull
    ? { label: 'Ángulo no definido (vector nulo)', color: 'var(--fg-muted)', cosHint: '' }
    : classifyAngle(thetaDeg);

  const dragU = useVecDrag((raw) => setU(ensureMinMag(raw)), S, { x: OX, y: OY });
  const dragV = useVecDrag((raw) => setV(ensureMinMag(raw)), S, { x: OX, y: OY });

  const pu = toPx(safeU);
  const pv = toPx(safeV);
  const a0 = atan2Vec(safeU);
  const a1 = atan2Vec(safeV);

  // Bisector of the minor arc for θ label
  let da = a1 - a0;
  while (da > Math.PI) da -= 2 * Math.PI;
  while (da < -Math.PI) da += 2 * Math.PI;
  const bisA = a0 + da / 2;
  const bisR = ARC_R + 0.32;
  const bisLX = OX + Math.cos(bisA) * bisR * S;
  const bisLY = OY - Math.sin(bisA) * bisR * S;

  const arcPath = showArc ? minorArcPath(OX, OY, S, ARC_R, a0, a1) : '';
  const secPath = showArc ? sectorPath(OX, OY, S, ARC_R, a0, a1) : '';

  // Right-angle mark at origin between u and v
  let rightMarkPath = '';
  if (isRight) {
    const nu = normalize(safeU);
    const nv = normalize(safeV);
    const rm = RM_SIZE * S;
    const ax = OX + nu.x * rm;
    const ay = OY - nu.y * rm;
    const bx = OX + (nu.x + nv.x) * rm;
    const by = OY - (nu.y + nv.y) * rm;
    const cx = OX + nv.x * rm;
    const cy = OY - nv.y * rm;
    rightMarkPath = `M${ax},${ay} L${bx},${by} L${cx},${cy}`;
  }

  // Presets: fix u direction, rotate v by deg from u
  function applyPreset(deg: number) {
    const targetAngle = a0 + (deg * Math.PI) / 180;
    const vMag = Math.max(MIN_MAG + 0.1, normV);
    setV(ensureMinMag({ x: Math.cos(targetAngle) * vMag, y: Math.sin(targetAngle) * vMag }));
  }

  const thetaStr = isNull ? '—' : `${present(thetaDeg, 1)}°`;
  const cosTStr = isNull ? '—' : present(cosT, 3);
  const dotStr = isNull ? '—' : present(dotUV, 2);
  const uLab = labelOffset(safeU, pu, OX, OY, 18);
  const vLab = labelOffset(safeV, pv, OX, OY, 18);

  return (
    <VizPanel
      caption={joinCaption(
        `θ = ${thetaStr}`,
        cls.label,
        !isNull ? `cos θ = ${cosTStr}` : undefined,
        !isNull ? `u·v = ${dotStr}` : undefined,
      )}
    >
      <div className="space-y-3">
        {/* Pedagogical guide */}
        <div className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--accent-soft)_35%,transparent)] px-3 py-2 text-sm">
          <p className="font-medium text-[var(--fg)]">
            Vas a ver que el ángulo entre dos vectores depende de sus{' '}
            <em>direcciones</em>, no de sus longitudes.
          </p>
          <p className="mt-1 text-[var(--fg-muted)]">
            Pruébalo — Arrastra{' '}
            <span style={{ color: COLOR_U, fontWeight: 700 }}>u</span> y{' '}
            <span style={{ color: COLOR_V, fontWeight: 700 }}>v</span> y observa el arco θ.
            Acércalos, hazlos perpendiculares o colócalos en sentidos opuestos para recorrer
            ángulos entre 0° y 180°.
          </p>
        </div>

        {/* SVG canvas */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full touch-none"
          role="img"
          aria-label={`Ángulo entre u y v: ${thetaStr}. ${cls.label}.`}
        >
          <defs>
            <ArrowMarker id={markerUId} color={COLOR_U} />
            <ArrowMarker id={markerVId} color={COLOR_V} />
          </defs>

          <Axes W={W} H={H} ox={OX} oy={OY} S={S} />

          {/* Faint orange sector fill */}
          {showArc && <path d={secPath} fill={COLOR_W} opacity={0.06} />}

          {/* Orange arc for θ */}
          {showArc && (
            <path d={arcPath} fill="none" stroke={COLOR_W} strokeWidth={2.2} />
          )}

          {/* θ label on bisector */}
          {showThetaLabel && (
            <text
              x={bisLX}
              y={bisLY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={13}
              fontWeight={700}
              fill={COLOR_W}
            >
              θ
            </text>
          )}

          {/* Right-angle mark */}
          {isRight && rightMarkPath && (
            <path d={rightMarkPath} fill="none" stroke={COLOR_W} strokeWidth={1.8} />
          )}

          {/* Vector u */}
          <line
            x1={OX}
            y1={OY}
            x2={pu.x}
            y2={pu.y}
            stroke={COLOR_U}
            strokeWidth={2.5}
            markerEnd={`url(#${markerUId})`}
          />
          <circle
            cx={pu.x}
            cy={pu.y}
            r={11}
            fill={COLOR_U}
            fillOpacity={0.18}
            stroke={COLOR_U}
            strokeWidth={1.2}
            {...dragU}
            style={{ cursor: 'grab' }}
          />
          <text
            x={uLab.x}
            y={uLab.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={13}
            fontWeight={700}
            fill={COLOR_U}
          >
            u
          </text>

          {/* Vector v */}
          <line
            x1={OX}
            y1={OY}
            x2={pv.x}
            y2={pv.y}
            stroke={COLOR_V}
            strokeWidth={2.5}
            markerEnd={`url(#${markerVId})`}
          />
          <circle
            cx={pv.x}
            cy={pv.y}
            r={11}
            fill={COLOR_V}
            fillOpacity={0.18}
            stroke={COLOR_V}
            strokeWidth={1.2}
            {...dragV}
            style={{ cursor: 'grab' }}
          />
          <text
            x={vLab.x}
            y={vLab.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={13}
            fontWeight={700}
            fill={COLOR_V}
          >
            v
          </text>

          {/* Null-vector message */}
          {isNull && (
            <text
              x={W / 2}
              y={OY + 44}
              textAnchor="middle"
              fontSize={11}
              fill="currentColor"
              opacity={0.55}
            >
              Ángulo no definido para un vector nulo.
            </text>
          )}
        </svg>

        {/* Classification badge + cos hint */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-full border px-3 py-0.5 text-sm font-semibold"
            style={{
              backgroundColor: `color-mix(in oklab, ${cls.color} 12%, transparent)`,
              borderColor: cls.color,
              color: cls.color,
            }}
          >
            {cls.label}
          </span>
          {cls.cosHint && (
            <span className="font-mono text-xs text-[var(--fg-muted)]">{cls.cosHint}</span>
          )}
        </div>

        {/* Compact formula */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-sm">
          <p>
            cos θ = (u·v) / (‖u‖·‖v‖) = {dotStr} / ({present(normU)}·{present(normV)}) ={' '}
            <strong>{cosTStr}</strong>
          </p>
          <p className="mt-0.5">
            θ = arccos({cosTStr}) ={' '}
            <strong style={{ color: COLOR_W }}>{thetaStr}</strong>
          </p>
        </div>

        {/* Expandable "Ver cálculo" */}
        <ToggleRow label="Ver cálculo detallado" checked={showCalc} onChange={setShowCalc} />
        {showCalc && (
          <div className="space-y-0.5 rounded-lg border border-[var(--border)] px-3 py-2 font-mono text-xs text-[var(--fg-muted)]">
            <p>
              u = {formatPair(safeU.x, safeU.y)},{'  '}v = {formatPair(safeV.x, safeV.y)}
            </p>
            <p>
              u·v = {present(safeU.x)}·{present(safeV.x)} + {present(safeU.y)}·{present(safeV.y)}{' '}
              = {dotStr}
            </p>
            <p>
              ‖u‖ = √({present(safeU.x)}² + {present(safeU.y)}²) = {present(normU, 3)}
            </p>
            <p>
              ‖v‖ = √({present(safeV.x)}² + {present(safeV.y)}²) = {present(normV, 3)}
            </p>
            <p>
              cos θ = {dotStr} / ({present(normU, 3)} × {present(normV, 3)}) = {cosTStr}
            </p>
            <p>
              θ = arccos({cosTStr}) ≈ <strong style={{ color: COLOR_W }}>{thetaStr}</strong>
            </p>
          </div>
        )}

        {/* Angle scale 0°–90°–180° with current marker */}
        <div className="relative mx-1 select-none" style={{ height: '36px' }}>
          <div
            className="absolute left-0 right-0 rounded-full"
            style={{ top: '12px', height: '4px', backgroundColor: 'var(--border)' }}
          />
          {[0, 45, 90, 135, 180].map((t) => (
            <span
              key={t}
              className="absolute text-[10px] text-[var(--fg-muted)]"
              style={{
                left: `${(t / 180) * 100}%`,
                top: '20px',
                transform: 'translateX(-50%)',
              }}
            >
              {t}°
            </span>
          ))}
          {!isNull && (
            <div
              className="absolute rounded-full"
              style={{
                left: `${Math.min(100, Math.max(0, (thetaDeg / 180) * 100))}%`,
                top: '8px',
                width: '6px',
                height: '14px',
                transform: 'translateX(-50%)',
                backgroundColor: 'orange',
              }}
            />
          )}
        </div>

        {/* Presets */}
        <ControlsStack>
          <p className="text-xs text-[var(--fg-muted)]">Presets — fija u, rota v:</p>
          <ButtonRow>
            {([0, 45, 90, 135, 180] as const).map((deg) => (
              <VizButton key={deg} onClick={() => applyPreset(deg)}>
                {deg}°
              </VizButton>
            ))}
          </ButtonRow>
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
