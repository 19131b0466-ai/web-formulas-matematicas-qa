import { randomUUID } from 'node:crypto';
import { asc, count, desc, eq, sql } from 'drizzle-orm';
import type { AdminReview, PublicReview, ReviewStatus } from '@repo/shared-types';
import type { Database } from '../db/client.js';
import { reviews } from '../db/schema.js';

const ANONYMOUS = 'Anónimo';

export type NewReviewInput = {
  displayName: string | null;
  rating: number;
  body: string;
  locale: string;
};

function toPublic(row: typeof reviews.$inferSelect): PublicReview {
  const name = row.displayName?.trim();
  return {
    id: row.id,
    displayName: name && name.length > 0 ? name : ANONYMOUS,
    rating: row.rating,
    body: row.body,
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

function toAdmin(row: typeof reviews.$inferSelect): AdminReview {
  return {
    id: row.id,
    displayName: row.displayName,
    rating: row.rating,
    body: row.body,
    locale: row.locale,
    status: row.status as ReviewStatus,
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    moderatedAt: row.moderatedAt?.toISOString() ?? null,
  };
}

export async function listApprovedReviews(db: Database): Promise<{
  reviews: PublicReview[];
  averageRating: number | null;
  count: number;
}> {
  const rows = await db
    .select()
    .from(reviews)
    .where(eq(reviews.status, 'approved'))
    .orderBy(desc(reviews.createdAt));

  const avg =
    rows.length === 0
      ? null
      : Math.round((rows.reduce((sum, row) => sum + row.rating, 0) / rows.length) * 10) / 10;

  return {
    reviews: rows.map(toPublic),
    averageRating: avg,
    count: rows.length,
  };
}

export async function createReview(db: Database, input: NewReviewInput): Promise<void> {
  await db.insert(reviews).values({
    id: randomUUID(),
    displayName: input.displayName,
    rating: input.rating,
    body: input.body,
    locale: input.locale,
    status: 'pending',
  });
}

export async function listAdminReviews(
  db: Database,
  status?: ReviewStatus,
): Promise<{ reviews: AdminReview[]; pendingCount: number }> {
  const pendingRows = await db
    .select({ value: count() })
    .from(reviews)
    .where(eq(reviews.status, 'pending'));
  const pendingCount = Number(pendingRows[0]?.value ?? 0);

  const rows = status
    ? await db
        .select()
        .from(reviews)
        .where(eq(reviews.status, status))
        .orderBy(status === 'pending' ? asc(reviews.createdAt) : desc(reviews.createdAt))
    : await db.select().from(reviews).orderBy(desc(reviews.createdAt));

  return { reviews: rows.map(toAdmin), pendingCount };
}

export async function setReviewStatus(
  db: Database,
  id: string,
  status: ReviewStatus,
): Promise<boolean> {
  const updated = await db
    .update(reviews)
    .set({ status, moderatedAt: sql`now()` })
    .where(eq(reviews.id, id))
    .returning({ id: reviews.id });
  return updated.length > 0;
}

export async function deleteReview(db: Database, id: string): Promise<boolean> {
  const deleted = await db.delete(reviews).where(eq(reviews.id, id)).returning({ id: reviews.id });
  return deleted.length > 0;
}
