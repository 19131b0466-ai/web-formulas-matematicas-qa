'use client';

import { useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, VizButton, VizPanel, joinCaption } from './controls';
import {
  combineGeneratorRows,
  detectSystematicForm,
  generateAllCodewords,
  isValidCodeword,
  multiplyMessageByGenerator,
  rankMatrixGF2,
  TOY_CODE,
  vectorToString,
  verifyGeneratorParityCompatibility,
  type BitVector,
} from './codingMath';
import { ArrowDown, BitCell, MatrixDisplay, SectionCard, StatCard } from './codingVizShared';
import { Badge, BadgeRow, CollapsibleEdit, GuideBlock, Segmented } from './transformHelpers';

type Tab = 'generate' | 'rows' | 'code' | 'systematic';
type CalcMode = 'rows' | 'columns';

const { G, H, n, k } = TOY_CODE;

const IDEA =
  'Vas a ver cómo la matriz generadora convierte un mensaje de k símbolos en una palabra código de n símbolos.';
const TRY_IT =
  'Cambia los bits del mensaje y observa cómo cada 1 activa una fila de G. La suma de las filas seleccionadas produce la palabra código.';

export function GeneratorMatrixVisualizer() {
  const [message, setMessage] = useState<BitVector>([1, 0]);
  const [tab, setTab] = useState<Tab>('generate');
  const [calcMode, setCalcMode] = useState<CalcMode>('rows');
  const [hOpen, setHOpen] = useState(false);

  const codeword = useMemo(() => multiplyMessageByGenerator(message, G), [message]);
  const byRows = useMemo(() => combineGeneratorRows(message, G), [message]);
  const allCodewords = useMemo(() => generateAllCodewords(G), []);
  const systematic = useMemo(() => detectSystematicForm(G), []);
  const rankG = rankMatrixGF2(G);
  const ghOk = verifyGeneratorParityCompatibility(G, H);
  const hValid = isValidCodeword(H, codeword);

  const toggleMsg = (i: number) => {
    setMessage((prev) => {
      const next = [...prev] as BitVector;
      next[i] = (1 - (next[i] ?? 0)) as 0 | 1;
      return next;
    });
  };

  const presets: BitVector[] = [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ];

  return (
    <VizPanel caption={joinCaption(`c=[${codeword.join(',')}]`, `[${n},${k}]`)}>
      <GuideBlock idea={IDEA} tryIt={TRY_IT} />

      <BadgeRow>
        <Badge tone="neutral">F₂</Badge>
        <Badge tone="neutral">G: {k}×{n}</Badge>
        <Badge tone="neutral">rank(G)={rankG}</Badge>
      </BadgeRow>

      <div className="mt-3">
        <Segmented
          options={[
            { id: 'generate', label: 'Generar' },
            { id: 'rows', label: 'Ver filas' },
            { id: 'code', label: 'Código completo' },
            { id: 'systematic', label: 'Forma sistemática' },
          ]}
          value={tab}
          onChange={(id) => setTab(id as Tab)}
        />
      </div>

      {tab === 'generate' ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <SectionCard title="Mensaje · m">
              <div className="flex gap-2">
                {message.map((b, i) => (
                  <BitCell
                    key={i}
                    value={b}
                    onClick={() => toggleMsg(i)}
                    label={`m${sub(i + 1)}`}
                    tone={b === 1 ? 'info' : 'neutral'}
                  />
                ))}
              </div>
            </SectionCard>
            <ArrowDown label="× G" />
            <SectionCard title="Matriz G">
              <MatrixDisplay matrix={G} rowLabels={['g₁', 'g₂']} />
            </SectionCard>
            <ArrowDown label={calcMode === 'rows' ? 'combinar filas' : 'por columnas'} />
            <Segmented
              options={[
                { id: 'rows', label: 'Por filas' },
                { id: 'columns', label: 'Por columnas' },
              ]}
              value={calcMode}
              onChange={(id) => setCalcMode(id as CalcMode)}
            />
            {calcMode === 'rows' ? (
              <div className="space-y-3 text-sm font-mono">
                {message[0] === 1 ? (
                  <p className="text-emerald-800 dark:text-emerald-300">1·g₁ = [{G[0]!.join(', ')}] activa</p>
                ) : (
                  <p className="opacity-50">0·g₁ inactiva</p>
                )}
                {message[1] === 1 ? (
                  <p className="text-emerald-800 dark:text-emerald-300">1·g₂ = [{G[1]!.join(', ')}] activa</p>
                ) : (
                  <p className="opacity-50">0·g₂ inactiva</p>
                )}
                <p>c = {message[0]}·g₁ ⊕ {message[1]}·g₂ = [{byRows.join(', ')}]</p>
              </div>
            ) : (
              <p className="font-mono text-sm">
                c_j = Σ m_i g_ij (mod 2) → c = [{codeword.join(', ')}]
              </p>
            )}
          </div>
          <div className="space-y-3">
            <SectionCard title="Palabra código · c = mG">
              <div className="flex gap-1">
                {codeword.map((b, i) => (
                  <BitCell key={i} value={b} tone="info" label={`c${sub(i + 1)}`} />
                ))}
              </div>
              <p className="mt-2 text-sm text-[var(--fg-muted)]">
                {k} bits de información → {n} bits codificados
              </p>
            </SectionCard>
            {ghOk ? (
              <SectionCard title="Comprobación H">
                <p className="font-mono text-sm">Hcᵀ = 0</p>
                <Badge tone={hValid ? 'ok' : 'bad'}>{hValid ? '✓ Palabra válida' : '✕ No válida'}</Badge>
              </SectionCard>
            ) : null}
          </div>
        </div>
      ) : null}

      {tab === 'rows' ? (
        <div className="mt-4 space-y-3">
          {G.map((row, i) => (
            <SectionCard key={i} title={`g${sub(i + 1)} = [${row.join(', ')}]`}>
              <p className="text-sm text-[var(--fg-muted)]">
                Se obtiene con e{sub(i + 1)} = {i === 0 ? '[1,0]' : '[0,1]'} → eG = g{sub(i + 1)}
              </p>
            </SectionCard>
          ))}
        </div>
      ) : null}

      {tab === 'code' ? (
        <div className="mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--fg-muted)]">
                <th className="pb-2">Mensaje</th>
                <th className="pb-2">Palabra código</th>
              </tr>
            </thead>
            <tbody>
              {presets.map((m) => (
                <tr key={m.join('')} className="font-mono">
                  <td className="py-1">{vectorToString(m)}</td>
                  <td className="py-1">{vectorToString(multiplyMessageByGenerator(m, G))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-[var(--fg-muted)]">
            C = {'{'} {allCodewords.map(vectorToString).join(', ')} {'}'}
          </p>
        </div>
      ) : null}

      {tab === 'systematic' && systematic.isSystematic ? (
        <div className="mt-4 space-y-2">
          <p className="text-sm">G = [I₂ | P] con P = [[1],[1]]</p>
          <p className="font-mono text-sm">
            c = [m₁, m₂, m₁⊕m₂] = [{codeword.join(', ')}]
          </p>
          <div className="flex gap-2">
            <BitCell value={message[0]!} tone="info" label="info" />
            <BitCell value={message[1]!} tone="info" label="info" />
            <BitCell value={codeword[2]!} tone="parity" label="paridad" />
          </div>
        </div>
      ) : tab === 'systematic' ? (
        <p className="mt-4 text-sm text-[var(--fg-muted)]">G no está en forma sistemática estándar.</p>
      ) : null}

      <div className="mt-4">
        <ControlsStack>
        <ButtonRow>
          {presets.map((m) => (
            <VizButton key={m.join('')} active={message[0] === m[0] && message[1] === m[1]} onClick={() => setMessage(m)}>
              m={vectorToString(m)}
            </VizButton>
          ))}
        </ButtonRow>
        <CollapsibleEdit label="¿Cómo se relaciona con H?" open={hOpen} onToggle={() => setHOpen((o) => !o)}>
        <p className="text-sm text-[var(--fg-muted)]">
          G construye palabras. H comprueba restricciones. HGᵀ = 0.
          {ghOk ? ' Verificado.' : ' No verificado.'}
        </p>
      </CollapsibleEdit>
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

function sub(n: number): string {
  const subs = '₀₁₂₃₄₅₆₇₈₉';
  return String(n)
    .split('')
    .map((d) => subs[Number(d)] ?? d)
    .join('');
}
