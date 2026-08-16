'use client';

import { useId, useState } from 'react';
import {
  ControlsStack,
  ToggleRow,
  VizPanel,
  joinCaption,
} from './controls';
import {
  analyzeEigen,
  applyMat,
  effectLabel,
  eigenResidual,
  formatNum,
  formatPair,
  isEigenvector,
  norm,
  rayleigh,
  scale,
  EIG_EPS,
} from './eigenHelpers';
import { normalize, type Mat2, type Vec2 } from './math2d';
import {
  Badge,
  Chip,
  ChipRow,
  CollapsibleEdit,
  GuideBlock,
  Mat2Editor,
  Segmented,
  cloneMat2,
} from './transformHelpers';
import {
  ArrowMarker,
  Axes,
  COLOR_W,
  VEC_H,
  VEC_W,
  angleBetween,
  clampVec,
  labelOffset,
  useVecDrag,
} from './vectorPlane';

const W = VEC_W;
const H = VEC_H;
const ox = W / 2;
const oy = H / 2;
const S = 42;
const CLAMP = 3.2;
const LINE_EXT = 4.5;
const COLOR_V_DARK = 'teal';

type Mode = 'explore' | 'compare' | 'equation';
type PresetId = 'two' | 'neg' | 'one' | 'zero' | '2i' | 'rot' | null;

const PRESETS: Array<{ id: PresetId; label: string; m: Mat2; v?: Vec2 }> = [
  {
    id: 'two',
    label: 'Dos direcciones',
    m: [
      [2, 1],
      [0, 3],
    ],
    v: { x: 1, y: 0 },
  },
  {
    id: 'neg',
    label: 'λ negativo',
    m: [
      [2, 0],
      [0, -1],
    ],
    v: { x: 0, y: 1 },
  },
  {
    id: 'one',
    label: 'λ = 1',
    m: [
      [1, 0.5],
      [0, 1],
    ],
    v: { x: 1, y: 0 },
  },
  {
    id: 'zero',
    label: 'λ = 0',
    m: [
      [2, 0],
      [0, 0],
    ],
    v: { x: 0, y: 1 },
  },
  {
    id: '2i',
    label: '2I',
    m: [
      [2, 0],
      [0, 2],
    ],
    v: { x: 1, y: 0.6 },
  },
  {
    id: 'rot',
    label: 'Rotación',
    m: [
      [0, -1],
      [1, 0],
    ],
    v: { x: 1, y: 0 },
  },
];

function spanLine(v: Vec2): { x1: number; y1: number; x2: number; y2: number } | null {
  const d = normalize(v);
  if (Math.hypot(d.x, d.y) < EIG_EPS) return null;
  return {
    x1: ox - d.x * LINE_EXT * S,
    y1: oy + d.y * LINE_EXT * S,
    x2: ox + d.x * LINE_EXT * S,
    y2: oy - d.y * LINE_EXT * S,
  };
}

