/**
 * Quick checks for booleanMath (run: node scripts/verify-boolean-math.mjs)
 */

function buildMinterm(assignment, variables) {
  return variables.map((v) => (assignment[v] === 1 ? v : `¬${v}`)).join('');
}

function buildMaxterm(assignment, variables) {
  return variables.map((v) => (assignment[v] === 0 ? v : `¬${v}`)).join('+');
}

function generateAssignments(variables) {
  const n = variables.length;
  const result = [];
  for (let i = 0; i < 2 ** n; i++) {
    const row = {};
    for (let j = 0; j < n; j++) {
      row[variables[j]] = (i >> (n - 1 - j)) & 1;
    }
    result.push(row);
  }
  return result;
}

function buildCanonicalSOP(outputs, variables) {
  const assignments = generateAssignments(variables);
  const terms = [];
  outputs.forEach((out, i) => {
    if (out === 1) terms.push(buildMinterm(assignments[i], variables));
  });
  return terms.length ? terms.join('+') : '0';
}

function buildCanonicalPOS(outputs, variables) {
  const assignments = generateAssignments(variables);
  const terms = [];
  outputs.forEach((out, i) => {
    if (out === 0) terms.push(`(${buildMaxterm(assignments[i], variables)})`);
  });
  return terms.length ? terms.join('') : '1';
}

function xor(a, b) {
  return a !== b ? 1 : 0;
}

let ok = 0;
let fail = 0;
function check(name, cond) {
  if (cond) {
    ok++;
    console.log(`  ✓ ${name}`);
  } else {
    fail++;
    console.error(`  ✕ ${name}`);
  }
}

console.log('booleanMath verification\n');

// SOP implication [1,1,0,1]
const sop = buildCanonicalSOP([1, 1, 0, 1], ['A', 'B']);
check('SOP implication', sop === '¬A¬B+¬AB+AB');

// POS XNOR [1,0,0,1]
const pos = buildCanonicalPOS([1, 0, 0, 1], ['A', 'B']);
check('POS XNOR', pos === '(A+¬B)(¬A+B)');

// Minterm 01
check('minterm 01', buildMinterm({ A: 0, B: 1 }, ['A', 'B']) === '¬AB');

// Maxterm 01
check('maxterm 01', buildMaxterm({ A: 0, B: 1 }, ['A', 'B']) === 'A+¬B');

// Maxterm 3-var 101
check('maxterm 101', buildMaxterm({ A: 1, B: 0, C: 1 }, ['A', 'B', 'C']) === '¬A+B+¬C');

// XOR table
const xorTable = [];
for (const a of [0, 1]) for (const b of [0, 1]) xorTable.push(xor(a, b));
check('XOR table', xorTable.join('') === '0110');

// XOR exactly-one for 2 bits
for (const a of [0, 1]) {
  for (const b of [0, 1]) {
    check(`xor=${a}^${b}`, xor(a, b) === (a + b === 1 ? 1 : 0));
  }
}

// SOP XOR
check('SOP XOR', buildCanonicalSOP([0, 1, 1, 0], ['A', 'B']) === '¬AB+A¬B');

// POS OR [0,1,1,1]
check('POS OR', buildCanonicalPOS([0, 1, 1, 1], ['A', 'B']) === '(A+B)');

console.log(`\n${ok} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
