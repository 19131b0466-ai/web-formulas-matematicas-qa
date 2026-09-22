import { FISICA_ELECTRONICA_SEARCH_ALIAS_OVERRIDES } from './fisica-electronica-search-aliases';

/** Spanish source aliases for “also known as” and SEO; localized via content-i18n. */
export const CALCULO_DIFERENCIAL_SEARCH_ALIAS_OVERRIDES: Record<string, string[]> = {
  'DIF-019': ['regla de la potencia para límites', 'límite de una potencia'],
  'DIF-020': ['limite seno', 'limite trigonométrico'],
};

export function formulaSearchAliases(
  formulaId: string,
  stored?: string[] | null,
): string[] {
  return (
    FISICA_ELECTRONICA_SEARCH_ALIAS_OVERRIDES[formulaId] ??
    CALCULO_DIFERENCIAL_SEARCH_ALIAS_OVERRIDES[formulaId] ??
    stored ??
    []
  );
}
