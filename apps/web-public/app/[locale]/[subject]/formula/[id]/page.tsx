import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { FormulaDetailView } from '@/components/physics/FormulaDetail';
import { JsonLd } from '@/components/seo/JsonLd';
import { ApiUnavailableError, fetchFormula, fetchSubjects } from '@/lib/api';
import { localizeContent } from '@/lib/localize-content';
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  formulaSeoDescription,
  learningResourceJsonLd,
  titledWithSubject,
} from '@/lib/seo';
import { isSubjectSlug, sectionHref, subjectHomeHref, subjectUsesFormulaCatalog, type SubjectSlug } from '@/lib/subjects';
import { calculoVizForSectionNumber } from '@repo/shared-types';
import type { AppLocale } from '@/i18n/routing';

export const revalidate = 86400;
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
  const ts = await getTranslations({ locale, namespace: 'seo' });
  const tsite = await getTranslations({ locale, namespace: 'site' });
  try {
    const [detail, subjects] = await Promise.all([
      loadFormula(subject, id, locale),
      localizeContent(await fetchSubjects(), locale),
    ]);
    if (!detail) return { title: t('notFound') };

    const subjectTitle = subjects.find((s) => s.slug === subject)?.title ?? subject;
    const concept = detail.title ?? t('primary');
    const title = titledWithSubject(concept, subjectTitle);
    const hasVisualization = Boolean(
      detail.content.visual ||
        (subject === 'calculo-ii' && calculoVizForSectionNumber(detail.section.number)),
    );
    const description = formulaSeoDescription({
      title: concept,
      subjectTitle,
      detail: detail.content.detail,
      hasVisualization,
      visualizationNote: hasVisualization ? ts('withVisualization') : undefined,
      fallback: ts('formulaFallback', { concept, subject: subjectTitle }),
    });

    return buildPageMetadata({
      locale,
      path: `/${subject}/formula/${detail.formulaId}`,
      title,
      description,
      siteName: tsite('name'),
      ogType: 'article',
    });
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

  const tn = await getTranslations('nav');
  const ts = await getTranslations('site');
  const tformula = await getTranslations('formula');
  const subjects = await localizeContent(await fetchSubjects(), locale);
  const subjectTitle = subjects.find((s) => s.slug === subject)?.title ?? subject;
  const detail = await loadFormula(subject, id, locale);
  if (!detail) notFound();

  const formulaPath = `/${subject}/formula/${detail.formulaId}`;
  const concept = detail.title ?? tformula('primary');

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: tn('home'), path: '/' },
          { name: subjectTitle, path: subjectHomeHref(subject) },
          { name: detail.section.title, path: sectionHref(subject, detail.section.slug) },
          { name: concept, path: formulaPath },
        ])}
      />
      <JsonLd
        data={learningResourceJsonLd({
          name: concept,
          description: detail.content.detail ?? concept,
          locale,
          path: formulaPath,
          learningResourceType: 'Reference',
          isPartOf: ts('name'),
        })}
      />
      <FormulaDetailView subject={subject} subjectTitle={subjectTitle} detail={detail} />
    </>
  );
}
