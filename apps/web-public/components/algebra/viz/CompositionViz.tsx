'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from './controls';
import { linspace } from './math2d';

const W = 420;
const GH = 130;
const MARGIN = { l: 34, r: 16, t: 16, b: 22 };
const VIEW = { xMin: -3, xMax: 3, yMin: -1, yMax: 9 };

function present(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '—';
  return fmt(Number(n.toFixed(digits)), digits);
}

function snap(val: number): number {
  return Number(Math.min(3, Math.max(-2, val)).toFixed(2));
}

const gFn = (x: number) => 2 * x + 1;
const fFn = (u: number) => u * u;

type Order = 'fg' | 'gf';
type Stage = 0 | 1 | 2;

/**
 * Function composition (f∘g)(x)=f(g(x)) step by step (ALG-FUN-002).
 */
export function CompositionViz() {
  const [x0, setX0] = useState(1.2);
  const [stage, setStage] = useState<Stage>(2);
  const [order, setOrder] = useState<Order>('fg');
  const guideId = useId();
  const statusId = useId();

  const first = order === 'fg' ? { name: 'g', fn: gFn, label: 'g(x)=2x+1' } : { name: 'f', fn: fFn, label: 'f(x)=x²' };
  const second = order === 'fg' ? { name: 'f', fn: fFn, label: 'f(x)=x²' } : { name: 'g', fn: gFn, label: 'g(x)=2x+1' };

  const mid = first.fn(x0);
  const midDefined = Number.isFinite(mid);
  const final = midDefined ? second.fn(mid) : NaN;
  const finalDefined = Number.isFinite(final);

  const composeLabel = order === 'fg' ? 'f∘g' : 'g∘f';
  const otherLabel = order === 'fg' ? 'g∘f' : 'f∘g';
  const otherMid = order === 'fg' ? fFn(x0) : gFn(x0);
  const otherFinal = order === 'fg' ? gFn(otherMid) : fFn(otherMid);
  const nonCommutative = Math.abs((finalDefined ? final : 0) - (Number.isFinite(otherFinal) ? otherFinal : 0)) > 0.01;

  const gPlot = useMemo(() => {
    const plotW = W - MARGIN.l - MARGIN.r;
    const plotH = GH - MARGIN.t - MARGIN.b;
    const toX = (x: number) => MARGIN.l + ((x - VIEW.xMin) / (VIEW.xMax - VIEW.xMin)) * plotW;
    const toY = (y: number) => MARGIN.t + ((VIEW.yMax - y) / (VIEW.yMax - VIEW.yMin)) * plotH;
    const xs = linspace(VIEW.xMin, VIEW.xMax, 100);
    const pts = xs
      .map((x) => ({ x, y: gFn(x) }))
      .filter((p) => Number.isFinite(p.y) && p.y >= VIEW.yMin && p.y <= VIEW.yMax)
      .map((p) => `${toX(p.x)},${toY(p.y)}`);
    return {
      toX,
      toY,
      path: pts.length >= 2 ? `M${pts.join(' L')}` : '',
      color: 'var(--accent-strong)',
    };
  }, []);

  const fPlot = useMemo(() => {
    const plotW = W - MARGIN.l - MARGIN.r;
    const plotH = GH - MARGIN.t - MARGIN.b;
    const toX = (x: number) => MARGIN.l + ((x - VIEW.xMin) / (VIEW.xMax - VIEW.xMin)) * plotW;
    const toY = (y: number) => MARGIN.t + ((VIEW.yMax - y) / (VIEW.yMax - VIEW.yMin)) * plotH;
    const xs = linspace(VIEW.xMin, VIEW.xMax, 100);
    const pts = xs
      .map((x) => ({ x, y: fFn(x) }))
      .filter((p) => Number.isFinite(p.y) && p.y >= VIEW.yMin && p.y <= VIEW.yMax)
      .map((p) => `${toX(p.x)},${toY(p.y)}`);
    return {
      toX,
      toY,
      path: pts.length >= 2 ? `M${pts.join(' L')}` : '',
      color: 'teal',
    };
  }, []);

  const FlowBlock = ({ val, label, accent }: { val: string; label: string; accent?: boolean }) => (
    <div className={`flex min-w-[4.5rem] flex-col items-center rounded-lg border px-2 py-1.5 ${accent ? 'border-[var(--accent-strong)] bg-[color-mix(in_oklab,var(--accent-strong)_12%,transparent)]' : 'border-[var(--border)]'}`}>
      <span className="font-mono text-sm font-semibold">{val}</span>
      <span className="text-[10px] text-[var(--fg-muted)]">{label}</span>
    </div>
  );

  const Arrow = () => <span className="text-[var(--fg-muted)]">→</span>;

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Componer funciones significa usar la salida de una función como entrada de otra.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Mueve x₀ y sigue su recorrido: primero entra en {first.name}, y el resultado entra después
            en {second.name}. ({composeLabel})(x)={order === 'fg' ? 'f(g(x))' : 'g(f(x))'} no es
            multiplicar.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">Definiciones</p>
          <p className="mt-1 font-mono text-sm">g(x)=2x+1 · f(x)=x² · ({composeLabel})(x)={order === 'fg' ? 'f(g(x))' : 'g(f(x))'}</p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">Flujo numérico</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <FlowBlock val={present(x0)} label="x₀" accent={stage >= 0} />
            <Arrow />
            <FlowBlock val={first.name} label={first.name} />
            <Arrow />
            <FlowBlock val={stage >= 1 && midDefined ? present(mid) : '…'} label={`${first.name}(x₀)`} accent={stage >= 1} />
            <Arrow />
            <FlowBlock val={second.name} label={second.name} />
            <Arrow />
            <FlowBlock
              val={stage >= 2 && finalDefined ? present(final) : stage >= 2 && !finalDefined ? 'no definido' : '…'}
              label={`${composeLabel}(x₀)`}
              accent={stage >= 2}
            />
          </div>
          <p className="mt-2 text-center font-mono text-sm text-[var(--fg-muted)]">
            {first.name}({present(x0)})={midDefined ? present(mid) : '—'}
            {stage >= 2 ? (
              <> · {second.name}({present(mid)})={finalDefined ? present(final) : 'no definido'}</>
            ) : null}
          </p>
        </section>

        <section className="space-y-3 rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">Gráficas · dos etapas</p>
          <div>
            <p className="mb-1 text-sm font-medium">Etapa 1: y=g(x)</p>
            <svg viewBox={`0 0 ${W} ${GH}`} className="h-auto w-full" role="img">
              <line x1={gPlot.toX(VIEW.xMin)} y1={gPlot.toY(0)} x2={gPlot.toX(VIEW.xMax)} y2={gPlot.toY(0)} stroke="currentColor" opacity={0.3} />
              <path d={gPlot.path} fill="none" stroke={gPlot.color} strokeWidth={2} />
              {stage >= 1 ? (
                <>
                  <line x1={gPlot.toX(x0)} y1={gPlot.toY(0)} x2={gPlot.toX(x0)} y2={gPlot.toY(gFn(x0))} stroke="currentColor" strokeDasharray="3 2" opacity={0.5} />
                  <circle cx={gPlot.toX(x0)} cy={gPlot.toY(gFn(x0))} r={5} fill={gPlot.color} />
                  <text x={gPlot.toX(x0) + 6} y={gPlot.toY(gFn(x0)) - 4} fontSize={9}>x₀={present(x0)}, g(x₀)={present(gFn(x0))}</text>
                </>
              ) : null}
            </svg>
          </div>
          <div>
            <p className="mb-1 text-sm font-medium">Etapa 2: y=f(u) con u=g(x₀)</p>
            <svg viewBox={`0 0 ${W} ${GH}`} className="h-auto w-full" role="img">
              <line x1={fPlot.toX(VIEW.xMin)} y1={fPlot.toY(0)} x2={fPlot.toX(VIEW.xMax)} y2={fPlot.toY(0)} stroke="currentColor" opacity={0.3} />
              <path d={fPlot.path} fill="none" stroke={fPlot.color} strokeWidth={2} />
              {stage >= 2 && midDefined ? (
                <>
                  <line x1={fPlot.toX(mid)} y1={fPlot.toY(0)} x2={fPlot.toX(mid)} y2={fPlot.toY(final)} stroke="currentColor" strokeDasharray="3 2" opacity={0.5} />
                  <circle cx={fPlot.toX(mid)} cy={fPlot.toY(final)} r={5} fill="orange" />
                  <text x={fPlot.toX(mid) + 6} y={fPlot.toY(final) - 4} fontSize={9}>
                    ({present(mid)},{present(final)}) · {composeLabel}(x₀)={finalDefined ? present(final) : 'no definido'}
                  </text>
                </>
              ) : null}
            </svg>
            {stage >= 1 && stage < 2 ? (
              <p className="text-xs text-teal">↑ g(x₀)={present(mid)} sale de g y entra en f</p>
            ) : null}
          </div>
        </section>

        <div id={statusId} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" aria-live="polite">
          {nonCommutative ? (
            <p className="text-[var(--fg-muted)]">
              {composeLabel}≠{otherLabel}: la composición no es conmutativa en general.
            </p>
          ) : null}
        </div>

        <ControlsStack>
          <SliderRow label="x₀" value={x0} min={-2} max={3} step={0.1} onChange={(v) => setX0(snap(v))} />
          <ButtonRow>
            <VizButton active={stage === 0} onClick={() => setStage(0)}>1 · Entrada</VizButton>
            <VizButton active={stage === 1} onClick={() => setStage(1)}>2 · Aplicar {first.name}</VizButton>
            <VizButton active={stage === 2} onClick={() => setStage(2)}>3 · Componer</VizButton>
          </ButtonRow>
          <ButtonRow>
            <VizButton active={order === 'fg'} onClick={() => setOrder('fg')}>f∘g</VizButton>
            <VizButton active={order === 'gf'} onClick={() => setOrder('gf')}>g∘f</VizButton>
          </ButtonRow>
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
