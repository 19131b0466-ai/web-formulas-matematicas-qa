'use client';

import dynamic from 'next/dynamic';

export const FormulaVisualizationLazy = dynamic(
  () => import('./FormulaVisualization').then((m) => ({ default: m.FormulaVisualization })),
  {
    loading: () => (
      <div
        className="min-h-[280px] rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] motion-safe:animate-pulse"
        data-deferred-viz="loading"
      />
    ),
  },
);
