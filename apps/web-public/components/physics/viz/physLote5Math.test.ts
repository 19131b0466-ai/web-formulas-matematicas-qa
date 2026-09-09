import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  escapeVelocity,
  hydrostaticPressure,
  orbitalPeriod,
  orbitalVelocity,
  shmTotalEnergy,
  travelingWaveSpeed,
  waveSum,
} from './physLote5Math';
import { G_NEWTON } from './physMath';

describe('physLote5Math', () => {
  it('orbital velocity and period follow Kepler for circular orbit', () => {
    const mu = G_NEWTON * 6e24;
    const r = 7e6;
    const v = orbitalVelocity(mu, r);
    const T = orbitalPeriod(mu, r);
    assert.ok(v > 0 && T > 0);
    assert.ok(Math.abs(T - (2 * Math.PI * r) / v) < 1);
  });

  it('escape velocity is sqrt2 times orbital velocity', () => {
    const mu = G_NEWTON * 6e24;
    const r = 7e6;
    const ratio = escapeVelocity(mu, r) / orbitalVelocity(mu, r);
    assert.ok(Math.abs(ratio - Math.SQRT2) < 1e-6);
  });

  it('hydrostatic pressure adds P0 and rho g h', () => {
    assert.equal(hydrostaticPressure(101325, 1000, 2), 101325 + 1000 * 9.81 * 2);
  });

  it('shm total energy is ½ k A²', () => {
    assert.equal(shmTotalEnergy(20, 0.3), 0.5 * 20 * 0.09);
  });

  it('traveling wave speed is lambda f', () => {
    assert.equal(travelingWaveSpeed(2.5, 0.6), 1.5);
  });

  it('wave superposition adds amplitudes', () => {
    assert.equal(waveSum(1, -0.5), 0.5);
  });
});
