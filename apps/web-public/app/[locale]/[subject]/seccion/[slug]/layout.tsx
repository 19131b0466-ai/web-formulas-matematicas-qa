import { notFound } from 'next/navigation';
import { fetchSection } from '@/lib/api';
import { resolveSectionSlugAlias } from '@/lib/section-slug-aliases';
import { isSubjectSlug, type SubjectSlug } from '@/lib/subjects';

/** Same segment rule as the formula layout: 404 before `loading.tsx` streams. */
export const maxDuration = 60;

export default async function SectionSegmentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subject: string; slug: string }>;
}) {
  const { subject: subjectRaw, slug: slugRaw } = await params;
  if (!isSubjectSlug(subjectRaw)) notFound();
  const subject = subjectRaw as SubjectSlug;
  const slug = resolveSectionSlugAlias(subject, slugRaw);

  const detail = await fetchSection(slug, subject);
  if (!detail) notFound();

  return children;
}
