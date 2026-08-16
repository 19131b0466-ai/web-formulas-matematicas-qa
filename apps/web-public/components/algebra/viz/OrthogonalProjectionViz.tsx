'use client';

import { useId, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  VizButton,
  VizPanel,
  joinCaption,
} from './controls';
import type { Vec2 } from './math2d';
import {
  ORT_EPS,
  ORT_NEAR,
  classifyDot,
  formatNum,
  formatPair,
  isOrthogonal,
  isParallel,
  normalize,
  orthogonalProjection,
  scale,
} from './orthoHelpers';
import {
  Badge,
  Chip,
  ChipRow,
  CollapsibleEdit,
  GuideBlock,
  Segmented,
} from './transformHelpers';
import {
  ArrowMarker,
  Axes,
  COLOR_U,
  COLOR_V,
  COLOR_W,
  VEC_H,
  VEC_W,
  clampVec,
  labelOffset,
  useVecDrag,
} from './vectorPlane';

const W = VEC_W;
const H = VEC_H;
const OX = W / 2;
const OY = H / 2;
const S = 42;
const CLAMP = 4.8;
const LINE_EXT = 5.2;
const RM = 0.28;

type Mode = 'geo' | 'decomp' | 'calc';
type PresetId = 'gen' | 'perp' | 'par' | 'neg' | 'beyond' | null;

const PRESETS: Array<{ id: PresetId; label: string; u: Vec2; v: Vec2 }> = [
  { id: 'gen', label: 'General', u: { x: 2, y: 3 }, v: { x: 3, y: 1 } },
  { id: 'perp', label: 'Perpendiculares', u: { x: -1, y: 3 }, v: { x: 3, y: 1 } },
  { id: 'par', label: 'Paralelos', u: { x: 4, y: 2 }, v: { x: 2, y: 1 } },
  { id: 'neg', label: 'Proyección negativa', u: { x: -2, y: -1 }, v: { x: 3, y: 1 } },
  { id: 'beyond', label: 'Más allá de v', u: { x: 5, y: 2 }, v: { x: 2, y: 0 } },
];

function toPx(p: Vec2) {
  return { x: OX + p.x * S, y: OY - p.y * S };
}

function rightAngleAtP(P: Vec2, alongV: Vec2, alongR: Vec2): string {
  const nv = normalize(alongV);
  const nr = normalize(alongR);
  if (Math.hypot(nv.x, nv.y) < ORT_EPS || Math.hypot(nr.x, nr.y) < ORT_EPS) return '';
  const a = { x: P.x + nv.x * RM, y: P.y + nv.y * RM };
  const b = { x: P.x + (nv.x + nr.x) * RM, y: P.y + (nv.y + nr.y) * RM };
  const c = { x: P.x + nr.x * RM, y: P.y + nr.y * RM };
  const A = toPx(a);
  const B = toPx(b);
  const C = toPx(c);
  return `M${A.x},${A.y} L${B.x},${B.y} L${C.x},${C.y}`;
}

/**
 * Proyección ortogonal: proj_v(u)=(u·v)/(v·v)·v (ALG-ORT-002).
 */
