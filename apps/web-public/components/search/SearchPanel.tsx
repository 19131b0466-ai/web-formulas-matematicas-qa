'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState, type FormEvent } from 'react';
import type { SearchResponse, SearchResultItem } from '@repo/shared-types';
import { InlineMarkdown } from '@/components/content/InlineMarkdown';
import { Link, useRouter } from '@/i18n/navigation';
import { blockAnchorId } from '@/lib/anchors';
import type { AppLocale } from '@/i18n/routing';
import type { SubjectSlug } from '@/lib/subjects';
import { formulaHref, searchHref, sectionHref } from '@/lib/subjects';
import { localizeTagLabel } from '@/lib/tag-labels';

type SearchPanelProps = {
  subject: SubjectSlug;
  linkFormulas?: boolean;
  tagOptions?: Array<{ tag: string; count: number }>;
};

export function SearchPanel({
  subject,
  linkFormulas = false,
  tagOptions = [],
}: SearchPanelProps) {
  const t = useTranslations('search');
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const [q, setQ] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function syncFromLocation() {
      const sp = new URLSearchParams(window.location.search);
      const nextQuery = sp.get('q')?.trim() ?? '';
      const nextTag = sp.get('tags')?.trim() ?? '';
      setQ(nextQuery);
      setActiveQuery(nextQuery);
      setActiveTag(nextTag);
    }
    syncFromLocation();
    window.addEventListener('popstate', syncFromLocation);
    return () => window.removeEventListener('popstate', syncFromLocation);
  }, []);

  useEffect(() => {
    if (!activeQuery && !activeTag) {
      setResults([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    const ac = new AbortController();
    setLoading(true);
    const params = new URLSearchParams({ subject, locale });
    if (activeQuery) params.set('q', activeQuery);
    if (activeTag) params.set('tags', activeTag);

    fetch(`/api/search?${params.toString()}`, { signal: ac.signal, cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`search ${res.status}`);
        return (await res.json()) as SearchResponse;
      })
      .then((data) => {
        if (ac.signal.aborted) return;
        setResults(data.results ?? []);
        setTotal(data.total ?? 0);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (ac.signal.aborted || (err instanceof DOMException && err.name === 'AbortError')) return;
        setResults([]);
        setTotal(0);
        setLoading(false);
      });

    return () => ac.abort();
  }, [activeQuery, activeTag, subject, locale]);

  const searchActive = Boolean(activeQuery || activeTag);
  const activeTagLabel = activeTag ? localizeTagLabel(activeTag, locale) : '';

  function navigateTextSearch(nextQuery: string) {
    const trimmed = nextQuery.trim();
    const params = new URLSearchParams();
    if (trimmed) params.set('q', trimmed);
    const qs = params.toString();
    setQ(trimmed);
    setActiveQuery(trimmed);
    setActiveTag('');
    router.push(qs ? `${searchHref(subject)}?${qs}` : searchHref(subject));
  }

  function navigateTagSearch(tag: string) {
    const params = new URLSearchParams();
    params.set('tags', tag);
    setQ('');
    setActiveQuery('');
    setActiveTag(tag);
    router.push(`${searchHref(subject)}?${params.toString()}`);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    navigateTextSearch(q);
  }

  function resultHref(r: SearchResultItem): string {
    if (linkFormulas && r.formulaCode) {
      return formulaHref(subject, r.formulaCode);
    }
    const base = sectionHref(subject, r.sectionSlug);
    if (r.title) {
      const anchor = blockAnchorId({
        sectionNumber: r.sectionNumber,
        title: r.title,
        blockId: r.blockId,
        index: 0,
      });
      return `${base}#${anchor}`;
    }
    return base;
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
        {!searchActive && tagOptions.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1" aria-label={t('suggestedTags')}>
            {tagOptions.slice(0, 16).map((item) => (
              <button
                key={item.tag}
                type="button"
                onClick={() => navigateTagSearch(item.tag)}
                className="min-h-11 rounded-lg border border-[var(--border)] px-3 text-xs font-medium text-[var(--fg-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
              >
                {localizeTagLabel(item.tag, locale)}
              </button>
            ))}
          </div>
        ) : null}
        {activeTag ? (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-[var(--fg-muted)]">{t('activeTag')}</span>
            <span className="rounded-lg border border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent-strong)]">
              {activeTagLabel}
            </span>
            <button
              type="button"
              onClick={() => {
                setActiveTag('');
                setActiveQuery('');
                setQ('');
                router.push(searchHref(subject));
              }}
              className="text-xs text-[var(--fg-muted)] underline-offset-2 hover:underline"
            >
              {t('clearTag')}
            </button>
          </div>
        ) : null}
      </form>

      {loading ? <p className="text-sm text-[var(--fg-muted)]">{t('loading')}</p> : null}

      {searchActive && !loading ? (
        <p className="text-sm text-[var(--fg-muted)]">
          {t('results', { count: total })}
          {activeQuery ? (
            <>
              {' '}
              {t('forQuery', { query: activeQuery })}
            </>
          ) : null}
          {activeTag && !activeQuery ? (
            <>
              {' '}
              {t('forTag', { tag: activeTagLabel })}
            </>
          ) : null}
        </p>
      ) : null}

      <ul className="space-y-3">
        {results.map((r) => (
          <li key={r.blockId}>
            <Link
              href={resultHref(r) as '/'}
              prefetch={false}
              className="block rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] p-4 transition hover:border-[var(--accent)]"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                {r.sectionNumber ? `${r.sectionNumber} · ` : ''}
                <InlineMarkdown text={r.sectionTitle} />
              </p>
              {r.title ? (
                <p className="mt-1 font-display text-lg font-semibold">
                  <InlineMarkdown text={r.title} />
                </p>
              ) : null}
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--fg-muted)]">
                {highlight(r.excerpt, activeQuery || activeTagLabel)}
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
