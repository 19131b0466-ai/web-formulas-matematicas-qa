import { cookies, headers } from 'next/headers';
import { routing, type AppLocale } from '@/i18n/routing';

const LOADING: Record<AppLocale, { formula: string; section: string; search: string }> = {
  es: {
    formula: 'Cargando fórmula…',
    section: 'Cargando sección…',
    search: 'Cargando búsqueda…',
  },
  en: {
    formula: 'Loading formula…',
    section: 'Loading section…',
    search: 'Loading search…',
  },
  de: {
    formula: 'Formel wird geladen…',
    section: 'Abschnitt wird geladen…',
    search: 'Suche wird geladen…',
  },
  fr: {
    formula: 'Chargement de la formule…',
    section: 'Chargement de la section…',
    search: 'Chargement de la recherche…',
  },
  it: {
    formula: 'Caricamento formula…',
    section: 'Caricamento sezione…',
    search: 'Caricamento ricerca…',
  },
  pt: {
    formula: 'Carregando fórmula…',
    section: 'Carregando seção…',
    search: 'Carregando busca…',
  },
};

function asLocale(value: string | null | undefined): AppLocale | null {
  if (!value) return null;
  return (routing.locales as readonly string[]).includes(value) ? (value as AppLocale) : null;
}

function localeFromPathname(pathname: string): AppLocale | null {
  const segment = pathname.split('/').filter(Boolean)[0];
  return asLocale(segment);
}

export async function getLoadingCopy() {
  const headerStore = await headers();

  // next-intl middleware attaches the negotiated locale for Server Components.
  const fromIntl = asLocale(headerStore.get('x-next-intl-locale'));
  if (fromIntl) return LOADING[fromIntl];

  const pathname = headerStore.get('x-pathname') ?? headerStore.get('next-url') ?? '';
  const fromPath = localeFromPathname(pathname);
  if (fromPath) return LOADING[fromPath];

  const jar = await cookies();
  const fromCookie = asLocale(jar.get('NEXT_LOCALE')?.value);
  if (fromCookie) return LOADING[fromCookie];

  return LOADING[routing.defaultLocale];
}
