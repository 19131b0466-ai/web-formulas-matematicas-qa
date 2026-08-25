'use client';

import { useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, VizButton, VizPanel, joinCaption } from './controls';
import {
  enumerateKernel,
  enumerateVectorSpace,
  evaluateParityChecks,
  isValidCodeword,
  multiplyMessageByGenerator,
  TOY_CODE,
  vectorToString,
  verifyGeneratorParityCompatibility,
  type BitVector,
} from './codingMath';
import { BitRow, MatrixDisplay, SectionCard, StatusPill, StatCard } from './codingVizShared';
import { Badge, CollapsibleEdit, GuideBlock, Segmented, BadgeRow } from './transformHelpers';

type Tab = 'check' | 'matrix' | 'valid' | 'generator';

const { H, G, n, k } = TOY_CODE;
const DEFAULT_WORD: BitVector = [1, 0, 1];

const IDEA =
  'Vas a ver cómo cada fila de H define una comprobación de paridad. Una palabra código es válida cuando todas dan cero.';
const TRY_IT =
  'Cambia los bits de la palabra y observa qué comprobaciones se cumplen, cuáles fallan y cómo cambia el síndrome.';

export function ParityCheckMatrixVisualizer() {
  const [word, setWord] = useState<BitVector>([...DEFAULT_WORD]);
  const [tab, setTab] = useState<Tab>('check');
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const [hoverRow, setHoverRow] = useState<number | null>(null);
  const [ghOpen, setGhOpen] = useState(false);
  const [msg, setMsg] = useState<BitVector>([1, 0]);

  const checks = useMemo(() => evaluateParityChecks(H, word), [word]);
  const syndrome = useMemo(() => checks.map((c) => c.result), [checks]);
  const valid = isValidCodeword(H, word);
  const failed = checks.filter((c) => c.result === 1).length;

  const allWords = useMemo(() => enumerateVectorSpace(2, n, 16), []);
  const validWords = useMemo(() => enumerateKernel(H, 2, 16), []);
  const ghOk = verifyGeneratorParityCompatibility(G, H);

  const toggleBit = (index: number) => {
    setWord((prev) => {
      const next = [...prev] as BitVector;
      next[index] = (1 - (next[index] ?? 0)) as 0 | 1;
      return next;
    });
  };

  const generateFromG = () => {
    const c = multiplyMessageByGenerator(msg, G);
    setWord(c);
  };

  return (
    <VizPanel caption={joinCaption(`s=[${syndrome.join(',')}]`, valid ? 'válida' : 'no válida')}>
      <GuideBlock idea={IDEA} tryIt={TRY_IT} />

      <BadgeRow>
        <Badge tone="neutral">F₂</Badge>
        <Badge tone="neutral">H: {H.length}×{n}</Badge>
        {!ghOk ? <Badge tone="warn">HGᵀ ≠ 0</Badge> : null}
      </BadgeRow>

      <div className="mt-3">
        <Segmented
        options={[
          { id: 'check', label: 'Comprobar' },
          { id: 'matrix', label: 'Ver H' },
          { id: 'valid', label: 'Palabras válidas' },
          { id: 'generator', label: 'Relación con G' },
        ]}
        value={tab}
        onChange={(id) => setTab(id as Tab)}
      />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SectionCard title="Palabra · r">
          <BitRow word={word} onToggle={toggleBit} />
          <p className="mt-1 font-mono text-xs text-[var(--fg-muted)]">{vectorToString(word)}</p>
        </SectionCard>

        <SectionCard title="Resultado">
          <StatusPill
            ok={valid}
            okText="✓ Pertenece al código · Hrᵀ = 0"
            badText={`${failed} comprobación(es) incumplida(s)`}
          />
          <p className="mt-2 font-mono text-sm">s = [{syndrome.join(', ')}]ᵀ</p>
        </SectionCard>
      </div>

      {tab === 'check' ? (
        <div className="mt-4 space-y-2">
          {checks.map((c) => (
            <div
              key={c.rowIndex}
              className={`rounded-lg border px-3 py-2 ${
                c.result === 0 ? 'border-emerald-700/30' : 'border-orange-500/40'
              }`}
            >
              <p className="text-sm font-medium">Comprobación {c.rowIndex + 1}</p>
              <p className="font-mono text-xs text-[var(--fg-muted)]">
                posiciones {c.participatingPositions.map((p) => p + 1).join(', ')} →{' '}
                {c.values.join(' ⊕ ')} = {c.result}
              </p>
              <p className="text-sm">{c.result === 0 ? '✓ Satisfecha' : '✕ Incumplida'}</p>
            </div>
          ))}
          {H.length === 1 ? (
            <p className="text-xs text-[var(--fg-muted)]">
              Esta H exige paridad par: c₁ ⊕ c₂ ⊕ c₃ = 0, es decir c₁ = c₂ = c₃.
            </p>
          ) : null}
        </div>
      ) : null}

      {tab === 'matrix' ? (
        <div className="mt-4 overflow-x-auto">
          <MatrixDisplay
            matrix={H}
            rowLabels={H.map((_, i) => `f${i + 1}`)}
            colHighlight={hoverCol}
            rowHighlight={hoverRow}
            onColHover={setHoverCol}
            onRowHover={setHoverRow}
          />
          {hoverCol !== null ? (
            <p className="mt-2 text-xs text-[var(--fg-muted)]">
              Posición {hoverCol + 1} participa en las comprobaciones donde h_ij = 1.
            </p>
          ) : null}
        </div>
      ) : null}

      {tab === 'valid' ? (
        <div className="mt-4">
          <div className="mb-3 grid grid-cols-3 gap-2">
            <StatCard label="Espacio" value={`2³ = ${allWords.length}`} />
            <StatCard label="Válidas" value={validWords.length} />
            <StatCard label="Dimensión" value={`k = ${k}`} />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {allWords.map((w) => {
              const ok = validWords.some((v) => vectorToString(v) === vectorToString(w));
              return (
                <button
                  key={vectorToString(w)}
                  type="button"
                  onClick={() => setWord(w)}
                  className={`rounded-lg border px-2 py-2 font-mono text-sm ${
                    ok
                      ? 'border-emerald-700/40 bg-emerald-700/10'
                      : 'border-[var(--border)] opacity-60'
                  }`}
                >
                  {vectorToString(w)} {ok ? '✓' : '✕'}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-[var(--fg-muted)]">C = ker(H) = {'{000, 011, 101, 110}'}</p>
        </div>
      ) : null}

      {tab === 'generator' ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-[var(--fg-muted)]">m → G → c = mG → Hcᵀ = 0</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs">m =</span>
            {msg.map((b, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  const next = [...msg] as BitVector;
                  next[i] = (1 - (next[i] ?? 0)) as 0 | 1;
                  setMsg(next);
                }}
                className="h-8 w-8 rounded border border-[var(--border)] font-mono text-sm"
              >
                {b}
              </button>
            ))}
            <VizButton onClick={generateFromG}>Generar palabra válida</VizButton>
          </div>
          <p className="font-mono text-sm">c = mG = [{multiplyMessageByGenerator(msg, G).join(', ')}]</p>
        </div>
      ) : null}

      <div className="mt-4">
        <ControlsStack>
        <ButtonRow>
          <VizButton onClick={() => setWord([0, 0, 0])}>000 · válida</VizButton>
          <VizButton onClick={() => setWord([0, 1, 1])}>011 · válida</VizButton>
          <VizButton onClick={() => setWord([1, 0, 1])}>101 · no válida</VizButton>
          <VizButton onClick={() => setWord([1, 1, 0])}>110 · válida</VizButton>
          <VizButton onClick={() => setWord([...DEFAULT_WORD])}>Restablecer 101</VizButton>
        </ButtonRow>
        <CollapsibleEdit label="¿Cómo se relaciona con G?" open={ghOpen} onToggle={() => setGhOpen((o) => !o)}>
        <p className="text-sm text-[var(--fg-muted)]">
          G construye palabras del código. H comprueba restricciones. Debe cumplirse HGᵀ = 0.
          {ghOk ? ' ✓ Verificado para este ejemplo.' : ' ⚠ Inconsistencia detectada.'}
        </p>
      </CollapsibleEdit>
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
