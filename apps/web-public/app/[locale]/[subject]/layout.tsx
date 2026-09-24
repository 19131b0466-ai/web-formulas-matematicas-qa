import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { fetchSections, fetchSubjects } from '@/lib/api';
import { localizeContent } from '@/lib/localize-content';
import { subjectStaticParams } from '@/lib/catalog-static-params';
import { isSubjectSlug, type SubjectSlug } from '@/lib/subjects';
import type { AppLocale } from '@/i18n/routing';

/** Persistent until `revalidateTag('subject-${subject}')`. */
export const revalidate = false;

/** One real subject per locale. Unknown subjects still 404 at request time. */
export function generateStaticParams() {
  return subjectStaticParams();
}

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string; subject: string }>;
};

export default async function SubjectLayout({ children, params }: LayoutProps) {
  const { locale: raw, subject: subjectRaw } = await params;
  if (!isSubjectSlug(subjectRaw)) notFound();
  const subject = subjectRaw as SubjectSlug;
  const locale = raw as AppLocale;
  setRequestLocale(locale);

  const [subjects, sections] = await Promise.all([
    fetchSubjects().then((data) => localizeContent(data, locale)),
    fetchSections(subject).then((data) => localizeContent(data, locale)),
  ]);
  const meta = subjects.find((s) => s.slug === subject);

  return (
    <AppShell
      subject={subject}
      subjectTitle={meta?.title ?? subject}
      sections={sections.filter((s) => s.slug !== 'lista-comprobacion')}
    >
      {children}
    </AppShell>
  );
}
