'use client';

import { useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, VizButton, VizPanel, joinCaption } from './controls';
import {
  correctableErrors,
  detectableErrors,
  generateWordsWithinRadius,
  hammingDistance,
  type BitVector,
} from './codingMath';
import { BitCell, SectionCard, StackedSlider, StatCard } from './codingVizShared';
import { Badge, CollapsibleEdit, GuideBlock, Segmented } from './transformHelpers';

type Tab = 'separation' | 'detection' | 'correction';
type Mode = 'general' | 'binary';

const BINARY_C1: BitVector = [0, 0, 0];

const IDEA =
  'Vas a ver cómo la separación mínima entre palabras código determina cuántos errores podemos detectar y corregir con garantía.';
const TRY_IT =
  'Cambia d_min y observa cómo cambian el número de errores detectables y el radio de corrección.';

export function MinimumDistanceVisualizer() {
  const [dMin, setDMin] = useState(3);
  const [tab, setTab] = useState<Tab>('separation');
  const [mode, setMode] = useState<Mode>('general');
  const [errorCount, setErrorCount] = useState(1);
  const [flipPositions, setFlipPositions] = useState<Set<number>>(new Set([2]));
  const [receivedSel, setReceivedSel] = useState<string>('001');
  const [derivOpen, setDerivOpen] = useState(false);
  const [patternOpen, setPatternOpen] = useState(false);

  const detect = detectableErrors(dMin);
  const correct = correctableErrors(dMin);

  const transmitted: BitVector = BINARY_C1;
  const received = useMemo(() => {
    let r: BitVector = [...transmitted];
    for (const p of flipPositions) r = r.map((b, i) => (i === p ? ((1 - b) as 0 | 1) : b)) as BitVector;
    return r;
  }, [flipPositions]);

  const dist = hammingDistance(transmitted, received);
  const detectionOk = errorCount <= detect;
  const correctionOk = errorCount <= correct;

  const ball0 = useMemo(() => generateWordsWithinRadius([0, 0, 0], correct), [correct]);
  const ball1 = useMemo(() => generateWordsWithinRadius([1, 1, 1], correct), [correct]);

  const recWord = useMemo(() => {
    const bits = receivedSel.padEnd(3, '0').slice(0, 3).split('').map(Number) as BitVector;
    return bits;
  }, [receivedSel]);

  const dTo0 = hammingDistance(recWord, [0, 0, 0]);
  const dTo1 = hammingDistance(recWord, [1, 1, 1]);
  const decodeAs = dTo0 <= dTo1 ? '000' : '111';

  return (
    <VizPanel caption={joinCaption(`d_min=${dMin}`, `detecta ${detect}`, `corrige ${correct}`)}>
      <GuideBlock idea={IDEA} tryIt={TRY_IT} />

      <div className="mt-5 grid grid-cols-3 gap-3">
        <StatCard label="Distancia mínima" value={`d_min = ${dMin}`} />
        <StatCard label="Detección" value={`d_min−1 = ${detect}`} subtitle="errores garantizados" />
        <StatCard label="Corrección" value={`t = ${correct}`} subtitle={`⌊(${dMin}−1)/2⌋`} />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Segmented
          options={[
            { id: 'general', label: 'Concepto general' },
            { id: 'binary', label: 'Ejemplo binario' },
          ]}
          value={mode}
          onChange={(id) => setMode(id as Mode)}
        />
        <Segmented
          options={[
            { id: 'separation', label: 'Separación' },
            { id: 'detection', label: 'Detectar' },
            { id: 'correction', label: 'Corregir' },
          ]}
          value={tab}
          onChange={(id) => setTab(id as Tab)}
        />
      </div>

      {mode === 'general' ? (
        <div className="mt-4 space-y-4">
          {tab === 'separation' ? (
            <SectionCard title="Separación mínima">
              <p className="mb-2 text-xs text-[var(--fg-muted)]">
                d_min = min d_H(c_i, c_j) entre palabras código distintas
              </p>
              <div className="flex items-center justify-center gap-1 py-4 font-mono text-sm">
                <span className="rounded-lg border border-[var(--border)] px-3 py-2">c₁</span>
                {Array.from({ length: dMin }, (_, i) => (
                  <span key={i} className="flex flex-col items-center">
                    <span className="h-px w-8 bg-[var(--accent-strong)]" />
                    <span className="text-[10px] text-[var(--fg-muted)]">{i + 1}</span>
                  </span>
                ))}
                <span className="rounded-lg border border-[var(--border)] px-3 py-2">c₂</span>
              </div>
              <p className="text-center font-mono text-sm">d_H(c₁, c₂) = {dMin}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <p className="text-sm">
                  <strong>Detectar:</strong> e ≤ d_min−1 = {detect}
                </p>
                <p className="text-sm">
                  <strong>Corregir:</strong> t = ⌊(d_min−1)/2⌋ = {correct}
                </p>
              </div>
            </SectionCard>
          ) : null}

          {tab === 'detection' ? (
            <SectionCard title="Detección garantizada">
              <p className="mb-2 text-sm text-[var(--fg-muted)]">
                Con e ≤ {detect} errores, el resultado no puede ser otra palabra código.
              </p>
              <div className="space-y-4">
                <StackedSlider
                  label="Errores introducidos · e"
                  value={errorCount}
                  min={0}
                  max={dMin + 1}
                  step={1}
                  onChange={setErrorCount}
                />
                <Badge tone={errorCount <= detect ? 'ok' : 'warn'}>
                  {errorCount <= detect ? 'Detección garantizada' : 'Detección no garantizada'}
                </Badge>
              </div>
            </SectionCard>
          ) : null}

          {tab === 'correction' ? (
            <SectionCard title="Regiones de corrección">
              <p className="mb-2 text-sm text-[var(--fg-muted)]">
                Radio t = {correct}. Las regiones no se solapan porque 2t = {2 * correct} &lt; d_min = {dMin}.
              </p>
              <div className="flex items-center justify-center gap-4 py-2">
                <div className="text-center">
                  <p className="mb-1 text-xs">c₁</p>
                  <div className="rounded-lg border border-emerald-700/40 bg-emerald-700/10 px-4 py-3 text-xs">
                    dist 0…{correct}
                  </div>
                </div>
                <span className="text-[var(--fg-muted)]">espacio seguro</span>
                <div className="text-center">
                  <p className="mb-1 text-xs">c₂</p>
                  <div className="rounded-lg border border-emerald-700/40 bg-emerald-700/10 px-4 py-3 text-xs">
                    dist 0…{correct}
                  </div>
                </div>
              </div>
            </SectionCard>
          ) : null}

          <ControlsStack>
            <StackedSlider
              label="Distancia mínima · d_min"
              value={dMin}
              min={1}
              max={9}
              step={1}
              onChange={setDMin}
            />
            <ButtonRow>
              {[2, 3, 5, 7].map((d) => (
                <VizButton key={d} active={dMin === d} onClick={() => setDMin(d)}>
                  d={d}
                </VizButton>
              ))}
            </ButtonRow>
          </ControlsStack>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <p className="text-xs text-[var(--fg-muted)]">
            Ejemplo binario C = {'{000, 111}'} con d_min = 3 (código de repetición [3,1,3])
          </p>

          {tab === 'separation' ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <SectionCard title="Palabras código">
                <div className="flex justify-around">
                  <div className="text-center">
                    <p className="mb-1 text-xs">c₁ = 000</p>
                    <div className="flex gap-1">
                      {[0, 0, 0].map((b, i) => (
                        <BitCell key={i} value={b as 0 | 1} />
                      ))}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="mb-1 text-xs">c₂ = 111</p>
                    <div className="flex gap-1">
                      {[1, 1, 1].map((b, i) => (
                        <BitCell key={i} value={b as 0 | 1} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-center font-mono text-sm">d_H(000, 111) = 3</p>
                <p className="mt-1 text-center text-xs text-[var(--fg-muted)]">3 posiciones distintas</p>
              </SectionCard>
              <SectionCard title="Capacidades">
                <p className="font-mono text-sm">Detecta hasta {detect} errores</p>
                <p className="font-mono text-sm">Corrige hasta {correct} error</p>
              </SectionCard>
            </div>
          ) : null}

          {tab === 'detection' ? (
            <SectionCard title="Transmitido → recibido">
              <p className="mb-2 text-xs">Transmitido: 000 · Pulsa posiciones para introducir errores</p>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <BitCell
                    key={i}
                    value={received[i]!}
                    tone={flipPositions.has(i) ? 'error' : 'neutral'}
                    onClick={() => {
                      setFlipPositions((prev) => {
                        const next = new Set(prev);
                        if (next.has(i)) next.delete(i);
                        else next.add(i);
                        return next;
                      });
                    }}
                    label={`pos ${i + 1}`}
                  />
                ))}
              </div>
              <p className="mt-2 font-mono text-sm">e = {dist} errores · d_H = {dist}</p>
              <div className="mt-2 space-y-1 text-sm">
                <Badge tone={dist <= detect ? 'ok' : 'warn'}>
                  {dist <= detect ? '✓ Error detectable' : 'Detección no garantizada'}
                </Badge>
                <Badge tone={dist <= correct ? 'ok' : 'warn'}>
                  {dist <= correct ? '✓ Corrección garantizada' : 'Corrección no garantizada'}
                </Badge>
              </div>
              {dist === 2 ? (
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                  Detectable, pero un decodificador por vecino más cercano podría elegir 111 incorrectamente.
                </p>
              ) : null}
              <div className="mt-2">
                <ButtonRow>
                {[0, 1, 2, 3].map((e) => (
                  <VizButton
                    key={e}
                    onClick={() => {
                      const s = new Set<number>();
                      for (let i = 0; i < e; i++) s.add(i);
                      setFlipPositions(s);
                      setErrorCount(e);
                    }}
                  >
                    {e} err
                  </VizButton>
                ))}
              </ButtonRow>
              </div>
            </SectionCard>
          ) : null}

          {tab === 'correction' ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <SectionCard title="Bolas de Hamming (t=1)">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs font-medium">B₁(000)</p>
                    <div className="flex flex-wrap gap-1">
                      {ball0.map((w) => (
                        <span key={w.join('')} className="rounded border border-[var(--border)] px-2 py-1 font-mono text-xs">
                          {w.join('')}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium">B₁(111)</p>
                    <div className="flex flex-wrap gap-1">
                      {ball1.map((w) => (
                        <span key={w.join('')} className="rounded border border-[var(--border)] px-2 py-1 font-mono text-xs">
                          {w.join('')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-xs text-[var(--fg-muted)]">Las dos bolas son disjuntas.</p>
              </SectionCard>
              <SectionCard title="Decodificar recibido">
                <p className="mb-2 text-xs">Selecciona palabra recibida:</p>
                <ButtonRow>
                  {['001', '010', '100', '110', '101', '011'].map((w) => (
                    <VizButton key={w} active={receivedSel === w} onClick={() => setReceivedSel(w)}>
                      {w}
                    </VizButton>
                  ))}
                </ButtonRow>
                <p className="mt-2 font-mono text-sm">
                  d_H({receivedSel}, 000) = {dTo0}
                </p>
                <p className="font-mono text-sm">
                  d_H({receivedSel}, 111) = {dTo1}
                </p>
                <p className="mt-1 text-sm">
                  → Decodificar como <strong>{decodeAs}</strong>
                </p>
              </SectionCard>
            </div>
          ) : null}
        </div>
      )}

      <ControlsStack>
      <CollapsibleEdit label="¿Por qué aparece el 1/2?" open={derivOpen} onToggle={() => setDerivOpen((o) => !o)}>
        <div className="space-y-1 font-mono text-sm text-[var(--fg-muted)]">
          <p>t + t &lt; d_min → 2t &lt; d_min → 2t ≤ d_min−1 → t ≤ (d_min−1)/2</p>
          <p>t = ⌊(d_min−1)/2⌋</p>
        </div>
      </CollapsibleEdit>

      <CollapsibleEdit label="Ver patrón d_min / detectar / corregir" open={patternOpen} onToggle={() => setPatternOpen((o) => !o)}>
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left">d_min</th>
              <th>detectar</th>
              <th>corregir</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <tr key={d} className={d === dMin ? 'font-semibold text-[var(--accent-strong)]' : ''}>
                <td>{d}</td>
                <td className="text-center">{detectableErrors(d)}</td>
                <td className="text-center">{correctableErrors(d)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CollapsibleEdit>
      </ControlsStack>
    </VizPanel>
  );
}
