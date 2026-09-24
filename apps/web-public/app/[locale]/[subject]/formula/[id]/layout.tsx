import { notFound } from 'next/navigation';
import { fetchFormula } from '@/lib/api';
import { isSubjectSlug, subjectUsesFormulaCatalog, type SubjectSlug } from '@/lib/subjects';

/**
 * Existence check sits outside `loading.tsx`. That file wraps only the page,
 * so a missing formula can return HTTP 404 before any 200 shell is streamed.
 */
export default async function FormulaSegmentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subject: string; id: string }>;
}) {
  const { subject: subjectRaw, id } = await params;
  if (!isSubjectSlug(subjectRaw) || !subjectUsesFormulaCatalog(subjectRaw)) notFound();

  const detail = await fetchFormula(subjectRaw as SubjectSlug, id);
  if (!detail) notFound();

  return children;
}
