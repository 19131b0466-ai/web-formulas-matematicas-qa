'use client';

import { useMemo, useState } from 'react';
import {
  BOOL,
  type Assignment,
  type Bit,
  generateAssignments,
} from './booleanMath';
import {
  ButtonRow,
  ControlsStack,
  VizButton,
  VizPanel,
  joinCaption,
} from './controls';
import {
  BitControls,
  CompareVectorRow,
  EquivalenceBadge,
  ExprLabel,
  ResultBox,
  SectionCard,
  StepperBar,
  OperatorNote,
} from './booleanVizShared';
import { Badge, CollapsibleEdit, GuideBlock, Segmented } from './transformHelpers';

type Tab = 'andOverOr' | 'orOverAnd' | 'compare';
type Law = 'andOverOr' | 'orOverAnd';

const TAB_OPTS = [
  { id: 'andOverOr', label: 'AND sobre OR' },
  { id: 'orOverAnd', label: 'OR sobre AND' },
  { id: 'compare', label: 'Comparar' },
];

const AND_OVER_OR_STEPS = [
  'Expresión A(B+C)',
  'Evaluar B+C',
  'Distribuir A',
  'Rama AB',
  'Rama AC',
  'AB+AC = A(B+C)',
];

const OR_OVER_AND_STEPS = [
  'Expresión A+BC',
  'Evaluar BC',
  'Factorizar',
  'Factor (A+B)',
  'Factor (A+C)',
  '(A+B)(A+C) = A+BC',
];

const VARS = ['A', 'B', 'C'];

function evalAndOverOr(assign: Assignment): { lhs: Bit; rhs: Bit; bOrC: Bit; ab: Bit; ac: Bit } {
  const a = assign.A ?? 0;
  const b = assign.B ?? 0;
  const c = assign.C ?? 0;
  const bOrC = BOOL.or(b, c);
  const lhs = BOOL.and(a, bOrC);
  const ab = BOOL.and(a, b);
  const ac = BOOL.and(a, c);
  const rhs = BOOL.or(ab, ac);
  return { lhs, rhs, bOrC, ab, ac };
}

function evalOrOverAnd(assign: Assignment): { lhs: Bit; rhs: Bit; bc: Bit; aPlusB: Bit; aPlusC: Bit } {
  const a = assign.A ?? 0;
  const b = assign.B ?? 0;
  const c = assign.C ?? 0;
  const bc = BOOL.and(b, c);
  const lhs = BOOL.or(a, bc);
  const aPlusB = BOOL.or(a, b);
  const aPlusC = BOOL.or(a, c);
  const rhs = BOOL.and(aPlusB, aPlusC);
  return { lhs, rhs, bc, aPlusB, aPlusC };
}

function TreeVisual({
  law,
  step,
  assign,
}: {
  law: Law;
  step: number;
  assign: Assignment;
}) {
  const a = assign.A ?? 0;
  const b = assign.B ?? 0;
  const c = assign.C ?? 0;

  if (law === 'andOverOr') {
    const { lhs, rhs, bOrC, ab, ac } = evalAndOverOr(assign);
    return (
      <div className="space-y-3 font-mono text-sm">
        {step >= 0 ? (
          <div className="rounded border border-[var(--border)] p-3 text-center">
            <p className="text-[var(--fg-muted)]">LHS</p>
            <p className="text-lg">A ∧ (B ∨ C)</p>
            <p className="text-xs text-[var(--fg-muted)]">{a} ∧ ({b} ∨ {c})</p>
          </div>
        ) : null}
        {step >= 1 ? (
          <div className="flex justify-center gap-4">
            <div className="rounded border border-[var(--border)] px-3 py-2 text-center">
              <p className="text-xs text-[var(--fg-muted)]">B ∨ C</p>
              <p className="text-lg">{bOrC}</p>
            </div>
          </div>
        ) : null}
        {step >= 2 ? (
          <p className="text-center text-[var(--fg-muted)]">Distribuir A → ramas AB y AC</p>
        ) : null}
        {step >= 3 ? (
          <div className="flex justify-center gap-4">
            <div className="rounded border border-[var(--accent-strong)]/40 bg-[var(--accent-soft)] px-3 py-2">
              AB = {ab}
            </div>
          </div>
        ) : null}
        {step >= 4 ? (
          <div className="flex justify-center gap-4">
            <div className="rounded border border-[var(--accent-strong)]/40 bg-[var(--accent-soft)] px-3 py-2">
              AC = {ac}
            </div>
            <span>∨</span>
            <div className="rounded border border-emerald-600/40 px-3 py-2">AB+AC = {rhs}</div>
          </div>
        ) : null}
        {step >= 5 ? (
          <div className="text-center">
            <Badge tone="ok">A(B+C) = {lhs} · AB+AC = {rhs} ✓</Badge>
          </div>
        ) : null}
      </div>
    );
  }

  const { lhs, rhs, bc, aPlusB, aPlusC } = evalOrOverAnd(assign);
  return (
    <div className="space-y-3 font-mono text-sm">
      {step >= 0 ? (
        <div className="rounded border border-[var(--border)] p-3 text-center">
          <p className="text-[var(--fg-muted)]">LHS</p>
          <p className="text-lg">A ∨ (B ∧ C)</p>
          <p className="text-xs text-[var(--fg-muted)]">{a} ∨ ({b} ∧ {c})</p>
        </div>
      ) : null}
      {step >= 1 ? (
        <div className="flex justify-center">
          <div className="rounded border border-[var(--border)] px-3 py-2 text-center">
            <p className="text-xs text-[var(--fg-muted)]">B ∧ C</p>
            <p className="text-lg">{bc}</p>
          </div>
        </div>
      ) : null}
      {step >= 2 ? (
        <p className="text-center text-[var(--fg-muted)]">Factorizar → (A+B)(A+C)</p>
      ) : null}
      {step >= 3 ? (
        <div className="flex justify-center gap-4">
          <div className="rounded border border-[var(--accent-strong)]/40 bg-[var(--accent-soft)] px-3 py-2">
            A+B = {aPlusB}
          </div>
        </div>
      ) : null}
      {step >= 4 ? (
        <div className="flex justify-center gap-4">
          <div className="rounded border border-[var(--accent-strong)]/40 bg-[var(--accent-soft)] px-3 py-2">
            A+C = {aPlusC}
          </div>
          <span>∧</span>
          <div className="rounded border border-emerald-600/40 px-3 py-2">producto = {rhs}</div>
        </div>
      ) : null}
      {step >= 5 ? (
        <div className="text-center">
          <Badge tone="ok">A+BC = {lhs} · (A+B)(A+C) = {rhs} ✓</Badge>
        </div>
      ) : null}
    </div>
  );
}

