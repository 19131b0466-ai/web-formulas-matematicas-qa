/**
 * Boolean algebra engine: parser, evaluator, truth tables, SOP/POS builders.
 */

export type Bit = 0 | 1;
export type Assignment = Record<string, Bit>;

export type BoolNode =
  | { kind: 'var'; name: string }
  | { kind: 'const'; value: Bit }
  | { kind: 'not'; child: BoolNode }
  | { kind: 'and'; left: BoolNode; right: BoolNode }
  | { kind: 'or'; left: BoolNode; right: BoolNode }
  | { kind: 'xor'; left: BoolNode; right: BoolNode }
  | { kind: 'impl'; left: BoolNode; right: BoolNode }
  | { kind: 'iff'; left: BoolNode; right: BoolNode };

export type ParseResult =
  | { ok: true; ast: BoolNode; variables: string[] }
  | { ok: false; error: string };

type Token =
  | { type: 'var'; value: string }
  | { type: 'num'; value: Bit }
  | { type: 'op'; value: string }
  | { type: 'lparen' }
  | { type: 'rparen' };

const DEFAULT_VARS = ['A', 'B', 'C', 'D', 'E'] as const;
const MAX_VARS = 5;

function tokenize(input: string): Token[] | string {
  const tokens: Token[] = [];
  let i = 0;
  const s = input.replace(/\s+/g, '');

  while (i < s.length) {
    const ch = s[i];
    if (ch === '(') {
      tokens.push({ type: 'lparen' });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'rparen' });
      i++;
      continue;
    }
    if (ch === '0' || ch === '1') {
      tokens.push({ type: 'num', value: Number(ch) as Bit });
      i++;
      continue;
    }
    if (/[A-Za-z]/.test(ch)) {
      let name = ch;
      i++;
      while (i < s.length && /[A-Za-z0-9]/.test(s[i])) {
        name += s[i];
        i++;
      }
      tokens.push({ type: 'var', value: name.toUpperCase() });
      continue;
    }
    const two = s.slice(i, i + 2);
    if (two === '¬(' || ch === '¬') {
      tokens.push({ type: 'op', value: '¬' });
      i += ch === '¬' ? 1 : 1;
      continue;
    }
    if (['∧', '∨', '⊕', '→', '↔', '+', '·', '*', '&', '|'].includes(ch)) {
      const map: Record<string, string> = {
        '+': '∨',
        '·': '∧',
        '*': '∧',
        '&': '∧',
        '|': '∨',
      };
      tokens.push({ type: 'op', value: map[ch] ?? ch });
      i++;
      continue;
    }
    if (two === '->') {
      tokens.push({ type: 'op', value: '→' });
      i += 2;
      continue;
    }
    if (two === '<->') {
      tokens.push({ type: 'op', value: '↔' });
      i += 2;
      continue;
    }
    return `Carácter no reconocido: ${ch}`;
  }
  return tokens;
}

class Parser {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): BoolNode | string {
    const node = this.parseIff();
    if (typeof node === 'string') return node;
    if (this.pos < this.tokens.length) return 'Tokens sobrantes después de la expresión';
    return node;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private consume(): Token | undefined {
    return this.tokens[this.pos++];
  }

  private parseIff(): BoolNode | string {
    let left = this.parseImpl();
    if (typeof left === 'string') return left;
    while (this.peek()?.type === 'op' && (this.peek() as Token & { value: string }).value === '↔') {
      this.consume();
      const right = this.parseImpl();
      if (typeof right === 'string') return right;
      left = { kind: 'iff', left, right };
    }
    return left;
  }

  private parseImpl(): BoolNode | string {
    let left = this.parseOr();
    if (typeof left === 'string') return left;
    while (this.peek()?.type === 'op' && (this.peek() as Token & { value: string }).value === '→') {
      this.consume();
      const right = this.parseOr();
      if (typeof right === 'string') return right;
      left = { kind: 'impl', left, right };
    }
    return left;
  }

