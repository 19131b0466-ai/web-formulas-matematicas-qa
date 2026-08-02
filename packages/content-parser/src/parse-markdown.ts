import type {
  ListContent,
  NoteContent,
  StrategyContent,
  TableContent,
  TextContent,
  FormulaContent,
} from '@repo/shared-types';
import { slugify } from './slugify.js';
import { SECTION_SLUG_OVERRIDES, inferTags } from './tags.js';
import type { ParseResult, ParsedBlock, ParsedSection } from './types.js';

const HEADING_RE = /^(#{2,4})\s+(.+)$/;
const HR_RE = /^---+$/;
const DISPLAY_MATH_OPEN = /^\\\[[ \t]*$/;
const DISPLAY_MATH_CLOSE = /^[ \t]*\\\]$/;
const TABLE_ROW_RE = /^\|(.+)\|$/;
const TABLE_SEP_RE = /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?$/;
const UL_RE = /^[-*]\s+(.+)$/;
const OL_RE = /^\d+\.\s+(.+)$/;
const BLOCKQUOTE_RE = /^>\s?(.*)$/;
const INDEX_TITLE_RE = /^#+\s+Índice\b/i;
const CHECKLIST_TITLE_RE = /^Lista final de comprobaci[oó]n/i;
const APPENDIX_RE = /^Ap[eé]ndice\s+([AB])\s*:\s*(.+)$/i;
/** Matches `1. Title`, `1.1 Title`, `10.2.3 Title` (period after whole number optional for subsections). */
const NUMBERED_SECTION_RE = /^(\d+(?:\.\d+)*)\.?\s+(.+)$/;

function stripInlineNoise(text: string): string {
  return text
    .replace(/\\\((.+?)\\\)/g, '$1')
    .replace(/\$([^$]+)\$/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
}

function latexToSearch(latex: string): string {
  return latex
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[{}^_&]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseTableRow(line: string): string[] {
  const inner = line.replace(/^\|/, '').replace(/\|$/, '');
  return inner.split('|').map((cell) => cell.trim());
}

function isStrategyTable(headers: string[]): boolean {
  const joined = headers.join(' ').toLowerCase();
  return joined.includes('señal') || joined.includes('senal') || joined.includes('método');
}

function resolveSectionIdentity(rawTitle: string): { number: string; title: string; slug: string } {
  const appendix = rawTitle.match(APPENDIX_RE);
  if (appendix) {
    const letter = appendix[1]!.toUpperCase();
    const title = `Apéndice ${letter}: ${appendix[2]!.trim()}`;
    return {
      number: letter,
      title,
      slug: SECTION_SLUG_OVERRIDES[letter] ?? slugify(title),
    };
  }

  const numbered = rawTitle.match(NUMBERED_SECTION_RE);
  if (numbered) {
    const number = numbered[1]!;
    const title = numbered[2]!.trim();
    const top = number.split('.')[0]!;
    if (!number.includes('.') && SECTION_SLUG_OVERRIDES[top]) {
      return { number, title, slug: SECTION_SLUG_OVERRIDES[top]! };
    }
    const parentTop = SECTION_SLUG_OVERRIDES[top];
    const subSlug = slugify(title);
    return {
      number,
      title,
      slug: parentTop && number.includes('.') ? `${parentTop}-${subSlug}` : (parentTop ?? subSlug),
    };
  }

  return {
    number: '',
    title: rawTitle.trim(),
    slug: slugify(rawTitle),
  };
}

function createSection(
  rawTitle: string,
  sortOrder: number,
  parentSlug: string | null,
): ParsedSection {
  const identity = resolveSectionIdentity(rawTitle);
  return {
    slug: identity.slug,
    number: identity.number,
    title: identity.title,
    description: null,
    sortOrder,
    parentSlug,
    blocks: [],
  };
}

function pushBlock(
  section: ParsedSection,
  blockType: ParsedBlock['blockType'],
  content: ParsedBlock['content'],
  searchParts: string[],
  title: string | null = null,
): void {
  const searchText = searchParts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  const tags = inferTags(section.slug, `${title ?? ''} ${searchText}`, blockType);
  section.blocks.push({
    blockType,
    title,
    content,
    searchText,
    tags,
    sortOrder: section.blocks.length,
  });
}

function flushParagraph(
  section: ParsedSection | null,
  lines: string[],
  pendingTitle: string | null,
): string | null {
  if (!section || lines.length === 0) return pendingTitle;

  const markdown = lines.join('\n').trim();
  if (!markdown) return pendingTitle;

  // Short bold-ish heading used as title for next content
  if (
    pendingTitle === null &&
    markdown.length < 120 &&
    !markdown.includes('\n') &&
    !markdown.includes('\\[') &&
    (/^\*\*.+\*\*$/.test(markdown) || /^[A-ZÁÉÍÓÚ].+:$/.test(markdown))
  ) {
    return stripInlineNoise(markdown);
  }

  const content: TextContent = { markdown };
  pushBlock(
    section,
    'text',
    content,
    [pendingTitle ?? '', stripInlineNoise(markdown)],
    pendingTitle,
  );
  return null;
}

function parseDisplayMath(lines: string[], start: number): { latex: string; end: number } | null {
  if (!DISPLAY_MATH_OPEN.test(lines[start] ?? '')) return null;
  const body: string[] = [];
  let i = start + 1;
  while (i < lines.length && !DISPLAY_MATH_CLOSE.test(lines[i] ?? '')) {
    body.push(lines[i]!);
    i += 1;
  }
  if (i >= lines.length) return null;
  return { latex: body.join('\n').trim(), end: i };
}

function parseTable(
  lines: string[],
  start: number,
): { headers: string[]; rows: string[][]; end: number } | null {
  if (!TABLE_ROW_RE.test(lines[start] ?? '')) return null;
  if (!TABLE_SEP_RE.test(lines[start + 1] ?? '')) return null;

  const headers = parseTableRow(lines[start]!);
  const rows: string[][] = [];
  let i = start + 2;
  while (i < lines.length && TABLE_ROW_RE.test(lines[i] ?? '')) {
    rows.push(parseTableRow(lines[i]!));
    i += 1;
  }
  return { headers, rows, end: i - 1 };
}

function parseList(
  lines: string[],
  start: number,
): { items: string[]; ordered: boolean; end: number } | null {
  const first = lines[start] ?? '';
  const ul = first.match(UL_RE);
  const ol = first.match(OL_RE);
  if (!ul && !ol) return null;

  const ordered = Boolean(ol);
  const items: string[] = [];
  let i = start;
  while (i < lines.length) {
    const line = lines[i]!;
    const match = ordered ? line.match(OL_RE) : line.match(UL_RE);
    if (!match) {
      // continuation indented under list item
      if (/^\s{2,}\S/.test(line) && items.length > 0) {
        items[items.length - 1] = `${items[items.length - 1]!}\n${line.trim()}`;
        i += 1;
        continue;
      }
      break;
    }
    items.push(match[1]!);
    i += 1;
  }
  return { items, ordered, end: i - 1 };
}

function parseBlockquote(lines: string[], start: number): { markdown: string; end: number } | null {
  if (!BLOCKQUOTE_RE.test(lines[start] ?? '')) return null;
  const body: string[] = [];
  let i = start;
  while (i < lines.length) {
    const match = lines[i]!.match(BLOCKQUOTE_RE);
    if (!match) break;
    body.push(match[1]!);
    i += 1;
  }
  return { markdown: body.join('\n').trim(), end: i - 1 };
}

/**
 * Parse the Cálculo II formulas markdown into sections and typed content blocks.
 */
export function parseFormulasMarkdown(markdown: string): ParseResult {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const sections: ParsedSection[] = [];

  let currentTop: ParsedSection | null = null;
  let currentSection: ParsedSection | null = null;
  let sortOrder = 0;
  let pendingTitle: string | null = null;
  let paragraph: string[] = [];
  let inIndex = false;

  const flush = () => {
    pendingTitle = flushParagraph(currentSection, paragraph, pendingTitle);
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]!;
    const trimmed = line.trim();

    // Document title
    if (i === 0 && trimmed.startsWith('# ')) continue;

    if (INDEX_TITLE_RE.test(trimmed)) {
      flush();
      inIndex = true;
      continue;
    }

    if (inIndex) {
      if (HR_RE.test(trimmed) || HEADING_RE.test(trimmed)) {
        inIndex = false;
        if (HR_RE.test(trimmed)) continue;
      } else {
        continue;
      }
    }

    if (HR_RE.test(trimmed)) {
      flush();
      continue;
    }

    const heading = trimmed.match(HEADING_RE);
    if (heading) {
      flush();
      const level = heading[1]!.length;
      const rawTitle = heading[2]!.trim();

      if (level === 2) {
        if (CHECKLIST_TITLE_RE.test(rawTitle)) {
          const section = createSection(rawTitle, sortOrder++, null);
          section.slug = 'lista-comprobacion';
          section.number = '';
          sections.push(section);
          currentTop = section;
          currentSection = section;
          pendingTitle = null;
          continue;
        }
        const section = createSection(rawTitle, sortOrder++, null);
        sections.push(section);
        currentTop = section;
        currentSection = section;
        pendingTitle = null;
      } else if (level === 3) {
        const parentSlug = currentTop?.slug ?? null;
        const section = createSection(rawTitle, sortOrder++, parentSlug);
        // Avoid slug collisions for subsections
        if (sections.some((s) => s.slug === section.slug)) {
          section.slug = `${parentSlug ?? 'sec'}-${section.slug}-${String(sortOrder)}`;
        }
        sections.push(section);
        currentSection = section;
        pendingTitle = null;
      } else {
        pendingTitle = resolveSectionIdentity(rawTitle).title;
      }
      continue;
    }

    if (!currentSection) {
      // Intro paragraphs before first section — skip
      continue;
    }

    // Display math
    const math = parseDisplayMath(lines, i);
    if (math) {
      flush();
      const content: FormulaContent = { latex: math.latex, displayMode: true };
      pushBlock(
        currentSection,
        'formula',
        content,
        [pendingTitle ?? '', latexToSearch(math.latex)],
        pendingTitle,
      );
      pendingTitle = null;
      i = math.end;
      continue;
    }

    // Table
    const table = parseTable(lines, i);
    if (table) {
      flush();
      if (isStrategyTable(table.headers) || currentSection.slug === 'guia-metodos') {
        for (const row of table.rows) {
          if (row.length < 2) continue;
          const strategy: StrategyContent = {
            signal: stripInlineNoise(row[0] ?? ''),
            method: stripInlineNoise(row[1] ?? ''),
          };
          pushBlock(
            currentSection,
            'strategy',
            strategy,
            [strategy.signal, strategy.method],
            pendingTitle,
          );
        }
      } else {
        const content: TableContent = {
          headers: table.headers.map(stripInlineNoise),
          rows: table.rows.map((r) => r.map(stripInlineNoise)),
        };
        pushBlock(
          currentSection,
          'table',
          content,
          [
            pendingTitle ?? '',
            content.headers.join(' '),
            content.rows.map((r) => r.join(' ')).join(' '),
          ],
          pendingTitle,
        );
      }
      pendingTitle = null;
      i = table.end;
      continue;
    }

    // Blockquote / note
    const quote = parseBlockquote(lines, i);
    if (quote) {
      flush();
      const variant: NoteContent['variant'] = /dominio|condici[oó]n|regla de uso|nota/i.test(
        quote.markdown,
      )
        ? 'domain'
        : /cuidado|no basta|warning|no deben/i.test(quote.markdown)
          ? 'warning'
          : 'info';
      const content: NoteContent = { variant, markdown: quote.markdown };
      pushBlock(
        currentSection,
        'note',
        content,
        [pendingTitle ?? '', stripInlineNoise(quote.markdown)],
        pendingTitle,
      );
      pendingTitle = null;
      i = quote.end;
      continue;
    }

    // List
    const list = parseList(lines, i);
    if (list) {
      flush();
      // Nested bullet under "En expresiones reales:" already handled as list
      const content: ListContent = { items: list.items, ordered: list.ordered };
      pushBlock(
        currentSection,
        'list',
        content,
        [pendingTitle ?? '', list.items.map(stripInlineNoise).join(' ')],
        pendingTitle,
      );
      pendingTitle = null;
      i = list.end;
      continue;
    }

    if (trimmed === '') {
      flush();
      continue;
    }

    paragraph.push(line);
  }

  flush();

  const blockCount = sections.reduce((n, s) => n + s.blocks.length, 0);
  const formulaCount = sections.reduce(
    (n, s) => n + s.blocks.filter((b) => b.blockType === 'formula').length,
    0,
  );
  const tableCount = sections.reduce(
    (n, s) => n + s.blocks.filter((b) => b.blockType === 'table').length,
    0,
  );

  return {
    sections,
    stats: {
      sectionCount: sections.length,
      blockCount,
      formulaCount,
      tableCount,
    },
  };
}
