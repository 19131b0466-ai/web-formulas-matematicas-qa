'use client';

import { useMemo, useState } from 'react';
import {
  assignmentKey,
  buildCanonicalSOP,
  buildMinterm,
  generateAssignments,
  indexToAssignment,
  SOP_PRESETS,
  verifyOutputsMatch,
  type Bit,
} from './booleanMath';
import {
  BitControl,
  ButtonRow,
  CollapsibleEdit,
  CoverageGrid2,
  OperatorNote,
  ResultBox,
  SectionCard,
  Segmented,
  StepperBar,
  VizButton,
} from './booleanVizShared';
import { VizPanel, joinCaption } from './controls';
import { Badge, Chip, ChipRow, GuideBlock } from './transformHelpers';

type Tab = 'build' | 'minterm' | 'canonical';

const TABS = [
  { id: 'build', label: 'Construir SOP' },
  { id: 'minterm', label: 'Explorar un minterm' },
  { id: 'canonical', label: 'Forma canónica' },
];

const SOP_STEPS = ['Observar F', 'Buscar unos', 'Minterms', 'Sumar', 'Verificar'];

const VAR_OPTIONS = [
  { id: '2', label: '2 vars (A,B)' },
  { id: '3', label: '3 vars (A,B,C)' },
];

function defaultOutputs(n: number): Bit[] {
  if (n === 2) return [1, 1, 0, 1];
  return [0, 0, 0, 1, 0, 0, 0, 0];
}

/**
 * Suma de productos canónica (ALG-BOO-007).
 */
