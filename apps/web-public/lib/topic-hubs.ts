import { topicHubHref, topicsIndexHref, type SubjectSlug } from '@/lib/subjects';

export type TopicHubDefinition = {
  slug: string;
  subject: SubjectSlug;
  /** Key under the `topicHubs` message namespace (e.g. `youngModulus`). */
  messageKey: string;
  formulaIds: string[];
  sectionSlugs: string[];
};

export const TOPIC_HUBS: TopicHubDefinition[] = [
  {
    slug: 'modulo-young-elasticidad',
    subject: 'fisica-basica',
    messageKey: 'youngModulus',
    formulaIds: ['EQU-003', 'EQU-004', 'EQU-005', 'NEW-007'],
    sectionSlugs: [],
  },
  {
    slug: 'presion-y-fluidos',
    subject: 'fisica-basica',
    messageKey: 'pressureFluids',
    formulaIds: ['FLU-002', 'FLU-003', 'FLU-004', 'FLU-009', 'FLU-011'],
    sectionSlugs: ['mecanica-de-fluidos'],
  },
  {
    slug: 'leyes-de-newton',
    subject: 'fisica-basica',
    messageKey: 'newtonLaws',
    formulaIds: ['NEW-001', 'NEW-002', 'NEW-003', 'NEW-004'],
    sectionSlugs: ['leyes-de-newton'],
  },
  {
    slug: 'movimiento-circular',
    subject: 'fisica-basica',
    messageKey: 'circularMotion',
    formulaIds: ['CIR-001', 'CIR-002', 'CIR-003', 'CIR-005', 'ROT-002'],
    sectionSlugs: ['movimiento-circular', 'rotacion'],
  },
  {
    slug: 'electricidad-basica',
    subject: 'fisica-basica',
    messageKey: 'basicElectricity',
    formulaIds: ['ELE-006', 'ELE-009', 'ELE-012', 'ELE-018', 'ELE-019'],
    sectionSlugs: ['electricidad-basica'],
  },
  {
    slug: 'regla-cadena',
    subject: 'calculo-diferencial',
    messageKey: 'chainRule',
    formulaIds: ['DIF-054', 'DIF-055', 'DIF-051', 'DIF-053'],
    sectionSlugs: ['reglas-derivacion'],
  },
  {
    slug: 'limites-indeterminados',
    subject: 'calculo-diferencial',
    messageKey: 'indeterminateLimits',
    formulaIds: ['DIF-114', 'DIF-115', 'DIF-116', 'DIF-019'],
    sectionSlugs: ['lhopital', 'limites'],
  },
  {
    slug: 'optimizacion',
    subject: 'calculo-diferencial',
    messageKey: 'optimization',
    formulaIds: ['DIF-093', 'DIF-094', 'DIF-095', 'DIF-087'],
    sectionSlugs: ['optimizacion', 'analisis-funciones'],
  },
  {
    slug: 'teorema-valor-medio',
    subject: 'calculo-diferencial',
    messageKey: 'meanValueTheorem',
    formulaIds: ['DIF-081', 'DIF-082', 'DIF-083', 'DIF-084'],
    sectionSlugs: ['teorema-valor-medio'],
  },
  {
    slug: 'series-taylor',
    subject: 'calculo-diferencial',
    messageKey: 'taylorSeries',
    formulaIds: ['DIF-106', 'DIF-107', 'DIF-102', 'DIF-113'],
    sectionSlugs: ['series-taylor', 'aproximaciones-diferenciales'],
  },
  {
    slug: 'integrales-trigonometricas',
    subject: 'calculo-ii',
    messageKey: 'trigIntegrals',
    formulaIds: [],
    sectionSlugs: ['integrales-trigonometricas'],
  },
  {
    slug: 'teorema-fundamental-calculo',
    subject: 'calculo-ii',
    messageKey: 'fundamentalTheorem',
    formulaIds: [],
    sectionSlugs: ['integral-definida-tfc'],
  },
  {
    slug: 'coordenadas-polares',
    subject: 'calculo-ii',
    messageKey: 'polarCoordinates',
    formulaIds: [],
    sectionSlugs: ['coordenadas-polares'],
  },
  {
    slug: 'normas-matriciales',
    subject: 'algebra',
    messageKey: 'matrixNorms',
    formulaIds: ['ALG-NOR-001', 'ALG-NOR-002', 'ALG-MAT-007'],
    sectionSlugs: ['normas-condicionamiento'],
  },
  {
    slug: 'estructuras-algebraicas',
    subject: 'algebra',
    messageKey: 'algebraicStructures',
    formulaIds: [],
    sectionSlugs: ['estructuras-algebraicas'],
  },
];

export function topicHubsForSubject(subject: SubjectSlug): TopicHubDefinition[] {
  return TOPIC_HUBS.filter((hub) => hub.subject === subject);
}

export function findTopicHub(subject: SubjectSlug, slug: string): TopicHubDefinition | undefined {
  return TOPIC_HUBS.find((hub) => hub.subject === subject && hub.slug === slug);
}

export function topicHubsForFormula(
  subject: SubjectSlug,
  formulaId: string,
): TopicHubDefinition[] {
  const code = formulaId.trim().toUpperCase();
  return TOPIC_HUBS.filter(
    (hub) => hub.subject === subject && hub.formulaIds.includes(code),
  );
}

export function collectTopicHubPaths(): string[] {
  const paths = new Set<string>();
  for (const subject of ['calculo-diferencial', 'calculo-ii', 'fisica-basica', 'algebra'] as SubjectSlug[]) {
    const hubs = topicHubsForSubject(subject);
    if (hubs.length > 0) paths.add(topicsIndexHref(subject));
    for (const hub of hubs) paths.add(topicHubHref(subject, hub.slug));
  }
  return [...paths];
}
