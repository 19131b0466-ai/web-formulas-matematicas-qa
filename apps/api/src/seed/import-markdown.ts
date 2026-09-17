import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseAlgebraMarkdown,
  parseCalculoDiferencialMarkdown,
  parseFormulasMarkdown,
  parsePhysicsMarkdown,
} from '@repo/content-parser';
import { eq } from 'drizzle-orm';
import { createDb, getDatabaseUrl, type Database } from '../db/client.js';
import { contentBlocks, sections, subjects } from '../db/schema.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../');

export const SUBJECT_CATALOG = [
  {
    slug: 'calculo-diferencial',
    title: 'Cálculo Diferencial',
    description: 'Límites, continuidad, derivadas y aplicaciones',
    sortOrder: 0,
    markdownPath: resolve(ROOT, 'content/formulas-calculo-diferencial.md'),
    parser: 'calculo-diferencial' as const,
  },
  {
    slug: 'calculo-ii',
    title: 'Cálculo II',
    description: 'Cálculo Integral — fórmulas, métodos y aplicaciones',
    sortOrder: 1,
    markdownPath: resolve(ROOT, 'content/formulas-calculo-ii.md'),
    parser: 'calculo' as const,
  },
  {
    slug: 'fisica-basica',
    title: 'Física Básica',
    description: 'Fórmulas de Física General universitaria',
    sortOrder: 2,
    markdownPath: resolve(ROOT, 'content/formulas-fisica-basica.md'),
    parser: 'fisica' as const,
  },
  {
    slug: 'algebra',
    title: 'Álgebra',
    description: 'Álgebra para Ingeniería y Ciencias de la Computación',
    sortOrder: 3,
    markdownPath: resolve(ROOT, 'content/formulas-algebra.md'),
    parser: 'algebra' as const,
  },
] as const;

export type SeedStats = {
  subjectSlug: string;
  sectionCount: number;
  blockCount: number;
  formulaCount: number;
};

async function ensureSubjects(db: Database): Promise<Map<string, string>> {
  const idBySlug = new Map<string, string>();
  for (const subject of SUBJECT_CATALOG) {
    const existing = await db
      .select()
      .from(subjects)
      .where(eq(subjects.slug, subject.slug))
      .limit(1);
    if (existing[0]) {
      await db
        .update(subjects)
        .set({
          title: subject.title,
          description: subject.description,
          sortOrder: subject.sortOrder,
        })
        .where(eq(subjects.id, existing[0].id));
      idBySlug.set(subject.slug, existing[0].id);
      continue;
    }
    const id = randomUUID();
    await db.insert(subjects).values({
      id,
      slug: subject.slug,
      title: subject.title,
      description: subject.description,
      sortOrder: subject.sortOrder,
    });
    idBySlug.set(subject.slug, id);
  }
  return idBySlug;
}

export async function seedSubjectFromMarkdown(
  db: Database,
  subjectSlug: string,
  markdownPath: string,
  parser: 'calculo' | 'calculo-diferencial' | 'fisica' | 'algebra',
  subjectIds?: Map<string, string>,
): Promise<SeedStats> {
  const idBySlug = subjectIds ?? (await ensureSubjects(db));
  const subjectId = idBySlug.get(subjectSlug);
  if (!subjectId) {
    throw new Error(`Unknown subject slug: ${subjectSlug}`);
  }

  const markdown = readFileSync(markdownPath, 'utf8');
  const parsed =
    parser === 'fisica'
      ? parsePhysicsMarkdown(markdown)
      : parser === 'algebra'
        ? parseAlgebraMarkdown(markdown)
        : parser === 'calculo-diferencial'
          ? parseCalculoDiferencialMarkdown(markdown)
          : parseFormulasMarkdown(markdown);

  // SAFETY: only wipe this subject's sections/blocks.
  // NEVER delete/truncate visit_logs, admin_users, or other subjects here.
  // Analytics history must survive content re-seeds.
  await db.delete(sections).where(eq(sections.subjectId, subjectId));

  const sectionIdBySlug = new Map<string, string>();

  const ordered = [...parsed.sections].sort((a, b) => {
    if (!a.parentSlug && b.parentSlug) return -1;
    if (a.parentSlug && !b.parentSlug) return 1;
    return a.sortOrder - b.sortOrder;
  });

  for (const section of ordered) {
    const parentId = section.parentSlug ? (sectionIdBySlug.get(section.parentSlug) ?? null) : null;
    const sectionId = randomUUID();
    await db.insert(sections).values({
      id: sectionId,
      subjectId,
      slug: section.slug,
      number: section.number,
      title: section.title,
      description: section.description,
      sortOrder: section.sortOrder,
      parentId,
    });
    sectionIdBySlug.set(section.slug, sectionId);

    if (section.blocks.length === 0) continue;

    await db.insert(contentBlocks).values(
      section.blocks.map((block) => ({
        id: randomUUID(),
        sectionId,
        blockType: block.blockType,
        sortOrder: block.sortOrder,
        title: block.title,
        content: block.content,
        searchText: block.searchText,
        tags: block.tags,
        formulaCode: block.formulaCode ?? null,
      })),
    );
  }

  for (const section of parsed.sections) {
    if (!section.parentSlug) continue;
    const id = sectionIdBySlug.get(section.slug);
    const parentId = sectionIdBySlug.get(section.parentSlug);
    if (id && parentId) {
      await db.update(sections).set({ parentId }).where(eq(sections.id, id));
    }
  }

  return {
    subjectSlug,
    sectionCount: parsed.stats.sectionCount,
    blockCount: parsed.stats.blockCount,
    formulaCount: parsed.stats.formulaCount,
  };
}

