import { getTranslations } from 'next-intl/server';
import type { SectionDetailResponse } from '@repo/shared-types';
import { ContentBlocks } from '@/components/content/ContentBlocks';
import { InlineMarkdown } from '@/components/content/InlineMarkdown';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Link } from '@/i18n/navigation';
import { sectionHref } from '@/lib/api';

type SectionViewProps = {
  detail: SectionDetailResponse;
  parent?: { slug: string; title: string } | null;
};

export async function SectionView({ detail, parent = null }: SectionViewProps) {
  const t = await getTranslations('section');
  const tn = await getTranslations('nav');
  const { section, blocks, subsections } = detail;

  const crumbs = [
    { label: tn('home'), href: '/' },
    ...(parent ? [{ label: parent.title, href: sectionHref(parent.slug) }] : []),
    { label: section.title },
  ];

  return (
    <article>
      <Breadcrumbs items={crumbs} />

      <header className="mb-8 animate-rise">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
          {section.number ? t('label', { number: section.number }) : t('content')}
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          <InlineMarkdown text={section.title} />
        </h1>
        {section.description ? (
          <p className="mt-3 text-lg text-[var(--fg-muted)]">
            <InlineMarkdown text={section.description} />
          </p>
        ) : null}
      </header>

      {subsections.length > 0 ? (
        <nav
          aria-label={t('subsections')}
          className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] p-4"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
            {t('inThisSection')}
          </p>
          <ol className="space-y-1">
            {subsections.map((sub) => (
              <li key={sub.slug}>
                <Link
                  href={sectionHref(sub.slug) as '/'}
                  className="inline-flex min-h-10 items-center text-sm text-[var(--accent-strong)] underline-offset-2 hover:underline"
                >
                  {sub.number ? `${sub.number} ` : ''}
                  <InlineMarkdown text={sub.title} />
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <ContentBlocks blocks={blocks} sectionNumber={section.number} />
    </article>
  );
}
