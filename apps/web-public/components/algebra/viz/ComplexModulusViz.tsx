'use client';

import { useId, useState } from 'react';
import { ControlsStack, SliderRow, ToggleRow, VizPanel } from './controls';
import {
  COMPLEX_H,
  COMPLEX_W,
  clampVec,
  formatAngle,
  formatComplex,
  polarArc,
  present,
  snap,
  useComplexDrag,
} from './complexPlane';
import type { Vec2 } from './math2d';

/**
 * Complex modulus |z| (ALG-COM-003).
 */
export function ComplexModulusViz() {
  const [z, setZ] = useState<Vec2>({ x: 2.2, y: 1.4 });
  const [showComp, setShowComp] = useState(true);
  const [showCirc, setShowCirc] = useState(false);
  const [showArg, setShowArg] = useState(false);
  const guideId = useId();
  const statusId = useId();

  const a = z.x;
  const b = z.y;
  const r = Math.hypot(a, b);
  const theta = Math.atan2(b, a);
  const W = COMPLEX_W;
  const H = COMPLEX_H;
  const ox = W / 2;
  const oy = H / 2;
  const S = 42;
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });
  const drag = useComplexDrag((p) => setZ(clampVec(p, 3.6)), S, { x: ox, y: oy });
  const tip = to(z);
  const mid = { x: (ox + tip.x) / 2, y: (oy + tip.y) / 2 };
  const isReal = Math.abs(b) < 1e-9;
  const isImag = Math.abs(a) < 1e-9 && Math.abs(b) >= 1e-9;
  const isZero = r < 1e-9;

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            El módulo de un número complejo mide su distancia al origen. Arrastra el punto z y observa
            cómo cambia la longitud del vector.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Activa las componentes para ver el triángulo rectángulo que justifica |z|=√(a²+b²).
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="font-mono text-lg font-semibold text-[var(--accent-strong)]">
            z={formatComplex(a, b)}
          </p>
          <p className="mt-1 font-mono text-sm">
            |z|=√({present(a)}²+{present(b)}²)={present(r)}
          </p>
          {isReal && !isZero ? <p className="mt-1 text-sm text-teal">|z|=|a|={present(Math.abs(a))}</p> : null}
          {isImag ? <p className="mt-1 text-sm text-orange">|z|=|b|={present(Math.abs(b))}</p> : null}
          {isZero ? (
            <p className="mt-1 text-sm text-[var(--fg-muted)]">
              El único número complejo con módulo cero es el origen.
            </p>
          ) : null}
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-xl touch-none" role="img" aria-labelledby={statusId}>
            <line x1={24} y1={oy} x2={W - 24} y2={oy} stroke="currentColor" opacity={0.35} />
            <line x1={ox} y1={20} x2={ox} y2={H - 20} stroke="currentColor" opacity={0.35} />
            <text x={W - 28} y={oy - 8} fontSize={11} opacity={0.7}>Re(z)</text>
            <text x={ox + 8} y={24} fontSize={11} opacity={0.7}>Im(z)</text>
            {[-3, -2, -1, 1, 2, 3].map((t) => (
              <g key={t}>
                <text x={to({ x: t, y: 0 }).x} y={oy + 14} textAnchor="middle" fontSize={9} opacity={0.4}>{t}</text>
                <text x={ox - 8} y={to({ x: 0, y: t }).y + 3} textAnchor="end" fontSize={9} opacity={0.4}>{t}</text>
              </g>
            ))}

            {showCirc && r > 0.05 ? (
              <>
                <circle cx={ox} cy={oy} r={r * S} fill="none" stroke="currentColor" strokeWidth={1.2} opacity={0.3} />
                <text x={ox + r * S * 0.72} y={oy - 6} fontSize={9} opacity={0.55}>
                  |w|=|z|
                </text>
              </>
            ) : null}

            {showComp && !isZero ? (
              <>
                <line x1={ox} y1={oy} x2={tip.x} y2={oy} stroke="teal" strokeDasharray="4 2" opacity={0.7} />
                <line x1={tip.x} y1={oy} x2={tip.x} y2={tip.y} stroke="orange" strokeDasharray="4 2" opacity={0.7} />
                <text x={(ox + tip.x) / 2} y={oy + 14} textAnchor="middle" fontSize={10} fill="teal">
                  a={present(a)}
                </text>
                <text x={tip.x + 8} y={(oy + tip.y) / 2} fontSize={10} fill="orange">
                  b={present(b)}
                </text>
              </>
            ) : null}

            {showArg && r > 0.15 ? (
              <path d={polarArc(ox, oy, S, Math.min(0.65, r * 0.4), 0, theta)} fill="none" stroke="orange" strokeWidth={1.6} />
            ) : null}

            <line x1={ox} y1={oy} x2={tip.x} y2={tip.y} stroke="var(--accent-strong)" strokeWidth={2.8} />
            {!isZero ? (
              <text x={mid.x + 6} y={mid.y - 8} fontSize={11} fontWeight={600} fill="var(--accent-strong)">
                |z|={present(r)}
              </text>
            ) : null}
            <circle cx={tip.x} cy={tip.y} r={8} fill="var(--accent-strong)" style={{ cursor: 'grab' }} {...drag} />
            <text x={tip.x + 10} y={tip.y - 10} fontSize={12} fontWeight={600}>
              z={formatComplex(a, b)}
            </text>
          </svg>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">|z| = distancia(0, z)</p>
        </section>

        <div id={statusId} className="rounded-lg border border-[var(--border)] px-3 py-2 font-mono text-sm" aria-live="polite">
          z={formatComplex(a, b)} · |z|=√({present(a)}²+{present(b)}²)={present(r)}
          {showArg && !isZero ? ` · arg(z)=${formatAngle(theta, true)}` : ''}
        </div>

        <ControlsStack>
          <ToggleRow label="Mostrar componentes" checked={showComp} onChange={setShowComp} />
          <ToggleRow label="Mostrar circunferencia de módulo" checked={showCirc} onChange={setShowCirc} />
          <ToggleRow label="Mostrar argumento" checked={showArg} onChange={setShowArg} />
          <SliderRow label="a" value={a} min={-3.5} max={3.5} step={0.1} onChange={(v) => setZ({ x: snap(v, -3.5, 3.5, 0.1), y: b })} />
          <SliderRow label="b" value={b} min={-3.5} max={3.5} step={0.1} onChange={(v) => setZ({ x: a, y: snap(v, -3.5, 3.5, 0.1) })} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
