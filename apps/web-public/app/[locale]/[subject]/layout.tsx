import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { fetchSections, fetchSubjects } from '@/lib/api';
import { localizeContent } from '@/lib/localize-content';
import { isSubjectSlug, type SubjectSlug } from '@/lib/subjects';
import type { AppLocale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

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

  const subjects = await fetchSubjects();
  const meta = subjects.find((s) => s.slug === subject);
  const sections = await localizeContent(await fetchSections(subject), locale);

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
