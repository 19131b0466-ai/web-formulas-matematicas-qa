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
import { gcd, mod, solveCRT } from './modMath';
import {
  HypothesisCard,
  ModExpr,
  ModularWheel,
  NumberLineMarks,
  StatusBadge,
  StepDetail,
  type WheelNode,
} from './modVizShared';
import { GuideBlock, Segmented } from './transformHelpers';

type Tab = 'clocks' | 'intersection' | 'construction';

const PRESETS = [
  { m1: 3, a: 2, m2: 5, b: 3, label: '3,2 / 5,3 → 8' },
  { m1: 7, a: 3, m2: 5, b: 5, label: '7,3 / 5,0 → 10' },
  { m1: 4, a: 1, m2: 5, b: 3, label: '4,1 / 5,3 → 13' },
  { m1: 6, a: 1, m2: 4, b: 3, label: 'no coprimo → 7' },
  { m1: 6, a: 1, m2: 4, b: 2, label: 'sin solución' },
];

const CONSTRUCTION_STEPS = [
  'Normalizar residuos',
  'Comprobar coprimalidad',
  'Calcular M',
  'Calcular M₁ y M₂',
  'Buscar inversos',
  'Construir selectores',
  'Combinar a y b',
  'Reducir módulo M',
  'Verificar solución',
];

