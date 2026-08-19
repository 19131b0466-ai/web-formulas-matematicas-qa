'use client';

import { useMemo, useState } from 'react';
import {
  BOOL,
  booleanEquivalent,
  buildTruthVector,
  generateAssignments,
  parseBooleanExpression,
  type Assignment,
  type Bit,
} from './booleanMath';
import {
  Badge,
  BitControls,
  CollapsibleEdit,
  CompareVectorRow,
  EquivalenceBadge,
  ExprLabel,
  ResultBox,
  SectionCard,
  StepperBar,
} from './booleanVizShared';
import { ButtonRow, ControlsStack, VizButton, VizPanel, joinCaption } from './controls';
import { GuideBlock, Segmented } from './transformHelpers';

type Tab = 'and' | 'or' | 'compare';

const VARS = ['A', 'B'] as const;

const AND_LAW = { orig: '¬(A∧B)', trans: '¬A∨¬B', phrase: ['no ambos', 'al menos uno no'] };
const OR_LAW = { orig: '¬(A∨B)', trans: '¬A∧¬B', phrase: ['ninguno', 'ambos no'] };

const AND_STEPS = [
  'Entradas A, B',
  'Calcula A∧B',
  'Niega: ¬(A∧B)',
  'Calcula ¬A, ¬B',
  'Combina: ¬A∨¬B',
];

const OR_STEPS = [
  'Entradas A, B',
  'Calcula A∨B',
  'Niega: ¬(A∨B)',
  'Calcula ¬A, ¬B',
  'Combina: ¬A∧¬B',
];

function evalPair(orig: string, trans: string, assignment: Assignment) {
  const pO = parseBooleanExpression(orig);
  const pT = parseBooleanExpression(trans);
  if (!pO.ok || !pT.ok) return { left: 0 as Bit, right: 0 as Bit, ok: false };
  const left = buildTruthVector(pO.ast, [assignment])[0] ?? 0;
  const right = buildTruthVector(pT.ast, [assignment])[0] ?? 0;
  return { left, right, ok: left === right };
}

function DeMorganCircuit({ andTab }: { andTab: boolean }) {
  return (
    <svg viewBox="0 0 320 100" className="mx-auto h-auto w-full max-w-sm" role="img" aria-hidden>
      <text x={8} y={16} className="fill-[var(--fg-muted)]" fontSize={11}>
        {andTab ? '¬(A∧B)' : '¬(A∨B)'}
      </text>
      <rect x={12} y={28} width={36} height={20} rx={4} fill="var(--accent-soft)" stroke="var(--accent-strong)" />
      <text x={30} y={42} textAnchor="middle" fontSize={11} fill="currentColor">
        A
      </text>
      <rect x={12} y={58} width={36} height={20} rx={4} fill="var(--accent-soft)" stroke="var(--accent-strong)" />
      <text x={30} y={72} textAnchor="middle" fontSize={11} fill="currentColor">
        B
      </text>
      <rect x={72} y={40} width={44} height={28} rx={6} fill="var(--bg)" stroke="var(--border)" />
      <text x={94} y={58} textAnchor="middle" fontSize={12} fill="currentColor">
        {andTab ? '∧' : '∨'}
      </text>
      <rect x={140} y={44} width={36} height={20} rx={4} fill="var(--bg)" stroke="var(--border)" />
      <text x={158} y={58} textAnchor="middle" fontSize={11} fill="currentColor">
        NOT
      </text>
      <line x1={48} y1={38} x2={72} y2={48} stroke="var(--border)" />
      <line x1={48} y1={68} x2={72} y2={60} stroke="var(--border)" />
      <line x1={116} y1={54} x2={140} y2={54} stroke="var(--border)" />
      <text x={200} y={58} fontSize={11} fill="currentColor">
        ≡ {andTab ? '¬A∨¬B' : '¬A∧¬B'}
      </text>
    </svg>
  );
}

/**
 * Leyes de De Morgan con transformación visual (ALG-BOO-004).
 */
