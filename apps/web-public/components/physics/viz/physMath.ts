/** Shared math for Física Básica visualizations. Angles in the UI are degrees. */

export const G = 9.81;
export const G_NEWTON = 6.6743e-11;
export const KE = 8.988e9;
export const EPS0 = 8.854e-12;
export const R_GAS = 8.314;
export const SOUND_V = 343;
export const ATM = 1.013e5;

export function clamp(n: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, n));
}

export function hypot2(x: number, y: number): number {
  return Math.hypot(x, y);
}

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function vMrua(v0: number, a: number, t: number): number {
  return v0 + a * t;
}

export function xMrua(x0: number, v0: number, a: number, t: number): number {
  return x0 + v0 * t + 0.5 * a * t * t;
}

export function torricelli(v0: number, a: number, dx: number): number {
  return v0 * v0 + 2 * a * dx;
}

export type ProjectileState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
};

export function projectileState(
  v0: number,
  thetaDeg: number,
  t: number,
  g = G,
  x0 = 0,
  y0 = 0,
): ProjectileState {
  const th = degToRad(thetaDeg);
  const vx = v0 * Math.cos(th);
  const vy = v0 * Math.sin(th) - g * t;
  const x = x0 + vx * t;
  const y = y0 + v0 * Math.sin(th) * t - 0.5 * g * t * t;
  return { x, y, vx, vy, speed: Math.hypot(vx, vy) };
}

export function projectileTmax(v0: number, thetaDeg: number, g = G): number {
  return (v0 * Math.sin(degToRad(thetaDeg))) / g;
}

export function projectileH(v0: number, thetaDeg: number, g = G): number {
  const s = Math.sin(degToRad(thetaDeg));
  return (v0 * v0 * s * s) / (2 * g);
}

export function projectileTflight(v0: number, thetaDeg: number, g = G): number {
  return (2 * v0 * Math.sin(degToRad(thetaDeg))) / g;
}

export function projectileRange(v0: number, thetaDeg: number, g = G): number {
  return (v0 * v0 * Math.sin(2 * degToRad(thetaDeg))) / g;
}

export function shmX(A: number, omega: number, t: number, phi: number): number {
  return A * Math.cos(omega * t + phi);
}

export function shmV(A: number, omega: number, t: number, phi: number): number {
  return -A * omega * Math.sin(omega * t + phi);
}

export function shmAfromX(x: number, omega: number): number {
  return -omega * omega * x;
}

export function elastic1D(
  m1: number,
  m2: number,
  v1i: number,
  v2i: number,
): { v1f: number; v2f: number } {
  const v1f = ((m1 - m2) / (m1 + m2)) * v1i + ((2 * m2) / (m1 + m2)) * v2i;
  const v2f = ((2 * m1) / (m1 + m2)) * v1i + ((m2 - m1) / (m1 + m2)) * v2i;
  return { v1f, v2f };
}

export function inelastic1D(m1: number, m2: number, v1i: number, v2i: number): number {
  return (m1 * v1i + m2 * v2i) / (m1 + m2);
}
