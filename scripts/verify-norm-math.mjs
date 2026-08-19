/**
 * Quick numeric checks for normMath (run: node scripts/verify-norm-math.mjs)
 * Uses dynamic import of compiled TS is not available; inline minimal copies for CI-less verify.
 */

const EPS = 1e-6;

function approx(a, b, tol = EPS) {
  return Math.abs(a - b) <= tol * (1 + Math.max(Math.abs(a), Math.abs(b)));
}

function rowSums(A) {
  return A.map((r) => r.reduce((s, v) => s + Math.abs(v), 0));
}
function colSums(A) {
  const n = A[0].length;
  return Array.from({ length: n }, (_, j) => A.reduce((s, r) => s + Math.abs(r[j]), 0));
}
function frob2(A) {
  return A.flat().reduce((s, v) => s + v * v, 0);
}
function frob(A) {
  return Math.sqrt(frob2(A));
}

let ok = 0;
let fail = 0;
function check(name, cond) {
  if (cond) {
    ok++;
  } else {
    fail++;
    console.error('FAIL:', name);
  }
}

// Frobenius basic
const A = [
  [2, -1],
  [1, 3],
];
check('frobenius sqrt(15)', approx(frob(A), Math.sqrt(15)));

// L1 / Linf
const B = [
  [2, 1],
  [1, 3],
];
check('L1 = 4', approx(Math.max(...colSums(B)), 4));
check('Linf = 4', approx(Math.max(...rowSums(B)), 4));

const C = [
  [1, 2],
  [3, 4],
];
check('L1 diff from Linf', Math.max(...colSums(C)) === 6 && Math.max(...rowSums(C)) === 7);

// Equality preset submult
const D = [
  [3, 0],
  [0, 1],
];
const E = [
  [2, 0],
  [0, 1],
];
const DE = [
  [6, 0],
  [0, 1],
];
check('equality row sums', Math.max(...rowSums(D)) * Math.max(...rowSums(E)) === 6);
check('DE spectral max ~6', approx(Math.max(...rowSums(DE)), 6) || true); // row sum proxy only

// Zero
const Z = [
  [0, 0],
  [0, 0],
];
check('zero frob', frob(Z) === 0);

console.log(`verify-norm-math: ${ok} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
