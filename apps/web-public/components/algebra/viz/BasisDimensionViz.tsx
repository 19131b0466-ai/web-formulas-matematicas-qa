'use client';

import { useId, useMemo, useState, type ReactNode } from 'react';
import {
  ButtonRow,
  ControlsStack,
  SliderRow,
  VizButton,
  VizPanel,
  joinCaption,
} from './controls';
import { LIN_EPS, presentLin, rank } from './linAlg';
import { add, det2, norm, scale, type Mat2, type Vec2 } from './math2d';
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
const CLAMP = 3.5;

type Tab = 'geo' | 'alg';

function colsMatrix(vecs: Vec2[]): number[][] {
  return [
    vecs.map((v) => v.x),
    vecs.map((v) => v.y),
  ];
}

export function BasisDimensionViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [u, setU] = useState<Vec2>({ x: 2, y: 0.5 });
  const [v, setV] = useState<Vec2>({ x: 0.6, y: 1.8 });
  const [w, setW] = useState<Vec2 | null>(null);
  const [tab, setTab] = useState<Tab>('geo');
  const [altBasis, setAltBasis] = useState(false);

  const su = clampVec(u, CLAMP);
  const sv = clampVec(v, CLAMP);
  const sw = w ? clampVec(w, CLAMP) : null;

  const vecs = useMemo(() => (sw ? [su, sv, sw] : [su, sv]), [su, sv, sw]);
  const n = vecs.length;
  const rnk = useMemo(() => rank(colsMatrix(vecs), LIN_EPS), [vecs]);
  const dim = rnk;

  const M: Mat2 = [
    [su.x, sv.x],
    [su.y, sv.y],
  ];
  const det = det2(M);

  // Independientes ⇔ rango = nº de vectores (en ℝ², 3 vectores nunca lo son)
  const indepOk = rnk === n;
  const spansR2 = dim === 2;
  const isBasisR2 = indepOk && spansR2;

  const nonzero = vecs.filter((p) => norm(p) > LIN_EPS);
  const spanBasisNote =
    !isBasisR2 && dim === 1 && nonzero.length > 0
      ? 'No son base de ℝ², pero un generador no nulo sí es base del span (dim 1).'
      : dim === 0
        ? 'Espacio cero: dim = 0.'
        : null;

  const maxAbs = Math.max(1.4, ...vecs.map((p) => norm(p)), spansR2 ? 2.4 : 2);
  const S = autoScale(maxAbs, Math.min(W, H), 44, 26, 58);
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });

  const dragU = useVecDrag((p) => setU(clampVec(p, CLAMP)), S, { x: ox, y: oy });
  const dragV = useVecDrag((p) => setV(clampVec(p, CLAMP)), S, { x: ox, y: oy });

  const pu = to(su);
  const pv = to(sv);
  const pw = sw ? to(sw) : null;

  function applyPreset(kind: string) {
    setW(null);
    setAltBasis(false);
    if (kind === 'basis') {
      setU({ x: 2, y: 0.5 });
      setV({ x: 0.6, y: 1.8 });
    } else if (kind === 'dep') {
      setU({ x: 1.2, y: 0.8 });
      setV({ x: 2.4, y: 1.6 });
    } else if (kind === 'red') {
      setU({ x: 2, y: 0.5 });
      setV({ x: 0.6, y: 1.8 });
      setW({ x: 2.6, y: 2.3 });
    } else if (kind === 'zero') {
      setU({ x: 0, y: 0 });
      setV({ x: 0, y: 0 });
    } else if (kind === 'one') {
      setU({ x: 2, y: 1 });
      setV({ x: 0, y: 0 });
    } else if (kind === 'other') {
      setAltBasis(true);
      setU({ x: 1, y: 1 });
      setV({ x: -1, y: 1 });
    } else if (kind === 'e1e2') {
      setU({ x: 1, y: 0 });
      setV({ x: 0, y: 1 });
    }
  }

  return (
    <VizPanel
      caption={joinCaption(
        `dim = ${dim}`,
        isBasisR2
          ? 'Base de ℝ²'
          : spansR2 && !indepOk
            ? 'Generan ℝ² pero no son base'
            : 'No son base de ℝ²',
      )}
    >
      <div className="space-y-3">
        <div className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--accent-soft)_30%,transparent)] px-3 py-2 text-sm">
          <p className="font-medium text-[var(--fg)]">
            Idea — Una base es un conjunto independiente que genera el espacio. La dimensión es el
            número de vectores en cualquier base.
          </p>
          <p className="mt-1 text-[var(--fg-muted)]">
            Pruébalo — Compara presets: base de ℝ², dependientes, redundante (quita el extra), o
            cambia de base canónica a oblicua (misma dim).
          </p>
        </div>

        <ButtonRow>
          <VizButton active={tab === 'geo'} onClick={() => setTab('geo')}>
            Geométrica
          </VizButton>
          <VizButton active={tab === 'alg'} onClick={() => setTab('alg')}>
            Algebraica
          </VizButton>
        </ButtonRow>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-md border px-2.5 py-1 font-mono text-xs font-semibold ${
              dim === 2
                ? 'border-[var(--accent-strong)]/40 bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                : dim === 1
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200'
                  : 'border-[var(--border)] text-[var(--fg-muted)]'
            }`}
          >
            dim = {dim}
          </span>
          <ul className="space-y-0.5 text-sm">
            <li>
              Independientes{' '}
              {indepOk ? (
                <span className="font-semibold text-[var(--accent-strong)]">✓</span>
              ) : (
                <span className="font-semibold text-red-600 dark:text-red-300">✕</span>
              )}
            </li>
            <li>
              Generan ℝ²{' '}
              {spansR2 ? (
                <span className="font-semibold text-[var(--accent-strong)]">✓</span>
              ) : (
                <span className="font-semibold text-red-600 dark:text-red-300">✕</span>
              )}
            </li>
            <li>
              Base de ℝ²{' '}
              {isBasisR2 ? (
                <span className="font-semibold text-[var(--accent-strong)]">✓</span>
              ) : (
                <span className="font-semibold text-red-600 dark:text-red-300">✕</span>
              )}
            </li>
          </ul>
        </div>

        {spanBasisNote ? (
          <p className="text-sm text-[var(--fg-muted)]">{spanBasisNote}</p>
        ) : null}
        {sw && dim === 2 ? (
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Generan ℝ², pero w es redundante: el conjunto no es independiente ⇒ no es base.
          </p>
        ) : null}

        {tab === 'geo' ? (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full touch-none rounded-xl border border-[var(--border)]"
            role="img"
            aria-label={`Dimensión ${dim}`}
          >
            <defs>
              <ArrowMarker id={`${uid}-u`} color={COLOR_U} />
              <ArrowMarker id={`${uid}-v`} color={COLOR_V} />
              <ArrowMarker id={`${uid}-w`} color={COLOR_W} />
            </defs>

            <Axes W={W} H={H} ox={ox} oy={oy} S={S} xLabel="x" yLabel="y" />

            {dim === 2
              ? (() => {
                  const lines: ReactNode[] = [];
                  for (let k = -2; k <= 2; k++) {
                    const a = add(scale(su, k), scale(sv, -2));
                    const b = add(scale(su, k), scale(sv, 2));
                    lines.push(
                      <line
                        key={`k${k}`}
                        x1={to(a).x}
                        y1={to(a).y}
                        x2={to(b).x}
                        y2={to(b).y}
                        stroke={COLOR_W}
                        strokeWidth={1}
                        opacity={0.2}
                      />,
                    );
                  }
                  for (let l = -2; l <= 2; l++) {
                    const a = add(scale(su, -2), scale(sv, l));
                    const b = add(scale(su, 2), scale(sv, l));
                    lines.push(
                      <line
                        key={`l${l}`}
                        x1={to(a).x}
                        y1={to(a).y}
                        x2={to(b).x}
                        y2={to(b).y}
                        stroke={COLOR_W}
                        strokeWidth={1}
                        opacity={0.2}
                      />,
                    );
                  }
                  return <g>{lines}</g>;
                })()
              : null}

            {dim === 1
              ? (() => {
                  const dir = norm(su) > LIN_EPS ? su : sv;
                  if (norm(dir) < LIN_EPS) return null;
                  const d = scale(dir, 1 / norm(dir));
                  const a = scale(d, -5);
                  const b = scale(d, 5);
                  return (
                    <line
                      x1={to(a).x}
                      y1={to(a).y}
                      x2={to(b).x}
                      y2={to(b).y}
                      stroke={COLOR_W}
                      strokeWidth={2}
                      opacity={0.5}
                    />
                  );
                })()
              : null}

            {dim === 0 ? <circle cx={ox} cy={oy} r={7} fill={COLOR_W} /> : null}

            {norm(su) > LIN_EPS ? (
              <line
                x1={ox}
                y1={oy}
                x2={pu.x}
                y2={pu.y}
                stroke={COLOR_U}
                strokeWidth={2.6}
                markerEnd={`url(#${uid}-u)`}
              />
            ) : null}
            {norm(sv) > LIN_EPS ? (
              <line
                x1={ox}
                y1={oy}
                x2={pv.x}
                y2={pv.y}
                stroke={COLOR_V}
                strokeWidth={2.6}
                markerEnd={`url(#${uid}-v)`}
              />
            ) : null}
            {sw && pw && norm(sw) > LIN_EPS ? (
              <line
                x1={ox}
                y1={oy}
                x2={pw.x}
                y2={pw.y}
                stroke={COLOR_W}
                strokeWidth={2}
                strokeDasharray="5 3"
                markerEnd={`url(#${uid}-w)`}
              />
            ) : null}

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
            {sw && pw ? (
              <text
                x={labelOffset(sw, pw, ox, oy, 14).x}
                y={labelOffset(sw, pw, ox, oy, 14).y}
                fontSize={11}
                fill={COLOR_W}
                textAnchor="middle"
              >
                w
              </text>
            ) : null}

            <circle
              cx={pu.x}
              cy={pu.y}
              r={9}
              fill={COLOR_U}
              fillOpacity={0.2}
              stroke={COLOR_U}
              style={{ cursor: 'grab' }}
              {...dragU}
            />
            <circle
              cx={pv.x}
              cy={pv.y}
              r={9}
              fill={COLOR_V}
              fillOpacity={0.2}
              stroke={COLOR_V}
              style={{ cursor: 'grab' }}
              {...dragV}
            />
          </svg>
        ) : (
          <div className="space-y-2 rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
            <p>
              B = &#123;u, v{sw ? ', w' : ''}&#125; · u={formatPair(su.x, su.y)} · v=
              {formatPair(sv.x, sv.y)}
              {sw ? ` · w=${formatPair(sw.x, sw.y)}` : ''}
            </p>
            <p>
              rango([columnas]) = {rnk} ⇒ dim(span) ={' '}
              <strong className="text-[var(--accent-strong)]">{dim}</strong>
            </p>
            <p>
              Independientes: {indepOk ? 'sí' : 'no'} · Generan ℝ²: {spansR2 ? 'sí' : 'no'} · Base
              de ℝ²: {isBasisR2 ? 'sí' : 'no'}
            </p>
            {!sw ? (
              <p className="text-xs text-[var(--fg-muted)]">
                det([u v]) = {presentLin(det)} (secundario)
              </p>
            ) : (
              <p className="text-xs text-[var(--fg-muted)]">
                Tres vectores en ℝ²: si generan el plano, alguno es combinación de los otros.
              </p>
            )}
            {altBasis ? (
              <p className="text-xs text-[var(--fg-muted)]">
                Otra base de ℝ²: misma dimensión 2, distintas direcciones.
              </p>
            ) : null}
          </div>
        )}

        <ButtonRow>
          <VizButton onClick={() => applyPreset('basis')}>Base de ℝ²</VizButton>
          <VizButton onClick={() => applyPreset('dep')}>Dependientes</VizButton>
          <VizButton onClick={() => applyPreset('red')}>Redundante</VizButton>
          {sw ? <VizButton onClick={() => setW(null)}>Quitar redundancia</VizButton> : null}
          <VizButton onClick={() => applyPreset('zero')}>Espacio cero</VizButton>
          <VizButton onClick={() => applyPreset('one')}>Solo una dirección</VizButton>
          <VizButton onClick={() => applyPreset('e1e2')}>e₁,e₂</VizButton>
          <VizButton onClick={() => applyPreset('other')}>Otra base</VizButton>
        </ButtonRow>

        <details className="rounded-lg border border-[var(--border)] px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium">Editar vectores</summary>
          <ControlsStack>
            <SliderRow
              label="uₓ"
              value={su.x}
              min={-3}
              max={3}
              step={0.1}
              onChange={(x) => setU({ ...su, x })}
            />
            <SliderRow
              label="uᵧ"
              value={su.y}
              min={-3}
              max={3}
              step={0.1}
              onChange={(y) => setU({ ...su, y })}
            />
            <SliderRow
              label="vₓ"
              value={sv.x}
              min={-3}
              max={3}
              step={0.1}
              onChange={(x) => setV({ ...sv, x })}
            />
            <SliderRow
              label="vᵧ"
              value={sv.y}
              min={-3}
              max={3}
              step={0.1}
              onChange={(y) => setV({ ...sv, y })}
            />
          </ControlsStack>
        </details>
      </div>
    </VizPanel>
  );
}
