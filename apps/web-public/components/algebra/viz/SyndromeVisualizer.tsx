'use client';

import { useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, VizButton, VizPanel, joinCaption } from './controls';
import {
  findMatchingColumn,
  HAMMING_74,
  multiplyMatrixVectorMod2,
  vectorToString,
  xorVectors,
  zeroWord,
  type BitVector,
} from './codingMath';
import { BitRow, MatrixDisplay, SectionCard, StatusPill } from './codingVizShared';
import { Badge, CollapsibleEdit, GuideBlock, Segmented } from './transformHelpers';

type Tab = 'syndrome' | 'checks' | 'locate';
type ErrorMode = 'single' | 'multiple';

const { H, n } = HAMMING_74;
const CODeword: BitVector = [0, 0, 0, 0, 0, 0, 0];

const IDEA =
  'Vas a ver cómo el síndrome resume qué comprobaciones de paridad incumple una palabra recibida.';
const TRY_IT =
  'Pruébalo — Introduce un error en un bit y observa qué columna de H aparece como síndrome. Para un único error, esa información permite localizarlo.';

export function SyndromeVisualizer() {
  const [codeword] = useState<BitVector>(CODeword);
  const [errorPositions, setErrorPositions] = useState<Set<number>>(new Set([2]));
  const [corrected, setCorrected] = useState(false);
  const [tab, setTab] = useState<Tab>('syndrome');
  const [errorMode, setErrorMode] = useState<ErrorMode>('single');
  const [showMatrix] = useState(true);
  const [derivOpen, setDerivOpen] = useState(false);

  const errorVector = useMemo(() => {
    const e = zeroWord(n);
    for (const p of errorPositions) e[p] = 1;
    return e;
  }, [errorPositions]);

  const receivedWord = useMemo(
    () => (corrected ? codeword : xorVectors(codeword, errorVector)),
    [codeword, errorVector, corrected],
  );

  const syndrome = useMemo(() => multiplyMatrixVectorMod2(H, receivedWord), [receivedWord]);
  const isZero = syndrome.every((s) => s === 0);
  const matchCol = findMatchingColumn(H, syndrome);
  const uiMatchPos = matchCol !== null ? matchCol + 1 : null;
  const activeErrors = errorPositions.size;

  const toggleError = (index: number) => {
    setCorrected(false);
    setErrorPositions((prev) => {
      const next = new Set(prev);
      if (errorMode === 'single') {
        if (next.has(index) && next.size === 1) return new Set();
        return new Set([index]);
      }
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const applyCorrection = () => {
    if (matchCol !== null && errorMode === 'single') setCorrected(true);
  };

  const resetCorrection = () => setCorrected(false);

  const syndromeAfter = corrected ? zeroWord(H.length) : syndrome;

  return (
    <VizPanel
      caption={joinCaption(
        `s=[${syndrome.join(',')}]`,
        uiMatchPos ? `posición ${uiMatchPos}` : isZero ? 'síndrome cero' : 'sin coincidencia',
      )}
    >
      <GuideBlock idea={IDEA} tryIt={TRY_IT} />

      <div className="mt-2 flex flex-wrap gap-2">
        <Badge tone="neutral">Hamming (7,4)</Badge>
        <Badge tone="neutral">Modo: {errorMode === 'single' ? 'un error' : 'múltiples'}</Badge>
      </div>

      <Segmented
        options={[
          { id: 'syndrome', label: 'Síndrome' },
          { id: 'checks', label: 'Comprobaciones' },
          { id: 'locate', label: 'Localizar error' },
        ]}
        value={tab}
        onChange={(id) => setTab(id as Tab)}
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SectionCard title="Palabra recibida · r">
          <BitRow
            word={receivedWord}
            onToggle={toggleError}
            highlightIndices={corrected ? undefined : errorPositions}
            toneForIndex={(i) => (errorPositions.has(i) && !corrected ? 'error' : 'neutral')}
          />
          {!corrected && activeErrors > 0 ? (
            <p className="mt-2 text-xs text-orange-600 dark:text-orange-400">
              {activeErrors === 1
                ? `Error introducido en la posición ${[...errorPositions][0]! + 1}.`
                : `${activeErrors} posiciones alteradas.`}
            </p>
          ) : null}
        </SectionCard>

        <SectionCard title="Síndrome · s = Hrᵀ">
          <div className="flex gap-2">
            {syndromeAfter.map((s, i) => (
              <span
                key={i}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border font-mono ${
                  s === 1
                    ? 'border-orange-500/60 bg-orange-500/15'
                    : 'border-emerald-700/40 bg-emerald-700/10'
                }`}
              >
                {s}
              </span>
            ))}
          </div>
          <StatusPill
            ok={isZero || corrected}
            okText="Síndrome cero · comprobaciones satisfechas"
            badText="Síndrome no nulo"
          />
          {matchCol !== null && !corrected && errorMode === 'single' ? (
            <p className="mt-2 text-sm">
              Coincide con la columna <strong>{uiMatchPos}</strong> de H.
            </p>
          ) : null}
          {matchCol !== null && errorMode === 'multiple' && activeErrors > 1 ? (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
              Este síndrome coincide con la columna {uiMatchPos}, pero hay {activeErrors} errores activos.
              Un decodificador de un solo error podría interpretarlo incorrectamente.
            </p>
          ) : null}
        </SectionCard>
      </div>

      {tab === 'checks' ? (
        <div className="mt-4 space-y-2">
          {H.map((row, i) => {
            const positions = row.map((v, j) => (v === 1 ? j : -1)).filter((j) => j >= 0);
            const vals = positions.map((p) => receivedWord[p] ?? 0);
            let res = 0;
            for (const v of vals) res ^= v;
            const ok = res === 0;
            return (
              <div
                key={i}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  ok ? 'border-emerald-700/30' : 'border-orange-500/40'
                }`}
              >
                <p className="font-medium">Comprobación {i + 1}</p>
                <p className="font-mono text-xs text-[var(--fg-muted)]">
                  posiciones {positions.map((p) => p + 1).join(', ')} → {vals.join(' ⊕ ')} = {res}
                </p>
                <p>{ok ? '✓ Satisfecha' : '✕ Incumplida'}</p>
              </div>
            );
          })}
        </div>
      ) : null}

      {tab === 'locate' && showMatrix ? (
        <div className="mt-4 overflow-x-auto">
          <p className="mb-2 text-xs font-medium text-[var(--fg-muted)]">Matriz H (columnas alineadas con posiciones)</p>
          <MatrixDisplay
            matrix={H}
            rowLabels={['P1', 'P2', 'P4']}
            colHighlight={matchCol}
          />
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {!corrected && matchCol !== null && errorMode === 'single' ? (
          <VizButton onClick={applyCorrection}>Corregir posición {uiMatchPos}</VizButton>
        ) : null}
        {corrected ? <VizButton onClick={resetCorrection}>Deshacer corrección</VizButton> : null}
      </div>

      <div className="mt-3">
        <ControlsStack>
        <Segmented
          options={[
            { id: 'single', label: 'Un error' },
            { id: 'multiple', label: 'Múltiples' },
          ]}
          value={errorMode}
          onChange={(id) => setErrorMode(id as ErrorMode)}
        />
        <ButtonRow>
          <VizButton onClick={() => { setErrorPositions(new Set()); setCorrected(false); }}>
            Sin error
          </VizButton>
          {[0, 2, 6].map((p) => (
            <VizButton
              key={p}
              onClick={() => {
                setErrorPositions(new Set([p]));
                setCorrected(false);
              }}
            >
              Error pos {p + 1}
            </VizButton>
          ))}
          <VizButton
            onClick={() => {
              setErrorPositions(new Set([0, 3]));
              setCorrected(false);
            }}
          >
            Dos errores
          </VizButton>
        </ButtonRow>
        </ControlsStack>
      </div>

      <CollapsibleEdit label="¿Por qué funciona?" open={derivOpen} onToggle={() => setDerivOpen((o) => !o)}>
        <div className="space-y-1 font-mono text-xs text-[var(--fg-muted)]">
          <p>r = c + e → s = Hrᵀ = H(c+e)ᵀ = Hcᵀ + Heᵀ = Heᵀ</p>
          <p>Si e = e_j, entonces s = h_j (columna j de H).</p>
        </div>
      </CollapsibleEdit>

      <p className="sr-only" aria-live="polite">
        Palabra {vectorToString(receivedWord)}. Síndrome {syndrome.join(',')}.
        {uiMatchPos ? ` Posible error único en posición ${uiMatchPos}.` : ''}
      </p>
    </VizPanel>
  );
}
