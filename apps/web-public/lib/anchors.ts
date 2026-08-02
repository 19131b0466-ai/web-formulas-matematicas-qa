export function slugifyAnchor(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function blockAnchorId(opts: {
  sectionNumber: string;
  title: string | null;
  blockId: string;
  index: number;
}): string {
  if (opts.title) {
    const base = opts.sectionNumber
      ? `${opts.sectionNumber}-${slugifyAnchor(opts.title)}`
      : slugifyAnchor(opts.title);
    return base || opts.blockId.slice(0, 8);
  }
  return `bloque-${String(opts.index + 1)}`;
}
