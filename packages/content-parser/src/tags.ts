const SECTION_TAGS: Record<string, string[]> = {
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
];

export function tagsForSection(slug: string): string[] {
  return SECTION_TAGS[slug] ?? [];
}

export function inferTags(sectionSlug: string, text: string, blockType: string): string[] {
  const tags = new Set<string>(tagsForSection(sectionSlug));
  tags.add(sectionSlug);

  if (blockType === 'formula') {
    if (tags.has('fisica')) tags.add('formula-fisica');
    else tags.add('antiderivada');
  }
  if (blockType === 'strategy') tags.add('estrategia');
  if (blockType === 'note') tags.add('restriccion-dominio');

  for (const [pattern, tag] of KEYWORD_TAGS) {
    if (pattern.test(text)) tags.add(tag);
  }

  return [...tags].sort();
}

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
