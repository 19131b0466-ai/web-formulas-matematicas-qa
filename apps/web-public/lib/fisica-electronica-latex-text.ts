import type { AppLocale } from '@/i18n/routing';

/** Exact inners of \text{...} (no substring splicing inside words). */
const TEXT_INNERS: Record<Exclude<AppLocale, 'es'>, Record<string, string>> = {
  en: {
    'grupos de ': 'groups of ',
    'grupos de': 'groups of',
    ' celdas': ' cells',
    celdas: 'cells',
    carga: 'charge',
    descarga: 'discharge',
    fasor: 'phasor',
    equivalente: 'equivalent',
    corte: 'cutoff',
    saturación: 'saturation',
    activa: 'active',
  },
  de: {
    'grupos de ': 'Gruppen von ',
    'grupos de': 'Gruppen von',
    ' celdas': ' Zellen',
    celdas: 'Zellen',
    carga: 'Ladung',
    descarga: 'Entladung',
    fasor: 'Zeiger',
    equivalente: 'äquivalent',
    corte: 'Sperrbereich',
    saturación: 'Sättigung',
    activa: 'aktiv',
  },
  fr: {
    'grupos de ': 'groupes de ',
    'grupos de': 'groupes de',
    ' celdas': ' cellules',
    celdas: 'cellules',
    carga: 'charge',
    descarga: 'décharge',
    fasor: 'phasor',
    equivalente: 'équivalent',
    corte: 'blocage',
    saturación: 'saturation',
    activa: 'active',
  },
  it: {
    'grupos de ': 'gruppi di ',
    'grupos de': 'gruppi di',
    ' celdas': ' celle',
    celdas: 'celle',
    carga: 'carica',
    descarga: 'scarica',
    fasor: 'fasore',
    equivalente: 'equivalente',
    corte: 'interdizione',
    saturación: 'saturazione',
    activa: 'attiva',
  },
  pt: {
    'grupos de ': 'grupos de ',
    'grupos de': 'grupos de',
    ' celdas': ' células',
    celdas: 'células',
    carga: 'carga',
    descarga: 'descarga',
    fasor: 'fasor',
    equivalente: 'equivalente',
    corte: 'corte',
    saturación: 'saturação',
    activa: 'ativa',
  },
};

const MATHRM_INNERS: Record<Exclude<AppLocale, 'es'>, Record<string, string>> = {
  en: { estado: 'state', corte: 'cutoff', saturación: 'saturation', activa: 'active' },
  de: { estado: 'Zustand', corte: 'Sperrbereich', saturación: 'Sättigung', activa: 'aktiv' },
  fr: { estado: 'état', corte: 'blocage', saturación: 'saturation', activa: 'active' },
  it: { estado: 'stato', corte: 'interdizione', saturación: 'saturazione', activa: 'attiva' },
  pt: { estado: 'estado', corte: 'corte', saturación: 'saturação', activa: 'ativa' },
};

const OPERATOR_INNERS: Record<Exclude<AppLocale, 'es'>, Record<string, string>> = {
  en: { índice: 'index' },
  de: { índice: 'Index' },
  fr: { índice: 'indice' },
  it: { índice: 'indice' },
  pt: { índice: 'índice' },
};

/** Full-formula overrides so Karnaugh never depends on substring translation. */
const FORMULA_OVERRIDES: Record<Exclude<AppLocale, 'es'>, Record<string, string>> = {
  en: {
    'F_{\\min}=\\sum\\text{grupos de }2^m\\text{ celdas}':
      'F_{\\min}=\\sum\\text{groups of }2^m\\text{ cells}',
  },
  de: {
    'F_{\\min}=\\sum\\text{grupos de }2^m\\text{ celdas}':
      'F_{\\min}=\\sum\\text{Gruppen von }2^m\\text{ Zellen}',
  },
  fr: {
    'F_{\\min}=\\sum\\text{grupos de }2^m\\text{ celdas}':
      'F_{\\min}=\\sum\\text{groupes de }2^m\\text{ cellules}',
  },
  it: {
    'F_{\\min}=\\sum\\text{grupos de }2^m\\text{ celdas}':
      'F_{\\min}=\\sum\\text{gruppi di }2^m\\text{ celle}',
  },
  pt: {
    'F_{\\min}=\\sum\\text{grupos de }2^m\\text{ celdas}':
      'F_{\\min}=\\sum\\text{grupos de }2^m\\text{ células}',
  },
};

function replaceCommandInners(
  latex: string,
  command: 'text' | 'mathrm' | 'operatorname',
  map: Record<string, string>,
): string {
  const re = new RegExp(`\\\\${command}\\{([^}]*)\\}`, 'g');
  return latex.replace(re, (all, inner: string) => {
    const exact = map[inner];
    if (exact !== undefined) return `\\${command}{${exact}}`;
    return all;
  });
}

export function localizeFisicaElectronicaLatexText(latex: string, locale: AppLocale): string {
  if (locale === 'es') return latex;
  for (const [from, to] of Object.entries(FORMULA_OVERRIDES[locale])) {
    if (latex.includes(from)) latex = latex.split(from).join(to);
  }
  latex = replaceCommandInners(latex, 'text', TEXT_INNERS[locale]);
  latex = replaceCommandInners(latex, 'mathrm', MATHRM_INNERS[locale]);
  latex = replaceCommandInners(latex, 'operatorname', OPERATOR_INNERS[locale]);
  return latex;
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
