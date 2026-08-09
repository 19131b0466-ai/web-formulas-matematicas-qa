export type BlockType = 'formula' | 'text' | 'table' | 'list' | 'note' | 'strategy';

export type FormulaLevel = 'fundamental' | 'intermedio' | 'avanzado';

export type AlgebraVisualType =
  | 'number_line'
  | 'algebra_tiles'
  | 'graph'
  | 'function_transform'
  | 'vector'
  | 'vector_space'
  | 'matrix'
  | 'matrix_transform'
  | 'geometry'
  | 'truth_table'
  | 'logic_gate'
  | 'modular_clock'
  | 'finite_field'
  | 'polynomial_surface'
  | 'error_correction';

export interface FormulaVisual {
  type: AlgebraVisualType | string;
  concept: string;
  elements: string;
  idea: string;
  learningObjective: string;
  interaction?: string;
}

export interface ComputationalCost {
  applicable: boolean;
  assumptions?: string;
  time?: string;
  space?: string;
  notes?: string;
  /** Raw markdown body when structured fields are not available. */
  markdown?: string;
}

export interface FormulaContent {
  latex: string;
  /** Optional label for the primary latex form (e.g. "Constructiva"). */
  latexLabel?: string | null;
  /** Extra display-math blocks from the same formula entry (physics). */
  additionalLatex?: string[];
  /**
   * Optional labels for each `additionalLatex` entry (same length).
   * Used for case/form intros like "Caso paralelo" / "En una dimensión".
   */
  additionalLatexLabels?: Array<string | null>;
  displayMode?: boolean;
  constraints?: string[];
  /** Stable formula code, e.g. VEC-001 (physics) or ALG-FND-001 (algebra). */
  formulaId?: string;
  detail?: string;
  variables?: string;
  relatedIds?: string[];
  /** Algebra catalog level. */
  level?: FormulaLevel | string;
  /** Suggested interactive visualization (algebra). */
  visual?: FormulaVisual;
  /** Optional CS-oriented complexity block. */
  computationalCost?: ComputationalCost;
}

export interface SubjectSummary {
  slug: string;
  title: string;
  description: string | null;
  sortOrder: number;
}

export interface RelatedFormulaRef {
  formulaId: string;
  title: string | null;
  sectionSlug: string;
  /** Primary latex for related-card preview (physics detail). */
  latex?: string | null;
}

export interface FormulaDetailResponse {
  subjectSlug: string;
  formulaId: string;
  title: string | null;
  content: FormulaContent;
  tags: string[];
  section: {
    slug: string;
    number: string;
    title: string;
  };
  related: RelatedFormulaRef[];
}

export interface TextContent {
  markdown: string;
}

export interface TableContent {
  headers: string[];
  rows: string[][];
  caption?: string;
}

export interface ListContent {
  items: string[];
  ordered: boolean;
}

export interface NoteContent {
  variant: 'info' | 'warning' | 'domain';
  markdown: string;
}

export interface StrategyContent {
  signal: string;
  method: string;
}

export type ContentBlockContent =
  FormulaContent | TextContent | TableContent | ListContent | NoteContent | StrategyContent;

export interface HealthResponse {
  status: 'ok';
  timestamp: string;
  version: string;
}

export interface SectionSummary {
  slug: string;
  number: string;
  title: string;
  description: string | null;
  sortOrder: number;
  parentSlug: string | null;
  children?: SectionSummary[];
}

export interface ContentBlockDto {
  id: string;
  type: BlockType;
  title: string | null;
  content: ContentBlockContent;
  tags: string[];
  sortOrder: number;
}

export interface SectionDetailResponse {
  section: {
    slug: string;
    number: string;
    title: string;
    description: string | null;
  };
  blocks: ContentBlockDto[];
  subsections: SectionSummary[];
}

export interface SearchResultItem {
  blockId: string;
  sectionSlug: string;
  sectionTitle: string;
  sectionNumber: string;
  blockType: BlockType;
  title: string | null;
  excerpt: string;
  tags: string[];
  formulaCode?: string | null;
}

export interface SearchResponse {
  query: string;
  total: number;
  results: SearchResultItem[];
}

export interface TagsResponse {
  tags: Array<{ tag: string; count: number }>;
}

export interface MethodGuideResponse {
  strategies: StrategyContent[];
  checklist: string[];
}

/** Body enviado por el frontend público — nunca incluye IP. */
export interface TrackVisitRequest {
  sessionId: string;
  path: string;
  referer?: string | null;
  acceptLanguage?: string | null;
  screen?: { width: number; height: number } | null;
  sectionSlug?: string | null;
  subjectSlug?: string | null;
  searchQuery?: string | null;
  queryString?: string | null;
}

export interface TrackVisitResponse {
  ok: true;
  deduplicated?: boolean;
}

/**
 * Vista admin de una visita. Política: nunca incluye ip_address.
 * Usado por dashboard y exportación CSV (Fase 3–4).
 */
export interface VisitLogAdminDto {
  id: string;
  sessionId: string;
  visitedAt: string;
  path: string;
  queryString: string | null;
  referer: string | null;
  countryCode: string | null;
  countryName: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  acceptLanguage: string | null;
  primaryLanguage: string | null;
  screenWidth: number | null;
  screenHeight: number | null;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  sectionSlug: string | null;
  subjectSlug: string | null;
  searchQuery: string | null;
  isUniqueDay: boolean | null;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface AnalyticsOverview {
  visitsToday: number;
  visitsWeek: number;
  visitsMonth: number;
  uniqueSessionsWeek: number;
  topCountry: { code: string | null; name: string | null; count: number } | null;
  topSection: { slug: string | null; count: number } | null;
  totalVisits: number;
}

export interface TimeseriesPoint {
  date: string;
  visits: number;
  uniqueSessions: number;
}

export interface NamedCount {
  name: string;
  count: number;
}

export interface GeoCountryCount {
  countryCode: string | null;
  countryName: string | null;
  count: number;
}

export interface GeoCityCount {
  countryCode: string | null;
  city: string | null;
  count: number;
}
