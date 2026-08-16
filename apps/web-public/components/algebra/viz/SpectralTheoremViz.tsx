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
  analyzeSymmetric,
  applyMat,
  dot,
  formatNum,
  formatPair,
  transformCircle,
  unitCircle,
} from './eigenHelpers';
import { add, normalize, scale, type Mat2, type Vec2 } from './math2d';
import {
  Badge,
  Chip,
  ChipRow,
  CollapsibleEdit,
  GuideBlock,
  Mat2Editor,
  Segmented,
  polyPoints,
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
const ox = W / 2;
const oy = H / 2;
const S = 48;
const CLAMP = 2.8;
const LINE_EXT = 4.5;

type Tab = 'geo' | 'alg';
type Mode = 'eigen' | 'diag' | 'action';
type PresetId = 'diag' | 'rot' | 'indef' | 'rank1' | 'id' | null;

const PRESETS: Array<{ id: PresetId; label: string; a: number; b: number; d: number }> = [
  { id: 'diag', label: 'Diagonal', a: 2, b: 0, d: 0.5 },
  { id: 'rot', label: 'Rotada', a: 2, b: 1, d: 2 },
  { id: 'indef', label: 'Indefinida', a: 1, b: 0, d: -2 },
  { id: 'rank1', label: 'Rango 1', a: 1, b: 1, d: 1 },
  { id: 'id', label: 'Identidad I', a: 1, b: 0, d: 1 },
];

function symMat(a: number, b: number, d: number): Mat2 {
  return [
    [a, b],
    [b, d],
  ];
}

function spanEnds(v: Vec2, ext = LINE_EXT): { a: Vec2; b: Vec2 } | null {
  const n = normalize(v);
  if (Math.hypot(n.x, n.y) < 1e-9) return null;
  return { a: scale(n, -ext), b: scale(n, ext) };
}

function rightAngleMark(
  q1: Vec2,
  q2: Vec2,
  toPx: (p: Vec2) => { x: number; y: number },
  size = 12,
): string {
  const p1 = toPx(scale(normalize(q1), size / S));
  const p2 = toPx(scale(normalize(q2), size / S));
  const corner = { x: ox + (p1.x - ox) + (p2.x - ox), y: oy + (p1.y - oy) + (p2.y - oy) };
  return `M${p1.x},${p1.y} L${corner.x},${corner.y} L${p2.x},${p2.y}`;
}

/**
 * Teorema espectral: A simétrica ⇒ A = QΛQᵀ con base ortonormal (ALG-EIG-006).
 */
export function SpectralTheoremViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [a, setA] = useState(2);
  const [b, setB] = useState(1);
  const [d, setD] = useState(2);
  const [tab, setTab] = useState<Tab>('geo');
  const [mode, setMode] = useState<Mode>('eigen');
  const [x, setX] = useState<Vec2>({ x: 1.4, y: 0.9 });
  const [editOpen, setEditOpen] = useState(false);
  const [showEllipse, setShowEllipse] = useState(true);
  const [preset, setPreset] = useState<PresetId>('rot');

  const A = symMat(a, b, d);
  const analysis = analyzeSymmetric(A);
  const q1 = analysis.pairs[0]?.v ?? { x: 1, y: 0 };
  const q2 = analysis.pairs[1]?.v ?? { x: 0, y: 1 };
  const l1 = analysis.pairs[0]?.lambda ?? 0;
  const l2 = analysis.pairs[1]?.lambda ?? 0;
  const Q = analysis.Q;
  const Lambda = analysis.Lambda;
  const QTQ = analysis.QTQ;
  const Aq1 = applyMat(A, q1);
  const Aq2 = applyMat(A, q2);
  const dotQ = dot(q1, q2);
  const orthoOk = Math.abs(dotQ) < 1e-4;
  const qtqOk =
    Math.abs(QTQ[0][0] - 1) < 1e-3 &&
    Math.abs(QTQ[1][1] - 1) < 1e-3 &&
    Math.abs(QTQ[0][1]) < 1e-3 &&
    Math.abs(QTQ[1][0]) < 1e-3;

  const c1 = dot(q1, x);
  const c2 = dot(q2, x);
  const Ax = applyMat(A, x);
  const AxDecomp = add(scale(q1, l1 * c1), scale(q2, l2 * c2));

  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });
  const circle = unitCircle(72);
  const ellipse = transformCircle(A, 72);
  const dragX = useVecDrag((p) => setX(clampVec(p, CLAMP)), S, { x: ox, y: oy });

  const applyPreset = (id: PresetId) => {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setPreset(id);
    setA(p.a);
    setB(p.b);
    setD(p.d);
  };

  const bump = (na: number, nb: number, nd: number) => {
    setA(na);
    setB(nb);
    setD(nd);
    setPreset(null);
  };

  const span1 = spanEnds(q1);
  const span2 = spanEnds(q2);
  const pq1 = to(q1);
  const pq2 = to(q2);
  const pAq1 = to(Aq1);
  const pAq2 = to(Aq2);
  const px = to(x);
  const pAx = to(Ax);
  const q1Lbl = labelOffset(q1, pq1, ox, oy, 16);
  const q2Lbl = labelOffset(q2, pq2, ox, oy, 16);

  const caption = joinCaption(
    'Simétrica ✓',
    orthoOk ? 'q₁⟂q₂ ✓' : `q₁·q₂ = ${formatNum(dotQ)}`,
    'A = QΛQᵀ ✓',
  );

  return (
    <VizPanel title="Teorema espectral" caption={caption}>
      <div className="space-y-3">
        <GuideBlock
          idea="Si A es simétrica (A = Aᵀ), existe una base ortonormal de autovectores: A = QΛQᵀ."
          tryIt="Cambia a, b, d o prueba un preset: el círculo unitario se convierte en elipse alineada con q₁, q₂."
          concept="Simetría ⇒ autovectores ortogonales (ángulo recto entre q₁ y q₂)."
        />

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="ok">SIMÉTRICA</Badge>
          <Badge tone="ok">A = Aᵀ ✓</Badge>
          {orthoOk ? <Badge tone="ok">q₁ · q₂ = 0 ✓</Badge> : <Badge tone="warn">q₁ · q₂ ≠ 0</Badge>}
          {qtqOk ? <Badge tone="ok">QᵀQ = I ✓</Badge> : <Badge tone="warn">QᵀQ ≈ I</Badge>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={[
              { id: 'geo', label: 'Geométrica' },
              { id: 'alg', label: 'Algebraica' },
            ]}
            value={tab}
            onChange={(id) => setTab(id as Tab)}
          />
          <Segmented
            options={[
              { id: 'eigen', label: 'Autovectores' },
              { id: 'diag', label: 'Diagonalización' },
              { id: 'action', label: 'Acción sobre x' },
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

        {tab === 'geo' ? (
          <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg)]">
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full touch-none" role="img">
              <defs>
                <ArrowMarker id={`${uid}-q1`} color={COLOR_V} />
                <ArrowMarker id={`${uid}-q2`} color={COLOR_U} />
                <ArrowMarker id={`${uid}-aq`} color={COLOR_W} />
                <ArrowMarker id={`${uid}-x`} color="var(--fg)" />
              </defs>
              <Axes W={W} H={H} ox={ox} oy={oy} S={S} ticks={[-2, -1, 1, 2]} />

              {/* Unit circle */}
              <polygon
                points={polyPoints(circle, to)}
                fill="none"
                stroke="var(--fg-muted)"
                strokeWidth={1.2}
                opacity={0.45}
              />

              {/* Ellipse A(S¹) */}
              {showEllipse ? (
                <polygon
                  points={polyPoints(ellipse, to)}
                  fill="color-mix(in oklab, orange 12%, transparent)"
                  stroke="orange"
                  strokeWidth={1.6}
                  opacity={0.9}
                />
              ) : null}

              {/* span(q1), span(q2) */}
              {span1 ? (
                <line
                  x1={to(span1.a).x}
                  y1={to(span1.a).y}
                  x2={to(span1.b).x}
                  y2={to(span1.b).y}
                  stroke={COLOR_V}
                  strokeWidth={1.4}
                  opacity={0.55}
                />
              ) : null}
              {span2 ? (
                <line
                  x1={to(span2.a).x}
                  y1={to(span2.a).y}
                  x2={to(span2.b).x}
                  y2={to(span2.b).y}
                  stroke={COLOR_U}
                  strokeWidth={1.4}
                  opacity={0.55}
                />
              ) : null}

              {/* 90° marker */}
              {orthoOk ? (
                <path
                  d={rightAngleMark(q1, q2, to)}
                  fill="none"
                  stroke="var(--fg)"
                  strokeWidth={1.5}
                  opacity={0.7}
                />
              ) : null}

              {/* unit q1, q2 */}
              <line
                x1={ox}
                y1={oy}
                x2={pq1.x}
                y2={pq1.y}
                stroke={COLOR_V}
                strokeWidth={2.4}
                markerEnd={`url(#${uid}-q1)`}
              />
              <line
                x1={ox}
                y1={oy}
                x2={pq2.x}
                y2={pq2.y}
                stroke={COLOR_U}
                strokeWidth={2.4}
                markerEnd={`url(#${uid}-q2)`}
              />

              {/* Aqi on same rays */}
              {(mode === 'eigen' || mode === 'diag') && Math.hypot(Aq1.x, Aq1.y) > 0.05 ? (
                <line
                  x1={ox}
                  y1={oy}
                  x2={pAq1.x}
                  y2={pAq1.y}
                  stroke={COLOR_W}
                  strokeWidth={2}
                  markerEnd={`url(#${uid}-aq)`}
                  opacity={0.95}
                />
              ) : null}
              {(mode === 'eigen' || mode === 'diag') && Math.hypot(Aq2.x, Aq2.y) > 0.05 ? (
                <line
                  x1={ox}
                  y1={oy}
                  x2={pAq2.x}
                  y2={pAq2.y}
                  stroke={COLOR_W}
                  strokeWidth={2}
                  markerEnd={`url(#${uid}-aq)`}
                  opacity={0.85}
                />
              ) : null}

              {/* λ labels near tips of Aqi or along axes */}
              <text
                x={labelOffset(Aq1, pAq1, ox, oy, 18).x}
                y={labelOffset(Aq1, pAq1, ox, oy, 18).y}
                fontSize={12}
                fill={COLOR_W}
                fontWeight={600}
              >
                λ₁={formatNum(l1)}
              </text>
              <text
                x={labelOffset(Aq2, pAq2, ox, oy, 18).x}
                y={labelOffset(Aq2, pAq2, ox, oy, 18).y}
                fontSize={12}
                fill={COLOR_W}
                fontWeight={600}
              >
                λ₂={formatNum(l2)}
              </text>

              <text x={q1Lbl.x} y={q1Lbl.y} fontSize={12} fill={COLOR_V} fontWeight={600}>
                q₁
              </text>
              <text x={q2Lbl.x} y={q2Lbl.y} fontSize={12} fill={COLOR_U} fontWeight={600}>
                q₂
              </text>

              {mode === 'action' ? (
                <g>
                  <line
                    x1={ox}
                    y1={oy}
                    x2={px.x}
                    y2={px.y}
                    stroke="var(--fg)"
                    strokeWidth={2.2}
                    markerEnd={`url(#${uid}-x)`}
                  />
                  <circle
                    cx={px.x}
                    cy={px.y}
                    r={10}
                    fill="transparent"
                    stroke="var(--fg)"
                    strokeWidth={1.5}
                    className="cursor-grab"
                    {...dragX}
                  />
                  <text
                    x={labelOffset(x, px, ox, oy, 16).x}
                    y={labelOffset(x, px, ox, oy, 16).y}
                    fontSize={12}
                    fill="var(--fg)"
                  >
                    x
                  </text>
                  <line
                    x1={ox}
                    y1={oy}
                    x2={pAx.x}
                    y2={pAx.y}
                    stroke={COLOR_W}
                    strokeWidth={2.2}
                    markerEnd={`url(#${uid}-aq)`}
                  />
                  <text
                    x={labelOffset(Ax, pAx, ox, oy, 16).x}
                    y={labelOffset(Ax, pAx, ox, oy, 16).y}
                    fontSize={12}
                    fill={COLOR_W}
                    fontWeight={600}
                  >
                    Ax
                  </text>
                </g>
              ) : null}
            </svg>
          </div>
        ) : (
          <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
            <p className="font-mono text-sm text-[var(--fg)]">A = Q Λ Qᵀ</p>
            <div className="flex flex-wrap items-start gap-4">
              <div>
                <p className="mb-1 text-xs font-semibold text-[var(--fg-muted)]">A (simétrica)</p>
                <Mat2Editor m={A} readOnly name="A" />
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold text-[var(--fg-muted)]">Q = [q₁ q₂]</p>
                <Mat2Editor m={Q} readOnly name="Q" labels={['q₁', 'q₂']} />
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold text-[var(--fg-muted)]">Λ</p>
                <Mat2Editor m={Lambda} readOnly name="Λ" />
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold text-[var(--fg-muted)]">QᵀQ</p>
                <Mat2Editor m={QTQ} readOnly name="QTQ" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="font-mono">
                λ₁ = {formatNum(l1)}, q₁ = {formatPair(q1)}
              </span>
              <span className="font-mono">
                λ₂ = {formatNum(l2)}, q₂ = {formatPair(q2)}
              </span>
            </div>
          </div>
        )}

        {(mode === 'diag' || tab === 'alg') && tab === 'geo' ? (
          <div className="flex flex-wrap items-start gap-3">
            <div className="rounded-lg border border-[var(--border)] px-3 py-2">
              <p className="mb-1 text-xs font-semibold text-[var(--fg-muted)]">Q</p>
              <Mat2Editor m={Q} readOnly name="Q" />
            </div>
            <div className="rounded-lg border border-[var(--border)] px-3 py-2">
              <p className="mb-1 text-xs font-semibold text-[var(--fg-muted)]">Λ</p>
              <Mat2Editor m={Lambda} readOnly name="Λ" />
            </div>
            <div className="space-y-1 self-center text-sm text-[var(--fg-muted)]">
              <p className="font-mono text-[var(--fg)]">A = QΛQᵀ</p>
              <p>{qtqOk ? 'QᵀQ = I ✓' : 'QᵀQ ≈ I'}</p>
            </div>
          </div>
        ) : null}

        {mode === 'action' ? (
          <div className="space-y-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm">
            <p className="font-mono">
              c₁ = q₁·x = {formatNum(c1)} · c₂ = q₂·x = {formatNum(c2)}
            </p>
            <p className="font-mono text-[var(--fg-muted)]">
              Ax = λ₁ c₁ q₁ + λ₂ c₂ q₂ = {formatPair(AxDecomp)}
            </p>
            <p className="font-mono">
              Ax = {formatPair(Ax)}
            </p>
          </div>
        ) : null}

        <ControlsStack>
          <ToggleRow label="Mostrar elipse A(S¹)" checked={showEllipse} onChange={setShowEllipse} />
          <CollapsibleEdit
            label="Editar a, b, d (A simétrica)"
            open={editOpen}
            onToggle={() => setEditOpen((o) => !o)}
          >
            <div className="space-y-2">
              <SliderRow
                label="a"
                value={a}
                min={-3}
                max={3}
                step={0.1}
                onChange={(v) => bump(v, b, d)}
              />
              <SliderRow
                label="b"
                value={b}
                min={-3}
                max={3}
                step={0.1}
                onChange={(v) => bump(a, v, d)}
              />
              <SliderRow
                label="d"
                value={d}
                min={-3}
                max={3}
                step={0.1}
                onChange={(v) => bump(a, b, v)}
              />
              <p className="font-mono text-xs text-[var(--fg-muted)]">
                A = [[{formatNum(a)}, {formatNum(b)}], [{formatNum(b)}, {formatNum(d)}]]
              </p>
            </div>
          </CollapsibleEdit>
          <ButtonRow>
            <VizButton
              onClick={() => {
                setMode('eigen');
                setTab('geo');
              }}
              active={mode === 'eigen'}
            >
              Ver ejes propios
            </VizButton>
            <VizButton
              onClick={() => {
                setMode('action');
                setX({ x: 1.4, y: 0.9 });
              }}
            >
              Probar x
            </VizButton>
          </ButtonRow>
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
