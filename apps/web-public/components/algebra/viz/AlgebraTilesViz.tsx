'use client';

import { useState } from 'react';
import { useVizLabels } from '@/lib/viz-labels';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from './controls';

type Props = { formulaId: string; idea?: string };

export function AlgebraTilesViz({ formulaId, idea }: Props) {
  const v = useVizLabels();
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);
  const [c, setC] = useState(1.5);
  const [swapped, setSwapped] = useState(false);
  const [assocRight, setAssocRight] = useState(false);
  const [factored, setFactored] = useState(false);
  const [n, setN] = useState(3);

  const scale = 18;
  const isComm = formulaId.includes('FND-001');
  const isAssoc = formulaId.includes('FND-002');
  const isDist = formulaId.includes('FND-003') || formulaId.includes('FAC-001');
  const isSquare = /IDN-001|IDN-002|FAC-003|EQU-005|POL-008/.test(formulaId);
  const isDiffSq = /IDN-003|FAC-002/.test(formulaId);
  const isBinom = formulaId.includes('IDN-008');
  const isPolyGrid = formulaId.includes('EXP-003');

  return (
    <VizPanel caption={idea}>
      <svg viewBox="0 0 420 200" className="h-auto w-full" role="img">
        {isComm ? (
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
        {isAssoc ? (
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
        {isDist ? (
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
        {isSquare ? (
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
        {isDiffSq ? (
          <>
            <rect x={50} y={30} width={a * scale} height={a * scale} fill="var(--accent-soft)" stroke="var(--accent-strong)" />
            {!factored ? (
              <rect x={50 + (a - b) * scale} y={30 + (a - b) * scale} width={b * scale} height={b * scale} fill="var(--bg)" stroke="currentColor" strokeDasharray="3 2" />
            ) : (
              <rect x={50} y={30} width={(a - b) * scale} height={(a + b) * scale} fill="color-mix(in oklab, teal 35%, transparent)" stroke="teal" />
            )}
            <text x={50} y={22} fontSize={12} fill="currentColor">
              {factored ? `(a-b)(a+b)=${fmt((a - b) * (a + b))}` : `a²-b²=${fmt(a * a - b * b)}`}
            </text>
          </>
        ) : null}
        {isBinom ? (
          <text x={30} y={100} fontSize={14} fill="currentColor">
            Fila {n} de Pascal · (a+b)^{n}
          </text>
        ) : null}
        {isPolyGrid ? (
          <>
            {[0, 1].map((i) =>
              [0, 1].map((j) => (
                <rect
                  key={`${i}-${j}`}
                  x={60 + j * 80}
                  y={40 + i * 60}
                  width={70}
                  height={50}
                  fill="var(--accent-soft)"
                  stroke="var(--accent-strong)"
                />
              )),
            )}
            <text x={60} y={30} fontSize={12} fill="currentColor">
              {v.termProduct}
            </text>
          </>
        ) : null}
        {!isComm && !isAssoc && !isDist && !isSquare && !isDiffSq && !isBinom && !isPolyGrid ? (
          <>
            <rect x={40} y={50} width={a * scale} height={40} fill="var(--accent-soft)" stroke="var(--accent-strong)" rx={6} />
            <rect x={40 + a * scale + 8} y={50} width={b * scale} height={40} fill="color-mix(in oklab, teal 30%, transparent)" stroke="teal" rx={6} />
            <text x={40} y={40} fontSize={13} fill="currentColor">
              {v.algebraTiles} a={fmt(a)}, b={fmt(b)}
            </text>
          </>
        ) : null}
      </svg>
      <ControlsStack>
        <SliderRow label="a" value={a} min={0.5} max={5} step={0.1} onChange={setA} />
        <SliderRow label="b" value={b} min={0.2} max={4} step={0.1} onChange={setB} />
        {isAssoc || isDist ? <SliderRow label="c" value={c} min={0.2} max={4} step={0.1} onChange={setC} /> : null}
        {isBinom ? <SliderRow label="n" value={n} min={1} max={6} step={1} onChange={setN} /> : null}
        <ButtonRow>
          {isComm ? <VizButton onClick={() => setSwapped((s) => !s)}>{swapped ? v.orderAb : v.swap}</VizButton> : null}
          {isAssoc ? (
            <VizButton onClick={() => setAssocRight((s) => !s)}>
              {assocRight ? v.groupLeft : v.groupRight}
            </VizButton>
          ) : null}
          {isDiffSq ? (
            <VizButton onClick={() => setFactored((s) => !s)} active={factored}>
              {factored ? v.expandedForm : v.reorderFactor}
            </VizButton>
          ) : null}
        </ButtonRow>
      </ControlsStack>
    </VizPanel>
  );
}
