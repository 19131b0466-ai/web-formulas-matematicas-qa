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

export function AlgebraTilesViz({ formulaId, mode: modeProp }: Props) {
  const v = useVizLabels();
  const mode = (modeProp ?? 'commute') as AlgebraTilesMode;
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);
  const [c, setC] = useState(1.5);
  const [d, setD] = useState(1.2);
  const [swapped, setSwapped] = useState(false);
  const [assocRight, setAssocRight] = useState(false);
  const [factored, setFactored] = useState(false);
  const [n, setN] = useState(3);
  const [showGap, setShowGap] = useState(true);

  const scale = 18;
  const halfB = b / 2;
  const pascal = useMemo(() => Array.from({ length: n + 1 }, (_, k) => binom(n, k)), [n]);
  const leftArea = a * (b + c);
  const rightArea = a * b + a * c;
  const areasMatch = Math.abs(leftArea - rightArea) < 1e-9;

  // conjugate_rationalize: (a+√b)(a−√b) = a²−b
  const sqrtB = Math.sqrt(Math.max(0, b));
  const conjProduct = a * a - b;

  const caption = useMemo(() => {
    switch (mode) {
      case 'commute':
        return joinCaption(`a+b = b+a = ${fmt(a + b)}`, v.sameTotal);
      case 'associate': {
        const partial = assocRight ? b + c : a + b;
        const partialLabel = assocRight ? 'b+c' : 'a+b';
        return joinCaption(
          `1º ${partialLabel} = ${fmt(partial)}`,
          assocRight
            ? `2º a+(b+c) = ${fmt(a + partial)}`
            : `2º (a+b)+c = ${fmt(partial + c)}`,
          v.sameTotal,
        );
      }
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
        return joinCaption(`(a−b)² = ${fmt((a - b) ** 2)}`, `a²−2ab+b² = ${fmt(a*a - 2*a*b + b*b)}`);
      case 'diff_sq':
        return joinCaption(
          factored ? `(a−b)(a+b) = ${fmt((a - b) * (a + b))}` : `a²−b² = ${fmt(a * a - b * b)}`,
        );
      case 'poly_grid':
        return joinCaption(`(a+b)(c+d) = ${fmt((a + b) * (c + d))}`);
      case 'conjugate_rationalize':
        return joinCaption(
          `(a+√b)(a−√b) = a²−b`,
          `= ${fmt(conjProduct)}`,
          conjProduct > 0 ? 'racional positivo' : conjProduct === 0 ? '= 0' : 'racional negativo',
        );
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
    conjProduct,
    assocRight,
    v.pascalRow,
    v.sameTotal,
  ]);

  const viewH = mode === 'distribute' || mode === 'power' || mode === 'associate' ? 260 : mode === 'poly_grid' || mode === 'conjugate_rationalize' ? 240 : 220;

  return (
    <VizPanel caption={caption}>
      <svg viewBox={`0 0 440 ${viewH}`} className="h-auto w-full" role="img">
        {mode === 'commute' ? (
          <>
            <text x={40} y={50} fontSize={13} fill="currentColor">
              {swapped ? `b+a = ${fmt(b + a)}` : `a+b = ${fmt(a + b)}`}
            </text>
            {(swapped ? [b, a] : [a, b]).map((len, i) => {
              const x0 = 40 + (swapped ? (i === 0 ? 0 : b * scale) : i === 0 ? 0 : a * scale);
              const label = swapped ? (i === 0 ? 'b' : 'a') : i === 0 ? 'a' : 'b';
              return (
                <g key={`${label}-${i}`}>
                  <rect
                    x={x0}
                    y={70}
                    width={len * scale}
                    height={40}
                    rx={6}
                    fill={i === 0 ? 'var(--accent-soft)' : 'color-mix(in oklab, teal 35%, transparent)'}
                    stroke={i === 0 ? 'var(--accent-strong)' : 'teal'}
                  />
                  <text x={x0 + (len * scale) / 2} y={95} textAnchor="middle" fontSize={12} fill="currentColor">
                    {label}
                  </text>
                </g>
              );
            })}
            <line x1={40} y1={130} x2={40 + (a + b) * scale} y2={130} stroke="currentColor" strokeWidth={4} />
            <text x={40} y={158} fontSize={12} fill="currentColor" opacity={0.8}>
              {v.sameTotal}
            </text>
          </>
        ) : null}

        {mode === 'associate' ? (
          <>
            {(() => {
              const partial = assocRight ? b + c : a + b;
              const partialLabel = assocRight ? 'b+c' : 'a+b';
              const groupX = assocRight ? 40 + a * scale : 40;
              const groupW = (assocRight ? b + c : a + b) * scale;
              const step2Y = 168;
              return (
                <>
                  <text x={40} y={28} fontSize={13} fill="currentColor">
                    {assocRight ? 'a+(b+c)' : '(a+b)+c'}
                  </text>

                  {/* Step 1: three blocks + grouping */}
                  <text x={40} y={52} fontSize={11} fill="currentColor" opacity={0.75}>
                    1º {partialLabel} = {fmt(partial)}
                  </text>
                  {[a, b, c].map((len, i) => {
                    const inGroup = assocRight ? i > 0 : i < 2;
                    return (
                      <g key={`assoc-${i}`}>
                        <rect
                          x={40 + [0, a, a + b][i]! * scale}
                          y={64}
                          width={len * scale}
                          height={36}
                          rx={4}
                          fill={
                            inGroup
                              ? 'color-mix(in oklab, teal 32%, transparent)'
                              : 'var(--accent-soft)'
                          }
                          stroke={inGroup ? 'teal' : 'var(--accent-strong)'}
                        />
                        <text
                          x={40 + [0, a, a + b][i]! * scale + (len * scale) / 2}
                          y={87}
                          textAnchor="middle"
                          fontSize={11}
                          fill="currentColor"
                        >
                          {['a', 'b', 'c'][i]}
                        </text>
                      </g>
                    );
                  })}
                  <rect
                    x={groupX}
                    y={56}
                    width={groupW}
                    height={52}
                    fill="none"
                    stroke="teal"
                    strokeWidth={2}
                    strokeDasharray="4 3"
                    rx={6}
                  />

                  {/* Step 2: partial sum as one block + remaining */}
                  <text x={40} y={140} fontSize={11} fill="currentColor" opacity={0.75}>
                    2º {assocRight ? `a + (${partialLabel})` : `(${partialLabel}) + c`} = {fmt(a + b + c)}
                  </text>
                  {assocRight ? (
                    <>
                      <rect
                        x={40}
                        y={step2Y}
                        width={a * scale}
                        height={36}
                        rx={4}
                        fill="var(--accent-soft)"
                        stroke="var(--accent-strong)"
                      />
                      <text x={40 + (a * scale) / 2} y={step2Y + 23} textAnchor="middle" fontSize={11} fill="currentColor">
                        a
                      </text>
                      <rect
                        x={40 + a * scale}
                        y={step2Y}
                        width={partial * scale}
                        height={36}
                        rx={4}
                        fill="color-mix(in oklab, teal 32%, transparent)"
                        stroke="teal"
                      />
                      <text
                        x={40 + a * scale + (partial * scale) / 2}
                        y={step2Y + 23}
                        textAnchor="middle"
                        fontSize={11}
                        fill="currentColor"
                      >
                        {fmt(partial)}
                      </text>
                    </>
                  ) : (
                    <>
                      <rect
                        x={40}
                        y={step2Y}
                        width={partial * scale}
                        height={36}
                        rx={4}
                        fill="color-mix(in oklab, teal 32%, transparent)"
                        stroke="teal"
                      />
                      <text
                        x={40 + (partial * scale) / 2}
                        y={step2Y + 23}
                        textAnchor="middle"
                        fontSize={11}
                        fill="currentColor"
                      >
                        {fmt(partial)}
                      </text>
                      <rect
                        x={40 + partial * scale}
                        y={step2Y}
                        width={c * scale}
                        height={36}
                        rx={4}
                        fill="var(--accent-soft)"
                        stroke="var(--accent-strong)"
                      />
                      <text
                        x={40 + partial * scale + (c * scale) / 2}
                        y={step2Y + 23}
                        textAnchor="middle"
                        fontSize={11}
                        fill="currentColor"
                      >
                        c
                      </text>
                    </>
                  )}
                  <line
                    x1={40}
                    y1={step2Y + 48}
                    x2={40 + (a + b + c) * scale}
                    y2={step2Y + 48}
                    stroke="currentColor"
                    strokeWidth={4}
                  />
                  <text x={40} y={step2Y + 72} fontSize={12} fill="currentColor" opacity={0.8}>
                    {v.sameTotal}
                  </text>
                </>
              );
            })()}
          </>
        ) : null}

        {mode === 'distribute' ? (
          <>
            {(() => {
              const isFac = formulaId.includes('FAC-001');
              const s = fitScale(b + c, a, 170, 120);
              const leftX = isFac ? 240 : 24;
              const rightX = isFac ? 24 : 240;
              const y0 = 44;
              return (
                <>
                  {/* Left panel */}
                  <text x={leftX} y={28} fontSize={13} fill="currentColor">
                    {isFac ? `ab + ac = ${fmt(rightArea)}` : `a(b+c) = ${fmt(leftArea)}`}
                  </text>
                  {isFac ? (
                    <>
                      <rect x={leftX} y={y0} width={b * s} height={a * s} rx={4} fill="var(--accent-soft)" stroke="var(--accent-strong)" />
                      <rect x={leftX + b * s + 8} y={y0} width={c * s} height={a * s} rx={4} fill="color-mix(in oklab, teal 35%, transparent)" stroke="teal" />
                      <text x={leftX + (b * s) / 2} y={y0 + (a * s) / 2 + 4} textAnchor="middle" fontSize={12} fill="currentColor">
                        ab
                      </text>
                      <text x={leftX + b * s + 8 + (c * s) / 2} y={y0 + (a * s) / 2 + 4} textAnchor="middle" fontSize={12} fill="currentColor">
                        ac
                      </text>
                    </>
                  ) : (
                    <>
                      <rect x={leftX} y={y0} width={(b + c) * s} height={a * s} rx={4} fill="var(--accent-soft)" stroke="var(--accent-strong)" strokeWidth={2} />
                      <text x={leftX - 10} y={y0 + (a * s) / 2} textAnchor="middle" fontSize={12} fill="currentColor" transform={`rotate(-90 ${leftX - 10} ${y0 + (a * s) / 2})`}>
                        a
                      </text>
                      <text x={leftX + ((b + c) * s) / 2} y={y0 + a * s + 18} textAnchor="middle" fontSize={12} fill="currentColor">
                        b+c
                      </text>
                    </>
                  )}

                  {/* Arrow in centre */}
                  <text x={214} y={y0 + (a * s) / 2 + 6} textAnchor="middle" fontSize={18} fill="currentColor" opacity={0.6}>
                    {isFac ? '←' : '→'}
                  </text>

                  {/* Right panel */}
                  <text x={rightX} y={28} fontSize={13} fill="currentColor">
                    {isFac ? `a(b+c) = ${fmt(leftArea)}` : `ab + ac = ${fmt(rightArea)}`}
                  </text>
                  {isFac ? (
                    <>
                      <rect x={rightX} y={y0} width={(b + c) * s} height={a * s} rx={4} fill="var(--accent-soft)" stroke="var(--accent-strong)" strokeWidth={2} />
                      <text x={rightX - 10} y={y0 + (a * s) / 2} textAnchor="middle" fontSize={12} fill="currentColor" transform={`rotate(-90 ${rightX - 10} ${y0 + (a * s) / 2})`}>
                        a
                      </text>
                      <text x={rightX + ((b + c) * s) / 2} y={y0 + a * s + 18} textAnchor="middle" fontSize={12} fill="currentColor">
                        b+c
                      </text>
                    </>
                  ) : (
                    <>
                      <rect x={rightX} y={y0} width={b * s} height={a * s} rx={4} fill="var(--accent-soft)" stroke="var(--accent-strong)" />
                      <rect x={rightX + b * s + 8} y={y0} width={c * s} height={a * s} rx={4} fill="color-mix(in oklab, teal 35%, transparent)" stroke="teal" />
                      <text x={rightX + (b * s) / 2} y={y0 + (a * s) / 2 + 4} textAnchor="middle" fontSize={12} fill="currentColor">
                        ab
                      </text>
                      <text x={rightX + b * s + 8 + (c * s) / 2} y={y0 + (a * s) / 2 + 4} textAnchor="middle" fontSize={12} fill="currentColor">
                        ac
                      </text>
                    </>
                  )}
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
              const rem = aa - bb; // side of (a-b) square
              const leftX = 20;
              const rightX = 230;
              const y0 = 44;
              return (
                <>
                  {/* Left panel: clean square of side (a-b) */}
                  <text x={leftX} y={28} fontSize={12} fill="currentColor">
                    (a−b)² = {fmt(rem * rem)}
                  </text>
                  <rect
                    x={leftX}
                    y={y0}
                    width={rem * s}
                    height={rem * s}
                    fill="var(--accent-soft)"
                    stroke="var(--accent-strong)"
                    strokeWidth={2}
                  />
                  <text x={leftX + (rem * s) / 2} y={y0 + (rem * s) / 2 + 4} textAnchor="middle" fontSize={11} fill="currentColor">
                    (a−b)²
                  </text>
                  {/* dimension labels */}
                  <text x={leftX + (rem * s) / 2} y={y0 - 4} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.7}>
                    a−b
                  </text>
                  <text
                    x={leftX - 8}
                    y={y0 + (rem * s) / 2}
                    textAnchor="middle"
                    fontSize={10}
                    fill="currentColor"
                    opacity={0.7}
                    transform={`rotate(-90 ${leftX - 8} ${y0 + (rem * s) / 2})`}
                  >
                    a−b
                  </text>

                  {/* Right panel: a² with expansion pieces */}
                  <text x={rightX} y={28} fontSize={12} fill="currentColor">
                    a²−2ab+b² = {fmt(aa * aa - 2 * aa * bb + bb * bb)}
                  </text>
                  {/* Big a² square */}
                  <rect x={rightX} y={y0} width={aa * s} height={aa * s} fill="var(--accent-soft)" stroke="var(--accent-strong)" />
                  {/* Top-right strip: b×(a-b), label -ab */}
                  <rect
                    x={rightX + rem * s}
                    y={y0}
                    width={bb * s}
                    height={rem * s}
                    fill="color-mix(in oklab, teal 30%, transparent)"
                    stroke="teal"
                  />
                  <text x={rightX + rem * s + (bb * s) / 2} y={y0 + (rem * s) / 2 + 4} textAnchor="middle" fontSize={9} fill="currentColor">
                    −ab
                  </text>
                  {/* Bottom-left strip: (a-b)×b, label -ab */}
                  <rect
                    x={rightX}
                    y={y0 + rem * s}
                    width={rem * s}
                    height={bb * s}
                    fill="color-mix(in oklab, teal 30%, transparent)"
                    stroke="teal"
                  />
                  <text x={rightX + (rem * s) / 2} y={y0 + rem * s + (bb * s) / 2 + 4} textAnchor="middle" fontSize={9} fill="currentColor">
                    −ab
                  </text>
                  {/* Bottom-right corner: b², label +b² */}
                  <rect
                    x={rightX + rem * s}
                    y={y0 + rem * s}
                    width={bb * s}
                    height={bb * s}
                    fill="color-mix(in oklab, orange 35%, transparent)"
                    stroke="orange"
                  />
                  <text x={rightX + rem * s + (bb * s) / 2} y={y0 + rem * s + (bb * s) / 2 + 4} textAnchor="middle" fontSize={9} fill="currentColor">
                    +b²
                  </text>
                  {/* Label (a-b)² region */}
                  <rect
                    x={rightX}
                    y={y0}
                    width={rem * s}
                    height={rem * s}
                    fill="none"
                    stroke="var(--accent-strong)"
                    strokeWidth={2.5}
                  />
                  <text x={rightX + (rem * s) / 2} y={y0 + (rem * s) / 2 + 4} textAnchor="middle" fontSize={10} fill="currentColor" fontWeight="bold">
                    (a−b)²
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
                {/* Left: a² square with b² notch */}
                {(() => {
                  const s = 18;
                  const leftX = 24;
                  return (
                    <>
                      <text x={leftX} y={28} fontSize={12} fill="currentColor">
                        a² − b² = {fmt(a * a - b * b)}
                      </text>
                      <rect x={leftX} y={40} width={a * s} height={a * s} fill="var(--accent-soft)" stroke="var(--accent-strong)" />
                      <rect
                        x={leftX + (a - b) * s}
                        y={40 + (a - b) * s}
                        width={Math.max(0.25, b) * s}
                        height={Math.max(0.25, b) * s}
                        fill="var(--bg)"
                        stroke="currentColor"
                        strokeDasharray="3 2"
                      />
                      <text x={leftX + (a * s) / 2} y={40 + (a * s) / 2 + 4} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.7}>
                        a²
                      </text>
                      <text x={leftX + (a - b) * s + (b * s) / 2} y={40 + (a - b) * s + (b * s) / 2 + 4} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.6}>
                        −b²
                      </text>
                    </>
                  );
                })()}
              </>
            ) : (
              <>
                {/* Factored: replace scene with (a−b)×(a+b) rectangle (P4 toggle) */}
                {(() => {
                  const s = 18;
                  const x0 = 50;
                  const y0 = 40;
                  const w = Math.max(0.25, a - b) * s;
                  const h = (a + b) * s;
                  return (
                    <>
                      <text x={x0} y={28} fontSize={12} fill="currentColor">
                        (a−b)(a+b) = {fmt((a - b) * (a + b))}
                      </text>
                      <rect
                        x={x0}
                        y={y0}
                        width={w}
                        height={h}
                        fill="color-mix(in oklab, teal 35%, transparent)"
                        stroke="teal"
                        strokeWidth={2}
                      />
                      <text x={x0 + w / 2} y={y0 - 4} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.7}>
                        a−b
                      </text>
                      <text
                        x={x0 - 10}
                        y={y0 + h / 2}
                        textAnchor="middle"
                        fontSize={10}
                        fill="currentColor"
                        opacity={0.7}
                        transform={`rotate(-90 ${x0 - 10} ${y0 + h / 2})`}
                      >
                        a+b
                      </text>
                      <text x={x0 + w / 2} y={y0 + h / 2 + 4} textAnchor="middle" fontSize={12} fill="currentColor">
                        {fmt((a - b) * (a + b))}
                      </text>
                      <text x={x0} y={y0 + h + 22} fontSize={12} fill="currentColor" opacity={0.8}>
                        {v.sameArea} · a²−b² = {fmt(a * a - b * b)}
                      </text>
                    </>
                  );
                })()}
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

        {mode === 'conjugate_rationalize' ? (
          <>
            {(() => {
              const barW = 160;
              const barH = 36;
              const x0 = 30;
              const y0 = 50;
              const aVal = fmt(a, 1);
              const sqrtBVal = fmt(sqrtB, 2);
              return (
                <>
                  <text x={x0} y={28} fontSize={12} fill="currentColor">
                    (a+√b)(a−√b) = a²−b = {fmt(conjProduct)}
                  </text>
                  {/* Block for (a+√b) */}
                  <rect x={x0} y={y0} width={barW} height={barH} rx={6} fill="var(--accent-soft)" stroke="var(--accent-strong)" strokeWidth={2} />
                  <text x={x0 + barW / 2} y={y0 + barH / 2 + 5} textAnchor="middle" fontSize={13} fill="currentColor">
                    a+√b = {aVal}+{sqrtBVal}
                  </text>
                  {/* × symbol */}
                  <text x={x0 + barW + 15} y={y0 + barH / 2 + 5} textAnchor="middle" fontSize={18} fill="currentColor" opacity={0.7}>
                    ×
                  </text>
                  {/* Block for (a−√b) */}
                  <rect x={x0} y={y0 + barH + 20} width={barW} height={barH} rx={6} fill="color-mix(in oklab, teal 35%, transparent)" stroke="teal" strokeWidth={2} />
                  <text x={x0 + barW / 2} y={y0 + barH + 20 + barH / 2 + 5} textAnchor="middle" fontSize={13} fill="currentColor">
                    a−√b = {aVal}−{sqrtBVal}
                  </text>
                  {/* = a²−b */}
                  <text x={x0} y={y0 + 2 * barH + 56} fontSize={13} fill="currentColor">
                    = a²−b = {fmt(a * a)}−{fmt(b)} = {fmt(conjProduct)}
                  </text>
                  {/* Product block */}
                  <rect
                    x={230}
                    y={y0}
                    width={Math.max(10, Math.abs(conjProduct) * 14)}
                    height={80}
                    rx={6}
                    fill={conjProduct >= 0 ? 'color-mix(in oklab, orange 35%, transparent)' : 'color-mix(in oklab, red 25%, transparent)'}
                    stroke={conjProduct >= 0 ? 'orange' : 'red'}
                    strokeWidth={1.5}
                  />
                  <text x={230 + Math.max(10, Math.abs(conjProduct) * 14) / 2} y={y0 + 44} textAnchor="middle" fontSize={12} fill="currentColor">
                    {fmt(conjProduct)}
                  </text>
                  <text x={230} y={y0 + 94} fontSize={11} fill="currentColor" opacity={0.75}>
                    a²−b (rational)
                  </text>
                </>
              );
            })()}
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
        ) : mode === 'commute' || mode === 'associate' ? null : mode === 'square_minus' || mode === 'diff_sq' ? (
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
        ) : mode === 'conjugate_rationalize' ? (
          <>
            <SliderRow label="a" value={a} min={0.5} max={5} step={0.1} onChange={setA} />
            <SliderRow
              label="b"
              value={b}
              min={0}
              max={Math.max(0.1, a * a - 0.01)}
              step={0.1}
              onChange={(val) => setB(Math.min(val, a * a - 0.01))}
            />
          </>
        ) : (
          <>
            <SliderRow label="a" value={a} min={0.5} max={5} step={0.1} onChange={setA} />
            <SliderRow label="b" value={b} min={0.2} max={4} step={0.1} onChange={setB} />
          </>
        )}
        {mode === 'distribute' || mode === 'poly_grid' ? (
          <SliderRow label="c" value={c} min={0.2} max={4} step={0.1} onChange={setC} />
        ) : null}
        {mode === 'poly_grid' ? <SliderRow label="d" value={d} min={0.2} max={4} step={0.1} onChange={setD} /> : null}
        {mode === 'binomial' ? <SliderRow label="n" value={n} min={1} max={6} step={1} onChange={setN} /> : null}
        <ButtonRow>
          {mode === 'commute' ? (
            <VizButton onClick={() => setSwapped((s) => !s)} active={swapped}>
              {swapped ? v.orderAb : v.swap}
            </VizButton>
          ) : null}
          {mode === 'associate' ? (
            <VizButton onClick={() => setAssocRight((s) => !s)} active={assocRight}>
              {assocRight ? v.groupLeft : v.groupRight}
            </VizButton>
          ) : null}
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
