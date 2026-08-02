'use client';

import { useEffect, useState } from 'react';
import type { NamedCount } from '@repo/shared-types';
import { HorizontalBars } from '@/components/charts';
import { Card, ErrorBox, PageHeader } from '@/components/ui';
import { defaultRange, fetchPages } from '@/lib/api';

export default function ContentPage() {
  const [pages, setPages] = useState<NamedCount[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { from, to } = defaultRange();
    fetchPages(from, to)
      .then((res) => setPages(res.pages))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Error'));
  }, []);

  return (
    <div>
      <PageHeader title="Contenido" subtitle="Secciones y rutas más consultadas." />
      {error ? <ErrorBox message={error} /> : null}
      <Card title="Top páginas">
        <HorizontalBars data={pages} />
      </Card>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] text-[var(--fg-muted)]">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Página / sección</th>
              <th className="px-4 py-3">Visitas</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p, i) => (
              <tr key={p.name} className="border-b border-[var(--border)]">
                <td className="px-4 py-3 text-[var(--fg-muted)]">{i + 1}</td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{p.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
