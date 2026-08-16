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
import type { Vec2 } from './math2d';
import {
  ORT_EPS,
  ORT_NEAR,
  classifyDot,
  dot,
  formatNum,
  formatPair,
  norm,
  normalize,
  rotateToPerp,
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
  atan2Vec,
  clampVec,
  labelOffset,
  minorArcPath,
  sectorPath,
  useVecDrag,
} from './vectorPlane';

const W = VEC_W;
const H = VEC_H;
const OX = W / 2;
const OY = H / 2;
const S = 42;
const CLAMP = 4.5;
const ARC_R = 0.55;
const RM = 0.22;

type Mode = 'geo' | 'dot' | 'build';
type PresetId = 'ort' | 'acute' | 'obtuse' | 'axes' | 'diff' | null;

const PRESETS: Array<{ id: PresetId; label: string; u: Vec2; v: Vec2 }> = [
  { id: 'ort', label: 'Ortogonales', u: { x: 3, y: 1 }, v: { x: -1, y: 3 } },
  { id: 'acute', label: 'Agudos', u: { x: 3, y: 1 }, v: { x: 2, y: 2 } },
  { id: 'obtuse', label: 'Obtusos', u: { x: 3, y: 1 }, v: { x: -2, y: 0.5 } },
  { id: 'axes', label: 'Ejes', u: { x: 3, y: 0 }, v: { x: 0, y: 2 } },
  { id: 'diff', label: 'Distinta longitud', u: { x: 3, y: 1 }, v: { x: -2, y: 6 } },
];

function toPx(p: Vec2) {
  return { x: OX + p.x * S, y: OY - p.y * S };
}

function nearUnit(v: Vec2): boolean {
  return Math.abs(norm(v) - 1) <= ORT_NEAR;
}

function nearestPerp(u: Vec2, v: Vec2): Vec2 {
  const plus = rotateToPerp(u, v, 1);
  const minus = rotateToPerp(u, v, -1);
  const dPlus = dot(v, plus);
  const dMinus = dot(v, minus);
  return dPlus >= dMinus ? plus : minus;
}

function relationLabel(kind: ReturnType<typeof classifyDot>['kind'], orthonormal: boolean): string {
  if (kind === 'undefined') return 'vector cero (θ indefinido)';
  if (orthonormal) return 'ortonormales';
  if (kind === 'right') return 'ortogonales';
  if (kind === 'acute') return 'ángulo agudo';
  return 'ángulo obtuso';
}

/**
 * Ortogonalidad: u⊥v ⇔ u·v=0 (ALG-ORT-001).
 */
