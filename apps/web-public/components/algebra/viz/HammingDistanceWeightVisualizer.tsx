'use client';

import { useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, VizButton, VizPanel, joinCaption } from './controls';
import {
  getMismatchIndices,
  hammingDistance,
  hammingWeight,
  parseBinaryWord,
  vectorToString,
  xorWords,
  zeroWord,
  type BitVector,
} from './codingMath';
import { BitCell, BitRow, CompareIndicator, SectionCard, StackedSlider, StatCard } from './codingVizShared';
import { CollapsibleEdit, GuideBlock, Segmented } from './transformHelpers';

type Tab = 'distance' | 'weight' | 'xor';

const PRESETS = [
  { x: '101101', y: '101101', label: 'Iguales' },
  { x: '101101', y: '101001', label: '1 dif' },
  { x: '0000000', y: '0001011', label: '3 dif' },
  { x: '0000000', y: '1111111', label: 'Máx' },
];

const IDEA =
  'Vas a ver cómo la distancia de Hamming cuenta posición por posición dónde dos palabras son distintas, y cómo el peso cuenta sus símbolos no nulos.';
const TRY_IT =
  'Cambia los bits de x e y: las diferencias se resaltan y la distancia se actualiza al instante.';

export function HammingDistanceWeightVisualizer() {
  const [length, setLength] = useState(7);
  const [x, setX] = useState<BitVector>([0, 0, 0, 0, 0, 0, 0]);
  const [y, setY] = useState<BitVector>([0, 0, 0, 1, 0, 1, 1]);
  const [tab, setTab] = useState<Tab>('distance');
  const [weightTarget, setWeightTarget] = useState<'x' | 'y'>('y');
  const [propsOpen, setPropsOpen] = useState(false);

  const distance = hammingDistance(x, y);
  const mismatches = getMismatchIndices(x, y);
  const matches = length - mismatches.length;
  const weightX = hammingWeight(x);
  const weightY = hammingWeight(y);
  const xorWord = xorWords(x, y);
  const weightXor = hammingWeight(xorWord);
  const zero = zeroWord(length);

  const mismatchSet = useMemo(() => new Set(mismatches), [mismatches]);

  const resize = (n: number) => {
    setLength(n);
    setX((prev) => {
      const next = [...prev];
      while (next.length < n) next.unshift(0);
      return next.slice(-n) as BitVector;
    });
    setY((prev) => {
      const next = [...prev];
      while (next.length < n) next.unshift(0);
      return next.slice(-n) as BitVector;
    });
  };

  const toggleBit = (word: 'x' | 'y', index: number) => {
    const setter = word === 'x' ? setX : setY;
    setter((prev) => {
      const next = [...prev] as BitVector;
      next[index] = (1 - (next[index] ?? 0)) as 0 | 1;
      return next;
    });
  };

  const swap = () => {
    setX(y);
    setY(x);
  };

  const mismatchHuman = mismatches.map((i) => i + 1).join(', ');

  return (
    <VizPanel caption={joinCaption(`d_H=${distance}`, `${distance} de ${length} posiciones`)}>
      <GuideBlock idea={IDEA} tryIt={TRY_IT} />

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Longitud" value={`n = ${length}`} />
        <StatCard label="Coinciden" value={matches} />
        <StatCard label="Difieren" value={distance} />
        <StatCard label="d_H(x,y)" value={distance} />
      </div>

      <div className="mt-5">
        <Segmented
        options={[
          { id: 'distance', label: 'Distancia' },
          { id: 'weight', label: 'Peso' },
          { id: 'xor', label: 'XOR' },
        ]}
        value={tab}
        onChange={(id) => setTab(id as Tab)}
        />
      </div>

      {tab === 'distance' ? (
        <div className="mt-4 space-y-2">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full space-y-1.5">
              <PositionLabels n={length} />
              <div className="flex items-center gap-1.5">
                <span className="w-6 text-xs text-[var(--fg-muted)]">x</span>
                {x.map((b, i) => (
                  <BitCell
                    key={i}
                    value={b}
                    onClick={() => toggleBit('x', i)}
                    tone={mismatchSet.has(i) ? 'mismatch' : 'match'}
                    title={`Posición ${i + 1}: x=${b}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1.5 py-1">
                <span className="w-6" />
                {x.map((_, i) => (
                  <CompareIndicator key={i} same={!mismatchSet.has(i)} />
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-6 text-xs text-[var(--fg-muted)]">y</span>
                {y.map((b, i) => (
                  <BitCell
                    key={i}
                    value={b}
                    onClick={() => toggleBit('y', i)}
                    tone={mismatchSet.has(i) ? 'mismatch' : 'match'}
                    title={`Posición ${i + 1}: y=${b}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <p className="font-mono text-lg font-semibold">d_H(x, y) = {distance}</p>
          {distance > 0 ? (
            <p className="text-sm text-[var(--fg-muted)]">
              Difieren en las posiciones {mismatchHuman || '—'}.
            </p>
          ) : (
            <p className="text-sm text-[var(--fg-muted)]">Las palabras son idénticas.</p>
          )}
        </div>
      ) : null}

      {tab === 'weight' ? (
        <div className="mt-4 space-y-4">
          <Segmented
            options={[
              { id: 'x', label: 'Peso de x' },
              { id: 'y', label: 'Peso de y' },
            ]}
            value={weightTarget}
            onChange={(id) => setWeightTarget(id as 'x' | 'y')}
          />
          {(() => {
            const w = weightTarget === 'x' ? x : y;
            const wt = weightTarget === 'x' ? weightX : weightY;
            return (
              <>
                <BitRow
                  word={w}
                  label={weightTarget}
                  onToggle={(i) => toggleBit(weightTarget, i)}
                  toneForIndex={(i) => (w[i] === 1 ? 'info' : 'neutral')}
                />
                <p className="font-mono text-lg">w_H({weightTarget}) = {wt}</p>
                <p className="text-sm text-[var(--fg-muted)]">
                  {wt} coordenadas no nulas (en binario: {wt} unos).
                </p>
                <SectionCard title="Comparar con vector cero">
                  <BitRow word={w} label={weightTarget} toneForIndex={(i) => (w[i] === 1 ? 'mismatch' : 'match')} />
                  <BitRow word={zero} label="0" />
                  <p className="mt-2 font-mono text-sm">
                    w_H({weightTarget}) = d_H({weightTarget}, 0) = {hammingDistance(w, zero)}
                  </p>
                </SectionCard>
              </>
            );
          })()}
        </div>
      ) : null}

      {tab === 'xor' ? (
        <div className="mt-4 space-y-2">
          <BitRow word={x} label="x" />
          <BitRow word={y} label="y" />
          <div className="border-t border-[var(--border)] pt-2">
            <BitRow
              word={xorWord}
              label="x ⊕ y"
              toneForIndex={(i) => (xorWord[i] === 1 ? 'mismatch' : 'neutral')}
            />
          </div>
          <p className="font-mono text-sm">w_H(x ⊕ y) = {weightXor}</p>
          <p className="font-mono text-sm font-semibold text-[var(--accent-strong)]">
            d_H(x, y) = w_H(x ⊕ y) = {distance}
          </p>
          <p className="text-xs text-[var(--fg-muted)]">
            0⊕0=0, 1⊕1=0, 0⊕1=1, 1⊕0=1 — XOR vale 1 exactamente donde difieren.
          </p>
        </div>
      ) : null}

      <ControlsStack>
          <StackedSlider label="Longitud n" value={length} min={4} max={16} step={1} onChange={resize} />
          <ButtonRow>
            <VizButton onClick={swap}>Intercambiar x ↔ y</VizButton>
            {PRESETS.map((p) => (
              <VizButton
                key={p.label}
                onClick={() => {
                  resize(Math.max(p.x.length, p.y.length));
                  setX(parseBinaryWord(p.x, length));
                  setY(parseBinaryWord(p.y, length));
                }}
              >
                {p.label}
              </VizButton>
            ))}
          </ButtonRow>
        <CollapsibleEdit label="Propiedades" open={propsOpen} onToggle={() => setPropsOpen((o) => !o)}>
        <ul className="list-inside list-disc space-y-1 text-sm text-[var(--fg-muted)]">
          <li>d_H(x,y) ≥ 0</li>
          <li>d_H(x,y) = 0 ⇔ x = y</li>
          <li>d_H(x,y) = d_H(y,x)</li>
        </ul>
      </CollapsibleEdit>
      </ControlsStack>

      <p className="sr-only" aria-live="polite">
        x = {vectorToString(x)}, y = {vectorToString(y)}, distancia {distance}.
      </p>
    </VizPanel>
  );
}

function PositionLabels({ n }: { n: number }) {
  return (
    <div className="mb-2 flex gap-1.5 pl-6">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="flex h-10 w-10 items-center justify-center text-[10px] text-[var(--fg-muted)]">
          {i + 1}
        </span>
      ))}
    </div>
  );
}
