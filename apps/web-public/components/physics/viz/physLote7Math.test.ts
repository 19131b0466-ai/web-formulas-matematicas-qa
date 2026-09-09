import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  branchCurrent,
  capacitorEnergyCV,
  capacitorEnergyQC,
  capacitorEnergyQV,
  circuitCurrent,
  parallelResistance,
  seriesResistance,
  voltageDrop,
} from './physLote7Math';

describe('physLote7Math', () => {
  it('series and parallel resistance', () => {
    assert.equal(seriesResistance(10, 20), 30);
    assert.ok(parallelResistance(10, 10) < 10);
    assert.ok(Math.abs(parallelResistance(10, 10) - 5) < 1e-9);
  });

  it('circuitCurrent and voltageDrop in series', () => {
    const Req = seriesResistance(4, 8);
    const I = circuitCurrent(12, Req);
    assert.ok(Math.abs(I - 1) < 1e-9);
    assert.equal(voltageDrop(I, 4), 4);
    assert.equal(voltageDrop(I, 8), 8);
  });

  it('branchCurrent in parallel shares voltage', () => {
    const V = 12;
    const I1 = branchCurrent(V, 6);
    const I2 = branchCurrent(V, 12);
    assert.ok(Math.abs(I1 + I2 - 3) < 1e-9);
  });

  it('capacitor energy formulas are equivalent', () => {
    const C = 2e-9;
    const V = 10;
    const Q = C * V;
    const U1 = capacitorEnergyCV(C, V);
    const U2 = capacitorEnergyQC(Q, C);
    const U3 = capacitorEnergyQV(Q, V);
    assert.ok(Math.abs(U1 - U2) < 1e-18);
    assert.ok(Math.abs(U1 - U3) < 1e-18);
  });
});
