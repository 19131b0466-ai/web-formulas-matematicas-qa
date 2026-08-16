'use client';

import { useEffect, useId, useRef, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  ToggleRow,
  VizButton,
  VizPanel,
  fmt,
  joinCaption,
} from './controls';
import { matMul, type Mat2, type Vec2 } from './math2d';
import { present } from './matrixGrid';
import {
  Badge,
  Chip,
  ChipRow,
  CollapsibleEdit,
  DET_EPS,
  GuideBlock,
  I2,
  L_SHAPE,
  Mat2Editor,
  PRESET_REFLECT_X,
  PRESET_ROT45,
  PRESET_SCALE,
  PRESET_SHEAR,
  PRESET_SINGULAR,
  PRESET_ZERO,
  Segmented,
  applyMat,
  cloneMat2,
  det2,
  formatPair,
  gridLines,
  inv2,
  matEq,
  matLerp,
  polyPoints,
  rank2,
  transformPts,
} from './transformHelpers';
import {
  ArrowMarker,
  Axes,
  COLOR_W,
  VEC_H,
  VEC_W,
  labelOffset,
} from './vectorPlane';

const W = VEC_W;
const H = VEC_H;
const ox = W / 2;
const oy = H / 2;
const S = 36;

const P0: Vec2 = { x: 2, y: 1 };

const PRESETS: Array<{ id: string; label: string; m: Mat2 }> = [
  { id: 'shear', label: 'Shear', m: PRESET_SHEAR },
  { id: 'scale', label: 'Escalamiento', m: PRESET_SCALE },
  { id: 'rot', label: 'Rotación', m: PRESET_ROT45 },
  { id: 'reflect', label: 'Reflexión', m: PRESET_REFLECT_X },
  { id: 'sing', label: 'Singular', m: PRESET_SINGULAR },
  { id: 'zero', label: 'Matriz cero', m: PRESET_ZERO },
];

type Tab = 'geo' | 'alg';
type Phase = 'original' | 'transformed' | 'recovered';

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function phaseLabel(phase: Phase): string {
  if (phase === 'original') return 'Original';
  if (phase === 'transformed') return 'Transformado';
  return 'Recuperado';
}

function phaseTone(phase: Phase): 'neutral' | 'warn' | 'ok' {
  if (phase === 'original') return 'neutral';
  if (phase === 'transformed') return 'warn';
  return 'ok';
}

/** Entrywise lerp between two matrices. */
function matLerpPair(F: Mat2, Tm: Mat2, t: number): Mat2 {
  const s = 1 - t;
  return [
    [s * F[0][0] + t * Tm[0][0], s * F[0][1] + t * Tm[0][1]],
    [s * F[1][0] + t * Tm[1][0], s * F[1][1] + t * Tm[1][1]],
  ];
}

/**
 * A transforma; A⁻¹ deshace. Estados: original → transformado → recuperado.
 */