export function ChineseRemainderTheoremVisualizer() {
  const [m1, setM1] = useState(7);
  const [m2, setM2] = useState(5);
  const [a, setA] = useState(3);
  const [b, setB] = useState(5);
  const [activeX, setActiveX] = useState(0);
  const [tab, setTab] = useState<Tab>('clocks');
  const [constructionStep, setConstructionStep] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const result = useMemo(() => solveCRT(m1, a, m2, b), [m1, a, m2, b]);
  const normA = result.hasSolution ? result.normalizedA : mod(a, m1);
  const normB = result.hasSolution ? result.normalizedB : mod(b, m2);
  const g = gcd(m1, m2);

  const r1 = mod(activeX, m1);
  const r2 = mod(activeX, m2);
  const matches = r1 === normA && r2 === normB;

  useEffect(() => {
    if (!isSearching || !result.hasSolution) return;
    if (activeX >= result.x0) {
      setIsSearching(false);
      return;
    }
    const t = setTimeout(() => setActiveX((x) => x + 1), 120);
    return () => clearTimeout(t);
  }, [isSearching, activeX, result]);

  useEffect(() => {
    if (result.hasSolution) {
      setActiveX(result.x0);
    } else {
      setActiveX(0);
    }
    setConstructionStep(0);
  }, [m1, m2, a, b, result]);

  const clockNodes = (modulus: number, target: number, current: number): Record<number, WheelNode> => {
    const n: Record<number, WheelNode> = {};
    for (let i = 0; i < modulus; i++) {
      let role: WheelNode['role'] = 'neutral';
      if (i === target) role = 'target';
      if (i === current) role = matches && i === target ? 'active' : 'result';
      n[i] = { residue: i, role };
    }
    return n;
  };

  const lineMarks = useMemo(() => {
    const marks: { value: number; kind: 'a' | 'b' | 'both' }[] = [];
    const max = result.hasSolution ? result.period * 2 : 60;
    for (let k = 0; normA + k * m1 <= max; k++) {
      const v = normA + k * m1;
      marks.push({ value: v, kind: 'a' });
    }
    for (let k = 0; normB + k * m2 <= max; k++) {
      const v = normB + k * m2;
      const existing = marks.find((m) => m.value === v);
      if (existing) existing.kind = 'both';
      else marks.push({ value: v, kind: 'b' });
    }
    return marks.sort((x, y) => x.value - y.value);
  }, [normA, normB, m1, m2, result]);

  const caption = result.hasSolution
    ? joinCaption(
        `x ≡ ${normA} (mod ${m1}) · x ≡ ${normB} (mod ${m2})`,
        matches ? `x=${activeX} ✓` : `x=${activeX} · (${r1},${r2})`,
        tab === 'construction'
          ? `Paso ${constructionStep + 1}/${CONSTRUCTION_STEPS.length}`
          : `solución x ≡ ${result.x0} (mod ${result.period})`,
      )
    : joinCaption(`Sin solución · gcd(${m1},${m2})=${g}`);

  return (
    <VizPanel caption={caption}>
      <GuideBlock
        idea="Vas a sincronizar dos relojes modulares: buscamos un mismo x que deje el residuo a módulo m₁ y el residuo b módulo m₂."
        tryIt="Cambia los módulos y residuos y observa dónde coinciden ambas secuencias."
      />

      <Segmented
        options={[
          { id: 'clocks', label: 'Dos relojes' },
          { id: 'intersection', label: 'Buscar coincidencia' },
          { id: 'construction', label: 'Cómo se construye' },
        ]}
        value={tab}
        onChange={(id) => setTab(id as Tab)}
      />

      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        <CongruenceBlock label="CONGRUENCIA 1" residue={a} modulus={m1} onResidue={setA} onModulus={setM1} />
        <CongruenceBlock label="CONGRUENCIA 2" residue={b} modulus={m2} onResidue={setB} onModulus={setM2} />
      </div>

      {b !== normB && m2 > 0 ? (
        <p className="mt-1 text-xs text-[var(--fg-muted)]">
          Normalizamos {b} módulo {m2} → {normB} (x ≡ {b} ≡ {normB} (mod {m2}))
        </p>
      ) : null}

      <HypothesisCard>
        <div className="flex flex-wrap gap-3 text-sm">
          <span>
            gcd({m1},{m2})={g}
          </span>
          <StatusBadge
            ok={result.hasSolution}
            okLabel={g === 1 ? 'módulos coprimos ✓' : 'sistema compatible ✓'}
            badLabel="sin solución común"
          />
          {result.hasSolution ? (
            <span>
              Periodo M = {result.period}
              {result.isCoprime ? ` = ${m1}·${m2}` : ''}
            </span>
          ) : null}
        </div>
      </HypothesisCard>

      {tab === 'clocks' ? (
        <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <div className="text-center">
            <p className="mb-1 text-xs text-[var(--fg-muted)]">módulo {m1} · objetivo {normA}</p>
            <ModularWheel modulus={m1} nodes={clockNodes(m1, normA, r1)} size={220} />
            <ModExpr>
              x ≡ {normA} (mod {m1})
            </ModExpr>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <label className="text-sm">
              x ={' '}
              <input
                type="number"
                className="w-16 rounded border border-[var(--border)] bg-[var(--bg)] px-1 font-mono"
                value={activeX}
                onChange={(e) => setActiveX(Number(e.target.value))}
              />
            </label>
            <p className="font-mono text-sm">
              {activeX} mod {m1} = {r1} {r1 === normA ? '✓' : '✗'}
            </p>
            <p className="font-mono text-sm">
              {activeX} mod {m2} = {r2} {r2 === normB ? '✓' : '✗'}
            </p>
            {matches ? (
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">✓ Ambas coinciden</p>
            ) : (
              <p className="text-sm text-[var(--fg-muted)]">Todavía no coincide</p>
            )}
          </div>
          <div className="text-center">
            <p className="mb-1 text-xs text-[var(--fg-muted)]">módulo {m2} · objetivo {normB}</p>
            <ModularWheel modulus={m2} nodes={clockNodes(m2, normB, r2)} size={220} />
            <ModExpr>
              x ≡ {normB} (mod {m2})
            </ModExpr>
          </div>
        </div>
      ) : null}

      {tab === 'intersection' ? (
        <div className="mt-3 space-y-3">
          <NumberLineMarks
            marks={lineMarks}
            solutions={result.hasSolution ? [result.x0, result.x0 + result.period] : []}
            range={[0, result.hasSolution ? result.period * 2 : 60]}
          />
          <div className="grid gap-2 sm:grid-cols-2 text-sm font-mono">
            <p>
              A: {normA}, {normA + m1}, {normA + 2 * m1}, …
            </p>
            <p>
              B: {normB}, {normB + m2}, {normB + 2 * m2}, …
            </p>
          </div>
          {result.hasSolution ? (
            <StepDetail title="Primera solución no negativa">
              <p>x₀ = {result.x0}</p>
              <p>x = {result.x0} + {result.period}k, k ∈ ℤ</p>
              <p>
                x ≡ {result.x0} (mod {result.period})
              </p>
            </StepDetail>
          ) : (
            <p className="text-sm text-[var(--fg-muted)]">Las progresiones no se cruzan.</p>
          )}
          <ButtonRow>
            <VizButton onClick={() => { setActiveX(0); setIsSearching(true); }} disabled={!result.hasSolution}>
              ▶ Buscar primera coincidencia
            </VizButton>
          </ButtonRow>
        </div>
      ) : null}

      {tab === 'construction' && result.hasSolution ? (
        <ConstructionPanel result={result} m1={m1} m2={m2} normA={normA} normB={normB} step={constructionStep} />
      ) : null}

      <ControlsStack>
        <ButtonRow>
          {PRESETS.map((pr) => (
            <VizButton
              key={pr.label}
              onClick={() => {
                setM1(pr.m1);
                setM2(pr.m2);
                setA(pr.a);
                setB(pr.b);
              }}
            >
              {pr.label}
            </VizButton>
          ))}
        </ButtonRow>
      </ControlsStack>

      {tab === 'construction' ? (
        <ButtonRow>
          <VizButton onClick={() => setConstructionStep((s) => Math.max(0, s - 1))}>←</VizButton>
          <VizButton
            onClick={() => setConstructionStep((s) => Math.min(CONSTRUCTION_STEPS.length - 1, s + 1))}
          >
            Resolver paso a paso →
          </VizButton>
        </ButtonRow>
      ) : null}

      <p className="sr-only" aria-live="polite">
        Primera congruencia x ≡ {normA} mod {m1}. Segunda x ≡ {normB} mod {m2}.
        {result.hasSolution
          ? ` Solución x ≡ ${result.x0} mod ${result.period}.`
          : ' No existe solución común.'}
      </p>
    </VizPanel>
  );
}

