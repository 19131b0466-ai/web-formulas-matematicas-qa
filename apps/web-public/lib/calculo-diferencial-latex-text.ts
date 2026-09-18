import type { AppLocale } from '@/i18n/routing';

/** Spanish \\text{...} fragments in formulas-calculo-diferencial.md → locale. Longest keys first at runtime. */
const EN: Record<string, string> = {
  'Para ': 'For ',
  'para ': 'for ',
  ' está definido': ' is defined',
  ' es continua en ': ' is continuous at ',
  ' alcanza todo valor entre ': ' attains every value between ',
  'Discontinuidad removible en ': 'Removable discontinuity at ',
  ' no definido': ' not defined',
  'Discontinuidad de salto en ': 'Jump discontinuity at ',
  'Discontinuidad infinita en ': 'Infinite discontinuity at ',
  ' continuas en ': ' are continuous at ',
  ' continua en ': ' is continuous at ',
  ' tiene máximo y mínimo absolutos en ': ' attains absolute maximum and minimum on ',
  ' diferenciable en ': ' is differentiable at ',
  ' existe (finito)': ' exists (finite)',
  ' existe ': ' exists ',
  ' es punto crítico': ' is a critical point',
  ' tiene mínimo local en ': ' has a local minimum at ',
  ' tiene máximo local en ': ' has a local maximum at ',
  ' máximo local en ': ' local maximum at ',
  ' mínimo local en ': ' local minimum at ',
  ' cambia de signo en ': ' changes sign at ',
  ' punto de inflexión': ' inflection point',
  ' creciente en ': ' increasing on ',
  ' decreciente en ': ' decreasing on ',
  ' estrictamente creciente en ': ' strictly increasing on ',
  ' estrictamente decreciente en ': ' strictly decreasing on ',
  ' cóncava hacia arriba en ': ' concave up on ',
  ' cóncava hacia abajo en ': ' concave down on ',
  ' constante en ': ' constant on ',
  ' entre ': ' between ',
  ' y ': ' and ',
  ' cuando ': ' when ',
  'cuando ': 'when ',
  ' o no existe, y ': ' or does not exist, and ',
  ' o ': ' or ',
  ' en ': ' on ',
  ' a ': ' to ',
  ' si ': ' if ',
  'si ': 'if ',
  'Dominio': 'Domain',
  'asíntotas': 'asymptotes',
  'asíntota horizontal': 'horizontal asymptote',
  'asíntota oblicua': 'oblique asymptote',
  'asíntota vertical de ': 'vertical asymptote of ',
  'combinar algebraicamente o usar conjugados/logaritmos': 'combine algebraically or use conjugates/logarithms',
  'esquema': 'sketch',
  'intersecciones': 'intercepts',
  'usar ': 'use ',
  ' no existe': ' does not exist',
  ' cambia de ': ' changes from ',
  'derivables en un entorno perforado de ': 'differentiable on a punctured neighborhood of ',
  'derivables en un entorno de ': 'differentiable on a neighborhood of ',
  ' en ese entorno': ' on that neighborhood',
  'existe (finito o ': 'exists (finite or ',
  'existe y es continua en el intervalo abierto entre ': 'exists and is continuous on the open interval between ',
};

