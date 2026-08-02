import Link from 'next/link';
import { InlineMarkdown } from '@/components/content/InlineMarkdown';

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Migas de pan" className="mb-5 text-sm text-[var(--fg-muted)]">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={`${item.label}-${String(i)}`} className="inline-flex items-center gap-1.5">
            {i > 0 ? <span aria-hidden>/</span> : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-[var(--accent-strong)]">
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
