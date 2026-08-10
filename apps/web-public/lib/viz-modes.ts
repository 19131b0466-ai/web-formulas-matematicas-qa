/**
 * Closed lesson modes for algebra visualizations.
 * Prefer `visual.mode` from content; fall back to formulaId inference.
 */

export type AlgebraTilesMode =
  | 'commute'
  | 'associate'
  | 'distribute'
  | 'square'
  | 'diff_sq'
  | 'binomial'
  | 'poly_grid'
  | 'complete_square'
  | 'degree'
  | 'power';

export type MatrixMode =
  | 'basic'
  | 'sum'
  | 'scale'
  | 'product'
  | 'transpose'
  | 'augmented_map'
  | 'row_ops'
  | 'rank_compare'
  | 'code';

export type VectorMode =
  | 'basic'
  | 'proj'
  | 'angle'
  | 'unit'
  | 'complex'
  | 'conjugate'
  | 'moivre_power'
  | 'combo';

export type GraphMode =
  | 'line'
  | 'quadratic'
  | 'inequality'
  | 'system'
  | 'exp'
  | 'log'
  | 'reciprocal'
  | 'sequence'
  | 'inverse_pair';

export type MatrixTransformMode = 'map' | 'eigen' | 'svd' | 'low_rank' | 'inverse';

export function inferAlgebraTilesMode(formulaId: string): AlgebraTilesMode {
  if (formulaId.includes('FND-001')) return 'commute';
  if (formulaId.includes('FND-002')) return 'associate';
  if (formulaId.includes('FND-003') || formulaId.includes('FAC-001')) return 'distribute';
  if (formulaId.includes('EQU-005')) return 'complete_square';
  if (formulaId.includes('POL-008')) return 'degree';
  if (/POT-/.test(formulaId)) return 'power';
  if (/IDN-001|IDN-002|FAC-003/.test(formulaId)) return 'square';
  if (/IDN-003|FAC-002/.test(formulaId)) return 'diff_sq';
  if (formulaId.includes('IDN-008')) return 'binomial';
  if (formulaId.includes('EXP-003')) return 'poly_grid';
  return 'commute';
}

export function inferMatrixMode(formulaId: string): MatrixMode {
  if (/COD-002|COD-003/.test(formulaId)) return 'code';
  if (formulaId.includes('SIS-004') || formulaId.includes('DEC-001')) return 'row_ops';
  if (formulaId.includes('SIS-003') || formulaId.includes('SIS-005') || /DET-006|LSQ-/.test(formulaId)) {
    return formulaId.includes('SIS-005') ? 'rank_compare' : 'augmented_map';
  }
  if (/MAT-004|DET-003/.test(formulaId)) return 'product';
  if (/MAT-003|NOR-/.test(formulaId)) return 'scale';
  if (/MAT-006|MAT-007/.test(formulaId)) return 'transpose';
  if (/MAT-002/.test(formulaId)) return 'sum';
  return 'basic';
}

export function inferVectorMode(formulaId: string): VectorMode {
  if (formulaId.includes('COM-006')) return 'moivre_power';
  if (formulaId.includes('COM-002')) return 'conjugate';
  if (/VEC-004|ORT-002/.test(formulaId)) return 'proj';
  if (formulaId.includes('VEC-005')) return 'angle';
  if (formulaId.includes('VEC-003') || formulaId.includes('COM-005')) return 'unit';
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
  if (/EQU-003|EQU-004|POL-010/.test(formulaId)) return 'quadratic';
  if (/EQU-001|FUN-005|FUN-006/.test(formulaId)) return 'line';
  return 'line';
}

export function inferMatrixTransformMode(formulaId: string): MatrixTransformMode {
  if (/DEC-004/.test(formulaId)) return 'svd';
  if (/DEC-005|NOR-007/.test(formulaId)) return 'low_rank';
  if (/EIG-|TRA-005/.test(formulaId)) return 'eigen';
  if (/MAT-005|TRA-004/.test(formulaId)) return 'inverse';
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
