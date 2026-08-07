import { getTranslations } from 'next-intl/server';
import type { ContentBlockDto, FormulaContent } from '@repo/shared-types';
import { ContentBlocks } from '@/components/content/ContentBlocks';
import { InlineMarkdown } from '@/components/content/InlineMarkdown';
import { Katex } from '@/components/content/Katex';
import { Link } from '@/i18n/navigation';
import type { SubjectSlug } from '@/lib/subjects';
import { formulaHref } from '@/lib/subjects';

type FormulaCatalogProps = {
  subject: SubjectSlug;
  blocks: ContentBlockDto[];
};

export async function FormulaCatalog({ subject, blocks }: FormulaCatalogProps) {
  const t = await getTranslations('formula');
  const formulas = blocks.filter((b) => b.type === 'formula');
  const other = blocks.filter((b) => b.type !== 'formula');
  const hasIds = formulas.some((b) => (b.content as FormulaContent).formulaId);

  if (!hasIds) {
    // Constants / tables without formula IDs — render normally
    return <ContentBlocks blocks={blocks} sectionNumber="" />;
  }

  return (
    <div className="space-y-6">
      {other.length > 0 ? <ContentBlocks blocks={other} sectionNumber="" /> : null}

      <ul className="space-y-4">
        {formulas.map((block, index) => {
          const content = block.content as FormulaContent;
          const id = content.formulaId;
          if (!id) return null;
          return (
            <li
              key={block.id}
              className="animate-rise"
              style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
            >
              <Link
                href={formulaHref(subject, id) as '/'}
                className="block overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] shadow-[var(--shadow)] transition hover:border-[var(--accent)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-2">
                  <span className="font-display text-lg font-semibold text-[var(--fg)]">
                    {block.title ? <InlineMarkdown text={block.title} /> : id}
                  </span>
                  <span className="rounded-md bg-[var(--accent-soft)] px-2 py-1 font-mono text-xs font-medium text-[var(--accent-strong)]">
                    {id}
                  </span>
                </div>
                <div className="overflow-x-auto px-4 py-5">
                  <Katex latex={content.latex} displayMode />
                </div>
                {content.detail ? (
                  <p className="border-t border-[var(--border)] px-4 py-3 text-sm leading-relaxed text-[var(--fg-muted)]">
                    <InlineMarkdown text={content.detail} />
                  </p>
                ) : null}
                <p className="px-4 pb-3 text-xs font-semibold text-[var(--accent-strong)]">
                  {t('viewDetail')} →
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
