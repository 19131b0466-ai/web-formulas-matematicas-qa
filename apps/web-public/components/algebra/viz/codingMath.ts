/** Shared linear coding theory utilities over finite fields (primarily F₂). */

export type Bit = 0 | 1;
export type BitVector = Bit[];
export type Matrix = number[][];

export interface LinearCodeExample {
  q: number;
  n: number;
  k: number;
  G: Matrix;
  H: Matrix;
  label: string;
}

/** Binary [3,2] code: C = {000, 011, 101, 110}. H = [1,1,1] satisfies HGᵀ = 0. */
export const TOY_CODE: LinearCodeExample = {
  q: 2,
  n: 3,
  k: 2,
  G: [
    [1, 0, 1],
    [0, 1, 1],
  ],
  H: [[1, 1, 1]],
  label: '[3,2]₂',
};

/** Hamming(7,4) parity-check matrix; columns are binary 1…7. */
export const HAMMING_74: LinearCodeExample = {
  q: 2,
  n: 7,
  k: 4,
  G: [
    [1, 0, 0, 0, 1, 0, 1],
    [0, 1, 0, 0, 1, 1, 1],
    [0, 0, 1, 0, 0, 1, 1],
    [0, 0, 0, 1, 1, 1, 0],
  ],
  H: [
    [1, 0, 1, 0, 1, 0, 1],
    [0, 1, 1, 0, 0, 1, 1],
    [0, 0, 0, 1, 1, 1, 1],
  ],
  label: 'Hamming (7,4)',
};

export function mod2(n: number): Bit {
  return ((n % 2) + 2) % 2 ? 1 : 0;
}

export function vectorToString(v: BitVector): string {
  return v.map(String).join('');
}

export function parseBinaryWord(s: string, length: number): BitVector {
  const cleaned = s.replace(/[^01]/g, '');
  const bits = cleaned.split('').map((c) => Number(c) as Bit);
  while (bits.length < length) bits.unshift(0);
  return bits.slice(-length) as BitVector;
}

export function zeroWord(length: number): BitVector {
  return Array(length).fill(0) as BitVector;
}

export function xorVectors(a: BitVector, b: BitVector): BitVector {
  const n = Math.max(a.length, b.length);
  return Array.from({ length: n }, (_, i) => mod2((a[i] ?? 0) ^ (b[i] ?? 0)));
}

export function addVectorsGF2(a: BitVector, b: BitVector): BitVector {
  return xorVectors(a, b);
}

export function scalarMultiplyVector(alpha: Bit, v: BitVector): BitVector {
  if (alpha === 0) return zeroWord(v.length);
  return [...v] as BitVector;
}

export function multiplyMatrixVectorMod2(H: Matrix, v: BitVector): BitVector {
  return H.map((row) => {
    let sum = 0;
    for (let j = 0; j < row.length; j++) sum ^= (row[j] ?? 0) & (v[j] ?? 0);
    return mod2(sum);
  });
}

export function multiplyMessageByGenerator(message: BitVector, G: Matrix): BitVector {
  const k = G.length;
  const n = G[0]?.length ?? 0;
  const result: Bit[] = Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    let sum = 0;
    for (let i = 0; i < k; i++) sum ^= (message[i] ?? 0) & (G[i]?.[j] ?? 0);
    result[j] = mod2(sum);
  }
  return result as BitVector;
}

export function combineGeneratorRows(message: BitVector, G: Matrix): BitVector {
  const k = G.length;
  let acc = zeroWord(G[0]?.length ?? 0);
  for (let i = 0; i < k; i++) {
    if (message[i] === 1) acc = xorVectors(acc, G[i] as BitVector);
  }
  return acc;
}

export function hammingDistance(a: BitVector | string, b: BitVector | string): number {
  const va = typeof a === 'string' ? parseBinaryWord(a, Math.max(a.length, (b as string).length)) : a;
  const vb = typeof b === 'string' ? parseBinaryWord(b, Math.max((a as string).length, b.length)) : b;
  const n = Math.max(va.length, vb.length);
  let d = 0;
  for (let i = 0; i < n; i++) if ((va[i] ?? 0) !== (vb[i] ?? 0)) d++;
  return d;
}

