import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { InlineMarkdown } from '@/components/content/InlineMarkdown';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { Link } from '@/i18n/navigation';
import { fetchSections, fetchSubjects } from '@/lib/api';
import { localizeContent } from '@/lib/localize-content';
import { breadcrumbJsonLd, buildPageMetadata } from '@/lib/seo';
import {
  isSubjectSlug,
  searchHref,
  sectionHref,
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
  if (!isSubjectSlug(subjectRaw)) return {};
  const locale = raw as AppLocale;
  const t = await getTranslations({ locale, namespace: 'subjectHome' });
  const tseo = await getTranslations({ locale, namespace: 'seo' });
  const tsite = await getTranslations({ locale, namespace: 'site' });
  const subjects = await localizeContent(await fetchSubjects(), locale);
  const meta = subjects.find((s) => s.slug === subjectRaw);
  const title = tseo('subjectTitle', { subject: meta?.title ?? subjectRaw });
  const description = meta?.description ?? t('fallbackDescription', { title: meta?.title ?? subjectRaw });
  return buildPageMetadata({
    locale,
    path: `/${subjectRaw}`,
    title,
    description,
    siteName: tsite('name'),
  });
}

export const revalidate = 86400;

export default async function SubjectHomePage({ params }: PageProps) {
  const { locale: raw, subject: subjectRaw } = await params;
  if (!isSubjectSlug(subjectRaw)) notFound();
  const subject = subjectRaw as SubjectSlug;
  const locale = raw as AppLocale;
  setRequestLocale(locale);

  const t = await getTranslations('subjectHome');
  const tn = await getTranslations('nav');
  const subjects = await localizeContent(await fetchSubjects(), locale);
  const meta = subjects.find((s) => s.slug === subject);
  const sections = await localizeContent(await fetchSections(subject), locale);
  const main = sections.filter(
    (s) => !s.slug.startsWith('apendice-') && s.slug !== 'lista-comprobacion',
  );
  const appendices = sections.filter((s) => s.slug.startsWith('apendice-'));
  const subjectTitle = meta?.title ?? subject;

  return (
    <div className="space-y-12">
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: tn('home'), path: '/' },
          { name: subjectTitle, path: subjectHomeHref(subject) },
        ])}
      />
      <Breadcrumbs
        items={[
          { label: tn('home'), href: '/' },
          { label: subjectTitle },
        ]}
      />
      <section className="animate-rise relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg-elevated)_88%,transparent)] px-6 py-12 sm:px-10 sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-[var(--accent)]/15 blur-3xl"
        />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
          {meta?.title ?? subject}
        </p>
        <h1 className="font-display mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-[var(--fg)] sm:text-5xl">
          {meta?.title ?? subject}
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--fg-muted)]">
          {meta?.description ?? t('fallbackDescription', { title: meta?.title ?? subject })}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={searchHref(subject) as '/'}
            className="inline-flex min-h-12 items-center rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          >
            {t('ctaSearch')}
          </Link>
          {subjectHasGuide(subject) ? (
            <Link
              href={`/${subject}/guia` as '/'}
              className="inline-flex min-h-12 items-center rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-5 text-sm font-semibold text-[var(--fg)] transition hover:border-[var(--accent)]"
            >
              {t('ctaGuide')}
            </Link>
          ) : null}
          <Link
            href="/"
            className="inline-flex min-h-12 items-center rounded-xl border border-[var(--border)] px-5 text-sm font-semibold text-[var(--fg-muted)] transition hover:border-[var(--accent)]"
          >
            {t('ctaHub')}
          </Link>
        </div>
      </section>

      <section className="animate-rise" style={{ animationDelay: '80ms' }}>
        <h2 className="font-display text-2xl font-semibold tracking-tight">{t('index')}</h2>
        <p className="mt-2 text-[var(--fg-muted)]">
          {t('indexSummarySimple', { main: main.length })}
          {appendices.length ? t('andAppendices', { count: appendices.length }) : ''}.
        </p>

        {main.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-[var(--border)] p-6 text-sm text-[var(--fg-muted)]">
            {t('empty')}
          </p>
        ) : (
          <ol className="mt-6 divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {main.map((section) => (
              <li key={section.slug}>
                <Link
                  href={sectionHref(subject, section.slug) as '/'}
                  className="group flex min-h-14 items-baseline justify-between gap-4 py-4 transition hover:text-[var(--accent-strong)]"
                >
                  <span className="flex min-w-0 gap-3">
                    <span className="w-8 shrink-0 tabular-nums text-[var(--fg-muted)]">
                      {section.number}
                    </span>
                    <span className="font-medium">
                      <InlineMarkdown text={section.title} />
                    </span>
                  </span>
                  <span className="shrink-0 text-sm text-[var(--fg-muted)] opacity-0 transition group-hover:opacity-100">
                    {t('view')}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      {appendices.length > 0 ? (
        <section className="animate-rise" style={{ animationDelay: '140ms' }}>
          <h2 className="font-display text-2xl font-semibold tracking-tight">{t('appendices')}</h2>
          <ul className="mt-4 space-y-2">
            {appendices.map((section) => (
              <li key={section.slug}>
                <Link
                  href={sectionHref(subject, section.slug) as '/'}
                  className="inline-flex min-h-11 items-center text-[var(--accent-strong)] underline-offset-2 hover:underline"
                >
                  <InlineMarkdown text={section.title} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
