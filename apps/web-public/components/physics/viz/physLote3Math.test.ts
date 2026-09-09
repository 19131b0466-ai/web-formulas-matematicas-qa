import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  beamSupports,
  bernoulliHead,
  kirchhoffNodeCurrent,
  stress,
  strain,
  totalKineticEnergy,
  totalLinearMomentum,
  youngModulus,
} from './physLote3Math';

describe('physLote3Math', () => {
  it('beamSupports balances vertical forces', () => {
    const { N1, N2 } = beamSupports(20, 1, 30, 3, 4);
    assert.ok(Math.abs(N1 + N2 - 50) < 1e-9);
    assert.ok(Math.abs(N2 - 27.5) < 1e-9);
  });

  it('bernoulliHead is constant when P2 follows Bernoulli', () => {
    const rho = 1000;
    const v1 = 2;
    const y1 = 0;
    const y2 = 0.4;
    const P1 = 1.5e5;
    const v2 = 2.2;
    const P2 = P1 + 0.5 * rho * v1 * v1 + rho * 9.81 * y1 - (0.5 * rho * v2 * v2 + rho * 9.81 * y2);
    const B1 = bernoulliHead(P1, rho, v1, y1);
    const B2 = bernoulliHead(P2, rho, v2, y2);
    assert.ok(Math.abs(B1 - B2) < 1e-6);
  });

  it('totalLinearMomentum adds masses', () => {
    assert.equal(totalLinearMomentum(2, 4, 3, -1), 5);
  });

  it('totalKineticEnergy sums both masses', () => {
    assert.equal(totalKineticEnergy(2, 2, 1, 0), 4);
  });

  it('youngModulus from stress and strain', () => {
    const sigma = stress(800, 2e-4);
    const eps = strain(4e-4, 1);
    assert.ok(Math.abs(youngModulus(sigma, eps) - sigma / eps) < 1e-6);
  });

  it('kirchhoffNodeCurrent is I1 - I2', () => {
    assert.equal(kirchhoffNodeCurrent(1.2, 0.7), 0.5);
  });
});
