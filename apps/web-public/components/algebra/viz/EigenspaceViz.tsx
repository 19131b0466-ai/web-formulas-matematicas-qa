'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  ToggleRow,
  VizPanel,
  joinCaption,
} from './controls';
import {
  AminusLambdaI,
  analyzeEigen,
  formatNum,
  formatPair,
  nullspace2,
  scalarMat,
  type EigenPair,
  EIG_EPS,
  EIG_NEAR,
  I2,
} from './eigenHelpers';
import { applyMat, normalize, norm, scale, sub, type Mat2, type Vec2 } from './math2d';
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

type Mode = 'geo' | 'ker' | 'alg';

const PRESET_TWO: Mat2 = [
  [2, 1],
  [0, 1],
];
const PRESET_NEG: Mat2 = [
  [2, 0],
  [0, -1],
];
const PRESET_ZERO_EIG: Mat2 = [
  [2, 0],
  [0, 0],
];
const PRESET_ALL: Mat2 = [
  [2, 0],
  [0, 2],
];
const PRESET_JORDAN: Mat2 = [
  [1, 1],
  [0, 1],
];
const PRESET_ID = I2();

const PRESETS: Array<{ id: string; label: string; m: Mat2 }> = [
  { id: 'two', label: 'Dos autoespacios', m: PRESET_TWO },
  { id: 'neg', label: 'λ negativo', m: PRESET_NEG },
  { id: 'zero', label: 'λ = 0', m: PRESET_ZERO_EIG },
  { id: 'all', label: 'Todo ℝ² (2I)', m: PRESET_ALL },
  { id: 'jordan', label: 'Autovalor repetido Jordan', m: PRESET_JORDAN },
  { id: 'id', label: 'Identidad', m: PRESET_ID },
];

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

function distinctRealLambdas(pairs: EigenPair[]): number[] {
  const out: number[] = [];
  for (const p of pairs) {
    if (!out.some((l) => Math.abs(l - p.lambda) < EIG_NEAR)) out.push(p.lambda);
  }
  return out;
}

function projectToEigenspace(v: Vec2, basis: Vec2[]): Vec2 {
  if (basis.length === 0) return { x: 0, y: 0 };
  if (basis.length >= 2) return clampVec(v, CLAMP);
  const b = normalize(basis[0]!);
  if (norm(b) < EIG_EPS) return { x: 0, y: 0 };
  const t = v.x * b.x + v.y * b.y;
  // If projection collapses near origin while dragging, keep a small step on the line
  if (Math.abs(t) < EIG_EPS && norm(v) > EIG_EPS) {
    return clampVec(scale(b, 1.5), CLAMP);
  }
  return clampVec(scale(b, t), CLAMP);
}

/**
 * Autoespacio E_λ = ker(A − λI) (ALG-EIG-003).
 */
