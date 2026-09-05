'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';

type TreeNode = {
  id: string;
  section?: string;
  formula?: string;
  formulaKey?: 'formTrigint' | 'formNumeric';
  example?: string;
  yes?: string;
  no?: string;
};

const Q_KEYS: Record<string, 'qRoot' | 'qUsub' | 'qProduct' | 'qTrig' | 'qRadical' | 'qRational'> = {
  root: 'qRoot',
  'u-sub': 'qUsub',
  product: 'qProduct',
  trig: 'qTrig',
  radical: 'qRadical',
  rational: 'qRational',
};

const TECH_KEYS: Record<
  string,
  'techDirect' | 'techSubst' | 'techParts' | 'techTrigint' | 'techTrigsub' | 'techPartial' | 'techNumeric'
> = {
  direct: 'techDirect',
  subst: 'techSubst',
  parts: 'techParts',
  trigint: 'techTrigint',
  trigsub: 'techTrigsub',
  partial: 'techPartial',
  numeric: 'techNumeric',
};

const NODES: Record<string, TreeNode> = {
  root: {
    id: 'root',
    yes: 'direct',
    no: 'u-sub',
  },
  direct: {
    id: 'direct',
    section: '§2.2',
    formula: '∫ xⁿ dx = xⁿ⁺¹/(n+1) + C   (n ≠ −1)',
    example: '∫ eˣ dx,  ∫ cos(x) dx',
  },
  'u-sub': {
    id: 'u-sub',
    yes: 'subst',
    no: 'product',
  },
  subst: {
    id: 'subst',
    section: '§4',
    formula: '∫ f(g(x)) g′(x) dx = ∫ f(u) du',
    example: '∫ x cos(x²) dx',
  },
  product: {
    id: 'product',
    yes: 'parts',
    no: 'trig',
  },
  parts: {
    id: 'parts',
    section: '§5',
    formula: '∫ u dv = uv − ∫ v du',
    example: '∫ x² eˣ dx',
  },
  trig: {
    id: 'trig',
    yes: 'trigint',
    no: 'radical',
  },
  trigint: {
    id: 'trigint',
    section: '§6',
    formulaKey: 'formTrigint',
    example: '∫ sen³(x) cos²(x) dx',
  },
  radical: {
    id: 'radical',
    yes: 'trigsub',
    no: 'rational',
  },
  trigsub: {
    id: 'trigsub',
    section: '§7',
    formula: 'x = a senθ, a tanθ o a secθ',
    example: '∫ √(a² − x²) dx',
  },
  numeric: {
    id: 'numeric',
    section: '§11',
    formulaKey: 'formNumeric',
    example: '∫ e^(−x²) dx',
  },
  rational: {
    id: 'rational',
    yes: 'partial',
    no: 'numeric',
  },
  partial: {
    id: 'partial',
    section: '§8',
    formula: 'P(x)/Q(x) = A/(x−r) + …',
    example: '∫ (x+1)/(x²−1) dx',
  },
};

const ORDER = ['root', 'u-sub', 'product', 'trig', 'radical', 'rational'] as const;

export function IntegrationDecisionTreeViz() {
  const t = useTranslations('vizCalc');
  const [path, setPath] = useState<string[]>(['root']);
  const [full, setFull] = useState(false);

  const currentId = path[path.length - 1]!;
  const current = NODES[currentId]!;
  const leaf = Boolean(TECH_KEYS[current.id]);

  const questionOf = (n: TreeNode) => {
    const key = Q_KEYS[n.id];
    return key ? t(`tree.${key}`) : undefined;
  };
  const techniqueOf = (n: TreeNode) => {
    const key = TECH_KEYS[n.id];
    return key ? t(`tree.${key}`) : undefined;
  };
  const formulaOf = (n: TreeNode) => {
    if (n.formulaKey) return t(`tree.${n.formulaKey}`);
    return n.formula;
  };
  const nodeText = (n: TreeNode | null | undefined) => {
    if (!n) return '';
    return techniqueOf(n) ?? questionOf(n) ?? '';
  };

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
          <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">{t('tree.idea')}</p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">{t('tree.note')}</p>
        </div>

        <ButtonRow>
          <VizButton onClick={reset}>{t('tree.reset')}</VizButton>
          <VizButton active={full} onClick={() => setFull((v) => !v)}>
            {full ? t('tree.guided') : t('tree.full')}
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
                  <p className="font-medium">{questionOf(n)}</p>
                  <p className="mt-1 text-xs text-[var(--fg-muted)]">
                    <span className="text-green-600">
                      {t('common.yes')} → {nodeText(yes)}
                    </span>
                    {' · '}
                    <span className="text-orange-500">
                      {t('common.no')} → {nodeText(no)}
                    </span>
                  </p>
                </div>
              );
            })}
            <p className="text-xs text-[var(--fg-muted)]">{t('tree.leaves')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <ol className="space-y-2">
              {visible.map((id, i) => {
                const n = NODES[id]!;
                const active = id === currentId;
                const technique = techniqueOf(n);
                return (
                  <li
                    key={`${id}-${i}`}
                    className={`rounded-xl border px-3 py-3 text-sm ${
                      active
                        ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] shadow-sm'
                        : 'border-[var(--border)] bg-[var(--formula-bg)]'
                    }`}
                  >
                    {questionOf(n) ? <p className="font-medium">{questionOf(n)}</p> : null}
                    {technique ? (
                      <div className="space-y-1">
                        <p className="font-semibold text-[var(--accent-strong)]">{technique}</p>
                        <p className="font-mono text-xs">{formulaOf(n)}</p>
                        <p className="text-xs text-[var(--fg-muted)]">{t('tree.seeSection', { section: n.section ?? '' })}</p>
                        <p className="text-xs">
                          {t('tree.example')} {n.example}
                        </p>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ol>
            {!leaf ? (
              <ButtonRow>
                <VizButton onClick={() => answer(true)}>{t('common.yes')}</VizButton>
                <VizButton onClick={() => answer(false)}>{t('common.no')}</VizButton>
              </ButtonRow>
            ) : (
              <p className="text-sm text-[var(--fg-muted)]">{t('tree.arrived')}</p>
            )}
          </div>
        )}
      </div>
    </VizPanel>
  );
}
