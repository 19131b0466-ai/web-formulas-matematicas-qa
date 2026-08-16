/**
 * Closed lesson modes for algebra visualizations.
 * Prefer `visual.mode` from content; fall back to formulaId inference.
 */

export type AlgebraTilesMode =
  | 'commute'
  | 'associate'
  | 'distribute'
  | 'square'
  | 'square_minus'
  | 'diff_sq'
  | 'binomial'
  | 'poly_grid'
  | 'complete_square'
  | 'degree'
  | 'power'
  | 'conjugate_rationalize';

export type MatrixMode =
  | 'basic'
  | 'size'
  | 'sum'
  | 'scale'
  | 'product'
  | 'transpose'
  | 'symmetric'
  | 'augmented_map'
  | 'row_ops'
  | 'rank_compare'
  | 'code'
  | 'identity'
  | 'lu';

export type VectorMode =
  | 'basic'
  | 'rn'
  | 'norm'
  | 'proj'
  | 'angle'
  | 'dot'
  | 'unit'
  | 'complex'
  | 'conjugate'
  | 'moivre_power'
  | 'combo'
  | 'euler'
  | 'distance';

export type GraphMode =
  | 'line'
  | 'quadratic'
  | 'inequality'
  | 'system'
  | 'exp'
  | 'log'
  | 'reciprocal'
  | 'sequence'
  | 'inverse_pair'
  | 'poly_system';

export type MatrixTransformMode = 'map' | 'eigen' | 'svd' | 'low_rank' | 'inverse' | 'qr';

export function inferAlgebraTilesMode(formulaId: string): AlgebraTilesMode {
  if (formulaId.includes('FND-001')) return 'commute';
  if (formulaId.includes('FND-002')) return 'associate';
  if (formulaId.includes('FND-003') || formulaId.includes('FAC-001')) return 'distribute';
  if (formulaId.includes('EQU-005')) return 'complete_square';
  if (formulaId.includes('POL-008')) return 'degree';
  // POT-008 is conjugate rationalization, NOT a power law
  if (formulaId.includes('POT-008')) return 'conjugate_rationalize';
  // Other POT- formulas are power laws
  if (/POT-/.test(formulaId)) return 'power';
  if (formulaId.includes('IDN-002')) return 'square_minus';
  if (/IDN-001|FAC-003/.test(formulaId)) return 'square';
  if (/IDN-003|FAC-002/.test(formulaId)) return 'diff_sq';
  if (formulaId.includes('IDN-008')) return 'binomial';
  if (formulaId.includes('EXP-003')) return 'poly_grid';
  return 'commute';
}

export function inferMatrixMode(formulaId: string): MatrixMode {
  if (/COD-002|COD-003/.test(formulaId)) return 'code';
  if (formulaId.includes('MAT-005')) return 'identity';
  if (formulaId.includes('DEC-001')) return 'lu';
  if (formulaId.includes('SIS-004')) return 'row_ops';
  if (formulaId.includes('SIS-003') || formulaId.includes('SIS-005') || /DET-006|LSQ-/.test(formulaId)) {
    return formulaId.includes('SIS-005') ? 'rank_compare' : 'augmented_map';
  }
  if (/MAT-004|DET-003/.test(formulaId)) return 'product';
  if (/MAT-003|NOR-/.test(formulaId)) return 'scale';
  if (formulaId.includes('MAT-007')) return 'symmetric';
  if (/MAT-006/.test(formulaId)) return 'transpose';
  if (/MAT-002/.test(formulaId)) return 'sum';
  if (formulaId.includes('MAT-001')) return 'size';
  return 'basic';
}

export function inferVectorMode(formulaId: string): VectorMode {
  if (formulaId.includes('COM-006')) return 'moivre_power';
  if (formulaId.includes('COM-005')) return 'euler';
  if (formulaId.includes('COM-002')) return 'conjugate';
  if (formulaId.includes('ORT-002')) return 'proj';
  if (formulaId.includes('VEC-001')) return 'rn';
  if (formulaId.includes('VEC-002')) return 'norm';
  if (formulaId.includes('VEC-003')) return 'unit';
  if (formulaId.includes('VEC-004')) return 'dot';
  if (formulaId.includes('VEC-005')) return 'angle';
  if (formulaId.includes('VEC-006')) return 'distance';
  if (formulaId.includes('VEC-007')) return 'combo';
  if (/COM-/.test(formulaId)) return 'complex';
  return 'basic';
}

