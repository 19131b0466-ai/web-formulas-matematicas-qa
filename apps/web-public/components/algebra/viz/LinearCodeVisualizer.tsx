'use client';

import { useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, VizButton, VizPanel, joinCaption } from './controls';
import {
  addVectorsGF2,
  computeDimension,
  enumerateVectorSpace,
  generateAllCodewords,
  scalarMultiplyVector,
  TOY_CODE,
  vectorToString,
  verifyLinearSubspace,
  type BitVector,
} from './codingMath';
import { BitCell, SectionCard, StatCard } from './codingVizShared';
import { Badge, CollapsibleEdit, GuideBlock, Segmented } from './transformHelpers';

type Tab = 'code' | 'closure' | 'generation' | 'properties';
type ClosureMode = 'sum' | 'scalar';

const { G, n, k, q } = TOY_CODE;

const IDEA =
  'Vas a ver por qué un código lineal es un subespacio: contiene el vector cero y permanece cerrado al sumar palabras y multiplicarlas por escalares.';
const TRY_IT =
  'Pruébalo — Selecciona dos palabras del código y súmalas. El resultado seguirá perteneciendo a C.';

export function LinearCodeVisualizer() {
  const [tab, setTab] = useState<Tab>('code');
  const [left, setLeft] = useState<BitVector | null>([1, 0, 1]);
  const [right, setRight] = useState<BitVector | null>([0, 1, 1]);
  const [scalar, setScalar] = useState<0 | 1>(1);
  const [scalarWord, setScalarWord] = useState<BitVector | null>([1, 0, 1]);
  const [closureMode, setClosureMode] = useState<ClosureMode>('sum');
  const [experiment, setExperiment] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);

  const codewords = useMemo(() => generateAllCodewords(G), []);
  const ambient = useMemo(() => enumerateVectorSpace(q, n, 16), [q, n]);
  const codewordSet = useMemo(() => new Set(codewords.map(vectorToString)), [codewords]);
  const dim = computeDimension(codewords);
  const isLinear = verifyLinearSubspace(codewords, q);

  const sumResult = left && right ? addVectorsGF2(left, right) : null;
  const scalarResult = scalarWord ? scalarMultiplyVector(scalar, scalarWord) : null;
  const sumInC = sumResult ? codewordSet.has(vectorToString(sumResult)) : false;
  const scalarInC = scalarResult ? codewordSet.has(vectorToString(scalarResult)) : false;

  const displayCodewords = experiment
    ? codewords.filter((w) => vectorToString(w) !== '110')
    : codewords;

  return (
    <VizPanel caption={joinCaption(`C ⊂ F₂³`, `|C|=${displayCodewords.length}`, `dim=${dim}`)}>
      <GuideBlock idea={IDEA} tryIt={TRY_IT} />

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatCard label="Espacio" value="F₂³" subtitle={`${ambient.length} vectores`} />
        <StatCard label="Código C" value={displayCodewords.length} subtitle="palabras" />
        <StatCard label="Dimensión" value={`k = ${dim}`} />
        <StatCard label="[n,k]₂" value={`[${n},${k}]`} />
      </div>

      <Segmented
        options={[
          { id: 'code', label: 'Código' },
          { id: 'closure', label: 'Comprobar cierre' },
          { id: 'generation', label: 'Generación' },
          { id: 'properties', label: 'Propiedades' },
        ]}
        value={tab}
        onChange={(id) => setTab(id as Tab)}
      />

      {tab === 'code' ? (
        <div className="mt-4">
          <p className="mb-2 text-xs text-[var(--fg-muted)]">Todas las palabras de F₂³</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ambient.map((w) => {
              const inC = codewordSet.has(vectorToString(w)) && (!experiment || vectorToString(w) !== '110');
              return (
                <button
                  key={vectorToString(w)}
                  type="button"
                  onClick={() => inC && setLeft(w)}
                  className={`rounded-lg border px-2 py-2 text-center ${
                    inC
                      ? 'border-emerald-700/50 bg-emerald-700/10'
                      : 'border-[var(--border)] opacity-50'
                  }`}
                >
                  <div className="flex justify-center gap-0.5">
                    {w.map((b, i) => (
                      <BitCell key={i} value={b} size="sm" />
                    ))}
                  </div>
                  <p className="mt-1 font-mono text-xs">{vectorToString(w)}</p>
                  <p className="text-[10px]">{inC ? '✓ En C' : '○ Fuera'}</p>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {tab === 'closure' ? (
        <div className="mt-4 space-y-4">
          <Segmented
            options={[
              { id: 'sum', label: 'Suma' },
              { id: 'scalar', label: 'Escalar' },
            ]}
            value={closureMode}
            onChange={(id) => setClosureMode(id as ClosureMode)}
          />
          {closureMode === 'sum' ? (
            <>
              <p className="text-sm text-[var(--fg-muted)]">Elige dos palabras de C:</p>
              <div className="flex flex-wrap gap-2">
                {displayCodewords.map((w) => (
                  <VizButton
                    key={`l-${vectorToString(w)}`}
                    active={left !== null && vectorToString(left) === vectorToString(w)}
                    onClick={() => setLeft(w)}
                  >
                    {vectorToString(w)}
                  </VizButton>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {displayCodewords.map((w) => (
                  <VizButton
                    key={`r-${vectorToString(w)}`}
                    active={right !== null && vectorToString(right) === vectorToString(w)}
                    onClick={() => setRight(w)}
                  >
                    {vectorToString(w)}
                  </VizButton>
                ))}
              </div>
              {left && right ? (
                <SectionCard title="Suma en F₂">
                  <p className="font-mono text-sm">
                    {vectorToString(left)} ⊕ {vectorToString(right)} = {vectorToString(sumResult!)}
                  </p>
                  <Badge tone={sumInC ? 'ok' : 'warn'}>
                    {sumInC ? '✓ Permanece en C' : '✕ Sale del conjunto'}
                  </Badge>
                </SectionCard>
              ) : null}
            </>
          ) : (
            <>
              <p className="text-sm">α ∈ F₂:</p>
              <ButtonRow>
                <VizButton active={scalar === 0} onClick={() => setScalar(0)}>α = 0</VizButton>
                <VizButton active={scalar === 1} onClick={() => setScalar(1)}>α = 1</VizButton>
              </ButtonRow>
              <div className="flex flex-wrap gap-2">
                {displayCodewords.map((w) => (
                  <VizButton
                    key={vectorToString(w)}
                    active={scalarWord !== null && vectorToString(scalarWord) === vectorToString(w)}
                    onClick={() => setScalarWord(w)}
                  >
                    {vectorToString(w)}
                  </VizButton>
                ))}
              </div>
              {scalarWord ? (
                <SectionCard title="Producto por escalar">
                  <p className="font-mono text-sm">
                    {scalar}·{vectorToString(scalarWord)} = {vectorToString(scalarResult!)}
                  </p>
                  <Badge tone={scalarInC ? 'ok' : 'warn'}>{scalarInC ? '✓ En C' : '✕ Fuera'}</Badge>
                </SectionCard>
              ) : null}
            </>
          )}
          <VizButton onClick={() => setExperiment((e) => !e)}>
            {experiment ? 'Restaurar C completo' : 'Romper el cierre (quitar 110)'}
          </VizButton>
        </div>
      ) : null}

      {tab === 'generation' ? (
        <div className="mt-4 space-y-2">
          <p className="text-sm">g₁ = {vectorToString(G[0] as BitVector)} · g₂ = {vectorToString(G[1] as BitVector)}</p>
          <p className="text-sm text-[var(--fg-muted)]">C = span{'{g₁, g₂}'}</p>
          <div className="grid grid-cols-2 gap-2 font-mono text-sm">
            <span>0·g₁ ⊕ 0·g₂ → 000</span>
            <span>1·g₁ ⊕ 0·g₂ → 101</span>
            <span>0·g₁ ⊕ 1·g₂ → 011</span>
            <span>1·g₁ ⊕ 1·g₂ → 110</span>
          </div>
        </div>
      ) : null}

      {tab === 'properties' ? (
        <div className="mt-4 space-y-2 text-sm">
          <p>{codewordSet.has('000') ? '✓' : '✕'} Contiene 000</p>
          <p>{verifyLinearSubspace(codewords) ? '✓' : '✕'} Cerrado bajo suma</p>
          <p>{verifyLinearSubspace(codewords) ? '✓' : '✕'} Cerrado bajo escalares</p>
          <p>✓ dim(C) = {dim}</p>
          <p>✓ |C| = {codewords.length} = 2^{dim}</p>
          <Badge tone={isLinear ? 'ok' : 'warn'}>
            {isLinear ? 'C es un subespacio de F₂³' : 'No es subespacio'}
          </Badge>
        </div>
      ) : null}

      <CollapsibleEdit label="¿Por qué hay cuatro palabras?" open={cardOpen} onToggle={() => setCardOpen((o) => !o)}>
        <p className="text-sm text-[var(--fg-muted)]">
          dim(C) = {dim}, por tanto |C| = 2^{dim} = {codewords.length} sobre F₂.
        </p>
      </CollapsibleEdit>
    </VizPanel>
  );
}
