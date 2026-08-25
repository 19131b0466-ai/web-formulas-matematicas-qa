import type {
  ComputationalCost,
  FormulaContent,
  FormulaVisual,
  ListContent,
  NoteContent,
  TextContent,
} from '@repo/shared-types';
import { slugify } from './slugify.js';
import { ALGEBRA_SECTION_SLUG_OVERRIDES, inferTags } from './tags.js';
import type { ParseResult, ParsedBlock, ParsedSection } from './types.js';

const H1_RE = /^#\s+(.+)$/;
const H2_RE = /^##\s+(.+)$/;
const H3_RE = /^###\s+(.+)$/;
const HR_RE = /^---+$/;
const DISPLAY_MATH_OPEN = /^\\\[[ \t]*$/;
const DISPLAY_MATH_CLOSE = /^[ \t]*\\\]$/;
const UL_RE = /^[-*]\s+(.+)$/;
const OL_RE = /^\d+\.\s+(.+)$/;
const FENCE_RE = /^```/;
const INDEX_TITLE_RE = /^Índice\b/i;
const BLOQUE_RE = /^BLOQUE\b/i;
const SKIP_H1_RE = /^(Plantilla para nuevas|Modelo de datos sugerido)/i;
const NUMBERED_CHAPTER_RE = /^(\d+)\.\s+(.+)$/;
const FORMULA_HEADING_RE = /^(\d+(?:\.\d+)+)\.?\s+(.+)$/;
const ID_RE = /^\*\*ID:\*\*\s*`([^`]+)`\s*$/i;
const LEVEL_RE = /^\*\*Nivel:\*\*\s*`([^`]+)`\s*$/i;
const DETAIL_RE = /^\*\*Descripci[oó]n corta:\*\*\s*(.*)$/i;
const RELATED_ID_RE = /`(ALG-[A-Z]+-\d{3})`/g;
const VISUAL_FIELD_RE =
  /^\*\*(Tipo|Modo|Concepto visual|Elementos|Idea|Objetivo educativo|Interactividad sugerida):\*\*\s*(.*)$/i;

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

function parseFence(lines: string[], start: number): { body: string; end: number } | null {
  if (!FENCE_RE.test(lines[start] ?? '')) return null;
  const body: string[] = [];
  let i = start + 1;
  while (i < lines.length && !FENCE_RE.test(lines[i] ?? '')) {
    body.push(lines[i]!);
    i += 1;
  }
  if (i >= lines.length) return null;
  return { body: body.join('\n'), end: i };
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
  const slug = ALGEBRA_SECTION_SLUG_OVERRIDES[number] ?? slugify(title);
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

type VisualDraft = Partial<FormulaVisual> & { type?: string };

type FormulaDraft = {
  title: string;
  formulaId: string | null;
  level: string | null;
  latex: string[];
  latexLabels: Array<string | null>;
  pendingLabel: string | null;
  detail: string | null;
  constraints: string[];
  relatedIds: string[];
  visual: VisualDraft | null;
  computationalMarkdown: string[];
  notes: string[];
  mode:
    | 'body'
    | 'visual'
    | 'conditions'
    | 'complexity'
    | 'related'
    | 'interpretation'
    | 'applications';
};

function createFormulaDraft(title: string): FormulaDraft {
  return {
    title,
    formulaId: null,
    level: null,
    latex: [],
    latexLabels: [],
    pendingLabel: null,
    detail: null,
    constraints: [],
    relatedIds: [],
    visual: null,
    computationalMarkdown: [],
    notes: [],
    mode: 'body',
  };
}

function isVariantIntro(text: string): boolean {
  const t = text.trim();
  if (!t || t.startsWith('**')) return false;
  if (/^(o|y|con)$/i.test(t)) return true;
  if (/^(también|además|equivalentemente|por tanto)\.?$/i.test(t)) return true;
  if (t.endsWith(':') && t.length <= 120) return true;
  return false;
}

function normalizeVariantLabel(text: string): string {
  return text.trim().replace(/:+\s*$/, '');
}

function absorbProseIntoDraft(draft: FormulaDraft, text: string): void {
  if (!text) return;
  if (draft.mode === 'complexity') {
    draft.computationalMarkdown.push(text);
    return;
  }
  if (draft.mode === 'interpretation' || draft.mode === 'applications') {
    draft.notes.push(text);
    return;
  }
  if (isVariantIntro(text)) {
    draft.pendingLabel = normalizeVariantLabel(text);
    return;
  }
  if (!draft.detail && text.length < 500) {
    draft.detail = text;
  } else {
    draft.notes.push(text);
  }
}

function finalizeVisual(draft: VisualDraft | null): FormulaVisual | undefined {
  if (!draft?.type) return undefined;
  return {
    type: draft.type.replace(/^`|`$/g, '').trim(),
    concept: draft.concept ?? '',
    elements: draft.elements ?? '',
    idea: draft.idea ?? '',
    learningObjective: draft.learningObjective ?? '',
    ...(draft.interaction ? { interaction: draft.interaction } : {}),
    ...(draft.mode ? { mode: String(draft.mode).replace(/^`|`$/g, '').trim() } : {}),
  };
}

function finalizeCost(lines: string[]): ComputationalCost | undefined {
  if (!lines.length) return undefined;
  const markdown = lines.join('\n').trim();
  if (!markdown) return undefined;
  const cost: ComputationalCost = { applicable: true, markdown };
  const timeMatch = markdown.match(/\*\*Tiempo:\*\*\s*`?([^`\n]+)`?/i);
  const spaceMatch = markdown.match(/\*\*Espacio(?: adicional)?:\*\*\s*`?([^`\n]+)`?/i);
  const assumptionsMatch = markdown.match(/\*\*Supuestos:\*\*\s*(.+)/i);
  if (timeMatch) cost.time = timeMatch[1]!.trim();
  if (spaceMatch) cost.space = spaceMatch[1]!.trim();
  if (assumptionsMatch) cost.assumptions = assumptionsMatch[1]!.trim();
  return cost;
}

function flushFormula(section: ParsedSection, draft: FormulaDraft | null): void {
  if (!draft || draft.latex.length === 0) return;

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
  if (draft.level) content.level = draft.level;
  if (draft.detail) content.detail = draft.detail;
  if (draft.constraints.length) content.constraints = draft.constraints;
  if (draft.relatedIds.length) content.relatedIds = draft.relatedIds;
  const visual = finalizeVisual(draft.visual);
  if (visual) content.visual = visual;
  const cost = finalizeCost(draft.computationalMarkdown);
  if (cost) content.computationalCost = cost;

  pushBlock(
    section,
    'formula',
    content,
    [
      draft.title,
      draft.formulaId ?? '',
      draft.level ?? '',
      draft.detail ?? '',
      ...draft.constraints,
      ...draft.relatedIds,
      visual?.type ?? '',
      visual?.concept ?? '',
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

function applyVisualField(draft: FormulaDraft, key: string, value: string): void {
  if (!draft.visual) draft.visual = {};
  const clean = value.replace(/^`|`$/g, '').trim();
  switch (key.toLowerCase()) {
    case 'tipo':
      draft.visual.type = clean;
      break;
    case 'modo':
      draft.visual.mode = clean;
      break;
    case 'concepto visual':
      draft.visual.concept = clean;
      break;
    case 'elementos':
      draft.visual.elements = clean;
      break;
    case 'idea':
      draft.visual.idea = clean;
      break;
    case 'objetivo educativo':
      draft.visual.learningObjective = clean;
      break;
    case 'interactividad sugerida':
      draft.visual.interaction = clean;
      break;
    default:
      break;
  }
}

/**
 * Parse Álgebra catalog markdown into chapter sections and formula blocks.
 */
export function parseAlgebraMarkdown(markdown: string): ParseResult {
  // Strip YAML frontmatter
  let source = markdown.replace(/\r\n/g, '\n');
  if (source.startsWith('---\n')) {
    const end = source.indexOf('\n---\n', 4);
    if (end !== -1) source = source.slice(end + 5);
  }

  const lines = source.split('\n');
  const sections: ParsedSection[] = [];

  let currentSection: ParsedSection | null = null;
  let sortOrder = 0;
  let inIndex = false;
  let draft: FormulaDraft | null = null;
  let paragraph: string[] = [];
  let chapterKind: 'catalog' | 'maps' | 'frontier' | 'skip' = 'skip';
  let mapHeading: string | null = null;

  const flushParagraph = () => {
    const text = paragraph.join('\n').trim();
    paragraph = [];
    if (!text) return;
    if (draft) {
      absorbProseIntoDraft(draft, text);
      return;
    }
    if (!currentSection) return;
    if (chapterKind === 'maps' && !currentSection.description) {
      currentSection.description = stripInlineNoise(text);
      return;
    }
    const content: TextContent = { markdown: text };
    pushBlock(currentSection, 'text', content, [stripInlineNoise(text)], null);
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]!;
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    if (HR_RE.test(trimmed)) {
      flushParagraph();
      if (draft && currentSection) {
        flushFormula(currentSection, draft);
        draft = null;
      }
      continue;
    }

    const h1 = trimmed.match(H1_RE);
    if (h1) {
      flushParagraph();
      if (draft && currentSection) {
        flushFormula(currentSection, draft);
        draft = null;
      }

      const raw = h1[1]!.trim();
      if (INDEX_TITLE_RE.test(raw) || BLOQUE_RE.test(raw)) {
        inIndex = INDEX_TITLE_RE.test(raw);
        currentSection = null;
        chapterKind = 'skip';
        continue;
      }
      if (SKIP_H1_RE.test(raw)) {
        inIndex = false;
        currentSection = null;
        chapterKind = 'skip';
        continue;
      }

      const numbered = raw.match(NUMBERED_CHAPTER_RE);
      if (!numbered) {
        // Title H1 without number — skip as catalog section
        currentSection = null;
        chapterKind = 'skip';
        continue;
      }

      const num = numbered[1]!;
      const title = numbered[2]!.trim();
      const n = Number(num);
      inIndex = false;

      if (n >= 1 && n <= 28) {
        chapterKind = 'catalog';
        const section = createChapter(num, title, sortOrder++);
        sections.push(section);
        currentSection = section;
        mapHeading = null;
      } else if (n === 29) {
        chapterKind = 'maps';
        const section = createChapter(num, title, sortOrder++);
        sections.push(section);
        currentSection = section;
        mapHeading = null;
      } else if (n === 30) {
        chapterKind = 'frontier';
        const section = createChapter(num, title, sortOrder++);
        sections.push(section);
        currentSection = section;
      } else {
        chapterKind = 'skip';
        currentSection = null;
      }
      continue;
    }

    if (inIndex || !currentSection) {
      continue;
    }

    const h2 = trimmed.match(H2_RE);
    if (h2) {
      flushParagraph();
      if (draft) {
        flushFormula(currentSection, draft);
        draft = null;
      }

      const raw = h2[1]!.trim();
      if (chapterKind === 'maps') {
        mapHeading = raw;
        continue;
      }
      if (chapterKind === 'frontier') {
        const note: NoteContent = { variant: 'info', markdown: `**${raw}**` };
        pushBlock(currentSection, 'note', note, [raw], raw);
        continue;
      }

      const formulaHeading = raw.match(FORMULA_HEADING_RE);
      if (formulaHeading && chapterKind === 'catalog') {
        draft = createFormulaDraft(formulaHeading[2]!.trim());
        continue;
      }

      // Non-formula H2 in catalog (rare) → text heading
      const text: TextContent = { markdown: `## ${raw}` };
      pushBlock(currentSection, 'text', text, [raw], raw);
      continue;
    }

    const h3 = trimmed.match(H3_RE);
    if (h3 && draft) {
      flushParagraph();
      const name = h3[1]!.trim().toLowerCase();
      if (name.startsWith('visualizaci')) {
        draft.mode = 'visual';
        draft.visual = draft.visual ?? {};
      } else if (name.startsWith('condici')) {
        draft.mode = 'conditions';
      } else if (name.startsWith('complejidad')) {
        draft.mode = 'complexity';
      } else if (name.startsWith('fórmulas relacionadas') || name.startsWith('formulas relacionadas')) {
        draft.mode = 'related';
      } else if (name.startsWith('interpretaci')) {
        draft.mode = 'interpretation';
      } else if (name.startsWith('aplicaci')) {
        draft.mode = 'applications';
      } else {
        draft.mode = 'body';
      }
      continue;
    }

    if (draft) {
      const idMatch = trimmed.match(ID_RE);
      if (idMatch) {
        flushParagraph();
        draft.formulaId = idMatch[1]!.trim();
        continue;
      }
      const levelMatch = trimmed.match(LEVEL_RE);
      if (levelMatch) {
        flushParagraph();
        draft.level = levelMatch[1]!.trim();
        continue;
      }
      const detailMatch = trimmed.match(DETAIL_RE);
      if (detailMatch) {
        flushParagraph();
        draft.detail = detailMatch[1]!.trim();
        draft.mode = 'body';
        continue;
      }

      if (draft.mode === 'visual') {
        const field = trimmed.match(VISUAL_FIELD_RE);
        if (field) {
          flushParagraph();
          applyVisualField(draft, field[1]!, field[2]!);
          continue;
        }
        // Also accept list items "- **Tipo:** ..."
        const listField = trimmed.match(/^[-*]\s+(.*)$/);
        if (listField) {
          const inner = listField[1]!.match(VISUAL_FIELD_RE);
          if (inner) {
            flushParagraph();
            applyVisualField(draft, inner[1]!, inner[2]!);
            continue;
          }
        }
      }

      if (draft.mode === 'conditions') {
        const list = parseList(lines, i);
        if (list) {
          flushParagraph();
          draft.constraints.push(...list.items.map(stripInlineNoise));
          i = list.end;
          continue;
        }
      }

      if (draft.mode === 'related') {
        const list = parseList(lines, i);
        if (list) {
          flushParagraph();
          for (const item of list.items) {
            for (const m of item.matchAll(RELATED_ID_RE)) {
              if (!draft.relatedIds.includes(m[1]!)) draft.relatedIds.push(m[1]!);
            }
          }
          i = list.end;
          continue;
        }
        for (const m of trimmed.matchAll(RELATED_ID_RE)) {
          if (!draft.relatedIds.includes(m[1]!)) draft.relatedIds.push(m[1]!);
        }
        if (RELATED_ID_RE.test(trimmed)) {
          RELATED_ID_RE.lastIndex = 0;
          continue;
        }
      }

      if (draft.mode === 'complexity') {
        const math = parseDisplayMath(lines, i);
        if (math) {
          flushParagraph();
          draft.computationalMarkdown.push(`$$\n${math.latex}\n$$`);
          i = math.end;
          continue;
        }
      }
    }

    const math = parseDisplayMath(lines, i);
    if (math && draft) {
      flushParagraph();
      draft.latex.push(math.latex);
      draft.latexLabels.push(draft.pendingLabel);
      draft.pendingLabel = null;
      i = math.end;
      continue;
    }

    const fence = parseFence(lines, i);
    if (fence && currentSection) {
      flushParagraph();
      if (chapterKind === 'maps') {
        const items = fence.body
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean);
        if (items.length) {
          const list: ListContent = { items, ordered: false };
          pushBlock(currentSection, 'list', list, items.map(stripInlineNoise), mapHeading);
        }
        i = fence.end;
        continue;
      }
      if (draft) {
        draft.notes.push(`\`\`\`\n${fence.body}\n\`\`\``);
      } else {
        const text: TextContent = { markdown: `\`\`\`text\n${fence.body}\n\`\`\`` };
        pushBlock(currentSection, 'text', text, [fence.body], null);
      }
      i = fence.end;
      continue;
    }

    if (!draft && chapterKind === 'frontier') {
      const list = parseList(lines, i);
      if (list) {
        flushParagraph();
        const content: ListContent = { items: list.items, ordered: list.ordered };
        pushBlock(currentSection, 'list', content, list.items.map(stripInlineNoise), null);
        i = list.end;
        continue;
      }
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
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
    stats: {
      sectionCount: sections.length,
      blockCount,
      formulaCount,
      tableCount,
    },
  };
}
