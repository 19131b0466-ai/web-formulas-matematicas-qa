import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContentPage, ContentSection } from '@/components/site/ContentPage';
import { SiteShell } from '@/components/site/SiteShell';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd, buildPageMetadata } from '@/lib/seo';
import type { AppLocale } from '@/i18n/routing';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = raw as AppLocale;
  const t = await getTranslations({ locale, namespace: 'about' });
  const tsite = await getTranslations({ locale, namespace: 'site' });
  return buildPageMetadata({
    locale,
    path: '/acerca',
    title: t('title'),
    description: t('lead'),
    siteName: tsite('name'),
  });
}

export default async function AboutPage({ params }: PageProps) {
  const { locale: raw } = await params;
  const locale = raw as AppLocale;
  setRequestLocale(locale);
  const t = await getTranslations('about');
  const tn = await getTranslations('nav');

  return (
    <SiteShell>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: tn('home'), path: '/' },
          { name: t('title'), path: '/acerca' },
        ])}
      />
      <ContentPage title={t('title')} lead={t('lead')}>
        <ContentSection title={t('missionTitle')}>
          <p>{t('missionBody')}</p>
        </ContentSection>
        <ContentSection title={t('whatTitle')}>
          <p>{t('whatBody')}</p>
        </ContentSection>
        <ContentSection title={t('audienceTitle')}>
          <p>{t('audienceBody')}</p>
        </ContentSection>
        <ContentSection title={t('howTitle')}>
          <p>{t('howBody')}</p>
        </ContentSection>
        <ContentSection title={t('correctionsTitle')}>
          <p>{t('correctionsBody')}</p>
        </ContentSection>
        <ContentSection title={t('openTitle')}>
          <p>{t('openBody')}</p>
        </ContentSection>
      </ContentPage>
    </SiteShell>
  );
}
