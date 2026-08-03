import type { Metadata } from 'next';
import { IBM_Plex_Mono, Orbitron } from 'next/font/google';
import { AdminShell } from '@/components/AdminShell';
import { AuthProvider } from '@/components/AuthProvider';
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
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${body.variable} ${display.variable} antialiased`}>
        <AuthProvider>
          <AdminShell>{children}</AdminShell>
        </AuthProvider>
      </body>
    </html>
  );
}