export function DeMorganVisualizer() {
  const [tab, setTab] = useState<Tab>('and');
  const [assignment, setAssignment] = useState<Assignment>({ A: 1, B: 0 });
  const [andStep, setAndStep] = useState(0);
  const [orStep, setOrStep] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);

  const A = assignment.A ?? 0;
  const B = assignment.B ?? 0;
  const notA = BOOL.not(A);
  const notB = BOOL.not(B);
  const ab = BOOL.and(A, B);
  const aOrB = BOOL.or(A, B);

  const law = tab === 'or' ? OR_LAW : AND_LAW;
  const step = tab === 'or' ? orStep : andStep;
  const steps = tab === 'or' ? OR_STEPS : AND_STEPS;

  const live = evalPair(law.orig, law.trans, assignment);

  const assignments = useMemo(() => generateAssignments([...VARS]), []);
  const vectors = useMemo(() => {
    const pO = parseBooleanExpression(AND_LAW.orig);
    const pT = parseBooleanExpression(AND_LAW.trans);
    const pO2 = parseBooleanExpression(OR_LAW.orig);
    const pT2 = parseBooleanExpression(OR_LAW.trans);
    const pErr = parseBooleanExpression('¬A∧¬B');
    const wrong = parseBooleanExpression('¬(A∧B)');
    if (!pO.ok || !pT.ok || !pO2.ok || !pT2.ok || !pErr.ok || !wrong.ok) {
      return null;
    }
    return {
      andOrig: buildTruthVector(pO.ast, assignments),
      andTrans: buildTruthVector(pT.ast, assignments),
      orOrig: buildTruthVector(pO2.ast, assignments),
      orTrans: buildTruthVector(pT2.ast, assignments),
      wrongNot: buildTruthVector(pErr.ast, assignments),
      correctNot: buildTruthVector(wrong.ast, assignments),
      eqAnd: booleanEquivalent(pO.ast, pT.ast, [...VARS]),
      eqOr: booleanEquivalent(pO2.ast, pT2.ast, [...VARS]),
    };
  }, [assignments]);

  const counterExample = useMemo(() => {
    if (!vectors) return null;
    for (let i = 0; i < assignments.length; i++) {
      if (vectors.correctNot[i] !== vectors.wrongNot[i]) {
        return { idx: i, row: assignments[i]! };
      }
    }
    return null;
  }, [vectors, assignments]);

  const showTransform = step >= 3;
  const showResult = step >= 4;

  const caption = joinCaption(
    `A=${A}, B=${B}`,
    `${law.orig} = ${live.left}`,
    `${law.trans} = ${live.right}`,
    live.ok ? 'equivalentes' : 'distintos',
  );

  const andLive = evalPair(AND_LAW.orig, AND_LAW.trans, assignment);
  const orLive = evalPair(OR_LAW.orig, OR_LAW.trans, assignment);

  return (
    <VizPanel title="Leyes de De Morgan" caption={caption}>
      <GuideBlock
        idea="De Morgan: negar un AND es como un OR de negaciones (y al revés)."
        tryIt="Cambia A y B: las dos expresiones de cada ley siempre dan el mismo resultado."
      />

      <Segmented
        options={[
          { id: 'and', label: '¬(A ∧ B)' },
          { id: 'or', label: '¬(A ∨ B)' },
          { id: 'compare', label: 'Comparar' },
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

      {tab !== 'compare' ? (
        <div className="mt-3 space-y-3">
          <SectionCard title="Idea en palabras">
            <p className="text-sm text-[var(--fg)]">
              «{law.phrase[0]}» se reescribe como «{law.phrase[1]}».
            </p>
          </SectionCard>

          <div className="grid gap-3 sm:grid-cols-2">
            <ResultBox
              title="Expresión original"
              value={
                <span className="text-lg">
                  {tab === 'and'
                    ? `¬(${step >= 1 ? `${A}∧${B}=${ab}` : 'A∧B'})`
                    : `¬(${step >= 1 ? `${A}∨${B}=${aOrB}` : 'A∨B'})`}
                </span>
              }
              subtitle={showResult ? `= ${live.left}` : law.orig}
              tone={showResult && live.ok ? 'ok' : 'neutral'}
            />
            <ResultBox
              title="Transformada"
              value={
                showTransform ? (
                  <span className="text-lg">
                    {notA}
                    {tab === 'and' ? '∨' : '∧'}
                    {notB}
                  </span>
                ) : (
                  law.trans
                )
              }
              subtitle={showResult ? `= ${live.right}` : 'Tras cruzar ¬'}
              tone={showResult && live.ok ? 'ok' : 'neutral'}
            />
          </div>

          {step >= 2 ? (
            <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-sm">
              <Badge tone="neutral">A → ¬A = {notA}</Badge>
              <Badge tone="neutral">B → ¬B = {notB}</Badge>
              <Badge tone="warn">{tab === 'and' ? '∧ → ∨' : '∨ → ∧'}</Badge>
            </div>
          ) : null}

          <ExprLabel>
            {law.orig} = {live.left} · {law.trans} = {live.right}{' '}
            {live.ok ? '✓' : '✕'}
          </ExprLabel>

          <StepperBar
            steps={steps}
            active={step}
            onStep={(i) => (tab === 'or' ? setOrStep(i) : setAndStep(i))}
          />
          <ControlsStack>
            <ButtonRow>
              <VizButton
                onClick={() =>
                  tab === 'or'
                    ? setOrStep((s) => (s + 1) % OR_STEPS.length)
                    : setAndStep((s) => (s + 1) % AND_STEPS.length)
                }
              >
                Siguiente paso
              </VizButton>
            </ButtonRow>
          </ControlsStack>
        </div>
      ) : null}

      {tab === 'compare' ? (
        <div className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <SectionCard title="Ley 1">
              <ExprLabel>
                {AND_LAW.orig} = {AND_LAW.trans}
              </ExprLabel>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">{AND_LAW.phrase.join(' → ')}</p>
              {vectors ? <EquivalenceBadge equivalent={vectors.eqAnd} /> : null}
            </SectionCard>
            <SectionCard title="Ley 2">
              <ExprLabel>
                {OR_LAW.orig} = {OR_LAW.trans}
              </ExprLabel>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">{OR_LAW.phrase.join(' → ')}</p>
              {vectors ? <EquivalenceBadge equivalent={vectors.eqOr} /> : null}
            </SectionCard>
          </div>
          <SectionCard title="Intercambio de operadores">
            <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-sm">
              <span className="rounded border border-[var(--border)] px-3 py-2">¬(A ∧ B)</span>
              <span className="text-[var(--fg-muted)]">↔</span>
              <span className="rounded border border-[var(--accent-strong)] bg-[var(--accent-soft)] px-3 py-2">
                ¬A ∨ ¬B
              </span>
              <span className="text-[var(--fg-muted)]">·</span>
              <span className="rounded border border-[var(--border)] px-3 py-2">¬(A ∨ B)</span>
              <span className="text-[var(--fg-muted)]">↔</span>
              <span className="rounded border border-[var(--accent-strong)] bg-[var(--accent-soft)] px-3 py-2">
                ¬A ∧ ¬B
              </span>
            </div>
            <p className="mt-2 text-center text-xs text-[var(--fg-muted)]">
              La negación «baja» y el operador central se invierte (∧ ↔ ∨).
            </p>
          </SectionCard>
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultBox
              title="Ley 1 (vivo)"
              value={andLive.left}
              subtitle={`vs ${andLive.right}`}
              tone="ok"
            />
            <ResultBox
              title="Ley 2 (vivo)"
              value={orLive.left}
              subtitle={`vs ${orLive.right}`}
              tone="ok"
            />
          </div>
        </div>
      ) : null}

      <CollapsibleEdit label="Tabla · error común · circuito" open={detailOpen} onToggle={() => setDetailOpen((o) => !o)}>
        <div className="space-y-4">
          {vectors ? (
            <>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-[var(--fg-muted)]">¬(A∧B) vs ¬A∨¬B</p>
                <CompareVectorRow f={vectors.andOrig} g={vectors.andTrans} />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-[var(--fg-muted)]">¬(A∨B) vs ¬A∧¬B</p>
                <CompareVectorRow f={vectors.orOrig} g={vectors.orTrans} />
              </div>
            </>
          ) : null}

          <SectionCard title="Error frecuente">
            <ExprLabel>¬(A∧B) ≠ ¬A∧¬B</ExprLabel>
            {counterExample && vectors ? (
              <p className="mt-2 text-sm text-[var(--fg)]">
                Contraejemplo A={counterExample.row.A}, B={counterExample.row.B}: ¬(A∧B)=
                {vectors.correctNot[counterExample.idx]} pero ¬A∧¬B={vectors.wrongNot[counterExample.idx]}.
              </p>
            ) : null}
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              Hay que distribuir la negación: cambiar operador y negar cada variable.
            </p>
          </SectionCard>

          <SectionCard title="Vista de circuito">
            <DeMorganCircuit andTab={tab !== 'or'} />
          </SectionCard>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--fg-muted)]">
                  <th className="px-2 py-1">A</th>
                  <th className="px-2 py-1">B</th>
                  <th className="px-2 py-1">¬(A∧B)</th>
                  <th className="px-2 py-1">¬A∨¬B</th>
                  <th className="px-2 py-1">¬(A∨B)</th>
                  <th className="px-2 py-1">¬A∧¬B</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-t border-[var(--border)] ${
                      row.A === A && row.B === B ? 'bg-[var(--accent-soft)]/50' : ''
                    }`}
                  >
                    <td className="px-2 py-1 font-mono">{row.A}</td>
                    <td className="px-2 py-1 font-mono">{row.B}</td>
                    <td className="px-2 py-1 font-mono">{vectors?.andOrig[i]}</td>
                    <td className="px-2 py-1 font-mono">{vectors?.andTrans[i]}</td>
                    <td className="px-2 py-1 font-mono">{vectors?.orOrig[i]}</td>
                    <td className="px-2 py-1 font-mono">{vectors?.orTrans[i]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CollapsibleEdit>

      <p className="mt-3 border-t border-[var(--border)] pt-2 text-center font-mono text-sm text-[var(--fg)]">
        {law.orig} = {live.left} = {law.trans} = {live.right}
      </p>
    </VizPanel>
  );
}