export function OrthogonalityViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [u, setU] = useState<Vec2>({ x: 3, y: 1 });
  const [v, setV] = useState<Vec2>({ x: -1, y: 3 });
  const [mode, setMode] = useState<Mode>('geo');
  const [preset, setPreset] = useState<PresetId>('ort');
  const [editOpen, setEditOpen] = useState(false);
  const [wantUnit, setWantUnit] = useState(false);

  const su = clampVec(u, CLAMP);
  const sv = clampVec(v, CLAMP);
  const cls = classifyDot(su, sv);
  const nu = norm(su);
  const nv = norm(sv);
  const uZero = nu < ORT_EPS;
  const vZero = nv < ORT_EPS;
  const anyZero = uZero || vZero;
  const ortho = !anyZero && cls.kind === 'right';
  const orthonormal = ortho && nearUnit(su) && nearUnit(sv);
  const showUnitCircle = wantUnit && ortho;

  const dragU = useVecDrag(
    (p) => {
      setU(clampVec(p, CLAMP));
      setPreset(null);
      setWantUnit(false);
    },
    S,
    { x: OX, y: OY },
  );
  const dragV = useVecDrag(
    (p) => {
      setV(clampVec(p, CLAMP));
      setPreset(null);
      setWantUnit(false);
    },
    S,
    { x: OX, y: OY },
  );

  const pu = toPx(su);
  const pv = toPx(sv);
  const uLab = labelOffset(su, pu, OX, OY, 18);
  const vLab = labelOffset(sv, pv, OX, OY, 18);

  const a0 = atan2Vec(su);
  const a1 = atan2Vec(sv);
  const showArc = !anyZero && cls.kind !== 'right' && cls.thetaDeg != null && cls.thetaDeg > 2;
  const arcPath = showArc ? minorArcPath(OX, OY, S, ARC_R, a0, a1) : '';
  const secPath = showArc ? sectorPath(OX, OY, S, ARC_R, a0, a1) : '';

  let bisLX = OX;
  let bisLY = OY;
  if (showArc && cls.thetaDeg != null) {
    let da = a1 - a0;
    while (da > Math.PI) da -= 2 * Math.PI;
    while (da < -Math.PI) da += 2 * Math.PI;
    const bis = a0 + da / 2;
    const r = (ARC_R + 0.32) * S;
    bisLX = OX + Math.cos(bis) * r;
    bisLY = OY - Math.sin(bis) * r;
  }

  let rightMark = '';
  if (ortho) {
    const nuDir = normalize(su);
    const nvDir = normalize(sv);
    const rm = RM * S;
    const ax = OX + nuDir.x * rm;
    const ay = OY - nuDir.y * rm;
    const bx = OX + (nuDir.x + nvDir.x) * rm;
    const by = OY - (nuDir.y + nvDir.y) * rm;
    const cx = OX + nvDir.x * rm;
    const cy = OY - nvDir.y * rm;
    rightMark = `M${ax},${ay} L${bx},${by} L${cx},${cy}`;
  }

  const t1 = su.x * sv.x;
  const t2 = su.y * sv.y;
  const cancels = Math.abs(cls.dot) < ORT_NEAR * Math.max(1, nu * nv) || Math.abs(cls.dot) < ORT_EPS;

  function applyPreset(id: PresetId) {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setU(p.u);
    setV(p.v);
    setPreset(id);
    setWantUnit(false);
  }

  function makePlus90() {
    if (uZero) return;
    setV(clampVec(rotateToPerp(su, sv, 1), CLAMP));
    setPreset(null);
    setWantUnit(false);
  }

  function makeMinus90() {
    if (uZero) return;
    setV(clampVec(rotateToPerp(su, sv, -1), CLAMP));
    setPreset(null);
    setWantUnit(false);
  }

  function makeOrthogonal() {
    if (uZero || vZero) return;
    setV(clampVec(nearestPerp(su, sv), CLAMP));
    setPreset(null);
    setWantUnit(false);
  }

  function doNormalize() {
    if (!ortho) return;
    setU(clampVec(normalize(su), CLAMP));
    setV(clampVec(normalize(sv), CLAMP));
    setWantUnit(true);
    setPreset(null);
  }

  const badge =
    cls.kind === 'undefined' ? (
      <Badge tone="warn">vector cero</Badge>
    ) : orthonormal ? (
      <Badge tone="ok">ORTONORMALES ✓</Badge>
    ) : ortho ? (
      <Badge tone="ok">ORTOGONALES ✓</Badge>
    ) : cls.kind === 'acute' ? (
      <Badge tone="neutral">AGUDO</Badge>
    ) : (
      <Badge tone="warn">OBTUSO</Badge>
    );

  const thetaStr =
    cls.thetaDeg == null ? '—' : `${formatNum(cls.thetaDeg, 1)}°`;
  const relation = relationLabel(cls.kind, orthonormal);

  const caption = joinCaption(
    `u·v = ${formatNum(cls.dot)}`,
    `θ = ${thetaStr}`,
    relation,
  );

  return (
    <VizPanel title="Ortogonalidad · u⊥v ⇔ u·v=0" caption={caption}>
      <div className="space-y-3">
        <GuideBlock
          idea="Dos vectores son perpendiculares (ortogonales) si y solo si su producto punto es cero: u⊥v ⇔ u·v=0."
          tryIt="Arrastra u y v hasta que el ángulo sea recto. Observa que u·v llega a 0 exactamente entonces — no antes."
          concept="Ortogonal = ángulo 90°. Ortonormal = ortogonal y ambos de longitud 1."
        />

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={[
              { id: 'geo', label: 'Geometría' },
              { id: 'dot', label: 'Producto punto' },
              { id: 'build', label: 'Construir' },
            ]}
            value={mode}
            onChange={(id) => setMode(id as Mode)}
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
          {badge}
          <span className="font-mono text-xs text-[var(--fg-muted)]">
            u·v = {formatNum(cls.dot)} · θ = {thetaStr}
          </span>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full touch-none rounded-xl border border-[var(--border)]"
          role="img"
          aria-label={`u·v=${formatNum(cls.dot)}, θ=${thetaStr}, ${relation}`}
        >
          <defs>
            <ArrowMarker id={`${uid}-u`} color={COLOR_U} />
            <ArrowMarker id={`${uid}-v`} color={COLOR_V} />
            <clipPath id={`${uid}-clip`}>
              <rect x={0} y={0} width={W} height={H} />
            </clipPath>
          </defs>

          <Axes W={W} H={H} ox={OX} oy={OY} S={S} />

          {showUnitCircle && (
            <>
              <circle
                cx={OX}
                cy={OY}
                r={S}
                fill="none"
                stroke="currentColor"
                strokeDasharray="4 3"
                opacity={0.35}
              />
              <text x={OX + S + 4} y={OY - 4} fontSize={10} fill="currentColor" opacity={0.5}>
                r=1
              </text>
            </>
          )}

          {showArc && <path d={secPath} fill={COLOR_W} opacity={0.07} />}
          {showArc && (
            <path d={arcPath} fill="none" stroke={COLOR_W} strokeWidth={2} />
          )}
          {showArc && cls.thetaDeg != null && cls.thetaDeg > 8 && cls.thetaDeg < 172 && (
            <text
              x={bisLX}
              y={bisLY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={12}
              fontWeight={700}
              fill={COLOR_W}
            >
              θ
            </text>
          )}

          {ortho && rightMark && (
            <path d={rightMark} fill="none" stroke={COLOR_W} strokeWidth={1.8} />
          )}

          {!uZero && (
            <line
              x1={OX}
              y1={OY}
              x2={pu.x}
              y2={pu.y}
              stroke={COLOR_U}
              strokeWidth={2.5}
              markerEnd={`url(#${uid}-u)`}
            />
          )}
          {!vZero && (
            <line
              x1={OX}
              y1={OY}
              x2={pv.x}
              y2={pv.y}
              stroke={COLOR_V}
              strokeWidth={2.5}
              markerEnd={`url(#${uid}-v)`}
            />
          )}

          <circle
            cx={pu.x}
            cy={pu.y}
            r={11}
            fill={COLOR_U}
            fillOpacity={0.18}
            stroke={COLOR_U}
            strokeWidth={1.2}
            style={{ cursor: 'grab' }}
            {...dragU}
          />
          <circle
            cx={pv.x}
            cy={pv.y}
            r={11}
            fill={COLOR_V}
            fillOpacity={0.18}
            stroke={COLOR_V}
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
            fill={COLOR_U}
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
            fill={COLOR_V}
          >
            v
          </text>

          {anyZero && (
            <text
              x={W / 2}
              y={OY + 48}
              textAnchor="middle"
              fontSize={11}
              fill="currentColor"
              opacity={0.55}
            >
              Vector cero: u·v=0 pero θ no está definido (no es un ángulo recto).
            </text>
          )}
        </svg>

        {mode === 'dot' && (
          <div className="space-y-2 rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              Expansión del producto punto
            </p>
            <p>
              u · v = u₁v₁ + u₂v₂
            </p>
            <p>
              ={' '}
              <span style={{ color: COLOR_U }}>{formatNum(su.x)}</span>
              ·
              <span style={{ color: COLOR_V }}>{formatNum(sv.x)}</span>
              {' + '}
              <span style={{ color: COLOR_U }}>{formatNum(su.y)}</span>
              ·
              <span style={{ color: COLOR_V }}>{formatNum(sv.y)}</span>
            </p>
            <p>
              ={' '}
              <span className={cancels ? 'rounded bg-emerald-500/15 px-1 text-emerald-800 dark:text-emerald-300' : ''}>
                {formatNum(t1)}
              </span>
              {' + '}
              <span className={cancels ? 'rounded bg-emerald-500/15 px-1 text-emerald-800 dark:text-emerald-300' : ''}>
                {formatNum(t2)}
              </span>
              {' = '}
              <strong
                className={
                  cancels
                    ? 'text-emerald-800 dark:text-emerald-300'
                    : 'text-[var(--fg)]'
                }
              >
                {formatNum(cls.dot)}
              </strong>
            </p>
            {cancels && !anyZero && (
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                Los términos se anulan → u·v = 0 → u ⊥ v.
              </p>
            )}
            {anyZero && (
              <p className="text-xs text-amber-800 dark:text-amber-200">
                Hay un vector cero: el producto punto es 0, pero el ángulo θ no está definido.
              </p>
            )}
            <p className="pt-1 text-xs text-[var(--fg-muted)]">
              θ = {thetaStr}
              {!anyZero && cls.kind === 'right' ? ' (recto)' : ''}
              {!anyZero && cls.kind === 'acute' ? ' (agudo)' : ''}
              {!anyZero && cls.kind === 'obtuse' ? ' (obtuso)' : ''}
            </p>
          </div>
        )}

        {mode === 'build' && (
          <ControlsStack>
            <p className="text-xs text-[var(--fg-muted)]">
              Coloca v en una dirección perpendicular a u (±90°), conservando ‖v‖.
            </p>
            <ButtonRow>
              <VizButton onClick={makePlus90}>+90°</VizButton>
              <VizButton onClick={makeMinus90}>−90°</VizButton>
              <VizButton onClick={makeOrthogonal}>Hacer ortogonal</VizButton>
            </ButtonRow>
            <p className="text-[11px] text-[var(--fg-muted)]">
              +90° / −90° usan perpPlus / perpMinus respecto de u. «Hacer ortogonal» elige el
              perpendicular más cercano a v actual.
            </p>
          </ControlsStack>
        )}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-lg border border-[var(--border)] px-2 py-2">
            <p className="text-[10px] text-[var(--fg-muted)]">u</p>
            <p className="font-mono text-xs font-semibold" style={{ color: COLOR_U }}>
              {formatPair(su)}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] px-2 py-2">
            <p className="text-[10px] text-[var(--fg-muted)]">v</p>
            <p className="font-mono text-xs font-semibold" style={{ color: COLOR_V }}>
              {formatPair(sv)}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] px-2 py-2">
            <p className="text-[10px] text-[var(--fg-muted)]">u · v</p>
            <p className="font-mono text-xs font-semibold tabular-nums">{formatNum(cls.dot)}</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] px-2 py-2">
            <p className="text-[10px] text-[var(--fg-muted)]">θ</p>
            <p className="font-mono text-xs font-semibold tabular-nums" style={{ color: COLOR_W }}>
              {thetaStr}
            </p>
          </div>
        </div>

        {ortho && (
          <div className="space-y-1">
            <ToggleRow
              label="Normalizar (ortonormales + círculo unitario)"
              checked={wantUnit && orthonormal}
              onChange={(on) => {
                if (on) doNormalize();
                else setWantUnit(false);
              }}
            />
            <p className="text-[11px] text-[var(--fg-muted)]">
              Ortogonal ≠ ortonormal: la normalización fija ‖u‖=‖v‖=1 sin romper u⊥v.
            </p>
          </div>
        )}

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
                  setWantUnit(false);
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
                  setWantUnit(false);
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
                  setWantUnit(false);
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
                  setWantUnit(false);
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