export function InverseTransformViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [A, setA] = useState<Mat2>(() => cloneMat2(PRESET_SHEAR));
  const [phase, setPhase] = useState<Phase>('original');
  const [tab, setTab] = useState<Tab>('geo');
  const [editOpen, setEditOpen] = useState(false);
  const [showGhost, setShowGhost] = useState(true);
  const [animT, setAnimT] = useState(1);
  const [displayMat, setDisplayMat] = useState<Mat2>(() => cloneMat2(I2));
  const animRef = useRef<number | null>(null);

  const det = det2(A);
  const singular = Math.abs(det) < DET_EPS;
  const Ainv = singular ? null : inv2(A);
  const rank = rank2(A);
  const product = Ainv ? matMul(Ainv, A) : null;

  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });

  useEffect(() => {
    return () => {
      if (animRef.current != null) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const stopAnim = () => {
    if (animRef.current != null) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
  };

  const runLerp = (from: Mat2, toMat: Mat2, onDone: () => void) => {
    stopAnim();
    if (prefersReducedMotion()) {
      setDisplayMat(cloneMat2(toMat));
      setAnimT(1);
      onDone();
      return;
    }
    const start = performance.now();
    const dur = 900;
    setAnimT(0);
    const tick = (now: number) => {
      const u = Math.min(1, (now - start) / dur);
      const eased = u * u * (3 - 2 * u);
      setAnimT(eased);
      setDisplayMat(matLerpPair(from, toMat, eased));
      if (u < 1) animRef.current = requestAnimationFrame(tick);
      else {
        animRef.current = null;
        setDisplayMat(cloneMat2(toMat));
        setAnimT(1);
        onDone();
      }
    };
    animRef.current = requestAnimationFrame(tick);
  };

  const resetToOriginal = (nextA?: Mat2) => {
    stopAnim();
    if (nextA) setA(cloneMat2(nextA));
    setPhase('original');
    setDisplayMat(cloneMat2(I2));
    setAnimT(1);
  };

  const applyA = () => {
    if (phase === 'transformed') return;
    runLerp(I2, A, () => setPhase('transformed'));
  };

  const undoInv = () => {
    if (singular || !Ainv) return;
    if (phase !== 'transformed') return;
    runLerp(displayMat, I2, () => setPhase('recovered'));
  };

  const roundTrip = () => {
    if (singular || !Ainv) return;
    stopAnim();
    if (prefersReducedMotion()) {
      setDisplayMat(cloneMat2(I2));
      setPhase('recovered');
      setAnimT(1);
      return;
    }
    const start = performance.now();
    const dur = 1600;
    setPhase('transformed');
    const tick = (now: number) => {
      const u = Math.min(1, (now - start) / dur);
      if (u < 0.5) {
        const t = u / 0.5;
        const eased = t * t * (3 - 2 * t);
        setAnimT(eased);
        setDisplayMat(matLerp(A, eased));
        setPhase('transformed');
      } else {
        const t = (u - 0.5) / 0.5;
        const eased = t * t * (3 - 2 * t);
        setAnimT(eased);
        // A → I via entrywise from A
        setDisplayMat(matLerpPair(A, I2, eased));
        if (u >= 1) setPhase('recovered');
        else setPhase('transformed');
      }
      if (u < 1) animRef.current = requestAnimationFrame(tick);
      else {
        animRef.current = null;
        setDisplayMat(cloneMat2(I2));
        setAnimT(1);
        setPhase('recovered');
      }
    };
    animRef.current = requestAnimationFrame(tick);
  };

  const pOrig = P0;
  const pNow = applyMat(displayMat, P0);
  const pTrans = applyMat(A, P0);
  const shapeNow = transformPts(displayMat, L_SHAPE);
  const shapeGhost = L_SHAPE;

  const showOriginalGhost = showGhost && phase !== 'original';

  const footerMain =
    phase === 'recovered' && !singular
      ? '✓ A⁻¹(Ap) = p — recuperaste el punto original.'
      : singular
        ? '✕ A no es invertible: al aplicar A se pierde información; no hay vuelta.'
        : phase === 'transformed'
          ? 'A empujó la figura. Si es invertible, A⁻¹ puede deshacer el cambio.'
          : 'Estado original. Aplica A para ver la transformación.';

  const caption = joinCaption(
    singular ? '✕ No invertible' : '✓ A invertible',
    phase === 'recovered' ? 'A⁻¹(Ap)=p' : undefined,
    `det=${fmt(det)}`,
    `rango=${rank}`,
  );

  const pTip = to(pNow);
  const pGhostTip = to(pOrig);

  return (
    <VizPanel title="Transformación inversa" caption={caption}>
      <div className="space-y-3">
        <GuideBlock
          idea="Vas a ver que A empuja la figura y, si es invertible, A⁻¹ la recupera."
          tryIt="Pulsa Aplicar A y luego Deshacer con A⁻¹. Prueba también un preset singular."
          concept="Cuando det ≠ 0 existe A⁻¹ y A⁻¹(Ap) = p. Si det = 0, la información se pierde."
        />

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={[
              { id: 'geo', label: 'Geométrica' },
              { id: 'alg', label: 'Algebraica' },
            ]}
            value={tab}
            onChange={(id) => setTab(id as Tab)}
          />
          <Badge tone={phaseTone(phase)}>ESTADO: {phaseLabel(phase)}</Badge>
          {singular ? <Badge tone="bad">Singular</Badge> : <Badge tone="ok">Invertible</Badge>}
        </div>

        <ChipRow>
          {PRESETS.map((p) => (
            <Chip
              key={p.id}
              active={matEq(A, p.m)}
              onClick={() => resetToOriginal(p.m)}
            >
              {p.label}
            </Chip>
          ))}
        </ChipRow>

        {tab === 'geo' ? (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full rounded-xl border border-[var(--border)]"
            role="img"
            aria-label={`Estado ${phaseLabel(phase)}`}
          >
            <defs>
              <ArrowMarker id={`${uid}-w`} color={COLOR_W} />
              <ArrowMarker id={`${uid}-g`} color="var(--fg-muted)" />
            </defs>
            <Axes W={W} H={H} ox={ox} oy={oy} S={S} xLabel="e₁" yLabel="e₂" />

            <g opacity={0.3}>
              {gridLines(I2, 2.5, 9).map(([a, b], i) => {
                const A0 = to(a);
                const B0 = to(b);
                return (
                  <line
                    key={`g0-${i}`}
                    x1={A0.x}
                    y1={A0.y}
                    x2={B0.x}
                    y2={B0.y}
                    stroke="var(--fg-muted)"
                    strokeWidth={1}
                    strokeDasharray="4 3"
                  />
                );
              })}
            </g>

            <g opacity={0.55}>
              {gridLines(displayMat, 2.5, 9).map(([a, b], i) => {
                const A0 = to(a);
                const B0 = to(b);
                return (
                  <line
                    key={`gt-${i}`}
                    x1={A0.x}
                    y1={A0.y}
                    x2={B0.x}
                    y2={B0.y}
                    stroke="var(--accent-strong)"
                    strokeWidth={1}
                  />
                );
              })}
            </g>

            {showOriginalGhost ? (
              <polygon
                points={polyPoints(shapeGhost, to)}
                fill="none"
                stroke="var(--fg-muted)"
                strokeWidth={1.4}
                strokeDasharray="5 3"
                opacity={0.5}
              />
            ) : null}

            <polygon
              points={polyPoints(shapeNow, to)}
              fill="color-mix(in oklab, var(--accent-soft) 50%, transparent)"
              stroke="var(--accent-strong)"
              strokeWidth={2.2}
            />

            {showOriginalGhost ? (
              <>
                <circle cx={pGhostTip.x} cy={pGhostTip.y} r={4} fill="var(--fg-muted)" opacity={0.55} />
                <text
                  x={labelOffset(pOrig, pGhostTip, ox, oy, 12).x}
                  y={labelOffset(pOrig, pGhostTip, ox, oy, 12).y}
                  fontSize={11}
                  fill="var(--fg-muted)"
                  textAnchor="middle"
                >
                  p
                </text>
              </>
            ) : null}

            <line
              x1={ox}
              y1={oy}
              x2={pTip.x}
              y2={pTip.y}
              stroke={COLOR_W}
              strokeWidth={2.6}
              markerEnd={`url(#${uid}-w)`}
            />
            <circle cx={pTip.x} cy={pTip.y} r={5.5} fill={COLOR_W} />
            <text
              x={labelOffset(pNow, pTip, ox, oy, 14).x}
              y={labelOffset(pNow, pTip, ox, oy, 14).y}
              fontSize={12}
              fontWeight={700}
              fill={COLOR_W}
              textAnchor="middle"
            >
              {phase === 'original' ? 'p' : phase === 'transformed' ? 'Ap' : 'A⁻¹(Ap)'}
            </text>
          </svg>
        ) : (
          <div className="space-y-3 rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
            <div className="flex flex-wrap items-start gap-4">
              <Mat2Editor m={A} name="A" readOnly labels={['col₁', 'col₂']} />
              {Ainv ? (
                <>
                  <span className="self-center text-[var(--fg-muted)]">y</span>
                  <Mat2Editor m={Ainv} name="A⁻¹" readOnly />
                </>
              ) : (
                <p className="self-center text-sm text-[var(--fg-muted)]">
                  A⁻¹ no existe (det = 0).
                </p>
              )}
            </div>
            {product ? (
              <div className="border-t border-[var(--border)] pt-2 text-xs leading-relaxed">
                <p className="mb-1 font-sans text-[var(--fg)]">Verificación: A⁻¹A ≈ I</p>
                <Mat2Editor m={product} name="A⁻¹A" readOnly />
                <p className="mt-1 text-[var(--fg-muted)]">
                  p = {formatPair(pOrig)} → Ap = {formatPair(pTrans)}
                  {phase === 'recovered' ? ` → A⁻¹(Ap) = ${formatPair(pOrig)}` : ''}
                </p>
              </div>
            ) : (
              <p className="border-t border-[var(--border)] pt-2 text-xs text-[var(--fg-muted)]">
                Sin inversa: al aplicar A, {formatPair(pOrig)} → {formatPair(pTrans)}. No hay
                camino de vuelta único.
              </p>
            )}
            <p className="text-xs text-[var(--fg-muted)]">
              det(A) = {present(det)} · rango = {rank}
            </p>
          </div>
        )}

        <ButtonRow>
          <VizButton onClick={applyA}>Aplicar A</VizButton>
          <button
            type="button"
            disabled={singular || phase !== 'transformed'}
            title={
              singular
                ? 'A es singular: no existe A⁻¹'
                : phase !== 'transformed'
                  ? 'Primero aplica A'
                  : 'Deshacer con A⁻¹'
            }
            onClick={undoInv}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
              !singular && phase === 'transformed'
                ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                : 'border-[var(--border)] bg-[var(--bg)] text-[var(--fg)] hover:bg-[var(--accent-soft)] disabled:hover:bg-[var(--bg)]'
            }`}
          >
            Deshacer con A⁻¹
          </button>
          <button
            type="button"
            disabled={singular}
            title={singular ? 'A es singular: no hay ida y vuelta' : 'Ver ida y vuelta'}
            onClick={roundTrip}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-sm font-medium text-[var(--fg)] transition hover:bg-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[var(--bg)]"
          >
            Ver ida y vuelta
          </button>
          <VizButton onClick={() => resetToOriginal()}>Reiniciar</VizButton>
        </ButtonRow>

        <ControlsStack>
          <ToggleRow
            label="Mostrar original"
            checked={showGhost}
            onChange={setShowGhost}
          />
          {animT < 1 - 1e-6 ? (
            <p className="text-xs text-[var(--fg-muted)]">Animando… t ≈ {fmt(animT)}</p>
          ) : null}
        </ControlsStack>

        {Ainv ? (
          <div className="flex flex-wrap items-start gap-4 rounded-lg border border-[var(--border)] px-3 py-2">
            <Mat2Editor m={A} name="A" readOnly />
            <span className="self-center font-mono text-[var(--fg-muted)]">↔</span>
            <Mat2Editor m={Ainv} name="A⁻¹" readOnly />
          </div>
        ) : null}

        <CollapsibleEdit
          label="Editar matriz A"
          open={editOpen}
          onToggle={() => setEditOpen((o) => !o)}
        >
          <Mat2Editor
            m={A}
            onChange={(m) => resetToOriginal(m)}
            labels={['col₁', 'col₂']}
          />
        </CollapsibleEdit>

        <p className="text-sm leading-relaxed text-[var(--fg)]">{footerMain}</p>
        <p className="text-xs text-[var(--fg-muted)]">
          {singular ? '✕ No invertible' : '✓ A invertible'}
          {phase === 'recovered' && !singular ? ' · A⁻¹(Ap)=p' : ''}
          {' · '}
          det = {fmt(det)} (secundario)
        </p>
      </div>
    </VizPanel>
  );
}