export function EigenspaceViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [A, setA] = useState<Mat2>(() => cloneMat2(PRESET_TWO));
  const [v, setV] = useState<Vec2>({ x: 1.5, y: 0 });
  const [mode, setMode] = useState<Mode>('geo');
  const [editOpen, setEditOpen] = useState(false);
  const [freeTest, setFreeTest] = useState(false);
  const [lambda, setLambda] = useState(2);
  const prevPairsRef = useRef<EigenPair[] | null>(null);

  const analysis = useMemo(() => analyzeEigen(A, prevPairsRef.current), [A]);
  useEffect(() => {
    if (analysis.pairs.length > 0) prevPairsRef.current = analysis.pairs;
  }, [analysis.pairs]);

  const realLams = useMemo(() => {
    if (analysis.status === 'complex') return [] as number[];
    const fromPairs = distinctRealLambdas(analysis.pairs);
    if (fromPairs.length > 0) return fromPairs;
    // Defective / repeated: still have at least one λ
    if (analysis.pairs[0]) return [analysis.pairs[0].lambda];
    return [] as number[];
  }, [analysis]);

  // Keep selected λ in sync with matrix
  useEffect(() => {
    if (realLams.length === 0) return;
    if (!realLams.some((l) => Math.abs(l - lambda) < EIG_NEAR)) {
      setLambda(realLams[0]!);
    }
  }, [realLams, lambda]);

  const Ami = useMemo(() => AminusLambdaI(A, lambda), [A, lambda]);
  const basis = useMemo(() => nullspace2(Ami), [Ami]);
  const dim = basis.length as 0 | 1 | 2;
  const isEigenvalue = realLams.some((l) => Math.abs(l - lambda) < EIG_NEAR);

  const Av = applyMat(A, v);
  const lamV = scale(v, lambda);
  const onSpace =
    dim === 2
      ? norm(v) >= 0
      : dim === 1 && basis[0]
        ? (() => {
            const b = normalize(basis[0]!);
            const cross = Math.abs(v.x * b.y - v.y * b.x);
            return cross < EIG_NEAR * (1 + norm(v));
          })()
        : dim === 0
          ? nearZero(v)
          : false;

  const isEigenvec = onSpace && norm(v) > EIG_EPS;
  const residual = norm(sub(Av, lamV));
  const avEquals =
    isEigenvec && residual <= EIG_NEAR * (1 + Math.abs(lambda)) * (1 + norm(v));

  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });

  const dragV = useVecDrag((p) => {
    const raw = clampVec(p, CLAMP);
    if (freeTest) {
      setV(raw);
      return;
    }
    setV(projectToEigenspace(raw, basis));
  }, S, { x: ox, y: oy });

  const setPreset = (m: Mat2) => {
    prevPairsRef.current = null;
    setA(cloneMat2(m));
    setFreeTest(false);
    if (matEq(m, PRESET_NEG)) {
      setLambda(-1);
      setV({ x: 0, y: 1.8 });
    } else if (matEq(m, PRESET_ZERO_EIG)) {
      setLambda(0);
      setV({ x: 0, y: 1.6 });
    } else if (matEq(m, PRESET_ALL) || matEq(m, PRESET_ID)) {
      setLambda(matEq(m, PRESET_ID) ? 1 : 2);
      setV({ x: 1.2, y: 0.9 });
    } else if (matEq(m, PRESET_JORDAN)) {
      setLambda(1);
      setV({ x: 1.8, y: 0 });
    } else {
      setLambda(2);
      setV({ x: 1.5, y: 0 });
    }
  };

  const spanText =
    dim === 0
      ? '{0}'
      : dim === 1 && basis[0]
        ? `span{${formatPair(basis[0])}}`
        : 'ℝ²';

  const footer = joinCaption(
    `E_λ = ker(A−λI) = ${spanText}`,
    `dim = ${dim}`,
    Math.abs(lambda) < EIG_EPS ? 'λ=0 ⇒ ker(A)' : null,
  );

  const eqRows = [
    `${present(Ami[0][0])} v₁ + ${present(Ami[0][1])} v₂ = 0`,
    `${present(Ami[1][0])} v₁ + ${present(Ami[1][1])} v₂ = 0`,
  ];

  const pv = to(v);
  const pAv = to(Av);

  return (
    <VizPanel title="Autoespacio E_λ = ker(A−λI)" caption={footer}>
      <div className="space-y-3">
        <GuideBlock
          idea="E_λ reúne los vectores que A solo escala por λ: quedan en la misma dirección propia (o van a 0 si λ=0)."
          tryIt="Elige λ en los chips y arrastra v sobre la recta/plano. Activa «prueba libre» para salir del autoespacio."
          concept="0 ∈ E_λ siempre, pero 0 no es autovector. Autovectores: v ≠ 0 en E_λ."
        />

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={[
              { id: 'geo', label: 'Geométrico' },
              { id: 'ker', label: 'Núcleo' },
              { id: 'alg', label: 'Álgebra' },
            ]}
            value={mode}
            onChange={(id) => setMode(id as Mode)}
          />
        </div>

        <ChipRow>
          {PRESETS.map((p) => (
            <Chip key={p.id} active={matEq(A, p.m)} onClick={() => setPreset(p.m)}>
              {p.label}
            </Chip>
          ))}
        </ChipRow>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--fg-muted)]">Autovalor λ:</span>
          {realLams.length > 0 ? (
            realLams.map((l) => (
              <Chip
                key={l}
                active={Math.abs(l - lambda) < EIG_NEAR}
                onClick={() => {
                  setLambda(l);
                  if (!freeTest) {
                    const ns = nullspace2(AminusLambdaI(A, l));
                    setV((prev) => projectToEigenspace(prev, ns));
                  }
                }}
              >
                λ = {formatNum(l)}
              </Chip>
            ))
          ) : (
            <Badge tone="warn">Sin autovalores reales</Badge>
          )}
          <Badge tone={dim === 0 ? 'bad' : dim === 2 ? 'ok' : 'warn'}>dim(E_λ) = {dim}</Badge>
          {!isEigenvalue && analysis.status !== 'complex' ? (
            <Badge tone="neutral">λ libre → solo origen</Badge>
          ) : null}
        </div>

        {mode === 'geo' ? (
          <div className="space-y-2">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-auto w-full touch-none rounded-xl border border-[var(--border)]"
              role="img"
              aria-label="Autoespacio geométrico"
              onPointerMove={dragV.onPointerMove}
              onPointerUp={dragV.onPointerUp}
            >
              <defs>
                <ArrowMarker id={`${uid}-u`} color={COLOR_U} />
                <ArrowMarker id={`${uid}-w`} color={COLOR_W} />
                <ArrowMarker id={`${uid}-fg`} color="var(--fg)" />
              </defs>
              <Axes W={W} H={H} ox={ox} oy={oy} S={S} />

              {dim >= 2 ? (
                <rect
                  x={24}
                  y={20}
                  width={W - 48}
                  height={H - 40}
                  fill={COLOR_W}
                  opacity={0.14}
                  rx={8}
                />
              ) : null}

              {dim === 1 && basis[0] ? (
                (() => {
                  const nrm = normalize(basis[0]!);
                  const a = to(scale(nrm, -LINE_EXT));
                  const b = to(scale(nrm, LINE_EXT));
                  return (
                    <>
                      <line
                        x1={a.x}
                        y1={a.y}
                        x2={b.x}
                        y2={b.y}
                        stroke={COLOR_W}
                        strokeWidth={10}
                        opacity={0.22}
                        strokeLinecap="round"
                      />
                      <line
                        x1={a.x}
                        y1={a.y}
                        x2={b.x}
                        y2={b.y}
                        stroke={COLOR_W}
                        strokeWidth={2.4}
                        opacity={0.95}
                      />
                    </>
                  );
                })()
              ) : null}

              {dim === 0 ? (
                <circle cx={ox} cy={oy} r={8} fill={COLOR_W} opacity={0.85} />
              ) : null}

              {/* Basis arrows */}
              {basis.map((b, i) => {
                if (nearZero(b)) return null;
                const tip = scale(normalize(b), 1.7);
                const p = to(tip);
                return (
                  <g key={i}>
                    <line
                      x1={ox}
                      y1={oy}
                      x2={p.x}
                      y2={p.y}
                      stroke={COLOR_U}
                      strokeWidth={2.2}
                      markerEnd={`url(#${uid}-u)`}
                    />
                    <text
                      x={labelOffset(tip, p, ox, oy, 14).x}
                      y={labelOffset(tip, p, ox, oy, 14).y}
                      fontSize={11}
                      fontWeight={700}
                      fill={COLOR_U}
                      textAnchor="middle"
                    >
                      {basis.length > 1 ? `b${i + 1}` : 'base'}
                    </text>
                  </g>
                );
              })}

              {/* v and Av */}
              {norm(v) > EIG_EPS ? (
                <line
                  x1={ox}
                  y1={oy}
                  x2={pv.x}
                  y2={pv.y}
                  stroke={onSpace ? COLOR_W : 'var(--fg)'}
                  strokeWidth={2.6}
                  markerEnd={`url(#${uid}-${onSpace ? 'w' : 'fg'})`}
                />
              ) : null}
              <circle cx={pv.x} cy={pv.y} r={5.5} fill={onSpace ? COLOR_W : 'var(--fg)'} />
              <text
                x={labelOffset(v, pv, ox, oy, 14).x}
                y={labelOffset(v, pv, ox, oy, 14).y}
                fontSize={12}
                fontWeight={700}
                fill={onSpace ? COLOR_W : 'var(--fg)'}
                textAnchor="middle"
              >
                v
              </text>

              {norm(Av) > EIG_EPS ? (
                <line
                  x1={ox}
                  y1={oy}
                  x2={pAv.x}
                  y2={pAv.y}
                  stroke={COLOR_U}
                  strokeWidth={2.2}
                  strokeDasharray={avEquals ? undefined : '5 4'}
                  markerEnd={`url(#${uid}-u)`}
                  opacity={0.9}
                />
              ) : (
                <circle cx={ox} cy={oy} r={6} fill={COLOR_U} opacity={0.35} />
              )}
              {norm(Av) > EIG_EPS ? (
                <>
                  <circle cx={pAv.x} cy={pAv.y} r={4.5} fill={COLOR_U} />
                  <text
                    x={labelOffset(Av, pAv, ox, oy, 14).x}
                    y={labelOffset(Av, pAv, ox, oy, 14).y}
                    fontSize={11}
                    fontWeight={700}
                    fill={COLOR_U}
                    textAnchor="middle"
                  >
                    Av
                  </text>
                </>
              ) : null}

              <circle
                cx={pv.x}
                cy={pv.y}
                r={12}
                fill="transparent"
                stroke={COLOR_W}
                strokeWidth={1}
                strokeOpacity={0.4}
                style={{ cursor: 'grab' }}
                {...dragV}
              />

              {avEquals ? (
                <text x={ox} y={H - 16} textAnchor="middle" fontSize={12} fontWeight={700} fill={COLOR_W}>
                  Av = λv ✓
                </text>
              ) : onSpace && nearZero(v) ? (
                <text x={ox} y={H - 16} textAnchor="middle" fontSize={11} fill="var(--fg-muted)">
                  0 ∈ E_λ, pero 0 no es autovector
                </text>
              ) : freeTest && !onSpace ? (
                <text x={ox} y={H - 16} textAnchor="middle" fontSize={11} fill="var(--fg-muted)">
                  v ∉ E_λ — Av no es múltiplo de v por λ
                </text>
              ) : null}
            </svg>

            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={onSpace ? 'ok' : 'neutral'}>
                {onSpace ? 'v ∈ E_λ' : 'v ∉ E_λ'}
              </Badge>
              {isEigenvec && avEquals ? (
                <Badge tone="ok">Av = λv ✓</Badge>
              ) : null}
              {nearZero(v) ? (
                <Badge tone="warn">0 ∈ E_λ pero no es autovector</Badge>
              ) : null}
              {Math.abs(lambda) < EIG_EPS ? (
                <Badge tone="neutral">λ=0 → E₀ = ker(A)</Badge>
              ) : null}
              {dim === 2 ? (
                <Badge tone="ok">A = λI → E_λ = ℝ²</Badge>
              ) : null}
            </div>
          </div>
        ) : null}

        {mode === 'ker' ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-end gap-3">
              <MatCard name="A" m={A} />
              <MatCard name="λI" m={scalarMat(lambda)} />
              <MatCard name="A−λI" m={Ami} accent />
            </div>
            <div className="rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
              <p className="text-xs text-[var(--fg-muted)]">Resolver (A−λI)v = 0</p>
              {eqRows.map((eq) => (
                <p key={eq}>{eq}</p>
              ))}
              <p className="mt-2 font-semibold" style={{ color: 'orange' }}>
                ker(A−λI) = {spanText} · dim = {dim}
              </p>
              {basis.map((b, i) => (
                <p key={i} className="mt-1 text-xs text-[var(--fg-muted)]">
                  Base{basis.length > 1 ? ` ${i + 1}` : ''}: {formatPair(b)}
                </p>
              ))}
              {dim === 0 ? (
                <p className="mt-1 text-xs text-[var(--fg-muted)]">
                  Solo la solución trivial: A−λI es invertible ⇒ λ no es autovalor.
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {mode === 'alg' ? (
          <div className="space-y-3 rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
            <p>
              E_λ = &#123; v ∈ ℝ² : (A − λI)v = 0 &#125; = ker(A − λI)
            </p>
            <p className="text-xs text-[var(--fg-muted)]">Sistema expandido:</p>
            {eqRows.map((eq) => (
              <p key={eq}>{eq}</p>
            ))}
            <div className="border-t border-[var(--border)] pt-2 text-xs leading-relaxed">
              <p style={{ color: 'orange' }} className="font-semibold">
                dim(E_λ) = {dim} · base ={' '}
                {dim === 0
                  ? '∅ (solo 0)'
                  : basis.map((b) => formatPair(b)).join(', ')}
              </p>
              <p className="mt-1 text-[var(--fg-muted)]">
                λ = {formatNum(lambda)}
                {Math.abs(lambda) < EIG_EPS ? ' · caso λ=0: E₀ = ker(A)' : ''}
                {lambda < 0 ? ' · λ negativo: Av apunta en sentido opuesto a v' : ''}
              </p>
              <p className="mt-1 text-[var(--fg-muted)]">
                Nota: 0 ∈ E_λ siempre, pero 0 no es autovector.
              </p>
            </div>
          </div>
        ) : null}

        <ControlsStack>
          <ToggleRow
            label="Prueba libre (v no forzado a E_λ)"
            checked={freeTest}
            onChange={(on) => {
              setFreeTest(on);
              if (!on) setV(projectToEigenspace(v, basis));
            }}
          />
          <ButtonRow>
            {dim === 1 && basis[0] ? (
              <button
                type="button"
                className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-sm hover:bg-[var(--accent-soft)]"
                onClick={() => {
                  setFreeTest(false);
                  setV(clampVec(scale(normalize(basis[0]!), 2), CLAMP));
                }}
              >
                Colocar v en E_λ
              </button>
            ) : null}
            {dim === 2 ? (
              <button
                type="button"
                className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-sm hover:bg-[var(--accent-soft)]"
                onClick={() => {
                  setFreeTest(false);
                  setV({ x: 1.3, y: 1.1 });
                }}
              >
                Cualquier v ∈ ℝ²
              </button>
            ) : null}
            <button
              type="button"
              className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-sm hover:bg-[var(--accent-soft)]"
              onClick={() => setV({ x: 0, y: 0 })}
            >
              Ir al origen
            </button>
          </ButtonRow>
          <p className="text-xs text-[var(--fg-muted)]">
            v = {formatPair(v)} → Av = {formatPair(Av)}
            {isEigenvec ? ` · λv = ${formatPair(lamV)}` : ''}
          </p>
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

function nearZero(v: Vec2, eps = EIG_EPS): boolean {
  return norm(v) < eps;
}