function TruthTable8() {
  const rows = useMemo(() => {
    return generateAssignments(VARS).map((assign) => {
      const andOr = evalAndOverOr(assign);
      const orAnd = evalOrOverAnd(assign);
      return {
        assign,
        key: `${assign.A}${assign.B}${assign.C}`,
        andOrOk: andOr.lhs === andOr.rhs,
        orAndOk: orAnd.lhs === orAnd.rhs,
      };
    });
  }, []);

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-[var(--fg-muted)]">
          <th className="px-2 py-1">A</th>
          <th className="px-2 py-1">B</th>
          <th className="px-2 py-1">C</th>
          <th className="px-2 py-1">A(B+C)</th>
          <th className="px-2 py-1">AB+AC</th>
          <th className="px-2 py-1">A+BC</th>
          <th className="px-2 py-1">(A+B)(A+C)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const andOr = evalAndOverOr(row.assign);
          const orAnd = evalOrOverAnd(row.assign);
          return (
            <tr key={row.key} className="border-t border-[var(--border)]">
              <td className="px-2 py-1 font-mono">{row.assign.A}</td>
              <td className="px-2 py-1 font-mono">{row.assign.B}</td>
              <td className="px-2 py-1 font-mono">{row.assign.C}</td>
              <td className="px-2 py-1 font-mono">{andOr.lhs}</td>
              <td className={`px-2 py-1 font-mono ${row.andOrOk ? '' : 'text-rose-600'}`}>{andOr.rhs}</td>
              <td className="px-2 py-1 font-mono">{orAnd.lhs}</td>
              <td className={`px-2 py-1 font-mono ${row.orAndOk ? '' : 'text-rose-600'}`}>{orAnd.rhs}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/**
 * Distributividad booleana (ALG-BOO-003).
 */
export function BooleanDistributivityVisualizer() {
  const [assign, setAssign] = useState<Assignment>({ A: 0, B: 0, C: 0 });
  const [tab, setTab] = useState<Tab>('andOverOr');
  const [step, setStep] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const andOr = evalAndOverOr(assign);
  const orAnd = evalOrOverAnd(assign);

  const assignments = useMemo(() => generateAssignments(VARS), []);
  const vecAndOrL = useMemo(
    () => assignments.map((a) => evalAndOverOr(a).lhs),
    [assignments],
  );
  const vecAndOrR = useMemo(
    () => assignments.map((a) => evalAndOverOr(a).rhs),
    [assignments],
  );
  const vecOrAndL = useMemo(
    () => assignments.map((a) => evalOrOverAnd(a).lhs),
    [assignments],
  );
  const vecOrAndR = useMemo(
    () => assignments.map((a) => evalOrOverAnd(a).rhs),
    [assignments],
  );

  const onTab = (id: string) => {
    setTab(id as Tab);
    setStep(0);
  };

  const onBit = (v: string, bit: Bit) => setAssign((prev) => ({ ...prev, [v]: bit }));

  const caption = joinCaption(
    `A=${assign.A}, B=${assign.B}, C=${assign.C}`,
    tab === 'andOverOr' ? `A(B+C)=${andOr.lhs}, AB+AC=${andOr.rhs}` : undefined,
    tab === 'orOverAnd' ? `A+BC=${orAnd.lhs}, (A+B)(A+C)=${orAnd.rhs}` : undefined,
  );

  const law: Law = tab === 'orOverAnd' ? 'orOverAnd' : 'andOverOr';
  const steps = law === 'andOverOr' ? AND_OVER_OR_STEPS : OR_OVER_AND_STEPS;

  return (
    <VizPanel title="Distributividad booleana" caption={caption}>
      <GuideBlock
        idea="AND se distribuye sobre OR y OR se distribuye sobre AND — como el área a(b+c), pero con bits."
        tryIt="Cambia A, B y C y recorre los pasos: ambos lados coinciden siempre."
      />

      <Segmented options={TAB_OPTS} value={tab} onChange={onTab} />

      <div className="mt-3 space-y-3">
        <BitControls variables={VARS} assignment={assign} onChange={onBit} />
        <OperatorNote />

        {tab === 'andOverOr' ? (
          <div className="space-y-3">
            <ExprLabel>A(B+C) = AB + AC</ExprLabel>
            <div className="grid gap-2 sm:grid-cols-2">
              <ResultBox title="A(B+C)" value={andOr.lhs} tone={andOr.lhs === andOr.rhs ? 'ok' : 'bad'} />
              <ResultBox title="AB+AC" value={andOr.rhs} tone={andOr.lhs === andOr.rhs ? 'ok' : 'bad'} />
            </div>
            <SectionCard title={AND_OVER_OR_STEPS[step]}>
              <TreeVisual law="andOverOr" step={step} assign={assign} />
            </SectionCard>
            <StepperBar steps={AND_OVER_OR_STEPS} active={step} onStep={setStep} />
          </div>
        ) : null}

        {tab === 'orOverAnd' ? (
          <div className="space-y-3">
            <ExprLabel>A + BC = (A+B)(A+C)</ExprLabel>
            <div className="grid gap-2 sm:grid-cols-2">
              <ResultBox title="A+BC" value={orAnd.lhs} tone={orAnd.lhs === orAnd.rhs ? 'ok' : 'bad'} />
              <ResultBox title="(A+B)(A+C)" value={orAnd.rhs} tone={orAnd.lhs === orAnd.rhs ? 'ok' : 'bad'} />
            </div>
            <SectionCard title={OR_OVER_AND_STEPS[step]}>
              <TreeVisual law="orOverAnd" step={step} assign={assign} />
            </SectionCard>
            <StepperBar steps={OR_OVER_AND_STEPS} active={step} onStep={setStep} />
          </div>
        ) : null}

        {tab === 'compare' ? (
          <SectionCard title="Dual AND↔OR">
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-medium text-[var(--fg-muted)]">AND sobre OR</p>
                <CompareVectorRow f={vecAndOrL} g={vecAndOrR} />
                <EquivalenceBadge equivalent={vecAndOrL.every((v, i) => v === vecAndOrR[i])} />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-[var(--fg-muted)]">OR sobre AND</p>
                <CompareVectorRow f={vecOrAndL} g={vecOrAndR} />
                <EquivalenceBadge equivalent={vecOrAndL.every((v, i) => v === vecOrAndR[i])} />
              </div>
            </div>
          </SectionCard>
        ) : null}

        <CollapsibleEdit label="Tabla y casos" open={detailsOpen} onToggle={() => setDetailsOpen((o) => !o)}>
          <div className="space-y-3">
            <TruthTable8 />
            <div className="space-y-2 text-xs text-[var(--fg-muted)]">
              <p>
                <span className="font-medium text-[var(--fg)]">Caso A=0:</span> A(B+C)=0 y AB+AC=0;
                A+BC=BC y (A+B)(A+C)=B·C.
              </p>
              <p>
                <span className="font-medium text-[var(--fg)]">Caso A=1:</span> A(B+C)=B+C;
                AB+AC=B+C; A+BC=1; (A+B)(A+C)=1.
              </p>
              <p>
                Error común: aplicar distributividad aritmética (2·(3+4)=14) sin recordar que + es OR y · es AND.
              </p>
            </div>
          </div>
        </CollapsibleEdit>

        <ControlsStack>
          <ButtonRow>
            <VizButton onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))}>Siguiente paso</VizButton>
            <VizButton onClick={() => setStep(0)}>Reiniciar</VizButton>
          </ButtonRow>
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
