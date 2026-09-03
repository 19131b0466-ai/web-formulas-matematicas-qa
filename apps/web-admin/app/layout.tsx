import type { Metadata } from 'next';
import { IBM_Plex_Mono, Orbitron } from 'next/font/google';
import { AdminShell } from '@/components/AdminShell';
import { AuthProvider } from '@/components/AuthProvider';
import { TrafficFilterProvider } from '@/components/TrafficFilter';
import './globals.css';

const body = IBM_Plex_Mono({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const display = Orbitron({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Ops Console — Cálculo II',
    template: '%s · Ops',
  },
  description: 'Consola de operaciones y analytics del formulario de Cálculo II',
  applicationName: 'Ops Console',
  robots: { index: false, follow: false },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${body.variable} ${display.variable} antialiased`}>
        <AuthProvider>
          <TrafficFilterProvider>
            <AdminShell>{children}</AdminShell>
          </TrafficFilterProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
