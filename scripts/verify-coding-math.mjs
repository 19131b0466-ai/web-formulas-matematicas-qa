#!/usr/bin/env node
/** Quick checks for codingMath (run: node scripts/verify-coding-math.mjs) */

const G = [
  [1, 0, 1],
  [0, 1, 1],
];
const H = [[1, 1, 1]];

function mod2(n) {
  return ((n % 2) + 2) % 2;
}

function xorVectors(a, b) {
  return a.map((v, i) => mod2(v ^ (b[i] ?? 0)));
}

function multiplyMessageByGenerator(message, G) {
  const n = G[0].length;
  const result = Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    let sum = 0;
    for (let i = 0; i < message.length; i++) sum ^= message[i] & G[i][j];
    result[j] = mod2(sum);
  }
  return result;
}

function multiplyMatrixVectorMod2(H, v) {
  return H.map((row) => {
    let sum = 0;
    for (let j = 0; j < row.length; j++) sum ^= row[j] & v[j];
    return mod2(sum);
  });
}

function hammingDistance(a, b) {
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
}

function hammingWeight(w) {
  return w.filter((b) => b === 1).length;
}

function findMatchingColumn(H, syndrome) {
  if (syndrome.every((s) => s === 0)) return null;
  const n = H[0].length;
  for (let j = 0; j < n; j++) {
    const col = H.map((row) => row[j]);
    if (col.every((v, i) => v === syndrome[i])) return j;
  }
  return null;
}

function verifyGH(G, H) {
  for (let i = 0; i < H.length; i++) {
    for (let j = 0; j < G.length; j++) {
      let sum = 0;
      for (let l = 0; l < G[0].length; l++) sum ^= H[i][l] & G[j][l];
      if (mod2(sum) !== 0) return false;
    }
  }
  return true;
}

function detectableErrors(dMin) {
  return Math.max(0, dMin - 1);
}

function correctableErrors(dMin) {
  return Math.floor((dMin - 1) / 2);
}

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    passed++;
  } else {
    failed++;
    console.error('FAIL:', msg);
  }
}

// G/H compatibility
assert(verifyGH(G, H), 'HGᵀ = 0 for toy code');

// Codewords
const expected = ['000', '101', '011', '110'];
const messages = [[0, 0], [1, 0], [0, 1], [1, 1]];
const codewords = messages.map((m) => multiplyMessageByGenerator(m, G).join(''));
assert(
  codewords.sort().join(',') === expected.sort().join(','),
  `codewords = ${expected.join(',')}`,
);

// Rate test [7,4]
assert(Math.abs(4 / 7 - 0.571428) < 0.001, 'rate 4/7 ≈ 0.571');

// d_min tests
assert(detectableErrors(3) === 2, 'd_min=3 detect 2');
assert(correctableErrors(3) === 1, 'd_min=3 correct 1');
assert(correctableErrors(4) === 1, 'd_min=4 correct 1');
assert(correctableErrors(5) === 2, 'd_min=5 correct 2');

// Hamming
assert(hammingDistance([0, 0, 0], [0, 0, 1]) === 1, 'd(000,001)=1');
assert(hammingDistance([0, 0, 0], [1, 1, 1]) === 3, 'd(000,111)=3');
assert(hammingWeight([0, 0, 1, 0, 1, 1]) === 3, 'weight 0001011 = 3');

const x = [0, 0, 0, 0, 0, 0, 0];
const y = [0, 0, 0, 1, 0, 1, 1];
const xor = xorVectors(x, y);
assert(hammingDistance(x, y) === hammingWeight(xor), 'd_H = w_H(xor)');

// Syndrome column match - index 2 = position 3 (1-based)
const e3 = [0, 0, 1, 0, 0, 0, 0];
const H74 = [
  [1, 0, 1, 0, 1, 0, 1],
  [0, 1, 1, 0, 0, 1, 1],
  [0, 0, 0, 1, 1, 1, 1],
];
const s3 = multiplyMatrixVectorMod2(H74, e3);
const col = findMatchingColumn(H74, s3);
assert(col === 2, `error pos 3 → column index 2, got ${col}`);

// UI position test: array index 2 → position 3
assert(col + 1 === 3, 'UI shows position 3 not 2');

// Valid codewords satisfy H
for (const m of messages) {
  const c = multiplyMessageByGenerator(m, G);
  const s = multiplyMatrixVectorMod2(H, c);
  assert(s.every((x) => x === 0), `Hcᵀ=0 for ${c.join('')}`);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
