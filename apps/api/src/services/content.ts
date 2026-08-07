import { and, asc, eq, ilike, isNull, or, sql } from 'drizzle-orm';
import type {
  BlockType,
  ContentBlockContent,
  ContentBlockDto,
  FormulaContent,
  FormulaDetailResponse,
  MethodGuideResponse,
  RelatedFormulaRef,
  SearchResponse,
  SectionDetailResponse,
  SectionSummary,
  SubjectSummary,
  TagsResponse,
} from '@repo/shared-types';
import type { Database } from '../db/client.js';
import { contentBlocks, sections, subjects } from '../db/schema.js';

const DEFAULT_SUBJECT = 'calculo-ii';

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

export async function listSubjects(db: Database): Promise<SubjectSummary[]> {
  const rows = await db.select().from(subjects).orderBy(asc(subjects.sortOrder));
  return rows.map((r) => ({
    slug: r.slug,
    title: r.title,
    description: r.description,
    sortOrder: r.sortOrder,
  }));
}

export async function getSubjectBySlug(
  db: Database,
  slug: string,
): Promise<(typeof subjects.$inferSelect) | null> {
  const [row] = await db.select().from(subjects).where(eq(subjects.slug, slug)).limit(1);
  return row ?? null;
}

async function requireSubjectId(db: Database, subjectSlug: string): Promise<string | null> {
  const subject = await getSubjectBySlug(db, subjectSlug);
  return subject?.id ?? null;
}

export async function listSectionsTree(
  db: Database,
  subjectSlug: string = DEFAULT_SUBJECT,
): Promise<SectionSummary[]> {
  const subjectId = await requireSubjectId(db, subjectSlug);
  if (!subjectId) return [];

  const rows = await db
    .select()
    .from(sections)
    .where(eq(sections.subjectId, subjectId))
    .orderBy(asc(sections.sortOrder));
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
  subjectSlug: string = DEFAULT_SUBJECT,
): Promise<SectionDetailResponse | null> {
  const subjectId = await requireSubjectId(db, subjectSlug);
  if (!subjectId) return null;

  const [section] = await db
    .select()
    .from(sections)
    .where(and(eq(sections.slug, slug), eq(sections.subjectId, subjectId)))
    .limit(1);
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
  subjectSlug: string = DEFAULT_SUBJECT,
): Promise<SearchResponse> {
  const subjectId = await requireSubjectId(db, subjectSlug);
  if (!subjectId) {
    return { query: query.trim(), total: 0, results: [] };
  }

  const q = query.trim();
  const conditions = [eq(sections.subjectId, subjectId)];

  if (q) {
    conditions.push(
      or(
        ilike(contentBlocks.searchText, `%${q}%`),
        ilike(contentBlocks.title, `%${q}%`),
        ilike(sections.title, `%${q}%`),
        ilike(contentBlocks.formulaCode, `%${q}%`),
        // Suggestion chips put the tag slug into `q`; match tags too.
        sql`EXISTS (
          SELECT 1 FROM unnest(${contentBlocks.tags}) AS tag_name
          WHERE tag_name ILIKE ${`%${q}%`}
        )`,
      )!,
    );
  }

  if (tags.length > 0) {
    const tagArray = sql`ARRAY[${sql.join(
      tags.map((t) => sql`${t}`),
      sql`, `,
    )}]::text[]`;
    conditions.push(sql`${contentBlocks.tags} && ${tagArray}`);
  }

  if (!q && tags.length === 0) {
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
      formulaCode: block.formulaCode ?? null,
    };
  });

  return { query: q, total: results.length, results };
}

