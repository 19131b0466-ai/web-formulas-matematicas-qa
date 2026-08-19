'use client';

import { useMemo, useState } from 'react';
import {
  BOOL,
  buildCanonicalSOP,
  type Assignment,
  type Bit,
} from './booleanMath';
import {
  Badge,
  BitControls,
  CollapsibleEdit,
  CoverageGrid2,
  ExprLabel,
  ResultBox,
  SectionCard,
  StepperBar,
  TruthVectorRow,
} from './booleanVizShared';
import { ButtonRow, ControlsStack, VizButton, VizPanel, joinCaption } from './controls';
import { GuideBlock } from './transformHelpers';

type Tab = 'diff' | 'cases' | 'decompose';

const VARS = ['A', 'B'] as const;
const CASE_KEYS = ['00', '01', '10', '11'] as const;
const CASE_STEPS = ['00 — iguales', '01 — distintos', '10 — distintos', '11 — iguales'];

function keyToAssignment(key: string): Assignment {
  return { A: Number(key[0]) as Bit, B: Number(key[1]) as Bit };
}

function assignmentToKey(a: Assignment): string {
  return `${a.A ?? 0}${a.B ?? 0}`;
}

function activeInputCount(a: Assignment): number {
  return (a.A ?? 0) + (a.B ?? 0);
}

/**
 * XOR interactivo: diferencia, cuatro casos y descomposición (ALG-BOO-005).
 */
