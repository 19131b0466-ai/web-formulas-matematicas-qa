'use client';

import { useId, useMemo, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  SliderRow,
  VizButton,
  VizPanel,
  joinCaption,
} from './controls';
import { DET_EPS } from './detHelpers';
import {
  LIN_EPS,
  LIN_NEAR,
  formatVec,
  nullspaceBasis,
  presentLin,
  rank,
} from './linAlg';
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

function cols2(u: Vec2, v: Vec2): number[][] {
  return [
    [u.x, v.x],
    [u.y, v.y],
  ];
}

function cols3(u: Vec2, v: Vec2, w: Vec2): number[][] {
  return [
    [u.x, v.x, w.x],
    [u.y, v.y, w.y],
  ];
}

function formatRelation(coeffs: number[], names: string[]): string {
  const parts: string[] = [];
  coeffs.forEach((c, i) => {
    if (Math.abs(c) < 1e-8) return;
    const name = names[i]!;
    const abs = presentLin(Math.abs(c));
    const term = abs === '1' ? name : `${abs}${name}`;
    if (parts.length === 0) {
      parts.push(c < 0 ? `−${term}` : term);
    } else {
      parts.push(c < 0 ? `− ${term}` : `+ ${term}`);
    }
  });
  return parts.length ? `${parts.join(' ')} = 0` : '0 = 0';
}

