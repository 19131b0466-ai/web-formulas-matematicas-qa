'use client';

import { useState } from 'react';
import type { ComputationalCost } from '@repo/shared-types';
import { InlineMarkdown } from '@/components/content/InlineMarkdown';
import { useVizLabels } from '@/lib/viz-labels';

type Props = {
  cost: ComputationalCost;
  title: string;
  showLabel: string;
  hideLabel: string;
};

export function ComputationalCostPanel({ cost, title, showLabel, hideLabel }: Props) {
  // Secondary CS note: start collapsed so it does not compete with the main lesson.
  const [open, setOpen] = useState(false);
  const v = useVizLabels();
  const body = cost.markdown ?? [cost.assumptions, cost.time, cost.space, cost.notes].filter(Boolean).join('\n\n');

  return (
    <section className="animate-rise" style={{ animationDelay: '110ms' }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
        <button
          type="button"
          onClick={() => setOpen((vOpen) => !vOpen)}
          className="rounded-lg border border-[var(--border)] px-3 py-1 text-sm text-[var(--fg-muted)] hover:bg-[var(--accent-soft)]"
        >
          {open ? hideLabel : showLabel}
        </button>
      </div>
      {open ? (
        <div className="mt-3 space-y-2 rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] px-4 py-3 text-base leading-relaxed">
          {cost.time ? <p className="font-mono text-sm">{v.time}: {cost.time}</p> : null}
          {cost.space ? <p className="font-mono text-sm">{v.space}: {cost.space}</p> : null}
          {body ? (
            <div className="text-sm text-[var(--fg)]">
              {/* Keep $$ / \[ \] so InlineMarkdown can render display math; do not flatten to $. */}
              <InlineMarkdown text={body} />
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
