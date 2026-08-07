import { getTranslations } from 'next-intl/server';
import type {
  ContentBlockDto,
  FormulaContent,
  ListContent,
  NoteContent,
  StrategyContent,
  TableContent,
  TextContent,
} from '@repo/shared-types';
import { blockAnchorId } from '@/lib/anchors';
import { CopyLatexButton } from './CopyLatexButton';
import { InlineMarkdown } from './InlineMarkdown';
import { Katex } from './Katex';

type ContentBlocksProps = {
  blocks: ContentBlockDto[];
  sectionNumber: string;
};

export async function ContentBlocks({ blocks, sectionNumber }: ContentBlocksProps) {
  const t = await getTranslations('content');

  return (
    <div className="prose-math space-y-5">
      {blocks.map((block, index) => {
        const anchor = blockAnchorId({
          sectionNumber,
          title: block.title,
          blockId: block.id,
          index,
        });

        return (
          <section
            key={block.id}
            id={anchor}
            className="scroll-mt-24 animate-rise"
            style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
          >
            {block.title ? (
              <h3 className="font-display mb-3 text-xl font-semibold tracking-tight text-[var(--fg)]">
                <a href={`#${anchor}`} className="group inline-flex items-baseline gap-2">
                  <span>
                    <InlineMarkdown text={block.title} />
                  </span>
                  <span className="text-sm font-normal text-[var(--fg-muted)] opacity-0 transition group-hover:opacity-100">
                    #
                  </span>
                </a>
              </h3>
            ) : null}
            <BlockBody block={block} labels={{ formula: t('formula'), signal: t('signal'), method: t('method') }} />
          </section>
        );
      })}
    </div>
  );
}

function BlockBody({
  block,
  labels,
}: {
  block: ContentBlockDto;
  labels: { formula: string; signal: string; method: string };
}) {
  switch (block.type) {
    case 'formula': {
      const content = block.content as FormulaContent;
      const latexForms: Array<{ latex: string; label: string | null }> = [
        { latex: content.latex, label: content.latexLabel ?? null },
        ...(content.additionalLatex ?? []).map((latex, i) => ({
          latex,
          label: content.additionalLatexLabels?.[i] ?? null,
        })),
      ];
      return (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] shadow-[var(--shadow)]">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-2">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--fg-muted)]">
              {labels.formula}
            </span>
            <CopyLatexButton latex={content.latex} />
          </div>
          {latexForms.map((form, i) => (
            <div
              key={`${block.id}-latex-${String(i)}`}
              className={i > 0 ? 'border-t border-[var(--border)]' : undefined}
            >
              {form.label ? (
                <p className="px-4 pt-3 text-sm font-medium text-[var(--fg-muted)]">
                  <InlineMarkdown text={form.label} />
                </p>
              ) : null}
              <div className={`overflow-x-auto px-4 ${form.label ? 'pb-5 pt-2' : 'py-5'}`}>
                <Katex latex={form.latex} displayMode={content.displayMode ?? true} />
              </div>
            </div>
          ))}
          {content.detail ? (
            <p className="border-t border-[var(--border)] px-4 py-3 text-sm text-[var(--fg-muted)]">
              <InlineMarkdown text={content.detail} />
            </p>
          ) : null}
          {content.constraints?.length ? (
            <ul className="space-y-1 border-t border-[var(--border)] px-4 py-3 text-sm text-[var(--fg-muted)]">
              {content.constraints.map((c) => (
                <li key={c}>
                  <InlineMarkdown text={c} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      );
    }
    case 'text': {
      const content = block.content as TextContent;
      return (
        <p className="text-base leading-relaxed text-[var(--fg)]">
          <InlineMarkdown text={content.markdown} />
        </p>
      );
    }
    case 'list': {
      const content = block.content as ListContent;
      const ListTag = content.ordered ? 'ol' : 'ul';
      return (
        <ListTag
          className={`space-y-2 text-base leading-relaxed text-[var(--fg)] ${
            content.ordered ? 'list-decimal pl-6' : 'list-disc pl-6'
          }`}
        >
          {content.items.map((item) => (
            <li key={item.slice(0, 48)}>
              <InlineMarkdown text={item} />
            </li>
          ))}
        </ListTag>
      );
    }
    case 'table': {
      const content = block.content as TableContent;
      return (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--formula-bg)]">
          {content.caption ? (
            <p className="border-b border-[var(--border)] px-4 py-2 text-sm text-[var(--fg-muted)]">
              <InlineMarkdown text={content.caption} />
            </p>
          ) : null}
          <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[var(--accent-soft)]">
                {content.headers.map((h) => (
                  <th key={h} className="border-b border-[var(--border)] px-3 py-2 font-semibold">
                    <InlineMarkdown text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {content.rows.map((row, i) => (
                <tr key={`r-${String(i)}`} className="align-top">
                  {row.map((cell, j) => (
                    <td
                      key={`c-${String(i)}-${String(j)}`}
                      className="border-b border-[var(--border)] px-3 py-2"
                    >
                      <InlineMarkdown text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case 'note': {
      const content = block.content as NoteContent;
      const tone =
        content.variant === 'warning'
          ? 'border-[var(--warning)]/40 bg-[color-mix(in_oklab,var(--warning)_12%,transparent)]'
          : content.variant === 'domain'
            ? 'border-[var(--danger)]/35 bg-[color-mix(in_oklab,var(--danger)_10%,transparent)]'
            : 'border-[var(--info)]/35 bg-[color-mix(in_oklab,var(--info)_10%,transparent)]';
      return (
        <aside className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${tone}`}>
          <InlineMarkdown text={content.markdown} />
        </aside>
      );
    }
    case 'strategy': {
      const content = block.content as StrategyContent;
      return (
        <div className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] p-4 sm:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              {labels.signal}
            </p>
            <p>
              <InlineMarkdown text={content.signal} />
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              {labels.method}
            </p>
            <p className="font-medium text-[var(--accent-strong)]">
              <InlineMarkdown text={content.method} />
            </p>
          </div>
        </div>
      );
    }
    default:
      return null;
  }
}
