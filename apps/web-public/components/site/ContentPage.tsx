import type { ReactNode } from 'react';

type Props = {
  title: string;
  lead: string;
  children: ReactNode;
  updatedLabel?: string;
};

export function ContentPage({ title, lead, children, updatedLabel }: Props) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-8 sm:py-16">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-[var(--fg)] sm:text-5xl">{title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-[var(--fg-muted)]">{lead}</p>
      {updatedLabel ? <p className="mt-2 text-xs text-[var(--fg-muted)]">{updatedLabel}</p> : null}
      <div className="mt-10 space-y-8 text-[var(--fg)]">{children}</div>
    </main>
  );
}

export function ContentSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--fg)]">{title}</h2>
      <div className="mt-3 space-y-3 text-base leading-relaxed text-[var(--fg-muted)]">{children}</div>
    </section>
  );
}
