'use client';

import { useMemo, useState } from 'react';
import {
  buildTruthVector,
  compareTruthVectors,
  EQUIVALENCE_PRESETS,
  evaluateBooleanExpression,
  generateAssignments,
  indexToAssignment,
  mergeVariables,
  parseBooleanExpression,
  xorTruthVectors,
  type Bit,
} from './booleanMath';
import {
  BitControls,
  ButtonRow,
  CollapsibleEdit,
  CompareVectorRow,
  EquivalenceBadge,
  ExprLabel,
  ResultBox,
  SectionCard,
  Segmented,
  StepperBar,
  VizButton,
} from './booleanVizShared';
import { ControlsStack, ToggleRow, VizPanel, joinCaption } from './controls';
import { GuideBlock } from './transformHelpers';

type Tab = 'compare' | 'row' | 'identities';

const DEFAULT_F = '¬(A⊕B)';
const DEFAULT_G = '(A∧B)∨(¬A∧¬B)';

const TABS = [
  { id: 'compare', label: 'Comparar' },
  { id: 'row', label: 'Explorar una fila' },
  { id: 'identities', label: 'Identidades' },
];

const EQ_STEPS = [
  'Expresiones',
  'Variables',
  'Filas',
  'Columna F',
  'Columna G',
  'Comparar',
];

function ExprInput({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-[var(--fg-muted)]">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 font-mono text-sm text-[var(--fg)]"
        aria-label={label}
        spellCheck={false}
      />
      {error ? <span className="text-xs text-rose-600 dark:text-rose-400">{error}</span> : null}
    </label>
  );
}

/**
 * Equivalencia booleana F ≡ G (ALG-BOO-009).
 */
