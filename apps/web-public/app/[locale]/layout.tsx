import type { Metadata, Viewport } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Figtree, Fraunces, IBM_Plex_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { VisitTracker } from '@/components/analytics/VisitTracker';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { CANONICAL_ORIGIN } from '@/lib/seo';
import { CATALOG_REVALIDATE_SECONDS, DYNAMIC_PAGE, PAGE_FETCH_CACHE } from '@/lib/isr';
import { localeOgTags, routing, type AppLocale } from '@/i18n/routing';
import '../globals.css';

export const revalidate = CATALOG_REVALIDATE_SECONDS;
export const fetchCache = PAGE_FETCH_CACHE;
export const dynamic = DYNAMIC_PAGE;

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

  return {
    metadataBase: new URL(CANONICAL_ORIGIN),
    title: {
      default: t('seoTitle'),
      template: `%s`,
    },
    description: t('description'),
    applicationName: t('name'),
    openGraph: {
      type: 'website',
      locale: localeOgTags[locale],
      siteName: t('name'),
      title: t('seoTitle'),
      description: t('description'),
      images: [
        {
          url: '/og-default.png',
          width: 1200,
          height: 630,
          alt: t('name'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('seoTitle'),
      description: t('description'),
      images: ['/og-default.png'],
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [{ url: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
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
