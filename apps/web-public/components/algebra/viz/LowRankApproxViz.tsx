'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  SliderRow,
  VizButton,
  VizPanel,
  joinCaption,
} from './controls';
import {
  type Mat,
  type Vec,
  LSQ_EPS,
  LSQ_NEAR,
  cloneMat,
  cols,
  formatNum,
  lowRankApprox,
  matSub,
  outerProduct,
  rows,
  svd,
} from './decompMath';
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
  VEC_H,
  VEC_W,
  autoScale,
} from './vectorPlane';

type Mode = 'comp' | 'geo' | 'compress';
type PresetId = 'near1' | 'two' | 'gradual' | 'full' | 'geo2' | null;

const MODE_OPTS = [
  { id: 'comp', label: 'Componentes' },
  { id: 'geo', label: 'Geometría' },
  { id: 'compress', label: 'Compresión' },
];

const PRESETS: Array<{ id: PresetId; label: string }> = [
  { id: 'near1', label: 'Casi rango 1' },
  { id: 'two', label: 'Dos componentes' },
  { id: 'gradual', label: 'Espectro gradual' },
  { id: 'full', label: 'Rango completo' },
  { id: 'geo2', label: 'Elipse 2×2' },
];

const DEFAULT_SIGMAS = [8.4, 4.1, 1.5, 0.35];

const U_SEEDS: Vec[] = [
  [1, 0.15, -0.1, 0.05, 0.2],
  [0.2, 1, 0.25, -0.15, 0.05],
  [-0.1, 0.3, 1, 0.2, -0.25],
  [0.25, -0.1, 0.15, 1, 0.3],
];

const V_SEEDS: Vec[] = [
  [1, 0.2, -0.15, 0.1],
  [-0.25, 1, 0.3, -0.05],
  [0.1, -0.2, 1, 0.35],
  [0.15, 0.1, -0.25, 1],
];

function vecDot(a: Vec, b: Vec): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i] ?? 0) * (b[i] ?? 0);
  return s;
}

function vecNorm(a: Vec): number {
  return Math.sqrt(vecDot(a, a));
}

function vecScale(a: Vec, s: number): Vec {
  return a.map((x) => x * s);
}

function vecSub(a: Vec, b: Vec): Vec {
  return a.map((x, i) => x - (b[i] ?? 0));
}

function orthonormalize(seeds: Vec[]): Vec[] {
  const out: Vec[] = [];
  for (const seed of seeds) {
    let v = seed.slice();
    for (const q of out) {
      v = vecSub(v, vecScale(q, vecDot(v, q)));
    }
    const n = vecNorm(v);
    if (n > LSQ_NEAR) out.push(vecScale(v, 1 / n));
  }
  return out;
}

function matScaleLocal(A: Mat, s: number): Mat {
  return A.map((row) => row.map((v) => v * s));
}

function matAddLocal(A: Mat, B: Mat): Mat {
  return A.map((row, i) => row.map((v, j) => v + (B[i]?.[j] ?? 0)));
}

function zerosLocal(m: number, n: number): Mat {
  return Array.from({ length: m }, () => Array.from({ length: n }, () => 0));
}

/** Build A = Σ σ_i u_i v_iᵀ with orthonormal factors (pedagogical singular spectrum). */
function buildFromSigmas(sigmas: number[], m = 5, n = 4): Mat {
  const uu = orthonormalize(U_SEEDS.map((u) => u.slice(0, m)));
  const vv = orthonormalize(V_SEEDS.map((v) => v.slice(0, n)));
  let A = zerosLocal(m, n);
  const r = Math.min(sigmas.length, uu.length, vv.length);
  for (let i = 0; i < r; i++) {
    const σ = sigmas[i]!;
    if (σ <= LSQ_EPS) continue;
    A = matAddLocal(A, matScaleLocal(outerProduct(uu[i]!, vv[i]!), σ));
  }
  return A;
}

const PRESET_NEAR1 = buildFromSigmas([9.2, 0.45, 0.12, 0.04]);
const PRESET_TWO = buildFromSigmas(DEFAULT_SIGMAS);
const PRESET_GRADUAL = buildFromSigmas([6.5, 4.8, 3.2, 2.1]);
const PRESET_FULL = buildFromSigmas([7.0, 5.5, 4.0, 3.0]);
const PRESET_GEO2: Mat = [
  [3.2, 1.1],
  [0.4, 1.8],
];

