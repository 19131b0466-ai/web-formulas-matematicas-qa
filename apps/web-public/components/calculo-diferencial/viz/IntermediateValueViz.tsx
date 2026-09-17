'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { fmt } from '@/components/calculo/viz/calcMath';
import { PLOT_H, PLOT_M, PLOT_W, pathOf, toX, toY, yRange } from './plotUtils';

const A = 0;
const B = 4;
const f = (x: number) => Math.sin(x) + 0.25 * x + 1.2;

function findC(k: number): number | null {
  const steps = 400;
  let prevX = A;
  let prevY = f(A);
  for (let i = 1; i <= steps; i++) {
    const x = A + (i / steps) * (B - A);
    const y = f(x);
    if ((prevY - k) * (y - k) <= 0 && Math.abs(y - k) < 0.08) return x;
    if ((prevY - k) * (y - k) < 0) {
      return prevX + ((k - prevY) / (y - prevY)) * (x - prevX);
    }
    prevX = x;
    prevY = y;
  }
  return null;
}

export function IntermediateValueViz() {
  const t = useTranslations('vizDif.intermediateValue');
  const xMin = A;
  const xMax = B;
  const fa = f(A);
  const fb = f(B);
  const kMin = Math.min(fa, fb) + 0.05;
  const kMax = Math.max(fa, fb) - 0.05;
  const [k, setK] = useState((fa + fb) / 2);
  const range = yRange(f, xMin, xMax);
  const curve = pathOf(f, xMin, xMax, range.yMin, range.yMax);
  const c = useMemo(() => findC(k), [k]);

  return (
    <VizPanel>
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-[var(--fg)]">{t('idea')}</p>
        <ControlsStack>
          <SliderRow label={t('kLabel')} value={k} min={kMin} max={kMax} step={0.02} onChange={setK} />
        </ControlsStack>
        <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="w-full rounded-lg border border-[var(--border)] bg-[var(--formula-bg)]">
          <line
            x1={PLOT_M.l}
            y1={toY(k, range.yMin, range.yMax)}
            x2={PLOT_W - PLOT_M.r}
            y2={toY(k, range.yMin, range.yMax)}
            stroke="#22c55e"
            strokeDasharray="5 4"
          />
          <path d={curve} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
          <circle cx={toX(A, xMin, xMax)} cy={toY(fa, range.yMin, range.yMax)} r={5} fill="#3b82f6" />
          <circle cx={toX(B, xMin, xMax)} cy={toY(fb, range.yMin, range.yMax)} r={5} fill="#f59e0b" />
          {c !== null ? (
            <circle cx={toX(c, xMin, xMax)} cy={toY(k, range.yMin, range.yMax)} r={5} fill="#22c55e" />
          ) : null}
        </svg>
        <dl className="grid gap-2 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-[var(--fg-muted)]">f(a)</dt>
            <dd className="font-mono font-semibold">{fmt(fa, 4)}</dd>
          </div>
          <div>
            <dt className="text-[var(--fg-muted)]">f(b)</dt>
            <dd className="font-mono font-semibold">{fmt(fb, 4)}</dd>
          </div>
          <div>
            <dt className="text-[var(--fg-muted)]">k</dt>
            <dd className="font-mono font-semibold">{fmt(k, 4)}</dd>
          </div>
          <div>
            <dt className="text-[var(--fg-muted)]">c</dt>
            <dd className="font-mono font-semibold text-[#22c55e]">{c !== null ? fmt(c, 4) : '—'}</dd>
          </div>
        </dl>
        <p className="text-xs text-[var(--fg-muted)]">{t('note')}</p>
      </div>
    </VizPanel>
  );
}
