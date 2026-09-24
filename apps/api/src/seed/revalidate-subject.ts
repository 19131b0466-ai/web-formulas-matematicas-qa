/**
 * Purge one subject's public catalog after its markdown import has committed.
 * The seed runs outside Next.js, so this calls web-public `POST /api/revalidate`,
 * which uses Next 15 `revalidateTag('subject-${subject}')`.
 */
export async function revalidateSeededSubject(subjectSlug: string): Promise<void> {
  const origin = process.env.WEB_PUBLIC_URL?.trim().replace(/\/$/, '');
  const secret = process.env.CRON_SECRET?.trim();
  if (!origin || !secret) {
    if (!process.env.VITEST) {
      console.warn(
        `[seed] skipped cache invalidation for ${subjectSlug}: set WEB_PUBLIC_URL and CRON_SECRET`,
      );
    }
    return;
  }

  const response = await fetch(`${origin}/api/revalidate`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-revalidate-secret': secret,
    },
    body: JSON.stringify({ type: 'subject', subject: subjectSlug }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(
      `Cache invalidation failed for ${subjectSlug}: ${String(response.status)} ${detail}`.trim(),
    );
  }
}