function presetMatrix(id: PresetId): Mat | null {
  switch (id) {
    case 'near1':
      return cloneMat(PRESET_NEAR1);
    case 'two':
      return cloneMat(PRESET_TWO);
    case 'gradual':
      return cloneMat(PRESET_GRADUAL);
    case 'full':
      return cloneMat(PRESET_FULL);
    case 'geo2':
      return cloneMat(PRESET_GEO2);
    default:
      return null;
  }
}

function heatColor(v: number, maxAbs: number): string {
  const t = maxAbs > LSQ_EPS ? Math.max(-1, Math.min(1, v / maxAbs)) : 0;
  if (t >= 0) {
    const a = 0.12 + 0.55 * t;
    return `color-mix(in oklab, teal ${Math.round(a * 100)}%, transparent)`;
  }
  const a = 0.12 + 0.55 * -t;
  return `color-mix(in oklab, orange ${Math.round(a * 100)}%, transparent)`;
}

function NumberHeatmap({
  A,
  label,
  compact,
}: {
  A: Mat;
  label: string;
  compact?: boolean;
}) {
  const m = rows(A);
  const n = cols(A);
  let maxAbs = 0;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) maxAbs = Math.max(maxAbs, Math.abs(A[i]![j]!));
  }
  const cell = compact ? 'min-w-[1.65rem] px-0.5 py-0.5 text-[9px]' : 'min-w-[2.1rem] px-1 py-0.5 text-[10px]';
  return (
    <div className="min-w-0">
      <p className="mb-1 text-center text-xs font-medium text-[var(--fg-muted)]">{label}</p>
      <div
        className="inline-grid gap-px rounded-md border border-[var(--border)] bg-[var(--border)] p-px font-mono"
        style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
      >
        {A.flatMap((row, i) =>
          row.map((v, j) => (
            <span
              key={`${i}-${j}`}
              className={`${cell} text-center tabular-nums text-[var(--fg)]`}
              style={{ background: heatColor(v, maxAbs) }}
              title={formatNum(v, 4)}
            >
              {formatNum(v, Math.abs(v) < 0.05 ? 2 : 1)}
            </span>
          )),
        )}
      </div>
    </div>
  );
}

function SigmaBars({
  S,
  k,
  tol,
}: {
  S: number[];
  k: number;
  tol: number;
}) {
  const maxS = Math.max(...S, LSQ_NEAR);
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-[var(--fg-muted)]">Valores singulares σᵢ</p>
      <div className="flex items-end gap-1.5" style={{ height: 88 }}>
        {S.map((σ, i) => {
          const kept = i < k && σ > tol;
          const h = Math.max(4, (σ / maxS) * 80);
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <span className="font-mono text-[9px] tabular-nums text-[var(--fg-muted)]">
                {formatNum(σ, 2)}
              </span>
              <div
                className="w-full max-w-[2.25rem] rounded-t-sm"
                style={{
                  height: h,
                  background: kept
                    ? 'color-mix(in oklab, teal 75%, var(--accent-strong))'
                    : 'color-mix(in oklab, var(--fg-muted) 35%, transparent)',
                }}
                title={`σ${i + 1}=${formatNum(σ)} · ${kept ? 'conservado' : 'descartado'}`}
              />
              <span className="font-mono text-[10px] text-[var(--fg-muted)]">σ{i + 1}</span>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2 text-[10px] text-[var(--fg-muted)]">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-3 rounded-sm bg-teal-600/80" /> conservados (i≤k)
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-3 rounded-sm bg-[var(--fg-muted)]/40" /> descartados
        </span>
      </div>
    </div>
  );
}

/** Deterministic soft “image” intensity from coordinates. */
function syntheticImage(m: number, n: number): Mat {
  const A = zerosLocal(m, n);
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      const x = j / Math.max(1, n - 1);
      const y = i / Math.max(1, m - 1);
      const blob1 = Math.exp(-18 * ((x - 0.32) ** 2 + (y - 0.4) ** 2));
      const blob2 = 0.75 * Math.exp(-22 * ((x - 0.72) ** 2 + (y - 0.65) ** 2));
      const grad = 0.35 * x + 0.2 * (1 - y);
      A[i]![j] = 2.4 * blob1 + 2.0 * blob2 + grad;
    }
  }
  return A;
}

