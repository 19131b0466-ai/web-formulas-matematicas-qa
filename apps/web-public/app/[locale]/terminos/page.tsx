import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContentPage, ContentSection } from '@/components/site/ContentPage';
import { SiteShell } from '@/components/site/SiteShell';
import type { AppLocale } from '@/i18n/routing';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'terms' });
  return { title: t('title'), description: t('lead') };
}

export default async function TermsPage({ params }: PageProps) {
  const { locale: raw } = await params;
  const locale = raw as AppLocale;
  setRequestLocale(locale);
  const t = await getTranslations('terms');

  return (
    <SiteShell>
      <ContentPage title={t('title')} lead={t('lead')} updatedLabel={t('updated')}>
        <ContentSection title={t('s1Title')}>
          <p>{t('s1Body')}</p>
        </ContentSection>
        <ContentSection title={t('s2Title')}>
          <p>{t('s2Body')}</p>
        </ContentSection>
        <ContentSection title={t('s3Title')}>
          <p>{t('s3Body')}</p>
        </ContentSection>
        <ContentSection title={t('s4Title')}>
          <p>{t('s4Body')}</p>
        </ContentSection>
        <ContentSection title={t('s5Title')}>
          <p>{t('s5Body')}</p>
        </ContentSection>
        <ContentSection title={t('s6Title')}>
          <p>{t('s6Body')}</p>
        </ContentSection>
      </ContentPage>
    </SiteShell>
  );
}
