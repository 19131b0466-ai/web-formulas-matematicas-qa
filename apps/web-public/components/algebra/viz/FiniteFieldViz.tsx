'use client';

import { useMemo, useState } from 'react';
import { useVizLabels } from '@/lib/viz-labels';
import { ControlsStack, SliderRow, VizPanel } from './controls';

type Props = { formulaId: string; idea?: string };

export function FiniteFieldViz({ formulaId }: Props) {
  const v = useVizLabels();
  const [p, setP] = useState(5);
  const [sel, setSel] = useState<[number, number] | null>([2, 3]);
  const [mode, setMode] = useState<'add' | 'mul'>('add');

  const table = useMemo(() => {
    return Array.from({ length: p }, (_, i) =>
      Array.from({ length: p }, (_, j) => (mode === 'add' ? (i + j) % p : (i * j) % p)),
    );
  }, [p, mode]);

  const inv = sel
    ? Array.from({ length: p }, (_, x) => x).find((x) => (sel[0] * x) % p === 1) ?? null
    : null;

  // Identity: 0 for add, 1 for mul
  const identity = mode === 'add' ? 0 : 1;

  // F2^3 subspace demo for COD-001
  const codeWords =
    formulaId.includes('COD-001')
      ? [
          [0, 0, 0],
          [1, 0, 1],
          [0, 1, 1],
          [1, 1, 0],
        ]
      : null;

  return (
    <VizPanel>
      {codeWords ? (
        <div className="mb-3 space-y-1 font-mono text-sm">
          {codeWords.map((w, i) => (
            <div key={i}>c{i} = [{w.join(', ')}]</div>
          ))}
          <p className="text-[var(--fg-muted)]">{v.subspaceNote}</p>
        </div>
      ) : null}
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          className={`rounded border px-2 py-1 ${mode === 'add' ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)]' : 'border-[var(--border)]'}`}
          onClick={() => setMode('add')}
        >
          {v.tableAdd}
        </button>
        <button
          type="button"
          className={`rounded border px-2 py-1 ${mode === 'mul' ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)]' : 'border-[var(--border)]'}`}
          onClick={() => setMode('mul')}
        >
          {v.tableMul}
        </button>
        <span className="self-center text-xs text-[var(--fg-muted)]">
          identidad: {identity}
        </span>
      </div>
      <div className="mt-2 overflow-x-auto">
        <table className="border-collapse text-center font-mono text-xs">
          <thead>
            <tr>
              <th className="p-1" />
              {Array.from({ length: p }, (_, j) => (
                <th
                  key={j}
                  className={`p-1 ${j === identity ? 'text-[var(--accent-strong)] font-bold' : 'text-[var(--fg-muted)]'}`}
                >
                  {j}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.map((row, i) => (
              <tr key={i}>
                <th className={`p-1 ${i === identity ? 'text-[var(--accent-strong)] font-bold' : 'text-[var(--fg-muted)]'}`}>
                  {i}
                </th>
                {row.map((val, j) => {
                  const isIdentityRow = i === identity;
                  const isIdentityCol = j === identity;
                  const isSelected = sel && sel[0] === i && sel[1] === j;
                  return (
                    <td key={j} className="p-0">
                      <button
                        type="button"
                        className={`h-8 w-8 transition ${
                          isSelected
                            ? 'bg-[var(--accent-soft)] text-[var(--accent-strong)] font-bold'
                            : isIdentityRow || isIdentityCol
                              ? 'bg-[var(--accent-soft)]/40 text-[var(--accent-strong)]'
                              : 'hover:bg-[var(--accent-soft)]'
                        }`}
                        onClick={() => setSel([i, j])}
                      >
                        {val}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ControlsStack>
        <SliderRow label="p" value={p} min={2} max={7} step={1} onChange={(v) => setP([2, 3, 5, 7].includes(v) ? v : 5)} />
        {sel ? (
          <p className="text-sm">
            Celda ({sel[0]},{sel[1]}) → {table[sel[0]]![sel[1]]}
            {mode === 'mul' ? ` · inverso de ${sel[0]}: ${inv ?? '—'}` : ''}
          </p>
        ) : null}
      </ControlsStack>
    </VizPanel>
  );
}