const DE: Record<string, string> = {
  'Para ': 'Für ',
  'para ': 'für ',
  ' está definido': ' ist definiert',
  ' es continua en ': ' ist stetig in ',
  ' alcanza todo valor entre ': ' nimmt jeden Wert zwischen ',
  'Discontinuidad removible en ': 'Hebbare Unstetigkeit in ',
  ' no definido': ' nicht definiert',
  'Discontinuidad de salto en ': 'Sprungunstetigkeit in ',
  'Discontinuidad infinita en ': 'Unendliche Unstetigkeit in ',
  ' continuas en ': ' sind stetig in ',
  ' continua en ': ' ist stetig in ',
  ' tiene máximo y mínimo absolutos en ': ' hat absolutes Maximum und Minimum auf ',
  ' diferenciable en ': ' ist differenzierbar in ',
  ' existe (finito)': ' existiert (endlich)',
  ' existe ': ' existiert ',
  ' es punto crítico': ' ist ein kritischer Punkt',
  ' tiene mínimo local en ': ' hat ein lokales Minimum in ',
  ' tiene máximo local en ': ' hat ein lokales Maximum in ',
  ' máximo local en ': ' lokales Maximum in ',
  ' mínimo local en ': ' lokales Minimum in ',
  ' cambia de signo en ': ' wechselt das Vorzeichen in ',
  ' punto de inflexión': ' Wendepunkt',
  ' creciente en ': ' wachsend auf ',
  ' decreciente en ': ' fallend auf ',
  ' estrictamente creciente en ': ' streng wachsend auf ',
  ' estrictamente decreciente en ': ' streng fallend auf ',
  ' cóncava hacia arriba en ': ' konvex auf ',
  ' cóncava hacia abajo en ': ' konkav auf ',
  ' constante en ': ' konstant auf ',
  ' entre ': ' zwischen ',
  ' y ': ' und ',
  ' cuando ': ' wenn ',
  'cuando ': 'wenn ',
  ' o no existe, y ': ' oder existiert nicht, und ',
  ' o ': ' oder ',
  ' en ': ' auf ',
  ' a ': ' zu ',
  ' si ': ' wenn ',
  'si ': 'wenn ',
  'Dominio': 'Definitionsbereich',
  'asíntotas': 'Asymptoten',
  'asíntota horizontal': 'horizontale Asymptote',
  'asíntota oblicua': 'schräge Asymptote',
  'asíntota vertical de ': 'vertikale Asymptote von ',
  'combinar algebraicamente o usar conjugados/logaritmos':
    'algebraisch kombinieren oder Konjugierte/Logarithmen verwenden',
  'esquema': 'Skizze',
  'intersecciones': 'Schnittpunkte',
  'usar ': 'verwende ',
  ' no existe': ' existiert nicht',
  ' cambia de ': ' wechselt von ',
  'derivables en un entorno perforado de ': 'differenzierbar in einer punktierten Umgebung von ',
  'derivables en un entorno de ': 'differenzierbar in einer Umgebung von ',
  ' en ese entorno': ' in dieser Umgebung',
  'existe (finito o ': 'existiert (endlich oder ',
  'existe y es continua en el intervalo abierto entre ':
    'existiert und ist stetig im offenen Intervall zwischen ',
};

const FR: Record<string, string> = {
  'Para ': 'Pour ',
  'para ': 'pour ',
  ' está definido': ' est défini',
  ' es continua en ': ' est continue en ',
  ' alcanza todo valor entre ': ' atteint toute valeur entre ',
  'Discontinuidad removible en ': 'Discontinuité amovible en ',
  ' no definido': ' non défini',
  'Discontinuidad de salto en ': 'Discontinuité par saut en ',
  'Discontinuidad infinita en ': 'Discontinuité infinie en ',
  ' continuas en ': ' sont continues en ',
  ' continua en ': ' est continue en ',
  ' tiene máximo y mínimo absolutos en ': ' atteint max et min absolus sur ',
  ' diferenciable en ': ' est dérivable en ',
  ' existe (finito)': ' existe (fini)',
  ' existe ': ' existe ',
  ' es punto crítico': ' est un point critique',
  ' tiene mínimo local en ': ' a un minimum local en ',
  ' tiene máximo local en ': ' a un maximum local en ',
  ' máximo local en ': ' maximum local en ',
  ' mínimo local en ': ' minimum local en ',
  ' cambia de signo en ': ' change de signe en ',
  ' punto de inflexión': " point d'inflexion",
  ' creciente en ': ' croissante sur ',
  ' decreciente en ': ' décroissante sur ',
  ' estrictamente creciente en ': ' strictement croissante sur ',
  ' estrictamente decreciente en ': ' strictement décroissante sur ',
  ' cóncava hacia arriba en ': ' convexe sur ',
  ' cóncava hacia abajo en ': ' concave sur ',
  ' constante en ': ' constante sur ',
  ' entre ': ' entre ',
  ' y ': ' et ',
  ' cuando ': ' quand ',
  'cuando ': 'quand ',
  ' o no existe, y ': " ou n'existe pas, et ",
  ' o ': ' ou ',
  ' en ': ' sur ',
  ' a ': ' à ',
  ' si ': ' si ',
  'si ': 'si ',
  'Dominio': 'Domaine',
  'asíntotas': 'asymptotes',
  'asíntota horizontal': 'asymptote horizontale',
  'asíntota oblicua': 'asymptote oblique',
  'asíntota vertical de ': 'asymptote verticale de ',
  'combinar algebraicamente o usar conjugados/logaritmos':
    'combiner algébriquement ou utiliser conjugués/logarithmes',
  'esquema': 'schéma',
  'intersecciones': 'intersections',
  'usar ': 'utiliser ',
  ' no existe': " n'existe pas",
  ' cambia de ': ' passe de ',
  'derivables en un entorno perforado de ': 'dérivables dans un voisinage épointé de ',
  'derivables en un entorno de ': 'dérivables dans un voisinage de ',
  ' en ese entorno': ' dans ce voisinage',
  'existe (finito o ': 'existe (fini ou ',
  'existe y es continua en el intervalo abierto entre ':
    "existe et est continue sur l'intervalle ouvert entre ",
};

