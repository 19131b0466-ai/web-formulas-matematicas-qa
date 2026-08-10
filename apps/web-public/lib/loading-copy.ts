import type { AppLocale } from '@/i18n/routing';

export const LOADING_COPY: Record<
  AppLocale,
  { formula: string; section: string; search: string }
> = {
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
