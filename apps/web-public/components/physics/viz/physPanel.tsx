'use client';

import type { ReactNode } from 'react';
import { ButtonRow, VizButton } from '@/components/algebra/viz/controls';

export function PhysResult({
  primary,
  secondary,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
}) {
  return (
    <div className="space-y-1 rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2">
      <div className="font-mono text-sm font-semibold tabular-nums text-[var(--fg)]">{primary}</div>
      {secondary ? <div className="font-mono text-xs tabular-nums text-[var(--fg-muted)]">{secondary}</div> : null}
    </div>
  );
}

export function PhysPresets({
  items,
}: {
  items: Array<{ id: string; label: string; onSelect: () => void }>;
}) {
  return (
    <ButtonRow>
      {items.map((it) => (
        <VizButton key={it.id} onClick={it.onSelect}>
          {it.label}
        </VizButton>
      ))}
    </ButtonRow>
  );
}

export function PhysDimBadge({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-xs font-medium text-[var(--fg-muted)]">
      {children}
    </p>
  );
}