  private parseOr(): BoolNode | string {
    let left = this.parseXor();
    if (typeof left === 'string') return left;
    while (this.peek()?.type === 'op' && (this.peek() as Token & { value: string }).value === '∨') {
      this.consume();
      const right = this.parseXor();
      if (typeof right === 'string') return right;
      left = { kind: 'or', left, right };
    }
    return left;
  }

  private parseXor(): BoolNode | string {
    let left = this.parseAnd();
    if (typeof left === 'string') return left;
    while (this.peek()?.type === 'op' && (this.peek() as Token & { value: string }).value === '⊕') {
      this.consume();
      const right = this.parseAnd();
      if (typeof right === 'string') return right;
      left = { kind: 'xor', left, right };
    }
    return left;
  }

  private parseAnd(): BoolNode | string {
    let left = this.parseNot();
    if (typeof left === 'string') return left;
    while (
      (this.peek()?.type === 'op' && (this.peek() as Token & { value: string }).value === '∧') ||
      (this.peek()?.type === 'var') ||
      (this.peek()?.type === 'num') ||
      (this.peek()?.type === 'lparen') ||
      (this.peek()?.type === 'op' && (this.peek() as Token & { value: string }).value === '¬')
    ) {
      const next = this.peek();
      if (!next) break;
      if (next.type === 'op' && next.value === '∧') {
        this.consume();
      } else if (
        next.type === 'var' ||
        next.type === 'num' ||
        next.type === 'lparen' ||
        (next.type === 'op' && next.value === '¬')
      ) {
        // implicit AND (juxtaposition like AB)
      } else {
        break;
      }
      const right = this.parseNot();
      if (typeof right === 'string') return right;
      left = { kind: 'and', left, right };
    }
    return left;
  }

  private parseNot(): BoolNode | string {
    const tok = this.peek();
    if (tok?.type === 'op' && tok.value === '¬') {
      this.consume();
      const child = this.parseNot();
      if (typeof child === 'string') return child;
      return { kind: 'not', child };
    }
    return this.parsePrimary();
  }

  private parsePrimary(): BoolNode | string {
    const tok = this.consume();
    if (!tok) return 'Expresión incompleta';
    if (tok.type === 'var') return { kind: 'var', name: tok.value };
    if (tok.type === 'num') return { kind: 'const', value: tok.value };
    if (tok.type === 'lparen') {
      const inner = this.parseIff();
      if (typeof inner === 'string') return inner;
      const close = this.consume();
      if (close?.type !== 'rparen') return 'Falta paréntesis de cierre';
      return inner;
    }
    return `Token inesperado`;
  }
}

export function extractVariables(ast: BoolNode): string[] {
  const set = new Set<string>();
  function walk(n: BoolNode) {
    if (n.kind === 'var') set.add(n.name);
    else if (n.kind === 'not') walk(n.child);
    else if (n.kind === 'const') return;
    else {
      walk(n.left);
      walk(n.right);
    }
  }
  walk(ast);
  return [...set].sort();
}

export function mergeVariables(...lists: string[][]): string[] {
  const set = new Set<string>();
  for (const list of lists) for (const v of list) set.add(v);
  return [...set].sort();
}

export function parseBooleanExpression(input: string): ParseResult {
  const tokens = tokenize(input);
  if (typeof tokens === 'string') return { ok: false, error: tokens };
  if (tokens.length === 0) return { ok: false, error: 'Expresión vacía' };
  const parser = new Parser(tokens);
  const ast = parser.parse();
  if (typeof ast === 'string') return { ok: false, error: ast };
  const variables = extractVariables(ast);
  if (variables.length > MAX_VARS) {
    return { ok: false, error: `Demasiadas variables (máx. ${MAX_VARS})` };
  }
  return { ok: true, ast, variables };
}

