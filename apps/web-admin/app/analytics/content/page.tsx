'use client';

import { useEffect, useState } from 'react';
import type { NamedCount } from '@repo/shared-types';
import { HorizontalBars } from '@/components/charts';
import { Card, ErrorBox, PageHeader } from '@/components/ui';
import { defaultRange, fetchPages, fetchSubjectsAnalytics } from '@/lib/api';

export default function ContentPage() {
  const [pages, setPages] = useState<NamedCount[]>([]);
  const [subjects, setSubjects] = useState<NamedCount[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { from, to } = defaultRange();
    Promise.all([fetchPages(from, to), fetchSubjectsAnalytics(from, to)])
      .then(([pagesRes, subjectsRes]) => {
        setPages(pagesRes.pages);
        setSubjects(subjectsRes.subjects);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Error'));
  }, []);

  return (
    <div>
      <PageHeader title="Contenido" subtitle="Materias, secciones y rutas más consultadas." />
      {error ? <ErrorBox message={error} /> : null}
      <Card title="Top materias">
        <HorizontalBars data={subjects} />
      </Card>
      <Card title="Top páginas">
        <HorizontalBars data={pages} />
      </Card>
      <div className="hud-panel mt-6 overflow-x-auto p-2">
        <table className="hud-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Página / sección</th>
              <th>Visitas</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p, i) => (
              <tr key={p.name}>
                <td className="text-[var(--fg-muted)]">{i + 1}</td>
                <td>{p.name}</td>
                <td>{p.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
