'use client';

import { useMemo, useState } from 'react';
import { useVizLabels } from '@/lib/viz-labels';
import { ControlsStack, ToggleRow, VizPanel } from './controls';

type Props = { formulaId: string; idea?: string; mode?: string };

function op(formulaId: string, a: boolean, b: boolean): boolean {
  if (formulaId.includes('BOO-002')) return a || b;
  if (formulaId.includes('BOO-003')) return a !== b;
  if (formulaId.includes('BOO-005')) return !(a && b);
  if (formulaId.includes('BOO-006')) return !(a || b);
  if (formulaId.includes('BOO-007')) return !a || b;
  if (formulaId.includes('BOO-008')) return a === b;
  if (formulaId.includes('BOO-009')) return !(a !== b);
  if (formulaId.includes('BOO-001')) return a && b;
  return a && b;
}

export function TruthTableViz({ formulaId, idea }: Props) {
  const v = useVizLabels();
  const [editA, setEditA] = useState(true);
  const [editB, setEditB] = useState(false);
  const [customOut, setCustomOut] = useState<Record<string, boolean>>({});

  const rows = useMemo(
    () =>
      [false, true].flatMap((a) =>
        [false, true].map((b) => {
          const key = `${a ? 1 : 0}${b ? 1 : 0}`;
          const expected = op(formulaId, a, b);
          const out = customOut[key] ?? expected;
          return { a, b, key, out, expected, ok: out === expected };
        }),
      ),
    [formulaId, customOut],
  );

  const allOk = rows.every((r) => r.ok);
  const live = op(formulaId, editA, editB);

  return (
    <VizPanel caption={`${idea ?? ''} · ${allOk ? v.tableMatch : v.tableMismatch}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--fg-muted)]">
              <th className="px-2 py-1">A</th>
              <th className="px-2 py-1">B</th>
              <th className="px-2 py-1">Out</th>
              <th className="px-2 py-1">Exp</th>
              <th className="px-2 py-1">✓</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.key}
                className={`border-t border-[var(--border)] ${row.ok ? '' : 'bg-[color-mix(in_oklab,orange_18%,transparent)]'}`}
              >
                <td className="px-2 py-1 font-mono">{row.a ? 1 : 0}</td>
                <td className="px-2 py-1 font-mono">{row.b ? 1 : 0}</td>
                <td className="px-2 py-1 font-mono">{row.out ? 1 : 0}</td>
                <td className="px-2 py-1 font-mono opacity-70">{row.expected ? 1 : 0}</td>
                <td className="px-2 py-1">
                  <button
                    type="button"
                    className="rounded border border-[var(--border)] px-2 py-0.5 text-xs"
                    onClick={() => setCustomOut((prev) => ({ ...prev, [row.key]: !row.out }))}
                  >
                    {row.ok ? '✓' : '!'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ControlsStack>
        <ToggleRow label="A" checked={editA} onChange={setEditA} />
        <ToggleRow label="B" checked={editB} onChange={setEditB} />
        <p className="font-mono text-sm">
          A={editA ? 1 : 0}, B={editB ? 1 : 0} → {live ? 1 : 0}
        </p>
      </ControlsStack>
    </VizPanel>
  );
}
