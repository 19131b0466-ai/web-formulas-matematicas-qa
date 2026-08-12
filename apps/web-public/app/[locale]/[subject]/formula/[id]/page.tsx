import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { FormulaDetailView } from '@/components/physics/FormulaDetail';
import { ApiUnavailableError, fetchFormula, fetchSubjects } from '@/lib/api';
import { localizeContent } from '@/lib/localize-content';
import { getSiteUrl } from '@/lib/site';
import { isSubjectSlug, subjectUsesFormulaCatalog, type SubjectSlug } from '@/lib/subjects';
import { routing, type AppLocale } from '@/i18n/routing';

export const revalidate = 600;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ locale: string; subject: string; id: string }>;
};

async function loadFormula(subject: SubjectSlug, id: string, locale: AppLocale) {
  try {
    return await localizeContent(await fetchFormula(subject, id), locale);
  } catch (err) {
    // Let error.tsx handle API timeouts/5xx — do not disguise them as 404.
    if (err instanceof ApiUnavailableError) throw err;
    throw err;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw, subject: subjectRaw, id } = await params;
  if (!isSubjectSlug(subjectRaw)) return {};
  const locale = raw as AppLocale;
  const subject = subjectRaw as SubjectSlug;
  const t = await getTranslations({ locale, namespace: 'formula' });
  try {
    const detail = await loadFormula(subject, id, locale);
    if (!detail) return { title: t('notFound') };

    const title = detail.title ?? t('primary');
    const description =
      detail.content.detail ?? t('metaDescription', { title });
    const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
    const url = `${getSiteUrl()}${prefix}/${subject}/formula/${detail.formulaId}`;

    return {
      title,
      description,
      openGraph: { title, description, url, type: 'article' },
      alternates: { canonical: url },
    };
  } catch {
    return { title: t('loading') };
  }
}

export default async function FormulaPage({ params }: PageProps) {
  const { locale: raw, subject: subjectRaw, id } = await params;
  if (!isSubjectSlug(subjectRaw) || !subjectUsesFormulaCatalog(subjectRaw)) notFound();
  const subject = subjectRaw as SubjectSlug;
  const locale = raw as AppLocale;
  setRequestLocale(locale);

  const subjects = await localizeContent(await fetchSubjects(), locale);
  const subjectTitle = subjects.find((s) => s.slug === subject)?.title ?? subject;
  const detail = await loadFormula(subject, id, locale);
  if (!detail) notFound();

  return (
    <FormulaDetailView subject={subject} subjectTitle={subjectTitle} detail={detail} />
  );
}
