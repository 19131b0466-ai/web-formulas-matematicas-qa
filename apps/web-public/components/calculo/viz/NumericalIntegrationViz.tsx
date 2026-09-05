'use client';

import { useId, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, ToggleRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { fmt, integrate, safeEval } from './calcMath';

type FnOpt = { label: string; f: (x: number) => number; aDefault: number; bDefault: number };
const FNS: FnOpt[] = [
  { label: 'x²', f: (x) => x * x, aDefault: 0, bDefault: 2 },
  { label: 'sen(x)', f: (x) => Math.sin(x), aDefault: 0, bDefault: Math.PI },
  { label: 'eˣ', f: (x) => Math.exp(x), aDefault: 0, bDefault: 1 },
  { label: '1/x', f: (x) => 1 / x, aDefault: 1, bDefault: 4 },
  { label: '√x', f: (x) => Math.sqrt(Math.max(0, x)), aDefault: 0, bDefault: 4 },
];

type Mode = 'trap' | 'simp' | 'both';

const W = 520;
const H = 280;
const M = { l: 44, r: 16, t: 16, b: 36 };

function toX(x: number, a: number, b: number) {
  return M.l + ((x - a) / (b - a || 1)) * (W - M.l - M.r);
}
function toY(y: number, yMin: number, yMax: number) {
  return M.t + ((yMax - y) / (yMax - yMin || 1)) * (H - M.t - M.b);
}

function trapRule(f: (x: number) => number, a: number, b: number, n: number): number {
  const h = (b - a) / n;
  let s = safeEval(f, a) / 2 + safeEval(f, b) / 2;
  for (let i = 1; i < n; i++) s += safeEval(f, a + i * h);
  return h * s;
}

function simpRule(f: (x: number) => number, a: number, b: number, n: number): number {
  const even = n % 2 === 0 ? n : n + 1;
  const h = (b - a) / even;
  let s = safeEval(f, a) + safeEval(f, b);
  for (let i = 1; i < even; i++) s += (i % 2 === 0 ? 2 : 4) * safeEval(f, a + i * h);
  return (h / 3) * s;
}

function quadBezier(p0: { x: number; y: number }, p1: { x: number; y: number }, p2: { x: number; y: number }) {
  const cx = 2 * p1.x - 0.5 * p0.x - 0.5 * p2.x;
  const cy = 2 * p1.y - 0.5 * p0.y - 0.5 * p2.y;
  return `M${p0.x},${p0.y} Q${cx},${cy} ${p2.x},${p2.y}`;
}

export function NumericalIntegrationViz() {
  const t = useTranslations('vizCalc');
  const statusId = useId();
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState<Mode>('trap');
  const [n, setN] = useState(4);
  const [showErr, setShowErr] = useState(true);
  const fn = FNS[idx]!;
  const [a, setA] = useState(fn.aDefault);
  const [b, setB] = useState(fn.bDefault);

  const handleFn = (i: number) => {
    setIdx(i);
    setA(FNS[i]!.aDefault);
    setB(FNS[i]!.bDefault);
  };

  const nEven = n % 2 === 0 ? n : n + 1;
  const exact = useMemo(() => integrate(fn.f, a, b), [fn, a, b]);
  const Tn = useMemo(() => trapRule(fn.f, a, b, nEven), [fn, a, b, nEven]);
  const Sn = useMemo(() => simpRule(fn.f, a, b, nEven), [fn, a, b, nEven]);

  const { yMin, yMax } = useMemo(() => {
    const ys: number[] = [0];
    for (let i = 0; i <= 200; i++) {
      const y = safeEval(fn.f, a + (i / 200) * (b - a));
      if (isFinite(y)) ys.push(y);
    }
    const lo = Math.min(...ys);
    const hi = Math.max(...ys);
    const pad = (hi - lo) * 0.12 || 0.4;
    return { yMin: lo - pad, yMax: hi + pad };
  }, [fn, a, b]);

  const curve = useMemo(() => {
    let d = '';
    let on = false;
    for (let i = 0; i <= 360; i++) {
      const x = a + (i / 360) * (b - a);
      const y = safeEval(fn.f, x);
      if (!isFinite(y)) {
        on = false;
        continue;
      }
      const sx = toX(x, a, b);
      const sy = toY(y, yMin, yMax);
      d += on ? ` L${sx},${sy}` : `M${sx},${sy}`;
      on = true;
    }
    return d;
  }, [fn, a, b, yMin, yMax]);

  const y0 = toY(Math.max(yMin, Math.min(yMax, 0)), yMin, yMax);
  const h = (b - a) / nEven;

  const traps = Array.from({ length: nEven }, (_, i) => {
    const x0 = a + i * h;
    const x1 = x0 + h;
    const yA = safeEval(fn.f, x0);
    const yB = safeEval(fn.f, x1);
    return `M${toX(x0, a, b)},${y0} L${toX(x0, a, b)},${toY(yA, yMin, yMax)} L${toX(x1, a, b)},${toY(yB, yMin, yMax)} L${toX(x1, a, b)},${y0} Z`;
  });

  const simps = Array.from({ length: nEven / 2 }, (_, k) => {
    const x0 = a + 2 * k * h;
    const xm = x0 + h;
    const x1 = x0 + 2 * h;
    const p0 = { x: toX(x0, a, b), y: toY(safeEval(fn.f, x0), yMin, yMax) };
    const p1 = { x: toX(xm, a, b), y: toY(safeEval(fn.f, xm), yMin, yMax) };
    const p2 = { x: toX(x1, a, b), y: toY(safeEval(fn.f, x1), yMin, yMax) };
    const arc = quadBezier(p0, p1, p2);
    return `${arc} L${toX(x1, a, b)},${y0} L${toX(x0, a, b)},${y0} Z`;
  });

  const tableNs = [2, 4, 8];
  const result = mode === 'simp' ? Sn : Tn;
  const err = Math.abs(result - exact);

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">{t('numeric.idea')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {FNS.map((opt, i) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => handleFn(i)}
              className={`rounded-md border px-2 py-1 text-xs font-mono transition ${
                i === idx
                  ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--accent-soft)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <ButtonRow>
          <VizButton active={mode === 'trap'} onClick={() => setMode('trap')}>
            {t('numeric.trap')}
          </VizButton>
          <VizButton active={mode === 'simp'} onClick={() => setMode('simp')}>
            {t('numeric.simp')}
          </VizButton>
          <VizButton active={mode === 'both'} onClick={() => setMode('both')}>
            {t('numeric.both')}
          </VizButton>
        </ButtonRow>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-2xl" role="img" aria-labelledby={statusId}>
            {(mode === 'trap' || mode === 'both') &&
              traps.map((d, i) => <path key={`t${i}`} d={d} fill="#3b82f6" fillOpacity={mode === 'both' ? 0.12 : 0.22} stroke="#3b82f6" strokeOpacity={0.5} />)}
            {(mode === 'simp' || mode === 'both') &&
              simps.map((d, i) => <path key={`s${i}`} d={d} fill="orange" fillOpacity={mode === 'both' ? 0.12 : 0.22} stroke="orange" strokeOpacity={0.6} />)}
            <path d={curve} fill="none" stroke="var(--accent-strong)" strokeWidth={2.2} />
          </svg>
        </div>

        {mode === 'both' ? (
          <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[var(--formula-bg)] text-[var(--fg-muted)]">
                <tr>
                  <th className="px-3 py-2">n</th>
                  <th className="px-3 py-2">Tₙ</th>
                  <th className="px-3 py-2">|T−I|</th>
                  <th className="px-3 py-2">Sₙ</th>
                  <th className="px-3 py-2">|S−I|</th>
                </tr>
              </thead>
              <tbody>
                {tableNs.map((k) => {
                  const T = trapRule(fn.f, a, b, k);
                  const S = simpRule(fn.f, a, b, k);
                  return (
                    <tr key={k} className="border-t border-[var(--border)]">
                      <td className="px-3 py-1.5">{k}</td>
                      <td className="px-3 py-1.5">{fmt(T)}</td>
                      <td className="px-3 py-1.5">{fmt(Math.abs(T - exact))}</td>
                      <td className="px-3 py-1.5">{fmt(S)}</td>
                      <td className="px-3 py-1.5">{fmt(Math.abs(S - exact))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="font-mono text-xs text-[var(--fg-muted)]">
            {mode === 'trap'
              ? 'Tₙ = (b−a)/(2n) · [f(x₀)+2f(x₁)+…+f(xₙ)]'
              : 'Sₙ = (b−a)/(3n) · [f(x₀)+4f(x₁)+2f(x₂)+…+f(xₙ)]'}
          </p>
        )}

        {showErr ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)]">
            <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              Convergencia del error |Iₙ − I|
            </p>
            <svg viewBox="0 0 520 140" className="h-auto w-full">
              {(() => {
                const ns = [2, 4, 6, 8, 10, 12, 14, 16];
                const eT = ns.map((k) => Math.max(1e-8, Math.abs(trapRule(fn.f, a, b, k) - exact)));
                const eS = ns.map((k) => Math.max(1e-8, Math.abs(simpRule(fn.f, a, b, k) - exact)));
                const eMax = Math.max(...eT, ...eS);
                const tx = (k: number) => 44 + ((k - 2) / 14) * 460;
                const ty = (e: number) => 12 + (1 - e / eMax) * 96;
                const dT = ns.map((k, i) => `${i === 0 ? 'M' : 'L'}${tx(k)},${ty(eT[i]!)}`).join(' ');
                const dS = ns.map((k, i) => `${i === 0 ? 'M' : 'L'}${tx(k)},${ty(eS[i]!)}`).join(' ');
                return (
                  <>
                    <path d={dT} fill="none" stroke="#3b82f6" strokeWidth={2} />
                    <path d={dS} fill="none" stroke="orange" strokeWidth={2} />
                    <text x="400" y="22" fontSize="10" fill="#3b82f6">
                      {t('numeric.trap')}
                    </text>
                    <text x="400" y="36" fontSize="10" fill="orange">
                      {t('numeric.simp')}
                    </text>
                  </>
                );
              })()}
            </svg>
          </div>
        ) : null}

        <div id={statusId} className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-xs" aria-live="polite">
          <p>
            {t('numeric.method')}: {mode === 'trap' ? t('numeric.trap') : mode === 'simp' ? t('numeric.simp') : t('numeric.both')} · n = {nEven}
          </p>
          <p>
            {mode === 'both'
              ? `Tₙ = ${fmt(Tn)} (err ${fmt(Math.abs(Tn - exact))}) · Sₙ = ${fmt(Sn)} (err ${fmt(Math.abs(Sn - exact))})`
              : `Resultado ≈ ${fmt(result)} · exacto = ${fmt(exact)} · error = ${fmt(err)}`}
          </p>
        </div>

        <ControlsStack>
          <SliderRow label={`n = ${nEven} (par)`} value={nEven} min={2} max={30} step={2} onChange={(v) => setN(Math.round(v))} />
          <SliderRow label={`a = ${fmt(a, 2)}`} value={a} min={-2} max={b - 0.2} step={0.1} onChange={setA} />
          <SliderRow label={`b = ${fmt(b, 2)}`} value={b} min={a + 0.2} max={5} step={0.1} onChange={setB} />
          <ToggleRow label={t('numeric.showErr')} checked={showErr} onChange={setShowErr} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
