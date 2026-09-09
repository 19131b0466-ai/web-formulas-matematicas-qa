import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { InlineMarkdown } from '@/components/content/InlineMarkdown';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PhysicsVisualization } from '@/components/physics/PhysicsVisualization';
import { Link } from '@/i18n/navigation';
import { JsonLd } from '@/components/seo/JsonLd';
import { fetchMethodGuide, fetchSection, fetchSubjects } from '@/lib/api';
import { localizeContent } from '@/lib/localize-content';
import { breadcrumbJsonLd, buildPageMetadata } from '@/lib/seo';
import {
  isSubjectSlug,
  sectionHref,
  subjectGuideSectionSlug,
  subjectHasGuide,
  subjectHomeHref,
  type SubjectSlug,
} from '@/lib/subjects';
import type { AppLocale } from '@/i18n/routing';

type PageProps = {
  params: Promise<{ locale: string; subject: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw, subject: subjectRaw } = await params;
  if (!isSubjectSlug(subjectRaw) || !subjectHasGuide(subjectRaw)) return {};
  const locale = raw as AppLocale;
  const t = await getTranslations({ locale, namespace: 'guide' });
  const tseo = await getTranslations({ locale, namespace: 'seo' });
  const tsite = await getTranslations({ locale, namespace: 'site' });
  const subjects = await localizeContent(await fetchSubjects(), locale);
  const subjectTitle = subjects.find((s) => s.slug === subjectRaw)?.title ?? subjectRaw;
  const physics = subjectRaw === 'fisica-basica';
  const guideName = physics ? t('titlePhysics') : t('title');
  return buildPageMetadata({
    locale,
    path: `/${subjectRaw}/guia`,
    title: tseo('guideTitle', { guide: guideName, subject: subjectTitle }),
    description: physics ? t('descriptionPhysics') : t('description'),
    siteName: tsite('name'),
  });
}

export const revalidate = 86400;

export default async function GuidePage({ params }: PageProps) {
  const { locale: raw, subject: subjectRaw } = await params;
  if (!isSubjectSlug(subjectRaw) || !subjectHasGuide(subjectRaw)) notFound();
  const subject = subjectRaw as SubjectSlug;
  const locale = raw as AppLocale;
  setRequestLocale(locale);

  const t = await getTranslations('guide');
  const tn = await getTranslations('nav');
  const tf = await getTranslations('formula');
  const subjects = await localizeContent(await fetchSubjects(), locale);
  const subjectTitle = subjects.find((s) => s.slug === subject)?.title ?? subject;
  const guide = await localizeContent(await fetchMethodGuide(subject), locale);
  const guideSectionSlug = subjectGuideSectionSlug(subject);
  const section = await fetchSection(guideSectionSlug, subject);
  const isPhysics = subject === 'fisica-basica';

  return (
    <div>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: tn('home'), path: '/' },
          { name: subjectTitle, path: subjectHomeHref(subject) },
          { name: tn('guide'), path: `/${subject}/guia` },
        ])}
      />
      <Breadcrumbs
        items={[
          { label: tn('home'), href: '/' },
          { label: subjectTitle, href: subjectHomeHref(subject) },
          { label: tn('guide') },
        ]}
      />

      <header className="mb-8 animate-rise">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
          {isPhysics ? t('sectionLabelPhysics') : t('sectionLabel')}
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {isPhysics ? t('titlePhysics') : t('title')}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-[var(--fg-muted)]">
          {isPhysics ? t('introPhysics') : t('intro')}
        </p>
        {section ? (
          <p className="mt-3 text-sm">
            <Link
              href={sectionHref(subject, guideSectionSlug) as '/'}
              className="text-[var(--accent-strong)] underline-offset-2 hover:underline"
            >
              {t('fullSection')}
            </Link>
          </p>
        ) : null}
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">
          {isPhysics ? t('signalMethodPhysics') : t('signalMethod')}
        </h2>
        {guide.strategies.length === 0 ? (
          <p className="text-sm text-[var(--fg-muted)]">{t('empty')}</p>
        ) : (
          <ol className="space-y-3">
            {guide.strategies.map((row, i) => (
              <li
                key={`${row.signal}-${String(i)}`}
                className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] p-4 sm:grid-cols-[1.15fr_1fr]"
              >
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                    {t('signal')}
                  </p>
                  <p>
                    <InlineMarkdown text={row.signal} />
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                    {isPhysics ? t('methodPhysics') : t('method')}
                  </p>
                  <p className="font-medium text-[var(--accent-strong)]">
                    <InlineMarkdown text={row.method} />
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {guide.checklist.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold">{t('checklist')}</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-base leading-relaxed">
            {guide.checklist.map((item) => (
              <li key={item}>
                <InlineMarkdown text={item} />
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {isPhysics ? (
        <section className="mt-12">
          <h2 className="font-display mb-3 text-xl font-semibold tracking-tight">{tf('visualization')}</h2>
          <PhysicsVisualization
            type="approach_guide"
            concept="Elegir el bloque de fórmulas según la señal del enunciado"
          />
        </section>
      ) : null}
    </div>
  );
}
