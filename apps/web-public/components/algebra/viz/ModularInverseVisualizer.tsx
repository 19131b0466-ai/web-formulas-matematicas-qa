'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  SliderRow,
  VizButton,
  VizPanel,
  joinCaption,
} from './controls';
import { bezoutFromEuclid, gcd, mod, modInverse } from './modMath';
import {
  HypothesisCard,
  ModExpr,
  ModularWheel,
  SequenceBand,
  StatusBadge,
  StepDetail,
  type WheelNode,
} from './modVizShared';
import { Badge, GuideBlock, Segmented } from './transformHelpers';

type Tab = 'candidate' | 'all' | 'euclid';

const PRESETS = [
  { a: 3, m: 7, label: '3 mod 7 → 5' },
  { a: 2, m: 5, label: '2 mod 5 → 3' },
  { a: 5, m: 12, label: '5 mod 12 → 5' },
  { a: 2, m: 6, label: 'sin inverso' },
];

export function ModularInverseVisualizer() {
  const [modulus, setModulus] = useState(7);
  const [a, setA] = useState(3);
  const [candidate, setCandidate] = useState(5);
  const [tab, setTab] = useState<Tab>('candidate');
  const [isSearching, setIsSearching] = useState(false);
  const [euclidStep, setEuclidStep] = useState(0);

  const aNorm = mod(a, modulus);
  const xNorm = mod(candidate, modulus);
  const g = gcd(aNorm, modulus);
  const hasInverse = g === 1 && aNorm !== 0;
  const inverse = modInverse(aNorm, modulus);
  const product = aNorm * xNorm;
  const residue = mod(product, modulus);
  const isInverse = hasInverse && residue === 1 && xNorm === inverse;

  const mapping = useMemo(
    () => Array.from({ length: modulus }, (_, x) => mod(aNorm * x, modulus)),
    [aNorm, modulus],
  );

  useEffect(() => {
    setCandidate(inverse ?? 1);
    setEuclidStep(0);
    setIsSearching(false);
  }, [a, modulus, inverse]);

  useEffect(() => {
    if (!isSearching || !hasInverse) return;
    if (candidate >= modulus - 1) {
      setIsSearching(false);
      return;
    }
    const t = setTimeout(() => setCandidate((c) => c + 1), 500);
    return () => clearTimeout(t);
  }, [isSearching, candidate, modulus, hasInverse]);

  const nodes = useMemo((): Record<number, WheelNode> => {
    const n: Record<number, WheelNode> = {};
    for (let r = 0; r < modulus; r++) {
      let role: WheelNode['role'] = 'neutral';
      if (r === 1) role = 'target';
      if (r === aNorm) role = 'visited';
      if (r === xNorm) role = 'active';
      if (r === residue) role = 'result';
      n[r] = { residue: r, role };
    }
    return n;
  }, [modulus, aNorm, xNorm, residue]);

  const bezout = bezoutFromEuclid(aNorm, modulus);
  const euclidSteps = bezout.steps;

  const q = Math.trunc((product - residue) / modulus);

  const caption = joinCaption(
    `a=${aNorm} · m=${modulus}`,
    `candidato x=${xNorm}`,
    `${aNorm}×${xNorm} mod ${modulus}=${residue}`,
    isInverse ? 'inverso ✓' : hasInverse ? 'todavía no' : 'sin inverso',
  );

  return (
    <VizPanel caption={caption}>
      <GuideBlock
        idea="Vas a buscar el residuo que, al multiplicarse por a, produce 1 módulo m. Ese residuo es el inverso modular de a."
        tryIt="Cambia el candidato y observa cuándo a·x mod m llega exactamente a 1."
      />

      <Segmented
        options={[
          { id: 'candidate', label: 'Probar candidato' },
          { id: 'all', label: 'Ver todos' },
          { id: 'euclid', label: 'Euclides' },
        ]}
        value={tab}
        onChange={(id) => setTab(id as Tab)}
      />

      <HypothesisCard>
        <div className="flex flex-wrap gap-3 text-sm">
          <span>a = {aNorm}</span>
          <span>m = {modulus}</span>
          <span>gcd({aNorm},{modulus})={g}</span>
          <StatusBadge
            ok={hasInverse}
            okLabel="inverso garantizado ✓"
            badLabel="no existe inverso"
          />
        </div>
        <ModExpr>a·x ≡ 1 (mod {modulus})</ModExpr>
      </HypothesisCard>

      {tab === 'candidate' ? (
        <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <ModularWheel
            modulus={modulus}
            nodes={nodes}
            center={
              <div className="font-mono text-sm">
                <p>
                  {aNorm} × {xNorm}
                </p>
                <p className="text-[var(--accent-strong)]">{residue}</p>
              </div>
            }
          />
          <StepDetail title={isInverse ? 'Inverso encontrado' : 'Comprobar candidato'}>
            <p>x = {xNorm}</p>
            <p>
              {aNorm} × {xNorm} = {product}
            </p>
            <p>
              {product} = {q}·{modulus} + {residue}
            </p>
            <p>
              {product} mod {modulus} = {residue}
            </p>
            {isInverse ? (
              <p className="text-emerald-700 dark:text-emerald-300">
                {aNorm}⁻¹ ≡ {xNorm} (mod {modulus})
              </p>
            ) : (
              <p className="text-[var(--fg-muted)]">
                {residue} ≠ 1 — {hasInverse ? 'no es el inverso' : '1 no es alcanzable'}
              </p>
            )}
          </StepDetail>
        </div>
      ) : null}

      {tab === 'all' ? (
        <div className="mt-3 space-y-2">
          <SequenceBand label="x" values={mapping.map((_, i) => i)} activeIndex={xNorm} onSelect={setCandidate} />
          <SequenceBand
            label={`${aNorm}x`}
            values={mapping}
            activeIndex={xNorm}
            highlightIndex={inverse ?? undefined}
            onSelect={setCandidate}
          />
          {inverse !== null ? (
            <p className="text-center text-sm">
              Solo x={inverse} produce 1 → {aNorm}⁻¹ ≡ {inverse} (mod {modulus})
            </p>
          ) : (
            <p className="text-center text-sm text-[var(--fg-muted)]">
              Los productos solo alcanzan {[...new Set(mapping)].sort((x, y) => x - y).join(', ')} — nunca 1.
            </p>
          )}
        </div>
      ) : null}

      {tab === 'euclid' && hasInverse ? (
        <div className="mt-3 space-y-2 text-sm">
          <p>Buscamos x, y tales que {aNorm}x + {modulus}y = 1.</p>
          {euclidSteps.slice(0, euclidStep + 1).map((s) => (
            <p key={s.step} className="font-mono">
              {s.equation}
            </p>
          ))}
          {euclidStep >= euclidSteps.length - 1 ? (
            <>
              <p>
                Coeficiente de {aNorm}: {bezout.x} ≡ {mod(bezout.x, modulus)} (mod {modulus})
              </p>
              <Badge tone="ok">
                {aNorm}⁻¹ ≡ {mod(bezout.x, modulus)} (mod {modulus})
              </Badge>
            </>
          ) : null}
          <ButtonRow>
            <VizButton onClick={() => setEuclidStep((s) => Math.max(0, s - 1))}>←</VizButton>
            <VizButton onClick={() => setEuclidStep((s) => Math.min(euclidSteps.length - 1, s + 1))}>
              ▶ Calcular con Euclides
            </VizButton>
          </ButtonRow>
        </div>
      ) : null}

      <ControlsStack>
        <SliderRow label="m" value={modulus} min={2} max={20} step={1} onChange={setModulus} />
        <SliderRow label="a" value={a} min={0} max={modulus - 1} step={1} onChange={setA} />
        <SliderRow label="x" value={candidate} min={0} max={modulus - 1} step={1} onChange={setCandidate} />
        <ButtonRow>
          <VizButton onClick={() => { setCandidate(1); setIsSearching(true); }} disabled={!hasInverse}>
            ▶ Buscar inverso
          </VizButton>
          {PRESETS.map((pr) => (
            <VizButton key={pr.label} onClick={() => { setA(pr.a); setModulus(pr.m); }}>
              {pr.label}
            </VizButton>
          ))}
        </ButtonRow>
      </ControlsStack>

      <p className="sr-only" aria-live="polite">
        {aNorm} por {xNorm} es {product}. Residuo {residue} módulo {modulus}.
        {isInverse ? ` ${xNorm} es el inverso.` : ''}
      </p>
    </VizPanel>
  );
}
