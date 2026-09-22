'use client';

import type { ReactNode } from 'react';
import { fmt } from './formatNumber';

export { fmt };

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
      <div className="px-4 py-4 sm:px-5">{children}</div>
      {caption ? (
        <p className="border-t border-[var(--border)] px-4 py-4 text-sm leading-relaxed text-[var(--fg-muted)]">
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
  stacked: _stacked = true,
}: {
  label: string;
  ariaLabel?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  /** Kept for callers; sliders always stack so long labels never sit on the track. */
  stacked?: boolean;
}) {
  return (
    <div
      className="w-full text-sm"
      style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
        <span className="leading-5 text-[var(--fg-muted)]">{label}</span>
        <span className="shrink-0 font-mono tabular-nums">{fmt(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={ariaLabel ?? label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="viz-range cursor-pointer accent-[var(--accent-strong)]"
        style={{ display: 'block', width: '100%', height: 36, margin: 0 }}
      />
    </div>
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
  return (
    <div className="flex flex-wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      {children}
    </div>
  );
}

export function VizButton({
  children,
  onClick,
  active,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
        disabled
          ? 'cursor-not-allowed border-[var(--border)] bg-[var(--bg)] text-[var(--fg-muted)] opacity-60'
          : active
            ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
            : 'border-[var(--border)] bg-[var(--bg)] text-[var(--fg)] hover:bg-[var(--accent-soft)]'
      }`}
    >
      {children}
    </button>
  );
}

/** Join caption parts, skipping empties (avoids a leading " · "). */
export function joinCaption(...parts: Array<string | false | null | undefined>): string | undefined {
  const cleaned = parts
    .map((p) => (typeof p === 'string' ? p.trim() : ''))
    .filter(Boolean);
  return cleaned.length ? cleaned.join(' · ') : undefined;
}

export function ControlsStack({ children }: { children: ReactNode }) {
  return (
    <div
      className="mt-5"
      style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 20 }}
    >
      {children}
    </div>
  );
}