/** @deprecated Prefer seedAllSubjects / seedSubjectFromMarkdown */
export async function seedFromMarkdown(
  db: Database,
  markdownPath?: string,
): Promise<{ sectionCount: number; blockCount: number; formulaCount: number }> {
  if (markdownPath) {
    const entry = SUBJECT_CATALOG.find((s) => s.markdownPath === resolve(markdownPath));
    const byName = SUBJECT_CATALOG.find((s) => markdownPath.endsWith(s.markdownPath.split('/').pop()!));
    const subject = entry ?? byName;
    if (!subject) {
      // Fallback: treat as Cálculo II single-doc seed path
      const stats = await seedSubjectFromMarkdown(db, 'calculo-ii', markdownPath, 'calculo');
      return {
        sectionCount: stats.sectionCount,
        blockCount: stats.blockCount,
        formulaCount: stats.formulaCount,
      };
    }
    const stats = await seedSubjectFromMarkdown(
      db,
      subject.slug,
      markdownPath,
      subject.parser,
    );
    return {
      sectionCount: stats.sectionCount,
      blockCount: stats.blockCount,
      formulaCount: stats.formulaCount,
    };
  }

  const all = await seedAllSubjects(db);
  return {
    sectionCount: all.reduce((n, s) => n + s.sectionCount, 0),
    blockCount: all.reduce((n, s) => n + s.blockCount, 0),
    formulaCount: all.reduce((n, s) => n + s.formulaCount, 0),
  };
}

export async function seedAllSubjects(db: Database): Promise<SeedStats[]> {
  const subjectIds = await ensureSubjects(db);
  const results: SeedStats[] = [];
  for (const subject of SUBJECT_CATALOG) {
    results.push(
      await seedSubjectFromMarkdown(
        db,
        subject.slug,
        subject.markdownPath,
        subject.parser,
        subjectIds,
      ),
    );
  }
  return results;
}

async function main() {
  const db = createDb(getDatabaseUrl());
  const pathArg = process.argv.slice(2).find((arg) => arg !== '--');
  if (pathArg) {
    const stats = await seedFromMarkdown(db, resolve(pathArg));
    console.log(
      `Seed complete: ${String(stats.sectionCount)} sections, ${String(stats.blockCount)} blocks (${String(stats.formulaCount)} formulas)`,
    );
  } else {
    const all = await seedAllSubjects(db);
    for (const stats of all) {
      console.log(
        `[${stats.subjectSlug}] ${String(stats.sectionCount)} sections, ${String(stats.blockCount)} blocks (${String(stats.formulaCount)} formulas)`,
      );
    }
  }
  process.exit(0);
}

const isDirectRun =
  process.argv[1] &&
  (process.argv[1].endsWith('import-markdown.ts') ||
    process.argv[1].endsWith('import-markdown.js'));

if (isDirectRun) {
  main().catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
}
