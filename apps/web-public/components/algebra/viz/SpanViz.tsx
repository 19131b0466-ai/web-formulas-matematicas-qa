'use client';

import { useId, useMemo, useState, type ReactNode } from 'react';
import {
  ButtonRow,
  ControlsStack,
  SliderRow,
  VizButton,
  VizPanel,
  fmt,
  joinCaption,
} from './controls';
import {
  LIN_EPS,
  formatVec,
  isNearZero,
  presentLin,
  rank,
} from './linAlg';
import { add, norm, scale, type Vec2 } from './math2d';
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

type Mode = 'one' | 'all';
type Tab = 'geo' | 'alg';

function colsMatrix(u: Vec2, v: Vec2, w?: Vec2 | null) {
  if (w) {
    return [
      [u.x, v.x, w.x],
      [u.y, v.y, w.y],
    ];
  }
  return [
    [u.x, v.x],
    [u.y, v.y],
  ];
}

function dimLabel(d: number): string {
  if (d === 0) return 'punto {0}';
  if (d === 1) return 'recta por el origen';
  return 'plano ℝ²';
}

export function SpanViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [u, setU] = useState<Vec2>({ x: 2, y: 0.4 });
  const [v, setV] = useState<Vec2>({ x: 0.6, y: 1.8 });
  const [w, setW] = useState<Vec2 | null>(null);
  const [s, setS] = useState(1);
  const [t, setT] = useState(0.6);
  const [mode, setMode] = useState<Mode>('all');
  const [tab, setTab] = useState<Tab>('geo');

  const su = clampVec(u, CLAMP);
  const sv = clampVec(v, CLAMP);
  const sw = w ? clampVec(w, CLAMP) : null;

  const dim = useMemo(
    () => rank(colsMatrix(su, sv, sw), LIN_EPS),
    [su, sv, sw],
  );

  const combo = add(scale(su, s), scale(sv, t));
  const maxAbs = Math.max(
    1.4,
    norm(su),
    norm(sv),
    sw ? norm(sw) : 0,
    mode === 'one' ? norm(combo) : 0,
    dim === 2 ? Math.max(norm(su), norm(sv)) * 2.2 : 2,
  );
  const S = autoScale(maxAbs, Math.min(W, H), 44, 26, 58);
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });

  const dragU = useVecDrag((p) => setU(clampVec(p, CLAMP)), S, { x: ox, y: oy });
  const dragV = useVecDrag((p) => setV(clampVec(p, CLAMP)), S, { x: ox, y: oy });

  const pu = to(su);
  const pv = to(sv);
  const pw = sw ? to(sw) : null;
  const pc = to(combo);

  const gridPts: Vec2[] = [];
  if (dim === 2 && mode === 'all') {
    for (let k = -2; k <= 2; k++) {
      for (let l = -2; l <= 2; l++) {
        gridPts.push(add(scale(su, k), scale(sv, l)));
      }
    }
  }

  const lineGuide = useMemo(() => {
    if (dim !== 1) return null;
    const dir =
      norm(su) > LIN_EPS ? su : norm(sv) > LIN_EPS ? sv : sw && norm(sw) > LIN_EPS ? sw : null;
    if (!dir) return null;
    const d = scale(dir, 1 / norm(dir));
    const reach = 6;
    return {
      a: scale(d, -reach),
      b: scale(d, reach),
    };
  }, [dim, su, sv, sw]);

  function applyPreset(kind: string) {
    setW(null);
    if (kind === 'one') {
      setU({ x: 2, y: 1 });
      setV({ x: 0, y: 0 });
      setS(1);
      setT(0);
      setMode('all');
    } else if (kind === 'indep') {
      setU({ x: 2, y: 0.4 });
      setV({ x: 0.6, y: 1.8 });
      setS(1);
      setT(0.6);
      setMode('all');
    } else if (kind === 'dep') {
      setU({ x: 1, y: 1 });
      setV({ x: 2, y: 2 });
      setS(1);
      setT(0.5);
      setMode('all');
    } else if (kind === 'zero') {
      setU({ x: 0, y: 0 });
      setV({ x: 0, y: 0 });
      setS(0);
      setT(0);
      setMode('all');
    } else if (kind === 'three') {
      setU({ x: 2, y: 0.4 });
      setV({ x: 0.6, y: 1.8 });
      setW({ x: 2.6, y: 2.2 }); // u+v — redundant
      setS(0.8);
      setT(0.5);
      setMode('all');
    }
  }

  const statusText =
    dim === 2
      ? 'span{u,v} llena el plano'
      : dim === 1
        ? 'span{u,v} es una recta'
        : 'span{u,v} = {0}';

  return (
    <VizPanel
      caption={joinCaption(
        `dim(span) = ${dim}`,
        statusText,
        mode === 'one' ? `x = su+tv = ${formatPair(combo.x, combo.y)}` : undefined,
      )}
    >
      <div className="space-y-3">
        <div className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--accent-soft)_30%,transparent)] px-3 py-2 text-sm">
          <p className="font-medium text-[var(--fg)]">
            Idea — El span de u y v es el conjunto de todas las combinaciones su+tv. No es un solo
            paralelogramo: según la dimensión, es un punto, una recta o todo el plano.
          </p>
          <p className="mt-1 text-[var(--fg-muted)]">
            Pruébalo — Cambia s y t (también negativos), compara «Una combinación» vs «Todas», y
            arrastra las puntas de u y v.
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
          <span
            className={`rounded-md border px-2.5 py-1 font-mono text-xs font-semibold ${
              dim === 2
                ? 'border-[var(--accent-strong)]/40 bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                : dim === 1
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200'
                  : 'border-[var(--border)] bg-[var(--bg)] text-[var(--fg-muted)]'
            }`}
          >
            dim(span) = {dim} · {dimLabel(dim)}
          </span>
        </div>

        <ButtonRow>
          <VizButton active={mode === 'one'} onClick={() => setMode('one')}>
            Una combinación
          </VizButton>
          <VizButton active={mode === 'all'} onClick={() => setMode('all')}>
            Todas
          </VizButton>
        </ButtonRow>

        {tab === 'geo' ? (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full touch-none rounded-xl border border-[var(--border)]"
            role="img"
            aria-label={`Span de dimensión ${dim}`}
          >
            <defs>
              <ArrowMarker id={`${uid}-u`} color={COLOR_U} />
              <ArrowMarker id={`${uid}-v`} color={COLOR_V} />
              <ArrowMarker id={`${uid}-w`} color="var(--fg-muted)" />
              <ArrowMarker id={`${uid}-x`} color={COLOR_W} />
            </defs>

            <Axes W={W} H={H} ox={ox} oy={oy} S={S} xLabel="x" yLabel="y" />

            {dim === 0 ? (
              <circle cx={ox} cy={oy} r={7} fill={COLOR_W} opacity={0.9} />
            ) : null}

            {dim === 1 && lineGuide && mode === 'all' ? (
              <line
                x1={to(lineGuide.a).x}
                y1={to(lineGuide.a).y}
                x2={to(lineGuide.b).x}
                y2={to(lineGuide.b).y}
                stroke={COLOR_W}
                strokeWidth={2.2}
                opacity={0.55}
              />
            ) : null}

            {dim === 2 && mode === 'all'
              ? (() => {
                  const lines: ReactNode[] = [];
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
                        opacity={0.22}
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
                        opacity={0.22}
                      />,
                    );
                  }
                  return (
                    <g>
                      {lines}
                      {gridPts.map((p, i) => (
                        <circle
                          key={i}
                          cx={to(p).x}
                          cy={to(p).y}
                          r={2.5}
                          fill={COLOR_W}
                          opacity={0.45}
                        />
                      ))}
                    </g>
                  );
                })()
              : null}

            {dim === 1 && mode === 'all'
              ? [-2, -1, 0, 1, 2].map((k) => {
                  const dir = norm(su) > LIN_EPS ? su : sv;
                  const p = scale(dir, k);
                  const tip = to(p);
                  return (
                    <circle key={k} cx={tip.x} cy={tip.y} r={3} fill={COLOR_W} opacity={0.5} />
                  );
                })
              : null}

            {/* generators */}
            {norm(su) > LIN_EPS ? (
              <line
                x1={ox}
                y1={oy}
                x2={pu.x}
                y2={pu.y}
                stroke={COLOR_U}
                strokeWidth={2.4}
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
                strokeWidth={2.4}
                markerEnd={`url(#${uid}-v)`}
              />
            ) : null}
            {sw && pw && norm(sw) > LIN_EPS ? (
              <line
                x1={ox}
                y1={oy}
                x2={pw.x}
                y2={pw.y}
                stroke="var(--fg-muted)"
                strokeWidth={1.8}
                strokeDasharray="5 3"
                markerEnd={`url(#${uid}-w)`}
                opacity={0.7}
              />
            ) : null}

            {mode === 'one' ? (
              <>
                {Math.abs(s) > 0.02 && norm(su) > LIN_EPS ? (
                  <line
                    x1={ox}
                    y1={oy}
                    x2={to(scale(su, s)).x}
                    y2={to(scale(su, s)).y}
                    stroke={COLOR_U}
                    strokeWidth={1.6}
                    strokeDasharray="4 3"
                    opacity={0.7}
                  />
                ) : null}
                {Math.abs(t) > 0.02 && norm(sv) > LIN_EPS ? (
                  <line
                    x1={to(scale(su, s)).x}
                    y1={to(scale(su, s)).y}
                    x2={pc.x}
                    y2={pc.y}
                    stroke={COLOR_V}
                    strokeWidth={1.6}
                    strokeDasharray="4 3"
                    opacity={0.7}
                  />
                ) : null}
                <line
                  x1={ox}
                  y1={oy}
                  x2={pc.x}
                  y2={pc.y}
                  stroke={COLOR_W}
                  strokeWidth={3}
                  markerEnd={`url(#${uid}-x)`}
                />
                <text
                  x={labelOffset(combo, pc, ox, oy, 16).x}
                  y={labelOffset(combo, pc, ox, oy, 16).y}
                  fontSize={12}
                  fontWeight={700}
                  fill={COLOR_W}
                  textAnchor="middle"
                >
                  x=su+tv
                </text>
              </>
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
                fill="var(--fg-muted)"
                textAnchor="middle"
              >
                w=u+v
              </text>
            ) : null}

            <circle
              cx={pu.x}
              cy={pu.y}
              r={9}
              fill={COLOR_U}
              fillOpacity={0.2}
              stroke={COLOR_U}
              strokeWidth={1.2}
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
              strokeWidth={1.2}
              style={{ cursor: 'grab' }}
              {...dragV}
            />
          </svg>
        ) : (
          <div className="space-y-2 rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
            <p>
              span&#123;u,v&#125; = &#123; su+tv : s,t ∈ ℝ &#125;
            </p>
            <p>
              u = {formatPair(su.x, su.y)} · v = {formatPair(sv.x, sv.y)}
              {sw ? ` · w = ${formatPair(sw.x, sw.y)}` : ''}
            </p>
            <p>
              Matriz de columnas A = [u | v
              {sw ? ' | w' : ''}] → rango(A) ={' '}
              <strong className="text-[var(--accent-strong)]">{dim}</strong>
            </p>
            <p className="text-[var(--fg-muted)]">
              dim(span) = rango(A) = {dim} → {dimLabel(dim)}
            </p>
            <p>
              Una combinación concreta: x = {presentLin(s)}u + {presentLin(t)}v ={' '}
              {formatVec([combo.x, combo.y])}
            </p>
            {sw ? (
              <p className="text-xs text-[var(--fg-muted)]">
                w es redundante: no aumenta el rango (w ≈ u+v).
              </p>
            ) : null}
          </div>
        )}

        <p className="text-xs text-[var(--fg-muted)]">
          {mode === 'one'
            ? 'La flecha naranja es un solo elemento del span. Cambia s y t para visitar otros.'
            : dim === 2
              ? 'La malla oblicua muestra muchas combinaciones: al variar s y t se llena el plano.'
              : dim === 1
                ? 'Todas las combinaciones viven en la misma recta por el origen.'
                : 'Solo queda el origen: el span es el punto {0}.'}
        </p>

        <ControlsStack>
          <SliderRow label="s" value={s} min={-3} max={3} step={0.1} onChange={setS} />
          <SliderRow label="t" value={t} min={-3} max={3} step={0.1} onChange={setT} />
        </ControlsStack>

        <ButtonRow>
          <VizButton onClick={() => applyPreset('one')}>Un vector</VizButton>
          <VizButton onClick={() => applyPreset('indep')}>Dos independientes</VizButton>
          <VizButton onClick={() => applyPreset('dep')}>Dos dependientes</VizButton>
          <VizButton onClick={() => applyPreset('zero')}>Vector cero</VizButton>
          <VizButton onClick={() => applyPreset('three')}>Tres vectores</VizButton>
        </ButtonRow>

        <details className="rounded-lg border border-[var(--border)] px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium text-[var(--fg)]">
            Editar vectores
          </summary>
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
                w = u+v ≈ ({fmt(sw.x)}, {fmt(sw.y)}) — vector redundante del preset «Tres vectores».
              </p>
            ) : null}
            {!isNearZero(su.x) || !isNearZero(su.y) || !isNearZero(sv.x) || !isNearZero(sv.y) ? (
              <p className="text-xs text-[var(--fg-muted)]">
                También puedes arrastrar las puntas de u y v en el plano.
              </p>
            ) : null}
          </ControlsStack>
        </details>
      </div>
    </VizPanel>
  );
}
