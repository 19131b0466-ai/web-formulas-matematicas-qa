export const SITE_NAME = 'Formulario de Cálculo II';
export const SITE_TAGLINE = 'Cálculo Integral — fórmulas, métodos y aplicaciones';
export const SITE_DESCRIPTION =
  'Formulario en línea de Cálculo II: antiderivadas, técnicas de integración, series, aplicaciones y guía de métodos.';

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}