const IT: Record<string, string> = {
  'Para ': 'Per ',
  'para ': 'per ',
  ' está definido': ' è definito',
  ' es continua en ': ' è continua in ',
  ' alcanza todo valor entre ': ' assume ogni valore tra ',
  'Discontinuidad removible en ': 'Discontinuità rimovibile in ',
  ' no definido': ' non definito',
  'Discontinuidad de salto en ': 'Discontinuità a salto in ',
  'Discontinuidad infinita en ': 'Discontinuità infinita in ',
  ' continuas en ': ' sono continue in ',
  ' continua en ': ' è continua in ',
  ' tiene máximo y mínimo absolutos en ': ' ha massimo e minimo assoluti su ',
  ' diferenciable en ': ' è derivabile in ',
  ' existe (finito)': ' esiste (finito)',
  ' existe ': ' esiste ',
  ' es punto crítico': ' è un punto critico',
  ' tiene mínimo local en ': ' ha un minimo locale in ',
  ' tiene máximo local en ': ' ha un massimo locale in ',
  ' máximo local en ': ' massimo locale in ',
  ' mínimo local en ': ' minimo locale in ',
  ' cambia de signo en ': ' cambia segno in ',
  ' punto de inflexión': ' punto di flesso',
  ' creciente en ': ' crescente su ',
  ' decreciente en ': ' decrescente su ',
  ' estrictamente creciente en ': ' strettamente crescente su ',
  ' estrictamente decreciente en ': ' strettamente decrescente su ',
  ' cóncava hacia arriba en ': ' concava verso l\'alto su ',
  ' cóncava hacia abajo en ': ' concava verso il basso su ',
  ' constante en ': ' costante su ',
  ' entre ': ' tra ',
  ' y ': ' e ',
  ' cuando ': ' quando ',
  'cuando ': 'quando ',
  ' o no existe, y ': ' o non esiste, e ',
  ' o ': ' o ',
  ' en ': ' su ',
  ' a ': ' a ',
  ' si ': ' se ',
  'si ': 'se ',
  'Dominio': 'Dominio',
  'asíntotas': 'asintoti',
  'asíntota horizontal': 'asintoto orizzontale',
  'asíntota oblicua': 'asintoto obliquo',
  'asíntota vertical de ': 'asintoto verticale di ',
  'combinar algebraicamente o usar conjugados/logaritmos':
    'combinare algebricamente o usare coniugati/logaritmi',
  'esquema': 'schema',
  'intersecciones': 'intersezioni',
  'usar ': 'usa ',
  ' no existe': ' non esiste',
  ' cambia de ': ' passa da ',
  'derivables en un entorno perforado de ': 'derivabili in un intorno forato di ',
  'derivables en un entorno de ': 'derivabili in un intorno di ',
  ' en ese entorno': ' in tale intorno',
  'existe (finito o ': 'esiste (finito o ',
  'existe y es continua en el intervalo abierto entre ':
    "esiste ed è continua nell'intervallo aperto tra ",
};

