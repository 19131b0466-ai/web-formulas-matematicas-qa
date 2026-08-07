import { getTranslations } from 'next-intl/server';
import type { FormulaDetailResponse } from '@repo/shared-types';
import { CopyLatexButton } from '@/components/content/CopyLatexButton';
import { InlineMarkdown } from '@/components/content/InlineMarkdown';
import { Katex } from '@/components/content/Katex';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Link } from '@/i18n/navigation';
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

  const crumbs = [
    { label: tn('hub'), href: '/' },
    { label: subjectTitle, href: subjectHomeHref(subject) },
    { label: section.title, href: sectionHref(subject, section.slug) },
    { label: title ?? formulaId },
  ];

  const allLatex = [content.latex, ...(content.additionalLatex ?? [])];

  return (
    <article>
      <Breadcrumbs items={crumbs} />

      <header className="mb-8 animate-rise">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
          {formulaId}
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {title ? <InlineMarkdown text={title} /> : formulaId}
        </h1>
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
        {allLatex.map((latex, i) => (
          <div
            key={`${formulaId}-${String(i)}`}
            className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] shadow-[var(--shadow)] animate-rise"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-2">
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--fg-muted)]">
                {i === 0 ? t('primary') : t('variant')}
              </span>
              <CopyLatexButton latex={latex} />
            </div>
            <div className="overflow-x-auto px-4 py-5">
              <Katex latex={latex} displayMode />
            </div>
          </div>
        ))}

        {content.detail ? (
          <section className="animate-rise" style={{ animationDelay: '80ms' }}>
            <h2 className="font-display text-xl font-semibold tracking-tight">{t('detail')}</h2>
            <p className="mt-2 text-base leading-relaxed text-[var(--fg)]">
              <InlineMarkdown text={content.detail} />
            </p>
          </section>
        ) : null}

        {content.variables ? (
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
            <ul className="mt-2 list-disc space-y-1 pl-6 text-base text-[var(--fg)]">
              {content.constraints.map((c) => (
                <li key={c}>
                  <InlineMarkdown text={c} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {related.length > 0 ? (
          <section className="animate-rise" style={{ animationDelay: '140ms' }}>
            <h2 className="font-display text-xl font-semibold tracking-tight">{t('related')}</h2>
            <ul className="mt-3 divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {related.map((r) => (
                <li key={r.formulaId}>
                  <Link
                    href={formulaHref(subject, r.formulaId) as '/'}
                    className="flex min-h-12 items-center justify-between gap-3 py-3 transition hover:text-[var(--accent-strong)]"
                  >
                    <span>
                      <span className="mr-2 font-mono text-xs text-[var(--fg-muted)]">
                        {r.formulaId}
                      </span>
                      {r.title ? <InlineMarkdown text={r.title} /> : r.formulaId}
                    </span>
                    <span className="text-sm text-[var(--fg-muted)]">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </article>
  );
}
