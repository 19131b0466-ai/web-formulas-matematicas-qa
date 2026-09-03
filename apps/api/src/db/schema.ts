import {
  boolean,
  char,
  decimal,
  index,
  inet,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

export const subjects = pgTable('subjects', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const sections = pgTable(
  'sections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    subjectId: uuid('subject_id')
      .notNull()
      .references(() => subjects.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    number: text('number').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    sortOrder: integer('sort_order').notNull(),
    parentId: uuid('parent_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique('sections_subject_slug_unique').on(table.subjectId, table.slug),
    index('idx_sections_subject').on(table.subjectId, table.sortOrder),
  ],
);

export const contentBlocks = pgTable(
  'content_blocks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sectionId: uuid('section_id')
      .notNull()
      .references(() => sections.id, { onDelete: 'cascade' }),
    blockType: text('block_type').notNull(),
    sortOrder: integer('sort_order').notNull(),
    title: text('title'),
    content: jsonb('content').notNull(),
    searchText: text('search_text'),
    tags: text('tags').array().default([]),
    formulaCode: text('formula_code'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('idx_content_blocks_section').on(table.sectionId, table.sortOrder),
    index('idx_content_blocks_formula_code').on(table.formulaCode),
  ],
);

export const visitLogs = pgTable(
  'visit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id').notNull(),
    visitedAt: timestamp('visited_at', { withTimezone: true }).defaultNow(),
    ipAddress: inet('ip_address').notNull(),
    userAgent: text('user_agent'),
    referer: text('referer'),
    path: text('path').notNull(),
    queryString: text('query_string'),
    countryCode: char('country_code', { length: 2 }),
    countryName: text('country_name'),
    region: text('region'),
    city: text('city'),
    latitude: decimal('latitude', { precision: 9, scale: 6 }),
    longitude: decimal('longitude', { precision: 9, scale: 6 }),
    timezone: text('timezone'),
    acceptLanguage: text('accept_language'),
    primaryLanguage: char('primary_language', { length: 5 }),
    screenWidth: integer('screen_width'),
    screenHeight: integer('screen_height'),
    deviceType: text('device_type'),
    browser: text('browser'),
    os: text('os'),
    sectionSlug: text('section_slug'),
    subjectSlug: text('subject_slug'),
    searchQuery: text('search_query'),
    isUniqueDay: boolean('is_unique_day').default(false),
    isBot: boolean('is_bot').notNull().default(false),
    trafficClass: text('traffic_class').notNull().default('unknown'),
    botId: text('bot_id'),
    botCategory: text('bot_category'),
    botDetectionReason: text('bot_detection_reason'),
    botConfidence: text('bot_confidence'),
    ipHash: text('ip_hash'),
    ipNetwork: text('ip_network'),
    eventSource: text('event_source').notNull().default('web_client'),
    classificationVersion: text('classification_version').notNull().default('v1'),
  },
  (table) => [
    index('idx_visit_logs_date').on(table.visitedAt),
    index('idx_visit_logs_country').on(table.countryCode),
    index('idx_visit_logs_path').on(table.path),
    index('idx_visit_logs_session').on(table.sessionId),
    index('idx_visit_logs_subject').on(table.subjectSlug),
    index('idx_visit_logs_visited_traffic').on(table.visitedAt, table.trafficClass),
    index('idx_visit_logs_visited_is_bot').on(table.visitedAt, table.isBot),
    index('idx_visit_logs_bot_id_visited').on(table.botId, table.visitedAt),
    index('idx_visit_logs_ip_hash_visited').on(table.ipHash, table.visitedAt),
    index('idx_visit_logs_path_visited_traffic').on(table.path, table.visitedAt, table.trafficClass),
  ],
);

export const adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  role: text('role').default('superadmin'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const reviews = pgTable(
  'reviews',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    displayName: text('display_name'),
    rating: integer('rating').notNull(),
    body: text('body').notNull(),
    locale: text('locale').notNull().default('es'),
    status: text('status').notNull().default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    moderatedAt: timestamp('moderated_at', { withTimezone: true }),
  },
  (table) => [index('idx_reviews_status_created').on(table.status, table.createdAt)],
);
