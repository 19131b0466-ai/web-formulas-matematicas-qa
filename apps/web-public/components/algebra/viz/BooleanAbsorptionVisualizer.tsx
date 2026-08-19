'use client';

import { useMemo, useState } from 'react';
import { BOOL, type Assignment, type Bit } from './booleanMath';
import {
  Badge,
  BitControls,
  CollapsibleEdit,
  CoverageGrid2,
  CompareVectorRow,
  EquivalenceBadge,
  ExprLabel,
  ResultBox,
  SectionCard,
  StepperBar,
} from './booleanVizShared';
import { ButtonRow, ControlsStack, VizButton, VizPanel, joinCaption } from './controls';
import { GuideBlock, Segmented } from './transformHelpers';

type Tab = 'or' | 'and' | 'sets';

const VARS = ['A', 'B'] as const;
const CASE_KEYS = ['00', '01', '10', '11'] as const;

const OR_STEPS = [
  'Observa A y AB',
  'Calcula A+AB',
  'Compara con A',
  'Identifica redundancia',
  'Conclusión: A+AB = A',
];

const AND_STEPS = [
  'Observa A y A+B',
  'Calcula A(A+B)',
  'Compara con A',
  'Identifica redundancia',
  'Conclusión: A(A+B) = A',
];

function keyToAssignment(key: string): Assignment {
  return { A: Number(key[0]) as Bit, B: Number(key[1]) as Bit };
}

function assignmentToKey(a: Assignment): string {
  return `${a.A ?? 0}${a.B ?? 0}`;
}

function evalOrAbsorption(a: Bit, b: Bit) {
  const ab = BOOL.and(a, b);
  const lhs = BOOL.or(a, ab);
  return { ab, lhs, rhs: a, redundant: ab === 1 && lhs === a };
}

function evalAndAbsorption(a: Bit, b: Bit) {
  const aOrB = BOOL.or(a, b);
  const lhs = BOOL.and(a, aOrB);
  return { aOrB, lhs, rhs: a, redundant: aOrB === 1 && a === 1 };
}

/**
 * Ley de absorción: A+AB = A y A(A+B) = A (ALG-BOO-006).
 */
