import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SearchPanel } from '@/components/search/SearchPanel';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { fetchSearch, fetchTags } from '@/lib/api';
import { localizeContent } from '@/lib/localize-content';
import type { AppLocale } from '@/i18n/routing';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; tags?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'search' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('ogTitle'),
      description: t('description'),
    },
  };
}

export default async function SearchPage({ params, searchParams }: PageProps) {
  const { locale: raw } = await params;
  const locale = raw as AppLocale;
  setRequestLocale(locale);

  const t = await getTranslations('search');
  const tn = await getTranslations('nav');
  const sp = await searchParams;
  const q = sp.q?.trim() ?? '';
  const tags = sp.tags?.trim() ?? '';
  const tagList = await fetchTags();

  let results: Awaited<ReturnType<typeof fetchSearch>> | null = null;
  if (q || tags) {
    try {
      results = await localizeContent(await fetchSearch({ q, tags, limit: 40 }), locale);
    } catch {
      results = { query: q, total: 0, results: [] };
    }
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: tn('home'), href: '/' }, { label: t('title') }]} />
      <header className="mb-8 animate-rise">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-[var(--fg-muted)]">{t('subtitle')}</p>
      </header>
      <SearchPanel
        initialQuery={q}
        initialTag={tags}
        results={results?.results ?? []}
        total={results?.total ?? 0}
        tagOptions={tagList.tags}
      />
    </div>
  );
}
