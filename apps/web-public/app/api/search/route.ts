import { hasLocale } from 'next-intl';
import { fetchSearch } from '@/lib/api';
import { localizeContent } from '@/lib/localize-content';
import { routing, type AppLocale } from '@/i18n/routing';
import { isSubjectSlug, type SubjectSlug } from '@/lib/subjects';

/** Query results stay off the page cache. The HTML shell of /buscar does not use this. */
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const subjectRaw = url.searchParams.get('subject') ?? '';
  if (!isSubjectSlug(subjectRaw)) {
    return Response.json({ error: 'Invalid subject' }, { status: 400 });
  }
  const subject = subjectRaw as SubjectSlug;
  const localeRaw = url.searchParams.get('locale') ?? routing.defaultLocale;
  const locale = (
    hasLocale(routing.locales, localeRaw) ? localeRaw : routing.defaultLocale
  ) as AppLocale;
  const q = url.searchParams.get('q')?.trim() ?? '';
  const tags = url.searchParams.get('tags')?.trim() ?? '';

  if (!q && !tags) {
    return Response.json(
      { query: '', total: 0, results: [] },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  }

  const data = await localizeContent(await fetchSearch({ subject, q, tags, limit: 40 }), locale);
  return Response.json(data, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