export function evaluateBooleanExpression(ast: BoolNode, assignment: Assignment): Bit {
  switch (ast.kind) {
    case 'var':
      return assignment[ast.name] ?? 0;
    case 'const':
      return ast.value;
    case 'not':
      return evaluateBooleanExpression(ast.child, assignment) === 0 ? 1 : 0;
    case 'and':
      return evaluateBooleanExpression(ast.left, assignment) &&
        evaluateBooleanExpression(ast.right, assignment)
        ? 1
        : 0;
    case 'or':
      return evaluateBooleanExpression(ast.left, assignment) ||
        evaluateBooleanExpression(ast.right, assignment)
        ? 1
        : 0;
    case 'xor':
      return evaluateBooleanExpression(ast.left, assignment) !==
        evaluateBooleanExpression(ast.right, assignment)
        ? 1
        : 0;
    case 'impl': {
      const a = evaluateBooleanExpression(ast.left, assignment);
      const b = evaluateBooleanExpression(ast.right, assignment);
      return a === 0 || b === 1 ? 1 : 0;
    }
    case 'iff':
      return evaluateBooleanExpression(ast.left, assignment) ===
        evaluateBooleanExpression(ast.right, assignment)
        ? 1
        : 0;
    default:
      return 0;
  }
}

export function generateAssignments(variables: string[]): Assignment[] {
  const n = variables.length;
  const count = 2 ** n;
  const result: Assignment[] = [];
  for (let i = 0; i < count; i++) {
    const row: Assignment = {};
    for (let j = 0; j < n; j++) {
      const bit = ((i >> (n - 1 - j)) & 1) as Bit;
      row[variables[j]] = bit;
    }
    result.push(row);
  }
  return result;
}

export function assignmentToIndex(assignment: Assignment, variables: string[]): number {
  let idx = 0;
  for (const v of variables) {
    idx = (idx << 1) | (assignment[v] ?? 0);
  }
  return idx;
}

export function indexToAssignment(index: number, variables: string[]): Assignment {
  const row: Assignment = {};
  const n = variables.length;
  for (let j = 0; j < n; j++) {
    const bit = ((index >> (n - 1 - j)) & 1) as Bit;
    row[variables[j]] = bit;
  }
  return row;
}

export function buildTruthVector(ast: BoolNode, assignments: Assignment[]): Bit[] {
  return assignments.map((a) => evaluateBooleanExpression(ast, a));
}

export function compareTruthVectors(f: Bit[], g: Bit[]): {
  matches: number;
  differences: number;
  mismatchIndices: number[];
  isEquivalent: boolean;
} {
  const mismatchIndices: number[] = [];
  let matches = 0;
  for (let i = 0; i < f.length; i++) {
    if (f[i] === g[i]) matches++;
    else mismatchIndices.push(i);
  }
  return {
    matches,
    differences: f.length - matches,
    mismatchIndices,
    isEquivalent: mismatchIndices.length === 0,
  };
}

export function xorBits(a: Bit, b: Bit): Bit {
  return (a !== b ? 1 : 0) as Bit;
}

export function xorTruthVectors(f: Bit[], g: Bit[]): Bit[] {
  return f.map((v, i) => xorBits(v, g[i]));
}

export function booleanEquivalent(
  astF: BoolNode,
  astG: BoolNode,
  variables: string[],
): boolean {
  const assignments = generateAssignments(variables);
  const f = buildTruthVector(astF, assignments);
  const g = buildTruthVector(astG, assignments);
  return compareTruthVectors(f, g).isEquivalent;
}

/** Render AST to standard notation */
export function renderExpression(ast: BoolNode, parentPrec = 0): string {
  const prec: Record<BoolNode['kind'], number> = {
    const: 10,
    var: 10,
    not: 9,
    and: 8,
    xor: 7,
    or: 6,
    impl: 5,
    iff: 4,
  };

  const p = prec[ast.kind];
  const wrap = (s: string) => (p < parentPrec ? `(${s})` : s);

  switch (ast.kind) {
    case 'var':
      return ast.name;
    case 'const':
      return String(ast.value);
    case 'not':
      return wrap(`¬${renderExpression(ast.child, 9)}`);
    case 'and':
      return wrap(`${renderExpression(ast.left, 8)}∧${renderExpression(ast.right, 8)}`);
    case 'or':
      return wrap(`${renderExpression(ast.left, 6)}∨${renderExpression(ast.right, 6)}`);
    case 'xor':
      return wrap(`${renderExpression(ast.left, 7)}⊕${renderExpression(ast.right, 7)}`);
    case 'impl':
      return wrap(`${renderExpression(ast.left, 5)}→${renderExpression(ast.right, 5)}`);
    case 'iff':
      return wrap(`${renderExpression(ast.left, 4)}↔${renderExpression(ast.right, 4)}`);
    default:
      return '?';
  }
}

