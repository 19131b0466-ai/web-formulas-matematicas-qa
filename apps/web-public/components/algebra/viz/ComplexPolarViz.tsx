'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, ToggleRow, VizButton, VizPanel } from './controls';
import {
  COMPLEX_H,
  COMPLEX_W,
  formatAngle,
  formatComplex,
  polarArc,
  present,
  radToDeg,
  snap,
  useComplexDrag,
} from './complexPlane';
import type { Vec2 } from './math2d';

/**
 * Polar / exponential form (ALG-COM-004).
 */
export function ComplexPolarViz() {
  const [r, setR] = useState(2.61);
  const [theta, setTheta] = useState(0.566);
  const [degrees, setDegrees] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const guideId = useId();
  const statusId = useId();
  const raf = useRef<number | null>(null);

  const x = r * Math.cos(theta);
  const y = r * Math.sin(theta);
  const W = COMPLEX_W;
  const H = COMPLEX_H;
  const ox = W / 2;
  const oy = H / 2;
  const S = 48;
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });
  const tip = to({ x, y });
  const mid = { x: (ox + tip.x) / 2, y: (oy + tip.y) / 2 };

  const setFromPoint = (p: Vec2) => {
    const nr = Math.hypot(p.x, p.y);
    setR(snap(Math.min(3.2, Math.max(0, nr)), 0, 3.2, 0.01));
    if (nr > 1e-6) setTheta(Math.atan2(p.y, p.x));
  };
  const drag = useComplexDrag(setFromPoint, S, { x: ox, y: oy });

  useEffect(() => {
    if (!spinning) {
      if (raf.current) cancelAnimationFrame(raf.current);
      return;
    }
    let last = performance.now();
    const tick = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      setTheta((th) => {
        let n = th + dt * 0.7;
        if (n > Math.PI * 2) n -= Math.PI * 2;
        return n;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [spinning]);

  const thLabel = formatAngle(theta, degrees);
  const zero = r < 1e-6;

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            En la forma polar, un número complejo se describe mediante su distancia r al origen y su
            ángulo θ. Mueve ambos controles y observa cómo cambian sus partes real e imaginaria.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Mantén r fijo y gira θ: el punto recorre una circunferencia porque su módulo no cambia.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
          {zero ? (
            <p className="text-base font-semibold">z=0 · el argumento no está definido</p>
          ) : (
            <>
              <p className="text-base font-semibold text-[var(--accent-strong)]">
                z={formatComplex(x, y)}
              </p>
              <p>
                ={present(r)}(cos{thLabel}+i sin{thLabel})
              </p>
              <p>
                ={present(r)}e<sup>i{thLabel}</sup>
              </p>
              <p className="mt-1 text-[var(--fg-muted)]">
                x=r cosθ={present(x)} · y=r sinθ={present(y)}
              </p>
              <p className="text-xs text-[var(--fg-muted)]">
                e<sup>iθ</sup>=cosθ+i sinθ · r e<sup>iθ</sup>=r(cosθ+i sinθ)
              </p>
            </>
          )}
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-xl touch-none" role="img" aria-labelledby={statusId}>
            <line x1={24} y1={oy} x2={W - 24} y2={oy} stroke="currentColor" opacity={0.35} />
            <line x1={ox} y1={20} x2={ox} y2={H - 20} stroke="currentColor" opacity={0.35} />
            <text x={W - 28} y={oy - 8} fontSize={11} opacity={0.7}>Re(z)</text>
            <text x={ox + 8} y={24} fontSize={11} opacity={0.7}>Im(z)</text>
            {[-2, -1, 1, 2].map((t) => (
              <g key={t}>
                <text x={to({ x: t, y: 0 }).x} y={oy + 14} textAnchor="middle" fontSize={9} opacity={0.4}>{t}</text>
                <text x={ox - 8} y={to({ x: 0, y: t }).y + 3} textAnchor="end" fontSize={9} opacity={0.4}>{t}</text>
              </g>
            ))}

            {r > 0.05 ? (
              <>
                <circle cx={ox} cy={oy} r={r * S} fill="none" stroke="currentColor" strokeWidth={1.25} opacity={0.35} />
                <text x={ox + r * S * 0.72} y={oy - 6} fontSize={9} opacity={0.55}>
                  |z|=r
                </text>
              </>
            ) : null}

            {!zero ? (
              <>
                <line x1={tip.x} y1={tip.y} x2={tip.x} y2={oy} stroke="currentColor" strokeDasharray="3 2" opacity={0.4} />
                <line x1={tip.x} y1={tip.y} x2={ox} y2={tip.y} stroke="currentColor" strokeDasharray="3 2" opacity={0.4} />
                <text x={(ox + tip.x) / 2} y={oy + 14} textAnchor="middle" fontSize={9} fill="teal">
                  x=r cosθ
                </text>
                <text x={tip.x + 8} y={(oy + tip.y) / 2} fontSize={9} fill="orange">
                  y=r sinθ
                </text>
                <path d={polarArc(ox, oy, S, Math.min(0.7, r * 0.35), 0, theta)} fill="none" stroke="orange" strokeWidth={2} />
                <text
                  x={ox + Math.min(0.7, r * 0.35) * S * Math.cos(theta / 2) + 4}
                  y={oy - Math.min(0.7, r * 0.35) * S * Math.sin(theta / 2) - 4}
                  fontSize={11}
                  fill="orange"
                  fontWeight={600}
                >
                  θ={thLabel}
                </text>
              </>
            ) : null}

            <line x1={ox} y1={oy} x2={tip.x} y2={tip.y} stroke="var(--accent-strong)" strokeWidth={2.8} />
            {!zero ? (
              <text x={mid.x + 4} y={mid.y - 8} fontSize={11} fontWeight={600} fill="var(--accent-strong)">
                r={present(r)}
              </text>
            ) : null}
            <circle cx={tip.x} cy={tip.y} r={8} fill="var(--accent-strong)" style={{ cursor: 'grab' }} {...drag} />
            <text x={tip.x + 10} y={tip.y - 10} fontSize={12} fontWeight={600}>
              z={formatComplex(x, y)}
            </text>
          </svg>
        </section>

        <div id={statusId} className="rounded-lg border border-[var(--border)] px-3 py-2 font-mono text-sm" aria-live="polite">
          r=|z|={present(r)} · θ=arg(z)={thLabel} · z={formatComplex(x, y)}
          {!zero ? ` · z=${present(r)}e^{i${thLabel}}` : ''}
        </div>

        <ControlsStack>
          <ButtonRow>
            <VizButton active={degrees} onClick={() => setDegrees(true)}>Grados</VizButton>
            <VizButton active={!degrees} onClick={() => setDegrees(false)}>Radianes</VizButton>
            <VizButton active={spinning} onClick={() => setSpinning((s) => !s)}>
              {spinning ? '⏸ Pausar' : '▶ Girar θ'}
            </VizButton>
          </ButtonRow>
          <SliderRow label="r" value={r} min={0} max={3.2} step={0.01} onChange={(v) => setR(snap(v, 0, 3.2, 0.01))} />
          <SliderRow
            label="θ"
            value={degrees ? radToDeg(theta) : theta}
            min={0}
            max={degrees ? 360 : Math.PI * 2}
            step={degrees ? 1 : 0.01}
            onChange={(v) => setTheta(degrees ? (snap(v, 0, 360, 1) * Math.PI) / 180 : snap(v, 0, Math.PI * 2, 0.01))}
          />
          <ToggleRow label="Mostrar en grados" checked={degrees} onChange={setDegrees} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
