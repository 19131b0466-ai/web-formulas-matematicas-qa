import { getTranslations } from 'next-intl/server';
import type { FormulaDetailResponse } from '@repo/shared-types';
import { ComputationalCostPanel } from '@/components/algebra/ComputationalCostPanel';
import { FormulaVisualization } from '@/components/algebra/FormulaVisualization';
import { CopyLatexButton } from '@/components/content/CopyLatexButton';
import { InlineMarkdown } from '@/components/content/InlineMarkdown';
import { Katex } from '@/components/content/Katex';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Link } from '@/i18n/navigation';
import { parseVariableSymbols } from '@/lib/parse-variables';
import type { SubjectSlug } from '@/lib/subjects';
import { formulaHref, sectionHref, subjectHomeHref } from '@/lib/subjects';

type FormulaDetailProps = {
  subject: SubjectSlug;
  subjectTitle: string;
  detail: FormulaDetailResponse;
};

export async function FormulaDetailView({ subject, subjectTitle, detail }: FormulaDetailProps) {
  const t = await getTranslations('formula');
  const tn = await getTranslations('nav');
  const { content, related, section, formulaId, title } = detail;
  const symbols = parseVariableSymbols(content.variables);

  const crumbs = [
    { label: tn('hub'), href: '/' },
    { label: subjectTitle, href: subjectHomeHref(subject) },
    { label: section.title, href: sectionHref(subject, section.slug) },
    { label: title ?? t('primary') },
  ];

  const latexForms: Array<{ latex: string; label: string | null }> = [
    { latex: content.latex, label: content.latexLabel ?? null },
    ...(content.additionalLatex ?? []).map((latex, i) => ({
      latex,
      label: content.additionalLatexLabels?.[i] ?? null,
    })),
  ];

  return (
    <article>
      <Breadcrumbs items={crumbs} />

      <header className="mb-8 animate-rise">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
          {section.number ? `${section.number}. ${section.title}` : section.title}
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {title ? <InlineMarkdown text={title} /> : t('primary')}
        </h1>
        {content.level ? (
          <p className="mt-3">
            <span className="inline-flex rounded-lg bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--accent-strong)]">
              {t('level')}: {content.level}
            </span>
          </p>
        ) : null}
        <p className="mt-2 text-sm text-[var(--fg-muted)]">
          {t('inSection')}{' '}
          <Link
            href={sectionHref(subject, section.slug) as '/'}
            className="text-[var(--accent-strong)] underline-offset-2 hover:underline"
          >
            {section.number ? `${section.number}. ` : ''}
            <InlineMarkdown text={section.title} />
          </Link>
        </p>
      </header>

      <div className="space-y-5">
        {latexForms.map((form, i) => (
          <div
            key={`${formulaId}-${String(i)}`}
            className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] shadow-[var(--shadow)] animate-rise"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-2">
              <span
                className={
                  form.label
                    ? 'text-sm font-medium text-[var(--fg-muted)]'
                    : 'text-xs font-medium uppercase tracking-wider text-[var(--fg-muted)]'
                }
              >
                {form.label ? (
                  <InlineMarkdown text={form.label} />
                ) : i === 0 ? (
                  t('primary')
                ) : (
                  t('variant')
                )}
              </span>
              <CopyLatexButton latex={form.latex} />
            </div>
            <div className="overflow-x-auto px-4 py-5">
              <Katex latex={form.latex} displayMode />
            </div>
          </div>
        ))}

        {content.detail ? (
          <section className="animate-rise" style={{ animationDelay: '80ms' }}>
            <h2 className="font-display text-xl font-semibold tracking-tight">{t('detail')}</h2>
            <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] px-4 py-3 text-base leading-relaxed text-[var(--fg)]">
              <InlineMarkdown text={content.detail} />
            </div>
          </section>
        ) : null}

        {content.visual && content.formulaId ? (
          <FormulaVisualization
            formulaId={content.formulaId}
            visual={content.visual}
            title={t('visualization')}
          />
        ) : null}

        {content.computationalCost?.applicable ? (
          <ComputationalCostPanel
            cost={content.computationalCost}
            title={t('complexity')}
            showLabel={t('showComplexity')}
            hideLabel={t('hideComplexity')}
          />
        ) : null}

        {symbols.length > 0 ? (
          <section className="animate-rise" style={{ animationDelay: '100ms' }}>
            <h2 className="font-display text-xl font-semibold tracking-tight">{t('variables')}</h2>
            <ul className="mt-3 space-y-2">
              {symbols.map((entry) => (
                <li
                  key={`${entry.symbol}-${entry.meaning}`}
                  className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2.5"
                >
                  <span className="shrink-0 rounded-lg bg-[var(--accent-soft)] px-2.5 py-1 font-mono text-sm font-medium text-[var(--accent-strong)]">
                    <InlineMarkdown text={entry.symbol} />
                  </span>
                  {entry.meaning ? (
                    <span className="pt-0.5 text-base leading-relaxed text-[var(--fg)]">
                      <InlineMarkdown text={entry.meaning} />
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : content.variables ? (
          <section className="animate-rise" style={{ animationDelay: '100ms' }}>
            <h2 className="font-display text-xl font-semibold tracking-tight">{t('variables')}</h2>
            <p className="mt-2 text-base leading-relaxed text-[var(--fg)]">
              <InlineMarkdown text={content.variables} />
            </p>
          </section>
        ) : null}

        {content.constraints?.length ? (
          <section className="animate-rise" style={{ animationDelay: '120ms' }}>
            <h2 className="font-display text-xl font-semibold tracking-tight">{t('conditions')}</h2>
            <ul className="mt-3 space-y-2">
              {content.constraints.map((c) => (
                <li
                  key={c}
                  className="rounded-xl border border-[color-mix(in_oklab,var(--warning)_35%,var(--border))] bg-[color-mix(in_oklab,var(--warning)_10%,transparent)] px-4 py-3 text-base leading-relaxed text-[var(--fg)]"
                >
                  <InlineMarkdown text={c} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {related.length > 0 ? (
          <section className="animate-rise" style={{ animationDelay: '140ms' }}>
            <h2 className="font-display text-xl font-semibold tracking-tight">{t('related')}</h2>
            <ul className="mt-3 space-y-3">
              {related.map((r) => (
                <li
                  key={r.formulaId}
                  className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--formula-bg)]"
                >
                  <Link
                    href={formulaHref(subject, r.formulaId) as '/'}
                    prefetch={false}={false}
                    className="block px-4 pt-3 transition hover:bg-[color-mix(in_oklab,var(--accent-soft)_45%,transparent)]"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-strong)]">
                      {t('relatedItem')}
                    </p>
                    <p className="font-display mt-1 text-lg font-semibold text-[var(--fg)]">
                      {r.title ? <InlineMarkdown text={r.title} /> : t('primary')}
                    </p>
                    {r.latex ? (
                      <div className="overflow-x-auto py-3">
                        <Katex latex={r.latex} displayMode />
                      </div>
                    ) : null}
                  </Link>
                  <div className="flex flex-wrap items-center gap-4 border-t border-[var(--border)] px-4 py-2.5 text-sm">
                    <Link
                      href={formulaHref(subject, r.formulaId) as '/'}
                      prefetch={false}
                      className="font-semibold text-[var(--accent-strong)] underline-offset-2 hover:underline"
                    >
                      {t('openFormula')}
                    </Link>
                    <Link
                      href={sectionHref(subject, r.sectionSlug) as '/'}
                      prefetch={false}
                      className="text-[var(--fg-muted)] underline-offset-2 hover:underline"
                    >
                      {t('openInSection')}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </article>
  );
}
