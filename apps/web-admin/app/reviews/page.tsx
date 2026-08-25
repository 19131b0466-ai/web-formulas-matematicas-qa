'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AdminReview, ReviewStatus } from '@repo/shared-types';
import { Card, ErrorBox, PageHeader } from '@/components/ui';
import { deleteAdminReview, fetchAdminReviews, moderateReview } from '@/lib/api';

const FILTERS: Array<{ id: ReviewStatus | 'all'; label: string }> = [
  { id: 'pending', label: 'Pendientes' },
  { id: 'approved', label: 'Aprobadas' },
  { id: 'rejected', label: 'Rechazadas' },
  { id: 'all', label: 'Todas' },
];

export default function ReviewsModerationPage() {
  const [filter, setFilter] = useState<ReviewStatus | 'all'>('pending');
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const data = await fetchAdminReviews(filter === 'all' ? undefined : filter);
    setReviews(data.reviews);
    setPendingCount(data.pendingCount);
  }, [filter]);

  useEffect(() => {
    load().catch((err: unknown) => setError(err instanceof Error ? err.message : 'Error'));
  }, [load]);

  async function act(id: string, fn: () => Promise<unknown>) {
    setBusyId(id);
    try {
      await fn();
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Reseñas"
        subtitle="Aprueba, oculta o borra comentarios enviados desde la web pública."
      />
      {error ? <ErrorBox message={error} /> : null}

      <p className="mb-4 text-sm text-[var(--fg-muted)]">
        Pendientes de revisión: <strong className="text-[var(--accent-strong)]">{pendingCount}</strong>
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`rounded-lg border px-3 py-1.5 text-xs tracking-[0.1em] uppercase ${
              filter === item.id
                ? 'border-[var(--accent)] text-[var(--accent-strong)]'
                : 'border-[var(--border)] text-[var(--fg-muted)]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Card>
        {reviews.length === 0 ? (
          <p className="text-sm text-[var(--fg-muted)]">No hay reseñas en este filtro.</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li key={review.id} className="border-b border-[var(--border)] pb-4 last:border-b-0 last:pb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium">
                    {review.displayName?.trim() || 'Anónimo'} · {'★'.repeat(review.rating)}
                  </p>
                  <p className="text-[11px] tracking-wide text-[var(--fg-muted)] uppercase">
                    {review.status} · {review.locale} · {new Date(review.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--fg)]">{review.body}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {review.status !== 'approved' ? (
                    <button
                      type="button"
                      disabled={busyId === review.id}
                      onClick={() => act(review.id, () => moderateReview(review.id, 'approved'))}
                      className="hud-btn px-3 py-1.5 text-xs"
                    >
                      Aprobar
                    </button>
                  ) : null}
                  {review.status !== 'rejected' ? (
                    <button
                      type="button"
                      disabled={busyId === review.id}
                      onClick={() => act(review.id, () => moderateReview(review.id, 'rejected'))}
                      className="border border-[var(--border)] px-3 py-1.5 text-xs uppercase tracking-wide text-[var(--fg-muted)]"
                    >
                      Rechazar
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={busyId === review.id}
                    onClick={() => {
                      if (confirm('¿Borrar esta reseña de forma permanente?')) {
                        void act(review.id, () => deleteAdminReview(review.id));
                      }
                    }}
                    className="border border-[var(--danger)]/40 px-3 py-1.5 text-xs uppercase tracking-wide text-[var(--danger)]"
                  >
                    Borrar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
