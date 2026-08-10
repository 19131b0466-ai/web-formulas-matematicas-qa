'use client';

import type { ReactNode } from 'react';

export function VizPanel({
  title,
  children,
  caption,
}: {
  title?: string;
  children: ReactNode;
  caption?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--formula-bg)]">
      {title ? (
        <div className="border-b border-[var(--border)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
          {title}
        </div>
      ) : null}
      <div className="px-3 py-3 sm:px-4">{children}</div>
      {caption ? (
        <p className="border-t border-[var(--border)] px-4 py-2 text-sm leading-relaxed text-[var(--fg-muted)]">
          {caption}
        </p>
      ) : null}
    </div>
  );
}

export function SliderRow({
  label,
  ariaLabel,
  value,
  min,
  max,
  step = 0.1,
  onChange,
}: {
  label: string;
  ariaLabel?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <span className="w-16 shrink-0 font-mono text-[var(--fg-muted)]">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={ariaLabel ?? label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full accent-[var(--accent-strong)]"
      />
      <span className="w-12 shrink-0 text-right font-mono tabular-nums">{fmt(value)}</span>
    </label>
  );
}

export function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-[var(--accent-strong)]"
      />
      <span>{label}</span>
    </label>
  );
}

export function ButtonRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

export function VizButton({
  children,
  onClick,
  active,
}: {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
        active
          ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
          : 'border-[var(--border)] bg-[var(--bg)] text-[var(--fg)] hover:bg-[var(--accent-soft)]'
      }`}
    >
      {children}
    </button>
  );
}

export function fmt(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '—';
  const a = Math.abs(n);
  if (a !== 0 && (a >= 1000 || a < 0.01)) return n.toExponential(2);
  return n.toFixed(digits).replace(/\.?0+$/, '') || '0';
}

/** Join caption parts, skipping empties (avoids a leading " · "). */
export function joinCaption(...parts: Array<string | false | null | undefined>): string | undefined {
  const cleaned = parts
    .map((p) => (typeof p === 'string' ? p.trim() : ''))
    .filter(Boolean);
  return cleaned.length ? cleaned.join(' · ') : undefined;
}

export function ControlsStack({ children }: { children: ReactNode }) {
  return <div className="mt-3 space-y-2">{children}</div>;
}
