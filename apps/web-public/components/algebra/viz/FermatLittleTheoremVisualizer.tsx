'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  SliderRow,
  VizButton,
  VizPanel,
  joinCaption,
} from './controls';
import {
  FERMAT_PRIMES,
  buildPowerSequence,
  firstReturnToOne,
  gcd,
  isPrime,
  mod,
  modPow,
  multiplicativeOrder,
  multiplyResiduesBy,
} from './modMath';
import {
  HypothesisCard,
  ModExpr,
  ModularWheel,
  SequenceBand,
  StatusBadge,
  StepDetail,
  type WheelEdge,
  type WheelNode,
} from './modVizShared';
import { Badge, CollapsibleEdit, GuideBlock, Segmented } from './transformHelpers';

type Tab = 'powers' | 'proof';

const PRESETS = [
  { p: 7, a: 3, label: 'p=7, a=3' },
  { p: 7, a: 2, label: 'p=7, a=2 (ciclo corto)' },
  { p: 5, a: 2, label: 'p=5, a=2' },
  { p: 11, a: 2, label: 'p=11, a=2' },
  { p: 7, a: 6, label: 'p=7, a=6 ≡ −1' },
];

const PROOF_STEPS = [
  'Residuos no nulos 1…p−1',
  'Multiplicar todos por a',
  'Observar la permutación',
  'Comparar productos',
  'Factorizar a^(p−1)',
  'Cancelar (p−1)!',
  'Conclusión de Fermat',
];