export function LinearIndependenceViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [u, setU] = useState<Vec2>({ x: 2, y: 0.5 });
  const [v, setV] = useState<Vec2>({ x: 0.6, y: 1.8 });
  const [w, setW] = useState<Vec2 | null>(null);
  const [alpha, setAlpha] = useState(1);
  const [beta, setBeta] = useState(-0.5);
  const [gamma, setGamma] = useState(0);
  const [tab, setTab] = useState<Tab>('geo');
  const [showRelation, setShowRelation] = useState(false);

  const su = clampVec(u, CLAMP);
  const sv = clampVec(v, CLAMP);
  const sw = w ? clampVec(w, CLAMP) : null;

  const A = useMemo(
    () => (sw ? cols3(su, sv, sw) : cols2(su, sv)),
    [su, sv, sw],
  );
  const rnk = useMemo(() => rank(A, LIN_EPS), [A]);
  const nCols = sw ? 3 : 2;
  const independent = rnk === nCols;
  const ker = useMemo(() => nullspaceBasis(A, LIN_EPS), [A]);

  const M: Mat2 = [
    [su.x, sv.x],
    [su.y, sv.y],
  ];
  const det = det2(M);
  const nearly =
    !sw &&
    independent &&
    Math.abs(det) < LIN_NEAR * Math.max(1, norm(su) * norm(sv));

  const au = scale(su, alpha);
  const tipAfterAu = au;
  const bv = scale(sv, beta);
  const afterBv = add(tipAfterAu, bv);
  const gw = sw ? scale(sw, gamma) : { x: 0, y: 0 };
  const r = sw ? add(afterBv, gw) : afterBv;
  const residualSmall = norm(r) < 0.08;

  const maxAbs = Math.max(
    1.4,
    norm(su),
    norm(sv),
    sw ? norm(sw) : 0,
    norm(au),
    norm(afterBv),
    norm(r),
  );
  const S = autoScale(maxAbs, Math.min(W, H), 44, 26, 58);
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });

  const dragU = useVecDrag((p) => setU(clampVec(p, CLAMP)), S, { x: ox, y: oy });
  const dragV = useVecDrag((p) => setV(clampVec(p, CLAMP)), S, { x: ox, y: oy });

  const pu = to(su);
  const pv = to(sv);
  const pw = sw ? to(sw) : null;
  const pau = to(au);
  const pMid = to(afterBv);
  const pr = to(r);

  const witness = ker[0] ?? null;
  const relationStr = witness
    ? formatRelation(witness, sw ? ['u', 'v', 'w'] : ['u', 'v'])
    : null;

  function applyPreset(kind: string) {
    setShowRelation(false);
    setW(null);
    setGamma(0);
    if (kind === 'indep') {
      setU({ x: 2, y: 0.5 });
      setV({ x: 0.6, y: 1.8 });
      setAlpha(1);
      setBeta(-0.5);
    } else if (kind === 'par') {
      setU({ x: 1.5, y: 0.75 });
      setV({ x: 3, y: 1.5 });
      setAlpha(2);
      setBeta(-1);
    } else if (kind === 'opp') {
      setU({ x: 2, y: 1 });
      setV({ x: -2, y: -1 });
      setAlpha(1);
      setBeta(1);
    } else if (kind === 'zero') {
      setU({ x: 0, y: 0 });
      setV({ x: 1.5, y: 1 });
      setAlpha(1);
      setBeta(0);
    } else if (kind === 'three') {
      setU({ x: 2, y: 0.5 });
      setV({ x: 0.6, y: 1.8 });
      setW({ x: 2.6, y: 2.3 }); // ≈ u+v
      setAlpha(1);
      setBeta(1);
      setGamma(-1);
    }
  }

  return (
    <VizPanel
      caption={joinCaption(
        independent ? '✓ Independientes' : '✕ Dependientes',
        `rango([u v${sw ? ' w' : ''}]) = ${rnk}`,
        nearly ? 'casi colineales' : undefined,
      )}
    >
      <div className="space-y-3">
        <div className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--accent-soft)_30%,transparent)] px-3 py-2 text-sm">
          <p className="font-medium text-[var(--fg)]">
            Idea — u y v son independientes si αu+βv=0 solo admite la solución trivial α=β=0. Si
            existe otra solución, son dependientes.
          </p>
          <p className="mt-1 text-[var(--fg-muted)]">
            Pruébalo — Ajusta α y β y mira el resultante naranja. El veredicto ✓/✕ sale del rango
            de las columnas, no del residual de los sliders.
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

        <div className="flex flex-wrap items-center gap-2">
          {independent ? (
            <span className="rounded-md border border-[var(--accent-strong)]/40 bg-[var(--accent-soft)] px-2.5 py-1 font-mono text-xs font-semibold text-[var(--accent-strong)]">
              ✓ Independientes
            </span>
          ) : (
            <span className="rounded-md border border-red-500/40 bg-red-500/10 px-2.5 py-1 font-mono text-xs font-semibold text-red-700 dark:text-red-300">
              ✕ Dependientes
            </span>
          )}
          {nearly ? (
            <span className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-800 dark:text-amber-200">
              ⚠ Casi colineales (aún independientes)
            </span>
          ) : null}
        </div>

        {tab === 'geo' ? (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full touch-none rounded-xl border border-[var(--border)]"
            role="img"
            aria-label={independent ? 'Vectores independientes' : 'Vectores dependientes'}
          >
            <defs>
              <ArrowMarker id={`${uid}-u`} color={COLOR_U} />
              <ArrowMarker id={`${uid}-v`} color={COLOR_V} />
              <ArrowMarker id={`${uid}-w`} color="var(--fg-muted)" />
              <ArrowMarker id={`${uid}-au`} color={COLOR_U} />
              <ArrowMarker id={`${uid}-bv`} color={COLOR_V} />
              <ArrowMarker id={`${uid}-r`} color={COLOR_W} />
            </defs>

            <Axes W={W} H={H} ox={ox} oy={oy} S={S} xLabel="x" yLabel="y" />

            {/* faint generators */}
            {norm(su) > DET_EPS ? (
              <line
                x1={ox}
                y1={oy}
                x2={pu.x}
                y2={pu.y}
                stroke={COLOR_U}
                strokeWidth={1.3}
                opacity={0.35}
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
                strokeWidth={1.3}
                opacity={0.35}
                markerEnd={`url(#${uid}-v)`}
              />
            ) : null}
            {sw && pw && norm(sw) > DET_EPS ? (
              <line
                x1={ox}
                y1={oy}
                x2={pw.x}
                y2={pw.y}
                stroke="var(--fg-muted)"
                strokeWidth={1.2}
                opacity={0.4}
                strokeDasharray="4 3"
                markerEnd={`url(#${uid}-w)`}
              />
            ) : null}

            {/* tip-to-tail: αu then βv (then γw) */}
            {norm(au) > 0.04 ? (
              <line
                x1={ox}
                y1={oy}
                x2={pau.x}
                y2={pau.y}
                stroke={COLOR_U}
                strokeWidth={2.4}
                markerEnd={`url(#${uid}-au)`}
              />
            ) : null}
            {norm(bv) > 0.04 ? (
              <line
                x1={pau.x}
                y1={pau.y}
                x2={pMid.x}
                y2={pMid.y}
                stroke={COLOR_V}
                strokeWidth={2.4}
                markerEnd={`url(#${uid}-bv)`}
              />
            ) : null}
            {sw && norm(gw) > 0.04 ? (
              <line
                x1={pMid.x}
                y1={pMid.y}
                x2={pr.x}
                y2={pr.y}
                stroke="var(--fg-muted)"
                strokeWidth={2}
                markerEnd={`url(#${uid}-w)`}
              />
            ) : null}

            {norm(r) > 0.06 ? (
              <line
                x1={ox}
                y1={oy}
                x2={pr.x}
                y2={pr.y}
                stroke={COLOR_W}
                strokeWidth={2.8}
                markerEnd={`url(#${uid}-r)`}
              />
            ) : (
              <circle cx={ox} cy={oy} r={7} fill={COLOR_W} opacity={0.85} />
            )}

            <text
              x={labelOffset(su, pu, ox, oy, 14).x}
              y={labelOffset(su, pu, ox, oy, 14).y}
              fontSize={11}
              fill={COLOR_U}
              opacity={0.7}
              textAnchor="middle"
            >
              u
            </text>
            <text
              x={labelOffset(sv, pv, ox, oy, 14).x}
              y={labelOffset(sv, pv, ox, oy, 14).y}
              fontSize={11}
              fill={COLOR_V}
              opacity={0.7}
              textAnchor="middle"
            >
              v
            </text>
            {norm(r) > 0.06 ? (
              <text
                x={labelOffset(r, pr, ox, oy, 16).x}
                y={labelOffset(r, pr, ox, oy, 16).y}
                fontSize={12}
                fontWeight={700}
                fill={COLOR_W}
                textAnchor="middle"
              >
                r
              </text>
            ) : (
              <text x={ox + 12} y={oy - 10} fontSize={12} fontWeight={600} fill={COLOR_W}>
                r ≈ 0
              </text>
            )}

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
              A c = 0 con A = [u | v{sw ? ' | w' : ''}], c = (α
              {sw ? ', β, γ' : ', β'})ᵀ
            </p>
            <p>
              u = {formatPair(su.x, su.y)}, v = {formatPair(sv.x, sv.y)}
              {sw ? `, w = ${formatPair(sw.x, sw.y)}` : ''}
            </p>
            <p>
              rango(A) = <strong className="text-[var(--accent-strong)]">{rnk}</strong>
              {' · '}
              {independent
                ? `rango = ${nCols} ⇒ solo c = 0 (independientes)`
                : `rango < ${nCols} ⇒ existe c ≠ 0 (dependientes)`}
            </p>
            {!sw ? (
              <p className="text-xs text-[var(--fg-muted)]">
                det([u v]) = {presentLin(det)} (secundario; el criterio principal es el rango)
              </p>
            ) : null}
            {relationStr ? (
              <p>
                Relación del núcleo: <strong>{relationStr}</strong>
              </p>
            ) : (
              <p>Ker(A) = &#123;0&#125;</p>
            )}
          </div>
        )}

        <div className="rounded-lg border border-[var(--border)] px-3 py-2 font-mono text-sm">
          <p className="text-xs text-[var(--fg-muted)]">Prueba una combinación</p>
          <p>
            r = {presentLin(alpha)}u + {presentLin(beta)}v
            {sw ? ` + ${presentLin(gamma)}w` : ''} = {formatVec([r.x, r.y])}
            {residualSmall ? ' ≈ 0' : ''}
          </p>
          {residualSmall && !independent ? (
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              Esta combinación casi anula: encaja con la dependencia (usa «Mostrar relación»).
            </p>
          ) : null}
          {residualSmall && independent && Math.abs(alpha) + Math.abs(beta) + Math.abs(gamma) < 0.15 ? (
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              Cerca de la solución trivial α=β=0 — coherente con independencia.
            </p>
          ) : null}
        </div>

        {!independent && relationStr ? (
          <ButtonRow>
            <VizButton active={showRelation} onClick={() => setShowRelation((x) => !x)}>
              {showRelation ? 'Ocultar relación' : 'Mostrar relación'}
            </VizButton>
          </ButtonRow>
        ) : null}
        {showRelation && relationStr ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-sm text-red-800 dark:text-red-200">
            Testigo: {relationStr}
          </p>
        ) : null}

        <ControlsStack>
          <SliderRow label="α" value={alpha} min={-3} max={3} step={0.1} onChange={setAlpha} />
          <SliderRow label="β" value={beta} min={-3} max={3} step={0.1} onChange={setBeta} />
          {sw ? (
            <SliderRow label="γ" value={gamma} min={-3} max={3} step={0.1} onChange={setGamma} />
          ) : null}
        </ControlsStack>

        <ButtonRow>
          <VizButton onClick={() => applyPreset('indep')}>Independientes</VizButton>
          <VizButton onClick={() => applyPreset('par')}>Paralelos</VizButton>
          <VizButton onClick={() => applyPreset('opp')}>Opuestos</VizButton>
          <VizButton onClick={() => applyPreset('zero')}>Vector cero</VizButton>
          <VizButton onClick={() => applyPreset('three')}>Tres vectores</VizButton>
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
            {sw ? (
              <p className="text-xs text-[var(--fg-muted)]">
                w ≈ u+v (preset tres vectores) · relación u+v−w=0
              </p>
            ) : null}
          </ControlsStack>
        </details>
      </div>
    </VizPanel>
  );
}
