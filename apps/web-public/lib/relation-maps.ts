/** Lines that look like concept chains: A → B → C or A ↔ B. */
const ARROW_RE = /→|↔|->|<->/;

export function extractRelationPathLines(markdown: string): string[] | null {
  let body = markdown.trim();
  const fenced = body.match(/^```(?:text|txt)?[ \t]*\n([\s\S]*?)\n```$/);
  if (fenced) body = fenced[1]!.trim();
  const lines = body
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return null;
  if (!lines.every((line) => ARROW_RE.test(line))) return null;
  return lines;
}

export function splitRelationPath(line: string): {
  nodes: string[];
  edges: Array<'→' | '↔'>;
} {
  const tokens = line.split(/(\s*(?:→|↔|->|<->)\s*)/);
  const nodes: string[] = [];
  const edges: Array<'→' | '↔'> = [];
  for (const token of tokens) {
    const part = token.trim();
    if (!part) continue;
    if (part === '→' || part === '->') edges.push('→');
    else if (part === '↔' || part === '<->') edges.push('↔');
    else nodes.push(part);
  }
  return { nodes, edges };
}

export function isTitleOnlyNote(title: string | null | undefined, markdown: string): boolean {
  if (!title) return false;
  const stripped = markdown.replace(/\*\*/g, '').trim();
  return stripped === title.trim();
}

export function listLooksLikeRelationMap(items: string[]): boolean {
  return items.length > 0 && items.every((item) => ARROW_RE.test(item));
}
