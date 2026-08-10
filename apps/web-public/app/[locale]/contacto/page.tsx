import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactForm } from '@/components/site/ContactForm';
import { ContentPage } from '@/components/site/ContentPage';
import { SiteShell } from '@/components/site/SiteShell';
import type { AppLocale } from '@/i18n/routing';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });
  return { title: t('title'), description: t('lead') };
}

export default async function ContactPage({ params }: PageProps) {
  const { locale: raw } = await params;
  const locale = raw as AppLocale;
  setRequestLocale(locale);
  const t = await getTranslations('contact');

  return (
    <SiteShell>
      <ContentPage title={t('title')} lead={t('lead')}>
        <ContactForm />
      </ContentPage>
    </SiteShell>
  );
}
