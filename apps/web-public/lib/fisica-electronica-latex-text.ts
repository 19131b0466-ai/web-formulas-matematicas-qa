import type { AppLocale } from '@/i18n/routing';

const EN: Record<string, string> = {
  carga: 'charge',
  descarga: 'discharge',
  fasor: 'phasor',
  equivalente: 'equivalent',
  corte: 'cutoff',
  saturación: 'saturation',
  activa: 'active',
};

const DE: Record<string, string> = {
  carga: 'Ladung',
  descarga: 'Entladung',
  fasor: 'Zeiger',
  equivalente: 'äquivalent',
  corte: 'Sperrbereich',
  saturación: 'Sättigung',
  activa: 'aktiv',
};

const FR: Record<string, string> = {
  carga: 'charge',
  descarga: 'décharge',
  fasor: 'phasor',
  equivalente: 'équivalent',
  corte: 'blocage',
  saturación: 'saturation',
  activa: 'active',
};

const IT: Record<string, string> = {
  carga: 'carica',
  descarga: 'scarica',
  fasor: 'fasore',
  equivalente: 'equivalente',
  corte: 'interdizione',
  saturación: 'saturazione',
  activa: 'attiva',
};

const PT: Record<string, string> = {
  carga: 'carga',
  descarga: 'descarga',
  fasor: 'fasor',
  equivalente: 'equivalente',
  corte: 'corte',
  saturación: 'saturação',
  activa: 'ativa',
};

const MAPS: Record<Exclude<AppLocale, 'es'>, Record<string, string>> = {
  en: EN,
  de: DE,
  fr: FR,
  it: IT,
  pt: PT,
};

function applyMap(text: string, dict: Record<string, string>): string {
  const keys = Object.keys(dict).sort((a, b) => b.length - a.length);
  let out = text;
  for (const key of keys) {
    const value = dict[key]!;
    out = out.replaceAll(key, value);
  }
  return out;
}

export function localizeFisicaElectronicaLatexText(latex: string, locale: AppLocale): string {
  if (locale === 'es') return latex;
  const dict = MAPS[locale];
  return latex.replace(/\\text\{([^}]*)\}/g, (_all, inner: string) => `\\text{${applyMap(inner, dict)}}`);
}

export function localizeFisicaElectronicaVariables(
  variables: string,
  locale: AppLocale,
  phraseDict?: Record<string, string>,
): string {
  if (locale === 'es') return variables;
  if (phraseDict?.[variables] && phraseDict[variables] !== variables) return phraseDict[variables]!;
  return localizeFisicaElectronicaLatexText(variables, locale);
}