function Plane({
  uid,
  A,
  v,
  onDragV,
  showDirs,
  showLamV,
  highlight,
}: {
  uid: string;
  A: Mat2;
  v: Vec2;
  onDragV: ReturnType<typeof useVecDrag>;
  showDirs: boolean;
  showLamV: boolean;
  highlight?: boolean;
}) {
  const Av = applyMat(A, v);
  const nv = norm(v);
  const isZero = nv < EIG_EPS;
  const lam = isZero ? 0 : rayleigh(A, v);
  const residual = isZero ? 0 : eigenResidual(A, v, lam);
  const isEig = !isZero && isEigenvector(A, v);
  const lamV = scale(v, lam);
  const angle = angleBetween(v, Av);
  const angleDeg = Number.isFinite(angle) ? (angle * 180) / Math.PI : NaN;
  const analysis = analyzeEigen(A);

  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });
  const pv = to(v);
  const pAv = to(Av);
  const pLamV = to(lamV);
  const vLbl = labelOffset(v, pv, ox, oy, 16);
  const avLbl = labelOffset(Av, pAv, ox, oy, 16);

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg)]">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full touch-none" role="img">
        <defs>
          <ArrowMarker id={`${uid}-v`} color={COLOR_V_DARK} />
          <ArrowMarker id={`${uid}-av`} color={COLOR_W} />
          <ArrowMarker id={`${uid}-lam`} color={COLOR_V_DARK} />
        </defs>
        <Axes W={W} H={H} ox={ox} oy={oy} S={S} ticks={[-3, -1, 1, 3]} />

        {showDirs ? (
          analysis.status === 'complex' || analysis.pairs.length === 0 ? (
            <text x={16} y={H - 16} fontSize={11} fill="var(--fg-muted)">
              Sin direcciones propias reales (espectro complejo)
            </text>
          ) : analysis.status === 'degenerate' ? (
            <>
              {/* Todo el plano es propio: varias rayas de muestra */}
              {[
                { x: 1, y: 0 },
                { x: 0, y: 1 },
                { x: Math.SQRT1_2, y: Math.SQRT1_2 },
              ].map((d, i) => {
                const line = spanLine(d);
                if (!line) return null;
                return (
                  <line
                    key={i}
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke={COLOR_W}
                    strokeWidth={1}
                    opacity={0.25}
                    strokeDasharray="3 4"
                  />
                );
              })}
              <text x={16} y={22} fontSize={11} fill="var(--fg-muted)">
                Toda dirección es propia (λ repetido)
              </text>
            </>
          ) : (
            analysis.pairs.map((p, i) => {
              const line = spanLine(p.v);
              if (!line) return null;
              const tip = to(scale(normalize(p.v), 2.6));
              return (
                <g key={i}>
                  <line
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke={COLOR_W}
                    strokeWidth={1.5}
                    opacity={0.55}
                  />
                  <text x={tip.x + 6} y={tip.y - 4} fontSize={11} fill={COLOR_W} fontWeight={600}>
                    λ={formatNum(p.lambda)}
                  </text>
                </g>
              );
            })
          )
        ) : null}

        {!isZero ? (
          <line
            x1={ox}
            y1={oy}
            x2={pv.x}
            y2={pv.y}
            stroke={COLOR_V_DARK}
            strokeWidth={2.4}
            markerEnd={`url(#${uid}-v)`}
          />
        ) : null}

        {!isZero && Math.hypot(Av.x, Av.y) > EIG_EPS ? (
          <line
            x1={ox}
            y1={oy}
            x2={pAv.x}
            y2={pAv.y}
            stroke={COLOR_W}
            strokeWidth={2.4}
            markerEnd={`url(#${uid}-av)`}
          />
        ) : null}

        {/* λ*v: mejor escalado colineal con v — comparar con Av */}
        {showLamV && !isZero ? (
          Math.abs(lam) > EIG_EPS && Math.hypot(lamV.x, lamV.y) > EIG_EPS ? (
            <g>
              <line
                x1={ox}
                y1={oy}
                x2={pLamV.x}
                y2={pLamV.y}
                stroke={COLOR_V_DARK}
                strokeWidth={1.8}
                strokeDasharray="6 4"
                markerEnd={`url(#${uid}-lam)`}
                opacity={0.9}
              />
              <text
                x={labelOffset(lamV, pLamV, ox, oy, 18).x}
                y={labelOffset(lamV, pLamV, ox, oy, 18).y}
                fontSize={11}
                fill={COLOR_V_DARK}
                fontWeight={600}
              >
                λ*v
              </text>
            </g>
          ) : (
            <g>
              <circle cx={ox} cy={oy} r={5} fill="none" stroke={COLOR_V_DARK} strokeWidth={1.5} strokeDasharray="3 2" />
              <text x={ox + 10} y={oy + 16} fontSize={11} fill={COLOR_V_DARK}>
                λ*v = 0
              </text>
            </g>
          )
        ) : null}

        <circle
          cx={isZero ? ox : pv.x}
          cy={isZero ? oy : pv.y}
          r={10}
          fill="transparent"
          stroke={COLOR_V_DARK}
          strokeWidth={1.5}
          className="cursor-grab"
          {...onDragV}
        />

        {!isZero ? (
          <text x={vLbl.x} y={vLbl.y} fontSize={12} fill={COLOR_V_DARK} fontWeight={600}>
            v
          </text>
        ) : (
          <text x={ox + 10} y={oy - 10} fontSize={11} fill="var(--fg-muted)">
            v = 0
          </text>
        )}

        {!isZero && Math.hypot(Av.x, Av.y) > EIG_EPS ? (
          <text x={avLbl.x} y={avLbl.y} fontSize={12} fill={COLOR_W} fontWeight={600}>
            Av
          </text>
        ) : null}

        {highlight && isEig ? (
          <text x={16} y={22} fontSize={11} fill={COLOR_W} fontWeight={700}>
            AUTOVECTOR
          </text>
        ) : null}
      </svg>

      <div className="space-y-1.5 border-t border-[var(--border)] px-3 py-2 text-sm">
        {isZero ? (
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">v = 0</Badge>
            <span className="text-[var(--fg-muted)]">No es autovector (se exige v ≠ 0)</span>
          </div>
        ) : isEig ? (
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="ok">AUTOVECTOR</Badge>
            <span className="font-mono">
              λ ≈ {formatNum(lam)} · {effectLabel(lam)}
            </span>
            {lam < -EIG_EPS ? <Badge tone="warn">sentido opuesto (180°)</Badge> : null}
            {Math.abs(lam) < EIG_EPS ? <Badge tone="warn">Av en el origen</Badge> : null}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="bad">No es autovector</Badge>
            {Number.isFinite(angleDeg) ? (
              <span className="text-[var(--fg-muted)]">ángulo(v, Av) ≈ {formatNum(angleDeg, 1)}°</span>
            ) : null}
          </div>
        )}
        <p className="font-mono text-xs text-[var(--fg-muted)]">
          v = {formatPair(v)} · Av = {formatPair(Av)} · λ* = {formatNum(lam)} · ‖Av−λv‖ ={' '}
          {formatNum(residual, 3)}
        </p>
      </div>
    </div>
  );
}

