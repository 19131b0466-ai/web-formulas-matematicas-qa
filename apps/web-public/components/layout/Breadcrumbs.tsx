import { getTranslations } from 'next-intl/server';
import { InlineMarkdown } from '@/components/content/InlineMarkdown';
import { Link } from '@/i18n/navigation';

export type Crumb = { label: string; href?: string };

export async function Breadcrumbs({ items }: { items: Crumb[] }) {
  const t = await getTranslations('breadcrumbs');

  return (
    <nav aria-label={t('label')} className="mb-5 text-sm text-[var(--fg-muted)]">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={`${item.label}-${String(i)}`} className="inline-flex items-center gap-1.5">
            {i > 0 ? <span aria-hidden>/</span> : null}
            {item.href ? (
              <Link href={item.href as '/'} className="hover:text-[var(--accent-strong)]">
                <InlineMarkdown text={item.label} />
              </Link>
            ) : (
              <span className="text-[var(--fg)]">
                <InlineMarkdown text={item.label} />
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
