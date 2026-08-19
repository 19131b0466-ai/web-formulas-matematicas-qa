'use client';

import { useMemo, useState } from 'react';
import {
  assignmentKey,
  buildCanonicalPOS,
  buildMaxterm,
  generateAssignments,
  indexToAssignment,
  POS_PRESETS,
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

type Tab = 'build' | 'maxterm' | 'canonical';

const TABS = [
  { id: 'build', label: 'Construir POS' },
  { id: 'maxterm', label: 'Explorar un maxterm' },
  { id: 'canonical', label: 'Forma canónica' },
];

const POS_STEPS = ['Observar F', 'Buscar ceros', 'Maxterms', 'Multiplicar', 'Verificar'];

const VAR_OPTIONS = [
  { id: '2', label: '2 vars (A,B)' },
  { id: '3', label: '3 vars (A,B,C)' },
];

function defaultOutputs(n: number): Bit[] {
  if (n === 2) return [1, 0, 0, 1];
  return [1, 0, 0, 0, 0, 0, 0, 1];
}

/**
 * Producto de sumas canónico (ALG-BOO-008).
 */
export function ProductOfSumsVisualizer() {
  const [tab, setTab] = useState<Tab>('build');
  const [varCount, setVarCount] = useState(2);
  const [outputs, setOutputs] = useState<Bit[]>(() => defaultOutputs(2));
  const [presetId, setPresetId] = useState('xnor');
  const [maxtermIndex, setMaxtermIndex] = useState(0);
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

  const pos = useMemo(
    () => buildCanonicalPOS(paddedOutputs, variables),
    [paddedOutputs, variables],
  );

  const zeroIndices = useMemo(
    () => paddedOutputs.map((v, i) => (v === 0 ? i : -1)).filter((i) => i >= 0),
    [paddedOutputs],
  );

  const activePreset = POS_PRESETS.find((p) => p.id === presetId);
  const verified = verifyOutputsMatch(paddedOutputs, pos.expression, variables);

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
    const p = POS_PRESETS.find((x) => x.id === id);
    if (!p) return;
    setPresetId(id);
    setVarCount(p.variables.length);
    setOutputs([...p.outputs]);
    setMaxtermIndex(p.outputs.findIndex((o) => o === 0));
    setActiveStep(0);
  };

  const changeVarCount = (n: number) => {
    setVarCount(n);
    setOutputs(defaultOutputs(n));
    setPresetId('');
    setMaxtermIndex(0);
    setActiveStep(0);
  };

  const exploreIdx = zeroIndices[Math.min(maxtermIndex, Math.max(zeroIndices.length - 1, 0))] ?? 0;
  const exploreAssignment = indexToAssignment(exploreIdx, variables);
  const exploreMaxterm = buildMaxterm(exploreAssignment, variables);

  const caption = joinCaption(
    pos.notation,
    pos.expression !== '1' ? pos.expression : 'función tautológica',
    verified ? 'verificado ✓' : undefined,
  );

  const showZeros = activeStep >= 1;
  const showMaxterms = activeStep >= 2;
  const showProduct = activeStep >= 3;
  const showVerify = activeStep >= 4;

  return (
    <VizPanel title="Producto de sumas (POS)" caption={caption}>
      <div className="space-y-3">
        <GuideBlock
          idea="La forma canónica POS es un producto (AND) de maxterms: cada maxterm corresponde a una fila donde F = 0."
          tryIt="Marca ceros en la columna F y observa cómo cada maxterm es una suma (A+¬B) que se anula en esa fila."
        />

        <Segmented options={TABS} value={tab} onChange={(id) => setTab(id as Tab)} />

        <ChipRow>
          {POS_PRESETS.filter((p) => p.variables.length <= varCount || p.variables.length === 2).map((p) => (
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
            <StepperBar steps={POS_STEPS} active={activeStep} onStep={setActiveStep} />

            <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
              <table className="w-full min-w-[20rem] text-sm" aria-label="Tabla de verdad editable">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-[var(--fg-muted)]">
                    <th colSpan={variables.length} className="px-2 py-1 text-center text-xs uppercase">Entradas</th>
                    <th className="border-l border-[var(--border)] px-2 py-1 text-center text-xs uppercase">F</th>
                    {showMaxterms ? (
                      <th className="border-l border-[var(--border)] px-2 py-1 text-xs uppercase">Maxterm</th>
                    ) : null}
                  </tr>
                  <tr className="border-b border-[var(--border)] text-left text-[var(--fg-muted)]">
                    {variables.map((v) => (
                      <th key={v} className="px-2 py-1 font-mono">{v}</th>
                    ))}
                    <th className="border-l border-[var(--border)] px-2 py-1 font-semibold text-[var(--accent-strong)]">F</th>
                    {showMaxterms ? <th className="border-l border-[var(--border)] px-2 py-1">Mᵢ</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a, i) => {
                    const isZero = paddedOutputs[i] === 0;
                    const highlight = showZeros && isZero;
                    return (
                      <tr
                        key={i}
                        className={`border-t border-[var(--border)] ${highlight ? 'bg-rose-500/10' : ''}`}
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
                        {showMaxterms ? (
                          <td className="border-l border-[var(--border)] px-2 py-1 font-mono text-xs">
                            {isZero ? `(${buildMaxterm(a, variables)})` : '—'}
                          </td>
                        ) : null}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {showProduct ? (
              <SectionCard title="Forma canónica POS">
                <p className="font-mono text-sm leading-relaxed text-[var(--fg)]">
                  <span className="text-[var(--accent-strong)]">{pos.notation}</span>
                  {' = '}
                  {pos.expression}
                </p>
              </SectionCard>
            ) : null}

            {showVerify ? (
              <Badge tone={verified ? 'ok' : 'warn'}>
                {verified ? 'El POS reproduce la columna F ✓' : 'Revisa la construcción'}
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

        {tab === 'maxterm' ? (
          <div className="space-y-3">
            {zeroIndices.length === 0 ? (
              <p className="text-sm text-[var(--fg-muted)]">No hay filas con F = 0. La función es tautológica (POS = 1).</p>
            ) : (
              <>
                {varCount === 2 ? (
                  <CoverageGrid2
                    active={assignmentKey(exploreAssignment, variables)}
                    highlight={zeroIndices.map((i) => assignmentKey(assignments[i], variables))}
                    labels={Object.fromEntries(
                      zeroIndices.map((i) => [
                        assignmentKey(assignments[i], variables),
                        `M${i}`,
                      ]),
                    )}
                    onSelect={(key) => {
                      const idx = assignments.findIndex((a) => assignmentKey(a, variables) === key);
                      const pos_i = zeroIndices.indexOf(idx);
                      if (pos_i >= 0) setMaxtermIndex(pos_i);
                    }}
                  />
                ) : null}

                <div className="grid gap-2 sm:grid-cols-2">
                  <ResultBox
                    title="Fila (índice M)"
                    value={exploreIdx}
                    subtitle={variables.map((v) => `${v}=${exploreAssignment[v]}`).join(', ')}
                  />
                  <ResultBox title="Maxterm" value={`(${exploreMaxterm})`} />
                </div>

                <SectionCard title="Regla del maxterm">
                  <p className="text-sm text-[var(--fg-muted)]">
                    Para cada variable: si la entrada es <span className="font-mono">0</span> → literal directo;
                    si es <span className="font-mono">1</span> → negar (¬).
                  </p>
                  <p className="mt-2 font-mono text-sm">
                    M{exploreIdx}: {variables.map((v) => `${v}=${exploreAssignment[v]} → ${exploreAssignment[v] === 0 ? v : `¬${v}`}`).join(' + ')}
                  </p>
                </SectionCard>

                <ButtonRow>
                  <VizButton
                    onClick={() => setMaxtermIndex((i) => (i - 1 + zeroIndices.length) % zeroIndices.length)}
                    aria-label="Maxterm anterior"
                  >
                    ← Anterior
                  </VizButton>
                  <span className="self-center text-sm text-[var(--fg-muted)]">
                    Maxterm {maxtermIndex + 1} / {zeroIndices.length}
                  </span>
                  <VizButton
                    onClick={() => setMaxtermIndex((i) => (i + 1) % zeroIndices.length)}
                    aria-label="Maxterm siguiente"
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
            <SectionCard title="Notación ΠM">
              <p className="font-mono text-lg text-[var(--accent-strong)]">{pos.notation}</p>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                Índices de filas con F = 0: {zeroIndices.length ? zeroIndices.join(', ') : 'ninguno'}
              </p>
            </SectionCard>

            <SectionCard title="Expresión canónica">
              <p className="font-mono text-sm leading-relaxed">{pos.expression}</p>
              {pos.terms.length > 0 ? (
                <p className="mt-2 text-xs text-[var(--fg-muted)]">
                  Factores: {pos.terms.map((t) => `(${t})`).join(' · ')}
                </p>
              ) : null}
            </SectionCard>

            <OperatorNote />

            {activePreset?.id === 'xnor' ? (
              <p className="text-xs text-[var(--fg-muted)]">
                Nota secundaria: esta función corresponde a la equivalencia A↔B.
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
              <span className="font-medium text-[var(--fg)]">POS</span> usa filas con F = 0; cada maxterm es una suma
              que vale 0 solo en esa fila.
              <span className="font-medium text-[var(--fg)]"> SOP</span> es la forma dual con minterms en filas con F = 1.
            </p>
            <p>Ambas representan la misma función booleana.</p>
          </div>
        </CollapsibleEdit>
      </div>
    </VizPanel>
  );
}
