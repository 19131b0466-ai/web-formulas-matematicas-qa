import type { Metadata, Viewport } from 'next';
import { Figtree, Fraunces, IBM_Plex_Mono } from 'next/font/google';
import { Suspense } from 'react';
import { VisitTracker } from '@/components/analytics/VisitTracker';
import { AppShell } from '@/components/layout/AppShell';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { fetchSections } from '@/lib/api';
import { SITE_DESCRIPTION, SITE_NAME, getSiteUrl } from '@/lib/site';
import './globals.css';

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

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#eef5f3' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1614' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sections = await fetchSections();

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${body.variable} ${display.variable} ${mono.variable} antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(t!=='light'&&d))document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
        <ThemeProvider>
          <Suspense fallback={null}>
            <VisitTracker />
          </Suspense>
          <AppShell sections={sections}>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