export function hammingWeight(word: BitVector | string): number {
  const v = typeof word === 'string' ? parseBinaryWord(word, word.length) : word;
  return v.filter((b) => b === 1).length;
}

export function xorWords(a: BitVector, b: BitVector): BitVector {
  return xorVectors(a, b);
}

export function getMismatchIndices(a: BitVector, b: BitVector): number[] {
  const n = Math.max(a.length, b.length);
  const out: number[] = [];
  for (let i = 0; i < n; i++) if ((a[i] ?? 0) !== (b[i] ?? 0)) out.push(i);
  return out;
}

export function vectorsEqual(a: BitVector, b: BitVector): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

export function findMatchingColumn(H: Matrix, syndrome: BitVector): number | null {
  if (syndrome.every((s) => s === 0)) return null;
  const n = H[0]?.length ?? 0;
  for (let j = 0; j < n; j++) {
    const col = H.map((row) => row[j] ?? 0);
    if (vectorsEqual(col as BitVector, syndrome)) return j;
  }
  return null;
}

export function getColumn(H: Matrix, j: number): BitVector {
  return H.map((row) => mod2(row[j] ?? 0)) as BitVector;
}

export function getParticipatingPositions(row: BitVector): number[] {
  return row.map((v, i) => (v === 1 ? i : -1)).filter((i) => i >= 0);
}

export function evaluateParityChecks(H: Matrix, word: BitVector) {
  return H.map((row, rowIndex) => {
    const positions = getParticipatingPositions(row as BitVector);
    const values = positions.map((p) => word[p] ?? 0);
    let result = 0;
    for (const v of values) result ^= v;
    return {
      rowIndex,
      participatingPositions: positions,
      values,
      result: mod2(result) as Bit,
    };
  });
}

export function isValidCodeword(H: Matrix, word: BitVector): boolean {
  return multiplyMatrixVectorMod2(H, word).every((s) => s === 0);
}

export function enumerateVectorSpace(q: number, n: number, maxStates = 256): BitVector[] {
  const total = q ** n;
  if (total > maxStates) return [];
  const out: BitVector[] = [];
  for (let i = 0; i < total; i++) {
    const v: Bit[] = [];
    let x = i;
    for (let j = 0; j < n; j++) {
      v.unshift(mod2(x % q));
      x = Math.floor(x / q);
    }
    out.push(v);
  }
  return out;
}

export function enumerateKernel(H: Matrix, q = 2, maxStates = 256): BitVector[] {
  const n = H[0]?.length ?? 0;
  return enumerateVectorSpace(q, n, maxStates).filter((w) => isValidCodeword(H, w));
}

export function generateAllCodewords(G: Matrix, q = 2, maxStates = 256): BitVector[] {
  const k = G.length;
  const messages = enumerateVectorSpace(q, k, maxStates);
  const seen = new Set<string>();
  const out: BitVector[] = [];
  for (const m of messages) {
    const c = multiplyMessageByGenerator(m, G);
    const key = vectorToString(c);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(c);
    }
  }
  return out;
}

export function rankMatrixGF2(M: Matrix): number {
  const m = M.map((row) => [...row]);
  const rows = m.length;
  const cols = m[0]?.length ?? 0;
  let rank = 0;
  for (let col = 0, pivot = 0; col < cols && pivot < rows; col++) {
    let r = pivot;
    while (r < rows && m[r]![col] === 0) r++;
    if (r === rows) continue;
    if (r !== pivot) [m[pivot], m[r]] = [m[r]!, m[pivot]!];
    for (let i = 0; i < rows; i++) {
      if (i !== pivot && m[i]![col] === 1) {
        for (let j = col; j < cols; j++) m[i]![j] = mod2((m[i]![j] ?? 0) ^ (m[pivot]![j] ?? 0));
      }
    }
    rank++;
    pivot++;
  }
  return rank;
}

