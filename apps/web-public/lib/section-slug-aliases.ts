/** Canonical algebra chapter number → slug (mirrors content-parser overrides). */
const ALGEBRA_NUMBERED_SLUGS: Record<string, string> = {
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

/**
 * Resolve mistaken numbered URLs like `11-polinomios` → `polinomios`.
 * Returns the canonical slug, or the original if no alias applies.
 */
export function resolveSectionSlugAlias(subject: string, slug: string): string {
  if (subject !== 'algebra') return slug;
  const m = slug.match(/^(\d{1,2})-(.+)$/);
  if (!m) return slug;
  const canonical = ALGEBRA_NUMBERED_SLUGS[m[1]!];
  return canonical ?? slug;
}
