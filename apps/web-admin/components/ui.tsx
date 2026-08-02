import type { ReactNode } from 'react';

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-white">{title}</h1>
      {subtitle ? <p className="mt-2 text-[var(--fg-muted)]">{subtitle}</p> : null}
    </header>
  );
}

export function Card({
  title,
  children,
  className = '',
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-lg shadow-black/20 ${className}`}
    >
      {title ? (
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}

export function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
        {label}
      </p>
      <p className="font-display mt-2 text-3xl font-semibold text-white">{value}</p>
      {hint ? <p className="mt-1 text-sm text-[var(--fg-muted)]">{hint}</p> : null}
    </Card>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
      {message}
    </div>
  );
}
