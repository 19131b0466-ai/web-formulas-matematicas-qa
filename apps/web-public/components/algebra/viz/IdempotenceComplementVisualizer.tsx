'use client';

import { useState } from 'react';
import { BOOL, type Bit } from './booleanMath';
import {
  ButtonRow,
  ControlsStack,
  VizButton,
  VizPanel,
  joinCaption,
} from './controls';
import {
  BitControl,
  ExprLabel,
  ResultBox,
  SectionCard,
  OperatorNote,
} from './booleanVizShared';
import { Badge, CollapsibleEdit, GuideBlock, Segmented } from './transformHelpers';

type Tab = 'idempotent' | 'complement' | 'compare';

const TAB_OPTS = [
  { id: 'idempotent', label: 'Idempotencia' },
  { id: 'complement', label: 'Complemento' },
  { id: 'compare', label: 'Comparar' },
];

const IDEM_STEPS = [
  'Una sola A',
  'Fan-out OR',
  'A+A = A',
  'Fan-out AND',
  'A·A = A',
  'Resumen',
];

const COMP_STEPS = [
  'A y ¬A',
  'OR complemento',
  'A+¬A = 1',
  'AND complemento',
  'A·¬A = 0',
  'Invariante',
];

function FanOutVisual({ a, op }: { a: Bit; op: 'or' | 'and' }) {
  const result = op === 'or' ? BOOL.or(a, a) : BOOL.and(a, a);
  const opSym = op === 'or' ? '+' : '·';
  return (
    <svg viewBox="0 0 320 100" className="mx-auto h-auto w-full max-w-sm" role="img" aria-label="Fan-out de A">
      <text x={16} y={54} fontSize={14} fill="currentColor" className="font-mono">{a}</text>
      <line x1={36} y1={50} x2={80} y2={30} stroke="var(--accent-strong)" strokeWidth={2} />
      <line x1={36} y1={50} x2={80} y2={70} stroke="var(--accent-strong)" strokeWidth={2} />
      <rect x={80} y={18} width={44} height={24} rx={6} fill="var(--accent-soft)" stroke="var(--accent-strong)" />
      <text x={102} y={35} textAnchor="middle" fontSize={13} fill="currentColor">{a}</text>
      <rect x={80} y={58} width={44} height={24} rx={6} fill="var(--accent-soft)" stroke="var(--accent-strong)" />
      <text x={102} y={75} textAnchor="middle" fontSize={13} fill="currentColor">{a}</text>
      <text x={140} y={54} fontSize={18} fill="currentColor">{opSym}</text>
      <rect x={170} y={34} width={56} height={32} rx={8} fill="color-mix(in oklab, emerald 25%, var(--bg))" stroke="emerald" />
      <text x={198} y={55} textAnchor="middle" fontSize={16} fill="currentColor" className="font-mono">{result}</text>
      <text x={240} y={55} fontSize={12} fill="var(--fg-muted)">= A</text>
    </svg>
  );
}

function ComplementVisual({ a, op }: { a: Bit; op: 'or' | 'and' }) {
  const notA = BOOL.not(a);
  const result = op === 'or' ? BOOL.or(a, notA) : BOOL.and(a, notA);
  const fixed = op === 'or' ? 1 : 0;
  const opSym = op === 'or' ? '+' : '·';
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-2">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-center">
        <p className="text-xs text-[var(--fg-muted)]">A</p>
        <p className="font-mono text-2xl">{a}</p>
      </div>
      <span className="font-mono text-lg">{opSym}</span>
      <div className="rounded-lg border border-[var(--accent-strong)]/40 bg-[var(--accent-soft)] px-3 py-2 text-center">
        <p className="text-xs text-[var(--fg-muted)]">¬A</p>
        <p className="font-mono text-2xl">{notA}</p>
      </div>
      <span className="font-mono text-lg">=</span>
      <div className="rounded-lg border border-emerald-600/40 bg-emerald-500/10 px-4 py-2 text-center">
        <p className="text-xs text-[var(--fg-muted)]">siempre</p>
        <p className="font-mono text-2xl text-emerald-800 dark:text-emerald-300">{result}</p>
      </div>
      <Badge tone="ok">{op === 'or' ? `fijo ${fixed}` : `fijo ${fixed}`}</Badge>
    </div>
  );
}