const PT: Record<string, string> = {
  'Para ': 'Para ',
  'para ': 'para ',
  ' está definido': ' está definido',
  ' es continua en ': ' é contínua em ',
  ' alcanza todo valor entre ': ' atinge todo valor entre ',
  'Discontinuidad removible en ': 'Descontinuidade removível em ',
  ' no definido': ' não definido',
  'Discontinuidad de salto en ': 'Descontinuidade de salto em ',
  'Discontinuidad infinita en ': 'Descontinuidade infinita em ',
  ' continuas en ': ' são contínuas em ',
  ' continua en ': ' é contínua em ',
  ' tiene máximo y mínimo absolutos en ': ' tem máximo e mínimo absolutos em ',
  ' diferenciable en ': ' é diferenciável em ',
  ' existe (finito)': ' existe (finito)',
  ' existe ': ' existe ',
  ' es punto crítico': ' é ponto crítico',
  ' tiene mínimo local en ': ' tem mínimo local em ',
  ' tiene máximo local en ': ' tem máximo local em ',
  ' máximo local en ': ' máximo local em ',
  ' mínimo local en ': ' mínimo local em ',
  ' cambia de signo en ': ' muda de sinal em ',
  ' punto de inflexión': ' ponto de inflexão',
  ' creciente en ': ' crescente em ',
  ' decreciente en ': ' decrescente em ',
  ' estrictamente creciente en ': ' estritamente crescente em ',
  ' estrictamente decreciente en ': ' estritamente decrescente em ',
  ' cóncava hacia arriba en ': ' côncava para cima em ',
  ' cóncava hacia abajo en ': ' côncava para baixo em ',
  ' constante en ': ' constante em ',
  ' entre ': ' entre ',
  ' y ': ' e ',
  ' cuando ': ' quando ',
  'cuando ': 'quando ',
  ' o no existe, y ': ' ou não existe, e ',
  ' o ': ' ou ',
  ' en ': ' em ',
  ' a ': ' a ',
  ' si ': ' se ',
  'si ': 'se ',
  'Dominio': 'Domínio',
  'asíntotas': 'assíntotas',
  'asíntota horizontal': 'assíntota horizontal',
  'asíntota oblicua': 'assíntota oblíqua',
  'asíntota vertical de ': 'assíntota vertical de ',
  'combinar algebraicamente o usar conjugados/logaritmos':
    'combinar algebricamente ou usar conjugados/logaritmos',
  'esquema': 'esquema',
  'intersecciones': 'interseções',
  'usar ': 'usar ',
  ' no existe': ' não existe',
  ' cambia de ': ' muda de ',
  'derivables en un entorno perforado de ': 'deriváveis em uma vizinhança perfurada de ',
  'derivables en un entorno de ': 'deriváveis em uma vizinhança de ',
  ' en ese entorno': ' nessa vizinhança',
  'existe (finito o ': 'existe (finito ou ',
  'existe y es continua en el intervalo abierto entre ':
    'existe e é contínua no intervalo aberto entre ',
};

const MAPS: Partial<Record<AppLocale, Record<string, string>>> = {
  en: EN,
  de: DE,
  fr: FR,
  it: IT,
  pt: PT,
};

