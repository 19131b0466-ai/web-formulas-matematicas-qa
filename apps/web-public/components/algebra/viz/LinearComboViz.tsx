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
import { add, norm, scale, type Vec2 } from './math2d';
import {
  Axes,
  ArrowMarker,
  COLOR_U,
  COLOR_V,
  COLOR_W,
  VEC_H,
  VEC_W,
  clampVec,
  formatPair,
  labelOffset,
  present,
  useVecDrag,
} from './vectorPlane';

const W = VEC_W;
const H = VEC_H;
const OX = W / 2;
const OY = H / 2;
// Fixed scale — stable domain ≈ [-5,5]; avoid aggressive autozoom
const S = 36;
const TICKS = [-4, -2, 2, 4];
const ZERO_EPS = 0.06;
const COLLINEAR_EPS = 0.15;

function toPx(p: Vec2) {
  return { x: OX + p.x * S, y: OY - p.y * S };
}

function clampBase(v: Vec2): Vec2 {
  return clampVec(v, 3.2);
}

/** Build an SVG dashed line string without needing a marker */
function dashedLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  sw: number,
  opacity: number,
) {
  return { x1, y1, x2, y2, stroke: color, strokeWidth: sw, strokeDasharray: '6 3', opacity };
}

export function LinearComboViz() {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const markerUId = `${uid}u`;
  const markerVId = `${uid}v`;
  const markerWId = `${uid}w`;
  const markerUfId = `${uid}uf`; // faint reference
  const markerVfId = `${uid}vf`;

  // Initial: α=0.7, β=0.5; u and v angularly separated
  const [u, setU] = useState<Vec2>({ x: 2.0, y: 0.5 });
  const [v, setV] = useState<Vec2>({ x: 0.5, y: 2.0 });
  const [alpha, setAlpha] = useState(0.7);
  const [beta, setBeta] = useState(0.5);
  const [showConstruction, setShowConstruction] = useState(true);

  const safeU = clampBase(u);
  const safeV = clampBase(v);

  const au = scale(safeU, alpha); // αu
  const bv = scale(safeV, beta); // βv
  const w = add(au, bv); // αu + βv

  const normW = norm(w);
  const normAu = norm(au);
  const normBv = norm(bv);
  const isZeroW = normW < ZERO_EPS;

  // Collinear detection via 2×2 determinant
  const det = safeU.x * safeV.y - safeU.y * safeV.x;
  const isCollinear = Math.abs(det) < COLLINEAR_EPS;

  const dragU = useVecDrag((raw) => setU(clampBase(raw)), S, { x: OX, y: OY });
  const dragV = useVecDrag((raw) => setV(clampBase(raw)), S, { x: OX, y: OY });

  const pu = toPx(safeU);
  const pv = toPx(safeV);
  const pau = toPx(au);
  const pbv = toPx(bv);
  const pw = toPx(w);

  // Head-to-tail: copy of βv placed at tip of αu (from au to w)
  const htStart = pau;
  const htEnd = pw;
  // Parallelogram: copy of αu placed at tip of βv (from bv to w)
  const pgStart = pbv;
  const pgEnd = pw;

  const htLine = dashedLine(htStart.x, htStart.y, htEnd.x, htEnd.y, COLOR_V, 1.5, 0.45);
  const pgLine = dashedLine(pgStart.x, pgStart.y, pgEnd.x, pgEnd.y, COLOR_U, 1.5, 0.45);

  function applyPreset(a: number, b: number, uu?: Vec2, vv?: Vec2) {
    setAlpha(a);
    setBeta(b);
    if (uu) setU(uu);
    if (vv) setV(vv);
  }

  const alphaStr = present(alpha, 1);
  const betaStr = present(beta, 1);
  const wStr = formatPair(w.x, w.y);
  const auStr = formatPair(au.x, au.y);
  const bvStr = formatPair(bv.x, bv.y);

  // Label positions for αu, βv, w
  const auLab = normAu > ZERO_EPS ? labelOffset(au, pau, OX, OY, 17) : null;
  const bvLab = normBv > ZERO_EPS ? labelOffset(bv, pbv, OX, OY, 17) : null;
  const wLab = !isZeroW ? labelOffset(w, pw, OX, OY, 20) : null;
  const uRefLab = labelOffset(safeU, pu, OX, OY, 15);
  const vRefLab = labelOffset(safeV, pv, OX, OY, 15);

  return (
    <VizPanel
      caption={joinCaption(
        `w = ${alphaStr}u + ${betaStr}v = ${wStr}`,
        isZeroW ? 'Vector cero (w=0)' : undefined,
        isCollinear ? 'u y v casi paralelos' : undefined,
      )}
    >
      <div className="space-y-3">
        {/* Pedagogical guide */}
        <div className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--accent-soft)_35%,transparent)] px-3 py-2 text-sm">
          <p className="font-medium text-[var(--fg)]">
            Vas a ver que una combinación lineal primero{' '}
            <em>escala</em> los vectores y después <em>suma</em> los resultados.
          </p>
          <p className="mt-1 text-[var(--fg-muted)]">
            Pruébalo — Mueve α y β. Observa cómo cambian{' '}
            <span style={{ color: COLOR_U, fontWeight: 700 }}>αu</span> y{' '}
            <span style={{ color: COLOR_V, fontWeight: 700 }}>βv</span> y cómo su suma determina
            la flecha naranja{' '}
            <span style={{ color: COLOR_W, fontWeight: 700 }}>w</span>.
          </p>
          <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
            Secuencia: u → αu{'  '}·{'  '}v → βv{'  '}·{'  '}αu + βv → w
          </p>
        </div>

        {/* SVG canvas */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full touch-none"
          role="img"
          aria-label={`w = ${alphaStr}u + ${betaStr}v = ${wStr}`}
        >
          <defs>
            {/* Faint markers for reference u, v */}
            <marker
              id={markerUfId}
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L6,3 L0,6 Z" fill={COLOR_U} opacity={0.35} />
            </marker>
            <marker
              id={markerVfId}
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L6,3 L0,6 Z" fill={COLOR_V} opacity={0.35} />
            </marker>
            <ArrowMarker id={markerUId} color={COLOR_U} />
            <ArrowMarker id={markerVId} color={COLOR_V} />
            <ArrowMarker id={markerWId} color={COLOR_W} />
          </defs>

          <Axes W={W} H={H} ox={OX} oy={OY} S={S} ticks={TICKS} />

          {/* Construction: head-to-tail and parallelogram (dashed) */}
          {showConstruction && !isZeroW && (
            <>
              {/* βv copy starting at tip of αu */}
              <line {...htLine} />
              {/* αu copy starting at tip of βv */}
              <line {...pgLine} />
            </>
          )}

          {/* Reference vectors u and v (faint background) */}
          <line
            x1={OX}
            y1={OY}
            x2={pu.x}
            y2={pu.y}
            stroke={COLOR_U}
            strokeWidth={1.2}
            opacity={0.32}
            markerEnd={`url(#${markerUfId})`}
          />
          <line
            x1={OX}
            y1={OY}
            x2={pv.x}
            y2={pv.y}
            stroke={COLOR_V}
            strokeWidth={1.2}
            opacity={0.32}
            markerEnd={`url(#${markerVfId})`}
          />

          {/* Reference drag handles */}
          <circle
            cx={pu.x}
            cy={pu.y}
            r={10}
            fill={COLOR_U}
            fillOpacity={0.15}
            stroke={COLOR_U}
            strokeWidth={1.2}
            strokeOpacity={0.4}
            {...dragU}
            style={{ cursor: 'grab' }}
          />
          <circle
            cx={pv.x}
            cy={pv.y}
            r={10}
            fill={COLOR_V}
            fillOpacity={0.15}
            stroke={COLOR_V}
            strokeWidth={1.2}
            strokeOpacity={0.4}
            {...dragV}
            style={{ cursor: 'grab' }}
          />
          <text
            x={uRefLab.x}
            y={uRefLab.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            fill={COLOR_U}
            opacity={0.5}
          >
            u
          </text>
          <text
            x={vRefLab.x}
            y={vRefLab.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            fill={COLOR_V}
            opacity={0.5}
          >
            v
          </text>

          {/* αu (solid green, main operand) */}
          {normAu > ZERO_EPS && (
            <>
              <line
                x1={OX}
                y1={OY}
                x2={pau.x}
                y2={pau.y}
                stroke={COLOR_U}
                strokeWidth={2.5}
                markerEnd={`url(#${markerUId})`}
              />
              {auLab && (
                <text
                  x={auLab.x}
                  y={auLab.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={12}
                  fontWeight={700}
                  fill={COLOR_U}
                >
                  αu
                </text>
              )}
            </>
          )}

          {/* βv (solid teal, main operand) */}
          {normBv > ZERO_EPS && (
            <>
              <line
                x1={OX}
                y1={OY}
                x2={pbv.x}
                y2={pbv.y}
                stroke={COLOR_V}
                strokeWidth={2.5}
                markerEnd={`url(#${markerVId})`}
              />
              {bvLab && (
                <text
                  x={bvLab.x}
                  y={bvLab.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={12}
                  fontWeight={700}
                  fill={COLOR_V}
                >
                  βv
                </text>
              )}
            </>
          )}

          {/* w = αu + βv (orange, slightly thicker) */}
          {!isZeroW && (
            <>
              <line
                x1={OX}
                y1={OY}
                x2={pw.x}
                y2={pw.y}
                stroke={COLOR_W}
                strokeWidth={3.2}
                markerEnd={`url(#${markerWId})`}
              />
              {wLab && (
                <text
                  x={wLab.x}
                  y={wLab.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={13}
                  fontWeight={700}
                  fill={COLOR_W}
                >
                  w
                </text>
              )}
            </>
          )}

          {/* Zero w indicator */}
          {isZeroW && (
            <>
              <circle
                cx={OX}
                cy={OY}
                r={8}
                fill="none"
                stroke={COLOR_W}
                strokeWidth={2}
              />
              <text
                x={OX + 14}
                y={OY - 10}
                fontSize={12}
                fontWeight={600}
                fill={COLOR_W}
              >
                w = 0
              </text>
            </>
          )}
        </svg>

        {/* Equation chain */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-sm leading-relaxed">
          <p>
            w = <span style={{ color: COLOR_U }}>{alphaStr}</span>·u +{' '}
            <span style={{ color: COLOR_V }}>{betaStr}</span>·v
          </p>
          <p>
            {'  '}= <span style={{ color: COLOR_U }}>{alphaStr}·{formatPair(safeU.x, safeU.y)}</span>{' '}
            + <span style={{ color: COLOR_V }}>{betaStr}·{formatPair(safeV.x, safeV.y)}</span>
          </p>
          <p>
            {'  '}= <span style={{ color: COLOR_U }}>{auStr}</span> +{' '}
            <span style={{ color: COLOR_V }}>{bvStr}</span>
          </p>
          <p>
            {'  '}= <strong style={{ color: COLOR_W }}>{wStr}</strong>
          </p>
          {isCollinear && (
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              u y v casi paralelos — w siempre está en la misma recta que generan.
            </p>
          )}
        </div>

        {/* Toggle for construction */}
        <ToggleRow
          label="Mostrar construcción (cabeza-cola + paralelogramo)"
          checked={showConstruction}
          onChange={setShowConstruction}
        />

        {/* Sliders */}
        <ControlsStack>
          <SliderRow
            label="α"
            ariaLabel="Escalar alpha"
            value={alpha}
            min={-2}
            max={2}
            step={0.1}
            onChange={setAlpha}
          />
          <SliderRow
            label="β"
            ariaLabel="Escalar beta"
            value={beta}
            min={-2}
            max={2}
            step={0.1}
            onChange={setBeta}
          />
        </ControlsStack>

        {/* Presets */}
        <ButtonRow>
          <VizButton onClick={() => applyPreset(1, 1)}>u+v</VizButton>
          <VizButton onClick={() => applyPreset(1, -1)}>u−v</VizButton>
          <VizButton onClick={() => applyPreset(1, 0)}>Solo u</VizButton>
          <VizButton onClick={() => applyPreset(0, 1)}>Solo v</VizButton>
          <VizButton onClick={() => applyPreset(0.5, 0.5)}>Promedio</VizButton>
        </ButtonRow>
      </div>
    </VizPanel>
  );
}
