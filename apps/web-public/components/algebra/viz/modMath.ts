/** Modular arithmetic utilities for interactive visualizations. */

export const FERMAT_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19] as const;

/** Primes used in finite-field Cayley table visualizations. */
export const FIELD_PRIMES = [2, 3, 5, 7, 11, 13] as const;

export type CayleyOp = 'add' | 'mul';

export function mod(n: number, m: number): number {
  if (m <= 0) return 0;
  return ((n % m) + m) % m;
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs((a / gcd(a, b)) * b);
}

export function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let d = 3; d * d <= n; d += 2) {
    if (n % d === 0) return false;
  }
  return true;
}

export function quotientRemainder(n: number, m: number): { q: number; r: number } {
  const r = mod(n, m);
  const q = m === 0 ? 0 : Math.trunc((n - r) / m);
  return { q, r };
}

export function modPow(base: number, exponent: number, modulus: number): number {
  if (modulus <= 0) return 0;
  if (exponent < 0) throw new RangeError('modPow expects non-negative exponent');
  let result = 1;
  let b = mod(base, modulus);
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = mod(result * b, modulus);
    b = mod(b * b, modulus);
    e >>= 1;
  }
  return result;
}

export type ExtendedGcdResult = { g: number; x: number; y: number };

export function extendedGCD(a: number, b: number): ExtendedGcdResult {
  if (b === 0) {
    const g = Math.abs(a);
    const sign = a < 0 ? -1 : 1;
    return { g, x: sign, y: 0 };
  }
  const { g, x: x1, y: y1 } = extendedGCD(b, a % b);
  return { g, x: y1, y: x1 - Math.floor(a / b) * y1 };
}

export function modInverse(a: number, modulus: number): number | null {
  if (modulus <= 0) return null;
  const { g, x } = extendedGCD(mod(a, modulus), modulus);
  if (g !== 1) return null;
  return mod(x, modulus);
}

export function buildPowerSequence(base: number, modulus: number, maxExponent?: number): number[] {
  const limit = maxExponent ?? modulus - 1;
  const seq: number[] = [];
  let r = 1;
  for (let k = 0; k <= limit; k++) {
    if (k === 0) {
      seq.push(1);
    } else {
      r = mod(r * base, modulus);
      seq.push(r);
    }
  }
  return seq;
}

export function multiplicativeOrder(base: number, modulus: number): number | null {
  if (modulus <= 1) return null;
  const a = mod(base, modulus);
  if (a === 0 || gcd(a, modulus) !== 1) return null;
  let r = 1;
  for (let d = 1; d < modulus; d++) {
    r = mod(r * a, modulus);
    if (r === 1) return d;
  }
  return null;
}

export function firstReturnToOne(sequence: number[]): number | null {
  for (let k = 1; k < sequence.length; k++) {
    if (sequence[k] === 1) return k;
  }
  return null;
}

export function multiplyResiduesBy(a: number, modulus: number): number[] {
  return Array.from({ length: modulus - 1 }, (_, i) => mod((i + 1) * a, modulus));
}

export type CRTResult =
  | {
      hasSolution: true;
      x0: number;
      period: number;
      isCoprime: boolean;
      normalizedA: number;
      normalizedB: number;
      M: number;
      M1: number;
      M2: number;
      y1: number;
      y2: number;
      e1: number;
      e2: number;
    }
  | {
      hasSolution: false;
      period: number;
      isCoprime: boolean;
      normalizedA: number;
      normalizedB: number;
      g: number;
    };

export function solveCRT(m1: number, a: number, m2: number, b: number): CRTResult {
  const normalizedA = mod(a, m1);
  const normalizedB = mod(b, m2);
  const g = gcd(m1, m2);
  const period = lcm(m1, m2);
  const isCoprime = g === 1;

  if (mod(normalizedB - normalizedA, g) !== 0) {
    return { hasSolution: false, period, isCoprime, normalizedA, normalizedB, g };
  }

  const { x } = extendedGCD(m1, m2);
  const diff = normalizedB - normalizedA;
  const t = mod((diff / g) * x, m2 / g);
  const x0 = mod(normalizedA + m1 * t, period);

  const M = m1 * m2;
  const M1 = M / m1;
  const M2 = M / m2;
  const y1 = modInverse(M1, m1) ?? 0;
  const y2 = modInverse(M2, m2) ?? 0;
  const e1 = mod(M1 * y1, period);
  const e2 = mod(M2 * y2, period);

  return {
    hasSolution: true,
    x0,
    period,
    isCoprime,
    normalizedA,
    normalizedB,
    M: isCoprime ? M : period,
    M1,
    M2,
    y1,
    y2,
    e1,
    e2,
  };
}

