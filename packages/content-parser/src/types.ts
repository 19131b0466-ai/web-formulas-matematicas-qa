import type { BlockType, ContentBlockContent } from '@repo/shared-types';

export interface ParsedBlock {
  blockType: BlockType;
  title: string | null;
  content: ContentBlockContent;
  searchText: string;
  tags: string[];
  sortOrder: number;
  /** Stable formula code when present (physics). */
  formulaCode?: string | null;
}

export interface ParsedSection {
  slug: string;
  number: string;
  title: string;
  description: string | null;
  sortOrder: number;
  parentSlug: string | null;
  blocks: ParsedBlock[];
}

export interface ParseResult {
  sections: ParsedSection[];
  stats: {
    sectionCount: number;
    blockCount: number;
    formulaCount: number;
    tableCount: number;
  };
}
