import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContentPage, ContentSection } from '@/components/site/ContentPage';
import { SiteShell } from '@/components/site/SiteShell';
import type { AppLocale } from '@/i18n/routing';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });
  return { title: t('title'), description: t('lead') };
}

export default async function AboutPage({ params }: PageProps) {
  const { locale: raw } = await params;
  const locale = raw as AppLocale;
  setRequestLocale(locale);
  const t = await getTranslations('about');

  return (
    <SiteShell>
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
        <ContentSection title={t('openTitle')}>
          <p>{t('openBody')}</p>
        </ContentSection>
      </ContentPage>
    </SiteShell>
  );
}
