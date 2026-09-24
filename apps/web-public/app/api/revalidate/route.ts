import { revalidateTag } from 'next/cache';
import {
  formulaCacheTag,
  guideCacheTag,
  sectionCacheTag,
  subjectCacheTag,
} from '@/lib/cache-tags';
import { isSubjectSlug, type SubjectSlug } from '@/lib/subjects';

type RevalidateType = 'formula' | 'section' | 'subject' | 'guide';

const TYPES = new Set<RevalidateType>(['formula', 'section', 'subject', 'guide']);

export async function POST(req: Request) {
  const secret = req.headers.get('x-revalidate-secret');
  if (!secret || secret !== process.env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    type?: string;
    subject?: string;
    formulaId?: string;
    id?: string;
    slug?: string;
  };

  const subjectRaw = body.subject?.trim() ?? '';
  if (!isSubjectSlug(subjectRaw) || !body.type || !TYPES.has(body.type as RevalidateType)) {
    return Response.json(
      {
        error:
          'Expected { type: "formula" | "section" | "subject" | "guide", subject, id or slug }',
      },
      { status: 400 },
    );
  }

  const subject = subjectRaw as SubjectSlug;
  const type = body.type as RevalidateType;

  if (type === 'formula') {
    const id = (body.formulaId ?? body.id ?? '').trim();
    if (!id) return Response.json({ error: 'Missing formula id' }, { status: 400 });
    const tag = formulaCacheTag(subject, id);
    revalidateTag(tag);
    return Response.json({ revalidated: true, type, subject, tag });
  }

  if (type === 'section') {
    const slug = body.slug?.trim() ?? '';
    if (!slug) return Response.json({ error: 'Missing section slug' }, { status: 400 });
    const tag = sectionCacheTag(subject, slug);
    revalidateTag(tag);
    return Response.json({ revalidated: true, type, subject, tag });
  }

  if (type === 'subject') {
    const tag = subjectCacheTag(subject);
    revalidateTag(tag);
    return Response.json({ revalidated: true, type, subject, tag });
  }

  const tag = guideCacheTag(subject);
  revalidateTag(tag);
  return Response.json({ revalidated: true, type, subject, tag });
}