export function BooleanAbsorptionVisualizer() {
  const [tab, setTab] = useState<Tab>('or');
  const [assignment, setAssignment] = useState<Assignment>({ A: 1, B: 1 });
  const [orStep, setOrStep] = useState(0);
  const [andStep, setAndStep] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);

  const A = assignment.A ?? 0;
  const B = assignment.B ?? 0;
  const key = assignmentToKey(assignment);

  const orEval = evalOrAbsorption(A, B);
  const andEval = evalAndAbsorption(A, B);

  const aCover = useMemo(() => CASE_KEYS.filter((k) => k[0] === '1'), []);
  const abCover = useMemo(() => CASE_KEYS.filter((k) => k === '11'), []);
  const aOrBCover = useMemo(() => CASE_KEYS.filter((k) => k[0] === '1' || k[1] === '1'), []);

  const truthOr = useMemo(() => {
    return CASE_KEYS.map((k) => {
      const row = keyToAssignment(k);
      const a = row.A ?? 0;
      const b = row.B ?? 0;
      const { lhs, rhs } = evalOrAbsorption(a, b);
      return { key: k, ab: BOOL.and(a, b), lhs, rhs, eq: lhs === rhs };
    });
  }, []);

  const truthAnd = useMemo(() => {
    return CASE_KEYS.map((k) => {
      const row = keyToAssignment(k);
      const a = row.A ?? 0;
      const b = row.B ?? 0;
      const { lhs, rhs, aOrB } = evalAndAbsorption(a, b);
      return { key: k, aOrB, lhs, rhs, eq: lhs === rhs };
    });
  }, []);

  const fOr = truthOr.map((r) => r.lhs);
  const gOr = truthOr.map((r) => r.rhs);
  const fAnd = truthAnd.map((r) => r.lhs);
  const gAnd = truthAnd.map((r) => r.rhs);

  const gridLabelsOr = useMemo(() => {
    const labels: Record<string, string> = {};
    for (const k of CASE_KEYS) {
      const row = keyToAssignment(k);
      labels[k] = `A+AB=${evalOrAbsorption(row.A ?? 0, row.B ?? 0).lhs}`;
    }
    return labels;
  }, []);

  const caption = joinCaption(
    `A=${A}, B=${B}`,
    tab === 'or'
      ? `A+AB=${orEval.lhs} = A`
      : tab === 'and'
        ? `A(A+B)=${andEval.lhs} = A`
        : 'AB ⊆ A',
    orEval.redundant || andEval.redundant ? 'término redundante' : undefined,
  );

  const activeStep = tab === 'or' ? orStep : tab === 'and' ? andStep : 0;
  const steps = tab === 'and' ? AND_STEPS : OR_STEPS;
  const atLastStep = activeStep >= steps.length - 1;

  const advanceStep = () => {
    if (tab === 'or') setOrStep((s) => Math.min(s + 1, OR_STEPS.length - 1));
    else setAndStep((s) => Math.min(s + 1, AND_STEPS.length - 1));
  };

  const resetStep = () => {
    if (tab === 'or') setOrStep(0);
    else setAndStep(0);
  };

  return (
    <VizPanel title="Absorción booleana" caption={caption}>
      <GuideBlock
        idea="La absorción elimina términos redundantes: A ya cubre todo lo que aporta AB."
        tryIt="Alterna A y B y sigue el flujo de evaluación; la columna redundante desaparece al simplificar."
      />

      <Segmented
        options={[
          { id: 'or', label: 'A + AB' },
          { id: 'and', label: 'A(A + B)' },
          { id: 'sets', label: 'Ver conjuntos' },
        ]}
        value={tab}
        onChange={(id) => setTab(id as Tab)}
      />

      <div className="mt-3">
        <BitControls
          variables={[...VARS]}
          assignment={assignment}
          onChange={(v, bit) => setAssignment({ ...assignment, [v]: bit })}
        />
      </div>

      {tab === 'or' ? (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-start justify-center gap-4">
            <CoverageGrid2
              active={key}
              highlight={aCover}
              labels={gridLabelsOr}
              onSelect={(k) => setAssignment(keyToAssignment(k))}
            />
            <div className="min-w-[12rem] space-y-2">
              <SectionCard title="Evaluación en vivo">
                <div className="space-y-1 font-mono text-sm">
                  <p>A = {A}</p>
                  <p>AB = {orEval.ab}</p>
                  <p className={orStep >= 1 ? 'text-[var(--accent-strong)]' : 'text-[var(--fg-muted)]'}>
                    A+AB = {orEval.lhs}
                  </p>
                  <p className={orStep >= 2 ? 'font-semibold' : ''}>A = {orEval.rhs}</p>
                </div>
                {orEval.redundant ? (
                  <div className="mt-2">
                    <Badge tone="warn">AB redundante cuando A=1</Badge>
                  </div>
                ) : null}
              </SectionCard>
              <EquivalenceBadge equivalent={orEval.lhs === orEval.rhs} />
            </div>
          </div>
          {orStep >= 3 ? (
            <ExprLabel>
              Si A=1, entonces A+AB = 1+AB = 1 = A — el término AB no añade información.
            </ExprLabel>
          ) : null}
        </div>
      ) : null}

      {tab === 'and' ? (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-start justify-center gap-4">
            <CoverageGrid2
              active={key}
              highlight={aOrBCover}
              labels={gridLabelsOr}
              onSelect={(k) => setAssignment(keyToAssignment(k))}
            />
            <div className="min-w-[12rem] space-y-2">
              <SectionCard title="Forma dual">
                <div className="space-y-1 font-mono text-sm">
                  <p>A = {A}</p>
                  <p>A+B = {andEval.aOrB}</p>
                  <p className={andStep >= 1 ? 'text-[var(--accent-strong)]' : 'text-[var(--fg-muted)]'}>
                    A(A+B) = {andEval.lhs}
                  </p>
                  <p className={andStep >= 2 ? 'font-semibold' : ''}>A = {andEval.rhs}</p>
                </div>
                <p className="mt-2 text-xs text-[var(--fg-muted)]">A ⊆ A+B siempre; la intersección recupera A.</p>
              </SectionCard>
              <EquivalenceBadge equivalent={andEval.lhs === andEval.rhs} />
            </div>
          </div>
          {andStep >= 3 ? (
            <ExprLabel>
              Si A=0, A(A+B)=0. Si A=1, A(A+B)=1·(A+B)=1=A — el factor (A+B) es redundante.
            </ExprLabel>
          ) : null}
        </div>
      ) : null}

      {tab === 'sets' ? (
        <div className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <SectionCard title="Cobertura de A">
              <CoverageGrid2 active={key} highlight={aCover} onSelect={(k) => setAssignment(keyToAssignment(k))} />
              <p className="mt-2 text-xs text-[var(--fg-muted)]">A cubre mintérminos 10 y 11.</p>
            </SectionCard>
            <SectionCard title="Cobertura de AB">
              <CoverageGrid2 active={key} highlight={abCover} onSelect={(k) => setAssignment(keyToAssignment(k))} />
              <p className="mt-2 text-xs text-[var(--fg-muted)]">AB solo cubre 11 — subconjunto de A.</p>
            </SectionCard>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="ok">AB ⊆ A</Badge>
            <Badge tone="ok">A ⊆ A+B</Badge>
            <Badge tone="neutral">A+AB simplifica a A</Badge>
          </div>
          <ResultBox
            title="Caso actual"
            value={key}
            subtitle={`AB=${BOOL.and(A, B)} dentro de A=${A}`}
            tone={key === '11' ? 'ok' : 'neutral'}
          />
        </div>
      ) : null}

      {tab !== 'sets' ? (
        <div className="mt-3 space-y-2">
          <StepperBar
            steps={steps}
            active={activeStep}
            onStep={(i) => (tab === 'or' ? setOrStep(i) : setAndStep(i))}
          />
          <ControlsStack>
            <ButtonRow>
              <VizButton onClick={advanceStep} disabled={atLastStep}>
                Siguiente paso
              </VizButton>
              {activeStep > 0 ? <VizButton onClick={resetStep}>Reiniciar</VizButton> : null}
            </ButtonRow>
          </ControlsStack>
        </div>
      ) : null}

      <CollapsibleEdit label="Tabla y prueba algebraica" open={detailOpen} onToggle={() => setDetailOpen((o) => !o)}>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-[var(--fg-muted)]">A + AB = A</p>
            <CompareVectorRow f={fOr} g={gOr} />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-[var(--fg-muted)]">A(A + B) = A</p>
            <CompareVectorRow f={fAnd} g={gAnd} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--fg-muted)]">
                  <th className="px-2 py-1">A</th>
                  <th className="px-2 py-1">B</th>
                  <th className="px-2 py-1">AB</th>
                  <th className="px-2 py-1">A+AB</th>
                  <th className="px-2 py-1">A(A+B)</th>
                </tr>
              </thead>
              <tbody>
                {truthOr.map((r, i) => {
                  const row = keyToAssignment(r.key);
                  return (
                    <tr
                      key={r.key}
                      className={`border-t border-[var(--border)] ${r.key === key ? 'bg-[var(--accent-soft)]/50' : ''}`}
                    >
                      <td className="px-2 py-1 font-mono">{row.A}</td>
                      <td className="px-2 py-1 font-mono">{row.B}</td>
                      <td className="px-2 py-1 font-mono">{r.ab}</td>
                      <td className="px-2 py-1 font-mono">{r.lhs}</td>
                      <td className="px-2 py-1 font-mono">{truthAnd[i]?.lhs}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <SectionCard title="Prueba algebraica (OR)">
            <ExprLabel>A + AB = A·1 + AB = A(1+B) = A·1 = A</ExprLabel>
            <p className="mt-1 text-xs text-[var(--fg-muted)]">Usando 1+B=1 (absorción sobre 1).</p>
          </SectionCard>
        </div>
      </CollapsibleEdit>

      <p className="mt-3 border-t border-[var(--border)] pt-2 text-center font-mono text-sm text-[var(--fg)]">
        A+AB = {orEval.lhs} = A · A(A+B) = {andEval.lhs} = A
      </p>
    </VizPanel>
  );
}
