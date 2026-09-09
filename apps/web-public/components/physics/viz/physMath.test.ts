import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  G,
  elastic1D,
  inelastic1D,
  projectileH,
  projectileRange,
  projectileTflight,
  projectileTmax,
  shmAfromX,
  shmX,
  torricelli,
  vMrua,
  xMrua,
} from './physMath';

describe('physMath', () => {
  it('MRUA matches catalog kinematics', () => {
    assert.equal(vMrua(10, -2, 3), 4);
    assert.equal(xMrua(0, 10, -2, 3), 21);
    assert.equal(torricelli(10, -2, 21), 16);
  });

  it('projectile at 45° has R = v0²/g and tmax = tflight/2', () => {
    const v0 = 20;
    const g = G;
    const R = projectileRange(v0, 45, g);
    assert.ok(Math.abs(R - (v0 * v0) / g) < 1e-9);
    const tmax = projectileTmax(v0, 45, g);
    const tf = projectileTflight(v0, 45, g);
    assert.ok(Math.abs(tf - 2 * tmax) < 1e-9);
    const H = projectileH(v0, 45, g);
    assert.ok(Math.abs(H - (v0 * v0) / (4 * g)) < 1e-9);
  });

  it('30° and 60° share the same range', () => {
    const v0 = 18;
    assert.ok(Math.abs(projectileRange(v0, 30) - projectileRange(v0, 60)) < 1e-9);
  });

  it('SHM: a = −ω² x at t = 0, φ = 0', () => {
    const A = 0.2;
    const omega = 4;
    const x = shmX(A, omega, 0, 0);
    assert.equal(x, A);
    assert.equal(shmAfromX(x, omega), -omega * omega * A);
  });

  it('1D collisions conserve momentum', () => {
    const m1 = 2;
    const m2 = 3;
    const v1i = 4;
    const v2i = -1;
    const pi = m1 * v1i + m2 * v2i;
    const { v1f, v2f } = elastic1D(m1, m2, v1i, v2i);
    assert.ok(Math.abs(m1 * v1f + m2 * v2f - pi) < 1e-9);
    const vf = inelastic1D(m1, m2, v1i, v2i);
    assert.ok(Math.abs((m1 + m2) * vf - pi) < 1e-9);
  });
});