export function XorVisualizer() {
  const [tab, setTab] = useState<Tab>('diff');
  const [assignment, setAssignment] = useState<Assignment>({ A: 0, B: 1 });
  const [caseStep, setCaseStep] = useState(1);
  const [hoverTerm, setHoverTerm] = useState<'notAB' | 'AnotB' | null>(null);
  const [extraOpen, setExtraOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);

  const A = assignment.A ?? 0;
  const B = assignment.B ?? 0;
  const key = assignmentToKey(assignment);
  const equal = A === B;
  const xor = BOOL.xor(A, B);
  const exactlyOne = activeInputCount(assignment) === 1;

  const truthRows = useMemo(() => {
    return CASE_KEYS.map((k) => {
      const row = keyToAssignment(k);
      return { key: k, xor: BOOL.xor(row.A ?? 0, row.B ?? 0), or: BOOL.or(row.A ?? 0, row.B ?? 0) };
    });
  }, []);

  const xorVector = truthRows.map((r) => r.xor);
  const sop = buildCanonicalSOP(xorVector, [...VARS]);

  const gridLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    for (const k of CASE_KEYS) {
      const row = keyToAssignment(k);
      labels[k] = `⊕=${BOOL.xor(row.A ?? 0, row.B ?? 0)}`;
    }
    return labels;
  }, []);

  const highlightKeys =
    hoverTerm === 'notAB' ? ['01'] : hoverTerm === 'AnotB' ? ['10'] : xor === 1 ? [key] : [];

  const syncCaseStep = (k: string) => {
    const idx = CASE_KEYS.indexOf(k as (typeof CASE_KEYS)[number]);
    if (idx >= 0) setCaseStep(idx);
  };

  const applyAssignment = (next: Assignment) => {
    setAssignment(next);
    syncCaseStep(assignmentToKey(next));
  };

  const caption = joinCaption(
    `A=${A}, B=${B}`,
    equal ? 'IGUALES → ⊕=0' : 'DISTINTOS → ⊕=1',
    exactlyOne ? 'exactamente una entrada' : undefined,
  );

  return (
    <VizPanel title="XOR (A⊕B)" caption={caption}>
      <GuideBlock
        idea="XOR es verdadero cuando A y B son distintos: exactamente una entrada activa."
        tryIt="Alterna A y B o haz clic en la cuadrícula; observa cuándo ⊕ vale 1 frente a OR."
      />

      <div className="mb-3 inline-flex flex-wrap rounded-lg border border-[var(--border)] p-0.5">
        {(
          [
            { id: 'diff', label: 'Diferencia' },
            { id: 'cases', label: 'Cuatro casos' },
            { id: 'decompose', label: 'Descomponer' },
          ] as const
        ).map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setTab(o.id)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              tab === o.id
                ? 'bg-[var(--accent-soft)] text-[var(--fg)]'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <BitControls
        variables={[...VARS]}
        assignment={assignment}
        onChange={(v, bit) => applyAssignment({ ...assignment, [v]: bit })}
      />

      {tab === 'diff' ? (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <ResultBox
              title="Comparador"
              value={equal ? 'A = B' : 'A ≠ B'}
              subtitle={equal ? 'Entradas iguales' : 'Entradas distintas'}
              tone={equal ? 'neutral' : 'ok'}
            />
            <ResultBox
              title="Salida A⊕B"
              value={xor}
              subtitle={xor ? 'DISTINTOS' : 'IGUALES'}
              tone={xor ? 'ok' : 'neutral'}
            />
          </div>
          <ExprLabel>
            A⊕B = {xor} ↔ {equal ? 'A y B coinciden' : 'A y B difieren'}
          </ExprLabel>
          <SectionCard title="Entradas activas">
            <p className="text-sm text-[var(--fg)]">
              Exactamente una entrada en 1:{' '}
              <Badge tone={exactlyOne ? 'ok' : 'neutral'}>{exactlyOne ? 'Sí (1)' : 'No (0)'}</Badge>
            </p>
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              A+B (como suma) = {activeInputCount(assignment)} · XOR = 1 solo cuando la suma es 1.
            </p>
          </SectionCard>
        </div>
      ) : null}

      {tab === 'cases' ? (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-start justify-center gap-4">
            <CoverageGrid2
              active={key}
              highlight={xor === 1 ? ['01', '10'] : ['00', '11']}
              labels={gridLabels}
              onSelect={(k) => applyAssignment(keyToAssignment(k))}
            />
            <div className="space-y-2">
              <ResultBox title="Caso" value={key} subtitle={CASE_STEPS[caseStep]} />
              <ResultBox
                title="A⊕B"
                value={xor}
                subtitle={xor ? 'DISTINTOS' : 'IGUALES'}
                tone={xor ? 'ok' : 'neutral'}
              />
            </div>
          </div>
          <StepperBar
            steps={CASE_STEPS}
            active={caseStep}
            onStep={(i) => {
              setCaseStep(i);
              applyAssignment(keyToAssignment(CASE_KEYS[i]!));
            }}
          />
          <ControlsStack>
            <ButtonRow>
              <VizButton
                onClick={() => {
                  const next = (caseStep + 1) % CASE_KEYS.length;
                  setCaseStep(next);
                  applyAssignment(keyToAssignment(CASE_KEYS[next]!));
                }}
              >
                Siguiente caso
              </VizButton>
            </ButtonRow>
          </ControlsStack>
        </div>
      ) : null}

      {tab === 'decompose' ? (
        <div className="mt-3 space-y-3">
          <SectionCard title="Forma canónica">
            <ExprLabel>
              A⊕B = <span className="text-[var(--accent-strong)]">¬AB</span> +{' '}
              <span className="text-[var(--accent-strong)]">A¬B</span>
            </ExprLabel>
            <p className="mt-2 text-center text-xs text-[var(--fg-muted)]">
              Pasa el cursor sobre cada término para ver su mintérmino en la cuadrícula.
            </p>
          </SectionCard>
          <div className="flex flex-wrap items-start justify-center gap-4">
            <CoverageGrid2
              active={key}
              highlight={highlightKeys}
              labels={gridLabels}
              onSelect={(k) => applyAssignment(keyToAssignment(k))}
            />
            <div className="space-y-2 font-mono text-sm">
              <button
                type="button"
                className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                  hoverTerm === 'notAB' || key === '01'
                    ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)]'
                    : 'border-[var(--border)]'
                }`}
                onMouseEnter={() => setHoverTerm('notAB')}
                onMouseLeave={() => setHoverTerm(null)}
              >
                ¬AB → {BOOL.and(BOOL.not(A), B)} <span className="text-[var(--fg-muted)]">(celda 01)</span>
              </button>
              <button
                type="button"
                className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                  hoverTerm === 'AnotB' || key === '10'
                    ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)]'
                    : 'border-[var(--border)]'
                }`}
                onMouseEnter={() => setHoverTerm('AnotB')}
                onMouseLeave={() => setHoverTerm(null)}
              >
                A¬B → {BOOL.and(A, BOOL.not(B))}{' '}
                <span className="text-[var(--fg-muted)]">(celda 10)</span>
              </button>
              <p className="rounded-lg border border-[var(--border)] px-3 py-2">
                Suma (OR): {BOOL.or(BOOL.and(BOOL.not(A), B), BOOL.and(A, BOOL.not(B)))} = A⊕B = {xor}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-3 space-y-2">
        <CollapsibleEdit label="XOR vs OR · XNOR · Σm" open={extraOpen} onToggle={() => setExtraOpen((o) => !o)}>
          <div className="space-y-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--fg-muted)]">
                  <th className="px-2 py-1">AB</th>
                  <th className="px-2 py-1">A⊕B</th>
                  <th className="px-2 py-1">A∨B</th>
                  <th className="px-2 py-1">¿Igual?</th>
                </tr>
              </thead>
              <tbody>
                {truthRows.map((r) => (
                  <tr key={r.key} className="border-t border-[var(--border)]">
                    <td className="px-2 py-1 font-mono">{r.key}</td>
                    <td className="px-2 py-1 font-mono">{r.xor}</td>
                    <td className="px-2 py-1 font-mono">{r.or}</td>
                    <td className="px-2 py-1">{r.xor === r.or ? '✓' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-sm text-[var(--fg-muted)]">
              XNOR (equivalencia): ¬(A⊕B) = 1 cuando A y B son iguales (filas 00 y 11).
            </p>
            <Badge tone="neutral">{sop.notation} → {sop.expression}</Badge>
          </div>
        </CollapsibleEdit>

        <CollapsibleEdit label="Tabla de verdad" open={tableOpen} onToggle={() => setTableOpen((o) => !o)}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--fg-muted)]">
                  <th className="px-2 py-1">A</th>
                  <th className="px-2 py-1">B</th>
                  <th className="px-2 py-1">A⊕B</th>
                  <th className="px-2 py-1">A∨B</th>
                </tr>
              </thead>
              <tbody>
                {truthRows.map((r) => {
                  const row = keyToAssignment(r.key);
                  const hi = r.key === key;
                  return (
                    <tr
                      key={r.key}
                      className={`border-t border-[var(--border)] ${hi ? 'bg-[var(--accent-soft)]/50' : ''}`}
                    >
                      <td className="px-2 py-1 font-mono">{row.A}</td>
                      <td className="px-2 py-1 font-mono">{row.B}</td>
                      <td className="px-2 py-1 font-mono">{r.xor}</td>
                      <td className="px-2 py-1 font-mono">{r.or}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-2">
            <TruthVectorRow label="⊕" values={xorVector} highlight={xorVector.map((v, i) => (v === 1 ? i : -1)).filter((i) => i >= 0)} />
          </div>
        </CollapsibleEdit>
      </div>

      <p className="mt-3 border-t border-[var(--border)] pt-2 text-center font-mono text-sm text-[var(--fg)]">
        A={A}, B={B} → A⊕B = <span className="font-semibold text-[var(--accent-strong)]">{xor}</span>
        {xor ? ' (DISTINTOS)' : ' (IGUALES)'}
      </p>
    </VizPanel>
  );
}
