import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { ContentPage, ContentSection } from '@/components/site/ContentPage';
import { ReviewForm } from '@/components/site/ReviewForm';
import { SiteShell } from '@/components/site/SiteShell';
import { fetchPublicReviews } from '@/lib/api';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd, buildPageMetadata } from '@/lib/seo';
import type { AppLocale } from '@/i18n/routing';

export const revalidate = 3600;

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = raw as AppLocale;
  const t = await getTranslations({ locale, namespace: 'reviews' });
  const tsite = await getTranslations({ locale, namespace: 'site' });
  return buildPageMetadata({
    locale,
    path: '/resenas',
    title: t('title'),
    description: t('lead'),
    siteName: tsite('name'),
  });
}

function stars(rating: number): string {
  return `${'★'.repeat(rating)}${'☆'.repeat(Math.max(0, 5 - rating))}`;
}

export default async function ReviewsPage({ params }: PageProps) {
  const { locale: raw } = await params;
  const locale = raw as AppLocale;
  setRequestLocale(locale);
  const t = await getTranslations('reviews');
  const tn = await getTranslations('nav');
  const data = await fetchPublicReviews();

  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });

  return (
    <SiteShell>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: tn('home'), path: '/' },
          { name: t('title'), path: '/resenas' },
        ])}
      />
      <ContentPage title={t('title')} lead={t('lead')}>
        <ContentSection title={t('writeTitle')}>
          <p>{t('moderationNote')}</p>
          <ReviewForm locale={locale} />
        </ContentSection>
        <ContentSection title={t('listTitle')}>
          {data.count > 0 && data.averageRating != null ? (
            <p>
              {t('summary', { count: data.count, average: data.averageRating.toFixed(1) })}
            </p>
          ) : null}
          {data.reviews.length === 0 ? (
            <p>{t('empty')}</p>
          ) : (
            <ul className="space-y-4">
              {data.reviews.map((review) => (
                <li
                  key={review.id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] px-4 py-4"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-medium text-[var(--fg)]">{review.displayName}</p>
                    <p className="text-sm text-[var(--accent-strong)]" aria-label={t('stars', { count: review.rating })}>
                      {stars(review.rating)}
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">{review.body}</p>
                  <p className="mt-3 text-xs text-[var(--fg-muted)]">
                    {dateFmt.format(new Date(review.createdAt))}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </ContentSection>
      </ContentPage>
    </SiteShell>
  );
}
