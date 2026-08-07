export type SymbolEntry = {
  symbol: string;
  meaning: string;
};

/**
 * Best-effort parse of physics "**Variables:**" prose into symbol rows.
 * Supports patterns like `\(A_x,A_y\): componentes` or `x, v — posición, velocidad`.
 */
export function parseVariableSymbols(raw: string | null | undefined): SymbolEntry[] {
  if (!raw?.trim()) return [];
  const text = raw.trim();

  // `symbol(s): meaning` (optionally separated by ; or newlines)
  const colonParts = text
    .split(/\n|;/)
    .map((p) => p.trim())
    .filter(Boolean);
  const fromColon: SymbolEntry[] = [];
  for (const part of colonParts) {
    const m = part.match(/^(.+?)\s*[:：]\s*(.+)$/);
    if (!m) continue;
    fromColon.push({ symbol: m[1]!.trim(), meaning: m[2]!.trim() });
  }
  if (fromColon.length > 0) return fromColon;

  // `symbols — meanings` / `symbols - meanings`
  const dash = text.match(/^(.+?)\s+[—–-]\s+(.+)$/);
  if (dash) {
    return [{ symbol: dash[1]!.trim(), meaning: dash[2]!.trim() }];
  }

  return [{ symbol: text, meaning: '' }];
}
