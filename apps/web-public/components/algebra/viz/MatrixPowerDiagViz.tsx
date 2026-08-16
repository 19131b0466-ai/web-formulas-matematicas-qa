'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  SliderRow,
  ToggleRow,
  VizPanel,
  joinCaption,
} from './controls';
import {
  analyzeEigen,
  formatNum,
  formatPair,
  inv2,
  matPowDiag,
  reconstructPDP,
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
  useVecDrag,
} from './vectorPlane';

const W = VEC_W;
const H = VEC_H;
const ox = W / 2;
const oy = H / 2;
const S = 36;
const CLAMP = 3.4;
const LINE_EXT = 4.2;

type Mode = 'idea' | 'apply' | 'alg';

function buildFromPD(P: Mat2, D: Mat2): Mat2 | null {
  const Pinv = inv2(P);
  if (!Pinv) return null;
  return reconstructPDP(P, D, Pinv);
}

const P_GROW: Mat2 = [
  [1, 1],
  [0, 1],
];
const D_GROW: Mat2 = [
  [2, 0],
  [0, 0.5],
];
const D_ALT: Mat2 = [
  [-1.5, 0],
  [0, 0.6],
];

const PRESET_GROW = buildFromPD(P_GROW, D_GROW)!;
const PRESET_ALT = buildFromPD(P_GROW, D_ALT)!;
const PRESET_SYM: Mat2 = [
  [2, 1],
  [1, 2],
];
const PRESET_ID = I2();
const PRESET_SING: Mat2 = [
  [2, 0],
  [0, 0],
];
const PRESET_JORDAN: Mat2 = [
  [1, 1],
  [0, 1],
];

const PRESETS: Array<{ id: string; label: string; m: Mat2; note?: string }> = [
  { id: 'grow', label: 'Crecimiento/decadencia', m: PRESET_GROW },
  { id: 'alt', label: 'Alternancia', m: PRESET_ALT },
  {
    id: 'sym',
    label: 'Simétrica',
    m: PRESET_SYM,
    note: 'Caso especial: P puede elegirse ortogonal (P⁻¹ = Pᵀ), pero aquí usamos P⁻¹ en general.',
  },
  { id: 'id', label: 'Identidad', m: PRESET_ID },
  { id: 'sing', label: 'Singular diag', m: PRESET_SING },
  { id: 'jordan', label: 'No diag Jordan', m: PRESET_JORDAN },
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
  const cell = (val: number) => {
    if (!Number.isFinite(val)) return '—';
    if (Math.abs(val) > 1e6) return val.toExponential(1);
    return present(Number(val.toFixed(3)));
  };
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
          <span className="min-w-[2.6rem] text-center">{cell(m[0][0])}</span>
          <span className="min-w-[2.6rem] text-center">{cell(m[0][1])}</span>
          <span className="min-w-[2.6rem] text-center">{cell(m[1][0])}</span>
          <span className="min-w-[2.6rem] text-center">{cell(m[1][1])}</span>
        </div>
      </div>
    </div>
  );
}

function powerBadge(
  lambda: number,
  exp: number,
): { label: string; tone: 'ok' | 'bad' | 'warn' | 'neutral' } {
  if (exp === 0) return { label: 'λ⁰ = 1', tone: 'neutral' };
  const p = lambda === 0 ? (exp > 0 ? 0 : 1) : lambda ** exp;
  if (lambda < 0) return { label: `ALTERNA (${formatNum(p)})`, tone: 'warn' };
  if (Math.abs(lambda) < EIG_NEAR) return { label: '→ 0', tone: 'neutral' };
  if (Math.abs(lambda - 1) < EIG_NEAR) return { label: 'INVARIANTE', tone: 'ok' };
  if (Math.abs(lambda) > 1) return { label: `CRECE (${formatNum(p)})`, tone: 'bad' };
  return { label: `DECAE (${formatNum(p)})`, tone: 'ok' };
}

function lamPow(lambda: number, exp: number): number {
  if (lambda === 0) return exp > 0 ? 0 : 1;
  return lambda ** exp;
}

function trajLabel(i: number, exp: number): string | null {
  if (i === 0) return 'x';
  if (i === 1) return 'Ax';
  if (i === exp) return 'Aⁿx';
  if (exp > 6) {
    const step = Math.max(2, Math.floor(exp / 4));
    if (i % step !== 0) return null;
  }
  return `A${i}x`;
}

