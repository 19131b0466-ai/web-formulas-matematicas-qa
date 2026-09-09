import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  adiabaticFinalTemperature,
  beatFrequency,
  closedTubeFrequency,
  coulombForceMagnitude,
  coulombIsAttractive,
  dopplerObservedFrequency,
  electricFieldMagnitude,
  interferenceKind,
  openTubeFrequency,
  pathDifference,
  workIsothermal,
  workIsobar,
} from './physLote6Math';

describe('physLote6Math', () => {
  it('pathDifference is absolute', () => {
    assert.equal(pathDifference(3, 5), 2);
    assert.equal(pathDifference(5, 3), 2);
  });

  it('interferenceKind detects constructive and destructive', () => {
    assert.equal(interferenceKind(0, 1.2), 'constructive');
    assert.equal(interferenceKind(1.2, 1.2), 'constructive');
    assert.equal(interferenceKind(0.6, 1.2), 'destructive');
    assert.equal(interferenceKind(1.8, 1.2), 'destructive');
  });

  it('dopplerObservedFrequency increases when source approaches', () => {
    const f = 400;
    const v = 343;
    const fp = dopplerObservedFrequency(f, v, 20, 0, true, false);
    assert.ok(fp > f);
  });

  it('beatFrequency is absolute difference', () => {
    assert.equal(beatFrequency(200, 208), 8);
    assert.equal(beatFrequency(208, 200), 8);
  });

  it('open and closed tube frequencies follow harmonics', () => {
    const L = 0.8;
    const v = 343;
    assert.ok(Math.abs(openTubeFrequency(1, L, v) * 2 - openTubeFrequency(2, L, v)) < 1e-6);
    assert.ok(Number.isNaN(closedTubeFrequency(2, L, v)));
    assert.ok(closedTubeFrequency(1, L, v) < openTubeFrequency(1, L, v));
  });

  it('workIsothermal and workIsobar signs', () => {
    assert.ok(workIsobar(1e5, 0.04, 0.08) > 0);
    assert.ok(workIsothermal(1, 300, 0.04, 0.08) > 0);
    assert.ok(workIsothermal(1, 300, 0.08, 0.04) < 0);
  });

  it('adiabaticFinalTemperature drops on expansion', () => {
    const Tf = adiabaticFinalTemperature(300, 0.04, 0.08, 5 / 3);
    assert.ok(Tf < 300);
  });

  it('coulombForce scales with 1/r² and sign', () => {
    const F1 = coulombForceMagnitude(1e-6, 1e-6, 0.1);
    const F2 = coulombForceMagnitude(1e-6, 1e-6, 0.2);
    assert.ok(Math.abs(F2 - F1 / 4) < 1e-6);
    assert.equal(coulombIsAttractive(1e-6, -1e-6), true);
    assert.equal(coulombIsAttractive(1e-6, 1e-6), false);
  });

  it('electricFieldMagnitude is independent of test charge', () => {
    const E = electricFieldMagnitude(2e-6, 0.12);
    assert.ok(E > 0);
  });
});
