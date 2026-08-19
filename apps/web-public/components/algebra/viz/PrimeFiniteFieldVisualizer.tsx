'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  ToggleRow,
  VizButton,
  VizPanel,
  joinCaption,
} from './controls';
import {
  FIELD_PRIMES,
  additiveInverse,
  buildCayleyTable,
  buildMultiplicativeInverses,
  formatFieldLabel,
  formatFieldSet,
  modInverse,
  multiplyMod,
  quotientRemainder,
  uniqueInversePairs,
} from './modMath';
import { HypothesisCard, ModExpr, StatusBadge } from './modVizShared';
import { Badge, CollapsibleEdit, GuideBlock, Segmented } from './transformHelpers';

type Tab = 'add' | 'mul' | 'inverses';
type OpTab = 'add' | 'mul';

const PRESETS = [
  { p: 2, row: 1, col: 1, label: '𝔽₂' },
  { p: 3, row: 1, col: 2, label: '𝔽₃' },
  { p: 5, row: 2, col: 3, label: '𝔽₅' },
  { p: 7, row: 3, col: 4, label: '𝔽₇' },
  { p: 5, row: 2, col: 3, tab: 'mul' as Tab, label: '2⁻¹=3' },
  { p: 5, row: 2, col: 3, tab: 'add' as Tab, label: 'opuesto e inverso' },
];

function clampSelection(row: number, col: number, modulus: number): [number, number] {
  const max = Math.max(0, modulus - 1);
  return [Math.min(Math.max(0, row), max), Math.min(Math.max(0, col), max)];
}

