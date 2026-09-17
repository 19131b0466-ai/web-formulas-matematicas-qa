'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { fmt } from '@/components/calculo/viz/calcMath';
import { PLOT_H, PLOT_M, PLOT_W, pathOf, toX, toY, yRange } from './plotUtils';

type DiscType = 'removable' | 'jump' | 'infinite';

type DiscPreset = {
  type: DiscType;
  label: string;
  f: (x: number) => number;
  a: number;
  xMin: number;
  xMax: number;
  fa?: number;
  limit?: number;
};

const DISC_PRESETS: DiscPreset[] = [
  {
    type: 'removable',
    label: 'x² (hueco)',
    f: (x) => x * x,
    a: 0,
    xMin: -2,
    xMax: 2,
    fa: 1,
    limit: 0,
  },
  {
    type: 'jump',
    label: 'Salto en 0',
    f: (x) => (x < 0 ? x - 1 : x + 1),
    a: 0,
    xMin: -2,
    xMax: 2,
    fa: 1,
    limit: NaN,
  },
  {
    type: 'infinite',
    label: '1/x',
    f: (x) => 1 / x,
    a: 0,
    xMin: -2,
    xMax: 2,
  },
];

type Props = { mode?: string };

function DefinitionMode() {
  const t = useTranslations('vizDif.continuity');
  const a = 1;
  const f = (x: number) => x * x - 0.5;
  const xMin = -0.5;
  const xMax = 2.5;
  const [x, setX] = useState(1.2);
  const range = yRange(f, xMin, xMax);
  const curve = pathOf(f, xMin, xMax, range.yMin, range.yMax);
  const fa = f(a);
  const fx = f(x);

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-[var(--fg)]">{t('definitionIdea')}</p>
      <ControlsStack>
        <SliderRow label={t('xNearA')} value={x} min={xMin + 0.05} max={xMax - 0.05} step={0.02} onChange={setX} />
      </ControlsStack>
      <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="w-full rounded-lg border border-[var(--border)] bg-[var(--formula-bg)]">
        <path d={curve} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
        <circle cx={toX(a, xMin, xMax)} cy={toY(fa, range.yMin, range.yMax)} r={5} fill="var(--accent-strong)" />
        <circle cx={toX(x, xMin, xMax)} cy={toY(fx, range.yMin, range.yMax)} r={5} fill="#f59e0b" />
      </svg>
      <dl className="grid gap-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-[var(--fg-muted)]">f(a)</dt>
          <dd className="font-mono font-semibold">{fmt(fa, 4)}</dd>
        </div>
        <div>
          <dt className="text-[var(--fg-muted)]">f(x)</dt>
          <dd className="font-mono font-semibold">{fmt(fx, 4)}</dd>
        </div>
        <div>
          <dt className="text-[var(--fg-muted)]">{t('continuous')}</dt>
          <dd className="font-semibold text-[#22c55e]">{t('yes')}</dd>
        </div>
      </dl>
    </div>
  );
}

function DiscontinuityMode() {
  const t = useTranslations('vizDif.continuity');
  const [idx, setIdx] = useState(0);
  const preset = DISC_PRESETS[idx]!;
  const { f, a, xMin, xMax, type } = preset;
  const range = yRange(f, xMin, xMax, type === 'infinite' ? 120 : 200);

  const curves = useMemo(() => {
    if (type === 'jump') {
      return {
        left: pathOf(f, xMin, a - 0.02, range.yMin, range.yMax),
        right: pathOf(f, a + 0.02, xMax, range.yMin, range.yMax),
      };
    }
    if (type === 'infinite') {
      return {
        left: pathOf(f, xMin, -0.08, range.yMin, range.yMax),
        right: pathOf(f, 0.08, xMax, range.yMin, range.yMax),
      };
    }
    const left = pathOf(f, xMin, a - 0.02, range.yMin, range.yMax);
    const right = pathOf(f, a + 0.02, xMax, range.yMin, range.yMax);
    return { left, right };
  }, [f, a, xMin, xMax, range.yMin, range.yMax, type]);

  const typeLabel =
    type === 'removable' ? t('typeRemovable') : type === 'jump' ? t('typeJump') : t('typeInfinite');

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-[var(--fg)]">{t('discontinuityIdea')}</p>
      <div className="flex flex-wrap gap-2">
        {DISC_PRESETS.map((p, i) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setIdx(i)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition ${
              i === idx
                ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                : 'border-[var(--border)] text-[var(--fg-muted)] hover:border-[var(--accent-strong)]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="w-full rounded-lg border border-[var(--border)] bg-[var(--formula-bg)]">
        <path d={curves.left} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
        <path d={curves.right} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
        <line x1={toX(a, xMin, xMax)} y1={PLOT_M.t} x2={toX(a, xMin, xMax)} y2={PLOT_H - PLOT_M.b} stroke="var(--fg-muted)" strokeDasharray="4 3" />
        {type === 'removable' && preset.fa !== undefined ? (
          <>
            <circle cx={toX(a, xMin, xMax)} cy={toY(preset.limit ?? 0, range.yMin, range.yMax)} r={5} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
            <circle cx={toX(a, xMin, xMax)} cy={toY(preset.fa, range.yMin, range.yMax)} r={5} fill="#ef4444" />
          </>
        ) : null}
      </svg>
      <p className="text-sm font-medium text-[var(--accent-strong)]">{typeLabel}</p>
    </div>
  );
}

export function ContinuityCheckerViz({ mode = 'definition' }: Props) {
  const body = mode === 'discontinuity' ? <DiscontinuityMode /> : <DefinitionMode />;
  return <VizPanel>{body}</VizPanel>;
}
