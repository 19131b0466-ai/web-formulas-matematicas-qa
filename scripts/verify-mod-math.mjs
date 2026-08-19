#!/usr/bin/env node
/** Quick numerical checks for modMath (run: node scripts/verify-mod-math.mjs) */

function mod(n, m) {
  return ((n % m) + m) % m;
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

function lcm(a, b) {
  if (a === 0 || b === 0) return 0;
  return Math.abs((a / gcd(a, b)) * b);
}

function extendedGCD(a, b) {
  if (b === 0) {
    const g = Math.abs(a);
    const sign = a < 0 ? -1 : 1;
    return { g, x: sign, y: 0 };
  }
  const { g, x: x1, y: y1 } = extendedGCD(b, a % b);
  return { g, x: y1, y: x1 - Math.floor(a / b) * y1 };
}

function modPow(base, exponent, modulus) {
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

function modInverse(a, modulus) {
  const { g, x } = extendedGCD(mod(a, modulus), modulus);
  if (g !== 1) return null;
  return mod(x, modulus);
}

function buildPowerSequence(base, modulus, maxExponent = modulus - 1) {
  const seq = [];
  let r = 1;
  for (let k = 0; k <= maxExponent; k++) {
    if (k === 0) seq.push(1);
    else {
      r = mod(r * base, modulus);
      seq.push(r);
    }
  }
  return seq;
}

function multiplicativeOrder(base, modulus) {
  const a = mod(base, modulus);
  if (a === 0 || gcd(a, modulus) !== 1) return null;
  let r = 1;
  for (let d = 1; d < modulus; d++) {
    r = mod(r * a, modulus);
    if (r === 1) return d;
  }
  return null;
}

function solveCRT(m1, a, m2, b) {
  const normalizedA = mod(a, m1);
  const normalizedB = mod(b, m2);
  const g = gcd(m1, m2);
  const period = lcm(m1, m2);
  if (mod(normalizedB - normalizedA, g) !== 0) {
    return { hasSolution: false };
  }
  const { x } = extendedGCD(m1, m2);
  const diff = normalizedB - normalizedA;
  const t = mod((diff / g) * x, m2 / g);
  const x0 = mod(normalizedA + m1 * t, period);
  return { hasSolution: true, x0, period };
}

function additionPath(a, b, modulus) {
  const start = mod(a, modulus);
  const path = [start];
  const sign = b >= 0 ? 1 : -1;
  for (let i = 1; i <= Math.abs(b); i++) {
    path.push(mod(start + sign * i, modulus));
  }
  return path;
}

function multiplicationPath(a, b, modulus) {
  const path = [0];
  for (let k = 1; k <= Math.abs(b); k++) {
    path.push(mod(k * a, modulus));
  }
  return path;
}

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exit(1);
  }
  console.log('OK:', msg);
}

const seq73 = buildPowerSequence(3, 7);
assert(JSON.stringify(seq73) === JSON.stringify([1, 3, 2, 6, 4, 5, 1]), 'power seq 3^7');
assert(modPow(3, 6, 7) === 1, 'modPow 3^6 mod 7');

const seq72 = buildPowerSequence(2, 7);
assert(JSON.stringify(seq72) === JSON.stringify([1, 2, 4, 1, 2, 4, 1]), 'power seq 2^7');
assert(multiplicativeOrder(2, 7) === 3, 'ord_7(2)=3');

const seq76 = buildPowerSequence(6, 7);
assert(JSON.stringify(seq76) === JSON.stringify([1, 6, 1, 6, 1, 6, 1]), 'power seq 6^7');

const seq52 = buildPowerSequence(2, 5);
assert(JSON.stringify(seq52) === JSON.stringify([1, 2, 4, 3, 1]), 'power seq 2^5');

for (const a of [2, 7, 8]) {
  assert(modPow(a, 7, 7) === mod(a, 7), `a^7 ≡ a mod 7 for a=${a}`);
}

const crt1 = solveCRT(7, 3, 5, 5);
assert(crt1.hasSolution && crt1.x0 === 10 && crt1.period === 35, 'CRT 7,3 / 5,5');

const crt2 = solveCRT(3, 2, 5, 3);
assert(crt2.hasSolution && crt2.x0 === 8 && crt2.period === 15, 'CRT 3,2 / 5,3');

const crt3 = solveCRT(6, 1, 4, 3);
assert(crt3.hasSolution && crt3.x0 === 7 && crt3.period === 12, 'CRT 6,1 / 4,3');

const crt4 = solveCRT(6, 1, 4, 2);
assert(!crt4.hasSolution, 'CRT no solution');

assert(modInverse(3, 7) === 5, 'inv 3 mod 7');
assert(modInverse(2, 5) === 3, 'inv 2 mod 5');
assert(modInverse(2, 6) === null, 'no inv 2 mod 6');
assert(modInverse(5, 12) === 5, 'inv 5 mod 12');
assert(mod(-2, 7) === 5, 'mod -2,7');
assert(modInverse(-2, 7) === 3, 'inv -2 mod 7');

assert(JSON.stringify(additionPath(3, 5, 7)) === JSON.stringify([3, 4, 5, 6, 0, 1]), 'add path');
assert(JSON.stringify(multiplicationPath(3, 5, 7)) === JSON.stringify([0, 3, 6, 2, 5, 1]), 'mul path');
assert(mod(3 + 4, 7) === 0, 'sum residue 0');
assert(mod(3 * 4, 7) === 5, 'prod residue 5');
assert(mod(-2 + 5, 7) === 3, 'neg sum');
assert(mod(-2 * 5, 7) === 4, 'neg prod');
assert(mod(10 + 12, 7) === 1, 'large sum');
assert(mod(10 * 12, 7) === 1, 'large prod');
assert(mod(17, 7) === mod(3, 7), '17≡3 mod7');
assert(mod(17 - 3, 7) === 0, '7|14');
assert(mod(17, 7) !== mod(5, 7), '17≢5 mod7');
assert(mod(-4, 7) === mod(3, 7), '-4≡3 mod7');

console.log('\nAll modMath tests passed.');
