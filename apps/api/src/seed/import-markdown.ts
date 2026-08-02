import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFormulasMarkdown } from '@repo/content-parser';
import { eq } from 'drizzle-orm';
import { createDb, getDatabaseUrl, type Database } from '../db/client.js';
import { contentBlocks, sections } from '../db/schema.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../');
const DEFAULT_MD = resolve(ROOT, 'content/formulas-calculo-ii.md');

export async function seedFromMarkdown(
  db: Database,
  markdownPath: string = DEFAULT_MD,
): Promise<{ sectionCount: number; blockCount: number; formulaCount: number }> {
  const markdown = readFileSync(markdownPath, 'utf8');
  const parsed = parseFormulasMarkdown(markdown);

  // Idempotent: wipe content tables (analytics untouched)
  await db.delete(contentBlocks);
  await db.delete(sections);

  const idBySlug = new Map<string, string>();

  // Insert parents first, then children (document order already mostly correct)
  const ordered = [...parsed.sections].sort((a, b) => {
    if (!a.parentSlug && b.parentSlug) return -1;
    if (a.parentSlug && !b.parentSlug) return 1;
    return a.sortOrder - b.sortOrder;
  });

  for (const section of ordered) {
    const parentId = section.parentSlug ? (idBySlug.get(section.parentSlug) ?? null) : null;

    const sectionId = randomUUID();
    await db.insert(sections).values({
      id: sectionId,
      slug: section.slug,
      number: section.number,
      title: section.title,
      description: section.description,
      sortOrder: section.sortOrder,
      parentId,
    });

    idBySlug.set(section.slug, sectionId);

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
      })),
    );
  }

  // Sanity: ensure parent relations for any deferred children
  for (const section of parsed.sections) {
    if (!section.parentSlug) continue;
    const id = idBySlug.get(section.slug);
    const parentId = idBySlug.get(section.parentSlug);
    if (id && parentId) {
      await db.update(sections).set({ parentId }).where(eq(sections.id, id));
    }
  }

  return {
    sectionCount: parsed.stats.sectionCount,
    blockCount: parsed.stats.blockCount,
    formulaCount: parsed.stats.formulaCount,
  };
}

async function main() {
  const db = createDb(getDatabaseUrl());
  const pathArg = process.argv[2];
  const stats = await seedFromMarkdown(db, pathArg ?? DEFAULT_MD);
  console.log(
    `Seed complete: ${String(stats.sectionCount)} sections, ${String(stats.blockCount)} blocks (${String(stats.formulaCount)} formulas)`,
  );
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
