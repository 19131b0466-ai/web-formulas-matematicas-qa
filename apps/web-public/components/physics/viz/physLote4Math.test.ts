import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  crossProductMagnitude,
  dotProductFromMagnitudes,
  gravitationForce,
  gravitationPotential,
  impulseFromConstantForce,
  impulseFromTriangularPeak,
  inclinedWeightComponents,
  kirchhoffLoopVoltage,
  momentOfInertiaParticles,
  particleInertiaContribution,
} from './physLote4Math';

describe('physLote4Math', () => {
  it('gravitationForce scales with 1/r²', () => {
    const F1 = gravitationForce(1e24, 1e24, 1e7);
    const F2 = gravitationForce(1e24, 1e24, 2e7);
    assert.ok(Math.abs(F2 - F1 / 4) < 1e-6);
  });

  it('gravitationPotential is negative and grows toward zero', () => {
    const U1 = gravitationPotential(6e24, 500, 7e6);
    const U2 = gravitationPotential(6e24, 500, 14e6);
    assert.ok(U1 < 0 && U2 < 0 && U2 > U1);
  });

  it('momentOfInertiaParticles sums m r²', () => {
    assert.equal(momentOfInertiaParticles([2, 1], [3, 1]), particleInertiaContribution(2, 3) + particleInertiaContribution(1, 1));
  });

  it('inclinedWeightComponents decompose mg', () => {
    const { parallel, perpendicular } = inclinedWeightComponents(10, Math.PI / 6);
    assert.ok(Math.abs(parallel - 5) < 1e-9);
    assert.ok(Math.abs(perpendicular - 5 * Math.sqrt(3)) < 1e-6);
  });

  it('kirchhoffLoopVoltage closes for series circuit', () => {
    const I = 12 / (4 + 8);
    assert.ok(Math.abs(kirchhoffLoopVoltage(12, I, 4, 8)) < 1e-9);
  });

  it('dot and cross magnitudes', () => {
    assert.equal(dotProductFromMagnitudes(3, 4, 0), 0);
    assert.equal(crossProductMagnitude(3, 4, 1), 12);
  });

  it('impulse presets share area for matched pulses', () => {
    const Jrect = impulseFromConstantForce(20, 0.4);
    const Jtri = impulseFromTriangularPeak(40, 0.4);
    assert.ok(Math.abs(Jrect - Jtri) < 1e-9);
  });
});
