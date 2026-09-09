import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  angularMomentum,
  heatEngineEfficiency,
  idealGasPressure,
  isValidHeatEngine,
  kineticEnergy,
  linearMomentum,
  parallelPlateCapacitance,
  rotationalKineticEnergy,
  vectorMagnitude,
  volumetricFlow,
} from './physLote1Math';
import { formatCapacitance as fmtC } from './physFormat';

describe('physLote1Math', () => {
  it('vector magnitude ignores sign in length', () => {
    assert.equal(vectorMagnitude(3, 4, 0), 5);
    assert.equal(vectorMagnitude(-3, -4, 0), 5);
    assert.equal(vectorMagnitude(3, 4, 12), 13);
  });

  it('linear momentum scales with m and v and sign', () => {
    assert.equal(linearMomentum(2, 3), 6);
    assert.equal(linearMomentum(2, -3), -6);
    assert.equal(linearMomentum(4, 3), linearMomentum(2, 6));
  });

  it('kinetic energy is quadratic in speed and even in sign', () => {
    assert.equal(kineticEnergy(2, 3), 9);
    assert.equal(kineticEnergy(2, -3), 9);
    assert.equal(kineticEnergy(2, 6), 4 * kineticEnergy(2, 3));
  });

  it('volumetric flow Q = Av', () => {
    assert.equal(volumetricFlow(0.04, 0.5), 0.02);
    assert.equal(volumetricFlow(0.08, 0.5), 2 * volumetricFlow(0.04, 0.5));
  });

  it('ideal gas pressure and parallel plate capacitance', () => {
    const P = idealGasPressure(1, 300, 0.05);
    assert.ok(P > 0);
    const C = parallelPlateCapacitance(0.04, 0.005, 1);
    assert.ok(C > 0);
    assert.ok(parallelPlateCapacitance(0.08, 0.005, 1) > C);
  });

  it('angular and rotational energy relations', () => {
    assert.equal(angularMomentum(2, 3), 6);
    assert.equal(rotationalKineticEnergy(2, 4), 16);
  });

  it('heat engine efficiency and validity', () => {
    assert.equal(heatEngineEfficiency(400, 250), 0.375);
    assert.ok(isValidHeatEngine(400, 250));
    assert.ok(!isValidHeatEngine(400, 450));
  });
});

describe('physFormat capacitance', () => {
  it('does not round small nonzero C to 0 F', () => {
    const s = fmtC(7.08e-11);
    assert.ok(!s.startsWith('0 F'));
    assert.match(s, /F|nF|pF/);
  });
});
