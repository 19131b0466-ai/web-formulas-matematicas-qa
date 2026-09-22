/** Pure math for Física Electrónica visualizations. SI units. */

export function voltageDivider(vi: number, r1: number, r2: number): number {
  const den = r1 + r2;
  return den === 0 ? NaN : (vi * r2) / den;
}

export function currentDivider(it: number, r1: number, r2: number): number {
  const den = r1 + r2;
  return den === 0 ? NaN : (it * r2) / den;
}

export function parallel2(a: number, b: number): number {
  const den = a + b;
  return den === 0 ? NaN : (a * b) / den;
}

export function loadedDivider(vi: number, r1: number, r2: number, rl: number): number {
  return voltageDivider(vi, r1, parallel2(r2, rl));
}

export function theveninLoadVoltage(vth: number, rth: number, rl: number): number {
  return voltageDivider(vth, rth, rl);
}

export function nortonCurrentThroughLoad(inort: number, rn: number, rl: number): number {
  const den = rn + rl;
  return den === 0 ? NaN : (inort * rn) / den;
}

export function maxPower(vth: number, rth: number): number {
  return rth === 0 ? Infinity : (vth * vth) / (4 * rth);
}

export function rcTau(r: number, c: number): number {
  return r * c;
}

export function rlTau(l: number, r: number): number {
  return r === 0 ? Infinity : l / r;
}

export function firstOrder(vInf: number, v0: number, t: number, tau: number): number {
  if (tau <= 0) return vInf;
  return vInf + (v0 - vInf) * Math.exp(-t / tau);
}

export function omega0(l: number, c: number): number {
  return l <= 0 || c <= 0 ? NaN : 1 / Math.sqrt(l * c);
}

export function seriesAlpha(r: number, l: number): number {
  return l === 0 ? Infinity : r / (2 * l);
}

export function dampingRatio(alpha: number, w0: number): number {
  return w0 === 0 ? Infinity : alpha / w0;
}

/** Series RLC: ζ = 1 when R = 2 √(L/C). */
export function seriesCriticalR(l: number, c: number): number {
  return l <= 0 || c <= 0 ? NaN : 2 * Math.sqrt(l / c);
}

export const DAMPING_CRITICAL_EPS = 0.02;

export type DampingRegion = 'over' | 'critical' | 'under';

export function dampingRegion(zeta: number, eps = DAMPING_CRITICAL_EPS): DampingRegion {
  if (!Number.isFinite(zeta)) return 'over';
  if (Math.abs(zeta - 1) <= eps) return 'critical';
  return zeta > 1 ? 'over' : 'under';
}

/** Pick µs when τ would round to 0 ms at two decimals. */
export function timeDisplayScale(seconds: number): { scale: number; unit: 'µs' | 'ms' } {
  return Math.abs(seconds) > 0 && Math.abs(seconds) < 1e-3
    ? { scale: 1e6, unit: 'µs' }
    : { scale: 1e3, unit: 'ms' };
}

export function dampedOmega(w0: number, zeta: number): number {
  if (zeta >= 1) return 0;
  return w0 * Math.sqrt(1 - zeta * zeta);
}

export function rmsFromPeak(vp: number): number {
  return vp / Math.SQRT2;
}

export function capacitiveReactance(omega: number, c: number): number {
  return omega === 0 || c === 0 ? Infinity : 1 / (omega * c);
}

export function inductiveReactance(omega: number, l: number): number {
  return omega * l;
}

export function impedanceMag(r: number, x: number): number {
  return Math.hypot(r, x);
}

export function impedanceAngle(r: number, x: number): number {
  return Math.atan2(x, r);
}

export function seriesResonanceZ(r: number, omega: number, l: number, c: number): number {
  const x = inductiveReactance(omega, l) - capacitiveReactance(omega, c);
  return impedanceMag(r, x);
}

export function parallelResonanceZ(r: number, omega: number, l: number, c: number): number {
  const xl = inductiveReactance(omega, l);
  const xc = capacitiveReactance(omega, c);
  if (!Number.isFinite(xl) || !Number.isFinite(xc)) return r;
  const bl = 1 / xl;
  const bc = -1 / xc;
  const g = r === 0 ? Infinity : 1 / r;
  return 1 / Math.hypot(g, bl + bc);
}

export function rcLowPassMag(omega: number, r: number, c: number): number {
  return 1 / Math.hypot(1, omega * r * c);
}

export function rcHighPassMag(omega: number, r: number, c: number): number {
  const wrc = omega * r * c;
  return wrc / Math.hypot(1, wrc);
}

export function cutoffHz(r: number, c: number): number {
  return r === 0 || c === 0 ? Infinity : 1 / (2 * Math.PI * r * c);
}

export function rlCutoffHz(r: number, l: number): number {
  return l === 0 ? Infinity : r / (2 * Math.PI * l);
}

export function rlLowPassMag(omega: number, r: number, l: number): number {
  return r === 0 && omega * l === 0 ? NaN : r / Math.hypot(r, omega * l);
}

export function admittanceMag(r: number, x: number): number {
  const z = impedanceMag(r, x);
  return z === 0 ? Infinity : 1 / z;
}

export function admittanceAngle(r: number, x: number): number {
  return -impedanceAngle(r, x);
}

export function conductance(r: number, x: number): number {
  const z2 = r * r + x * x;
  return z2 === 0 ? Infinity : r / z2;
}

export function susceptance(r: number, x: number): number {
  const z2 = r * r + x * x;
  return z2 === 0 ? Infinity : -x / z2;
}

/** Inverting R-2R: Vo = −Vref Σ bk / 2^k with b1 MSB. */
export function r2rDac(vref: number, bits: number, code: number): number {
  const n = Math.max(1, Math.floor(bits));
  const masked = code & ((1 << n) - 1);
  let sum = 0;
  for (let k = 1; k <= n; k += 1) {
    const bk = (masked >> (n - k)) & 1;
    sum += bk / 2 ** k;
  }
  return -vref * sum;
}

export function integratorRamp(vin: number, t: number, r: number, c: number): number {
  const tau = r * c;
  return tau === 0 ? -Infinity : (-vin * t) / tau;
}

export function gainDb(mag: number): number {
  if (mag <= 0) return -Infinity;
  return 20 * Math.log10(mag);
}

export function shockley(is: number, vd: number, n: number, vt: number): number {
  return is * (Math.exp(vd / (n * vt)) - 1);
}

export function halfWaveAvg(vp: number): number {
  return vp / Math.PI;
}

export function fullWaveAvg(vp: number): number {
  return (2 * vp) / Math.PI;
}

export function mosfetSatId(kn: number, vgs: number, vth: number): number {
  const over = vgs - vth;
  return over <= 0 ? 0 : 0.5 * kn * over * over;
}

export function invertingGain(rf: number, rin: number): number {
  return rin === 0 ? -Infinity : -rf / rin;
}

export function nonInvertingGain(rf: number, rg: number): number {
  return rg === 0 ? Infinity : 1 + rf / rg;
}

export function noiseMarginHigh(voh: number, vih: number): number {
  return voh - vih;
}

export function noiseMarginLow(vil: number, vol: number): number {
  return vil - vol;
}

export function pwmDuty(ton: number, period: number): number {
  return period === 0 ? NaN : ton / period;
}

export function quantStep(vfs: number, bits: number): number {
  return vfs / 2 ** bits;
}

export function nyquistRate(fmax: number): number {
  return 2 * fmax;
}
