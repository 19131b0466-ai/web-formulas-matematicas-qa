import type { ReactNode } from 'react';

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-6">
      <div className="mb-2 flex items-center gap-2">
        <span className="hud-status-dot" aria-hidden />
        <p className="hud-label">Live telemetry</p>
      </div>
      <h1 className="font-display text-2xl font-semibold tracking-wide text-[var(--accent-strong)] drop-shadow-[0_0_14px_rgba(0,240,255,0.35)] sm:text-3xl">
        {title}
      </h1>
      {subtitle ? <p className="mt-2 max-w-2xl text-xs text-[var(--fg-muted)] sm:text-sm">{subtitle}</p> : null}
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
    <section className={`hud-panel p-3.5 sm:p-4 ${className}`}>
      {title ? (
        <h2 className="hud-label mb-3 flex items-center gap-2">
          <span aria-hidden className="text-[var(--secondary)] drop-shadow-[0_0_8px_rgba(255,31,199,0.6)]">
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
      <p className="font-display mt-2 text-2xl font-semibold text-[var(--accent-strong)] drop-shadow-[0_0_12px_rgba(0,240,255,0.45)] sm:text-3xl">
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-[11px] text-[var(--fg-muted)]">{hint}</p> : null}
    </Card>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="mb-4 border border-[var(--danger)]/55 bg-[linear-gradient(180deg,rgba(255,59,107,0.16),rgba(20,8,12,0.9))] px-4 py-3 text-sm text-[var(--danger)] shadow-[0_0_16px_rgba(255,59,107,0.25)]">
      {message}
    </div>
  );
}