/** SOP minterm: 0→¬var, 1→var */
export function buildMinterm(assignment: Assignment, variables: string[]): string {
  return variables
    .map((v) => (assignment[v] === 1 ? v : `¬${v}`))
    .join('');
}

/** POS maxterm: 0→var, 1→¬var */
export function buildMaxterm(assignment: Assignment, variables: string[]): string {
  const terms = variables.map((v) => (assignment[v] === 0 ? v : `¬${v}`));
  return terms.join('+');
}

export function renderMaxtermProduct(assignment: Assignment, variables: string[]): string {
  return `(${buildMaxterm(assignment, variables)})`;
}

export function buildCanonicalSOP(outputs: Bit[], variables: string[]): {
  indices: number[];
  terms: string[];
  expression: string;
  notation: string;
} {
  const assignments = generateAssignments(variables);
  const indices: number[] = [];
  const terms: string[] = [];
  outputs.forEach((out, i) => {
    if (out === 1) {
      indices.push(i);
      terms.push(buildMinterm(assignments[i], variables));
    }
  });
  if (terms.length === 0) {
    return { indices, terms, expression: '0', notation: '—' };
  }
  const expression = terms.join('+');
  const notation = `Σm(${indices.join(',')})`;
  return { indices, terms, expression, notation };
}

export function buildCanonicalPOS(outputs: Bit[], variables: string[]): {
  indices: number[];
  terms: string[];
  expression: string;
  notation: string;
} {
  const assignments = generateAssignments(variables);
  const indices: number[] = [];
  const terms: string[] = [];
  outputs.forEach((out, i) => {
    if (out === 0) {
      indices.push(i);
      terms.push(buildMaxterm(assignments[i], variables));
    }
  });
  if (terms.length === 0) {
    return { indices, terms, expression: '1', notation: '—' };
  }
  const expression = terms.map((t) => `(${t})`).join('');
  const notation = `ΠM(${indices.join(',')})`;
  return { indices, terms, expression, notation };
}

export function evaluateFromOutputs(
  outputs: Bit[],
  assignment: Assignment,
  variables: string[],
): Bit {
  const assignments = generateAssignments(variables);
  const i = assignments.findIndex((a) =>
    variables.every((v) => a[v] === assignment[v]),
  );
  return i >= 0 ? outputs[i] : 0;
}

export function verifyOutputsMatch(
  outputs: Bit[],
  expression: string,
  variables: string[],
): boolean {
  if (expression === '0') return outputs.every((o) => o === 0);
  if (expression === '1') return outputs.every((o) => o === 1);
  const parsed = parseBooleanExpression(expression);
  if (!parsed.ok) return false;
  const assignments = generateAssignments(variables);
  const computed = buildTruthVector(parsed.ast, assignments);
  return computed.every((v, i) => v === outputs[i]);
}

// ── Primitive ops for simple visualizers ────────────────────────────────────

export const BOOL = {
  not: (a: Bit) => (a === 0 ? 1 : 0) as Bit,
  and: (a: Bit, b: Bit) => (a && b ? 1 : 0) as Bit,
  or: (a: Bit, b: Bit) => (a || b ? 1 : 0) as Bit,
  xor: (a: Bit, b: Bit) => (a !== b ? 1 : 0) as Bit,
  impl: (a: Bit, b: Bit) => (a === 0 || b === 1 ? 1 : 0) as Bit,
  iff: (a: Bit, b: Bit) => (a === b ? 1 : 0) as Bit,
};

