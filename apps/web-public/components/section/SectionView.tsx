import Link from 'next/link';
import type { SectionDetailResponse } from '@repo/shared-types';
import { ContentBlocks } from '@/components/content/ContentBlocks';
import { InlineMarkdown } from '@/components/content/InlineMarkdown';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { sectionHref } from '@/lib/api';

type SectionViewProps = {
  detail: SectionDetailResponse;
  parent?: { slug: string; title: string } | null;
};

export function SectionView({ detail, parent = null }: SectionViewProps) {
  const { section, blocks, subsections } = detail;

  const crumbs = [
    { label: 'Inicio', href: '/' },
    ...(parent ? [{ label: parent.title, href: sectionHref(parent.slug) }] : []),
    { label: section.title },
  ];

  return (
    <article>
      <Breadcrumbs items={crumbs} />

      <header className="mb-8 animate-rise">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
          {section.number ? `Sección ${section.number}` : 'Contenido'}
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
          aria-label="Subsecciones"
          className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] p-4"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
            En esta sección
          </p>
          <ol className="space-y-1">
            {subsections.map((sub) => (
              <li key={sub.slug}>
                <Link
                  href={sectionHref(sub.slug)}
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
