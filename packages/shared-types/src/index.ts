export { inferSubjectSlugForFormulaId } from './formula-subject.js';

export {
  CALCULO_VIZ_BY_FORMULA_ID,
  CALCULO_VIZ_BY_SECTION_NUMBER,
  calculoVizForFormulaId,
  calculoVizForSectionNumber,
  type CalculoSectionViz,
} from './calculo-viz.js';

export {
  FISICA_VIZ_BY_FORMULA_ID,
  FISICA_VIZ_BY_SECTION_NUMBER,
  fisicaVizForFormulaId,
  fisicaVizForSectionNumber,
  type FisicaSectionViz,
} from './fisica-viz.js';

export {
  CALCULO_DIFERENCIAL_VIZ_BY_FORMULA_ID,
  CALCULO_DIFERENCIAL_VIZ_BY_SECTION_NUMBER,
  calculoDiferencialVizForFormulaId,
  calculoDiferencialVizForSectionNumber,
  type CalculoDiferencialSectionViz,
} from './calculo-diferencial-viz.js';

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
  /**
   * Closed lesson mode for the viz component (e.g. commute, row_ops, moivre_power).
   * Parsed from markdown `**Modo:**`; clients may also infer from formulaId.
   */
  mode?: string;
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

export interface FormulaFaqItem {
  question: string;
  answer: string;
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
  /** Optional editorial fields — render only when the source provides them. */
  intuitiveExplanation?: string;
  /** Step-by-step derivation or “how to obtain” the expression. */
  derivation?: string;
  formalDefinition?: string;
  applicationConditions?: string[];
  workedExample?: string;
  commonErrors?: string[];
  equivalentNotations?: string[];
  references?: string[];
  lastReviewedAt?: string;
  reviewedBy?: string;
  sources?: string[];
  conventions?: string[];
  assumptions?: string[];
  referenceLinks?: Array<{ title: string; url: string }>;
  visualAlt?: string;
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
  /** Optional FAQ pairs for on-page help and FAQPage structured data. */
  faq?: FormulaFaqItem[];
  /** Search-oriented aliases surfaced in metadata and on-page “also known as”. */
  searchAliases?: string[];
}

export interface SubjectSummary {
  slug: string;
  title: string;
  description: string | null;
  sortOrder: number;
}

export interface RelatedFormulaRef {
  formulaId: string;
  /** Subject that owns the related formula (defaults to the current page subject). */
  subjectSlug: string;
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

export interface SitemapEntryDto {
  path: string;
  lastModified: string | null;
}

export interface SitemapEntriesResponse {
  entries: SitemapEntryDto[];
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
  isBot: boolean;
  trafficClass: TrafficClass;
  botId: string | null;
  botCategory: BotCategory | null;
  botDetectionReason: string | null;
  botConfidence: BotConfidence | null;
  classificationVersion: string;
  ipHash: string | null;
  ipNetwork: string | null;
  eventSource: EventSource;
  userAgent: string | null;
}

export type TrafficAudience = 'human' | 'bot' | 'unknown' | 'all';
export type TrafficClass = 'human' | 'bot' | 'unknown';
export type BotConfidence = 'high' | 'medium' | 'low';
export type EventSource = 'web_client' | 'server' | 'api' | 'internal' | 'unknown';
export type BotCategory =
  | 'search_engine'
  | 'ai_crawler'
  | 'social_preview'
  | 'seo_crawler'
  | 'advertising'
  | 'browser_automation'
  | 'monitoring'
  | 'generic_crawler'
  | 'unknown_bot';

export interface AnalyticsOverview {
  /** Human (probable) pageviews since UTC midnight. Primary “Visitas” KPI. */
  visitsToday: number;
  visitsWeek: number;
  visitsMonth: number;
  /** Distinct human session_id values in the last 7 UTC days. Bot UUIDs excluded. */
  uniqueSessionsWeek: number;
  topCountry: { code: string | null; name: string | null; count: number } | null;
  topSection: { slug: string | null; count: number } | null;
  totalVisits: number;
  timezone: 'UTC';
  totalTrafficToday: number;
  humanVisitsToday: number;
  botRequestsToday: number;
  unknownTrafficToday: number;
  botPercentToday: number;
  totalTrafficAll: number;
  humanVisitsAll: number;
  botRequestsAll: number;
  unknownTrafficAll: number;
  botPercentAll: number;
}

export interface TimeseriesPoint {
  date: string;
  visits: number;
  uniqueSessions: number;
  uniqueIpHashes: number;
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

export interface RpmStats {
  maxPerMinute: number;
  maxPerIpHash: number;
  mean: number;
  median: number;
  p95: number;
  series: Array<{ minute: string; human: number; bot: number; unknown: number; total: number }>;
}

export interface BotSummaryRow {
  botId: string;
  category: string | null;
  requests: number;
  uniquePaths: number;
  uniqueIpHashes: number;
  uniqueNetworks: number;
  firstSeen: string | null;
  lastSeen: string | null;
  maxRpm: number;
  percent: number;
}

export interface BotsAnalytics {
  totalBotRequests: number;
  totalTraffic: number;
  botPercent: number;
  topBotId: string | null;
  categories: NamedCount[];
  paths: NamedCount[];
  countries: GeoCountryCount[];
  cities: GeoCityCount[];
  bots: BotSummaryRow[];
  rpm: RpmStats;
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

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface PublicReview {
  id: string;
  displayName: string;
  rating: number;
  body: string;
  createdAt: string;
}

export interface PublicReviewsResponse {
  reviews: PublicReview[];
  averageRating: number | null;
  count: number;
}

export interface SubmitReviewResponse {
  ok: true;
}

export interface AdminReview {
  id: string;
  displayName: string | null;
  rating: number;
  body: string;
  locale: string;
  status: ReviewStatus;
  createdAt: string;
  moderatedAt: string | null;
}

export interface AdminReviewsResponse {
  reviews: AdminReview[];
  pendingCount: number;
}
