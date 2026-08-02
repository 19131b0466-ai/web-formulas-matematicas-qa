export type BlockType = 'formula' | 'text' | 'table' | 'list' | 'note' | 'strategy';

export interface FormulaContent {
  latex: string;
  displayMode?: boolean;
  constraints?: string[];
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
