'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from './controls';
import { linspace } from './math2d';

const ZERO_EPS = 1e-9;
const W = 420;
const H = 240;
const VIEW = { xMin: -6, xMax: 6, yMin: -4, yMax: 4 };
const MARGIN = { l: 34, r: 16, t: 20, b: 26 };

type BaseKind = 'asymmetric' | 'parabola' | 'abs' | 'sine';

function present(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '—';
  return fmt(Number(n.toFixed(digits)), digits);
}

function snap(val: number, min: number, max: number, step: number): number {
  const clamped = Math.min(max, Math.max(min, val));
  const steps = Math.round((clamped - min) / step);
  const snapped = min + steps * step;
  if (Math.abs(snapped) < step / 2) return 0;
  return Number(snapped.toFixed(2));
}

function baseF(kind: BaseKind, x: number): number {
  if (kind === 'parabola') return 0.25 * x * x - 1;
  if (kind === 'abs') return Math.abs(x) - 1;
  if (kind === 'sine') return Math.sin(x);
  // Asymmetric: bump on right, linear on left
  if (x < 0) return 0.4 * x;
  return Math.sin(x) * Math.exp(-0.15 * x) + 0.3 * x;
}

/**
 * Scaling and reflection g(x)=a f(bx) (ALG-FUN-008).
 */
