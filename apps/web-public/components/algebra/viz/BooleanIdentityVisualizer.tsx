'use client';

import { useMemo, useState } from 'react';
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

type Tab = 'neutral' | 'dominant' | 'compare';

const TAB_OPTS = [
  { id: 'neutral', label: 'Elementos neutros' },
  { id: 'dominant', label: 'Elementos dominantes' },
  { id: 'compare', label: 'Comparar' },
];

const NEUTRAL_STEPS = [
  'Entrada A',
  'Neutro OR: 0',
  'A+0 = A',
  'Neutro AND: 1',
  'A·1 = A',
  'Resumen neutros',
];

const DOMINANT_STEPS = [
  'Entrada A',
  'Dominante OR: 1',
  'A+1 = 1',
  'Dominante AND: 0',
  'A·0 = 0',
  'Resumen dominantes',
];

function PassThroughVisual({ a, op, constant, result }: { a: Bit; op: 'or' | 'and'; constant: Bit; result: Bit }) {
  const opLabel = op === 'or' ? '+' : '·';
  const constTone = constant === 0 ? 'text-[var(--fg-muted)]' : 'text-[var(--accent-strong)]';
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-2">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-center">
        <p className="text-xs text-[var(--fg-muted)]">A</p>
        <p className="font-mono text-2xl tabular-nums">{a}</p>
      </div>
      <span className="font-mono text-lg text-[var(--fg-muted)]">{opLabel}</span>
      <div className={`rounded-lg border border-dashed border-[var(--border)] px-4 py-2 text-center ${constTone}`}>
        <p className="text-xs">{constant === 0 ? 'neutro' : 'neutro'}</p>
        <p className="font-mono text-2xl tabular-nums">{constant}</p>
      </div>
      <span className="font-mono text-lg text-[var(--fg-muted)]">=</span>
      <div className="rounded-lg border border-emerald-600/40 bg-emerald-500/10 px-4 py-2 text-center">
        <p className="text-xs text-[var(--fg-muted)]">sale A</p>
        <p className="font-mono text-2xl tabular-nums text-emerald-800 dark:text-emerald-300">{result}</p>
      </div>
    </div>
  );
}

function FixedOutputVisual({
  a,
  op,
  constant,
  result,
}: {
  a: Bit;
  op: 'or' | 'and';
  constant: Bit;
  result: Bit;
}) {
  const opLabel = op === 'or' ? '+' : '·';
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-2">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-center opacity-70">
        <p className="text-xs text-[var(--fg-muted)]">A (ignorado)</p>
        <p className="font-mono text-2xl tabular-nums">{a}</p>
      </div>
      <span className="font-mono text-lg text-[var(--fg-muted)]">{opLabel}</span>
      <div className="rounded-lg border border-amber-600/40 bg-amber-500/10 px-4 py-2 text-center">
        <p className="text-xs text-[var(--fg-muted)]">dominante</p>
        <p className="font-mono text-2xl tabular-nums">{constant}</p>
      </div>
      <span className="font-mono text-lg text-[var(--fg-muted)]">=</span>
      <div className="rounded-lg border border-amber-600/40 bg-amber-500/10 px-4 py-2 text-center">
        <p className="text-xs text-[var(--fg-muted)]">fijo</p>
        <p className="font-mono text-2xl tabular-nums text-amber-900 dark:text-amber-200">{result}</p>
      </div>
    </div>
  );
}

