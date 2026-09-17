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
  definedTermJsonLd,
  faqPageJsonLd,
  formulaOgImageUrl,
  formulaSeoDescription,
  formulaSeoTitle,
  learningResourceJsonLd,
  mergeSearchKeywords,
} from '@/lib/seo';
import { isSubjectSlug, sectionHref, subjectHomeHref, subjectUsesFormulaCatalog, type SubjectSlug } from '@/lib/subjects';
import {
  calculoDiferencialVizForFormulaId,
  calculoVizForFormulaId,
  fisicaVizForFormulaId,
} from '@repo/shared-types';
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
    const title = formulaSeoTitle(concept, subjectTitle, locale, {
      formulaId: detail.formulaId,
      subject,
    });
    const hasVisualization = Boolean(
      (subject === 'calculo-ii' && calculoVizForFormulaId(detail.formulaId)) ||
        (subject === 'calculo-diferencial' && calculoDiferencialVizForFormulaId(detail.formulaId)) ||
        (subject === 'fisica-basica' && fisicaVizForFormulaId(detail.formulaId)) ||
        (subject === 'algebra' && detail.content.visual),
    );
    const keywords = mergeSearchKeywords(
      detail.content.equivalentNotations,
      detail.content.searchAliases,
    );
    const description = formulaSeoDescription({
      title: concept,
      subjectTitle,
      detail: detail.content.detail,
      latex: detail.content.latex,
      variables: detail.content.variables,
      conventions: detail.content.conventions,
      equivalentNotations: detail.content.equivalentNotations,
      searchAliases: detail.content.searchAliases,
      hasVisualization,
      visualizationNote: hasVisualization ? ts('withVisualization') : undefined,
      unitsLabel: ts('unitsLabel'),
      fallback: ts('formulaFallback', { concept, subject: subjectTitle }),
    });
    const ogImageUrl = formulaOgImageUrl(locale, subject, detail.formulaId);

    return buildPageMetadata({
      locale,
      path: `/${subject}/formula/${detail.formulaId}`,
      title,
      description,
      siteName: tsite('name'),
      ogType: 'article',
      ogImage: { url: ogImageUrl, alt: title },
      keywords: keywords.length ? keywords : undefined,
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
  const faq = detail.content.faq ?? [];
  const faqLd = faqPageJsonLd({ items: faq, locale, path: formulaPath });

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
      <JsonLd
        data={definedTermJsonLd({
          name: concept,
          description: detail.content.detail ?? concept,
          locale,
          path: formulaPath,
          termCode: detail.formulaId,
          termSetName: subjectTitle,
          latex: detail.content.latex,
        })}
      />
      {faqLd ? <JsonLd data={faqLd} /> : null}
      <FormulaDetailView subject={subject} subjectTitle={subjectTitle} detail={detail} />
    </>
  );
}