export function ScalingReflectionViz() {
  const [a, setA] = useState(1.5);
  const [b, setB] = useState(0.5);
  const [kind, setKind] = useState<BaseKind>('asymmetric');
  const guideId = useId();
  const statusId = useId();

  const absA = Math.abs(a);
  const absB = Math.abs(b);
  const bZero = Math.abs(b) < ZERO_EPS;
  const aZero = Math.abs(a) < ZERO_EPS;

  const plotW = W - MARGIN.l - MARGIN.r;
  const plotH = H - MARGIN.t - MARGIN.b;
  const toX = (x: number) => MARGIN.l + ((x - VIEW.xMin) / (VIEW.xMax - VIEW.xMin)) * plotW;
  const toY = (y: number) => MARGIN.t + ((VIEW.yMax - y) / (VIEW.yMax - VIEW.yMin)) * plotH;

  const g = (x: number): number => {
    if (aZero) return 0;
    if (bZero) return a * baseF(kind, 0);
    return a * baseF(kind, b * x);
  };

  const basePath = useMemo(() => {
    const xs = linspace(VIEW.xMin, VIEW.xMax, 180);
    const pts = xs
      .map((x) => ({ x, y: baseF(kind, x) }))
      .filter((p) => p.y >= VIEW.yMin - 1 && p.y <= VIEW.yMax + 1)
      .map((p) => `${toX(p.x)},${toY(p.y)}`);
    return pts.length >= 2 ? `M${pts.join(' L')}` : '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  const gPath = useMemo(() => {
    const xs = linspace(VIEW.xMin, VIEW.xMax, 180);
    const pts = xs
      .map((x) => ({ x, y: g(x) }))
      .filter((p) => Number.isFinite(p.y) && p.y >= VIEW.yMin - 1 && p.y <= VIEW.yMax + 1)
      .map((p) => `${toX(p.x)},${toY(p.y)}`);
    return pts.length >= 2 ? `M${pts.join(' L')}` : '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a, b, kind]);

  const aEffects: string[] = [];
  if (aZero) {
    aEffects.push('Todas las salidas se comprimen a 0.');
  } else {
    if (absA > 1 + ZERO_EPS) aEffects.push(`Estiramiento vertical por factor ${present(absA)}.`);
    else if (absA < 1 - ZERO_EPS && absA > ZERO_EPS) aEffects.push(`Compresión vertical por factor ${present(absA)}.`);
    else aEffects.push('Sin cambio de escala vertical.');
    if (a < -ZERO_EPS) aEffects.push('Reflexión respecto al eje x.');
  }

  const bEffects: string[] = [];
  if (bZero) {
    bEffects.push('b=0: la entrada de f queda fijada en cero (g constante).');
  } else {
    const hFactor = 1 / absB;
    if (absB > 1 + ZERO_EPS) bEffects.push(`Compresión horizontal por factor ${present(hFactor)}.`);
    else if (absB < 1 - ZERO_EPS) bEffects.push(`Estiramiento horizontal por factor ${present(hFactor)}.`);
    else bEffects.push('Sin cambio de escala horizontal.');
    if (b < -ZERO_EPS) bEffects.push('Reflexión respecto al eje y.');
  }

  const eq = `g(x)=${present(a)}f(${present(b)}x)`;
  const neutral = Math.abs(a - 1) < ZERO_EPS && Math.abs(b - 1) < ZERO_EPS;

  const x0 = 2;
  const y0 = baseF(kind, x0);
  const ppx = bZero ? NaN : x0 / b;
  const ppy = a * y0;

  const sineNote =
    kind === 'sine' && a < 0 && Math.abs(Math.abs(b) - 1) < ZERO_EPS
      ? 'Nota: sin(−x)=−sin(x), así que reflexión en x e y pueden coincidir visualmente.'
      : null;

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            En g(x)=af(bx), a modifica la gráfica verticalmente y b horizontalmente. Los signos
            negativos producen reflexiones.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Mueve a: observa cómo cambian las alturas. Mueve b: observa cómo cambian las posiciones
            horizontales. Atención: el efecto horizontal es inverso. Si |b|=2, el ancho se reduce a
            la mitad.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="font-mono text-lg font-semibold text-[var(--accent-strong)]">{eq}</p>
          {neutral ? <p className="mt-1 text-sm text-[var(--fg-muted)]">Sin transformación. Las dos gráficas coinciden.</p> : null}
          {aZero ? <p className="mt-1 text-sm">g(x)=0 · todas las salidas se comprimen a 0.</p> : null}
          <ul className="mt-2 list-inside list-disc text-sm text-[var(--fg-muted)]">
            {aEffects.map((t) => (
              <li key={t}>{t}</li>
            ))}
            {bEffects.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          {sineNote ? <p className="mt-1 text-xs text-orange">{sineNote}</p> : null}
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <div className="mb-2 flex flex-wrap gap-3 text-xs">
            <span>Original f(x) — —</span>
            <span className="text-teal">Transformada g(x) ——</span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-xl" role="img" aria-labelledby={statusId}>
            <line x1={toX(VIEW.xMin)} y1={toY(0)} x2={toX(VIEW.xMax)} y2={toY(0)} stroke="currentColor" strokeWidth={1.5} opacity={0.4} />
            <line x1={toX(0)} y1={toY(VIEW.yMin)} x2={toX(0)} y2={toY(VIEW.yMax)} stroke="currentColor" strokeWidth={1.5} opacity={0.4} />
            {basePath ? (
              <path d={basePath} fill="none" stroke="currentColor" strokeWidth={2} strokeDasharray="5 4" opacity={0.45} />
            ) : null}
            {gPath ? <path d={gPath} fill="none" stroke="teal" strokeWidth={2.5} /> : null}

            {Number.isFinite(y0) ? (
              <g>
                <circle cx={toX(x0)} cy={toY(y0)} r={5} fill="currentColor" opacity={0.65} />
                <text x={toX(x0) + 6} y={toY(y0) - 6} fontSize={9}>
                  P=({present(x0)},{present(y0)})
                </text>
              </g>
            ) : null}
            {!bZero && Number.isFinite(ppx) && Number.isFinite(ppy) && Math.abs(ppx) <= 6 && Math.abs(ppy) <= 5 ? (
              <g>
                <circle cx={toX(ppx)} cy={toY(ppy)} r={5} fill="teal" />
                <text x={toX(ppx) + 6} y={toY(ppy) - 6} fontSize={9} fill="teal">
                  P&apos;=({present(ppx)},{present(ppy)})
                </text>
                <line x1={toX(x0)} y1={toY(y0)} x2={toX(ppx)} y2={toY(ppy)} stroke="orange" strokeWidth={1.25} strokeDasharray="3 2" />
                <text x={(toX(x0) + toX(ppx)) / 2} y={(toY(y0) + toY(ppy)) / 2 - 6} fontSize={9} fill="orange" textAnchor="middle">
                  (x,y)→(x/b, ay)
                </text>
              </g>
            ) : null}
          </svg>
        </section>

        <div id={statusId} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" aria-live="polite">
          <p className="font-mono">{eq}</p>
          <p className="mt-1 text-[var(--fg-muted)]">
            a={present(a)} (vertical) · b={present(b)} (horizontal · factor geométrico {bZero ? '—' : present(1 / absB)})
          </p>
        </div>

        <ControlsStack>
          <SliderRow label="a — escala/reflexión vertical" value={a} min={-2.5} max={2.5} step={0.1} onChange={(v) => setA(snap(v, -2.5, 2.5, 0.1))} />
          <SliderRow label="b — escala/reflexión horizontal" value={b} min={-2.5} max={2.5} step={0.1} onChange={(v) => setB(snap(v === 0 ? 0.1 : v, -2.5, 2.5, 0.1))} />
          <ButtonRow>
            <VizButton onClick={() => { setA(1); setB(1); }}>Restablecer</VizButton>
            <VizButton onClick={() => setA((v) => -v)}>Reflejar respecto a x</VizButton>
            <VizButton onClick={() => setB((v) => (v === 0 ? -1 : -v))}>Reflejar respecto a y</VizButton>
          </ButtonRow>
          <ButtonRow>
            <VizButton onClick={() => setA(2)}>Estirar vertical ×2</VizButton>
            <VizButton onClick={() => setB(2)}>Comprimir horizontal ×½</VizButton>
          </ButtonRow>
          <ButtonRow>
            <VizButton active={kind === 'asymmetric'} onClick={() => setKind('asymmetric')}>Asimétrica</VizButton>
            <VizButton active={kind === 'parabola'} onClick={() => setKind('parabola')}>Parábola</VizButton>
            <VizButton active={kind === 'abs'} onClick={() => setKind('abs')}>|x|</VizButton>
            <VizButton active={kind === 'sine'} onClick={() => setKind('sine')}>seno</VizButton>
          </ButtonRow>
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
