import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const CANONICAL_ORIGIN = 'https://www.maththeoryandtools.com';

/** Production Vercel hosts only — preview deployments stay on *.vercel.app. */
const LEGACY_HOSTS = new Set([
  'web-formulas-matematicas.vercel.app',
  'web-formulas-matematicas-web-public.vercel.app',
]);

export default function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0]?.toLowerCase();
  if (host && LEGACY_HOSTS.has(host)) {
    const { pathname, search } = request.nextUrl;
    return NextResponse.redirect(`${CANONICAL_ORIGIN}${pathname}${search}`, 308);
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
