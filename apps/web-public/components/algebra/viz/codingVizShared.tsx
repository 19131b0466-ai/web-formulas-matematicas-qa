'use client';

import type { ReactNode } from 'react';
import type { Bit, BitVector } from './codingMath';
import { SliderRow } from './controls';
import { Badge } from './transformHelpers';

export function BitCell({
  value,
  onClick,
  highlight,
  tone = 'neutral',
  label,
  title,
  size = 'md',
}: {
  value: Bit;
  onClick?: () => void;
  highlight?: boolean;
  tone?: 'info' | 'parity' | 'error' | 'neutral' | 'match' | 'mismatch';
  label?: string;
  title?: string;
  size?: 'sm' | 'md';
}) {
  const sizeClass = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm';
  const toneClass =
    tone === 'info'
      ? 'border-emerald-700/50 bg-emerald-700/10'
      : tone === 'parity'
        ? 'border-teal-600/40 bg-teal-600/10'
        : tone === 'error'
          ? 'border-orange-500/60 bg-orange-500/15'
          : tone === 'match'
            ? 'border-[var(--border)] bg-[var(--bg)]'
            : tone === 'mismatch'
              ? 'border-orange-500/60 bg-orange-500/15'
              : 'border-[var(--border)] bg-[var(--bg)]';
  const highlightClass = highlight ? 'ring-2 ring-[var(--accent-strong)]' : '';

  const inner = (
    <span
      className={`inline-flex items-center justify-center rounded-lg border font-mono font-medium ${sizeClass} ${toneClass} ${highlightClass}`}
    >
      {value}
    </span>
  );

  if (!onClick) {
    return (
      <div className="flex flex-col items-center gap-1.5" title={title}>
        {label ? <span className="text-[10px] leading-none text-[var(--fg-muted)]">{label}</span> : null}
        {inner}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-strong)]"
      title={title}
      aria-label={title ?? `Bit ${value}`}
    >
      {label ? <span className="text-[10px] leading-none text-[var(--fg-muted)]">{label}</span> : null}
      {inner}
    </button>
  );
}

export function PositionLabels({ n, size = 'md' }: { n: number; size?: 'sm' | 'md' }) {
  const w = size === 'sm' ? 'w-8' : 'w-10';
  return (
    <div className="mb-1 flex gap-1.5">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className={`${w} text-center text-[10px] leading-4 text-[var(--fg-muted)]`}>
          {i + 1}
        </span>
      ))}
    </div>
  );
}

export function BitRow({
  word,
  label,
  onToggle,
  highlightIndices,
  toneForIndex,
  size = 'md',
}: {
  word: BitVector;
  label?: string;
  onToggle?: (index: number) => void;
  highlightIndices?: Set<number>;
  toneForIndex?: (index: number) => 'info' | 'parity' | 'error' | 'neutral' | 'match' | 'mismatch';
  size?: 'sm' | 'md';
}) {
  return (
    <div className="space-y-2">
      {label ? <p className="text-xs font-medium text-[var(--fg-muted)]">{label}</p> : null}
      <PositionLabels n={word.length} size={size} />
      <div className="flex flex-wrap gap-1.5">
        {word.map((b, i) => (
          <BitCell
            key={i}
            value={b}
            onClick={onToggle ? () => onToggle(i) : undefined}
            highlight={highlightIndices?.has(i)}
            tone={toneForIndex?.(i) ?? 'neutral'}
            title={`Posición ${i + 1}: ${b}`}
            size={size}
          />
        ))}
      </div>
    </div>
  );
}

export function CompareIndicator({ same }: { same: boolean }) {
  return (
    <span
      className={`inline-flex h-10 w-10 items-center justify-center text-sm font-medium ${
        same ? 'text-[var(--fg-muted)]' : 'text-orange-600 dark:text-orange-400'
      }`}
      aria-hidden
    >
      {same ? '=' : '≠'}
    </span>
  );
}