export function PrimeFiniteFieldVisualizer() {
  const [p, setP] = useState(5);
  const [tab, setTab] = useState<Tab>('add');
  const [sel, setSel] = useState<[number, number]>([2, 3]);
  const [showIdentity, setShowIdentity] = useState(false);
  const [showOpposites, setShowOpposites] = useState(false);
  const [showInverses, setShowInverses] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchCol, setSearchCol] = useState(0);
  const [showWhyPrime, setShowWhyPrime] = useState(false);
  const [showBodyProps, setShowBodyProps] = useState(false);

  const identity = tab === 'add' ? 0 : 1;
  const opSymbol = tab === 'add' ? '+' : '·';
  const target = tab === 'add' ? 0 : 1;

  const addTable = useMemo(() => buildCayleyTable('add', p), [p]);
  const mulTable = useMemo(() => buildCayleyTable('mul', p), [p]);
  const table = tab === 'add' ? addTable : mulTable;

  const [row, col] = clampSelection(sel[0], sel[1], p);
  const raw = tab === 'add' ? row + col : row * col;
  const result = table[row]?.[col] ?? 0;
  const { q } = quotientRemainder(raw, p);

  const invPairs = useMemo(() => buildMultiplicativeInverses(p), [p]);
  const uniquePairs = useMemo(() => uniqueInversePairs(p), [p]);
  const oppOf = useCallback((a: number) => additiveInverse(a, p), [p]);
  const mulInvOf = useCallback((a: number) => (a === 0 ? null : modInverse(a, p)), [p]);

  const oppositeHighlight = useMemo(() => {
    if (!showOpposites || tab !== 'add') return new Set<string>();
    const s = new Set<string>();
    for (let a = 0; a < p; a++) {
      const inv = oppOf(a);
      s.add(`${a}-${inv}`);
    }
    return s;
  }, [showOpposites, tab, p, oppOf]);

  const inverseHighlight = useMemo(() => {
    if (!showInverses || tab !== 'mul') return new Set<string>();
    const s = new Set<string>();
    for (let a = 1; a < p; a++) {
      const inv = mulInvOf(a);
      if (inv !== null) s.add(`${a}-${inv}`);
    }
    return s;
  }, [showInverses, tab, p, mulInvOf]);

  const searchTargetCol = useMemo(() => {
    if (tab === 'add') return oppOf(row);
    if (row === 0) return null;
    return mulInvOf(row);
  }, [tab, row, oppOf, mulInvOf]);

  useEffect(() => {
    setShowOpposites(false);
    setShowInverses(false);
    setIsSearching(false);
    setSearchCol(0);
  }, [tab, p]);

  useEffect(() => {
    setSel(([r, c]) => {
      const next = clampSelection(r, c, p);
      return r === next[0] && c === next[1] ? [r, c] : next;
    });
  }, [p]);

  useEffect(() => {
    if (!isSearching) return;
    const goal = searchTargetCol;
    if (goal === null) {
      setIsSearching(false);
      return;
    }
    if (searchCol >= goal) {
      setSel([row, goal]);
      setIsSearching(false);
      return;
    }
    const t = setTimeout(() => setSearchCol((c) => c + 1), 380);
    return () => clearTimeout(t);
  }, [isSearching, searchCol, searchTargetCol, row]);

  const propertyNote = useMemo(() => {
    if (tab === 'inverses') return null;
    if (tab === 'add' && result === 0 && row !== 0) {
      return `${col} es el opuesto aditivo de ${row} en ${formatFieldLabel(p)}.`;
    }
    if (tab === 'mul' && result === 1 && row !== 0) {
      return `${col} es el inverso multiplicativo de ${row} en ${formatFieldLabel(p)}.`;
    }
    if (tab === 'mul' && row === 0) {
      return '0 no tiene inverso multiplicativo.';
    }
    return null;
  }, [tab, result, row, col, p]);

  const caption = joinCaption(
    formatFieldSet(p),
    tab === 'inverses'
      ? `${invPairs.length} inversos no nulos`
      : `${row} ${opSymbol} ${col} = ${raw} · ${raw} mod ${p} = ${result}`,
    propertyNote ?? undefined,
  );

  const startSearch = () => {
    setSearchCol(0);
    setIsSearching(true);
  };

  return (
    <VizPanel caption={caption}>
      <GuideBlock
        idea="Vas a explorar cómo se comportan la suma y el producto dentro de 𝔽ₚ. Como p es primo, cada elemento distinto de 0 tiene inverso multiplicativo."
        tryIt="Selecciona una fila y una columna para calcular la operación, o busca el 0 y el 1 para descubrir opuestos e inversos."
      />

      <HypothesisCard>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-mono text-base">{formatFieldSet(p)}</span>
          <label className="flex items-center gap-2">
            <span className="text-[var(--fg-muted)]">p =</span>
            <select
              className="rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-mono"
              value={p}
              onChange={(e) => {
                const next = Number(e.target.value);
                setP(next);
                setSel(([r, c]) => clampSelection(r, c, next));
              }}
            >
              {FIELD_PRIMES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <StatusBadge ok okLabel="primo ✓" badLabel="" />
        </div>
      </HypothesisCard>

      <Segmented
        options={[
          { id: 'add', label: 'Suma' },
          { id: 'mul', label: 'Producto' },
          { id: 'inverses', label: 'Inversos' },
        ]}
        value={tab}
        onChange={(id) => setTab(id as Tab)}
      />

      {tab === 'inverses' ? (
        <InversesView p={p} pairs={invPairs} uniquePairs={uniquePairs} />
      ) : (
        <div className="mt-3 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <CayleyTable
            p={p}
            table={table}
            tab={tab}
            sel={[row, col]}
            onSelect={setSel}
            identity={identity}
            showIdentity={showIdentity}
            oppositeHighlight={oppositeHighlight}
            inverseHighlight={inverseHighlight}
            isSearching={isSearching}
            searchRow={row}
            searchCol={searchCol}
            target={target}
          />
          <OperationPanel
            p={p}
            tab={tab}
            row={row}
            col={isSearching ? Math.min(searchCol, p - 1) : col}
            raw={
              tab === 'add'
                ? row + (isSearching ? Math.min(searchCol, p - 1) : col)
                : row * (isSearching ? Math.min(searchCol, p - 1) : col)
            }
            result={table[row]?.[isSearching ? Math.min(searchCol, p - 1) : col] ?? 0}
            q={quotientRemainder(
              tab === 'add'
                ? row + (isSearching ? Math.min(searchCol, p - 1) : col)
                : row * (isSearching ? Math.min(searchCol, p - 1) : col),
              p,
            ).q}
            propertyNote={propertyNote}
            searching={isSearching}
          />
        </div>
      )}

      {tab !== 'inverses' ? (
        <ControlsStack>
          <div className="flex flex-wrap gap-4">
            {tab === 'add' ? (
              <ToggleRow label="Mostrar identidad (0)" checked={showIdentity} onChange={setShowIdentity} />
            ) : (
              <ToggleRow label="Mostrar identidad (1)" checked={showIdentity} onChange={setShowIdentity} />
            )}
            {tab === 'add' ? (
              <ToggleRow label="Mostrar opuestos" checked={showOpposites} onChange={setShowOpposites} />
            ) : (
              <ToggleRow label="Mostrar inversos" checked={showInverses} onChange={setShowInverses} />
            )}
          </div>
          <ButtonRow>
            <VizButton onClick={startSearch} disabled={tab === 'mul' && row === 0}>
              {tab === 'add' ? '▶ Buscar opuesto' : '▶ Buscar inverso'}
            </VizButton>
            {PRESETS.map((pr) => (
              <VizButton
                key={pr.label}
                onClick={() => {
                  setP(pr.p);
                  if (pr.tab) setTab(pr.tab);
                  setSel(clampSelection(pr.row ?? sel[0], pr.col ?? sel[1], pr.p));
                }}
              >
                {pr.label}
              </VizButton>
            ))}
          </ButtonRow>
        </ControlsStack>
      ) : null}

      <CollapsibleEdit
        label="¿Por qué es un cuerpo?"
        open={showBodyProps}
        onToggle={() => setShowBodyProps((v) => !v)}
      >
        <ul className="space-y-1 p-2 text-sm">
          <li>✓ suma cerrada en {formatFieldLabel(p)}</li>
          <li>✓ producto cerrado</li>
          <li>✓ identidad aditiva: 0</li>
          <li>✓ identidad multiplicativa: 1</li>
          <li>✓ cada elemento tiene opuesto</li>
          <li>✓ cada elemento no nulo tiene inverso</li>
        </ul>
        <p className="border-t border-[var(--border)] p-2 text-sm font-medium">
          Conclusión: {formatFieldLabel(p)} es un cuerpo.
        </p>
      </CollapsibleEdit>

      <CollapsibleEdit
        label="¿Por qué p debe ser primo?"
        open={showWhyPrime}
        onToggle={() => setShowWhyPrime((v) => !v)}
      >
        <WhyPrimeComparison />
      </CollapsibleEdit>

      <p className="sr-only" aria-live="polite">
        Campo {formatFieldLabel(p)}.{' '}
        {tab === 'inverses'
          ? `Inversos multiplicativos en ${formatFieldLabel(p)}.`
          : `Fila ${row}, columna ${col}. Resultado ${result}.`}
        {propertyNote ? ` ${propertyNote}` : ''}
      </p>
    </VizPanel>
  );
}

