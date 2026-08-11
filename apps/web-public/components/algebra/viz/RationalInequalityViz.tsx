'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from './controls';

const ZERO_EPS = 1e-9;

type Op = '<' | '≤' | '>' | '≥';
type PresetId = 'simple' | 'two_den' | 'cancel' | 'pos_den' | 'repeated';

type Factor = { root: number; mult: number };

type Crit = {
  x: number;
  isNum: boolean;
  isDen: boolean;
};

function snap(val: number, min: number, max: number, step: number): number {
  const clamped = Math.min(max, Math.max(min, val));
  const steps = Math.round((clamped - min) / step);
  const snapped = min + steps * step;
  if (Math.abs(snapped) < step / 2) return 0;
  return Number(snapped.toFixed(2));
}

function present(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '—';
  return fmt(Number(n.toFixed(digits)), digits);
}

function isZero(n: number): boolean {
  return Math.abs(n) < ZERO_EPS;
}

function factorLabel(root: number, mult = 1): string {
  const r = present(root);
  const base =
    isZero(root) ? 'x' : root > 0 ? `(x−${r})` : `(x+${present(Math.abs(root))})`;
  return mult > 1 ? `${base}²` : base;
}

function evalFactors(x: number, factors: Factor[]): number {
  let v = 1;
  for (const f of factors) v *= (x - f.root) ** f.mult;
  return v;
}

function signChar(v: number): '+' | '−' | '0' {
  if (Math.abs(v) < ZERO_EPS) return '0';
  return v > 0 ? '+' : '−';
}

function matchesOp(val: number, op: Op): boolean {
  if (op === '>') return val > ZERO_EPS;
  if (op === '≥') return val >= -ZERO_EPS;
  if (op === '<') return val < -ZERO_EPS;
  return val <= ZERO_EPS;
}

type SolPiece =
  | { kind: 'rayLeft'; end: number; closed: boolean }
  | { kind: 'rayRight'; start: number; closed: boolean }
  | { kind: 'interval'; lo: number; hi: number; leftClosed: boolean; rightClosed: boolean }
  | { kind: 'point'; x: number }
  | { kind: 'all' }
  | { kind: 'empty' };

function formatPieces(pieces: SolPiece[]): string {
  if (pieces.some((p) => p.kind === 'all')) return 'ℝ';
  if (pieces.length === 0 || pieces.every((p) => p.kind === 'empty')) return '∅';
  return pieces
    .filter((p) => p.kind !== 'empty')
    .map((p) => {
      if (p.kind === 'point') return `{${present(p.x)}}`;
      if (p.kind === 'rayLeft') {
        return `(−∞,${present(p.end)}${p.closed ? ']' : ')'}`;
      }
      if (p.kind === 'rayRight') {
        return `${p.closed ? '[' : '('}${present(p.start)},∞)`;
      }
      if (p.kind === 'interval') {
        return `${p.leftClosed ? '[' : '('}${present(p.lo)},${present(p.hi)}${p.rightClosed ? ']' : ')'}`;
      }
      return '';
    })
    .filter(Boolean)
    .join('∪');
}

const PRESETS: { id: PresetId; label: string }[] = [
  { id: 'simple', label: '(x−2)/(x+1)' },
  { id: 'two_den', label: '(x−2)/((x−3)(x+1))' },
  { id: 'cancel', label: '(x−1)/((x−1)(x+2))' },
  { id: 'pos_den', label: 'x/(x²+1)' },
  { id: 'repeated', label: '(x+2)/(x−1)²' },
];

/**
 * Rational inequality P(x)/Q(x) □ 0 via critical points and sign chart (ALG-INE-003).
 * Denominator zeros are always excluded from the solution.
 */
