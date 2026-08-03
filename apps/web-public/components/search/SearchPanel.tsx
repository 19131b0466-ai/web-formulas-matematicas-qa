'use client';

import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import type { SearchResultItem } from '@repo/shared-types';
import { InlineMarkdown } from '@/components/content/InlineMarkdown';
import { Link, useRouter } from '@/i18n/navigation';
import { sectionHref } from '@/lib/api';

type SearchPanelProps = {
  initialQuery?: string;
  initialTag?: string;
  results?: SearchResultItem[];
  total?: number;
  tagOptions?: Array<{ tag: string; count: number }>;
};

export function SearchPanel({
  initialQuery = '',
  initialTag = '',
  results = [],
  total = 0,
  tagOptions = [],
}: SearchPanelProps) {
  const t = useTranslations('search');
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [tag, setTag] = useState(initialTag);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (tag) params.set('tags', tag);
    router.push(`/buscar?${params.toString()}`);
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="space-y-3" role="search">
        <label htmlFor="search-q" className="block text-sm font-medium text-[var(--fg-muted)]">
          {t('label')}
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="search-q"
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('placeholder')}
            className="min-h-12 flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 text-base outline-none ring-[var(--accent)] transition focus:ring-2"
          />
          <button
            type="submit"
            className="min-h-12 rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          >
            {t('submit')}
          </button>
        </div>
        {tagOptions.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => setTag('')}
              className={`min-h-11 rounded-lg border px-3 text-xs font-medium ${
                !tag
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'border-[var(--border)] text-[var(--fg-muted)]'
              }`}
            >
              {t('all')}
            </button>
            {tagOptions.slice(0, 16).map((item) => (
              <button
                key={item.tag}
                type="button"
                onClick={() => setTag(item.tag === tag ? '' : item.tag)}
                className={`min-h-11 rounded-lg border px-3 text-xs font-medium ${
                  tag === item.tag
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                    : 'border-[var(--border)] text-[var(--fg-muted)]'
                }`}
              >
                {item.tag} ({item.count})
              </button>
            ))}
          </div>
        ) : null}
      </form>

      {initialQuery || initialTag ? (
        <p className="text-sm text-[var(--fg-muted)]">
          {t('results', { count: total })}
          {initialQuery ? (
            <>
              {' '}
              {t('forQuery', { query: initialQuery })}
            </>
          ) : null}
        </p>
      ) : null}

      <ul className="space-y-3">
        {results.map((r) => (
          <li key={r.blockId}>
            <Link
              href={sectionHref(r.sectionSlug) as '/'}
              className="block rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] p-4 transition hover:border-[var(--accent)]"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                {r.sectionNumber ? `${r.sectionNumber} · ` : ''}
                <InlineMarkdown text={r.sectionTitle} />
                <span className="ml-2 font-normal normal-case">({r.blockType})</span>
              </p>
              {r.title ? (
                <p className="mt-1 font-display text-lg font-semibold">
                  <InlineMarkdown text={r.title} />
                </p>
              ) : null}
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--fg-muted)]">
                {highlight(r.excerpt, initialQuery)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${escapeRegExp(query.trim())})`, 'ig'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.trim().toLowerCase() ? (
      <mark key={i} className="rounded bg-[var(--accent-soft)] px-0.5 text-[var(--accent-strong)]">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