export async function listTags(
  db: Database,
  subjectSlug: string = DEFAULT_SUBJECT,
): Promise<TagsResponse> {
  const subjectId = await requireSubjectId(db, subjectSlug);
  if (!subjectId) return { tags: [] };

  const rows = await db
    .select({
      tag: sql<string>`unnest(${contentBlocks.tags})`.as('tag'),
    })
    .from(contentBlocks)
    .innerJoin(sections, eq(contentBlocks.sectionId, sections.id))
    .where(eq(sections.subjectId, subjectId));

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

export async function getFormulaByCode(
  db: Database,
  subjectSlug: string,
  formulaId: string,
): Promise<FormulaDetailResponse | null> {
  const subjectId = await requireSubjectId(db, subjectSlug);
  if (!subjectId) return null;

  const code = formulaId.trim().toUpperCase();
  const [row] = await db
    .select({
      block: contentBlocks,
      section: sections,
    })
    .from(contentBlocks)
    .innerJoin(sections, eq(contentBlocks.sectionId, sections.id))
    .where(
      and(
        eq(sections.subjectId, subjectId),
        eq(contentBlocks.formulaCode, code),
        eq(contentBlocks.blockType, 'formula'),
      ),
    )
    .limit(1);

  if (!row) return null;

  const content = row.block.content as FormulaContent;
  const relatedIds = (content.relatedIds ?? [])
    .map((id) => id.trim().toUpperCase())
    .filter(Boolean);
  const related: RelatedFormulaRef[] = [];

  if (relatedIds.length > 0) {
    const relatedRows = await db
      .select({
        block: contentBlocks,
        section: sections,
      })
      .from(contentBlocks)
      .innerJoin(sections, eq(contentBlocks.sectionId, sections.id))
      .where(
        and(
          eq(sections.subjectId, subjectId),
          sql`${contentBlocks.formulaCode} = ANY(${sql`ARRAY[${sql.join(
            relatedIds.map((id) => sql`${id}`),
            sql`, `,
          )}]::text[]`})`,
        ),
      );

    const byCode = new Map(
      relatedRows.map((r) => [r.block.formulaCode ?? '', r] as const),
    );
    for (const id of relatedIds) {
      const hit = byCode.get(id);
      if (!hit) continue;
      const relatedContent = hit.block.content as FormulaContent;
      related.push({
        formulaId: id,
        title: hit.block.title,
        sectionSlug: hit.section.slug,
        latex: relatedContent.latex ?? null,
      });
    }
  }

  return {
    subjectSlug,
    formulaId: code,
    title: row.block.title,
    content,
    tags: row.block.tags ?? [],
    section: {
      slug: row.section.slug,
      number: row.section.number,
      title: row.section.title,
    },
    related,
  };
}

export async function listFormulaCodes(
  db: Database,
  subjectSlug: string,
): Promise<string[]> {
  const subjectId = await requireSubjectId(db, subjectSlug);
  if (!subjectId) return [];

  const rows = await db
    .select({ code: contentBlocks.formulaCode })
    .from(contentBlocks)
    .innerJoin(sections, eq(contentBlocks.sectionId, sections.id))
    .where(
      and(
        eq(sections.subjectId, subjectId),
        sql`${contentBlocks.formulaCode} IS NOT NULL`,
      ),
    );

  return rows.map((r) => r.code!).filter(Boolean);
}

const GUIDE_SECTION_SLUG: Record<string, string> = {
  'calculo-ii': 'guia-metodos',
  'fisica-basica': 'guia-enfoque',
};

export async function getMethodGuide(
  db: Database,
  subjectSlug: string = DEFAULT_SUBJECT,
): Promise<MethodGuideResponse> {
  const subjectId = await requireSubjectId(db, subjectSlug);
  if (!subjectId) return { strategies: [], checklist: [] };

  const guideSlug = GUIDE_SECTION_SLUG[subjectSlug] ?? 'guia-metodos';
  const [guide] = await db
    .select()
    .from(sections)
    .where(and(eq(sections.slug, guideSlug), eq(sections.subjectId, subjectId)))
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
    .where(and(eq(sections.slug, 'lista-comprobacion'), eq(sections.subjectId, subjectId)))
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

  if (checklist.length === 0) {
    const ordered = blocks.find((b) => b.blockType === 'list');
    const content = ordered?.content as { items?: string[]; ordered?: boolean } | undefined;
    if (content?.items) checklist = content.items;
  }

  return { strategies, checklist };
}

export async function countTopLevelSections(
  db: Database,
  subjectSlug: string = DEFAULT_SUBJECT,
): Promise<number> {
  const subjectId = await requireSubjectId(db, subjectSlug);
  if (!subjectId) return 0;
  const rows = await db
    .select({ id: sections.id })
    .from(sections)
    .where(and(eq(sections.subjectId, subjectId), isNull(sections.parentId)));
  return rows.length;
}
