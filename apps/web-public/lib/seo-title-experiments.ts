import type { AppLocale } from '@/i18n/routing';
import type { SubjectSlug } from '@/lib/subjects';

export type TitleVariantId = 'a' | 'b';

export type FormulaTitleExperiment = {
  formulaId: string;
  subject: SubjectSlug;
  /** Variant B concept override per locale (variant A uses default formulaSeoTitle). */
  variantB: Partial<Record<AppLocale, string>>;
  startedAt: string;
  notes?: string;
};

/**
 * Title A/B experiments for top GSC formulas.
 * Deploy variant B with env SEO_TITLE_EXPERIMENT_VARIANT=b, measure CTR in GSC after ~4 weeks.
 */
export const FORMULA_TITLE_EXPERIMENTS: FormulaTitleExperiment[] = [
  {
    formulaId: 'EQU-005',
    subject: 'fisica-basica',
    startedAt: '2026-09-14',
    variantB: {
      es: 'Módulo de Young: fórmula, unidades (Pa) y derivación',
      en: "Young's Modulus: formula, units (Pa) and derivation",
      fr: 'Module de Young : formule, unités (Pa) et dérivation',
      de: 'Elastizitätsmodul: Formel, Einheiten (Pa) und Herleitung',
      pt: 'Módulo de Young: fórmula, unidades (Pa) e derivação',
      it: 'Modulo di Young: formula, unità (Pa) e derivazione',
    },
  },
  {
    formulaId: 'FLU-002',
    subject: 'fisica-basica',
    startedAt: '2026-09-14',
    variantB: {
      es: 'Presión: fórmula P = F/A, unidades y ejemplos',
      en: 'Pressure Formula: P = F/A, units and worked examples',
      fr: 'Pression : formule P = F/A, unités et exemples',
      de: 'Druck: Formel P = F/A, Einheiten und Beispiele',
      pt: 'Pressão: fórmula P = F/A, unidades e exemplos',
      it: 'Pressione: formula P = F/A, unità ed esempi',
    },
  },
  {
    formulaId: 'NEW-003',
    subject: 'fisica-basica',
    startedAt: '2026-09-14',
    variantB: {
      es: 'Tercera ley de Newton: fórmula y ejemplos',
      en: "Newton's Third Law: formula and examples",
      fr: 'Troisième loi de Newton : formule et exemples',
      de: 'Drittes Newton-Gesetz: Formel und Beispiele',
      pt: 'Terceira lei de Newton: fórmula e exemplos',
      it: 'Terza legge di Newton: formula ed esempi',
    },
  },
  {
    formulaId: 'CIR-001',
    subject: 'fisica-basica',
    startedAt: '2026-09-14',
    variantB: {
      es: 'Desplazamiento angular: fórmula y definición',
      en: 'Angular Displacement: formula and definition',
    },
  },
  {
    formulaId: 'ELE-018',
    subject: 'fisica-basica',
    startedAt: '2026-09-14',
    variantB: {
      es: 'Ley de Ohm: fórmula V = IR y aplicaciones',
      en: "Ohm's Law: V = IR formula and applications",
    },
  },
  {
    formulaId: 'CIN-008',
    subject: 'fisica-basica',
    startedAt: '2026-09-14',
    variantB: {
      es: 'MRUA velocidad: fórmula v = v₀ + at',
      en: 'Uniformly Accelerated Motion: v = v₀ + at formula',
    },
  },
  {
    formulaId: 'ELE-009',
    subject: 'fisica-basica',
    startedAt: '2026-09-14',
    variantB: {
      es: 'Potencia eléctrica: fórmulas P = VI y variantes',
      en: 'Electrical Power: P = VI formula and variants',
    },
  },
  {
    formulaId: 'ELE-012',
    subject: 'fisica-basica',
    startedAt: '2026-09-14',
    variantB: {
      es: 'Capacitancia: fórmula C = Q/V y unidades',
      en: 'Capacitance: C = Q/V formula and units',
    },
  },
  {
    formulaId: 'GRA-003',
    subject: 'fisica-basica',
    startedAt: '2026-09-14',
    variantB: {
      es: 'Energía potencial gravitatoria: fórmula y ejemplos',
      en: 'Gravitational Potential Energy: formula and examples',
    },
  },
  {
    formulaId: 'ALG-NOR-001',
    subject: 'algebra',
    startedAt: '2026-09-14',
    variantB: {
      es: 'Norma matricial inducida: fórmula y definición',
      en: 'Induced Matrix Norm: formula and definition',
      fr: 'Norme matricielle induite : formule et définition',
    },
  },
];

export function activeTitleVariant(): TitleVariantId {
  const raw = process.env.SEO_TITLE_EXPERIMENT_VARIANT?.trim().toLowerCase();
  return raw === 'b' ? 'b' : 'a';
}

export function findTitleExperiment(
  subject: SubjectSlug,
  formulaId: string,
): FormulaTitleExperiment | undefined {
  const code = formulaId.trim().toUpperCase();
  return FORMULA_TITLE_EXPERIMENTS.find((e) => e.subject === subject && e.formulaId === code);
}

export type ResolvedFormulaTitle = {
  title: string;
  variant: TitleVariantId;
  experimentId?: string;
};