export function StackedSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <SliderRow label={label} value={value} min={min} max={max} step={step} onChange={onChange} />
  );
}

export function SectionCard({
  title,
  children,
  className = '',
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4 ${className}`}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-3 text-center">
      <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--fg-muted)]">{label}</p>
      <p className="mt-0.5 font-mono text-lg font-semibold tabular-nums">{value}</p>
      {subtitle ? <p className="mt-0.5 text-[10px] text-[var(--fg-muted)]">{subtitle}</p> : null}
    </div>
  );
}

export function ProportionalBar({
  infoFraction,
  infoLabel,
  parityLabel,
}: {
  infoFraction: number;
  infoLabel: string;
  parityLabel: string;
}) {
  const parityFraction = 1 - infoFraction;
  return (
    <div className="space-y-2">
      <div className="flex h-10 overflow-hidden rounded-lg border border-[var(--border)]">
        <div
          className="flex items-center justify-center bg-emerald-800/80 px-2 text-[10px] font-medium text-white dark:bg-emerald-900/80"
          style={{ width: `${infoFraction * 100}%` }}
        >
          {infoFraction >= 0.15 ? infoLabel : null}
        </div>
        <div className="flex flex-1 items-center justify-center bg-teal-600/20 px-2 text-[10px] font-medium text-[var(--fg)]">
          {parityFraction >= 0.15 ? parityLabel : null}
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-[var(--fg-muted)]">
        <span>0</span>
        <span>50 %</span>
        <span>100 %</span>
      </div>
    </div>
  );
}

export function StatusPill({
  ok,
  okText,
  badText,
}: {
  ok: boolean;
  okText: string;
  badText: string;
}) {
  return (
    <div className="pt-1">
      <Badge tone={ok ? 'ok' : 'warn'}>{ok ? okText : badText}</Badge>
    </div>
  );
}

export function MatrixDisplay({
  matrix,
  rowLabels,
  colHighlight,
  rowHighlight,
  onColHover,
  onRowHover,
}: {
  matrix: number[][];
  rowLabels?: string[];
  colHighlight?: number | null;
  rowHighlight?: number | null;
  onColHover?: (j: number | null) => void;
  onRowHover?: (i: number | null) => void;
}) {
  const cols = matrix[0]?.length ?? 0;
  return (
    <div className="inline-block">
      <div className="mb-2 flex gap-1.5 pl-12">
        {Array.from({ length: cols }, (_, j) => (
          <span
            key={j}
            className={`w-8 text-center text-[10px] ${
              colHighlight === j ? 'font-semibold text-[var(--accent-strong)]' : 'text-[var(--fg-muted)]'
            }`}
          >
            {j + 1}
          </span>
        ))}
      </div>
      {matrix.map((row, i) => (
        <div key={i} className="mb-1.5 flex items-center gap-1.5 last:mb-0">
          <span
            className={`w-10 shrink-0 pr-1 text-right text-[10px] ${
              rowHighlight === i ? 'font-semibold text-[var(--accent-strong)]' : 'text-[var(--fg-muted)]'
            }`}
            onMouseEnter={() => onRowHover?.(i)}
            onMouseLeave={() => onRowHover?.(null)}
          >
            {rowLabels?.[i] ?? `f${i + 1}`}
          </span>
          {row.map((v, j) => (
            <span
              key={j}
              className={`inline-flex h-8 w-8 items-center justify-center rounded border font-mono text-sm ${
                colHighlight === j || rowHighlight === i
                  ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)]'
                  : 'border-[var(--border)] bg-[var(--bg)]'
              }`}
              onMouseEnter={() => onColHover?.(j)}
              onMouseLeave={() => onColHover?.(null)}
            >
              {v}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export function ArrowDown({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-2 text-[var(--fg-muted)]">
      <span className="text-lg leading-none">↓</span>
      {label ? <span className="text-[10px]">{label}</span> : null}
    </div>
  );
}

export function useReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
