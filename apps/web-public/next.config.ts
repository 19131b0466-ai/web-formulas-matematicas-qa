import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https: http://localhost:3001",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/shared-types', '@repo/math-renderer'],
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  async redirects() {
    return [
      {
        source: '/seccion/:slug',
        destination: '/calculo-ii/seccion/:slug',
        permanent: true,
      },
      {
        source: '/apendice/:slug',
        destination: '/calculo-ii/apendice/:slug',
        permanent: true,
      },
      {
        source: '/buscar',
        destination: '/calculo-ii/buscar',
        permanent: true,
      },
      {
        source: '/guia',
        destination: '/calculo-ii/guia',
        permanent: true,
      },
      {
        source: '/:locale/seccion/:slug',
        destination: '/:locale/calculo-ii/seccion/:slug',
        permanent: true,
      },
      {
        source: '/:locale/apendice/:slug',
        destination: '/:locale/calculo-ii/apendice/:slug',
        permanent: true,
      },
      {
        source: '/:locale/buscar',
        destination: '/:locale/calculo-ii/buscar',
        permanent: true,
      },
      {
        source: '/:locale/guia',
        destination: '/:locale/calculo-ii/guia',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