export function inferGraphMode(formulaId: string): GraphMode {
  if (/SEC-/.test(formulaId)) return 'sequence';
  if (/INE-002/.test(formulaId)) return 'inequality';
  if (/SIS-001/.test(formulaId)) return 'system';
  if (/FUN-003|LOG-002/.test(formulaId)) return 'inverse_pair';
  if (/LOG-001|LOG-007/.test(formulaId)) return 'exp';
  if (/FUN-001/.test(formulaId)) return 'reciprocal';
  if (/POL-010/.test(formulaId)) return 'poly_system';
  if (/EQU-003|EQU-004/.test(formulaId)) return 'quadratic';
  if (/EQU-001|FUN-005|FUN-006/.test(formulaId)) return 'line';
  return 'line';
}

export function inferMatrixTransformMode(formulaId: string): MatrixTransformMode {
  if (/DEC-004/.test(formulaId)) return 'svd';
  if (/DEC-005|NOR-007/.test(formulaId)) return 'low_rank';
  if (/DEC-002/.test(formulaId)) return 'qr';
  if (/EIG-|DEC-003/.test(formulaId)) return 'eigen';
  if (/TRA-006/.test(formulaId)) return 'inverse';
  return 'map';
}

export function resolveMode(
  formulaId: string,
  visualType: string,
  explicit?: string | null,
): string {
  const m = explicit?.trim().replace(/^`|`$/g, '');
  if (m) return m;
  switch (visualType) {
    case 'algebra_tiles':
      return inferAlgebraTilesMode(formulaId);
    case 'matrix':
      return inferMatrixMode(formulaId);
    case 'vector':
      return inferVectorMode(formulaId);
    case 'graph':
      return inferGraphMode(formulaId);
    case 'matrix_transform':
      return inferMatrixTransformMode(formulaId);
    case 'geometry':
      return formulaId.includes('COM-007') ? 'roots' : 'area';
    case 'modular_clock':
      return formulaId.includes('MOD-001') ? 'congruence' : 'arithmetic';
    case 'truth_table':
      return 'verify';
    default:
      return 'default';
  }
}

/**
 * Viz panels that already embed pedagogical guide copy inside the card.
 * For these, FormulaVisualization must NOT also render Idea / Objetivo above the panel.
 * Extend this list whenever a redesigned viz owns its own teaching text.
 */
export function vizHasEmbeddedGuide(formulaId: string): boolean {
  return /FND-006|FND-007|POT-001|POT-008|EXP-003|IDN-001|IDN-002|IDN-003|IDN-008|FAC-001|FAC-002|FAC-003|EQU-001|EQU-003|EQU-004|EQU-005|EQU-008|INE-001|INE-002|INE-003|INE-004|SIS-001|SIS-002|SIS-003|SIS-004|SIS-005|FUN-001|FUN-002|FUN-003|FUN-005|FUN-006|FUN-007|FUN-008|POL-007|POL-008|POL-009|POL-010|POL-011|LOG-001|LOG-002|LOG-007|COM-001|COM-002|COM-003|COM-004|COM-005|COM-006|COM-007|SEC-001|SEC-003|SEC-005|SEC-007|VEC-001|VEC-002|VEC-003|VEC-004|VEC-005|VEC-006|VEC-007|MAT-001|MAT-002|MAT-003|MAT-004|MAT-005|MAT-006|MAT-007|DET-001|DET-002|DET-003|DET-004|DET-005|DET-006|ESP-001|ESP-002|ESP-003|ESP-004|ESP-005|ESP-006|ESP-007|TRA-001|TRA-002|TRA-003|TRA-004|TRA-005|TRA-006|TRA-007|EIG-001|EIG-002|EIG-003|EIG-004|EIG-005|EIG-006|ORT-001|ORT-002|ORT-003|ORT-004/.test(
    formulaId,
  );
}