export function BooleanEquivalenceVisualizer() {
  const [tab, setTab] = useState<Tab>('compare');
  const [exprF, setExprF] = useState(DEFAULT_F);
  const [exprG, setExprG] = useState(DEFAULT_G);
  const [rowIndex, setRowIndex] = useState(0);
  const [showXor, setShowXor] = useState(false);
  const [activeStep, setActiveStep] = useState(5);
  const [tautOpen, setTautOpen] = useState(false);
  const [equivOpen, setEquivOpen] = useState(false);
  const [presetId, setPresetId] = useState('xnor');

  const parsedF = useMemo(() => parseBooleanExpression(exprF), [exprF]);
  const parsedG = useMemo(() => parseBooleanExpression(exprG), [exprG]);

  const variables = useMemo(() => {
    if (!parsedF.ok || !parsedG.ok) return [];
    return mergeVariables(parsedF.variables, parsedG.variables);
  }, [parsedF, parsedG]);

  const tooManyVars = variables.length > 5;

  const assignments = useMemo(
    () => (variables.length > 0 && !tooManyVars ? generateAssignments(variables) : []),
    [variables, tooManyVars],
  );

  const vectors = useMemo(() => {
    if (!parsedF.ok || !parsedG.ok || assignments.length === 0) {
      return { f: [] as Bit[], g: [] as Bit[], xor: [] as Bit[] };
    }
    const f = buildTruthVector(parsedF.ast, assignments);
    const g = buildTruthVector(parsedG.ast, assignments);
    return { f, g, xor: xorTruthVectors(f, g) };
  }, [parsedF, parsedG, assignments]);

  const comparison = useMemo(
    () => compareTruthVectors(vectors.f, vectors.g),
    [vectors.f, vectors.g],
  );

  const parseOk = parsedF.ok && parsedG.ok && !tooManyVars;
  const currentAssignment = assignments[rowIndex] ?? indexToAssignment(0, variables);
  const rowF = parseOk ? evaluateBooleanExpression(parsedF.ast, currentAssignment) : 0;
  const rowG = parseOk ? evaluateBooleanExpression(parsedG.ast, currentAssignment) : 0;
  const rowMatch = rowF === rowG;

  const applyPreset = (id: string) => {
    const p = EQUIVALENCE_PRESETS.find((x) => x.id === id);
    if (!p) return;
    setPresetId(id);
    setExprF(p.exprF);
    setExprG(p.exprG);
    setRowIndex(0);
    setActiveStep(0);
  };

  const firstMismatch = comparison.mismatchIndices[0];

  const caption = joinCaption(
    parseOk ? `F≡G: ${comparison.isEquivalent ? 'sí' : 'no'}` : undefined,
    parseOk ? `${comparison.matches}/${assignments.length} coincidencias` : undefined,
  );

  const showCompareTable = activeStep >= 5;
  const showGCol = activeStep >= 4;
  const showFCol = activeStep >= 3;
  const showInputs = activeStep >= 2;

  return (
    <VizPanel title="Equivalencia booleana" caption={caption}>
      <div className="space-y-3">
        <GuideBlock
          idea="Dos expresiones booleanas son equivalentes si producen la misma salida en todas las filas de la tabla de verdad."
          tryIt="Edita F y G, o elige una identidad, y comprueba si las columnas de salida coinciden fila a fila."
        />

        <header className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <ExprLabel>
              F = {exprF} · G = {exprG}
            </ExprLabel>
            <EquivalenceBadge equivalent={parseOk ? comparison.isEquivalent : null} />
          </div>
          {tooManyVars ? (
            <p className="text-xs text-amber-700 dark:text-amber-300" role="alert">
              Demasiadas variables (máx. 5). Reduce las expresiones para visualizar la tabla.
            </p>
          ) : null}
          {!parsedF.ok ? (
            <p className="text-xs text-rose-600 dark:text-rose-400">F: {parsedF.error}</p>
          ) : null}
          {!parsedG.ok ? (
            <p className="text-xs text-rose-600 dark:text-rose-400">G: {parsedG.error}</p>
          ) : null}
        </header>

        <Segmented options={TABS} value={tab} onChange={(id) => setTab(id as Tab)} />

        {tab === 'compare' ? (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <ExprInput label="Expresión F" value={exprF} onChange={setExprF} error={!parsedF.ok ? parsedF.error : undefined} />
              <ExprInput label="Expresión G" value={exprG} onChange={setExprG} error={!parsedG.ok ? parsedG.error : undefined} />
            </div>

            <StepperBar steps={EQ_STEPS} active={activeStep} onStep={setActiveStep} />

            {parseOk && showCompareTable ? (
              <>
                <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
                  <table className="w-full min-w-[28rem] text-sm" aria-label="Tabla de verdad comparativa">
                    <thead>
                      <tr className="bg-[var(--bg)] text-left text-xs uppercase tracking-wide text-[var(--fg-muted)]">
                        <th colSpan={variables.length} className="border-b border-r border-[var(--border)] px-2 py-1.5 text-center">
                          Entradas
                        </th>
                        <th colSpan={2} className="border-b border-r border-[var(--border)] px-2 py-1.5 text-center">
                          Salidas
                        </th>
                        <th colSpan={showXor ? 2 : 1} className="border-b border-[var(--border)] px-2 py-1.5 text-center">
                          Comparación
                        </th>
                      </tr>
                      <tr className="border-b border-[var(--border)] text-left text-[var(--fg-muted)]">
                        {variables.map((v) => (
                          <th key={v} className="px-2 py-1 font-mono">{v}</th>
                        ))}
                        <th className="border-l border-[var(--border)] px-2 py-1 font-semibold text-[var(--accent-strong)]">F</th>
                        <th className="px-2 py-1 font-semibold text-[var(--accent-strong)]">G</th>
                        <th className="border-l border-[var(--border)] px-2 py-1">✓/✕</th>
                        {showXor ? <th className="px-2 py-1">F⊕G</th> : null}
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((a, i) => {
                        const mismatch = vectors.f[i] !== vectors.g[i];
                        const counter = firstMismatch === i;
                        return (
                          <tr
                            key={i}
                            className={`border-t border-[var(--border)] ${
                              counter ? 'bg-rose-500/10 ring-1 ring-inset ring-rose-600/30' : mismatch ? 'bg-amber-500/5' : ''
                            }`}
                          >
                            {variables.map((v) => (
                              <td key={v} className="px-2 py-1 font-mono tabular-nums">{a[v]}</td>
                            ))}
                            <td className="border-l border-[var(--border)] px-2 py-1 font-mono font-medium tabular-nums">{vectors.f[i]}</td>
                            <td className="px-2 py-1 font-mono font-medium tabular-nums">{vectors.g[i]}</td>
                            <td className="border-l border-[var(--border)] px-2 py-1">
                              {vectors.f[i] === vectors.g[i] ? (
                                <span className="text-emerald-700 dark:text-emerald-300" aria-label="Coincide">✓</span>
                              ) : (
                                <span className="text-rose-700 dark:text-rose-300" aria-label="Difiere">✕</span>
                              )}
                            </td>
                            {showXor ? (
                              <td className="px-2 py-1 font-mono tabular-nums">{vectors.xor[i]}</td>
                            ) : null}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  <ResultBox title="Coincidencias" value={comparison.matches} tone="ok" />
                  <ResultBox title="Diferencias" value={comparison.differences} tone={comparison.differences > 0 ? 'bad' : 'neutral'} />
                  <ResultBox
                    title="Equivalentes"
                    value={comparison.isEquivalent ? 'Sí' : 'No'}
                    tone={comparison.isEquivalent ? 'ok' : 'bad'}
                  />
                </div>

                <CompareVectorRow f={vectors.f} g={vectors.g} />

                <ControlsStack>
                  <ToggleRow label="Mostrar diferencia lógica (F⊕G)" checked={showXor} onChange={setShowXor} />
                </ControlsStack>
              </>
            ) : parseOk ? (
              <SectionCard title="Progreso del paso">
                <p className="text-sm text-[var(--fg-muted)]">
                  {activeStep < 2
                    ? `Variables detectadas: ${variables.join(', ') || '—'}`
                    : activeStep < 3
                      ? `${assignments.length} filas generadas (${variables.length} variables).`
                      : activeStep < 4
                        ? `Vector F: [${vectors.f.join(', ')}]`
                        : activeStep < 5
                          ? `Vector G: [${vectors.g.join(', ')}]`
                          : 'Listo para comparar.'}
                </p>
                {!showInputs ? null : (
                  <p className="mt-2 font-mono text-xs text-[var(--fg-muted)]">
                    {showFCol ? `F: [${vectors.f.join('')}]` : ''}
                    {showGCol ? ` · G: [${vectors.g.join('')}]` : ''}
                  </p>
                )}
                <ButtonRow>
                  <VizButton onClick={() => setActiveStep((s) => Math.min(5, s + 1))} disabled={activeStep >= 5}>
                    Siguiente paso
                  </VizButton>
                  {activeStep > 0 ? (
                    <VizButton onClick={() => setActiveStep(0)}>Reiniciar</VizButton>
                  ) : null}
                </ButtonRow>
              </SectionCard>
            ) : null}
          </div>
        ) : null}

        {tab === 'row' ? (
          <div className="space-y-3">
            <BitControls
              variables={variables.length > 0 ? variables : ['A', 'B']}
              assignment={currentAssignment}
              onChange={(v, bit) => {
                const next = { ...currentAssignment, [v]: bit };
                const idx = assignments.findIndex((a) => variables.every((x) => a[x] === next[x]));
                if (idx >= 0) setRowIndex(idx);
              }}
            />

            <div className="grid gap-2 sm:grid-cols-2">
              <ResultBox title="F en esta fila" value={parseOk ? rowF : '—'} />
              <ResultBox title="G en esta fila" value={parseOk ? rowG : '—'} />
            </div>

            <SectionCard>
              <p className="text-sm text-[var(--fg)]">
                {parseOk ? (
                  rowMatch ? (
                    <span className="text-emerald-700 dark:text-emerald-300">✓ Coinciden en esta fila</span>
                  ) : (
                    <span className="text-rose-700 dark:text-rose-300">✕ No coinciden en esta fila</span>
                  )
                ) : (
                  'Corrige las expresiones para evaluar.'
                )}
              </p>
              {parseOk && !comparison.isEquivalent && rowMatch ? (
                <p className="mt-1 text-xs text-[var(--fg-muted)]">
                  Nota: coincidir en una fila no implica equivalencia global.
                </p>
              ) : null}
            </SectionCard>

            <ButtonRow>
              <VizButton
                onClick={() => setRowIndex((i) => (i - 1 + assignments.length) % Math.max(assignments.length, 1))}
                disabled={!parseOk}
                aria-label="Fila anterior"
              >
                ← Anterior
              </VizButton>
              <span className="self-center text-sm text-[var(--fg-muted)]">
                Fila {assignments.length ? rowIndex + 1 : 0} / {assignments.length}
              </span>
              <VizButton
                onClick={() => setRowIndex((i) => (i + 1) % Math.max(assignments.length, 1))}
                disabled={!parseOk}
                aria-label="Fila siguiente"
              >
                Siguiente →
              </VizButton>
            </ButtonRow>
          </div>
        ) : null}

        {tab === 'identities' ? (
          <div className="space-y-3">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-[var(--fg-muted)]">Identidad preset</span>
              <select
                value={presetId}
                onChange={(e) => applyPreset(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
                aria-label="Seleccionar identidad booleana"
              >
                {EQUIVALENCE_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <SectionCard title="F">
                <p className="font-mono text-sm">{exprF}</p>
              </SectionCard>
              <SectionCard title="G">
                <p className="font-mono text-sm">{exprG}</p>
              </SectionCard>
            </div>

            {parseOk ? (
              <EquivalenceBadge equivalent={comparison.isEquivalent} />
            ) : null}

            <ButtonRow>
              <VizButton onClick={() => { setTab('compare'); setActiveStep(5); }}>
                Ver comparación completa
              </VizButton>
            </ButtonRow>
          </div>
        ) : null}

        <CollapsibleEdit label="Relación con tautologías" open={tautOpen} onToggle={() => setTautOpen((o) => !o)}>
          <p className="text-sm text-[var(--fg-muted)]">
            F ≡ G significa que F↔G es una tautología: la columna F⊕G es siempre 0.
            Si alguna fila tiene F⊕G = 1, esa fila es un contraejemplo.
          </p>
        </CollapsibleEdit>

        <CollapsibleEdit label="≡ vs ↔" open={equivOpen} onToggle={() => setEquivOpen((o) => !o)}>
          <p className="text-sm text-[var(--fg-muted)]">
            <span className="font-medium text-[var(--fg)]">≡</span> (equivalencia lógica) compara dos funciones
            completas. <span className="font-medium text-[var(--fg)]">↔</span> es un operador booleano que devuelve 1
            cuando dos bits de entrada son iguales en una sola fila.
          </p>
        </CollapsibleEdit>
      </div>
    </VizPanel>
  );
}
