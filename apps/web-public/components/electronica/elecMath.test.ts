import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import {
  capacitiveReactance,
  cutoffHz,
  currentDivider,
  dampingRegion,
  integratorRamp,
  r2rDac,
  rlCutoffHz,
  rlLowPassMag,
  rlTau,
  seriesCriticalR,
  timeDisplayScale,
  dampingRatio,
  firstOrder,
  fullWaveAvg,
  gainDb,
  halfWaveAvg,
  invertingGain,
  loadedDivider,
  maxPower,
  mosfetSatId,
  noiseMarginHigh,
  nonInvertingGain,
  nyquistRate,
  parallel2,
  pwmDuty,
  quantStep,
  rcLowPassMag,
  rcTau,
  rmsFromPeak,
  seriesResonanceZ,
  parallelResonanceZ,
  shockley,
  voltageDivider,
} from './elecMath';

describe('elecMath', () => {
  it('voltage divider 12 V, 2k/1k → 4 V', () => {
    assert.equal(voltageDivider(12, 2000, 1000), 4);
  });

  it('current divider 6 mA, 2k/1k → 2 mA through R1 branch formula I1=IT R2/(R1+R2)', () => {
    assert.equal(currentDivider(6e-3, 2000, 1000), 2e-3);
  });

  it('loaded divider matches parallel of R2 and RL', () => {
    const vo = loadedDivider(12, 1000, 2000, 2000);
    assert.equal(vo, voltageDivider(12, 1000, parallel2(2000, 2000)));
    assert.equal(vo, 6);
  });

  it('max power is Vth²/(4 Rth)', () => {
    assert.equal(maxPower(10, 5), 5);
  });

  it('RC charge reaches 63% at t=τ', () => {
    const tau = rcTau(1e3, 1e-6);
    const v = firstOrder(5, 0, tau, tau);
    assert.ok(Math.abs(v - 5 * (1 - Math.exp(-1))) < 1e-12);
  });

  it('discharge is 37% at t=τ', () => {
    const v = firstOrder(0, 10, 1, 1);
    assert.ok(Math.abs(v - 10 * Math.exp(-1)) < 1e-12);
  });

  it('zeta classifies damping', () => {
    assert.ok(dampingRatio(3, 1) > 1);
    assert.equal(dampingRatio(1, 1), 1);
    assert.ok(dampingRatio(0.2, 1) < 1);
  });

  it('RMS is peak/√2', () => {
    assert.ok(Math.abs(rmsFromPeak(10) - 10 / Math.SQRT2) < 1e-12);
  });

  it('series |Z| is R at resonance', () => {
    const l = 1e-3;
    const c = 1e-6;
    const w0 = 1 / Math.sqrt(l * c);
    assert.ok(Math.abs(seriesResonanceZ(10, w0, l, c) - 10) < 1e-6);
  });

  it('parallel |Z| at ω0 equals R and grows when R increases (PAC-009)', () => {
    const l = 1e-3;
    const c = 1e-6;
    const w0 = 1 / Math.sqrt(l * c);
    const zLow = parallelResonanceZ(10, w0, l, c);
    const zHigh = parallelResonanceZ(40, w0, l, c);
    assert.ok(Math.abs(zLow - 10) < 1e-6);
    assert.ok(Math.abs(zHigh - 40) < 1e-6);
    assert.ok(zHigh > zLow);
  });

  it('PAC-009 copy tells the student to raise R, not lower it', () => {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../messages');
    for (const loc of ['es', 'en', 'de', 'fr', 'it', 'pt'] as const) {
      const messages = JSON.parse(readFileSync(resolve(root, `${loc}.json`), 'utf8')) as {
        vizElectronica: { resonance_curve: { parallel: { tryIt: string } } };
      };
      const tryIt = messages.vizElectronica.resonance_curve.parallel.tryIt;
      assert.match(tryIt, /Sube R|Raise R|Erhöhe R|Augmente R|Alza R|Sobe R/);
      assert.doesNotMatch(tryIt, /Baja R|Lower R|Senke R|Baisse R|Abbassa R|Baixa R/);
    }
  });

  it('Xc = 1/(ωC)', () => {
    assert.equal(capacitiveReactance(1000, 1e-6), 1000);
  });

  it('RC low-pass is 1/√2 at cutoff', () => {
    const r = 1000;
    const c = 1e-6;
    const fc = cutoffHz(r, c);
    const mag = rcLowPassMag(2 * Math.PI * fc, r, c);
    assert.ok(Math.abs(mag - 1 / Math.SQRT2) < 1e-10);
    assert.ok(Math.abs(gainDb(mag) + 20 * Math.log10(Math.SQRT2)) < 1e-10);
  });

  it('rectifier averages', () => {
    assert.ok(Math.abs(halfWaveAvg(Math.PI) - 1) < 1e-12);
    assert.ok(Math.abs(fullWaveAvg(Math.PI) - 2) < 1e-12);
  });

  it('Shockley is ~Is when v=0', () => {
    assert.ok(Math.abs(shockley(1e-12, 0, 1, 0.026)) < 1e-18);
  });

  it('MOSFET sat is 0 below threshold', () => {
    assert.equal(mosfetSatId(2e-3, 0.5, 1), 0);
  });

  it('op-amp gains', () => {
    assert.equal(invertingGain(10e3, 1e3), -10);
    assert.equal(nonInvertingGain(9e3, 1e3), 10);
  });

  it('noise margin and PWM/Nyquist/quantization', () => {
    assert.ok(Math.abs(noiseMarginHigh(3.3, 2.0) - 1.3) < 1e-12);
    assert.equal(pwmDuty(2, 10), 0.2);
    assert.equal(quantStep(5, 8), 5 / 256);
    assert.equal(nyquistRate(1000), 2000);
  });

  it('RL low-pass cutoff is R/(2πL) and |H|=1/√2 there', () => {
    const r = 100;
    const l = 15.9e-3;
    const fc = rlCutoffHz(r, l);
    assert.ok(Math.abs(fc - r / (2 * Math.PI * l)) < 1e-12);
    const mag = rlLowPassMag(2 * Math.PI * fc, r, l);
    assert.ok(Math.abs(mag - 1 / Math.SQRT2) < 1e-10);
  });

  it('R-2R DAC 3-bit code 101, Vref=8 V → −5 V', () => {
    assert.equal(r2rDac(8, 3, 0b101), -5);
  });

  it('integrator of constant Vin is a ramp −Vin t / RC', () => {
    assert.equal(integratorRamp(1, 2, 1e3, 1e-6), -2000);
  });

  it('series critical R is 2√(L/C) and ζ≈1 is labeled critical (FE-20-03)', () => {
    const rCrit = seriesCriticalR(1e-3, 1e-6);
    assert.ok(Math.abs(rCrit - 2 * Math.sqrt(1e-3 / 1e-6)) < 1e-12);
    const w0 = 1 / Math.sqrt(1e-3 * 1e-6);
    const zetaNear = 63.2 / (2 * 1e-3) / w0;
    assert.equal(dampingRegion(zetaNear), 'critical');
    assert.equal(dampingRegion(1), 'critical');
    assert.equal(dampingRegion(0.5), 'under');
    assert.equal(dampingRegion(1.5), 'over');
  });

  it('RL τ = L/R at 1 mH / 1 kΩ displays as 1 µs (FE-20-04)', () => {
    const tau = rlTau(1e-3, 1000);
    assert.equal(tau, 1e-6);
    const { scale, unit } = timeDisplayScale(tau);
    assert.equal(unit, 'µs');
    assert.equal(tau * scale, 1);
    const rc = timeDisplayScale(1e-3);
    assert.equal(rc.unit, 'ms');
  });
});