const VARIABLE_MEANINGS: Record<string, Partial<Record<AppLocale, string>>> = {
  'Variable independiente': {
    en: 'Independent variable',
    de: 'Unabhängige Variable',
    fr: 'Variable indépendante',
    it: 'Variabile indipendente',
    pt: 'Variável independente',
  },
  'Punto o constante real': {
    en: 'Point or real constant',
    de: 'Punkt oder reelle Konstante',
    fr: 'Point ou constante réelle',
    it: 'Punto o costante reale',
    pt: 'Ponto ou constante real',
  },
  'Función': {
    en: 'Function',
    de: 'Funktion',
    fr: 'Fonction',
    it: 'Funzione',
    pt: 'Função',
  },
  'Segunda función o composición interna': {
    en: 'Second function or inner composition',
    de: 'Zweite Funktion oder innere Verkettung',
    fr: 'Deuxième fonction ou composition interne',
    it: 'Seconda funzione o composizione interna',
    pt: 'Segunda função ou composição interna',
  },
  'Derivada de \\(f\\)': {
    en: 'Derivative of \\(f\\)',
    de: 'Ableitung von \\(f\\)',
    fr: 'Dérivée de \\(f\\)',
    it: 'Derivata di \\(f\\)',
    pt: 'Derivada de \\(f\\)',
  },
  'Diferencial de \\(y\\)': {
    en: 'Differential of \\(y\\)',
    de: 'Differential von \\(y\\)',
    fr: 'Différentielle de \\(y\\)',
    it: 'Differenziale di \\(y\\)',
    pt: 'Diferencial de \\(y\\)',
  },
  'Diferencial de \\(x\\)': {
    en: 'Differential of \\(x\\)',
    de: 'Differential von \\(x\\)',
    fr: 'Différentielle de \\(x\\)',
    it: 'Differenziale di \\(x\\)',
    pt: 'Diferencial de \\(x\\)',
  },
  'Diferencial de \\(u\\)': {
    en: 'Differential of \\(u\\)',
    de: 'Differential von \\(u\\)',
    fr: 'Différentielle de \\(u\\)',
    it: 'Differenziale di \\(u\\)',
    pt: 'Diferencial de \\(u\\)',
  },
  'Orden de derivada o exponente': {
    en: 'Derivative order or exponent',
    de: 'Ableitungsordnung oder Exponent',
    fr: 'Ordre de dérivée ou exposant',
    it: 'Ordine di derivata o esponente',
    pt: 'Ordem de derivada ou expoente',
  },
  'Segunda derivada de \\(f\\)': {
    en: 'Second derivative of \\(f\\)',
    de: 'Zweite Ableitung von \\(f\\)',
    fr: 'Dérivée seconde de \\(f\\)',
    it: 'Seconda derivata di \\(f\\)',
    pt: 'Segunda derivada de \\(f\\)',
  },
  'Valor del límite': {
    en: 'Limit value',
    de: 'Grenzwert',
    fr: 'Valeur de la limite',
    it: 'Valore del limite',
    pt: 'Valor do limite',
  },
  'Variable dependiente': {
    en: 'Dependent variable',
    de: 'Abhängige Variable',
    fr: 'Variable dépendante',
    it: 'Variabile dipendente',
    pt: 'Variável dependente',
  },
  'Constante real': {
    en: 'Real constant',
    de: 'Reelle Konstante',
    fr: 'Constante réelle',
    it: 'Costante reale',
    pt: 'Constante real',
  },
  'Base del logaritmo natural': {
    en: 'Base of the natural logarithm',
    de: 'Basis des natürlichen Logarithmus',
    fr: 'Base du logarithme naturel',
    it: 'Base del logaritmo naturale',
    pt: 'Base do logaritmo natural',
  },
  'Logaritmo natural': {
    en: 'Natural logarithm',
    de: 'Natürlicher Logarithmus',
    fr: 'Logarithme naturel',
    it: 'Logaritmo naturale',
    pt: 'Logaritmo natural',
  },
};

const SORTED_KEYS_CACHE = new Map<AppLocale, string[]>();

function sortedKeys(locale: AppLocale): string[] {
  const cached = SORTED_KEYS_CACHE.get(locale);
  if (cached) return cached;
  const map = MAPS[locale] ?? EN;
  const keys = Object.keys(map).sort((a, b) => b.length - a.length);
  SORTED_KEYS_CACHE.set(locale, keys);
  return keys;
}

function translateTextFragment(inner: string, locale: AppLocale): string {
  const map = MAPS[locale] ?? EN;
  const exact = map[inner] ?? map[inner.trim()];
  if (exact !== undefined) return exact;
  let out = inner;
  for (const key of sortedKeys(locale)) {
    if (!out.includes(key)) continue;
    out = out.split(key).join(map[key]!);
  }
  return out;
}

export function localizeCalculoDiferencialLatexText(latex: string, locale: AppLocale): string {
  if (locale === 'es') return latex;
  return latex.replace(/\\text\{([^}]*)\}/g, (match, inner: string) => {
    const translated = translateTextFragment(inner, locale);
    return translated !== inner ? `\\text{${translated}}` : match;
  });
}

export function localizeCalculoDiferencialVariables(
  variables: string,
  locale: AppLocale,
): string {
  if (locale === 'es') return variables;
  return variables.replace(/([^:;]+):\s*([^;]+)/g, (full, symbol: string, meaning: string) => {
    const trimmed = meaning.trim();
    const localized = VARIABLE_MEANINGS[trimmed]?.[locale];
    return localized ? `${symbol}: ${localized}` : full;
  });
}

/** Patterns that indicate corrupted partial translation (QA regression guard). */
export const CORRUPT_LATEX_PATTERNS = [/orr/i, /oderder/i, /\bouu\b/i, /si el cociente/i];

export function hasCorruptLocalizedLatex(latex: string): boolean {
  return CORRUPT_LATEX_PATTERNS.some((re) => re.test(latex));
}
