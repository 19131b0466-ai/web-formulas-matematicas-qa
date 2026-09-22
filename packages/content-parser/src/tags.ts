const SECTION_TAGS: Record<string, string[]> = {
  // Cálculo Diferencial
  'notacion-funciones': ['notacion', 'dominio', 'funciones', 'calculo-diferencial'],
  limites: ['limite', 'calculo-diferencial'],
  continuidad: ['continuidad', 'calculo-diferencial'],
  'derivada-geometrica': ['derivada', 'calculo-diferencial'],
  'reglas-derivacion': ['derivada', 'regla', 'calculo-diferencial'],
  'derivadas-superiores': ['derivada', 'calculo-diferencial'],
  'teorema-valor-medio': ['derivada', 'teorema', 'calculo-diferencial'],
  'analisis-funciones': ['derivada', 'analisis', 'calculo-diferencial'],
  optimizacion: ['derivada', 'optimizacion', 'calculo-diferencial'],
  'aproximaciones-diferenciales': ['derivada', 'diferencial', 'calculo-diferencial'],
  'series-taylor': ['derivada', 'taylor', 'calculo-diferencial'],
  lhopital: ['limite', 'derivada', 'calculo-diferencial'],
  'funciones-implicitas': ['derivada', 'implicita', 'calculo-diferencial'],
  'tasas-relacionadas': ['derivada', 'aplicacion', 'calculo-diferencial'],
  'graficas-asintotas': ['derivada', 'grafica', 'calculo-diferencial'],
  'apendice-tabla-derivadas': ['derivada', 'tabla', 'calculo-diferencial', 'formula-derivada'],
  // Cálculo II
  'notacion-dominios': ['notacion', 'dominio', 'restriccion-dominio'],
  'integral-indefinida': ['antiderivada', 'propiedad', 'integral-indefinida'],
  'integral-definida-tfc': ['integral-definida', 'teorema-fundamental', 'propiedad'],
  sustitucion: ['sustitucion', 'tecnica-fundamental'],
  'integracion-por-partes': ['por-partes', 'tecnica-fundamental', 'reduccion'],
  'integrales-trigonometricas': ['trigonometrica', 'identidad'],
  'sustitucion-trigonometrica': ['sustitucion-trigonometrica', 'radicales'],
  'fracciones-parciales': ['fracciones-parciales', 'funciones-racionales'],
  'integrales-impropias': ['integral-impropia', 'convergencia'],
  'aplicaciones-integral': ['aplicacion', 'area', 'volumen'],
  'integracion-numerica': ['integracion-numerica', 'aproximacion'],
  'curvas-parametricas': ['parametricas', 'aplicacion'],
  'coordenadas-polares': ['polares', 'aplicacion'],
  'sucesiones-series': ['series', 'criterio-convergencia'],
  'series-potencias-taylor': ['series', 'taylor', 'maclaurin'],
  'ecuaciones-diferenciales': ['ecuaciones-diferenciales'],
  'guia-metodos': ['guia', 'estrategia'],
  'apendice-antiderivadas': ['antiderivada', 'tabla'],
  'apendice-equivalencias': ['equivalencia', 'antiderivada'],
  // Física Básica
  vectores: ['vectores', 'fisica'],
  'cinematica-1d': ['cinematica', 'fisica'],
  'movimiento-2d-3d': ['cinematica', 'proyectiles', 'fisica'],
  'leyes-de-newton': ['newton', 'fuerzas', 'fisica'],
  'movimiento-circular': ['circular', 'fisica'],
  'trabajo-energia-potencia': ['energia', 'trabajo', 'fisica'],
  'momento-impulso-colisiones': ['momento', 'colisiones', 'fisica'],
  rotacion: ['rotacion', 'fisica'],
  'equilibrio-elasticidad': ['equilibrio', 'elasticidad', 'fisica'],
  gravitacion: ['gravitacion', 'fisica'],
  'mecanica-de-fluidos': ['fluidos', 'fisica'],
  oscilaciones: ['oscilaciones', 'mas', 'fisica'],
  ondas: ['ondas', 'fisica'],
  sonido: ['sonido', 'ondas', 'fisica'],
  termodinamica: ['termodinamica', 'fisica'],
  'electricidad-basica': ['electricidad', 'fisica'],
  'constantes-fisicas': ['constantes', 'fisica'],
  'guia-enfoque': ['guia', 'estrategia', 'fisica'],
  // Física Electrónica
  'mapa-prerrequisitos': ['electronica', 'fisica', 'prerrequisitos'],
  'redes-resistivas': ['electronica', 'fisica', 'circuitos', 'divisores'],
  'capacitores-inductores': ['electronica', 'fisica', 'circuitos', 'reactancia'],
  'transitorios-primer-orden': ['electronica', 'fisica', 'transitorios'],
  'rlc-segundo-orden': ['electronica', 'fisica', 'rlc'],
  'ca-fasores': ['electronica', 'fisica', 'fasores', 'ca'],
  'potencia-ca-resonancia': ['electronica', 'fisica', 'potencia', 'resonancia'],
  filtros: ['electronica', 'fisica', 'filtros'],
  transformadores: ['electronica', 'fisica', 'transformadores'],
  'diodos-semiconductores': ['electronica', 'fisica', 'diodos'],
  bjt: ['electronica', 'fisica', 'bjt', 'transistores'],
  fet: ['electronica', 'fisica', 'fet', 'transistores'],
  'amplificadores-opamp': ['electronica', 'fisica', 'opamp', 'amplificadores'],
  'familias-logicas': ['electronica', 'fisica', 'digital', 'logica'],
  'logica-combinacional': ['electronica', 'fisica', 'digital', 'combinacional'],
  'logica-secuencial': ['electronica', 'fisica', 'digital', 'secuencial'],
  'conversion-ad-da': ['electronica', 'fisica', 'digital', 'conversion'],
  // Álgebra
  'numeros-propiedades': ['algebra', 'fundamentos'],
  'potencias-radicales': ['algebra', 'potencias'],
  'expresiones-algebraicas': ['algebra', 'polinomios'],
  'productos-notables': ['algebra', 'identidades'],
  factorizacion: ['algebra', 'factorizacion'],
  'expresiones-racionales': ['algebra', 'fracciones-parciales'],
  ecuaciones: ['algebra', 'ecuaciones'],
  inecuaciones: ['algebra', 'inecuaciones'],
  'sistemas-ecuaciones': ['algebra', 'sistemas'],
  funciones: ['algebra', 'funciones'],
  polinomios: ['algebra', 'polinomios'],
  'exponenciales-logaritmos': ['algebra', 'logaritmos'],
  'numeros-complejos': ['algebra', 'complejos'],
  'sucesiones-series-finitas': ['algebra', 'sucesiones'],
  'vectores-algebra': ['algebra', 'vectores', 'lineal'],
  matrices: ['algebra', 'matrices', 'lineal'],
  'determinantes-inversas': ['algebra', 'determinantes', 'lineal'],
  'espacios-vectoriales': ['algebra', 'espacios-vectoriales', 'lineal'],
  'transformaciones-lineales': ['algebra', 'transformaciones', 'lineal'],
  'valores-propios': ['algebra', 'eigen', 'lineal'],
  'ortogonalidad-proyecciones': ['algebra', 'ortogonalidad', 'lineal'],
  'minimos-cuadrados': ['algebra', 'minimos-cuadrados', 'lineal'],
  'descomposiciones-matrices': ['algebra', 'descomposiciones', 'lineal'],
  'normas-condicionamiento': ['algebra', 'normas', 'lineal'],
  'algebra-booleana': ['algebra', 'booleana', 'cs'],
  'aritmetica-modular': ['algebra', 'modular', 'cs'],
  'estructuras-algebraicas': ['algebra', 'estructuras', 'cs'],
  'codigos-lineales': ['algebra', 'codigos', 'cs'],
  'mapas-relaciones': ['algebra', 'relaciones'],
  'fronteras-materias': ['algebra', 'fronteras'],
};

