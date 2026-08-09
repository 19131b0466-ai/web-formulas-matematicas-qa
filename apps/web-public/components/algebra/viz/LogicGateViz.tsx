'use client';

import { useState } from 'react';
import { ControlsStack, ToggleRow, VizPanel } from './controls';

type Props = { formulaId: string; idea?: string };

export function LogicGateViz({ formulaId: _id, idea }: Props) {
  const [A, setA] = useState(true);
  const [B, setB] = useState(false);

  const nand = !(A && B);
  const nor = !(A || B);
  const deMorganLeft = !A || !B;
  const deMorganRight = !A && !B;

  return (
    <VizPanel caption={idea}>
      <svg viewBox="0 0 440 200" className="h-auto w-full" role="img">
        <text x={20} y={30} fontSize={13} fill="currentColor">
          De Morgan: ¬(A∧B)=¬A∨¬B · ¬(A∨B)=¬A∧¬B
        </text>
        {/* AND bubble as NAND */}
        <rect x={40} y={60} width={120} height={70} rx={12} fill="var(--accent-soft)" stroke="var(--accent-strong)" />
        <text x={100} y={100} textAnchor="middle" fontSize={14} fill="currentColor">
          NAND → {nand ? 1 : 0}
        </text>
        <rect x={240} y={60} width={120} height={70} rx={12} fill="color-mix(in oklab, teal 30%, transparent)" stroke="teal" />
        <text x={300} y={100} textAnchor="middle" fontSize={14} fill="currentColor">
          ¬A∨¬B → {deMorganLeft ? 1 : 0}
        </text>
        <text x={20} y={170} fontSize={12} fill="currentColor">
          NOR={nor ? 1 : 0} · ¬A∧¬B={deMorganRight ? 1 : 0}
        </text>
        {/* signal dots */}
        <circle cx={30} cy={80} r={6} fill={A ? 'var(--accent-strong)' : 'currentColor'} opacity={A ? 1 : 0.3} />
        <circle cx={30} cy={110} r={6} fill={B ? 'teal' : 'currentColor'} opacity={B ? 1 : 0.3} />
      </svg>
      <ControlsStack>
        <ToggleRow label="Entrada A" checked={A} onChange={setA} />
        <ToggleRow label="Entrada B" checked={B} onChange={setB} />
      </ControlsStack>
    </VizPanel>
  );
}