function SpanLine({ v, color }: { v: Vec2; color: string }) {
  if (norm(v) < 1e-9) return null;
  const nrm = normalize(v);
  const a = { x: ox + nrm.x * -LINE_EXT * S, y: oy - nrm.y * -LINE_EXT * S };
  const b = { x: ox + nrm.x * LINE_EXT * S, y: oy - nrm.y * LINE_EXT * S };
  return (
    <line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke={color}
      strokeWidth={8}
      opacity={0.18}
      strokeLinecap="round"
    />
  );
}

/**
 * Potencias vía diagonalización: Aⁿ = PDⁿP⁻¹ (ALG-EIG-005).
 * P puede ser oblicua — coordenadas con P⁻¹, nunca productos escalares.
 */
export function MatrixPowerDiagViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [A, setA] = useState<Mat2>(() => cloneMat2(PRESET_GROW));
  const [x, setX] = useState<Vec2>({ x: 1.4, y: 0.9 });
  const [n, setN] = useState(3);
  const [mode, setMode] = useState<Mode>('idea');
  const [editOpen, setEditOpen] = useState(false);
  const [showTraj, setShowTraj] = useState(true);
  const [presetNote, setPresetNote] = useState<string | null>(null);
  const [constructOpen, setConstructOpen] = useState(false);
  const [Pedit, setPedit] = useState<Mat2>(() => cloneMat2(P_GROW));
  const [Dedit, setDedit] = useState<Mat2>(() => cloneMat2(D_GROW));
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
  const Dn = D ? matPowDiag(D, n) : null;
  const v1 = analysis.pairs[0]?.v ?? null;
  const v2 = analysis.pairs[1]?.v ?? null;
  const l1 = analysis.pairs[0]?.lambda;
  const l2 = analysis.pairs[1]?.lambda;

  const c = Pinv ? applyMat(Pinv, x) : null;
  const Dnc = Dn && c ? applyMat(Dn, c) : null;
  const Anx = P && Dnc ? applyMat(P, Dnc) : null;

  const traj: Vec2[] = useMemo(() => {
    if (!canDiag || !P || !D || !c) return [x];
    const pts: Vec2[] = [];
    for (let k = 0; k <= n; k++) {
      const Dk = matPowDiag(D, k);
      pts.push(applyMat(P, applyMat(Dk, c)));
    }
    return pts;
  }, [canDiag, P, D, c, n, x]);

  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });
  const dragX = useVecDrag((p) => setX(clampVec(p, CLAMP)), S, { x: ox, y: oy });

  const setPreset = (p: (typeof PRESETS)[number]) => {
    prevPairsRef.current = null;
    setA(cloneMat2(p.m));
    setPresetNote(p.note ?? null);
    if (p.id === 'jordan') setX({ x: 1.2, y: 0.7 });
    else if (p.id === 'sing') setX({ x: 1.5, y: 1.2 });
    else setX({ x: 1.4, y: 0.9 });
  };

  const applyConstruct = () => {
    const built = buildFromPD(Pedit, Dedit);
    if (!built) return;
    prevPairsRef.current = null;
    setA(cloneMat2(built));
    setPresetNote('Construida como A = PDP⁻¹ (P puede ser oblicua).');
  };

  const footer = !canDiag
    ? analysis.status === 'complex'
      ? 'No diagonalizable sobre ℝ — no se fabrica P'
      : 'No diagonalizable — no se fabrica P'
    : n === 0
      ? joinCaption('A⁰ = I', 'P I P⁻¹ = I ✓')
      : n === 1
        ? joinCaption('A¹ = A', 'PDP⁻¹ = A ✓')
        : joinCaption('Aⁿ = PDⁿP⁻¹', `n = ${n}`);

  const b1 = l1 !== undefined ? powerBadge(l1, n) : null;
  const b2 = l2 !== undefined ? powerBadge(l2, n) : null;

  const combo =
    canDiag && c && v1 && v2 && l1 !== undefined && l2 !== undefined
      ? add(scale(v1, c.x * lamPow(l1, n)), scale(v2, c.y * lamPow(l2, n)))
      : null;

  return (
    <VizPanel title="Potencias Aⁿ = PDⁿP⁻¹" caption={footer}>
      <div className="space-y-3">
        <GuideBlock
          idea="Diagonaliza una vez; potencia la diagonal. Aⁿ = P Dⁿ P⁻¹ — no hace falta multiplicar A · A · … n veces."
          tryIt="Sube n con crecimiento/decadencia: una dirección CRECE y la otra DECAE."
          concept="Coordenadas c = P⁻¹x (base oblicua OK). Nunca uses productos escalares como si P fuera ortogonal."
        />

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={[
              { id: 'idea', label: 'Idea' },
              { id: 'apply', label: 'Aplicar Aⁿ' },
              { id: 'alg', label: 'Álgebra' },
            ]}
            value={mode}
            onChange={(id) => setMode(id as Mode)}
          />
        </div>

        <ChipRow>
          {PRESETS.map((p) => (
            <Chip key={p.id} active={matEq(A, p.m)} onClick={() => setPreset(p)}>
              {p.label}
            </Chip>
          ))}
        </ChipRow>

        {presetNote ? (
          <p className="text-xs italic text-[var(--fg-muted)]">{presetNote}</p>
        ) : null}

        {!canDiag ? (
          <div className="rounded-xl border-2 border-rose-500/45 bg-rose-500/10 px-4 py-3 text-center">
            <p className="text-sm font-bold text-rose-800 dark:text-rose-200">
              {analysis.status === 'complex'
                ? 'NO DIAGONALIZABLE SOBRE ℝ'
                : 'NO DIAGONALIZABLE'}
            </p>
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              Sin P real invertible no aplicamos la fórmula Aⁿ = PDⁿP⁻¹ (no se inventa una P falsa).
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="ok">Diagonalizable</Badge>
            {b1 ? <Badge tone={b1.tone}>λ₁ⁿ: {b1.label}</Badge> : null}
            {b2 ? <Badge tone={b2.tone}>λ₂ⁿ: {b2.label}</Badge> : null}
            {n === 0 ? <Badge tone="neutral">n=0 → I</Badge> : null}
            {n === 1 ? <Badge tone="neutral">n=1 → A</Badge> : null}
          </div>
        )}

        <div className="space-y-2">
          <SliderRow
            label={`n=${n}`}
            ariaLabel="Exponente n"
            value={n}
            min={0}
            max={12}
            step={1}
            onChange={(v) => setN(Math.round(v))}
          />
          <ChipRow>
            {[0, 1, 2, 5, 10].map((k) => (
              <Chip key={k} active={n === k} onClick={() => setN(k)}>
                n={k}
              </Chip>
            ))}
          </ChipRow>
        </div>

        {canDiag && mode === 'idea' ? (
          <div className="overflow-x-auto rounded-xl border border-[var(--border)] px-3 py-3">
            <div className="flex min-w-max flex-wrap items-center justify-center gap-2 font-mono text-xs sm:text-sm">
              {[
                { t: 'x', c: 'var(--fg)' },
                { t: 'P⁻¹', c: COLOR_U },
                { t: 'c', c: 'orange' },
                { t: 'Dⁿ', c: COLOR_V },
                { t: 'Dⁿc', c: COLOR_V },
                { t: 'P', c: COLOR_U },
                { t: 'Aⁿx', c: COLOR_W },
              ].map((step, i, arr) => (
                <span key={step.t} className="inline-flex items-center gap-2">
                  <span
                    className="rounded-md border border-[var(--border)] px-2.5 py-1.5 font-semibold"
                    style={{ color: step.c }}
                  >
                    {step.t}
                  </span>
                  {i < arr.length - 1 ? (
                    <span className="text-[var(--fg-muted)]">→</span>
                  ) : null}
                </span>
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-[var(--fg-muted)]">
              Pipeline: cambiar a coordenadas propias → potenciar D → volver con P.
            </p>
          </div>
        ) : null}

        {mode !== 'alg' && canDiag ? (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full touch-none rounded-xl border border-[var(--border)]"
            role="img"
            aria-label="Potencias de matriz"
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
            {v1 ? <SpanLine v={v1} color={COLOR_U} /> : null}
            {v2 ? <SpanLine v={v2} color={COLOR_V} /> : null}

            {showTraj
              ? traj.map((p, i) => {
                  const tip = to(p);
                  const lab = trajLabel(i, n);
                  return (
                    <g key={i}>
                      {i > 0 ? (
                        <line
                          x1={to(traj[i - 1]!).x}
                          y1={to(traj[i - 1]!).y}
                          x2={tip.x}
                          y2={tip.y}
                          stroke={COLOR_W}
                          strokeWidth={1.2}
                          opacity={0.45}
                        />
                      ) : null}
                      <circle
                        cx={tip.x}
                        cy={tip.y}
                        r={i === 0 || i === n ? 5.5 : 3.5}
                        fill={i === 0 ? 'var(--fg)' : COLOR_W}
                        opacity={i === 0 || i === n ? 1 : 0.75}
                      />
                      {lab ? (
                        <text
                          x={tip.x + 8}
                          y={tip.y - 6}
                          fontSize={10}
                          fontWeight={i === n ? 700 : 500}
                          fill={i === 0 ? 'var(--fg)' : COLOR_W}
                        >
                          {lab}
                        </text>
                      ) : null}
                    </g>
                  );
                })
              : null}

            {!showTraj && Anx ? (
              <>
                <line
                  x1={ox}
                  y1={oy}
                  x2={to(x).x}
                  y2={to(x).y}
                  stroke="var(--fg)"
                  strokeWidth={2.2}
                  markerEnd={`url(#${uid}-fg)`}
                />
                <line
                  x1={ox}
                  y1={oy}
                  x2={to(Anx).x}
                  y2={to(Anx).y}
                  stroke={COLOR_W}
                  strokeWidth={2.6}
                  markerEnd={`url(#${uid}-w)`}
                />
              </>
            ) : null}

            <circle
              cx={to(x).x}
              cy={to(x).y}
              r={12}
              fill="transparent"
              stroke={COLOR_W}
              strokeWidth={1}
              strokeOpacity={0.4}
              style={{ cursor: 'grab' }}
              {...dragX}
            />
          </svg>
        ) : null}

        {(mode === 'alg' || (canDiag && mode === 'idea')) && canDiag ? (
          <div className="flex flex-wrap items-end gap-3">
            {P ? <MatCard name="P" m={P} accent /> : null}
            {D ? <MatCard name="D" m={D} accent /> : null}
            {Pinv ? <MatCard name="P⁻¹" m={Pinv} /> : null}
            {Dn ? <MatCard name={`Dⁿ (n=${n})`} m={Dn} accent /> : null}
          </div>
        ) : null}

        {mode === 'alg' && canDiag && c && Anx ? (
          <div className="space-y-2 rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
            <p>
              c = P⁻¹x = ({formatNum(c.x)}, {formatNum(c.y)})
            </p>
            <p style={{ color: 'orange' }}>Aⁿx = P Dⁿ c = {formatPair(Anx)}</p>
            {combo && l1 !== undefined && l2 !== undefined ? (
              <p className="text-xs text-[var(--fg-muted)]">
                = {formatNum(c.x)} λ₁ⁿ v₁ + {formatNum(c.y)} λ₂ⁿ v₂ · λ₁ⁿ ={' '}
                {formatNum(lamPow(l1, n))}, λ₂ⁿ = {formatNum(lamPow(l2, n))}
              </p>
            ) : null}
            <p className="text-xs text-[var(--fg-muted)]">
              P no se asume ortogonal: usamos P⁻¹, no Pᵀ.
            </p>
          </div>
        ) : null}

        {canDiag && c && Anx && mode === 'apply' ? (
          <div className="flex flex-wrap gap-x-3 gap-y-1 rounded-lg border border-[var(--border)] px-3 py-2 font-mono text-xs sm:text-sm">
            <span>
              c = ({formatNum(c.x)}, {formatNum(c.y)})
            </span>
            <span className="text-[var(--fg-muted)]">·</span>
            <span style={{ color: COLOR_W }}>Aⁿx = {formatPair(Anx)}</span>
            {combo ? (
              <>
                <span className="text-[var(--fg-muted)]">·</span>
                <span>c₁λ₁ⁿv₁ + c₂λ₂ⁿv₂ = {formatPair(combo)}</span>
              </>
            ) : null}
          </div>
        ) : null}

        <ControlsStack>
          {canDiag ? (
            <ToggleRow
              label="Trayectoria x, Ax, …, Aⁿx"
              checked={showTraj}
              onChange={setShowTraj}
            />
          ) : null}
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
              setPresetNote(null);
              setA(m);
            }}
            labels={['col₁', 'col₂']}
          />
        </CollapsibleEdit>

        <CollapsibleEdit
          label="Construir A = PDP⁻¹"
          open={constructOpen}
          onToggle={() => setConstructOpen((o) => !o)}
        >
          <div className="space-y-3">
            <p className="text-xs text-[var(--fg-muted)]">
              Columnas de P = base (puede ser oblicua). D diagonal.
            </p>
            <Mat2Editor m={Pedit} onChange={setPedit} labels={['v₁', 'v₂']} />
            <Mat2Editor m={Dedit} onChange={setDedit} labels={['λ₁', 'λ₂']} />
            <button
              type="button"
              className="rounded-lg border border-orange-500/40 bg-orange-500/10 px-3 py-1.5 text-sm font-medium"
              style={{ color: 'orange' }}
              onClick={applyConstruct}
            >
              Aplicar A = PDP⁻¹
            </button>
            {!inv2(Pedit) ? (
              <p className="text-xs text-rose-700 dark:text-rose-300">P no es invertible.</p>
            ) : null}
          </div>
        </CollapsibleEdit>
      </div>
    </VizPanel>
  );
}
