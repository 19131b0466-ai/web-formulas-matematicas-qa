import type { Metadata } from 'next';
import { SearchPanel } from '@/components/search/SearchPanel';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { fetchSearch, fetchTags } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Buscar',
  description: 'Busca fórmulas, técnicas y conceptos en el formulario de Cálculo II.',
  openGraph: {
    title: 'Buscar · Formulario de Cálculo II',
    description: 'Busca fórmulas, técnicas y conceptos en el formulario de Cálculo II.',
  },
};

type PageProps = {
  searchParams: Promise<{ q?: string; tags?: string }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? '';
  const tags = sp.tags?.trim() ?? '';
  const tagList = await fetchTags();

  let results: Awaited<ReturnType<typeof fetchSearch>> | null = null;
  if (q || tags) {
    try {
      results = await fetchSearch({ q, tags, limit: 40 });
    } catch {
      results = { query: q, total: 0, results: [] };
    }
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: 'Buscar' }]} />
      <header className="mb-8 animate-rise">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Buscar</h1>
        <p className="mt-2 text-[var(--fg-muted)]">
          Encuentra fórmulas por texto o filtra por etiquetas de técnica.
        </p>
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
