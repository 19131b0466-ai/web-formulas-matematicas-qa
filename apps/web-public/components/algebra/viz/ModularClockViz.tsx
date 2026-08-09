'use client';

import { useMemo, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel, fmt } from './controls';

type Props = { formulaId: string; idea?: string };

function modPow(a: number, e: number, m: number): number {
  let r = 1;
  let b = ((a % m) + m) % m;
  let p = e;
  while (p > 0) {
    if (p & 1) r = (r * b) % m;
    b = (b * b) % m;
    p >>= 1;
  }
  return r;
}

function egcd(a: number, b: number): [number, number, number] {
  if (b === 0) return [a, 1, 0];
  const [g, x, y] = egcd(b, a % b);
  return [g, y, x - Math.floor(a / b) * y];
}

export function ModularClockViz({ formulaId, idea }: Props) {
  const [mod, setMod] = useState(7);
  const [a, setA] = useState(3);
  const [b, setB] = useState(5);
  const [m2, setM2] = useState(5);

  const W = 360;
  const H = 300;
  const cx = W / 2;
  const cy = H / 2 + 10;
  const R = 100;

  const sum = ((a % mod) + (b % mod) + mod * 2) % mod;
  const prod = (((a % mod) + mod) * ((b % mod) + mod)) % mod;
  const [g, invCand] = egcd(((a % mod) + mod) % mod, mod);
  const inv = g === 1 ? ((invCand % mod) + mod) % mod : null;
  const pow = modPow(a, mod - 1, mod);

  const points = useMemo(
    () =>
      Array.from({ length: mod }, (_, i) => {
        const ang = -Math.PI / 2 + (2 * Math.PI * i) / mod;
        return { i, x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) };
      }),
    [mod],
  );

  const crt =
    formulaId.includes('MOD-005') && Number.isInteger(a) && Number.isInteger(b)
      ? (() => {
          // x ≡ a (mod m), x ≡ b (mod m2) naive search
          for (let x = 0; x < mod * m2; x++) {
            if (x % mod === ((a % mod) + mod) % mod && x % m2 === ((b % m2) + m2) % m2) return x;
          }
          return null;
        })()
      : null;

  return (
    <VizPanel
      caption={`${idea ?? ''} · a+b≡${sum}, ab≡${prod}${inv !== null ? `, a⁻¹≡${inv}` : ', sin inverso'}${formulaId.includes('MOD-006') ? `, a^{p-1}≡${pow}` : ''}${crt !== null ? `, CRT x≡${crt}` : ''}`}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="currentColor" opacity={0.3} />
        {points.map((p) => (
          <g key={p.i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={p.i === sum || p.i === prod || p.i === ((a % mod) + mod) % mod ? 8 : 5}
              fill={
                p.i === ((a % mod) + mod) % mod
                  ? 'var(--accent-strong)'
                  : p.i === sum
                    ? 'teal'
                    : p.i === prod
                      ? 'orange'
                      : 'currentColor'
              }
              opacity={0.85}
            />
            <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize={11} fill="currentColor">
              {p.i}
            </text>
          </g>
        ))}
      </svg>
      <ControlsStack>
        <SliderRow label="m" value={mod} min={3} max={12} step={1} onChange={setMod} />
        <SliderRow label="a" value={a} min={0} max={15} step={1} onChange={setA} />
        <SliderRow label="b" value={b} min={0} max={15} step={1} onChange={setB} />
        {formulaId.includes('MOD-005') ? (
          <SliderRow label="m₂" value={m2} min={2} max={11} step={1} onChange={setM2} />
        ) : null}
        <p className="text-xs text-[var(--fg-muted)]">
          gcd(a,m)={fmt(g)}
          {formulaId.includes('MOD-006') ? ' · Fermat demo' : ''}
        </p>
      </ControlsStack>
    </VizPanel>
  );
}
