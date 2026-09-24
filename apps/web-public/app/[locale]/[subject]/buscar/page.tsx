import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { SearchPanel } from '@/components/search/SearchPanel';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { fetchSubjects, fetchTags } from '@/lib/api';
import { localizeContent } from '@/lib/localize-content';
import { breadcrumbJsonLd, buildPageMetadata } from '@/lib/seo';
import {
  isSubjectSlug,
  subjectHomeHref,
  subjectUsesFormulaCatalog,
  type SubjectSlug,
} from '@/lib/subjects';
import type { AppLocale } from '@/i18n/routing';

export const maxDuration = 60;
/** Shell is persistent. `q` and `tags` are read on the client and fetched from /api/search. */
export const revalidate = false;

type PageProps = {
  params: Promise<{ locale: string; subject: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw, subject: subjectRaw } = await params;
  if (!isSubjectSlug(subjectRaw)) return {};
  const locale = raw as AppLocale;
  const t = await getTranslations({ locale, namespace: 'search' });
  const tsite = await getTranslations({ locale, namespace: 'site' });
  const subjects = await localizeContent(await fetchSubjects(), locale);
  const subjectTitle = subjects.find((s) => s.slug === subjectRaw)?.title ?? subjectRaw;
  return buildPageMetadata({
    locale,
    path: `/${subjectRaw}/buscar`,
    title: `${t('title')} — ${subjectTitle}`,
    description: t('description'),
    siteName: tsite('name'),
    index: false,
    follow: true,
  });
}

export default async function SearchPage({ params }: PageProps) {
  const { locale: raw, subject: subjectRaw } = await params;
  if (!isSubjectSlug(subjectRaw)) notFound();
  const subject = subjectRaw as SubjectSlug;
  const locale = raw as AppLocale;
  setRequestLocale(locale);

  const t = await getTranslations('search');
  const tn = await getTranslations('nav');
  const subjects = await localizeContent(await fetchSubjects(), locale);
  const subjectTitle = subjects.find((s) => s.slug === subject)?.title ?? subject;
  const tagList = await fetchTags(subject);

  return (
    <div>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: tn('home'), path: '/' },
          { name: subjectTitle, path: subjectHomeHref(subject) },
          { name: t('title'), path: `/${subject}/buscar` },
        ])}
      />
      <Breadcrumbs
        items={[
          { label: tn('home'), href: '/' },
          { label: subjectTitle, href: subjectHomeHref(subject) },
          { label: t('title') },
        ]}
      />
      <header className="mb-8 animate-rise">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-[var(--fg-muted)]">{t('subtitle')}</p>
      </header>
      <SearchPanel
        subject={subject}
        linkFormulas={subjectUsesFormulaCatalog(subject)}
        tagOptions={tagList.tags}
      />
    </div>
  );
}