/**
 * Ecuación Av = λv: direcciones que A conserva (ALG-EIG-001).
 */
export function EigenEquationViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [A, setA] = useState<Mat2>([
    [2, 1],
    [0, 3],
  ]);
  const [v, setV] = useState<Vec2>({ x: 1.2, y: 0.4 });
  const [vCompare, setVCompare] = useState<Vec2>({ x: 1, y: 0 });
  const [mode, setMode] = useState<Mode>('explore');
  const [showDirs, setShowDirs] = useState(true);
  const [showLamV, setShowLamV] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [preset, setPreset] = useState<PresetId>('two');

  const analysis = analyzeEigen(A);
  const hasReal = analysis.pairs.length > 0;

  // Align compare vector to first real eigenvector when available
  const eigV = analysis.pairs[0]?.v ?? { x: 1, y: 0 };

  const dragV = useVecDrag((p) => {
    setV(clampVec(p, CLAMP));
    setPreset(null);
  }, S, { x: ox, y: oy });

  const dragCompare = useVecDrag((p) => {
    setVCompare(clampVec(p, CLAMP));
  }, S, { x: ox, y: oy });

  const applyPreset = (id: PresetId) => {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setPreset(id);
    setA(cloneMat2(p.m));
    if (p.v) setV(p.v);
    const eig = analyzeEigen(p.m);
    if (eig.pairs[0]) setVCompare(eig.pairs[0].v);
  };

  const snapToEigen = () => {
    if (!analysis.pairs[0]) return;
    setV(scale(normalize(analysis.pairs[0].v), 1.4));
    setPreset(null);
  };

  const caption = joinCaption(
    hasReal
      ? `λ reales: ${analysis.pairs.map((p) => formatNum(p.lambda)).join(', ')}`
      : 'Sin autovalores reales',
    mode === 'explore' ? 'Arrastra v y compara con Av' : null,
  );

  return (
    <VizPanel title="Ecuación de valor propio" caption={caption}>
      <div className="space-y-3">
        <GuideBlock
          idea="Un autovector solo se estira o se encoge: Av = λv con v ≠ 0. No gira hacia otro lado."
          tryIt="Arrastra v: cuando quede colineal con Av (naranja), verás el badge AUTOVECTOR y λ."
          concept="La dirección se conserva; solo cambia la longitud (y el sentido si λ < 0)."
        />

        <Segmented
          options={[
            { id: 'explore', label: 'Explorar' },
            { id: 'compare', label: 'Comparar' },
            { id: 'equation', label: 'Ver ecuación' },
          ]}
          value={mode}
          onChange={(id) => {
            const m = id as Mode;
            setMode(m);
            if (m === 'compare' && hasReal) setVCompare(eigV);
          }}
        />

        <ChipRow>
          {PRESETS.map((p) => (
            <Chip key={p.id} active={preset === p.id} onClick={() => applyPreset(p.id)}>
              {p.label}
            </Chip>
          ))}
        </ChipRow>

        {mode === 'equation' ? (
          <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
            <p className="font-mono text-base text-[var(--fg)]">Av = λv, &nbsp; v ≠ 0</p>
            <div className="flex flex-wrap items-start gap-4">
              <div>
                <p className="mb-1 text-xs font-semibold text-[var(--fg-muted)]">A</p>
                <Mat2Editor m={A} readOnly name="A" />
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-mono">v = {formatPair(v)}</p>
                <p className="font-mono">Av = {formatPair(applyMat(A, v))}</p>
                <p className="font-mono">
                  λ* = (vᵀAv)/(vᵀv) ≈ {formatNum(norm(v) < EIG_EPS ? 0 : rayleigh(A, v))}
                </p>
                {hasReal ? (
                  <ul className="mt-2 list-inside list-disc text-[var(--fg-muted)]">
                    {analysis.pairs.map((p, i) => (
                      <li key={i} className="font-mono">
                        λ{i + 1} = {formatNum(p.lambda)}, dirección {formatPair(p.v)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[var(--fg-muted)]">Raíces complejas: no hay rectas propias reales.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {mode === 'explore' ? (
          <Plane
            uid={`${uid}-ex`}
            A={A}
            v={v}
            onDragV={dragV}
            showDirs={showDirs}
            showLamV={showLamV}
            highlight
          />
        ) : null}

        {mode === 'compare' ? (
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
                Vector arbitrario
              </p>
              <Plane
                uid={`${uid}-arb`}
                A={A}
                v={v}
                onDragV={dragV}
                showDirs={showDirs}
                showLamV={showLamV}
              />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
                Autovector
              </p>
              <Plane
                uid={`${uid}-eig`}
                A={A}
                v={hasReal ? vCompare : v}
                onDragV={hasReal ? dragCompare : dragV}
                showDirs={showDirs}
                showLamV={showLamV}
                highlight
              />
              {!hasReal ? (
                <p className="mt-2 text-sm text-[var(--fg-muted)]">
                  Esta A no tiene autovectores reales (p. ej. rotación).
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        <ControlsStack>
          <ToggleRow
            label="Mostrar direcciones propias"
            checked={showDirs}
            onChange={setShowDirs}
          />
          <ToggleRow label="Mostrar λ*v (discontinuo)" checked={showLamV} onChange={setShowLamV} />
          <p className="text-xs leading-relaxed text-[var(--fg-muted)]">
            <span className="font-medium text-[var(--fg)]">Direcciones propias</span> — rectas donde
            A solo escala (si existen en ℝ). En «Rotación» no hay ninguna: A siempre gira 90°.
            <br />
            <span className="font-medium text-[var(--fg)]">λ*v</span> — el mejor múltiplo de v
            (línea discontinua teal). Compáralo con Av (naranja): coinciden ⟺ v es autovector.
            Prueba el preset «Dos direcciones» y alinea v con una recta naranja.
          </p>
          {hasReal ? (
            <button
              type="button"
              className="self-start rounded-md border border-[var(--accent-strong)] bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--fg)]"
              onClick={snapToEigen}
            >
              Alinear v con una dirección propia
            </button>
          ) : (
            <p className="text-xs text-[var(--fg-muted)]">
              Esta A no tiene autovectores reales — prueba «Dos direcciones» o «λ negativo».
            </p>
          )}
          <CollapsibleEdit
            label="Editar matriz A"
            open={editOpen}
            onToggle={() => setEditOpen((o) => !o)}
          >
            <Mat2Editor
              m={A}
              onChange={(m) => {
                setA(m);
                setPreset(null);
              }}
              name="A"
            />
          </CollapsibleEdit>
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
