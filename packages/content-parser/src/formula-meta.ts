export type FaqDraft = { question: string; answer: string };

export const FAQ_QUESTION_RE = /^\*\*(?:Pregunta|Question|Frage|Domanda):\*\*\s*(.*)$/i;
export const FAQ_ANSWER_RE =
  /^\*\*(?:Respuesta|Answer|Antwort|Resposta|Risposta):\*\*\s*(.*)$/i;
export const UNIT_RE = /^\*\*Unidad:\*\*\s*(.*)$/i;
export const INTUITIVE_RE = /^\*\*Explicaci[oó]n intuitiva:\*\*\s*(.*)$/i;
export const DERIVATION_RE = /^\*\*Derivaci[oó]n:\*\*\s*(.*)$/i;
export const FORMAL_DEF_RE = /^\*\*Definici[oó]n formal:\*\*\s*(.*)$/i;
export const WORKED_EXAMPLE_RE = /^\*\*Ejemplo resuelto:\*\*\s*(.*)$/i;
export const EQUIV_NOTATIONS_RE = /^\*\*Notaciones equivalentes:\*\*\s*(.*)$/i;
export const LAST_REVIEWED_RE = /^\*\*[ÚU]ltima revisi[oó]n:\*\*\s*(.*)$/i;
export const SEARCH_ALIASES_RE =
  /^\*\*(?:Alias de b[uú]squeda|Also searched as|También buscan|Search aliases):\*\*\s*(.*)$/i;

export type FaqAccumulator = {
  items: FaqDraft[];
  pendingQuestion: string | null;
};

export type EditorialDraft = {
  intuitiveExplanation: string | null;
  derivation: string | null;
  formalDefinition: string | null;
  workedExample: string | null;
  equivalentNotations: string[];
  searchAliases: string[];
  lastReviewedAt: string | null;
};

export function createFaqAccumulator(): FaqAccumulator {
  return { items: [], pendingQuestion: null };
}

export function createEditorialDraft(): EditorialDraft {
  return {
    intuitiveExplanation: null,
    derivation: null,
    formalDefinition: null,
    workedExample: null,
    equivalentNotations: [],
    searchAliases: [],
    lastReviewedAt: null,
  };
}

function splitNotations(raw: string): string[] {
  return raw
    .split(/;|\|/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function absorbFaqLine(acc: FaqAccumulator, trimmed: string): boolean {
  const qMatch = trimmed.match(FAQ_QUESTION_RE);
  if (qMatch) {
    acc.pendingQuestion = qMatch[1]!.trim() || null;
    return true;
  }
  const aMatch = trimmed.match(FAQ_ANSWER_RE);
  if (aMatch) {
    const answer = aMatch[1]!.trim();
    if (acc.pendingQuestion && answer) {
      acc.items.push({ question: acc.pendingQuestion, answer });
    }
    acc.pendingQuestion = null;
    return true;
  }
  return false;
}

export function absorbUnitLine(conventions: string[], trimmed: string): boolean {
  const unitMatch = trimmed.match(UNIT_RE);
  if (unitMatch) {
    const value = unitMatch[1]!.trim();
    if (value) conventions.push(value);
    return true;
  }
  return false;
}

export function absorbEditorialLine(draft: EditorialDraft, trimmed: string): boolean {
  const intuitive = trimmed.match(INTUITIVE_RE);
  if (intuitive) {
    draft.intuitiveExplanation = intuitive[1]!.trim() || null;
    return true;
  }
  const derivation = trimmed.match(DERIVATION_RE);
  if (derivation) {
    draft.derivation = derivation[1]!.trim() || null;
    return true;
  }
  const formal = trimmed.match(FORMAL_DEF_RE);
  if (formal) {
    draft.formalDefinition = formal[1]!.trim() || null;
    return true;
  }
  const example = trimmed.match(WORKED_EXAMPLE_RE);
  if (example) {
    draft.workedExample = example[1]!.trim() || null;
    return true;
  }
  const notations = trimmed.match(EQUIV_NOTATIONS_RE);
  if (notations) {
    draft.equivalentNotations.push(...splitNotations(notations[1]!));
    return true;
  }
  const reviewed = trimmed.match(LAST_REVIEWED_RE);
  if (reviewed) {
    draft.lastReviewedAt = reviewed[1]!.trim() || null;
    return true;
  }
  const aliases = trimmed.match(SEARCH_ALIASES_RE);
  if (aliases) {
    draft.searchAliases.push(...splitNotations(aliases[1]!));
    return true;
  }
  return false;
}

export function applyEditorialDraft(
  target: {
    intuitiveExplanation?: string;
    derivation?: string;
    formalDefinition?: string;
    workedExample?: string;
    equivalentNotations?: string[];
    lastReviewedAt?: string;
    searchAliases?: string[];
  },
  draft: EditorialDraft,
): void {
  if (draft.intuitiveExplanation) target.intuitiveExplanation = draft.intuitiveExplanation;
  if (draft.derivation) target.derivation = draft.derivation;
  if (draft.formalDefinition) target.formalDefinition = draft.formalDefinition;
  if (draft.workedExample) target.workedExample = draft.workedExample;
  if (draft.equivalentNotations.length) {
    target.equivalentNotations = [...draft.equivalentNotations];
  }
  if (draft.lastReviewedAt) target.lastReviewedAt = draft.lastReviewedAt;
  if (draft.searchAliases.length) target.searchAliases = [...draft.searchAliases];
}
