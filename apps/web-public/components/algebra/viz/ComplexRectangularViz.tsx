'use client';

import { useId, useState } from 'react';
import { ControlsStack, SliderRow, ToggleRow, VizPanel } from './controls';
import {
  COMPLEX_H,
  COMPLEX_W,
  clampVec,
  formatComplex,
  present,
  snap,
  useComplexDrag,
} from './complexPlane';
import type { Vec2 } from './math2d';

/**
 * Rectangular form z = a + bi (ALG-COM-001).
 */
export function ComplexRectangularViz() {
  const [z, setZ] = useState<Vec2>({ x: 2, y: 1.5 });
  const [showComp, setShowComp] = useState(true);
  const guideId = useId();
  const statusId = useId();

  const a = z.x;
  const b = z.y;
  const W = COMPLEX_W;
  const H = COMPLEX_H;
  const ox = W / 2;
  const oy = H / 2;
  const S = 38;
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });
  const drag = useComplexDrag((p) => setZ(clampVec(p, 4.8)), S, { x: ox, y: oy });
  const tip = to(z);
  const realEnd = to({ x: a, y: 0 });
  const r = Math.hypot(a, b);
  const isReal = Math.abs(b) < 1e-9;
  const isImag = Math.abs(a) < 1e-9 && Math.abs(b) >= 1e-9;
  const isZero = Math.abs(a) < 1e-9 && Math.abs(b) < 1e-9;

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Un número complejo z=a+bi es un punto del plano: a indica su posición horizontal y b su
            posición vertical.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Arrastra el punto o cambia a y b: las partes real e imaginaria determinan directamente
            la posición de z.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="font-mono text-lg font-semibold text-[var(--accent-strong)]">
            z={formatComplex(a, b)}
          </p>
          <p className="mt-1 font-mono text-sm">
            Re(z)={present(a)} · Im(z)={present(b)} · (a,b)=({present(a)},{present(b)})
          </p>
          {isReal ? <p className="mt-1 text-sm text-teal">Número real · el punto está sobre el eje real.</p> : null}
          {isImag ? <p className="mt-1 text-sm text-orange">Imaginario puro · el punto está sobre el eje imaginario.</p> : null}
          {isZero ? <p className="mt-1 text-sm text-[var(--fg-muted)]">z=0 · origen del plano.</p> : null}
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-xl touch-none" role="img" aria-labelledby={statusId}>
            <line x1={24} y1={oy} x2={W - 24} y2={oy} stroke="currentColor" opacity={0.35} />
            <line x1={ox} y1={20} x2={ox} y2={H - 20} stroke="currentColor" opacity={0.35} />
            <text x={W - 28} y={oy - 8} fontSize={11} opacity={0.7}>Re(z)</text>
            <text x={ox + 8} y={24} fontSize={11} opacity={0.7}>Im(z)</text>
            {[-4, -2, 2, 4].map((t) => (
              <g key={t}>
                <text x={to({ x: t, y: 0 }).x} y={oy + 14} textAnchor="middle" fontSize={9} opacity={0.45}>{t}</text>
                <text x={ox - 8} y={to({ x: 0, y: t }).y + 3} textAnchor="end" fontSize={9} opacity={0.45}>{t}</text>
              </g>
            ))}

            {showComp ? (
              <>
                <line x1={ox} y1={oy} x2={realEnd.x} y2={realEnd.y} stroke="teal" strokeWidth={2.2} />
                <line x1={realEnd.x} y1={realEnd.y} x2={tip.x} y2={tip.y} stroke="orange" strokeWidth={2.2} />
                <line x1={tip.x} y1={tip.y} x2={tip.x} y2={oy} stroke="currentColor" strokeDasharray="3 2" opacity={0.35} />
                <line x1={tip.x} y1={tip.y} x2={ox} y2={tip.y} stroke="currentColor" strokeDasharray="3 2" opacity={0.35} />
                <text x={(ox + realEnd.x) / 2} y={oy + 16} textAnchor="middle" fontSize={10} fill="teal">a</text>
                <text x={tip.x + 10} y={(realEnd.y + tip.y) / 2} fontSize={10} fill="orange">b</text>
              </>
            ) : null}

            <line x1={ox} y1={oy} x2={tip.x} y2={tip.y} stroke="var(--accent-strong)" strokeWidth={2.8} />
            <circle cx={tip.x} cy={tip.y} r={8} fill="var(--accent-strong)" style={{ cursor: 'grab' }} {...drag} />
            <text x={tip.x + 10} y={tip.y - 10} fontSize={12} fontWeight={600} fill="var(--accent-strong)">
              z={formatComplex(a, b)}
            </text>
          </svg>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">
            horizontal = a · vertical = bi ⇒ z = a+bi
            {!isZero ? ` · |z|≈${present(r)} (secundario)` : ''}
          </p>
        </section>

        <div id={statusId} className="rounded-lg border border-[var(--border)] px-3 py-2 font-mono text-sm" aria-live="polite">
          z={formatComplex(a, b)} · Re(z)={present(a)} · Im(z)={present(b)}
        </div>

        <ControlsStack>
          <ToggleRow label="Mostrar componentes" checked={showComp} onChange={setShowComp} />
          <SliderRow label="a" value={a} min={-4.5} max={4.5} step={0.1} onChange={(v) => setZ({ x: snap(v, -4.5, 4.5, 0.1), y: b })} />
          <SliderRow label="b" value={b} min={-4.5} max={4.5} step={0.1} onChange={(v) => setZ({ x: a, y: snap(v, -4.5, 4.5, 0.1) })} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
