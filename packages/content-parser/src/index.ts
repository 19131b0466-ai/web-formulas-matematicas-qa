export {
  parseFormulasMarkdown,
  parseCalculoDiferencialMarkdown,
  type ParseFormulasOptions,
} from './parse-markdown.js';
export {
  parsePhysicsMarkdown,
  parseFisicaElectronicaMarkdown,
  type PhysicsMarkdownParseOptions,
} from './parse-physics-markdown.js';
export { parseAlgebraMarkdown } from './parse-algebra-markdown.js';
export { enrichCalculoFormulas, extractConstraintsFromLatex } from './enrich-calculo.js';
export { enrichCalculoDiferencialFormulas } from './enrich-calculo-diferencial.js';
export { slugify } from './slugify.js';
export {
  inferTags,
  tagsForSection,
  SECTION_SLUG_OVERRIDES,
  DIFFERENTIAL_SECTION_SLUG_OVERRIDES,
  PHYSICS_SECTION_SLUG_OVERRIDES,
  ELECTRONICS_SECTION_SLUG_OVERRIDES,
  ALGEBRA_SECTION_SLUG_OVERRIDES,
} from './tags.js';
export type { ParseResult, ParsedBlock, ParsedSection } from './types.js';
