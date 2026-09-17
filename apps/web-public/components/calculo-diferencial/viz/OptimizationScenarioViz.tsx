'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { fmt } from '@/components/calculo/viz/calcMath';
import { PLOT_H, PLOT_M, PLOT_W, pathOf, toX, toY, yRange } from './plotUtils';

type Props = { mode?: string };

function RectangleMode() {
  const t = useTranslations('vizDif.optimization');
  const C = 20;
  const half = C / 2;
  const [x, setX] = useState(4);
  const y = half - x;
  const area = x * y;
  const maxX = half / 2;
  const maxArea = maxX * (half - maxX);

  const a = (v: number) => v * (half - v);
  const range = yRange(a, 0.5, half - 0.5);
  const curve = pathOf(a, 0.5, half - 0.5, range.yMin, range.yMax);

  const rectW = 120;
  const rectH = Math.max(20, (y / half) * 80);
  const rectX = 40;
  const rectY = 100 - rectH;

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-[var(--fg)]">{t('rectangleIdea')}</p>
      <ControlsStack>
        <SliderRow label={t('widthLabel')} value={x} min={1} max={half - 1} step={0.1} onChange={setX} />
      </ControlsStack>
      <div className="grid gap-4 lg:grid-cols-2">
        <svg viewBox="0 0 200 120" className="mx-auto w-full max-w-xs rounded-lg border border-[var(--border)] bg-[var(--formula-bg)]">
          <rect x={rectX} y={rectY} width={rectW} height={rectH} fill="var(--accent-soft)" stroke="var(--accent-strong)" strokeWidth={2} />
          <text x={rectX + rectW / 2} y={rectY - 6} textAnchor="middle" className="fill-[var(--fg-muted)] text-[10px]">x={fmt(x, 2)}</text>
          <text x={rectX - 8} y={rectY + rectH / 2} textAnchor="end" className="fill-[var(--fg-muted)] text-[10px]">y={fmt(y, 2)}</text>
        </svg>
        <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="w-full rounded-lg border border-[var(--border)] bg-[var(--formula-bg)]">
          <path d={curve} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
          <circle cx={toX(x, 0, half)} cy={toY(area, range.yMin, range.yMax)} r={5} fill="#22c55e" />
          <circle cx={toX(maxX, 0, half)} cy={toY(maxArea, range.yMin, range.yMax)} r={5} fill="#f59e0b" />
        </svg>
      </div>
      <dl className="grid gap-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-[var(--fg-muted)]">{t('area')}</dt>
          <dd className="font-mono font-semibold">{fmt(area, 4)}</dd>
        </div>
        <div>
          <dt className="text-[var(--fg-muted)]">{t('maxAt')}</dt>
          <dd className="font-mono font-semibold text-[#f59e0b]">x = {fmt(maxX, 2)}</dd>
        </div>
        <div>
          <dt className="text-[var(--fg-muted)]">{t('maxArea')}</dt>
          <dd className="font-mono font-semibold">{fmt(maxArea, 4)}</dd>
        </div>
      </dl>
    </div>
  );
}

function CylinderMode() {
  const t = useTranslations('vizDif.optimization');
  const C = 24;
  const [r, setR] = useState(1.2);
  const v = (rad: number) => (C * rad) / 2 - Math.PI * rad ** 3;
  const h = (C - 2 * Math.PI * r * r) / (2 * Math.PI * r);
  const volume = v(r);
  const rMax = Math.sqrt(C / (6 * Math.PI));
  const vMax = v(rMax);
  const range = yRange(v, 0.3, 2.5);
  const curve = pathOf(v, 0.3, 2.5, range.yMin, range.yMax);

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-[var(--fg)]">{t('cylinderIdea')}</p>
      <ControlsStack>
        <SliderRow label={t('radiusLabel')} value={r} min={0.4} max={2.2} step={0.05} onChange={setR} />
      </ControlsStack>
      <div className="grid gap-4 lg:grid-cols-2">
        <svg viewBox="0 0 160 140" className="mx-auto w-full max-w-xs rounded-lg border border-[var(--border)] bg-[var(--formula-bg)]">
          <ellipse cx={80} cy={35} rx={30 + r * 8} ry={10 + r * 2} fill="var(--accent-soft)" stroke="var(--accent-strong)" />
          <rect x={80 - (30 + r * 8)} y={35} width={(30 + r * 8) * 2} height={50 + r * 15} fill="var(--accent-soft)" stroke="var(--accent-strong)" opacity={0.6} />
          <ellipse cx={80} cy={85 + r * 15} rx={30 + r * 8} ry={10 + r * 2} fill="none" stroke="var(--accent-strong)" />
          <text x={80} y={130} textAnchor="middle" className="fill-[var(--fg-muted)] text-[10px]">r={fmt(r, 2)}, h={fmt(h, 2)}</text>
        </svg>
        <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="w-full rounded-lg border border-[var(--border)] bg-[var(--formula-bg)]">
          <path d={curve} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
          <circle cx={toX(r, 0.3, 2.5)} cy={toY(volume, range.yMin, range.yMax)} r={5} fill="#22c55e" />
          <circle cx={toX(rMax, 0.3, 2.5)} cy={toY(vMax, range.yMin, range.yMax)} r={5} fill="#f59e0b" />
        </svg>
      </div>
      <dl className="grid gap-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-[var(--fg-muted)]">V(r)</dt>
          <dd className="font-mono font-semibold">{fmt(volume, 4)}</dd>
        </div>
        <div>
          <dt className="text-[var(--fg-muted)]">{t('maxAt')}</dt>
          <dd className="font-mono font-semibold text-[#f59e0b]">r ≈ {fmt(rMax, 3)}</dd>
        </div>
        <div>
          <dt className="text-[var(--fg-muted)]">V_max</dt>
          <dd className="font-mono font-semibold">{fmt(vMax, 4)}</dd>
        </div>
      </dl>
    </div>
  );
}

export function OptimizationScenarioViz({ mode = 'rectangle' }: Props) {
  const body = mode === 'cylinder' ? <CylinderMode /> : <RectangleMode />;
  return <VizPanel>{body}</VizPanel>;
}
