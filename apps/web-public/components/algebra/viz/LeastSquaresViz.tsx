'use client';

import { useId, useRef, useState } from 'react';
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
  LSQ_EPS,
  LSQ_NEAR,
  formatNum,
  formatVec,
  leastSquares,
  matVec,
  matrixRank,
  type Mat,
  type Vec,
  vecNorm,
  vecScale,
  vecSub,
} from './lsqMath';
import { normalize, type Vec2 } from './math2d';
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
  autoScale,
  labelOffset,
} from './vectorPlane';

const W = VEC_W;
const H = VEC_H;
const OX = W / 2;
const OY = H / 2;
const LINE_EXT = 6.5;
const RM = 0.28;
const X_TOL = LSQ_NEAR;

type Mode = 'geo' | 'error' | 'general';
type PresetId = 'inexact' | 'exact' | 'reg';
type ViewKind = 'col' | 'reg';

const A_DEFAULT: Mat = [[1], [2]];
const B_INEXACT: Vec = [2, 1];
const B_EXACT: Vec = [2, 4];
const X_START = 1.4;

const REG_A: Mat = [
  [1, 1],
  [1, 2],
  [1, 3],
];
const REG_B: Vec = [1, 2.1, 2.8];
const REG_XS = [1, 2, 3];

const GEN_A: Mat = [
  [1, 0],
  [0, 1],
  [1, 1],
];
const GEN_B: Vec = [1, 1, 3];

function cloneMat(A: Mat): Mat {
  return A.map((r) => r.slice());
}

function cloneVec(v: Vec): Vec {
  return v.slice();
}

function col0(A: Mat): Vec2 {
  return { x: A[0]?.[0] ?? 0, y: A[1]?.[0] ?? 0 };
}