const KEYWORD_TAGS: Array<[RegExp, string]> = [
  [/\bpor partes\b/i, 'por-partes'],
  [/\bsustituci[oó]n\b/i, 'sustitucion'],
  [/\bfracciones parciales\b/i, 'fracciones-parciales'],
  [/\breducci[oó]n\b/i, 'reduccion'],
  [/\bantiderivad/i, 'antiderivada'],
  [/\bimpropia/i, 'integral-impropia'],
  [/\bconverg/i, 'criterio-convergencia'],
  [/\bTaylor\b/i, 'taylor'],
  [/\bMaclaurin\b/i, 'maclaurin'],
  [/\bdominio\b/i, 'restriccion-dominio'],
  [/\bLIATE\b/i, 'por-partes'],
  [/\bproyectil/i, 'proyectiles'],
  [/\bNewton\b/i, 'newton'],
  [/\benerg[ií]a\b/i, 'energia'],
  [/\bmomento\b/i, 'momento'],
  [/\bBernoulli\b/i, 'fluidos'],
  [/\bOhm\b/i, 'electricidad'],
  [/\bKirchhoff\b/i, 'electricidad'],
  [/\bTh[eé]venin\b/i, 'thevenin'],
  [/\bfasor/i, 'fasores'],
  [/\bop-?amp|operacional/i, 'opamp'],
  [/\bflip-?flop\b/i, 'secuencial'],
  [/\bl[ií]mite\b/i, 'limite'],
  [/\bderivad/i, 'derivada'],
  [/\bcontinu/i, 'continuidad'],
  [/\bL'H[oô]pital\b/i, 'lhopital'],
  [/\boptimiz/i, 'optimizacion'],
];

function isDerivativeFormulaSection(slug: string): boolean {
  if (slug.startsWith('a-') || slug.startsWith('apendice-tabla-derivadas')) return true;
  const prefixes = [
    'reglas-derivacion',
    'derivadas-superiores',
    'derivada-geometrica',
    'aproximaciones-diferenciales',
    'series-taylor',
    'funciones-implicitas',
    'tasas-relacionadas',
  ];
  return prefixes.some((p) => slug === p || slug.startsWith(`${p}-`));
}

function isCalculoDiferencialSection(slug: string): boolean {
  if (slug.startsWith('a-') || slug.startsWith('apendice-tabla-derivadas')) return true;
  const prefixes = [
    'notacion',
    'limites',
    'continuidad',
    'derivada',
    'reglas',
    'teorema',
    'analisis',
    'optimizacion',
    'aproximaciones',
    'series',
    'lhopital',
    'funciones',
    'tasas',
    'graficas',
    'guia-metodos',
  ];
  return prefixes.some((p) => slug === p || slug.startsWith(`${p}-`));
}

export function tagsForSection(slug: string): string[] {
  const direct = SECTION_TAGS[slug];
  if (direct) return direct;
  // Subsections inherit chapter tags: continuidad-definicion → continuidad
  for (const [parentSlug, tags] of Object.entries(SECTION_TAGS)) {
    if (slug === parentSlug || slug.startsWith(`${parentSlug}-`)) return tags;
  }
  if (isCalculoDiferencialSection(slug)) {
    return SECTION_TAGS['apendice-tabla-derivadas'] ?? ['derivada', 'tabla', 'calculo-diferencial'];
  }
  return [];
}

export function inferTags(sectionSlug: string, text: string, blockType: string): string[] {
  const tags = new Set<string>(tagsForSection(sectionSlug));
  tags.add(sectionSlug);

  if (blockType === 'formula') {
    if (tags.has('fisica')) tags.add('formula-fisica');
    if (tags.has('electronica')) tags.add('formula-electronica');
    if (tags.has('fisica') || tags.has('electronica')) {
      /* physics-family formulas are neither antiderivatives nor derivatives */
    } else if (tags.has('algebra')) tags.add('formula-algebra');
    else if (isDerivativeFormulaSection(sectionSlug)) {
      tags.add('formula-derivada');
      tags.delete('antiderivada');
    } else if (isCalculoDiferencialSection(sectionSlug) || tags.has('calculo-diferencial')) {
      tags.delete('antiderivada');
    } else tags.add('antiderivada');
  }
  if (blockType === 'strategy') tags.add('estrategia');
  if (blockType === 'note') tags.add('restriccion-dominio');

  for (const [pattern, tag] of KEYWORD_TAGS) {
    if (pattern.test(text)) tags.add(tag);
  }

  if (tags.has('formula-derivada')) tags.delete('antiderivada');

  return [...tags].sort();
}

/** Canonical slug overrides for top-level sections — Cálculo Diferencial. */
export const DIFFERENTIAL_SECTION_SLUG_OVERRIDES: Record<string, string> = {
  '1': 'notacion-funciones',
  '2': 'limites',
  '3': 'continuidad',
  '4': 'derivada-geometrica',
  '5': 'reglas-derivacion',
  '6': 'derivadas-superiores',
  '7': 'teorema-valor-medio',
  '8': 'analisis-funciones',
  '9': 'optimizacion',
  '10': 'aproximaciones-diferenciales',
  '11': 'series-taylor',
  '12': 'lhopital',
  '13': 'funciones-implicitas',
  '14': 'tasas-relacionadas',
  '15': 'graficas-asintotas',
  '16': 'guia-metodos',
  A: 'apendice-tabla-derivadas',
};

/** Canonical slug overrides for top-level sections — Cálculo II. */
export const SECTION_SLUG_OVERRIDES: Record<string, string> = {
  '1': 'notacion-dominios',
  '2': 'integral-indefinida',
  '3': 'integral-definida-tfc',
  '4': 'sustitucion',
  '5': 'integracion-por-partes',
  '6': 'integrales-trigonometricas',
  '7': 'sustitucion-trigonometrica',
  '8': 'fracciones-parciales',
  '9': 'integrales-impropias',
  '10': 'aplicaciones-integral',
  '11': 'integracion-numerica',
  '12': 'curvas-parametricas',
  '13': 'coordenadas-polares',
  '14': 'sucesiones-series',
  '15': 'series-potencias-taylor',
  '16': 'ecuaciones-diferenciales',
  '17': 'guia-metodos',
  A: 'apendice-antiderivadas',
  B: 'apendice-equivalencias',
};

/** Canonical slug overrides for Física Básica chapters. */
export const PHYSICS_SECTION_SLUG_OVERRIDES: Record<string, string> = {
  '1': 'vectores',
  '2': 'cinematica-1d',
  '3': 'movimiento-2d-3d',
  '4': 'leyes-de-newton',
  '5': 'movimiento-circular',
  '6': 'trabajo-energia-potencia',
  '7': 'momento-impulso-colisiones',
  '8': 'rotacion',
  '9': 'equilibrio-elasticidad',
  '10': 'gravitacion',
  '11': 'mecanica-de-fluidos',
  '12': 'oscilaciones',
  '13': 'ondas',
  '14': 'sonido',
  '15': 'termodinamica',
  '16': 'electricidad-basica',
  '17': 'constantes-fisicas',
  '18': 'guia-enfoque',
};

/** Canonical slug overrides for Física Electrónica chapters. */
export const ELECTRONICS_SECTION_SLUG_OVERRIDES: Record<string, string> = {
  '1': 'mapa-prerrequisitos',
  '2': 'redes-resistivas',
  '3': 'capacitores-inductores',
  '4': 'transitorios-primer-orden',
  '5': 'rlc-segundo-orden',
  '6': 'ca-fasores',
  '7': 'potencia-ca-resonancia',
  '8': 'filtros',
  '9': 'transformadores',
  '10': 'diodos-semiconductores',
  '11': 'bjt',
  '12': 'fet',
  '13': 'amplificadores-opamp',
  '14': 'familias-logicas',
  '15': 'logica-combinacional',
  '16': 'logica-secuencial',
  '17': 'conversion-ad-da',
  '18': 'guia-enfoque',
};

/** Canonical slug overrides for Álgebra chapters. */
export const ALGEBRA_SECTION_SLUG_OVERRIDES: Record<string, string> = {
  '1': 'numeros-propiedades',
  '2': 'potencias-radicales',
  '3': 'expresiones-algebraicas',
  '4': 'productos-notables',
  '5': 'factorizacion',
  '6': 'expresiones-racionales',
  '7': 'ecuaciones',
  '8': 'inecuaciones',
  '9': 'sistemas-ecuaciones',
  '10': 'funciones',
  '11': 'polinomios',
  '12': 'exponenciales-logaritmos',
  '13': 'numeros-complejos',
  '14': 'sucesiones-series-finitas',
  '15': 'vectores-algebra',
  '16': 'matrices',
  '17': 'determinantes-inversas',
  '18': 'espacios-vectoriales',
  '19': 'transformaciones-lineales',
  '20': 'valores-propios',
  '21': 'ortogonalidad-proyecciones',
  '22': 'minimos-cuadrados',
  '23': 'descomposiciones-matrices',
  '24': 'normas-condicionamiento',
  '25': 'algebra-booleana',
  '26': 'aritmetica-modular',
  '27': 'estructuras-algebraicas',
  '28': 'codigos-lineales',
  '29': 'mapas-relaciones',
  '30': 'fronteras-materias',
};