function CompareGrid({ a }: { a: Bit }) {
  const notA = BOOL.not(a);
  const rows = [
    { op: 'OR', with: 'A', other: a, result: BOOL.or(a, a) },
    { op: 'OR', with: '¬A', other: notA, result: BOOL.or(a, notA) },
    { op: 'AND', with: 'A', other: a, result: BOOL.and(a, a) },
    { op: 'AND', with: '¬A', other: notA, result: BOOL.and(a, notA) },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
      {rows.map((r) => {
        const dependsOnA = r.with === 'A';
        const constant = !dependsOnA;
        return (
          <div
            key={`${r.op}-${r.with}`}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 text-center"
          >
            <p className="text-xs font-medium text-[var(--fg-muted)]">{r.op} con {r.with}</p>
            <p className="mt-1 font-mono text-lg">{a} {r.op === 'OR' ? '+' : '·'} {r.other} = {r.result}</p>
            <div className="mt-2">
              <Badge tone={constant ? 'ok' : 'neutral'}>
                {constant ? 'constante' : 'depende de A'}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Idempotencia y complemento booleano (ALG-BOO-002).
 */
export function IdempotenceComplementVisualizer() {
  const [a, setA] = useState<Bit>(0);
  const [tab, setTab] = useState<Tab>('idempotent');
  const [step, setStep] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const notA = BOOL.not(a);
  const aPlusA = BOOL.or(a, a);
  const aTimesA = BOOL.and(a, a);
  const aPlusNotA = BOOL.or(a, notA);
  const aTimesNotA = BOOL.and(a, notA);

  const onTab = (id: string) => {
    setTab(id as Tab);
    setStep(0);
  };

  const caption = joinCaption(
    `A=${a}, ¬A=${notA}`,
    tab === 'idempotent' ? `A+A=${aPlusA}, A·A=${aTimesA}` : undefined,
    tab === 'complement' ? `A+¬A=${aPlusNotA}, A·¬A=${aTimesNotA}` : undefined,
  );

  return (
    <VizPanel title="Idempotencia y complemento" caption={caption}>
      <GuideBlock
        idea="Repetir A no cambia el valor (idempotencia); A con su complemento da siempre 1 u 0."
        tryIt="Alterna A: ¬A se actualiza al instante y las leyes de complemento no cambian."
      />

      <Segmented options={TAB_OPTS} value={tab} onChange={onTab} />

      <div className="mt-3 space-y-3">
        <div className="flex flex-wrap items-center gap-4">
          <BitControl label="A" value={a} onChange={setA} />
          <ResultBox title="¬A" value={notA} subtitle="complemento" tone="neutral" />
        </div>
        <OperatorNote />

        {tab === 'idempotent' ? (
          <div className="space-y-3">
            <ExprLabel>A+A = A · A·A = A</ExprLabel>
            <SectionCard title={IDEM_STEPS[step]}>
              {step <= 1 ? <FanOutVisual a={a} op="or" /> : null}
              {step === 2 ? (
                <div className="text-center">
                  <p className="font-mono text-lg">A+A = {a}+{a} = {aPlusA}</p>
                  <div className="mt-2"><Badge tone="ok">A+A = A ✓</Badge></div>
                </div>
              ) : null}
              {step === 3 ? <FanOutVisual a={a} op="and" /> : null}
              {step === 4 ? (
                <div className="text-center">
                  <p className="font-mono text-lg">A·A = {a}·{a} = {aTimesA}</p>
                  <div className="mt-2"><Badge tone="ok">A·A = A ✓</Badge></div>
                </div>
              ) : null}
              {step === 5 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <ResultBox title="A+A" value={aPlusA} subtitle="idempotente OR" tone="ok" />
                  <ResultBox title="A·A" value={aTimesA} subtitle="idempotente AND" tone="ok" />
                </div>
              ) : null}
              {step === 0 ? (
                <p className="text-center text-sm text-[var(--fg-muted)]">Una sola variable A alimenta ambas ramas.</p>
              ) : null}
            </SectionCard>
            <StepperBar steps={IDEM_STEPS} step={step} onStep={setStep} />
          </div>
        ) : null}

        {tab === 'complement' ? (
          <div className="space-y-3">
            <ExprLabel>A+¬A = 1 · A·¬A = 0</ExprLabel>
            <SectionCard title={COMP_STEPS[step]}>
              {step <= 1 ? <ComplementVisual a={a} op="or" /> : null}
              {step === 2 ? (
                <div className="text-center">
                  <p className="font-mono text-lg">A+¬A = {a}+{notA} = {aPlusNotA}</p>
                  <div className="mt-2"><Badge tone="ok">siempre 1, aunque A cambie</Badge></div>
                </div>
              ) : null}
              {step === 3 ? <ComplementVisual a={a} op="and" /> : null}
              {step === 4 ? (
                <div className="text-center">
                  <p className="font-mono text-lg">A·¬A = {a}·{notA} = {aTimesNotA}</p>
                  <div className="mt-2"><Badge tone="ok">siempre 0, aunque A cambie</Badge></div>
                </div>
              ) : null}
              {step === 5 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <ResultBox title="A+¬A" value={aPlusNotA} subtitle="tautología" tone="ok" />
                  <ResultBox title="A·¬A" value={aTimesNotA} subtitle="contradicción" tone="ok" />
                </div>
              ) : null}
              {step === 0 ? (
                <p className="text-center text-sm text-[var(--fg-muted)]">
                  A={a} implica ¬A={notA} — siempre opuestos.
                </p>
              ) : null}
            </SectionCard>
            <StepperBar steps={COMP_STEPS} step={step} onStep={setStep} />
          </div>
        ) : null}

        {tab === 'compare' ? (
          <SectionCard title="OR/AND × A vs ¬A">
            <CompareGrid a={a} />
          </SectionCard>
        ) : null}

        <CollapsibleEdit label="Tabla y notas" open={detailsOpen} onToggle={() => setDetailsOpen((o) => !o)}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--fg-muted)]">
                <th className="px-2 py-1">A</th>
                <th className="px-2 py-1">¬A</th>
                <th className="px-2 py-1">A+A</th>
                <th className="px-2 py-1">A·A</th>
                <th className="px-2 py-1">A+¬A</th>
                <th className="px-2 py-1">A·¬A</th>
              </tr>
            </thead>
            <tbody>
              {([0, 1] as Bit[]).map((rowA) => {
                const n = BOOL.not(rowA);
                return (
                  <tr key={rowA} className="border-t border-[var(--border)]">
                    <td className="px-2 py-1 font-mono">{rowA}</td>
                    <td className="px-2 py-1 font-mono">{n}</td>
                    <td className="px-2 py-1 font-mono">{BOOL.or(rowA, rowA)}</td>
                    <td className="px-2 py-1 font-mono">{BOOL.and(rowA, rowA)}</td>
                    <td className="px-2 py-1 font-mono">{BOOL.or(rowA, n)}</td>
                    <td className="px-2 py-1 font-mono">{BOOL.and(rowA, n)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-[var(--fg-muted)]">
            Error aritmético: en números 1+1=2, pero en OR booleano 1+1=1. La idempotencia lo refleja.
          </p>
        </CollapsibleEdit>
      </div>
    </VizPanel>
  );
}

function StepperBar({
  steps,
  step,
  onStep,
}: {
  steps: string[];
  step: number;
  onStep: (i: number) => void;
}) {
  return (
    <ControlsStack>
      <div className="flex flex-wrap gap-1">
        {steps.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => onStep(i)}
            className={`rounded-md border px-2 py-1 text-xs ${
              i === step
                ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)]'
                : 'border-[var(--border)] text-[var(--fg-muted)]'
            }`}
          >
            {i + 1}. {s}
          </button>
        ))}
      </div>
      <ButtonRow>
        <VizButton onClick={() => onStep(Math.min(step + 1, steps.length - 1))}>Siguiente</VizButton>
        <VizButton onClick={() => onStep(0)}>Reiniciar</VizButton>
      </ButtonRow>
    </ControlsStack>
  );
}
