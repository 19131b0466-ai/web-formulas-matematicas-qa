'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  VizPanel,
  joinCaption,
} from './controls';
import {
  analyzeEigen,
  formatNum,
  formatPair,
  matMul,
  reconstructPDP,
  type EigenAnalysis,
  type EigenPair,
  EIG_NEAR,
  I2,
} from './eigenHelpers';
import { add, applyMat, normalize, norm, scale, type Mat2, type Vec2 } from './math2d';
import { present } from './matrixGrid';
import {
  Badge,
  Chip,
  ChipRow,
  CollapsibleEdit,
  GuideBlock,
  Mat2Editor,
  Segmented,
  cloneMat2,
  matEq,
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
const S = 38;
const CLAMP = 3.4;
const LINE_EXT = 4.4;

type Mode = 'eigen' | 'basis' | 'diag';
type Tab = 'geo' | 'alg';

const PRESET_DIAG: Mat2 = [
  [2, 0],
  [0, 0.5],
];
const PRESET_OBLIQUE: Mat2 = [
  [2, 1],
  [0, 1],
];
const PRESET_SYM: Mat2 = [
  [2, 1],
  [1, 2],
];
const PRESET_SING: Mat2 = [
  [2, 0],
  [0, 0],
];
const PRESET_JORDAN: Mat2 = [
  [1, 1],
  [0, 1],
];
const PRESET_ID: Mat2 = I2();

const PRESETS: Array<{ id: string; label: string; m: Mat2 }> = [
  { id: 'diag', label: 'Diagonal', m: PRESET_DIAG },
  { id: 'obl', label: 'Base oblicua', m: PRESET_OBLIQUE },
  { id: 'sym', label: 'Simétrica', m: PRESET_SYM },
  { id: 'sing', label: 'Singular', m: PRESET_SING },
  { id: 'jordan', label: 'No diagonalizable', m: PRESET_JORDAN },
  { id: 'id', label: 'Identidad', m: PRESET_ID },
];

function near(a: Vec2, b: Vec2, eps = EIG_NEAR): boolean {
  return Math.hypot(a.x - b.x, a.y - b.y) < eps;
}

function MatCard({
  name,
  m,
  accent,
}: {
  name: string;
  m: Mat2;
  accent?: boolean;
}) {
  const cell = (n: number) => present(Number(n.toFixed(3)));
  return (
    <div
      className={`inline-flex flex-col items-center gap-1 rounded-lg border px-2.5 py-2 ${
        accent
          ? 'border-orange-500/40 bg-orange-500/10'
          : 'border-[var(--border)] bg-[var(--bg)]'
      }`}
    >
      <div className="font-mono text-xs font-semibold text-[var(--fg-muted)]">{name}</div>
      <div className="relative px-2 py-0.5">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1.5 rounded-l border-y border-l border-[var(--fg-muted)] opacity-55"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-1.5 rounded-r border-y border-r border-[var(--fg-muted)] opacity-55"
        />
        <div className="grid grid-cols-2 gap-1.5 font-mono text-xs tabular-nums">
          <span className="min-w-[2.4rem] text-center">{cell(m[0][0])}</span>
          <span className="min-w-[2.4rem] text-center">{cell(m[0][1])}</span>
          <span className="min-w-[2.4rem] text-center">{cell(m[1][0])}</span>
          <span className="min-w-[2.4rem] text-center">{cell(m[1][1])}</span>
        </div>
      </div>
    </div>
  );
}

function SpanLine({
  v,
  color,
  width = 8,
  opacity = 0.22,
}: {
  v: Vec2;
  color: string;
  width?: number;
  opacity?: number;
}) {
  if (norm(v) < 1e-9) return null;
  const n = normalize(v);
  const a = { x: ox + n.x * -LINE_EXT * S, y: oy - n.y * -LINE_EXT * S };
  const b = { x: ox + n.x * LINE_EXT * S, y: oy - n.y * LINE_EXT * S };
  return (
    <line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke={color}
      strokeWidth={width}
      opacity={opacity}
      strokeLinecap="round"
    />
  );
}

function Arrow({
  tip,
  color,
  markerId,
  width = 2.4,
  dashed,
}: {
  tip: Vec2;
  color: string;
  markerId: string;
  width?: number;
  dashed?: boolean;
}) {
  if (norm(tip) < 1e-9) return null;
  const p = { x: ox + tip.x * S, y: oy - tip.y * S };
  return (
    <line
      x1={ox}
      y1={oy}
      x2={p.x}
      y2={p.y}
      stroke={color}
      strokeWidth={width}
      strokeDasharray={dashed ? '5 4' : undefined}
      markerEnd={`url(#${markerId})`}
    />
  );
}

function statusCard(analysis: EigenAnalysis) {
  if (analysis.status === 'not_diagonalizable') {
    return (
      <div className="rounded-xl border-2 border-rose-500/50 bg-rose-500/10 px-4 py-3 text-center">
        <p className="text-sm font-bold tracking-wide text-rose-800 dark:text-rose-200">
          NO DIAGONALIZABLE
        </p>
        <p className="mt-1 text-xs text-[var(--fg-muted)]">
          Autovalor repetido con autoespacio 1D (p. ej. Jordan [[1,1],[0,1]]). No existe P invertible
          con P⁻¹AP = D.
        </p>
      </div>
    );
  }
  if (analysis.status === 'complex') {
    return (
      <div className="rounded-xl border-2 border-amber-500/50 bg-amber-500/10 px-4 py-3 text-center">
        <p className="text-sm font-bold tracking-wide text-amber-900 dark:text-amber-200">
          NO DIAGONALIZABLE SOBRE ℝ
        </p>
        <p className="mt-1 text-xs text-[var(--fg-muted)]">
          Autovalores complejos: no hay base real de autovectores.
        </p>
      </div>
    );
  }
  if (analysis.status === 'degenerate') {
    return (
      <div className="rounded-xl border border-orange-500/40 bg-orange-500/10 px-4 py-3 text-center">
        <p className="text-sm font-semibold" style={{ color: 'orange' }}>
          A = λI — cualquier base sirve
        </p>
        <p className="mt-1 text-xs text-[var(--fg-muted)]">
          En particular, cualquier base ortonormal: A solo escala por λ en todas las direcciones.
        </p>
      </div>
    );
  }
  return null;
}

/**
 * Diagonalización A = PDP⁻¹ (ALG-EIG-004). P puede ser oblicua — usar P⁻¹, no Pᵀ.
 */
export function DiagonalizationViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [A, setA] = useState<Mat2>(() => cloneMat2(PRESET_OBLIQUE));
  const [x, setX] = useState<Vec2>({ x: 1.6, y: 1.1 });
  const [mode, setMode] = useState<Mode>('eigen');
  const [tab, setTab] = useState<Tab>('geo');
  const [editOpen, setEditOpen] = useState(false);
  const prevPairsRef = useRef<EigenPair[] | null>(null);

  const analysis = useMemo(() => analyzeEigen(A, prevPairsRef.current), [A]);

  useEffect(() => {
    if (analysis.pairs.length > 0) prevPairsRef.current = analysis.pairs;
  }, [analysis.pairs]);

  const canDiag =
    (analysis.status === 'diagonalizable' || analysis.status === 'degenerate') &&
    analysis.P &&
    analysis.Pinv &&
    analysis.D;

  const P = canDiag ? analysis.P! : null;
  const Pinv = canDiag ? analysis.Pinv! : null;
  const D = canDiag ? analysis.D! : null;
  const v1 = analysis.pairs[0]?.v ?? null;
  const v2 = analysis.pairs[1]?.v ?? null;
  const l1 = analysis.pairs[0]?.lambda;
  const l2 = analysis.pairs[1]?.lambda;

  const c = Pinv ? applyMat(Pinv, x) : null;
  const Dc = D && c ? applyMat(D, c) : null;
  const PDc = P && Dc ? applyMat(P, Dc) : null;
  const Ax = applyMat(A, x);
  const match = PDc ? near(PDc, Ax) : false;

  const AP = P ? matMul(A, P) : null;
  const PD = P && D ? matMul(P, D) : null;
  const PinvAP = Pinv ? matMul(Pinv, matMul(A, P!)) : null;
  const recon = P && D && Pinv ? reconstructPDP(P, D, Pinv) : null;

  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });
  const dragX = useVecDrag((p) => setX(clampVec(p, CLAMP)), S, { x: ox, y: oy });

  const setPreset = (m: Mat2) => {
    prevPairsRef.current = null;
    setA(cloneMat2(m));
    if (matEq(m, PRESET_JORDAN)) setX({ x: 1.4, y: 0.8 });
    else if (matEq(m, PRESET_SING)) setX({ x: 1.2, y: 1.5 });
    else if (matEq(m, PRESET_ID)) setX({ x: 1.5, y: 1 });
    else setX({ x: 1.6, y: 1.1 });
  };

  const footer = canDiag
    ? joinCaption('Diagonalizable ✓', 'P⁻¹AP = D ✓')
    : analysis.status === 'complex'
      ? 'No diagonalizable sobre ℝ'
      : 'No diagonalizable';

  const px = to(x);
  const pAx = to(Ax);
  const c1v1 = v1 && c ? scale(v1, c.x) : null;
  const c2v2 = v2 && c ? scale(v2, c.y) : null;
  const para = c1v1 && c2v2 ? add(c1v1, c2v2) : null;

  return (
    <VizPanel title="Diagonalización A = PDP⁻¹" caption={footer}>
      <div className="space-y-3">
        <GuideBlock
          idea="Buscamos una base de autovectores donde A solo escala: en esas coordenadas, A se ve diagonal D."
          tryIt="Prueba «Base oblicua»: P no es ortogonal — las coordenadas usan P⁻¹x, no productos escalares."
          concept="A = PDP⁻¹  ⇔  P⁻¹AP = D. Si P no es ortogonal, P⁻¹ ≠ Pᵀ."
        />

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={[
              { id: 'eigen', label: 'Autovectores' },
              { id: 'basis', label: 'Cambio de base' },
              { id: 'diag', label: 'Diagonal' },
            ]}
            value={mode}
            onChange={(id) => setMode(id as Mode)}
          />
          <Segmented
            options={[
              { id: 'geo', label: 'Geométrica' },
              { id: 'alg', label: 'Algebraica' },
            ]}
            value={tab}
            onChange={(id) => setTab(id as Tab)}
          />
        </div>

        <ChipRow>
          {PRESETS.map((p) => (
            <Chip key={p.id} active={matEq(A, p.m)} onClick={() => setPreset(p.m)}>
              {p.label}
            </Chip>
          ))}
        </ChipRow>

        {statusCard(analysis)}

        {canDiag ? (
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="ok">Diagonalizable</Badge>
            {analysis.status === 'degenerate' ? (
              <Badge tone="warn">Degenerada (λI)</Badge>
            ) : null}
            {v1 && l1 !== undefined ? (
              <Badge tone="neutral">
                λ₁ = {formatNum(l1)} · v₁ = {formatPair(v1)}
              </Badge>
            ) : null}
            {v2 && l2 !== undefined ? (
              <Badge tone="neutral">
                λ₂ = {formatNum(l2)} · v₂ = {formatPair(v2)}
              </Badge>
            ) : null}
          </div>
        ) : null}

        {tab === 'geo' ? (
          <div className="space-y-2">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-auto w-full touch-none rounded-xl border border-[var(--border)]"
              role="img"
              aria-label="Diagonalización geométrica"
              onPointerMove={dragX.onPointerMove}
              onPointerUp={dragX.onPointerUp}
            >
              <defs>
                <ArrowMarker id={`${uid}-u`} color={COLOR_U} />
                <ArrowMarker id={`${uid}-v`} color={COLOR_V} />
                <ArrowMarker id={`${uid}-w`} color={COLOR_W} />
                <ArrowMarker id={`${uid}-fg`} color="var(--fg)" />
              </defs>
              <Axes W={W} H={H} ox={ox} oy={oy} S={S} />

              {/* Eigen lines — full span, not forced orthogonal */}
              {(mode === 'eigen' || mode === 'basis' || mode === 'diag') && v1 ? (
                <SpanLine v={v1} color={COLOR_U} />
              ) : null}
              {(mode === 'eigen' || mode === 'basis' || mode === 'diag') && v2 ? (
                <SpanLine v={v2} color={COLOR_V} />
              ) : null}

              {mode === 'eigen' && v1 && l1 !== undefined ? (
                <>
                  <Arrow tip={scale(v1, 1.6)} color={COLOR_U} markerId={`${uid}-u`} />
                  <Arrow tip={scale(v1, 1.6 * l1)} color={COLOR_W} markerId={`${uid}-w`} width={2} dashed />
                  <text
                    x={labelOffset(scale(v1, 1.6), to(scale(v1, 1.6)), ox, oy, 12).x}
                    y={labelOffset(scale(v1, 1.6), to(scale(v1, 1.6)), ox, oy, 12).y}
                    fontSize={11}
                    fontWeight={700}
                    fill={COLOR_U}
                    textAnchor="middle"
                  >
                    v₁
                  </text>
                  {Math.abs(l1) > 1e-8 ? (
                    <text
                      x={labelOffset(scale(v1, 1.6 * l1), to(scale(v1, 1.6 * l1)), ox, oy, 12).x}
                      y={labelOffset(scale(v1, 1.6 * l1), to(scale(v1, 1.6 * l1)), ox, oy, 12).y}
                      fontSize={10}
                      fill={COLOR_W}
                      textAnchor="middle"
                    >
                      Av₁=λ₁v₁
                    </text>
                  ) : null}
                </>
              ) : null}

              {mode === 'eigen' && v2 && l2 !== undefined ? (
                <>
                  <Arrow tip={scale(v2, 1.6)} color={COLOR_V} markerId={`${uid}-v`} />
                  <Arrow tip={scale(v2, 1.6 * l2)} color={COLOR_W} markerId={`${uid}-w`} width={2} dashed />
                  <text
                    x={labelOffset(scale(v2, 1.6), to(scale(v2, 1.6)), ox, oy, 12).x}
                    y={labelOffset(scale(v2, 1.6), to(scale(v2, 1.6)), ox, oy, 12).y}
                    fontSize={11}
                    fontWeight={700}
                    fill={COLOR_V}
                    textAnchor="middle"
                  >
                    v₂
                  </text>
                  {Math.abs(l2) > 1e-8 ? (
                    <text
                      x={labelOffset(scale(v2, 1.6 * l2), to(scale(v2, 1.6 * l2)), ox, oy, 12).x}
                      y={labelOffset(scale(v2, 1.6 * l2), to(scale(v2, 1.6 * l2)), ox, oy, 12).y}
                      fontSize={10}
                      fill={COLOR_W}
                      textAnchor="middle"
                    >
                      Av₂=λ₂v₂
                    </text>
                  ) : null}
                </>
              ) : null}

              {/* Cambio de base: parallelogram with oblique OK */}
              {(mode === 'basis' || mode === 'diag') && canDiag && c1v1 && c2v2 && para ? (
                <>
                  <polygon
                    points={`${ox},${oy} ${to(c1v1).x},${to(c1v1).y} ${to(para).x},${to(para).y} ${to(c2v2).x},${to(c2v2).y}`}
                    fill="orange"
                    opacity={0.12}
                  />
                  <Arrow tip={c1v1} color={COLOR_U} markerId={`${uid}-u`} width={2} />
                  <Arrow tip={c2v2} color={COLOR_V} markerId={`${uid}-v`} width={2} />
                  <line
                    x1={to(c1v1).x}
                    y1={to(c1v1).y}
                    x2={to(para).x}
                    y2={to(para).y}
                    stroke={COLOR_V}
                    strokeWidth={1.4}
                    strokeDasharray="4 3"
                    opacity={0.7}
                  />
                  <line
                    x1={to(c2v2).x}
                    y1={to(c2v2).y}
                    x2={to(para).x}
                    y2={to(para).y}
                    stroke={COLOR_U}
                    strokeWidth={1.4}
                    strokeDasharray="4 3"
                    opacity={0.7}
                  />
                </>
              ) : null}

              {/* Diagonal action: show Ax via P Dc */}
              {(mode === 'basis' || mode === 'diag') && (
                <>
                  <Arrow tip={x} color="var(--fg)" markerId={`${uid}-fg`} width={2.2} />
                  <Arrow tip={Ax} color={COLOR_W} markerId={`${uid}-w`} width={2.6} />
                  <circle cx={px.x} cy={px.y} r={5} fill="var(--fg)" />
                  <text
                    x={labelOffset(x, px, ox, oy, 14).x}
                    y={labelOffset(x, px, ox, oy, 14).y}
                    fontSize={12}
                    fontWeight={700}
                    fill="var(--fg)"
                    textAnchor="middle"
                  >
                    x
                  </text>
                  <circle cx={pAx.x} cy={pAx.y} r={5.5} fill={COLOR_W} />
                  <text
                    x={labelOffset(Ax, pAx, ox, oy, 14).x}
                    y={labelOffset(Ax, pAx, ox, oy, 14).y}
                    fontSize={12}
                    fontWeight={700}
                    fill={COLOR_W}
                    textAnchor="middle"
                  >
                    Ax
                  </text>
                  <circle
                    cx={px.x}
                    cy={px.y}
                    r={12}
                    fill="transparent"
                    stroke={COLOR_W}
                    strokeWidth={1}
                    strokeOpacity={0.4}
                    style={{ cursor: 'grab' }}
                    {...dragX}
                  />
                </>
              )}

              {mode === 'eigen' && analysis.status === 'not_diagonalizable' && v1 ? (
                <>
                  <SpanLine v={v1} color={COLOR_U} width={10} opacity={0.28} />
                  <Arrow tip={scale(v1, 1.8)} color={COLOR_U} markerId={`${uid}-u`} />
                  <text x={ox} y={H - 16} textAnchor="middle" fontSize={11} fill="var(--fg-muted)">
                    Solo un autoespacio 1D — falta un segundo autovector independiente
                  </text>
                </>
              ) : null}
            </svg>

            {canDiag && c ? (
              <div className="flex flex-wrap gap-x-3 gap-y-1 rounded-lg border border-[var(--border)] px-3 py-2 font-mono text-xs sm:text-sm">
                <span style={{ color: 'orange' }}>
                  c = P⁻¹x = ({formatNum(c.x)}, {formatNum(c.y)})
                </span>
                <span className="text-[var(--fg-muted)]">·</span>
                <span>
                  x = {formatNum(c.x)} v₁ + {formatNum(c.y)} v₂
                </span>
                {Dc ? (
                  <>
                    <span className="text-[var(--fg-muted)]">·</span>
                    <span>
                      Dc = ({formatNum(Dc.x)}, {formatNum(Dc.y)})
                    </span>
                  </>
                ) : null}
                {PDc ? (
                  <>
                    <span className="text-[var(--fg-muted)]">·</span>
                    <span style={{ color: COLOR_W }}>
                      P(Dc) = {formatPair(PDc)}
                      {match ? ' = Ax ✓' : ''}
                    </span>
                  </>
                ) : null}
              </div>
            ) : null}

            {canDiag && P && D && Pinv ? (
              <div className="flex flex-wrap items-end gap-3">
                <MatCard name="P" m={P} accent />
                <MatCard name="D" m={D} accent />
                <MatCard name="P⁻¹" m={Pinv} />
                {AP && PD ? (
                  <Badge tone={matEq(AP, PD, 1e-4) ? 'ok' : 'neutral'}>
                    AP = PD {matEq(AP, PD, 1e-4) ? '✓' : ''}
                  </Badge>
                ) : null}
                {PinvAP && D ? (
                  <Badge tone={matEq(PinvAP, D, 1e-4) ? 'ok' : 'neutral'}>
                    P⁻¹AP = D {matEq(PinvAP, D, 1e-4) ? '✓' : ''}
                  </Badge>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3 rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
            {canDiag && P && D && Pinv ? (
              <>
                <p className="text-xs text-[var(--fg-muted)]">A = PDP⁻¹ · columnas de P = autovectores</p>
                <div className="flex flex-wrap items-end gap-3">
                  <MatCard name="P" m={P} accent />
                  <MatCard name="D" m={D} accent />
                  <MatCard name="P⁻¹" m={Pinv} />
                  {recon ? <MatCard name="PDP⁻¹" m={recon} /> : null}
                </div>
                <div className="border-t border-[var(--border)] pt-2 space-y-1 text-xs">
                  {AP && PD ? (
                    <p>
                      AP = PD{' '}
                      {matEq(AP, PD, 1e-4) ? (
                        <span className="font-semibold" style={{ color: 'orange' }}>
                          ✓
                        </span>
                      ) : (
                        '…'
                      )}
                    </p>
                  ) : null}
                  {PinvAP && D ? (
                    <p>
                      P⁻¹AP = D{' '}
                      {matEq(PinvAP, D, 1e-4) ? (
                        <span className="font-semibold" style={{ color: 'orange' }}>
                          ✓
                        </span>
                      ) : (
                        '…'
                      )}
                    </p>
                  ) : null}
                  <p className="text-[var(--fg-muted)]">
                    P no tiene por qué ser ortogonal: usamos P⁻¹, no Pᵀ.
                  </p>
                </div>
              </>
            ) : analysis.status === 'not_diagonalizable' ? (
              <p>
                No existe base de autovectores: geoMult &lt; algMult. Ejemplo canónico: Jordan{' '}
                <span style={{ color: 'orange' }}>[[1,1],[0,1]]</span>.
              </p>
            ) : analysis.status === 'complex' ? (
              <p>Polinomio característico sin raíces reales → no hay diagonalización real.</p>
            ) : (
              <p>Edita A o elige un preset diagonalizable.</p>
            )}
          </div>
        )}

        {canDiag && mode === 'diag' && D ? (
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--fg-muted)]">
            <span>
              En la base propia, A actúa como D = diag({formatNum(D[0][0])}, {formatNum(D[1][1])}).
            </span>
          </div>
        ) : null}

        <ControlsStack>
          <ButtonRow>
            {canDiag && v1 ? (
              <button
                type="button"
                className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-sm hover:bg-[var(--accent-soft)]"
                onClick={() => setX(clampVec(scale(normalize(v1), 2), CLAMP))}
              >
                x ∥ v₁
              </button>
            ) : null}
            {canDiag && v2 ? (
              <button
                type="button"
                className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-sm hover:bg-[var(--accent-soft)]"
                onClick={() => setX(clampVec(scale(normalize(v2), 2), CLAMP))}
              >
                x ∥ v₂
              </button>
            ) : null}
          </ButtonRow>
          {canDiag && c ? (
            <p className="text-xs text-[var(--fg-muted)]">
              x = {formatPair(x)} · c = P⁻¹x = ({formatNum(c.x)}, {formatNum(c.y)}) · Ax ={' '}
              {formatPair(Ax)}
            </p>
          ) : null}
        </ControlsStack>

        <CollapsibleEdit
          label="Editar matriz A"
          open={editOpen}
          onToggle={() => setEditOpen((o) => !o)}
        >
          <Mat2Editor
            m={A}
            onChange={(m) => {
              prevPairsRef.current = null;
              setA(m);
            }}
            labels={['col₁', 'col₂']}
          />
        </CollapsibleEdit>
      </div>
    </VizPanel>
  );
}