export function RationalInequalityViz() {
  const [op, setOp] = useState<Op>('>');
  const [preset, setPreset] = useState<PresetId>('simple');
  const [nRoot, setNRoot] = useState(2);
  const [dRoot, setDRoot] = useState(-1);
  const [dRoot2, setDRoot2] = useState(3);
  const guideId = useId();
  const statusId = useId();

  const { nums, dens, exprP, exprQ, exprFrac, notes } = useMemo(() => {
    if (preset === 'simple') {
      return {
        nums: [{ root: nRoot, mult: 1 }] as Factor[],
        dens: [{ root: dRoot, mult: 1 }] as Factor[],
        exprP: factorLabel(nRoot),
        exprQ: factorLabel(dRoot),
        exprFrac: `${factorLabel(nRoot)}/${factorLabel(dRoot)}`,
        notes: null as string | null,
      };
    }
    if (preset === 'two_den') {
      const densF: Factor[] = [
        { root: dRoot, mult: 1 },
        { root: dRoot2, mult: 1 },
      ];
      return {
        nums: [{ root: nRoot, mult: 1 }] as Factor[],
        dens: densF,
        exprP: factorLabel(nRoot),
        exprQ: densF.map((f) => factorLabel(f.root)).join(''),
        exprFrac: `${factorLabel(nRoot)}/(${densF.map((f) => factorLabel(f.root)).join('')})`,
        notes: null,
      };
    }
    if (preset === 'cancel') {
      return {
        nums: [{ root: 1, mult: 1 }] as Factor[],
        dens: [
          { root: 1, mult: 1 },
          { root: -2, mult: 1 },
        ] as Factor[],
        exprP: '(x−1)',
        exprQ: '(x−1)(x+2)',
        exprFrac: '(x−1)/((x−1)(x+2))',
        notes:
          'Tras cancelar queda 1/(x+2) con dominio x≠1: el factor común no vuelve a admitir x=1.',
      };
    }
    if (preset === 'pos_den') {
      return {
        nums: [{ root: nRoot, mult: 1 }] as Factor[],
        dens: [] as Factor[],
        exprP: factorLabel(nRoot),
        exprQ: 'x²+1',
        exprFrac: `${factorLabel(nRoot)}/(x²+1)`,
        notes: 'x²+1>0 para todo x: no hay ceros del denominador.',
      };
    }
    // repeated
    return {
      nums: [{ root: nRoot, mult: 1 }] as Factor[],
      dens: [{ root: dRoot, mult: 2 }] as Factor[],
      exprP: factorLabel(nRoot),
      exprQ: factorLabel(dRoot, 2),
      exprFrac: `${factorLabel(nRoot)}/${factorLabel(dRoot, 2)}`,
      notes: 'El factor (denominador)² no cambia de signo; solo anula el dominio en su raíz.',
    };
  }, [preset, nRoot, dRoot, dRoot2]);

  // For pos_den, Q = x²+1 conceptually — evaluate with that
  const evalQ = (x: number): number => {
    if (preset === 'pos_den') return x * x + 1;
    return evalFactors(x, dens);
  };
  const evalP = (x: number): number => evalFactors(x, nums);
  const evalR = (x: number): number | null => {
    const q = evalQ(x);
    if (Math.abs(q) < ZERO_EPS) return null;
    return evalP(x) / q;
  };

  const crits: Crit[] = useMemo(() => {
    const map = new Map<number, Crit>();
    const add = (x: number, which: 'num' | 'den') => {
      // snap keys to avoid float duplicates
      let key = x;
      for (const k of map.keys()) {
        if (Math.abs(k - x) < 1e-6) {
          key = k;
          break;
        }
      }
      const cur = map.get(key) ?? { x: key, isNum: false, isDen: false };
      if (which === 'num') cur.isNum = true;
      else cur.isDen = true;
      map.set(key, cur);
    };
    for (const f of nums) add(f.root, 'num');
    for (const f of dens) add(f.root, 'den');
    return [...map.values()].sort((a, b) => a.x - b.x);
  }, [nums, dens]);

  const intervals = useMemo(() => {
    if (crits.length === 0) {
      return [{ lo: -Infinity, hi: Infinity, mid: 0 }];
    }
    const pts = crits.map((c) => c.x);
    const out: { lo: number; hi: number; mid: number }[] = [];
    out.push({ lo: -Infinity, hi: pts[0], mid: pts[0] - 1 });
    for (let i = 0; i < pts.length - 1; i++) {
      out.push({
        lo: pts[i],
        hi: pts[i + 1],
        mid: (pts[i] + pts[i + 1]) / 2,
      });
    }
    out.push({ lo: pts[pts.length - 1], hi: Infinity, mid: pts[pts.length - 1] + 1 });
    return out;
  }, [crits]);

  const signRows = useMemo(() => {
    return intervals.map((iv) => {
      const p = evalP(iv.mid);
      const q = evalQ(iv.mid);
      const r = p / q;
      return {
        ...iv,
        pSign: signChar(p),
        qSign: signChar(q),
        rSign: signChar(r),
        rVal: r,
        ok: matchesOp(r, op),
      };
    });
  }, [intervals, op, nums, dens, preset]);

  const solution = useMemo(() => {
    const pieces: SolPiece[] = [];
    const closedOk = op === '≤' || op === '≥';

    // Build from consecutive ok intervals, merging across includable num zeros
    type Seg = { lo: number; hi: number; leftClosed: boolean; rightClosed: boolean };
    const segs: Seg[] = [];

    for (let i = 0; i < signRows.length; i++) {
      const row = signRows[i];
      if (!row.ok) continue;

      let leftClosed = false;
      let rightClosed = false;

      // Left endpoint
      if (Number.isFinite(row.lo)) {
        const c = crits.find((k) => Math.abs(k.x - row.lo) < 1e-6);
        if (c && c.isNum && !c.isDen && closedOk) {
          const at = evalR(c.x);
          if (at !== null && matchesOp(at, op)) leftClosed = true;
        }
      }

      // Right endpoint
      if (Number.isFinite(row.hi)) {
        const c = crits.find((k) => Math.abs(k.x - row.hi) < 1e-6);
        if (c && c.isNum && !c.isDen && closedOk) {
          const at = evalR(c.x);
          if (at !== null && matchesOp(at, op)) rightClosed = true;
        }
      }

      segs.push({ lo: row.lo, hi: row.hi, leftClosed, rightClosed });
    }

    // Isolated num zeros that satisfy but are not interval ends already covered
    // (e.g. ≤0 with touch) — already handled via closed ends when adjacent ok is false both sides
    if (closedOk) {
      for (const c of crits) {
        if (!c.isNum || c.isDen) continue;
        const at = evalR(c.x);
        if (at === null || !matchesOp(at, op)) continue;
        const covered = segs.some(
          (s) =>
            (Math.abs(s.lo - c.x) < 1e-6 && s.leftClosed) ||
            (Math.abs(s.hi - c.x) < 1e-6 && s.rightClosed),
        );
        if (!covered) {
          // Check neighbors not ok → isolated point
          const leftIv = signRows.find((r) => Math.abs(r.hi - c.x) < 1e-6);
          const rightIv = signRows.find((r) => Math.abs(r.lo - c.x) < 1e-6);
          if ((!leftIv || !leftIv.ok) && (!rightIv || !rightIv.ok)) {
            pieces.push({ kind: 'point', x: c.x });
          }
        }
      }
    }

    for (const s of segs) {
      const leftInf = !Number.isFinite(s.lo);
      const rightInf = !Number.isFinite(s.hi);
      if (leftInf && rightInf) {
        pieces.push({ kind: 'all' });
      } else if (leftInf) {
        pieces.push({ kind: 'rayLeft', end: s.hi, closed: s.rightClosed });
      } else if (rightInf) {
        pieces.push({ kind: 'rayRight', start: s.lo, closed: s.leftClosed });
      } else {
        pieces.push({
          kind: 'interval',
          lo: s.lo,
          hi: s.hi,
          leftClosed: s.leftClosed,
          rightClosed: s.rightClosed,
        });
      }
    }

    // Sort pieces by position
    pieces.sort((a, b) => {
      const key = (p: SolPiece) => {
        if (p.kind === 'all') return -Infinity;
        if (p.kind === 'empty') return Infinity;
        if (p.kind === 'point') return p.x;
        if (p.kind === 'rayLeft') return -1e9;
        if (p.kind === 'rayRight') return p.start;
        return p.lo;
      };
      return key(a) - key(b);
    });

    return pieces.length ? pieces : [{ kind: 'empty' as const }];
  }, [signRows, crits, op, preset, nums, dens]);

  const solText = formatPieces(solution);

  // Number line view
  const lineDom = useMemo(() => {
    if (crits.length === 0) return { lo: -4, hi: 4 };
    const xs = crits.map((c) => c.x);
    const lo = Math.min(...xs);
    const hi = Math.max(...xs);
    const pad = Math.max(2, (hi - lo) * 0.35 + 1.5);
    return { lo: lo - pad, hi: hi + pad };
  }, [crits]);

  const mapX = (x: number) =>
    28 + ((x - lineDom.lo) / (lineDom.hi - lineDom.lo)) * 424;

  const intervalLabel = (lo: number, hi: number) => {
    if (!Number.isFinite(lo) && !Number.isFinite(hi)) return 'ℝ';
    if (!Number.isFinite(lo)) return `(−∞,${present(hi)})`;
    if (!Number.isFinite(hi)) return `(${present(lo)},∞)`;
    return `(${present(lo)},${present(hi)})`;
  };

  const ariaStatus = `${exprFrac}${op}0. Solución ${solText}. Los ceros del denominador nunca se incluyen.`;

  const showNSlider = preset === 'simple' || preset === 'two_den' || preset === 'pos_den' || preset === 'repeated';
  const showDSlider = preset === 'simple' || preset === 'two_den' || preset === 'repeated';
  const showD2Slider = preset === 'two_den';

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Identifica los ceros del numerador y del denominador. Estos puntos dividen la recta en
            intervalos donde el signo del cociente es constante.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Los puntos donde el denominador vale cero nunca pertenecen a la solución. Una desigualdad
            no estricta solo puede incluir ceros del numerador.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Inecuación actual
          </p>
          <p className="mt-2 font-mono text-lg font-semibold">
            {exprFrac}
            {op}0
          </p>
          <p className="mt-1 font-mono text-sm text-[var(--fg-muted)]">
            P(x)={exprP} · Q(x)={exprQ}
          </p>
          {notes ? <p className="mt-2 text-sm text-[var(--fg-muted)]">{notes}</p> : null}
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 text-sm leading-relaxed">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Puntos críticos
          </p>
          <ul className="mt-2 space-y-1">
            {crits.length === 0 ? (
              <li className="text-[var(--fg-muted)]">Sin ceros reales del numerador ni del denominador.</li>
            ) : null}
            {crits.map((c) => (
              <li key={c.x} className="font-mono">
                {c.isNum && !c.isDen ? (
                  <>
                    <span className="font-semibold text-[var(--fg)]">P(x)=0 ⇒ x={present(c.x)}</span>
                    <span className="text-[var(--fg-muted)]">
                      {' '}
                      ({op === '≤' || op === '≥' ? 'incluible si cumple' : 'excluido en desigualdad estricta'})
                    </span>
                  </>
                ) : null}
                {c.isDen && !c.isNum ? (
                  <>
                    <span className="font-semibold text-[var(--fg)]">Q(x)=0 ⇒ x={present(c.x)}</span>
                    <span className="text-[var(--fg-muted)]"> (excluido · dominio)</span>
                  </>
                ) : null}
                {c.isNum && c.isDen ? (
                  <>
                    <span className="font-semibold text-[var(--fg)]">
                      P(x)=Q(x)=0 ⇒ x={present(c.x)}
                    </span>
                    <span className="text-[var(--fg-muted)]"> (excluido · anula el denominador)</span>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Tabla de signos
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] border-collapse text-center font-mono text-xs sm:text-sm">
              <thead>
                <tr className="text-[var(--fg-muted)]">
                  <th className="border border-[var(--border)] px-2 py-1 text-left"> </th>
                  {signRows.map((row) => (
                    <th key={`${row.lo}-${row.hi}`} className="border border-[var(--border)] px-2 py-1">
                      {intervalLabel(row.lo, row.hi)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-[var(--border)] px-2 py-1 text-left">P</td>
                  {signRows.map((row) => (
                    <td key={`p-${row.mid}`} className="border border-[var(--border)] px-2 py-1">
                      {row.pSign}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-[var(--border)] px-2 py-1 text-left">Q</td>
                  {signRows.map((row) => (
                    <td key={`q-${row.mid}`} className="border border-[var(--border)] px-2 py-1">
                      {row.qSign}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-[var(--border)] px-2 py-1 text-left font-semibold">P/Q</td>
                  {signRows.map((row) => (
                    <td
                      key={`r-${row.mid}`}
                      className={`border border-[var(--border)] px-2 py-1 font-semibold ${
                        row.ok ? 'bg-[color-mix(in_oklab,var(--accent-soft)_70%,transparent)]' : ''
                      }`}
                    >
                      {row.rSign}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-[var(--fg-muted)]">
            Celdas resaltadas: el cociente cumple {exprFrac}
            {op}0 en ese intervalo abierto.
          </p>
        </section>

        <section className="rounded-xl border-2 border-[var(--accent-strong)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Recta numérica · conjunto solución
          </p>
          <svg viewBox="0 0 480 90" className="mt-2 h-auto w-full" role="img" aria-labelledby={statusId}>
            {/* Shade solution pieces clipped to view */}
            {solution.map((p, idx) => {
              if (p.kind === 'all') {
                return (
                  <rect key={idx} x={28} y={34} width={424} height={16} fill="var(--accent-soft)" />
                );
              }
              if (p.kind === 'empty') return null;
              if (p.kind === 'point') {
                const cx = mapX(p.x);
                if (cx < 28 || cx > 452) return null;
                return <circle key={idx} cx={cx} cy={42} r={6} fill="orange" />;
              }
              if (p.kind === 'rayLeft') {
                const end = mapX(p.end);
                return (
                  <g key={idx}>
                    <rect x={28} y={34} width={Math.max(0, end - 28)} height={16} fill="var(--accent-soft)" />
                    <circle
                      cx={end}
                      cy={42}
                      r={6}
                      fill={p.closed ? 'orange' : 'var(--formula-bg)'}
                      stroke="orange"
                      strokeWidth={2}
                    />
                  </g>
                );
              }
              if (p.kind === 'rayRight') {
                const start = mapX(p.start);
                return (
                  <g key={idx}>
                    <rect
                      x={start}
                      y={34}
                      width={Math.max(0, 452 - start)}
                      height={16}
                      fill="var(--accent-soft)"
                    />
                    <circle
                      cx={start}
                      cy={42}
                      r={6}
                      fill={p.closed ? 'orange' : 'var(--formula-bg)'}
                      stroke="orange"
                      strokeWidth={2}
                    />
                  </g>
                );
              }
              const x0 = mapX(p.lo);
              const x1 = mapX(p.hi);
              return (
                <g key={idx}>
                  <rect
                    x={x0}
                    y={34}
                    width={Math.max(2, x1 - x0)}
                    height={16}
                    fill="var(--accent-soft)"
                  />
                  <circle
                    cx={x0}
                    cy={42}
                    r={6}
                    fill={p.leftClosed ? 'orange' : 'var(--formula-bg)'}
                    stroke="orange"
                    strokeWidth={2}
                  />
                  <circle
                    cx={x1}
                    cy={42}
                    r={6}
                    fill={p.rightClosed ? 'orange' : 'var(--formula-bg)'}
                    stroke="orange"
                    strokeWidth={2}
                  />
                </g>
              );
            })}

            <line x1={28} y1={42} x2={452} y2={42} stroke="currentColor" strokeWidth={2} opacity={0.5} />

            {crits.map((c) => {
              const cx = mapX(c.x);
              if (c.isDen) {
                return (
                  <g key={`d-${c.x}`}>
                    <circle
                      cx={cx}
                      cy={42}
                      r={7}
                      fill="var(--formula-bg)"
                      stroke="crimson"
                      strokeWidth={2.5}
                      strokeDasharray="3 2"
                    />
                    <text x={cx} y={22} textAnchor="middle" fontSize={11} fontWeight={600} fill="crimson">
                      Q=0
                    </text>
                    <text x={cx} y={72} textAnchor="middle" fontSize={10} fill="currentColor">
                      {present(c.x)}
                    </text>
                  </g>
                );
              }
              return (
                <g key={`n-${c.x}`}>
                  <circle cx={cx} cy={42} r={6} fill="teal" stroke="currentColor" strokeWidth={1} />
                  <text x={cx} y={22} textAnchor="middle" fontSize={11} fontWeight={600} fill="teal">
                    P=0
                  </text>
                  <text x={cx} y={72} textAnchor="middle" fontSize={10} fill="currentColor">
                    {present(c.x)}
                  </text>
                </g>
              );
            })}

            {crits.length === 0 ? (
              <text x={240} y={22} textAnchor="middle" fontSize={12} fill="currentColor">
                sin puntos críticos reales
              </text>
            ) : null}
          </svg>
          <p className="mt-2 text-xs text-[var(--fg-muted)]">
            Teal = cero del numerador · Rojo punteado = cero del denominador (siempre excluido).
          </p>
          <p className="mt-2 font-mono text-sm">
            {exprFrac}
            {op}0 ⇒ x∈{solText}
          </p>
        </section>

        <div
          id={statusId}
          className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_70%,var(--bg-elevated))] px-3 py-2 text-sm leading-relaxed"
          aria-live="polite"
        >
          <p className="font-mono">
            {exprFrac}
            {op}0
            <br />
            Solución: {solText}
          </p>
        </div>

        <p className="sr-only">{ariaStatus}</p>

        <ControlsStack>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
              Ejemplo
            </p>
            <ButtonRow>
              {PRESETS.map((p) => (
                <VizButton
                  key={p.id}
                  active={preset === p.id}
                  onClick={() => {
                    setPreset(p.id);
                    if (p.id === 'simple') {
                      setNRoot(2);
                      setDRoot(-1);
                    } else if (p.id === 'two_den') {
                      setNRoot(2);
                      setDRoot(-1);
                      setDRoot2(3);
                    } else if (p.id === 'repeated') {
                      setNRoot(-2);
                      setDRoot(1);
                    } else if (p.id === 'pos_den') {
                      setNRoot(0);
                    }
                  }}
                >
                  {p.label}
                </VizButton>
              ))}
            </ButtonRow>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
              Desigualdad
            </p>
            <ButtonRow>
              {(['>', '<', '≥', '≤'] as const).map((o) => (
                <VizButton key={o} active={op === o} onClick={() => setOp(o)}>
                  P/Q{o}0
                </VizButton>
              ))}
            </ButtonRow>
          </div>
          {showNSlider ? (
            <SliderRow
              label="cero P"
              ariaLabel={`Cero del numerador, actualmente ${present(nRoot)}`}
              value={nRoot}
              min={-4}
              max={4}
              step={0.1}
              onChange={(val) => setNRoot(snap(val, -4, 4, 0.1))}
            />
          ) : null}
          {showDSlider ? (
            <SliderRow
              label="cero Q"
              ariaLabel={`Cero del denominador, actualmente ${present(dRoot)}`}
              value={dRoot}
              min={-4}
              max={4}
              step={0.1}
              onChange={(val) => setDRoot(snap(val, -4, 4, 0.1))}
            />
          ) : null}
          {showD2Slider ? (
            <SliderRow
              label="cero Q₂"
              ariaLabel={`Segundo cero del denominador, actualmente ${present(dRoot2)}`}
              value={dRoot2}
              min={-4}
              max={4}
              step={0.1}
              onChange={(val) => setDRoot2(snap(val, -4, 4, 0.1))}
            />
          ) : null}
          {preset === 'cancel' ? (
            <p className="text-xs text-[var(--fg-muted)]">
              Ejemplo fijo de simplificación con restricción de dominio persistente (x≠1).
            </p>
          ) : null}
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
