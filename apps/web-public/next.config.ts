import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { isQaSite } from './lib/isr';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
const qaNoStoreHeaders = isQaSite()
  ? [{ key: 'Cache-Control', value: 'private, no-store, must-revalidate' }]
  : [];

/** Next.js webpack `next dev` evaluates Fast Refresh via `eval()`. Production stays without it. */
const isDev = process.env.NODE_ENV !== 'production';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      isDev
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      isDev
        ? "connect-src 'self' https: http: ws: wss:"
        : "connect-src 'self' https: http://localhost:3001",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/shared-types', '@repo/math-renderer'],
  poweredByHeader: false,
  /** Sitemap + static pages may call the API several times during build. */
  staticPageGenerationTimeout: 180,
  trailingSlash: false,
  async headers() {
    return [{ source: '/:path*', headers: [...securityHeaders, ...qaNoStoreHeaders] }];
  },
  async redirects() {
    // IMPORTANT: never use a bare `/:locale/...` matcher — subject slugs like
    // `calculo-ii` would be captured as the locale and produce
    // `/calculo-ii/calculo-ii/seccion/...` 404s.
    const locales = 'es|en|de|pt|fr|it';
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
        source: `/:locale(${locales})/seccion/:slug`,
        destination: '/:locale/calculo-ii/seccion/:slug',
        permanent: true,
      },
      {
        source: `/:locale(${locales})/apendice/:slug`,
        destination: '/:locale/calculo-ii/apendice/:slug',
        permanent: true,
      },
      {
        source: `/:locale(${locales})/buscar`,
        destination: '/:locale/calculo-ii/buscar',
        permanent: true,
      },
      {
        source: `/:locale(${locales})/guia`,
        destination: '/:locale/calculo-ii/guia',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