function toVec2(v: Vec): Vec2 {
  return { x: v[0] ?? 0, y: v[1] ?? 0 };
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function rightAnglePath(
  P: Vec2,
  alongCol: Vec2,
  alongR: Vec2,
  toPx: (p: Vec2) => { x: number; y: number },
): string {
  const nv = normalize(alongCol);
  const nr = normalize(alongR);
  if (Math.hypot(nv.x, nv.y) < LSQ_EPS || Math.hypot(nr.x, nr.y) < LSQ_EPS) return '';
  const a = { x: P.x + nv.x * RM, y: P.y + nv.y * RM };
  const b = { x: P.x + (nv.x + nr.x) * RM, y: P.y + (nv.y + nr.y) * RM };
  const c = { x: P.x + nr.x * RM, y: P.y + nr.y * RM };
  const A = toPx(a);
  const B = toPx(b);
  const C = toPx(c);
  return `M${A.x},${A.y} L${B.x},${B.y} L${C.x},${C.y}`;
}

/**
 * Mínimos cuadrados: min ||Ax − b||² con Ax ∈ Col(A) (ALG-LSQ-001).
 */
export function LeastSquaresViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const animRef = useRef<number | null>(null);

  const [A, setA] = useState<Mat>(() => cloneMat(A_DEFAULT));
  const [b, setB] = useState<Vec>(() => cloneVec(B_INEXACT));
  const [x, setX] = useState(X_START);
  const [mode, setMode] = useState<Mode>('geo');
  const [preset, setPreset] = useState<PresetId | null>('inexact');
  const [view, setView] = useState<ViewKind>('col');
  const [editOpen, setEditOpen] = useState(false);
  const [asErrorSq, setAsErrorSq] = useState(true);
  const [beta0, setBeta0] = useState(0.2);
  const [beta1, setBeta1] = useState(0.7);

  const lsq = leastSquares(A, b);
  const rankA = matrixRank(A);
  const a = col0(A);
  const aNorm = Math.hypot(a.x, a.y);
  const aZero = aNorm < LSQ_EPS;
  const xHat = lsq.xHat[0] ?? 0;
  const aCol: Vec = [a.x, a.y];
  const Ax = aZero ? matVec(A, [x]) : vecScale(aCol, x);
  const Ax2 = toVec2(Ax);
  const b2 = toVec2(b);
  const bHat2 = toVec2(lsq.bHat);
  const rCur = vecSub(b, Ax);
  const rCurNorm = vecNorm(rCur);
  const rCurNormSq = rCurNorm * rCurNorm;
  const atOpt = !aZero && Math.abs(x - xHat) < X_TOL;
  const residualTiny = lsq.residualNorm < LSQ_NEAR * (1 + vecNorm(b));
  const atNorm = vecNorm(lsq.AtResidual);
  const atOk = atNorm <= LSQ_NEAR * (1 + Math.max(1, aNorm) * (1 + lsq.residualNorm));

  const regLsq = leastSquares(REG_A, REG_B);
  const regB0Hat = regLsq.xHat[0] ?? 0;
  const regB1Hat = regLsq.xHat[1] ?? 0;
  const regYHat = (xi: number) => beta0 + beta1 * xi;
  const regSSE = REG_XS.reduce((s, xi, i) => {
    const e = REG_B[i]! - regYHat(xi);
    return s + e * e;
  }, 0);
  const regSSEMin = regLsq.residualNormSq;

  const genLsq = leastSquares(GEN_A, GEN_B);
  const genFullRank = matrixRank(GEN_A) === 2;

  function stopAnim() {
    if (animRef.current != null) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
  }

  function applyPreset(id: PresetId) {
    stopAnim();
    setPreset(id);
    if (id === 'inexact') {
      setA(cloneMat(A_DEFAULT));
      setB(cloneVec(B_INEXACT));
      setX(X_START);
      setView('col');
    } else if (id === 'exact') {
      setA(cloneMat(A_DEFAULT));
      setB(cloneVec(B_EXACT));
      setX(X_START);
      setView('col');
    } else {
      setA(cloneMat(REG_A));
      setB(cloneVec(REG_B));
      setBeta0(regB0Hat);
      setBeta1(regB1Hat + 0.35);
      setX(regB1Hat + 0.35);
      setView('reg');
    }
  }

  function seekMinimum() {
    stopAnim();
    if (view === 'reg') {
      const target0 = regB0Hat;
      const target1 = regB1Hat;
      if (prefersReducedMotion()) {
        setBeta0(target0);
        setBeta1(target1);
        return;
      }
      const start0 = beta0;
      const start1 = beta1;
      const t0 = performance.now();
      const dur = 700;
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        const e = 1 - (1 - t) * (1 - t);
        setBeta0(start0 + (target0 - start0) * e);
        setBeta1(start1 + (target1 - start1) * e);
        if (t < 1) animRef.current = requestAnimationFrame(tick);
        else animRef.current = null;
      };
      animRef.current = requestAnimationFrame(tick);
      return;
    }
    if (aZero) return;
    if (prefersReducedMotion()) {
      setX(xHat);
      return;
    }
    const start = x;
    const target = xHat;
    const t0 = performance.now();
    const dur = 700;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const e = 1 - (1 - t) * (1 - t);
      setX(start + (target - start) * e);
      if (t < 1) animRef.current = requestAnimationFrame(tick);
      else animRef.current = null;
    };
    animRef.current = requestAnimationFrame(tick);
  }

  function setAEntry(i: number, v: number) {
    stopAnim();
    setA((prev) => {
      const next = cloneMat(prev);
      if (!next[i]) next[i] = [0];
      next[i]![0] = v;
      return next;
    });
    setPreset(null);
    setView('col');
  }

  function setBEntry(i: number, v: number) {
    stopAnim();
    setB((prev) => {
      const next = cloneVec(prev);
      next[i] = v;
      return next;
    });
    setPreset(null);
    setView('col');
  }

  // Scale for Col(A) geometry (equal S for x,y)
  const maxAbs = Math.max(
    1.2,
    aNorm,
    Math.hypot(b2.x, b2.y),
    Math.hypot(Ax2.x, Ax2.y),
    Math.hypot(bHat2.x, bHat2.y),
    Math.abs(x) * aNorm,
    Math.abs(xHat) * aNorm,
  );
  const S = autoScale(maxAbs, Math.min(W, H), 48, 28, 56);
  const toPx = (p: Vec2) => ({ x: OX + p.x * S, y: OY - p.y * S });

  const pa = toPx(a);
  const pb = toPx(b2);
  const pAx = toPx(Ax2);
  const pHat = toPx(bHat2);
  const nDir = aZero ? { x: 1, y: 0 } : normalize(a);
  const spanA = toPx({ x: nDir.x * -LINE_EXT, y: nDir.y * -LINE_EXT });
  const spanB = toPx({ x: nDir.x * LINE_EXT, y: nDir.y * LINE_EXT });
  const showRight =
    !aZero && !residualTiny && lsq.residualNorm > LSQ_EPS;
  const rightMark = showRight
    ? rightAnglePath(bHat2, a, toVec2(lsq.residual), toPx)
    : '';
  const showCurErr = !atOpt && rCurNorm > LSQ_EPS;
  const aLab = labelOffset(a, pa, OX, OY, 16);
  const bLab = labelOffset(b2, pb, OX, OY, 16);

  // Error parabola range
  const xPad = Math.max(1.5, Math.abs(xHat) + 1.2, Math.abs(x) + 0.6);
  const xMinP = xHat - xPad;
  const xMaxP = xHat + xPad;
  const errSamples: Array<{ xv: number; e: number }> = [];
  const NERR = 64;
  let eMaxPlot = 1e-9;
  for (let i = 0; i <= NERR; i++) {
    const xv = xMinP + ((xMaxP - xMinP) * i) / NERR;
    const Axv = matVec(A, [xv]);
    const e = asErrorSq ? vecNorm(vecSub(b, Axv)) ** 2 : vecNorm(vecSub(b, Axv));
    errSamples.push({ xv, e });
    if (e > eMaxPlot) eMaxPlot = e;
  }
  const eCurPlot = asErrorSq ? rCurNormSq : rCurNorm;
  const eMinPlot = asErrorSq ? lsq.residualNormSq : lsq.residualNorm;
  if (eCurPlot > eMaxPlot) eMaxPlot = eCurPlot;
  const plotL = 48;
  const plotR = W - 28;
  const plotT = 28;
  const plotB = H - 36;
  const xToPlot = (xv: number) =>
    plotL + ((xv - xMinP) / (xMaxP - xMinP || 1)) * (plotR - plotL);
  const eToPlot = (e: number) =>
    plotB - (e / (eMaxPlot * 1.12 || 1)) * (plotB - plotT);
  const errPath = errSamples
    .map((s, i) => `${i === 0 ? 'M' : 'L'}${xToPlot(s.xv)},${eToPlot(s.e)}`)
    .join(' ');

  // Regression plot scale
  const regW = W;
  const regH = H;
  const regPad = 40;
  const rxMin = 0.5;
  const rxMax = 3.5;
  const ryMin = 0;
  const ryMax = 4;
  const rx = (xi: number) =>
    regPad + ((xi - rxMin) / (rxMax - rxMin)) * (regW - 2 * regPad);
  const ry = (yi: number) =>
    regH - regPad - ((yi - ryMin) / (ryMax - ryMin)) * (regH - 2 * regPad);

  const statusCol = aZero
    ? 'A = 0 · Col(A)={0}'
    : lsq.exact
      ? `A: 2×1 · b ∈ Col(A) · exacta`
      : `A: 2×1 · b ∉ Col(A)`;

  const caption =
    view === 'reg'
      ? joinCaption(
          `β̂₀=${formatNum(regB0Hat)}`,
          `β̂₁=${formatNum(regB1Hat)}`,
          `SSE=${formatNum(regSSE)}`,
          'mínimos cuadrados',
        )
      : joinCaption(
          `x̂=${formatNum(xHat)}`,
          `‖r‖₂=${formatNum(lsq.residualNorm)}`,
          'mínimos cuadrados',
        );

  const ariaSummary =
    view === 'reg'
      ? `Regresión: β0=${formatNum(beta0)}, β1=${formatNum(beta1)}, SSE=${formatNum(regSSE)}, mínimo SSE=${formatNum(regSSEMin)}`
      : `Mínimos cuadrados: x=${formatNum(x)}, x̂=${formatNum(xHat)}, ‖r‖₂=${formatNum(lsq.residualNorm)}, ${lsq.exact ? 'solución exacta' : 'sin solución exacta'}`;

  const sliderMin = Math.min(xHat - 2.5, -1);
  const sliderMax = Math.max(xHat + 2.5, 3);

  return (
    <VizPanel title="Mínimos cuadrados · min ‖Ax − b‖²" caption={caption}>
      <div className="space-y-3">
        <GuideBlock
          idea="Vas a ver que todos los candidatos Ax están restringidos a Col(A), y que mínimos cuadrados elige el más cercano a b."
          tryIt="Mueve x y observa el error. El mínimo aparece cuando b−Ax es perpendicular al espacio columna."
          concept="No minimizamos ‖x‖; minimizamos ‖Ax−b‖²."
        />

        <p className="sr-only">{ariaSummary}</p>

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={[
              { id: 'geo', label: 'Geometría' },
              { id: 'error', label: 'Error' },
              { id: 'general', label: 'Generalizar' },
            ]}
            value={mode}
            onChange={(id) => setMode(id as Mode)}
          />
        </div>

        <ChipRow>
          <Chip
            active={preset === 'inexact'}
            onClick={() => applyPreset('inexact')}
          >
            Sin solución exacta
          </Chip>
          <Chip active={preset === 'exact'} onClick={() => applyPreset('exact')}>
            Solución exacta
          </Chip>
          <Chip active={preset === 'reg'} onClick={() => applyPreset('reg')}>
            Regresión
          </Chip>
        </ChipRow>

        <div className="flex flex-wrap items-center gap-2">
          {view === 'reg' ? (
            <>
              <Badge tone="neutral">Vista de datos · no es el plano Col(A)</Badge>
              {Math.abs(beta1 - regB1Hat) < X_TOL &&
              Math.abs(beta0 - regB0Hat) < X_TOL ? (
                <Badge tone="ok">MÍNIMO ✓</Badge>
              ) : null}
            </>
          ) : (
            <>
              <Badge tone={lsq.exact ? 'ok' : 'warn'}>{statusCol}</Badge>
              {atOpt ? <Badge tone="ok">MÍNIMO ✓</Badge> : null}
              {aZero ? <Badge tone="bad">A = 0</Badge> : null}
              {rankA === 0 ? null : (
                <span className="font-mono text-xs text-[var(--fg-muted)]">
                  rango(A) = {rankA}
                </span>
              )}
            </>
          )}
        </div>

        {/* ——— Geometría / Regresión ——— */}
        {mode === 'geo' && view === 'col' && (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full touch-none rounded-xl border border-[var(--border)] bg-[var(--bg)]"
            role="img"
            aria-label={ariaSummary}
          >
            <defs>
              <ArrowMarker id={`${uid}-a`} color={COLOR_U} />
              <ArrowMarker id={`${uid}-ax`} color={COLOR_V} />
              <ArrowMarker id={`${uid}-hat`} color={COLOR_W} />
              <clipPath id={`${uid}-clip`}>
                <rect x={0} y={0} width={W} height={H} />
              </clipPath>
            </defs>

            <Axes W={W} H={H} ox={OX} oy={OY} S={S} />

            {/* Col(A) = span{a} */}
            {!aZero && (
              <line
                x1={spanA.x}
                y1={spanA.y}
                x2={spanB.x}
                y2={spanB.y}
                stroke={COLOR_U}
                strokeWidth={1.6}
                opacity={0.4}
                strokeDasharray="6 4"
                clipPath={`url(#${uid}-clip)`}
              />
            )}
            {!aZero && (
              <text
                x={spanB.x - nDir.x * 36}
                y={spanB.y + nDir.y * 36 - 8}
                fontSize={11}
                fontWeight={700}
                fill={COLOR_U}
                opacity={0.75}
              >
                Col(A)
              </text>
            )}

            {/* vector a */}
            {!aZero && (
              <line
                x1={OX}
                y1={OY}
                x2={pa.x}
                y2={pa.y}
                stroke={COLOR_U}
                strokeWidth={2.4}
                markerEnd={`url(#${uid}-a)`}
              />
            )}

            {/* current error Ax → b */}
            {showCurErr && (
              <line
                x1={pAx.x}
                y1={pAx.y}
                x2={pb.x}
                y2={pb.y}
                stroke="var(--fg-muted)"
                strokeWidth={1.6}
                strokeDasharray="4 3"
                opacity={0.7}
              />
            )}

            {/* optimal residual b̂ → b */}
            {!residualTiny && (
              <line
                x1={pHat.x}
                y1={pHat.y}
                x2={pb.x}
                y2={pb.y}
                stroke={atOpt ? 'var(--fg-muted)' : COLOR_W}
                strokeWidth={atOpt ? 2 : 1.5}
                strokeDasharray={atOpt ? undefined : '5 4'}
                opacity={atOpt ? 0.75 : 0.55}
              />
            )}

            {/* Ax̂ orange */}
            {!aZero && Math.hypot(bHat2.x, bHat2.y) > LSQ_EPS && (
              <line
                x1={OX}
                y1={OY}
                x2={pHat.x}
                y2={pHat.y}
                stroke={COLOR_W}
                strokeWidth={atOpt ? 3.2 : 2.6}
                markerEnd={`url(#${uid}-hat)`}
                opacity={0.95}
              />
            )}

            {/* Ax current (teal) — hide tip when merged at optimum */}
            {!aZero && !atOpt && Math.hypot(Ax2.x, Ax2.y) > LSQ_EPS && (
              <line
                x1={OX}
                y1={OY}
                x2={pAx.x}
                y2={pAx.y}
                stroke={COLOR_V}
                strokeWidth={2.2}
                markerEnd={`url(#${uid}-ax)`}
                opacity={0.9}
              />
            )}

            {rightMark ? (
              <path d={rightMark} fill="none" stroke={COLOR_W} strokeWidth={1.7} />
            ) : null}

            {/* points */}
            {!aZero && (
              <circle
                cx={atOpt ? pHat.x : pAx.x}
                cy={atOpt ? pHat.y : pAx.y}
                r={atOpt ? 6 : 5}
                fill={atOpt ? COLOR_W : COLOR_V}
              />
            )}
            {!aZero && !atOpt && (
              <circle cx={pHat.x} cy={pHat.y} r={5} fill={COLOR_W} />
            )}
            <circle
              cx={pb.x}
              cy={pb.y}
              r={6}
              fill={COLOR_V}
              fillOpacity={0.2}
              stroke={COLOR_V}
              strokeWidth={1.4}
            />

            {/* labels */}
            {!aZero && (
              <text
                x={aLab.x}
                y={aLab.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={12}
                fontWeight={700}
                fill={COLOR_U}
              >
                a
              </text>
            )}
            <text
              x={bLab.x}
              y={bLab.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={13}
              fontWeight={700}
              fill={COLOR_V}
            >
              b
            </text>
            {!aZero && !atOpt && (
              <text
                x={pAx.x + 10}
                y={pAx.y - 10}
                fontSize={12}
                fontWeight={700}
                fill={COLOR_V}
              >
                Ax
              </text>
            )}
            {!aZero && (
              <text
                x={pHat.x + (atOpt ? 12 : 10)}
                y={pHat.y - (atOpt ? 12 : 10)}
                fontSize={12}
                fontWeight={700}
                fill={COLOR_W}
              >
                {atOpt ? 'Ax = Ax̂' : 'Ax̂'}
              </text>
            )}
            {!residualTiny && (
              <text
                x={(pHat.x + pb.x) / 2 + 10}
                y={(pHat.y + pb.y) / 2 - 6}
                fontSize={12}
                fontWeight={700}
                fill="var(--fg-muted)"
              >
                r
              </text>
            )}

            {aZero && (
              <text
                x={W / 2}
                y={OY + 40}
                textAnchor="middle"
                fontSize={12}
                fill="var(--fg-muted)"
              >
                A = 0: Col(A) = {'{0}'}; x̂ = 0 por convención de la seudoinversa.
              </text>
            )}
          </svg>
        )}

        {mode === 'geo' && view === 'reg' && (
          <svg
            viewBox={`0 0 ${regW} ${regH}`}
            className="h-auto w-full rounded-xl border border-[var(--border)] bg-[var(--bg)]"
            role="img"
            aria-label={ariaSummary}
          >
            <line
              x1={regPad}
              y1={ry(0)}
              x2={regW - regPad}
              y2={ry(0)}
              stroke="var(--fg-muted)"
              opacity={0.35}
            />
            <line
              x1={rx(0.5)}
              y1={regPad}
              x2={rx(0.5)}
              y2={regH - regPad}
              stroke="var(--fg-muted)"
              opacity={0.35}
            />
            <text x={regW - regPad + 4} y={ry(0) - 6} fontSize={11} fill="var(--fg-muted)">
              x
            </text>
            <text x={rx(0.5) + 6} y={regPad + 4} fontSize={11} fill="var(--fg-muted)">
              y
            </text>

            {/* fitted line */}
            <line
              x1={rx(rxMin)}
              y1={ry(regYHat(rxMin))}
              x2={rx(rxMax)}
              y2={ry(regYHat(rxMax))}
              stroke={COLOR_W}
              strokeWidth={2.4}
            />
            {/* optimal line faint */}
            <line
              x1={rx(rxMin)}
              y1={ry(regB0Hat + regB1Hat * rxMin)}
              x2={rx(rxMax)}
              y2={ry(regB0Hat + regB1Hat * rxMax)}
              stroke={COLOR_U}
              strokeWidth={1.4}
              strokeDasharray="5 4"
              opacity={0.45}
            />

            {REG_XS.map((xi, i) => {
              const yi = REG_B[i]!;
              const yFit = regYHat(xi);
              return (
                <g key={xi}>
                  <line
                    x1={rx(xi)}
                    y1={ry(yi)}
                    x2={rx(xi)}
                    y2={ry(yFit)}
                    stroke="var(--fg-muted)"
                    strokeWidth={1.6}
                    opacity={0.75}
                  />
                  <circle
                    cx={rx(xi)}
                    cy={ry(yi)}
                    r={5}
                    fill={COLOR_V}
                    stroke={COLOR_V}
                  />
                  <text
                    x={rx(xi) + 8}
                    y={ry(yi) - 8}
                    fontSize={10}
                    fill="var(--fg-muted)"
                  >
                    ({xi},{formatNum(yi, 1)})
                  </text>
                </g>
              );
            })}

            <text x={regPad} y={22} fontSize={11} fill="var(--fg-muted)">
              Residuos verticales · SSE = Σ(yᵢ − ŷᵢ)²
            </text>
          </svg>
        )}

        {/* ——— Error mode ——— */}
        {mode === 'error' && view === 'col' && (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full rounded-xl border border-[var(--border)] bg-[var(--bg)]"
            role="img"
            aria-label={`Parábola del error: E(x)=${asErrorSq ? '‖Ax−b‖²' : '‖Ax−b‖'}`}
          >
            <line
              x1={plotL}
              y1={plotB}
              x2={plotR}
              y2={plotB}
              stroke="var(--fg-muted)"
              opacity={0.4}
            />
            <line
              x1={plotL}
              y1={plotT}
              x2={plotL}
              y2={plotB}
              stroke="var(--fg-muted)"
              opacity={0.4}
            />
            <text x={plotR} y={plotB + 18} fontSize={11} fill="var(--fg-muted)">
              x
            </text>
            <text x={plotL - 6} y={plotT + 4} fontSize={11} fill="var(--fg-muted)" textAnchor="end">
              {asErrorSq ? 'E(x)' : '‖r‖'}
            </text>

            {!aZero && (
              <path
                d={errPath}
                fill="none"
                stroke={COLOR_U}
                strokeWidth={2.2}
              />
            )}

            {/* x̂ vertical */}
            {!aZero && (
              <>
                <line
                  x1={xToPlot(xHat)}
                  y1={eToPlot(eMinPlot)}
                  x2={xToPlot(xHat)}
                  y2={plotB}
                  stroke={COLOR_W}
                  strokeWidth={1.4}
                  strokeDasharray="4 3"
                  opacity={0.7}
                />
                <circle
                  cx={xToPlot(xHat)}
                  cy={eToPlot(eMinPlot)}
                  r={6}
                  fill={COLOR_W}
                />
                <text
                  x={xToPlot(xHat)}
                  y={eToPlot(eMinPlot) - 12}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={700}
                  fill={COLOR_W}
                >
                  x̂
                </text>
              </>
            )}

            {/* current x */}
            {!aZero && (
              <>
                <circle
                  cx={xToPlot(x)}
                  cy={eToPlot(eCurPlot)}
                  r={6}
                  fill={COLOR_V}
                />
                <text
                  x={xToPlot(x) + 10}
                  y={eToPlot(eCurPlot) - 8}
                  fontSize={11}
                  fontWeight={700}
                  fill={COLOR_V}
                >
                  x
                </text>
              </>
            )}

            {aZero && (
              <text
                x={W / 2}
                y={H / 2}
                textAnchor="middle"
                fontSize={12}
                fill="var(--fg-muted)"
              >
                A = 0: E(x) = ‖b‖² constante.
              </text>
            )}
          </svg>
        )}

        {mode === 'error' && view === 'reg' && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-3 text-sm">
            <p className="font-mono text-xs text-[var(--fg-muted)]">
              SSE(β) = Σ (yᵢ − β₀ − β₁ xᵢ)²
            </p>
            <p className="mt-2 font-mono">
              SSE actual = {formatNum(regSSE)}
              {' · '}
              SSE mín = {formatNum(regSSEMin)}
            </p>
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              Óptimo en β̂ = {formatVec(regLsq.xHat)}. Usa el deslizador de β₁ (y β₀) en
              controles; la geometría muestra residuos verticales del conjunto de datos.
            </p>
          </div>
        )}

        {/* ——— Generalizar ——— */}
        {mode === 'general' && (
          <div className="space-y-3">
            <svg
              viewBox="0 0 420 200"
              className="h-auto w-full rounded-xl border border-[var(--border)] bg-[var(--bg)]"
              role="img"
              aria-label="Diagrama conceptual: A envía Rⁿ a Col(A) dentro de Rᵐ"
            >
              <defs>
                <ArrowMarker id={`${uid}-gen-a`} color={COLOR_U} />
              </defs>
              {/* R^n domain */}
              <rect
                x={24}
                y={50}
                width={100}
                height={100}
                rx={8}
                fill="var(--accent-soft)"
                stroke="var(--border)"
              />
              <text x={74} y={40} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--fg)">
                ℝⁿ
              </text>
              <text x={74} y={108} textAnchor="middle" fontSize={12} fill="var(--fg-muted)">
                x
              </text>

              {/* arrow A */}
              <line
                x1={132}
                y1={100}
                x2={188}
                y2={100}
                stroke={COLOR_U}
                strokeWidth={2.2}
                markerEnd={`url(#${uid}-gen-a)`}
              />
              <text x={160} y={88} textAnchor="middle" fontSize={12} fontWeight={700} fill={COLOR_U}>
                A
              </text>

              {/* R^m with Col(A) plane sketch */}
              <rect
                x={200}
                y={30}
                width={196}
                height={150}
                rx={8}
                fill="var(--bg)"
                stroke="var(--border)"
              />
              <text x={298} y={24} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--fg)">
                ℝᵐ
              </text>
              {/* isometric-ish plane for Col(A) */}
              <polygon
                points="230,140 300,110 370,130 300,160"
                fill="var(--accent-soft)"
                stroke={COLOR_U}
                strokeWidth={1.5}
                opacity={0.85}
              />
              <text x={300} y={138} textAnchor="middle" fontSize={11} fontWeight={700} fill={COLOR_U}>
                Col(A)
              </text>
              {/* b̂ on plane */}
              <circle cx={300} cy={135} r={5} fill={COLOR_W} />
              <text x={312} y={132} fontSize={11} fontWeight={700} fill={COLOR_W}>
                b̂
              </text>
              {/* b off plane */}
              <circle cx={318} cy={78} r={5} fill={COLOR_V} />
              <text x={328} y={76} fontSize={11} fontWeight={700} fill={COLOR_V}>
                b
              </text>
              <line
                x1={300}
                y1={135}
                x2={318}
                y2={78}
                stroke="var(--fg-muted)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
              <text x={300} y={100} fontSize={11} fill="var(--fg-muted)">
                r
              </text>
            </svg>

            <div className="rounded-xl border border-[var(--border)] px-3 py-3 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                Ejemplo 3×2 (solo lectura)
              </p>
              <p className="mt-1 font-mono text-xs leading-relaxed">
                A = [[1, 0], [0, 1], [1, 1]]
                <br />
                b = {formatVec(GEN_B)}
                <br />
                x̂ = {formatVec(genLsq.xHat)}
                <br />
                b̂ = {formatVec(genLsq.bHat)}
                <br />
                ‖r‖₂ = {formatNum(genLsq.residualNorm)}
              </p>
              <p className="mt-2 text-xs text-[var(--fg-muted)]">
                b̂ es siempre único (proyección ortogonal sobre Col(A)). x̂ es único si y
                solo si A tiene rango de columna completo
                {genFullRank ? ' (aquí sí: rango = 2)' : ' (aquí no)'}.
              </p>
            </div>
          </div>
        )}

        {/* Card */}
        {mode !== 'general' && view === 'col' && (
          <div className="rounded-xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_55%,transparent)] px-3 py-3 font-mono text-sm">
            <p>
              x̂ = {formatNum(xHat)}
              {' · '}
              Ax̂ = {formatVec(lsq.bHat)}
            </p>
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              ‖r‖₂ = {formatNum(lsq.residualNorm)}
              {' · '}
              Aᵀr ≈ {formatVec(lsq.AtResidual)}
              {atOk ? ' ≈ 0 ✓' : ''}
            </p>
            {mode === 'error' && (
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                {asErrorSq ? 'E(x)' : '‖Ax−b‖'} actual = {formatNum(eCurPlot)}
                {' · '}
                mín = {formatNum(eMinPlot)}
              </p>
            )}
          </div>
        )}

        {mode !== 'general' && view === 'reg' && (
          <div className="rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
            <p>
              β̂ = ({formatNum(regB0Hat)}, {formatNum(regB1Hat)})
            </p>
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              actual (β₀, β₁) = ({formatNum(beta0)}, {formatNum(beta1)})
              {' · '}
              SSE = {formatNum(regSSE)} (mín {formatNum(regSSEMin)})
            </p>
          </div>
        )}

        <ControlsStack>
          {view === 'col' && mode !== 'general' && (
            <SliderRow
              label="x"
              ariaLabel="Escalar x sobre Col(A)"
              value={Number(x.toFixed(2))}
              min={Number(sliderMin.toFixed(1))}
              max={Number(sliderMax.toFixed(1))}
              step={0.05}
              onChange={(v) => {
                stopAnim();
                setX(v);
              }}
            />
          )}
          {view === 'reg' && mode !== 'general' && (
            <>
              <SliderRow
                label="β₀"
                ariaLabel="Intercepto beta 0"
                value={Number(beta0.toFixed(2))}
                min={-1}
                max={2}
                step={0.05}
                onChange={(v) => {
                  stopAnim();
                  setBeta0(v);
                }}
              />
              <SliderRow
                label="β₁"
                ariaLabel="Pendiente beta 1"
                value={Number(beta1.toFixed(2))}
                min={0}
                max={2}
                step={0.05}
                onChange={(v) => {
                  stopAnim();
                  setBeta1(v);
                }}
              />
            </>
          )}
          {mode === 'error' && view === 'col' && (
            <ToggleRow
              label="Mostrar Error² (desactivar = Distancia ‖Ax−b‖)"
              checked={asErrorSq}
              onChange={setAsErrorSq}
            />
          )}
          <ButtonRow>
            <VizButton onClick={seekMinimum}>Buscar mínimo</VizButton>
          </ButtonRow>
        </ControlsStack>

        {view === 'col' && (
          <CollapsibleEdit
            label="Editar A (2×1) y b"
            open={editOpen}
            onToggle={() => setEditOpen((o) => !o)}
          >
            <ControlsStack>
              <label className="flex items-center gap-2 text-sm">
                <span className="w-10 shrink-0 font-mono text-[var(--fg-muted)]">a₁₁</span>
                <input
                  type="number"
                  step={0.1}
                  value={A[0]?.[0] ?? 0}
                  onChange={(e) => setAEntry(0, Number(e.target.value))}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-mono text-sm"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="w-10 shrink-0 font-mono text-[var(--fg-muted)]">a₂₁</span>
                <input
                  type="number"
                  step={0.1}
                  value={A[1]?.[0] ?? 0}
                  onChange={(e) => setAEntry(1, Number(e.target.value))}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-mono text-sm"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="w-10 shrink-0 font-mono text-[var(--fg-muted)]">b₁</span>
                <input
                  type="number"
                  step={0.1}
                  value={b[0] ?? 0}
                  onChange={(e) => setBEntry(0, Number(e.target.value))}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-mono text-sm"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="w-10 shrink-0 font-mono text-[var(--fg-muted)]">b₂</span>
                <input
                  type="number"
                  step={0.1}
                  value={b[1] ?? 0}
                  onChange={(e) => setBEntry(1, Number(e.target.value))}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-mono text-sm"
                />
              </label>
            </ControlsStack>
          </CollapsibleEdit>
        )}
      </div>
    </VizPanel>
  );
}