export function SumOfProductsVisualizer() {
  const [tab, setTab] = useState<Tab>('build');
  const [varCount, setVarCount] = useState(2);
  const [outputs, setOutputs] = useState<Bit[]>(() => defaultOutputs(2));
  const [presetId, setPresetId] = useState('implication');
  const [mintermIndex, setMintermIndex] = useState(0);
  const [activeStep, setActiveStep] = useState(4);
  const [sopPosOpen, setSopPosOpen] = useState(false);

  const variables = useMemo(
    () => (varCount === 2 ? ['A', 'B'] : ['A', 'B', 'C']),
    [varCount],
  );

  const assignments = useMemo(() => generateAssignments(variables), [variables]);

  const paddedOutputs = useMemo(() => {
    const next = [...outputs];
    while (next.length < assignments.length) next.push(0);
    return next.slice(0, assignments.length) as Bit[];
  }, [outputs, assignments.length]);

  const sop = useMemo(
    () => buildCanonicalSOP(paddedOutputs, variables),
    [paddedOutputs, variables],
  );

  const oneIndices = useMemo(
    () => paddedOutputs.map((v, i) => (v === 1 ? i : -1)).filter((i) => i >= 0),
    [paddedOutputs],
  );

  const activePreset = SOP_PRESETS.find((p) => p.id === presetId);
  const verified = verifyOutputsMatch(paddedOutputs, sop.expression, variables);

  const setOutputAt = (index: number, bit: Bit) => {
    setOutputs((prev) => {
      const next = [...prev];
      while (next.length <= index) next.push(0);
      next[index] = bit;
      return next as Bit[];
    });
    setPresetId('');
  };

  const applyPreset = (id: string) => {
    const p = SOP_PRESETS.find((x) => x.id === id);
    if (!p) return;
    setPresetId(id);
    setVarCount(p.variables.length);
    setOutputs([...p.outputs]);
    setMintermIndex(p.outputs.findIndex((o) => o === 1));
    setActiveStep(0);
  };

  const changeVarCount = (n: number) => {
    setVarCount(n);
    setOutputs(defaultOutputs(n));
    setPresetId('');
    setMintermIndex(0);
    setActiveStep(0);
  };

  const exploreIdx = oneIndices[Math.min(mintermIndex, Math.max(oneIndices.length - 1, 0))] ?? 0;
  const exploreAssignment = indexToAssignment(exploreIdx, variables);
  const exploreMinterm = buildMinterm(exploreAssignment, variables);

  const caption = joinCaption(
    sop.notation,
    sop.expression !== '0' ? sop.expression : 'función nula',
    verified ? 'verificado ✓' : undefined,
  );

  const showOnes = activeStep >= 1;
  const showMinterms = activeStep >= 2;
  const showSum = activeStep >= 3;
  const showVerify = activeStep >= 4;

  return (
    <VizPanel title="Suma de productos (SOP)" caption={caption}>
      <div className="space-y-3">
        <GuideBlock
          idea="La forma canónica SOP es una suma (OR) de minterms: cada minterm corresponde a una fila donde F = 1."
          tryIt="Edita la columna F con los interruptores 0/1 y observa cómo se generan los minterms ¬A¬B, ¬AB, AB…"
        />

        <Segmented options={TABS} value={tab} onChange={(id) => setTab(id as Tab)} />

        <ChipRow>
          {SOP_PRESETS.filter((p) => p.variables.length <= varCount || p.variables.length === 2).map((p) => (
            <Chip key={p.id} active={presetId === p.id} onClick={() => applyPreset(p.id)}>
              {p.label}
            </Chip>
          ))}
        </ChipRow>

        <Segmented
          options={VAR_OPTIONS}
          value={String(varCount)}
          onChange={(id) => changeVarCount(Number(id))}
        />

        {tab === 'build' ? (
          <div className="space-y-3">
            <StepperBar steps={SOP_STEPS} active={activeStep} onStep={setActiveStep} />

            <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
              <table className="w-full min-w-[20rem] text-sm" aria-label="Tabla de verdad editable">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-[var(--fg-muted)]">
                    <th colSpan={variables.length} className="px-2 py-1 text-center text-xs uppercase">Entradas</th>
                    <th className="border-l border-[var(--border)] px-2 py-1 text-center text-xs uppercase">F</th>
                    {showMinterms ? (
                      <th className="border-l border-[var(--border)] px-2 py-1 text-xs uppercase">Minterm</th>
                    ) : null}
                  </tr>
                  <tr className="border-b border-[var(--border)] text-left text-[var(--fg-muted)]">
                    {variables.map((v) => (
                      <th key={v} className="px-2 py-1 font-mono">{v}</th>
                    ))}
                    <th className="border-l border-[var(--border)] px-2 py-1 font-semibold text-[var(--accent-strong)]">F</th>
                    {showMinterms ? <th className="border-l border-[var(--border)] px-2 py-1">mᵢ</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a, i) => {
                    const isOne = paddedOutputs[i] === 1;
                    const highlight = showOnes && isOne;
                    return (
                      <tr
                        key={i}
                        className={`border-t border-[var(--border)] ${highlight ? 'bg-emerald-500/10' : ''}`}
                      >
                        {variables.map((v) => (
                          <td key={v} className="px-2 py-1 font-mono tabular-nums">{a[v]}</td>
                        ))}
                        <td className="border-l border-[var(--border)] px-2 py-2">
                          <BitControl
                            label=""
                            value={paddedOutputs[i]}
                            onChange={(bit) => setOutputAt(i, bit)}
                          />
                        </td>
                        {showMinterms ? (
                          <td className="border-l border-[var(--border)] px-2 py-1 font-mono text-xs">
                            {isOne ? buildMinterm(a, variables) : '—'}
                          </td>
                        ) : null}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {showSum ? (
              <SectionCard title="Forma canónica SOP">
                <p className="font-mono text-sm leading-relaxed text-[var(--fg)]">
                  <span className="text-[var(--accent-strong)]">{sop.notation}</span>
                  {' = '}
                  {sop.expression}
                </p>
                {activePreset?.note ? (
                  <p className="mt-2 text-xs text-[var(--fg-muted)]">
                    Nota secundaria: forma simplificada relacionada con {activePreset.note}
                    {activePreset.id === 'implication' ? ' (¬A+B)' : ''}.
                  </p>
                ) : null}
              </SectionCard>
            ) : null}

            {showVerify ? (
              <Badge tone={verified ? 'ok' : 'warn'}>
                {verified ? 'La SOP reproduce la columna F ✓' : 'Revisa la construcción'}
              </Badge>
            ) : null}

            <ButtonRow>
              <VizButton onClick={() => setActiveStep((s) => Math.min(4, s + 1))} disabled={activeStep >= 4}>
                Siguiente paso
              </VizButton>
              {activeStep > 0 ? <VizButton onClick={() => setActiveStep(0)}>Reiniciar</VizButton> : null}
            </ButtonRow>
          </div>
        ) : null}

        {tab === 'minterm' ? (
          <div className="space-y-3">
            {oneIndices.length === 0 ? (
              <p className="text-sm text-[var(--fg-muted)]">No hay filas con F = 1. Activa al menos un minterm.</p>
            ) : (
              <>
                {varCount === 2 ? (
                  <CoverageGrid2
                    active={assignmentKey(exploreAssignment, variables)}
                    highlight={oneIndices.map((i) => assignmentKey(assignments[i], variables))}
                    labels={Object.fromEntries(
                      oneIndices.map((i) => [
                        assignmentKey(assignments[i], variables),
                        `m${i}`,
                      ]),
                    )}
                    onSelect={(key) => {
                      const idx = assignments.findIndex((a) => assignmentKey(a, variables) === key);
                      const pos = oneIndices.indexOf(idx);
                      if (pos >= 0) setMintermIndex(pos);
                    }}
                  />
                ) : null}

                <div className="grid gap-2 sm:grid-cols-2">
                  <ResultBox
                    title="Fila (índice m)"
                    value={exploreIdx}
                    subtitle={variables.map((v) => `${v}=${exploreAssignment[v]}`).join(', ')}
                  />
                  <ResultBox title="Minterm" value={exploreMinterm} />
                </div>

                <SectionCard title="Regla del minterm">
                  <p className="text-sm text-[var(--fg-muted)]">
                    Para cada variable: si la entrada es <span className="font-mono">0</span> → negar (¬);
                    si es <span className="font-mono">1</span> → literal directo.
                  </p>
                  <p className="mt-2 font-mono text-sm">
                    m{exploreIdx}: {variables.map((v) => `${v}=${exploreAssignment[v]} → ${exploreAssignment[v] === 0 ? `¬${v}` : v}`).join(' · ')}
                  </p>
                </SectionCard>

                <ButtonRow>
                  <VizButton
                    onClick={() => setMintermIndex((i) => (i - 1 + oneIndices.length) % oneIndices.length)}
                    aria-label="Minterm anterior"
                  >
                    ← Anterior
                  </VizButton>
                  <span className="self-center text-sm text-[var(--fg-muted)]">
                    Minterm {mintermIndex + 1} / {oneIndices.length}
                  </span>
                  <VizButton
                    onClick={() => setMintermIndex((i) => (i + 1) % oneIndices.length)}
                    aria-label="Minterm siguiente"
                  >
                    Siguiente →
                  </VizButton>
                </ButtonRow>
              </>
            )}
          </div>
        ) : null}

        {tab === 'canonical' ? (
          <div className="space-y-3">
            <SectionCard title="Notación Σm">
              <p className="font-mono text-lg text-[var(--accent-strong)]">{sop.notation}</p>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                Índices de filas con F = 1: {oneIndices.length ? oneIndices.join(', ') : 'ninguno'}
              </p>
            </SectionCard>

            <SectionCard title="Expresión canónica">
              <p className="font-mono text-sm leading-relaxed">{sop.expression}</p>
              {sop.terms.length > 0 ? (
                <p className="mt-2 text-xs text-[var(--fg-muted)]">
                  Términos: {sop.terms.join(' + ')}
                </p>
              ) : null}
            </SectionCard>

            <OperatorNote />

            {activePreset?.id === 'implication' ? (
              <p className="text-xs text-[var(--fg-muted)]">
                Forma simplificada (secundaria): ¬A + B, equivalente a la implicación A→B.
              </p>
            ) : activePreset?.note ? (
              <p className="text-xs text-[var(--fg-muted)]">Relacionado con {activePreset.note}.</p>
            ) : null}

            <Badge tone={verified ? 'ok' : 'neutral'}>
              Verificación por tabla: {verified ? 'coincide ✓' : 'pendiente'}
            </Badge>
          </div>
        ) : null}

        <CollapsibleEdit label="SOP vs POS" open={sopPosOpen} onToggle={() => setSopPosOpen((o) => !o)}>
          <div className="space-y-2 text-sm text-[var(--fg-muted)]">
            <p>
              <span className="font-medium text-[var(--fg)]">SOP</span> suma minterms donde F = 1 (Σm).
              <span className="font-medium text-[var(--fg)]"> POS</span> multiplica maxterms donde F = 0 (ΠM).
            </p>
            <p>Misma función, dos formas duales canónicas.</p>
          </div>
        </CollapsibleEdit>
      </div>
    </VizPanel>
  );
}
