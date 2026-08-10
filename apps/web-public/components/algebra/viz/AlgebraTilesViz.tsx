'use client';

import { useMemo, useState } from 'react';
import { useVizLabels } from '@/lib/viz-labels';
import type { AlgebraTilesMode } from '@/lib/viz-modes';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from './controls';

type Props = { formulaId: string; idea?: string; mode?: string };

function binom(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
}

export function AlgebraTilesViz({ formulaId: _formulaId, idea, mode: modeProp }: Props) {
  const v = useVizLabels();
  const mode = (modeProp ?? 'commute') as AlgebraTilesMode;
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);
  const [c, setC] = useState(1.5);
  const [swapped, setSwapped] = useState(false);
  const [assocRight, setAssocRight] = useState(false);
  const [factored, setFactored] = useState(false);
  const [n, setN] = useState(3);
  const [showGap, setShowGap] = useState(true);

  const scale = 18;
  const halfB = b / 2;
  const pascal = useMemo(() => Array.from({ length: n + 1 }, (_, k) => binom(n, k)), [n]);

  const caption = useMemo(() => {
    const base = idea ?? '';
    switch (mode) {
      case 'commute':
        return `${base} · a+b = b+a = ${fmt(a + b)}`;
      case 'distribute':
        return `${base} · a(b+c)=${fmt(a * (b + c))} = ab+ac=${fmt(a * b + a * c)}`;
      case 'complete_square':
        return `${base} · x²+bx = (x+b/2)² − (b/2)² · (b/2)²=${fmt(halfB * halfB)}`;
      case 'degree':
        return `${base} · deg(x^a y^b) = a+b = ${fmt(a + b, 0)}`;
      case 'power':
        return `${base} · a^n · a^m → a^{n+m} · n=${fmt(a, 0)}, m=${fmt(b, 0)}`;
      case 'binomial':
        return `${base} · ${v.pascalRow} ${n}: [${pascal.join(', ')}]`;
      default:
        return base;
    }
  }, [idea, mode, a, b, c, halfB, n, pascal, v.pascalRow]);

  return (
    <VizPanel caption={caption}>
      <svg viewBox="0 0 420 220" className="h-auto w-full" role="img">
        {mode === 'commute' ? (
          <>
            {(swapped ? [b, a] : [a, b]).map((len, i) => (
              <rect
                key={`${len}-${i}`}
                x={40 + (swapped ? (i === 0 ? 0 : b * scale) : i === 0 ? 0 : a * scale)}
                y={70}
                width={len * scale}
                height={40}
                rx={6}
                fill={i === 0 ? 'var(--accent-soft)' : 'color-mix(in oklab, teal 35%, transparent)'}
                stroke="var(--accent-strong)"
              />
            ))}
            <text x={40} y={50} fontSize={13} fill="currentColor">
              {swapped ? `b+a = ${fmt(b + a)}` : `a+b = ${fmt(a + b)}`}
            </text>
            <line x1={40} y1={130} x2={40 + (a + b) * scale} y2={130} stroke="currentColor" strokeWidth={4} />
          </>
        ) : null}

        {mode === 'associate' ? (
          <>
            {[a, b, c].map((len, i) => (
              <rect
                key={i}
                x={40 + [0, a, a + b][i]! * scale}
                y={80}
                width={len * scale}
                height={36}
                rx={4}
                fill="var(--accent-soft)"
                stroke="var(--accent-strong)"
              />
            ))}
            <rect
              x={assocRight ? 40 + a * scale : 40}
              y={70}
              width={(assocRight ? b + c : a + b) * scale}
              height={56}
              fill="none"
              stroke="teal"
              strokeWidth={2}
              strokeDasharray="4 3"
              rx={6}
            />
            <text x={40} y={40} fontSize={13} fill="currentColor">
              {assocRight ? 'a+(b+c)' : '(a+b)+c'} = {fmt(a + b + c)}
            </text>
          </>
        ) : null}

        {mode === 'distribute' ? (
          <>
            <rect x={40} y={40} width={(b + c) * scale} height={a * scale} fill="var(--accent-soft)" stroke="var(--accent-strong)" />
            <line x1={40 + b * scale} y1={40} x2={40 + b * scale} y2={40 + a * scale} stroke="var(--accent-strong)" strokeWidth={2} />
            <text x={40 + (b * scale) / 2} y={50 + (a * scale) / 2} textAnchor="middle" fontSize={12} fill="currentColor">
              ab
            </text>
            <text x={40 + b * scale + (c * scale) / 2} y={50 + (a * scale) / 2} textAnchor="middle" fontSize={12} fill="currentColor">
              ac
            </text>
            <text x={40} y={30} fontSize={13} fill="currentColor">
              a(b+c) = {fmt(a * (b + c))} · ab+ac = {fmt(a * b + a * c)}
            </text>
          </>
        ) : null}

        {mode === 'square' ? (
          <>
            <rect x={60} y={30} width={a * scale} height={a * scale} fill="var(--accent-soft)" stroke="var(--accent-strong)" />
            <rect x={60 + a * scale} y={30} width={b * scale} height={a * scale} fill="color-mix(in oklab, teal 30%, transparent)" stroke="teal" />
            <rect x={60} y={30 + a * scale} width={a * scale} height={b * scale} fill="color-mix(in oklab, teal 30%, transparent)" stroke="teal" />
            <rect x={60 + a * scale} y={30 + a * scale} width={b * scale} height={b * scale} fill="color-mix(in oklab, orange 35%, transparent)" stroke="orange" />
            <text x={60} y={22} fontSize={12} fill="currentColor">
              (a+b)² = a²+2ab+b² = {fmt((a + b) ** 2)}
            </text>
          </>
        ) : null}

        {mode === 'diff_sq' ? (
          <>
            <rect x={50} y={30} width={a * scale} height={a * scale} fill="var(--accent-soft)" stroke="var(--accent-strong)" />
            {!factored ? (
              <rect
                x={50 + (a - b) * scale}
                y={30 + (a - b) * scale}
                width={Math.max(0.2, b) * scale}
                height={Math.max(0.2, b) * scale}
                fill="var(--bg)"
                stroke="currentColor"
                strokeDasharray="3 2"
              />
            ) : (
              <rect
                x={50}
                y={30}
                width={Math.max(0.2, a - b) * scale}
                height={(a + b) * scale}
                fill="color-mix(in oklab, teal 35%, transparent)"
                stroke="teal"
              />
            )}
            <text x={50} y={22} fontSize={12} fill="currentColor">
              {factored ? `(a-b)(a+b)=${fmt((a - b) * (a + b))}` : `a²-b²=${fmt(a * a - b * b)}`}
            </text>
          </>
        ) : null}

        {mode === 'complete_square' ? (
          <>
            <rect x={50} y={40} width={a * scale} height={a * scale} fill="var(--accent-soft)" stroke="var(--accent-strong)" />
            <rect
              x={50 + a * scale}
              y={40}
              width={halfB * scale}
              height={a * scale}
              fill="color-mix(in oklab, teal 30%, transparent)"
              stroke="teal"
            />
            <rect
              x={50}
              y={40 + a * scale}
              width={a * scale}
              height={halfB * scale}
              fill="color-mix(in oklab, teal 30%, transparent)"
              stroke="teal"
            />
            {showGap ? (
              <rect
                x={50 + a * scale}
                y={40 + a * scale}
                width={halfB * scale}
                height={halfB * scale}
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
            {[
              ['a·c', 'a·d'],
              ['b·c', 'b·d'],
            ].map((row, i) =>
              row.map((label, j) => (
                <g key={`${i}-${j}`}>
                  <rect
                    x={60 + j * 100}
                    y={40 + i * 70}
                    width={90}
                    height={60}
                    fill="var(--accent-soft)"
                    stroke="var(--accent-strong)"
                  />
                  <text x={105 + j * 100} y={75 + i * 70} textAnchor="middle" fontSize={13} fill="currentColor">
                    {label}
                  </text>
                </g>
              )),
            )}
            <text x={60} y={28} fontSize={12} fill="currentColor">
              (a+b)(c+d) · {v.termProduct}
            </text>
          </>
        ) : null}

        {mode === 'degree' ? (
          <>
            <rect x={60} y={50} width={a * 40} height={b * 40} fill="var(--accent-soft)" stroke="var(--accent-strong)" />
            <text x={60} y={40} fontSize={13} fill="currentColor">
              {v.degreeLabel}: deg(x^{fmt(a, 0)} y^{fmt(b, 0)}) = {fmt(a + b, 0)}
            </text>
            <text x={60} y={50 + b * 40 + 24} fontSize={12} fill="currentColor" opacity={0.8}>
              {v.degreeHint}
            </text>
          </>
        ) : null}

        {mode === 'power' ? (
          <>
            {Array.from({ length: Math.max(1, Math.round(a)) }, (_, i) => (
              <rect
                key={`n-${i}`}
                x={40 + i * 28}
                y={60}
                width={24}
                height={40}
                fill="var(--accent-soft)"
                stroke="var(--accent-strong)"
              />
            ))}
            <text x={40 + Math.round(a) * 14} y={50} textAnchor="middle" fontSize={12} fill="currentColor">
              a^{fmt(a, 0)}
            </text>
            {Array.from({ length: Math.max(1, Math.round(b)) }, (_, i) => (
              <rect
                key={`m-${i}`}
                x={40 + i * 28}
                y={130}
                width={24}
                height={40}
                fill="color-mix(in oklab, teal 35%, transparent)"
                stroke="teal"
              />
            ))}
            <text x={40 + Math.round(b) * 14} y={120} textAnchor="middle" fontSize={12} fill="currentColor">
              a^{fmt(b, 0)}
            </text>
            <text x={40} y={200} fontSize={13} fill="currentColor">
              a^{fmt(a, 0)} · a^{fmt(b, 0)} = a^{fmt(a + b, 0)}
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
        ) : (
          <>
            <SliderRow label="a" value={a} min={0.5} max={5} step={0.1} onChange={setA} />
            <SliderRow label="b" value={b} min={0.2} max={4} step={0.1} onChange={setB} />
          </>
        )}
        {mode === 'associate' || mode === 'distribute' ? (
          <SliderRow label="c" value={c} min={0.2} max={4} step={0.1} onChange={setC} />
        ) : null}
        {mode === 'binomial' ? <SliderRow label="n" value={n} min={1} max={6} step={1} onChange={setN} /> : null}
        <ButtonRow>
          {mode === 'commute' ? (
            <VizButton onClick={() => setSwapped((s) => !s)}>{swapped ? v.orderAb : v.swap}</VizButton>
          ) : null}
          {mode === 'associate' ? (
            <VizButton onClick={() => setAssocRight((s) => !s)}>
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
