import type { Metadata } from 'next';
import { Figtree, Fraunces } from 'next/font/google';
import { AdminShell } from '@/components/AdminShell';
import { AuthProvider } from '@/components/AuthProvider';
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

export const metadata: Metadata = {
  title: {
    default: 'Superadmin — Cálculo II',
    template: '%s · Admin',
  },
  description: 'Dashboard de administración del formulario de Cálculo II',
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
