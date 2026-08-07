import type { Metadata, Viewport } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Figtree, Fraunces, IBM_Plex_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { VisitTracker } from '@/components/analytics/VisitTracker';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { getSiteUrl } from '@/lib/site';
import { localeOgTags, routing, type AppLocale } from '@/i18n/routing';
import '../globals.css';

const body = Figtree({
  variable: '--font-body',
  subsets: ['latin'],
  display: 'swap',
});

const display = Fraunces({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3f6f4' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1614' },
  ],
  width: 'device-width',
  initialScale: 1,
};

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (hasLocale(routing.locales, raw) ? raw : routing.defaultLocale) as AppLocale;
  const t = await getTranslations({ locale, namespace: 'site' });
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t('name'),
      template: `%s · ${t('name')}`,
    },
    description: t('description'),
    applicationName: t('name'),
    openGraph: {
      type: 'website',
      locale: localeOgTags[locale],
      siteName: t('name'),
      title: t('name'),
      description: t('description'),
    },
    twitter: {
      card: 'summary_large_image',
      title: t('name'),
      description: t('description'),
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((code) => [
          code,
          code === routing.defaultLocale ? siteUrl : `${siteUrl}/${code}`,
        ]),
      ),
    },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale: raw } = await params;
  if (!hasLocale(routing.locales, raw)) {
    notFound();
  }
  const locale = raw as AppLocale;
  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${body.variable} ${display.variable} ${mono.variable} antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(t!=='light'&&d))document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
        <NextIntlClientProvider>
          <ThemeProvider>
            <Suspense fallback={null}>
              <VisitTracker />
            </Suspense>
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
