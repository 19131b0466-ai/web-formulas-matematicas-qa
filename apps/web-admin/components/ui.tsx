import type { ReactNode } from 'react';

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-8">
      <div className="mb-2 flex items-center gap-2">
        <span className="hud-status-dot" aria-hidden />
        <p className="hud-label">Live telemetry</p>
      </div>
      <h1 className="font-display text-3xl font-semibold tracking-wide text-[var(--accent-strong)] sm:text-4xl">
        {title}
      </h1>
      {subtitle ? <p className="mt-2 max-w-2xl text-sm text-[var(--fg-muted)]">{subtitle}</p> : null}
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
    <section className={`hud-panel p-5 ${className}`}>
      {title ? (
        <h2 className="hud-label mb-4 flex items-center gap-2">
          <span aria-hidden className="text-[var(--secondary)]">
            ▸
          </span>
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
      <p className="hud-label">{label}</p>
      <p className="font-display mt-3 text-3xl font-semibold text-white drop-shadow-[0_0_12px_rgba(34,230,255,0.35)]">
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs text-[var(--fg-muted)]">{hint}</p> : null}
    </Card>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="mb-4 border border-[var(--danger)]/50 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)] shadow-[0_0_16px_rgba(255,77,122,0.2)]">
      {message}
    </div>
  );
}
