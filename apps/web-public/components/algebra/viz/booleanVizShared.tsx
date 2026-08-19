'use client';

import type { ReactNode } from 'react';
import type { Assignment, Bit } from './booleanMath';
import { Badge, CollapsibleEdit, Segmented } from './transformHelpers';
import { ButtonRow, VizButton } from './controls';

export function BitControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Bit;
  onChange: (v: Bit) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 font-mono text-sm text-[var(--fg-muted)]">{label}</span>
      <Segmented
        options={[
          { id: '0', label: '0' },
          { id: '1', label: '1' },
        ]}
        value={String(value)}
        onChange={(id) => onChange(Number(id) as Bit)}
      />
    </div>
  );
}

export function BitControls({
  variables,
  assignment,
  onChange,
}: {
  variables: string[];
  assignment: Assignment;
  onChange: (v: string, bit: Bit) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4">
      {variables.map((v) => (
        <BitControl
          key={v}
          label={v}
          value={assignment[v] ?? 0}
          onChange={(bit) => onChange(v, bit)}
        />
      ))}
    </div>
  );
}

export function ExprLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-center font-mono text-base leading-relaxed text-[var(--fg)] sm:text-lg">
      {children}
    </p>
  );
}

export function ResultBox({
  title,
  value,
  subtitle,
  tone = 'neutral',
}: {
  title: string;
  value: ReactNode;
  subtitle?: string;
  tone?: 'ok' | 'bad' | 'warn' | 'neutral';
}) {
  const border =
    tone === 'ok'
      ? 'border-emerald-600/40'
      : tone === 'bad'
        ? 'border-rose-600/40'
        : tone === 'warn'
          ? 'border-amber-600/40'
          : 'border-[var(--border)]';
  return (
    <div className={`rounded-lg border ${border} bg-[var(--bg)] px-4 py-3 text-center`}>
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--fg-muted)]">{title}</p>
      <div className="mt-1 font-mono text-2xl tabular-nums">{value}</div>
      {subtitle ? <p className="mt-1 text-xs text-[var(--fg-muted)]">{subtitle}</p> : null}
    </div>
  );
}

export function TruthVectorRow({
  label,
  values,
  highlight,
}: {
  label: string;
  values: Bit[];
  highlight?: number[];
}) {
  const hi = new Set(highlight ?? []);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-6 font-mono text-sm text-[var(--fg-muted)]">{label}</span>
      <div className="flex flex-wrap gap-1">
        {values.map((v, i) => (
          <span
            key={i}
            className={`inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded border px-1 font-mono text-sm tabular-nums ${
              hi.has(i)
                ? 'border-rose-600/50 bg-rose-500/10'
                : 'border-[var(--border)] bg-[var(--bg)]'
            }`}
          >
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CompareVectorRow({ f, g }: { f: Bit[]; g: Bit[] }) {
  return (
    <div className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
      <TruthVectorRow label="F" values={f} highlight={f.map((v, i) => (v !== g[i] ? i : -1)).filter((i) => i >= 0)} />
      <TruthVectorRow label="G" values={g} highlight={f.map((v, i) => (v !== g[i] ? i : -1)).filter((i) => i >= 0)} />
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-6 font-mono text-sm text-[var(--fg-muted)]">✓</span>
        <div className="flex flex-wrap gap-1">
          {f.map((v, i) => (
            <span
              key={i}
              className={`inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded border px-1 text-sm ${
                v === g[i]
                  ? 'border-emerald-600/40 text-emerald-700 dark:text-emerald-300'
                  : 'border-rose-600/50 text-rose-700 dark:text-rose-300'
              }`}
            >
              {v === g[i] ? '✓' : '✕'}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function EquivalenceBadge({ equivalent }: { equivalent: boolean | null }) {
  if (equivalent === null) return <Badge tone="warn">? Sin comprobar</Badge>;
  return equivalent ? (
    <Badge tone="ok">✓ Equivalentes</Badge>
  ) : (
    <Badge tone="bad">✕ No equivalentes</Badge>
  );
}

export function StepperBar({
  steps,
  active,
  onStep,
}: {
  steps: string[];
  active: number;
  onStep?: (i: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {steps.map((s, i) => (
        <button
          key={s}
          type="button"
          onClick={() => onStep?.(i)}
          className={`rounded-md border px-2 py-1 text-xs transition-colors ${
            i === active
              ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)]'
              : i < active
                ? 'border-[var(--border)] text-[var(--fg-muted)]'
                : 'border-[var(--border)] text-[var(--fg-muted)] opacity-60'
          }`}
        >
          {i + 1}. {s}
        </button>
      ))}
    </div>
  );
}

export function SectionCard({
  title,
  children,
  className = '',
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 ${className}`}>
      {title ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
          {title}
        </p>
      ) : null}
      {children}
    </div>
  );
}

export function OperatorNote() {
  return (
    <p className="text-xs text-[var(--fg-muted)]">
      <span className="font-medium">+</span> = OR · <span className="font-medium">·</span> = AND
    </p>
  );
}

export function CoverageGrid2({
  active,
  highlight,
  labels,
  onSelect,
}: {
  active: string;
  highlight?: string[];
  labels?: Record<string, string>;
  onSelect?: (key: string) => void;
}) {
  const hi = new Set(highlight ?? []);
  const cells = [
    { key: '00', row: 0, col: 0 },
    { key: '01', row: 0, col: 1 },
    { key: '10', row: 1, col: 0 },
    { key: '11', row: 1, col: 1 },
  ];
  return (
    <div className="inline-block">
      <div className="mb-1 grid grid-cols-3 text-center text-xs text-[var(--fg-muted)]">
        <span />
        <span>B=0</span>
        <span>B=1</span>
      </div>
      {([0, 1] as const).map((a) => (
        <div key={a} className="grid grid-cols-3 gap-1">
          <span className="flex items-center justify-end pr-2 text-xs text-[var(--fg-muted)]">
            A={a}
          </span>
          {([0, 1] as const).map((b) => {
            const key = `${a}${b}`;
            const cell = cells.find((c) => c.key === key)!;
            void cell;
            const isActive = active === key;
            const isHi = hi.has(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelect?.(key)}
                className={`flex min-h-[3.5rem] flex-col items-center justify-center rounded border p-2 text-xs transition-colors ${
                  isActive
                    ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] ring-2 ring-[var(--accent-strong)]/30'
                    : isHi
                      ? 'border-[var(--accent-strong)]/50 bg-[var(--accent-soft)]/40'
                      : 'border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent-strong)]/40'
                }`}
              >
                <span className="font-mono font-medium">{key}</span>
                {labels?.[key] ? (
                  <span className="mt-0.5 text-[10px] text-[var(--fg-muted)]">{labels[key]}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export { Badge, CollapsibleEdit, Segmented, ButtonRow, VizButton };
