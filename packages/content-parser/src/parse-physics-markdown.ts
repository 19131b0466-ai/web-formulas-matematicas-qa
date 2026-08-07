import type {
  FormulaContent,
  ListContent,
  NoteContent,
  StrategyContent,
  TableContent,
  TextContent,
} from '@repo/shared-types';
import { slugify } from './slugify.js';
import { PHYSICS_SECTION_SLUG_OVERRIDES, inferTags } from './tags.js';
import type { ParseResult, ParsedBlock, ParsedSection } from './types.js';

const H1_RE = /^#\s+(.+)$/;
const H2_RE = /^##\s+(.+)$/;
const HR_RE = /^---+$/;
const DISPLAY_MATH_OPEN = /^\\\[[ \t]*$/;
const DISPLAY_MATH_CLOSE = /^[ \t]*\\\]$/;
const TABLE_ROW_RE = /^\|(.+)\|$/;
const TABLE_SEP_RE = /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?$/;
const UL_RE = /^[-*]\s+(.+)$/;
const OL_RE = /^\d+\.\s+(.+)$/;
const BLOCKQUOTE_RE = /^>\s?(.*)$/;
const INDEX_TITLE_RE = /^Índice\b/i;
const SKIP_H1_RE =
  /^(Notaci[oó]n general|Resumen de relaciones|Modelo recomendado|Frontera con|Fuentes de referencia)/i;
const GUIDE_CHAPTER_RE = /^Gu[ií]a para enfocar/i;
const NUMBERED_CHAPTER_RE = /^(\d+)\.\s+(.+)$/;
const FORMULA_HEADING_RE = /^(\d+(?:\.\d+)+)\.?\s+(.+)$/;

function isStrategyTable(headers: string[]): boolean {
  const joined = headers.join(' ').toLowerCase();
  return (
    joined.includes('señal') ||
    joined.includes('senal') ||
    joined.includes('método') ||
    joined.includes('metodo') ||
    joined.includes('enfoque')
  );
}
const ID_RE = /^\*\*ID:\*\*\s*`([^`]+)`\s*$/i;
const DETAIL_RE = /^\*\*Detalle:\*\*\s*(.*)$/i;
const VARIABLES_RE = /^\*\*Variables:\*\*\s*(.*)$/i;
const CONDITION_RE = /^\*\*Condici[oó]n(?:es)?:\*\*\s*(.*)$/i;
const RELATED_RE = /^\*\*Relacionadas:\*\*\s*(.*)$/i;
const RELATED_ID_RE = /`([A-Z]{2,5}-\d{3})`/g;

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

function pushBlock(
  section: ParsedSection,
  blockType: ParsedBlock['blockType'],
  content: ParsedBlock['content'],
  searchParts: string[],
  title: string | null = null,
  formulaCode: string | null = null,
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
    formulaCode,
  });
}

function createChapter(number: string, title: string, sortOrder: number): ParsedSection {
  const slug = PHYSICS_SECTION_SLUG_OVERRIDES[number] ?? slugify(title);
  return {
    slug,
    number,
    title,
    description: null,
    sortOrder,
    parentSlug: null,
    blocks: [],
  };
}

type FormulaDraft = {
  title: string;
  formulaId: string | null;
  latex: string[];
  /** Parallel to `latex`; label that introduces that math block (usually null for the primary). */
  latexLabels: Array<string | null>;
  /** Short intro waiting to attach to the next display-math block. */
  pendingLabel: string | null;
  detail: string | null;
  variables: string | null;
  constraints: string[];
  relatedIds: string[];
  notes: string[];
};

function createFormulaDraft(title: string): FormulaDraft {
  return {
    title,
    formulaId: null,
    latex: [],
    latexLabels: [],
    pendingLabel: null,
    detail: null,
    variables: null,
    constraints: [],
    relatedIds: [],
    notes: [],
  };
}

/** Prose that introduces an alternate form, not a pedagogical "Detalle". */
function isVariantIntro(text: string): boolean {
  const t = text.trim();
  if (!t || t.startsWith('**')) return false;
  if (/^(o|y|con)$/i.test(t)) return true;
  if (/^(también|además|equivalentemente|por tanto)\.?$/i.test(t)) return true;
  // "Caso paralelo:", "En una dimensión:", "Magnitud:", …
  if (t.endsWith(':') && t.length <= 120) return true;
  return false;
}

function normalizeVariantLabel(text: string): string {
  return text.trim().replace(/:+\s*$/, '');
}

function absorbProseIntoDraft(draft: FormulaDraft, text: string): void {
  if (!text) return;
  // Case/form intros may precede the first or a later math block
  // ("Constructiva:", "Caso paralelo:", "Para propagación hacia (+x):").
  if (isVariantIntro(text)) {
    draft.pendingLabel = normalizeVariantLabel(text);
    return;
  }
  if (!draft.detail && text.length < 400) {
    draft.detail = text;
  } else {
    draft.notes.push(text);
  }
}

function flushFormula(section: ParsedSection, draft: FormulaDraft | null): void {
  if (!draft || draft.latex.length === 0) return;

  // Orphan intro without following math → keep as detail/note instead of dropping.
  if (draft.pendingLabel) {
    if (!draft.detail) draft.detail = draft.pendingLabel;
    else draft.notes.push(draft.pendingLabel);
    draft.pendingLabel = null;
  }

  const content: FormulaContent = {
    latex: draft.latex[0]!,
    displayMode: true,
  };
  if (draft.latexLabels[0]) content.latexLabel = draft.latexLabels[0];
  if (draft.latex.length > 1) {
    content.additionalLatex = draft.latex.slice(1);
    const labels = draft.latexLabels.slice(1);
    if (labels.some((l) => l)) content.additionalLatexLabels = labels;
  }
  if (draft.formulaId) content.formulaId = draft.formulaId;
  if (draft.detail) content.detail = draft.detail;
  if (draft.variables) content.variables = draft.variables;
  if (draft.constraints.length) content.constraints = draft.constraints;
  if (draft.relatedIds.length) content.relatedIds = draft.relatedIds;

  pushBlock(
    section,
    'formula',
    content,
    [
      draft.title,
      draft.formulaId ?? '',
      draft.detail ?? '',
      draft.variables ?? '',
      ...draft.constraints,
      ...draft.relatedIds,
      ...draft.latexLabels.filter(Boolean).map(String),
      ...draft.latex.map(latexToSearch),
      ...draft.notes.map(stripInlineNoise),
    ],
    draft.title,
    draft.formulaId,
  );

  for (const note of draft.notes) {
    if (!note.trim()) continue;
    const text: TextContent = { markdown: note };
    pushBlock(section, 'text', text, [draft.title, stripInlineNoise(note)], null);
  }
}

/**
 * Parse Física Básica catalog markdown into chapter sections and formula blocks.
 * Formula entries (`## N.M`) become formula blocks (not subsections).
 */
