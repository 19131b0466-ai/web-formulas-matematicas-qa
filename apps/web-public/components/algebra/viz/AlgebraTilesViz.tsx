'use client';

import { useMemo, useState } from 'react';
import { useVizLabels } from '@/lib/viz-labels';
import type { AlgebraTilesMode } from '@/lib/viz-modes';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt, joinCaption } from './controls';

type Props = { formulaId: string; idea?: string; mode?: string };

function binom(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
}

function fitScale(w: number, h: number, maxW: number, maxH: number, cap = 32): number {
  return Math.min(maxW / Math.max(w, 0.2), maxH / Math.max(h, 0.2), cap);
}

export function AlgebraTilesViz({ formulaId: _formulaId, mode: modeProp }: Props) {
  const v = useVizLabels();
  const mode = (modeProp ?? 'commute') as AlgebraTilesMode;
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);
  const [c, setC] = useState(1.5);
  const [d, setD] = useState(1.2);
  const [factored, setFactored] = useState(false);
  const [n, setN] = useState(3);
  const [showGap, setShowGap] = useState(true);

  const halfB = b / 2;
  const pascal = useMemo(() => Array.from({ length: n + 1 }, (_, k) => binom(n, k)), [n]);
  const leftArea = a * (b + c);
  const rightArea = a * b + a * c;
  const areasMatch = Math.abs(leftArea - rightArea) < 1e-9;

  const caption = useMemo(() => {
    switch (mode) {
      case 'commute':
        return joinCaption(`a+b = b+a = ${fmt(a + b)}`);
      case 'associate':
        return joinCaption(`(a+b)+c = a+(b+c) = ${fmt(a + b + c)}`);
      case 'distribute':
        return joinCaption(
          `a(b+c) = ${fmt(leftArea)}`,
          `ab+ac = ${fmt(rightArea)}`,
          areasMatch ? v.sameTotal : undefined,
        );
      case 'complete_square':
        return joinCaption(`x²+bx = (x+b/2)² − (b/2)²`, `(b/2)²=${fmt(halfB * halfB)}`);
      case 'degree':
        return joinCaption(`deg(x^a y^b) = a+b = ${fmt(a + b, 0)}`);
      case 'power':
        return joinCaption(`a^n · a^m = a^{n+m}`, `n=${fmt(a, 0)}, m=${fmt(b, 0)}`);
      case 'binomial':
        return joinCaption(`${v.pascalRow} ${n}: [${pascal.join(', ')}]`);
      case 'square':
        return joinCaption(`(a+b)² = ${fmt((a + b) ** 2)}`);
      case 'square_minus':
        return joinCaption(`(a−b)² = ${fmt((a - b) ** 2)}`);
      case 'diff_sq':
        return joinCaption(
          factored ? `(a−b)(a+b) = ${fmt((a - b) * (a + b))}` : `a²−b² = ${fmt(a * a - b * b)}`,
        );
      case 'poly_grid':
        return joinCaption(`(a+b)(c+d) = ${fmt((a + b) * (c + d))}`);
      default:
        return undefined;
    }
  }, [
    mode,
    a,
    b,
    c,
    d,
    halfB,
    n,
    pascal,
    leftArea,
    rightArea,
    areasMatch,
    factored,
    v.pascalRow,
    v.sameTotal,
  ]);

  const viewH =
    mode === 'distribute' || mode === 'commute' || mode === 'associate' || mode === 'power'
      ? 260
      : mode === 'poly_grid'
        ? 240
        : 220;

  return (
    <VizPanel caption={caption}>
      <svg viewBox={`0 0 440 ${viewH}`} className="h-auto w-full" role="img">
        {mode === 'commute' ? (
          <>
            {/* a+b */}
            <text x={24} y={28} fontSize={13} fill="currentColor">
              a+b = {fmt(a + b)}
            </text>
            <rect x={24} y={40} width={a * 22} height={36} rx={5} fill="var(--accent-soft)" stroke="var(--accent-strong)" />
            <rect
              x={24 + a * 22}
              y={40}
              width={b * 22}
              height={36}
              rx={5}
              fill="color-mix(in oklab, teal 35%, transparent)"
              stroke="teal"
            />
            <text x={24 + (a * 22) / 2} y={63} textAnchor="middle" fontSize={12} fill="currentColor">
              a
            </text>
            <text x={24 + a * 22 + (b * 22) / 2} y={63} textAnchor="middle" fontSize={12} fill="currentColor">
              b
            </text>
            <line x1={24} y1={90} x2={24 + (a + b) * 22} y2={90} stroke="currentColor" strokeWidth={4} />

            {/* b+a */}
            <text x={24} y={130} fontSize={13} fill="currentColor">
              b+a = {fmt(b + a)}
            </text>
            <rect x={24} y={142} width={b * 22} height={36} rx={5} fill="color-mix(in oklab, teal 35%, transparent)" stroke="teal" />
            <rect
              x={24 + b * 22}
              y={142}
              width={a * 22}
              height={36}
              rx={5}
              fill="var(--accent-soft)"
              stroke="var(--accent-strong)"
            />
            <text x={24 + (b * 22) / 2} y={165} textAnchor="middle" fontSize={12} fill="currentColor">
              b
            </text>
            <text x={24 + b * 22 + (a * 22) / 2} y={165} textAnchor="middle" fontSize={12} fill="currentColor">
              a
            </text>
            <line x1={24} y1={192} x2={24 + (a + b) * 22} y2={192} stroke="currentColor" strokeWidth={4} />
            <text x={24} y={230} fontSize={12} fill="currentColor" opacity={0.8}>
              {v.sameTotal}
            </text>
          </>
        ) : null}

        {mode === 'associate' ? (
          <>
            {[a, b, c].map((len, i) => (
              <rect
                key={`t-${i}`}
                x={24 + [0, a, a + b][i]! * 20}
                y={48}
                width={len * 20}
                height={32}
                rx={4}
                fill="var(--accent-soft)"
                stroke="var(--accent-strong)"
              />
            ))}
            <rect
              x={24}
              y={40}
              width={(a + b) * 20}
              height={48}
              fill="none"
              stroke="teal"
              strokeWidth={2}
              strokeDasharray="4 3"
              rx={6}
            />
            <text x={24} y={28} fontSize={13} fill="currentColor">
              (a+b)+c = {fmt(a + b + c)}
            </text>

            {[a, b, c].map((len, i) => (
              <rect
                key={`b-${i}`}
                x={24 + [0, a, a + b][i]! * 20}
                y={148}
                width={len * 20}
                height={32}
                rx={4}
                fill="var(--accent-soft)"
                stroke="var(--accent-strong)"
              />
            ))}
            <rect
              x={24 + a * 20}
              y={140}
              width={(b + c) * 20}
              height={48}
              fill="none"
              stroke="teal"
              strokeWidth={2}
              strokeDasharray="4 3"
              rx={6}
            />
            <text x={24} y={128} fontSize={13} fill="currentColor">
              a+(b+c) = {fmt(a + b + c)}
            </text>
            <text x={24} y={220} fontSize={12} fill="currentColor" opacity={0.8}>
              {v.sameTotal}
            </text>
          </>
        ) : null}

        {mode === 'distribute' ? (
          <>
            {(() => {
              const s = fitScale(b + c, a, 170, 120);
              const leftX = 24;
              const rightX = 240;
              const y0 = 44;
              return (
                <>
                  <text x={leftX} y={28} fontSize={13} fill="currentColor">
                    a(b+c) = {fmt(leftArea)}
                  </text>
                  <rect
                    x={leftX}
                    y={y0}
                    width={(b + c) * s}
                    height={a * s}
                    rx={4}
                    fill="var(--accent-soft)"
                    stroke="var(--accent-strong)"
                    strokeWidth={2}
                  />
                  <text
                    x={leftX - 10}
                    y={y0 + (a * s) / 2}
                    textAnchor="middle"
                    fontSize={12}
                    fill="currentColor"
                    transform={`rotate(-90 ${leftX - 10} ${y0 + (a * s) / 2})`}
                  >
                    a
                  </text>
                  <text x={leftX + ((b + c) * s) / 2} y={y0 + a * s + 18} textAnchor="middle" fontSize={12} fill="currentColor">
                    b+c
                  </text>

                  <text x={rightX} y={28} fontSize={13} fill="currentColor">
                    ab + ac = {fmt(rightArea)}
                  </text>
                  <rect
                    x={rightX}
                    y={y0}
                    width={b * s}
                    height={a * s}
                    rx={4}
                    fill="var(--accent-soft)"
                    stroke="var(--accent-strong)"
                  />
                  <rect
                    x={rightX + b * s + 8}
                    y={y0}
                    width={c * s}
                    height={a * s}
                    rx={4}
                    fill="color-mix(in oklab, teal 35%, transparent)"
                    stroke="teal"
                  />
                  <text x={rightX + (b * s) / 2} y={y0 + (a * s) / 2 + 4} textAnchor="middle" fontSize={12} fill="currentColor">
                    ab
                  </text>
                  <text
                    x={rightX + b * s + 8 + (c * s) / 2}
                    y={y0 + (a * s) / 2 + 4}
                    textAnchor="middle"
                    fontSize={12}
                    fill="currentColor"
                  >
                    ac
                  </text>
                  <text x={24} y={230} fontSize={12} fill="currentColor" opacity={0.85}>
                    {v.compareBothSides}
                  </text>
                </>
              );
            })()}
          </>
        ) : null}

        {mode === 'square' ? (
          <>
            <rect x={60} y={36} width={a * 18} height={a * 18} fill="var(--accent-soft)" stroke="var(--accent-strong)" />
            <rect
              x={60 + a * 18}
              y={36}
              width={b * 18}
              height={a * 18}
              fill="color-mix(in oklab, teal 30%, transparent)"
              stroke="teal"
            />
            <rect
              x={60}
              y={36 + a * 18}
              width={a * 18}
              height={b * 18}
              fill="color-mix(in oklab, teal 30%, transparent)"
              stroke="teal"
            />
            <rect
              x={60 + a * 18}
              y={36 + a * 18}
              width={b * 18}
              height={b * 18}
              fill="color-mix(in oklab, orange 35%, transparent)"
              stroke="orange"
            />
            <text x={60 + (a * 18) / 2} y={36 + (a * 18) / 2 + 4} textAnchor="middle" fontSize={11} fill="currentColor">
              a²
            </text>
            <text x={60 + a * 18 + (b * 18) / 2} y={36 + (a * 18) / 2 + 4} textAnchor="middle" fontSize={11} fill="currentColor">
              ab
            </text>
            <text x={60 + (a * 18) / 2} y={36 + a * 18 + (b * 18) / 2 + 4} textAnchor="middle" fontSize={11} fill="currentColor">
              ab
            </text>
            <text
              x={60 + a * 18 + (b * 18) / 2}
              y={36 + a * 18 + (b * 18) / 2 + 4}
              textAnchor="middle"
              fontSize={11}
              fill="currentColor"
            >
              b²
            </text>
            <text x={60} y={22} fontSize={12} fill="currentColor">
              (a+b)² = a²+2ab+b² = {fmt((a + b) ** 2)}
            </text>
          </>
        ) : null}

        {mode === 'square_minus' ? (
          <>
            {(() => {
              const s = 18;
              const aa = Math.max(a, b + 0.4);
              const bb = Math.min(b, aa - 0.3);
              const rem = aa - bb;
              return (
                <>
                  <rect x={50} y={40} width={aa * s} height={aa * s} fill="var(--accent-soft)" stroke="var(--accent-strong)" />
                  {/* strips removed conceptually */}
                  <rect
                    x={50 + rem * s}
                    y={40}
                    width={bb * s}
                    height={rem * s}
                    fill="color-mix(in oklab, teal 28%, transparent)"
                    stroke="teal"
                    strokeDasharray="3 2"
                  />
                  <rect
                    x={50}
                    y={40 + rem * s}
                    width={rem * s}
                    height={bb * s}
                    fill="color-mix(in oklab, teal 28%, transparent)"
                    stroke="teal"
                    strokeDasharray="3 2"
                  />
                  <rect
                    x={50 + rem * s}
                    y={40 + rem * s}
                    width={bb * s}
                    height={bb * s}
                    fill="color-mix(in oklab, orange 35%, transparent)"
                    stroke="orange"
                  />
                  <rect
                    x={50}
                    y={40}
                    width={rem * s}
                    height={rem * s}
                    fill="none"
                    stroke="var(--accent-strong)"
                    strokeWidth={2.5}
                  />
                  <text x={50 + (rem * s) / 2} y={40 + (rem * s) / 2 + 4} textAnchor="middle" fontSize={11} fill="currentColor">
                    (a−b)²
                  </text>
                  <text x={50 + rem * s + (bb * s) / 2} y={40 + (rem * s) / 2 + 4} textAnchor="middle" fontSize={10} fill="currentColor">
                    −ab
                  </text>
                  <text x={50 + (rem * s) / 2} y={40 + rem * s + (bb * s) / 2 + 4} textAnchor="middle" fontSize={10} fill="currentColor">
                    −ab
                  </text>
                  <text
                    x={50 + rem * s + (bb * s) / 2}
                    y={40 + rem * s + (bb * s) / 2 + 4}
                    textAnchor="middle"
                    fontSize={10}
                    fill="currentColor"
                  >
                    +b²
                  </text>
                  <text x={50} y={26} fontSize={12} fill="currentColor">
                    (a−b)² = a²−2ab+b² = {fmt(rem * rem)}
                  </text>
                </>
              );
            })()}
          </>
        ) : null}

        {mode === 'diff_sq' ? (
          <>
            {!factored ? (
              <>
                <rect x={50} y={40} width={a * 18} height={a * 18} fill="var(--accent-soft)" stroke="var(--accent-strong)" />
                <rect
                  x={50 + (a - b) * 18}
                  y={40 + (a - b) * 18}
                  width={Math.max(0.25, b) * 18}
                  height={Math.max(0.25, b) * 18}
                  fill="var(--bg)"
                  stroke="currentColor"
                  strokeDasharray="3 2"
                />
                <text x={50} y={28} fontSize={12} fill="currentColor">
                  a² − b² = {fmt(a * a - b * b)}
                </text>
              </>
            ) : (
              <>
                {/* rearrange into (a-b) by (a+b) rectangle */}
                <rect
                  x={50}
                  y={50}
                  width={Math.max(0.25, a - b) * 18}
                  height={(a + b) * 14}
                  fill="color-mix(in oklab, teal 35%, transparent)"
                  stroke="teal"
                />
                <text x={50 + Math.max(0.25, a - b) * 9} y={40} textAnchor="middle" fontSize={12} fill="currentColor">
                  (a−b)(a+b) = {fmt((a - b) * (a + b))}
                </text>
                <text
                  x={50 + Math.max(0.25, a - b) * 9}
                  y={50 + ((a + b) * 14) / 2 + 4}
                  textAnchor="middle"
                  fontSize={11}
                  fill="currentColor"
                >
                  {v.sameArea}
                </text>
              </>
            )}
          </>
        ) : null}

        {mode === 'complete_square' ? (
          <>
            <rect x={50} y={40} width={a * 18} height={a * 18} fill="var(--accent-soft)" stroke="var(--accent-strong)" />
            <rect
              x={50 + a * 18}
              y={40}
              width={halfB * 18}
              height={a * 18}
              fill="color-mix(in oklab, teal 30%, transparent)"
              stroke="teal"
            />
            <rect
              x={50}
              y={40 + a * 18}
              width={a * 18}
              height={halfB * 18}
              fill="color-mix(in oklab, teal 30%, transparent)"
              stroke="teal"
            />
            {showGap ? (
              <rect
                x={50 + a * 18}
                y={40 + a * 18}
                width={halfB * 18}
                height={halfB * 18}
                fill="color-mix(in oklab, orange 40%, transparent)"
                stroke="orange"
                strokeDasharray="4 2"
              />
            ) : null}
            <text x={50} y={28} fontSize={12} fill="currentColor">
              {showGap
                ? `x² + bx + (b/2)² = (x+b/2)² · ${v.addSquare}`
                : `(x+b/2)² − (b/2)² · ${v.subtractSquare}`}
            </text>
          </>
        ) : null}

        {mode === 'binomial' ? (
          <>
            {pascal.map((coef, k) => (
              <g key={k}>
                <rect
                  x={30 + k * 55}
                  y={70}
                  width={48}
                  height={48}
                  rx={6}
                  fill="var(--accent-soft)"
                  stroke="var(--accent-strong)"
                />
                <text x={54 + k * 55} y={98} textAnchor="middle" fontSize={14} fill="currentColor">
                  {coef}
                </text>
                <text x={54 + k * 55} y={140} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.75}>
                  a^{n - k}b^{k}
                </text>
              </g>
            ))}
            <text x={30} y={40} fontSize={13} fill="currentColor">
              (a+b)^{n} · {v.pascalRow} {n}
            </text>
          </>
        ) : null}

        {mode === 'poly_grid' ? (
          <>
            {(() => {
              const s = fitScale(a + b, c + d, 280, 150, 40);
              const x0 = 70;
              const y0 = 50;
              const cells = [
                { x: 0, y: 0, w: a, h: c, label: 'ac', val: a * c },
                { x: a, y: 0, w: b, h: c, label: 'bc', val: b * c },
                { x: 0, y: c, w: a, h: d, label: 'ad', val: a * d },
                { x: a, y: c, w: b, h: d, label: 'bd', val: b * d },
              ];
              return (
                <>
                  <text x={x0} y={28} fontSize={12} fill="currentColor">
                    (a+b)(c+d) · {v.termProduct}
                  </text>
                  {cells.map((cell) => (
                    <g key={cell.label}>
                      <rect
                        x={x0 + cell.x * s}
                        y={y0 + cell.y * s}
                        width={cell.w * s}
                        height={cell.h * s}
                        fill="var(--accent-soft)"
                        stroke="var(--accent-strong)"
                      />
                      <text
                        x={x0 + cell.x * s + (cell.w * s) / 2}
                        y={y0 + cell.y * s + (cell.h * s) / 2}
                        textAnchor="middle"
                        fontSize={11}
                        fill="currentColor"
                      >
                        {cell.label}={fmt(cell.val)}
                      </text>
                    </g>
                  ))}
                  <text x={x0 - 8} y={y0 + (c * s) / 2} textAnchor="end" fontSize={11} fill="currentColor">
                    c
                  </text>
                  <text x={x0 - 8} y={y0 + c * s + (d * s) / 2} textAnchor="end" fontSize={11} fill="currentColor">
                    d
                  </text>
                  <text x={x0 + (a * s) / 2} y={y0 - 6} textAnchor="middle" fontSize={11} fill="currentColor">
                    a
                  </text>
                  <text x={x0 + a * s + (b * s) / 2} y={y0 - 6} textAnchor="middle" fontSize={11} fill="currentColor">
                    b
                  </text>
                </>
              );
            })()}
          </>
        ) : null}

        {mode === 'degree' ? (
          <>
            <text x={30} y={36} fontSize={13} fill="currentColor">
              {v.degreeLabel}: deg(x^{fmt(a, 0)} y^{fmt(b, 0)}) = {fmt(a + b, 0)}
            </text>
            <text x={30} y={70} fontSize={12} fill="currentColor" opacity={0.8}>
              x^{fmt(a, 0)}
            </text>
            {Array.from({ length: Math.max(0, Math.round(a)) }, (_, i) => (
              <rect
                key={`ax-${i}`}
                x={30 + i * 26}
                y={80}
                width={22}
                height={22}
                rx={4}
                fill="var(--accent-soft)"
                stroke="var(--accent-strong)"
              />
            ))}
            <text x={30} y={130} fontSize={12} fill="currentColor" opacity={0.8}>
              y^{fmt(b, 0)}
            </text>
            {Array.from({ length: Math.max(0, Math.round(b)) }, (_, i) => (
              <rect
                key={`by-${i}`}
                x={30 + i * 26}
                y={140}
                width={22}
                height={22}
                rx={4}
                fill="color-mix(in oklab, teal 35%, transparent)"
                stroke="teal"
              />
            ))}
            <text x={30} y={190} fontSize={12} fill="currentColor">
              {v.degreeHint} → {fmt(a + b, 0)} {v.degreeUnits}
            </text>
          </>
        ) : null}

        {mode === 'power' ? (
          <>
            <text x={30} y={28} fontSize={12} fill="currentColor">
              a^{fmt(a, 0)}
            </text>
            {Array.from({ length: Math.max(1, Math.round(a)) }, (_, i) => (
              <rect
                key={`n-${i}`}
                x={30 + i * 26}
                y={38}
                width={22}
                height={28}
                fill="var(--accent-soft)"
                stroke="var(--accent-strong)"
              />
            ))}
            <text x={30} y={90} fontSize={12} fill="currentColor">
              a^{fmt(b, 0)}
            </text>
            {Array.from({ length: Math.max(1, Math.round(b)) }, (_, i) => (
              <rect
                key={`m-${i}`}
                x={30 + i * 26}
                y={100}
                width={22}
                height={28}
                fill="color-mix(in oklab, teal 35%, transparent)"
                stroke="teal"
              />
            ))}
            <text x={30} y={158} fontSize={12} fill="currentColor">
              a^{fmt(a + b, 0)} = a^{fmt(a, 0)} · a^{fmt(b, 0)}
            </text>
            {Array.from({ length: Math.max(1, Math.round(a + b)) }, (_, i) => (
              <rect
                key={`nm-${i}`}
                x={30 + i * 26}
                y={168}
                width={22}
                height={28}
                rx={3}
                fill={i < Math.round(a) ? 'var(--accent-soft)' : 'color-mix(in oklab, teal 35%, transparent)'}
                stroke={i < Math.round(a) ? 'var(--accent-strong)' : 'teal'}
              />
            ))}
            <text x={30} y={220} fontSize={12} fill="currentColor" opacity={0.8}>
              {v.powerMerge}
            </text>
          </>
        ) : null}
      </svg>
      <ControlsStack>
        {mode === 'degree' || mode === 'power' || mode === 'complete_square' ? (
          <>
            <SliderRow
              label={mode === 'complete_square' ? 'x' : mode === 'degree' ? 'α' : 'n'}
              value={a}
              min={mode === 'power' ? 1 : 0.5}
              max={mode === 'power' ? 6 : 5}
              step={mode === 'power' || mode === 'degree' ? 1 : 0.1}
              onChange={setA}
            />
            <SliderRow
              label={mode === 'complete_square' ? 'b' : mode === 'degree' ? 'β' : 'm'}
              value={b}
              min={mode === 'power' || mode === 'degree' ? 0 : 0.2}
              max={mode === 'power' ? 6 : 4}
              step={mode === 'power' || mode === 'degree' ? 1 : 0.1}
              onChange={setB}
            />
          </>
        ) : mode === 'square_minus' || mode === 'diff_sq' ? (
          <>
            <SliderRow label="a" value={a} min={1.5} max={5} step={0.1} onChange={setA} />
            <SliderRow
              label="b"
              value={b}
              min={0.2}
              max={Math.max(0.3, a - 0.3)}
              step={0.1}
              onChange={(val) => setB(Math.min(val, a - 0.3))}
            />
          </>
        ) : (
          <>
            <SliderRow label="a" value={a} min={0.5} max={5} step={0.1} onChange={setA} />
            <SliderRow label="b" value={b} min={0.2} max={4} step={0.1} onChange={setB} />
          </>
        )}
        {mode === 'associate' || mode === 'distribute' || mode === 'poly_grid' ? (
          <SliderRow label="c" value={c} min={0.2} max={4} step={0.1} onChange={setC} />
        ) : null}
        {mode === 'poly_grid' ? <SliderRow label="d" value={d} min={0.2} max={4} step={0.1} onChange={setD} /> : null}
        {mode === 'binomial' ? <SliderRow label="n" value={n} min={1} max={6} step={1} onChange={setN} /> : null}
        <ButtonRow>
          {mode === 'diff_sq' ? (
            <VizButton onClick={() => setFactored((s) => !s)} active={factored}>
              {factored ? v.expandedForm : v.reorderFactor}
            </VizButton>
          ) : null}
          {mode === 'complete_square' ? (
            <VizButton onClick={() => setShowGap((s) => !s)} active={showGap}>
              {showGap ? v.subtractSquare : v.addSquare}
            </VizButton>
          ) : null}
        </ButtonRow>
      </ControlsStack>
    </VizPanel>
  );
}
