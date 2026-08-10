'use client';

import { useState } from 'react';
import { useVizLabels } from '@/lib/viz-labels';
import { ControlsStack, ToggleRow, VizPanel, joinCaption } from './controls';

type Props = { formulaId: string; idea?: string; mode?: string };

// ── helpers ──────────────────────────────────────────────────────────────────

const b = (v: boolean) => (v ? 1 : 0);
const NOT = (v: boolean) => !v;
const AND = (a: boolean, x: boolean) => a && x;
const OR = (a: boolean, x: boolean) => a || x;
const XOR = (a: boolean, x: boolean) => a !== x;

// ── single-variable identity laws: BOO-001 ───────────────────────────────────

function IdentityTable() {
  const cols: { label: string; fn: (a: boolean) => boolean }[] = [
    { label: 'A+0', fn: (a) => OR(a, false) },
    { label: 'A·1', fn: (a) => AND(a, true) },
    { label: 'A+1', fn: (a) => OR(a, true) },
    { label: 'A·0', fn: (a) => AND(a, false) },
  ];
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-[var(--fg-muted)]">
          <th className="px-2 py-1">A</th>
          {cols.map((c) => (
            <th key={c.label} className="px-2 py-1">{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[false, true].map((a) => (
          <tr key={String(a)} className="border-t border-[var(--border)]">
            <td className="px-2 py-1 font-mono">{b(a)}</td>
            {cols.map((c) => (
              <td key={c.label} className="px-2 py-1 font-mono">{b(c.fn(a))}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── single-variable idempotent / complement laws: BOO-002 ────────────────────

function IdempotentTable() {
  const cols: { label: string; fn: (a: boolean) => boolean }[] = [
    { label: 'A+A', fn: (a) => OR(a, a) },
    { label: 'A·A', fn: (a) => AND(a, a) },
    { label: 'A+¬A', fn: (a) => OR(a, NOT(a)) },
    { label: 'A·¬A', fn: (a) => AND(a, NOT(a)) },
  ];
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-[var(--fg-muted)]">
          <th className="px-2 py-1">A</th>
          {cols.map((c) => (
            <th key={c.label} className="px-2 py-1">{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[false, true].map((a) => (
          <tr key={String(a)} className="border-t border-[var(--border)]">
            <td className="px-2 py-1 font-mono">{b(a)}</td>
            {cols.map((c) => (
              <td key={c.label} className="px-2 py-1 font-mono">{b(c.fn(a))}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── three-variable distributive law: BOO-003 ─────────────────────────────────

function DistributiveTable() {
  const rows: { a: boolean; bv: boolean; cv: boolean }[] = [false, true].flatMap((a) =>
    [false, true].flatMap((bv) =>
      [false, true].map((cv) => ({ a, bv, cv })),
    ),
  );
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-[var(--fg-muted)]">
          <th className="px-2 py-1">A</th>
          <th className="px-2 py-1">B</th>
          <th className="px-2 py-1">C</th>
          <th className="px-2 py-1">A(B+C)</th>
          <th className="px-2 py-1">AB+AC</th>
          <th className="px-2 py-1">=?</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ a, bv, cv }) => {
          const lhs = AND(a, OR(bv, cv));
          const rhs = OR(AND(a, bv), AND(a, cv));
          const eq = lhs === rhs;
          return (
            <tr
              key={`${b(a)}${b(bv)}${b(cv)}`}
              className={`border-t border-[var(--border)] ${eq ? '' : 'bg-[color-mix(in_oklab,orange_18%,transparent)]'}`}
            >
              <td className="px-2 py-1 font-mono">{b(a)}</td>
              <td className="px-2 py-1 font-mono">{b(bv)}</td>
              <td className="px-2 py-1 font-mono">{b(cv)}</td>
              <td className="px-2 py-1 font-mono">{b(lhs)}</td>
              <td className="px-2 py-1 font-mono">{b(rhs)}</td>
              <td className="px-2 py-1">{eq ? '✓' : '!'}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ── absorption law: BOO-006 ───────────────────────────────────────────────────

function AbsorptionTable() {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-[var(--fg-muted)]">
          <th className="px-2 py-1">A</th>
          <th className="px-2 py-1">B</th>
          <th className="px-2 py-1">AB</th>
          <th className="px-2 py-1">A+AB</th>
          <th className="px-2 py-1">A</th>
          <th className="px-2 py-1">=?</th>
        </tr>
      </thead>
      <tbody>
        {[false, true].flatMap((a) =>
          [false, true].map((bv) => {
            const ab = AND(a, bv);
            const lhs = OR(a, ab);
            const eq = lhs === a;
            return (
              <tr
                key={`${b(a)}${b(bv)}`}
                className={`border-t border-[var(--border)] ${eq ? '' : 'bg-[color-mix(in_oklab,orange_18%,transparent)]'}`}
              >
                <td className="px-2 py-1 font-mono">{b(a)}</td>
                <td className="px-2 py-1 font-mono">{b(bv)}</td>
                <td className="px-2 py-1 font-mono">{b(ab)}</td>
                <td className="px-2 py-1 font-mono">{b(lhs)}</td>
                <td className="px-2 py-1 font-mono">{b(a)}</td>
                <td className="px-2 py-1">{eq ? '✓' : '!'}</td>
              </tr>
            );
          }),
        )}
      </tbody>
    </table>
  );
}

// ── expected function per formulaId ──────────────────────────────────────────

function expectedOp(formulaId: string, a: boolean, bv: boolean): boolean {
  if (formulaId.includes('BOO-005')) return XOR(a, bv);
  if (formulaId.includes('BOO-007')) return OR(NOT(a), bv); // A → B = ¬A ∨ B
  if (formulaId.includes('BOO-008')) return a === bv; // A ↔ B
  if (formulaId.includes('BOO-009')) return NOT(XOR(a, bv)); // XNOR
  return AND(a, bv); // default AND
}

function opLabel(formulaId: string): string {
  if (formulaId.includes('BOO-005')) return 'A⊕B';
  if (formulaId.includes('BOO-007')) return 'A→B';
  if (formulaId.includes('BOO-008')) return 'A↔B';
  if (formulaId.includes('BOO-009')) return '¬(A⊕B)';
  return 'A·B';
}

// ── editable 2-var truth table (BOO-005, 007, 008, 009 + default) ────────────

function EditableTable({ formulaId }: { formulaId: string }) {
  const [customOut, setCustomOut] = useState<Record<string, boolean>>({});

  const rows = [false, true].flatMap((a) =>
    [false, true].map((bv) => {
      const key = `${b(a)}${b(bv)}`;
      const expected = expectedOp(formulaId, a, bv);
      const out = customOut[key] ?? expected;
      return { a, bv, key, out, expected, ok: out === expected };
    }),
  );

  const allOk = rows.every((r) => r.ok);

  return (
    <>
      <p className="mb-1 text-xs text-[var(--fg-muted)]">{allOk ? '✓ Coincide' : '! Hay diferencias'}</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[var(--fg-muted)]">
            <th className="px-2 py-1">A</th>
            <th className="px-2 py-1">B</th>
            <th className="px-2 py-1">Out</th>
            <th className="px-2 py-1">{opLabel(formulaId)}</th>
            <th className="px-2 py-1">✓</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.key}
              className={`border-t border-[var(--border)] ${row.ok ? '' : 'bg-[color-mix(in_oklab,orange_18%,transparent)]'}`}
            >
              <td className="px-2 py-1 font-mono">{b(row.a)}</td>
              <td className="px-2 py-1 font-mono">{b(row.bv)}</td>
              <td className="px-2 py-1 font-mono">{b(row.out)}</td>
              <td className="px-2 py-1 font-mono opacity-70">{b(row.expected)}</td>
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
    </>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function TruthTableViz({ formulaId }: Props) {
  const v = useVizLabels();
  const [editA, setEditA] = useState(true);
  const [editB, setEditB] = useState(false);

  const live = expectedOp(formulaId, editA, editB);

  // BOO-001: identity laws (single variable)
  if (formulaId.includes('BOO-001')) {
    return (
      <VizPanel caption={joinCaption('Leyes de identidad: A+0=A, A·1=A, A+1=1, A·0=0')}>
        <div className="overflow-x-auto">
          <IdentityTable />
        </div>
        <ControlsStack>
          <ToggleRow label="A" checked={editA} onChange={setEditA} />
          <p className="font-mono text-sm">A={b(editA)} → A+0={b(editA)}, A·1={b(editA)}, A+1=1, A·0=0</p>
        </ControlsStack>
      </VizPanel>
    );
  }

  // BOO-002: idempotent / complement laws (single variable)
  if (formulaId.includes('BOO-002')) {
    return (
      <VizPanel caption={joinCaption('Idempotencia: A+A=A, A·A=A · Complemento: A+¬A=1, A·¬A=0')}>
        <div className="overflow-x-auto">
          <IdempotentTable />
        </div>
        <ControlsStack>
          <ToggleRow label="A" checked={editA} onChange={setEditA} />
          <p className="font-mono text-sm">
            A={b(editA)}: A+A={b(editA)}, A·A={b(editA)}, A+¬A=1, A·¬A=0
          </p>
        </ControlsStack>
      </VizPanel>
    );
  }

  // BOO-003: distributive law (3 variables, 8 rows)
  if (formulaId.includes('BOO-003')) {
    return (
      <VizPanel caption={joinCaption('Distributiva: A(B+C) = AB+AC')}>
        <div className="overflow-x-auto">
          <DistributiveTable />
        </div>
      </VizPanel>
    );
  }

  // BOO-006: absorption law (A+AB = A)
  if (formulaId.includes('BOO-006')) {
    return (
      <VizPanel caption={joinCaption('Absorción: A+AB = A')}>
        <div className="overflow-x-auto">
          <AbsorptionTable />
        </div>
      </VizPanel>
    );
  }

  // BOO-007, BOO-008, BOO-009, BOO-005 and default: editable 2-variable table
  const caption =
    formulaId.includes('BOO-005')
      ? joinCaption('XOR: A⊕B = 1 ↔ A≠B')
      : formulaId.includes('BOO-007')
        ? joinCaption('Implicación: A→B = ¬A∨B')
        : formulaId.includes('BOO-008')
          ? joinCaption('Equivalencia: A↔B')
          : formulaId.includes('BOO-009')
            ? joinCaption('XNOR: ¬(A⊕B)')
            : joinCaption(v.tableMatch);

  return (
    <VizPanel caption={caption}>
      <div className="overflow-x-auto">
        <EditableTable formulaId={formulaId} />
      </div>
      <ControlsStack>
        <ToggleRow label="A" checked={editA} onChange={setEditA} />
        <ToggleRow label="B" checked={editB} onChange={setEditB} />
        <p className="font-mono text-sm">
          A={b(editA)}, B={b(editB)} → {opLabel(formulaId)}={b(live)}
        </p>
      </ControlsStack>
    </VizPanel>
  );
}