export function verifyGeneratorParityCompatibility(G: Matrix, H: Matrix): boolean {
  const k = G.length;
  const n = G[0]?.length ?? 0;
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let r = 0; r < H.length; r++) sum ^= (H[r]?.[j] ?? 0) & (G[i]?.[r] ?? 0);
      // HGᵀ: row j of H times column i of Gᵀ = column j of H dot row i of G
    }
  }
  // HGᵀ = 0: for each row i of G and col j of H: Σ_r H[r][j]*G[i][r] = 0
  // Actually: (HGᵀ)_{rj} = Σ_i H_{ri} G_{ji} — need careful indexing
  // Convention: c = mG (row vector), Hcᵀ = 0
  // H is (n-k)×n, G is k×n
  // Hcᵀ = H(mG)ᵀ = HGᵀmᵀ, so need HGᵀ = 0 (k×k zero matrix)
  // (HGᵀ)_{ij} = Σ_l H_{il} G_{jl} — row i of H dot row j of G
  for (let i = 0; i < H.length; i++) {
    for (let j = 0; j < k; j++) {
      let sum = 0;
      for (let l = 0; l < n; l++) sum ^= (H[i]?.[l] ?? 0) & (G[j]?.[l] ?? 0);
      if (mod2(sum) !== 0) return false;
    }
  }
  return true;
}

export function detectSystematicForm(G: Matrix): { isSystematic: boolean; k: number; P?: Matrix } {
  const k = G.length;
  const n = G[0]?.length ?? 0;
  if (k > n) return { isSystematic: false, k };
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      const expected = i === j ? 1 : 0;
      if ((G[i]?.[j] ?? 0) !== expected) return { isSystematic: false, k };
    }
  }
  const P = G.map((row) => row.slice(k)) as Matrix;
  return { isSystematic: true, k, P };
}

export function detectableErrors(dMin: number): number {
  return Math.max(0, dMin - 1);
}

export function correctableErrors(dMin: number): number {
  return Math.floor((dMin - 1) / 2);
}

export function generateWordsWithinRadius(word: BitVector, t: number): BitVector[] {
  const n = word.length;
  const out: BitVector[] = [word];
  if (t === 0) return out;

  function flipAt(base: BitVector, start: number, remaining: number) {
    if (remaining === 0) {
      out.push([...base] as BitVector);
      return;
    }
    for (let i = start; i < n; i++) {
      const next = [...base] as BitVector;
      next[i] = mod2(1 - (next[i] ?? 0));
      flipAt(next, i + 1, remaining - 1);
    }
  }

  for (let r = 1; r <= t; r++) flipAt(word, 0, r);
  return out;
}

export function flipBit(word: BitVector, index: number): BitVector {
  const next = [...word] as BitVector;
  next[index] = mod2(1 - (next[index] ?? 0));
  return next;
}

export function unitErrorVector(n: number, position: number): BitVector {
  const e = zeroWord(n);
  e[position] = 1;
  return e;
}

export function verifyAdditiveClosure(codewords: BitVector[]): boolean {
  for (const u of codewords) {
    for (const v of codewords) {
      const sum = addVectorsGF2(u, v);
      if (!codewords.some((c) => vectorsEqual(c, sum))) return false;
    }
  }
  return true;
}

export function verifyScalarClosure(codewords: BitVector[], q = 2): boolean {
  const scalars = enumerateVectorSpace(q, 1, q + 1).map((s) => s[0] ?? 0);
  for (const alpha of scalars) {
    for (const c of codewords) {
      const scaled = scalarMultiplyVector(alpha as Bit, c);
      if (!codewords.some((w) => vectorsEqual(w, scaled))) return false;
    }
  }
  return true;
}

export function verifyLinearSubspace(codewords: BitVector[], q = 2): boolean {
  const hasZero = codewords.some((c) => c.every((b) => b === 0));
  if (!hasZero) return false;
  return verifyAdditiveClosure(codewords) && verifyScalarClosure(codewords, q);
}

export function computeDimension(codewords: BitVector[]): number {
  if (codewords.length === 0) return 0;
  const n = codewords[0]?.length ?? 0;
  const basis: BitVector[] = [];
  for (const v of codewords) {
    if (v.every((b) => b === 0)) continue;
    let w = [...v] as BitVector;
    for (const b of basis) {
      if (w[b.findIndex((x) => x === 1)] === 1) w = xorVectors(w, b);
    }
    if (w.some((b) => b === 1)) basis.push(w);
  }
  return basis.length;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)} %`;
}

export function formatRate(n: number, k: number, decimals = 3): string {
  return (k / n).toFixed(decimals);
}
