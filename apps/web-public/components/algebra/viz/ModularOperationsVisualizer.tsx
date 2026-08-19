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
import { additionPath, mod, multiplicationPath, quotientRemainder } from './modMath';
import {
  ModExpr,
  ModularWheel,
  ReductionPanel,
  type WheelEdge,
  type WheelNode,
} from './modVizShared';
import { GuideBlock, Segmented } from './transformHelpers';

type Tab = 'add' | 'multiply' | 'compare';

const PRESETS = [
  { m: 7, a: 3, b: 4, label: 'suma≠producto' },
  { m: 7, a: 3, b: 5, label: 'mismo residuo' },
  { m: 7, a: 5, b: 4, label: 'cruzar 0' },
  { m: 7, a: 10, b: 12, label: 'grandes' },
  { m: 7, a: -2, b: 5, label: 'negativos' },
];

export function ModularOperationsVisualizer() {
  const [modulus, setModulus] = useState(7);
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const [tab, setTab] = useState<Tab>('add');
  const [animStep, setAnimStep] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);

  const aNorm = mod(a, modulus);
  const bNorm = mod(b, modulus);
  const rawSum = a + b;
  const rawProduct = a * b;
  const sumResidue = mod(rawSum, modulus);
  const productResidue = mod(rawProduct, modulus);

  const addPath = useMemo(() => additionPath(a, b, modulus), [a, b, modulus]);
  const mulPath = useMemo(() => multiplicationPath(aNorm, b, modulus), [aNorm, b, modulus]);
  const activePath = tab === 'multiply' ? mulPath : addPath;

  const maxStep = activePath.length - 1;
  const displayStep = animStep < 0 ? maxStep : animStep;

  useEffect(() => {
    setAnimStep(-1);
    setIsAnimating(false);
  }, [a, b, modulus, tab]);

  useEffect(() => {
    if (!isAnimating) return;
    if (animStep >= maxStep) {
      setIsAnimating(false);
      return;
    }
    const t = setTimeout(() => setAnimStep((s) => (s < 0 ? 0 : s + 1)), 200);
    return () => clearTimeout(t);
  }, [isAnimating, animStep, maxStep]);

  const edges = useMemo((): WheelEdge[] => {
    const e: WheelEdge[] = [];
    for (let i = 1; i <= displayStep; i++) {
      e.push({ from: activePath[i - 1]!, to: activePath[i]!, active: i === displayStep });
    }
    return e;
  }, [activePath, displayStep]);

  const nodes = useMemo((): Record<number, WheelNode> => {
    const n: Record<number, WheelNode> = {};
    const current = activePath[displayStep] ?? 0;
    const start = activePath[0] ?? 0;
    for (let r = 0; r < modulus; r++) {
      let role: WheelNode['role'] = 'neutral';
      if (activePath.slice(0, displayStep + 1).includes(r)) role = 'visited';
      if (r === start && tab === 'add') role = 'visited';
      if (r === current) role = 'active';
      if (r === (tab === 'add' ? sumResidue : productResidue) && displayStep === maxStep) role = 'result';
      n[r] = { residue: r, role };
    }
    return n;
  }, [modulus, activePath, displayStep, tab, sumResidue, productResidue, maxStep]);

  const sumQR = quotientRemainder(rawSum, modulus);
  const prodQR = quotientRemainder(rawProduct, modulus);

  const caption =
    tab === 'add'
      ? joinCaption(`${a}+${b}=${rawSum}`, `${rawSum} mod ${modulus}=${sumResidue}`, `${a}+${b}≡${sumResidue} (mod ${modulus})`)
      : tab === 'multiply'
        ? joinCaption(
            `${a}×${b}=${rawProduct}`,
            `${rawProduct} mod ${modulus}=${productResidue}`,
            `${a}·${b}≡${productResidue} (mod ${modulus})`,
          )
        : joinCaption(
            `suma→${sumResidue}`,
            `producto→${productResidue}`,
            sumResidue === productResidue ? 'mismo residuo' : 'residuos distintos',
          );

  const play = useCallback(() => {
    setAnimStep(0);
    setIsAnimating(true);
  }, []);

  return (
    <VizPanel caption={caption}>
      <GuideBlock
        idea="Vas a ver que operar módulo m significa hacer la operación y quedarte con el residuo al dividir entre m."
        tryIt="Cambia a, b y m y observa cómo la suma o el producto vuelven al reloj de residuos 0,…,m−1."
      />

      <Segmented
        options={[
          { id: 'add', label: 'Suma' },
          { id: 'multiply', label: 'Producto' },
          { id: 'compare', label: 'Comparar' },
        ]}
        value={tab}
        onChange={(id) => setTab(id as Tab)}
      />

      {a !== aNorm || b !== bNorm ? (
        <p className="text-xs text-[var(--fg-muted)]">
          {a !== aNorm ? `${a} ≡ ${aNorm} (mod ${modulus})` : ''}
          {a !== aNorm && b !== bNorm ? ' · ' : ''}
          {b !== bNorm ? `${b} ≡ ${bNorm} (mod ${modulus})` : ''}
        </p>
      ) : null}

      {tab === 'compare' ? (
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] p-3">
            <p className="text-xs font-semibold text-[var(--fg-muted)]">SUMA</p>
            <ReductionPanel raw={rawSum} modulus={modulus} residue={sumResidue} expression={`${a} + ${b}`} />
          </div>
          <div className="rounded-lg border border-[var(--border)] p-3">
            <p className="text-xs font-semibold text-[var(--fg-muted)]">PRODUCTO</p>
            <ReductionPanel
              raw={rawProduct}
              modulus={modulus}
              residue={productResidue}
              expression={`${a} × ${b}`}
            />
          </div>
          {sumResidue === productResidue ? (
            <p className="col-span-full text-center text-sm">
              Mismo residuo ({sumResidue}), operaciones distintas. {rawSum} ≠ {rawProduct}, pero {rawSum} ≡{' '}
              {rawProduct} ≡ {sumResidue} (mod {modulus}).
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-3 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <ModularWheel
              modulus={modulus}
              nodes={nodes}
              edges={edges}
              center={
                <div className="font-mono text-xs">
                  {tab === 'add' ? (
                    <>
                      <p>
                        {aNorm} + {b}
                      </p>
                      <p>{rawSum} mod {modulus}</p>
                      <p className="text-[var(--accent-strong)]">{sumResidue}</p>
                    </>
                  ) : (
                    <>
                      <p>
                        {aNorm} × {b}
                      </p>
                      <p>{rawProduct} mod {modulus}</p>
                      <p className="text-[var(--accent-strong)]">{productResidue}</p>
                    </>
                  )}
                </div>
              }
            />
            <p className="mt-1 text-center text-xs text-[var(--fg-muted)]">
              {tab === 'add'
                ? `+${Math.abs(b)} paso${Math.abs(b) === 1 ? '' : 's'} desde ${aNorm}`
                : `${Math.abs(b)} salto${Math.abs(b) === 1 ? '' : 's'} de +${aNorm} desde 0`}
            </p>
            <ButtonRow>
              <VizButton onClick={play}>▶ Ver recorrido</VizButton>
              <VizButton onClick={() => setAnimStep((s) => Math.max(0, (s < 0 ? maxStep : s) - 1))}>←</VizButton>
              <VizButton onClick={() => setAnimStep((s) => Math.min(maxStep, (s < 0 ? 0 : s) + 1))}>→</VizButton>
            </ButtonRow>
            {displayStep >= 0 && displayStep < activePath.length ? (
              <p className="text-center text-xs font-mono text-[var(--fg-muted)]">
                Paso {displayStep}/{maxStep}: {activePath.slice(0, displayStep + 1).join(' → ')}
              </p>
            ) : null}
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
            {tab === 'add' ? (
              <ReductionPanel raw={rawSum} modulus={modulus} residue={sumResidue} expression={`${a} + ${b}`} />
            ) : (
              <ReductionPanel
                raw={rawProduct}
                modulus={modulus}
                residue={productResidue}
                expression={`${a} × ${b}`}
              />
            )}
            <p className="mt-2 text-center text-xs text-[var(--fg-muted)]">
              Vueltas completas: {tab === 'add' ? sumQR.q : prodQR.q}
            </p>
          </div>
        </div>
      )}

      <ControlsStack>
        <SliderRow label="m" value={modulus} min={2} max={15} step={1} onChange={setModulus} />
        <SliderRow label="a" value={a} min={-20} max={30} step={1} onChange={setA} />
        <SliderRow label="b" value={b} min={-20} max={30} step={1} onChange={setB} />
        <ButtonRow>
          {PRESETS.map((pr) => (
            <VizButton key={pr.label} onClick={() => { setModulus(pr.m); setA(pr.a); setB(pr.b); }}>
              {pr.label}
            </VizButton>
          ))}
        </ButtonRow>
      </ControlsStack>

      <p className="sr-only" aria-live="polite">
        {tab === 'add'
          ? `${a} más ${b} es ${rawSum}, residuo ${sumResidue} módulo ${modulus}.`
          : `${a} por ${b} es ${rawProduct}, residuo ${productResidue} módulo ${modulus}.`}
      </p>
    </VizPanel>
  );
}
