export const SITE_NAME = 'Formulario universitario';
export const SITE_TAGLINE = 'Cálculo II y Física Básica — fórmulas para consulta';
export const SITE_DESCRIPTION =
  'Formulario en línea multi-materia: Cálculo Integral y Física Básica universitaria, con búsqueda y renderizado LaTeX.';

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}
