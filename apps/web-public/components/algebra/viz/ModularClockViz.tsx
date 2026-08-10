'use client';

import { useMemo, useState } from 'react';
import { useVizLabels } from '@/lib/viz-labels';
import { ControlsStack, SliderRow, VizPanel, fmt, joinCaption } from './controls';

type Props = { formulaId: string; idea?: string; mode?: string };

const PRIMES = [3, 5, 7, 11] as const;

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

function nearestPrime(val: number): number {
  return PRIMES.reduce((prev, p) => (Math.abs(p - val) < Math.abs(prev - val) ? p : prev));
}

export function ModularClockViz({ formulaId, mode }: Props) {
  const v = useVizLabels();
  const isMod006 = formulaId.includes('MOD-006');
  const [modRaw, setModRaw] = useState(7);
  const [a, setA] = useState(3);
  const [b, setB] = useState(5);
  const [m2, setM2] = useState(5);

  // For MOD-006: snap mod to prime set; otherwise allow 3-12
  const mod = isMod006 ? nearestPrime(modRaw) : modRaw;

  const W = 360;
  const H = 300;
  const cx = W / 2;
  const cy = H / 2 + 10;
  const R = 100;

  const aMod = ((a % mod) + mod) % mod;
  const bMod = ((b % mod) + mod) % mod;
  const congruent = aMod === bMod;
  const sum = (aMod + bMod) % mod;
  const prod = (aMod * bMod) % mod;
  const [g, invCand] = egcd(aMod, mod);
  const inv = g === 1 ? ((invCand % mod) + mod) % mod : null;
  const pow = modPow(a, mod - 1, mod);

  // For MOD-006: Fermat's little theorem only applies when gcd(a,p)=1
  const fermatApplies = isMod006 && g === 1 && aMod !== 0;

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
          for (let x = 0; x < mod * m2; x++) {
            if (x % mod === aMod && x % m2 === ((b % m2) + m2) % m2) return x;
          }
          return null;
        })()
      : null;

  const congruenceMode = mode === 'congruence' || formulaId.includes('MOD-001');
  const badge = congruenceMode ? (congruent ? v.congruent : v.notCongruent) : null;

  const fermatStr = isMod006
    ? fermatApplies
      ? `a^{p-1}≡${pow} (mod ${mod})`
      : `gcd(a,p)=${g}≠1 · Fermat no aplica`
    : '';

  return (
    <VizPanel
      caption={joinCaption(
        badge,
        isMod006
          ? fermatStr
          : `a+b≡${sum}, ab≡${prod}${inv !== null ? `, a⁻¹≡${inv}` : `, ${v.noInverse}`}`,
        crt !== null ? `CRT x≡${crt}` : undefined,
      )}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="currentColor" opacity={0.3} />
        {points.map((p) => {
          const isA = p.i === aMod;
          const isB = p.i === bMod;
          const isSum = !congruenceMode && p.i === sum;
          const isProd = !congruenceMode && p.i === prod;
          return (
            <g key={p.i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isA || isB || isSum || isProd ? 9 : 5}
                fill={
                  isA
                    ? 'var(--accent-strong)'
                    : isB
                      ? congruent
                        ? 'var(--accent-strong)'
                        : 'teal'
                      : isSum
                        ? 'teal'
                        : isProd
                          ? 'orange'
                          : 'currentColor'
                }
                opacity={0.9}
              />
              <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize={11} fill="currentColor">
                {p.i}
              </text>
            </g>
          );
        })}
        {congruenceMode && congruent ? (
          <text x={cx} y={cy} textAnchor="middle" fontSize={14} fill="currentColor">
            ≡
          </text>
        ) : null}
        {/* MOD-006: highlight pow result */}
        {isMod006 && fermatApplies ? (
          <text x={cx} y={cy + 16} textAnchor="middle" fontSize={12} fill="var(--accent-strong)">
            a^{mod - 1}≡{pow}
          </text>
        ) : null}
        {isMod006 && !fermatApplies && aMod !== 0 ? (
          <text x={cx} y={cy + 16} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.6}>
            gcd≠1
          </text>
        ) : null}
      </svg>
      <ControlsStack>
        {isMod006 ? (
          <div className="text-sm text-[var(--fg-muted)]">
            <label className="flex items-center gap-2">
              <span className="w-16 shrink-0 font-mono">p (primo)</span>
              <select
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-mono text-sm"
                value={modRaw}
                onChange={(e) => setModRaw(Number(e.target.value))}
                
              >
                {PRIMES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
          </div>
        ) : (
          <SliderRow label="m" value={modRaw} min={3} max={12} step={1} onChange={setModRaw} />
        )}
        <SliderRow label="a" value={a} min={0} max={15} step={1} onChange={setA} />
        <SliderRow label="b" value={b} min={0} max={15} step={1} onChange={setB} />
        {formulaId.includes('MOD-005') ? (
          <SliderRow label="m₂" value={m2} min={2} max={11} step={1} onChange={setM2} />
        ) : null}
        <p className="text-xs text-[var(--fg-muted)]">
          gcd(a,m)={fmt(g)}
          {!isMod006 && formulaId.includes('MOD-006') ? ` · ${v.fermatDemo}` : ''}
          {badge ? ` · ${badge}` : ''}
        </p>
      </ControlsStack>
    </VizPanel>
  );
}