export function assignmentKey(assignment: Assignment, variables: string[]): string {
  return variables.map((v) => assignment[v]).join('');
}

// ── Equivalence presets ───────────────────────────────────────────────────────

export type EquivalencePreset = {
  id: string;
  label: string;
  exprF: string;
  exprG: string;
};

export const EQUIVALENCE_PRESETS: EquivalencePreset[] = [
  { id: 'xnor', label: 'XNOR', exprF: '¬(A⊕B)', exprG: '(A∧B)∨(¬A∧¬B)' },
  { id: 'demorgan1', label: 'De Morgan', exprF: '¬(A∧B)', exprG: '¬A∨¬B' },
  { id: 'demorgan2', label: 'De Morgan 2', exprF: '¬(A∨B)', exprG: '¬A∧¬B' },
  { id: 'implication', label: 'Implicación', exprF: 'A→B', exprG: '¬A∨B' },
  { id: 'double-neg', label: 'Doble negación', exprF: '¬¬A', exprG: 'A' },
  { id: 'absorption-or', label: 'Absorción', exprF: 'A∨(A∧B)', exprG: 'A' },
  { id: 'absorption-and', label: 'Absorción dual', exprF: 'A∧(A∨B)', exprG: 'A' },
  { id: 'distributivity', label: 'Distributividad', exprF: 'A∧(B∨C)', exprG: '(A∧B)∨(A∧C)' },
  { id: 'idempotent-or', label: 'Idempotencia', exprF: 'A∨A', exprG: 'A' },
  { id: 'not-equiv', label: 'No equivalentes', exprF: 'A∨B', exprG: 'A∧B' },
];

// ── SOP/POS presets ───────────────────────────────────────────────────────────

export type FunctionPreset = {
  id: string;
  label: string;
  variables: string[];
  outputs: Bit[];
  note?: string;
};

function outputs2(bits: string): Bit[] {
  return bits.split('').map((c) => Number(c) as Bit);
}

export const SOP_PRESETS: FunctionPreset[] = [
  { id: 'implication', label: 'Implicación', variables: ['A', 'B'], outputs: outputs2('1101'), note: 'A→B' },
  { id: 'or', label: 'OR', variables: ['A', 'B'], outputs: outputs2('0111') },
  { id: 'and', label: 'AND', variables: ['A', 'B'], outputs: outputs2('0001') },
  { id: 'xor', label: 'XOR', variables: ['A', 'B'], outputs: outputs2('0110') },
  { id: 'xnor', label: 'XNOR', variables: ['A', 'B'], outputs: outputs2('1001') },
  { id: 'single', label: 'Una sola fila en 1', variables: ['A', 'B'], outputs: outputs2('0100') },
  { id: 'const0', label: 'Constante 0', variables: ['A', 'B'], outputs: outputs2('0000') },
  { id: 'const1', label: 'Constante 1', variables: ['A', 'B'], outputs: outputs2('1111') },
];

export const POS_PRESETS: FunctionPreset[] = [
  { id: 'xnor', label: 'XNOR', variables: ['A', 'B'], outputs: outputs2('1001'), note: 'A↔B' },
  { id: 'or', label: 'OR', variables: ['A', 'B'], outputs: outputs2('0111') },
  { id: 'and', label: 'AND', variables: ['A', 'B'], outputs: outputs2('0001') },
  { id: 'xor', label: 'XOR', variables: ['A', 'B'], outputs: outputs2('0110') },
  { id: 'implication', label: 'Implicación', variables: ['A', 'B'], outputs: outputs2('1101'), note: 'A→B' },
  { id: 'single', label: 'Una sola fila cero', variables: ['A', 'B'], outputs: outputs2('0111') },
  { id: 'const1', label: 'Constante 1', variables: ['A', 'B'], outputs: outputs2('1111') },
  { id: 'const0', label: 'Constante 0', variables: ['A', 'B'], outputs: outputs2('0000') },
];

export { DEFAULT_VARS, MAX_VARS };
