'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { fmt, integrate, safeEval } from './calcMath';

type FnOpt = { label: string; f: (x: number) => number; aDefault: number; bDefault: number };
const FNS: FnOpt[] = [
  { label: '√x', f: (x) => Math.sqrt(Math.max(0, x)), aDefault: 0.2, bDefault: 4 },
  { label: 'x²', f: (x) => x * x, aDefault: 0, bDefault: 2 },
  { label: '4 − x²', f: (x) => Math.max(0, 4 - x * x), aDefault: 0, bDefault: 2 },
  { label: '2x − x²', f: (x) => Math.max(0, 2 * x - x * x), aDefault: 0, bDefault: 2 },
];

export function ShellMethodViz() {
  const statusId = useId();
  const [idx, setIdx] = useState(0);
  const [dx, setDx] = useState(0.2);
  const [full, setFull] = useState(false);
  const [axisY, setAxisY] = useState(true);
  const fn = FNS[idx]!;
  const [a, setA] = useState(fn.aDefault);
  const [b, setB] = useState(fn.bDefault);
  const [x0, setX0] = useState((fn.aDefault + fn.bDefault) / 2);

  const handle = (i: number) => {
    setIdx(i);
    setA(FNS[i]!.aDefault);
    setB(FNS[i]!.bDefault);
    setX0((FNS[i]!.aDefault + FNS[i]!.bDefault) / 2);
  };

  const h = Math.abs(safeEval(fn.f, x0)) || 0;
  const dV = 2 * Math.PI * x0 * h * dx;
  const V = useMemo(() => 2 * Math.PI * integrate((x) => x * Math.abs(safeEval(fn.f, x)), a, b), [fn, a, b]);

  const WL = 280;
  const HL = 240;
  const ML = { l: 40, r: 12, t: 12, b: 28 };
  const yMax = Math.max(1, ...Array.from({ length: 80 }, (_, i) => Math.abs(safeEval(fn.f, a + (i / 79) * (b - a)))).filter(isFinite));
  const toX = (x: number) => ML.l + ((x - a) / (b - a || 1)) * (WL - ML.l - ML.r);
  const toY = (y: number) => ML.t + ((yMax - y) / yMax) * (HL - ML.t - ML.b);
  let curve = '';
  for (let i = 0; i <= 200; i++) {
    const x = a + (i / 200) * (b - a);
    const y = Math.abs(safeEval(fn.f, x));
    if (!isFinite(y)) continue;
    curve += `${i === 0 ? 'M' : 'L'}${toX(x)},${toY(y)}`;
  }

  const WR = 280;
  const HR = 280;
  const cx = 140;
  const top = 50;
  const bot = 50 + Math.min(160, h * 40);
  const rxOut = Math.max(8, (x0 + dx / 2) * 28);
  const rxIn = Math.max(2, Math.max(0, x0 - dx / 2) * 28);
  const ry = rxOut * 0.28;

  const shells = full
    ? Array.from({ length: 8 }, (_, i) => a + ((i + 0.5) / 8) * (b - a))
    : [x0];

  return (
    <VizPanel>
      <div className="space-y-4">
        <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">
          Cada rodaja vertical se enrolla en un cascarón cilíndrico de volumen 2π · radio · altura · grosor. La integral suma todos los cascarones.
        </p>
        <div className="flex flex-wrap gap-2">
          {FNS.map((opt, i) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => handle(i)}
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
          <VizButton active={axisY} onClick={() => setAxisY(true)}>
            Eje y
          </VizButton>
          <VizButton active={!axisY} onClick={() => setAxisY(false)}>
            Eje x
          </VizButton>
          <VizButton active={full} onClick={() => setFull((v) => !v)}>
            {full ? 'Un cascarón' : 'Ver sólido completo'}
          </VizButton>
        </ButtonRow>
        <div className="flex flex-wrap gap-3">
          <div className="min-w-[240px] flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
            <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">Perfil xy</p>
            <svg viewBox={`0 0 ${WL} ${HL}`} className="h-auto w-full">
              <path d={curve} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
              <rect
                x={toX(x0 - dx / 2)}
                y={toY(h)}
                width={Math.max(2, toX(x0 + dx / 2) - toX(x0 - dx / 2))}
                height={Math.max(0, toY(0) - toY(h))}
                fill="orange"
                fillOpacity={0.45}
              />
              <line x1={toX(x0)} y1={toY(0)} x2={toX(x0)} y2={toY(h)} stroke="orange" />
            </svg>
          </div>
          <div className="min-w-[240px] flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
            <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              Cascarón {axisY ? '(eje y)' : '(eje x)'}
            </p>
            <svg viewBox={`0 0 ${WR} ${HR}`} className="h-auto w-full">
              {shells.map((xi) => {
                const hi = Math.abs(safeEval(fn.f, xi)) || 0;
                const r = Math.max(6, xi * 28);
                const t = 50;
                const btm = 50 + Math.min(160, hi * 40);
                const ryy = r * 0.28;
                return (
                  <g key={xi} opacity={full ? 0.35 : 1}>
                    <ellipse cx={cx} cy={t} rx={r} ry={ryy} fill="none" stroke="var(--accent-strong)" />
                    <ellipse cx={cx} cy={btm} rx={r} ry={ryy} fill="var(--accent-strong)" fillOpacity={0.12} stroke="var(--accent-strong)" />
                    <line x1={cx - r} y1={t} x2={cx - r} y2={btm} stroke="var(--accent-strong)" />
                    <line x1={cx + r} y1={t} x2={cx + r} y2={btm} stroke="var(--accent-strong)" />
                  </g>
                );
              })}
              {!full ? (
                <>
                  <ellipse cx={cx} cy={top} rx={rxOut} ry={ry} fill="none" stroke="orange" />
                  <ellipse cx={cx} cy={bot} rx={rxOut} ry={ry} fill="orange" fillOpacity={0.12} stroke="orange" />
                  <ellipse cx={cx} cy={top} rx={rxIn} ry={rxIn * 0.28} fill="none" stroke="orange" opacity={0.5} />
                </>
              ) : null}
            </svg>
          </div>
        </div>
        <div id={statusId} className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-xs" aria-live="polite">
          <p>
            ΔV ≈ 2π · {fmt(x0, 2)} · {fmt(h, 2)} · {fmt(dx, 2)} = {fmt(dV)}
          </p>
          <p>V = 2π ∫ x f(x) dx ≈ {fmt(V)}</p>
        </div>
        <ControlsStack>
          <SliderRow label={`x₀ = ${fmt(x0, 2)}`} value={x0} min={a} max={b} step={0.05} onChange={setX0} />
          <SliderRow label={`Δx = ${fmt(dx, 2)}`} value={dx} min={0.1} max={0.5} step={0.05} onChange={setDx} />
          <SliderRow label={`a = ${fmt(a, 2)}`} value={a} min={0} max={b - 0.2} step={0.1} onChange={setA} />
          <SliderRow label={`b = ${fmt(b, 2)}`} value={b} min={a + 0.2} max={5} step={0.1} onChange={setB} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
