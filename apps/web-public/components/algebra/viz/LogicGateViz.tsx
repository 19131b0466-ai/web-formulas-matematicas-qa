'use client';

import { useState } from 'react';
import { useVizLabels } from '@/lib/viz-labels';
import { ControlsStack, ToggleRow, VizPanel, joinCaption } from './controls';

type Props = { formulaId: string; idea?: string };

export function LogicGateViz({}: Props) {
  const v = useVizLabels();
  const [A, setA] = useState(true);
  const [B, setB] = useState(false);

  // De Morgan I: ¬(A∧B) = ¬A∨¬B
  const nand = !(A && B);
  const orOfNots = !A || !B;
  // De Morgan II: ¬(A∨B) = ¬A∧¬B
  const nor = !(A || B);
  const andOfNots = !A && !B;
  const ok1 = nand === orOfNots;
  const ok2 = nor === andOfNots;

  return (
    <VizPanel caption={joinCaption(ok1 && ok2 ? v.tableMatch : v.tableMismatch)}>
      <svg viewBox="0 0 440 220" className="h-auto w-full" role="img">
        <text x={20} y={24} fontSize={13} fill="currentColor">
          ¬(A∧B) = ¬A∨¬B
        </text>
        <rect x={24} y={40} width={150} height={56} rx={10} fill="var(--accent-soft)" stroke="var(--accent-strong)" />
        <text x={99} y={74} textAnchor="middle" fontSize={13} fill="currentColor">
          ¬(A∧B) → {nand ? 1 : 0}
        </text>
        <rect
          x={230}
          y={40}
          width={150}
          height={56}
          rx={10}
          fill="color-mix(in oklab, teal 30%, transparent)"
          stroke="teal"
        />
        <text x={305} y={74} textAnchor="middle" fontSize={13} fill="currentColor">
          ¬A∨¬B → {orOfNots ? 1 : 0}
        </text>
        <text x={200} y={74} textAnchor="middle" fontSize={16} fill="currentColor">
          {ok1 ? '=' : '≠'}
        </text>

        <text x={20} y={128} fontSize={13} fill="currentColor">
          ¬(A∨B) = ¬A∧¬B
        </text>
        <rect x={24} y={144} width={150} height={56} rx={10} fill="var(--accent-soft)" stroke="var(--accent-strong)" />
        <text x={99} y={178} textAnchor="middle" fontSize={13} fill="currentColor">
          ¬(A∨B) → {nor ? 1 : 0}
        </text>
        <rect
          x={230}
          y={144}
          width={150}
          height={56}
          rx={10}
          fill="color-mix(in oklab, teal 30%, transparent)"
          stroke="teal"
        />
        <text x={305} y={178} textAnchor="middle" fontSize={13} fill="currentColor">
          ¬A∧¬B → {andOfNots ? 1 : 0}
        </text>
        <text x={200} y={178} textAnchor="middle" fontSize={16} fill="currentColor">
          {ok2 ? '=' : '≠'}
        </text>
      </svg>
      <ControlsStack>
        <ToggleRow label={v.inputA} checked={A} onChange={setA} />
        <ToggleRow label={v.inputB} checked={B} onChange={setB} />
      </ControlsStack>
    </VizPanel>
  );
}
