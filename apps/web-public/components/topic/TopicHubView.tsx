import { getTranslations } from 'next-intl/server';
import type { FormulaDetailResponse, SectionSummary } from '@repo/shared-types';
import { InlineMarkdown } from '@/components/content/InlineMarkdown';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Link } from '@/i18n/navigation';
import type { TopicHubDefinition } from '@/lib/topic-hubs';
import {
  formulaHref,
  sectionHref,
  subjectHomeHref,
  topicsIndexHref,
  type SubjectSlug,
} from '@/lib/subjects';

type TopicHubViewProps = {
  subject: SubjectSlug;
  subjectTitle: string;
  hub: TopicHubDefinition;
  formulas: FormulaDetailResponse[];
  sections: SectionSummary[];
};

export async function TopicHubView({
  subject,
  subjectTitle,
  hub,
  formulas,
  sections,
}: TopicHubViewProps) {
  const t = await getTranslations('topicHubs');
  const tn = await getTranslations('nav');
  const title = t(`${hub.messageKey}.title`);
  const intro = t(`${hub.messageKey}.intro`);

  const crumbs = [
    { label: tn('home'), href: '/' },
    { label: subjectTitle, href: subjectHomeHref(subject) },
    { label: t('indexTitle'), href: topicsIndexHref(subject) },
    { label: title },
  ];

  const sectionBySlug = new Map(sections.map((s) => [s.slug, s]));

  return (
    <article>
      <Breadcrumbs items={crumbs} />

      <header className="mb-8 animate-rise">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
          {t('indexTitle')}
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[var(--fg-muted)]">
          <InlineMarkdown text={intro} />
        </p>
      </header>

      {formulas.length > 0 ? (
        <section className="mb-10 animate-rise">
          <h2 className="font-display text-xl font-semibold tracking-tight">{t('formulasHeading')}</h2>
          <ul className="mt-4 space-y-3">
            {formulas.map((formula) => (
              <li key={formula.formulaId}>
                <Link
                  href={formulaHref(subject, formula.formulaId) as '/'}
                  className="block rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] px-4 py-3 transition hover:border-[var(--accent-strong)]"
                >
                  <span className="font-medium text-[var(--accent-strong)]">
                    {formula.title ?? formula.formulaId}
                  </span>
                  {formula.content.detail ? (
                    <p className="mt-1 text-sm leading-relaxed text-[var(--fg-muted)]">
                      <InlineMarkdown text={formula.content.detail} />
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {hub.sectionSlugs.length > 0 ? (
        <section className="animate-rise">
          <h2 className="font-display text-xl font-semibold tracking-tight">{t('sectionsHeading')}</h2>
          <ul className="mt-4 space-y-2">
            {hub.sectionSlugs.map((slug) => {
              const section = sectionBySlug.get(slug);
              const label = section?.title ?? slug;
              return (
                <li key={slug}>
                  <Link
                    href={sectionHref(subject, slug) as '/'}
                    className="inline-flex min-h-10 items-center text-[var(--accent-strong)] underline-offset-2 hover:underline"
                  >
                    {section?.number ? `${section.number}. ` : ''}
                    <InlineMarkdown text={label} />
                  </Link>
                  {section?.description ? (
                    <p className="mt-1 text-sm text-[var(--fg-muted)]">
                      <InlineMarkdown text={section.description} />
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <p className="mt-10 text-sm">
        <Link href={topicsIndexHref(subject) as '/'} className="text-[var(--accent-strong)] hover:underline">
          ← {t('backToTopics')}
        </Link>
      </p>
    </article>
  );
}
