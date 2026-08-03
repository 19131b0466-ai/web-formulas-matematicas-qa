import countries from 'i18n-iso-countries';
import es from 'i18n-iso-countries/langs/es.json';
import en from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(es);
countries.registerLocale(en);

/** Resolve a human country name; prefers analytics label, then Spanish ISO name. */
export function countryDisplayName(
  code: string,
  fallback?: string | null,
  properties?: Record<string, unknown> | null,
): string {
  const normalized = code.toUpperCase();
  if (fallback && fallback.trim() && fallback.trim().toUpperCase() !== normalized) {
    return fallback.trim();
  }

  const fromProps = [
    properties?.NAME,
    properties?.name,
    properties?.ADMIN,
    properties?.NAME_ES,
    properties?.NAME_EN,
  ].find((value): value is string => typeof value === 'string' && value.trim().length > 0);
  if (fromProps && fromProps.toUpperCase() !== normalized) {
    return fromProps.trim();
  }

  return countries.getName(normalized, 'es') ?? countries.getName(normalized, 'en') ?? normalized;
}