export function OrthogonalProjectionViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [u, setU] = useState<Vec2>({ x: 2, y: 3 });
  const [v, setV] = useState<Vec2>({ x: 3, y: 1 });
  const [mode, setMode] = useState<Mode>('geo');
  const [preset, setPreset] = useState<PresetId>('gen');
  const [editOpen, setEditOpen] = useState(false);
  const [calcStep, setCalcStep] = useState(0);

  const su = clampVec(u, CLAMP);
  const sv = clampVec(v, CLAMP);
  const projRes = orthogonalProjection(su, sv);
  const { valid, coeff: c, proj, residual: r, orthoDot } = projRes;
  const cls = classifyDot(su, sv);
  const parallel = valid && isParallel(su, sv);
  const perpCase = valid && isOrthogonal(su, sv);
  const residualTiny = valid && Math.hypot(r.x, r.y) < ORT_NEAR;
  const orthoOk = valid && Math.abs(orthoDot) <= ORT_NEAR * Math.max(1, Math.hypot(sv.x, sv.y));

  const dragU = useVecDrag(
    (p) => {
      setU(clampVec(p, CLAMP));
      setPreset(null);
    },
    S,
    { x: OX, y: OY },
  );
  const dragV = useVecDrag(
    (p) => {
      setV(clampVec(p, CLAMP));
      setPreset(null);
    },
    S,
    { x: OX, y: OY },
  );

  const pu = toPx(su);
  const pv = toPx(sv);
  const pp = toPx(proj);
  const uLab = labelOffset(su, pu, OX, OY, 18);
  const vLab = labelOffset(sv, pv, OX, OY, 16);

  const spanLine = (() => {
    if (!valid) return null;
    const n = normalize(sv);
    const a = toPx(scale(n, -LINE_EXT));
    const b = toPx(scale(n, LINE_EXT));
    return { a, b };
  })();

  const rightMark =
    valid && Math.hypot(r.x, r.y) > ORT_EPS ? rightAngleAtP(proj, sv, r) : '';

  const rMid = {
    x: (pp.x + pu.x) / 2,
    y: (pp.y + pu.y) / 2,
  };

  function applyPreset(id: PresetId) {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setU(p.u);
    setV(p.v);
    setPreset(id);
    setCalcStep(0);
  }

  function scaleV(alpha: number) {
    if (!valid) return;
    setV(clampVec(scale(sv, alpha), CLAMP));
    setPreset(null);
  }

  let caseBadge = <Badge tone="neutral">—</Badge>;
  if (!valid) {
    caseBadge = <Badge tone="bad">v = 0 · inválido</Badge>;
  } else if (residualTiny || parallel) {
    caseBadge = <Badge tone="ok">Paralelos · r ≈ 0</Badge>;
  } else if (perpCase || Math.abs(c) < ORT_NEAR) {
    caseBadge = <Badge tone="ok">u ⊥ v · c ≈ 0</Badge>;
  } else if (c < 0) {
    caseBadge = <Badge tone="warn">Proyección negativa</Badge>;
  } else if (Math.abs(c) > 1 + ORT_NEAR) {
    caseBadge = <Badge tone="neutral">Más allá de v</Badge>;
  } else {
    caseBadge = <Badge tone="ok">Proyección positiva</Badge>;
  }

  const caption = valid
    ? joinCaption(
        `proj = ${formatNum(c)} · v`,
        orthoOk ? 'r·v ≈ 0 ✓' : `r·v = ${formatNum(orthoDot)}`,
      )
    : joinCaption('v = 0', 'proyección indefinida');

  const uv = su.x * sv.x + su.y * sv.y;
  const vv = sv.x * sv.x + sv.y * sv.y;

  return (
    <VizPanel title="Proyección ortogonal · proj_v(u)" caption={caption}>
      <div className="space-y-3">
        <GuideBlock
          idea="La proyección ortogonal es la sombra de u sobre la dirección de v: proj_v(u) = ((u·v)/(v·v)) · v."
          tryIt="Arrastra u (teal) y v (verde). El punto naranja P es la proyección sobre la recta span(v); el segmento discontinuo es el residuo r ⊥ v."
          concept="u = proj_v(u) + r con r · v = 0. El coeficiente c no se acota a [0,1]."
        />

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={[
              { id: 'geo', label: 'Geometría' },
              { id: 'decomp', label: 'Descomposición' },
              { id: 'calc', label: 'Cálculo' },
            ]}
            value={mode}
            onChange={(id) => {
              setMode(id as Mode);
              if (id === 'calc') setCalcStep(0);
            }}
          />
        </div>

        <ChipRow>
          {PRESETS.map((p) => (
            <Chip key={p.id} active={preset === p.id} onClick={() => applyPreset(p.id)}>
              {p.label}
            </Chip>
          ))}
        </ChipRow>

        <div className="flex flex-wrap items-center gap-2">
          {caseBadge}
          {valid && orthoOk ? <Badge tone="ok">r · v ≈ 0 ✓</Badge> : null}
          {!valid ? null : (
            <span className="font-mono text-xs text-[var(--fg-muted)]">
              c = {formatNum(c)}
            </span>
          )}
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full touch-none rounded-xl border border-[var(--border)]"
          role="img"
          aria-label={
            valid
              ? `proyección c=${formatNum(c)}, r·v≈${formatNum(orthoDot)}`
              : 'v es cero; proyección indefinida'
          }
        >
          <defs>
            <ArrowMarker id={`${uid}-u`} color={COLOR_V} />
            <ArrowMarker id={`${uid}-v`} color={COLOR_U} />
            <ArrowMarker id={`${uid}-proj`} color={COLOR_W} />
            <clipPath id={`${uid}-clip`}>
              <rect x={0} y={0} width={W} height={H} />
            </clipPath>
          </defs>

          <Axes W={W} H={H} ox={OX} oy={OY} S={S} />

          {/* Full span(v) line */}
          {spanLine && (
            <line
              x1={spanLine.a.x}
              y1={spanLine.a.y}
              x2={spanLine.b.x}
              y2={spanLine.b.y}
              stroke={COLOR_U}
              strokeWidth={1.5}
              opacity={0.35}
              strokeDasharray="6 4"
              clipPath={`url(#${uid}-clip)`}
            />
          )}

          {/* v (dark green) */}
          {valid && (
            <line
              x1={OX}
              y1={OY}
              x2={pv.x}
              y2={pv.y}
              stroke={COLOR_U}
              strokeWidth={2.4}
              markerEnd={`url(#${uid}-v)`}
            />
          )}

          {/* proj O→P (orange) */}
          {valid && Math.hypot(proj.x, proj.y) > ORT_EPS && (
            <line
              x1={OX}
              y1={OY}
              x2={pp.x}
              y2={pp.y}
              stroke={COLOR_W}
              strokeWidth={3}
              markerEnd={`url(#${uid}-proj)`}
            />
          )}

          {/* residual P→u dashed */}
          {valid && Math.hypot(r.x, r.y) > ORT_EPS && (
            <line
              x1={pp.x}
              y1={pp.y}
              x2={pu.x}
              y2={pu.y}
              stroke="currentColor"
              strokeWidth={1.8}
              strokeDasharray="5 4"
              opacity={0.55}
            />
          )}

          {/* u (teal) */}
          <line
            x1={OX}
            y1={OY}
            x2={pu.x}
            y2={pu.y}
            stroke={COLOR_V}
            strokeWidth={2.5}
            markerEnd={`url(#${uid}-u)`}
            opacity={0.95}
          />

          {rightMark && (
            <path d={rightMark} fill="none" stroke={COLOR_W} strokeWidth={1.7} />
          )}

          {valid && (
            <circle cx={pp.x} cy={pp.y} r={5} fill={COLOR_W} />
          )}

          {valid && Math.hypot(r.x, r.y) > 0.15 && (
            <text
              x={rMid.x + 10}
              y={rMid.y - 6}
              fontSize={12}
              fontWeight={700}
              fill="currentColor"
              opacity={0.7}
            >
              r
            </text>
          )}

          {valid && (
            <text
              x={pp.x + 10}
              y={pp.y - 10}
              fontSize={11}
              fontWeight={700}
              fill={COLOR_W}
            >
              P
            </text>
          )}

          <circle
            cx={pu.x}
            cy={pu.y}
            r={11}
            fill={COLOR_V}
            fillOpacity={0.18}
            stroke={COLOR_V}
            strokeWidth={1.2}
            style={{ cursor: 'grab' }}
            {...dragU}
          />
          <circle
            cx={pv.x}
            cy={pv.y}
            r={11}
            fill={COLOR_U}
            fillOpacity={0.18}
            stroke={COLOR_U}
            strokeWidth={1.2}
            style={{ cursor: 'grab' }}
            {...dragV}
          />

          <text
            x={uLab.x}
            y={uLab.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={13}
            fontWeight={700}
            fill={COLOR_V}
          >
            u
          </text>
          <text
            x={vLab.x}
            y={vLab.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={13}
            fontWeight={700}
            fill={COLOR_U}
          >
            v
          </text>

          {!valid && (
            <text
              x={W / 2}
              y={OY + 44}
              textAnchor="middle"
              fontSize={11}
              fill="currentColor"
              opacity={0.6}
            >
              v = 0: no hay dirección sobre la que proyectar.
            </text>
          )}
        </svg>

        {/* Card: decomposition identity */}
        <div className="rounded-xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_55%,var(--bg-elevated))] px-3 py-3 font-mono text-sm">
          {valid ? (
            <>
              <p>
                <span style={{ color: COLOR_V }}>u</span>
                {' = '}
                <span style={{ color: COLOR_W }}>proj_v(u)</span>
                {' + '}
                <span>r</span>
              </p>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                proj_v(u) = c · v = {formatNum(c)} · {formatPair(sv)} = {formatPair(proj)}
              </p>
              <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
                r = u − proj = {formatPair(r)}
                {' · '}
                r·v ≈ {formatNum(orthoDot)}
                {orthoOk ? ' ✓' : ''}
              </p>
            </>
          ) : (
            <p className="text-amber-800 dark:text-amber-200">
              v·v = 0 → la fórmula (u·v)/(v·v)·v no está definida.
            </p>
          )}
        </div>

        {mode === 'decomp' && valid && (
          <div className="space-y-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              Descomposición
            </p>
            <p>
              Componente paralela a v:{' '}
              <span className="font-mono" style={{ color: COLOR_W }}>
                {formatPair(proj)}
              </span>
            </p>
            <p>
              Componente ortogonal a v:{' '}
              <span className="font-mono">{formatPair(r)}</span>
            </p>
            <p className="text-xs text-[var(--fg-muted)]">
              Ángulo u–v: {cls.thetaDeg == null ? '—' : `${formatNum(cls.thetaDeg, 1)}°`}
              {perpCase ? ' · perpendiculares ⇒ proj = 0' : ''}
              {parallel ? ' · paralelos ⇒ r = 0' : ''}
              {c < 0 ? ' · c < 0 ⇒ proyección en sentido opuesto a v' : ''}
            </p>
          </div>
        )}

        {mode === 'calc' && (
          <div className="space-y-2 rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              Cálculo paso a paso
            </p>
            <ButtonRow>
              {(['u·v', 'v·v', 'c', 'proj', 'r'] as const).map((label, i) => (
                <VizButton key={label} active={calcStep === i} onClick={() => setCalcStep(i)}>
                  {i + 1}. {label}
                </VizButton>
              ))}
            </ButtonRow>
            {!valid ? (
              <p className="text-amber-800 dark:text-amber-200">
                Paso bloqueado: v = {formatPair(sv)} ⇒ v·v = 0.
              </p>
            ) : (
              <div className="space-y-1 text-xs leading-relaxed text-[var(--fg-muted)]">
                {calcStep >= 0 && (
                  <p className={calcStep === 0 ? 'text-[var(--fg)]' : ''}>
                    1. u·v = {formatNum(su.x)}·{formatNum(sv.x)} + {formatNum(su.y)}·
                    {formatNum(sv.y)} = <strong>{formatNum(uv)}</strong>
                  </p>
                )}
                {calcStep >= 1 && (
                  <p className={calcStep === 1 ? 'text-[var(--fg)]' : ''}>
                    2. v·v = {formatNum(sv.x)}² + {formatNum(sv.y)}² ={' '}
                    <strong>{formatNum(vv)}</strong>
                  </p>
                )}
                {calcStep >= 2 && (
                  <p className={calcStep === 2 ? 'text-[var(--fg)]' : ''}>
                    3. c = (u·v)/(v·v) = {formatNum(uv)}/{formatNum(vv)} ={' '}
                    <strong style={{ color: COLOR_W }}>{formatNum(c)}</strong>
                    {c < 0 ? ' (negativo)' : ''}
                    {Math.abs(c) > 1 ? ' (más allá de la punta de v)' : ''}
                  </p>
                )}
                {calcStep >= 3 && (
                  <p className={calcStep === 3 ? 'text-[var(--fg)]' : ''}>
                    4. proj_v(u) = c·v = {formatNum(c)} · {formatPair(sv)} ={' '}
                    <strong style={{ color: COLOR_W }}>{formatPair(proj)}</strong>
                  </p>
                )}
                {calcStep >= 4 && (
                  <p className={calcStep === 4 ? 'text-[var(--fg)]' : ''}>
                    5. r = u − proj = {formatPair(su)} − {formatPair(proj)} ={' '}
                    <strong>{formatPair(r)}</strong>
                    {' · '}
                    r·v ≈ {formatNum(orthoDot)}
                    {orthoOk ? ' ✓' : ''}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <ControlsStack>
          <p className="text-xs text-[var(--fg-muted)]">
            Escalar v (α ≠ 0) no cambia la proyección; −v da el mismo proj.
          </p>
          <ButtonRow>
            <VizButton onClick={() => scaleV(2)}>v → 2v</VizButton>
            <VizButton onClick={() => scaleV(0.5)}>v → ½v</VizButton>
            <VizButton onClick={() => scaleV(-1)}>v → −v</VizButton>
          </ButtonRow>
        </ControlsStack>

        <CollapsibleEdit
          label="Editar u y v numéricamente"
          open={editOpen}
          onToggle={() => setEditOpen((o) => !o)}
        >
          <ControlsStack>
            <label className="flex items-center gap-2 text-sm">
              <span className="w-8 font-mono text-[var(--fg-muted)]">uₓ</span>
              <input
                type="number"
                step={0.1}
                value={su.x}
                onChange={(e) => {
                  setU((p) => clampVec({ x: Number(e.target.value), y: p.y }, CLAMP));
                  setPreset(null);
                }}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-mono text-sm"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="w-8 font-mono text-[var(--fg-muted)]">uᵧ</span>
              <input
                type="number"
                step={0.1}
                value={su.y}
                onChange={(e) => {
                  setU((p) => clampVec({ x: p.x, y: Number(e.target.value) }, CLAMP));
                  setPreset(null);
                }}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-mono text-sm"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="w-8 font-mono text-[var(--fg-muted)]">vₓ</span>
              <input
                type="number"
                step={0.1}
                value={sv.x}
                onChange={(e) => {
                  setV((p) => clampVec({ x: Number(e.target.value), y: p.y }, CLAMP));
                  setPreset(null);
                }}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-mono text-sm"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="w-8 font-mono text-[var(--fg-muted)]">vᵧ</span>
              <input
                type="number"
                step={0.1}
                value={sv.y}
                onChange={(e) => {
                  setV((p) => clampVec({ x: p.x, y: Number(e.target.value) }, CLAMP));
                  setPreset(null);
                }}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-mono text-sm"
              />
            </label>
          </ControlsStack>
        </CollapsibleEdit>
      </div>
    </VizPanel>
  );
}
