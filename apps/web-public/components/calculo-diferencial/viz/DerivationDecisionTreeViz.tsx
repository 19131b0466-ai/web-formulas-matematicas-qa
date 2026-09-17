'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';

type TreeNode = {
  id: string;
  section?: string;
  formula?: string;
  example?: string;
  yes?: string;
  no?: string;
};

const Q_KEYS: Record<
  string,
  | 'qRoot'
  | 'qProduct'
  | 'qQuotient'
  | 'qChain'
  | 'qImplicit'
  | 'qLog'
  | 'qOptimize'
  | 'qApprox'
> = {
  root: 'qRoot',
  'product-q': 'qProduct',
  'quotient-q': 'qQuotient',
  'chain-q': 'qChain',
  'implicit-q': 'qImplicit',
  'log-q': 'qLog',
  'optimize-q': 'qOptimize',
  'approx-q': 'qApprox',
};

const TECH_KEYS: Record<
  string,
  | 'techLhopital'
  | 'techProduct'
  | 'techQuotient'
  | 'techChain'
  | 'techImplicit'
  | 'techLog'
  | 'techOptimize'
  | 'techLinear'
  | 'techPower'
> = {
  lhopital: 'techLhopital',
  product: 'techProduct',
  quotient: 'techQuotient',
  chain: 'techChain',
  implicit: 'techImplicit',
  log_diff: 'techLog',
  optimize: 'techOptimize',
  linear: 'techLinear',
  power: 'techPower',
};

const NODES: Record<string, TreeNode> = {
  root: { id: 'root', yes: 'lhopital', no: 'product-q' },
  lhopital: {
    id: 'lhopital',
    section: '§12',
    formula: "lim f/g = lim f′/g′  (formas 0/0 o ∞/∞)",
    example: 'lim (eˣ−1)/x  cuando x→0',
  },
  'product-q': { id: 'product-q', yes: 'product', no: 'quotient-q' },
  product: {
    id: 'product',
    section: '§5',
    formula: '(fg)′ = f′g + fg′',
    example: 'd/dx [x² sin x]',
  },
  'quotient-q': { id: 'quotient-q', yes: 'quotient', no: 'chain-q' },
  quotient: {
    id: 'quotient',
    section: '§5',
    formula: '(f/g)′ = (f′g − fg′)/g²',
    example: 'd/dx [(x²+1)/(x−1)]',
  },
  'chain-q': { id: 'chain-q', yes: 'chain', no: 'implicit-q' },
  chain: {
    id: 'chain',
    section: '§5',
    formula: '(f∘g)′(x) = f′(g(x)) · g′(x)',
    example: 'd/dx [sin(x²)]',
  },
  'implicit-q': { id: 'implicit-q', yes: 'implicit', no: 'log-q' },
  implicit: {
    id: 'implicit',
    section: '§13',
    formula: 'F(x,y)=0 → dy/dx = −F_x/F_y',
    example: 'x² + y² = 25',
  },
  'log-q': { id: 'log-q', yes: 'log_diff', no: 'optimize-q' },
  log_diff: {
    id: 'log_diff',
    section: '§5',
    formula: 'ln y = g(x) ln f(x) → derivar ambos lados',
    example: 'y = x^x',
  },
  'optimize-q': { id: 'optimize-q', yes: 'optimize', no: 'approx-q' },
  optimize: {
    id: 'optimize',
    section: '§9',
    formula: 'f′(x)=0 en (a,b) + comparar con f(a), f(b)',
    example: 'área máxima con perímetro fijo',
  },
  'approx-q': { id: 'approx-q', yes: 'linear', no: 'power' },
  linear: {
    id: 'linear',
    section: '§10',
    formula: 'L(x) = f(a) + f′(a)(x−a)',
    example: '√x ≈ 2 + (x−4)/4 cerca de 4',
  },
  power: {
    id: 'power',
    section: '§5',
    formula: 'd/dx [xⁿ] = n xⁿ⁻¹',
    example: 'd/dx [x⁵] = 5x⁴',
  },
};

const ORDER = [
  'root',
  'product-q',
  'quotient-q',
  'chain-q',
  'implicit-q',
  'log-q',
  'optimize-q',
  'approx-q',
] as const;

export function DerivationDecisionTreeViz() {
  const t = useTranslations('vizDif.tree');
  const tc = useTranslations('vizCalc.common');
  const [path, setPath] = useState<string[]>(['root']);
  const [full, setFull] = useState(false);

  const currentId = path[path.length - 1]!;
  const current = NODES[currentId]!;
  const leaf = Boolean(TECH_KEYS[current.id]);

  const questionOf = (n: TreeNode) => {
    const key = Q_KEYS[n.id];
    return key ? t(key) : undefined;
  };
  const techniqueOf = (n: TreeNode) => {
    const key = TECH_KEYS[n.id];
    return key ? t(key) : undefined;
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
          <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">{t('idea')}</p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">{t('note')}</p>
        </div>

        <ButtonRow>
          <VizButton onClick={reset}>{t('reset')}</VizButton>
          <VizButton active={full} onClick={() => setFull((v) => !v)}>
            {full ? t('guided') : t('full')}
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
                      {tc('yes')} → {nodeText(yes)}
                    </span>
                    {' · '}
                    <span className="text-orange-500">
                      {tc('no')} → {nodeText(no)}
                    </span>
                  </p>
                </div>
              );
            })}
            <p className="text-xs text-[var(--fg-muted)]">{t('leaves')}</p>
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
                        <p className="font-mono text-xs">{n.formula}</p>
                        <p className="text-xs text-[var(--fg-muted)]">
                          {t('seeSection', { section: n.section ?? '' })}
                        </p>
                        <p className="text-xs">
                          {t('example')} {n.example}
                        </p>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ol>
            {!leaf ? (
              <ButtonRow>
                <VizButton onClick={() => answer(true)}>{tc('yes')}</VizButton>
                <VizButton onClick={() => answer(false)}>{tc('no')}</VizButton>
              </ButtonRow>
            ) : (
              <p className="text-sm text-[var(--fg-muted)]">{t('arrived')}</p>
            )}
          </div>
        )}
      </div>
    </VizPanel>
  );
}
