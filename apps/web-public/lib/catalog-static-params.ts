import { SUBJECT_SLUGS, isSubjectSlug, type SubjectSlug } from './subjects';

/**
 * One real id per subject so `generateStaticParams` is never empty.
 * Remaining formulas are created on the first request (`dynamicParams`).
 */
export const SEED_FORMULA_ID: Record<SubjectSlug, string> = {
  'calculo-diferencial': 'DIF-001',
  'calculo-ii': 'INT-022',
  'fisica-basica': 'VEC-001',
  'fisica-electronica': 'DIV-001',
  algebra: 'ALG-FND-001',
};

/** One real section slug per subject. Same rule as the formula seeds. */
export const SEED_SECTION_SLUG: Record<SubjectSlug, string> = {
  'calculo-diferencial': 'notacion-funciones',
  'calculo-ii': 'notacion-dominios',
  'fisica-basica': 'vectores',
  'fisica-electronica': 'mapa-prerrequisitos',
  algebra: 'numeros-propiedades',
};

export function subjectStaticParams() {
  return SUBJECT_SLUGS.map((subject) => ({ subject }));
}

export function formulaStaticParams(subject: string | undefined) {
  if (subject && isSubjectSlug(subject)) {
    return [{ id: SEED_FORMULA_ID[subject] }];
  }
  return SUBJECT_SLUGS.map((slug) => ({ id: SEED_FORMULA_ID[slug] }));
}

export function sectionStaticParams(subject: string | undefined) {
  if (subject && isSubjectSlug(subject)) {
    return [{ slug: SEED_SECTION_SLUG[subject] }];
  }
  return SUBJECT_SLUGS.map((slug) => ({ slug: SEED_SECTION_SLUG[slug] }));
}

/**
 * One real appendix per subject that publishes one.
 * Subjects without an appendix still return a slug so the array is never empty;
 * that seed resolves to notFound and real slugs stay on-demand.
 */
export const SEED_APPENDIX_SLUG: Record<SubjectSlug, string> = {
  'calculo-diferencial': 'apendice-tabla-derivadas',
  'calculo-ii': 'apendice-antiderivadas',
  'fisica-basica': 'apendice-none',
  'fisica-electronica': 'apendice-none',
  algebra: 'apendice-none',
};

/** One published topic hub per subject. */
export const SEED_TOPIC_SLUG: Record<SubjectSlug, string> = {
  'calculo-diferencial': 'regla-cadena',
  'calculo-ii': 'integrales-trigonometricas',
  'fisica-basica': 'leyes-de-newton',
  'fisica-electronica': 'divisores-thevenin',
  algebra: 'normas-matriciales',
};

export function appendixStaticParams(subject: string | undefined) {
  if (subject && isSubjectSlug(subject)) {
    return [{ slug: SEED_APPENDIX_SLUG[subject] }];
  }
  return SUBJECT_SLUGS.map((slug) => ({ slug: SEED_APPENDIX_SLUG[slug] }));
}

export function topicStaticParams(subject: string | undefined) {
  if (subject && isSubjectSlug(subject)) {
    return [{ slug: SEED_TOPIC_SLUG[subject] }];
  }
  return SUBJECT_SLUGS.map((slug) => ({ slug: SEED_TOPIC_SLUG[slug] }));
}
