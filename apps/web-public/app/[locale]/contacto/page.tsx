import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactForm } from '@/components/site/ContactForm';
import { ContentPage } from '@/components/site/ContentPage';
import { SiteShell } from '@/components/site/SiteShell';
import { buildPageMetadata, breadcrumbJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import type { AppLocale } from '@/i18n/routing';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = raw as AppLocale;
  const t = await getTranslations({ locale, namespace: 'contact' });
  const tsite = await getTranslations({ locale, namespace: 'site' });
  return buildPageMetadata({
    locale,
    path: '/contacto',
    title: t('title'),
    description: t('lead'),
    siteName: tsite('name'),
  });
}

export default async function ContactPage({ params }: PageProps) {
  const { locale: raw } = await params;
  const locale = raw as AppLocale;
  setRequestLocale(locale);
  const t = await getTranslations('contact');
  const tn = await getTranslations('nav');

  return (
    <SiteShell>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: tn('home'), path: '/' },
          { name: t('title'), path: '/contacto' },
        ])}
      />
      <ContentPage title={t('title')} lead={t('lead')}>
        <ContactForm />
      </ContentPage>
    </SiteShell>
  );
}
