'use client';

import { useMemo, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  SliderRow,
  VizButton,
  VizPanel,
  joinCaption,
} from './controls';
import {
  areCongruent,
  congruenceClass,
  divisibilityCheck,
  mod,
  quotientRemainder,
} from './modMath';
import {
  HypothesisCard,
  ModExpr,
  ModularWheel,
  StatusBadge,
  type WheelNode,
} from './modVizShared';
import { GuideBlock, Segmented } from './transformHelpers';

type Tab = 'clock' | 'difference' | 'class';

const PRESETS = [
  { a: 17, b: 3, m: 7, label: '17≡3' },
  { a: -4, b: 3, m: 7, label: 'negativo' },
  { a: 59, b: 3, m: 7, label: '59≡3' },
  { a: 17, b: 5, m: 7, label: 'no congruentes' },
  { a: 22, b: 2, m: 5, label: '22≡2 mod5' },
];

export function ModularCongruenceVisualizer() {
  const [modulus, setModulus] = useState(7);
  const [a, setA] = useState(17);
  const [b, setB] = useState(3);
  const [tab, setTab] = useState<Tab>('clock');

  const residueA = mod(a, modulus);
  const residueB = mod(b, modulus);
  const congruent = areCongruent(a, b, modulus);
  const difference = a - b;
  const diffDivisible = divisibilityCheck(difference, modulus);
  const qrA = quotientRemainder(a, modulus);
  const qrB = quotientRemainder(b, modulus);
  const k = modulus !== 0 && diffDivisible ? difference / modulus : null;

  const classMembers = useMemo(
    () => congruenceClass(residueA, modulus, 7),
    [residueA, modulus],
  );

  const nodes = useMemo((): Record<number, WheelNode> => {
    const n: Record<number, WheelNode> = {};
    for (let r = 0; r < modulus; r++) {
      let role: WheelNode['role'] = 'neutral';
      if (r === residueA || r === residueB) {
        role = congruent && residueA === residueB ? 'active' : 'result';
      }
      const badges: string[] = [];
      if (r === residueA) badges.push('A');
      if (r === residueB) badges.push('B');
      n[r] = { residue: r, role, badges: badges.length ? badges : undefined };
    }
    return n;
  }, [modulus, residueA, residueB, congruent]);

  const caption = joinCaption(
    `${a} mod ${modulus}=${residueA}`,
    `${b} mod ${modulus}=${residueB}`,
    `diferencia=${difference}`,
    diffDivisible ? `${difference}=${k}·${modulus}` : `${mod(difference, modulus)} resto`,
    congruent ? 'congruentes ✓' : 'no congruentes',
  );

  return (
    <VizPanel caption={caption}>
      <GuideBlock
        idea="Vas a ver que dos enteros son congruentes módulo m cuando, al reducirlos, caen en el mismo residuo."
        tryIt="Cambia a y b: si ambos llegan al mismo punto del reloj, entonces a ≡ b (mod m)."
      />

      <HypothesisCard>
        <div className="flex flex-wrap items-center gap-3">
          <span>a = {a}</span>
          <span>b = {b}</span>
          <span>m = {modulus}</span>
          <StatusBadge ok={congruent} okLabel="✓ Congruentes" badLabel="Residuos distintos" />
        </div>
        <ModExpr>
          {a} {congruent ? '≡' : '≢'} {b} (mod {modulus})
        </ModExpr>
        <p className="text-xs text-[var(--fg-muted)]">
          {a} = {b} es {a === b ? 'verdadero' : 'falso'}, pero la congruencia módulo {modulus} es{' '}
          {congruent ? 'verdadera' : 'falsa'}.
        </p>
      </HypothesisCard>

      <Segmented
        options={[
          { id: 'clock', label: 'Reloj' },
          { id: 'difference', label: 'Diferencia' },
          { id: 'class', label: 'Clase' },
        ]}
        value={tab}
        onChange={(id) => setTab(id as Tab)}
      />

      {tab === 'clock' ? (
        <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <ModularWheel
            modulus={modulus}
            nodes={nodes}
            center={
              <div className="text-center font-mono text-xs">
                <p>
                  {a} → {residueA}
                </p>
                <p>
                  {b} → {residueB}
                </p>
                <p className={congruent ? 'text-emerald-700 dark:text-emerald-300' : ''}>
                  {congruent ? 'mismo residuo ✓' : `${residueA} ≠ ${residueB}`}
                </p>
              </div>
            }
          />
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-[var(--border)] p-3">
              <p className="text-xs font-semibold text-[var(--fg-muted)]">MISMOS RESIDUOS</p>
              <p>
                {a} mod {modulus} = {residueA}
              </p>
              <p>
                {b} mod {modulus} = {residueB}
              </p>
              <p>{residueA} {congruent ? '=' : '≠'} {residueB}</p>
            </div>
            <div className="rounded-lg border border-[var(--border)] p-3">
              <p className="text-xs font-semibold text-[var(--fg-muted)]">DESCOMPOSICIÓN</p>
              <p>
                {a} = {qrA.q}·{modulus} + {qrA.r}
              </p>
              <p>
                {b} = {qrB.q}·{modulus} + {qrB.r}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'difference' ? (
        <div className="mt-3 space-y-3 text-sm">
          <ModExpr>
            {a} − {b} = {difference}
          </ModExpr>
          {diffDivisible ? (
            <>
              <p>
                {difference} ÷ {modulus} = {k} sin residuo
              </p>
              <p>
                {difference} = {k} × {modulus}
              </p>
              <p className="text-emerald-700 dark:text-emerald-300">
                {modulus} | {difference} ✓ → {a} ≡ {b} (mod {modulus})
              </p>
            </>
          ) : (
            <>
              <p>
                {difference} = {quotientRemainder(difference, modulus).q}·{modulus} +{' '}
                {mod(difference, modulus)}
              </p>
              <p className="text-[var(--fg-muted)]">
                Hay residuo {mod(difference, modulus)} → {modulus} ∤ {difference}
              </p>
            </>
          )}
        </div>
      ) : null}

      {tab === 'class' ? (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-[var(--fg-muted)]">
            Todos los enteros de la forma {residueA} + {modulus}k son congruentes con {residueA} módulo {modulus}:
          </p>
          <div className="flex flex-wrap gap-2">
            {classMembers.map((v) => (
              <span
                key={v}
                className={`rounded border px-2 py-1 font-mono text-sm ${
                  v === a || v === b
                    ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)]'
                    : 'border-[var(--border)]'
                }`}
              >
                {v}
              </span>
            ))}
          </div>
          <div className="overflow-x-auto">
            <div className="flex min-w-max items-center gap-4 py-2">
              {classMembers.map((v, i) => (
                <div key={v} className="flex items-center gap-4">
                  <span className="font-mono text-sm">{v}</span>
                  {i < classMembers.length - 1 ? (
                    <span className="text-xs text-[var(--fg-muted)]">+{modulus}</span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <ControlsStack>
        <SliderRow label="m" value={modulus} min={2} max={20} step={1} onChange={setModulus} />
        <SliderRow label="a" value={a} min={-50} max={50} step={1} onChange={setA} />
        <SliderRow label="b" value={b} min={-50} max={50} step={1} onChange={setB} />
        <ButtonRow>
          <VizButton onClick={() => setA((v) => v - modulus)}>a − m</VizButton>
          <VizButton onClick={() => setA((v) => v + modulus)}>a + m</VizButton>
          <VizButton onClick={() => setB((v) => v - modulus)}>b − m</VizButton>
          <VizButton onClick={() => setB((v) => v + modulus)}>b + m</VizButton>
        </ButtonRow>
        <ButtonRow>
          {PRESETS.map((pr) => (
            <VizButton key={pr.label} onClick={() => { setA(pr.a); setB(pr.b); setModulus(pr.m); }}>
              {pr.label}
            </VizButton>
          ))}
        </ButtonRow>
      </ControlsStack>

      <p className="sr-only" aria-live="polite">
        {a} deja residuo {residueA} y {b} deja residuo {residueB} módulo {modulus}.
        {congruent
          ? ` Por tanto ${a} es congruente con ${b} módulo ${modulus}.`
          : ` No son congruentes módulo ${modulus}.`}
      </p>
    </VizPanel>
  );
}