function CayleyTable({
  p,
  table,
  tab,
  sel,
  onSelect,
  identity,
  showIdentity,
  oppositeHighlight,
  inverseHighlight,
  isSearching,
  searchRow,
  searchCol,
  target,
}: {
  p: number;
  table: number[][];
  tab: OpTab;
  sel: [number, number];
  onSelect: (v: [number, number]) => void;
  identity: number;
  showIdentity: boolean;
  oppositeHighlight: Set<string>;
  inverseHighlight: Set<string>;
  isSearching: boolean;
  searchRow: number;
  searchCol: number;
  target: number;
}) {
  const [row, col] = sel;
  const opLabel = tab === 'add' ? '+' : '·';
  const cellSize = p <= 7 ? 'h-10 w-10 min-w-[2.5rem] text-sm' : 'h-9 w-9 min-w-[2.25rem] text-xs';

  return (
    <div className="max-h-[70vh] overflow-auto rounded-lg border border-[var(--border)]">
      <table className="border-collapse font-mono">
        <thead>
          <tr>
            <th className="sticky left-0 top-0 z-20 bg-[var(--formula-bg)] p-1 text-[var(--fg-muted)]">
              {opLabel}
            </th>
            {Array.from({ length: p }, (_, j) => (
              <th
                key={j}
                className={`sticky top-0 z-10 bg-[var(--formula-bg)] p-1 ${
                  j === col || (isSearching && j === searchCol) ? 'bg-[var(--accent-soft)] text-[var(--accent-strong)]' : ''
                } ${showIdentity && j === identity ? 'font-bold text-[var(--accent-strong)]' : 'text-[var(--fg-muted)]'}`}
              >
                {j}
                {showIdentity && j === identity ? (
                  <span className="ml-0.5 text-[9px] font-normal">id</span>
                ) : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.map((r, i) => (
            <tr key={i}>
              <th
                className={`sticky left-0 z-10 bg-[var(--formula-bg)] p-1 ${
                  i === row || (isSearching && i === searchRow) ? 'bg-[var(--accent-soft)] text-[var(--accent-strong)]' : ''
                } ${showIdentity && i === identity ? 'font-bold text-[var(--accent-strong)]' : 'text-[var(--fg-muted)]'}`}
              >
                {i}
                {showIdentity && i === identity ? (
                  <span className="ml-0.5 text-[9px] font-normal">id</span>
                ) : null}
              </th>
              {r.map((val, j) => {
                const key = `${i}-${j}`;
                const isSel = i === row && j === col && !isSearching;
                const isSearchCell = isSearching && i === searchRow && j === searchCol;
                const isOpp = oppositeHighlight.has(key);
                const isInv = inverseHighlight.has(key);
                const isIdRowCol = showIdentity && (i === identity || j === identity);
                const isTarget = val === target && (isOpp || isInv || isSearchCell);
                return (
                  <td key={j} className="p-0.5">
                    <button
                      type="button"
                      title={`${i} ${opLabel} ${j} ≡ ${val} (mod ${p})`}
                      className={`${cellSize} rounded border transition ${
                        isSel
                          ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] font-bold text-[var(--accent-strong)]'
                          : isSearchCell
                            ? 'border-orange-500/60 bg-orange-500/15 font-bold'
                            : isTarget
                              ? 'border-orange-500/50 bg-orange-500/10 font-semibold'
                              : isIdRowCol
                                ? 'border-[var(--border)] bg-[var(--accent-soft)]/30'
                                : 'border-transparent hover:border-[var(--border)] hover:bg-[var(--accent-soft)]/40'
                      } ${i === row || j === col ? 'ring-1 ring-[var(--accent-strong)]/20' : ''}`}
                      onClick={() => onSelect([i, j])}
                    >
                      {val}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OperationPanel({
  p,
  tab,
  row,
  col,
  raw,
  result,
  q,
  propertyNote,
  searching,
}: {
  p: number;
  tab: OpTab;
  row: number;
  col: number;
  raw: number;
  result: number;
  q: number;
  propertyNote: string | null;
  searching: boolean;
}) {
  const op = tab === 'add' ? '+' : '·';
  const field = formatFieldLabel(p);

  return (
    <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
        {searching ? 'Buscando…' : 'Operación seleccionada'}
      </p>
      <p className="text-[var(--fg-muted)]">
        Fila {row} {op} columna {col}
      </p>
      <ModExpr>
        {row} {op} {col}
      </ModExpr>
      <ModExpr>{raw}</ModExpr>
      <p className="text-center text-xs text-[var(--fg-muted)]">
        {raw} = {q}·{p} + {result}
      </p>
      <ModExpr>
        {raw} mod {p} = {result}
      </ModExpr>
      <p className="text-center font-mono text-[var(--accent-strong)]">
        {row} {op} {col} = {result} en {field}
      </p>
      <p className="text-center text-xs text-[var(--fg-muted)]">
        {result} ∈ {field}
      </p>
      {propertyNote ? (
        <div className="rounded-lg border border-emerald-600/40 bg-emerald-500/10 px-2 py-2 text-center text-sm text-emerald-800 dark:text-emerald-300">
          {propertyNote}
        </div>
      ) : null}
      {tab === 'add' && row !== 0 && result === 0 ? (
        <p className="text-xs text-[var(--fg-muted)]">
          Opuesto de {row}: {col} porque {row}+{col}≡0 (mod {p}). Inverso ≠ opuesto en general.
        </p>
      ) : null}
      {tab === 'mul' && row !== 0 && result === 1 ? (
        <p className="text-xs text-[var(--fg-muted)]">
          {row}⁻¹ = {col} en {field} porque {row}·{col}≡1 (mod {p}).
        </p>
      ) : null}
    </div>
  );
}

function InversesView({
  p,
  pairs,
  uniquePairs,
}: {
  p: number;
  pairs: { a: number; inv: number }[];
  uniquePairs: { a: number; inv: number }[];
}) {
  const field = formatFieldLabel(p);

  return (
    <div className="mt-3 space-y-4">
      <p className="text-center text-sm text-[var(--fg-muted)]">
        Inversos multiplicativos en {field}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {pairs.map(({ a, inv }) => (
          <div
            key={a}
            className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 font-mono text-sm"
          >
            <span>{a}</span>
            <span className="text-[var(--fg-muted)]">→</span>
            <span className="text-[var(--accent-strong)]">{inv}</span>
            {a === inv ? <Badge tone="neutral">autoinverso</Badge> : null}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 py-2">
        {uniquePairs.map(({ a, inv }) => (
          <div key={`${a}-${inv}`} className="flex items-center gap-2 font-mono text-lg">
            <span className="rounded-lg border border-[var(--border)] px-3 py-1">{a}</span>
            <span className="text-[var(--fg-muted)]">↔</span>
            <span className="rounded-lg border border-[var(--accent-strong)]/40 bg-[var(--accent-soft)] px-3 py-1">
              {inv}
            </span>
            <span className="text-xs text-[var(--fg-muted)]" title={`${a}·${inv}≡1 (mod ${p})`}>
              {a}·{inv}≡1
            </span>
          </div>
        ))}
      </div>
      <p className="text-center text-sm">
        0 — <span className="text-[var(--fg-muted)]">no tiene inverso multiplicativo</span>
      </p>
      <p className="text-center text-xs text-[var(--fg-muted)]">
        Cada fila no nula de la tabla de producto contiene exactamente un 1.
      </p>
    </div>
  );
}

function WhyPrimeComparison() {
  const comp = 6;
  const a = 2;
  const products = Array.from({ length: comp }, (_, x) => multiplyMod(a, x, comp));
  const hasInverse = modInverse(a, comp) !== null;

  return (
    <div className="grid gap-3 p-2 sm:grid-cols-2 text-sm">
      <div className="rounded-lg border border-emerald-600/30 bg-emerald-500/5 p-3">
        <p className="font-medium">{formatFieldLabel(5)}</p>
        <p className="mt-1 font-mono text-xs">2·3 ≡ 1 (mod 5)</p>
        <p className="mt-1 text-emerald-700 dark:text-emerald-300">2⁻¹ = 3 ✓</p>
        <p className="mt-1 text-xs text-[var(--fg-muted)]">Todos los no nulos tienen inverso.</p>
      </div>
      <div className="rounded-lg border border-[var(--border)] p-3">
        <p className="font-medium">ℤ/6ℤ (módulo 6)</p>
        <div className="mt-1 font-mono text-xs">
          {products.map((r, x) => (
            <p key={x}>
              2·{x} → {r}
            </p>
          ))}
        </div>
        <p className="mt-1 text-[var(--fg-muted)]">{hasInverse ? '' : '1 nunca aparece → sin inverso'}</p>
        <p className="mt-1 font-mono text-xs">2·3 = 6 ≡ 0 (mod 6)</p>
        <p className="mt-1 text-xs text-[var(--fg-muted)]">Divisores de cero: no es cuerpo.</p>
      </div>
    </div>
  );
}