function CongruenceBlock({
  label,
  residue,
  modulus,
  onResidue,
  onModulus,
}: {
  label: string;
  residue: number;
  modulus: number;
  onResidue: (v: number) => void;
  onModulus: (v: number) => void;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-2">
      <p className="text-xs font-semibold text-[var(--fg-muted)]">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <button type="button" className="rounded border px-2" onClick={() => onResidue(residue - 1)}>
          −
        </button>
        <span className="font-mono">a={residue}</span>
        <button type="button" className="rounded border px-2" onClick={() => onResidue(residue + 1)}>
          +
        </button>
      </div>
      <SliderRow label="m" value={modulus} min={2} max={15} step={1} onChange={onModulus} />
      <ModExpr>
        x ≡ {mod(residue, modulus)} (mod {modulus})
      </ModExpr>
    </div>
  );
}

function ConstructionPanel({
  result,
  m1,
  m2,
  normA,
  normB,
  step,
}: {
  result: Extract<ReturnType<typeof solveCRT>, { hasSolution: true }>;
  m1: number;
  m2: number;
  normA: number;
  normB: number;
  step: number;
}) {
  const xCheck = mod(normA * result.e1 + normB * result.e2, result.period);
  return (
    <div className="mt-3 space-y-2 text-sm">
      {step >= 0 ? (
        <p>
          Sistema: x ≡ {normA} (mod {m1}), x ≡ {normB} (mod {m2})
        </p>
      ) : null}
      {step >= 1 ? <p>gcd({m1},{m2})=1 → módulos coprimos (si aplica)</p> : null}
      {step >= 2 ? <p>M = {result.M}</p> : null}
      {step >= 3 ? (
        <p>
          M₁={result.M1}, M₂={result.M2}
        </p>
      ) : null}
      {step >= 4 ? (
        <p>
          y₁={result.y1} (inverso de M₁ mod m₁), y₂={result.y2}
        </p>
      ) : null}
      {step >= 5 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <p>
            e₁={result.e1}: ({mod(result.e1, m1)}, {mod(result.e1, m2)})
          </p>
          <p>
            e₂={result.e2}: ({mod(result.e2, m1)}, {mod(result.e2, m2)})
          </p>
        </div>
      ) : null}
      {step >= 6 ? (
        <ModExpr>
          x ≡ {normA}·{result.e1} + {normB}·{result.e2} ≡ {xCheck} (mod {result.period})
        </ModExpr>
      ) : null}
      {step >= 7 ? <p>Representante mínimo: x₀ = {result.x0}</p> : null}
      {step >= 8 ? (
        <p>
          Verificación: {result.x0} mod {m1}={mod(result.x0, m1)} ✓, mod {m2}={mod(result.x0, m2)} ✓
        </p>
      ) : null}
    </div>
  );
}