export function parsePhysicsMarkdown(markdown: string): ParseResult {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const sections: ParsedSection[] = [];

  let currentSection: ParsedSection | null = null;
  let sortOrder = 0;
  let inIndex = false;
  let inGuideSection = false;
  let draft: FormulaDraft | null = null;
  let paragraph: string[] = [];

  const flushParagraphIntoDraftOrSection = () => {
    const text = paragraph.join('\n').trim();
    paragraph = [];
    if (!text) return;
    if (draft) {
      absorbProseIntoDraft(draft, text);
      return;
    }
    if (!currentSection) return;
    const content: TextContent = { markdown: text };
    pushBlock(currentSection, 'text', content, [stripInlineNoise(text)], null);
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]!;
    const trimmed = line.trim();

    if (i === 0 && trimmed.startsWith('# ') && !NUMBERED_CHAPTER_RE.test(trimmed.slice(2))) {
      continue;
    }

    const h1 = trimmed.match(H1_RE);
    if (h1) {
      flushParagraphIntoDraftOrSection();
      if (draft && currentSection) {
        flushFormula(currentSection, draft);
        draft = null;
      }

      const raw = h1[1]!.trim();
      if (INDEX_TITLE_RE.test(raw)) {
        inIndex = true;
        currentSection = null;
        continue;
      }
      if (SKIP_H1_RE.test(raw)) {
        inIndex = false;
        currentSection = null;
        continue;
      }

      const numbered = raw.match(NUMBERED_CHAPTER_RE);
      if (!numbered) {
        currentSection = null;
        inGuideSection = false;
        continue;
      }

      const num = numbered[1]!;
      const title = numbered[2]!.trim();
      // Chapter 18 = approach guide; 19+ meta (resumen, etc.) stay out of the catalog.
      if (Number(num) >= 19) {
        currentSection = null;
        inGuideSection = false;
        continue;
      }
      if (Number(num) === 18 && !GUIDE_CHAPTER_RE.test(title)) {
        currentSection = null;
        inGuideSection = false;
        continue;
      }

      inIndex = false;
      inGuideSection = GUIDE_CHAPTER_RE.test(title) || Number(num) === 18;
      const section = createChapter(num, title, sortOrder++);
      if (inGuideSection) section.slug = 'guia-enfoque';
      sections.push(section);
      currentSection = section;
      continue;
    }

    if (inIndex) {
      if (HR_RE.test(trimmed) || H1_RE.test(trimmed) || H2_RE.test(trimmed)) {
        inIndex = false;
        if (HR_RE.test(trimmed)) continue;
        // reprocess non-HR
        i -= 1;
        continue;
      }
      continue;
    }

    if (!currentSection) continue;

    const h2 = trimmed.match(H2_RE);
    if (h2) {
      flushParagraphIntoDraftOrSection();
      if (draft) {
        flushFormula(currentSection, draft);
        draft = null;
      }

      const raw = h2[1]!.trim();
      if (inGuideSection) {
        // Guide subsections are prose headings, not formula entries.
        const title = raw.replace(FORMULA_HEADING_RE, '$2').trim() || raw;
        const content: TextContent = { markdown: `**${title}**` };
        pushBlock(currentSection, 'text', content, [stripInlineNoise(title)], title);
        continue;
      }

      const formulaHeading = raw.match(FORMULA_HEADING_RE);
      if (formulaHeading) {
        draft = createFormulaDraft(formulaHeading[2]!.trim());
      } else {
        // Unnumbered ## under chapter (e.g. rare) — treat as text title pending
        draft = createFormulaDraft(raw);
      }
      continue;
    }

    if (HR_RE.test(trimmed)) {
      flushParagraphIntoDraftOrSection();
      if (draft) {
        flushFormula(currentSection, draft);
        draft = null;
      }
      continue;
    }

    // Formula metadata lines
    if (draft) {
      const idMatch = trimmed.match(ID_RE);
      if (idMatch) {
        flushParagraphIntoDraftOrSection();
        draft.formulaId = idMatch[1]!;
        continue;
      }
      const detailMatch = trimmed.match(DETAIL_RE);
      if (detailMatch) {
        flushParagraphIntoDraftOrSection();
        draft.detail = detailMatch[1]!.trim() || null;
        continue;
      }
      const varsMatch = trimmed.match(VARIABLES_RE);
      if (varsMatch) {
        flushParagraphIntoDraftOrSection();
        draft.variables = varsMatch[1]!.trim() || null;
        continue;
      }
      const condMatch = trimmed.match(CONDITION_RE);
      if (condMatch) {
        flushParagraphIntoDraftOrSection();
        const value = condMatch[1]!.trim();
        if (value) draft.constraints.push(value);
        continue;
      }
      const relatedMatch = trimmed.match(RELATED_RE);
      if (relatedMatch) {
        flushParagraphIntoDraftOrSection();
        const ids: string[] = [];
        let m: RegExpExecArray | null;
        RELATED_ID_RE.lastIndex = 0;
        while ((m = RELATED_ID_RE.exec(relatedMatch[1]!)) !== null) {
          ids.push(m[1]!);
        }
        draft.relatedIds = ids;
        continue;
      }
    }

    const math = parseDisplayMath(lines, i);
    if (math) {
      // Flush pending prose first so variant intros attach to this math block.
      flushParagraphIntoDraftOrSection();
      if (draft) {
        draft.latex.push(math.latex);
        draft.latexLabels.push(draft.pendingLabel);
        draft.pendingLabel = null;
      } else {
        const content: FormulaContent = { latex: math.latex, displayMode: true };
        pushBlock(currentSection, 'formula', content, [latexToSearch(math.latex)], null);
      }
      i = math.end;
      continue;
    }

    const table = parseTable(lines, i);
    if (table) {
      flushParagraphIntoDraftOrSection();
      if (draft) {
        flushFormula(currentSection, draft);
        draft = null;
      }
      const headers = table.headers.map((h) => h.trim());
      if (inGuideSection && isStrategyTable(headers)) {
        for (const row of table.rows) {
          if (row.length < 2) continue;
          const strategy: StrategyContent = {
            signal: (row[0] ?? '').trim(),
            method: (row[1] ?? '').trim(),
          };
          pushBlock(
            currentSection,
            'strategy',
            strategy,
            [stripInlineNoise(strategy.signal), stripInlineNoise(strategy.method)],
            null,
          );
        }
      } else {
        const content: TableContent = {
          headers,
          rows: table.rows.map((r) => r.map((cell) => cell.trim())),
        };
        pushBlock(
          currentSection,
          'table',
          content,
          [
            content.headers.map(stripInlineNoise).join(' '),
            content.rows.map((r) => r.map(stripInlineNoise).join(' ')).join(' '),
          ],
          null,
        );
      }
      i = table.end;
      continue;
    }

    const quote = parseBlockquote(lines, i);
    if (quote) {
      flushParagraphIntoDraftOrSection();
      if (draft) {
        draft.notes.push(quote.markdown);
      } else {
        const content: NoteContent = { variant: 'info', markdown: quote.markdown };
        pushBlock(currentSection, 'note', content, [stripInlineNoise(quote.markdown)], null);
      }
      i = quote.end;
      continue;
    }

    const list = parseList(lines, i);
    if (list) {
      flushParagraphIntoDraftOrSection();
      if (draft && draft.latex.length === 0) {
        // list before math is rare; keep as notes
        draft.notes.push(list.items.map((it) => `- ${it}`).join('\n'));
      } else if (draft) {
        draft.notes.push(list.items.map((it) => `- ${it}`).join('\n'));
      } else {
        const content: ListContent = { items: list.items, ordered: list.ordered };
        pushBlock(
          currentSection,
          'list',
          content,
          [list.items.map(stripInlineNoise).join(' ')],
          null,
        );
      }
      i = list.end;
      continue;
    }

    if (trimmed === '') {
      flushParagraphIntoDraftOrSection();
      continue;
    }

    paragraph.push(line);
  }

  flushParagraphIntoDraftOrSection();
  if (draft && currentSection) flushFormula(currentSection, draft);

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
    stats: { sectionCount: sections.length, blockCount, formulaCount, tableCount },
  };
}
