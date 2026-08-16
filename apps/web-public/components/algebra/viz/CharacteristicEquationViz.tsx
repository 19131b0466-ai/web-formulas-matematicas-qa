'use client';

import { useId, useState } from 'react';
import {
  ControlsStack,
  SliderRow,
  VizPanel,
  joinCaption,
} from './controls';
import {
  AminusLambdaI,
  charPolyAt,
  charRoots,
  det2,
  formatNum,
  EIG_EPS,
  EIG_NEAR,
  scalarMat,
} from './eigenHelpers';
import type { Mat2 } from './math2d';
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

type Mode = 'build' | 'graph' | 'meaning';
type PresetId = 'two' | 'rep' | 'cx' | 'sing' | 'diag' | 'scalar' | null;

const PRESETS: Array<{ id: PresetId; label: string; m: Mat2 }> = [
  {
    id: 'two',
    label: '2 raíces',
    m: [
      [2, 1],
      [0, 3],
    ],
  },
  {
    id: 'rep',
    label: 'Raíz repetida',
    m: [
      [2, 1],
      [0, 2],
    ],
  },
  {
    id: 'cx',
    label: 'Complejas',
    m: [
      [0, -1],
      [1, 0],
    ],
  },
  {
    id: 'sing',
    label: 'Singular',
    m: [
      [2, 0],
      [0, 0],
    ],
  },
  {
    id: 'diag',
    label: 'Diagonal',
    m: [
      [2, 0],
      [0, 3],
    ],
  },
  {
    id: 'scalar',
    label: 'Escalar 3I',
    m: [
      [3, 0],
      [0, 3],
    ],
  },
];

function polyExpr(tr: number, det: number): string {
  const t = formatNum(tr);
  const d = formatNum(det);
  const mid = Math.abs(tr) < EIG_EPS ? '' : tr > 0 ? `−${t}λ` : `+${formatNum(-tr)}λ`;
  const last = Math.abs(det) < EIG_EPS ? '' : det >= 0 ? `+${d}` : `−${formatNum(-det)}`;
  return `λ²${mid}${last}`;
}

/**
 * Ecuación característica p_A(λ) = det(A−λI) = 0 (ALG-EIG-002).
 */