export function FermatLittleTheoremVisualizer() {
  const [p, setP] = useState(7);
  const [a, setA] = useState(3);
  const [k, setK] = useState(0);
  const [tab, setTab] = useState<Tab>('powers');
  const [isPlaying, setIsPlaying] = useState(false);
  const [proofStep, setProofStep] = useState(0);
  const [showComposite, setShowComposite] = useState(false);
  const [compositeM, setCompositeM] = useState(8);
  const [compositeA, setCompositeA] = useState(3);

  const aNorm = mod(a, p);
  const coprime = gcd(aNorm, p) === 1 && aNorm !== 0;
  const fermatExp = p - 1;
  const sequence = useMemo(() => buildPowerSequence(aNorm || 1, p), [aNorm, p]);
  const currentResidue = sequence[k] ?? 1;
  const prevResidue = k > 0 ? sequence[k - 1]! : 1;
  const order = multiplicativeOrder(aNorm, p);
  const firstOne = firstReturnToOne(sequence);
  const visited = useMemo(() => new Set(sequence.slice(0, k + 1)), [sequence, k]);

  const edges = useMemo((): WheelEdge[] => {
    const e: WheelEdge[] = [];
    for (let i = 1; i <= k; i++) {
      e.push({
        from: sequence[i - 1]!,
        to: sequence[i]!,
        active: i === k,
      });
    }
    return e;
  }, [sequence, k]);

  const nodes = useMemo((): Record<number, WheelNode> => {
    const n: Record<number, WheelNode> = {};
    for (let r = 0; r < p; r++) {
      let role: WheelNode['role'] = r === 0 ? 'dimmed' : 'neutral';
      if (visited.has(r)) role = 'visited';
      if (r === 1) role = visited.has(1) ? 'identity' : 'target';
      if (r === currentResidue) role = 'active';
      n[r] = { residue: r, role };
    }
    if (firstOne !== null && k >= firstOne && currentResidue === 1 && firstOne < fermatExp) {
      n[1] = { ...n[1], badges: ['1.er retorno'] };
    }
    return n;
  }, [p, visited, currentResidue, firstOne, k, fermatExp]);

  const advance = useCallback(() => setK((s) => Math.min(s + 1, fermatExp)), [fermatExp]);
  const reset = useCallback(() => setK(0), []);

  useEffect(() => {
    if (!isPlaying) return;
    if (k >= fermatExp) {
      setIsPlaying(false);
      return;
    }
    const t = setTimeout(advance, 550);
    return () => clearTimeout(t);
  }, [isPlaying, k, fermatExp, advance]);

  useEffect(() => {
    setK(0);
    setIsPlaying(false);
  }, [p, a]);

  const product = prevResidue * aNorm;
  const atFermat = k === fermatExp;
  const fermatHolds = modPow(aNorm, fermatExp, p) === 1;

  const permOrig = useMemo(() => Array.from({ length: p - 1 }, (_, i) => i + 1), [p]);
  const permImage = useMemo(() => multiplyResiduesBy(aNorm, p), [aNorm, p]);

  const caption =
    tab === 'powers'
      ? joinCaption(
          `Paso ${k}/${fermatExp}`,
          `${aNorm}^${k} ≡ ${currentResidue} (mod ${p})`,
          atFermat && fermatHolds && coprime ? 'Fermat ✓' : undefined,
        )
      : joinCaption(`Demostración paso ${proofStep + 1}/${PROOF_STEPS.length}`, PROOF_STEPS[proofStep]);

  return (
    <VizPanel caption={caption}>
      <GuideBlock
        idea="Vas a ver cómo las potencias de a recorren residuos módulo p. Si p es primo y a no es múltiplo de p, Fermat garantiza que en el exponente p−1 el resultado es 1."
        tryIt="Elige p y a, avanza potencia por potencia y observa dónde cae cada residuo."
      />

      <Segmented
        options={[
          { id: 'powers', label: 'Potencias' },
          { id: 'proof', label: 'Por qué funciona' },
        ]}
        value={tab}
        onChange={(id) => setTab(id as Tab)}
      />

      <HypothesisCard>
        <div className="flex flex-wrap items-center gap-3">
          <span>
            p = {p} <StatusBadge ok={isPrime(p)} okLabel="primo ✓" badLabel="no primo" />
          </span>
          <span>
            a = {aNorm}{' '}
            <StatusBadge ok={coprime} okLabel="p ∤ a ✓" badLabel="p | a" />
          </span>
          {coprime ? (
            <span className="text-[var(--fg-muted)]">
              gcd({aNorm},{p})=1 ✓
            </span>
          ) : null}
        </div>
        {coprime ? (
          <p className="mt-1 text-[var(--fg-muted)]">
            Conclusión esperada: {aNorm}^{fermatExp} ≡ 1 (mod {p})
          </p>
        ) : null}
      </HypothesisCard>

      {tab === 'powers' ? (
        <div className="mt-3 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <ModularWheel
              modulus={p}
              nodes={nodes}
              edges={edges}
              showLastEdgeOnly={p > 13}
              center={
                <div className="space-y-0.5 text-center font-mono text-sm">
                  <p>
                    {aNorm}^{k}
                  </p>
                  <p className="text-[var(--fg-muted)]">↓</p>
                  <p className="text-lg text-[var(--accent-strong)]">{currentResidue}</p>
                  {atFermat && fermatHolds && coprime ? (
                    <Badge tone="ok">✓ Fermat</Badge>
                  ) : null}
                </div>
              }
            />
            <SequenceBand
              label="k"
              values={sequence.map((_, i) => i)}
              activeIndex={k}
              highlightIndex={fermatExp}
              highlightLabel="Fermat"
              onSelect={setK}
            />
            <SequenceBand
              label={`${aNorm}^k`}
              values={sequence}
              activeIndex={k}
              onSelect={setK}
            />
            <ControlsStack>
              <SliderRow label="k" value={k} min={0} max={fermatExp} step={1} onChange={setK} />
              <ButtonRow>
                <VizButton onClick={() => setK((s) => Math.max(0, s - 1))}>←</VizButton>
                <VizButton onClick={advance} disabled={k >= fermatExp}>
                  ▶ siguiente
                </VizButton>
                <VizButton onClick={() => setIsPlaying((v) => !v)} active={isPlaying}>
                  {isPlaying ? 'Pausar' : '▶ Reproducir'}
                </VizButton>
                <VizButton onClick={reset}>Reiniciar</VizButton>
              </ButtonRow>
            </ControlsStack>
          </div>

          <div className="space-y-3">
            <StepDetail title={`Paso ${k}`}>
              {k === 0 ? (
                <p>a^0 ≡ 1 (mod {p})</p>
              ) : (
                <>
                  <p>residuo anterior: {prevResidue}</p>
                  <p>multiplicar por: {aNorm}</p>
                  <p>
                    {prevResidue} × {aNorm} = {product}
                  </p>
                  <p>
                    {product} mod {p} = {currentResidue}
                  </p>
                  <p className="text-[var(--accent-strong)]">
                    {aNorm}^{k} ≡ {currentResidue} (mod {p})
                  </p>
                </>
              )}
            </StepDetail>

            {order !== null ? (
              <p className="text-xs text-[var(--fg-muted)]">
                Orden de {aNorm} mod {p} = {order}
                {firstOne !== null && firstOne < fermatExp
                  ? ` · primer retorno a 1 en k=${firstOne}`
                  : ''}
                {order < fermatExp ? ` · ${order} | ${fermatExp} ✓` : ''}
              </p>
            ) : null}

            {atFermat && fermatHolds && coprime ? (
              <div className="rounded-lg border border-emerald-600/40 bg-emerald-500/10 px-3 py-2 text-sm">
                <p className="font-medium text-emerald-800 dark:text-emerald-300">✓ Se cumple Fermat</p>
                <ModExpr>
                  {aNorm}^{fermatExp} ≡ 1 (mod {p})
                </ModExpr>
                <p className="mt-1 text-xs text-[var(--fg-muted)]">
                  {p} es primo y {p} ∤ {aNorm}.
                </p>
              </div>
            ) : null}

            <ControlsStack>
              <label className="flex items-center gap-2 text-sm">
                <span className="w-16 font-mono text-[var(--fg-muted)]">p</span>
                <select
                  className="rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-mono"
                  value={p}
                  onChange={(e) => setP(Number(e.target.value))}
                >
                  {FERMAT_PRIMES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <SliderRow label="a" value={a} min={1} max={Math.max(1, p - 1)} step={1} onChange={setA} />
              <ButtonRow>
                {PRESETS.map((pr) => (
                  <VizButton key={pr.label} onClick={() => { setP(pr.p); setA(pr.a); }}>
                    {pr.label}
                  </VizButton>
                ))}
              </ButtonRow>
            </ControlsStack>

            <CollapsibleEdit
              label="¿Por qué p debe ser primo?"
              open={showComposite}
              onToggle={() => setShowComposite((v) => !v)}
            >
              <ToggleComposite m={compositeM} setM={setCompositeM} a={compositeA} setA={setCompositeA} />
            </CollapsibleEdit>
          </div>
        </div>
      ) : (
        <ProofTab
          p={p}
          a={aNorm}
          permOrig={permOrig}
          permImage={permImage}
          step={proofStep}
          onStep={setProofStep}
        />
      )}

      <p className="sr-only" aria-live="polite">
        Módulo {p}, base {aNorm}, exponente {k}, residuo {currentResidue}.
        {atFermat && coprime && fermatHolds ? ' Pequeño teorema de Fermat se cumple.' : ''}
      </p>
    </VizPanel>
  );
}

function ToggleComposite({
  m,
  setM,
  a,
  setA,
}: {
  m: number;
  setM: (v: number) => void;
  a: number;
  setA: (v: number) => void;
}) {
  const r = modPow(a, m - 1, m);
  return (
    <div className="space-y-2 p-2 text-sm">
      <SliderRow label="m" value={m} min={4} max={15} step={1} onChange={setM} />
      <SliderRow label="a" value={a} min={1} max={m - 1} step={1} onChange={setA} />
      <p>
        {a}^{m - 1} mod {m} = {r}
        {r !== 1 ? ' ≠ 1 — la hipótesis de primalidad importa.' : ''}
      </p>
      <p className="text-xs text-[var(--fg-muted)]">
        El análogo general usa φ(m): teorema de Euler.
      </p>
    </div>
  );
}

function ProofTab({
  p,
  a,
  permOrig,
  permImage,
  step,
  onStep,
}: {
  p: number;
  a: number;
  permOrig: number[];
  permImage: number[];
  step: number;
  onStep: (s: number) => void;
}) {
  const fact = permOrig.reduce((acc, x) => acc * x, 1);
  const factPerm = permImage.reduce((acc, x) => acc * x, 1);

  return (
    <div className="mt-3 space-y-3">
      <p className="text-sm text-[var(--fg-muted)]">{PROOF_STEPS[step]}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] p-2 text-center font-mono text-sm">
          <p className="text-xs text-[var(--fg-muted)]">Originales</p>
          <p>{permOrig.join('  ')}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] p-2 text-center font-mono text-sm">
          <p className="text-xs text-[var(--fg-muted)]">×{a} mod {p}</p>
          <p>{permImage.join('  ')}</p>
        </div>
      </div>
      <p className="text-center text-sm text-[var(--fg-muted)]">Mismos residuos, distinto orden.</p>

      {step >= 3 ? (
        <ModExpr>
          1·2·…·{p - 1} ≡ ({permImage.join(')·(')}) (mod {p})
        </ModExpr>
      ) : null}
      {step >= 4 ? (
        <ModExpr>
          a^{p - 1}·(p−1)! ≡ (p−1)! (mod {p})
        </ModExpr>
      ) : null}
      {step >= 5 ? <p className="text-center text-sm">Cancelamos (p−1)! porque p ∤ (p−1)!.</p> : null}
      {step >= 6 ? (
        <div className="rounded-lg border border-emerald-600/40 bg-emerald-500/10 p-3 text-center">
          <ModExpr>
            {a}^{p - 1} ≡ 1 (mod {p})
          </ModExpr>
        </div>
      ) : null}

      <p className="text-xs text-[var(--fg-muted)]">
        Ejemplo numérico: productos mod {p} coinciden ({fact} y {factPerm} tienen los mismos factores).
      </p>

      <ButtonRow>
        <VizButton onClick={() => onStep(Math.max(0, step - 1))}>←</VizButton>
        <VizButton onClick={() => onStep(Math.min(PROOF_STEPS.length - 1, step + 1))}>Siguiente →</VizButton>
      </ButtonRow>
    </div>
  );
}