function ImageGrid({ A, label }: { A: Mat; label: string }) {
  const m = rows(A);
  const n = cols(A);
  let maxAbs = 0;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) maxAbs = Math.max(maxAbs, Math.abs(A[i]![j]!));
  }
  return (
    <div className="min-w-0 flex-1">
      <p className="mb-1 text-center text-xs font-medium text-[var(--fg-muted)]">{label}</p>
      <div
        className="mx-auto grid max-w-[220px] gap-px overflow-hidden rounded-md border border-[var(--border)]"
        style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
        role="img"
        aria-label={label}
      >
        {A.flatMap((row, i) =>
          row.map((v, j) => {
            const t = maxAbs > LSQ_EPS ? Math.max(0, Math.min(1, v / maxAbs)) : 0;
            return (
              <div
                key={`${i}-${j}`}
                className="aspect-square"
                style={{
                  background: `color-mix(in oklab, var(--accent-strong) ${Math.round(t * 90)}%, var(--bg))`,
                }}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}

function unitCircle(n = 72): Array<{ x: number; y: number }> {
  return Array.from({ length: n }, (_, i) => {
    const t = (2 * Math.PI * i) / n;
    return { x: Math.cos(t), y: Math.sin(t) };
  });
}

function apply2(A: Mat, p: { x: number; y: number }): { x: number; y: number } {
  return {
    x: (A[0]?.[0] ?? 0) * p.x + (A[0]?.[1] ?? 0) * p.y,
    y: (A[1]?.[0] ?? 0) * p.x + (A[1]?.[1] ?? 0) * p.y,
  };
}

function polyPts(
  pts: Array<{ x: number; y: number }>,
  to: (p: { x: number; y: number }) => { x: number; y: number },
): string {
  return pts.map((p) => {
    const q = to(p);
    return `${q.x},${q.y}`;
  }).join(' ');
}

/**
 * Aproximación de bajo rango A_k = Σ_{i≤k} σ_i u_i v_iᵀ (ALG-DEC-005).
 */
export function LowRankApproxViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [mode, setMode] = useState<Mode>('comp');
  const [A, setA] = useState<Mat>(() => cloneMat(PRESET_TWO));
  const [k, setK] = useState(2);
  const [preset, setPreset] = useState<PresetId>('two');
  const [editOpen, setEditOpen] = useState(false);
  const [eckartOpen, setEckartOpen] = useState(false);
  const [reveal, setReveal] = useState(0); // 0 = none stepwise; else show 1..reveal

  const approx = useMemo(() => lowRankApprox(A, k), [A, k]);
  const { Ak, frobeniusError, spectralError, energy, exactRank, S, U, Vt, tol } = approx;
  const rMax = Math.max(1, S.filter((σ) => σ > tol).length || S.length);
  const kClamped = Math.max(1, Math.min(k, rMax));

  useEffect(() => {
    if (k > rMax) setK(rMax);
  }, [k, rMax]);

  useEffect(() => {
    setReveal(0);
  }, [A, k]);

  const m = rows(A);
  const n = cols(A);
  const is2x2 = m === 2 && n === 2;

  const displayAk = useMemo(() => {
    if (reveal <= 0) return Ak;
    const kk = Math.min(reveal, kClamped);
    let partial = zerosLocal(m, n);
    for (let i = 0; i < kk; i++) {
      const σ = S[i]!;
      if (σ <= tol) continue;
      const ui = Array.from({ length: m }, (_, row) => U[row]![i]!);
      const vi = Array.from({ length: n }, (_, col) => Vt[i]![col]!);
      partial = matAddLocal(partial, matScaleLocal(outerProduct(ui, vi), σ));
    }
    return partial;
  }, [reveal, Ak, kClamped, m, n, S, U, Vt, tol]);

  const displayResidual = useMemo(() => matSub(A, displayAk), [A, displayAk]);

  const compressSrc = useMemo(() => syntheticImage(8, 10), []);
  const compressApprox = useMemo(
    () => lowRankApprox(compressSrc, Math.min(kClamped, Math.min(8, 10))),
    [compressSrc, kClamped],
  );

  const storageFull = m * n;
  const storageK = kClamped * (m + n + 1);
  const savings = storageFull - storageK;

  const applyPreset = (id: PresetId) => {
    const next = presetMatrix(id);
    if (!next) return;
    setA(next);
    setPreset(id);
    const s = svd(next).S.filter((σ) => σ > LSQ_NEAR);
    const defK = id === 'near1' ? 1 : id === 'geo2' ? 1 : Math.min(2, Math.max(1, s.length));
    setK(defK);
    setReveal(0);
    if (id === 'geo2') setMode('geo');
  };

  const onEditCell = (i: number, j: number, raw: string) => {
    const v = Number(raw);
    if (!Number.isFinite(v)) return;
    const next = cloneMat(A);
    next[i]![j] = v;
    setA(next);
    setPreset(null);
  };

  const buildStep = () => {
    setReveal((r) => (r >= kClamped ? 0 : r + 1));
  };

  const W = VEC_W;
  const H = VEC_H;
  const ox = W / 2;
  const oy = H / 2;

  const geoSvg = (() => {
    if (!is2x2) return null;
    const { U: Ug, S: Sg, Vt: Vtg } = svd(A);
    const σ1 = Sg[0] ?? 0;
    const σ2 = kClamped >= 2 ? (Sg[1] ?? 0) : 0;
    const u1 = { x: Ug[0]?.[0] ?? 1, y: Ug[1]?.[0] ?? 0 };
    const u2 = { x: Ug[0]?.[1] ?? 0, y: Ug[1]?.[1] ?? 1 };
    const v1 = { x: Vtg[0]?.[0] ?? 1, y: Vtg[0]?.[1] ?? 0 };
    // Ellipse for A and A_k via transforming unit circle
    const circle = unitCircle(80);
    const ellA = circle.map((p) => apply2(A, p));
    const ellAk = circle.map((p) => apply2(Ak, p));
    const reach = Math.max(
      σ1,
      σ2,
      ...ellA.map((p) => Math.hypot(p.x, p.y)),
      1.2,
    );
    const Sscale = autoScale(reach, Math.min(W, H), 52, 26, 58);
    const to = (p: { x: number; y: number }) => ({ x: ox + p.x * Sscale, y: oy - p.y * Sscale });
    const collapse = kClamped === 1;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Elipse A vs A_k">
        <defs>
          <ArrowMarker id={`${uid}-u`} color={COLOR_U} />
          <ArrowMarker id={`${uid}-v`} color={COLOR_V} />
        </defs>
        <Axes W={W} H={H} ox={ox} oy={oy} S={Sscale} ticks={[-2, -1, 1, 2]} />
        <polygon
          points={polyPts(circle, to)}
          fill="none"
          stroke="var(--fg-muted)"
          strokeWidth={1}
          opacity={0.35}
        />
        <polygon
          points={polyPts(ellA, to)}
          fill="none"
          stroke="var(--fg-muted)"
          strokeWidth={1.4}
          strokeDasharray="5 3"
          opacity={0.7}
        />
        <polygon
          points={polyPts(ellAk, to)}
          fill="color-mix(in oklab, teal 14%, transparent)"
          stroke="teal"
          strokeWidth={2}
          opacity={0.95}
        />
        {/* singular vectors */}
        <line
          x1={ox}
          y1={oy}
          x2={to({ x: u1.x * σ1, y: u1.y * σ1 }).x}
          y2={to({ x: u1.x * σ1, y: u1.y * σ1 }).y}
          stroke={COLOR_U}
          strokeWidth={2}
          markerEnd={`url(#${uid}-u)`}
        />
        {!collapse ? (
          <line
            x1={ox}
            y1={oy}
            x2={to({ x: u2.x * σ2, y: u2.y * σ2 }).x}
            y2={to({ x: u2.x * σ2, y: u2.y * σ2 }).y}
            stroke={COLOR_V}
            strokeWidth={2}
            markerEnd={`url(#${uid}-v)`}
          />
        ) : (
          <text x={ox + 12} y={oy - 14} fontSize={11} fill="var(--fg-muted)">
            k=1 → recta (σ₂ descartado)
          </text>
        )}
        <text x={to({ x: v1.x * 0.9, y: v1.y * 0.9 }).x} y={to({ x: v1.x * 0.9, y: v1.y * 0.9 }).y} fontSize={10} fill="var(--fg-muted)">
          v₁
        </text>
        <text
          x={to({ x: u1.x * σ1, y: u1.y * σ1 }).x + 6}
          y={to({ x: u1.x * σ1, y: u1.y * σ1 }).y - 4}
          fontSize={11}
          fill={COLOR_U}
        >
          σ₁ u₁
        </text>
        {!collapse ? (
          <text
            x={to({ x: u2.x * σ2, y: u2.y * σ2 }).x + 6}
            y={to({ x: u2.x * σ2, y: u2.y * σ2 }).y - 4}
            fontSize={11}
            fill={COLOR_V}
          >
            σ₂ u₂
          </text>
        ) : null}
      </svg>
    );
  })();

  const eqTerms = Array.from({ length: kClamped }, (_, i) => `σ${i + 1} u${i + 1} v${i + 1}ᵀ`);
  const energyPct = Math.round(energy * 1000) / 10;

  const caption = joinCaption(
    `k=${kClamped}/${rMax}`,
    `energía ${energyPct}%`,
    `‖A−Aₖ‖F=${formatNum(frobeniusError)}`,
  );

  return (
    <VizPanel title="Aproximación de bajo rango" caption={caption}>
      <div className="space-y-3">
        <GuideBlock
          idea="Se truncan las componentes singulares pequeñas: A_k = Σ_{i≤k} σ_i u_i v_iᵀ conserva la energía dominante y descarta el resto."
          tryIt="Mueve k y observa barras, A_k y el residual. En Compresión compara almacenamiento mn vs k(m+n+1)."
          concept="Eckart–Young: A_k es óptima en ‖·‖F y ‖·‖₂ entre las matrices de rango ≤ k."
        />

        <Segmented
          options={MODE_OPTS}
          value={mode}
          onChange={(id) => setMode(id as Mode)}
        />

        <ChipRow>
          {PRESETS.map((p) => (
            <Chip key={p.id} active={preset === p.id} onClick={() => applyPreset(p.id)}>
              {p.label}
            </Chip>
          ))}
        </ChipRow>

        <ControlsStack>
          <SliderRow
            label="k"
            ariaLabel="Rango de la aproximación"
            value={kClamped}
            min={1}
            max={Math.max(1, rMax)}
            step={1}
            onChange={(v) => setK(Math.round(v))}
          />
        </ControlsStack>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge tone="ok">rango exacto = {exactRank}</Badge>
          <Badge tone="neutral">k = {kClamped}</Badge>
          <Badge tone="ok">energía {energyPct}%</Badge>
          <Badge tone="warn">‖A−Aₖ‖F = {formatNum(frobeniusError)}</Badge>
          <Badge tone="neutral">‖A−Aₖ‖₂ ≈ σ{kClamped + 1} = {formatNum(spectralError)}</Badge>
        </div>

        {mode === 'comp' ? (
          <div className="space-y-3">
            <SigmaBars S={S} k={kClamped} tol={tol} />

            <p className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 font-mono text-xs leading-relaxed text-[var(--fg)] sm:text-sm">
              A<sub>k</sub> = {eqTerms.join(' + ')}
              {reveal > 0 ? (
                <span className="text-[var(--fg-muted)]"> · mostrando i=1…{Math.min(reveal, kClamped)}</span>
              ) : null}
            </p>

            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              <NumberHeatmap A={A} label="A" />
              <NumberHeatmap A={displayAk} label={reveal > 0 ? `A₍${Math.min(reveal, kClamped)}₎` : 'Aₖ'} />
              <NumberHeatmap A={displayResidual} label="A − Aₖ" compact />
            </div>

            <ButtonRow>
              <VizButton onClick={buildStep} active={reveal > 0}>
                Construir aproximación
                {reveal > 0 ? ` (${Math.min(reveal, kClamped)}/${kClamped})` : ''}
              </VizButton>
              {reveal > 0 ? (
                <VizButton onClick={() => setReveal(0)}>Mostrar Aₖ completa</VizButton>
              ) : null}
            </ButtonRow>

            <CollapsibleEdit
              label="Nota Eckart–Young–Mirsky"
              open={eckartOpen}
              onToggle={() => setEckartOpen((o) => !o)}
            >
              <div className="space-y-2 text-sm text-[var(--fg-muted)]">
                <Badge tone="ok">ÓPTIMA EN RANGO ≤ k</Badge>
                <p>
                  Entre todas las matrices B con rango(B) ≤ k, la truncación SVD A_k minimiza ‖A−B‖F y
                  ‖A−B‖₂. El error espectral es exactamente σ<sub>{kClamped + 1}</sub> (o 0 si no hay más
                  componentes).
                </p>
              </div>
            </CollapsibleEdit>
          </div>
        ) : null}

        {mode === 'geo' ? (
          <div className="space-y-3">
            {is2x2 ? (
              <>
                <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg)]">
                  {geoSvg}
                </div>
                <p className="text-sm text-[var(--fg-muted)]">
                  Elipse de A (trazos) vs A_k (teal). Ejes: <strong className="text-[var(--fg)]">vectores singulares</strong>{' '}
                  u₁, u₂ (no autovectores). Con k=1 la elipse colapsa a un segmento.
                </p>
              </>
            ) : (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-4 text-sm text-[var(--fg-muted)]">
                La vista geométrica compara elipses en ℝ². Usa el preset <strong className="text-[var(--fg)]">Elipse 2×2</strong>{' '}
                (o edita una matriz 2×2). Conceptualmente, A mapea el círculo unitario a una elipse cuyos
                semiejes son σ_i u_i; A_k trunca esos semiejes.
              </div>
            )}
          </div>
        ) : null}

        {mode === 'compress' ? (
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <ImageGrid A={compressSrc} label="Original" />
              <ImageGrid A={compressApprox.Ak} label={`Aₖ (k=${kClamped})`} />
              <ImageGrid A={compressApprox.residual} label="Residual" />
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge tone="neutral">
                Almacenamiento: mn = {rows(compressSrc) * cols(compressSrc)}
              </Badge>
              <Badge tone="neutral">
                k(m+n+1) = {kClamped * (rows(compressSrc) + cols(compressSrc) + 1)}
              </Badge>
              {kClamped * (rows(compressSrc) + cols(compressSrc) + 1) <
              rows(compressSrc) * cols(compressSrc) ? (
                <Badge tone="ok">
                  Ahorro ≈{' '}
                  {rows(compressSrc) * cols(compressSrc) -
                    kClamped * (rows(compressSrc) + cols(compressSrc) + 1)}{' '}
                  entradas
                </Badge>
              ) : (
                <Badge tone="warn">Sin ahorro de almacenamiento con este k</Badge>
              )}
            </div>
            <p className="text-xs text-[var(--fg-muted)]">
              Imagen sintética determinista (blobs + gradiente). Solo afirmamos compresión si k(m+n+1) &lt; mn.
              Para la matriz actual A: mn={storageFull}, k(m+n+1)={storageK}
              {savings > 0 ? ` (ahorro ${savings})` : ' (sin ahorro)'}.
            </p>
          </div>
        ) : null}

        <CollapsibleEdit
          label="Editar matriz (entradas)"
          open={editOpen}
          onToggle={() => setEditOpen((o) => !o)}
        >
          <div className="space-y-2">
            <p className="text-xs text-[var(--fg-muted)]">
              Ajustes pequeños; cambios grandes pueden alterar el espectro pedagógico.
            </p>
            <div
              className="inline-grid gap-1"
              style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 4.5rem))` }}
            >
              {A.map((row, i) =>
                row.map((v, j) => (
                  <input
                    key={`${i}-${j}`}
                    type="number"
                    step={0.1}
                    value={Number(v.toFixed(3))}
                    onChange={(e) => onEditCell(i, j, e.target.value)}
                    className="w-full rounded border border-[var(--border)] bg-[var(--bg)] px-1 py-1 font-mono text-xs text-[var(--fg)]"
                    aria-label={`a${i + 1}${j + 1}`}
                  />
                )),
              )}
            </div>
          </div>
        </CollapsibleEdit>
      </div>
    </VizPanel>
  );
}