function CompareMatrix({ a }: { a: Bit }) {
  const cells = useMemo(
    () => [
      { op: 'OR', kind: 'neutro', constant: 0 as Bit, result: BOOL.or(a, 0) },
      { op: 'OR', kind: 'dominante', constant: 1 as Bit, result: BOOL.or(a, 1) },
      { op: 'AND', kind: 'neutro', constant: 1 as Bit, result: BOOL.and(a, 1) },
      { op: 'AND', kind: 'dominante', constant: 0 as Bit, result: BOOL.and(a, 0) },
    ],
    [a],
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[var(--fg-muted)]">
            <th className="px-2 py-1">Operación</th>
            <th className="px-2 py-1">Tipo</th>
            <th className="px-2 py-1">Constante</th>
            <th className="px-2 py-1">Resultado</th>
            <th className="px-2 py-1">¿Cambia con A?</th>
          </tr>
        </thead>
        <tbody>
          {cells.map((c) => {
            const changes = c.kind === 'neutro';
            return (
              <tr key={`${c.op}-${c.kind}`} className="border-t border-[var(--border)]">
                <td className="px-2 py-1 font-mono">{c.op}</td>
                <td className="px-2 py-1">{c.kind}</td>
                <td className="px-2 py-1 font-mono">{c.constant}</td>
                <td className="px-2 py-1 font-mono">{c.result}</td>
                <td className="px-2 py-1">
                  <Badge tone={changes ? 'ok' : 'warn'}>
                    {changes ? 'depende de A' : 'constante'}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Identidades booleanas: neutros y dominantes (ALG-BOO-001).
 */
export function BooleanIdentityVisualizer() {
  const [a, setA] = useState<Bit>(0);
  const [tab, setTab] = useState<Tab>('neutral');
  const [step, setStep] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const aPlus0 = BOOL.or(a, 0);
  const aTimes1 = BOOL.and(a, 1);
  const aPlus1 = BOOL.or(a, 1);
  const aTimes0 = BOOL.and(a, 0);

  const caption = joinCaption(
    `A=${a}`,
    tab === 'neutral' ? `A+0=${aPlus0}, A·1=${aTimes1}` : undefined,
    tab === 'dominant' ? `A+1=${aPlus1}, A·0=${aTimes0}` : undefined,
  );

  const onTab = (id: string) => {
    setTab(id as Tab);
    setStep(0);
  };

  return (
    <VizPanel title="Identidades booleanas" caption={caption}>
      <GuideBlock
        idea="Los elementos neutros dejan pasar A; los dominantes fijan el resultado sin importar A."
        tryIt="Alterna A y observa qué expresiones siguen a A y cuáles se vuelven constantes."
      />

      <Segmented options={TAB_OPTS} value={tab} onChange={onTab} />

      <div className="mt-3 space-y-3">
        <BitControl label="A" value={a} onChange={setA} />
        <OperatorNote />

        {tab === 'neutral' ? (
          <div className="space-y-3">
            <ExprLabel>A+0 = A · A·1 = A</ExprLabel>
            {step >= 0 ? (
              <SectionCard title={NEUTRAL_STEPS[step]}>
                {step <= 1 ? (
                  <PassThroughVisual a={a} op="or" constant={0} result={aPlus0} />
                ) : step === 2 ? (
                  <div className="space-y-2 text-center">
                    <p className="font-mono text-lg">A+0 = {a}+0 = {aPlus0}</p>
                    <Badge tone="ok">A+0 = A ✓</Badge>
                  </div>
                ) : step === 3 ? (
                  <PassThroughVisual a={a} op="and" constant={1} result={aTimes1} />
                ) : step === 4 ? (
                  <div className="space-y-2 text-center">
                    <p className="font-mono text-lg">A·1 = {a}·1 = {aTimes1}</p>
                    <Badge tone="ok">A·1 = A ✓</Badge>
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <ResultBox title="A+0" value={aPlus0} subtitle="neutro OR" tone="ok" />
                    <ResultBox title="A·1" value={aTimes1} subtitle="neutro AND" tone="ok" />
                  </div>
                )}
              </SectionCard>
            ) : null}
            <StepperControls steps={NEUTRAL_STEPS} step={step} onStep={setStep} />
          </div>
        ) : null}

        {tab === 'dominant' ? (
          <div className="space-y-3">
            <ExprLabel>A+1 = 1 · A·0 = 0</ExprLabel>
            {step >= 0 ? (
              <SectionCard title={DOMINANT_STEPS[step]}>
                {step <= 1 ? (
                  <FixedOutputVisual a={a} op="or" constant={1} result={aPlus1} />
                ) : step === 2 ? (
                  <div className="space-y-2 text-center">
                    <p className="font-mono text-lg">A+1 = {a}+1 = {aPlus1}</p>
                    <Badge tone="warn">siempre 1</Badge>
                  </div>
                ) : step === 3 ? (
                  <FixedOutputVisual a={a} op="and" constant={0} result={aTimes0} />
                ) : step === 4 ? (
                  <div className="space-y-2 text-center">
                    <p className="font-mono text-lg">A·0 = {a}·0 = {aTimes0}</p>
                    <Badge tone="warn">siempre 0</Badge>
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <ResultBox title="A+1" value={aPlus1} subtitle="dominante OR" tone="warn" />
                    <ResultBox title="A·0" value={aTimes0} subtitle="dominante AND" tone="warn" />
                  </div>
                )}
              </SectionCard>
            ) : null}
            <StepperControls steps={DOMINANT_STEPS} step={step} onStep={setStep} />
          </div>
        ) : null}

        {tab === 'compare' ? (
          <SectionCard title="OR/AND × neutro/dominante">
            <CompareMatrix a={a} />
            <p className="mt-2 text-xs text-[var(--fg-muted)]">
              Con A={a}: neutros devuelven {a}; dominantes fijan 1 (OR) o 0 (AND).
            </p>
          </SectionCard>
        ) : null}

        <CollapsibleEdit label="Tabla y notas" open={detailsOpen} onToggle={() => setDetailsOpen((o) => !o)}>
          <div className="space-y-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--fg-muted)]">
                  <th className="px-2 py-1">A</th>
                  <th className="px-2 py-1">A+0</th>
                  <th className="px-2 py-1">A·1</th>
                  <th className="px-2 py-1">A+1</th>
                  <th className="px-2 py-1">A·0</th>
                </tr>
              </thead>
              <tbody>
                {([0, 1] as Bit[]).map((rowA) => (
                  <tr key={rowA} className="border-t border-[var(--border)]">
                    <td className="px-2 py-1 font-mono">{rowA}</td>
                    <td className="px-2 py-1 font-mono">{BOOL.or(rowA, 0)}</td>
                    <td className="px-2 py-1 font-mono">{BOOL.and(rowA, 1)}</td>
                    <td className="px-2 py-1 font-mono">{BOOL.or(rowA, 1)}</td>
                    <td className="px-2 py-1 font-mono">{BOOL.and(rowA, 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-[var(--fg-muted)]">
              Error aritmético: 1+1=2 en números, pero en booleano OR da 1. Igual 1·1=1, no «multiplica» como en ℝ.
            </p>
            <p className="text-xs text-[var(--fg-muted)]">
              En circuitos: 0 = bajo, 1 = alto. Un neutro no altera la señal; un dominante la fuerza.
            </p>
          </div>
        </CollapsibleEdit>
      </div>
    </VizPanel>
  );
}

function StepperControls({
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
