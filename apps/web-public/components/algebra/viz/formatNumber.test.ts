import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { fmt, present } from './formatNumber';

describe('fmt / present (FE-20-01)', () => {
  it('keeps significant trailing zeros of integers', () => {
    assert.equal(fmt(10, 0), '10');
    assert.equal(fmt(30, 0), '30');
    assert.equal(fmt(50, 0), '50');
    assert.equal(fmt(100, 0), '100');
    assert.equal(present(10), '10');
    assert.equal(present(30, 1), '30');
    assert.equal(present(50, 2), '50');
    assert.equal(present(60, 1), '60');
    assert.equal(present(100, 3), '100');
    assert.equal(present(500, 3), '500');
    assert.equal(present(-10, 2), '-10');
  });

  it('still strips cosmetic decimal zeros', () => {
    assert.equal(fmt(10, 2), '10');
    assert.equal(fmt(1.2, 2), '1.2');
    assert.equal(present(72.1, 1), '72.1');
    assert.equal(present(0.2, 2), '0.2');
  });

  it('matches the power-triangle and Thévenin cases from QA', () => {
    assert.equal(present(Math.hypot(30, 40), 1), '50');
    assert.equal(present(Math.hypot(60, 40), 1), '72.1');
    assert.equal(present(0.1 * 1e3, 3), '100');
    assert.equal(present(0.5 * 1e3, 3), '500');
    assert.equal(present(-10, 2), '-10');
    assert.equal(present(10e-3 * 1e3, 2), '10');
    assert.equal(present(50e-3 * 1e3, 2), '50');
    assert.equal(present(30, 0), '30');
  });
});
