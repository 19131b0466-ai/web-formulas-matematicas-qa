import { and, asc, eq, ilike, isNull, or, sql } from 'drizzle-orm';
import type {
  BlockType,
  ContentBlockContent,
  ContentBlockDto,
  MethodGuideResponse,
  SearchResponse,
  SectionDetailResponse,
  SectionSummary,
  TagsResponse,
} from '@repo/shared-types';
import type { Database } from '../db/client.js';
import { contentBlocks, sections } from '../db/schema.js';

function toSummary(row: typeof sections.$inferSelect, parentSlug: string | null): SectionSummary {
  return {
    slug: row.slug,
    number: row.number,
    title: row.title,
    description: row.description,
    sortOrder: row.sortOrder,
    parentSlug,
  };
}

function toBlockDto(row: typeof contentBlocks.$inferSelect): ContentBlockDto {
  return {
    id: row.id,
    type: row.blockType as BlockType,
    title: row.title,
    content: row.content as ContentBlockContent,
    tags: row.tags ?? [],
    sortOrder: row.sortOrder,
  };
}

export async function listSectionsTree(db: Database): Promise<SectionSummary[]> {
  const rows = await db.select().from(sections).orderBy(asc(sections.sortOrder));
  const byId = new Map(rows.map((r) => [r.id, r]));
  const children = new Map<string | null, typeof rows>();

  for (const row of rows) {
    const key = row.parentId;
    const list = children.get(key) ?? [];
    list.push(row);
    children.set(key, list);
  }

  function build(parentId: string | null): SectionSummary[] {
    const nodes = children.get(parentId) ?? [];
    return nodes.map((row) => {
      const parent = row.parentId ? (byId.get(row.parentId) ?? null) : null;
      const summary = toSummary(row, parent?.slug ?? null);
      const kids = build(row.id);
      if (kids.length > 0) summary.children = kids;
      return summary;
    });
  }

  return build(null);
}

export async function getSectionBySlug(
  db: Database,
  slug: string,
): Promise<SectionDetailResponse | null> {
  const [section] = await db.select().from(sections).where(eq(sections.slug, slug)).limit(1);
  if (!section) return null;

  const blocks = await db
    .select()
    .from(contentBlocks)
    .where(eq(contentBlocks.sectionId, section.id))
    .orderBy(asc(contentBlocks.sortOrder));

  const subsections = await db
    .select()
    .from(sections)
    .where(eq(sections.parentId, section.id))
    .orderBy(asc(sections.sortOrder));

  return {
    section: {
      slug: section.slug,
      number: section.number,
      title: section.title,
      description: section.description,
    },
    blocks: blocks.map(toBlockDto),
    subsections: subsections.map((s) => toSummary(s, section.slug)),
  };
}

export async function searchContent(
  db: Database,
  query: string,
  tags: string[],
  limit: number,
): Promise<SearchResponse> {
  const q = query.trim();
  const conditions = [];

  if (q) {
    conditions.push(
      or(
        ilike(contentBlocks.searchText, `%${q}%`),
        ilike(contentBlocks.title, `%${q}%`),
        ilike(sections.title, `%${q}%`),
      ),
    );
  }

  if (tags.length > 0) {
    const tagArray = sql`ARRAY[${sql.join(
      tags.map((t) => sql`${t}`),
      sql`, `,
    )}]::text[]`;
    conditions.push(sql`${contentBlocks.tags} && ${tagArray}`);
  }

  if (conditions.length === 0) {
    return { query: q, total: 0, results: [] };
  }

  const rows = await db
    .select({
      block: contentBlocks,
      section: sections,
    })
    .from(contentBlocks)
    .innerJoin(sections, eq(contentBlocks.sectionId, sections.id))
    .where(and(...conditions))
    .orderBy(asc(sections.sortOrder), asc(contentBlocks.sortOrder))
    .limit(limit);

  const results = rows.map(({ block, section }) => {
    const excerpt = (block.searchText ?? block.title ?? section.title).slice(0, 220);
    return {
      blockId: block.id,
      sectionSlug: section.slug,
      sectionTitle: section.title,
      sectionNumber: section.number,
      blockType: block.blockType as BlockType,
      title: block.title,
      excerpt,
      tags: block.tags ?? [],
    };
  });

  return { query: q, total: results.length, results };
}

export async function listTags(db: Database): Promise<TagsResponse> {
  const rows = await db
    .select({
      tag: sql<string>`unnest(${contentBlocks.tags})`.as('tag'),
    })
    .from(contentBlocks);

  const counts = new Map<string, number>();
  for (const row of rows) {
    if (!row.tag) continue;
    counts.set(row.tag, (counts.get(row.tag) ?? 0) + 1);
  }

  const tags = [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

  return { tags };
}

export async function getMethodGuide(db: Database): Promise<MethodGuideResponse> {
  const [guide] = await db
    .select()
    .from(sections)
    .where(eq(sections.slug, 'guia-metodos'))
    .limit(1);

  if (!guide) {
    return { strategies: [], checklist: [] };
  }

  const blocks = await db
    .select()
    .from(contentBlocks)
    .where(eq(contentBlocks.sectionId, guide.id))
    .orderBy(asc(contentBlocks.sortOrder));

  const strategies = blocks
    .filter((b) => b.blockType === 'strategy')
    .map((b) => b.content as { signal: string; method: string });

  const [checklistSection] = await db
    .select()
    .from(sections)
    .where(eq(sections.slug, 'lista-comprobacion'))
    .limit(1);

  let checklist: string[] = [];
  if (checklistSection) {
    const listBlocks = await db
      .select()
      .from(contentBlocks)
      .where(
        and(eq(contentBlocks.sectionId, checklistSection.id), eq(contentBlocks.blockType, 'list')),
      )
      .limit(1);
    const content = listBlocks[0]?.content as { items?: string[] } | undefined;
    checklist = content?.items ?? [];
  }

  // Fallback: ordered list inside guide section
  if (checklist.length === 0) {
    const ordered = blocks.find((b) => b.blockType === 'list');
    const content = ordered?.content as { items?: string[]; ordered?: boolean } | undefined;
    if (content?.items) checklist = content.items;
  }

  return { strategies, checklist };
}

export async function countTopLevelSections(db: Database): Promise<number> {
  const rows = await db.select({ id: sections.id }).from(sections).where(isNull(sections.parentId));
  return rows.length;
}