export function additionPath(a: number, b: number, modulus: number): number[] {
  const start = mod(a, modulus);
  const steps = Math.min(Math.abs(b), 200);
  const sign = b >= 0 ? 1 : -1;
  const path = [start];
  for (let i = 1; i <= steps; i++) {
    path.push(mod(start + sign * i, modulus));
  }
  if (Math.abs(b) > steps) {
    path.push(mod(a + b, modulus));
  }
  return path;
}

export function multiplicationPath(a: number, b: number, modulus: number): number[] {
  const reps = Math.min(Math.abs(b), 200);
  const path = [0];
  for (let k = 1; k <= reps; k++) {
    path.push(mod(k * a, modulus));
  }
  if (Math.abs(b) > reps) {
    path.push(mod(a * b, modulus));
  }
  return path;
}

export function congruenceClass(residue: number, modulus: number, count = 5): number[] {
  const mid = Math.floor(count / 2);
  return Array.from({ length: count }, (_, i) => residue + (i - mid) * modulus);
}

export function areCongruent(a: number, b: number, modulus: number): boolean {
  return mod(a, modulus) === mod(b, modulus);
}

export function divisibilityCheck(difference: number, modulus: number): boolean {
  return mod(difference, modulus) === 0;
}

export type EuclidStep = {
  step: number;
  a: number;
  b: number;
  q: number;
  r: number;
  equation: string;
};

export function buildEuclidSteps(a: number, b: number): EuclidStep[] {
  const steps: EuclidStep[] = [];
  let x = Math.abs(a);
  let y = Math.abs(b);
  let step = 1;
  while (y !== 0) {
    const q = Math.floor(x / y);
    const r = x % y;
    steps.push({
      step,
      a: x,
      b: y,
      q,
      r,
      equation: `${x} = ${q}·${y} + ${r}`,
    });
    x = y;
    y = r;
    step++;
  }
  return steps;
}

export function bezoutFromEuclid(a: number, m: number): { g: number; x: number; y: number; steps: EuclidStep[] } {
  const steps = buildEuclidSteps(m, mod(a, m));
  const { g, x, y } = extendedGCD(mod(a, m), m);
  return { g, x, y, steps };
}

export function addMod(a: number, b: number, p: number): number {
  return mod(a + b, p);
}

export function multiplyMod(a: number, b: number, p: number): number {
  return mod(a * b, p);
}

export function additiveInverse(a: number, p: number): number {
  return mod(-a, p);
}

export function buildCayleyTable(op: CayleyOp, p: number): number[][] {
  return Array.from({ length: p }, (_, i) =>
    Array.from({ length: p }, (_, j) => (op === 'add' ? addMod(i, j, p) : multiplyMod(i, j, p))),
  );
}

export type InversePair = { a: number; inv: number };

export function buildMultiplicativeInverses(p: number): InversePair[] {
  const pairs: InversePair[] = [];
  for (let a = 1; a < p; a++) {
    const inv = modInverse(a, p);
    if (inv !== null) pairs.push({ a, inv });
  }
  return pairs;
}

/** Unique undirected pairs for visual mapping (a ≤ inv). */
export function uniqueInversePairs(p: number): InversePair[] {
  const pairs: InversePair[] = [];
  for (let a = 1; a < p; a++) {
    const inv = modInverse(a, p);
    if (inv !== null && a <= inv) pairs.push({ a, inv });
  }
  return pairs;
}

export function fieldElements(p: number): number[] {
  return Array.from({ length: p }, (_, i) => i);
}

export function formatFieldLabel(p: number): string {
  const sub = String(p)
    .split('')
    .map((d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)] ?? d)
    .join('');
  return `𝔽${sub}`;
}

export function formatFieldSet(p: number): string {
  const els = fieldElements(p).join(',');
  return `${formatFieldLabel(p)} = {${els}}`;
}
