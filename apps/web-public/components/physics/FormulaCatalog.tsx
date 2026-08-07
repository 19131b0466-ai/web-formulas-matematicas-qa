import { getTranslations } from 'next-intl/server';
import type { ContentBlockDto, FormulaContent } from '@repo/shared-types';
import { ContentBlocks } from '@/components/content/ContentBlocks';
import { CopyLatexButton } from '@/components/content/CopyLatexButton';
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
          const href = formulaHref(subject, id);
          const extras = content.additionalLatex ?? [];
          return (
            <li
              key={block.id}
              className="animate-rise overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] shadow-[var(--shadow)]"
              style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-2">
                <Link
                  href={href as '/'}
                  prefetch
                  className="font-display min-w-0 flex-1 text-lg font-semibold text-[var(--fg)] transition hover:text-[var(--accent-strong)]"
                >
                  {block.title ? <InlineMarkdown text={block.title} /> : t('primary')}
                </Link>
                <CopyLatexButton latex={content.latex} />
              </div>

              {content.latexLabel ? (
                <p className="border-t border-[var(--border)] px-4 pt-3 text-sm font-medium text-[var(--fg-muted)]">
                  <InlineMarkdown text={content.latexLabel} />
                </p>
              ) : null}

              <Link
                href={href as '/'}
                prefetch
                className={`block overflow-x-auto px-4 ${content.latexLabel ? 'pb-5 pt-2' : 'py-5'}`}
              >
                <Katex latex={content.latex} displayMode />
              </Link>

              {extras.map((latex, i) => {
                const label = content.additionalLatexLabels?.[i] ?? null;
                return (
                  <div key={`${block.id}-extra-${String(i)}`} className="border-t border-[var(--border)]">
                    {label ? (
                      <p className="px-4 pt-3 text-sm font-medium text-[var(--fg-muted)]">
                        <InlineMarkdown text={label} />
                      </p>
                    ) : (
                      <p className="px-4 pt-3 text-xs font-medium uppercase tracking-wider text-[var(--fg-muted)]">
                        {t('variant')}
                      </p>
                    )}
                    <div className="overflow-x-auto px-4 py-4">
                      <Katex latex={latex} displayMode />
                    </div>
                  </div>
                );
              })}

              {content.detail ? (
                <p className="border-t border-[var(--border)] px-4 py-3 text-sm leading-relaxed text-[var(--fg-muted)]">
                  <InlineMarkdown text={content.detail} />
                </p>
              ) : null}

              <div className="border-t border-[var(--border)] px-4 py-3">
                <Link
                  href={href as '/'}
                  prefetch
                  className="text-xs font-semibold text-[var(--accent-strong)] underline-offset-2 hover:underline"
                >
                  {t('viewDetail')} →
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
