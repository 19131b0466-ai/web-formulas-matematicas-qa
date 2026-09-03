'use client';

import { useMemo, useState } from 'react';
import { ButtonRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';

type TreeNode = {
  id: string;
  question?: string;
  technique?: string;
  section?: string;
  formula?: string;
  example?: string;
  yes?: string;
  no?: string;
};

const NODES: Record<string, TreeNode> = {
  root: {
    id: 'root',
    question: '¿Es inmediata (tabla básica)?',
    yes: 'direct',
    no: 'u-sub',
  },
  direct: {
    id: 'direct',
    technique: 'Fórmula directa',
    section: '§2.2',
    formula: '∫ xⁿ dx = xⁿ⁺¹/(n+1) + C   (n ≠ −1)',
    example: '∫ eˣ dx,  ∫ cos(x) dx',
  },
  'u-sub': {
    id: 'u-sub',
    question: '¿Hay u = g(x) con g′(x) visible?',
    yes: 'subst',
    no: 'product',
  },
  subst: {
    id: 'subst',
    technique: 'Sustitución u',
    section: '§4',
    formula: '∫ f(g(x)) g′(x) dx = ∫ f(u) du',
    example: '∫ x cos(x²) dx',
  },
  product: {
    id: 'product',
    question: '¿Es un producto de dos tipos distintos?',
    yes: 'parts',
    no: 'trig',
  },
  parts: {
    id: 'parts',
    technique: 'Integración por partes (LIATE)',
    section: '§5',
    formula: '∫ u dv = uv − ∫ v du',
    example: '∫ x² eˣ dx',
  },
  trig: {
    id: 'trig',
    question: '¿Contiene potencias de sen/cos?',
    yes: 'trigint',
    no: 'radical',
  },
  trigint: {
    id: 'trigint',
    technique: 'Integrales trigonométricas',
    section: '§6',
    formula: 'Identidades de reducción / paridad de exponentes',
    example: '∫ sen³(x) cos²(x) dx',
  },
  radical: {
    id: 'radical',
    question: '¿Contiene √(a²±x²) o √(x²−a²)?',
    yes: 'trigsub',
    no: 'rational',
  },
  trigsub: {
    id: 'trigsub',
    technique: 'Sustitución trigonométrica',
    section: '§7',
    formula: 'x = a senθ, a tanθ o a secθ',
    example: '∫ √(a² − x²) dx',
  },
  rational: {
    id: 'rational',
    question: '¿Es una fracción polinomial (racional)?',
    yes: 'partial',
    no: 'numeric',
  },
  partial: {
    id: 'partial',
    technique: 'Fracciones parciales',
    section: '§8',
    formula: 'P(x)/Q(x) = A/(x−r) + …',
    example: '∫ (x+1)/(x²−1) dx',
  },
  numeric: {
    id: 'numeric',
    technique: 'Numérica / combinación de métodos',
    section: '§11',
    formula: 'Trapecio o Simpson si no hay antiderivada elemental',
    example: '∫ e^(−x²) dx',
  },
};

const ORDER = ['root', 'u-sub', 'product', 'trig', 'radical', 'rational'] as const;

export function IntegrationDecisionTreeViz() {
  const [path, setPath] = useState<string[]>(['root']);
  const [full, setFull] = useState(false);

  const currentId = path[path.length - 1]!;
  const current = NODES[currentId]!;
  const leaf = Boolean(current.technique);

  const visible = useMemo(() => {
    if (full) return Object.keys(NODES);
    return path;
  }, [full, path]);

  const answer = (yes: boolean) => {
    if (!current.yes || !current.no) return;
    const next = yes ? current.yes : current.no;
    setPath((p) => [...p, next]);
  };

  const reset = () => {
    setPath(['root']);
    setFull(false);
  };

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            No hay una técnica universal: lo importante es reconocer la forma del integrando. El árbol replica las preguntas que uno se hace al integrar.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Practica con ∫ x² eˣ dx: ¿qué responderías en cada paso?
          </p>
        </div>

        <ButtonRow>
          <VizButton onClick={reset}>Reiniciar</VizButton>
          <VizButton active={full} onClick={() => setFull((v) => !v)}>
            {full ? 'Vista guiada' : 'Ver árbol completo'}
          </VizButton>
        </ButtonRow>

        {full ? (
          <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-sm">
            {ORDER.map((id) => {
              const n = NODES[id]!;
              const yes = n.yes ? NODES[n.yes] : null;
              const no = n.no ? NODES[n.no] : null;
              return (
                <div key={id} className="rounded-lg border border-[var(--border)] px-3 py-2">
                  <p className="font-medium">{n.question}</p>
                  <p className="mt-1 text-xs text-[var(--fg-muted)]">
                    <span className="text-green-600">SÍ → {yes?.technique ?? yes?.question}</span>
                    {' · '}
                    <span className="text-orange-500">NO → {no?.technique ?? no?.question}</span>
                  </p>
                </div>
              );
            })}
            <p className="text-xs text-[var(--fg-muted)]">
              Hojas: fórmula directa §2.2 · sustitución §4 · partes §5 · trig §6 · sust. trig. §7 · parciales §8 · numérica §11
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <ol className="space-y-2">
              {visible.map((id, i) => {
                const n = NODES[id]!;
                const active = id === currentId;
                return (
                  <li
                    key={`${id}-${i}`}
                    className={`rounded-xl border px-3 py-3 text-sm ${
                      active
                        ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] shadow-sm'
                        : 'border-[var(--border)] bg-[var(--formula-bg)]'
                    }`}
                  >
                    {n.question ? <p className="font-medium">{n.question}</p> : null}
                    {n.technique ? (
                      <div className="space-y-1">
                        <p className="font-semibold text-[var(--accent-strong)]">{n.technique}</p>
                        <p className="font-mono text-xs">{n.formula}</p>
                        <p className="text-xs text-[var(--fg-muted)]">Ver sección {n.section} del formulario</p>
                        <p className="text-xs">Ejemplo: {n.example}</p>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ol>
            {!leaf ? (
              <ButtonRow>
                <VizButton onClick={() => answer(true)}>SÍ</VizButton>
                <VizButton onClick={() => answer(false)}>NO</VizButton>
              </ButtonRow>
            ) : (
              <p className="text-sm text-[var(--fg-muted)]">Llegaste a una técnica. Reinicia para otro integrando.</p>
            )}
          </div>
        )}
      </div>
    </VizPanel>
  );
}
