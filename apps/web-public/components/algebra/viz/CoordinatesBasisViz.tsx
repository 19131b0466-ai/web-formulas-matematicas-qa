'use client';

import { useId, useMemo, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  SliderRow,
  ToggleRow,
  VizButton,
  VizPanel,
  joinCaption,
} from './controls';
import { DET_EPS } from './detHelpers';
import { presentLin } from './linAlg';
import { add, applyMat, det2, inv2, norm, scale, type Mat2, type Vec2 } from './math2d';
import {
  ArrowMarker,
  Axes,
  COLOR_U,
  COLOR_V,
  COLOR_W,
  VEC_H,
  VEC_W,
  autoScale,
  clampVec,
  formatPair,
  labelOffset,
  useVecDrag,
} from './vectorPlane';

const W = VEC_W;
const H = VEC_H;
const ox = W / 2;
const oy = H / 2;
const CLAMP = 3.8;

type Tab = 'vis' | 'alg';

function matFromBasis(u: Vec2, v: Vec2): Mat2 {
  return [
    [u.x, v.x],
    [u.y, v.y],
  ];
}

export function CoordinatesBasisViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [u, setU] = useState<Vec2>({ x: 2, y: 0.5 });
  const [v, setV] = useState<Vec2>({ x: 0.5, y: 2 });
  const [s, setS] = useState(1.2);
  const [t, setT] = useState(0.8);
  const [tab, setTab] = useState<Tab>('vis');
  const [keepX, setKeepX] = useState(false);

  const su = clampVec(u, CLAMP);
  const sv = clampVec(v, CLAMP);
  const P = useMemo(() => matFromBasis(su, sv), [su, sv]);
  const det = det2(P);
  const invertible = Math.abs(det) > DET_EPS;
  const Pinv = useMemo(() => (invertible ? inv2(P) : null), [P, invertible]);

  const x = add(scale(su, s), scale(sv, t));
  const suVec = scale(su, s);

  const maxAbs = Math.max(1.5, norm(su), norm(sv), norm(x), norm(suVec), 2.2);
  const S = autoScale(maxAbs, Math.min(W, H), 44, 26, 56);
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });

  const dragU = useVecDrag((p) => {
    const nu = clampVec(p, CLAMP);
    if (keepX && invertible) {
      const inv = inv2(matFromBasis(nu, sv));
      if (inv) {
        const c = applyMat(inv, x);
        setS(c.x);
        setT(c.y);
      }
    }
    setU(nu);
  }, S, { x: ox, y: oy });

  const dragV = useVecDrag((p) => {
    const nv = clampVec(p, CLAMP);
    if (keepX && invertible) {
      const inv = inv2(matFromBasis(su, nv));
      if (inv) {
        const c = applyMat(inv, x);
        setS(c.x);
        setT(c.y);
      }
    }
    setV(nv);
  }, S, { x: ox, y: oy });

  const dragX = useVecDrag((p) => {
    const nx = clampVec(p, CLAMP);
    if (!Pinv) return;
    const c = applyMat(Pinv, nx);
    setS(c.x);
    setT(c.y);
  }, S, { x: ox, y: oy });

  const pu = to(su);
  const pv = to(sv);
  const px = to(x);
  const pSu = to(suVec);

  function applyPreset(kind: string) {
    const prevX = x;
    if (kind === 'can') {
      setU({ x: 1, y: 0 });
      setV({ x: 0, y: 1 });
      if (keepX) {
        setS(prevX.x);
        setT(prevX.y);
      } else {
        setS(1.5);
        setT(1);
      }
    } else if (kind === 'obl') {
      setU({ x: 2, y: 0.5 });
      setV({ x: 0.5, y: 2 });
      if (keepX) {
        const inv = inv2(
          matFromBasis({ x: 2, y: 0.5 }, { x: 0.5, y: 2 }),
        );
        if (inv) {
          const c = applyMat(inv, prevX);
          setS(c.x);
          setT(c.y);
        } else {
          setS(1.2);
          setT(0.8);
        }
      } else {
        setS(1.2);
        setT(0.8);
      }
    } else if (kind === 'ej') {
      // u=(1,1), v=(-1,1), x=(1,3) → [x]_B=(2,1)
      setU({ x: 1, y: 1 });
      setV({ x: -1, y: 1 });
      if (keepX) {
        const inv = inv2(matFromBasis({ x: 1, y: 1 }, { x: -1, y: 1 }));
        if (inv) {
          const c = applyMat(inv, prevX);
          setS(c.x);
          setT(c.y);
        }
      } else {
        setS(2);
        setT(1);
      }
    } else if (kind === 'rot') {
      const th = Math.PI / 6;
      const c = Math.cos(th);
      const sn = Math.sin(th);
      setU({ x: c, y: sn });
      setV({ x: -sn, y: c });
      if (keepX) {
        const inv = inv2(matFromBasis({ x: c, y: sn }, { x: -sn, y: c }));
        if (inv) {
          const coords = applyMat(inv, prevX);
          setS(coords.x);
          setT(coords.y);
        }
      } else {
        setS(1.4);
        setT(0.6);
      }
    }
  }

  return (
    <VizPanel
      caption={joinCaption(
        invertible
          ? `[x]_B = (${presentLin(s)}, ${presentLin(t)})`
          : 'u y v no forman una base',
        `x = ${formatPair(x.x, x.y)}`,
      )}
    >
      <div className="space-y-3">
        <div className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--accent-soft)_30%,transparent)] px-3 py-2 text-sm">
          <p className="font-medium text-[var(--fg)]">
            Idea — Si B=&#123;u,v&#125; es base, todo x se escribe de forma única x=su+tv y las
            coordenadas en B son [x]_B=(s,t).
          </p>
          <p className="mt-1 text-[var(--fg-muted)]">
            Pruébalo — Mueve s y t, o arrastra la punta naranja de x (resuelve s,t con P⁻¹). Compara
            coordenadas estándar con [x]_B.
          </p>
        </div>

        <ButtonRow>
          <VizButton active={tab === 'vis'} onClick={() => setTab('vis')}>
            Visual
          </VizButton>
          <VizButton active={tab === 'alg'} onClick={() => setTab('alg')}>
            Algebraica
          </VizButton>
        </ButtonRow>

        {!invertible ? (
          <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-800 dark:text-red-200">
            u y v no forman una base — no hay coordenadas únicas [x]_B.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3 rounded-lg border border-[var(--border)] px-3 py-2 font-mono text-sm">
            <span>
              x<sub>est</sub> = {formatPair(x.x, x.y)}
            </span>
            <span className="text-[var(--fg-muted)]">·</span>
            <span style={{ color: COLOR_W }}>
              [x]_B = ({presentLin(s)}, {presentLin(t)})
            </span>
          </div>
        )}

        {tab === 'vis' ? (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full touch-none rounded-xl border border-[var(--border)]"
            role="img"
            aria-label="Coordenadas en una base"
          >
            <defs>
              <ArrowMarker id={`${uid}-u`} color={COLOR_U} />
              <ArrowMarker id={`${uid}-v`} color={COLOR_V} />
              <ArrowMarker id={`${uid}-x`} color={COLOR_W} />
            </defs>

            <Axes W={W} H={H} ox={ox} oy={oy} S={S} xLabel="x" yLabel="y" />

            {invertible
              ? (() => {
                  const lines = [];
                  for (let k = -2; k <= 2; k++) {
                    const a = add(scale(su, k), scale(sv, -2));
                    const b = add(scale(su, k), scale(sv, 2));
                    lines.push(
                      <line
                        key={`gk${k}`}
                        x1={to(a).x}
                        y1={to(a).y}
                        x2={to(b).x}
                        y2={to(b).y}
                        stroke={COLOR_W}
                        strokeWidth={1}
                        opacity={0.18}
                      />,
                    );
                  }
                  for (let l = -2; l <= 2; l++) {
                    const a = add(scale(su, -2), scale(sv, l));
                    const b = add(scale(su, 2), scale(sv, l));
                    lines.push(
                      <line
                        key={`gl${l}`}
                        x1={to(a).x}
                        y1={to(a).y}
                        x2={to(b).x}
                        y2={to(b).y}
                        stroke={COLOR_W}
                        strokeWidth={1}
                        opacity={0.18}
                      />,
                    );
                  }
                  return <g>{lines}</g>;
                })()
              : null}

            {/* basis vectors */}
            {norm(su) > DET_EPS ? (
              <line
                x1={ox}
                y1={oy}
                x2={pu.x}
                y2={pu.y}
                stroke={COLOR_U}
                strokeWidth={2.2}
                markerEnd={`url(#${uid}-u)`}
              />
            ) : null}
            {norm(sv) > DET_EPS ? (
              <line
                x1={ox}
                y1={oy}
                x2={pv.x}
                y2={pv.y}
                stroke={COLOR_V}
                strokeWidth={2.2}
                markerEnd={`url(#${uid}-v)`}
              />
            ) : null}

            {/* path O → su → su+tv = x */}
            {invertible && Math.abs(s) > 0.03 ? (
              <line
                x1={ox}
                y1={oy}
                x2={pSu.x}
                y2={pSu.y}
                stroke={COLOR_U}
                strokeWidth={1.8}
                strokeDasharray="5 3"
                opacity={0.85}
              />
            ) : null}
            {invertible && Math.abs(t) > 0.03 ? (
              <line
                x1={pSu.x}
                y1={pSu.y}
                x2={px.x}
                y2={px.y}
                stroke={COLOR_V}
                strokeWidth={1.8}
                strokeDasharray="5 3"
                opacity={0.85}
              />
            ) : null}

            {norm(x) > DET_EPS ? (
              <line
                x1={ox}
                y1={oy}
                x2={px.x}
                y2={px.y}
                stroke={COLOR_W}
                strokeWidth={3}
                markerEnd={`url(#${uid}-x)`}
              />
            ) : (
              <circle cx={ox} cy={oy} r={6} fill={COLOR_W} />
            )}

            <text
              x={labelOffset(su, pu, ox, oy, 14).x}
              y={labelOffset(su, pu, ox, oy, 14).y}
              fontSize={12}
              fontWeight={600}
              fill={COLOR_U}
              textAnchor="middle"
            >
              u
            </text>
            <text
              x={labelOffset(sv, pv, ox, oy, 14).x}
              y={labelOffset(sv, pv, ox, oy, 14).y}
              fontSize={12}
              fontWeight={600}
              fill={COLOR_V}
              textAnchor="middle"
            >
              v
            </text>
            <text
              x={labelOffset(x, px, ox, oy, 16).x}
              y={labelOffset(x, px, ox, oy, 16).y}
              fontSize={13}
              fontWeight={700}
              fill={COLOR_W}
              textAnchor="middle"
            >
              x
            </text>

            <circle
              cx={pu.x}
              cy={pu.y}
              r={8}
              fill={COLOR_U}
              fillOpacity={0.18}
              stroke={COLOR_U}
              style={{ cursor: 'grab' }}
              {...dragU}
            />
            <circle
              cx={pv.x}
              cy={pv.y}
              r={8}
              fill={COLOR_V}
              fillOpacity={0.18}
              stroke={COLOR_V}
              style={{ cursor: 'grab' }}
              {...dragV}
            />
            {invertible ? (
              <circle
                cx={px.x}
                cy={px.y}
                r={10}
                fill={COLOR_W}
                fillOpacity={0.25}
                stroke={COLOR_W}
                strokeWidth={1.5}
                style={{ cursor: 'grab' }}
                {...dragX}
              />
            ) : null}
          </svg>
        ) : (
          <div className="space-y-2 rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
            <p>
              P_B = [u | v] = [{' '}
              {presentLin(su.x)}, {presentLin(sv.x)} ; {presentLin(su.y)}, {presentLin(sv.y)} ]
            </p>
            <p>
              P_B [s; t] = x
            </p>
            {invertible ? (
              <>
                <p>
                  [s; t] = ({presentLin(s)}, {presentLin(t)})ᵀ
                </p>
                <p>
                  x = {presentLin(s)}u + {presentLin(t)}v = {formatPair(x.x, x.y)}
                </p>
                <p className="text-xs text-[var(--fg-muted)]">
                  det(P_B) = {presentLin(det)} ≠ 0 ⇒ coordenadas únicas
                </p>
              </>
            ) : (
              <p className="text-red-700 dark:text-red-300">
                det(P_B) ≈ 0 ⇒ u y v no forman una base; no hay [x]_B único.
              </p>
            )}
          </div>
        )}

        <ControlsStack>
          <SliderRow
            label="s"
            value={s}
            min={-3}
            max={3}
            step={0.1}
            onChange={setS}
          />
          <SliderRow
            label="t"
            value={t}
            min={-3}
            max={3}
            step={0.1}
            onChange={setT}
          />
        </ControlsStack>

        <ToggleRow label="Mantener x fijo" checked={keepX} onChange={setKeepX} />

        <ButtonRow>
          <VizButton onClick={() => applyPreset('can')}>Canónica</VizButton>
          <VizButton onClick={() => applyPreset('obl')}>Oblicua</VizButton>
          <VizButton onClick={() => applyPreset('ej')}>Ejemplo (2,1)</VizButton>
          <VizButton onClick={() => applyPreset('rot')}>Rotada</VizButton>
        </ButtonRow>

        <details className="rounded-lg border border-[var(--border)] px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium">Editar base</summary>
          <ControlsStack>
            <SliderRow
              label="uₓ"
              value={su.x}
              min={-3}
              max={3}
              step={0.1}
              onChange={(nx) => {
                const nu = { ...su, x: nx };
                if (keepX && invertible) {
                  const inv = inv2(matFromBasis(nu, sv));
                  if (inv) {
                    const c = applyMat(inv, x);
                    setS(c.x);
                    setT(c.y);
                  }
                }
                setU(nu);
              }}
            />
            <SliderRow
              label="uᵧ"
              value={su.y}
              min={-3}
              max={3}
              step={0.1}
              onChange={(ny) => {
                const nu = { ...su, y: ny };
                if (keepX && invertible) {
                  const inv = inv2(matFromBasis(nu, sv));
                  if (inv) {
                    const c = applyMat(inv, x);
                    setS(c.x);
                    setT(c.y);
                  }
                }
                setU(nu);
              }}
            />
            <SliderRow
              label="vₓ"
              value={sv.x}
              min={-3}
              max={3}
              step={0.1}
              onChange={(nx) => {
                const nv = { ...sv, x: nx };
                if (keepX && invertible) {
                  const inv = inv2(matFromBasis(su, nv));
                  if (inv) {
                    const c = applyMat(inv, x);
                    setS(c.x);
                    setT(c.y);
                  }
                }
                setV(nv);
              }}
            />
            <SliderRow
              label="vᵧ"
              value={sv.y}
              min={-3}
              max={3}
              step={0.1}
              onChange={(ny) => {
                const nv = { ...sv, y: ny };
                if (keepX && invertible) {
                  const inv = inv2(matFromBasis(su, nv));
                  if (inv) {
                    const c = applyMat(inv, x);
                    setS(c.x);
                    setT(c.y);
                  }
                }
                setV(nv);
              }}
            />
          </ControlsStack>
        </details>
      </div>
    </VizPanel>
  );
}