export function CharacteristicEquationViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [A, setA] = useState<Mat2>([
    [2, 1],
    [0, 3],
  ]);
  const [lambda, setLambda] = useState(2);
  const [mode, setMode] = useState<Mode>('build');
  const [editOpen, setEditOpen] = useState(false);
  const [preset, setPreset] = useState<PresetId>('two');

  const tr = A[0][0] + A[1][1];
  const detA = det2(A);
  const p = charPolyAt(A, lambda);
  const rootsInfo = charRoots(A);
  const lamI = scalarMat(lambda);
  const AmL = AminusLambdaI(A, lambda);
  const detAmL = det2(AmL);
  const nearRoot = Math.abs(p) < EIG_NEAR * (1 + Math.abs(lambda) + Math.abs(tr));

  const applyPreset = (id: PresetId) => {
    const pset = PRESETS.find((x) => x.id === id);
    if (!pset) return;
    setPreset(id);
    setA(cloneMat2(pset.m));
    const r = charRoots(pset.m);
    if (r.roots[0] != null) setLambda(r.roots[0]);
    else setLambda(0);
  };

  // Graph view window
  const rootVals = rootsInfo.roots;
  const focus = [...rootVals, lambda, 0, tr / 2];
  const xLo = Math.min(...focus) - 2;
  const xHi = Math.max(...focus) + 2;
  const samples: number[] = [];
  for (let i = 0; i <= 40; i++) {
    const x = xLo + ((xHi - xLo) * i) / 40;
    samples.push(charPolyAt(A, x));
  }
  const yLo = Math.min(-2, ...samples) - 1;
  const yHi = Math.max(2, ...samples) + 1;

  const GW = 440;
  const GH = 260;
  const margin = { l: 42, r: 20, t: 20, b: 36 };
  const plotW = GW - margin.l - margin.r;
  const plotH = GH - margin.t - margin.b;
  const toX = (x: number) => margin.l + ((x - xLo) / (xHi - xLo)) * plotW;
  const toY = (y: number) => margin.t + ((yHi - y) / (yHi - yLo)) * plotH;

  let path = '';
  for (let i = 0; i <= 120; i++) {
    const x = xLo + ((xHi - xLo) * i) / 120;
    const y = charPolyAt(A, x);
    path += `${i === 0 ? 'M' : 'L'}${toX(x)},${toY(y)}`;
  }

  const rootLabel =
    rootsInfo.kind === 'two_real'
      ? `raíces λ = ${rootsInfo.roots.map((r) => formatNum(r)).join(', ')}`
      : rootsInfo.kind === 'repeated'
        ? `raíz doble λ = ${formatNum(rootsInfo.roots[0] ?? 0)}`
        : 'raíces complejas (sin corte real)';

  const caption = joinCaption(
    `p_A(λ) = ${polyExpr(tr, detA)}`,
    rootLabel,
  );

  return (
    <VizPanel title="Ecuación característica" caption={caption}>
      <div className="space-y-3">
        <GuideBlock
          idea="Los valores propios son las raíces de p_A(λ) = det(A − λI) = 0."
          tryIt="Mueve λ: cuando p_A(λ) ≈ 0, A−λI es singular y aparece el badge de valor propio."
          concept="det(A−λI)=0 ⇒ existe v ≠ 0 con (A−λI)v = 0 ⇒ Av = λv."
        />

        <Segmented
          options={[
            { id: 'build', label: 'Construcción' },
            { id: 'graph', label: 'Gráfica' },
            { id: 'meaning', label: 'Significado' },
          ]}
          value={mode}
          onChange={(id) => setMode(id as Mode)}
        />

        <ChipRow>
          {PRESETS.map((pset) => (
            <Chip key={pset.id} active={preset === pset.id} onClick={() => applyPreset(pset.id)}>
              {pset.label}
            </Chip>
          ))}
        </ChipRow>

        <div className="flex flex-wrap items-center gap-2">
          {nearRoot ? (
            <>
              <Badge tone="ok">SINGULAR</Badge>
              <Badge tone="ok">valor propio</Badge>
            </>
          ) : (
            <Badge tone="neutral">p_A(λ) ≠ 0</Badge>
          )}
          <span className="font-mono text-sm">
            p_A({formatNum(lambda)}) = {formatNum(p, 3)}
          </span>
        </div>

        {mode === 'build' ? (
          <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
            <p className="font-mono text-sm text-[var(--fg)]">
              p_A(λ) = λ² − tr(A)λ + det(A) = {polyExpr(tr, detA)}
            </p>
            <p className="text-sm text-[var(--fg-muted)]">Ecuación: p_A(λ) = 0</p>
            <div className="flex flex-wrap items-start gap-4">
              <div>
                <p className="mb-1 text-xs font-semibold text-[var(--fg-muted)]">A</p>
                <Mat2Editor m={A} readOnly name="A" />
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold text-[var(--fg-muted)]">λI</p>
                <Mat2Editor
                  m={lamI}
                  readOnly
                  name="λI"
                  highlightCells={[
                    [0, 0],
                    [1, 1],
                  ]}
                />
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold text-[var(--fg-muted)]">A − λI</p>
                <Mat2Editor
                  m={AmL}
                  readOnly
                  name="A−λI"
                  highlightCells={[
                    [0, 0],
                    [1, 1],
                  ]}
                />
              </div>
            </div>
            <p className="font-mono text-xs text-[var(--fg-muted)]">
              λ solo en la diagonal de λI · det(A−λI) = {formatNum(detAmL, 3)}
            </p>
            <p className="text-sm">
              {rootsInfo.kind === 'complex'
                ? 'Sin raíces reales: el polinomio no corta el eje λ.'
                : `Autovalores (raíces reales): ${rootsInfo.roots.map((r) => formatNum(r)).join(', ')}`}
            </p>
          </div>
        ) : null}

        {mode === 'graph' ? (
          <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg)]">
            <svg viewBox={`0 0 ${GW} ${GH}`} className="h-auto w-full" role="img" aria-labelledby={`${uid}-title`}>
              <title id={`${uid}-title`}>Gráfica de p_A(λ)</title>
              {/* axes */}
              <line
                x1={margin.l}
                y1={toY(0)}
                x2={GW - margin.r}
                y2={toY(0)}
                stroke="currentColor"
                opacity={0.35}
              />
              <line
                x1={toX(0)}
                y1={margin.t}
                x2={toX(0)}
                y2={GH - margin.b}
                stroke="currentColor"
                opacity={0.28}
              />
              <text x={GW - margin.r - 4} y={toY(0) - 8} fontSize={12} textAnchor="end" opacity={0.7}>
                λ
              </text>
              <text x={toX(0) + 8} y={margin.t + 12} fontSize={12} opacity={0.7}>
                p_A
              </text>

              <path d={path} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />

              {/* real roots */}
              {rootsInfo.roots.map((r, i) => (
                <g key={i}>
                  <circle cx={toX(r)} cy={toY(0)} r={6} fill="orange" />
                  <text
                    x={toX(r)}
                    y={toY(0) + 18}
                    textAnchor="middle"
                    fontSize={11}
                    fill="orange"
                    fontWeight={600}
                  >
                    λ={formatNum(r)}
                  </text>
                </g>
              ))}

              {/* interactive point */}
              <circle
                cx={toX(lambda)}
                cy={toY(p)}
                r={7}
                fill={nearRoot ? 'orange' : 'var(--accent-strong)'}
                stroke="var(--bg)"
                strokeWidth={2}
              />
              <text
                x={toX(lambda) + 10}
                y={toY(p) - 8}
                fontSize={11}
                fill="var(--fg)"
                fontWeight={600}
              >
                ({formatNum(lambda)}, {formatNum(p, 2)})
              </text>
            </svg>
          </div>
        ) : null}

        {mode === 'meaning' ? (
          <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 text-sm leading-relaxed">
            <p className="font-medium text-[var(--fg)]">Cadena de equivalencias en λ valor propio:</p>
            <ol className="list-decimal space-y-2 pl-5 text-[var(--fg-muted)]">
              <li>
                <span className="font-mono text-[var(--fg)]">p_A(λ) = 0</span> ⇒{' '}
                <span className="font-mono text-[var(--fg)]">det(A−λI) = 0</span>
              </li>
              <li>
                A−λI es <strong className="text-[var(--fg)]">singular</strong>
              </li>
              <li>
                <span className="font-mono text-[var(--fg)]">ker(A−λI) ≠ {'{0}'}</span>
              </li>
              <li>
                Existe v ≠ 0 con <span className="font-mono text-[var(--fg)]">(A−λI)v = 0</span> ⇒{' '}
                <span className="font-mono text-[var(--fg)]">Av = λv</span>
              </li>
            </ol>
            <div className="rounded-md border border-[var(--border)] px-3 py-2 font-mono text-xs">
              λ = {formatNum(lambda)} · det(A−λI) = {formatNum(detAmL, 3)} ·{' '}
              {nearRoot ? 'singular ✓ · valor propio ✓' : 'aún no singular'}
            </div>
            {rootsInfo.kind !== 'complex' ? (
              <p>
                Raíces marcadas: {rootsInfo.roots.map((r) => formatNum(r)).join(', ')}. Acerca el
                deslizador a una raíz para ver SINGULAR.
              </p>
            ) : (
              <p>Con raíces complejas no hay λ real que haga singular a A−λI.</p>
            )}
          </div>
        ) : null}

        <ControlsStack>
          <SliderRow
            label="λ"
            ariaLabel="Parámetro lambda"
            value={lambda}
            min={Math.min(xLo, -4)}
            max={Math.max(xHi, 4)}
            step={0.05}
            onChange={setLambda}
          />
          {rootsInfo.roots.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {rootsInfo.roots.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  className="rounded-md border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--fg-muted)] hover:border-[var(--accent-strong)]/50"
                  onClick={() => setLambda(r)}
                >
                  Ir a λ{rootsInfo.roots.length > 1 ? i + 1 : ''} = {formatNum(r)}
                </button>
              ))}
            </div>
          ) : null}
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
            <p className="mt-2 font-mono text-xs text-[var(--fg-muted)]">
              tr = {formatNum(tr)} · det(A) = {formatNum(detA)} (auxiliar; el pie muestra p_A y
              raíces)
            </p>
          </CollapsibleEdit>
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
